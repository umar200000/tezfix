#!/usr/bin/env bash
# Tezfix — per-push deploy. Called by GitHub Actions runner and bootstrap.sh.
set -euo pipefail

INSTALL_DIR="/opt/tezfix"
FIRST_RUN=false

for arg in "$@"; do
  [[ "$arg" == "--first-run" ]] && FIRST_RUN=true
done

log() { echo -e "\033[36m\n---> $*\033[0m"; }

# ── PATH: ensure node/npm/pm2 are always found ────────────────────────────────
export PATH="/usr/local/bin:/usr/bin:/bin:$HOME/.npm-global/bin:$(npm root -g 2>/dev/null)/.bin:$(npm config get prefix 2>/dev/null)/bin:$PATH"

cd "$INSTALL_DIR"

# ── 1. Stop API (release Prisma native bindings) ─────────────────────────────
log "Stop API"
pm2 stop tezfix-api 2>/dev/null || true

# ── 2. Install dependencies ───────────────────────────────────────────────────
log "npm ci"
npm ci --no-audit --no-fund

# ── 3. Prisma ─────────────────────────────────────────────────────────────────
log "Prisma generate + db push"
mkdir -p /opt/tezfix/data
cd apps/api
npx prisma generate
npx prisma db push --skip-generate
cd "$INSTALL_DIR"

# ── 4. Builds ─────────────────────────────────────────────────────────────────
log "Build API"
npm run build -w apps/api

log "Build web"
npm run build -w apps/web

log "Build admin"
npm run build -w apps/admin

# Grant Caddy read access to fresh dist folders
sudo chmod -R a+rX "$INSTALL_DIR/apps/web/dist"   2>/dev/null || true
sudo chmod -R a+rX "$INSTALL_DIR/apps/admin/dist" 2>/dev/null || true

# ── 5. Seed (first run only) ──────────────────────────────────────────────────
if $FIRST_RUN; then
  log "Seed DB"
  npm run db:seed -w apps/api 2>/dev/null || echo "Seed skipped/failed — continuing"
fi

# ── 6. PM2 reload ─────────────────────────────────────────────────────────────
log "PM2 reload"
ECOSYSTEM="$INSTALL_DIR/deploy/ecosystem.config.cjs"
if pm2 jlist 2>/dev/null | grep -q '"name":"tezfix-api"'; then
  pm2 reload "$ECOSYSTEM" --update-env
else
  pm2 start "$ECOSYSTEM"
fi
pm2 save

# ── 7. Caddy reload ───────────────────────────────────────────────────────────
log "Caddy reload"
sudo systemctl reload caddy 2>/dev/null || sudo systemctl restart caddy 2>/dev/null || true

# ── 8. Health check ───────────────────────────────────────────────────────────
log "Health check"
sleep 3
HEALTH=$(curl -sf "http://localhost:3000/api/health" 2>/dev/null || echo '{"status":"error"}')
echo "API health: $HEALTH"
if [[ "$HEALTH" != *'"ok"'* ]]; then
  pm2 logs tezfix-api --lines 50 --nostream || true
  exit 1
fi

echo -e "\n\033[32mDeploy complete ✓\033[0m"
