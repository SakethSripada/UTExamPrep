package main

import (
	"sync"
	"time"
)

// keyedLimiter is a token-bucket rate limiter keyed by an arbitrary string
// (an anonymous device id, a client IP, or a constant for a global cap).
// Each key gets a bucket that refills at `rate` tokens/second up to `burst`.
// Idle buckets are evicted so a flood of unique keys cannot grow memory
// without bound; if the table is full of active keys the limiter fails open
// (the global limiter remains the hard ceiling) rather than deny real users.
type keyedLimiter struct {
	mu      sync.Mutex
	buckets map[string]*tokenBucket
	rate    float64
	burst   float64
	maxKeys int
	ttl     time.Duration
}

type tokenBucket struct {
	tokens float64
	last   time.Time
}

func newKeyedLimiter(perMinute, burst, maxKeys int) *keyedLimiter {
	if burst < 1 {
		burst = 1
	}
	if maxKeys < 1 {
		maxKeys = 1
	}
	return &keyedLimiter{
		buckets: make(map[string]*tokenBucket),
		rate:    float64(perMinute) / 60.0,
		burst:   float64(burst),
		maxKeys: maxKeys,
		ttl:     15 * time.Minute,
	}
}

// allow consumes one token for key. It returns whether the request is allowed
// and, when denied, a suggested number of seconds to wait before retrying.
func (l *keyedLimiter) allow(key string) (bool, int) {
	now := time.Now()
	l.mu.Lock()
	defer l.mu.Unlock()

	b := l.buckets[key]
	if b == nil {
		if len(l.buckets) >= l.maxKeys {
			l.evictLocked(now)
			if len(l.buckets) >= l.maxKeys {
				return true, 0 // fail open; global limiter still caps total load
			}
		}
		b = &tokenBucket{tokens: l.burst, last: now}
		l.buckets[key] = b
	}

	b.tokens = min(l.burst, b.tokens+now.Sub(b.last).Seconds()*l.rate)
	b.last = now
	if b.tokens >= 1 {
		b.tokens--
		return true, 0
	}
	wait := (1 - b.tokens) / l.rate
	return false, int(wait) + 1
}

func (l *keyedLimiter) evictLocked(now time.Time) {
	for key, b := range l.buckets {
		if now.Sub(b.last) > l.ttl {
			delete(l.buckets, key)
		}
	}
}

// sweep periodically reclaims idle buckets so memory is released even when no
// new keys arrive to trigger eviction. Runs for the process lifetime.
func (l *keyedLimiter) sweep() {
	ticker := time.NewTicker(l.ttl)
	for now := range ticker.C {
		l.mu.Lock()
		l.evictLocked(now)
		l.mu.Unlock()
	}
}
