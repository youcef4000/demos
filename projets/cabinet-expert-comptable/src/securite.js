// Connexion et sessions.
// - Mots de passe hachés avec scrypt (sel aléatoire de 16 octets) ; comparaison en temps constant.
// - Session : jeton aléatoire de 256 bits en cookie HttpOnly, Secure, SameSite=Strict ; seule son empreinte
//   SHA-256 est en base ; 8 h, prolongée à l'usage ; supprimée à la déconnexion et à la désactivation du compte.
// - 5 échecs de connexion pour une même adresse (ou une même IP) : blocage 15 minutes.
import { scrypt, randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptP = promisify(scrypt);
const PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
export const DUREE_SESSION = 8 * 3600_000;
export const NOM_COOKIE = 'cabinet_session';

export async function preparerMotDePasse(mdp) {
  const sel = randomBytes(16).toString('hex');
  const empreinte = (await scryptP(String(mdp), sel, 64, PARAMS)).toString('hex');
  return { sel, empreinte, algo: 'scrypt' };
}

export async function verifierMotDePasse(mdp, u) {
  if (!u?.sel || !u?.empreinte) return false;
  const calcule = await scryptP(String(mdp), u.sel, 64, PARAMS);
  const attendu = Buffer.from(u.empreinte, 'hex');
  return attendu.length === calcule.length && timingSafeEqual(attendu, calcule);
}

const sha = (t) => createHash('sha256').update(t).digest('hex');

export function creerSessions(base) {
  const db = base.db;
  const ins = db.prepare('INSERT INTO sessions (empreinte, utilisateur, expire, cree) VALUES (?, ?, ?, ?)');
  const get = db.prepare('SELECT utilisateur, expire FROM sessions WHERE empreinte = ?');
  const prolonger = db.prepare('UPDATE sessions SET expire = ? WHERE empreinte = ?');
  const suppr = db.prepare('DELETE FROM sessions WHERE empreinte = ?');
  const purge = db.prepare('DELETE FROM sessions WHERE expire < ?');
  const supprUtilisateur = db.prepare('DELETE FROM sessions WHERE utilisateur = ?');
  return {
    ouvrir(utilisateurId) {
      const jeton = randomBytes(32).toString('base64url');
      ins.run(sha(jeton), utilisateurId, Date.now() + DUREE_SESSION, Date.now());
      return jeton;
    },
    utilisateur(jeton) {
      if (!jeton || jeton.length > 100) return null;
      const e = sha(jeton);
      const s = get.get(e);
      if (!s || s.expire < Date.now()) return null;
      if (s.expire - Date.now() < DUREE_SESSION - 600_000) prolonger.run(Date.now() + DUREE_SESSION, e);
      const u = base.lire('utilisateurs', s.utilisateur);
      return u && u.actif !== false ? u : null;
    },
    fermer(jeton) {
      if (jeton) suppr.run(sha(jeton));
    },
    fermerTout(utilisateurId) {
      supprUtilisateur.run(utilisateurId);
    },
    purger: () => purge.run(Date.now()),
  };
}

export function cookieSession(jeton, { secure = true, maxAge = DUREE_SESSION } = {}) {
  return `${NOM_COOKIE}=${jeton}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(maxAge / 1000)}${secure ? '; Secure' : ''}`;
}

export function lireCookie(req, nom = NOM_COOKIE) {
  const c = req.headers.cookie || '';
  for (const part of c.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === nom) return v.join('=');
  }
  return null;
}

/** Limiteur des tentatives de connexion (mémoire du processus). */
export function creerLimiteur({ max = 5, fenetre = 15 * 60_000 } = {}) {
  const echecs = new Map();
  const cle = (k) => {
    const e = echecs.get(k);
    if (e && Date.now() - e.debut > fenetre) echecs.delete(k);
    return echecs.get(k);
  };
  return {
    bloque: (...cles) => cles.some((k) => (cle(k)?.n || 0) >= max),
    echec(...cles) {
      for (const k of cles) {
        const e = cle(k) || { n: 0, debut: Date.now() };
        e.n++;
        echecs.set(k, e);
      }
    },
    reussite: (...cles) => cles.forEach((k) => echecs.delete(k)),
  };
}
