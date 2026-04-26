const CACHE_NAME = 'unikfood-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/lk.html',
  '/order.html',
  '/history.html',
  '/payment.html',
  '/settings.html',
  '/css/style.css',
  '/js/app.js',
  '/js/api.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
