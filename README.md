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

## Aides couvertes (71)

### Mises en oeuvre (barèmes 2026 calculés)

| # | Aide | Sigle |
|---|------|-------|
| 1 | Revenu de Solidarité Active | RSA |
| 2 | Prime d'Activité | — |
| 3 | Allocation de Solidarité Spécifique | ASS |
| 4 | Allocation de Retour à l'Emploi | ARE |
| 5 | Aide Personnalisée au Logement | APL |
| 6 | Allocation de Logement Sociale | ALS |
| 7 | Garantie Caution Locative | Visale |
| 8 | MaPrimeRénov' | — |
| 9 | Allocation aux Adultes Handicapés | AAH |
| 10 | Majoration Vie Autonome | MVA |
| 11 | Prestation de Compensation du Handicap | PCH |
| 12 | Allocation Éducation Enfant Handicapé | AEEH |
| 13 | Allocation Supplémentaire d'Invalidité | ASI |
| 14 | Pension d'Invalidité | — |
| 15 | Complémentaire Santé Solidaire | CSS |
| 16 | Allocations Familiales | AF |
| 17 | Complément Familial | CF |
| 18 | Prestation d'Accueil du Jeune Enfant | PAJE |
| 19 | Allocation de Soutien Familial | ASF |
| 20 | Allocation de Rentrée Scolaire | ARS |
| 21 | Chèque Énergie | — |
| 22 | Minimum Vieillesse | ASPA |
| 23 | Minimum Contributif Retraite | MICO |
| 24 | Contrat Engagement Jeune | CEJ |
| 25 | Bourse CROUS sur Critères Sociaux | — |
| 26 | Pass Culture | — |
| 27 | Prime de Noël RSA | — |
| 28 | Aide Juridictionnelle | AJ |

### Répertoriées (analyse et guide, calcul en cours d'intégration)

| # | Aide | Catégorie |
|---|------|-----------|
| 29 | Allocation de Logement Familiale | ALF | Logement |
| 30 | Fonds de Solidarité pour le Logement | FSL | Logement |
| 31 | Loca-Pass (avance caution) | — | Logement |
| 32 | APL Accession (accession à la propriété) | — | Logement |
| 33 | Prime Certificats d'Économies d'Énergie | CEE | Énergie |
| 34 | Tarif social gaz et électricité | — | Énergie |
| 35 | Prime à la conversion véhicule | — | Énergie |
| 36 | Bonus écologique | — | Énergie |
| 37 | Aide à la Création et Reprise d'Entreprise | ACRE | Emploi |
| 38 | Chèques Vacances ANCV | — | Emploi |
| 39 | Aide à la mobilité Pôle Emploi | — | Emploi |
| 40 | Aide au Retour à l'Emploi Formation | AREF | Emploi |
| 41 | Complément de Libre Choix du Mode de Garde | CLCMG | Famille |
| 42 | Prestation Partagée d'Éducation de l'Enfant | PreParE | Famille |
| 43 | Allocation Journalière de Présence Parentale | AJPP | Famille |
| 44 | Allocation Journalière du Proche Aidant | AJPA | Famille |
| 45 | Bourse collège et lycée sur critères sociaux | — | Famille |
| 46 | Aide au transport scolaire | — | Famille |
| 47 | Affection de Longue Durée 100% | ALD | Santé |
| 48 | Carte Mobilité Inclusion | CMI | Handicap |
| 49 | Reconnaissance Qualité Travailleur Handicapé | RQTH | Handicap |
| 50 | Aide audioprothèse 100% Santé | — | Santé |
| 51 | Protection Universelle Maladie | PUMa | Santé |
| 52 | Indemnités Journalières maladie et maternité | IJ | Santé |
| 53 | Allocation Personnalisée d'Autonomie | APA | Senior |
| 54 | Aide à domicile (SAAD) | — | Senior |
| 55 | Aide au Retour à Domicile après Hospitalisation | ARDH | Senior |
| 56 | Complément Mode de Garde | CMG | Famille |
| 57 | Aide au Poste en ESAT | — | Handicap |
| 58 | Bourse aide à la mobilité en Master | — | Jeunes |
| 59 | Aide au logement étudiant (CROUS) | — | Jeunes |
| 60 | Permis à 1 euro | — | Jeunes |
| 61 | Tarif social téléphone et internet | TPS | Divers |
| 62 | Micro-crédit social (FASTT) | — | Emploi |
| 63 | Garantie jeunes (fusionnée CEJ) | — | Jeunes |
| 64 | Aide différentielle ex-combattants | — | Divers |
| 65 | Aide aux victimes d'infractions | — | Justice |
| 66 | Caution solidaire Garantie Visale étudiant | — | Logement |
| 67 | Aide d'urgence CAF | — | Revenus |
| 68 | Fonds d'aide aux jeunes | FAJ | Jeunes |
| 69 | Revenu de Solidarité Outre-Mer | RSO | Revenus |
| 70 | Allocation Veuvage | AV | Famille |
| 71 | Allocation Équivalent Retraite | AER | Emploi |

## Tests

```bash
cargo test -p aides-core   # tests unitaires moteur Rust
```

## Licence

MIT — contributions bienvenues.

