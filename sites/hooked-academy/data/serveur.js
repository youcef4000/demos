// Contenus publiés depuis l'espace équipe et gardés par le serveur (worker/academy.js) :
// textes modifiés (leçons, modules), voix off déposées, FAQ, réglages (WhatsApp, session, tarifs).
// Chargé avant le programme ; sans réponse (miroir GitHub Pages, hors ligne), la dernière version reçue
// sur cet appareil sert, sinon le contenu de base des fichiers du site.

import { SITE_ROOT, ALT_ROOT, setRoot, siteUrl } from '../assets/js/api.js';

const KEY = 'hooked-academy:public:v1';
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);

/** Contenu public d'une adresse de serveur, ou null (pas de serveur, pas de réponse à temps). */
async function fromServer(root, ms) {
  const ctl = new AbortController();
  const tm = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(new URL('api/public', root), { cache: 'no-cache', credentials: 'omit', signal: ctl.signal });
    if (!r.ok || !(r.headers.get('content-type') || '').includes('json')) return null;
    const v = await r.json();
    return isObj(v) ? v : null;
  } catch {
    return null;
  } finally {
    clearTimeout(tm);
  }
}

let pub = null;
// Domaine principal : le sous-domaine du serveur d'abord (le même Worker, que la page vienne de Cloudflare ou de GitHub Pages)
for (const root of [ALT_ROOT, SITE_ROOT].filter(Boolean)) {
  pub = await fromServer(root, ALT_ROOT && root === SITE_ROOT ? 1500 : 3000);
  if (!pub) continue;
  setRoot(root);
  // Serveur sur un autre sous-domaine : les voix off se lisent à son adresse
  if (root !== SITE_ROOT && isObj(pub.voix)) for (const v of Object.values(pub.voix)) if (v && typeof v.audio === 'string') v.audio = siteUrl(v.audio);
  try {
    localStorage.setItem(KEY, JSON.stringify(pub));
  } catch {}
  break;
}
if (!pub) {
  try {
    pub = JSON.parse(localStorage.getItem(KEY));
  } catch {}
}

/** null quand aucun serveur n'a jamais répondu. */
export const PUB = isObj(pub) ? pub : null;
export const pubEdits = () => (isObj(PUB?.edits) ? PUB.edits : {});
