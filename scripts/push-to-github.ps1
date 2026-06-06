# Push project to GitHub (thiva9646)
# Run in PowerShell from project root:
#   .\scripts\push-to-github.ps1

param(
    [string]$RepoName = "ecommerce-microservices"
)

$GitHubUser = "thiva9646"
$Remote = "https://github.com/$GitHubUser/$RepoName.git"
$Root = Split-Path -Parent $PSScriptRoot

Set-Location $Root

Write-Host "=== Push to $Remote ===" -ForegroundColor Cyan

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Git is not installed. Install from https://git-scm.com/download/win" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path .git)) {
    git init
    git branch -M main
}

git add .
git status

git commit -m "E-commerce microservices: API gateway, services, frontend, Docker, K8s"

if (git remote get-url origin 2>$null) {
    git remote set-url origin $Remote
} else {
    git remote add origin $Remote
}

Write-Host ""
Write-Host "Pushing to GitHub..."
Write-Host "Username: $GitHubUser"
Write-Host "Password: use your Personal Access Token (ghp_...), NOT your GitHub login password"
Write-Host ""

git push -u origin main

Write-Host ""
Write-Host "Done! Clone on Linux:" -ForegroundColor Green
Write-Host "  git clone $Remote"
