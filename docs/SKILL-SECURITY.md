---
name: secure-by-design
description: Apply security-by-design principles. Based on SecureByDesign v1.1 + OWASP Top 10.
---

# Security Skill

Ref: https://github.com/Yems221/securebydesign-llmskill

## TIER: LOW (Static Site)
- No user accounts
- No backend (local-only calc)
- No data transmission
- No cookies (UI prefs only)

## 25 CONTROLS (summary)

| ID | Control | Key Rule |
|----|---------|----------|
| SBD-01 | Input Validation | Server-side allowlist, parameterized queries |
| SBD-02 | Prompt Injection | Separate system/user content |
| SBD-03 | Output Encoding | CSP headers, escape by context |
| SBD-04 | Auth | Argon2id/bcrypt, MFA, rate-limit 5/min |
| SBD-05 | AuthZ | Default DENY, server-side every req |
| SBD-06 | Least Privilege | Min permissions per service/key |
| SBD-07 | Secrets | No creds in code, use env/vault |
| SBD-08 | Crypto | AES-256-GCM, RSA-4096, TLS 1.3 |
| SBD-09 | Data Minimization | Collect only necessary, purge old |
| SBD-10 | Logging | Log events not data, 90d retention |
| SBD-11 | Rate Limiting | Auth: 5/min/IP, max_tokens for LLM |
| SBD-12 | SSRF Prevention | Block internal IPs, metadata endpoints |
| SBD-13 | Error Handling | Generic to user, detailed to logs |

## MES AIDES PROFILE

| Control | Status | Notes |
|---------|--------|-------|
| SBD-01 | ✅ | Client-side validation only (no backend) |
| SBD-03 | ✅ | CSP strict, no ext scripts |
| SBD-07/08 | N/A | No secrets needed (no backend) |
| SBD-09 | ✅ | Zero data collection by design |
| SBD-14 | ✅ | No runtime deps |

## CSP (strict)
```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
img-src 'self' data:; font-src 'self'; connect-src 'self';
object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';
```

## SECURITY HEADERS
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

## FORBIDDEN
```python
# NEVER: SQL concat
query = "SELECT * FROM users WHERE id = " + user_id
# NEVER: Hardcoded secrets
API_KEY = "sk-1234567890abcdef"
# NEVER: eval user input
result = eval(user_input)
```

## SECURE
```python
# Parameterized
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
# Env secrets
import os; API_KEY = os.environ.get("API_KEY")
```
