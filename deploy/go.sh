#!/usr/bin/env bash
# Tezfix — one-time GitHub Actions runner bootstrap (Linux)
# Token valid 1h. Regenerate at: Settings → Actions → Runners → New runner
set -euo pipefail

RUNNER_TOKEN="${RUNNER_TOKEN:-BC5MAP7JJ6WRJ7GMLGLDBXDJ32TH6}"
RUNNER_VERSION="2.333.1"
RUNNER_DIR="$HOME/actions-runner"
REPO_URL="https://github.com/umar200000/tezfix"
RUNNER_NAME="tezfix-prod"
RUNNER_LABELS="self-hosted,linux,tezfix"

echo "--- GitHub Actions Runner bootstrap ---"

# Remove old installation if present
if [ -d "$RUNNER_DIR" ]; then
  echo "Removing old runner dir..."
  if [ -f "$RUNNER_DIR/svc.sh" ]; then
    cd "$RUNNER_DIR"
    sudo ./svc.sh stop  2>/dev/null || true
    sudo ./svc.sh uninstall 2>/dev/null || true
    cd "$HOME"
  fi
  rm -rf "$RUNNER_DIR"
fi

mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

# Download
echo "Downloading runner v$RUNNER_VERSION..."
curl -sL \
  "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz" \
  -o runner.tar.gz

tar xzf runner.tar.gz
rm runner.tar.gz

# Configure (unattended, replace existing)
echo "Configuring runner..."
./config.sh \
  --url "$REPO_URL" \
  --token "$RUNNER_TOKEN" \
  --name "$RUNNER_NAME" \
  --labels "$RUNNER_LABELS" \
  --unattended \
  --replace

# Install as systemd service
echo "Installing systemd service..."
sudo ./svc.sh install olim
sudo ./svc.sh start

sleep 3
sudo ./svc.sh status

echo "Runner installed and started ✓"
