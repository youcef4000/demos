// Suivi des campagnes sur les pages publiques (landing et /ia/), sans dépendance :
// - événements du pixel Meta (le pixel lui-même et son PageView viennent de /meta-pixel.js, servi par le serveur
//   à partir de META_PIXEL_ID ; sans ID, window.fbq n'existe pas et rien n'est envoyé) ;
// - ?plan=creative|ia|sites|pack2|pack3 : la formule à présélectionner dans le formulaire ;
// - utm_source, utm_campaign, utm_content : lus à l'arrivée, gardés pendant la session (onglet), envoyés avec la demande.
import { OFFRES } from '../../data/offres.js';

const fbq = (...args) => {
  try {
    if (typeof window.fbq === 'function') {
      window.fbq(...args);
      return true;
    }
  } catch {}
  return false;
};

/* ------------------------------------------------------------------ */
/* Formule : ?plan= et noms envoyés à Meta                             */
/* ------------------------------------------------------------------ */

// Valeurs de ?plan= → offre du formulaire (creative, ia, dev, both, all)
const PLANS = { creative: 'creative', ia: 'ia', sites: 'dev', pack2: 'both', pack3: 'all' };
// Nom de la formule dans les événements Meta : toujours en français, pour des rapports lisibles quelle que soit la langue
const NOMS = { creative: 'Formation Créative', ia: 'Formation IA', dev: 'Formation Sites & Apps', both: 'Pack Créative + IA', all: 'Pack complet' };

/** Offre demandée par ?plan= (null si absent ou inconnu : aucune présélection). */
export function planFromUrl() {
  try {
    return PLANS[String(new URLSearchParams(location.search).get('plan') || '').trim().toLowerCase()] || null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* UTM : gardés pendant la session                                     */
/* ------------------------------------------------------------------ */

const UTM_KEY = 'hooked-academy:utm';
const UTM_FIELDS = ['utm_source', 'utm_campaign', 'utm_content'];
const clip = (v) => String(v ?? '').trim().slice(0, 150);

// À l'arrivée : une URL avec des UTM remplace ceux de la session ; sans UTM, on garde ceux déjà vus.
(function captureUtm() {
  try {
    const q = new URLSearchParams(location.search);
    if (!UTM_FIELDS.some((k) => q.get(k))) return;
    sessionStorage.setItem(UTM_KEY, JSON.stringify(Object.fromEntries(UTM_FIELDS.map((k) => [k, clip(q.get(k))]))));
  } catch {}
})();

/** UTM de la session : { utm_source, utm_campaign, utm_content } (chaînes vides si aucun). */
export function utm() {
  let v = {};
  try {
    v = JSON.parse(sessionStorage.getItem(UTM_KEY) || '{}') || {};
  } catch {}
  return Object.fromEntries(UTM_FIELDS.map((k) => [k, clip(v[k])]));
}

/* ------------------------------------------------------------------ */
/* Événements Meta                                                     */
/* ------------------------------------------------------------------ */

/** Lead : à appeler seulement après une réponse OK du serveur. Une seule fois par page. */
let leadSent = false;
export function trackLead(offre) {
  if (leadSent) return;
  leadSent = true;
  const id = OFFRES[offre] ? offre : 'all';
  fbq('track', 'Lead', { content_name: NOMS[id], value: OFFRES[id], currency: 'DZD' });
}

const seen = new Set();
/** ViewContent : une fois par contenu et par page (la leçon démo, le compte démo). */
export function trackView(name) {
  if (seen.has(name)) return false;
  seen.add(name);
  return fbq('track', 'ViewContent', { content_name: name });
}

/**
 * ViewContent à l'ouverture d'une leçon démo ou du compte démo.
 * - lien vers le compte démo (app/?demo=1) : l'événement part, puis la page change (léger délai pour qu'il arrive) ;
 * - `lesson` : sélecteur des boutons qui ouvrent la leçon démo de la page (ex. « Voir une leçon », lecture).
 */
export function watchDemo({ lesson = '' } = {}) {
  document.addEventListener(
    'click',
    (e) => {
      const el = e.target.closest?.(`a[href*="demo=1"]${lesson ? `, ${lesson}` : ''}`);
      if (!el) return;
      const demo = el.matches('a[href*="demo=1"]');
      const sent = trackView(demo ? 'Compte démo' : 'Leçon démo');
      // Nouvel onglet, clic avec modificateur, ou pixel absent : la navigation suit son cours
      if (!demo || !sent || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || el.target === '_blank') return;
      e.preventDefault();
      setTimeout(() => location.assign(el.href), 300);
    },
    true,
  );
}
