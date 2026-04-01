# push-to-github.ps1
# Run from project root in Windows PowerShell
Set-StrictMode -Version Latest
$repoUrl = 'https://github.com/450gowsik/Shana-sites.git'
Push-Location $PSScriptRoot

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "git not found in PATH. Install Git and rerun this script."
  Pop-Location
  exit 1
}

if (-not (Test-Path -Path ".git")) {
  git init
  git checkout -b main
}

# Make sure messages.json and other ignored files are not committed
git add .

try {
  git commit -m "Deploy Shana site"
} catch {
  Write-Host "No changes to commit or commit failed (maybe already up-to-date)."
}

# Replace origin if exists
git remote remove origin -ErrorAction SilentlyContinue
git remote add origin $repoUrl

Write-Host "Pushing to $repoUrl ... You may be prompted for GitHub credentials or PAT."

$push = git push -u origin main
if ($LASTEXITCODE -ne 0) {
  Write-Error "Push failed. Check remote URL, authentication, and that the repository exists on GitHub."
  Pop-Location
  exit 1
}

Write-Host "Push complete. Visit: https://github.com/450gowsik/Shana-sites"
Pop-Location
