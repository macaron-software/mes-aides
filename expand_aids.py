import json

BASE = "/Users/sylvain/_LIFE_ECOSYSTEM/_HELP/aides-macaron/data"

# ── GERMANY ──────────────────────────────────────────────────────────────────
de = json.load(open(f"{BASE}/aids_de.json"))
de["last_updated"] = "2026-04-01"
de["aids"] += [
    {
        "id": "de-grundsicherung-alter",
        "slug": "grundsicherung-alter",
        "nom": "Grundsicherung im Alter",
        "description_en": "Pension top-up (means-tested) for elderly or permanently reduced earning capacity persons.",
        "categorie": "retraite",
        "organisme": "Sozialamt",
        "montant_min_eur": 0,
        "montant_max_eur": 813,
        "periodicite": "mensuel",
        "url_info": "https://www.bmas.de/DE/Soziales/Rente-und-Altersvorsorge/Alterssicherung/Grundsicherung/grundsicherung.html",
        "eligibility_criteria": ["residence_de", "age_65_or_permanently_reduced_capacity", "income_below_threshold"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "de-pflegegeld-pg2",
        "slug": "pflegegeld-pflegegrad-2",
        "nom": "Pflegegeld (Pflegegrad 2)",
        "description_en": "Home care allowance for care level 2, paid to the care recipient to compensate informal carers.",
        "categorie": "sante",
        "organisme": "Pflegekasse",
        "montant_min_eur": 332,
        "montant_max_eur": 332,
        "periodicite": "mensuel",
        "url_info": "https://www.bundesgesundheitsministerium.de/themen/pflege/pflegegeld.html",
        "eligibility_criteria": ["residence_de", "care_level_2", "home_care"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "de-elterngeld",
        "slug": "elterngeld",
        "nom": "Elterngeld",
        "description_en": "Parental allowance, 65-67% of net income for up to 14 months after birth.",
        "categorie": "famille",
        "organisme": "Elterngeldstelle",
        "montant_min_eur": 300,
        "montant_max_eur": 1800,
        "periodicite": "mensuel",
        "url_info": "https://www.bmfsfj.de/bmfsfj/themen/familie/familienleistungen/elterngeld/elterngeld-73752",
        "eligibility_criteria": ["residence_de", "newborn_child_under_14mo", "income_below_threshold"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "de-kinderzuschlag",
        "slug": "kinderzuschlag",
        "nom": "Kinderzuschlag",
        "description_en": "Child supplement for low-income parents who cannot cover their children's needs.",
        "categorie": "famille",
        "organisme": "Familienkasse",
        "montant_min_eur": 0,
        "montant_max_eur": 292,
        "periodicite": "mensuel",
        "url_info": "https://www.arbeitsagentur.de/familie-und-kinder/kinderzuschlag",
        "eligibility_criteria": ["residence_de", "child_under_25", "income_below_threshold", "employed"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "de-unterhaltsvorschuss",
        "slug": "unterhaltsvorschuss",
        "nom": "Unterhaltsvorschuss",
        "description_en": "Maintenance advance for single parents when the other parent does not pay child support.",
        "categorie": "famille",
        "organisme": "Jugendamt",
        "montant_min_eur": 0,
        "montant_max_eur": 272,
        "periodicite": "mensuel",
        "url_info": "https://www.bmfsfj.de/bmfsfj/themen/familie/familienleistungen/unterhaltsvorschuss/unterhaltsvorschuss-73756",
        "eligibility_criteria": ["residence_de", "single_parent", "child_under_18"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "de-bildungspaket",
        "slug": "bildung-und-teilhabe",
        "nom": "Bildungspaket (Bildung und Teilhabe)",
        "description_en": "Education and participation package for children in low-income households: school meals, trips, activities.",
        "categorie": "jeunesse",
        "organisme": "Jobcenter / Sozialamt",
        "montant_min_eur": 0,
        "montant_max_eur": 15,
        "periodicite": "mensuel",
        "url_info": "https://www.bmas.de/DE/Soziales/Buergergeld-Grundsicherung/bildungspaket.html",
        "eligibility_criteria": ["residence_de", "child_under_25", "buergergeld_recipient_or_wohngeld"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "de-alg2-kosten-unterkunft",
        "slug": "kosten-unterkunft-heizung",
        "nom": "Kosten der Unterkunft (KdU)",
        "description_en": "Housing and heating costs covered under Bürgergeld for those unable to pay rent.",
        "categorie": "logement",
        "organisme": "Jobcenter",
        "montant_min_eur": 0,
        "montant_max_eur": 800,
        "periodicite": "mensuel",
        "url_info": "https://www.arbeitsagentur.de/buergergeld",
        "eligibility_criteria": ["residence_de", "buergergeld_recipient", "renter"],
        "amounts_baremes_year": 2025
    }
]
json.dump(de, open(f"{BASE}/aids_de.json", "w"), ensure_ascii=False, indent=2)
print(f"DE: {len(de['aids'])} aids")

# ── SPAIN ─────────────────────────────────────────────────────────────────────
es = json.load(open(f"{BASE}/aids_es.json"))
es["last_updated"] = "2026-04-01"
es["aids"] += [
    {
        "id": "es-prestacion-contributiva",
        "slug": "prestacion-contributiva-desempleo",
        "nom": "Prestación Contributiva por Desempleo",
        "description_en": "Contributory unemployment benefit: 70% of regulatory base (first 6 months), then 60%, max 1575€/mo single.",
        "categorie": "revenus_emploi",
        "organisme": "SEPE",
        "montant_min_eur": 570,
        "montant_max_eur": 1575,
        "periodicite": "mensuel",
        "url_info": "https://www.sepe.es/HomeSepe/prestaciones/que-puedes-cobrar/prestacion-contributiva.html",
        "eligibility_criteria": ["residence_es", "contribution_360_days", "involuntary_unemployment"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "es-subsidio-desempleo",
        "slug": "subsidio-desempleo",
        "nom": "Subsidio por Desempleo",
        "description_en": "Non-contributory unemployment assistance at 80% IPREM (approx. 570€/mo) for those who exhausted contributory benefit.",
        "categorie": "revenus_emploi",
        "organisme": "SEPE",
        "montant_min_eur": 570,
        "montant_max_eur": 570,
        "periodicite": "mensuel",
        "url_info": "https://www.sepe.es/HomeSepe/prestaciones/que-puedes-cobrar/subsidios-de-desempleo.html",
        "eligibility_criteria": ["residence_es", "exhausted_contributory_benefit_or_insufficient"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "es-bono-social-electrico",
        "slug": "bono-social-electrico",
        "nom": "Bono Social Eléctrico",
        "description_en": "Electricity bill discount of 25-40% for vulnerable households.",
        "categorie": "energie",
        "organisme": "CNMC / Comercializadoras",
        "montant_min_eur": 0,
        "montant_max_eur": 300,
        "periodicite": "annuel",
        "url_info": "https://www.cnmc.es/ambitos-de-actuacion/energia/bono-social",
        "eligibility_criteria": ["residence_es", "income_below_threshold_or_large_family"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "es-ayuda-habitacion",
        "slug": "ayuda-habitacion-alquiler",
        "nom": "Ayuda al Alquiler (Plan Estatal)",
        "description_en": "State rental assistance for vulnerable households, varies by CCAA.",
        "categorie": "logement",
        "organisme": "MIVAU / CCAA",
        "montant_min_eur": 0,
        "montant_max_eur": 600,
        "periodicite": "mensuel",
        "url_info": "https://www.mivau.gob.es/vivienda/ayudas-y-planes/plan-estatal-vivienda-2022-2025",
        "eligibility_criteria": ["residence_es", "income_below_threshold", "renter"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "es-renta-minima-ccaa",
        "slug": "renta-minima-ccaa",
        "nom": "Renta Mínima de Inserción (CCAA)",
        "description_en": "Regional minimum income complementary to IMV, ranges 400-700€/mo depending on autonomous community.",
        "categorie": "revenus_emploi",
        "organisme": "Comunidades Autónomas",
        "montant_min_eur": 400,
        "montant_max_eur": 700,
        "periodicite": "mensuel",
        "url_info": "https://www.mdsocialesa2030.gob.es",
        "eligibility_criteria": ["residence_es", "income_below_threshold", "registered_padrón"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "es-prestacion-familiar-hijo",
        "slug": "prestacion-familiar-hijo-cargo",
        "nom": "Prestación no Contributiva por Hijo a Cargo",
        "description_en": "Non-contributory family benefit for each dependent child with disability.",
        "categorie": "famille",
        "organisme": "Seguridad Social",
        "montant_min_eur": 28,
        "montant_max_eur": 28,
        "periodicite": "mensuel",
        "url_info": "https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensiones/10968",
        "eligibility_criteria": ["residence_es", "child_under_18_or_disabled", "income_below_threshold"],
        "amounts_baremes_year": 2025
    }
]
json.dump(es, open(f"{BASE}/aids_es.json", "w"), ensure_ascii=False, indent=2)
print(f"ES: {len(es['aids'])} aids")

# ── ITALY ──────────────────────────────────────────────────────────────────────
it = json.load(open(f"{BASE}/aids_it.json"))
it["last_updated"] = "2026-04-01"
it["aids"] += [
    {
        "id": "it-sfl",
        "slug": "supporto-formazione-lavoro",
        "nom": "Supporto per la Formazione e il Lavoro (SFL)",
        "description_en": "Monthly allowance of 350€ for employable individuals participating in training programmes.",
        "categorie": "revenus_emploi",
        "organisme": "INPS",
        "montant_min_eur": 350,
        "montant_max_eur": 350,
        "periodicite": "mensuel",
        "url_info": "https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-e-strutture.schede-servizi.supporto-per-la-formazione-e-il-lavoro.cat-schede-servizi.html",
        "eligibility_criteria": ["residence_it", "age_18_59", "income_below_threshold", "training_participation"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "it-bonus-asilo-nido",
        "slug": "bonus-asilo-nido",
        "nom": "Bonus Asilo Nido",
        "description_en": "Childcare voucher up to 3000€/year for nursery fees, income-tested.",
        "categorie": "famille",
        "organisme": "INPS",
        "montant_min_eur": 1500,
        "montant_max_eur": 3000,
        "periodicite": "annuel",
        "url_info": "https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-e-strutture.schede-servizi.bonus-asilo-nido.cat-schede-servizi.html",
        "eligibility_criteria": ["residence_it", "child_under_3", "isee_below_threshold"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "it-indennita-malattia",
        "slug": "indennita-malattia",
        "nom": "Indennità di Malattia INPS",
        "description_en": "Sickness benefit: 50% of daily salary from day 4 to day 20, then 66% from day 21.",
        "categorie": "sante",
        "organisme": "INPS",
        "montant_min_eur": 0,
        "montant_max_eur": 1200,
        "periodicite": "mensuel",
        "url_info": "https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-e-strutture.schede-servizi.indennita-di-malattia.cat-schede-servizi.html",
        "eligibility_criteria": ["residence_it", "employed_or_insured", "medical_certificate"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "it-invalidita-civile",
        "slug": "pensione-invalidita-civile",
        "nom": "Pensione di Inabilità Civile",
        "description_en": "Civil disability pension for total incapacity: 333€/mo for ages 18-67.",
        "categorie": "handicap",
        "organisme": "INPS",
        "montant_min_eur": 333,
        "montant_max_eur": 333,
        "periodicite": "mensuel",
        "url_info": "https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-e-strutture.schede-servizi.invalidita-civile.cat-schede-servizi.html",
        "eligibility_criteria": ["residence_it", "total_civil_disability_100pct", "income_below_threshold"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "it-reddito-energetico",
        "slug": "bonus-bollette-reddito-energetico",
        "nom": "Bonus Bollette (Reddito Energetico)",
        "description_en": "Energy bill discount approx. 150€/year for electricity and gas for low-income households.",
        "categorie": "energie",
        "organisme": "ARERA",
        "montant_min_eur": 0,
        "montant_max_eur": 150,
        "periodicite": "annuel",
        "url_info": "https://www.arera.it/consumatori/bonus-bollette",
        "eligibility_criteria": ["residence_it", "isee_below_9530_eur", "household_tariff"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "it-bonus-mamma",
        "slug": "bonus-mamma",
        "nom": "Bonus Mamme (Decontribuzione)",
        "description_en": "One-time or annual contribution relief of up to 1000€ for working mothers with 2+ children.",
        "categorie": "famille",
        "organisme": "INPS / Datore di lavoro",
        "montant_min_eur": 1000,
        "montant_max_eur": 1000,
        "periodicite": "annuel",
        "url_info": "https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-e-strutture.schede-servizi.bonus-mamma.cat-schede-servizi.html",
        "eligibility_criteria": ["residence_it", "employed_or_self_employed", "mother_2plus_children"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "it-assegno-unico-maggiorazione",
        "slug": "assegno-unico-maggiorazione",
        "nom": "Assegno Unico – quota maggiorata",
        "description_en": "Increased universal child benefit (maggiorazione): up to 175€/mo/child for low ISEE (under €25,000).",
        "categorie": "famille",
        "organisme": "INPS",
        "montant_min_eur": 57,
        "montant_max_eur": 175,
        "periodicite": "mensuel",
        "url_info": "https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-e-strutture.schede-servizi.assegno-unico-e-universale-per-i-figli-a-carico.cat-schede-servizi.html",
        "eligibility_criteria": ["residence_it", "child_under_21", "isee_below_25000_eur"],
        "amounts_baremes_year": 2025
    }
]
json.dump(it, open(f"{BASE}/aids_it.json", "w"), ensure_ascii=False, indent=2)
print(f"IT: {len(it['aids'])} aids")

# ── PORTUGAL ──────────────────────────────────────────────────────────────────
pt = json.load(open(f"{BASE}/aids_pt.json"))
pt["last_updated"] = "2026-04-01"
pt["aids"] += [
    {
        "id": "pt-subsidio-doenca",
        "slug": "subsidio-doenca",
        "nom": "Subsídio por Doença",
        "description_en": "Sickness benefit: 65% of reference salary from day 4 of absence.",
        "categorie": "sante",
        "organisme": "Segurança Social",
        "montant_min_eur": 0,
        "montant_max_eur": 1200,
        "periodicite": "mensuel",
        "url_info": "https://www.seg-social.pt/subsidio-de-doenca",
        "eligibility_criteria": ["residence_pt", "employed_or_insured", "medical_certificate", "contribution_6mo"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "pt-csi",
        "slug": "complemento-solidario-idosos",
        "nom": "Complemento Solidário para Idosos (CSI)",
        "description_en": "Top-up for elderly on low pensions, up to 6059€/year (approx. 505€/mo).",
        "categorie": "retraite",
        "organisme": "Segurança Social",
        "montant_min_eur": 0,
        "montant_max_eur": 505,
        "periodicite": "mensuel",
        "url_info": "https://www.seg-social.pt/complemento-solidario-para-idosos",
        "eligibility_criteria": ["residence_pt", "age_66_plus", "income_below_threshold"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "pt-psi",
        "slug": "prestacao-social-inclusao",
        "nom": "Prestação Social para a Inclusão (PSI)",
        "description_en": "Social inclusion benefit for persons with disability, 264€/mo.",
        "categorie": "handicap",
        "organisme": "Segurança Social",
        "montant_min_eur": 264,
        "montant_max_eur": 264,
        "periodicite": "mensuel",
        "url_info": "https://www.seg-social.pt/prestacao-social-para-a-inclusao",
        "eligibility_criteria": ["residence_pt", "disability_degree_min60pct", "income_below_threshold"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "pt-tarifa-social",
        "slug": "tarifa-social-energia",
        "nom": "Tarifa Social de Energia (gás e eletricidade)",
        "description_en": "Social energy tariff: 33% discount on electricity and gas bills for eligible households.",
        "categorie": "energie",
        "organisme": "ERSE / DGEm",
        "montant_min_eur": 0,
        "montant_max_eur": 300,
        "periodicite": "annuel",
        "url_info": "https://www.erse.pt/consumidores/tarifas-e-precos/tarifa-social",
        "eligibility_criteria": ["residence_pt", "income_below_threshold_or_recipient_rsi"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "pt-subsidio-habitacao",
        "slug": "subsidio-habitacao-ihru",
        "nom": "Apoio ao Arrendamento (IHRU / 1.º Direito)",
        "description_en": "Housing support for low-income or homeless households; amount varies by case.",
        "categorie": "logement",
        "organisme": "IHRU",
        "montant_min_eur": 0,
        "montant_max_eur": 700,
        "periodicite": "mensuel",
        "url_info": "https://www.ihru.pt/habitacao/programas-de-habitacao/1o-direito",
        "eligibility_criteria": ["residence_pt", "income_below_threshold", "inadequate_housing"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "pt-subsidio-desemprego-eventual",
        "slug": "subsidio-desemprego-eventual",
        "nom": "Subsídio de Desemprego (2025 bareme)",
        "description_en": "Updated 2025: 65% of reference salary capped at max 2036€/mo for up to 30 months.",
        "categorie": "revenus_emploi",
        "organisme": "IEFP",
        "montant_min_eur": 0,
        "montant_max_eur": 2036,
        "periodicite": "mensuel",
        "url_info": "https://www.iefp.pt/subsidio-de-desemprego",
        "eligibility_criteria": ["residence_pt", "contribution_450_days", "involuntary_unemployment"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "pt-apoio-crianca",
        "slug": "apoio-crianca-jovem",
        "nom": "Apoio à Criança e Jovem em Risco",
        "description_en": "Child protection allowance and family support for at-risk children; complements abono de família.",
        "categorie": "famille",
        "organisme": "Segurança Social / CPCJ",
        "montant_min_eur": 42,
        "montant_max_eur": 100,
        "periodicite": "mensuel",
        "url_info": "https://www.seg-social.pt/abono-de-familia-para-criancas-e-jovens",
        "eligibility_criteria": ["residence_pt", "child_at_risk", "income_below_threshold"],
        "amounts_baremes_year": 2025
    }
]
json.dump(pt, open(f"{BASE}/aids_pt.json", "w"), ensure_ascii=False, indent=2)
print(f"PT: {len(pt['aids'])} aids")

# ── BELGIUM ────────────────────────────────────────────────────────────────────
be = json.load(open(f"{BASE}/aids_be.json"))
be["last_updated"] = "2026-04-01"
be["aids"] += [
    {
        "id": "be-ris-isole",
        "slug": "revenu-integration-sociale",
        "nom": "Revenu d'Intégration Sociale (RIS) – catégorie isolé",
        "description_en": "Social integration income for isolated persons: 993€/mo (category isolated) from CPAS.",
        "categorie": "revenus_emploi",
        "organisme": "CPAS/OCMW",
        "montant_min_eur": 993,
        "montant_max_eur": 993,
        "periodicite": "mensuel",
        "url_info": "https://www.spf.be/revenu-integration",
        "eligibility_criteria": ["residence_be", "age_18", "income_below_threshold", "isolated_person"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "be-allocation-chomage-minimale",
        "slug": "allocation-chomage-minimale",
        "nom": "Allocation de Chômage minimale",
        "description_en": "Minimum unemployment allocation: 891€/mo for isolated persons after 1 year unemployment.",
        "categorie": "revenus_emploi",
        "organisme": "ONEM/RVA",
        "montant_min_eur": 891,
        "montant_max_eur": 2800,
        "periodicite": "mensuel",
        "url_info": "https://www.onem.be/fr/documentation/feuille-info/t2",
        "eligibility_criteria": ["residence_be", "contribution_required", "involuntary_unemployment"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "be-intervention-majoree",
        "slug": "intervention-majoree-soins",
        "nom": "Intervention Majorée (IM) – soins de santé",
        "description_en": "Increased healthcare reimbursement reducing patient co-payment by up to 26% for eligible beneficiaries.",
        "categorie": "sante",
        "organisme": "INAMI/RIZIV",
        "montant_min_eur": 0,
        "montant_max_eur": 500,
        "periodicite": "annuel",
        "url_info": "https://www.inami.fgov.be/fr/themes/cout-remboursement/avec-assurance/intervention-majoree",
        "eligibility_criteria": ["residence_be", "income_below_threshold_or_special_status"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "be-prime-energie",
        "slug": "prime-energie",
        "nom": "Prime Énergie (Wallonie/Bruxelles)",
        "description_en": "Energy subsidy of 135-300€ for heating or insulation works for low-income households.",
        "categorie": "energie",
        "organisme": "SPW Énergie / Bruxelles Environnement",
        "montant_min_eur": 135,
        "montant_max_eur": 300,
        "periodicite": "ponctuel",
        "url_info": "https://energie.wallonie.be/fr/primes-et-aides.html",
        "eligibility_criteria": ["residence_be_wallonie_or_bruxelles", "income_below_threshold"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "be-allocation-maternite",
        "slug": "allocation-maternite",
        "nom": "Allocation de Maternité (Indemnité de maternité)",
        "description_en": "Maternity allowance: 82% of salary for first 30 days, then 75% for the remaining period (15 weeks total).",
        "categorie": "famille",
        "organisme": "INAMI/RIZIV",
        "montant_min_eur": 0,
        "montant_max_eur": 3000,
        "periodicite": "mensuel",
        "url_info": "https://www.inami.fgov.be/fr/themes/maternite/pages/default.aspx",
        "eligibility_criteria": ["residence_be", "employed_or_insured", "pregnancy_or_birth"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "be-allocation-invalidite",
        "slug": "allocation-invalidite",
        "nom": "Allocation d'Invalidité",
        "description_en": "Disability/invalidity allowance: 55% of capped reference salary, min 1300€/mo after 1 year incapacity.",
        "categorie": "handicap",
        "organisme": "INAMI/RIZIV",
        "montant_min_eur": 1300,
        "montant_max_eur": 2600,
        "periodicite": "mensuel",
        "url_info": "https://www.inami.fgov.be/fr/themes/invalidite",
        "eligibility_criteria": ["residence_be", "incapacity_min1year", "contribution_required"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "be-aide-logement",
        "slug": "aide-loyer",
        "nom": "Allocation de Loyer (Aide au Logement)",
        "description_en": "Rental allowance for low-income tenants; amount varies by region (Wallonia, Flanders, Brussels).",
        "categorie": "logement",
        "organisme": "SPW / Wonen in Vlaanderen / Bruxelles Logement",
        "montant_min_eur": 0,
        "montant_max_eur": 400,
        "periodicite": "mensuel",
        "url_info": "https://www.wallonie.be/fr/demarches/allocations-et-primes-liees-au-logement",
        "eligibility_criteria": ["residence_be", "income_below_threshold", "renter"],
        "amounts_baremes_year": 2025
    }
]
json.dump(be, open(f"{BASE}/aids_be.json", "w"), ensure_ascii=False, indent=2)
print(f"BE: {len(be['aids'])} aids")

# ── NETHERLANDS ────────────────────────────────────────────────────────────────
nl = json.load(open(f"{BASE}/aids_nl.json"))
nl["last_updated"] = "2026-04-01"
nl["aids"] += [
    {
        "id": "nl-kinderopvangtoeslag",
        "slug": "kinderopvangtoeslag",
        "nom": "Kinderopvangtoeslag",
        "description_en": "Childcare allowance covering up to 96% of childcare costs for working parents.",
        "categorie": "famille",
        "organisme": "Belastingdienst Toeslagen",
        "montant_min_eur": 0,
        "montant_max_eur": 2000,
        "periodicite": "mensuel",
        "url_info": "https://www.toeslagen.nl/onderwerpen/kinderopvangtoeslag",
        "eligibility_criteria": ["residence_nl", "employed_or_studying", "child_in_registered_childcare"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "nl-huurtoeslag",
        "slug": "huurtoeslag",
        "nom": "Huurtoeslag",
        "description_en": "Rental allowance for low-income tenants in social housing, max 450€/mo.",
        "categorie": "logement",
        "organisme": "Belastingdienst Toeslagen",
        "montant_min_eur": 0,
        "montant_max_eur": 450,
        "periodicite": "mensuel",
        "url_info": "https://www.toeslagen.nl/onderwerpen/huurtoeslag",
        "eligibility_criteria": ["residence_nl", "income_below_threshold", "renter_social_housing"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "nl-zorgtoeslag",
        "slug": "zorgtoeslag",
        "nom": "Zorgtoeslag",
        "description_en": "Health insurance premium subsidy, max 154€/mo for singles with low income.",
        "categorie": "sante",
        "organisme": "Belastingdienst Toeslagen",
        "montant_min_eur": 0,
        "montant_max_eur": 154,
        "periodicite": "mensuel",
        "url_info": "https://www.toeslagen.nl/onderwerpen/zorgtoeslag",
        "eligibility_criteria": ["residence_nl", "income_below_threshold", "health_insurance_subscriber"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "nl-wajong",
        "slug": "wajong",
        "nom": "Wajong (Werk en arbeidsondersteuning jonggehandicapten)",
        "description_en": "Disability benefit for young persons with disability, 836€/mo.",
        "categorie": "handicap",
        "organisme": "UWV",
        "montant_min_eur": 836,
        "montant_max_eur": 836,
        "periodicite": "mensuel",
        "url_info": "https://www.uwv.nl/particulieren/ziek/ik-ben-ziek-en-heb-geen-werkgever/wajong",
        "eligibility_criteria": ["residence_nl", "disability_before_age_18_or_study", "incapacity_work"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "nl-aow",
        "slug": "aow-ouderdomspensioen",
        "nom": "AOW (Algemene Ouderdomswet)",
        "description_en": "State pension: 1386€/mo for singles from age 67.",
        "categorie": "retraite",
        "organisme": "SVB",
        "montant_min_eur": 1386,
        "montant_max_eur": 1386,
        "periodicite": "mensuel",
        "url_info": "https://www.svb.nl/nl/aow",
        "eligibility_criteria": ["residence_nl", "age_67", "insured_period_nl"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "nl-ioaw",
        "slug": "ioaw-ioaz",
        "nom": "IOAW / IOAZ (oudere werklozen)",
        "description_en": "Income supplement for older unemployed workers (50+) who exhausted WW, 1137€/mo.",
        "categorie": "revenus_emploi",
        "organisme": "UWV / Gemeente",
        "montant_min_eur": 0,
        "montant_max_eur": 1137,
        "periodicite": "mensuel",
        "url_info": "https://www.uwv.nl/particulieren/werkloos/ik-heb-geen-werk/ioaw",
        "eligibility_criteria": ["residence_nl", "age_50_plus", "exhausted_ww"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "nl-kindgebonden-budget",
        "slug": "kindgebonden-budget",
        "nom": "Kindgebonden Budget",
        "description_en": "Additional child-related income supplement for low-income families with children.",
        "categorie": "famille",
        "organisme": "Belastingdienst Toeslagen",
        "montant_min_eur": 0,
        "montant_max_eur": 2700,
        "periodicite": "annuel",
        "url_info": "https://www.toeslagen.nl/onderwerpen/kindgebonden-budget",
        "eligibility_criteria": ["residence_nl", "child_under_18", "income_below_threshold"],
        "amounts_baremes_year": 2025
    }
]
json.dump(nl, open(f"{BASE}/aids_nl.json", "w"), ensure_ascii=False, indent=2)
print(f"NL: {len(nl['aids'])} aids")

# ── SWEDEN ─────────────────────────────────────────────────────────────────────
se = json.load(open(f"{BASE}/aids_se.json"))
se["last_updated"] = "2026-04-01"
se["aids"] += [
    {
        "id": "se-bostadsbidrag",
        "slug": "bostadsbidrag",
        "nom": "Bostadsbidrag",
        "description_en": "Housing allowance for families with children or young adults, max 3200 SEK/mo.",
        "categorie": "logement",
        "organisme": "Försäkringskassan",
        "montant_min_sek": 0,
        "montant_max_sek": 3200,
        "periodicite": "mensuel",
        "url_info": "https://www.forsakringskassan.se/privatperson/foralder/bostadsbidrag",
        "eligibility_criteria": ["residence_se", "income_below_threshold", "renter"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "se-foraldrapenning",
        "slug": "foraldrapenning",
        "nom": "Föräldrapenning",
        "description_en": "Parental benefit at 80% of SGI (income basis), max 1034 SEK/day for up to 480 days.",
        "categorie": "famille",
        "organisme": "Försäkringskassan",
        "montant_min_sek": 250,
        "montant_max_sek": 31040,
        "periodicite": "mensuel",
        "url_info": "https://www.forsakringskassan.se/privatperson/foralder/foraldrapenning",
        "eligibility_criteria": ["residence_se", "newborn_or_adopted_child", "insured_se"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "se-sjukpenning",
        "slug": "sjukpenning",
        "nom": "Sjukpenning",
        "description_en": "Sickness benefit: 80% of income-based SGI from day 2 (employer covers day 1).",
        "categorie": "sante",
        "organisme": "Försäkringskassan",
        "montant_min_sek": 0,
        "montant_max_sek": 26400,
        "periodicite": "mensuel",
        "url_info": "https://www.forsakringskassan.se/privatperson/sjuk/sjukpenning",
        "eligibility_criteria": ["residence_se", "insured_se", "medical_certificate"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "se-aktivitetsstod",
        "slug": "aktivitetsstod",
        "nom": "Aktivitetsstöd",
        "description_en": "Activity support during labour market programme, same level as a-kassa up to 26400 SEK/mo.",
        "categorie": "revenus_emploi",
        "organisme": "Försäkringskassan / Arbetsförmedlingen",
        "montant_min_sek": 0,
        "montant_max_sek": 26400,
        "periodicite": "mensuel",
        "url_info": "https://www.forsakringskassan.se/arbetsgivare/aktivitetsstod",
        "eligibility_criteria": ["residence_se", "unemployed", "enrolled_labour_market_programme"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "se-handikappersattning",
        "slug": "handikappersattning",
        "nom": "Handikappersättning",
        "description_en": "Disability allowance for adults with significant disability extra costs, up to 2717 SEK/mo.",
        "categorie": "handicap",
        "organisme": "Försäkringskassan",
        "montant_min_sek": 0,
        "montant_max_sek": 2717,
        "periodicite": "mensuel",
        "url_info": "https://www.forsakringskassan.se/privatperson/funktionsnedsattning/handikappersattning",
        "eligibility_criteria": ["residence_se", "age_19_65", "significant_disability"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "se-studiebidrag",
        "slug": "studiebidrag-csn",
        "nom": "Studiebidrag (CSN)",
        "description_en": "Student grant of 1430 SEK/mo, universal for upper secondary education students.",
        "categorie": "jeunesse",
        "organisme": "CSN",
        "montant_min_sek": 1430,
        "montant_max_sek": 1430,
        "periodicite": "mensuel",
        "url_info": "https://www.csn.se/bidrag-och-lan/studiebidrag.html",
        "eligibility_criteria": ["residence_se", "age_16_20", "student_upper_secondary"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "se-etableringsersattning",
        "slug": "etableringsersattning",
        "nom": "Etableringsersättning",
        "description_en": "Integration allowance for newly arrived immigrants in establishment programme.",
        "categorie": "revenus_emploi",
        "organisme": "Arbetsförmedlingen",
        "montant_min_sek": 0,
        "montant_max_sek": 4308,
        "periodicite": "mensuel",
        "url_info": "https://www.arbetsformedlingen.se/for-arbetssokande/etablering-i-sverige",
        "eligibility_criteria": ["residence_se", "newly_arrived_immigrant", "age_20_64"],
        "amounts_baremes_year": 2025
    }
]
json.dump(se, open(f"{BASE}/aids_se.json", "w"), ensure_ascii=False, indent=2)
print(f"SE: {len(se['aids'])} aids")

# ── DENMARK ────────────────────────────────────────────────────────────────────
dk = json.load(open(f"{BASE}/aids_dk.json"))
dk["last_updated"] = "2026-04-01"
dk["aids"] += [
    {
        "id": "dk-boligstoette",
        "slug": "boligstoette",
        "nom": "Boligstøtte",
        "description_en": "Housing benefit for tenants and cooperative housing members, max 6500 DKK/mo.",
        "categorie": "logement",
        "organisme": "Udbetaling Danmark",
        "montant_min_dkk": 0,
        "montant_max_dkk": 6500,
        "periodicite": "mensuel",
        "url_info": "https://www.borger.dk/bolig-og-flytning/boligstoette",
        "eligibility_criteria": ["residence_dk", "income_below_threshold", "renter_or_cooperative"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "dk-barselsdagpenge",
        "slug": "barselsdagpenge",
        "nom": "Barselsdagpenge",
        "description_en": "Parental leave benefit, max 4658 DKK/week (52 weeks shared between parents).",
        "categorie": "famille",
        "organisme": "Udbetaling Danmark",
        "montant_min_dkk": 0,
        "montant_max_dkk": 4658,
        "periodicite": "mensuel",
        "url_info": "https://www.borger.dk/familie-og-boern/barsel/dagpenge-under-barsel",
        "eligibility_criteria": ["residence_dk", "employed_or_self_employed", "newborn_or_adopted"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "dk-foertidspension",
        "slug": "foertidspension",
        "nom": "Førtidspension",
        "description_en": "Early disability pension for persons unable to work due to permanent impairment: 21484 DKK/mo.",
        "categorie": "handicap",
        "organisme": "Kommunen",
        "montant_min_dkk": 21484,
        "montant_max_dkk": 21484,
        "periodicite": "mensuel",
        "url_info": "https://www.borger.dk/pension-og-efterloen/foertidspension",
        "eligibility_criteria": ["residence_dk", "permanent_reduced_work_capacity", "age_18_65"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "dk-su",
        "slug": "su-studieydelse",
        "nom": "SU (Statens Uddannelsesstøtte)",
        "description_en": "State education grant: 6321 DKK/mo for higher education students living away from home.",
        "categorie": "jeunesse",
        "organisme": "Styrelsen for Institutioner og Uddannelsesstøtte",
        "montant_min_dkk": 3335,
        "montant_max_dkk": 6321,
        "periodicite": "mensuel",
        "url_info": "https://www.su.dk",
        "eligibility_criteria": ["residence_dk", "student_higher_education", "age_18_plus"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "dk-folkepension",
        "slug": "folkepension",
        "nom": "Folkepension",
        "description_en": "State retirement pension from age 67, max 17208 DKK/mo including supplements.",
        "categorie": "retraite",
        "organisme": "Udbetaling Danmark",
        "montant_min_dkk": 6000,
        "montant_max_dkk": 17208,
        "periodicite": "mensuel",
        "url_info": "https://www.borger.dk/pension-og-efterloen/folkepension",
        "eligibility_criteria": ["residence_dk", "age_67", "insured_period_dk"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "dk-sygedagpenge",
        "slug": "sygedagpenge",
        "nom": "Sygedagpenge",
        "description_en": "Sickness benefit: max 4658 DKK/week from employer or municipality.",
        "categorie": "sante",
        "organisme": "Kommunen / Employer",
        "montant_min_dkk": 0,
        "montant_max_dkk": 4658,
        "periodicite": "mensuel",
        "url_info": "https://www.borger.dk/arbejde-dagpenge-orlov/sygedagpenge",
        "eligibility_criteria": ["residence_dk", "employed_or_insured", "medical_certificate"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "dk-bornepenge",
        "slug": "bornepenge",
        "nom": "Børnepenge (Børne- og ungeydelse)",
        "description_en": "Universal child benefit: 1001 DKK/quarter per child under 2 (lower for older children).",
        "categorie": "famille",
        "organisme": "Udbetaling Danmark",
        "montant_min_dkk": 1001,
        "montant_max_dkk": 1001,
        "periodicite": "kvartal",
        "url_info": "https://www.borger.dk/familie-og-boern/bornepenge-og-tilskud/boerne-og-ungeydelse",
        "eligibility_criteria": ["residence_dk", "child_under_18"],
        "amounts_baremes_year": 2025
    }
]
json.dump(dk, open(f"{BASE}/aids_dk.json", "w"), ensure_ascii=False, indent=2)
print(f"DK: {len(dk['aids'])} aids")

# ── FINLAND ────────────────────────────────────────────────────────────────────
fi = json.load(open(f"{BASE}/aids_fi.json"))
fi["last_updated"] = "2026-04-01"
fi["aids"] += [
    {
        "id": "fi-asumistuki",
        "slug": "yleinen-asumistuki",
        "nom": "Yleinen asumistuki",
        "description_en": "General housing allowance for low-income households, max 500€/mo.",
        "categorie": "logement",
        "organisme": "Kela",
        "montant_min_eur": 0,
        "montant_max_eur": 500,
        "periodicite": "mensuel",
        "url_info": "https://www.kela.fi/asuminen-yleinen-asumistuki",
        "eligibility_criteria": ["residence_fi", "income_below_threshold", "renter"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "fi-vanhempainraha",
        "slug": "vanhempainraha",
        "nom": "Vanhempainraha",
        "description_en": "Parental allowance at 70% of salary for 160 days per parent.",
        "categorie": "famille",
        "organisme": "Kela",
        "montant_min_eur": 31,
        "montant_max_eur": 3000,
        "periodicite": "mensuel",
        "url_info": "https://www.kela.fi/vanhempainraha",
        "eligibility_criteria": ["residence_fi", "newborn_or_adopted_child", "insured_fi"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "fi-sairauspaivaraha",
        "slug": "sairauspaivaraha",
        "nom": "Sairauspäiväraha",
        "description_en": "Sickness daily allowance: 70% of annual income from day 2 of incapacity.",
        "categorie": "sante",
        "organisme": "Kela",
        "montant_min_eur": 0,
        "montant_max_eur": 2500,
        "periodicite": "mensuel",
        "url_info": "https://www.kela.fi/sairauspaivaraha",
        "eligibility_criteria": ["residence_fi", "employed_or_self_employed", "medical_certificate"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "fi-kansanelake",
        "slug": "kansanelake",
        "nom": "Kansaneläke",
        "description_en": "National pension (basic pension) for those with no or low earnings-related pension, max 704€/mo.",
        "categorie": "retraite",
        "organisme": "Kela",
        "montant_min_eur": 0,
        "montant_max_eur": 704,
        "periodicite": "mensuel",
        "url_info": "https://www.kela.fi/kansanelake",
        "eligibility_criteria": ["residence_fi", "age_65", "low_earnings_pension"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "fi-opintoraha",
        "slug": "opintoraha",
        "nom": "Opintoraha",
        "description_en": "Study grant: 268€/mo for higher education students living away from home.",
        "categorie": "jeunesse",
        "organisme": "Kela",
        "montant_min_eur": 101,
        "montant_max_eur": 268,
        "periodicite": "mensuel",
        "url_info": "https://www.kela.fi/opintoraha",
        "eligibility_criteria": ["residence_fi", "student_higher_education", "age_17_plus"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "fi-kotihoidontuki",
        "slug": "lasten-kotihoidon-tuki",
        "nom": "Lasten kotihoidon tuki",
        "description_en": "Child home care allowance: 344€/mo for parents who care for children under 3 at home.",
        "categorie": "famille",
        "organisme": "Kela",
        "montant_min_eur": 344,
        "montant_max_eur": 344,
        "periodicite": "mensuel",
        "url_info": "https://www.kela.fi/kotihoidontuki",
        "eligibility_criteria": ["residence_fi", "child_under_3", "home_care_no_municipality_care"],
        "amounts_baremes_year": 2025
    },
    {
        "id": "fi-tyottomyyspaivaraha",
        "slug": "peruspaivaraha-tyottomyys",
        "nom": "Peruspäiväraha (työtön)",
        "description_en": "Basic unemployment daily allowance: 37.21€/day (approx. 800€/mo) for those not in union a-kassa.",
        "categorie": "revenus_emploi",
        "organisme": "Kela",
        "montant_min_eur": 0,
        "montant_max_eur": 800,
        "periodicite": "mensuel",
        "url_info": "https://www.kela.fi/peruspaivaraha",
        "eligibility_criteria": ["residence_fi", "involuntary_unemployment", "available_for_work"],
        "amounts_baremes_year": 2025
    }
]
json.dump(fi, open(f"{BASE}/aids_fi.json", "w"), ensure_ascii=False, indent=2)
print(f"FI: {len(fi['aids'])} aids")

print("Phase 1 done")
