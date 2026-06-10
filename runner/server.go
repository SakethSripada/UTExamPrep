package main

import (
	"crypto/subtle"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"
)

// Wire shapes mirror app/api/java/run: the Next.js route proxies requests
// here unchanged, so these must stay compatible with the frontend's
// JavaStatus and JavaRunResult types.

const (
	maxCodeLength  = 20_000
	maxRequestBody = 64 * 1024
)

type runRequest struct {
	QuestionID string `json:"questionId"`
	Code       string `json:"code"`
}

type runResponse struct {
	OK      bool   `json:"ok"`
	Phase   string `json:"phase"`
	Message string `json:"message"`
	Stdout  string `json:"stdout,omitempty"`
	Stderr  string `json:"stderr,omitempty"`
	Passed  *int   `json:"passed,omitempty"`
	Total   *int   `json:"total,omitempty"`
}

type statusResponse struct {
	Available bool   `json:"available"`
	Message   string `json:"message"`
	Sandbox   string `json:"sandbox"`
}

var resultPattern = regexp.MustCompile(`RESULT\s+(\d+)/(\d+)`)

// parseResult reads the pass count from TestRunner output. The last match
// wins so that a submission printing its own fake RESULT line before the
// real one cannot inflate its score.
func parseResult(stdout string) (passed, total int, found bool) {
	matches := resultPattern.FindAllStringSubmatch(stdout, -1)
	if len(matches) == 0 {
		return 0, 0, false
	}
	last := matches[len(matches)-1]
	fmt.Sscanf(last[1], "%d", &passed)
	fmt.Sscanf(last[2], "%d", &total)
	return passed, total, true
}

type server struct {
	sandbox        *sandbox
	authToken      string
	workRoot       string
	compileTimeout time.Duration
	runTimeout     time.Duration
	queueTimeout   time.Duration
	// slots bounds concurrent executions so a burst cannot exhaust the
	// machine; waiting requests give up after queueTimeout.
	slots chan struct{}
}

func (s *server) routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
	})
	mux.HandleFunc("GET /api/run", s.requireAuth(s.handleStatus))
	mux.HandleFunc("POST /api/run", s.requireAuth(s.handleRun))
	return mux
}

func (s *server) requireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if s.authToken != "" {
			got := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
			if subtle.ConstantTimeCompare([]byte(got), []byte(s.authToken)) != 1 {
				writeJSON(w, http.StatusUnauthorized, runResponse{
					OK: false, Phase: "auth", Message: "Missing or invalid runner token.",
				})
				return
			}
		}
		next(w, r)
	}
}

func (s *server) handleStatus(w http.ResponseWriter, _ *http.Request) {
	if !s.sandbox.javaAvailable() {
		writeJSON(w, http.StatusOK, statusResponse{
			Available: false,
			Message:   "The Java runner is up, but no JDK was found on it.",
			Sandbox:   string(s.sandbox.mode),
		})
		return
	}
	writeJSON(w, http.StatusOK, statusResponse{
		Available: true,
		Message:   fmt.Sprintf("Java runner ready: %s; runtime: %s", s.sandbox.javacVersion, s.sandbox.javaVersion),
		Sandbox:   string(s.sandbox.mode),
	})
}

func (s *server) handleRun(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	r.Body = http.MaxBytesReader(w, r.Body, maxRequestBody)

	var req runRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		var tooLarge *http.MaxBytesError
		if errors.As(err, &tooLarge) {
			writeJSON(w, http.StatusRequestEntityTooLarge, runResponse{OK: false, Phase: "request", Message: "Request is too large."})
			return
		}
		writeJSON(w, http.StatusBadRequest, runResponse{OK: false, Phase: "request", Message: "Invalid JSON request."})
		return
	}
	if req.QuestionID == "" || strings.TrimSpace(req.Code) == "" {
		writeJSON(w, http.StatusBadRequest, runResponse{OK: false, Phase: "request", Message: "Missing question id or Java code."})
		return
	}
	if len(req.Code) > maxCodeLength {
		writeJSON(w, http.StatusRequestEntityTooLarge, runResponse{OK: false, Phase: "request", Message: "Code is too large to run."})
		return
	}

	files, ok := buildHarness(req.QuestionID, req.Code)
	if !ok {
		writeJSON(w, http.StatusNotFound, runResponse{OK: false, Phase: "unsupported", Message: "No Java tests are available for this question."})
		return
	}

	if !s.sandbox.javaAvailable() {
		writeJSON(w, http.StatusOK, runResponse{OK: false, Phase: "java", Message: "The Java runner has no working JDK."})
		return
	}

	select {
	case s.slots <- struct{}{}:
		defer func() { <-s.slots }()
	case <-time.After(s.queueTimeout):
		writeJSON(w, http.StatusServiceUnavailable, runResponse{OK: false, Phase: "busy", Message: "The Java runner is busy. Try again in a moment."})
		return
	case <-r.Context().Done():
		return
	}

	resp := s.execute(req.QuestionID, files)
	log.Printf("run question=%s phase=%s ok=%t elapsed=%s", req.QuestionID, resp.Phase, resp.OK, time.Since(start).Round(time.Millisecond))
	writeJSON(w, http.StatusOK, resp)
}

func (s *server) execute(questionID string, files map[string]string) runResponse {
	workdir, err := os.MkdirTemp(s.workRoot, "run-")
	if err != nil {
		log.Printf("error: creating workdir: %v", err)
		return runResponse{OK: false, Phase: "internal", Message: "The runner could not prepare a workspace."}
	}
	defer os.RemoveAll(workdir)
	// The sandbox runs as the same uid, but tighten anyway; harness
	// sources do not need to be world-readable.
	if err := os.Chmod(workdir, 0o755); err != nil {
		log.Printf("error: chmod workdir: %v", err)
	}

	names := make([]string, 0, len(files))
	for name := range files {
		names = append(names, name)
	}
	sort.Strings(names)
	for _, name := range names {
		if err := os.WriteFile(filepath.Join(workdir, name), []byte(files[name]), 0o644); err != nil {
			log.Printf("error: writing %s: %v", name, err)
			return runResponse{OK: false, Phase: "internal", Message: "The runner could not prepare the test files."}
		}
	}

	compile := s.sandbox.compile(names, workdir, s.compileTimeout)
	if compile.startErr != nil {
		log.Printf("error: starting javac: %v", compile.startErr)
		return runResponse{OK: false, Phase: "internal", Message: "The runner could not start the compiler."}
	}
	if compile.exitCode != 0 {
		message := "Compilation failed."
		if compile.timedOut {
			message = "Compilation timed out."
		}
		return runResponse{
			OK: false, Phase: "compile", Message: message,
			Stdout: compile.stdout, Stderr: compile.stderr,
		}
	}

	run := s.sandbox.runTests(workdir, s.runTimeout)
	if run.startErr != nil {
		log.Printf("error: starting java: %v", run.startErr)
		return runResponse{OK: false, Phase: "internal", Message: "The runner could not start the tests."}
	}

	passed, total, found := parseResult(run.stdout)
	// A genuine full pass requires a clean exit and a complete, matching
	// RESULT line — an early System.exit(0) does not count.
	ok := run.exitCode == 0 && found && total > 0 && passed == total
	message := "Some tests failed."
	switch {
	case ok:
		message = "All tests passed."
	case run.timedOut:
		message = "Execution timed out."
	case !found && run.exitCode == 0:
		message = "Tests did not finish."
	}

	resp := runResponse{
		OK: ok, Phase: "test", Message: message,
		Stdout: run.stdout, Stderr: run.stderr,
	}
	if found {
		resp.Passed, resp.Total = &passed, &total
	}
	return resp
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(body)
}
