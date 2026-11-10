// Serveur du cabinet : site public, application, API (routes du noyau), fichiers des pièces, tâches du matin.
// Une seule application Node 22, une base SQLite, aucun autre service. Derrière Caddy (HTTPS) en production.
//   npm start            → http://127.0.0.1:8790/
//   variables : voir .env.example
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat, readdir, rm } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname, normalize, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { ouvrirBase } from './base.js';
import { preparerMotDePasse, verifierMotDePasse, creerSessions, cookieSession, lireCookie, creerLimiteur, DUREE_SESSION } from './securite.js';
import { envoyerEmail } from './envoi.js';
import { creerMoteursClaude, infosAgents } from './agents.js';

const ici = dirname(fileURLToPath(import.meta.url));
const RACINE = resolve(ici, '..');
const PUBLIC = join(RACINE, 'public');

// .env (sans dépendance) : CLE=valeur, une par ligne
const fichierEnv = join(RACINE, '.env');
if (existsSync(fichierEnv)) {
  for (const l of readFileSync(fichierEnv, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(l);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const { creerApi } = await import(join(PUBLIC, 'app/noyau/api.js'));

export async function demarrerServeur({ port = Number(process.env.PORT) || 8790, hote = process.env.HOTE || '127.0.0.1', donnees = process.env.DONNEES || join(RACINE, 'donnees'), agents = process.env.AGENTS || 'desactive', secure = process.env.SESSION_SECURE !== '0', journal = true } = {}) {
  await mkdir(join(donnees, 'fichiers'), { recursive: true });
  await mkdir(join(donnees, 'sauvegardes'), { recursive: true });
  const base = ouvrirBase(join(donnees, 'cabinet.sqlite'));
  const sessions = creerSessions(base);
  const limiteur = creerLimiteur();
  const log = (...a) => journal && console.log(new Date().toISOString(), ...a);

  // ——— Fichiers des pièces ———
  const TYPES_OK = new Map([['image/jpeg', '.jpg'], ['image/png', '.png'], ['image/webp', '.webp'], ['image/gif', '.gif'], ['application/pdf', '.pdf']]);
  const cheminFichier = (ref) => join(donnees, 'fichiers', ref.replace(/[^a-zA-Z0-9_-]/g, ''));
  let demoPieces = null;
  const pieceExemple = async (id) => {
    demoPieces ||= await import(join(PUBLIC, 'app/js/demo-pieces.js'));
    const ex = base.lire('exemples', id);
    return ex ? Buffer.from(demoPieces.svgPiece(ex)) : null;
  };
  const fichiers = {
    async lire(ref) {
      const m = base.db.prepare('SELECT mime FROM fichiers WHERE ref = ?').get(ref);
      if (!m) throw new Error('fichier introuvable');
      return { octets: await readFile(cheminFichier(ref)), mime: m.mime };
    },
  };

  // ——— Agents : désactivés (option A sans autorisation ANPDP), simulés (présentation) ou Claude ———
  let moteurs = {};
  if (agents === 'claude' || agents === 'simulation') {
    const sim = await import(join(PUBLIC, 'app/js/demo-donnees.js'));
    const simules = {
      async lirePiece({ piece }) {
        const ex = piece.exemple && base.lire('exemples', piece.exemple);
        if (ex) return { ...sim.lectureSimulee(ex), modele: 'simulation (pièce d’exemple)' };
        return { fiche: { typeDoc: piece.type, lignes: [], modePaiement: 'a_terme' }, confiance: 0, remarques: ['Agent en mode simulation : fiche à remplir à la main.'] };
      },
      async imputer({ ligne, fiche }) {
        return sim.imputationSimulee(ligne, fiche);
      },
    };
    if (agents === 'claude') {
      const claude = creerMoteursClaude({ fichiers });
      moteurs = { lirePiece: (a) => (a.piece.exemple ? simules.lirePiece(a) : claude.lirePiece(a)), imputer: claude.imputer };
    } else moteurs = simules;
  }
  moteurs.envoyer = envoyerEmail;

  const api = creerApi({ base, moteurs, securite: { preparerMotDePasse }, infosAgents });

  // ——— Réponses ———
  const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; frame-src 'self' blob:; connect-src 'self'; worker-src 'self'; base-uri 'none'; form-action 'self'; object-src 'none'; frame-ancestors 'none'";
  const entetes = (extra = {}) => ({
    'content-security-policy': CSP,
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'geolocation=(), microphone=(), payment=(), usb=()',
    'cross-origin-opener-policy': 'same-origin',
    ...(secure ? { 'strict-transport-security': 'max-age=31536000' } : {}),
    ...extra,
  });
  const json = (res, statut, donnees, extra = {}) => {
    res.writeHead(statut, entetes({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra }));
    res.end(JSON.stringify(donnees));
  };
  const lireCorps = (req, max) =>
    new Promise((ok, ko) => {
      const parts = [];
      let n = 0;
      req.on('data', (c) => {
        n += c.length;
        if (n > max) {
          ko(Object.assign(new Error('Fichier trop volumineux.'), { statut: 413 }));
          req.destroy();
        } else parts.push(c);
      });
      req.on('end', () => ok(Buffer.concat(parts)));
      req.on('error', ko);
    });
  const sansSecret = (u) => {
    if (!u) return null;
    const { empreinte, sel, algo, ...r } = u;
    return r;
  };
  const ip = (req) => String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

  function peutVoirDossier(u, dossierId) {
    if (u.role === 'associe') return true;
    if (u.role === 'client') return u.dossierId === dossierId;
    return base.lire('dossiers', dossierId)?.collaborateurId === u.id;
  }

  async function routeApi(req, res, chemin, url) {
    const methode = req.method;
    const u = sessions.utilisateur(lireCookie(req));
    // Toute écriture exige l'en-tête x-cabinet (impossible à poser depuis un autre site sans CORS) : protection CSRF
    if (methode !== 'GET' && req.headers['x-cabinet'] !== '1') return json(res, 403, { erreur: 'Requête refusée.' });

    if (chemin === '/connexion' && methode === 'POST') {
      const { email, motDePasse } = JSON.parse((await lireCorps(req, 10_000)).toString() || '{}');
      const e = String(email || '').trim().toLowerCase();
      if (limiteur.bloque(`m:${e}`, `i:${ip(req)}`)) return json(res, 429, { erreur: 'Trop de tentatives : réessayer dans 15 minutes.' });
      const cand = base.tous('utilisateurs').find((x) => x.email === e && x.actif !== false);
      if (!cand || !(await verifierMotDePasse(motDePasse, cand))) {
        limiteur.echec(`m:${e}`, `i:${ip(req)}`);
        log('connexion refusée', e);
        return json(res, 401, { erreur: 'Adresse ou mot de passe incorrect.' });
      }
      limiteur.reussite(`m:${e}`, `i:${ip(req)}`);
      const jeton = sessions.ouvrir(cand.id);
      base.ecrire('journal', { id: `j${Date.now().toString(36)}${randomBytes(3).toString('hex')}`, le: new Date().toISOString(), utilisateurId: cand.id, nom: cand.nom, action: 'Connexion', objet: cand.email, details: ip(req) });
      return json(res, 200, { utilisateur: sansSecret(cand) }, { 'set-cookie': cookieSession(jeton, { secure }) });
    }
    if (chemin === '/deconnexion' && methode === 'POST') {
      sessions.fermer(lireCookie(req));
      return json(res, 200, { ok: true }, { 'set-cookie': cookieSession('', { secure, maxAge: 0 }) });
    }
    if (chemin === '/session' && methode === 'GET') return u ? json(res, 200, { utilisateur: sansSecret(u) }) : json(res, 401, { erreur: 'Non connecté.' });

    // Fichiers des pièces : dépôt (personne connectée), lecture (personne qui a accès au dossier)
    if (chemin === '/fichiers' && methode === 'POST') {
      if (!u) return json(res, 401, { erreur: 'Connexion requise.' });
      const mime = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
      if (!TYPES_OK.has(mime)) return json(res, 415, { erreur: 'Format accepté : JPEG, PNG, WebP, GIF ou PDF.' });
      const octets = await lireCorps(req, 15 * 1024 * 1024);
      if (!octets.length) return json(res, 400, { erreur: 'Fichier vide.' });
      const ref = randomBytes(18).toString('base64url');
      await writeFile(cheminFichier(ref), octets, { flag: 'wx' });
      const nom = decodeURIComponent(String(req.headers['x-nom'] || `piece${TYPES_OK.get(mime)}`)).replace(/[^\p{L}\p{N} ._()-]/gu, '_').slice(0, 120);
      base.db.prepare('INSERT INTO fichiers (ref, nom, mime, taille, depose_par, le) VALUES (?, ?, ?, ?, ?, ?)').run(ref, nom, mime, octets.length, u.id, new Date().toISOString());
      return json(res, 200, { ref, nom, mime, taille: octets.length });
    }
    if (chemin.startsWith('/fichiers/') && methode === 'GET') {
      if (!u) return json(res, 401, { erreur: 'Connexion requise.' });
      const ref = decodeURIComponent(chemin.slice(10));
      const piece = base.db.prepare("SELECT data FROM docs WHERE col = 'pieces' AND json_extract(data, '$.fichier.ref') = ?").get(ref);
      const p = piece ? JSON.parse(piece.data) : null;
      if (p ? !peutVoirDossier(u, p.dossierId) : base.db.prepare('SELECT depose_par FROM fichiers WHERE ref = ?').get(ref)?.depose_par !== u.id) return json(res, 404, { erreur: 'Fichier introuvable.' });
      if (ref.startsWith('exemple:')) {
        const svg = await pieceExemple(ref.slice(8));
        if (!svg) return json(res, 404, { erreur: 'Fichier introuvable.' });
        res.writeHead(200, entetes({ 'content-type': 'image/svg+xml', 'cache-control': 'private, max-age=600', 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'" }));
        return res.end(svg);
      }
      try {
        const f = await fichiers.lire(ref);
        res.writeHead(200, entetes({ 'content-type': f.mime, 'cache-control': 'private, max-age=600', 'content-disposition': 'inline' }));
        return res.end(f.octets);
      } catch {
        return json(res, 404, { erreur: 'Fichier introuvable.' });
      }
    }

    // Toutes les autres routes : le noyau (droits par rôle vérifiés à chaque appel)
    let corps = {};
    if (methode !== 'GET') {
      const brut = await lireCorps(req, 1024 * 1024);
      try {
        corps = brut.length ? JSON.parse(brut.toString()) : {};
      } catch {
        return json(res, 400, { erreur: 'Corps JSON invalide.' });
      }
    }
    const r = await api.traiter(u, methode, chemin, { corps, q: Object.fromEntries(url.searchParams) });
    if (r.statut === 200 && methode === 'PUT' && /^\/utilisateurs\//.test(chemin) && corps.actif === false) sessions.fermerTout(chemin.split('/')[2]);
    if (r.fichier) {
      res.writeHead(200, entetes({ 'content-type': r.fichier.type, 'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(r.fichier.nom)}`, 'cache-control': 'no-store' }));
      return res.end(Buffer.from(r.fichier.octets));
    }
    return json(res, r.statut, r.json);
  }

  const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json' };

  async function routeStatique(req, res, chemin) {
    if (chemin === '/config.json' || chemin === '/app/config.json') return json(res, 200, { mode: 'serveur' });
    let rel = normalize(decodeURIComponent(chemin)).replace(/^([/\\])+/, '');
    let complet = resolve(PUBLIC, rel);
    if (complet !== PUBLIC && !complet.startsWith(PUBLIC + sep)) return json(res, 403, { erreur: 'Accès refusé.' });
    try {
      let s = await stat(complet);
      if (s.isDirectory()) {
        if (!chemin.endsWith('/')) {
          res.writeHead(301, { location: `${chemin}/` });
          return res.end();
        }
        complet = join(complet, 'index.html');
        s = await stat(complet);
      }
      const ext = extname(complet).toLowerCase();
      res.writeHead(200, entetes({ 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': ext === '.html' || ext === '.js' || ext === '.css' ? 'no-cache' : 'public, max-age=86400', 'content-length': s.size }));
      if (req.method === 'HEAD') return res.end();
      res.end(await readFile(complet));
    } catch {
      res.writeHead(404, entetes({ 'content-type': 'text/html; charset=utf-8' }));
      res.end('<!doctype html><meta charset="utf-8"><title>Page introuvable</title><p style="font-family:sans-serif;padding:24px">Page introuvable. <a href="/">Retour au site du cabinet</a></p>');
    }
  }

  const serveur = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (url.pathname.startsWith('/api/')) return await routeApi(req, res, url.pathname.slice(4), url);
      if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { erreur: 'Méthode non permise.' });
      return await routeStatique(req, res, url.pathname);
    } catch (e) {
      log('erreur', req.method, url.pathname, e.message);
      if (!res.headersSent) json(res, e.statut || 500, { erreur: e.statut ? e.message : 'Erreur interne.' });
      else res.end();
    }
  });

  // ——— Tâches : sauvegarde quotidienne (30 jours), relances préparées le matin, purge des sessions ———
  let dernierJour = null;
  async function taches() {
    const alger = new Date(Date.now() + 3600_000);
    const jour = alger.toISOString().slice(0, 10);
    sessions.purger();
    const fichier = join(donnees, 'sauvegardes', `cabinet-${jour}.sqlite`);
    if (!existsSync(fichier)) {
      try {
        base.db.exec(`VACUUM INTO '${fichier.replace(/'/g, "''")}'`);
        const vieux = (await readdir(join(donnees, 'sauvegardes'))).filter((f) => /^cabinet-\d{4}-\d{2}-\d{2}\.sqlite$/.test(f)).sort();
        for (const f of vieux.slice(0, Math.max(0, vieux.length - 30))) await rm(join(donnees, 'sauvegardes', f));
        log('sauvegarde', fichier);
      } catch (e) {
        log('sauvegarde impossible', e.message);
      }
    }
    if (alger.getUTCHours() >= 7 && dernierJour !== jour) {
      dernierJour = jour;
      const r = await api.tachesDuJour();
      if (r.relances) log(`${r.relances} relance(s) préparée(s), à valider dans la boîte d'envoi`);
    }
  }
  const minuterie = setInterval(() => taches().catch((e) => log('tâches', e.message)), 10 * 60_000);
  minuterie.unref();
  setTimeout(() => taches().catch(() => {}), 5_000).unref();

  await new Promise((ok) => serveur.listen(port, hote, ok));
  const adresse = serveur.address();
  log(`Cabinet : http://${hote}:${adresse.port}/ — agents ${agents}, données ${donnees}${base.vide() ? ' — base vide : créer un compte (npm run compte) ou charger la démo (npm run demo)' : ''}`);
  return { serveur, base, port: adresse.port, fermer: () => new Promise((ok) => serveur.close(ok)), sessionsDuree: DUREE_SESSION };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await demarrerServeur();
