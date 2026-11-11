// Service worker de Benna (portée : /benna/) : l'application s'ouvre et les recettes se lisent sans réseau.
// - Pages, scripts, styles : réseau d'abord (dernière version), copie en cache pour le hors-ligne.
// - Images, polices, vidéos : cache d'abord, rafraîchi en arrière-plan.
// Changer VERSION à chaque modification de ce fichier : les anciens caches sont supprimés.

const VERSION = 'benna-2026-11-11b';
const COQUILLE = [
  './', 'style.css', 'manifest.webmanifest', 'img/icone.svg', 'img/icone-192.png',
  'fonts/dm-sans-latin-wght-normal.woff2', 'fonts/fraunces-latin-wght-normal.woff2',
  'fonts/tajawal-arabic-400-normal.woff2', 'fonts/tajawal-arabic-500-normal.woff2', 'fonts/tajawal-arabic-700-normal.woff2', 'fonts/tajawal-arabic-800-normal.woff2',
  'js/app.js', 'js/config.js', 'js/core.js', 'js/etat.js', 'js/i18n.js', 'js/ui.js',
  'js/data/index.js', 'js/data/ingredients.js', 'js/data/extras.js',
  'js/data/recettes-dz-sale.js', 'js/data/recettes-dz-sucre.js', 'js/data/recettes-monde-sale.js', 'js/data/recettes-monde-sucre.js',
  'js/vues/decouvrir.js', 'js/vues/recette.js', 'js/vues/outils.js', 'js/vues/apprendre.js', 'js/vues/moi.js', 'js/vues/pro.js',
];

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

const statique = (p) => /\.(png|svg|webp|jpe?g|ico|woff2?|mp4)$/i.test(p);

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
      // Une réponse partielle (vidéo lue par morceaux) ne se met pas en cache.
      if (res.ok && res.status === 200) cache.put(req, res.clone());
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
  if (url.origin !== portee.origin || !url.pathname.startsWith(portee.pathname)) return;
  if (req.headers.has('range')) return; // la lecture par morceaux passe directement par le réseau
  e.respondWith(statique(url.pathname) ? cacheDabord(req) : reseauDabord(req));
});
