// Minimal accordion + i18n bootstrap for landing page
document.addEventListener('DOMContentLoaded', () => {
  // ── Accordion ───────────────────────────────────────────────────────────
  document.querySelectorAll('.accordion__trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      const content = document.getElementById(btn.getAttribute('aria-controls'));
      if (content) content.classList.toggle('open', !expanded);
    });
  });
});
