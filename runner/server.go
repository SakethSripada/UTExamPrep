package main

import (
	"crypto/subtle"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
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
	Language   string `json:"language"`
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
	Available bool     `json:"available"`
	Message   string   `json:"message"`
	Sandbox   string   `json:"sandbox"`
	Languages []string `json:"languages,omitempty"`
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

	// Layered rate limiting. deviceLimiter is the primary, per-user fair
	// limit keyed by an anonymous device id (NAT-safe: students sharing one
	// campus IP are limited independently). ipLimiter is a looser backstop so
	// a single source spraying random device ids can't overwhelm the box.
	// globalLimiter is the absolute ceiling on total throughput.
	deviceLimiter *keyedLimiter
	ipLimiter     *keyedLimiter
	globalLimiter *keyedLimiter

	metrics *usageMetrics
}

type serverConfig struct {
	sandbox        *sandbox
	authToken      string
	workRoot       string
	compileTimeout time.Duration
	runTimeout     time.Duration
	queueTimeout   time.Duration
	concurrency    int

	devicePerMin, deviceBurst int
	ipPerMin, ipBurst         int
	globalPerMin, globalBurst int
	rateMaxKeys               int
}

func newServer(cfg serverConfig) *server {
	if cfg.concurrency < 1 {
		cfg.concurrency = 1
	}
	s := &server{
		sandbox:        cfg.sandbox,
		authToken:      cfg.authToken,
		workRoot:       cfg.workRoot,
		compileTimeout: cfg.compileTimeout,
		runTimeout:     cfg.runTimeout,
		queueTimeout:   cfg.queueTimeout,
		slots:          make(chan struct{}, cfg.concurrency),
		deviceLimiter:  newKeyedLimiter(cfg.devicePerMin, cfg.deviceBurst, cfg.rateMaxKeys),
		ipLimiter:      newKeyedLimiter(cfg.ipPerMin, cfg.ipBurst, cfg.rateMaxKeys),
		globalLimiter:  newKeyedLimiter(cfg.globalPerMin, cfg.globalBurst, 1),
		metrics:        newUsageMetrics(),
	}
	go s.deviceLimiter.sweep()
	go s.ipLimiter.sweep()
	return s
}

func (s *server) routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
	})
	mux.HandleFunc("GET /api/run", s.requireAuth(s.handleStatus))
	mux.HandleFunc("POST /api/run", s.requireAuth(s.handleRun))
	mux.HandleFunc("GET /metrics", s.requireAuth(s.handleMetrics))
	return mux
}

func (s *server) handleMetrics(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, s.metrics.snapshot())
}

// clientIP resolves the caller's address. The Next.js proxy forwards the real
// browser IP in X-Client-IP; X-Forwarded-For is the fallback. These headers
// are only trusted because reaching this endpoint requires the shared auth
// token, so an anonymous attacker cannot spoof them.
func clientIP(r *http.Request) string {
	if ip := firstHost(r.Header.Get("X-Client-IP")); ip != "" {
		return ip
	}
	if ip := firstHost(r.Header.Get("X-Forwarded-For")); ip != "" {
		return ip
	}
	if host, _, err := net.SplitHostPort(r.RemoteAddr); err == nil {
		return host
	}
	return r.RemoteAddr
}

func firstHost(value string) string {
	if i := strings.IndexByte(value, ','); i >= 0 {
		value = value[:i]
	}
	return strings.TrimSpace(value)
}

// deviceID reads the anonymous per-browser id the frontend stores in
// localStorage. Bounded in length so it cannot be abused as a memory sink.
func deviceID(r *http.Request) string {
	id := strings.TrimSpace(r.Header.Get("X-Device-Id"))
	if len(id) > 64 {
		id = id[:64]
	}
	return id
}

// rateLimited applies the three limiter tiers. It returns true (and writes a
// 429) when the request should be rejected.
func (s *server) rateLimited(w http.ResponseWriter, device, ip string) bool {
	// Key the primary limiter by device id when present, else fall back to
	// the IP so token-less clients (curl, an older frontend) are still
	// limited individually.
	primary := device
	if primary == "" {
		primary = "ip:" + ip
	}
	for _, check := range []struct {
		limiter *keyedLimiter
		key     string
	}{
		{s.deviceLimiter, primary},
		{s.ipLimiter, "ip:" + ip},
		{s.globalLimiter, "global"},
	} {
		if ok, retry := check.limiter.allow(check.key); !ok {
			if retry < 1 {
				retry = 1
			}
			w.Header().Set("Retry-After", strconv.Itoa(retry))
			writeJSON(w, http.StatusTooManyRequests, runResponse{
				OK:      false,
				Phase:   "rate_limited",
				Message: "You're running tests a bit too fast. Wait a few seconds and try again.",
			})
			return true
		}
	}
	return false
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
	languages := s.sandbox.availableLanguages()
	if len(languages) == 0 {
		writeJSON(w, http.StatusOK, statusResponse{
			Available: false,
			Message:   "The code runner is up, but no supported language runtime was found on it.",
			Sandbox:   string(s.sandbox.mode),
			Languages: languages,
		})
		return
	}
	writeJSON(w, http.StatusOK, statusResponse{
		Available: true,
		Message:   fmt.Sprintf("Code runner ready: %s", strings.Join(s.sandbox.runtimeMessages(), "; ")),
		Sandbox:   string(s.sandbox.mode),
		Languages: languages,
	})
}

func (s *server) handleRun(w http.ResponseWriter, r *http.Request) {
	start := time.Now()

	// Throttle before doing any work so even a flood of malformed requests is
	// cheap to reject.
	ip := clientIP(r)
	device := deviceID(r)
	if s.rateLimited(w, device, ip) {
		return
	}

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
	language := strings.ToLower(strings.TrimSpace(req.Language))
	if language == "" {
		language = "java"
	}
	if req.QuestionID == "" || strings.TrimSpace(req.Code) == "" {
		writeJSON(w, http.StatusBadRequest, runResponse{OK: false, Phase: "request", Message: "Missing question id or code."})
		return
	}
	if len(req.Code) > maxCodeLength {
		writeJSON(w, http.StatusRequestEntityTooLarge, runResponse{OK: false, Phase: "request", Message: "Code is too large to run."})
		return
	}

	files, ok := buildHarnessForLanguage(req.QuestionID, language, req.Code)
	if !ok {
		writeJSON(w, http.StatusNotFound, runResponse{OK: false, Phase: "unsupported", Message: "No tests are available for this question and language."})
		return
	}

	if !s.sandbox.languageAvailable(language) {
		writeJSON(w, http.StatusOK, runResponse{OK: false, Phase: "runtime", Message: "The runner has no working runtime for this language."})
		return
	}

	select {
	case s.slots <- struct{}{}:
		defer func() { <-s.slots }()
	case <-time.After(s.queueTimeout):
		writeJSON(w, http.StatusServiceUnavailable, runResponse{OK: false, Phase: "busy", Message: "The code runner is busy. Try again in a moment."})
		return
	case <-r.Context().Done():
		return
	}

	s.metrics.record(device, ip)
	resp := s.execute(language, files)
	log.Printf("run question=%s language=%s phase=%s ok=%t client=%s elapsed=%s",
		req.QuestionID, language, resp.Phase, resp.OK, logClient(device, ip), time.Since(start).Round(time.Millisecond))
	writeJSON(w, http.StatusOK, resp)
}

func (s *server) execute(language string, files map[string]string) runResponse {
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

	if language == "python" {
		return responseFromRun(s.sandbox.runPythonTests(workdir, s.runTimeout))
	}
	if language == "c" {
		compile := s.sandbox.compileC(names, workdir, s.compileTimeout)
		if compile.startErr != nil {
			log.Printf("error: starting C compiler: %v", compile.startErr)
			return runResponse{OK: false, Phase: "internal", Message: "The runner could not start the compiler."}
		}
		if compile.exitCode != 0 {
			message := "Compilation failed."
			if compile.timedOut {
				message = "Compilation timed out."
			}
			return runResponse{OK: false, Phase: "compile", Message: message, Stdout: compile.stdout, Stderr: compile.stderr}
		}
		return responseFromRun(s.sandbox.runCTests(workdir, s.runTimeout))
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

	return responseFromRun(run)
}

func responseFromRun(run execResult) runResponse {
	if run.startErr != nil {
		log.Printf("error: starting tests: %v", run.startErr)
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

// logClient renders a short, privacy-conscious client tag for the run log:
// the anonymous device id when present, otherwise the IP.
func logClient(device, ip string) string {
	if device != "" {
		if len(device) > 8 {
			device = device[:8]
		}
		return "dev:" + device
	}
	return "ip:" + ip
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(body)
}
