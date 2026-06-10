//go:build linux

package main

import (
	"os/exec"
	"syscall"
)

func sandboxProcAttr() *syscall.SysProcAttr {
	return &syscall.SysProcAttr{
		Setpgid: true,
		// If the runner itself dies, take the sandboxed child with it.
		Pdeathsig: syscall.SIGKILL,
	}
}

// killProcessGroup SIGKILLs the child's process group. In bwrap mode the
// direct child is the pid-1 of a fresh pid namespace, so the kernel then
// reaps everything the submission spawned, no matter how it forked.
func killProcessGroup(cmd *exec.Cmd) {
	if cmd.Process == nil {
		return
	}
	syscall.Kill(-cmd.Process.Pid, syscall.SIGKILL)
	cmd.Process.Kill()
}
