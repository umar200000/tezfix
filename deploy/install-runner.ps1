# Tezfix — GitHub Actions self-hosted runner installer (run as Administrator on server)
param(
    [Parameter(Mandatory=$true)]
    [string]$RunnerToken
)

$ErrorActionPreference = "Stop"
$RunnerDir = "C:\actions-runner"
$RunnerVersion = "2.333.1"
$RepoUrl = "https://github.com/umar200000/tezfix"
$RunnerName = "tezfix-prod"
$Labels = "self-hosted,windows,tezfix"

Write-Host "=== GitHub Actions Runner Install ===" -ForegroundColor Cyan

# Stop+remove old service if exists
$svcName = "actions.runner.umar200000-tezfix.$RunnerName"
if (Get-Service -Name $svcName -ErrorAction SilentlyContinue) {
    Write-Host "Removing old runner service..."
    Stop-Service -Name $svcName -Force -ErrorAction SilentlyContinue
    Start-Process -FilePath "$RunnerDir\svc.cmd" -ArgumentList "uninstall" -WorkingDirectory $RunnerDir -Wait -NoNewWindow -ErrorAction SilentlyContinue
}

# Remove old dir
if (Test-Path $RunnerDir) {
    Remove-Item -Recurse -Force $RunnerDir
}
New-Item -ItemType Directory -Force -Path $RunnerDir | Out-Null
Push-Location $RunnerDir

Write-Host "Downloading runner v$RunnerVersion..."
$zip = "$RunnerDir\runner.zip"
Invoke-WebRequest `
    -Uri "https://github.com/actions/runner/releases/download/v$RunnerVersion/actions-runner-win-x64-$RunnerVersion.zip" `
    -OutFile $zip

Write-Host "Extracting..."
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($zip, $RunnerDir)
Remove-Item $zip

Write-Host "Configuring runner..."
& "$RunnerDir\config.cmd" `
    --url $RepoUrl `
    --token $RunnerToken `
    --name $RunnerName `
    --labels $Labels `
    --unattended `
    --replace

Write-Host "Installing as Windows service..."
& "$RunnerDir\svc.cmd" install
Start-Service -Name $svcName

$svc = Get-Service -Name $svcName
Write-Host "Service status: $($svc.Status)" -ForegroundColor Green

Pop-Location
Write-Host "=== Runner installed and running! ===" -ForegroundColor Green
