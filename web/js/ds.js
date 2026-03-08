<script>
  // Accordion demo
  document.querySelectorAll('.accordion__trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      const content = document.getElementById(btn.getAttribute('aria-controls'));
      if (content) content.classList.toggle('open', !expanded);
    });
  });
  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const h = document.documentElement;
    h.setAttribute('data-theme', h.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
