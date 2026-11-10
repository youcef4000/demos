// Outils d'interface : gabarits HTML échappés, badges, fenêtres, messages, téléchargements.
import { html as echapper, da, dateFr, dateHeureFr, periodeFr, decalerPeriode } from '../noyau/format.js';

export { da, dateFr, dateHeureFr, periodeFr };

/** Contenu déjà sûr (HTML construit par h``). */
export const brut = (s) => ({ __brut: String(s ?? '') });
const rendu = (v) => (v == null || v === false || v === true ? '' : Array.isArray(v) ? v.map(rendu).join('') : typeof v === 'object' && '__brut' in v ? v.__brut : echapper(v));

/** Gabarit : h`<p>${texte}</p>` échappe chaque valeur, sauf les morceaux déjà produits par h``. */
export function h(chaines, ...valeurs) {
  let s = '';
  chaines.forEach((c, i) => {
    s += c;
    if (i < valeurs.length) s += rendu(valeurs[i]);
  });
  return brut(s);
}
export const monter = (el, contenu) => {
  el.innerHTML = rendu(contenu);
  return el;
};
export const icone = (nom) => brut(`<svg aria-hidden="true"><use href="#i-${nom}"/></svg>`);

/** Délégation d'événements : sur(el, 'click', '[data-action="x"]', (e, cible) => …). */
export function sur(el, type, selecteur, fn) {
  el.addEventListener(type, (e) => {
    const cible = e.target.closest(selecteur);
    if (cible && el.contains(cible)) fn(e, cible);
  });
}

const STATUTS = {
  piece: { recue: ['Reçue', ''], en_lecture: ['Lecture en cours', 'info'], a_valider: ['À valider', 'alerte'], validee: ['Écritures à valider', 'primaire'], comptabilisee: ['Comptabilisée', 'ok'], rejetee: ['Rejetée', 'erreur'] },
  ecriture: { proposee: ['Proposée', 'alerte'], validee: ['Validée', 'primaire'], exportee: ['Exportée vers PC Compta', 'ok'] },
  g50: { preparee: ["Préparée · à valider par l'associé", 'alerte'], validee: ['Validée · à déposer', 'primaire'], deposee: ['Déposée', 'ok'] },
  envoi: { a_valider: ['À valider', 'alerte'], envoye: ['Envoyé', 'ok'], rejete: ['Écarté', ''] },
  echeance: { fait: ['Fait', 'ok'], a_faire: ['À faire', ''], en_retard: ['En retard', 'erreur'], preparee: ['G50 préparée', 'alerte'], validee: ['G50 validée', 'primaire'] },
};
export function badge(famille, statut) {
  const [libelle, classe] = STATUTS[famille]?.[statut] || [statut || '—', ''];
  return h`<span class="badge ${classe}">${libelle}</span>`;
}
export const libelleStatut = (famille, statut) => STATUTS[famille]?.[statut]?.[0] || statut;

export function initiales(nom) {
  return String(nom || '?').replace(/\(.*?\)/g, '').trim().split(/\s+/).slice(0, 2).map((m) => m[0]).join('').toUpperCase();
}

const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
export const moisCourt = (periode) => `${MOIS_COURTS[Number(periode.slice(5, 7)) - 1]}`;
export const dateBloc = (iso) => h`<div class="date-bloc"><b>${iso.slice(8, 10)}</b><small>${MOIS_COURTS[Number(iso.slice(5, 7)) - 1]}</small></div>`;

/** Liste de périodes (mois) pour un menu déroulant, de la plus récente à la plus ancienne. */
export function periodes(depuis, n = 14) {
  return Array.from({ length: n }, (_, i) => decalerPeriode(depuis, -i));
}

// ——— Messages éphémères ———
export function toast(message, type = '') {
  let zone = document.querySelector('.toasts');
  if (!zone) {
    zone = document.createElement('div');
    zone.className = 'toasts';
    zone.setAttribute('role', 'status');
    zone.setAttribute('aria-live', 'polite');
    document.body.append(zone);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = message;
  zone.append(t);
  setTimeout(() => t.remove(), type === 'erreur' ? 7000 : 3800);
}

// ——— Fenêtres ———
/**
 * Ouvre une fenêtre. boutons = [{ libelle, valeur, classe }]. Le bouton de valeur « annuler » ferme sans rien.
 * Renvoie une promesse : { valeur, donnees: FormData-objet, el } ou null si fermée.
 */
export function fenetre({ titre, corps, boutons = [{ libelle: 'Fermer', valeur: 'annuler' }], apres, verifier }) {
  return new Promise((resoudre) => {
    const d = document.createElement('dialog');
    d.className = 'fenetre';
    monter(d, h`<form method="dialog"><div class="fenetre-tete"><h2>${titre}</h2><button type="button" class="btn btn-fantome" data-fermer aria-label="Fermer">${icone('fermer')}</button></div><div class="fenetre-corps">${corps}</div><div class="fenetre-pied">${boutons.map((b) => h`<button class="btn ${b.classe || ''}" value="${b.valeur}" ${b.valeur === 'annuler' ? brut('formnovalidate') : ''}>${b.libelle}</button>`)}</div></form>`);
    document.body.append(d);
    const form = d.querySelector('form');
    let fini = false;
    const finir = (r) => {
      if (fini) return;
      fini = true;
      d.close();
      d.remove();
      resoudre(r);
    };
    d.querySelector('[data-fermer]').addEventListener('click', () => finir(null));
    d.addEventListener('cancel', () => finir(null));
    form.addEventListener('submit', async (e) => {
      const valeur = e.submitter?.value;
      if (!valeur || valeur === 'annuler') return finir(null);
      e.preventDefault();
      const donnees = Object.fromEntries(new FormData(form));
      if (verifier) {
        const msg = await verifier(donnees, d);
        if (msg) return toast(msg, 'erreur');
      }
      finir({ valeur, donnees, el: d });
    });
    d.showModal();
    apres?.(d);
  });
}

export async function confirmer(titre, texte, libelle = 'Confirmer', classe = 'btn-primaire') {
  const r = await fenetre({ titre, corps: h`<p>${texte}</p>`, boutons: [{ libelle: 'Annuler', valeur: 'annuler' }, { libelle, valeur: 'ok', classe }] });
  return Boolean(r);
}

// ——— Fichiers ———
export function telechargerFichier({ nom, type, octets, blob }) {
  const b = blob || new Blob([octets], { type });
  const url = URL.createObjectURL(b);
  const a = document.createElement('a');
  a.href = url;
  a.download = nom;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Réduit une photo (téléphone) en JPEG de 2000 px au plus : envoi plus rapide, lecture plus sûre. */
export async function preparerImage(fichier) {
  if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(fichier.type) || fichier.size < 600 * 1024) return fichier;
  try {
    const bmp = await createImageBitmap(fichier);
    const k = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k);
    c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85));
    return blob ? new File([blob], fichier.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }) : fichier;
  } catch {
    return fichier;
  }
}

export const vide = (texte, nomIcone = 'boite') => h`<div class="vide">${icone(nomIcone)}<p>${texte}</p></div>`;
export const chargement = () => h`<div class="chargement"><span class="rond"></span> Chargement…</div>`;

/** Champ de formulaire étiqueté. */
export function champ({ nom, libelle, valeur = '', type = 'text', aide = '', requis = false, options = null, attrs = '', classe = '' }) {
  let saisie;
  if (options) saisie = h`<select name="${nom}" ${brut(attrs)} ${requis ? brut('required') : ''}>${options.map(([v, l]) => h`<option value="${v}" ${String(v) === String(valeur) ? brut('selected') : ''}>${l}</option>`)}</select>`;
  else if (type === 'textarea') saisie = h`<textarea name="${nom}" ${brut(attrs)} ${requis ? brut('required') : ''}>${valeur}</textarea>`;
  else saisie = h`<input name="${nom}" type="${type}" value="${valeur}" ${brut(attrs)} ${requis ? brut('required') : ''}>`;
  return h`<label class="champ ${classe}"><span>${libelle}</span>${saisie}${aide ? h`<small class="aide">${aide}</small>` : ''}</label>`;
}

/** Montant (centimes) → texte saisissable « 12 500,00 ». */
export const montantSaisie = (c) => (c == null || c === '' ? '' : da(c, { sansUnite: true }));
