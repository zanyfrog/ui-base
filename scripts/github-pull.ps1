param(
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

Invoke-Git fetch $Remote

$upstream = ""
try {
  $upstream = (& git rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2>$null)
} catch {
  $upstream = ""
}

if (-not [string]::IsNullOrWhiteSpace($upstream)) {
  Invoke-Git pull --rebase --autostash
  exit 0
}

$remoteBranch = "$Remote/$Branch"
& git rev-parse --verify --quiet $remoteBranch | Out-Null
if ($LASTEXITCODE -eq 0) {
  Invoke-Git branch --set-upstream-to=$remoteBranch $Branch
  Invoke-Git pull --rebase --autostash
  exit 0
}

Write-Host "No remote branch found for $remoteBranch. Nothing to pull."
