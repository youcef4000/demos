// Bons du rail : rendu commun à la page d'explication et à la tour de contrôle.

const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
export const euro = (n) => (Number.isFinite(n) ? eur.format(n) : '—');
export const heure = (d = new Date()) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const echapper = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export { echapper };

const TAMPONS = { ok: 'ENVOYÉ', passe: 'AU PASSE', verrou: 'VERROU', bloque: 'BLOQUÉ' };

/**
 * evt = { type: 'stock'|'prix'|'fiche'|'commande'|'csv', etat: 'ok'|'passe'|'verrou'|'bloque',
 *         fournisseur, titre, lignes: [[gauche, droite]], etapes: 'Tefcold → Shopify → METRO', date }
 */
export function bonHTML(evt, { rotation = 0 } = {}) {
  const lignes = (evt.lignes || []).map(([g, d]) => `<div class="t-ligne"><span>${echapper(g)}</span><span>${echapper(d)}</span></div>`).join('');
  return `<article class="ticket ${evt.etat || 'ok'}" style="--r:${rotation}deg">
    <div class="t-entete"><span>${echapper(evt.type)}</span><span>${heure(evt.date)}</span></div>
    <div class="t-titre">${echapper(evt.titre)}</div>
    <div class="t-ligne"><span>${echapper(evt.fournisseur)}</span><span></span></div>
    ${lignes}
    ${evt.etapes ? `<div class="t-etapes">${echapper(evt.etapes)}</div>` : ''}
    <span class="t-tampon">${TAMPONS[evt.etat] || TAMPONS.ok}</span>
  </article>`;
}

/** Accroche un bon à gauche du rail et retire ceux qui dépassent. */
export function accrocher(rail, evt, { max = 8, anime = true } = {}) {
  const rot = ((Math.random() * 5) - 2.5).toFixed(1);
  rail.insertAdjacentHTML('afterbegin', bonHTML(evt, { rotation: rot }));
  const bon = rail.firstElementChild;
  if (anime) bon.classList.add('entre');
  while (rail.children.length > max) rail.lastElementChild.remove();
  return bon;
}

export const reduitMouvement = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** localStorage peut être indisponible (navigation privée, aperçu) : on ne casse jamais la page. */
export const memoire = {
  lire(cle, defaut) {
    try {
      const v = localStorage.getItem(cle);
      return v === null ? defaut : JSON.parse(v);
    } catch {
      return defaut;
    }
  },
  ecrire(cle, valeur) {
    try {
      localStorage.setItem(cle, JSON.stringify(valeur));
    } catch {
      /* rien : simple confort */
    }
  },
};
