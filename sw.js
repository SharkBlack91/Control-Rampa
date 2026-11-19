// Service worker: guarda la app en el teléfono para que abra al instante y sin señal.
// Al publicar una versión nueva, cambia el número de VERSION.
const VERSION = 'rampa-v1';
const ARCHIVOS = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Solo archivos propios de la app; las llamadas a Google (API) pasan directo.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, {ignoreSearch: true}).then(hit => {
      const red = fetch(req).then(res => {
        if (res.ok) { const copia = res.clone(); caches.open(VERSION).then(c => c.put(req, copia)); }
        return res;
      }).catch(() => hit);
      return hit || red;   // muestra lo guardado al instante y actualiza en segundo plano
    })
  );
});
