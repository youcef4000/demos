// Données de la démo Discount Horeca (proposition de refonte), partagées entre boutique et admin.
// Tout reste dans le navigateur (localStorage) : l'admin et la boutique ouverts dans le même navigateur se répondent.
// La vraie version s'appuie sur un serveur (base de données, comptes, paiement Bancontact, e-mails, facturation).
//
// Prix : `prixHT` = prix de vente HTVA affiché sur discounthoreca.be (relevé public), `prixBarreHT` = prix avant promotion.
// TVA belge 21 %. Comptes revendeurs validés : remise revendeur (réglage, exemple 10 %) sur le prix HTVA.
import { FAMILLES, PRODUITS, RELEVE } from './catalogue.js';

const K = 'dh.v1.';
const auditeurs = new Set();

function lire(cle, defaut) {
  try {
    const v = localStorage.getItem(K + cle);
    return v ? JSON.parse(v) : defaut;
  } catch { return defaut; }
}
function ecrire(cle, valeur) {
  try {
    localStorage.setItem(K + cle, JSON.stringify(valeur));
    signaler(cle);
    return true;
  } catch (e) {
    console.warn('Enregistrement impossible', e);
    signaler('erreur-stockage');
    return false;
  }
}
function ecrireSansSignal(cle, valeur) { try { localStorage.setItem(K + cle, JSON.stringify(valeur)); } catch { /* stockage plein */ } }
function signaler(cle, externe = false) { auditeurs.forEach((f) => { try { f(cle, externe); } catch (e) { console.error(e); } }); }
export function ecouter(fn) { auditeurs.add(fn); return () => auditeurs.delete(fn); }
window.addEventListener('storage', (e) => {
  if (e.key === null) { cache = null; exemples = null; signaler('reinit', true); return; }
  if (e.key.startsWith(K)) {
    const cle = e.key.slice(K.length);
    if (cle === 'catalogue') cache = null;
    if (['clients', 'commandes', 'devis'].includes(cle)) exemples = null;
    signaler(cle, true);
  }
});

export const copie = (o) => JSON.parse(JSON.stringify(o));
export { RELEVE };
export const arrondi = (n) => Math.round(n * 100) / 100;

/* ---------- Réglages (repris des conditions de vente publiées ; « exemple » = à confirmer par le client) ---------- */
export const TYPES = { horeca: 'Professionnel Horeca', revendeur: 'Revendeur / installateur', particulier: 'Particulier' };
export const ACTIVITES = ['Restaurant / brasserie', 'Friterie / snack', 'Pizzeria', 'Café / bar', 'Boulangerie / pâtisserie', 'Boucherie / traiteur', 'Hôtel / B&B', 'Collectivité', 'Revendeur / installateur', 'Autre'];
export const REGLAGES_DEFAUT = {
  remiseRevendeur: 10,    // exemple : remise des revendeurs validés sur le prix HTVA
  franco: 1200,           // conditions de vente, art. 3 : livraison gratuite en Belgique dès 1 200 € HTVA
  fraisLivraison: 65,     // exemple : livraison sous le franco, HTVA
  acompte: 30,            // conditions de vente, art. 2.2 : acompte de 30 % à la commande
  tva: 21,
  seuilBonneAffaire: 35,  // promotion à partir de laquelle un produit entre dans « Bonnes affaires »
  bandeau: 'Showroom à Sint-Pieters-Leeuw, du lundi au samedi de 9 h à 17 h · Livraison dans toute la Belgique',
  societe: 'HF Concept SRL',
  numeroTva: 'BE 0631.970.638',
  telephone: '+32 2 537 51 37',
  whatsapp: '+32 471 02 66 14',
  email: 'info@discounthoreca.be',
  adresse: 'Bergensesteenweg 421, 1600 Sint-Pieters-Leeuw',
  horaires: 'Du lundi au samedi, de 9 h à 17 h',
  validiteDevis: 30,
};
export function reglages() { return { ...REGLAGES_DEFAUT, ...lire('reglages', {}) }; }
export function enregistrerReglages(r) { return ecrire('reglages', r); }
export const lienWhatsapp = (texte = '') => `https://wa.me/${reglages().whatsapp.replace(/\D/g, '')}${texte ? '?text=' + encodeURIComponent(texte) : ''}`;

/* ---------- Catalogue ---------- */
let cache = null;
function charger() {
  if (cache) return cache;
  const enr = lire('catalogue', null);
  cache = enr && enr.releve === RELEVE.date ? enr : { releve: RELEVE.date, familles: copie(FAMILLES), produits: copie(PRODUITS) };
  return cache;
}
ecouter((cle) => { if (cle === 'catalogue' || cle === 'reinit') cache = null; });
function sauverCatalogue() { return ecrire('catalogue', charger()); }

export function familles() { return charger().familles; }
export function famille(slug) { return familles().find((f) => f.slug === slug); }
export function sousFamille(fam, sous) { return famille(fam)?.sous.find((s) => s.slug === sous); }
export function tousProduits() { return charger().produits; }
export function produits() { return tousProduits().filter((p) => p.enLigne !== false); }
export function produit(id) { return tousProduits().find((p) => p.id === id); }
export function produitParRef(ref) {
  const r = norm(ref).replace(/[\s./-]+/g, '');
  return r ? produits().find((p) => norm(p.ref).replace(/[\s./-]+/g, '') === r) : undefined;
}
export function enregistrerProduit(p) {
  const c = charger();
  const i = c.produits.findIndex((x) => x.id === p.id);
  p.modifieLe = new Date().toISOString();
  if (i >= 0) c.produits[i] = p; else c.produits.unshift(p);
  return sauverCatalogue();
}
export function supprimerProduits(ids) {
  const c = charger();
  c.produits = c.produits.filter((p) => !ids.includes(p.id));
  return sauverCatalogue();
}
export function enregistrerFamilles(f) { charger().familles = f; return sauverCatalogue(); }
export function nouvelId(base) {
  const id = slug(base) || 'produit';
  const ids = new Set(tousProduits().map((p) => p.id));
  let n = 2, essai = id;
  while (ids.has(essai)) essai = `${id}-${n++}`;
  return essai;
}
export function marques() { return [...new Set(produits().map((p) => p.marque).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr')); }

/* ---------- Texte ---------- */
export function norm(s) { return String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }
export function slug(s) { return norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60); }
export function rechercher(q, max = 60) {
  const mots = norm(q).split(/[\s,;/]+/).filter((m) => m.length > 1 || /\d/.test(m));
  if (!mots.length) return [];
  const res = [];
  for (const p of produits()) {
    const sf = sousFamille(p.famille, p.sous);
    const champ = norm(`${p.nom} ${p.ref} ${p.marque || ''} ${sf?.nom || ''} ${famille(p.famille)?.nom || ''} ${(p.motsCles || []).join(' ')}`);
    let score = 0, ok = true;
    for (const m of mots) {
      if (!champ.includes(m)) { ok = false; break; }
      if (norm(p.ref).includes(m)) score += 6;
      if (norm(p.nom).startsWith(m)) score += 3;
      if (norm(sf?.nom).includes(m)) score += 2;
      score += 1;
    }
    if (ok) res.push([score, p]);
  }
  return res.sort((a, b) => b[0] - a[0]).slice(0, max).map((r) => r[1]);
}

/* ---------- Quantités et disponibilité ---------- */
export function ajusterQte(p, q) { return Math.min(99, Math.max(1, Math.round(Number(q) || 1))); }
export function surCommande(p) { return !(p.stock > 0); }

/* ---------- Prix ---------- */
export function remisePromo(p) {
  if (!p.prixBarreHT || p.prixBarreHT <= p.prixHT) return 0;
  return Math.round((1 - p.prixHT / p.prixBarreHT) * 100);
}
export function bonneAffaire(p) { return p.etat === 'exposition' || remisePromo(p) >= reglages().seuilBonneAffaire; }
export function estRevendeur(client = clientConnecte()) { return !!(client && client.type === 'revendeur' && client.statut === 'valide'); }
/* Prix unitaire HTVA pour ce client : prix public, moins la remise revendeur si le compte est validé. */
export function prixUnitaire(p, client = clientConnecte()) {
  const rev = estRevendeur(client) && p.etat !== 'exposition' ? reglages().remiseRevendeur : 0;
  return { base: p.prixHT, unit: arrondi(p.prixHT * (1 - rev / 100)), remiseRevendeur: rev, barre: p.prixBarreHT && p.prixBarreHT > p.prixHT ? p.prixBarreHT : null };
}
export function ttc(ht) { return arrondi(ht * (1 + reglages().tva / 100)); }

/* ---------- Panier ---------- */
export function panier() { return lire('panier', []); }
export function nbArticles() { return panier().reduce((s, l) => s + l.qte, 0); }
export function nbLignes() { return panier().length; }
export function ajouter(id, qte) {
  const p = produit(id);
  if (!p) return false;
  const pan = panier();
  const l = pan.find((x) => x.id === id);
  const q = ajusterQte(p, qte ?? 1);
  if (l) l.qte = ajusterQte(p, l.qte + q); else pan.push({ id, qte: q });
  return ecrire('panier', pan);
}
export function changerQte(id, qte) {
  let pan = panier();
  const p = produit(id);
  if (qte <= 0 || !p) pan = pan.filter((l) => l.id !== id);
  else { const l = pan.find((x) => x.id === id); if (l) l.qte = ajusterQte(p, qte); }
  return ecrire('panier', pan);
}
export function viderPanier() { return ecrire('panier', []); }

export function calculer(lignesBrutes, mode = 'livraison', client = clientConnecte()) {
  const r = reglages();
  const lignes = [];
  let ht = 0, economie = 0;
  for (const l of lignesBrutes) {
    const p = produit(l.id);
    if (!p) continue;
    const pu = prixUnitaire(p, client);
    const total = arrondi(pu.unit * l.qte);
    ht += total;
    economie += ((pu.barre || pu.base) - pu.unit) * l.qte;
    lignes.push({ ...l, p, ...pu, total });
  }
  ht = arrondi(ht);
  let port = 0;
  if (lignes.length && mode !== 'showroom') port = ht >= r.franco ? 0 : r.fraisLivraison;
  const baseTva = arrondi(ht + port);
  const tva = arrondi(baseTva * r.tva / 100);
  const total = arrondi(baseTva + tva);
  return {
    lignes, ht, port, tva, ttc: total, economie: arrondi(economie),
    acompte: arrondi(total * r.acompte / 100),
    resteFranco: Math.max(0, arrondi(r.franco - ht)),
  };
}

/* ---------- Clients et session ---------- */
export function clients() { return lire('clients', null) || initialiserExemples().clients; }
export function enregistrerClients(c) { return ecrire('clients', c); }
export function client(id) { return clients().find((c) => c.id === id); }
export function clientConnecte() { const id = lire('session', null); return id ? client(id) : null; }
export function connecter(id) { return ecrire('session', id); }
export function deconnecter() { return ecrire('session', null); }
export function creerClient(donnees) {
  const liste = clients();
  const type = donnees.type || 'horeca';
  const c = { id: 'c' + Date.now().toString(36), type, statut: type === 'revendeur' ? 'en-attente' : 'valide', creeLe: new Date().toISOString(), ...donnees };
  liste.unshift(c);
  enregistrerClients(liste);
  return c;
}
export function majClient(id, modif) {
  const liste = clients();
  const c = liste.find((x) => x.id === id);
  if (c) Object.assign(c, modif);
  enregistrerClients(liste);
  return c;
}
export function achatsAnnuels(id) {
  const depuis = Date.now() - 365 * 864e5;
  return arrondi(commandes().filter((c) => c.client.id === id && c.statut !== 'annulee' && new Date(c.date) > depuis).reduce((s, c) => s + c.totaux.ht, 0));
}

/* Numéro d'entreprise belge (BCE / KBO) : 10 chiffres, les 2 derniers = 97 − (8 premiers modulo 97). */
export function bceValide(s) {
  const v = String(s).replace(/^BE/i, '').replace(/\D/g, '');
  if (!/^[01]\d{9}$/.test(v)) return false;
  return 97 - (Number(v.slice(0, 8)) % 97) === Number(v.slice(8));
}
export function bceFormat(s) {
  const v = String(s).replace(/^BE/i, '').replace(/\D/g, '');
  return v.length === 10 ? `${v.slice(0, 4)}.${v.slice(4, 7)}.${v.slice(7)}` : String(s);
}
export const tvaDepuisBce = (s) => (bceValide(s) ? 'BE ' + bceFormat(s) : '');
/* Numéro fictif de forme valide (0000.00x.xxx) pour les comptes d'exemple. */
export function bceFictif(n) {
  const debut = String(n).padStart(8, '0');
  return bceFormat(debut + String(97 - (Number(debut) % 97)).padStart(2, '0'));
}

/* ---------- Commandes ---------- */
export const STATUTS = [
  { id: 'attente', nom: 'En attente de paiement', court: 'Paiement attendu' },
  { id: 'validee', nom: 'Commande confirmée', court: 'Confirmée' },
  { id: 'preparation', nom: 'En préparation', court: 'Préparation' },
  { id: 'expediee', nom: 'En livraison', court: 'En livraison' },
  { id: 'livree', nom: 'Livrée', court: 'Livrée' },
  { id: 'annulee', nom: 'Annulée', court: 'Annulée' },
];
export function statut(id, retrait = false) {
  if (retrait && id === 'expediee') return { id, nom: 'Prête au showroom', court: 'Prête' };
  if (retrait && id === 'livree') return { id, nom: 'Retirée au showroom', court: 'Retirée' };
  return STATUTS.find((s) => s.id === id) || STATUTS[1];
}
export const PAIEMENTS = {
  bancontact: 'Bancontact / Payconiq',
  carte: 'Carte Visa / Mastercard',
  virement: 'Virement bancaire',
  acompte: 'Acompte de 30 % en ligne, solde à la livraison',
  showroom: 'Paiement au showroom, au retrait',
};
export const LIVRAISONS = {
  livraison: 'Livraison en Belgique (1 livreur, devant la porte, rez-de-chaussée)',
  installation: 'Livraison + installation et raccordement (sur devis)',
  showroom: 'Retrait au showroom de Sint-Pieters-Leeuw',
};
export const MODES_COURTS = { livraison: 'Livraison', installation: 'Livraison + pose', showroom: 'Retrait showroom' };

export function commandes() { return lire('commandes', null) || initialiserExemples().commandes; }
export function enregistrerCommandes(c) { return ecrire('commandes', c); }
export function commande(num) { return commandes().find((c) => c.num === num); }
function prochainNumero(prefixe, cle, depart) {
  const n = lire(cle, depart) + 1;
  ecrire(cle, n);
  return `${prefixe}-${new Date().getFullYear()}-${String(n).padStart(5, '0')}`;
}
function figerLignes(t) {
  return t.lignes.map((l) => ({ id: l.id, ref: l.p.ref, nom: l.p.nom, image: l.p.images?.[0] || '', qte: l.qte, base: l.base, barre: l.barre, unit: l.unit, total: l.total }));
}
export function passerCommande({ client: cli, livraison, paiement, note, refClient, lignes }) {
  const t = calculer(lignes, livraison.mode, cli.id ? client(cli.id) : null);
  const statutInitial = ['virement', 'showroom'].includes(paiement) ? 'attente' : 'validee';
  const c = {
    num: prochainNumero('DH', 'compteurCommande', 3180),
    date: new Date().toISOString(),
    client: cli, livraison, paiement, note: note || '', refClient: refClient || '',
    lignes: figerLignes(t),
    totaux: { ht: t.ht, port: t.port, tva: t.tva, ttc: t.ttc, ...(paiement === 'acompte' ? { acompte: t.acompte } : {}) },
    statut: statutInitial,
    historique: [{ statut: statutInitial, date: new Date().toISOString() }],
  };
  const liste = commandes();
  liste.unshift(c);
  enregistrerCommandes(liste);
  const cat = charger();
  for (const l of c.lignes) { const p = cat.produits.find((x) => x.id === l.id); if (p && typeof p.stock === 'number' && p.stock > 0) p.stock = Math.max(0, p.stock - l.qte); }
  sauverCatalogue();
  return c;
}
export function changerStatut(num, nouveau, extra = {}) {
  const liste = commandes();
  const c = liste.find((x) => x.num === num);
  if (!c) return null;
  c.statut = nouveau;
  Object.assign(c, extra);
  c.historique.push({ statut: nouveau, date: new Date().toISOString(), ...(extra.note ? { note: extra.note } : {}) });
  enregistrerCommandes(liste);
  return c;
}

/* ---------- Devis (projet complet, installation, quantités) ---------- */
export function devis() { return lire('devis', null) || initialiserExemples().devis; }
export function enregistrerDevis(d) { return ecrire('devis', d); }
export function creerDevis({ client: cli, lignes, message }) {
  const t = calculer(lignes, 'livraison', cli.id ? client(cli.id) : null);
  const r = reglages();
  const d = {
    num: prochainNumero('DEV', 'compteurDevis', 860),
    date: new Date().toISOString(),
    validite: new Date(Date.now() + r.validiteDevis * 864e5).toISOString(),
    client: cli, message: message || '',
    lignes: figerLignes(t),
    totaux: { ht: t.ht, port: t.port, tva: t.tva, ttc: t.ttc },
    statut: 'demande',
  };
  const liste = devis();
  liste.unshift(d);
  enregistrerDevis(liste);
  return d;
}

/* ---------- Favoris et vus récemment ---------- */
export function favoris() { return lire('favoris', []); }
export function basculerFavori(id) {
  const f = favoris();
  const i = f.indexOf(id);
  if (i >= 0) f.splice(i, 1); else f.unshift(id);
  ecrire('favoris', f);
  return i < 0;
}
export function vus() { return lire('vus', []); }
export function marquerVu(id) { const v = vus().filter((x) => x !== id); v.unshift(id); ecrire('vus', v.slice(0, 12)); }

/* ---------- Export catalogue (revendeurs validés) ---------- */
export function exportCatalogueCsv(cli = clientConnecte(), base = location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '')) {
  const lignes = [['reference', 'nom', 'marque', 'famille', 'sous_categorie', 'votre_prix_htva', 'prix_public_htva', 'prix_public_tvac', 'stock', 'points_cles', 'caracteristiques', 'photo_1', 'photo_2', 'photo_3']];
  for (const p of produits()) {
    const pu = prixUnitaire(p, cli);
    lignes.push([
      p.ref, p.nom, p.marque || '', famille(p.famille)?.nom || '', sousFamille(p.famille, p.sous)?.nom || '',
      String(pu.unit).replace('.', ','), String(p.prixHT).replace('.', ','), String(ttc(p.prixHT)).replace('.', ','), p.stock,
      (p.points || []).join(' | '), (p.specs || []).map(([g, l]) => `${g} : ` + l.map(([k, v]) => `${k} = ${v}`).join(' ; ')).join(' | '),
      ...[0, 1, 2].map((i) => (p.images[i] && !p.images[i].startsWith('data:') ? base + p.images[i] : '')),
    ]);
  }
  return '﻿' + lignes.map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n');
}

/* ---------- Remise à zéro ---------- */
export function reinitialiser() {
  Object.keys(localStorage).filter((k) => k.startsWith(K)).forEach((k) => localStorage.removeItem(k));
  cache = null;
  signaler('reinit');
}

/* ---------- Exemples (clients, commandes, devis fictifs, présentés comme tels) ---------- */
let exemples = null;
function initialiserExemples() {
  if (exemples) return exemples;
  const existants = { clients: lire('clients', null), commandes: lire('commandes', null), devis: lire('devis', null) };
  if (existants.clients && existants.commandes && existants.devis) return (exemples = existants);

  const jour = 864e5, maintenant = Date.now();
  const cl = [
    { id: 'demo', type: 'horeca', societe: 'Brasserie Exemple', contact: 'Karim B.', email: 'demo@exemple.be', tel: '0470 00 00 01', adresse: 'Rue de l’Exemple 12', cp: '1060', ville: 'Saint-Gilles', statut: 'valide', activite: 'Restaurant / brasserie', langue: 'fr' },
    { id: 'c2', type: 'horeca', societe: 'Pizzeria Exemplo', contact: 'Giulia R.', email: 'giulia@exemple.be', tel: '0470 00 00 02', adresse: 'Chaussée de l’Exemple 8', cp: '1070', ville: 'Anderlecht', statut: 'valide', activite: 'Pizzeria', langue: 'fr' },
    { id: 'rev', type: 'revendeur', societe: 'Horeca Services Exemple', contact: 'Sophie M.', email: 'revendeur@exemple.be', tel: '0470 00 00 03', adresse: 'Zoning de l’Exemple 3', cp: '7000', ville: 'Mons', statut: 'valide', activite: 'Revendeur / installateur', langue: 'fr' },
    { id: 'c4', type: 'horeca', societe: 'Frituur Voorbeeld', contact: 'Thomas L.', email: 'thomas@exemple.be', tel: '0470 00 00 04', adresse: 'Voorbeeldstraat 21', cp: '9000', ville: 'Gent', statut: 'valide', activite: 'Friterie / snack', langue: 'nl' },
    { id: 'c5', type: 'revendeur', societe: 'Keukentechniek Voorbeeld', contact: 'Pieter V.', email: 'pieter@exemple.be', tel: '0470 00 00 05', adresse: 'Voorbeeldlaan 45', cp: '3000', ville: 'Leuven', statut: 'en-attente', activite: 'Revendeur / installateur', langue: 'nl' },
    { id: 'c6', type: 'horeca', societe: 'Boulangerie Exemple', contact: 'Mehdi A.', email: 'mehdi@exemple.be', tel: '0470 00 00 06', adresse: 'Rue de l’Exemple 5', cp: '1080', ville: 'Molenbeek-Saint-Jean', statut: 'valide', activite: 'Boulangerie / pâtisserie', langue: 'fr' },
  ].map((c, i) => ({ ...c, bce: bceFictif(i + 11), pays: 'Belgique' })).map((c, i) => ({ ...c, tva: 'BE ' + c.bce, creeLe: new Date(maintenant - (220 - i * 25) * jour).toISOString(), exemple: true }));

  const parSous = (s) => PRODUITS.filter((p) => p.sous === s && p.etat === 'neuf');
  const pioche = (s, k) => { const l = parSous(s); return l.length ? l[k % l.length] : null; };
  const r = REGLAGES_DEFAUT;
  const ligne = (p, q, c) => {
    const rev = c.type === 'revendeur' && c.statut === 'valide' ? r.remiseRevendeur : 0;
    const unit = arrondi(p.prixHT * (1 - rev / 100));
    return { id: p.id, ref: p.ref, nom: p.nom, image: p.images?.[0] || '', qte: q, base: p.prixHT, barre: p.prixBarreHT || null, unit, total: arrondi(unit * q) };
  };
  const paniers = [
    ['demo', [['friteuses', 0, 1], ['tables-inox', 0, 2], ['hottes-murales', 0, 1]]],
    ['c2', [['fours-a-pizza', 1, 1], ['petrins', 0, 1], ['tables-a-pizza', 0, 1]]],
    ['rev', [['lave-vaisselle', 0, 2], ['plonges', 0, 2], ['tables-inox', 1, 3]]],
    ['c4', [['friteuses', 1, 2], ['grills-panini', 0, 1]]],
    ['c6', [['comptoirs-refrigeres', 0, 1], ['batteurs-petrins', 0, 1]]],
    ['demo', [['armoires-frigorifiques', 0, 1], ['saladettes', 0, 1]]],
    ['rev', [['hottes-murales', 1, 2], ['moteurs-hottes', 0, 2]]],
    ['c2', [['laminoirs-diviseuses', 0, 1]]],
    ['c4', [['plaques-de-cuisson', 0, 1], ['planchas', 0, 1]]],
    ['demo', [['lave-verres', 0, 1], ['vitrines-boissons', 0, 1]]],
    ['rev', [['tables-refrigerees', 0, 2], ['etageres-inox', 0, 4]]],
    ['c6', [['vitrines-refrigerees', 0, 1]]],
  ];
  const statuts = ['preparation', 'validee', 'attente', 'expediee', 'expediee', 'livree', 'livree', 'livree', 'livree', 'livree', 'livree', 'livree'];
  const paiements = ['bancontact', 'acompte', 'virement', 'carte', 'bancontact', 'acompte', 'virement', 'bancontact', 'carte', 'bancontact', 'virement', 'showroom'];
  const modes = ['livraison', 'installation', 'livraison', 'showroom', 'livraison', 'livraison', 'livraison', 'showroom', 'livraison', 'livraison', 'livraison', 'showroom'];
  const cmd = paniers.map(([cid, items], i) => {
    const c = cl.find((x) => x.id === cid);
    const date = maintenant - (i * 2.6 + 0.3) * jour;
    const lg = items.map(([s, k, q]) => { const p = pioche(s, k); return p && ligne(p, q, c); }).filter(Boolean);
    const ht = arrondi(lg.reduce((s, l) => s + l.total, 0));
    const mode = modes[i];
    const port = mode === 'showroom' ? 0 : ht >= r.franco ? 0 : r.fraisLivraison;
    const tva = arrondi((ht + port) * r.tva / 100);
    const total = arrondi(ht + port + tva);
    const ordre = ['attente', 'validee', 'preparation', 'expediee', 'livree'];
    const fin = ordre.indexOf(statuts[i]);
    const avecAttente = ['virement', 'showroom'].includes(paiements[i]);
    const historique = ordre.slice(avecAttente ? 0 : 1, fin + 1).map((s, k) => ({ statut: s, date: new Date(date + k * 0.8 * jour).toISOString() }));
    const enRoute = fin >= 3 && mode !== 'showroom';
    return {
      num: `DH-${new Date(date).getFullYear()}-${String(3180 - i).padStart(5, '0')}`,
      date: new Date(date).toISOString(),
      client: { id: c.id, societe: c.societe, contact: c.contact, email: c.email, tel: c.tel, bce: c.bce, tva: c.tva },
      livraison: mode === 'showroom' ? { mode, cp: c.cp } : { mode, adresse: c.adresse, cp: c.cp, ville: c.ville, pays: 'Belgique' },
      paiement: paiements[i], note: '', refClient: i % 4 === 0 ? `BC-${2400 + i}` : '',
      lignes: lg, totaux: { ht, port, tva, ttc: total, ...(paiements[i] === 'acompte' ? { acompte: arrondi(total * r.acompte / 100) } : {}) },
      statut: statuts[i], historique,
      ...(enRoute ? { transporteur: i % 2 ? 'Livraison Discount Horeca' : 'Transporteur partenaire', suivi: `DH${String(48213077 + i * 7919).slice(0, 8)}` } : {}),
      exemple: true,
    };
  });
  const dv = [
    { cid: 'c5', items: [['lave-vaisselle', 1, 3], ['tables-inox', 2, 6], ['plonges', 1, 3]], statut: 'demande', j: 1, message: 'Équipement de trois cuisines de collectivité à Louvain : livraison groupée possible ? Merci de chiffrer avec la pose.' },
    { cid: 'demo', items: [['hottes-murales', 2, 1], ['moteurs-hottes', 1, 1], ['plaques-de-cuisson', 1, 1]], statut: 'envoye', j: 4, message: 'Rénovation de la cuisine : hotte de 3 m avec moteur, et une cuisinière. Raccordement souhaité.' },
    { cid: 'c2', items: [['fours-a-pizza', 2, 1], ['tables-a-pizza', 1, 1]], statut: 'envoye', j: 9, message: '' },
  ].map((d, i) => {
    const c = cl.find((x) => x.id === d.cid);
    const lg = d.items.map(([s, k, q]) => { const p = pioche(s, k); return p && ligne(p, q, c); }).filter(Boolean);
    const ht = arrondi(lg.reduce((s, l) => s + l.total, 0));
    const port = ht >= r.franco ? 0 : r.fraisLivraison;
    const tva = arrondi((ht + port) * r.tva / 100);
    const date = maintenant - d.j * jour;
    return {
      num: `DEV-${new Date(date).getFullYear()}-${String(860 - i).padStart(5, '0')}`,
      date: new Date(date).toISOString(), validite: new Date(date + 30 * jour).toISOString(),
      client: { id: c.id, societe: c.societe, contact: c.contact, email: c.email, tel: c.tel, bce: c.bce, tva: c.tva },
      message: d.message, lignes: lg, totaux: { ht, port, tva, ttc: arrondi(ht + port + tva) }, statut: d.statut, exemple: true,
    };
  });
  exemples = { clients: cl, commandes: cmd, devis: dv };
  ecrireSansSignal('clients', cl);
  ecrireSansSignal('commandes', cmd);
  ecrireSansSignal('devis', dv);
  return exemples;
}
ecouter((cle) => { if (cle === 'reinit') exemples = null; });
