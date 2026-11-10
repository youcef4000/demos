// Coque de l'application : connexion, menu selon le rôle, navigation, période de travail.
// Aucune page interne ne s'affiche sans session valide ; les droits sont revérifiés par le noyau à chaque appel.
import { client } from './api.js';
import { injecterIcones } from './icones.js';
import { h, brut, monter, icone, toast, sur, initiales, periodes, periodeFr, fenetre } from './ui.js';

const P = ['associe', 'collaborateur'];
const ROUTES = [
  { cle: 'tableau', roles: P, titre: 'Tableau de bord', vue: () => import('./vues/tableau.js') },
  { cle: 'pieces', roles: [...P, 'client'], titre: 'Pièces', titreClient: 'Mes pièces', vue: () => import('./vues/pieces.js'), periode: true },
  { cle: 'piece', roles: [...P, 'client'], titre: 'Pièce', vue: () => import('./vues/piece.js') },
  { cle: 'deposer', roles: [...P, 'client'], titre: 'Déposer des pièces', vue: () => import('./vues/deposer.js'), periode: true },
  { cle: 'ecritures', roles: P, titre: 'Écritures et export PC Compta', vue: () => import('./vues/ecritures.js'), periode: true },
  { cle: 'g50', roles: [...P, 'client'], titre: 'Déclarations G50', titreClient: 'Mes G50', vue: () => import('./vues/g50.js'), periode: true },
  { cle: 'resultats', roles: [...P, 'client'], titre: 'Résultats du mois', titreClient: 'Mes résultats', vue: () => import('./vues/resultats.js'), periode: true },
  { cle: 'echeancier', roles: [...P, 'client'], titre: 'Échéancier fiscal et social', vue: () => import('./vues/echeancier.js') },
  { cle: 'relances', roles: P, titre: 'Pièces manquantes et relances', vue: () => import('./vues/relances.js'), periode: true },
  { cle: 'envois', roles: P, titre: "Boîte d'envoi", vue: () => import('./vues/envois.js') },
  { cle: 'messages', roles: [...P, 'client'], titre: 'Messages', vue: () => import('./vues/messages.js') },
  { cle: 'dossiers', roles: P, titre: 'Dossiers clients', vue: () => import('./vues/dossiers.js'), periode: true },
  { cle: 'agents', roles: P, titre: 'Agents IA', vue: () => import('./vues/agents.js') },
  { cle: 'parametres', roles: ['associe'], titre: 'Paramètres', vue: () => import('./vues/parametres.js') },
  { cle: 'utilisateurs', roles: ['associe'], titre: 'Comptes et accès', vue: () => import('./vues/utilisateurs.js') },
  { cle: 'journal', roles: ['associe'], titre: "Journal d'activité", vue: () => import('./vues/journal.js') },
  { cle: 'contacts', roles: ['associe'], titre: 'Demandes de contact', vue: () => import('./vues/journal.js') },
  { cle: 'accueil', roles: ['client'], titre: 'Accueil', vue: () => import('./vues/accueil.js') },
];

const NAV = {
  personnel: [
    ['Travail du mois', [['tableau', 'tableau', 'Tableau de bord'], ['pieces', 'piece', 'Pièces', 'piecesAValider'], ['ecritures', 'livre', 'Écritures', 'ecrituresProposees'], ['g50', 'recu', 'G50', 'g50AValider'], ['resultats', 'graphique', 'Résultats']]],
    ['Clients', [['dossiers', 'dossier', 'Dossiers'], ['relances', 'cloche', 'Relances'], ['envois', 'boite', "Boîte d'envoi", 'envoisAValider'], ['messages', 'message', 'Messages', 'messagesNonLus'], ['echeancier', 'calendrier', 'Échéancier']]],
    ['Cabinet', [['agents', 'agent', 'Agents IA'], ['parametres', 'reglages', 'Paramètres', null, 'associe'], ['utilisateurs', 'personnes', 'Comptes', null, 'associe'], ['journal', 'liste', 'Journal', null, 'associe'], ['contacts', 'courrier', 'Demandes du site', 'contactsNonTraites', 'associe']]],
  ],
  client: [['Mon dossier', [['accueil', 'maison', 'Accueil'], ['deposer', 'depot', 'Déposer'], ['pieces', 'piece', 'Mes pièces'], ['g50', 'recu', 'Mes G50'], ['resultats', 'graphique', 'Mes résultats'], ['echeancier', 'calendrier', 'Échéances'], ['messages', 'message', 'Messages', 'messagesNonLus']]]],
};
const NAV_BAS = { personnel: [['tableau', 'tableau', 'Accueil'], ['pieces', 'piece', 'Pièces', 'piecesAValider'], ['g50', 'recu', 'G50', 'g50AValider'], ['envois', 'boite', 'Envois', 'envoisAValider']], client: [['accueil', 'maison', 'Accueil'], ['deposer', 'depot', 'Déposer'], ['g50', 'recu', 'G50'], ['messages', 'message', 'Messages', 'messagesNonLus']] };

const racine = document.getElementById('racine');
let c;
let u;
let moi;
let compteurs = {};
let nettoyer = null;

function lireHash() {
  const [chemin, qs] = location.hash.replace(/^#\/?/, '').split('?');
  const [cle, ...params] = chemin.split('/');
  return { cle, params: params.map(decodeURIComponent), q: Object.fromEntries(new URLSearchParams(qs || '')) };
}
export function aller(chemin) {
  location.hash = `#/${chemin}`;
}
function accueilDe(role) {
  return role === 'client' ? 'accueil' : 'tableau';
}
function periodeCourante() {
  try {
    return sessionStorage.getItem('cabinet-periode') || moi.periodeTravail;
  } catch {
    return moi.periodeTravail;
  }
}
function choisirPeriode(p) {
  try {
    sessionStorage.setItem('cabinet-periode', p);
  } catch {}
}

async function demarrer() {
  injecterIcones();
  c = await client();
  u = await c.session().catch(() => null);
  if (!u) return ecranConnexion();
  await entrer();
}

async function entrer() {
  moi = await c.appel('GET', '/moi');
  u = moi.utilisateur;
  document.title = `${u.role === 'client' ? 'Mon espace' : 'Espace du cabinet'} — ${moi.cabinet.nom}`;
  dessinerCadre();
  window.addEventListener('hashchange', router);
  router();
}

function ecranConnexion(message = '') {
  const demo = c.mode === 'demo';
  monter(
    racine,
    h`${demo ? bandeauDemo() : ''}<main class="connexion"><div class="connexion-carte">
      <a class="marque" href="../">${icone('logo')}<span><b>Cabinet Mizane</b><small>Espace sécurisé du cabinet et de ses clients</small></span></a>
      <h1>Connexion</h1>
      ${message ? h`<div class="encadre erreur">${icone('attention')}<p>${message}</p></div>` : ''}
      <form id="f-connexion" autocomplete="on">
        <label class="champ"><span>Adresse e-mail</span><input name="email" type="email" autocomplete="username" required inputmode="email"></label>
        <label class="champ"><span>Mot de passe</span><input name="mdp" type="password" autocomplete="current-password" required></label>
        <button class="btn btn-primaire btn-large" type="submit">${icone('cadenas')} Se connecter</button>
      </form>
      <p class="petit muet" style="margin-top:12px">Mot de passe oublié : demandez à l'associé du cabinet de le réinitialiser.</p>
      ${demo ? h`<div class="comptes-demo"><p><b>Comptes de démonstration</b> — un clic remplit le formulaire :</p>${c.comptes.filter((x) => ['u-nadia', 'u-amine', 'u-rachid'].includes(x.id)).map((x) => h`<button type="button" class="compte-demo" data-email="${x.email}" data-mdp="${x.motDePasse}"><span class="avatar">${initiales(x.nom)}</span><span><strong>${x.role === 'associe' ? 'Associée' : x.role === 'collaborateur' ? 'Collaborateur' : 'Client'} · ${x.nom}</strong><span>${x.email} · ${x.motDePasse}</span></span></button>`)}</div>` : ''}
    </div></main>`,
  );
  const f = document.getElementById('f-connexion');
  sur(racine, 'click', '.compte-demo', (e, b) => {
    f.email.value = b.dataset.email;
    f.mdp.value = b.dataset.mdp;
    f.requestSubmit();
  });
  sur(racine, 'click', '[data-reinit]', () => c.reinitialiser());
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const b = f.querySelector('button[type=submit]');
    b.disabled = true;
    try {
      u = await c.connexion(f.email.value, f.mdp.value);
      if (!location.hash || location.hash === '#/') location.hash = `#/${accueilDe(u.role)}`;
      await entrer();
    } catch (err) {
      ecranConnexion(err.message || 'Connexion impossible.');
    }
  });
  f.email.focus();
}

function bandeauDemo() {
  return h`<div class="bandeau-demo"><span>Démonstration — données fictives, figée au mardi 10/11/2026. Agents IA simulés, aucun e-mail réel envoyé.</span><button type="button" data-reinit>Réinitialiser la démo</button></div>`;
}

function dessinerCadre() {
  const famille = u.role === 'client' ? 'client' : 'personnel';
  monter(
    racine,
    h`${c.mode === 'demo' ? bandeauDemo() : ''}<div class="cadre">
      <nav class="nav" id="nav" aria-label="Menu principal">
        <a class="marque" href="#/${accueilDe(u.role)}">${icone('logo')}<span><b>${moi.cabinet.nom}</b><small>${u.role === 'client' ? moi.dossier?.raisonSociale || 'Espace client' : moi.cabinet.activite}</small></span></a>
        ${NAV[famille].map(([groupe, liens]) => h`<div class="nav-groupe">${groupe}</div>${liens.filter((l) => !l[4] || l[4] === u.role).map(([cle, ic, lib, compteur]) => h`<a href="#/${cle}" data-cle="${cle}">${icone(ic)}<span>${lib}</span>${compteur ? h`<span class="compteur" data-compteur="${compteur}" hidden></span>` : ''}</a>`)}`)}
        <div class="nav-groupe">Session</div>
        <a href="#" data-sortie>${icone('sortie')}<span>Se déconnecter</span></a>
        <p class="tres-petit muet" style="padding:12px 10px 0">${u.nom}<br>${moi.roleLibelle}${u.role === 'client' ? '' : ` · ${moi.cabinet.nom}`}</p>
      </nav>
      <div class="principal">
        <header class="barre">
          <button class="btn-menu" type="button" aria-label="Ouvrir le menu" aria-controls="nav" data-menu>${icone('menu')}</button>
          <h1 id="titre-page">…</h1>
          <label class="periode-choix" id="choix-periode" hidden><span class="sr">Période de travail</span>${icone('calendrier')}<select id="periode">${periodes(moi.periodeTravail, 11).map((p) => h`<option value="${p}">${periodeFr(p)}</option>`)}</select></label>
          <div class="utilisateur"><span class="avatar">${initiales(u.nom)}</span><span>${u.nom}<br><span class="role">${moi.roleLibelle}</span></span></div>
        </header>
        <main id="vue" tabindex="-1"></main>
      </div>
      <nav class="nav-bas" aria-label="Raccourcis">${NAV_BAS[famille].map(([cle, ic, lib, compteur]) => h`<a href="#/${cle}" data-cle="${cle}">${icone(ic)}<span>${lib}</span>${compteur ? h`<span class="point" data-compteur="${compteur}" hidden></span>` : ''}</a>`)}</nav>
    </div>`,
  );
  const nav = document.getElementById('nav');
  sur(racine, 'click', '[data-menu]', () => nav.classList.toggle('ouverte'));
  sur(racine, 'click', '#nav a', () => nav.classList.remove('ouverte'));
  sur(racine, 'click', '[data-reinit]', async () => {
    const ok = await fenetre({ titre: 'Réinitialiser la démo ?', corps: h`<p>Toutes les actions faites dans ce navigateur (validations, envois, paramètres) sont effacées et les données d'exemple reviennent à leur état de départ.</p>`, boutons: [{ libelle: 'Annuler', valeur: 'annuler' }, { libelle: 'Réinitialiser', valeur: 'ok', classe: 'btn-danger' }] });
    if (ok) c.reinitialiser();
  });
  sur(racine, 'click', '[data-sortie]', async (e) => {
    e.preventDefault();
    await c.deconnexion();
    location.hash = '';
    location.reload();
  });
  const sel = document.getElementById('periode');
  sel.value = periodeCourante();
  sel.addEventListener('change', () => {
    choisirPeriode(sel.value);
    router();
  });
}

export async function rafraichirCompteurs() {
  try {
    compteurs = await c.appel('GET', '/compteurs');
  } catch {
    return;
  }
  for (const el of document.querySelectorAll('[data-compteur]')) {
    const n = compteurs[el.dataset.compteur] || 0;
    el.textContent = n;
    el.hidden = !n;
  }
}

async function router() {
  const { cle, params, q } = lireHash();
  let r = ROUTES.find((x) => x.cle === cle);
  if (!r || !r.roles.includes(u.role)) {
    if (cle && r) toast("Cette page n'est pas accessible avec votre compte.", 'erreur');
    location.replace(`#/${accueilDe(u.role)}`);
    return;
  }
  nettoyer?.();
  nettoyer = null;
  for (const a of document.querySelectorAll('[data-cle]')) a.classList.toggle('actif', a.dataset.cle === cle || (cle === 'piece' && a.dataset.cle === 'pieces') || (cle === 'g50' && a.dataset.cle === 'g50'));
  const titre = (u.role === 'client' && r.titreClient) || r.titre;
  document.getElementById('titre-page').textContent = titre;
  document.getElementById('choix-periode').hidden = !r.periode;
  const vue = document.getElementById('vue');
  // Un conteneur neuf par écran : un écran quitté qui finit de charger écrit dans un bloc détaché
  const el = document.createElement('div');
  vue.replaceChildren(el);
  monter(el, h`<div class="chargement"><span class="rond"></span> Chargement…</div>`);
  const ctx = {
    c,
    u,
    moi,
    params,
    q,
    periode: periodeCourante(),
    aller,
    titre: (t) => (document.getElementById('titre-page').textContent = t),
    changerPeriode: (p) => {
      choisirPeriode(p);
      document.getElementById('periode').value = p;
    },
    rafraichir: () => router(),
    rafraichirCompteurs,
  };
  try {
    const mod = await r.vue();
    const fin = (await mod.default(el, ctx)) || null;
    if (el.isConnected) nettoyer = fin;
    else fin?.();
  } catch (err) {
    if (err.statut === 401) return location.reload();
    console.error(err);
    monter(el, h`<div class="encadre erreur">${icone('attention')}<p>${err.message || 'Erreur inattendue.'}</p></div>`);
  }
  vue.focus({ preventScroll: true });
  window.scrollTo(0, 0);
  rafraichirCompteurs();
}

demarrer().catch((e) => {
  console.error(e);
  monter(racine, h`<div class="connexion"><div class="connexion-carte"><div class="encadre erreur">${icone('attention')}<p>Impossible de charger l'espace : ${e.message}</p></div></div></div>`);
});

export { brut };
