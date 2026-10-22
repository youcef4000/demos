// Contenus publiés depuis l'espace équipe et gardés par le serveur (worker/academy.js) :
// textes modifiés (leçons, modules), voix off déposées, FAQ, réglages (WhatsApp, session, tarifs).
// Chargé avant le programme ; sans réponse (miroir GitHub Pages, hors ligne), la dernière version reçue
// sur cet appareil sert, sinon le contenu de base des fichiers du site.

const URL_PUB = new URL('../api/public', import.meta.url);
const KEY = 'hooked-academy:public:v1';
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);

let pub = null;
try {
  const ctl = new AbortController();
  const tm = setTimeout(() => ctl.abort(), 3500);
  const r = await fetch(URL_PUB, { cache: 'no-cache', signal: ctl.signal });
  clearTimeout(tm);
  if (r.ok && (r.headers.get('content-type') || '').includes('json')) {
    pub = await r.json();
    try {
      localStorage.setItem(KEY, JSON.stringify(pub));
    } catch {}
  }
} catch {}
if (!pub) {
  try {
    pub = JSON.parse(localStorage.getItem(KEY));
  } catch {}
}

/** null quand aucun serveur n'a jamais répondu. */
export const PUB = isObj(pub) ? pub : null;
export const pubEdits = () => (isObj(PUB?.edits) ? PUB.edits : {});
