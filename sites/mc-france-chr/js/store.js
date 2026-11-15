// Données de la démo MC France CHR — plateforme de vente en gros pour revendeurs, partagée entre boutique et admin.
// Tout reste dans le navigateur (localStorage) : l'admin et la boutique ouverts dans le même navigateur se répondent.
// La vraie version s'appuie sur un serveur (base de données, comptes, paiement, e-mails).
//
// Prix : `prixHT` d'un produit = prix public conseillé HT (PPC), relevé sur mcfrancechr.fr.
// Le prix revendeur = PPC − remise revendeur (réglage, exemple 30 %), sauf prix revendeur fixé produit par produit.
import { FAMILLES, PRODUITS, RELEVE } from './catalogue.js';

const K = 'mcf.v2.';
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

/* ---------- Réglages (exemples, modifiables dans l'admin) ---------- */
export const NIVEAUX = [
  { id: 'revendeur', nom: 'Revendeur', remise: 0, seuil: 0 },
  { id: 'silver', nom: 'Silver', remise: 3, seuil: 20000 },
  { id: 'gold', nom: 'Gold', remise: 5, seuil: 60000 },
  { id: 'distributeur', nom: 'Distributeur', remise: 8, seuil: 150000 },
];
export const ACTIVITES = ['Grossiste', 'Revendeur en magasin', 'E-commerçant', 'Cuisiniste / installateur', 'Centrale d’achat', 'Export', 'Autre'];
export const REGLAGES_DEFAUT = {
  remiseRevendeur: 30,    // exemple : prix revendeur = PPC − 30 %
  minimumCommande: 1500,  // exemple : minimum par commande, HT
  francoPalette: 3000,    // exemple : livraison offerte dès ce montant HT
  fraisPort: 89,          // exemple : messagerie / palette sous le franco, HT
  hayon: 45,              // exemple : supplément camion hayon + rendez-vous, HT
  fraisDirect: 25,        // exemple : supplément livraison directe au client final (étiquette neutre), HT
  remise3lots: 3,         // exemple : dès 3 lots d'une même référence
  remisePalette: 7,       // exemple : à la palette complète
  tva: 20,
  bandeau: 'Grossiste français depuis 2013 · Showroom et entrepôt à Roubaix · Livraison France, Belgique et export',
  telephone: '03 20 77 59 04',
  mobile: '06 44 89 80 00',
  email: 'contact@mcfrancechr.fr',
  adresse: '139 rue des Arts, 59100 Roubaix',
  validiteDevis: 30,
};
export function reglages() { return { ...REGLAGES_DEFAUT, ...lire('reglages', {}) }; }
export function enregistrerReglages(r) { return ecrire('reglages', r); }

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
  const r = norm(ref).replace(/\s+/g, '');
  return produits().find((p) => norm(p.ref).replace(/\s+/g, '') === r);
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
    const champ = norm(`${p.nom} ${p.ref} ${p.marque || ''} ${sf?.nom || ''} ${famille(p.famille)?.nom || ''}`);
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

/* ---------- Conditionnement (exemples dérivés du prix, modifiables par produit) ---------- */
export function colisage(p) {
  if (p.colisage) return p.colisage;
  if (p.etat === 'second-choix') return 1;
  return p.prixHT < 150 ? 6 : p.prixHT < 500 ? 3 : p.prixHT < 1500 ? 2 : 1;
}
export function parPalette(p) {
  if (p.palette) return p.palette;
  if (p.etat === 'second-choix') return 1;
  return p.prixHT < 150 ? 48 : p.prixHT < 500 ? 18 : p.prixHT < 1500 ? 8 : 4;
}
/* Quantité valide : multiple du colisage, au moins un lot. */
export function ajusterQte(p, q) {
  const c = colisage(p);
  return Math.min(9999, Math.max(c, Math.ceil((Number(q) || c) / c) * c));
}
export function arrivage(p) {
  if (p.arrivage) return p.arrivage;
  if (p.stock > 0) return null;
  // exemple : date d'arrivage simulée, stable par produit (2 à 5 semaines après le relevé)
  const h = [...p.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const d = new Date(RELEVE.date);
  d.setDate(d.getDate() + 14 + (h % 4) * 7);
  return d.toISOString().slice(0, 10);
}

/* ---------- Prix ---------- */
export function ppc(p) { return p.prixHT; }
export function prixRevendeur(p) {
  if (p.prixRevendeur) return p.prixRevendeur;
  return arrondi(p.prixHT * (1 - reglages().remiseRevendeur / 100));
}
/* Prix revendeur habituel quand le produit est en déstockage (prix public barré sur le site actuel). */
export function prixRevendeurBarre(p) {
  if (!remiseDestockage(p) || p.prixRevendeur) return null;
  return arrondi(p.prixBarreHT * (1 - reglages().remiseRevendeur / 100));
}
/* Déstockage : baisse d'au moins 30 % du prix public relevé (les petites remises du site restent dans le PPC). */
export const SEUIL_DESTOCKAGE = 30;
export function remiseDestockage(p) {
  if (!p.prixBarreHT || p.etat === 'second-choix') return 0;
  const r = Math.round((1 - p.prixHT / p.prixBarreHT) * 100);
  return r >= SEUIL_DESTOCKAGE ? r : 0;
}
export function marge(p, unit = prixRevendeur(p)) {
  const m = arrondi(ppc(p) - unit);
  return { montant: m, taux: ppc(p) ? Math.round((m / ppc(p)) * 100) : 0, coef: unit ? Math.round((ppc(p) / unit) * 100) / 100 : 0 };
}
export function paliersDe(p) {
  if (p.etat === 'second-choix') return [];
  const r = reglages();
  const c = colisage(p), pal = parPalette(p);
  const liste = [];
  if (r.remise3lots > 0 && 3 * c < pal) liste.push({ min: 3 * c, remise: r.remise3lots, libelle: '3 lots' });
  if (r.remisePalette > 0) liste.push({ min: pal, remise: r.remisePalette, libelle: '1 palette' });
  return liste;
}
export function niveau(client) { return NIVEAUX.find((n) => n.id === client?.niveau) || NIVEAUX[0]; }
export function prixUnitaire(p, qte = colisage(p), client = clientConnecte()) {
  const pal = paliersDe(p).filter((x) => qte >= x.min).pop();
  const remPal = pal ? pal.remise : 0;
  const remCli = client && client.statut === 'valide' && p.etat !== 'second-choix' ? niveau(client).remise : 0;
  const base = prixRevendeur(p);
  const unit = arrondi(base * (1 - remPal / 100) * (1 - remCli / 100));
  return { base, unit, remisePalier: remPal, remiseClient: remCli, ppc: ppc(p) };
}
export function ttc(ht) { return arrondi(ht * (1 + reglages().tva / 100)); }
/* Les prix revendeur ne s'affichent qu'aux comptes validés. */
export function prixVisibles() { const c = clientConnecte(); return !!(c && c.statut === 'valide'); }

/* ---------- Panier ---------- */
export function panier() { return lire('panier', []); }
export function nbArticles() { return panier().reduce((s, l) => s + l.qte, 0); }
export function nbLignes() { return panier().length; }
export function ajouter(id, qte) {
  const p = produit(id);
  if (!p) return false;
  const pan = panier();
  const l = pan.find((x) => x.id === id);
  const q = ajusterQte(p, qte ?? colisage(p));
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

export function calculer(lignesBrutes, mode = 'palette', client = clientConnecte()) {
  const r = reglages();
  const lignes = [];
  let ht = 0, htPpc = 0;
  for (const l of lignesBrutes) {
    const p = produit(l.id);
    if (!p) continue;
    const pu = prixUnitaire(p, l.qte, client);
    const total = arrondi(pu.unit * l.qte);
    ht += total;
    htPpc += ppc(p) * l.qte;
    lignes.push({ ...l, p, ...pu, total });
  }
  ht = arrondi(ht);
  let port = 0;
  if (lignes.length && mode !== 'enlevement') {
    port = ht >= r.francoPalette ? 0 : r.fraisPort;
    if (mode === 'hayon') port += r.hayon;
    if (mode === 'direct') port += r.fraisDirect;
  }
  const baseTva = arrondi(ht + port);
  const tva = arrondi(baseTva * r.tva / 100);
  return {
    lignes, ht, port, tva, ttc: arrondi(baseTva + tva),
    margeEstimee: arrondi(htPpc - ht), valeurPpc: arrondi(htPpc),
    resteFranco: Math.max(0, arrondi(r.francoPalette - ht)),
    manqueMinimum: Math.max(0, arrondi(r.minimumCommande - ht)),
  };
}

/* ---------- Clients pros et session ---------- */
export function clients() { return lire('clients', null) || initialiserExemples().clients; }
export function enregistrerClients(c) { return ecrire('clients', c); }
export function client(id) { return clients().find((c) => c.id === id); }
export function clientConnecte() { const id = lire('session', null); return id ? client(id) : null; }
export function connecter(id) { return ecrire('session', id); }
export function deconnecter() { return ecrire('session', null); }
export function creerClient(donnees) {
  const liste = clients();
  const c = { id: 'c' + Date.now().toString(36), statut: 'en-attente', conditions: 'comptant', niveau: 'revendeur', creeLe: new Date().toISOString(), ...donnees };
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
/* Volume d'achat HT sur 12 mois glissants, pour le niveau de remise. */
export function volumeAnnuel(id) {
  const depuis = Date.now() - 365 * 864e5;
  return arrondi(commandes().filter((c) => c.client.id === id && c.statut !== 'annulee' && new Date(c.date) > depuis).reduce((s, c) => s + c.totaux.ht, 0));
}

/* SIRET : 14 chiffres, clé de Luhn (cas particulier de La Poste accepté). */
export function siretValide(s) {
  const v = String(s).replace(/\s/g, '');
  if (!/^\d{14}$/.test(v)) return false;
  if (v.startsWith('356000000')) return v.split('').reduce((a, c) => a + +c, 0) % 5 === 0;
  let somme = 0;
  for (let i = 0; i < 14; i++) {
    let d = +v[13 - i];
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    somme += d;
  }
  return somme % 10 === 0;
}
/* SIRET fictif (clé de Luhn correcte) pour les comptes d'exemple. */
export function siretFictif(n) {
  const corps = ('9' + String(n * 7351 + 1000).padStart(5, '0') + '0000000').slice(0, 13);
  for (let d = 0; d < 10; d++) if (siretValide(corps + d)) return corps + d;
  return corps + '0';
}
/* Numéro de TVA intracommunautaire français déduit du SIREN. */
export function tvaDepuisSiret(s) {
  const siren = String(s).replace(/\s/g, '').slice(0, 9);
  if (!/^\d{9}$/.test(siren)) return '';
  const cle = (12 + 3 * (Number(siren) % 97)) % 97;
  return `FR${String(cle).padStart(2, '0')}${siren}`;
}

/* ---------- Commandes ---------- */
export const STATUTS = [
  { id: 'attente', nom: 'En attente de paiement', court: 'Paiement attendu' },
  { id: 'validee', nom: 'Commande validée', court: 'Validée' },
  { id: 'preparation', nom: 'En préparation', court: 'Préparation' },
  { id: 'expediee', nom: 'Expédiée', court: 'Expédiée' },
  { id: 'livree', nom: 'Livrée', court: 'Livrée' },
  { id: 'annulee', nom: 'Annulée', court: 'Annulée' },
];
export function statut(id, retrait = false) {
  if (retrait && id === 'expediee') return { id, nom: 'Prête à l’entrepôt', court: 'Prête' };
  if (retrait && id === 'livree') return { id, nom: 'Enlevée', court: 'Enlevée' };
  return STATUTS.find((s) => s.id === id) || STATUTS[1];
}
export const PAIEMENTS = {
  virement: 'Virement bancaire (préparation à réception)',
  cb: 'Carte bancaire',
  '30j': '30 jours fin de mois',
  '45j': 'LCR à 45 jours fin de mois',
};
export const LIVRAISONS = {
  palette: 'Messagerie / palette (1 à 3 jours ouvrés)',
  hayon: 'Camion avec hayon + rendez-vous',
  direct: 'Livraison directe chez votre client (étiquette neutre)',
  enlevement: 'Enlèvement à l’entrepôt de Roubaix',
};

export function commandes() { return lire('commandes', null) || initialiserExemples().commandes; }
export function enregistrerCommandes(c) { return ecrire('commandes', c); }
export function commande(num) { return commandes().find((c) => c.num === num); }
function prochainNumero(prefixe, cle, depart) {
  const n = lire(cle, depart) + 1;
  ecrire(cle, n);
  return `${prefixe}-${new Date().getFullYear()}-${String(n).padStart(5, '0')}`;
}
function figerLignes(t) {
  return t.lignes.map((l) => ({ id: l.id, ref: l.p.ref, nom: l.p.nom, image: l.p.images?.[0] || '', qte: l.qte, base: l.base, unit: l.unit, ppc: l.ppc, total: l.total }));
}
export function passerCommande({ client: cli, livraison, paiement, note, refClient, lignes }) {
  const t = calculer(lignes, livraison.mode, cli.id ? client(cli.id) : null);
  const statutInitial = paiement === 'virement' ? 'attente' : 'validee';
  const c = {
    num: prochainNumero('MCF', 'compteurCommande', 10480),
    date: new Date().toISOString(),
    client: cli, livraison, paiement, note: note || '', refClient: refClient || '',
    lignes: figerLignes(t),
    totaux: { ht: t.ht, port: t.port, tva: t.tva, ttc: t.ttc },
    statut: statutInitial,
    historique: [{ statut: statutInitial, date: new Date().toISOString() }],
  };
  const liste = commandes();
  liste.unshift(c);
  enregistrerCommandes(liste);
  const cat = charger();
  for (const l of c.lignes) { const p = cat.produits.find((x) => x.id === l.id); if (p && typeof p.stock === 'number') p.stock = Math.max(0, p.stock - l.qte); }
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

/* ---------- Devis (demandes de prix volume) ---------- */
export function devis() { return lire('devis', null) || initialiserExemples().devis; }
export function enregistrerDevis(d) { return ecrire('devis', d); }
export function creerDevis({ client: cli, lignes, message }) {
  const t = calculer(lignes, 'palette', cli.id ? client(cli.id) : null);
  const r = reglages();
  const d = {
    num: prochainNumero('DEV', 'compteurDevis', 2210),
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

/* ---------- Export catalogue pour le site du revendeur ---------- */
export function exportCatalogueCsv(client = clientConnecte(), base = location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '')) {
  const lignes = [['reference', 'nom', 'marque', 'famille', 'sous_categorie', 'prix_revendeur_ht', 'prix_public_conseille_ht', 'colisage', 'unites_par_palette', 'stock', 'points_cles', 'caracteristiques', 'photo_1', 'photo_2', 'photo_3']];
  for (const p of produits()) {
    const pu = prixUnitaire(p, colisage(p), client);
    lignes.push([
      p.ref, p.nom, p.marque || '', famille(p.famille)?.nom || '', sousFamille(p.famille, p.sous)?.nom || '',
      String(pu.unit).replace('.', ','), String(ppc(p)).replace('.', ','), colisage(p), parPalette(p), p.stock,
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

/* ---------- Exemples (revendeurs, commandes, devis fictifs, présentés comme tels) ---------- */
let exemples = null;
function initialiserExemples() {
  if (exemples) return exemples;
  const existants = { clients: lire('clients', null), commandes: lire('commandes', null), devis: lire('devis', null) };
  if (existants.clients && existants.commandes && existants.devis) return (exemples = existants);

  const jour = 864e5, maintenant = Date.now();
  const cl = [
    { id: 'demo', societe: 'Nordéquip Pro', contact: 'Karim B.', email: 'demo@exemple.fr', tel: '06 00 00 00 01', adresse: '12 rue du Port', cp: '59000', ville: 'Lille', pays: 'France', statut: 'valide', conditions: '30j', niveau: 'gold', activite: 'Grossiste' },
    { id: 'c2', societe: 'Somme Cuisine Équipement', contact: 'Julie R.', email: 'julie@exemple.fr', tel: '06 00 00 00 02', adresse: '8 rue de Noyon', cp: '80000', ville: 'Amiens', pays: 'France', statut: 'valide', conditions: 'comptant', niveau: 'silver', activite: 'Revendeur en magasin' },
    { id: 'c3', societe: 'Artois Inox Services', contact: 'Sophie M.', email: 'sophie@exemple.fr', tel: '06 00 00 00 03', adresse: '3 rue Gambetta', cp: '62000', ville: 'Arras', pays: 'France', statut: 'valide', conditions: '45j', niveau: 'revendeur', activite: 'Cuisiniste / installateur' },
    { id: 'c4', societe: 'Tournai Horeca Partner', contact: 'Thomas L.', email: 'thomas@exemple.fr', tel: '06 00 00 00 04', adresse: '21 Grand-Place', cp: '7500', ville: 'Tournai', pays: 'Belgique', statut: 'valide', conditions: 'comptant', niveau: 'silver', activite: 'Revendeur en magasin' },
    { id: 'c5', societe: 'Kitchen Market en ligne', contact: 'Mehdi A.', email: 'mehdi@exemple.fr', tel: '06 00 00 00 05', adresse: '45 rue du Moulin', cp: '59200', ville: 'Tourcoing', pays: 'France', statut: 'en-attente', conditions: 'comptant', niveau: 'revendeur', activite: 'E-commerçant' },
    { id: 'c6', societe: 'Atlas Équipement Export', contact: 'Service achats', email: 'achats@exemple.fr', tel: '03 00 00 00 06', adresse: 'Zone portuaire', cp: '59140', ville: 'Dunkerque', pays: 'France', statut: 'en-attente', conditions: 'comptant', niveau: 'revendeur', activite: 'Export' },
  ].map((c, i) => ({ ...c, siret: siretFictif(i + 1) })).map((c, i) => ({ ...c, tva: c.pays === 'France' ? tvaDepuisSiret(c.siret) : 'BE0000000000', creeLe: new Date(maintenant - (200 - i * 20) * jour).toISOString(), exemple: true }));

  const parSous = (s) => PRODUITS.filter((p) => p.sous === s && p.etat === 'neuf');
  const pioche = (s, k) => { const l = parSous(s); return l[k % Math.max(1, l.length)]; };
  const r = REGLAGES_DEFAUT;
  const colis = (p) => (p.prixHT < 150 ? 6 : p.prixHT < 500 ? 3 : p.prixHT < 1500 ? 2 : 1);
  const pal = (p) => (p.prixHT < 150 ? 48 : p.prixHT < 500 ? 18 : p.prixHT < 1500 ? 8 : 4);
  const ligne = (p, lots, c) => {
    const q = lots === 'palette' ? pal(p) : colis(p) * lots;
    const remPal = q >= pal(p) ? r.remisePalette : q >= 3 * colis(p) && 3 * colis(p) < pal(p) ? r.remise3lots : 0;
    const remCli = (NIVEAUX.find((n) => n.id === c.niveau) || NIVEAUX[0]).remise;
    const base = arrondi(p.prixHT * (1 - r.remiseRevendeur / 100));
    const unit = arrondi(base * (1 - remPal / 100) * (1 - remCli / 100));
    return { id: p.id, ref: p.ref, nom: p.nom, image: p.images?.[0] || '', qte: q, base, unit, ppc: p.prixHT, total: arrondi(unit * q) };
  };
  const paniers = [
    ['demo', [['friteuses', 0, 'palette'], ['chauffe-frites', 0, 3], ['tables-inox', 0, 3]]],
    ['c2', [['fours-a-pizza', 1, 2], ['petrins', 0, 1], ['saladettes-a-pizza', 0, 2]]],
    ['c3', [['plonges', 0, 2], ['lave-mains', 0, 3], ['hottes', 0, 2]]],
    ['c4', [['lave-verres', 0, 2], ['armoires-refrigerees', 1, 3], ['machines-a-glacons', 0, 1]]],
    ['demo', [['planchas', 0, 3], ['bain-marie', 0, 'palette']]],
    ['c2', [['tables-inox', 1, 'palette'], ['etageres', 0, 3]]],
    ['c3', [['moteurs', 0, 2], ['hottes', 1, 2]]],
    ['c4', [['fours', 0, 1], ['vitrines-chauffantes', 0, 3]]],
    ['demo', [['kebab', 1, 3], ['saladettes', 3, 2]]],
    ['c2', [['faconneuses', 0, 2], ['petrins', 1, 1]]],
    ['demo', [['armoires-refrigerees', 2, 'palette']]],
    ['c4', [['tables-refrigerees', 0, 2], ['plonges', 1, 1]]],
    ['c3', [['tables-inox', 2, 'palette']]],
    ['demo', [['crepieres-gaufriers', 3, 'palette'], ['grills-salamandres', 0, 3]]],
  ];
  const statuts = ['preparation', 'validee', 'attente', 'expediee', 'expediee', 'livree', 'livree', 'livree', 'livree', 'livree', 'livree', 'livree', 'livree', 'livree'];
  const paiements = ['30j', 'cb', 'virement', 'virement', '30j', 'cb', '45j', 'virement', '30j', 'cb', '30j', 'virement', '45j', '30j'];
  const modes = ['palette', 'hayon', 'direct', 'enlevement', 'palette', 'palette', 'direct', 'hayon', 'palette', 'palette', 'hayon', 'palette', 'direct', 'palette'];
  const cmd = paniers.map(([cid, items], i) => {
    const c = cl.find((x) => x.id === cid);
    const date = maintenant - (i * 2.4 + 0.3) * jour;
    const lg = items.map(([s, k, lots]) => { const p = pioche(s, k); return p && ligne(p, lots, c); }).filter(Boolean);
    const ht = arrondi(lg.reduce((s, l) => s + l.total, 0));
    const mode = modes[i];
    const port = mode === 'enlevement' ? 0 : (ht >= r.francoPalette ? 0 : r.fraisPort) + (mode === 'hayon' ? r.hayon : 0) + (mode === 'direct' ? r.fraisDirect : 0);
    const tva = arrondi((ht + port) * 0.2);
    const ordre = ['attente', 'validee', 'preparation', 'expediee', 'livree'];
    const fin = ordre.indexOf(statuts[i]);
    const historique = ordre.slice(paiements[i] === 'virement' ? 0 : 1, fin + 1).map((s, k) => ({ statut: s, date: new Date(date + k * 0.8 * jour).toISOString() }));
    const expe = fin >= 3 && mode !== 'enlevement';
    const livraison = mode === 'direct'
      ? { mode, adresse: '5 place du Marché', cp: '59300', ville: 'Valenciennes', pays: 'France', destinataire: 'Client final (exemple)' }
      : { mode, adresse: c.adresse, cp: c.cp, ville: c.ville, pays: c.pays };
    return {
      num: `MCF-${new Date(date).getFullYear()}-${String(10480 - i).padStart(5, '0')}`,
      date: new Date(date).toISOString(),
      client: { id: c.id, societe: c.societe, contact: c.contact, email: c.email, tel: c.tel, siret: c.siret, tva: c.tva },
      livraison, paiement: paiements[i], note: '', refClient: i % 3 === 0 ? `BC-${2400 + i}` : '',
      lignes: lg, totaux: { ht, port, tva, ttc: arrondi(ht + port + tva) },
      statut: statuts[i], historique,
      ...(expe ? { transporteur: i % 2 ? 'DB Schenker' : 'Geodis', suivi: `EX${String(48213077 + i * 7919).slice(0, 8)}FR` } : {}),
      exemple: true,
    };
  });
  const dv = [
    { cid: 'c6', items: [['fours-a-pizza', 3, 'palette'], ['petrins', 3, 'palette'], ['saladettes-a-pizza', 1, 'palette']], statut: 'demande', j: 1, message: 'Conteneur 40 pieds pour l’export : possible de regrouper avec du froid ? Merci de chiffrer départ entrepôt Roubaix.' },
    { cid: 'c2', items: [['lave-vaisselle', 0, 3], ['tables-inox', 0, 'palette']], statut: 'envoye', j: 4, message: '' },
    { cid: 'demo', items: [['hottes', 1, 3], ['moteurs', 0, 3]], statut: 'envoye', j: 9, message: '' },
  ].map((d, i) => {
    const c = cl.find((x) => x.id === d.cid);
    const lg = d.items.map(([s, k, lots]) => { const p = pioche(s, k); return p && ligne(p, lots, c); }).filter(Boolean);
    const ht = arrondi(lg.reduce((s, l) => s + l.total, 0));
    const port = ht >= r.francoPalette ? 0 : r.fraisPort;
    const tva = arrondi((ht + port) * 0.2);
    const date = maintenant - d.j * jour;
    return {
      num: `DEV-${new Date(date).getFullYear()}-${String(2210 - i).padStart(5, '0')}`,
      date: new Date(date).toISOString(), validite: new Date(date + 30 * jour).toISOString(),
      client: { id: c.id, societe: c.societe, contact: c.contact, email: c.email, tel: c.tel, siret: c.siret, tva: c.tva },
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
