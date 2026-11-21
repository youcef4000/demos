// Petits outils d'affichage partagés par la boutique et l'admin.
import * as S from './store.js';

const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
export const eur = (n) => fmt.format(Number(n) || 0);
export const nombre = (n) => new Intl.NumberFormat('fr-FR').format(n);
export const dateCourte = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
export const dateLongue = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
export const heure = (d) => new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* Chemin d'une image : les photos du catalogue sont relatives à la racine de la démo. */
let racine = './';
export function definirRacine(r) { racine = r; }
export function src(chemin) {
  if (!chemin) return racine + 'img/sans-photo.svg';
  return /^(data:|blob:|https?:)/.test(chemin) ? chemin : racine + chemin;
}

/* Icônes (traits 2 px, 24 × 24) */
const P = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.2a1 1 0 0 0 1 .8h9.7a1 1 0 0 0 1-.8L21 7H6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  heart: '<path d="M12 20s-7.5-4.6-9.2-9.3C1.7 7.5 3.8 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.2 0 5.3 3 4.2 6.2C19.5 15.4 12 20 12 20z"/>',
  truck: '<path d="M2 6h12v10H2zM14 9h4l4 4v3h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  right: '<path d="m9 6 6 6-6 6"/>',
  left: '<path d="m15 6-6 6 6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  box: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>',
  pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  file: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  repeat: '<path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  print: '<path d="M6 9V3h12v6M6 18H4v-7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7h-2"/><rect x="6" y="14" width="12" height="7"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  tag: '<path d="M3 12V3h9l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  store: '<path d="M3 9 5 3h14l2 6M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0zM5 13v8h14v-8M10 21v-5h4v5"/>',
  euro: '<path d="M18 6.5A7 7 0 1 0 18 17.5M4 10h10M4 14h10"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15v3M12 10v8M17 6v12"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c1-3.5 3.8-5.5 7-5.5s6 2 7 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2 .8 3.4 2.6 4 5.2"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
  logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
  snow: '<path d="M12 2v20M4 6.5l16 11M20 6.5l-16 11M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5"/>',
  flame: '<path d="M12 22c4 0 7-2.7 7-7 0-4.5-4-7-4-11-3 2-4 4.5-4 6.5C9.5 9 9 7.5 9 6c-2.5 2-4 5-4 9 0 4.3 3 7 7 7z"/>',
  pizza: '<path d="M12 3 3 19c6 3 12 3 18 0z"/><path d="M5 15c4.5 2 9.5 2 14 0"/><circle cx="12" cy="11" r="1.2"/><circle cx="9.5" cy="15.5" r="1"/><circle cx="14.5" cy="15.5" r="1"/>',
  knife: '<path d="M3 21 14 10l3 3c-3 4-8 7-14 8z"/><path d="m14 10 5-5a2 2 0 0 1 3 3l-5 5"/>',
  burger: '<path d="M4 11a8 6 0 0 1 16 0z"/><path d="M3 14h18M4 17h16a0 0 0 0 1 0 0 3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/>',
  cup: '<path d="M4 8h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 2v3M12 2v3"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  table: '<path d="M3 8h18M5 8v12M19 8v12M5 14h14"/><path d="M3 8l2-4h14l2 4"/>',
  home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>',
  pallet: '<rect x="4" y="4" width="7" height="6" rx="1"/><rect x="13" y="4" width="7" height="6" rx="1"/><rect x="4" y="11" width="16" height="5" rx="1"/><path d="M3 19h18M6 16v3M12 16v3M18 16v3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
  label: '<path d="M4 4h10l6 6v10H4z"/><path d="M8 12h8M8 16h5"/>',
  trend: '<path d="M3 17 9 11l4 4 8-8"/><path d="M15 7h6v6"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  fan: '<circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 1-7 4-7s3 4 0 6M14 12c4 0 7 1 7 4s-4 3-6 0M12 14c0 4-1 7-4 7s-3-4 0-6M10 12c-4 0-7-1-7-4s4-3 6 0"/>',
};
export function ic(nom, cls = '') {
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[nom] || ''}</svg>`;
}

/* Message éphémère */
let zone = null;
export function toast(html, type = 'ok', duree = 3200) {
  if (!zone) {
    zone = document.createElement('div');
    zone.className = 'toasts';
    zone.setAttribute('role', 'status');
    zone.setAttribute('aria-live', 'polite');
    document.body.append(zone);
  }
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = html;
  zone.append(t);
  setTimeout(() => { t.classList.add('sort'); setTimeout(() => t.remove(), 300); }, duree);
}

/* Fenêtre modale simple (renvoie une promesse) */
export function modale({ titre, corps, actions = [{ id: 'ok', libelle: 'OK', classe: 'btn-plein' }], large = false }) {
  return new Promise((resoudre) => {
    const d = document.createElement('dialog');
    d.className = 'modale' + (large ? ' modale-large' : '');
    d.innerHTML = `<form method="dialog" class="modale-boite">
      <header class="modale-tete"><h2>${titre}</h2><button class="btn-icone" value="annuler" aria-label="Fermer">${ic('x')}</button></header>
      <div class="modale-corps">${corps}</div>
      <footer class="modale-pied">${actions.map((a) => `<button class="btn ${a.classe || ''}" value="${a.id}">${a.libelle}</button>`).join('')}</footer>
    </form>`;
    document.body.append(d);
    d.addEventListener('close', () => {
      const donnees = Object.fromEntries(new FormData(d.querySelector('form')));
      resoudre({ action: d.returnValue || 'annuler', donnees });
      d.remove();
    });
    d.showModal();
    d.querySelector('input, select, textarea')?.focus();
  });
}

/* Document imprimable : devis, facture, bon de préparation. */
export function documentCommercial(type, o) {
  const r = S.reglages();
  const titres = { devis: 'Devis', facture: 'Facture', bon: 'Bon de préparation' };
  const retrait = o.livraison?.mode === 'showroom';
  const lignes = o.lignes.map((l) => `<tr>
      <td>${esc(l.ref)}</td><td>${esc(l.nom)}</td><td class="num">${l.qte}</td>
      ${type === 'bon' ? '<td class="num">☐</td>' : `<td class="num">${eur(l.unit)}${l.barre || l.unit < l.base ? `<br><small>au lieu de ${eur(l.unit < l.base ? l.base : l.barre)}</small>` : ''}</td><td class="num">${eur(l.total)}</td>`}
    </tr>`).join('');
  return `<article class="doc">
    <header class="doc-tete">
      <div class="doc-emetteur">
        <img src="${src('img/logo.svg')}" alt="Discount Horeca" width="160" height="43">
        <p>${esc(r.societe)} — Discount Horeca<br>${esc(r.adresse)}<br>${[r.telephone, r.email].filter(Boolean).map(esc).join(' · ')}<br>TVA ${esc(r.numeroTva)}</p>
      </div>
      <div class="doc-titre">
        <h1>${titres[type]}</h1>
        <p><strong>N° ${esc(o.num)}</strong><br>du ${dateLongue(o.date)}${type === 'devis' ? `<br>valable jusqu'au ${dateLongue(o.validite)}` : ''}${o.refClient ? `<br>Votre référence : ${esc(o.refClient)}` : ''}</p>
      </div>
    </header>
    <section class="doc-parties">
      <div><h2>Client</h2><p><strong>${esc(o.client.societe)}</strong><br>${esc(o.client.contact || '')}<br>${esc(o.client.email || '')} · ${esc(o.client.tel || '')}${o.client.bce ? `<br>N° d’entreprise ${esc(o.client.bce)}<br>TVA ${esc(o.client.tva || '—')}` : ''}</p></div>
      ${o.livraison ? `<div><h2>${retrait ? 'Retrait' : 'Livraison'}</h2><p>${retrait ? 'Showroom Discount Horeca, ' + esc(r.adresse) : `${o.livraison.destinataire ? esc(o.livraison.destinataire) + '<br>' : ''}${esc(o.livraison.adresse)}<br>${esc(o.livraison.cp)} ${esc(o.livraison.ville)}<br>${esc(o.livraison.pays || 'Belgique')}`}<br><em>${esc(S.LIVRAISONS[o.livraison.mode] || '')}</em></p></div>` : ''}
      ${o.paiement ? `<div><h2>Paiement</h2><p>${esc(S.PAIEMENTS[o.paiement] || '')}</p></div>` : ''}
    </section>
    <table class="doc-lignes">
      <thead><tr><th>Réf.</th><th>Désignation</th><th class="num">Qté</th>${type === 'bon' ? '<th class="num">Prêt</th>' : '<th class="num">PU HTVA</th><th class="num">Total HTVA</th>'}</tr></thead>
      <tbody>${lignes}</tbody>
    </table>
    ${type === 'bon' ? '' : `<table class="doc-totaux">
      <tr><td>Total HTVA</td><td class="num">${eur(o.totaux.ht)}</td></tr>
      <tr><td>Livraison HTVA</td><td class="num">${o.totaux.port ? eur(o.totaux.port) : retrait ? 'Retrait' : 'Gratuite'}</td></tr>
      <tr><td>TVA ${r.tva} %</td><td class="num">${eur(o.totaux.tva)}</td></tr>
      <tr class="doc-total"><td>Total TVAC</td><td class="num">${eur(o.totaux.ttc)}</td></tr>${o.totaux.acompte ? `<tr><td>Acompte payé (${r.acompte} %)</td><td class="num">${eur(o.totaux.acompte)}</td></tr><tr><td>Solde à la livraison</td><td class="num">${eur(o.totaux.ttc - o.totaux.acompte)}</td></tr>` : ''}
    </table>`}
    ${o.message ? `<p class="doc-note"><strong>Message du client :</strong> ${esc(o.message)}</p>` : ''}
    <footer class="doc-pied">
      ${type === 'devis' ? `Devis valable ${r.validiteDevis} jours, prix HTVA. Installation et raccordement facturés en régie sauf mention contraire. Acompte de ${r.acompte} % à la commande. Bon pour accord : date, cachet et signature.` : type === 'facture' ? 'Document de démonstration : la vraie facture est numérotée et émise par le logiciel de facturation (compatible Peppol pour la facturation électronique B2B).' : 'Contrôler chaque article et cocher avant expédition.'}
      <br>Démo réalisée par Bornz Studio — document sans valeur commerciale.
    </footer>
  </article>`;
}
