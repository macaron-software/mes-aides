#!/usr/bin/env python3
"""
GSC Sitemap + URL Inspection API submission.

Setup:
  1. Go to https://console.cloud.google.com/
  2. Create service account → Download JSON key
  3. Go to GSC → Settings → Users and permissions → Add service account email
  4. Enable APIs: Search Console API, Web Search Indexing API
  5. export GOOGLE_SERVICE_ACCOUNT_JSON=$(base64 < service-account.json)
  6. export GSC_SITE_URL=https://aides.macaron-software.com/

Usage:
  python3 scripts/gsc_submit.py --sitemap
  python3 scripts/gsc_submit.py --urls web/sitemap.xml
  python3 scripts/gsc_submit.py --url https://aides.macaron-software.com/aides/rmi.html
"""
import os, sys, json, base64, re, argparse
import logging

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
log = logging.getLogger(__name__)

SITE_URL = os.environ.get('GSC_SITE_URL', 'https://aides.macaron-software.com/')
SITEMAP_URL = SITE_URL + 'sitemap.xml'

def get_credentials():
    sa_json_b64 = os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON')
    if not sa_json_b64:
        log.error("Set GOOGLE_SERVICE_ACCOUNT_JSON env var (base64-encoded service account JSON)")
        sys.exit(1)
    try:
        from google.oauth2 import service_account
        sa_info = json.loads(base64.b64decode(sa_json_b64))
        scopes = [
            'https://www.googleapis.com/auth/webmasters',
            'https://www.googleapis.com/auth/indexing',
        ]
        return service_account.Credentials.from_service_account_info(sa_info, scopes=scopes)
    except ImportError:
        log.error("Install: pip install google-auth google-api-python-client")
        sys.exit(1)

def submit_sitemap(creds):
    from googleapiclient.discovery import build
    service = build('searchconsole', 'v1', credentials=creds)
    service.sitemaps().submit(siteUrl=SITE_URL, feedpath=SITEMAP_URL).execute()
    log.info(f"Sitemap submitted: {SITEMAP_URL}")

def submit_urls(creds, urls):
    import httplib2
    from googleapiclient.discovery import build
    service = build('indexing', 'v3', credentials=creds)
    ok = 0
    for url in urls:
        try:
            service.urlNotifications().publish(body={"url": url, "type": "URL_UPDATED"}).execute()
            log.info(f"  ✅ {url}")
            ok += 1
        except Exception as e:
            log.warning(f"  ⚠️  {url}: {e}")
    log.info(f"Submitted {ok}/{len(urls)} URLs")

def parse_sitemap(path):
    with open(path) as f:
        return re.findall(r'<loc>([^<]+)</loc>', f.read())

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--sitemap', action='store_true', help='Submit sitemap to GSC')
    parser.add_argument('--urls', metavar='SITEMAP_FILE', help='Submit all URLs from sitemap file')
    parser.add_argument('--url', metavar='URL', help='Submit single URL')
    args = parser.parse_args()

    creds = get_credentials()
    if args.sitemap:
        submit_sitemap(creds)
    if args.urls:
        urls = parse_sitemap(args.urls)
        log.info(f"Submitting {len(urls)} URLs...")
        submit_urls(creds, urls[:200])  # GSC Indexing API: 200/day quota
    if args.url:
        submit_urls(creds, [args.url])

if __name__ == '__main__':
    main()
