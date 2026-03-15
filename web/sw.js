// Service Worker — Mes Aides
// Offline-first with cache-then-network strategy

const CACHE_NAME = 'mes-aides-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/simulateur.html',
  '/resultats.html',
  '/aides.html',
  '/guides.html',
  '/accessibilite.html',
  '/css/tokens.css',
  '/css/base.css',
  '/css/components.css',
  '/js/app.js',
  '/js/i18n.js',
  '/js/nav.js',
  '/js/simulateur.js',
  '/js/resultats.js',
  '/js/theme.js',
  '/js/theme-init.js',
  '/manifest.json',
  '/img/icon-192.png',
  '/img/icon-512.png'
];

const LOCALE_CACHE = 'mes-aides-locales-v1';
const DYNAMIC_CACHE = 'mes-aides-dynamic-v1';

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== LOCALE_CACHE && key !== DYNAMIC_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for static, network-first for API
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip external requests
  if (url.origin !== location.origin) return;
  
  // API requests: network-first (if API deployed)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Locale files: cache-first with background update
  if (url.pathname.startsWith('/locales/')) {
    event.respondWith(staleWhileRevalidate(request, LOCALE_CACHE));
    return;
  }
  
  // Static assets: cache-first
  event.respondWith(cacheFirst(request));
});

// Cache-first strategy
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Return offline page if available
    return caches.match('/index.html');
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match(request);
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  return cached || fetchPromise;
}

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data === 'clearCache') {
    caches.keys().then(keys => 
      Promise.all(keys.map(key => caches.delete(key)))
    );
  }
});
