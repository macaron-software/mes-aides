    (function () {
      'use strict';

      var cards      = Array.from(document.querySelectorAll('.guide-card'));
      var emptyState = document.getElementById('empty-state');
      var countEl    = document.getElementById('guides-count');
      var filterBtns = Array.from(document.querySelectorAll('.filter-tab'));

      var activeFilter = 'all';

      function updateCount(visible) {
        if (countEl) {
          countEl.textContent = visible + ' guide' + (visible > 1 ? 's' : '') + ' disponible' + (visible > 1 ? 's' : '');
        }
      }

      function applyFilter() {
        var visible = 0;
        cards.forEach(function (card) {
          var cat  = card.getAttribute('data-cat') || '';
          var show = activeFilter === 'all' || cat === activeFilter;
          card.hidden = !show;
          if (show) visible += 1;
        });
        if (emptyState) emptyState.hidden = visible > 0;
        updateCount(visible);
      }

      filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          filterBtns.forEach(function (b) {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
          });
          btn.classList.add('active');
          btn.setAttribute('aria-pressed', 'true');
          activeFilter = btn.getAttribute('data-filter') || 'all';
          applyFilter();
        });
      });

      // Initial count
      updateCount(cards.length);
    })();
  </script>
