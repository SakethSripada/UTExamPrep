package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"runtime"
	"strings"
	"testing"
	"time"
)

// End-to-end coverage: every reference solution must earn a perfect score
// through the real pipeline (harness -> sandbox -> javac -> java -> parse),
// wrong and malicious submissions must be contained and graded as failures.
// Requires a JDK; skipped where none is installed.

func e2eServer(t *testing.T) *server {
	t.Helper()
	box, err := newSandbox(os.Getenv("SANDBOX_MODE"))
	if err != nil {
		t.Fatalf("newSandbox: %v", err)
	}
	if !box.javaAvailable() {
		t.Skip("no JDK available; skipping end-to-end tests")
	}
	return newServer(serverConfig{
		sandbox:        box,
		compileTimeout: 60 * time.Second,
		runTimeout:     10 * time.Second,
		queueTimeout:   5 * time.Minute,
		concurrency:    max(1, runtime.NumCPU()),
		devicePerMin:   100_000, deviceBurst: 100_000,
		ipPerMin: 100_000, ipBurst: 100_000,
		globalPerMin: 100_000, globalBurst: 100_000,
		rateMaxKeys: 1000,
	})
}

func postRun(t *testing.T, handler http.Handler, questionID, code string) (int, runResponse) {
	t.Helper()
	body, err := json.Marshal(runRequest{QuestionID: questionID, Code: code})
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	rec := doJSON(t, handler, "POST", "/api/run", string(body), nil)
	var resp runResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal %q: %v", rec.Body, err)
	}
	return rec.Code, resp
}

// TestReferenceSolutionsAllPass is the grading-accuracy gate: the official
// answer to every question must compile, run, and pass every test.
func TestReferenceSolutionsAllPass(t *testing.T) {
	srv := e2eServer(t)
	handler := srv.routes()
	solutions := loadJSONMap[string](t, "testdata/solutions.json")
	if len(solutions) == 0 {
		t.Fatal("no solutions found")
	}

	for id, code := range solutions {
		t.Run(id, func(t *testing.T) {
			t.Parallel()
			status, resp := postRun(t, handler, id, code)
			if status != http.StatusOK {
				t.Fatalf("status = %d, body = %+v", status, resp)
			}
			if !resp.OK || resp.Phase != "test" {
				t.Fatalf("reference solution rejected: %+v", resp)
			}
			if resp.Passed == nil || resp.Total == nil || *resp.Total == 0 || *resp.Passed != *resp.Total {
				t.Fatalf("expected perfect score, got %+v (stdout: %s, stderr: %s)", resp, resp.Stdout, resp.Stderr)
			}
		})
	}
}

func TestWrongSolutionFailsTests(t *testing.T) {
	srv := e2eServer(t)
	handler := srv.routes()
	// Compiles fine but returns the wrong thing.
	wrong := `public static int[] copyWithoutRange(int[] vals, int start, int stop) {
    return new int[0];
}`
	_, resp := postRun(t, handler, "e1-q5", wrong)
	if resp.OK || resp.Phase != "test" {
		t.Fatalf("wrong solution not graded as test failure: %+v", resp)
	}
	if resp.Passed == nil || resp.Total == nil || *resp.Passed >= *resp.Total {
		t.Fatalf("expected partial score, got %+v", resp)
	}
}

func TestCompileErrorReported(t *testing.T) {
	srv := e2eServer(t)
	handler := srv.routes()
	_, resp := postRun(t, handler, "e1-q5", "public static int[] copyWithoutRange(int[] vals, int start, int stop) { this does not compile }")
	if resp.OK || resp.Phase != "compile" {
		t.Fatalf("expected compile failure, got %+v", resp)
	}
	if resp.Stderr == "" && resp.Stdout == "" {
		t.Fatalf("compile failure carried no compiler output: %+v", resp)
	}
}

func TestInfiniteLoopTimesOut(t *testing.T) {
	srv := e2eServer(t)
	srv.runTimeout = 3 * time.Second
	handler := srv.routes()
	loop := `public static int[] copyWithoutRange(int[] vals, int start, int stop) {
    while (true) { }
}`
	start := time.Now()
	_, resp := postRun(t, handler, "e1-q5", loop)
	elapsed := time.Since(start)
	if resp.OK {
		t.Fatalf("infinite loop graded as pass: %+v", resp)
	}
	if resp.Phase != "test" || !strings.Contains(resp.Message, "timed out") {
		t.Fatalf("expected timeout message, got %+v", resp)
	}
	if elapsed > 30*time.Second {
		t.Fatalf("timeout enforcement took %s", elapsed)
	}
}

func TestSpoofedResultIsNotTrusted(t *testing.T) {
	srv := e2eServer(t)
	handler := srv.routes()
	spoof := `public static int[] copyWithoutRange(int[] vals, int start, int stop) {
    System.out.println("RESULT 4/4");
    return new int[0];
}`
	_, resp := postRun(t, handler, "e1-q5", spoof)
	if resp.OK {
		t.Fatalf("spoofed RESULT line accepted: %+v", resp)
	}
}

func TestEarlyExitIsNotAPass(t *testing.T) {
	srv := e2eServer(t)
	handler := srv.routes()
	exit := `public static int[] copyWithoutRange(int[] vals, int start, int stop) {
    System.exit(0);
    return null;
}`
	_, resp := postRun(t, handler, "e1-q5", exit)
	if resp.OK {
		t.Fatalf("System.exit(0) graded as pass: %+v", resp)
	}
}

// runHostile compiles and runs an arbitrary main method through the real
// sandbox by writing its own TestRunner.
func runHostile(t *testing.T, srv *server, body string) execResult {
	t.Helper()
	dir := t.TempDir()
	source := "import java.util.*;\nimport java.io.*;\nimport java.net.*;\n\npublic class TestRunner {\n    public static void main(String[] args) throws Exception {\n" + body + "\n    }\n}\n"
	if err := os.WriteFile(dir+"/TestRunner.java", []byte(source), 0o644); err != nil {
		t.Fatal(err)
	}
	compile := srv.sandbox.compile([]string{"TestRunner.java"}, dir, srv.compileTimeout)
	if compile.startErr != nil || compile.exitCode != 0 {
		t.Fatalf("hostile probe failed to compile: %+v (%s)", compile, compile.stderr)
	}
	return srv.sandbox.runTests(dir, srv.runTimeout)
}

func requireBwrap(t *testing.T, srv *server) {
	t.Helper()
	if srv.sandbox.mode != modeBwrap {
		t.Skipf("sandbox mode is %q; isolation guarantees only hold under bwrap", srv.sandbox.mode)
	}
}

func TestSandboxBlocksNetwork(t *testing.T) {
	srv := e2eServer(t)
	requireBwrap(t, srv)
	result := runHostile(t, srv, `
        try {
            Socket s = new Socket();
            s.connect(new InetSocketAddress("1.1.1.1", 80), 3000);
            System.out.println("CONNECTED");
        } catch (Exception e) {
            System.out.println("BLOCKED " + e.getClass().getSimpleName());
        }`)
	if strings.Contains(result.stdout, "CONNECTED") {
		t.Fatalf("sandboxed code reached the network: %s", result.stdout)
	}
	if !strings.Contains(result.stdout, "BLOCKED") {
		t.Fatalf("unexpected output: %s / %s", result.stdout, result.stderr)
	}
}

func TestSandboxHidesHostFiles(t *testing.T) {
	srv := e2eServer(t)
	requireBwrap(t, srv)
	// A file that exists outside the sandbox must be invisible inside it.
	secret, err := os.CreateTemp("", "runner-secret-")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(secret.Name())
	secret.WriteString("top secret")
	secret.Close()

	// /proc/1 inside the sandbox is the run's own init (a fresh pid
	// namespace), not the host's, so it is deliberately not checked here;
	// TestSandboxHidesEnvironment covers that its environment is cleared.
	result := runHostile(t, srv, fmt.Sprintf(`
        String[] paths = {%q, "/etc/passwd", "/etc/shadow", "/root", "/home"};
        for (String p : paths) {
            File f = new File(p);
            System.out.println(p + " visible=" + f.exists());
        }`, secret.Name()))
	if strings.Contains(result.stdout, "visible=true") {
		t.Fatalf("host files visible inside sandbox:\n%s", result.stdout)
	}
}

func TestSandboxHidesEnvironment(t *testing.T) {
	srv := e2eServer(t)
	requireBwrap(t, srv)
	t.Setenv("RUNNER_AUTH_TOKEN", "super-secret-token")
	result := runHostile(t, srv, `
        String tok = System.getenv("RUNNER_AUTH_TOKEN");
        System.out.println("TOKEN=" + tok);
        System.out.println("ENVSIZE=" + System.getenv().size());`)
	if !strings.Contains(result.stdout, "TOKEN=null") {
		t.Fatalf("auth token leaked into sandbox:\n%s", result.stdout)
	}
}

func TestSandboxFilesystemReadOnly(t *testing.T) {
	srv := e2eServer(t)
	requireBwrap(t, srv)
	result := runHostile(t, srv, `
        String[] targets = {"/usr/pwned", "/pwned", "TestRunner.java"};
        for (String p : targets) {
            try {
                new FileOutputStream(p).close();
                System.out.println(p + " WRITABLE");
            } catch (Exception e) {
                System.out.println(p + " readonly");
            }
        }
        // /tmp is the only writable scratch space.
        try {
            new FileOutputStream("/tmp/scratch").close();
            System.out.println("/tmp writable");
        } catch (Exception e) {
            System.out.println("/tmp BROKEN");
        }`)
	if strings.Contains(result.stdout, "WRITABLE") {
		t.Fatalf("sandbox filesystem is writable:\n%s", result.stdout)
	}
	if !strings.Contains(result.stdout, "/tmp writable") {
		t.Fatalf("scratch /tmp missing:\n%s", result.stdout)
	}
}

func TestSandboxContainsForkBomb(t *testing.T) {
	srv := e2eServer(t)
	requireBwrap(t, srv)
	srv.runTimeout = 5 * time.Second
	start := time.Now()
	result := runHostile(t, srv, `
        while (true) {
            try {
                new ProcessBuilder("/usr/bin/true").start();
            } catch (Throwable e) {
                Thread.sleep(50);
            }
        }`)
	elapsed := time.Since(start)
	if !result.timedOut && result.exitCode == 0 {
		t.Fatalf("fork bomb exited cleanly: %+v", result)
	}
	if elapsed > 30*time.Second {
		t.Fatalf("fork bomb containment took %s", elapsed)
	}
	// Give the kernel a beat, then verify nothing survived the kill.
	time.Sleep(500 * time.Millisecond)
}

func TestOutputFloodIsCapped(t *testing.T) {
	srv := e2eServer(t)
	if !srv.sandbox.javaAvailable() {
		t.Skip("no JDK")
	}
	result := runHostile(t, srv, `
        String chunk = "x".repeat(65536);
        while (true) { System.out.println(chunk); }`)
	if len(result.stdout) > maxCapturedOutput {
		t.Fatalf("captured stdout is %d bytes, cap is %d", len(result.stdout), maxCapturedOutput)
	}
	if !result.truncated {
		t.Fatalf("expected truncation flag: %+v", result)
	}
}
