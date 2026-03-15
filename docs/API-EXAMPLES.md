# API Examples

## Base URL

```
Production: https://api.aides.macaron-software.com
Local:      http://localhost:3001
```

## Health Check

```bash
curl https://api.aides.macaron-software.com/api/health
```

Response:
```json
{
  "status": "ok",
  "version": "0.1.0",
  "baremes": "2026-01"
}
```

## Simulate Eligibility

### Basic — Single Person

```bash
curl -X POST https://api.aides.macaron-software.com/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "revenus_mensuels": 800,
    "composition_familiale": "seul",
    "logement": {
      "type_logement": "locataire",
      "loyer_mensuel": 600,
      "zone_apl": "zone2"
    },
    "departement": "75"
  }'
```

Response:
```json
{
  "aides_eligibles": [
    {
      "aide_id": "rsa",
      "nom": "Revenu de Solidarité Active",
      "montant_mensuel": 435.52,
      "periodicite": "mensuel",
      "raisons": ["Revenus < plafond RSA", "Résidence en France"],
      "url_demande": "https://www.caf.fr/allocataires/mes-demarches/demander-le-rsa"
    },
    {
      "aide_id": "apl",
      "nom": "Aide Personnalisée au Logement",
      "montant_mensuel": 285.00,
      "periodicite": "mensuel",
      "raisons": ["Locataire", "Revenus < plafond APL zone 2"],
      "url_demande": "https://www.caf.fr/allocataires/mes-demarches/demander-une-aide-au-logement"
    },
    {
      "aide_id": "cheque_energie",
      "nom": "Chèque Énergie",
      "montant_mensuel": 15.75,
      "periodicite": "annuel (lissé)",
      "raisons": ["RFR < plafond"],
      "url_demande": "https://www.chequeenergie.gouv.fr/"
    }
  ],
  "total_mensuel": 736.27
}
```

### Family with Children

```bash
curl -X POST https://api.aides.macaron-software.com/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "age": 42,
    "revenus_mensuels": 1500,
    "composition_familiale": "couple",
    "nombre_enfants": 2,
    "ages_enfants": [8, 12],
    "logement": {
      "type_logement": "locataire",
      "loyer_mensuel": 900,
      "zone_apl": "zone2"
    },
    "departement": "69"
  }'
```

### Person with Disability

```bash
curl -X POST https://api.aides.macaron-software.com/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "age": 45,
    "revenus_mensuels": 400,
    "composition_familiale": "seul",
    "handicap_taux": 80,
    "logement": {
      "type_logement": "locataire",
      "loyer_mensuel": 500,
      "zone_apl": "zone3"
    },
    "departement": "33"
  }'
```

### Young Job Seeker

```bash
curl -X POST https://api.aides.macaron-software.com/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "age": 22,
    "revenus_mensuels": 0,
    "composition_familiale": "seul",
    "demandeur_emploi": true,
    "logement": {
      "type_logement": "heberge"
    },
    "departement": "13"
  }'
```

## List All Aids

```bash
curl https://api.aides.macaron-software.com/api/aides
```

Response (truncated):
```json
[
  {
    "id": "rsa",
    "slug": "rsa",
    "nom": "Revenu de Solidarité Active",
    "description": "Revenu minimum pour les personnes sans ressources",
    "categorie": "minima_sociaux",
    "montant_min": 635.71,
    "montant_max": 1431.76,
    "periodicite": "mensuel",
    "organisme": "CAF",
    "url_info": "https://www.service-public.fr/particuliers/vosdroits/N19775"
  },
  {
    "id": "apl",
    "slug": "apl",
    "nom": "Aide Personnalisée au Logement",
    "description": "Aide pour réduire le montant du loyer",
    "categorie": "logement",
    "montant_min": null,
    "montant_max": 600.15,
    "periodicite": "mensuel",
    "organisme": "CAF",
    "url_info": "https://www.service-public.fr/particuliers/vosdroits/F12006"
  }
  // ... 69 more aids
]
```

## Get Current Barèmes

```bash
curl https://api.aides.macaron-software.com/api/datagouv/baremes
```

Response:
```json
{
  "source": "datagouv-mcp",
  "baremes": {
    "version": "2026-01",
    "rsa_base": 646.52,
    "rsa_couple": 969.78,
    "aah_montant_max": 1033.32,
    "prime_activite_forfait": 633.21,
    "smic_net_mensuel": 1398.69,
    "aspa_seul": 1043.59,
    "aspa_couple": 1620.18,
    "apl_zone1_1p": 600.15,
    "apl_zone2_1p": 508.13,
    "apl_zone3_1p": 462.32,
    "updated_at": "2026-01-01"
  }
}
```

## Generate PDF Report

```bash
curl -X POST https://api.aides.macaron-software.com/api/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "revenus_mensuels": 800,
    "composition_familiale": "seul",
    "logement": {
      "type_logement": "locataire",
      "loyer_mensuel": 600,
      "zone_apl": "zone2"
    }
  }' \
  --output mes-aides.pdf
```

## Error Handling

### Invalid Input

```bash
curl -X POST https://api.aides.macaron-software.com/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"age": -5}'
```

Response (400):
```json
{
  "error": "Invalid input",
  "details": "age must be between 0 and 120"
}
```

## Rate Limits

- Without API key: 100 requests/minute
- With API key: 1000 requests/minute

Headers returned:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1709913600
```

## Compression

The API supports gzip compression. Add the header:

```bash
curl -H "Accept-Encoding: gzip" ...
```

## CORS

CORS is enabled for all origins in development. In production, set `CORS_ORIGIN` environment variable.
