    (function () {
      'use strict';

      var cards      = Array.from(document.querySelectorAll('.aid-card'));
      var emptyState = document.getElementById('empty-state');
      var countEl    = document.getElementById('result-count');
      var searchEl   = document.getElementById('search-aids');
      var filterBtns = Array.from(document.querySelectorAll('.filter-tab'));

      var activeFilter = 'all';
      var searchQuery  = '';

      function updateCount(visible) {
        if (countEl) {
          countEl.textContent = visible + ' aide' + (visible > 1 ? 's' : '') + ' disponible' + (visible > 1 ? 's' : '');
        }
      }

      function applyFilters() {
        var visible = 0;

        cards.forEach(function (card) {
          var cat     = card.getAttribute('data-cat') || '';
          var text    = card.textContent || '';
          var matchCat    = activeFilter === 'all' || cat === activeFilter;
          var matchSearch = searchQuery === '' || text.toLowerCase().indexOf(searchQuery) !== -1;
          var show = matchCat && matchSearch;
          card.hidden = !show;
          if (show) visible += 1;
        });

        if (emptyState) {
          emptyState.hidden = visible > 0;
        }
        updateCount(visible);
      }

      // Category filter buttons
      filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          filterBtns.forEach(function (b) {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
          });
          btn.classList.add('active');
          btn.setAttribute('aria-pressed', 'true');
          activeFilter = btn.getAttribute('data-filter') || 'all';
          applyFilters();
        });
      });

      // Search input
      if (searchEl) {
        searchEl.addEventListener('input', function () {
          searchQuery = (searchEl.value || '').trim().toLowerCase();
          applyFilters();
        });
      }
