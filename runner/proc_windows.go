//go:build windows

package main

import (
	"os/exec"
	"syscall"
)

func sandboxProcAttr() *syscall.SysProcAttr {
	return nil
}

func killProcessGroup(cmd *exec.Cmd) {
	if cmd.Process == nil {
		return
	}
	cmd.Process.Kill()
}
