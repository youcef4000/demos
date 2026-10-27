// Service worker de Sarraf (portée : /sarraf/) : l'application s'ouvre même sans réseau.
// - Pages, scripts, styles : réseau d'abord (dernière version), copie en cache pour le hors-ligne.
// - Images et polices : cache d'abord, rafraîchi en arrière-plan.
// - API (api/) : jamais en cache. Les mémos, eux, sont dans IndexedDB, pas ici.
// Changer VERSION à chaque modification de ce fichier : les anciens caches sont supprimés.

const VERSION = 'sarraf-2026-10-27b';
const COQUILLE = ['./', 'app.css', 'js/app.js', 'js/calcul.js', 'js/lecture.js', 'js/base.js', 'manifest.webmanifest', 'img/icone.svg', 'img/icone-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(COQUILLE.map((u) => new URL(u, self.registration.scope)))));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((cles) => Promise.all(cles.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const statique = (p) => /\.(png|svg|webp|jpe?g|ico|woff2?|ttf)$/i.test(p);

async function reseauDabord(req) {
  const cache = await caches.open(VERSION);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') return cache.match(new URL('./', self.registration.scope));
    throw err;
  }
}

async function cacheDabord(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req);
  const maj = fetch(req)
    .then((res) => {
      if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  return hit || (await maj) || Response.error();
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const portee = new URL(self.registration.scope);
  if (/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) return e.respondWith(cacheDabord(req));
  if (url.origin !== portee.origin || !url.pathname.startsWith(portee.pathname)) return;
  if (url.pathname.startsWith(`${portee.pathname}api/`)) return;
  e.respondWith(statique(url.pathname) ? cacheDabord(req) : reseauDabord(req));
});
