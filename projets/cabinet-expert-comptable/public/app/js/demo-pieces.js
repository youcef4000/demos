// Démo : dessin des pièces d'exemple (factures, états de paie, relevés, bons de caisse) en SVG, à la manière d'un scan.
// Toutes les entreprises, NIF et montants sont fictifs.
import { html as x, da, dateFr, periodeFr } from '../noyau/format.js';
import { totaux } from '../noyau/pieces.js';

const m = (c) => da(c, { sansUnite: true });
const W = 595;
const H = 842;

function texte(xp, yp, t, { taille = 9, gras = false, ancre = 'start', couleur = '#222', police = 'Helvetica, Arial, sans-serif' } = {}) {
  return `<text x="${xp}" y="${yp}" font-family="${police}" font-size="${taille}" font-weight="${gras ? 700 : 400}" text-anchor="${ancre}" fill="${couleur}">${x(t)}</text>`;
}

function entete(doc, titre, couleur) {
  const e = doc.emetteur || {};
  let s = `<rect x="40" y="40" width="515" height="4" fill="${couleur}"/>`;
  s += texte(40, 72, e.nom || '', { taille: 15, gras: true, couleur });
  s += texte(40, 88, e.activite || '', { taille: 8.5, couleur: '#555' });
  s += texte(40, 101, e.adresse || '', { taille: 8.5, couleur: '#555' });
  if (e.tel) s += texte(40, 113, `Tél. ${e.tel}`, { taille: 8.5, couleur: '#555' });
  const ids = [e.rc && `RC : ${e.rc}`, e.nif && `NIF : ${e.nif}`, e.nis && `NIS : ${e.nis}`, e.ai && `AI : ${e.ai}`].filter(Boolean);
  ids.forEach((t, i) => (s += texte(40, 128 + i * 11, t, { taille: 7.5, couleur: '#666' })));
  s += texte(555, 72, titre, { taille: 20, gras: true, ancre: 'end', couleur: '#222' });
  if (doc.numero) s += texte(555, 90, `N° ${doc.numero}`, { taille: 10, gras: true, ancre: 'end' });
  if (doc.date) s += texte(555, 104, `${doc.ville || 'Le'} ${dateFr(doc.date)}`, { taille: 9, ancre: 'end', couleur: '#444' });
  return s;
}

function factureSVG(doc) {
  const avoir = doc.type === 'avoir';
  const couleur = doc.couleur || '#1f4e79';
  const t = totaux({ lignes: doc.lignes, timbre: doc.timbre });
  let s = entete(doc, avoir ? 'FACTURE D’AVOIR' : 'FACTURE', couleur);
  const d = doc.destinataire || {};
  s += `<rect x="330" y="122" width="225" height="74" fill="none" stroke="#999" stroke-width="0.7"/>`;
  s += texte(338, 136, 'Facturé à :', { taille: 7.5, couleur: '#666' });
  s += texte(338, 150, d.nom || '', { taille: 10, gras: true });
  s += texte(338, 163, d.adresse || '', { taille: 8, couleur: '#444' });
  if (d.nif) s += texte(338, 176, `NIF : ${d.nif}`, { taille: 7.5, couleur: '#555' });
  if (d.rc) s += texte(338, 187, `RC : ${d.rc}`, { taille: 7.5, couleur: '#555' });

  const y0 = 222;
  s += `<rect x="40" y="${y0}" width="515" height="18" fill="${couleur}" opacity="0.92"/>`;
  const col = [46, 300, 352, 430, 549];
  ['Désignation', 'Qté', 'P.U. HT', 'TVA', 'Montant HT'].forEach((c, i) => (s += texte(col[i], y0 + 12.5, c, { taille: 8, gras: true, couleur: '#fff', ancre: i === 0 ? 'start' : 'end' })));
  let y = y0 + 32;
  for (const l of doc.lignes) {
    s += texte(col[0], y, l.libelle, { taille: 8.5 });
    s += texte(col[1], y, l.quantite ?? 1, { taille: 8.5, ancre: 'end' });
    s += texte(col[2], y, m(l.prixUnitaire ?? l.montantHT), { taille: 8.5, ancre: 'end' });
    s += texte(col[3], y, l.tauxTVA ? `${l.tauxTVA} %` : 'Exo.', { taille: 8.5, ancre: 'end' });
    s += texte(col[4], y, m(l.montantHT), { taille: 8.5, ancre: 'end' });
    s += `<line x1="40" y1="${y + 6}" x2="555" y2="${y + 6}" stroke="#ddd" stroke-width="0.6"/>`;
    y += 20;
  }
  y = Math.max(y + 10, 470);
  const lignesTot = [['Total HT', t.ht]];
  for (const [taux, v] of Object.entries(t.tvaParTaux)) if (Number(taux)) lignesTot.push([`TVA ${taux} %`, v]);
  if (t.timbre) lignesTot.push(['Droit de timbre', t.timbre]);
  lignesTot.push([avoir ? 'Net à déduire TTC' : 'Net à payer TTC', t.ttc]);
  lignesTot.forEach(([l, v], i) => {
    const dernier = i === lignesTot.length - 1;
    if (dernier) s += `<rect x="330" y="${y - 11}" width="225" height="17" fill="${couleur}" opacity="0.12"/>`;
    s += texte(338, y, l, { taille: 9, gras: dernier });
    s += texte(549, y, `${m(v)} DA`, { taille: 9, gras: dernier, ancre: 'end' });
    y += 17;
  });
  y += 14;
  const modes = { especes: 'Espèces', cheque: `Chèque${doc.refPaiement ? ` n° ${doc.refPaiement}` : ''}`, virement: 'Virement bancaire', carte: 'Carte CIB', a_terme: `À ${doc.delai || 30} jours` };
  s += texte(40, y, `Mode de règlement : ${modes[doc.modePaiement] || 'À convenir'}`, { taille: 9 });
  s += texte(40, y + 14, `Arrêtée la présente facture à la somme de ${m(t.ttc)} dinars algériens.`, { taille: 8.5, couleur: '#444' });
  if (doc.tampon) {
    s += `<g transform="translate(150 ${y + 70}) rotate(-12)"><rect x="-70" y="-22" width="140" height="44" rx="6" fill="none" stroke="#b3261e" stroke-width="2.4" opacity="0.8"/>${texte(0, 2, doc.tampon, { taille: 15, gras: true, ancre: 'middle', couleur: '#b3261e' })}${doc.datePaiement ? texte(0, 16, dateFr(doc.datePaiement), { taille: 8, ancre: 'middle', couleur: '#b3261e' }) : ''}</g>`;
  }
  s += texte(470, y + 80, 'Cachet et signature', { taille: 7.5, ancre: 'middle', couleur: '#777' });
  s += `<ellipse cx="470" cy="${y + 112}" rx="48" ry="26" fill="none" stroke="${couleur}" stroke-width="1.6" opacity="0.55"/>`;
  s += texte(470, y + 115, (doc.emetteur?.nom || '').split(' ').slice(0, 2).join(' '), { taille: 7, gras: true, ancre: 'middle', couleur, police: 'Georgia, serif' });
  return s;
}

function paieSVG(doc) {
  const p = doc.paie;
  let s = entete({ ...doc, numero: '' }, 'ÉTAT DE PAIE', '#3b5e2b');
  s += texte(40, 190, `Récapitulatif du mois : ${periodeFr(doc.periode)}`, { taille: 12, gras: true });
  s += texte(40, 206, `Effectif payé : ${p.effectif} salarié(s) — état global, sans détail nominatif`, { taille: 9, couleur: '#555' });
  const lignes = [
    ['Salaires de base et primes (brut)', p.brut],
    ['Retenue sécurité sociale (CNAS 9 %)', p.cotisationsSalariales],
    ['Salaire imposable', p.brut - p.cotisationsSalariales],
    ['IRG retenu à la source', p.irg],
    ['Net à payer', p.net],
    ['Charges patronales (CNAS 26 %)', p.cotisationsPatronales],
  ];
  let y = 240;
  s += `<rect x="40" y="${y - 14}" width="515" height="18" fill="#3b5e2b"/>`;
  s += texte(46, y - 1.5, 'Rubrique', { taille: 8, gras: true, couleur: '#fff' }) + texte(549, y - 1.5, 'Montant (DA)', { taille: 8, gras: true, couleur: '#fff', ancre: 'end' });
  y += 20;
  lignes.forEach(([l, v], i) => {
    const fort = i === 3 || i === 4;
    s += texte(46, y, l, { taille: 9.5, gras: fort });
    s += texte(549, y, m(v), { taille: 9.5, gras: fort, ancre: 'end' });
    s += `<line x1="40" y1="${y + 7}" x2="555" y2="${y + 7}" stroke="#ddd" stroke-width="0.6"/>`;
    y += 24;
  });
  s += texte(40, y + 30, `Édité par le logiciel de paie le ${dateFr(doc.date)}.`, { taille: 8, couleur: '#666' });
  return s;
}

function releveSVG(doc) {
  let s = entete({ ...doc, numero: '' }, 'RELEVÉ DE COMPTE', '#5a3d7a');
  s += texte(40, 190, `${doc.destinataire?.nom || ''} — compte n° ${doc.compte || '0000 0000 0000'}`, { taille: 10, gras: true });
  s += texte(40, 205, `Période : ${periodeFr(doc.periode)}`, { taille: 9, couleur: '#555' });
  let y = 236;
  s += `<rect x="40" y="${y - 14}" width="515" height="18" fill="#5a3d7a"/>`;
  ['Date', 'Libellé', 'Débit', 'Crédit'].forEach((c, i) => (s += texte([46, 110, 470, 549][i], y - 1.5, c, { taille: 8, gras: true, couleur: '#fff', ancre: i > 1 ? 'end' : 'start' })));
  y += 20;
  for (const l of doc.mouvements || []) {
    s += texte(46, y, dateFr(l.date).slice(0, 5), { taille: 8.5 }) + texte(110, y, l.libelle, { taille: 8.5 });
    if (l.debit) s += texte(470, y, m(l.debit), { taille: 8.5, ancre: 'end' });
    if (l.credit) s += texte(549, y, m(l.credit), { taille: 8.5, ancre: 'end' });
    y += 17;
  }
  return s;
}

function caisseSVG(doc) {
  let s = entete({ ...doc }, 'BON DE CAISSE', '#7a4b1f');
  let y = 200;
  for (const l of doc.lignes) {
    s += texte(46, y, `${l.libelle}`, { taille: 10 }) + texte(549, y, `${m(l.montantHT)} DA`, { taille: 10, ancre: 'end' });
    y += 22;
  }
  s += texte(46, y + 20, 'Reçu en espèces — signature du bénéficiaire :', { taille: 9, couleur: '#555' });
  s += `<path d="M300 ${y + 40} q 20 -18 40 0 t 40 0 t 30 -6" fill="none" stroke="#1a3c8a" stroke-width="1.4"/>`;
  return s;
}

/** SVG complet d'une pièce d'exemple. */
export function svgPiece(doc) {
  const corps = doc.type === 'etat_paie' ? paieSVG(doc) : doc.type === 'releve_bancaire' ? releveSVG(doc) : doc.type === 'piece_caisse' ? caisseSVG(doc) : factureSVG(doc);
  const rot = doc.aspect?.rotation ?? 0;
  const flou = doc.aspect?.flou ? `<filter id="f"><feGaussianBlur stdDeviation="${doc.aspect.flou}"/></filter>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${flou}<rect width="${W}" height="${H}" fill="#fdfcf8"/><g transform="rotate(${rot} ${W / 2} ${H / 2})" ${flou ? 'filter="url(#f)"' : ''}>${corps}${texte(W / 2, H - 28, 'Document fictif créé pour la démonstration — entreprises, NIF et montants imaginaires', { taille: 7, ancre: 'middle', couleur: '#999' })}</g></svg>`;
}

export function urlSvg(doc) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgPiece(doc))}`;
}
