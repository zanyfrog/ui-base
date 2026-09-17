param(
  [string]$Message = "",
  [string]$Remote = "origin",
  [string]$Branch = "",
  [switch]$SkipCheck
)

$ErrorActionPreference = "Stop"

function Invoke-Git {
  param(
    [string]$Command,
    [string[]]$ArgumentList = @()
  )

  & git $Command $ArgumentList
  if ($LASTEXITCODE -ne 0) {
    throw "git $Command $($ArgumentList -join ' ') failed with exit code $LASTEXITCODE."
  }
}

function Invoke-Npm {
  param(
    [string]$Command,
    [string[]]$ArgumentList = @()
  )

  & npm $Command $ArgumentList
  if ($LASTEXITCODE -ne 0) {
    throw "npm $Command $($ArgumentList -join ' ') failed with exit code $LASTEXITCODE."
  }
}

$repoRoot = (& git rev-parse --show-toplevel 2>$null)
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($repoRoot)) {
  throw "This script must be run from inside a Git repository."
}

Set-Location $repoRoot

if ([string]::IsNullOrWhiteSpace($Branch)) {
  $Branch = (& git branch --show-current).Trim()
}

if ([string]::IsNullOrWhiteSpace($Branch)) {
  throw "Could not determine the current branch. Pass -Branch explicitly."
}

Invoke-Git -Command 'diff' -ArgumentList @('--check')

if (-not $SkipCheck) {
  Invoke-Npm -Command 'run' -ArgumentList @('check')
}

Invoke-Git -Command 'status' -ArgumentList @('--short')
Invoke-Git -Command 'add' -ArgumentList @('-A')

$stagedChanges = (& git diff --cached --name-only).Trim()
if (-not [string]::IsNullOrWhiteSpace($stagedChanges)) {
  if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = "Update UI Base workspace"
  }
  Invoke-Git -Command 'commit' -ArgumentList @('-m', $Message)
} else {
  Write-Host "No staged changes to commit."
}

$upstream = ""
try {
  $upstream = (& git rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2>$null)
} catch {
  $upstream = ""
}

if (-not [string]::IsNullOrWhiteSpace($upstream)) {
  Invoke-Git -Command 'push'
} else {
  Invoke-Git -Command 'push' -ArgumentList @('-u', $Remote, $Branch)
}

Invoke-Git -Command 'status' -ArgumentList @('--short', '--branch')
