# Mes Aides — API Reference

## Base URL

| Env | URL |
|-----|-----|
| Production | https://api.aides.macaron-software.com |
| Local | http://localhost:3001 |

## Endpoints

### GET /api/health
```json
{ "status": "ok", "version": "0.1.0", "baremes": "2026-01" }
```

### POST /api/simulate
Simulate eligibility. Returns aids sorted by monthly amt desc.

**Request:**
```json
{
  "age": 35,
  "revenus_mensuels": 800,
  "composition_familiale": "seul",
  "logement": { "type_logement": "locataire", "loyer_mensuel": 600, "zone_apl": "zone2" },
  "departement": "75"
}
```

**Response:**
```json
{
  "aides_eligibles": [{ "aide_id": "rsa", "nom": "...", "montant_mensuel": 435.52, "raisons": [...] }],
  "aides_ineligibles": [...],
  "total_mensuel": 736.27,
  "total_annuel": 8835.24
}
```

### GET /api/aides
List all 71 aids with defs.

### GET /api/datagouv/baremes
Current baremes from datagouv MCP (TTL 24h).

### POST /api/pdf
Generate PDF summary of simulation results.

## Error Response (400)
```json
{ "error": "Invalid input", "details": "age must be between 0 and 120" }
```

## Rate Limits
| Tier | Limit |
|------|-------|
| No API key | 100 req/min |
| With API key | 1000 req/min |

## Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: <unix_ts>
Accept-Encoding: gzip
```
