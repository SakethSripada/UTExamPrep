package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"strconv"
	"syscall"
	"time"
)

func envInt(name string, fallback int) int {
	if raw := os.Getenv(name); raw != "" {
		if value, err := strconv.Atoi(raw); err == nil && value > 0 {
			return value
		}
		log.Fatalf("invalid %s=%q (want a positive integer)", name, os.Getenv(name))
	}
	return fallback
}

func main() {
	log.SetFlags(log.LstdFlags | log.LUTC)

	box, err := newSandbox(os.Getenv("SANDBOX_MODE"))
	if err != nil {
		log.Fatalf("sandbox init: %v", err)
	}
	if box.javaAvailable() {
		log.Printf("jdk: %s (%s)", box.javacVersion, box.javaPath)
	} else {
		log.Printf("WARNING: no JDK found; submissions will be rejected until one is installed")
	}
	log.Printf("sandbox mode: %s", box.mode)
	log.Printf("questions registered: %d", len(questionIDs()))

	authToken := os.Getenv("RUNNER_AUTH_TOKEN")
	if authToken == "" {
		log.Printf("WARNING: RUNNER_AUTH_TOKEN is empty — the API is unauthenticated")
	}

	concurrency := envInt("RUNNER_MAX_CONCURRENCY", max(1, runtime.NumCPU()))
	srv := &server{
		sandbox:        box,
		authToken:      authToken,
		workRoot:       os.Getenv("RUNNER_WORK_DIR"),
		compileTimeout: time.Duration(envInt("RUNNER_COMPILE_TIMEOUT_MS", 20_000)) * time.Millisecond,
		runTimeout:     time.Duration(envInt("RUNNER_RUN_TIMEOUT_MS", 8_000)) * time.Millisecond,
		queueTimeout:   time.Duration(envInt("RUNNER_QUEUE_TIMEOUT_MS", 10_000)) * time.Millisecond,
		slots:          make(chan struct{}, concurrency),
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	httpServer := &http.Server{
		Addr:              ":" + port,
		Handler:           srv.routes(),
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      90 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	go func() {
		log.Printf("listening on :%s (concurrency %d)", port, concurrency)
		if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("listen: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop
	log.Printf("shutting down")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	httpServer.Shutdown(ctx)
}
