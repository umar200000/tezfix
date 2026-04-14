#!/usr/bin/env bash
# Tezfix — one-time Debian 11 server bootstrap
# Run as: bash bootstrap.sh [RUNNER_TOKEN]
set -euo pipefail

RUNNER_TOKEN="${1:-}"
INSTALL_DIR="/opt/tezfix"
RUNNER_DIR="/home/olim/actions-runner"
REPO_URL="https://github.com/umar200000/tezfix"
RUNNER_VERSION="2.322.0"

log() { echo -e "\033[36m\n---> $*\033[0m"; }

# ── 1. System update ──────────────────────────────────────────────────────────
log "System update"
sudo apt-get update -qq
sudo apt-get install -y -qq curl git ca-certificates gnupg lsb-release unzip

# ── 2. Node.js 20 ─────────────────────────────────────────────────────────────
log "Install Node.js 20"
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - -qq
  sudo apt-get install -y -qq nodejs
fi
node -v && npm -v

# ── 3. PM2 ────────────────────────────────────────────────────────────────────
log "Install PM2"
sudo npm install -g pm2 --quiet

# ── 4. Caddy ──────────────────────────────────────────────────────────────────
log "Install Caddy"
if ! command -v caddy &>/dev/null; then
  sudo apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | sudo tee /etc/apt/sources.list.d/caddy-stable.list
  sudo apt-get update -qq
  sudo apt-get install -y -qq caddy
fi
caddy version

# ── 5. Firewall ───────────────────────────────────────────────────────────────
log "Open ports 80 and 443"
sudo ufw allow 80/tcp  2>/dev/null || true
sudo ufw allow 443/tcp 2>/dev/null || true
sudo ufw allow 22/tcp  2>/dev/null || true

# ── 6. Clone / update repo ────────────────────────────────────────────────────
log "Clone repo → $INSTALL_DIR"
if [ -d "$INSTALL_DIR/.git" ]; then
  cd "$INSTALL_DIR" && sudo git pull origin main
else
  sudo git clone "$REPO_URL" "$INSTALL_DIR"
fi
sudo chown -R olim:olim "$INSTALL_DIR"
sudo chmod -R u+rwX "$INSTALL_DIR"

# ── 7. .env setup ─────────────────────────────────────────────────────────────
log "Create .env (if missing)"
ENV_FILE="$INSTALL_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  JWT_SECRET=$(openssl rand -hex 32)
  cat > "$ENV_FILE" <<EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=file:/opt/tezfix/data/prod.db
JWT_SECRET=$JWT_SECRET
EOF
fi
sudo mkdir -p /opt/tezfix/data
sudo chown -R olim:olim /opt/tezfix/data

# ── 8. Caddy config ───────────────────────────────────────────────────────────
log "Configure Caddy"
sudo cp "$INSTALL_DIR/deploy/Caddyfile" /etc/caddy/Caddyfile
# Grant caddy read access to web roots
sudo chmod -R a+rX "$INSTALL_DIR/apps" 2>/dev/null || true
sudo systemctl enable caddy
sudo systemctl restart caddy

# ── 9. First deploy ───────────────────────────────────────────────────────────
log "First deploy"
bash "$INSTALL_DIR/deploy/deploy.sh" --first-run

# ── 10. PM2 startup (systemd) ─────────────────────────────────────────────────
log "PM2 systemd startup"
sudo env PATH="$PATH:/usr/bin" pm2 startup systemd -u olim --hp /home/olim | tail -1 | bash || true
pm2 save

# ── 11. GitHub Actions runner ─────────────────────────────────────────────────
log "Install GitHub Actions runner"
if [ -n "$RUNNER_TOKEN" ]; then
  RUNNER_TOKEN="$RUNNER_TOKEN" bash "$INSTALL_DIR/deploy/go.sh"
else
  echo "⚠  No RUNNER_TOKEN provided — skipping runner install."
  echo "   Run later:  RUNNER_TOKEN=<token> bash $INSTALL_DIR/deploy/go.sh"
fi

log "Bootstrap complete! ✓"
echo "  Web:   http://46.8.176.235"
echo "  API:   http://46.8.176.235/api/health"
echo "  Admin: http://46.8.176.235/admin"
