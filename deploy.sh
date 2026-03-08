#!/usr/bin/env bash
# deploy.sh — full deploy to OVH VPS
# Usage: ./deploy.sh [binary_path]
# Prereq: binary built at $1 (default: ./target/x86_64-unknown-linux-musl/release/aides-api)
set -euo pipefail

VPS="debian@54.36.183.124"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
BINARY="${1:-./target/x86_64-unknown-linux-musl/release/aides-api}"
REMOTE_DIR="/opt/aides-macaron"
WEB_DIR="/var/www/aides"

echo "[1/6] Checking binary..."
test -f "$BINARY" || { echo "ERROR: binary not found at $BINARY"; exit 1; }
file "$BINARY"

echo "[2/6] Uploading binary..."
ssh -i "$SSH_KEY" "$VPS" "sudo mkdir -p $REMOTE_DIR && sudo chown debian:debian $REMOTE_DIR"
scp -i "$SSH_KEY" "$BINARY" "$VPS:$REMOTE_DIR/aides-api"
ssh -i "$SSH_KEY" "$VPS" "chmod +x $REMOTE_DIR/aides-api"

echo "[3/6] Uploading web assets..."
ssh -i "$SSH_KEY" "$VPS" "sudo mkdir -p $WEB_DIR && sudo chown debian:debian $WEB_DIR"
rsync -az --delete -e "ssh -i $SSH_KEY" web/ "$VPS:$WEB_DIR/"

echo "[4/6] Installing nginx config..."
scp -i "$SSH_KEY" infra/nginx/aides.conf "$VPS:/tmp/aides.conf"
ssh -i "$SSH_KEY" "$VPS" "sudo cp /tmp/aides.conf /etc/nginx/sites-available/aides.macaron-software.com && \
  sudo ln -sf /etc/nginx/sites-available/aides.macaron-software.com /etc/nginx/sites-enabled/aides.macaron-software.com && \
  sudo nginx -t"

echo "[5/6] Installing systemd service..."
scp -i "$SSH_KEY" infra/systemd/aides-api.service "$VPS:/tmp/aides-api.service"
ssh -i "$SSH_KEY" "$VPS" "sudo cp /tmp/aides-api.service /etc/systemd/system/aides-api.service && \
  sudo systemctl daemon-reload && \
  sudo systemctl enable aides-api && \
  sudo systemctl restart aides-api"

echo "[6/6] Checking service + SSL..."
sleep 3
ssh -i "$SSH_KEY" "$VPS" "systemctl is-active aides-api && journalctl -u aides-api -n 10 --no-pager"

# Check SSL cert exists or issue one
ssh -i "$SSH_KEY" "$VPS" "
  if [ ! -f /etc/letsencrypt/live/aides.macaron-software.com/fullchain.pem ]; then
    echo 'Issuing Let\\''s Encrypt cert...'
    sudo certbot --nginx -d aides.macaron-software.com --non-interactive --agree-tos -m admin@macaron-software.com
  else
    echo 'SSL cert already present'
  fi
  sudo systemctl reload nginx
"

echo ""
echo "Done. Test: curl https://aides.macaron-software.com/api/health"
