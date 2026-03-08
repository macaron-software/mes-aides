#!/usr/bin/env bash
# Run this ONCE after DNS aides.macaron-software.com → 54.36.183.124 is propagated
set -euo pipefail
SSH="ssh -o IdentitiesOnly=yes -i ~/.ssh/id_ed25519 debian@54.36.183.124"
SCP="scp -o IdentitiesOnly=yes -i ~/.ssh/id_ed25519"

echo "[1] Checking DNS..."
if ! dig +short A aides.macaron-software.com | grep -q 54.36.183.124; then
  echo "DNS not yet pointing to VPS. Add A record: aides -> 54.36.183.124 in Porkbun."
  exit 1
fi
echo "DNS OK"

echo "[2] Issuing Let's Encrypt cert..."
$SSH "sudo certbot certonly --nginx -d aides.macaron-software.com \
  --non-interactive --agree-tos -m admin@macaron-software.com"

echo "[3] Installing HTTPS nginx config..."
$SCP infra/nginx/aides.conf debian@54.36.183.124:/tmp/aides-https.conf
$SSH "sudo cp /tmp/aides-https.conf /etc/nginx/sites-available/aides.macaron-software.com && \
  sudo nginx -t && sudo systemctl reload nginx"

echo "[4] Verifying..."
sleep 3
curl -s https://aides.macaron-software.com/api/health && echo
echo "Done — https://aides.macaron-software.com is live"
