param(
    [string]$AuthToken = $(if ($env:RUNNER_AUTH_TOKEN) { $env:RUNNER_AUTH_TOKEN } else { "devtoken" }),
    [string]$SandboxMode = $(if ($env:SANDBOX_MODE) { $env:SANDBOX_MODE } else { "none" }),
    [int]$Port = $(if ($env:PORT) { [int]$env:PORT } else { 8080 })
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptDir "..")
$RunnerDir = Join-Path $RepoRoot "runner"

if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
    Write-Error @"
Go is required to run the local Java runner, but 'go' was not found on your PATH.

Install Go, then open a new PowerShell window and run this script again.
Windows options:
  winget install GoLang.Go
  or download from https://go.dev/dl/

After installing, verify with:
  go version
"@
}

$env:RUNNER_AUTH_TOKEN = $AuthToken
$env:SANDBOX_MODE = $SandboxMode
$env:PORT = [string]$Port

Write-Host "Starting Java runner at http://localhost:$Port"
Write-Host "RUNNER_AUTH_TOKEN=$AuthToken SANDBOX_MODE=$SandboxMode"

Push-Location $RunnerDir
try {
    go run .
}
finally {
    Pop-Location
}
