# Observability Strategy — Mes Aides

## Overview

Privacy-first observability: collect aggregate metrics, no PII, no user tracking.

---

## 1. Client-Side Metrics (Web Vitals)

### Implementation
```javascript
// web/js/metrics.js — Lightweight observability

const Metrics = {
  // Collect only aggregate, privacy-safe metrics
  buffer: [],
  
  init() {
    // Core Web Vitals (no user data)
    this.observeCLS();
    this.observeFID();
    this.observeLCP();
    this.observeTTFB();
    
    // App-specific (aggregates only)
    this.observeSimulatorUsage();
    
    // Flush on page unload
    window.addEventListener('pagehide', () => this.flush());
  },
  
  // Cumulative Layout Shift
  observeCLS() {
    if (!window.PerformanceObserver) return;
    let clsValue = 0;
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) clsValue += entry.value;
      }
    });
    observer.observe({ type: 'layout-shift', buffered: true });
    window.addEventListener('pagehide', () => this.record('cls', clsValue));
  },
  
  // First Input Delay
  observeFID() {
    if (!window.PerformanceObserver) return;
    const observer = new PerformanceObserver(list => {
      const entry = list.getEntries()[0];
      this.record('fid', entry.processingStart - entry.startTime);
    });
    observer.observe({ type: 'first-input', buffered: true });
  },
  
  // Largest Contentful Paint
  observeLCP() {
    if (!window.PerformanceObserver) return;
    let lcpValue = 0;
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      lcpValue = entries[entries.length - 1].startTime;
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    window.addEventListener('pagehide', () => this.record('lcp', lcpValue));
  },
  
  // Time To First Byte
  observeTTFB() {
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav) this.record('ttfb', nav.responseStart - nav.requestStart);
  },
  
  // App metrics (no PII)
  observeSimulatorUsage() {
    // Track wizard completion rate (aggregate only)
    window.addEventListener('simulator:step', e => {
      this.record('wizard_step', e.detail.step);
    });
    
    window.addEventListener('simulator:complete', () => {
      this.record('wizard_complete', 1);
    });
    
    window.addEventListener('simulator:abandon', () => {
      this.record('wizard_abandon', 1);
    });
  },
  
  record(name, value) {
    this.buffer.push({
      m: name,                    // metric name
      v: Math.round(value * 100) / 100, // value (rounded)
      t: Date.now(),              // timestamp
      p: location.pathname,       // page (no query params)
      d: screen.width < 768 ? 'm' : 'd' // device: mobile/desktop
    });
  },
  
  flush() {
    if (this.buffer.length === 0) return;
    
    // Only if API endpoint configured (optional)
    const endpoint = window.METRICS_ENDPOINT;
    if (!endpoint) {
      console.debug('[Metrics] No endpoint, discarding', this.buffer.length, 'metrics');
      this.buffer = [];
      return;
    }
    
    // Use sendBeacon for reliable delivery on page unload
    const payload = JSON.stringify({
      version: '1.0',
      metrics: this.buffer
    });
    
    navigator.sendBeacon(endpoint, payload);
    this.buffer = [];
  }
};

// Auto-init (only if not disabled)
if (!window.METRICS_DISABLED) {
  document.addEventListener('DOMContentLoaded', () => Metrics.init());
}

window.Metrics = Metrics;
```

---

## 2. Server-Side (API Only)

### Axum Metrics Middleware
```rust
// api/src/metrics.rs

use axum::{extract::Request, middleware::Next, response::Response};
use std::time::Instant;

pub async fn metrics_middleware(request: Request, next: Next) -> Response {
    let start = Instant::now();
    let method = request.method().clone();
    let path = request.uri().path().to_string();
    
    let response = next.run(request).await;
    
    let duration = start.elapsed();
    let status = response.status().as_u16();
    
    // Emit OTEL span (if configured)
    #[cfg(feature = "otel")]
    {
        use tracing::info_span;
        let span = info_span!(
            "http_request",
            http.method = %method,
            http.route = %path,
            http.status_code = status,
            http.duration_ms = duration.as_millis() as u64
        );
    }
    
    // Prometheus metrics (if configured)
    #[cfg(feature = "prometheus")]
    {
        HTTP_REQUEST_DURATION
            .with_label_values(&[&method.to_string(), &path, &status.to_string()])
            .observe(duration.as_secs_f64());
    }
    
    response
}
```

---

## 3. Metrics Collected

### Web Vitals (Privacy-Safe)

| Metric | Target | Description |
|--------|--------|-------------|
| LCP | <2.5s | Largest Contentful Paint |
| FID | <100ms | First Input Delay |
| CLS | <0.1 | Cumulative Layout Shift |
| TTFB | <800ms | Time To First Byte |

### App Metrics (Aggregate Only)

| Metric | Type | Description |
|--------|------|-------------|
| wizard_step | counter | Steps reached in simulator |
| wizard_complete | counter | Simulations completed |
| wizard_abandon | counter | Simulations abandoned |
| results_viewed | counter | Results pages viewed |

### NOT Collected (Privacy)

| Data | Reason |
|------|--------|
| IP addresses | Privacy |
| User agents (full) | Fingerprinting |
| Query parameters | May contain PII |
| User IDs | No accounts |
| Session IDs | No sessions |
| Referrers | Privacy |

---

## 4. Alerting Rules

### Availability
```yaml
# Alert if site unreachable
- alert: SiteDown
  expr: probe_success{job="aides-macaron"} == 0
  for: 2m
  labels:
    severity: critical
```

### Performance
```yaml
# Alert if LCP degrades
- alert: SlowLCP
  expr: histogram_quantile(0.75, rate(web_vitals_lcp_bucket[5m])) > 2500
  for: 10m
  labels:
    severity: warning
```

### Errors
```yaml
# Alert if API errors spike (if API deployed)
- alert: APIErrors
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
  for: 5m
  labels:
    severity: warning
```

---

## 5. Dashboard (Optional)

### Grafana Panels

```
┌─────────────────────────────────────────────────────┐
│                  MES AIDES                          │
├──────────────┬──────────────┬──────────────────────┤
│  LCP (p75)   │  FID (p75)   │   CLS (avg)          │
│   1.8s ✅    │   45ms ✅    │    0.05 ✅           │
├──────────────┴──────────────┴──────────────────────┤
│  Wizard Completion Rate: 78%                       │
│  ████████████████████░░░░░                         │
├────────────────────────────────────────────────────┤
│  Page Views (7d)           │  Device Split         │
│  12,450                    │  Mobile: 67%          │
│                            │  Desktop: 33%         │
└────────────────────────────────────────────────────┘
```

---

## 6. Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Web Vitals JS | 🟡 Ready | Add to pages |
| Metrics endpoint | ⚪ Optional | Only if backend deployed |
| Prometheus | ⚪ Optional | Only if backend deployed |
| Grafana | ⚪ Optional | Self-hosted or cloud |
| Alerting | ⚪ Optional | Uptime robot / Pingdom |

---

## 7. Privacy Compliance

### GDPR
- No personal data collected ✅
- No cookies ✅
- No consent needed ✅

### CNIL (France)
- Aggregate metrics only ✅
- No fingerprinting ✅
- No tracking ✅

### Browser Privacy Features
- Works with ad blockers ✅
- Works with tracking protection ✅
- Works in private browsing ✅
