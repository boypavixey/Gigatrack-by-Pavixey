// ⚠️ BUMP THIS VERSION NUMBER ON EVERY SINGLE DEPLOY, NO EXCEPTIONS
// (not just when index.html/manifest/icons change — always)
const CACHE_NAME = 'gigatrack-shell-v2';
const SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/iconsizebig.png',
  '/iconsizesmall.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  /* Supabase traffic (reads and writes) must never be cached or intercepted.
     Bail out with no respondWith() so the browser handles it exactly as if
     there were no service worker at all. */
  if (url.hostname === 'supabase.co' || url.hostname.endsWith('.supabase.co')) {
    return;
  }

  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
