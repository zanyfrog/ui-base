param(
  [string]$Message = "",
  [string]$Remote = "origin",
  [string]$Branch = ""
)

$ErrorActionPreference = "Stop"

function Invoke-Git {
  & git @args
  if ($LASTEXITCODE -ne 0) {
    throw "git $($args -join ' ') failed with exit code $LASTEXITCODE."
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

Invoke-Git status --short
Invoke-Git add -A

$stagedChanges = (& git diff --cached --name-only).Trim()
if (-not [string]::IsNullOrWhiteSpace($stagedChanges)) {
  if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = "Update UI Base workspace"
  }
  Invoke-Git commit -m $Message
} else {
  Write-Host "No staged changes to commit."
}

$upstream = (& git rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2>$null)
if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($upstream)) {
  Invoke-Git push
} else {
  Invoke-Git push -u $Remote $Branch
}
