// Base du cabinet : un fichier SQLite (intégré à Node 22, rien à installer).
// Même interface que la base de la démo (public/app/noyau/base-memoire.js), utilisée par les routes du noyau.
// Chaque document est stocké en JSON ; dossierId et periode sont recopiés en colonnes indexées.
import { DatabaseSync } from 'node:sqlite';

export function ouvrirBase(chemin) {
  const db = new DatabaseSync(chemin);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS docs (col TEXT NOT NULL, id TEXT NOT NULL, dossier TEXT, periode TEXT, data TEXT NOT NULL, PRIMARY KEY (col, id));
    CREATE INDEX IF NOT EXISTS docs_dossier ON docs (col, dossier, periode);
    CREATE TABLE IF NOT EXISTS params (cle TEXT PRIMARY KEY, valeur TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (empreinte TEXT PRIMARY KEY, utilisateur TEXT NOT NULL, expire INTEGER NOT NULL, cree INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS fichiers (ref TEXT PRIMARY KEY, nom TEXT, mime TEXT, taille INTEGER, depose_par TEXT, le TEXT);
  `);
  const q = {
    tous: db.prepare('SELECT data FROM docs WHERE col = ?'),
    parDossier: db.prepare('SELECT data FROM docs WHERE col = ? AND dossier = ?'),
    parDossierPeriode: db.prepare('SELECT data FROM docs WHERE col = ? AND dossier = ? AND periode = ?'),
    lire: db.prepare('SELECT data FROM docs WHERE col = ? AND id = ?'),
    ecrire: db.prepare('INSERT INTO docs (col, id, dossier, periode, data) VALUES (?, ?, ?, ?, ?) ON CONFLICT (col, id) DO UPDATE SET dossier = excluded.dossier, periode = excluded.periode, data = excluded.data'),
    supprimer: db.prepare('DELETE FROM docs WHERE col = ? AND id = ?'),
    param: db.prepare('SELECT valeur FROM params WHERE cle = ?'),
    ecrireParam: db.prepare('INSERT INTO params (cle, valeur) VALUES (?, ?) ON CONFLICT (cle) DO UPDATE SET valeur = excluded.valeur'),
  };
  const lignes = (r) => r.map((x) => JSON.parse(x.data));

  const base = {
    tous: (col) => lignes(q.tous.all(col)),
    liste(col, filtre = {}) {
      const { dossierId, periode, ...reste } = filtre;
      let r;
      if (dossierId && periode) r = lignes(q.parDossierPeriode.all(col, String(dossierId), String(periode)));
      else if (dossierId) r = lignes(q.parDossier.all(col, String(dossierId)));
      else r = lignes(q.tous.all(col)).filter((d) => periode === undefined || d.periode === periode);
      const cles = Object.entries(reste);
      return cles.length ? r.filter((d) => cles.every(([k, v]) => d[k] === v)) : r;
    },
    lire(col, id) {
      if (id == null || id === '') return null;
      const r = q.lire.get(col, String(id));
      return r ? JSON.parse(r.data) : null;
    },
    ecrire(col, doc) {
      if (!doc.id) throw new Error('Document sans identifiant');
      q.ecrire.run(col, String(doc.id), doc.dossierId ?? null, doc.periode ?? null, JSON.stringify(doc));
      return structuredClone(doc);
    },
    supprimer(col, id) {
      if (id != null) q.supprimer.run(col, String(id));
    },
    param(cle) {
      const r = q.param.get(cle);
      return r ? JSON.parse(r.valeur) : null;
    },
    ecrireParam(cle, v) {
      q.ecrireParam.run(cle, JSON.stringify(v));
    },
    /** Écrit un jeu complet (données de démonstration) en une transaction. */
    importer({ collections = {}, parametres = {} }) {
      db.exec('BEGIN');
      try {
        for (const [col, docs] of Object.entries(collections)) for (const d of docs) base.ecrire(col, d);
        for (const [cle, v] of Object.entries(parametres)) base.ecrireParam(cle, v);
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
    vide: () => !db.prepare("SELECT 1 FROM docs WHERE col = 'utilisateurs' LIMIT 1").get(),
    db,
  };
  return base;
}
