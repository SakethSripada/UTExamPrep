package main

import (
	"net/http"
	"strings"
	"testing"
	"time"
)

func TestTokenBucketBurstThenRefill(t *testing.T) {
	// 60/min = 1 token/sec, burst of 3.
	l := newKeyedLimiter(60, 3, 100)

	for i := 0; i < 3; i++ {
		if ok, _ := l.allow("k"); !ok {
			t.Fatalf("burst token %d should be allowed", i)
		}
	}
	ok, retry := l.allow("k")
	if ok {
		t.Fatal("4th immediate request should be denied")
	}
	if retry < 1 {
		t.Fatalf("retry-after should be >= 1, got %d", retry)
	}

	// Hand-refill one token by rewinding the bucket's clock.
	l.mu.Lock()
	l.buckets["k"].last = time.Now().Add(-2 * time.Second)
	l.mu.Unlock()
	if ok, _ := l.allow("k"); !ok {
		t.Fatal("request after refill should be allowed")
	}
}

func TestTokenBucketKeysAreIndependent(t *testing.T) {
	l := newKeyedLimiter(60, 1, 100)
	if ok, _ := l.allow("a"); !ok {
		t.Fatal("first request for a should pass")
	}
	if ok, _ := l.allow("b"); !ok {
		t.Fatal("different key b must not share a's bucket")
	}
	if ok, _ := l.allow("a"); ok {
		t.Fatal("a's second immediate request should be denied")
	}
}

func TestLimiterEvictsIdleBuckets(t *testing.T) {
	l := newKeyedLimiter(60, 1, 100)
	l.ttl = 10 * time.Millisecond
	l.allow("old")
	time.Sleep(20 * time.Millisecond)
	l.mu.Lock()
	l.evictLocked(time.Now())
	n := len(l.buckets)
	l.mu.Unlock()
	if n != 0 {
		t.Fatalf("idle bucket should have been evicted, %d remain", n)
	}
}

func TestRunRateLimitReturns429(t *testing.T) {
	srv := testServer(t, "")
	// Tight device limit: burst of 2.
	srv.deviceLimiter = newKeyedLimiter(60, 2, 100)
	handler := srv.routes()

	body := `{"questionId":"e1-q5","code":"x"}` // unknown-but-present fields; rejected after the limiter
	headers := map[string]string{"X-Device-Id": "dev-1"}

	codes := make([]int, 0, 4)
	for i := 0; i < 4; i++ {
		rec := doJSON(t, handler, "POST", "/api/run", body, headers)
		codes = append(codes, rec.Code)
	}
	got429 := false
	for _, c := range codes {
		if c == http.StatusTooManyRequests {
			got429 = true
		}
	}
	if !got429 {
		t.Fatalf("expected a 429 after exceeding the burst, got codes %v", codes)
	}

	// A different device must not be affected by dev-1's bucket.
	rec := doJSON(t, handler, "POST", "/api/run", body, map[string]string{"X-Device-Id": "dev-2"})
	if rec.Code == http.StatusTooManyRequests {
		t.Fatal("a separate device id should have its own allowance")
	}
}

func TestRateLimitResponseShape(t *testing.T) {
	srv := testServer(t, "")
	srv.deviceLimiter = newKeyedLimiter(60, 1, 100)
	handler := srv.routes()
	headers := map[string]string{"X-Device-Id": "dev-x"}

	doJSON(t, handler, "POST", "/api/run", `{"questionId":"e1-q5","code":"x"}`, headers)
	rec := doJSON(t, handler, "POST", "/api/run", `{"questionId":"e1-q5","code":"x"}`, headers)
	if rec.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 429, got %d", rec.Code)
	}
	if rec.Header().Get("Retry-After") == "" {
		t.Error("429 must carry a Retry-After header")
	}
	if !strings.Contains(rec.Body.String(), `"phase":"rate_limited"`) {
		t.Errorf("body should report rate_limited phase: %s", rec.Body)
	}
}

func TestClientIPExtraction(t *testing.T) {
	cases := []struct {
		name    string
		headers map[string]string
		remote  string
		want    string
	}{
		{"x-client-ip wins", map[string]string{"X-Client-IP": "9.9.9.9"}, "1.2.3.4:5", "9.9.9.9"},
		{"xff first hop", map[string]string{"X-Forwarded-For": "8.8.8.8, 10.0.0.1"}, "1.2.3.4:5", "8.8.8.8"},
		{"remote fallback", nil, "1.2.3.4:5678", "1.2.3.4"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			r, _ := http.NewRequest("POST", "/api/run", nil)
			r.RemoteAddr = tc.remote
			for k, v := range tc.headers {
				r.Header.Set(k, v)
			}
			if got := clientIP(r); got != tc.want {
				t.Errorf("clientIP = %q, want %q", got, tc.want)
			}
		})
	}
}

func TestMetricsEndpoint(t *testing.T) {
	srv := testServer(t, "")
	srv.metrics.record("dev-a", "1.1.1.1")
	srv.metrics.record("dev-b", "1.1.1.1")
	srv.metrics.record("dev-a", "2.2.2.2")
	handler := srv.routes()

	rec := doJSON(t, handler, "GET", "/metrics", "", nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("metrics status = %d", rec.Code)
	}
	body := rec.Body.String()
	if !strings.Contains(body, `"runsToday":3`) {
		t.Errorf("runsToday wrong: %s", body)
	}
	if !strings.Contains(body, `"uniqueDevicesToday":2`) {
		t.Errorf("uniqueDevicesToday wrong: %s", body)
	}
	if !strings.Contains(body, `"uniqueIpsToday":2`) {
		t.Errorf("uniqueIpsToday wrong: %s", body)
	}
}
