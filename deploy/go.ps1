# One-time runner bootstrap — token expires in 1 h, file deleted after use
$ErrorActionPreference = "Stop"
$token  = "BC5MAPYIEYGJWSM6YOEWKQLJ3VG42"
$runnerVersion = "2.333.1"
$runnerDir = "C:\actions-runner"
$repoUrl   = "https://github.com/umar200000/tezfix"
$name      = "tezfix-prod"
$labels    = "self-hosted,windows,tezfix"

Write-Host "=== Tezfix runner install ===" -ForegroundColor Cyan

# Remove previous install if any
$svc = "actions.runner.umar200000-tezfix.$name"
if (Get-Service $svc -ErrorAction SilentlyContinue) {
    Stop-Service $svc -Force -ErrorAction SilentlyContinue
    Push-Location $runnerDir
    & .\svc.cmd uninstall | Out-Null
    Pop-Location
}
if (Test-Path $runnerDir) { Remove-Item -Recurse -Force $runnerDir }
New-Item -ItemType Directory -Force $runnerDir | Out-Null

# Download
$zip = "$runnerDir\runner.zip"
Write-Host "Downloading v$runnerVersion..."
Invoke-WebRequest -Uri "https://github.com/actions/runner/releases/download/v$runnerVersion/actions-runner-win-x64-$runnerVersion.zip" -OutFile $zip

# Extract
Write-Host "Extracting..."
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($zip, $runnerDir)
Remove-Item $zip

# Configure
Write-Host "Configuring..."
Push-Location $runnerDir
& .\config.cmd --url $repoUrl --token $token --name $name --labels $labels --unattended --replace

# Install as service
Write-Host "Installing service..."
& .\svc.cmd install
Start-Service $svc

$status = (Get-Service $svc).Status
Write-Host "Service: $status" -ForegroundColor Green
Pop-Location

Write-Host "=== Done! ===" -ForegroundColor Green
