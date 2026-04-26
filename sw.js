const CACHE = 'unikfood-app-v1';
const BASE = '/unikfood-app';
const ASSETS = [
  BASE + '/index.html',
  BASE + '/lk.html',
  BASE + '/order.html',
  BASE + '/history.html',
  BASE + '/payment.html',
  BASE + '/settings.html',
  BASE + '/css/style.css',
  BASE + '/js/app.js',
  BASE + '/js/api.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('unsplash.com') ||
      e.request.url.includes('api.anthropic.com')) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
