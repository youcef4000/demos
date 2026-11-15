// Données de la démo MC France CHR, partagées entre la boutique et l'espace admin.
// Tout reste dans le navigateur (localStorage) : ce que l'admin modifie apparaît dans la boutique du même
// navigateur, y compris dans un autre onglet. La vraie version s'appuie sur une base de données et un serveur.
import { FAMILLES, PRODUITS, RELEVE } from './catalogue.js';

const K = 'mcf.v1.';
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
function ecrireSansSignal(cle, valeur) { try { localStorage.setItem(K + cle, JSON.stringify(valeur)); } catch { /* navigation privée pleine */ } }
function signaler(cle, externe = false) { auditeurs.forEach((f) => { try { f(cle, externe); } catch (e) { console.error(e); } }); }
export function ecouter(fn) { auditeurs.add(fn); return () => auditeurs.delete(fn); }
window.addEventListener('storage', (e) => {
  if (e.key === null) { cache = null; exemples = null; signaler('reinit', true); return; }
  if (e.key.startsWith(K)) { const cle = e.key.slice(K.length); if (cle === 'catalogue') cache = null; if (['clients', 'commandes', 'devis'].includes(cle)) exemples = null; signaler(cle, true); }
});

export const copie = (o) => JSON.parse(JSON.stringify(o));
export { RELEVE };

/* ---------- Réglages ---------- */
export const REGLAGES_DEFAUT = {
  franco: 750,            // réel : livraison offerte dès 750 € HT (France, Belgique, hors Corse)
  forfait: 49,            // exemple : port sous le franco
  hayon: 35,              // exemple : supplément camion avec hayon + rendez-vous
  tva: 20,
  paliers: [{ min: 3, remise: 3 }, { min: 10, remise: 6 }], // exemple : prix dégressifs par quantité
  bandeau: 'Livraison offerte dès 750 € HT en France et en Belgique (hors Corse)',
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
function sauverCatalogue() { const c = charger(); return ecrire('catalogue', c); }

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
  let id = slug(base) || 'produit';
  const ids = new Set(tousProduits().map((p) => p.id));
  let n = 2, essai = id;
  while (ids.has(essai)) essai = `${id}-${n++}`;
  return essai;
}

/* ---------- Texte ---------- */
export function norm(s) {
  return String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
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

/* ---------- Prix ---------- */
export const arrondi = (n) => Math.round(n * 100) / 100;
export function paliersDe(p) { if (p.etat === 'second-choix') return []; return (p.paliers && p.paliers.length ? p.paliers : reglages().paliers).slice().sort((a, b) => a.min - b.min); }
export function prixUnitaire(p, qte = 1, client = clientConnecte()) {
  const pal = paliersDe(p).filter((x) => qte >= x.min).pop();
  const remPal = pal ? pal.remise : 0;
  const remCli = client && client.statut === 'valide' ? Number(client.remise || 0) : 0;
  const unit = arrondi(p.prixHT * (1 - remPal / 100) * (1 - remCli / 100));
  return { base: p.prixHT, unit, remisePalier: remPal, remiseClient: remCli };
}
export function ttc(ht) { return arrondi(ht * (1 + reglages().tva / 100)); }

/* ---------- Panier ---------- */
export function panier() { return lire('panier', []); }
export function nbArticles() { return panier().reduce((s, l) => s + l.qte, 0); }
export function ajouter(id, qte = 1) {
  const p = produit(id);
  if (!p) return false;
  const pan = panier();
  const l = pan.find((x) => x.id === id);
  if (l) l.qte = Math.min(999, l.qte + qte); else pan.push({ id, qte: Math.min(999, qte) });
  return ecrire('panier', pan);
}
export function changerQte(id, qte) {
  let pan = panier();
  if (qte <= 0) pan = pan.filter((l) => l.id !== id);
  else { const l = pan.find((x) => x.id === id); if (l) l.qte = Math.min(999, qte); }
  return ecrire('panier', pan);
}
export function viderPanier() { return ecrire('panier', []); }

export function calculer(lignesBrutes, modeLivraison = 'standard', client = clientConnecte()) {
  const r = reglages();
  const lignes = [];
  let ht = 0, economie = 0;
  for (const l of lignesBrutes) {
    const p = produit(l.id);
    if (!p) continue;
    const pu = prixUnitaire(p, l.qte, client);
    const total = arrondi(pu.unit * l.qte);
    economie += arrondi((pu.base - pu.unit) * l.qte);
    if (p.prixBarreHT) economie += arrondi((p.prixBarreHT - p.prixHT) * l.qte);
    ht += total;
    lignes.push({ ...l, p, ...pu, total });
  }
  ht = arrondi(ht);
  let port = 0;
  if (lignes.length && modeLivraison !== 'retrait') {
    port = ht >= r.franco ? 0 : r.forfait;
    if (modeLivraison === 'hayon') port += r.hayon;
  }
  const baseTva = arrondi(ht + port);
  const tva = arrondi(baseTva * r.tva / 100);
  return { lignes, ht, port, tva, ttc: arrondi(baseTva + tva), economie: arrondi(economie), resteFranco: Math.max(0, arrondi(r.franco - ht)) };
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
  const c = { id: 'c' + Date.now().toString(36), statut: 'en-attente', conditions: 'comptant', remise: 0, creeLe: new Date().toISOString(), ...donnees };
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
  if (retrait && id === 'expediee') return { id, nom: 'Prête au showroom', court: 'Prête' };
  if (retrait && id === 'livree') return { id, nom: 'Retirée', court: 'Retirée' };
  return STATUTS.find((s) => s.id === id) || STATUTS[1];
}
export const PAIEMENTS = {
  cb: 'Carte bancaire',
  virement: 'Virement bancaire',
  '4x': 'Paiement en 4 fois sans frais',
  '30j': 'À 30 jours fin de mois (compte pro validé)',
};
export const LIVRAISONS = {
  standard: 'Livraison standard (1 à 3 jours ouvrés)',
  hayon: 'Camion avec hayon + rendez-vous',
  retrait: 'Retrait au showroom de Roubaix',
};

export function commandes() { return lire('commandes', null) || initialiserExemples().commandes; }
export function enregistrerCommandes(c) { return ecrire('commandes', c); }
export function commande(num) { return commandes().find((c) => c.num === num); }
function prochainNumero(prefixe, cle, depart) {
  const n = lire(cle, depart) + 1;
  ecrire(cle, n);
  return `${prefixe}-${new Date().getFullYear()}-${String(n).padStart(5, '0')}`;
}
export function passerCommande({ client: cli, livraison, paiement, note, lignes }) {
  const t = calculer(lignes, livraison.mode, cli.id ? client(cli.id) : null);
  const statutInitial = paiement === 'virement' ? 'attente' : 'validee';
  const c = {
    num: prochainNumero('MCF', 'compteurCommande', 10480),
    date: new Date().toISOString(),
    client: cli, livraison, paiement, note: note || '',
    lignes: t.lignes.map((l) => ({ id: l.id, ref: l.p.ref, nom: l.p.nom, image: l.p.images?.[0] || '', qte: l.qte, base: l.base, unit: l.unit, total: l.total })),
    totaux: { ht: t.ht, port: t.port, tva: t.tva, ttc: t.ttc },
    statut: statutInitial,
    historique: [{ statut: statutInitial, date: new Date().toISOString() }],
  };
  const liste = commandes();
  liste.unshift(c);
  enregistrerCommandes(liste);
  // le stock suit la commande
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

/* ---------- Devis ---------- */
export function devis() { return lire('devis', null) || initialiserExemples().devis; }
export function enregistrerDevis(d) { return ecrire('devis', d); }
export function creerDevis({ client: cli, lignes, message }) {
  const t = calculer(lignes, 'standard', cli.id ? client(cli.id) : null);
  const r = reglages();
  const d = {
    num: prochainNumero('DEV', 'compteurDevis', 2210),
    date: new Date().toISOString(),
    validite: new Date(Date.now() + r.validiteDevis * 864e5).toISOString(),
    client: cli, message: message || '',
    lignes: t.lignes.map((l) => ({ id: l.id, ref: l.p.ref, nom: l.p.nom, image: l.p.images?.[0] || '', qte: l.qte, base: l.base, unit: l.unit, total: l.total })),
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

/* ---------- Remise à zéro ---------- */
export function reinitialiser() {
  Object.keys(localStorage).filter((k) => k.startsWith(K)).forEach((k) => localStorage.removeItem(k));
  cache = null;
  signaler('reinit');
}

/* ---------- Exemples (clients et commandes fictifs, présentés comme tels) ---------- */
let exemples = null;
function initialiserExemples() {
  if (exemples) return exemples;
  const existants = { clients: lire('clients', null), commandes: lire('commandes', null), devis: lire('devis', null) };
  if (existants.clients && existants.commandes && existants.devis) return (exemples = existants);

  const jour = 864e5, maintenant = Date.now();
  const cl = [
    { id: 'demo', societe: 'Snack Le Carré', contact: 'Karim B.', email: 'demo@exemple.fr', tel: '06 00 00 00 01', adresse: '12 place de la Gare', cp: '59000', ville: 'Lille', pays: 'France', statut: 'valide', conditions: '30j', remise: 2, metier: 'Snack · fast-food' },
    { id: 'c2', societe: 'Pizzeria Bella Roubaix', contact: 'Giulia R.', email: 'giulia@exemple.fr', tel: '06 00 00 00 02', adresse: '8 rue de Lannoy', cp: '59100', ville: 'Roubaix', pays: 'France', statut: 'valide', conditions: 'comptant', remise: 0, metier: 'Pizzeria' },
    { id: 'c3', societe: 'Boulangerie du Beffroi', contact: 'Sophie M.', email: 'sophie@exemple.fr', tel: '06 00 00 00 03', adresse: '3 rue Nationale', cp: '80000', ville: 'Amiens', pays: 'France', statut: 'valide', conditions: '30j', remise: 3, metier: 'Boulangerie' },
    { id: 'c4', societe: 'Brasserie Les Arcades', contact: 'Thomas L.', email: 'thomas@exemple.fr', tel: '06 00 00 00 04', adresse: '21 Grand-Place', cp: '7500', ville: 'Tournai', pays: 'Belgique', statut: 'valide', conditions: 'comptant', remise: 0, metier: 'Brasserie' },
    { id: 'c5', societe: 'Kebab Istanbul Grill', contact: 'Mehmet A.', email: 'mehmet@exemple.fr', tel: '06 00 00 00 05', adresse: '45 rue du Moulin', cp: '59200', ville: 'Tourcoing', pays: 'France', statut: 'en-attente', conditions: 'comptant', remise: 0, metier: 'Kebab' },
    { id: 'c6', societe: 'Cantine scolaire de Wattrelos', contact: 'Service achats', email: 'achats@exemple.fr', tel: '03 00 00 00 06', adresse: 'Hôtel de ville', cp: '59150', ville: 'Wattrelos', pays: 'France', statut: 'en-attente', conditions: '30j', remise: 0, metier: 'Collectivité' },
  ].map((c, i) => ({ ...c, siret: siretFictif(i + 1) })).map((c, i) => ({ ...c, tva: c.pays === 'France' ? tvaDepuisSiret(c.siret) : 'BE0000000000', creeLe: new Date(maintenant - (90 - i * 9) * jour).toISOString(), exemple: true }));

  // Paniers d'exemple : identifiants de produits pris dans le catalogue réel, par métier.
  const parSous = (s) => PRODUITS.filter((p) => p.sous === s).map((p) => p.id);
  const pioche = (s, k) => parSous(s)[k % Math.max(1, parSous(s).length)];
  const paniers = [
    ['demo', [[pioche('friteuses', 0), 2], [pioche('chauffe-frites', 0), 1], [pioche('tables-inox', 0), 3]]],
    ['c2', [[pioche('fours-a-pizza', 1), 1], [pioche('petrins', 0), 1], [pioche('saladettes-a-pizza', 0), 1]]],
    ['c3', [[pioche('vitrines-refrigerees', 0), 1], [pioche('petrins', 1), 1]]],
    ['c4', [[pioche('lave-verres', 0), 1], [pioche('armoires-refrigerees', 1), 2], [pioche('machines-a-glacons', 0), 1]]],
    ['demo', [[pioche('planchas', 0), 1], [pioche('bain-marie', 0), 2]]],
    ['c2', [[pioche('tables-inox', 1), 4], [pioche('etageres', 0), 3]]],
    ['c3', [[pioche('batteurs-blenders', 0), 1], [pioche('tables-inox', 2), 2]]],
    ['c4', [[pioche('fours', 0), 1], [pioche('hottes', 0), 1], [pioche('moteurs', 0), 1]]],
    ['demo', [[pioche('kebab', 0), 1], [pioche('saladettes', 0), 1]]],
    ['c2', [[pioche('faconneuses', 0), 1]]],
    ['c3', [[pioche('armoires-refrigerees', 0), 2], [pioche('lave-mains', 0), 2]]],
    ['c4', [[pioche('tables-refrigerees', 0), 1], [pioche('plonges', 0), 1]]],
    ['c2', [[pioche('congelateurs', 0), 1], [pioche('machines-a-granita', 0), 1]]],
    ['c3', [[pioche('crepieres-gaufriers', 0), 2]]],
  ];
  const statuts = ['preparation', 'validee', 'attente', 'expediee', 'expediee', 'livree', 'livree', 'livree', 'livree', 'livree', 'livree', 'livree', 'livree', 'livree'];
  const paiements = ['cb', '30j', 'virement', 'cb', '4x', 'cb', '30j', 'virement', '30j', 'cb', '30j', 'cb', 'virement', '30j'];
  const prod = (id) => PRODUITS.find((p) => p.id === id);
  const cmd = paniers.map(([cid, lignes], i) => {
    const c = cl.find((x) => x.id === cid);
    const date = maintenant - (i * 2.3 + 0.2) * jour;
    let ht = 0;
    const lg = lignes.filter(([id]) => prod(id)).map(([id, q]) => {
      const p = prod(id);
      const pal = (REGLAGES_DEFAUT.paliers.filter((x) => q >= x.min).pop() || { remise: 0 }).remise;
      const unit = arrondi(p.prixHT * (1 - pal / 100) * (1 - (c.remise || 0) / 100));
      ht += unit * q;
      return { id, ref: p.ref, nom: p.nom, image: p.images?.[0] || '', qte: q, base: p.prixHT, unit, total: arrondi(unit * q) };
    });
    ht = arrondi(ht);
    const mode = i === 3 ? 'retrait' : i % 4 === 1 ? 'hayon' : 'standard';
    let port = mode === 'retrait' ? 0 : (ht >= REGLAGES_DEFAUT.franco ? 0 : REGLAGES_DEFAUT.forfait) + (mode === 'hayon' ? REGLAGES_DEFAUT.hayon : 0);
    const tva = arrondi((ht + port) * 0.2);
    const ordre = ['attente', 'validee', 'preparation', 'expediee', 'livree'];
    const fin = ordre.indexOf(statuts[i]);
    const historique = ordre.slice(paiements[i] === 'virement' ? 0 : 1, fin + 1).map((s, k) => ({ statut: s, date: new Date(date + k * 0.8 * jour).toISOString() }));
    const expe = fin >= 3 && mode !== 'retrait';
    return {
      num: `MCF-${new Date(date).getFullYear()}-${String(10480 - i).padStart(5, '0')}`,
      date: new Date(date).toISOString(),
      client: { id: c.id, societe: c.societe, contact: c.contact, email: c.email, tel: c.tel, siret: c.siret, tva: c.tva },
      livraison: { mode, adresse: c.adresse, cp: c.cp, ville: c.ville, pays: c.pays },
      paiement: paiements[i], note: '',
      lignes: lg, totaux: { ht, port, tva, ttc: arrondi(ht + port + tva) },
      statut: statuts[i], historique,
      ...(expe ? { transporteur: i % 2 ? 'DB Schenker' : 'Geodis', suivi: `EX${String(48213077 + i * 7919).slice(0, 8)}FR` } : {}),
      exemple: true,
    };
  });
  const dv = [
    { cid: 'c4', lignes: [[pioche('lave-vaisselle', 0), 1], [pioche('tables-inox', 0), 2], [pioche('etageres', 1), 2]], statut: 'demande', j: 1 },
    { cid: 'c6', lignes: [[pioche('fours', 1), 2], [pioche('armoires-refrigerees', 2), 3]], statut: 'envoye', j: 4 },
    { cid: 'demo', lignes: [[pioche('hottes', 1), 1], [pioche('moteurs', 0), 1]], statut: 'envoye', j: 9 },
  ].map((d, i) => {
    const c = cl.find((x) => x.id === d.cid);
    let ht = 0;
    const lg = d.lignes.filter(([id]) => prod(id)).map(([id, q]) => {
      const p = prod(id);
      const pal = (REGLAGES_DEFAUT.paliers.filter((x) => q >= x.min).pop() || { remise: 0 }).remise;
      const unit = arrondi(p.prixHT * (1 - pal / 100));
      ht += unit * q;
      return { id, ref: p.ref, nom: p.nom, image: p.images?.[0] || '', qte: q, base: p.prixHT, unit, total: arrondi(unit * q) };
    });
    ht = arrondi(ht);
    const port = ht >= REGLAGES_DEFAUT.franco ? 0 : REGLAGES_DEFAUT.forfait;
    const tva = arrondi((ht + port) * 0.2);
    const date = maintenant - d.j * jour;
    return {
      num: `DEV-${new Date(date).getFullYear()}-${String(2210 - i).padStart(5, '0')}`,
      date: new Date(date).toISOString(), validite: new Date(date + 30 * jour).toISOString(),
      client: { id: c.id, societe: c.societe, contact: c.contact, email: c.email, tel: c.tel, siret: c.siret, tva: c.tva },
      message: i === 0 ? 'Ouverture d\'une deuxième salle en janvier : possible de livrer en deux fois ?' : '',
      lignes: lg, totaux: { ht, port, tva, ttc: arrondi(ht + port + tva) }, statut: d.statut, exemple: true,
    };
  });
  exemples = { clients: cl, commandes: cmd, devis: dv };
  ecrireSansSignal('clients', cl);
  ecrireSansSignal('commandes', cmd);
  ecrireSansSignal('devis', dv);
  return exemples;
}
ecouter((cle) => { if (cle === 'reinit') exemples = null; });
