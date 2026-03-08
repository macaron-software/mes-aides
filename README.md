# Mes Aides — Simulateur d'aides sociales

Simulateur gratuit, open-source et 100% confidentiel des aides sociales françaises.
Couvre 28+ aides officielles (RSA, APL, prime d'activité, AAH…) avec les barèmes 2026.

**Aucune donnée personnelle collectée, transmise ou stockée.**

## Architecture — tout local

```
┌─────────────────────────────────────────────────────────┐
│  Navigateur / Appareil mobile                           │
│                                                         │
│  Saisie utilisateur → Moteur de calcul embarqué         │
│                     → Résultats affichés localement     │
│                                                         │
│  Rien ne sort de l'appareil.                            │
└─────────────────────────────────────────────────────────┘
```

- `core/` — Moteur Rust : règles d'éligibilité, 28+ aides, barèmes 2026 embarqués
- `web/` — HTML/CSS/JS vanilla, zéro framework, moteur JS embarqué
- `ios/` — SwiftUI + `LocalEngine.swift` (moteur natif Swift, barèmes embarqués)
- `android/` — Kotlin + `LocalEngine` (moteur natif Kotlin, barèmes embarqués)
- `infra/` — Config nginx (fichiers statiques uniquement)

**Pas de backend. Pas d'API. Pas de base de données.**

## Confidentialité & RGPD

| Donnée | Traitement |
|--------|-----------|
| Situation personnelle (âge, revenus, logement…) | Calculée **dans le navigateur/l'app**, jamais transmise |
| Résultats de simulation | Affichés en mémoire, jamais sauvegardés |
| Données analytiques | **Aucune** — pas de tracker, pas d'analytics |
| Préférence de langue / thème | Stockée localement sur l'appareil (localStorage), jamais transmise |
| Identifiants | Aucun — l'application ne crée pas de compte |

### Conformité
- **RGPD** : aucun traitement de données à caractère personnel → aucune obligation de consentement, pas de DPO requis
- **Pas de cookies** (sauf préférences UI purement locales)
- **Pas de tiers** : zéro SDK analytics, zéro CDN externe, zéro police externe
- **CSP stricte** : `script-src 'self'`, `connect-src 'self'` — impossible de contacter un serveur tiers
- **Open source** : le code est auditables par tous

## Requêtes réseau

La seule requête réseau de l'application est le chargement des **fichiers de traduction** (`/locales/fr.json`, etc.) depuis le **même serveur** que le site. Aucune donnée utilisateur n'est incluse dans cette requête.

## Lancer en local

```bash
# Web (serveur statique simple)
cd web && python3 -m http.server 8000
# → http://localhost:8000
```

## Déploiement (statique)

```bash
# Copier web/ sur n'importe quel hébergeur statique (nginx, Caddy, GitHub Pages…)
rsync -avz web/ user@server:/var/www/aides/

# Nginx minimal
server {
    listen 443 ssl;
    server_name aides.example.com;
    root /var/www/aides;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}
```

## Moteur de calcul

Les barèmes sont embarqués dans le code (mis à jour manuellement à chaque revalorisation) :

| Aide | Barème 2026 |
|------|-------------|
| RSA (personne seule) | 635,71 €/mois |
| APL (zone 1) | jusqu'à 380 €/mois |
| Prime d'activité | jusqu'à 354 €/mois |
| AAH | 1 016,85 €/mois |
| Chèque énergie | 200–277 €/an |

## Tests

```bash
cargo test -p aides-core   # tests unitaires moteur Rust
```

## Licence

MIT — contributions bienvenues.

