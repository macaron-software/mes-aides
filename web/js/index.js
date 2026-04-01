// ── Accordion ──────────────────────────────────────────────────────────────
document.querySelectorAll('.accordion__trigger').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.accordion__trigger').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      document.getElementById(b.getAttribute('aria-controls'))?.classList.remove('open');
    });
    if (!expanded) {
      btn.setAttribute('aria-expanded', 'true');
      document.getElementById(btn.getAttribute('aria-controls'))?.classList.add('open');
    }
  });
});

// ── Copy announcement text ────────────────────────────────────────────────
document.querySelectorAll('[data-copy-text]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const text = btn.getAttribute('data-copy-text');
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      const original = btn.textContent;
      btn.textContent = 'Copié';
      setTimeout(() => { btn.textContent = original; }, 1400);
    } catch {
      window.prompt('Copiez le message', text);
    }
  });
});
