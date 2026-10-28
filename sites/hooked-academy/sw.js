// Service worker de l'application installable Hooked Academy (portée : /hooked-academy/).
// - Pages, scripts, styles, données : réseau d'abord (toujours la dernière version en ligne),
//   copie en cache pour rouvrir l'application hors ligne.
// - Images et polices : cache d'abord, rafraîchi en arrière-plan.
// - API, fichiers du serveur (media/), voix off et vidéos : jamais en cache (données privées, lectures partielles).
// Changer VERSION à chaque modification de ce fichier : les anciens caches sont supprimés.

const VERSION = 'ha-2026-10-28a';
const PAGES = `${VERSION}-pages`;
const FILES = `${VERSION}-fichiers`;
const PRECACHE = ['offline.html', 'assets/img/icon-192.png', 'assets/img/favicon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(PAGES).then((c) => c.addAll(PRECACHE.map((u) => new URL(u, self.registration.scope)))));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const scope = () => new URL(self.registration.scope);
const isMedia = (p) => /\.(m4a|mp3|mp4|webm|wav|ogg)$/i.test(p);
const isStatic = (p) => /\.(webp|png|jpe?g|svg|gif|ico|woff2?|ttf)$/i.test(p);

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok && res.type !== 'opaqueredirect') cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: req.mode === 'navigate' });
    if (hit) return hit;
    if (req.mode === 'navigate') return caches.match(new URL('offline.html', scope()));
    throw err;
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(FILES);
  const hit = await cache.match(req);
  const update = fetch(req)
    .then((res) => {
      if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  return hit || (await update) || Response.error();
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const s = scope();
  const sameScope = url.origin === s.origin && url.pathname.startsWith(s.pathname);
  // Polices Google et bibliothèque d'animation (version fixée) : cache d'abord
  if (/^(fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net)$/.test(url.hostname)) return e.respondWith(cacheFirst(req));
  if (!sameScope) return;
  if (url.pathname.startsWith(`${s.pathname}api/`) || url.pathname.startsWith(`${s.pathname}media/`) || isMedia(url.pathname) || req.headers.has('range')) return;
  if (isStatic(url.pathname)) return e.respondWith(cacheFirst(req));
  e.respondWith(networkFirst(req, req.mode === 'navigate' ? PAGES : FILES));
});

self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
