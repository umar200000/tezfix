# Tezfix — per-push deploy. Invoked by the GitHub Actions self-hosted runner
# (see .github/workflows/deploy.yml) and by bootstrap.ps1 for the first run.

[CmdletBinding()]
param(
    [string]$InstallDir = "C:\tezfix",
    [switch]$FirstRun
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Write-Step($msg) { Write-Host "`n---> $msg" -ForegroundColor Cyan }

Set-Location $InstallDir

# Ensure tools are in PATH even in fresh shells / service contexts
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
# Runner service runs as LocalSystem — also add Administrator's npm global bin
foreach ($u in @("Administrator", $env:USERNAME, "SYSTEM")) {
    $p = "C:\Users\$u\AppData\Roaming\npm"
    if ((Test-Path $p) -and ($env:Path -notlike "*$p*")) { $env:Path += ";$p" }
}

New-Item -ItemType Directory -Force -Path (Join-Path $InstallDir "logs") | Out-Null

Write-Step "Stop API (release file locks before npm ci)"
try { pm2 stop tezfix-api 2>$null } catch { Write-Warning "pm2 stop skipped: $_" }

Write-Step "Install dependencies (workspaces)"
npm ci --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw "npm ci failed" }

Write-Step "Prisma client + db push (SQLite)"
Push-Location (Join-Path $InstallDir "apps\api")
npx prisma generate
npx prisma db push --skip-generate
Pop-Location

Write-Step "Build API"
npm run build -w apps/api
if ($LASTEXITCODE -ne 0) { throw "API build failed" }

Write-Step "Build web"
npm run build -w apps/web
if ($LASTEXITCODE -ne 0) { throw "web build failed" }

Write-Step "Build admin"
npm run build -w apps/admin
if ($LASTEXITCODE -ne 0) { throw "admin build failed" }

Write-Step "Seed DB (first run only)"
if ($FirstRun) {
    try {
        npm run db:seed -w apps/api
    } catch {
        Write-Warning "Seed skipped/failed: $_"
    }
}

Write-Step "PM2 reload API"
$ecosystem = Join-Path $InstallDir "deploy\ecosystem.config.cjs"
$pm2List = & pm2 jlist 2>$null
if ($pm2List -and ($pm2List | Select-String -Pattern '"name":"tezfix-api"' -Quiet)) {
    pm2 reload $ecosystem --update-env
} else {
    pm2 start $ecosystem
}
pm2 save

Write-Step "Restart Caddy (pick up new static files)"
Restart-Service Caddy -ErrorAction SilentlyContinue

Write-Step "Health check"
Start-Sleep -Seconds 3
try {
    $r = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -TimeoutSec 10
    Write-Host "API health: $($r | ConvertTo-Json -Compress)" -ForegroundColor Green
} catch {
    Write-Warning "Health check failed: $_"
    pm2 logs tezfix-api --lines 50 --nostream
    throw
}

Write-Host "`nDeploy complete." -ForegroundColor Green
