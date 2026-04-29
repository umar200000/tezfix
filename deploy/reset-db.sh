#!/usr/bin/env bash
# Tezfix — wipe and reinitialize the production database.
# WARNING: deletes all users, services, leads, favorites, banners, quick services.
# Categories will be re-seeded.
#
# Usage:  bash /opt/tezfix/deploy/reset-db.sh
set -euo pipefail

INSTALL_DIR="/opt/tezfix"

read -p "Bu prod DB ni butunlay tozalaydi. Davom etilsinmi? (yes/no) " confirm
if [[ "$confirm" != "yes" ]]; then
  echo "Bekor qilindi."
  exit 0
fi

cd "$INSTALL_DIR"

echo "==> Stop API"
pm2 stop tezfix-api 2>/dev/null || true

echo "==> Wipe database files"
cd apps/api
rm -f prisma/dev.db prisma/dev.db-journal
rm -f /opt/tezfix/data/prod.db /opt/tezfix/data/prod.db-journal 2>/dev/null || true

echo "==> Re-create schema"
npx prisma db push --skip-generate

echo "==> Re-seed categories"
npm run db:seed 2>/dev/null || true

echo "==> Start API"
cd "$INSTALL_DIR"
pm2 start "$INSTALL_DIR/deploy/ecosystem.config.cjs" || pm2 restart tezfix-api
pm2 save

echo "==> Done."
