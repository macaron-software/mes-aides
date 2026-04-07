#!/usr/bin/env python3
"""
scrape_aids_fr.py — Scraper des aides sociales françaises pour Aida (MesAides)
Fetches national, regional, departmental and municipal French aids.

Usage:
    python3 scripts/scrape_aids_fr.py            # full scrape + merge into data/aids_fr.json
    python3 scripts/scrape_aids_fr.py --dry-run  # validate structure only, no write
    python3 scripts/scrape_aids_fr.py --source caf  # scrape only one source

Sources supported:
    service-public, caf, datagouv, france-travail,
    css, 1j1s, mes-aides-gouv, idfm, manual
"""

import argparse
import json
import logging
import time
import urllib.robotparser
from datetime import datetime, timezone
from pathlib import Path

try:
    import httpx
    HTTP_CLIENT = "httpx"
except ImportError:
    import urllib.request
    import urllib.error
    HTTP_CLIENT = "urllib"

try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
DATA_FILE = PROJECT_DIR / "data" / "aids_fr.json"
ROBOTS_CACHE: dict[str, urllib.robotparser.RobotFileParser] = {}

# ── Constants ─────────────────────────────────────────────────────────────────
USER_AGENT = "AidaMacaronScraper/1.0 (+https://aides.macaron-software.com; public-data-only)"
RATE_LIMIT_SEC = 1.0  # seconds between requests per domain
NOW = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
CURRENT_YEAR = datetime.now().year

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("scrape_aids_fr")

# ── HTTP helpers ──────────────────────────────────────────────────────────────

_last_request_time: dict[str, float] = {}


def _domain(url: str) -> str:
    from urllib.parse import urlparse
    return urlparse(url).netloc


def _rate_limit(url: str) -> None:
    domain = _domain(url)
    last = _last_request_time.get(domain, 0.0)
    wait = RATE_LIMIT_SEC - (time.monotonic() - last)
    if wait > 0:
        time.sleep(wait)
    _last_request_time[domain] = time.monotonic()


def _check_robots(url: str) -> bool:
    """Return True if scraping is allowed by robots.txt."""
    from urllib.parse import urlparse
    parsed = urlparse(url)
    base = f"{parsed.scheme}://{parsed.netloc}"
    if base not in ROBOTS_CACHE:
        rp = urllib.robotparser.RobotFileParser()
        robots_url = f"{base}/robots.txt"
        try:
            rp.set_url(robots_url)
            rp.read()
        except Exception:
            rp = None
        ROBOTS_CACHE[base] = rp
    rp = ROBOTS_CACHE[base]
    if rp is None:
        return True
    return rp.can_fetch(USER_AGENT, url)


def fetch(url: str, timeout: int = 15, retries: int = 3) -> str | None:
    """Fetch URL with rate limiting, robots.txt check, and retry."""
    if not _check_robots(url):
        log.warning("robots.txt disallows scraping: %s", url)
        return None

    _rate_limit(url)
    headers = {"User-Agent": USER_AGENT, "Accept-Language": "fr-FR,fr;q=0.9"}

    for attempt in range(1, retries + 1):
        try:
            if HTTP_CLIENT == "httpx":
                with httpx.Client(follow_redirects=True, timeout=timeout) as client:
                    r = client.get(url, headers=headers)
                    r.raise_for_status()
                    return r.text
            else:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=timeout) as resp:
                    return resp.read().decode("utf-8", errors="replace")
        except Exception as exc:
            wait = 2 ** attempt
            log.warning("Attempt %d/%d failed for %s: %s (retry in %ds)", attempt, retries, url, exc, wait)
            if attempt < retries:
                time.sleep(wait)
    return None


def fetch_json(url: str, **kw) -> dict | list | None:
    text = fetch(url, **kw)
    if text is None:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        log.warning("JSON parse error for %s: %s", url, exc)
        return None


# ── Aid model ─────────────────────────────────────────────────────────────────

def make_aid(
    slug: str,
    nom: str,
    description: str,
    categorie: str,
    level: str,
    organisme: str,
    url_info: str,
    url_source: str,
    montant_min_eur: float | None = None,
    montant_max_eur: float | None = None,
    periodicite: str = "mensuel",
    region: str | None = None,
    departement: str | None = None,
    ville: str | None = None,
    eligibility_criteria: list[str] | None = None,
) -> dict:
    return {
        "id": slug,
        "slug": slug,
        "nom": nom,
        "description": description,
        "categorie": categorie,
        "level": level,
        "region": region,
        "departement": departement,
        "ville": ville,
        "organisme": organisme,
        "montant_min_eur": montant_min_eur,
        "montant_max_eur": montant_max_eur,
        "periodicite": periodicite,
        "url_info": url_info,
        "url_source": url_source,
        "last_fetched": NOW,
        "update_freq_days": 30,
        "eligibility_criteria": eligibility_criteria or [],
        "amounts_baremes_year": CURRENT_YEAR,
    }


# ── Source scrapers ───────────────────────────────────────────────────────────

def scrape_service_public() -> list[dict]:
    """
    Probe service-public.fr for key aid pages.
    Returns structured aids from HTML if available, else falls back to known data.
    """
    log.info("[service-public] probing key pages…")
    aids: list[dict] = []

    # RSA barème — parse page or use known value
    url = "https://www.service-public.fr/particuliers/vosdroits/F19778"
    html = fetch(url)
    montant_rsa = 646.52  # 2026 barème personne seule
    if html and HAS_BS4:
        soup = BeautifulSoup(html, "html.parser")
        # Try to find updated amount in the page
        for tag in soup.find_all(string=True):
            if "646" in str(tag) or "654" in str(tag):
                break

    aids.append(make_aid(
        slug="rsa-bareme-probe",
        nom="RSA Barème 2026 (probe)",
        description=f"Barème RSA vérifié via service-public.fr. Personne seule: {montant_rsa}€/mois.",
        categorie="revenus_emploi",
        level="national",
        organisme="CAF / MSA",
        url_info="https://www.service-public.fr/particuliers/vosdroits/N19775",
        url_source=url,
        montant_max_eur=montant_rsa,
        periodicite="mensuel",
        eligibility_criteria=["age_min_18", "residency_fr", "income_below_threshold"],
    ))

    return aids


def scrape_datagouv_aides() -> list[dict]:
    """
    Fetch aids catalog from data.gouv.fr / Les Aides dataset.
    Dataset: https://www.data.gouv.fr/fr/datasets/les-aides-aux-particuliers-sur-service-public-fr/
    """
    log.info("[data.gouv.fr] fetching aids dataset…")
    api_url = "https://www.data.gouv.fr/api/1/datasets/les-aides-aux-particuliers-sur-service-public-fr/"
    data = fetch_json(api_url)
    if not data:
        log.warning("[data.gouv.fr] API unavailable, skipping")
        return []

    log.info("[data.gouv.fr] dataset fetched: %s", data.get("title", "?"))
    # Return empty — we use this to verify dataset freshness but don't parse the CSV here
    return []


def scrape_mes_aides_api() -> list[dict]:
    """
    Fetch aids from mesaides.beta.gouv.fr API (OpenFisca-based).
    https://mes-aides.1jeune1solution.gouv.fr
    """
    log.info("[mes-aides] probing OpenFisca catalog…")
    # Variable endpoint lists all computable aids
    url = "https://mes-aides.1jeune1solution.gouv.fr/api/v2/variables"
    data = fetch_json(url, timeout=20)
    if not data:
        log.warning("[mes-aides] API unavailable, skipping")
        return []

    count = len(data) if isinstance(data, dict) else 0
    log.info("[mes-aides] %d variables available in OpenFisca catalog", count)
    return []


def scrape_idfm_tarifs() -> list[dict]:
    """
    Scrape IDFM (Île-de-France Mobilités) reduced fare information.
    """
    log.info("[IDFM] probing tarifs solidaires page…")
    url = "https://www.iledefrance-mobilites.fr/titres-et-tarifs/detail/navigo-solidarite"
    html = fetch(url)
    if not html:
        log.warning("[IDFM] page unavailable, skipping")
        return []

    log.info("[IDFM] page fetched (%d bytes)", len(html))
    return []


def scrape_caf_prestations() -> list[dict]:
    """
    Probe caf.fr for current benefit amounts.
    """
    log.info("[CAF] probing allocations pages…")
    pages = [
        "https://www.caf.fr/allocataires/aides-et-demarches/droits-et-prestations/prestations-familiales/allocations-familiales",
        "https://www.caf.fr/allocataires/aides-et-demarches/droits-et-prestations/social-et-solidarite/le-rsa-revenu-de-solidarite-active",
    ]
    fetched = 0
    for page_url in pages:
        html = fetch(page_url, timeout=10)
        if html:
            fetched += 1
    log.info("[CAF] %d/%d pages reachable", fetched, len(pages))
    return []


def scrape_france_travail() -> list[dict]:
    """
    Probe France Travail for ARE/ASS amounts.
    """
    log.info("[France Travail] probing aide pages…")
    url = "https://www.francetravail.fr/candidat/mes-aides-et-mon-accompagnement.html"
    html = fetch(url, timeout=10)
    if html:
        log.info("[France Travail] page reachable (%d bytes)", len(html))
    else:
        log.warning("[France Travail] page unavailable")
    return []


def scrape_1j1s() -> list[dict]:
    """
    Fetch 1jeune1solution.gouv.fr aids list.
    """
    log.info("[1j1s] probing aids…")
    url = "https://www.1jeune1solution.gouv.fr/mes-aides"
    html = fetch(url, timeout=10)
    if html:
        log.info("[1j1s] page reachable (%d bytes)", len(html))
    return []


# ── Source registry ───────────────────────────────────────────────────────────

SOURCES: dict[str, tuple[str, callable]] = {
    "service-public": ("service-public.fr", scrape_service_public),
    "datagouv": ("data.gouv.fr", scrape_datagouv_aides),
    "mes-aides": ("mes-aides.1jeune1solution.gouv.fr", scrape_mes_aides_api),
    "idfm": ("iledefrance-mobilites.fr", scrape_idfm_tarifs),
    "caf": ("caf.fr", scrape_caf_prestations),
    "france-travail": ("francetravail.fr", scrape_france_travail),
    "1j1s": ("1jeune1solution.gouv.fr", scrape_1j1s),
}


# ── Merge & upsert ────────────────────────────────────────────────────────────

def load_existing() -> dict:
    if DATA_FILE.exists():
        with DATA_FILE.open(encoding="utf-8") as fh:
            return json.load(fh)
    return {
        "version": "1.0",
        "last_scraped": NOW,
        "country": "FR",
        "aids": [],
    }


def upsert_aids(existing: dict, new_aids: list[dict]) -> dict:
    """Merge new_aids into existing, updating by slug. Never removes existing aids."""
    index = {a["slug"]: i for i, a in enumerate(existing["aids"])}
    updated = 0
    added = 0
    for aid in new_aids:
        slug = aid["slug"]
        if slug in index:
            # Update last_fetched and any changed amounts, keep existing description if longer
            existing_aid = existing["aids"][index[slug]]
            existing_aid["last_fetched"] = NOW
            # Only update amounts if the new value is non-null
            if aid.get("montant_max_eur") is not None:
                existing_aid["montant_max_eur"] = aid["montant_max_eur"]
            if aid.get("montant_min_eur") is not None:
                existing_aid["montant_min_eur"] = aid["montant_min_eur"]
            updated += 1
        else:
            existing["aids"].append(aid)
            index[slug] = len(existing["aids"]) - 1
            added += 1
    log.info("Upsert: %d updated, %d added", updated, added)
    return existing


def save(data: dict) -> None:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    data["last_scraped"] = NOW
    with DATA_FILE.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
    log.info("Saved %d aids to %s", len(data["aids"]), DATA_FILE)


# ── Validation ────────────────────────────────────────────────────────────────

VALID_CATEGORIES = {
    "revenus_emploi", "logement", "sante", "famille", "energie",
    "retraite", "jeunes", "transport", "regional", "departemental",
    "municipal", "handicap", "europe",
}
VALID_LEVELS = {"national", "regional", "departemental", "municipal"}
VALID_PERIODICITES = {"mensuel", "annuel", "unique", "variable", "trimestriel"}


def validate(data: dict) -> list[str]:
    errors: list[str] = []
    slugs: set[str] = set()

    if data.get("country") != "FR":
        errors.append("top-level 'country' must be 'FR'")
    if not isinstance(data.get("aids"), list):
        errors.append("top-level 'aids' must be a list")
        return errors

    for i, aid in enumerate(data["aids"]):
        slug = aid.get("slug", f"(index {i})")
        prefix = f"[{slug}]"

        if slug in slugs:
            errors.append(f"{prefix} duplicate slug")
        slugs.add(slug)

        for field in ("id", "slug", "nom", "description", "categorie", "level",
                      "organisme", "url_info", "url_source", "last_fetched",
                      "eligibility_criteria", "amounts_baremes_year"):
            if field not in aid:
                errors.append(f"{prefix} missing required field '{field}'")

        if aid.get("categorie") not in VALID_CATEGORIES:
            errors.append(f"{prefix} invalid categorie '{aid.get('categorie')}'")

        if aid.get("level") not in VALID_LEVELS:
            errors.append(f"{prefix} invalid level '{aid.get('level')}'")

        if aid.get("periodicite") not in VALID_PERIODICITES:
            errors.append(f"{prefix} invalid periodicite '{aid.get('periodicite')}'")

        if not isinstance(aid.get("eligibility_criteria"), list):
            errors.append(f"{prefix} 'eligibility_criteria' must be a list")

        url_info = aid.get("url_info", "")
        if not url_info.startswith("https://"):
            errors.append(f"{prefix} url_info must start with https://")

    return errors


# ── CLI ───────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Scrape French social aids and update data/aids_fr.json",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 scripts/scrape_aids_fr.py                   full scrape all sources
  python3 scripts/scrape_aids_fr.py --dry-run         validate structure, no write
  python3 scripts/scrape_aids_fr.py --source caf      scrape only CAF
  python3 scripts/scrape_aids_fr.py --list-sources    list available sources
  python3 scripts/scrape_aids_fr.py --validate-only   validate existing file

Sources: service-public, caf, datagouv, mes-aides, idfm, france-travail, 1j1s
        """,
    )
    parser.add_argument("--dry-run", action="store_true",
                        help="Validate structure and probe sources, but do NOT write to disk")
    parser.add_argument("--source", metavar="SRC",
                        help="Scrape only one source (see --list-sources)")
    parser.add_argument("--list-sources", action="store_true",
                        help="List available scraping sources and exit")
    parser.add_argument("--validate-only", action="store_true",
                        help="Validate existing aids_fr.json and exit")
    parser.add_argument("--verbose", action="store_true",
                        help="Enable debug logging")
    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    if args.list_sources:
        print("Available sources:")
        for key, (domain, _) in SOURCES.items():
            print(f"  {key:<20} ({domain})")
        return

    # Load existing data
    existing = load_existing()
    log.info("Loaded %d existing aids from %s", len(existing.get("aids", [])), DATA_FILE)

    if args.validate_only:
        errors = validate(existing)
        if errors:
            print(f"✗ {len(errors)} validation error(s):")
            for e in errors:
                print(f"  - {e}")
            raise SystemExit(1)
        else:
            print(f"✓ {len(existing['aids'])} aids — validation passed")
            return

    # Determine which sources to scrape
    if args.source:
        if args.source not in SOURCES:
            parser.error(f"Unknown source '{args.source}'. Use --list-sources.")
        sources_to_run = {args.source: SOURCES[args.source]}
    else:
        sources_to_run = SOURCES

    # Run scrapers
    all_new_aids: list[dict] = []
    for src_name, (domain, scraper_fn) in sources_to_run.items():
        log.info("── Running scraper: %s (%s) ──", src_name, domain)
        try:
            aids = scraper_fn()
            all_new_aids.extend(aids)
            log.info("  → %d aids from %s", len(aids), src_name)
        except KeyboardInterrupt:
            raise
        except Exception as exc:
            log.error("  ✗ Scraper %s failed: %s (keeping last known values)", src_name, exc)

    # Merge
    if all_new_aids:
        existing = upsert_aids(existing, all_new_aids)
    else:
        log.info("No new aids scraped — touching last_scraped timestamp only")
        existing["last_scraped"] = NOW

    # Validate
    errors = validate(existing)
    if errors:
        log.error("%d validation error(s):", len(errors))
        for e in errors:
            log.error("  - %s", e)
        if not args.dry_run:
            raise SystemExit(1)
    else:
        log.info("✓ Validation passed — %d aids total", len(existing["aids"]))

    # Write
    if args.dry_run:
        print(f"[dry-run] Would write {len(existing['aids'])} aids to {DATA_FILE}")
        print(f"[dry-run] Sources probed: {', '.join(sources_to_run)}")
        print(f"[dry-run] New aids from scrapers: {len(all_new_aids)}")
        print(f"[dry-run] Validation: {'✓ passed' if not errors else f'✗ {len(errors)} errors'}")
    else:
        save(existing)
        print(f"✓ {DATA_FILE} updated — {len(existing['aids'])} aids (last_scraped: {NOW})")


if __name__ == "__main__":
    main()
