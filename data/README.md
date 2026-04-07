# data/ — Aida MesAides Data Directory

Structured JSON data for the French social aids catalog powering [aides.macaron-software.com](https://aides.macaron-software.com).

## Files

| File | Description |
|------|-------------|
| `aids_fr.json` | Main catalog — 71 French aids (national + regional + departmental + municipal + transport) |
| `update.log` | Timestamped log of each daily cron run that detected data changes |

---

## Data Format — `aids_fr.json`

```json
{
  "version": "1.0",
  "last_scraped": "2026-04-07T20:00:00Z",
  "country": "FR",
  "aids": [
    {
      "id": "rsa",
      "slug": "rsa",
      "nom": "RSA — Revenu de Solidarité Active",
      "description": "...",
      "categorie": "revenus_emploi",
      "level": "national",
      "region": null,
      "departement": null,
      "ville": null,
      "organisme": "CAF / MSA",
      "montant_min_eur": 0,
      "montant_max_eur": 646.52,
      "periodicite": "mensuel",
      "url_info": "https://www.service-public.fr/...",
      "url_source": "https://...",
      "last_fetched": "2026-04-07T20:00:00Z",
      "update_freq_days": 30,
      "eligibility_criteria": ["age_min_18", "residency_fr", "income_below_threshold"],
      "amounts_baremes_year": 2026
    }
  ]
}
```

### Field reference

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Same as `slug` — unique identifier |
| `slug` | string | URL-friendly unique key (kebab-case) |
| `nom` | string | Official French name |
| `description` | string | Plain-language description (French) |
| `categorie` | enum | Category — see below |
| `level` | enum | `national` \| `regional` \| `departemental` \| `municipal` |
| `region` | string\|null | Region name (ISO French region) or null |
| `departement` | string\|null | Department name or null |
| `ville` | string\|null | City name or null |
| `organisme` | string | Paying body (CAF, MSA, Département, etc.) |
| `montant_min_eur` | number\|null | Minimum monthly amount in EUR (null = non-monetary) |
| `montant_max_eur` | number\|null | Maximum monthly amount in EUR |
| `periodicite` | enum | `mensuel` \| `annuel` \| `unique` \| `variable` \| `trimestriel` |
| `url_info` | string | Official information page URL |
| `url_source` | string | URL scraped to get/verify this data |
| `last_fetched` | ISO 8601 | Last time this aid was fetched/verified |
| `update_freq_days` | int | Recommended re-fetch frequency in days |
| `eligibility_criteria` | string[] | Machine-readable eligibility tags |
| `amounts_baremes_year` | int | Year of the amounts (barème) |

### Categories

| Value | Label |
|-------|-------|
| `revenus_emploi` | Revenus & emploi (RSA, Prime activité, ARE, ASS, CEJ) |
| `logement` | Logement (APL, ALS, FSL, Visale, MaPrimeRénov) |
| `sante` | Santé (CSS, ALD, PCH, AAH, AEEH) |
| `famille` | Famille (AF, CF, PAJE, ASF, ARS) |
| `energie` | Énergie (Chèque énergie, CEE) |
| `retraite` | Retraite (ASPA, MICO, AGSS) |
| `jeunes` | Jeunes (Bourse CROUS, CEJ, 1j1s, Pass Culture) |
| `transport` | Transport (Navigo solidarité, TCL, Tisséo, SNCF Solidarité, TER) |
| `regional` | Aides régionales |
| `departemental` | Aides départementales |
| `municipal` | Aides communales / villes |
| `handicap` | Handicap (AAH, PCH, AEEH, MVA, MDPH) |
| `europe` | Fonds européens (FEDER, FSE) |

---

## Aid coverage — 71 aids

### National (28 — barèmes 2026)
RSA · Prime d'activité · ASS · ARE · APL · ALS · Visale · MaPrimeRénov' · AAH · MVA · PCH · AEEH · ASI · Pension invalidité · CSS · Allocations familiales · Complément familial · PAJE · ASF · ARS · Chèque énergie · ASPA · MICO · CEJ · Bourse CROUS · Pass Culture · Prime de Noël · Aide juridictionnelle

### New national/departemental (9)
FSL · SIAO · APA · MaPrimeAdapt' · ARIPA pension alimentaire · Micro-crédit ADIE · Prêt d'honneur BpiFrance · ARDH · Chèque-Vacances ANCV · 100% Santé audioprothèses

### Transport (8)
Navigo Solidarité · Navigo Imagine'R · TCL réduit · Tisséo 50% · SNCF Solidarité · TER Occitanie · TER Bretagne · TER PACA

### Municipal (11)
Paris Émeraude · Paris Familles Nombreuses · Lyon Carte Familles · Marseille aide sociale · Bordeaux aide vélo · Toulouse Pass Mobilité · Nantes Métropole Pass · Strasbourg aide logement · Lille Métropole aides · Rennes aides famille · Grenoble transport gratuit

### Regional (13 — toutes régions métropolitaines)
IDF RSA majoré · IDF Chèque Formation · AURA apprentissage · Occitanie voiture électrique · BFC aide étudiants · Hauts-de-France jeunes · Nouvelle-Aquitaine chèque formation · Bretagne logement étudiant · Pays de la Loire mobilité · Normandie insertion · PACA logement jeunes · Centre-Val de Loire carte blanche · Corse logement · Grand Est apprentissage

---

## Update process

### Manual update
```bash
cd /path/to/aides-macaron
python3 scripts/scrape_aids_fr.py
```

### Dry run (no write)
```bash
python3 scripts/scrape_aids_fr.py --dry-run
```

### Validate existing file
```bash
python3 scripts/scrape_aids_fr.py --validate-only
```

### Scrape single source
```bash
python3 scripts/scrape_aids_fr.py --source caf
python3 scripts/scrape_aids_fr.py --list-sources
```

### Automated daily cron
```cron
# Run at 03:00 every day
0 3 * * * cd /home/deploy/aides-macaron && bash scripts/cron_update.sh >> /var/log/aides-macaron.log 2>&1
```

---

## Sources

| Source | Priority | Type | URL |
|--------|----------|------|-----|
| service-public.fr | 1 | HTML scrape | https://www.service-public.fr |
| data.gouv.fr | 1 | API | https://www.data.gouv.fr/api/1/ |
| mes-aides.1jeune1solution.gouv.fr | 1 | OpenFisca API | https://mes-aides.1jeune1solution.gouv.fr/api/v2/ |
| caf.fr | 1 | HTML scrape | https://www.caf.fr |
| France Travail | 1 | HTML scrape | https://www.francetravail.fr |
| 1jeune1solution.gouv.fr | 2 | HTML scrape | https://www.1jeune1solution.gouv.fr |
| IDFM | 2 | HTML scrape | https://www.iledefrance-mobilites.fr |
| Regional sites | 3 | HTML scrape | per region |
| City CCAS sites | 3 | HTML scrape | per city |

---

## Privacy

- **No PII collected** — only public program data (amounts, eligibility criteria, URLs)
- All amounts are public barème from official government sources
- No user data stored in this directory
- Compliant with RGPD Article 6(1)(e) — public interest task

---

## Barèmes year

All amounts reflect **2026 barèmes** (revalorisation applicable depuis le 1er janvier 2026).  
Source: [service-public.fr](https://www.service-public.fr) + Official Journal (JORF).
