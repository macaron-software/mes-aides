-- Mes Aides - Initial Data Population
-- Personas, Features, Stories, Screens, Code modules

-- ═══════════════════════════════════════════════════════════════════════════
-- PERSONAS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO personas (udid, name, description, goals, pain_points, demographics, accessibility_needs, tech_proficiency, priority) VALUES
('P001-precaire', 'Marie Précaire', 'Personne en situation de précarité cherchant des aides', 
 '["Découvrir toutes les aides auxquelles j''ai droit", "Simuler rapidement ma situation", "Comprendre les démarches"]',
 '["Complexité administrative", "Peur de l''erreur", "Manque de temps", "Honte de demander"]',
 '{"age_range": "25-55", "income": "< SMIC", "location": "France métropolitaine", "family": "variable"}',
 '{"visual": "normal", "motor": "normal", "cognitive": "stress élevé"}',
 'medium', 1),

('P002-senior', 'Jean Retraité', 'Senior cherchant des aides vieillesse',
 '["Vérifier mes droits à l''ASPA", "Comprendre les aides logement senior", "Aider mes petits-enfants"]',
 '["Interfaces trop petites", "Vocabulaire technique", "Connexion internet limitée"]',
 '{"age_range": "65+", "income": "petite retraite", "location": "France", "family": "isolé ou couple"}',
 '{"visual": "taille police importante", "motor": "arthrite possible", "cognitive": "normal"}',
 'low', 1),

('P003-jeune', 'Léa Étudiante', 'Jeune en études ou en insertion',
 '["Bourse CROUS", "APL étudiant", "Pass Culture", "Aide au permis"]',
 '["Budget serré", "Dossiers administratifs", "Délais de versement"]',
 '{"age_range": "18-25", "income": "0-800€", "location": "France", "family": "étudiant"}',
 '{"visual": "normal", "motor": "normal", "cognitive": "normal"}',
 'high', 1),

('P004-famille', 'Famille Dupont', 'Famille avec enfants cherchant des aides',
 '["Allocations familiales", "Aides garde enfant", "Rentrée scolaire", "Logement familial"]',
 '["Paperasse multiple", "Changements de situation", "Attente CAF"]',
 '{"age_range": "30-50", "income": "1-2 SMIC", "location": "France", "family": "couple avec enfants"}',
 '{"visual": "normal", "motor": "normal", "cognitive": "charge mentale"}',
 'medium', 1),

('P005-handicap', 'Alex Handicapé', 'Personne en situation de handicap',
 '["AAH", "PCH", "AEEH pour enfant", "Carte mobilité", "RQTH"]',
 '["Délais MDPH", "Complexité dossiers", "Accessibilité sites"]',
 '{"age_range": "20-60", "income": "variable", "location": "France", "family": "variable"}',
 '{"visual": "possible déficience", "motor": "possible déficience", "cognitive": "possible déficience"}',
 'medium', 1),

('P006-travailleur', 'Paul Travailleur', 'Salarié modeste ou indépendant',
 '["Prime d''activité", "Chèque énergie", "Aides formation", "ACRE"]',
 '["Seuils de revenus flous", "Démarches en ligne", "Peur de perdre aides si revenus augmentent"]',
 '{"age_range": "25-60", "income": "SMIC-2 SMIC", "location": "France", "family": "variable"}',
 '{"visual": "normal", "motor": "normal", "cognitive": "normal"}',
 'medium', 2);

-- ═══════════════════════════════════════════════════════════════════════════
-- FEATURES
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO features (udid, code, title, description, persona_udids, priority, status) VALUES
('F001-simul', 'F001', 'Simulateur d''éligibilité', 
 'Formulaire de saisie de situation personnelle pour calculer les aides éligibles',
 '["P001-precaire", "P002-senior", "P003-jeune", "P004-famille", "P005-handicap", "P006-travailleur"]',
 'must', 'done'),

('F002-result', 'F002', 'Affichage des résultats',
 'Présentation des aides éligibles avec montants estimés et démarches',
 '["P001-precaire", "P002-senior", "P003-jeune", "P004-famille", "P005-handicap", "P006-travailleur"]',
 'must', 'done'),

('F003-catalog', 'F003', 'Catalogue des aides',
 'Liste complète des 71 aides avec fiches détaillées',
 '["P001-precaire", "P002-senior", "P003-jeune", "P004-famille", "P005-handicap", "P006-travailleur"]',
 'must', 'done'),

('F004-guides', 'F004', 'Guides thématiques',
 'Guides par situation (logement, emploi, santé, famille...)',
 '["P001-precaire", "P002-senior", "P003-jeune", "P004-famille"]',
 'should', 'done'),

('F005-i18n', 'F005', 'Multi-langue',
 'Support de 40 langues dont RTL (arabe, hébreu)',
 '["P001-precaire", "P003-jeune"]',
 'should', 'in_progress'),

('F006-a11y', 'F006', 'Accessibilité WCAG 2.2 AA',
 'Conformité accessibilité complète',
 '["P002-senior", "P005-handicap"]',
 'must', 'in_progress'),

('F007-offline', 'F007', 'Mode hors-ligne',
 'Application utilisable sans connexion (PWA)',
 '["P002-senior", "P001-precaire"]',
 'could', 'planned'),

('F008-pdf', 'F008', 'Export PDF résultats',
 'Génération d''un récapitulatif PDF des aides éligibles',
 '["P001-precaire", "P004-famille"]',
 'should', 'planned'),

('F009-privacy', 'F009', 'Confidentialité totale',
 'Aucune donnée transmise - calcul 100% local',
 '["P001-precaire", "P002-senior", "P003-jeune", "P004-famille", "P005-handicap", "P006-travailleur"]',
 'must', 'done');

-- ═══════════════════════════════════════════════════════════════════════════
-- USER STORIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Feature F001: Simulateur
INSERT INTO user_stories (udid, code, feature_udid, as_a, i_want, so_that, priority, status) VALUES
('US001', 'US001', 'F001-simul', 'utilisateur', 'saisir ma situation personnelle (âge, revenus, logement)', 'le simulateur calcule mes aides', 10, 'done'),
('US002', 'US002', 'F001-simul', 'utilisateur', 'indiquer ma composition familiale', 'les aides familiales soient calculées', 9, 'done'),
('US003', 'US003', 'F001-simul', 'utilisateur', 'déclarer mes revenus mensuels', 'les plafonds de ressources soient vérifiés', 9, 'done'),
('US004', 'US004', 'F001-simul', 'utilisateur', 'préciser mon type de logement', 'les aides logement soient évaluées', 8, 'done'),
('US005', 'US005', 'F001-simul', 'utilisateur handicapé', 'indiquer mon taux d''incapacité', 'les aides handicap soient calculées', 7, 'done'),
('US006', 'US006', 'F001-simul', 'étudiant', 'déclarer mon statut étudiant et boursier', 'les aides étudiantes soient proposées', 7, 'done'),
('US007', 'US007', 'F001-simul', 'senior', 'indiquer mon statut retraité', 'les aides vieillesse soient évaluées', 7, 'done');

-- Feature F002: Résultats
INSERT INTO user_stories (udid, code, feature_udid, as_a, i_want, so_that, priority, status) VALUES
('US010', 'US010', 'F002-result', 'utilisateur', 'voir la liste des aides auxquelles j''ai droit', 'je connaisse mes droits', 10, 'done'),
('US011', 'US011', 'F002-result', 'utilisateur', 'connaître le montant estimé de chaque aide', 'je puisse évaluer leur impact', 10, 'done'),
('US012', 'US012', 'F002-result', 'utilisateur', 'comprendre les conditions de chaque aide', 'je sache si je suis vraiment éligible', 9, 'done'),
('US013', 'US013', 'F002-result', 'utilisateur', 'connaître les démarches pour obtenir l''aide', 'je puisse faire ma demande', 9, 'done'),
('US014', 'US014', 'F002-result', 'utilisateur', 'trier les résultats par montant', 'je voie d''abord les plus importantes', 8, 'done'),
('US015', 'US015', 'F002-result', 'utilisateur', 'filtrer par catégorie d''aide', 'je trouve rapidement ce qui m''intéresse', 7, 'done');

-- Feature F003: Catalogue
INSERT INTO user_stories (udid, code, feature_udid, as_a, i_want, so_that, priority, status) VALUES
('US020', 'US020', 'F003-catalog', 'utilisateur', 'parcourir toutes les aides disponibles', 'je découvre des aides que je ne connais pas', 8, 'done'),
('US021', 'US021', 'F003-catalog', 'utilisateur', 'filtrer les aides par catégorie', 'je trouve rapidement les aides pertinentes', 7, 'done'),
('US022', 'US022', 'F003-catalog', 'utilisateur', 'rechercher une aide par nom', 'je trouve une aide spécifique', 7, 'done'),
('US023', 'US023', 'F003-catalog', 'utilisateur', 'voir la fiche détaillée d''une aide', 'je comprenne ses conditions et montants', 8, 'done');

-- Feature F005: i18n
INSERT INTO user_stories (udid, code, feature_udid, as_a, i_want, so_that, priority, status) VALUES
('US030', 'US030', 'F005-i18n', 'utilisateur non-francophone', 'utiliser l''application dans ma langue', 'je comprenne tout', 8, 'in_progress'),
('US031', 'US031', 'F005-i18n', 'utilisateur arabophone', 'voir l''interface en mode RTL', 'la lecture soit naturelle', 7, 'in_progress');

-- Feature F006: a11y
INSERT INTO user_stories (udid, code, feature_udid, as_a, i_want, so_that, priority, status) VALUES
('US040', 'US040', 'F006-a11y', 'utilisateur malvoyant', 'naviguer au clavier et avec un lecteur d''écran', 'je puisse utiliser le simulateur', 9, 'in_progress'),
('US041', 'US041', 'F006-a11y', 'utilisateur daltonien', 'distinguer les éléments sans dépendre des couleurs', 'je comprenne l''interface', 8, 'in_progress'),
('US042', 'US042', 'F006-a11y', 'utilisateur à mobilité réduite', 'cliquer sur des zones suffisamment grandes', 'je puisse interagir facilement', 8, 'in_progress');

-- ═══════════════════════════════════════════════════════════════════════════
-- ACCEPTANCE CRITERIA (sample)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO acceptance_criteria (udid, story_udid, sequence, given_clause, when_clause, then_clause, is_automated) VALUES
('AC001-1', 'US001', 1, 'je suis sur la page simulateur', 'je saisis mon âge 25 ans', 'le champ est validé et enregistré', 0),
('AC001-2', 'US001', 2, 'je suis sur la page simulateur', 'je saisis un âge invalide (-5)', 'un message d''erreur s''affiche', 0),
('AC001-3', 'US001', 3, 'j''ai saisi toutes les infos requises', 'je clique sur Simuler', 'les résultats s''affichent', 0),

('AC010-1', 'US010', 1, 'j''ai complété ma simulation', 'je suis sur la page résultats', 'je vois une liste d''aides avec leur nom', 0),
('AC010-2', 'US010', 2, 'aucune aide n''est éligible', 'je suis sur la page résultats', 'un message m''explique pourquoi', 0),

('AC040-1', 'US040', 1, 'j''utilise un lecteur d''écran', 'je navigue sur la page simulateur', 'tous les champs ont un label accessible', 0),
('AC040-2', 'US040', 2, 'je suis sur le formulaire', 'j''utilise Tab pour naviguer', 'je peux atteindre tous les champs dans l''ordre logique', 0);

-- ═══════════════════════════════════════════════════════════════════════════
-- IHM SCREENS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO ihm_screens (udid, code, name, route, file_path, story_udids, persona_udids, description) VALUES
('SCR001', 'SCR001', 'Accueil', '/', 'web/index.html', '[]', 
 '["P001-precaire", "P002-senior", "P003-jeune", "P004-famille", "P005-handicap", "P006-travailleur"]',
 'Page d''accueil avec présentation du service et CTA vers simulateur'),

('SCR002', 'SCR002', 'Simulateur', '/simulateur', 'web/simulateur.html', 
 '["US001", "US002", "US003", "US004", "US005", "US006", "US007"]',
 '["P001-precaire", "P002-senior", "P003-jeune", "P004-famille", "P005-handicap", "P006-travailleur"]',
 'Formulaire multi-étapes de saisie de situation'),

('SCR003', 'SCR003', 'Résultats', '/resultats', 'web/resultats.html',
 '["US010", "US011", "US012", "US013", "US014", "US015"]',
 '["P001-precaire", "P002-senior", "P003-jeune", "P004-famille", "P005-handicap", "P006-travailleur"]',
 'Affichage des aides éligibles avec montants et démarches'),

('SCR004', 'SCR004', 'Catalogue aides', '/aides', 'web/aides.html',
 '["US020", "US021", "US022", "US023"]',
 '["P001-precaire", "P002-senior", "P003-jeune", "P004-famille", "P005-handicap", "P006-travailleur"]',
 'Liste filtrable des 71 aides'),

('SCR005', 'SCR005', 'Fiche aide', '/aides/:id', 'web/aides/:slug.html',
 '["US023"]',
 '["P001-precaire", "P002-senior", "P003-jeune", "P004-famille", "P005-handicap", "P006-travailleur"]',
 'Détail d''une aide avec conditions, montants, démarches'),

('SCR006', 'SCR006', 'Guides', '/guides', 'web/guides.html',
 '[]',
 '["P001-precaire", "P002-senior", "P003-jeune", "P004-famille"]',
 'Liste des guides thématiques'),

('SCR007', 'SCR007', 'Design System', '/ds', 'web/ds.html',
 '[]', '[]',
 'Documentation des composants UI et tokens'),

('SCR008', 'SCR008', 'Accessibilité', '/accessibilite', 'web/accessibilite.html',
 '["US040", "US041", "US042"]',
 '["P002-senior", "P005-handicap"]',
 'Déclaration d''accessibilité RGAA'),

('SCR009', 'SCR009', 'Mentions légales', '/mentions-legales', 'web/mentions-legales.html',
 '[]', '[]',
 'Mentions légales et CGU'),

('SCR010', 'SCR010', 'Confidentialité', '/confidentialite', 'web/confidentialite.html',
 '[]', '[]',
 'Politique de confidentialité RGPD');

-- ═══════════════════════════════════════════════════════════════════════════
-- CODE MODULES
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO code_modules (udid, file_path, module_type, description, screen_udids, story_udids, loc) VALUES
('MOD001', 'core/src/lib.rs', 'rust', 'Point d''entrée du moteur Rust', '[]', '[]', 16),
('MOD002', 'core/src/engine/simulator.rs', 'rust', 'Moteur de simulation - calcul éligibilité', '["SCR002", "SCR003"]', '["US001", "US010"]', 500),
('MOD003', 'core/src/aides/rsa.rs', 'rust', 'Calcul RSA', '["SCR003"]', '["US010"]', 200),
('MOD004', 'core/src/aides/apl.rs', 'rust', 'Calcul APL', '["SCR003"]', '["US010", "US004"]', 250),
('MOD005', 'core/src/aides/prime_activite.rs', 'rust', 'Calcul Prime d''activité', '["SCR003"]', '["US010", "US003"]', 180),
('MOD006', 'core/src/aides/aah.rs', 'rust', 'Calcul AAH', '["SCR003"]', '["US010", "US005"]', 220),
('MOD007', 'core/src/i18n/mod.rs', 'rust', 'Module internationalisation', '[]', '["US030"]', 100),

('MOD010', 'web/js/simulateur.js', 'js', 'Logique formulaire simulateur', '["SCR002"]', '["US001", "US002", "US003", "US004"]', 2500),
('MOD011', 'web/js/resultats.js', 'js', 'Affichage et tri des résultats', '["SCR003"]', '["US010", "US011", "US014", "US015"]', 600),
('MOD012', 'web/js/aides.js', 'js', 'Catalogue des aides', '["SCR004"]', '["US020", "US021", "US022"]', 150),
('MOD013', 'web/js/i18n.js', 'js', 'Gestion des traductions', '[]', '["US030"]', 100),
('MOD014', 'web/js/nav.js', 'js', 'Navigation et menu', '["SCR001", "SCR002", "SCR003", "SCR004"]', '[]', 150),
('MOD015', 'web/js/theme.js', 'js', 'Thème clair/sombre', '[]', '[]', 100),

('MOD020', 'web/css/tokens.css', 'css', 'Design tokens (couleurs, espacements)', '[]', '[]', 200),
('MOD021', 'web/css/main.css', 'css', 'Styles globaux', '[]', '[]', 800),
('MOD022', 'web/css/simulateur.css', 'css', 'Styles formulaire', '["SCR002"]', '[]', 400),
('MOD023', 'web/css/resultats.css', 'css', 'Styles résultats', '["SCR003"]', '[]', 300);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROLES & RBAC
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO roles (udid, name, description, permissions) VALUES
('ROLE001', 'anonymous', 'Utilisateur non connecté', '["view_public"]'),
('ROLE002', 'admin', 'Administrateur (maintenance)', '["view_all", "edit_content", "view_analytics"]');

INSERT INTO rbac_rules (udid, screen_udid, role_udid, permission) VALUES
('RBAC001', 'SCR001', 'ROLE001', 'view'),
('RBAC002', 'SCR002', 'ROLE001', 'view'),
('RBAC003', 'SCR003', 'ROLE001', 'view'),
('RBAC004', 'SCR004', 'ROLE001', 'view'),
('RBAC005', 'SCR005', 'ROLE001', 'view'),
('RBAC006', 'SCR006', 'ROLE001', 'view'),
('RBAC007', 'SCR007', 'ROLE001', 'view'),
('RBAC008', 'SCR008', 'ROLE001', 'view'),
('RBAC009', 'SCR009', 'ROLE001', 'view'),
('RBAC010', 'SCR010', 'ROLE001', 'view');

-- ═══════════════════════════════════════════════════════════════════════════
-- CRUD OPERATIONS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO crud_operations (udid, screen_udid, resource, can_create, can_read, can_update, can_delete, notes) VALUES
('CRUD001', 'SCR002', 'simulation_input', 1, 1, 1, 0, 'Utilisateur saisit sa situation - données locales uniquement'),
('CRUD002', 'SCR003', 'simulation_result', 0, 1, 0, 0, 'Lecture seule des résultats calculés'),
('CRUD003', 'SCR004', 'aide_catalog', 0, 1, 0, 0, 'Lecture seule du catalogue'),
('CRUD004', 'SCR005', 'aide_detail', 0, 1, 0, 0, 'Lecture seule fiche aide'),
('CRUD005', 'SCR001', 'user_preferences', 1, 1, 1, 1, 'Thème et langue - localStorage uniquement');

-- ═══════════════════════════════════════════════════════════════════════════
-- UI TOKENS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO ui_tokens (udid, category, name, css_var, value, description) VALUES
-- Colors
('TK-C001', 'color', 'primary', '--c-primary', '#0B6E4F', 'Couleur principale (teal)'),
('TK-C002', 'color', 'accent', '--c-accent', '#D97706', 'Couleur d''accent (orange)'),
('TK-C003', 'color', 'success', '--c-success', '#22c55e', 'Succès/validation'),
('TK-C004', 'color', 'warning', '--c-warning', '#f59e0b', 'Avertissement'),
('TK-C005', 'color', 'error', '--c-error', '#ef4444', 'Erreur'),
('TK-C006', 'color', 'bg-primary', '--bg-primary', '#ffffff', 'Fond principal'),
('TK-C007', 'color', 'bg-secondary', '--bg-secondary', '#f8fafc', 'Fond secondaire'),
('TK-C008', 'color', 'text-primary', '--text-primary', '#0f172a', 'Texte principal'),
('TK-C009', 'color', 'text-secondary', '--text-secondary', '#64748b', 'Texte secondaire'),
('TK-C010', 'color', 'border', '--border', '#e2e8f0', 'Bordures'),
-- Spacing
('TK-S001', 'spacing', 'xs', '--sp-xs', '4px', 'Espacement extra-small'),
('TK-S002', 'spacing', 'sm', '--sp-sm', '8px', 'Espacement small'),
('TK-S003', 'spacing', 'md', '--sp-md', '16px', 'Espacement medium'),
('TK-S004', 'spacing', 'lg', '--sp-lg', '24px', 'Espacement large'),
('TK-S005', 'spacing', 'xl', '--sp-xl', '32px', 'Espacement extra-large'),
('TK-S006', 'spacing', '2xl', '--sp-2xl', '48px', 'Espacement 2x-large'),
-- Font
('TK-F001', 'font', 'family', '--font-family', 'system-ui, sans-serif', 'Police système'),
('TK-F002', 'font', 'size-xs', '--fs-xs', '12px', 'Taille texte xs'),
('TK-F003', 'font', 'size-sm', '--fs-sm', '14px', 'Taille texte sm'),
('TK-F004', 'font', 'size-base', '--fs-base', '16px', 'Taille texte base'),
('TK-F005', 'font', 'size-lg', '--fs-lg', '18px', 'Taille texte lg'),
('TK-F006', 'font', 'size-xl', '--fs-xl', '20px', 'Taille texte xl'),
('TK-F007', 'font', 'size-2xl', '--fs-2xl', '24px', 'Taille texte 2xl'),
('TK-F008', 'font', 'weight-normal', '--fw-normal', '400', 'Graisse normale'),
('TK-F009', 'font', 'weight-medium', '--fw-medium', '500', 'Graisse medium'),
('TK-F010', 'font', 'weight-bold', '--fw-bold', '700', 'Graisse bold'),
-- Radius
('TK-R001', 'radius', 'sm', '--radius-sm', '4px', 'Radius small'),
('TK-R002', 'radius', 'md', '--radius-md', '8px', 'Radius medium'),
('TK-R003', 'radius', 'lg', '--radius-lg', '12px', 'Radius large'),
('TK-R004', 'radius', 'full', '--radius-full', '9999px', 'Radius pill'),
-- Shadow
('TK-SH001', 'shadow', 'sm', '--shadow-sm', '0 1px 2px rgba(0,0,0,.05)', 'Ombre légère'),
('TK-SH002', 'shadow', 'md', '--shadow-md', '0 4px 6px rgba(0,0,0,.07)', 'Ombre medium'),
('TK-SH003', 'shadow', 'lg', '--shadow-lg', '0 10px 15px rgba(0,0,0,.1)', 'Ombre large');

-- ═══════════════════════════════════════════════════════════════════════════
-- LANGUAGES (40 langues target)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO languages (udid, code, name, native_name, direction, locale_file, completion_pct) VALUES
('LANG-FR', 'fr', 'French', 'Français', 'ltr', 'locales/fr.json', 100),
('LANG-EN', 'en', 'English', 'English', 'ltr', 'locales/en.json', 100),
('LANG-AR', 'ar', 'Arabic', 'العربية', 'rtl', 'locales/ar.json', 80),
('LANG-ES', 'es', 'Spanish', 'Español', 'ltr', 'locales/es.json', 90),
('LANG-DE', 'de', 'German', 'Deutsch', 'ltr', 'locales/de.json', 85),
('LANG-IT', 'it', 'Italian', 'Italiano', 'ltr', 'locales/it.json', 85),
('LANG-PT', 'pt', 'Portuguese', 'Português', 'ltr', 'locales/pt.json', 85),
('LANG-ZH', 'zh', 'Chinese', '中文', 'ltr', 'locales/zh.json', 70),
('LANG-RU', 'ru', 'Russian', 'Русский', 'ltr', 'locales/ru.json', 75),
('LANG-TR', 'tr', 'Turkish', 'Türkçe', 'ltr', 'locales/tr.json', 60),
('LANG-PL', 'pl', 'Polish', 'Polski', 'ltr', 'locales/pl.json', 50),
('LANG-RO', 'ro', 'Romanian', 'Română', 'ltr', 'locales/ro.json', 50),
('LANG-UK', 'uk', 'Ukrainian', 'Українська', 'ltr', 'locales/uk.json', 40),
('LANG-VI', 'vi', 'Vietnamese', 'Tiếng Việt', 'ltr', 'locales/vi.json', 40),
('LANG-HE', 'he', 'Hebrew', 'עברית', 'rtl', 'locales/he.json', 30),
('LANG-FA', 'fa', 'Persian', 'فارسی', 'rtl', 'locales/fa.json', 20),
('LANG-JA', 'ja', 'Japanese', '日本語', 'ltr', 'locales/ja.json', 30),
('LANG-KO', 'ko', 'Korean', '한국어', 'ltr', 'locales/ko.json', 30),
('LANG-NL', 'nl', 'Dutch', 'Nederlands', 'ltr', 'locales/nl.json', 40),
('LANG-SV', 'sv', 'Swedish', 'Svenska', 'ltr', 'locales/sv.json', 30);
