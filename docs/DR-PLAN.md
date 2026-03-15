# Disaster Recovery Plan — Mes Aides

## Overview

Mes Aides is a static site with no backend state. DR is simplified: redeploy static files.

---

## 1. RTO / RPO Targets

| Metric | Target | Justification |
|--------|--------|---------------|
| **RTO** (Recovery Time Objective) | 15 minutes | Static files, simple deployment |
| **RPO** (Recovery Point Objective) | 0 (no data loss) | No user data stored |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION STACK                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌───────────────┐    ┌───────────────┐                    │
│   │  GitHub Repo  │───>│  OVH VPS      │                    │
│   │  (source)     │    │  nginx        │                    │
│   └───────────────┘    │  /var/www/    │                    │
│                        │  aides/       │                    │
│                        └───────────────┘                    │
│                               │                              │
│                               ▼                              │
│                        ┌───────────────┐                    │
│                        │  Let's Encrypt│                    │
│                        │  TLS cert     │                    │
│                        └───────────────┘                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Components

| Component | Type | Recovery Method |
|-----------|------|-----------------|
| HTML/CSS/JS | Static files | Redeploy from git |
| nginx config | Configuration | Ansible/manual |
| TLS certificate | Auto-renewed | Certbot auto-recovery |
| DNS | Cloudflare/OVH | No change needed |

---

## 3. Failure Scenarios

### Scenario A: VPS Down

**Symptoms:** Site unreachable, nginx not responding

**Recovery Steps:**
1. SSH to VPS: `ssh debian@OVH_IP`
2. If SSH fails, reboot via OVH console
3. Check nginx: `sudo systemctl status nginx`
4. Restart if needed: `sudo systemctl restart nginx`
5. Verify: `curl -I https://aides.macaron-software.com`

**Time:** 5-10 minutes

### Scenario B: Files Corrupted/Deleted

**Symptoms:** 404 errors, partial content

**Recovery Steps:**
1. Redeploy from git:
   ```bash
   cd /var/www/aides
   git pull origin main
   # or full clone if .git corrupted
   rm -rf /var/www/aides
   git clone https://github.com/macaron-software/mes-aides.git /var/www/aides
   ```
2. Fix permissions:
   ```bash
   sudo chown -R www-data:www-data /var/www/aides/web
   sudo chmod -R 755 /var/www/aides/web
   ```
3. Reload nginx: `sudo systemctl reload nginx`

**Time:** 5 minutes

### Scenario C: TLS Certificate Expired

**Symptoms:** Browser SSL warning

**Recovery Steps:**
1. Renew certificate:
   ```bash
   sudo certbot renew --force-renewal
   ```
2. Verify: `sudo certbot certificates`
3. Reload nginx: `sudo systemctl reload nginx`

**Time:** 2 minutes

### Scenario D: VPS Compromised

**Symptoms:** Unexpected content, unauthorized access

**Recovery Steps:**
1. Take VPS offline (OVH console)
2. Create new VPS instance
3. Run deployment playbook:
   ```bash
   ansible-playbook -i inventory deploy.yml
   ```
4. Update DNS if IP changed
5. Notify incident (if required)

**Time:** 30-60 minutes

### Scenario E: GitHub Repository Compromised

**Symptoms:** Malicious code deployed

**Recovery Steps:**
1. Revoke GitHub deploy keys
2. Restore from known-good commit:
   ```bash
   git checkout <known-good-sha>
   ```
3. Force deploy to VPS
4. Rotate all secrets
5. Security audit

**Time:** 30 minutes + audit time

---

## 4. Failover Strategy

### Primary: OVH VPS (France)

- Location: Gravelines, France
- Provider: OVH
- Domain: aides.macaron-software.com

### Backup Options

| Option | Setup Time | Cost |
|--------|------------|------|
| GitHub Pages | 5 min | Free |
| Cloudflare Pages | 10 min | Free |
| Netlify | 10 min | Free |
| Second OVH VPS | 30 min | €5/month |

### Quick Failover to GitHub Pages

```bash
# In emergency, push to gh-pages branch
git subtree push --prefix web origin gh-pages

# Update DNS to point to github.io
# Add CNAME file to web/ folder
```

---

## 5. Backup Strategy

### What to Backup

| Item | Frequency | Location | Retention |
|------|-----------|----------|-----------|
| Source code | Continuous | GitHub | Indefinite |
| nginx config | On change | git + VPS | 30 days |
| Let's Encrypt | Auto | /etc/letsencrypt | Auto-managed |
| Barèmes data | Embedded | In source | Version-controlled |

### Backup Verification

Monthly test:
```bash
# Clone fresh and verify build
git clone https://github.com/macaron-software/mes-aides.git /tmp/test-aides
cd /tmp/test-aides
cargo build --release -p aides-api
# Success = backup is good
rm -rf /tmp/test-aides
```

---

## 6. Communication Plan

### During Incident

| Audience | Channel | Message |
|----------|---------|---------|
| Users | Site banner (if partial) | "Service temporairement indisponible" |
| Team | Slack #incidents | Status updates |
| Public | Twitter/X | Only if >1h outage |

### Post-Incident

1. Root cause analysis (RCA) document
2. Update runbook if needed
3. Implement preventive measures

---

## 7. Testing Schedule

| Test | Frequency | Last Test | Next Test |
|------|-----------|-----------|-----------|
| Full redeploy from git | Quarterly | 2026-03-01 | 2026-06-01 |
| TLS renewal | Monthly (auto) | 2026-03-10 | 2026-04-10 |
| Failover to backup | Annually | — | 2026-06-01 |
| Recovery time measurement | Quarterly | — | 2026-06-01 |

---

## 8. Runbook: Full Recovery

### Prerequisites
- SSH access to VPS (or OVH console)
- Git repository access
- DNS access (OVH/Cloudflare)

### Steps

```bash
# 1. Provision new VPS (if needed)
# Via OVH console, select Debian 12

# 2. Initial setup
ssh root@NEW_IP
apt update && apt upgrade -y
apt install -y nginx certbot python3-certbot-nginx git

# 3. Deploy application
git clone https://github.com/macaron-software/mes-aides.git /var/www/aides
chown -R www-data:www-data /var/www/aides/web

# 4. Configure nginx
cat > /etc/nginx/sites-available/aides << 'EOF'
server {
    listen 80;
    server_name aides.macaron-software.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name aides.macaron-software.com;
    root /var/www/aides/web;
    index index.html;

    ssl_certificate /etc/letsencrypt/live/aides.macaron-software.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aides.macaron-software.com/privkey.pem;

    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" always;

    location / {
        try_files $uri $uri/ =404;
    }

    gzip on;
    gzip_types text/plain text/css application/javascript application/json;
}
EOF

ln -s /etc/nginx/sites-available/aides /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# 5. Setup TLS
certbot --nginx -d aides.macaron-software.com --non-interactive --agree-tos -m admin@macaron-software.com

# 6. Verify
curl -I https://aides.macaron-software.com
```

---

## 9. Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| Primary oncall | Sylvain | 24/7 |
| OVH support | support@ovh.com | Business hours |
| Domain registrar | OVH | 24/7 online |

---

## 10. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-14 | Auto-generated | Initial version |
