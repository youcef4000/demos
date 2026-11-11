// Briques d'interface communes : icônes, cartes, feuille du bas, messages, formats.

import { t, tl, lang } from './i18n.js';
import { etat } from './etat.js';
import { INGREDIENTS, PAYS } from './data/index.js';
import { coutParPart, ecrirePrix, tempsActif, ecrire } from './core.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* ---------- Icônes (tracés 24 × 24) ---------- */

const TRACES = {
  accueil: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  chercher: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  idee: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="m19 15 .7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z"/>',
  livre: '<path d="M12 6.5C10 5 7 4.5 3 5v13c4-.5 7 0 9 1.5 2-1.5 5-2 9-1.5V5c-4-.5-7 0-9 1.5z"/><path d="M12 6.5v13"/>',
  moi: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  coeur: '<path d="M12 20.5s-8-4.9-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9.5c0 6.1-8 11-8 11z"/>',
  horloge: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  parts: '<path d="M16 21v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V21"/><circle cx="9" cy="8" r="3.5"/><path d="M22 21v-1.5a4 4 0 0 0-3-3.8M16 4.7a3.5 3.5 0 0 1 0 6.6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  moins: '<path d="M5 12h14"/>',
  ok: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  fermer: '<path d="M6 6l12 12M18 6 6 18"/>',
  suivant: '<path d="m9 6 6 6-6 6"/>',
  retour: '<path d="M19 12H5m6-6-6 6 6 6"/>',
  partager: '<path d="M12 15V3m0 0L8 7m4-4 4 4"/><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/>',
  panier: '<path d="M4 9h16l-1.5 10a1 1 0 0 1-1 .9H6.5a1 1 0 0 1-1-.9z"/><path d="m8 9 4-6 4 6"/>',
  calendrier: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  lecture: '<path d="M7 4.5v15l12-7.5z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  son: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
  micro: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  minuteur: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2M9.5 2.5h5"/>',
  frigo: '<rect x="6" y="2.5" width="12" height="19" rx="2"/><path d="M6 10h12M9.5 6v1.5M9.5 13v3"/>',
  sos: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="m5.6 5.6 3.9 3.9m5 5 3.9 3.9m0-12.8-3.9 3.9m-5 5-3.9 3.9"/>',
  cadenas: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5v-3a4 4 0 0 1 8 0v3"/>',
  etoile: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.9z"/>',
  photo: '<path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
  corbeille: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
  langue: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18"/>',
  prix: '<path d="M3.5 12.5v-8h8l9 9-8 8z"/><circle cx="8" cy="9" r="1.2"/>',
  niveau: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3 2-4.7 3.2-6.6.9-1.4 1-3 .8-4.7 3 1.3 5.3 4 5.7 7 .8-.6 1.3-1.5 1.5-2.6 1.2 1.6 1.8 3.5 1.8 5.6 0 4.4-2.6 7.5-6.5 7.5z"/>',
  mesure: '<path d="M12 4v16M6 20h12M5 8h14M5 8l-2.5 6a3 3 0 0 0 5 0zM19 8l-2.5 6a3 3 0 0 0 5 0z"/>',
  remplacer: '<path d="M4 8h13m0 0-3-3m3 3-3 3M20 16H7m0 0 3-3m-3 3 3 3"/>',
  liste: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
  installer: '<path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"/>',
  crayon: '<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z"/>',
  pro: '<rect x="3" y="7.5" width="18" height="12" rx="2"/><path d="M9 7.5V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2.5M3 13h18"/>',
  message: '<path d="m4 20 1.3-4A8 8 0 1 1 8.5 19z"/>',
  marmite: '<path d="M5 11h14v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM3 11h18M9 7.5c0-1 1-1.5 1-2.5M13.5 7.5c0-1 1-1.5 1-2.5"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10.5 5-3v9l-5-3"/>',
  lien: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  reglages: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  relancer: '<path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4h-4"/>',
};

export const ico = (nom, classe = '') => `<svg class="ico ${classe}" viewBox="0 0 24 24" aria-hidden="true">${TRACES[nom] || ''}</svg>`;

/* ---------- Formats ---------- */

export function duree(min) {
  if (!min) return '';
  if (min < 60) return `${min} ${t('min')}`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} ${t('h')} ${m}` : `${h} ${t('h')}`;
}

// Libellé d'une unité, au singulier ou au pluriel.
export function unite(u, n = 1) {
  const brut = t(`u.${u}`);
  const [un, plusieurs] = brut.split('|');
  return n >= 2 && plusieurs ? plusieurs : un;
}

// Nom d'un ingrédient, accordé quand on en compte plusieurs.
export function nomIngredient(id, n = 1, compte = false) {
  const brut = INGREDIENTS[id]?.n[lang()] || id;
  const [un, plusieurs] = brut.split('|');
  if (!compte || n < 2 || lang() === 'ar') return un;
  if (plusieurs) return plusieurs;
  const premier = un.split(' ')[0];
  return /[sxz]$/i.test(premier) ? un : un.replace(premier, `${premier}s`);
}

export const quantite = (id, q, u) => ecrire(id, q, u, etat.mesure, lang(), unite);

export const prix = (n) => ecrirePrix(n, etat.devise, lang());

export const image = (r) => (r.perso ? '' : `img/r/${r.id}.webp`);

export const pays = (c) => (PAYS[c] ? `${PAYS[c].f} ${PAYS[c][lang()]}` : '');

export function date(iso) {
  return new Date(iso).toLocaleDateString(lang() === 'ar' ? 'ar-DZ-u-nu-latn' : lang(), { day: 'numeric', month: 'long', year: 'numeric' });
}

/* ---------- Cartes ---------- */

export const points = (n) => `<span class="pts" aria-label="${esc(t('difficulte'))} ${n}/3">${[1, 2, 3].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;

export function vignette(r, classe = '') {
  if (r.perso) return `<div class="vignette perso ${classe}" aria-hidden="true"><span>${esc((r.t.fr || '?').trim().charAt(0).toUpperCase())}</span></div>`;
  return `<img class="vignette ${classe}" src="${image(r)}" alt="" loading="lazy" width="960" height="723">`;
}

export function carte(r, extra = '') {
  const fav = etat.favoris.includes(r.id);
  const meta = r.perso
    ? `<span>${esc(t('maRecette'))}</span>`
    : `<span>${ico('horloge')}${duree(tempsActif(r))}</span><span>${points(r.diff)}</span><span>${prix(coutParPart(r, etat.devise, etat.prix))}</span>`;
  return `<article class="carte">
    <a class="carte-lien" href="#/r/${r.id}">
      ${vignette(r)}
      <div class="carte-corps">
        <h3>${esc(tl(r.t))}</h3>
        <p class="meta">${meta}</p>
        ${extra}
      </div>
    </a>
    <button class="rond fav ${fav ? 'actif' : ''}" data-a="favori" data-id="${r.id}" aria-pressed="${fav}" aria-label="${esc(t('favori'))}">${ico('coeur')}</button>
  </article>`;
}

export const entete = (titre, { retour = true, droite = '' } = {}) => `<header class="barre">
  ${retour ? `<button class="rond" data-a="retour" aria-label="${esc(t('retour'))}">${ico('retour', 'dir')}</button>` : '<span></span>'}
  <h1>${esc(titre)}</h1>
  <span class="barre-droite">${droite}</span>
</header>`;

export const vide = (icone, titre, texte, bouton = '') => `<div class="vide">${ico(icone)}<h2>${esc(titre)}</h2><p>${esc(texte)}</p>${bouton}</div>`;

/* ---------- Message bref ---------- */

let minuterieToast;
export function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('vu');
  clearTimeout(minuterieToast);
  minuterieToast = setTimeout(() => el.classList.remove('vu'), 2600);
}

/* ---------- Feuille du bas ---------- */

let avantFeuille = null;
export function feuille(html, { large = false } = {}) {
  const el = document.getElementById('feuille');
  avantFeuille = document.activeElement;
  el.innerHTML = `<div class="feuille-fond" data-a="fermerFeuille"></div>
    <div class="feuille-corps ${large ? 'large' : ''}" role="dialog" aria-modal="true" tabindex="-1">
      <button class="rond feuille-x" data-a="fermerFeuille" aria-label="${esc(t('fermer'))}">${ico('fermer')}</button>
      ${html}
    </div>`;
  el.hidden = false;
  document.body.classList.add('fige');
  el.querySelector('.feuille-corps').focus();
}

export function fermerFeuille() {
  const el = document.getElementById('feuille');
  if (el.hidden) return;
  el.hidden = true;
  el.innerHTML = '';
  document.body.classList.remove('fige');
  avantFeuille?.focus?.();
}

/* ---------- Partage ---------- */

export async function partager(titre, texte, url) {
  try {
    if (navigator.share) {
      await navigator.share({ title: titre, text: texte, url });
      return;
    }
  } catch {
    return; // partage annulé
  }
  try {
    await navigator.clipboard.writeText([texte, url].filter(Boolean).join('\n'));
    toast(t('copie'));
  } catch {
    toast(t('copieImpossible'));
  }
}

export const whatsapp = (texte, numero = '') => `https://wa.me/${numero}?text=${encodeURIComponent(texte)}`;

// Réduit une photo choisie par l'utilisateur pour qu'elle tienne dans le stockage de l'appareil.
export function reduirePhoto(fichier, cote = 640) {
  return new Promise((resoudre) => {
    const img = new Image();
    const url = URL.createObjectURL(fichier);
    img.onload = () => {
      const k = Math.min(1, cote / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resoudre(c.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => resoudre(null);
    img.src = url;
  });
}
