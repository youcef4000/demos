// Base centrale du Passe (SQLite intégré à Node 22, aucun serveur de base à installer).
// Elle retient : la dernière offre de chaque fournisseur, la fiche maîtresse de chaque produit,
// la correspondance avec Shopify, les verrous, l'historique des prix, la file de validation et le journal.
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS offres (
  fournisseur TEXT NOT NULL,
  ref TEXT NOT NULL,
  cle TEXT NOT NULL,
  ean TEXT, designation TEXT, marque TEXT, categorie TEXT, famille TEXT,
  prix_achat REAL, prix_conseille REAL,
  stock INTEGER, statut_stock TEXT, delai_jours INTEGER,
  poids_kg REAL, dimensions TEXT, images TEXT, notice TEXT,
  brut TEXT,
  exclue INTEGER NOT NULL DEFAULT 0,
  vue_le TEXT NOT NULL,
  PRIMARY KEY (fournisseur, ref)
);
CREATE INDEX IF NOT EXISTS offres_cle ON offres(cle);

CREATE TABLE IF NOT EXISTS produits (
  cle TEXT PRIMARY KEY,
  fournisseur TEXT, ref TEXT,
  shopify_produit TEXT, shopify_variante TEXT, shopify_inventaire TEXT,
  titre TEXT,
  prix_vente REAL,
  stock_publie INTEGER,
  prix_verrouille INTEGER NOT NULL DEFAULT 0,
  statut TEXT NOT NULL DEFAULT 'nouveau',
  fiche_ia TEXT,
  maj_le TEXT
);

CREATE TABLE IF NOT EXISTS historique_prix (
  cle TEXT NOT NULL, date TEXT NOT NULL, prix_achat REAL, prix_vente REAL, source TEXT
);
CREATE INDEX IF NOT EXISTS historique_cle ON historique_prix(cle, date);

CREATE TABLE IF NOT EXISTS file_passe (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cle TEXT, type TEXT NOT NULL, avant TEXT, apres TEXT, raison TEXT,
  statut TEXT NOT NULL DEFAULT 'attente',
  cree_le TEXT NOT NULL, traite_le TEXT
);

CREATE TABLE IF NOT EXISTS envois (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cle TEXT, canal TEXT NOT NULL, action TEXT NOT NULL, charge TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'a-envoyer', erreur TEXT,
  cree_le TEXT NOT NULL, envoye_le TEXT
);

CREATE TABLE IF NOT EXISTS synchros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fournisseur TEXT NOT NULL, debut TEXT NOT NULL, fin TEXT,
  lues INTEGER DEFAULT 0, changements INTEGER DEFAULT 0, erreurs INTEGER DEFAULT 0, statut TEXT
);

CREATE TABLE IF NOT EXISTS journal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, niveau TEXT NOT NULL, type TEXT, cle TEXT, message TEXT NOT NULL, details TEXT
);

CREATE TABLE IF NOT EXISTS lots_claude (
  id TEXT PRIMARY KEY, cree_le TEXT NOT NULL, statut TEXT, nb INTEGER, recupere_le TEXT
);
`;

export function ouvrirBase(chemin = process.env.PASSE_BASE || './donnees/passe.sqlite') {
  if (chemin !== ':memory:') mkdirSync(dirname(chemin), { recursive: true });
  const db = new DatabaseSync(chemin);
  db.exec(SCHEMA);
  return new Base(db);
}

const maintenant = () => new Date().toISOString();
const json = (v) => (v === undefined || v === null ? null : JSON.stringify(v));

export class Base {
  constructor(db) {
    this.db = db;
  }

  transaction(fn) {
    this.db.exec('BEGIN');
    try {
      const r = fn();
      this.db.exec('COMMIT');
      return r;
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }

  offre(fournisseur, ref) {
    return this.db.prepare('SELECT * FROM offres WHERE fournisseur = ? AND ref = ?').get(fournisseur, ref);
  }

  enregistrerOffre(o) {
    this.db.prepare(`INSERT INTO offres (fournisseur, ref, cle, ean, designation, marque, categorie, famille, prix_achat, prix_conseille,
        stock, statut_stock, delai_jours, poids_kg, dimensions, images, notice, brut, exclue, vue_le)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(fournisseur, ref) DO UPDATE SET cle = excluded.cle, ean = COALESCE(excluded.ean, offres.ean),
        designation = COALESCE(excluded.designation, offres.designation), marque = COALESCE(excluded.marque, offres.marque),
        categorie = COALESCE(excluded.categorie, offres.categorie), famille = COALESCE(excluded.famille, offres.famille),
        prix_achat = COALESCE(excluded.prix_achat, offres.prix_achat), prix_conseille = COALESCE(excluded.prix_conseille, offres.prix_conseille),
        stock = excluded.stock, statut_stock = excluded.statut_stock, delai_jours = COALESCE(excluded.delai_jours, offres.delai_jours),
        poids_kg = COALESCE(excluded.poids_kg, offres.poids_kg), dimensions = COALESCE(excluded.dimensions, offres.dimensions),
        images = COALESCE(excluded.images, offres.images), notice = COALESCE(excluded.notice, offres.notice),
        brut = COALESCE(excluded.brut, offres.brut), exclue = excluded.exclue, vue_le = excluded.vue_le`)
      .run(o.fournisseur, o.ref, o.cle, o.ean ?? null, o.designation ?? null, o.marque ?? null, o.categorie ?? null, o.famille ?? null,
        o.prixAchatHT ?? null, o.prixConseilleHT ?? null, o.stock ?? null, o.statutStock ?? null, o.delaiJours ?? null,
        o.poidsKg ?? null, o.dimensions ?? null, json(o.images), o.notice ?? null, json(o.brut), o.exclue ? 1 : 0, maintenant());
  }

  offresDuProduit(cle) {
    return this.db.prepare('SELECT * FROM offres WHERE cle = ? AND exclue = 0').all(cle);
  }

  produit(cle) {
    return this.db.prepare('SELECT * FROM produits WHERE cle = ?').get(cle);
  }

  enregistrerProduit(p) {
    this.db.prepare(`INSERT INTO produits (cle, fournisseur, ref, shopify_produit, shopify_variante, shopify_inventaire, titre, prix_vente, stock_publie, prix_verrouille, statut, maj_le)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(cle) DO UPDATE SET fournisseur = excluded.fournisseur, ref = excluded.ref,
        shopify_produit = COALESCE(excluded.shopify_produit, produits.shopify_produit),
        shopify_variante = COALESCE(excluded.shopify_variante, produits.shopify_variante),
        shopify_inventaire = COALESCE(excluded.shopify_inventaire, produits.shopify_inventaire),
        titre = COALESCE(excluded.titre, produits.titre), prix_vente = COALESCE(excluded.prix_vente, produits.prix_vente),
        stock_publie = COALESCE(excluded.stock_publie, produits.stock_publie),
        statut = excluded.statut, maj_le = excluded.maj_le`)
      .run(p.cle, p.fournisseur ?? null, p.ref ?? null, p.shopifyProduit ?? null, p.shopifyVariante ?? null, p.shopifyInventaire ?? null,
        p.titre ?? null, p.prixVente ?? null, p.stockPublie ?? null, p.prixVerrouille ? 1 : 0, p.statut || 'nouveau', maintenant());
  }

  majProduit(cle, champs) {
    const cles = Object.keys(champs);
    if (!cles.length) return;
    const sql = `UPDATE produits SET ${cles.map((c) => `${c} = ?`).join(', ')}, maj_le = ? WHERE cle = ?`;
    this.db.prepare(sql).run(...cles.map((c) => champs[c]), maintenant(), cle);
  }

  verrouillerPrix(cle, verrou = true) {
    this.majProduit(cle, { prix_verrouille: verrou ? 1 : 0 });
  }

  noterPrix(cle, prixAchat, prixVente, source) {
    this.db.prepare('INSERT INTO historique_prix (cle, date, prix_achat, prix_vente, source) VALUES (?, ?, ?, ?, ?)').run(cle, maintenant(), prixAchat ?? null, prixVente ?? null, source ?? null);
  }

  /** Prix le plus bas des N derniers jours (utile pour le prix de référence d'une promotion). */
  prixLePlusBas(cle, jours = 30) {
    const depuis = new Date(Date.now() - jours * 86400000).toISOString();
    return this.db.prepare('SELECT MIN(prix_vente) AS min FROM historique_prix WHERE cle = ? AND date >= ? AND prix_vente IS NOT NULL').get(cle, depuis)?.min ?? null;
  }

  ajouterAuPasse({ cle, type, avant, apres, raison }) {
    const deja = this.db.prepare("SELECT id FROM file_passe WHERE cle IS ? AND type = ? AND statut = 'attente'").get(cle ?? null, type);
    if (deja) {
      this.db.prepare('UPDATE file_passe SET avant = ?, apres = ?, raison = ?, cree_le = ? WHERE id = ?').run(json(avant), json(apres), raison ?? null, maintenant(), deja.id);
      return deja.id;
    }
    return Number(this.db.prepare('INSERT INTO file_passe (cle, type, avant, apres, raison, cree_le) VALUES (?, ?, ?, ?, ?, ?)').run(cle ?? null, type, json(avant), json(apres), raison ?? null, maintenant()).lastInsertRowid);
  }

  fileEnAttente() {
    return this.db.prepare("SELECT * FROM file_passe WHERE statut = 'attente' ORDER BY id").all().map(lireJson('avant', 'apres'));
  }

  elementDuPasse(id) {
    const r = this.db.prepare('SELECT * FROM file_passe WHERE id = ?').get(id);
    return r ? lireJson('avant', 'apres')(r) : null;
  }

  trancher(id, statut) {
    this.db.prepare('UPDATE file_passe SET statut = ?, traite_le = ? WHERE id = ?').run(statut, maintenant(), id);
  }

  preparerEnvoi({ cle, canal, action, charge }) {
    return Number(this.db.prepare('INSERT INTO envois (cle, canal, action, charge, cree_le) VALUES (?, ?, ?, ?, ?)').run(cle ?? null, canal, action, JSON.stringify(charge), maintenant()).lastInsertRowid);
  }

  envoisAFaire(canal, limite = 500) {
    return this.db.prepare("SELECT * FROM envois WHERE canal = ? AND statut = 'a-envoyer' ORDER BY id LIMIT ?").all(canal, limite).map(lireJson('charge'));
  }

  marquerEnvoi(id, statut, erreur = null) {
    this.db.prepare('UPDATE envois SET statut = ?, erreur = ?, envoye_le = ? WHERE id = ?').run(statut, erreur, maintenant(), id);
  }

  debutSynchro(fournisseur) {
    return Number(this.db.prepare("INSERT INTO synchros (fournisseur, debut, statut) VALUES (?, ?, 'en-cours')").run(fournisseur, maintenant()).lastInsertRowid);
  }

  finSynchro(id, { lues, changements, erreurs, statut }) {
    this.db.prepare('UPDATE synchros SET fin = ?, lues = ?, changements = ?, erreurs = ?, statut = ? WHERE id = ?').run(maintenant(), lues, changements, erreurs, statut, id);
  }

  derniereSynchroReussie(fournisseur) {
    return this.db.prepare("SELECT debut FROM synchros WHERE fournisseur = ? AND statut = 'ok' ORDER BY id DESC LIMIT 1").get(fournisseur)?.debut ?? null;
  }

  noter(niveau, message, { type, cle, details } = {}) {
    this.db.prepare('INSERT INTO journal (date, niveau, type, cle, message, details) VALUES (?, ?, ?, ?, ?, ?)').run(maintenant(), niveau, type ?? null, cle ?? null, message, json(details));
  }

  journal(limite = 100) {
    return this.db.prepare('SELECT * FROM journal ORDER BY id DESC LIMIT ?').all(limite).map(lireJson('details'));
  }

  rapport() {
    const un = (sql, ...a) => this.db.prepare(sql).get(...a);
    return {
      offres: un('SELECT COUNT(*) AS n FROM offres').n,
      offresExclues: un('SELECT COUNT(*) AS n FROM offres WHERE exclue = 1').n,
      produits: un('SELECT COUNT(*) AS n FROM produits').n,
      reliesShopify: un('SELECT COUNT(*) AS n FROM produits WHERE shopify_produit IS NOT NULL').n,
      prixVerrouilles: un('SELECT COUNT(*) AS n FROM produits WHERE prix_verrouille = 1').n,
      auPasse: un("SELECT COUNT(*) AS n FROM file_passe WHERE statut = 'attente'").n,
      envoisEnAttente: un("SELECT COUNT(*) AS n FROM envois WHERE statut = 'a-envoyer'").n,
      envoisEnErreur: un("SELECT COUNT(*) AS n FROM envois WHERE statut = 'erreur'").n,
      dernieresSynchros: this.db.prepare('SELECT fournisseur, debut, fin, lues, changements, erreurs, statut FROM synchros ORDER BY id DESC LIMIT 10').all(),
    };
  }

  fermer() {
    this.db.close();
  }
}

function lireJson(...champs) {
  return (r) => {
    const o = { ...r };
    for (const c of champs) if (typeof o[c] === 'string') o[c] = JSON.parse(o[c]);
    return o;
  };
}
