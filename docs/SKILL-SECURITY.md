---
name: secure-by-design
description: Apply security-by-design principles to all code, architecture, and infrastructure decisions. Use this skill when building apps, APIs, reviewing code, or handling authentication, data, and deployments. Based on SecureByDesign v1.1 + OWASP Top 10 + NIST CSF.
---

# Security Skill

Reference: https://github.com/Yems221/securebydesign-llmskill

## CRITICALITY TIERS

| Tier | Systems | Enforcement |
|------|---------|-------------|
| LOW | Static sites, demos, personal projects | Core controls, advisory |
| STANDARD | SaaS, APIs, e-commerce, internal tools | All 25 controls |
| REGULATED | Finance, healthcare, gov, >10k PII | All + threat model required |

---

## THE 25 CONTROLS SUMMARY

### Layer 1: Input/Output Integrity

| ID | Control | Key Rule |
|----|---------|----------|
| SBD-01 | Input Validation | Server-side allowlist, parameterized queries |
| SBD-02 | Prompt Injection | Separate system/user content, never trust user in prompts |
| SBD-03 | Output Encoding | CSP headers, escape by context |

### Layer 2: Identity & Access

| ID | Control | Key Rule |
|----|---------|----------|
| SBD-04 | Authentication | Argon2id/bcrypt, MFA, rate-limit 5/min |
| SBD-05 | Authorization | Default DENY, server-side every request |
| SBD-06 | Least Privilege | Minimum permissions per service/user/key |

### Layer 3: Data & Crypto

| ID | Control | Key Rule |
|----|---------|----------|
| SBD-07 | Secrets Management | No creds in code, use env/vault |
| SBD-08 | Cryptography | AES-256-GCM, RSA-4096, TLS 1.3 only |
| SBD-09 | Data Minimization | Collect only necessary, purge old |

### Layer 4: Resilience

| ID | Control | Key Rule |
|----|---------|----------|
| SBD-10 | Security Logging | Log events not data, 90d retention |
| SBD-11 | Rate Limiting | Auth: 5/min/IP, set max_tokens for LLM |
| SBD-12 | SSRF Prevention | Block internal IPs, metadata endpoints |
| SBD-13 | Error Handling | Generic to user, detailed to logs |

### Layer 5: Supply Chain

| ID | Control | Key Rule |
|----|---------|----------|
| SBD-14 | Dependencies | Audit, pin versions, scan for vulns |
| SBD-15 | CI/CD Security | SHA-pinned actions, secrets in vault |

### Layer 6: Infrastructure

| ID | Control | Key Rule |
|----|---------|----------|
| SBD-16 | Network Segmentation | Zero Trust, mTLS internal |
| SBD-17 | Container Security | Non-root, read-only fs, no privileged |
| SBD-18 | Cloud Config | Private by default, audit public resources |

### Layer 7: LLM-Specific

| ID | Control | Key Rule |
|----|---------|----------|
| SBD-19 | Agent Boundaries | No destructive actions without confirm |
| SBD-20 | Output Validation | Never execute LLM output as code |
| SBD-21 | Fail Secure | Deny on error, never proceed on exception |

### Layer 8: Operations

| ID | Control | Key Rule |
|----|---------|----------|
| SBD-22 | Incident Response | Documented playbook, tested quarterly |
| SBD-23 | Backup & Recovery | Encrypted, tested restore, off-site |
| SBD-24 | Availability | Graceful degradation, circuit breakers |
| SBD-25 | Compliance | Map to SOC2/ISO27001, evidence trail |

---

## OWASP TOP 10 (2021)

| ID | Name | Mitigation |
|----|------|------------|
| A01 | Broken Access Control | SBD-05, SBD-06 |
| A02 | Cryptographic Failures | SBD-07, SBD-08, SBD-09 |
| A03 | Injection | SBD-01, SBD-02 |
| A04 | Insecure Design | Threat modeling, SBD-21 |
| A05 | Security Misconfiguration | SBD-03, SBD-13, SBD-18 |
| A06 | Vulnerable Components | SBD-14 |
| A07 | Auth Failures | SBD-04, SBD-11 |
| A08 | Software Integrity | SBD-15 |
| A09 | Logging Failures | SBD-10 |
| A10 | SSRF | SBD-12 |

---

## MES AIDES SECURITY PROFILE

### Tier: LOW (Static Site)
- No user accounts
- No backend (local-only calculation)
- No data transmission
- No cookies (except UI preferences)

### Applied Controls

| Control | Status | Notes |
|---------|--------|-------|
| SBD-01 | ✅ | Form validation client-side (no backend) |
| SBD-03 | ✅ | CSP strict, no external scripts |
| SBD-07 | N/A | No secrets (no backend) |
| SBD-08 | N/A | No encryption needed (no data storage) |
| SBD-09 | ✅ | Zero data collection by design |
| SBD-13 | N/A | No server errors (static) |
| SBD-14 | ✅ | No runtime dependencies |

### CSP Policy (Strict)
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self';
  object-src 'none';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

### Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

---

## FORBIDDEN PATTERNS

```python
# NEVER: SQL concatenation
query = "SELECT * FROM users WHERE id = " + user_id

# NEVER: Hardcoded secrets
API_KEY = "sk-1234567890abcdef"

# NEVER: Weak hashing
password_hash = hashlib.md5(password).hexdigest()

# NEVER: eval user input
result = eval(user_input)

# NEVER: Trust client validation only
if form.is_valid():  # must re-validate server-side
```

---

## SECURE PATTERNS

```python
# Parameterized queries
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))

# Environment secrets
import os
API_KEY = os.environ.get("API_KEY")

# Argon2 hashing
from argon2 import PasswordHasher
ph = PasswordHasher()
hash = ph.hash(password)

# Input validation
from pydantic import BaseModel, Field
class UserInput(BaseModel):
    name: str = Field(max_length=100, pattern=r'^[a-zA-Z\s]+$')
    age: int = Field(ge=0, le=150)
```

---

## AUDIT CHECKLIST

```
□ No secrets in code (scan with gitleaks)
□ Dependencies audited (npm audit, cargo audit)
□ CSP headers enforced
□ Input validation server-side
□ Parameterized queries only
□ Passwords hashed with Argon2/bcrypt
□ Rate limiting on auth endpoints
□ HTTPS only (TLS 1.3)
□ Security logs exclude PII content
□ Error messages generic to users
□ Third-party libs pinned to versions
□ CI/CD uses SHA-pinned actions
```

---

## REFERENCES

- OWASP Top 10: https://owasp.org/Top10/
- OWASP LLM Top 10: https://genai.owasp.org/
- SecureByDesign: https://github.com/Yems221/securebydesign-llmskill
- NIST CSF 2.0: https://www.nist.gov/cyberframework
- CIS Controls: https://www.cisecurity.org/controls
