const CACHE_NAME = 'mamazul-review-race-v2';
const ASSETS = [
  'index.html',
  'app.js',
  'manifest.json',
  'web/icons/icon-192.png',
  'web/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(error => {
        console.warn('Caching media or icons failed, registering default assets first: ', error);
        return cache.add('index.html');
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Let Google sheets requests pass through to the network directly, with offline cache fallback if saved
  if (event.request.url.includes('spreadsheets')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});
