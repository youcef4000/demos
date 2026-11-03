// Petit serveur HTTP appelé par n8n (même machine ou même réseau privé). Aucune dépendance.
// Toutes les routes exigent l'en-tête « Authorization: Bearer <PASSE_JETON> ».
//   GET  /sante
//   POST /synchro/:fournisseur        { "envoyer": true }
//   POST /import/:profil              corps = le fichier brut, CSV ou .xlsx (profils : cuistance, cuistance-tarif…)
//   GET  /passe                       file de validation
//   POST /passe/:id/valider | /passe/:id/refuser
//   POST /envoyer
//   POST /fiches/lancer               { "limite": 300 }  lot Claude (−50 %)
//   POST /fiches/recuperer            range les fiches des lots terminés dans le passe
//   GET  /rapport
import { createServer } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { contexte } from './contexte.js';
import { synchroniser, trancher, envoyer } from './synchro.js';
import { lancerLotFiches, recupererLots } from './fiches.js';

const ctx = contexte();
const JETON = process.env.PASSE_JETON || '';
if (JETON.length < 24) {
  console.error('PASSE_JETON absent ou trop court (24 caractères minimum) : le serveur refuse de démarrer.');
  process.exit(1);
}
const PORT = Number(process.env.PASSE_PORT || 8787);
const HOTE = process.env.PASSE_HOTE || '127.0.0.1';
const TAILLE_MAX = 20 * 1024 * 1024;
let occupe = false; // une synchro à la fois : n8n peut relancer sans risque de doublon

function autorise(req) {
  const recu = Buffer.from((req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
  const attendu = Buffer.from(JETON);
  return recu.length === attendu.length && timingSafeEqual(recu, attendu);
}

async function lireCorps(req) {
  const morceaux = [];
  let taille = 0;
  for await (const m of req) {
    taille += m.length;
    if (taille > TAILLE_MAX) throw Object.assign(new Error('Corps trop volumineux'), { statut: 413 });
    morceaux.push(m);
  }
  return Buffer.concat(morceaux);
}

function repondre(res, statut, corps) {
  res.writeHead(statut, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(corps));
}

async function exclusif(fn) {
  if (occupe) throw Object.assign(new Error('Une synchro est déjà en cours'), { statut: 409 });
  occupe = true;
  try {
    return await fn();
  } finally {
    occupe = false;
  }
}

const serveur = createServer(async (req, res) => {
  try {
    if (!autorise(req)) return repondre(res, 401, { erreur: 'non autorisé' });
    const url = new URL(req.url, 'http://local');
    const [, a, b, c] = url.pathname.split('/');
    if (req.method === 'GET' && a === 'sante') return repondre(res, 200, { ok: true });
    if (req.method === 'GET' && a === 'rapport') return repondre(res, 200, ctx.base.rapport());
    if (req.method === 'GET' && a === 'passe') return repondre(res, 200, ctx.base.fileEnAttente());
    if (req.method === 'POST' && a === 'passe' && b && (c === 'valider' || c === 'refuser')) return repondre(res, 200, trancher(ctx.base, Number(b), c === 'valider'));
    if (req.method === 'POST' && a === 'fiches' && b === 'lancer') {
      const corps = JSON.parse((await lireCorps(req)).toString() || '{}');
      return repondre(res, 200, await lancerLotFiches(ctx.base, { limite: Number(corps.limite) || 300 }));
    }
    if (req.method === 'POST' && a === 'fiches' && b === 'recuperer') return repondre(res, 200, await recupererLots(ctx.base));
    if (req.method === 'POST' && a === 'envoyer') return repondre(res, 200, await exclusif(() => envoyer({ base: ctx.base, shopify: ctx.shopify() })));
    if (req.method === 'POST' && a === 'synchro' && b) {
      const corps = JSON.parse((await lireCorps(req)).toString() || '{}');
      const r = await exclusif(async () => {
        const rapport = await synchroniser({ base: ctx.base, connecteur: ctx.connecteur(b), regles: ctx.regles });
        if (corps.envoyer) rapport.envois = await envoyer({ base: ctx.base, shopify: ctx.shopify() });
        return rapport;
      });
      return repondre(res, 200, r);
    }
    if (req.method === 'POST' && a === 'import' && b) {
      const octets = await lireCorps(req);
      const fichier = await ctx.fichier(b, { octets });
      const r = await exclusif(() => synchroniser({ base: ctx.base, connecteur: fichier, regles: ctx.regles, depuis: null }));
      return repondre(res, r.erreurs.length && !r.lues ? 422 : 200, { analyse: fichier.analyse, ...r });
    }
    return repondre(res, 404, { erreur: 'route inconnue' });
  } catch (err) {
    ctx.base.noter('erreur', `Serveur : ${err.message}`);
    return repondre(res, err.statut || 500, { erreur: err.message });
  }
});

serveur.listen(PORT, HOTE, () => console.log(`Le Passe écoute sur http://${HOTE}:${PORT}`));
process.on('SIGTERM', () => serveur.close(() => { ctx.base.fermer(); process.exit(0); }));
