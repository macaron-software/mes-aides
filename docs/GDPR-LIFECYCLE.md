# GDPR Data Lifecycle — Mes Aides

## Executive Summary

**Mes Aides is GDPR-compliant by design**: no personal data is collected, processed, or stored.

---

## 1. Data Categories

### Data NOT Collected

| Category | Status | Reason |
|----------|--------|--------|
| Name | ❌ Not collected | Not needed for simulation |
| Email | ❌ Not collected | No accounts |
| Address | ❌ Not collected | Only dept code used |
| IP address | ❌ Not collected | No server logs |
| Device fingerprint | ❌ Not collected | No tracking |
| Cookies | ❌ Not used | No sessions |

### Data Used (Client-Side Only)

| Category | Storage | Retention | Purpose |
|----------|---------|-----------|---------|
| Simulation inputs | localStorage | User-controlled | Save progress |
| UI preferences | localStorage | User-controlled | Theme, language |
| Results | localStorage | User-controlled | Review later |

**All localStorage data is:**
- Stored on user's device only
- Never transmitted to any server
- Deletable by user at any time
- Cleared automatically with browser data

---

## 2. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      USER'S BROWSER                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────┐      ┌──────────────┐                    │
│   │   Form       │ ───> │  Simulation  │                    │
│   │   Inputs     │      │   Engine     │                    │
│   └──────────────┘      │   (WASM)     │                    │
│         │               └──────┬───────┘                    │
│         │                      │                            │
│         ▼                      ▼                            │
│   ┌──────────────┐      ┌──────────────┐                    │
│   │ localStorage │      │   Results    │                    │
│   │  (optional)  │      │   Display    │                    │
│   └──────────────┘      └──────────────┘                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ ZERO data
                          │ transmitted
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET / SERVERS                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ❌ No analytics                                            │
│   ❌ No tracking                                             │
│   ❌ No data collection                                      │
│   ❌ No user accounts                                        │
│   ❌ No cookies                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. GDPR Articles Compliance

### Article 5 — Principles

| Principle | Compliance | Notes |
|-----------|------------|-------|
| Lawfulness | ✅ | No processing = no legal basis needed |
| Purpose limitation | ✅ | N/A — no collection |
| Data minimization | ✅ | Zero data collected |
| Accuracy | ✅ | N/A — no storage |
| Storage limitation | ✅ | N/A — no storage |
| Integrity & confidentiality | ✅ | Client-side only |

### Article 6 — Lawful Basis

**Not applicable**: Mes Aides does not process personal data.

If the optional API is used (POST /api/simulate):
- Data is processed in-memory only
- No logging, no storage
- Legitimate interest basis would apply

### Article 13/14 — Information Duty

Privacy notice provided at `/confidentialite.html` explaining:
- No data is collected
- localStorage is user-controlled
- How to delete local data

### Article 15-22 — Data Subject Rights

| Right | Implementation |
|-------|---------------|
| Access | User controls localStorage directly |
| Rectification | User edits inputs directly |
| Erasure | User clears browser data |
| Portability | localStorage exportable |
| Objection | N/A — no processing |

---

## 4. Technical Measures

### Client-Side Storage

```javascript
// Clear all local data
function clearAllData() {
  localStorage.clear();
  sessionStorage.clear();
}

// Export data (for portability)
function exportData() {
  return JSON.stringify({
    localStorage: { ...localStorage },
    exportedAt: new Date().toISOString()
  });
}
```

### API (Optional)

If backend API is deployed:

```rust
// No logging of request bodies
// No IP logging
// No persistent storage

async fn simulate(Json(situation): Json<Situation>) -> impl IntoResponse {
    let result = Simulator::new().simulate(&situation);
    // situation dropped immediately after response
    Json(result)
}
```

---

## 5. Backup & Restore

### There is no backup

- No server-side data = no backup needed
- Client localStorage is device-local
- Users are responsible for their own browser data

### Data Recovery

If a user asks "where is my data?":
- Explain it was stored locally only
- Cannot be recovered by us
- Recommend running simulation again

---

## 6. Data Breach Protocol

### Risk Assessment: VERY LOW

No data breach possible because:
- No personal data is collected
- No database to breach
- No user accounts to compromise
- No credentials stored

### If Breach Occurred (Theoretical)

If static files were compromised:
1. No personal data would be exposed (none exists)
2. Replace compromised files
3. Notify users via website notice
4. No CNIL notification required (no personal data)

---

## 7. CNIL Compliance (France)

### Cookies

**Exempt from consent** per CNIL guidelines because:
- No third-party cookies
- No analytics cookies
- localStorage used only for user preference (exempt)

### RGPD Record (Article 30)

**Record not required** because:
- No systematic personal data processing
- No filing system
- No profiling

---

## 8. Third Parties

| Third Party | Data Shared | Purpose |
|-------------|-------------|---------|
| GitHub Pages / OVH | None | Static hosting |
| data.gouv.fr MCP | None | Public barèmes data |
| Let's Encrypt | None | TLS certificates |

**No data processors** — all processing is client-side.

---

## 9. User Communication

### Privacy Banner

```html
<!-- No cookie banner needed — no cookies! -->
<!-- Instead, show privacy-positive message -->
<aside class="privacy-notice" role="note">
  Vos données restent sur votre appareil. 
  Nous ne collectons rien.
  <button onclick="this.parentElement.remove()">OK</button>
</aside>
```

### FAQ Entries

**Q: Mes données sont-elles collectées ?**
A: Non. Le calcul se fait entièrement sur votre appareil. Aucune donnée n'est envoyée à nos serveurs.

**Q: Comment supprimer mes données ?**
A: Videz le stockage local de votre navigateur (Paramètres > Données de navigation > Stockage local) ou utilisez le bouton "Effacer mes données" dans l'application.

---

## 10. Annual Review Checklist

- [ ] Verify no new data collection added
- [ ] Check third-party integrations
- [ ] Update privacy notice if needed
- [ ] Review localStorage usage
- [ ] Confirm no analytics/tracking added
- [ ] Test data clearing function

**Last review:** 2026-03-14
**Next review:** 2027-03-14
