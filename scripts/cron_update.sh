#!/bin/bash
# cron_update.sh — Daily cron job: update FR aids data + log changes
#
# Crontab entry (run at 03:00 every day):
#   0 3 * * * /path/to/aides-macaron/scripts/cron_update.sh >> /var/log/aides-macaron-cron.log 2>&1
#
# Or with project-relative path:
#   0 3 * * * cd /home/deploy/aides-macaron && bash scripts/cron_update.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$PROJECT_DIR/data"
LOG_FILE="$DATA_DIR/update.log"
PYTHON="${PYTHON:-python3}"

echo "── $(date -u '+%Y-%m-%dT%H:%M:%SZ') cron_update.sh start ──"

# Ensure data directory exists
mkdir -p "$DATA_DIR"

# Check that aids_fr.json exists, create minimal seed if missing
if [ ! -f "$DATA_DIR/aids_fr.json" ]; then
    echo "WARN: aids_fr.json not found — creating empty seed"
    echo '{"version":"1.0","last_scraped":"1970-01-01T00:00:00Z","country":"FR","aids":[]}' \
        > "$DATA_DIR/aids_fr.json"
fi

# Take a snapshot of the data before scraping (for diff)
cp "$DATA_DIR/aids_fr.json" "$DATA_DIR/aids_fr.json.prev" 2>/dev/null || true

# Run the scraper
cd "$PROJECT_DIR"
"$PYTHON" scripts/scrape_aids_fr.py

# Check if data changed
if git diff --quiet "$DATA_DIR/" 2>/dev/null; then
    echo "INFO: no data change detected"
else
    CHANGED_AT="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
    echo "UPDATED: $CHANGED_AT" >> "$LOG_FILE"
    echo "INFO: data changed — logged to $LOG_FILE"

    # Optional: commit the updated data
    if [ "${AUTO_COMMIT:-0}" = "1" ]; then
        git add "$DATA_DIR/aids_fr.json"
        git commit -m "data(aida): auto-update aids_fr.json [$CHANGED_AT]

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
        echo "INFO: committed data update"
    fi
fi

# Cleanup previous snapshot
rm -f "$DATA_DIR/aids_fr.json.prev"

echo "── $(date -u '+%Y-%m-%dT%H:%M:%SZ') cron_update.sh done ──"
