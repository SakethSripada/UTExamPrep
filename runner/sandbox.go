package main

import (
	"bytes"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"sync"
	"time"
)

// The sandbox layers, outermost first:
//  1. The deployment platform (Fly.io machine / hardened container) — see the
//     Dockerfile and README for the required flags.
//  2. bubblewrap: per-execution user/pid/net/ipc/uts namespaces, read-only
//     binds of the toolchain only, a private /tmp, no environment, no
//     capabilities. Killing the process group reaps the entire namespace.
//  3. prlimit: process-count, file-size, open-file, and CPU rlimits.
//  4. JVM ceilings (-Xmx and friends), wall-clock kills, and output caps
//     enforced by this process.
//
// Mode "none" keeps only layer 4 and exists so the service can run on a
// developer machine (e.g. macOS) where bubblewrap is unavailable. It must
// never be used for untrusted traffic.

type sandboxMode string

const (
	modeBwrap sandboxMode = "bwrap"
	modeNone  sandboxMode = "none"
)

// Fixed path the work directory is bound to inside the bwrap namespace, so
// user code never sees the host's real directory layout.
const sandboxWorkdir = "/work"

// Capture caps, aligned with the original route's MAX_BUFFER.
const (
	maxCapturedOutput = 128 * 1024
	// Beyond this much total output the process is killed; it is clearly
	// not a test run anymore.
	hardOutputLimit = 4 * 1024 * 1024
)

type sandbox struct {
	mode        sandboxMode
	bwrapPath   string
	prlimitPath string
	tmpfsSize   bool // bwrap supports --size for --tmpfs

	javaHome      string
	javacPath     string
	javaPath      string
	javacVersion  string
	javaVersion   string
	pythonPath    string
	pythonVersion string
	// extraBinds are directories outside /usr that the JDK reaches through
	// symlinks (e.g. Debian sends conf/security and cacerts into /etc).
	// They are bound read-only at their real paths so those links resolve.
	extraBinds []string
}

type execResult struct {
	exitCode  int
	stdout    string
	stderr    string
	timedOut  bool
	truncated bool
	startErr  error
}

func (s *sandbox) javaAvailable() bool {
	return s.javacPath != "" && s.javaPath != ""
}

func (s *sandbox) pythonAvailable() bool {
	return s.pythonPath != ""
}

func (s *sandbox) languageAvailable(language string) bool {
	switch language {
	case "java":
		return s.javaAvailable()
	case "python":
		return s.pythonAvailable()
	default:
		return false
	}
}

func (s *sandbox) availableLanguages() []string {
	var languages []string
	if s.javaAvailable() {
		languages = append(languages, "java")
	}
	if s.pythonAvailable() {
		languages = append(languages, "python")
	}
	return languages
}

func (s *sandbox) runtimeMessages() []string {
	var messages []string
	if s.javaAvailable() {
		messages = append(messages, fmt.Sprintf("java %s", s.javacVersion))
	}
	if s.pythonAvailable() {
		messages = append(messages, s.pythonVersion)
	}
	return messages
}

// newSandbox resolves the JDK and picks the strongest working isolation mode.
// requestedMode is "auto", "bwrap", or "none".
func newSandbox(requestedMode string) (*sandbox, error) {
	s := &sandbox{mode: modeNone}
	s.resolveJava()
	s.resolvePython()

	switch requestedMode {
	case "none":
		return s, nil
	case "bwrap", "auto", "":
	default:
		return nil, fmt.Errorf("unknown SANDBOX_MODE %q (want auto, bwrap, or none)", requestedMode)
	}

	if runtime.GOOS == "linux" {
		if path, err := exec.LookPath("bwrap"); err == nil {
			s.bwrapPath = path
		}
		if path, err := exec.LookPath("prlimit"); err == nil {
			s.prlimitPath = path
		}
	}

	if s.bwrapPath != "" && s.javaAvailable() {
		// Probe with the mode already set so wrap() builds a real bwrap
		// command line; this is what lets probeBwrap detect unsupported
		// options (e.g. --size on older bubblewrap) and fall back.
		s.mode = modeBwrap
		if err := s.probeBwrap(); err != nil {
			s.mode = modeNone
			if requestedMode == "bwrap" {
				return nil, fmt.Errorf("SANDBOX_MODE=bwrap but the bubblewrap probe failed: %w", err)
			}
			log.Printf("WARNING: bubblewrap probe failed (%v); falling back to unsandboxed execution", err)
		}
	} else if requestedMode == "bwrap" {
		return nil, fmt.Errorf("SANDBOX_MODE=bwrap but bwrap or the JDK is missing")
	}

	if s.mode == modeNone {
		log.Printf("WARNING: sandbox mode is %q — untrusted code is NOT isolated; use this only for local development", modeNone)
	}
	return s, nil
}

func (s *sandbox) resolveJava() {
	javaHome := os.Getenv("JAVA_HOME")
	if javaHome != "" {
		javac := filepath.Join(javaHome, "bin", "javac")
		java := filepath.Join(javaHome, "bin", "java")
		if isExecutable(javac) && isExecutable(java) {
			s.javaHome, s.javacPath, s.javaPath = javaHome, javac, java
		}
	}
	if s.javacPath == "" {
		if javac, err := exec.LookPath("javac"); err == nil {
			if resolved, err := filepath.EvalSymlinks(javac); err == nil {
				javac = resolved
			}
			java := filepath.Join(filepath.Dir(javac), "java")
			if isExecutable(java) {
				s.javacPath, s.javaPath = javac, java
				s.javaHome = filepath.Dir(filepath.Dir(javac))
			}
		}
	}
	if s.javacPath == "" {
		return
	}
	s.javacVersion = commandVersion(s.javacPath)
	s.javaVersion = commandVersion(s.javaPath)
	if s.javacVersion == "" || s.javaVersion == "" {
		// A JDK that cannot even print its version is unusable.
		s.javacPath, s.javaPath = "", ""
		return
	}
	s.extraBinds = computeExtraBinds(s.javaHome)
}

func (s *sandbox) resolvePython() {
	for _, name := range []string{"python3", "python"} {
		python, err := exec.LookPath(name)
		if err != nil {
			continue
		}
		if resolved, err := filepath.EvalSymlinks(python); err == nil {
			python = resolved
		}
		if !isExecutable(python) {
			continue
		}
		version := commandOutput(python, "--version")
		if strings.HasPrefix(version, "Python 3.") {
			s.pythonPath = python
			s.pythonVersion = version
			return
		}
	}
}

// computeExtraBinds finds directories the JDK depends on that live outside
// JAVA_HOME and /usr. Some distributions (Debian/Ubuntu) relocate the JDK's
// security config and trust store into /etc and symlink back; those targets
// must be visible inside the sandbox or the JVM fails to start. Returns a
// deduplicated, sorted list of existing directories to bind read-only.
func computeExtraBinds(javaHome string) []string {
	set := map[string]struct{}{}
	add := func(dir string) {
		if dir == "" || dir == "/" {
			return
		}
		if strings.HasPrefix(dir+"/", "/usr/") || strings.HasPrefix(dir+"/", javaHome+"/") {
			return
		}
		if info, err := os.Stat(dir); err == nil && info.IsDir() {
			set[dir] = struct{}{}
		}
	}

	// Follow the JDK's well-known config symlinks to wherever they really
	// live and bind the directory holding them.
	for _, rel := range []string{
		"conf/security/java.security",
		"lib/security/cacerts",
		"lib/security/default.policy",
	} {
		if real, err := filepath.EvalSymlinks(filepath.Join(javaHome, rel)); err == nil {
			add(filepath.Dir(real))
		}
	}
	// Debian groups everything under /etc/java-<version>; bind the whole tree
	// so any file referenced from it resolves.
	if entries, err := os.ReadDir("/etc"); err == nil {
		for _, entry := range entries {
			if entry.IsDir() && strings.HasPrefix(entry.Name(), "java-") {
				add(filepath.Join("/etc", entry.Name()))
			}
		}
	}

	binds := make([]string, 0, len(set))
	for dir := range set {
		binds = append(binds, dir)
	}
	sort.Strings(binds)
	return binds
}

func isExecutable(path string) bool {
	info, err := os.Stat(path)
	return err == nil && !info.IsDir() && info.Mode()&0o111 != 0
}

func commandVersion(path string) string {
	return commandOutput(path, "-version")
}

func commandOutput(path string, args ...string) string {
	cmd := exec.Command(path, args...)
	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &out
	if err := cmd.Run(); err != nil {
		return ""
	}
	line, _, _ := strings.Cut(strings.TrimSpace(out.String()), "\n")
	return strings.TrimSpace(line)
}

// probeBwrap runs `java -version` inside the full sandbox to prove that the
// kernel allows the namespaces and that the JDK is reachable through the
// read-only binds. If the bwrap version does not understand --size for
// tmpfs, retry without it and remember.
func (s *sandbox) probeBwrap() error {
	dir, err := os.MkdirTemp("", "runner-probe-")
	if err != nil {
		return err
	}
	defer os.RemoveAll(dir)

	probe := func() error {
		argv := s.wrap([]string{s.javaPath, "-version"}, dir, true, 10)
		result := runWithLimits(argv, dir, s.baseEnv(), 15*time.Second)
		if result.startErr != nil {
			return result.startErr
		}
		if result.exitCode != 0 {
			return fmt.Errorf("probe exited %d: %s", result.exitCode, strings.TrimSpace(result.stderr))
		}
		return nil
	}

	s.tmpfsSize = true
	if err := probe(); err == nil {
		return nil
	}
	s.tmpfsSize = false
	return probe()
}

// wrap turns argv into the fully sandboxed command line.
func (s *sandbox) wrap(argv []string, workdir string, writableWork bool, cpuSeconds int) []string {
	if s.mode != modeBwrap {
		if s.prlimitPath != "" {
			return append(s.prlimitArgs(cpuSeconds), argv...)
		}
		return argv
	}

	args := []string{
		s.bwrapPath,
		"--die-with-parent",
		"--unshare-all",
		"--new-session",
		"--hostname", "sandbox",
		"--proc", "/proc",
		"--dev", "/dev",
		"--ro-bind", "/usr", "/usr",
		"--ro-bind-try", "/lib", "/lib",
		"--ro-bind-try", "/lib64", "/lib64",
		"--ro-bind-try", "/etc/ld.so.cache", "/etc/ld.so.cache",
		"--ro-bind-try", "/etc/ld.so.conf", "/etc/ld.so.conf",
		"--ro-bind-try", "/etc/ld.so.conf.d", "/etc/ld.so.conf.d",
		"--ro-bind-try", "/etc/localtime", "/etc/localtime",
	}
	if s.javaHome != "" && !strings.HasPrefix(s.javaHome, "/usr/") {
		args = append(args, "--ro-bind", s.javaHome, s.javaHome)
	}
	for _, dir := range s.extraBinds {
		args = append(args, "--ro-bind-try", dir, dir)
	}
	// Mount the scratch tmpfs first, then bind the work directory to a fixed
	// internal path. Binding to a fixed path (rather than the host path, which
	// may live under /tmp) keeps the work dir from being shadowed by the
	// tmpfs and hides the host's real layout from user code.
	if s.tmpfsSize {
		args = append(args, "--size", "33554432")
	}
	args = append(args, "--tmpfs", "/tmp")
	bindMode := "--ro-bind"
	if writableWork {
		bindMode = "--bind"
	}
	args = append(args, bindMode, workdir, sandboxWorkdir, "--chdir", sandboxWorkdir)
	args = append(args,
		"--clearenv",
		"--setenv", "PATH", "/usr/bin:/bin",
		"--setenv", "HOME", "/tmp",
		"--setenv", "LANG", "C.UTF-8",
	)
	if s.javaHome != "" {
		args = append(args, "--setenv", "JAVA_HOME", s.javaHome)
	}
	// bubblewrap's new root is a writable tmpfs by default; remount it
	// read-only so a submission cannot fill memory by writing stray files to
	// /. The /tmp tmpfs and the work-dir bind are separate mounts and stay
	// writable. --remount-ro is applied last so it only affects the root.
	args = append(args, "--remount-ro", "/")
	args = append(args, "--")
	if s.prlimitPath != "" {
		args = append(args, s.prlimitArgs(cpuSeconds)...)
	}
	return append(args, argv...)
}

func (s *sandbox) prlimitArgs(cpuSeconds int) []string {
	return []string{
		s.prlimitPath,
		"--nproc=256",
		"--nofile=512",
		"--fsize=8388608",
		"--core=0",
		fmt.Sprintf("--cpu=%d", cpuSeconds),
		"--",
	}
}

// baseEnv is the environment for the outer process (bwrap itself in bwrap
// mode; javac/java directly in none mode). Deliberately minimal: the
// service's own environment (auth token included) must never leak in.
func (s *sandbox) baseEnv() []string {
	env := []string{"PATH=/usr/bin:/bin:/usr/local/bin", "LANG=C.UTF-8"}
	if s.javaHome != "" {
		env = append(env, "JAVA_HOME="+s.javaHome)
	}
	return env
}

// compile runs javac over the harness files inside the sandbox.
func (s *sandbox) compile(files []string, workdir string, timeout time.Duration) execResult {
	argv := []string{
		s.javacPath,
		"-J-XX:TieredStopAtLevel=1",
		"-J-XX:-UsePerfData",
		"-encoding", "UTF-8",
	}
	argv = append(argv, files...)
	cpuSeconds := int(timeout/time.Second) + 5
	return runWithLimits(s.wrap(argv, workdir, true, cpuSeconds), workdir, s.baseEnv(), timeout)
}

// runTests executes the compiled TestRunner inside the sandbox. The work
// directory is mounted read-only: compiled classes only need to be read.
func (s *sandbox) runTests(workdir string, timeout time.Duration) execResult {
	argv := []string{
		s.javaPath,
		"-XX:TieredStopAtLevel=1",
		"-XX:+UseSerialGC",
		"-XX:-UsePerfData",
		"-XX:MaxMetaspaceSize=96m",
		"-Xmx128m",
		"-Xss4m",
		"-Djava.awt.headless=true",
		"-cp", ".",
		"TestRunner",
	}
	cpuSeconds := int(timeout/time.Second) + 3
	return runWithLimits(s.wrap(argv, workdir, false, cpuSeconds), workdir, s.baseEnv(), timeout)
}

// runPythonTests executes TestRunner.py inside the sandbox. -I isolates Python
// from user site config and -B prevents writes to __pycache__ in read-only mode.
func (s *sandbox) runPythonTests(workdir string, timeout time.Duration) execResult {
	argv := []string{
		s.pythonPath,
		"-I",
		"-B",
		"TestRunner.py",
	}
	cpuSeconds := int(timeout/time.Second) + 3
	return runWithLimits(s.wrap(argv, workdir, false, cpuSeconds), workdir, s.baseEnv(), timeout)
}

// cappedBuffer keeps the first limit bytes, counts the rest, and triggers
// kill once total output passes hardOutputLimit.
type cappedBuffer struct {
	mu       sync.Mutex
	buf      bytes.Buffer
	total    int64
	overflow func()
	fired    bool
}

func (c *cappedBuffer) Write(p []byte) (int, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.total += int64(len(p))
	if remaining := maxCapturedOutput - c.buf.Len(); remaining > 0 {
		if len(p) > remaining {
			c.buf.Write(p[:remaining])
		} else {
			c.buf.Write(p)
		}
	}
	if c.total > hardOutputLimit && !c.fired && c.overflow != nil {
		c.fired = true
		go c.overflow()
	}
	return len(p), nil
}

func (c *cappedBuffer) snapshot() (string, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.buf.String(), c.total > int64(c.buf.Len())
}

// runWithLimits starts argv in its own process group, enforces the
// wall-clock timeout, and reliably kills the whole group (which, with
// bubblewrap's pid namespace, takes the entire process tree with it).
func runWithLimits(argv []string, workdir string, env []string, timeout time.Duration) execResult {
	cmd := exec.Command(argv[0], argv[1:]...)
	cmd.Dir = workdir
	cmd.Env = env
	cmd.SysProcAttr = sandboxProcAttr()
	cmd.Stdin = nil

	var timedOut bool
	var mu sync.Mutex
	stdout := &cappedBuffer{}
	stderr := &cappedBuffer{}
	cmd.Stdout = stdout
	cmd.Stderr = stderr

	if err := cmd.Start(); err != nil {
		return execResult{exitCode: -1, startErr: err}
	}

	kill := func(markTimeout bool) {
		mu.Lock()
		if markTimeout {
			timedOut = true
		}
		mu.Unlock()
		killProcessGroup(cmd)
	}
	stdout.overflow = func() { kill(false) }
	stderr.overflow = func() { kill(false) }

	timer := time.AfterFunc(timeout, func() { kill(true) })
	err := cmd.Wait()
	timer.Stop()

	exitCode := 0
	if err != nil {
		exitCode = cmd.ProcessState.ExitCode()
		if exitCode == 0 {
			exitCode = -1
		}
	}

	outStr, outTrunc := stdout.snapshot()
	errStr, errTrunc := stderr.snapshot()
	mu.Lock()
	defer mu.Unlock()
	return execResult{
		exitCode:  exitCode,
		stdout:    outStr,
		stderr:    errStr,
		timedOut:  timedOut,
		truncated: outTrunc || errTrunc,
	}
}
