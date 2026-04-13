# Tezfix — Server Deployment

Windows Server 2025 · Node.js LTS · SQLite · PM2 · Caddy · GitHub Actions (self-hosted)

## Topology

```
Internet
   |
   |  :80
   v
+--------------+      /api/* , /uploads/*       +------------------+
|    Caddy     | -------------------------------> |  Fastify API    |
|  (service)   |       reverse_proxy            |  :3000 via PM2  |
+--------------+                                +------------------+
   |  /admin/*  ->  C:\tezfix\apps\admin\dist
   |  /*        ->  C:\tezfix\apps\web\dist
```

## First-time setup (run once, on the server, via RDP)

1. RDP to `46.8.176.235` as `administrator`.
2. Open PowerShell **as Administrator**.
3. Get a runner registration token from:
   https://github.com/umar200000/tezfix/settings/actions/runners/new
   (copy the token from the `./config.cmd --url ... --token XXXX` line)
4. Run:
   ```powershell
   Set-ExecutionPolicy -Scope Process Bypass -Force
   iwr https://raw.githubusercontent.com/umar200000/tezfix/main/deploy/bootstrap.ps1 -OutFile C:\bootstrap.ps1
   C:\bootstrap.ps1 -RunnerToken "PASTE_TOKEN_HERE"
   ```

The script installs Node, Git, Caddy, PM2, the GitHub Actions runner,
clones the repo, builds, starts services, and registers the runner.

## CI/CD

On every push to `main`, `.github/workflows/deploy.yml` runs on the
self-hosted runner and invokes `deploy/deploy.ps1`, which:

1. `npm ci` (workspaces)
2. `prisma generate` + `prisma db push`
3. Builds api / web / admin
4. `pm2 reload tezfix-api`
5. Restarts Caddy (new static files)
6. Health-check on `/api/health`

## URLs

| Path | Served by |
|------|-----------|
| `http://46.8.176.235/`        | client SPA (apps/web) |
| `http://46.8.176.235/admin/`  | admin SPA (apps/admin) |
| `http://46.8.176.235/api/*`   | Fastify on :3000 |
| `http://46.8.176.235/uploads/*` | Fastify static uploads |

## Useful commands (on the server)

```powershell
pm2 status
pm2 logs tezfix-api
pm2 restart tezfix-api

Get-Service Caddy
Restart-Service Caddy
Get-Content C:\ProgramData\caddy\caddy.err.log -Tail 50

# Manual redeploy
C:\tezfix\deploy\deploy.ps1
```

## Adding HTTPS / a domain later

Edit `deploy/Caddyfile` — replace `:80` with `yourdomain.com` and remove
`auto_https off`. Caddy will obtain a Let's Encrypt cert automatically.
Also open firewall port 443 (already done by bootstrap).
