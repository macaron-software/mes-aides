#!/bin/bash
# IndexNow bulk submission
# Usage: bash scripts/indexnow_submit.sh
# Requires: site verified in Bing Webmaster Tools at https://www.bing.com/webmasters

KEY="4ba931e18cac4d4bb62776afb3d529d3"
SITE="aides.macaron-software.com"

# Extract URLs from sitemap
URLS=$(python3 -c "
import re, json
with open('web/sitemap.xml') as f:
    urls = re.findall(r'<loc>([^<]+)</loc>', f.read())
print(json.dumps(urls[:200]))
")

PAYLOAD=$(python3 -c "
import json, sys
urls = $URLS
print(json.dumps({
    'host': '$SITE',
    'key': '$KEY',
    'keyLocation': 'https://$SITE/${KEY}.txt',
    'urlList': urls
}))
")

echo "Submitting $(echo $URLS | python3 -c 'import sys,json; print(len(json.load(sys.stdin)))') URLs..."

# Yandex (works immediately)
echo -n "Yandex: "
curl -s -X POST "https://yandex.com/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$PAYLOAD" -w "HTTP %{http_code}\n"

# Bing (requires Bing Webmaster Tools verification)
echo -n "Bing: "
curl -s -X POST "https://www.bing.com/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$PAYLOAD" -w "HTTP %{http_code}\n"

# api.indexnow.org (propagates to all)
echo -n "IndexNow: "
curl -s -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$PAYLOAD" -w "HTTP %{http_code}\n"
