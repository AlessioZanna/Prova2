const CACHE_NAME = 'calcetto-cambi-cache-v1';
const FILES_TO_CACHE = [
  '.',
  './index.html',
  './manifest.json',
  './sw.js',
  // Puoi aggiungere qui le icone, se vuoi:
  './icon-192.png',
  './icon-512.png',
];

// Installazione e caching
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Attivazione e cleanup vecchi cache
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if(key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch dalla cache o rete
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(resp => {
      return resp || fetch(evt.request);
    })
  );
});
