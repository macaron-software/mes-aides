-- Mes Aides Tracability Database Schema
-- SOC2 / ISO27001 compliant with full UDID tracing
-- Version: 1.0.0

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ═══════════════════════════════════════════════════════════════════════════
-- CORE TRACEABILITY TABLES (SAFe hierarchy)
-- ═══════════════════════════════════════════════════════════════════════════

-- Personas: who uses the system
CREATE TABLE personas (
    udid TEXT PRIMARY KEY,  -- UUID v4
    name TEXT NOT NULL,
    description TEXT,
    goals TEXT,  -- JSON array of goals
    pain_points TEXT,  -- JSON array
    demographics TEXT,  -- JSON: age_range, income, location, etc.
    accessibility_needs TEXT,  -- JSON: visual, motor, cognitive
    tech_proficiency TEXT CHECK(tech_proficiency IN ('low', 'medium', 'high')),
    priority INTEGER DEFAULT 1,  -- 1=primary, 2=secondary
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Features: high-level capabilities
CREATE TABLE features (
    udid TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,  -- F001, F002...
    title TEXT NOT NULL,
    description TEXT,
    persona_udids TEXT,  -- JSON array of persona UDIDs
    epic_ref TEXT,  -- SAFe epic reference
    priority TEXT CHECK(priority IN ('must', 'should', 'could', 'wont')),  -- MoSCoW
    status TEXT DEFAULT 'planned' CHECK(status IN ('planned', 'in_progress', 'done', 'blocked')),
    acceptance_summary TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- User Stories: detailed requirements
CREATE TABLE user_stories (
    udid TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,  -- US001, US002...
    feature_udid TEXT REFERENCES features(udid),
    as_a TEXT NOT NULL,  -- role/persona
    i_want TEXT NOT NULL,  -- action
    so_that TEXT NOT NULL,  -- benefit
    priority INTEGER DEFAULT 5,  -- 1-10
    story_points INTEGER,
    status TEXT DEFAULT 'backlog' CHECK(status IN ('backlog', 'ready', 'in_progress', 'review', 'done')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Acceptance Criteria: GIVEN/WHEN/THEN
CREATE TABLE acceptance_criteria (
    udid TEXT PRIMARY KEY,
    story_udid TEXT REFERENCES user_stories(udid),
    sequence INTEGER DEFAULT 1,
    given_clause TEXT NOT NULL,
    when_clause TEXT NOT NULL,
    then_clause TEXT NOT NULL,
    is_automated INTEGER DEFAULT 0,  -- bool: has E2E test
    test_udid TEXT,  -- reference to e2e_tests
    created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════════════════════════
-- IHM / UI TABLES
-- ═══════════════════════════════════════════════════════════════════════════

-- IHM Screens: UI pages/views
CREATE TABLE ihm_screens (
    udid TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,  -- SCR001, SCR002...
    name TEXT NOT NULL,
    route TEXT,  -- /simulateur, /resultats...
    file_path TEXT,  -- web/simulateur.html
    story_udids TEXT,  -- JSON array
    persona_udids TEXT,  -- JSON array of targeted personas
    description TEXT,
    wireframe_url TEXT,
    figma_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- IHM Components: UI elements on screens
CREATE TABLE ihm_components (
    udid TEXT PRIMARY KEY,
    screen_udid TEXT REFERENCES ihm_screens(udid),
    component_type TEXT NOT NULL,  -- form, button, card, input, select...
    component_id TEXT,  -- DOM id
    label TEXT,
    a11y_role TEXT,  -- ARIA role
    a11y_label TEXT,  -- aria-label
    keyboard_nav TEXT,  -- JSON: tab_order, shortcuts
    created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════════════════════════
-- CODE TRACEABILITY
-- ═══════════════════════════════════════════════════════════════════════════

-- Code Modules: source files
CREATE TABLE code_modules (
    udid TEXT PRIMARY KEY,
    file_path TEXT UNIQUE NOT NULL,
    module_type TEXT CHECK(module_type IN ('rust', 'js', 'html', 'css', 'swift', 'kotlin', 'config')),
    description TEXT,
    screen_udids TEXT,  -- JSON array of IHM screens this module serves
    story_udids TEXT,  -- JSON array of stories implemented
    loc INTEGER,  -- lines of code
    test_coverage_pct REAL,
    last_modified TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Functions/Methods: code-level tracing
CREATE TABLE code_functions (
    udid TEXT PRIMARY KEY,
    module_udid TEXT REFERENCES code_modules(udid),
    name TEXT NOT NULL,
    signature TEXT,
    description TEXT,
    story_udids TEXT,  -- JSON array
    is_public INTEGER DEFAULT 1,
    complexity INTEGER,  -- cyclomatic
    created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════════════════════════
-- TESTING TRACEABILITY
-- ═══════════════════════════════════════════════════════════════════════════

-- Unit Tests
CREATE TABLE unit_tests (
    udid TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,  -- TU001...
    module_udid TEXT REFERENCES code_modules(udid),
    function_udid TEXT REFERENCES code_functions(udid),
    test_name TEXT NOT NULL,
    test_file TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'passing', 'failing', 'skipped')),
    last_run TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- E2E Tests
CREATE TABLE e2e_tests (
    udid TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,  -- E2E001...
    screen_udid TEXT REFERENCES ihm_screens(udid),
    story_udid TEXT REFERENCES user_stories(udid),
    ac_udid TEXT REFERENCES acceptance_criteria(udid),
    test_name TEXT NOT NULL,
    test_file TEXT,  -- playwright spec file
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'passing', 'failing', 'skipped')),
    last_run TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════════════════════════
-- CRUD / RBAC
-- ═══════════════════════════════════════════════════════════════════════════

-- CRUD Operations per screen
CREATE TABLE crud_operations (
    udid TEXT PRIMARY KEY,
    screen_udid TEXT REFERENCES ihm_screens(udid),
    resource TEXT NOT NULL,  -- e.g., 'simulation', 'aide', 'user_preferences'
    can_create INTEGER DEFAULT 0,
    can_read INTEGER DEFAULT 1,
    can_update INTEGER DEFAULT 0,
    can_delete INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Roles
CREATE TABLE roles (
    udid TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions TEXT,  -- JSON array
    created_at TEXT DEFAULT (datetime('now'))
);

-- RBAC Rules: role-screen-permission mapping
CREATE TABLE rbac_rules (
    udid TEXT PRIMARY KEY,
    screen_udid TEXT REFERENCES ihm_screens(udid),
    role_udid TEXT REFERENCES roles(udid),
    permission TEXT CHECK(permission IN ('view', 'edit', 'admin', 'none')),
    conditions TEXT,  -- JSON: additional conditions
    created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════════════════════════
-- UX / UI DESIGN SYSTEM
-- ═══════════════════════════════════════════════════════════════════════════

-- UX Laws (from lawsofux.com)
CREATE TABLE ux_laws (
    udid TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,  -- UXL001...
    name TEXT NOT NULL,
    description TEXT,
    source_url TEXT,
    category TEXT,  -- heuristics, cognitive, visual, interaction
    applied_screens TEXT,  -- JSON array of screen UDIDs
    implementation_notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- UI Tokens (design tokens)
CREATE TABLE ui_tokens (
    udid TEXT PRIMARY KEY,
    category TEXT NOT NULL,  -- color, spacing, font, radius, shadow, z-index
    name TEXT NOT NULL,
    css_var TEXT,  -- --c-primary, --sp-md...
    value TEXT NOT NULL,
    description TEXT,
    usage_examples TEXT,  -- JSON array
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(category, name)
);

-- UI Components (atomic design)
CREATE TABLE ui_components (
    udid TEXT PRIMARY KEY,
    level TEXT CHECK(level IN ('atom', 'molecule', 'organism', 'template', 'page')),
    name TEXT NOT NULL,
    description TEXT,
    html_tag TEXT,
    css_class TEXT,
    tokens_used TEXT,  -- JSON array of token UDIDs
    a11y_requirements TEXT,  -- JSON
    source_file TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════════════════════════
-- ACCESSIBILITY (a11y)
-- ═══════════════════════════════════════════════════════════════════════════

-- A11y Patterns (from W3C APG)
CREATE TABLE a11y_patterns (
    udid TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,  -- A11Y001...
    name TEXT NOT NULL,  -- accordion, button, dialog...
    wcag_ref TEXT,  -- WCAG 2.2 reference
    apg_url TEXT,
    description TEXT,
    keyboard_interaction TEXT,  -- JSON
    aria_roles TEXT,  -- JSON array
    aria_attributes TEXT,  -- JSON array
    applied_components TEXT,  -- JSON array of component UDIDs
    created_at TEXT DEFAULT (datetime('now'))
);

-- A11y Checklist per screen
CREATE TABLE a11y_checklist (
    udid TEXT PRIMARY KEY,
    screen_udid TEXT REFERENCES ihm_screens(udid),
    criterion TEXT NOT NULL,  -- WCAG criterion ID: 1.1.1, 2.1.1...
    level TEXT CHECK(level IN ('A', 'AA', 'AAA')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'pass', 'fail', 'na')),
    notes TEXT,
    tested_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════════════════════════
-- i18n / l10n
-- ═══════════════════════════════════════════════════════════════════════════

-- Supported Languages
CREATE TABLE languages (
    udid TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,  -- fr, en, ar, zh...
    name TEXT NOT NULL,
    native_name TEXT,
    direction TEXT DEFAULT 'ltr' CHECK(direction IN ('ltr', 'rtl')),
    locale_file TEXT,
    completion_pct REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Translation Keys
CREATE TABLE i18n_keys (
    udid TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    description TEXT,
    context TEXT,  -- where used
    max_length INTEGER,  -- for UI constraints
    created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

-- Security Controls (SOC2/ISO27001)
CREATE TABLE security_controls (
    udid TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,  -- SEC001...
    control_type TEXT,  -- input_validation, auth, encryption, csp...
    soc2_ref TEXT,  -- SOC2 trust criteria
    iso27001_ref TEXT,  -- ISO27001 control
    owasp_ref TEXT,  -- OWASP reference
    description TEXT,
    implementation TEXT,
    status TEXT DEFAULT 'planned' CHECK(status IN ('planned', 'implemented', 'verified', 'na')),
    evidence TEXT,  -- path to evidence document
    verified_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- CVE Tracking
CREATE TABLE cve_tracking (
    udid TEXT PRIMARY KEY,
    cve_id TEXT,
    severity TEXT CHECK(severity IN ('critical', 'high', 'medium', 'low', 'info')),
    component TEXT,
    description TEXT,
    status TEXT DEFAULT 'open' CHECK(status IN ('open', 'mitigated', 'accepted', 'na')),
    mitigation TEXT,
    discovered_at TEXT,
    resolved_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════════════════════════
-- COMPLIANCE & AUDIT
-- ═══════════════════════════════════════════════════════════════════════════

-- Audit Log
CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    entity_type TEXT NOT NULL,
    entity_udid TEXT,
    action TEXT NOT NULL,  -- create, update, delete, verify
    actor TEXT,
    old_value TEXT,
    new_value TEXT,
    notes TEXT
);

-- Compliance Evidence
CREATE TABLE compliance_evidence (
    udid TEXT PRIMARY KEY,
    control_udid TEXT REFERENCES security_controls(udid),
    evidence_type TEXT,  -- screenshot, log, report, attestation
    file_path TEXT,
    description TEXT,
    captured_at TEXT,
    valid_until TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════════════════════════
-- OBSERVABILITY
-- ═══════════════════════════════════════════════════════════════════════════

-- Metrics Definitions
CREATE TABLE metrics (
    udid TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    type TEXT CHECK(type IN ('counter', 'gauge', 'histogram')),
    description TEXT,
    unit TEXT,
    otel_name TEXT,  -- OpenTelemetry metric name
    created_at TEXT DEFAULT (datetime('now'))
);

-- Alerts
CREATE TABLE alerts (
    udid TEXT PRIMARY KEY,
    metric_udid TEXT REFERENCES metrics(udid),
    name TEXT NOT NULL,
    condition TEXT,  -- threshold expression
    severity TEXT CHECK(severity IN ('info', 'warning', 'critical')),
    notification_channel TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX idx_stories_feature ON user_stories(feature_udid);
CREATE INDEX idx_ac_story ON acceptance_criteria(story_udid);
CREATE INDEX idx_screens_route ON ihm_screens(route);
CREATE INDEX idx_components_screen ON ihm_components(screen_udid);
CREATE INDEX idx_modules_type ON code_modules(module_type);
CREATE INDEX idx_unit_tests_module ON unit_tests(module_udid);
CREATE INDEX idx_e2e_tests_screen ON e2e_tests(screen_udid);
CREATE INDEX idx_rbac_screen ON rbac_rules(screen_udid);
CREATE INDEX idx_a11y_screen ON a11y_checklist(screen_udid);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_udid);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- VIEWS
-- ═══════════════════════════════════════════════════════════════════════════

-- Traceability matrix: Story → Screen → Code → Tests
CREATE VIEW v_traceability_matrix AS
SELECT 
    us.code AS story_code,
    us.as_a || ' ' || us.i_want AS story_summary,
    f.code AS feature_code,
    scr.code AS screen_code,
    scr.route AS screen_route,
    cm.file_path AS code_file,
    ut.code AS unit_test,
    e2e.code AS e2e_test
FROM user_stories us
LEFT JOIN features f ON us.feature_udid = f.udid
LEFT JOIN ihm_screens scr ON scr.story_udids LIKE '%' || us.udid || '%'
LEFT JOIN code_modules cm ON cm.story_udids LIKE '%' || us.udid || '%'
LEFT JOIN unit_tests ut ON ut.module_udid = cm.udid
LEFT JOIN e2e_tests e2e ON e2e.story_udid = us.udid;

-- Coverage summary
CREATE VIEW v_coverage_summary AS
SELECT 
    'Stories' AS category,
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS completed
FROM user_stories
UNION ALL
SELECT 
    'Screens',
    COUNT(*),
    COUNT(file_path)
FROM ihm_screens
UNION ALL
SELECT 
    'Unit Tests',
    COUNT(*),
    SUM(CASE WHEN status = 'passing' THEN 1 ELSE 0 END)
FROM unit_tests
UNION ALL
SELECT 
    'E2E Tests',
    COUNT(*),
    SUM(CASE WHEN status = 'passing' THEN 1 ELSE 0 END)
FROM e2e_tests
UNION ALL
SELECT 
    'Security Controls',
    COUNT(*),
    SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END)
FROM security_controls;

-- A11y compliance dashboard
CREATE VIEW v_a11y_compliance AS
SELECT 
    scr.code AS screen,
    scr.name AS screen_name,
    COUNT(*) AS total_criteria,
    SUM(CASE WHEN ac.status = 'pass' THEN 1 ELSE 0 END) AS passed,
    SUM(CASE WHEN ac.status = 'fail' THEN 1 ELSE 0 END) AS failed,
    ROUND(100.0 * SUM(CASE WHEN ac.status = 'pass' THEN 1 ELSE 0 END) / COUNT(*), 1) AS compliance_pct
FROM a11y_checklist ac
JOIN ihm_screens scr ON ac.screen_udid = scr.udid
GROUP BY scr.udid;
