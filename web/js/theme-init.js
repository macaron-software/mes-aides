(function(){var t=localStorage.getItem('theme');if(t&&t!=='light')document.documentElement.setAttribute('data-theme',t);
else if(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.setAttribute('data-theme','dark');}})();
