package main

import (
	"sync"
	"time"
)

// usageMetrics gives an at-a-glance view of how much the runner is used,
// without any external analytics or login. It tracks per-day run counts and
// approximate unique device/IP counts. The unique sets are capped to bound
// memory, so under very heavy traffic the unique numbers are a floor rather
// than an exact figure. Counts reset at UTC midnight.
type usageMetrics struct {
	mu          sync.Mutex
	day         string
	runsToday   int64
	runsAllTime int64
	devices     map[string]struct{}
	ips         map[string]struct{}
	maxSet      int
}

func newUsageMetrics() *usageMetrics {
	return &usageMetrics{
		day:     utcDay(),
		devices: make(map[string]struct{}),
		ips:     make(map[string]struct{}),
		maxSet:  200_000,
	}
}

func utcDay() string { return time.Now().UTC().Format("2006-01-02") }

// record counts one executed run from the given anonymous device id and IP
// (either may be empty).
func (m *usageMetrics) record(device, ip string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if day := utcDay(); day != m.day {
		m.day = day
		m.runsToday = 0
		m.devices = make(map[string]struct{})
		m.ips = make(map[string]struct{})
	}

	m.runsToday++
	m.runsAllTime++
	if device != "" && len(m.devices) < m.maxSet {
		m.devices[device] = struct{}{}
	}
	if ip != "" && len(m.ips) < m.maxSet {
		m.ips[ip] = struct{}{}
	}
}

func (m *usageMetrics) snapshot() map[string]any {
	m.mu.Lock()
	defer m.mu.Unlock()
	return map[string]any{
		"day":                m.day,
		"runsToday":          m.runsToday,
		"runsAllTime":        m.runsAllTime,
		"uniqueDevicesToday": len(m.devices),
		"uniqueIpsToday":     len(m.ips),
	}
}
