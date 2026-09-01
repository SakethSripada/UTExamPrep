package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func testServer(t *testing.T, authToken string) *server {
	t.Helper()
	box, err := newSandbox("none")
	if err != nil {
		t.Fatalf("newSandbox: %v", err)
	}
	return newServer(serverConfig{
		sandbox:        box,
		authToken:      authToken,
		compileTimeout: 20 * time.Second,
		runTimeout:     8 * time.Second,
		queueTimeout:   time.Second,
		concurrency:    1,
		// Generous limits so functional tests are never throttled.
		devicePerMin: 100_000, deviceBurst: 100_000,
		ipPerMin: 100_000, ipBurst: 100_000,
		globalPerMin: 100_000, globalBurst: 100_000,
		rateMaxKeys: 1000,
	})
}

func doJSON(t *testing.T, handler http.Handler, method, path, body string, headers map[string]string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	for key, value := range headers {
		req.Header.Set(key, value)
	}
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	return rec
}

func TestRunValidation(t *testing.T) {
	handler := testServer(t, "").routes()

	cases := []struct {
		name       string
		body       string
		wantStatus int
		wantPhase  string
	}{
		{"invalid json", "{", http.StatusBadRequest, "request"},
		{"missing fields", `{}`, http.StatusBadRequest, "request"},
		{"blank code", `{"questionId":"e1-q5","code":"   "}`, http.StatusBadRequest, "request"},
		{"unknown question", `{"questionId":"zzz-q1","code":"class X {}"}`, http.StatusNotFound, "unsupported"},
		{"path traversal", `{"questionId":"../etc","code":"class X {}"}`, http.StatusNotFound, "unsupported"},
		{"oversized code", `{"questionId":"e1-q5","code":"` + strings.Repeat("a", maxCodeLength+1) + `"}`, http.StatusRequestEntityTooLarge, "request"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			rec := doJSON(t, handler, "POST", "/api/run", tc.body, nil)
			if rec.Code != tc.wantStatus {
				t.Errorf("status = %d, want %d (body %s)", rec.Code, tc.wantStatus, rec.Body)
			}
			if !strings.Contains(rec.Body.String(), `"phase":"`+tc.wantPhase+`"`) {
				t.Errorf("body = %s, want phase %q", rec.Body, tc.wantPhase)
			}
		})
	}
}

func TestOversizedRequestBody(t *testing.T) {
	handler := testServer(t, "").routes()
	body := `{"questionId":"e1-q5","code":"` + strings.Repeat("a", maxRequestBody) + `"}`
	rec := doJSON(t, handler, "POST", "/api/run", body, nil)
	if rec.Code != http.StatusRequestEntityTooLarge {
		t.Errorf("status = %d, want 413", rec.Code)
	}
}

func TestAuth(t *testing.T) {
	handler := testServer(t, "sekrit").routes()

	rec := doJSON(t, handler, "GET", "/api/run", "", nil)
	if rec.Code != http.StatusUnauthorized {
		t.Errorf("GET without token: status = %d, want 401", rec.Code)
	}
	rec = doJSON(t, handler, "POST", "/api/run", `{"questionId":"e1-q5","code":"x"}`, map[string]string{"Authorization": "Bearer wrong"})
	if rec.Code != http.StatusUnauthorized {
		t.Errorf("POST with bad token: status = %d, want 401", rec.Code)
	}
	rec = doJSON(t, handler, "GET", "/api/run", "", map[string]string{"Authorization": "Bearer sekrit"})
	if rec.Code != http.StatusOK {
		t.Errorf("GET with token: status = %d, want 200", rec.Code)
	}
	// healthz stays open for platform checks.
	rec = doJSON(t, handler, "GET", "/healthz", "", nil)
	if rec.Code != http.StatusOK {
		t.Errorf("healthz: status = %d, want 200", rec.Code)
	}
}

func TestParseResult(t *testing.T) {
	cases := []struct {
		stdout string
		passed int
		total  int
		found  bool
	}{
		{"PASS a\nPASS b\nRESULT 2/2\n", 2, 2, true},
		{"FAIL a\nRESULT 0/3\n", 0, 3, true},
		{"no result here", 0, 0, false},
		// A spoofed RESULT printed by student code is superseded by the
		// real, final one.
		{"RESULT 9/9\nFAIL a\nRESULT 1/2\n", 1, 2, true},
	}
	for _, tc := range cases {
		passed, total, found := parseResult(tc.stdout)
		if passed != tc.passed || total != tc.total || found != tc.found {
			t.Errorf("parseResult(%q) = (%d, %d, %t), want (%d, %d, %t)",
				tc.stdout, passed, total, found, tc.passed, tc.total, tc.found)
		}
	}
}
