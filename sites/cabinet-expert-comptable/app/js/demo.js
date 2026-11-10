// Démo : le « serveur » du cabinet tourne dans le navigateur, avec le même noyau que le vrai serveur.
// Données fictives enregistrées dans ce navigateur seulement (localStorage), fichiers déposés dans IndexedDB.
// Agents simulés : ils « lisent » les pièces d'exemple ; un fichier personnel déposé reste à remplir à la main.
import { creerApi } from '../noyau/api.js';
import { creerBaseMemoire } from '../noyau/base-memoire.js';
import { genererDonneesDemo, COMPTES_DEMO, MAINTENANT_DEMO, lectureSimulee, imputationSimulee } from './demo-donnees.js';
import { urlSvg } from './demo-pieces.js';
import { TYPES_PIECE } from '../noyau/pieces.js';
import { ErreurAppel } from './api.js';

const CLE = 'cabinet-mizane-demo-v3';
const CLE_SESSION = 'cabinet-mizane-demo-session';
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const HUIT_HEURES = 8 * 3600_000;

async function sha256(texte) {
  const o = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texte));
  return Array.from(new Uint8Array(o), (b) => b.toString(16).padStart(2, '0')).join('');
}
const aleatoire = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('');

function lireStockage(cle, defaut = null) {
  try {
    const v = localStorage.getItem(cle);
    return v ? JSON.parse(v) : defaut;
  } catch {
    return defaut;
  }
}

// ——— Fichiers déposés (IndexedDB) ———
let idb;
function ouvrirIdb() {
  idb ||= new Promise((ok, ko) => {
    const r = indexedDB.open('cabinet-mizane-demo-fichiers', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('fichiers');
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ko(r.error);
  });
  return idb;
}
async function idbFaire(mode, fn) {
  const db = await ouvrirIdb();
  return new Promise((ok, ko) => {
    const t = db.transaction('fichiers', mode);
    const r = fn(t.objectStore('fichiers'));
    t.oncomplete = () => ok(r?.result);
    t.onerror = () => ko(t.error);
  });
}
const memoireFichiers = new Map(); // repli si IndexedDB est indisponible (navigation privée)

export async function creerDemo() {
  let etat = lireStockage(CLE);
  if (!etat?.collections) {
    const g = genererDonneesDemo();
    for (const u of g.collections.utilisateurs) {
      const c = COMPTES_DEMO.find((x) => x.id === u.id);
      u.sel = aleatoire();
      u.empreinte = await sha256(u.sel + c.motDePasse);
    }
    etat = { collections: g.collections, parametres: { demo: { creeLe: Date.now(), disponibles: g.disponibles } } };
  }

  let minuterie;
  let enAttente = null;
  let avertiPlein = false;
  const enregistrer = () => {
    clearTimeout(minuterie);
    if (!enAttente) return;
    const instantane = enAttente;
    enAttente = null;
    try {
      localStorage.setItem(CLE, JSON.stringify(instantane()));
    } catch {
      if (!avertiPlein) {
        avertiPlein = true;
        import('./ui.js').then(({ toast }) => toast('Mémoire du navigateur pleine : la démo continue, sans garder les changements.', 'erreur'));
      }
    }
  };
  // Enregistré peu après chaque action, et tout de suite si la page se ferme ou se recharge
  addEventListener('pagehide', enregistrer);
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && enregistrer());
  const base = creerBaseMemoire(etat, {
    apresEcriture: (instantane) => {
      enAttente = instantane;
      clearTimeout(minuterie);
      minuterie = setTimeout(enregistrer, 200);
    },
  });
  base.ecrireParam('demo', base.param('demo')); // premier enregistrement

  // Horloge de la démo : le mardi 10/11/2026 à 9 h 30, puis le temps passé (8 h au plus)
  const debut = Date.now();
  const horloge = () => new Date(Date.parse(MAINTENANT_DEMO) + Math.min(Date.now() - debut, HUIT_HEURES));

  const prompts = {};
  const infos = [
    { id: 'lecteur_pieces', nom: 'Lecture des pièces' },
    { id: 'imputation_scf', nom: 'Imputation SCF' },
  ];
  await Promise.all(
    infos.map(async (a) => {
      try {
        const r = await fetch(new URL(`../agents/${a.id}/prompt_systeme.md`, import.meta.url));
        prompts[a.id] = r.ok ? await r.text() : '';
      } catch {
        prompts[a.id] = '';
      }
    }),
  );

  const moteurs = {
    async lirePiece({ piece }) {
      await attendre(1400 + Math.random() * 900);
      if (piece.exemple) {
        const ex = base.lire('exemples', piece.exemple);
        if (ex) return { ...lectureSimulee(ex), modele: 'simulation (démo)' };
      }
      return {
        fiche: { typeDoc: piece.type, lignes: [], modePaiement: 'a_terme' },
        confiance: 0,
        remarques: ["Démonstration : l'agent simulé ne lit que les pièces d'exemple. Sur le serveur du cabinet, Claude lit ce fichier et remplit la fiche."],
        modele: 'simulation (démo)',
      };
    },
    async imputer({ ligne, fiche }) {
      await attendre(500);
      return imputationSimulee(ligne, fiche);
    },
    async envoyer() {
      await attendre(400);
      return { ok: true, simulation: true };
    },
  };

  const api = creerApi({
    base,
    moteurs,
    horloge,
    securite: {
      async preparerMotDePasse(mdp) {
        const sel = aleatoire();
        return { sel, empreinte: await sha256(sel + mdp) };
      },
    },
    infosAgents: () => infos.map((a) => ({ ...a, prompt: prompts[a.id] })),
  });

  const utilisateur = () => {
    let id = null;
    try {
      id = sessionStorage.getItem(CLE_SESSION);
    } catch {}
    const u = id ? base.lire('utilisateurs', id) : null;
    return u && u.actif !== false ? u : null;
  };
  const sansSecret = (u) => {
    if (!u) return null;
    const { empreinte, sel, ...reste } = u;
    return reste;
  };

  async function traiter(methode, chemin, corps) {
    const [p, qs] = chemin.split('?');
    const q = Object.fromEntries(new URLSearchParams(qs || ''));
    const r = await api.traiter(utilisateur(), methode, p, { corps: corps === undefined ? {} : structuredClone(corps), q });
    if (r.statut >= 400) throw new ErreurAppel(r.statut, r.json?.erreur || `Erreur ${r.statut}`);
    return r;
  }

  return {
    mode: 'demo',
    comptes: COMPTES_DEMO.map(({ motDePasse, ...c }) => ({ ...c, motDePasse })),
    async session() {
      return sansSecret(utilisateur());
    },
    async connexion(email, motDePasse) {
      await attendre(250);
      const u = base.tous('utilisateurs').find((x) => x.email === String(email || '').trim().toLowerCase());
      if (!u || u.actif === false || (await sha256(u.sel + motDePasse)) !== u.empreinte) throw new ErreurAppel(401, 'Adresse ou mot de passe incorrect.');
      try {
        sessionStorage.setItem(CLE_SESSION, u.id);
      } catch {}
      return sansSecret(u);
    },
    async deconnexion() {
      try {
        sessionStorage.removeItem(CLE_SESSION);
      } catch {}
    },
    async appel(methode, chemin, corps) {
      return (await traiter(methode, chemin, corps)).json;
    },
    async telecharger(chemin) {
      const r = await traiter('GET', chemin);
      return { nom: r.fichier.nom, blob: new Blob([r.fichier.octets], { type: r.fichier.type }) };
    },
    async deposerFichier(fichier) {
      const id = aleatoire();
      try {
        await idbFaire('readwrite', (s) => s.put(fichier, id));
      } catch {
        memoireFichiers.set(id, fichier);
      }
      return { ref: `idb:${id}`, nom: fichier.name, mime: fichier.type || 'application/octet-stream', taille: fichier.size };
    },
    async urlFichier(f) {
      if (!f?.ref) return '';
      if (f.ref.startsWith('exemple:')) {
        const ex = base.lire('exemples', f.ref.slice(8));
        return ex ? urlSvg(ex) : '';
      }
      if (f.ref.startsWith('idb:')) {
        const id = f.ref.slice(4);
        let b = memoireFichiers.get(id);
        if (!b) {
          try {
            b = await idbFaire('readonly', (s) => s.get(id));
          } catch {}
        }
        return b ? URL.createObjectURL(b) : '';
      }
      return '';
    },
    /** Pièces d'exemple proposées au dépôt (factures non encore reçues du dossier). */
    exemplesDisponibles(dossierId) {
      const deja = new Set(base.tous('pieces').map((p) => p.exemple).filter(Boolean));
      const ids = base.param('demo')?.disponibles || [];
      return ids
        .map((id) => base.lire('exemples', id))
        .filter((e) => e && e.dossierId === dossierId && !deja.has(e.id))
        .map((e) => ({ id: e.id, type: e.type, periode: e.periode, libelle: `${TYPES_PIECE[e.type]} — ${e.type === 'facture_vente' ? e.destinataire?.nom : e.emetteur?.nom || ''}`, numero: e.numero, url: urlSvg(e) }));
    },
    reinitialiser() {
      try {
        localStorage.removeItem(CLE);
        sessionStorage.removeItem(CLE_SESSION);
      } catch {}
      location.reload();
    },
  };
}
