# Tezfix — one-time server bootstrap for Windows Server 2025.
# Run as Administrator from elevated PowerShell on the server:
#   Set-ExecutionPolicy -Scope Process Bypass -Force
#   .\bootstrap.ps1 -RunnerToken "<token-from-github>"
#
# Get RunnerToken from:
#   https://github.com/umar200000/tezfix/settings/actions/runners/new
#   (under the `./config.cmd --url ... --token XXXX` line)

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$RunnerToken,

    [string]$RepoUrl = "https://github.com/umar200000/tezfix.git",
    [string]$InstallDir = "C:\tezfix",
    [string]$RunnerDir = "C:\actions-runner"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Write-Step($msg) { Write-Host "`n===> $msg" -ForegroundColor Cyan }

Write-Step "1/10 Chocolatey"
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
}

Write-Step "2/10 Core tools (Node LTS, Git, Caddy, NSSM)"
choco install -y nodejs-lts git caddy nssm --no-progress
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Write-Step "3/10 PM2 (global)"
npm install -g pm2 pm2-windows-startup
pm2-startup install

Write-Step "4/10 Firewall (80, 443)"
@(
    @{ Name = "Tezfix-HTTP";  Port = 80  },
    @{ Name = "Tezfix-HTTPS"; Port = 443 }
) | ForEach-Object {
    if (-not (Get-NetFirewallRule -DisplayName $_.Name -ErrorAction SilentlyContinue)) {
        New-NetFirewallRule -DisplayName $_.Name -Direction Inbound -Protocol TCP -LocalPort $_.Port -Action Allow | Out-Null
    }
}

Write-Step "5/10 Clone repo to $InstallDir"
if (-not (Test-Path $InstallDir)) {
    git clone $RepoUrl $InstallDir
} else {
    Push-Location $InstallDir
    git fetch --all
    git reset --hard origin/main
    Pop-Location
}

Write-Step "6/10 API .env"
$envPath = Join-Path $InstallDir "apps\api\.env"
if (-not (Test-Path $envPath)) {
    $jwt = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 48 | ForEach-Object { [char]$_ })
    @"
NODE_ENV=production
PORT=3000
DATABASE_URL=file:./dev.db
JWT_SECRET=$jwt
"@ | Set-Content -Path $envPath -Encoding UTF8
}

Write-Step "7/10 Install Caddy as Windows service"
$caddyfile = Join-Path $InstallDir "deploy\Caddyfile"
$caddyExe = (Get-Command caddy).Source
$caddyDataDir = "C:\ProgramData\caddy"
New-Item -ItemType Directory -Force -Path $caddyDataDir | Out-Null
if (-not (Get-Service -Name Caddy -ErrorAction SilentlyContinue)) {
    nssm install Caddy $caddyExe "run --config `"$caddyfile`" --adapter caddyfile"
    nssm set Caddy AppDirectory $caddyDataDir
    nssm set Caddy AppEnvironmentExtra "CADDY_DATA_DIR=$caddyDataDir"
    nssm set Caddy Start SERVICE_AUTO_START
    nssm set Caddy AppStdout "$caddyDataDir\caddy.out.log"
    nssm set Caddy AppStderr "$caddyDataDir\caddy.err.log"
}
Start-Service Caddy -ErrorAction SilentlyContinue

Write-Step "8/10 First build + PM2 start"
Push-Location $InstallDir
& (Join-Path $InstallDir "deploy\deploy.ps1") -FirstRun
Pop-Location

Write-Step "9/10 GitHub Actions self-hosted runner"
if (-not (Test-Path $RunnerDir)) {
    New-Item -ItemType Directory -Force -Path $RunnerDir | Out-Null
    Push-Location $RunnerDir

    $runnerVersion = "2.320.0"
    $runnerZip = "actions-runner-win-x64-$runnerVersion.zip"
    $runnerUrl = "https://github.com/actions/runner/releases/download/v$runnerVersion/$runnerZip"
    Invoke-WebRequest -Uri $runnerUrl -OutFile $runnerZip
    Expand-Archive -Path $runnerZip -DestinationPath .
    Remove-Item $runnerZip

    $runnerRepoUrl = $RepoUrl -replace "\.git$", ""
    .\config.cmd --url $runnerRepoUrl --token $RunnerToken --name "tezfix-prod" --labels "self-hosted,windows,tezfix" --unattended --runasservice --replace
    Pop-Location
}

Write-Step "10/10 Done"
Write-Host ""
Write-Host "Server ready." -ForegroundColor Green
Write-Host "  Web:   http://46.8.176.235/"
Write-Host "  Admin: http://46.8.176.235/admin/"
Write-Host "  API:   http://46.8.176.235/api/health"
Write-Host ""
Write-Host "CI/CD: push to 'main' on GitHub -> runner deploys automatically."
