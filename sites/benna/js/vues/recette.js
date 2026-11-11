// Fiche recette, mode cuisine pas à pas, fiche d'un geste, carnet d'essais.

import { t, tl, lang } from '../i18n.js';
import { etat, sauver, dejaCuisine } from '../etat.js';
import { RECETTES, PAR_ID, GESTES, REMPLACEMENTS } from '../data/index.js';
import { ico, esc, duree, quantite, nomIngredient, prix, pays, vignette, feuille, fermerFeuille, toast, partager, points, carte, reduirePhoto, date, vide } from '../ui.js';
import { lignes, coutRecette, UNITES_COMPTEES } from '../core.js';

// Recettes du catalogue et recettes personnelles, sous une même forme.
export function trouver(id) {
  if (PAR_ID[id]) return PAR_ID[id];
  const p = etat.perso.find((x) => x.id === id);
  if (!p) return null;
  const trois = (s) => ({ fr: s, ar: s, en: s });
  return { ...p, perso: true, t: trois(p.titre), d: trois(''), ing: [], steps: p.etapes.map(trois), tags: [], eq: [], diff: 1, prep: 0, cook: 0 };
}

const choix = {}; // nombre de parts choisi pour chaque recette
const partsDe = (r) => choix[r.id] || r.serves;

// Met à l'échelle le nombre en tête d'une ligne libre (« 200 g de farine »).
function echelle(ligne, f) {
  if (f === 1) return ligne;
  return ligne.replace(/^\s*(\d+(?:[.,]\d+)?)/, (m, n) => {
    const v = parseFloat(n.replace(',', '.')) * f;
    return String(Math.round(v * 10) / 10).replace('.', lang() === 'en' ? '.' : ',');
  });
}

function listeIngredients(r, parts) {
  if (r.perso) return `<ul class="ingredients">${r.ingredients.map((l) => `<li><span>${esc(echelle(l, parts / r.serves))}</span></li>`).join('')}</ul>`;
  let html = '<ul class="ingredients">';
  for (const l of lignes(r, parts)) {
    if (l.groupe) {
      html += `</ul><h3 class="groupe">${esc(t(`grp.${l.groupe}`))}</h3><ul class="ingredients">`;
      continue;
    }
    const q = quantite(l.id, l.q, l.u);
    const compte = UNITES_COMPTEES.includes(l.u);
    const remplace = REMPLACEMENTS[l.id] ? `<button class="lien-ico" data-a="remplacer" data-id="${l.id}" aria-label="${esc(t('remplacerPar'))}">${ico('remplacer')}</button>` : '';
    html += `<li><span>${esc(nomIngredient(l.id, l.q || 1, compte && l.u === 'pc'))}${remplace}</span>
      <span class="qte">${q.principal ? `<b>${esc(q.principal)}</b>` : ''}${q.secondaire ? `<small>${esc(q.secondaire)}</small>` : ''}</span></li>`;
  }
  return `${html}</ul>`.replace('<ul class="ingredients"></ul>', '');
}

const segmentMesures = () => `<div class="segment" role="group" aria-label="${esc(t('mesures'))}">
  ${['metric', 'maison', 'cups'].map((m) => `<button data-a="mesure" data-m="${m}" class="${etat.mesure === m ? 'actif' : ''}" aria-pressed="${etat.mesure === m}">${esc(t(`mesure.${m}`))}</button>`).join('')}
</div>${etat.mesure === 'maison' ? `<p class="note">${esc(t('noteVerre'))}</p>` : ''}`;

export function recette(id) {
  const r = trouver(id);
  if (!r) return vide('chercher', t('introuvable'), t('introuvableTexte'), `<a class="bouton" href="#/explorer">${esc(t('nav.explorer'))}</a>`);
  const parts = partsDe(r);
  const fav = etat.favoris.includes(r.id);
  const dernier = [...etat.journal].reverse().find((j) => j.id === r.id);
  const total = r.perso ? 0 : coutRecette(r, parts, etat.devise, etat.prix);
  const reperes = r.perso
    ? ''
    : `<ul class="reperes">
      <li>${ico('horloge')}<b>${duree(r.prep)}</b><small>${esc(t('prep'))}</small></li>
      ${r.cook ? `<li>${ico('marmite')}<b>${duree(r.cook)}</b><small>${esc(t('cuisson'))}</small></li>` : ''}
      ${r.rest ? `<li>${ico('minuteur')}<b>${duree(r.rest)}</b><small>${esc(t('repos'))}</small></li>` : ''}
      <li>${points(r.diff)}<b>${esc(t(`diff.${r.diff}`))}</b><small>${esc(t('difficulte'))}</small></li>
      <li>${ico('prix')}<b>${prix(total / parts)}</b><small>${esc(t(r.per === 'pcs' ? 'parPiece' : 'parPart'))}</small></li>
    </ul>`;
  const etapes = r.steps
    .map(
      (s, i) => `<li>
      <span class="num">${i + 1}</span>
      <div>
        <p>${esc(tl(s))}</p>
        <p class="etape-plus">
          ${s.m ? `<span class="pastille">${ico('minuteur')}${duree(s.m)}</span>` : ''}
          ${s.g ? `<button class="pastille bouton-pastille" data-a="geste" data-id="${s.g}">${ico('video')}${esc(tl(GESTES.find((g) => g.id === s.g).t))}</button>` : ''}
        </p>
        ${s.tip ? `<p class="conseil">${ico('idee')}${esc(tl(s.tip))}</p>` : ''}
      </div>
    </li>`,
    )
    .join('');
  return `<div class="page recette">
    <div class="photo">
      ${vignette(r, 'grande')}
      <div class="photo-barre">
        <button class="rond" data-a="retour" aria-label="${esc(t('retour'))}">${ico('retour', 'dir')}</button>
        <span>
          <button class="rond" data-a="partagerRecette" data-id="${r.id}" aria-label="${esc(t('partager'))}">${ico('partager')}</button>
          <button class="rond fav ${fav ? 'actif' : ''}" data-a="favori" data-id="${r.id}" aria-pressed="${fav}" aria-label="${esc(t('favori'))}">${ico('coeur')}</button>
        </span>
      </div>
    </div>
    <div class="fiche">
      <p class="sur">${r.perso ? esc(t('maRecette')) : `${pays(r.c)} · ${esc(t(`cat.${r.cat}`))}`}</p>
      <h1>${esc(tl(r.t))}</h1>
      ${tl(r.d) ? `<p class="desc">${esc(tl(r.d))}</p>` : ''}
      ${r.lien ? `<p><a class="bouton contour" href="${esc(r.lien)}" target="_blank" rel="noopener noreferrer">${ico('lien')}${esc(t('videoOrigine'))}</a></p>` : ''}
      ${reperes}
      ${dernier ? `<aside class="souvenir"><strong>${esc(t('derniereFois'))} · ${'★'.repeat(dernier.etoiles || 0)}</strong>${dernier.note ? `<p>${esc(dernier.note)}</p>` : ''}</aside>` : ''}
      <section class="bloc">
        <div class="bloc-tete">
          <h2>${esc(t('ingredients'))}</h2>
          <div class="pas" role="group" aria-label="${esc(t(r.per === 'pcs' ? 'pieces' : 'personnes'))}">
            <button class="rond" data-a="portion" data-id="${r.id}" data-d="-1" aria-label="${esc(t('moins'))}">${ico('moins')}</button>
            <output><b>${parts}</b><small>${esc(t(r.per === 'pcs' ? 'pieces' : 'personnes'))}</small></output>
            <button class="rond" data-a="portion" data-id="${r.id}" data-d="1" aria-label="${esc(t('plus'))}">${ico('plus')}</button>
          </div>
        </div>
        ${r.perso ? '' : segmentMesures()}
        ${listeIngredients(r, parts)}
        ${r.perso ? '' : `<p class="cout">${esc(t(r.per === 'pcs' ? 'coutEstimePiece' : 'coutEstime', { total: prix(total), part: prix(total / parts) }))} <a href="#/prix">${esc(t('modifierPrix'))}</a></p>
        <button class="bouton contour large" data-a="ajouterCourses" data-id="${r.id}">${ico('panier')}${esc(t('ajouterCourses'))}</button>`}
      </section>
      ${r.eq.length ? `<section class="bloc"><h2>${esc(t('materiel'))}</h2><p class="puces fixes">${r.eq.map((e) => `<span class="puce">${esc(t(`eq.${e}`))}</span>`).join('')}</p></section>` : ''}
      <section class="bloc">
        <h2>${esc(t('preparation'))}</h2>
        <ol class="etapes">${etapes}</ol>
      </section>
      <button class="bouton contour large" data-a="fait" data-id="${r.id}">${ico('ok')}${esc(t('jeLaiFait'))}</button>
    </div>
    <div class="barre-action"><a class="bouton large" href="#/cuisine/${r.id}">${ico('lecture')}${esc(t('cuisinerPasAPas'))}</a></div>
  </div>`;
}

/* ---------- Geste ---------- */

function ficheGeste(g) {
  const avec = RECETTES.filter((r) => r.steps.some((s) => s.g === g.id));
  return `<div class="geste-fiche">
    ${media(g)}
    <h2>${esc(tl(g.t))}</h2>
    ${g.v ? `<p class="note">${esc(t('gesteDemo'))}</p>` : ''}
    <ol class="reperes-geste">${g.pts.map((p) => `<li>${esc(tl(p))}</li>`).join('')}</ol>
    ${avec.length ? `<h3>${esc(t('recettesAvecGeste'))}</h3><p class="puces fixes">${avec.map((r) => `<a class="puce" href="#/r/${r.id}" data-a="fermerFeuille">${esc(tl(r.t))}</a>`).join('')}</p>` : ''}
  </div>`;
}

export const media = (g, classe = '') =>
  g.v
    ? `<video class="boucle ${classe}" src="video/${g.id}.mp4" poster="img/g/${g.id}.webp" autoplay loop muted playsinline preload="metadata"></video>`
    : `<img class="boucle ${classe}" src="img/g/${g.id}.webp" alt="" loading="lazy">`;

export function ouvrirGeste(id) {
  const g = GESTES.find((x) => x.id === id);
  if (!g) return;
  if (!etat.gestesVus.includes(id)) {
    etat.gestesVus.push(id);
    sauver();
  }
  feuille(ficheGeste(g));
}

/* ---------- Carnet d'essais ---------- */

let brouillon = { etoiles: 0, photo: null };

function formulaireCarnet(id) {
  return `<div class="carnet-form" data-id="${id}">
    <p class="label">${esc(t('votreNote'))}</p>
    <div class="etoiles" role="group" aria-label="${esc(t('votreNote'))}">
      ${[1, 2, 3, 4, 5].map((n) => `<button data-a="etoile" data-n="${n}" class="${n <= brouillon.etoiles ? 'actif' : ''}" aria-label="${n}/5" aria-pressed="${n <= brouillon.etoiles}">${ico('etoile')}</button>`).join('')}
    </div>
    <label class="label" for="note-carnet">${esc(t('noteLibre'))}</label>
    <textarea id="note-carnet" rows="3"></textarea>
    <label class="bouton contour photo-bouton">${ico('photo')}<span>${esc(t(brouillon.photo ? 'photoAjoutee' : 'ajouterPhoto'))}</span><input type="file" accept="image/*" data-c="photoCarnet" hidden></label>
    <button class="bouton large" data-a="enregistrerCarnet" data-id="${id}">${esc(t('enregistrer'))}</button>
  </div>`;
}

/* ---------- Mode cuisine ---------- */

const cuisineEtat = { id: null, pas: 0, fini: false };
const minuteurs = []; // { cle, titre, fin, total, sonne }
let horloge = null;
let verrou = null;
let ecoute = null;

const texteMinuteur = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
};

function sonner() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.35, 0.7].forEach((d) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.25, ctx.currentTime + d);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d + 0.28);
      o.start(ctx.currentTime + d);
      o.stop(ctx.currentTime + d + 0.3);
    });
  } catch {
    /* pas de son disponible */
  }
  navigator.vibrate?.([300, 150, 300]);
}

function tic() {
  const maintenant = Date.now();
  for (const m of minuteurs) {
    const reste = Math.max(0, Math.round((m.fin - maintenant) / 1000));
    document.querySelectorAll(`[data-minuteur="${m.cle}"]`).forEach((el) => {
      el.textContent = reste ? texteMinuteur(reste) : t('pret');
      el.closest('.minuteur')?.classList.toggle('fini', !reste);
    });
    if (!reste && !m.sonne) {
      m.sonne = true;
      sonner();
      toast(t('minuteurFini', { titre: m.titre }));
      if (etat.voix) dire(t('minuteurFini', { titre: m.titre }));
    }
  }
  if (!minuteurs.some((m) => !m.sonne)) {
    clearInterval(horloge);
    horloge = null;
  }
}

function blocMinuteur(r, i) {
  const s = r.steps[i];
  if (!s.m) return '';
  const cle = `${r.id}:${i}`;
  const m = minuteurs.find((x) => x.cle === cle);
  if (!m) return `<button class="bouton contour minuteur-lancer" data-a="minuteur" data-cle="${cle}" data-min="${s.m}">${ico('minuteur')}${esc(t('lancerMinuteur'))} · ${duree(s.m)}</button>`;
  const reste = Math.max(0, Math.round((m.fin - Date.now()) / 1000));
  return `<div class="minuteur ${reste ? '' : 'fini'}">${ico('minuteur')}<output data-minuteur="${cle}">${reste ? texteMinuteur(reste) : esc(t('pret'))}</output>
    <button class="rond" data-a="minuteurStop" data-cle="${cle}" aria-label="${esc(t('arreter'))}">${ico('fermer')}</button></div>`;
}

const LANGUES_VOIX = { fr: 'fr-FR', ar: 'ar-SA', en: 'en-US' };

function dire(texte) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texte);
  u.lang = LANGUES_VOIX[lang()];
  const voix = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang()));
  if (voix) u.voice = voix;
  u.rate = 0.95;
  speechSynthesis.speak(u);
}

async function garderEcranAllume() {
  try {
    verrou = await navigator.wakeLock?.request('screen');
  } catch {
    verrou = null;
  }
}

// Commandes vocales : « suivant », « retour », « répète », « minuteur ».
const MOTS = {
  suivant: ['suivant', 'suivante', 'next', 'التالي', 'التالية', 'بعد'],
  retour: ['retour', 'précédent', 'precedent', 'back', 'previous', 'السابق', 'رجوع', 'ارجع'],
  repete: ['répète', 'repete', 'répéter', 'repeat', 'again', 'أعد', 'اعد', 'كرر'],
  minuteur: ['minuteur', 'timer', 'مؤقت', 'المؤقت'],
};

function demarrerEcoute(app) {
  const Reco = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Reco) return false;
  ecoute = new Reco();
  ecoute.lang = LANGUES_VOIX[lang()];
  ecoute.continuous = true;
  ecoute.onresult = (e) => {
    const dit = e.results[e.results.length - 1][0].transcript.toLowerCase();
    const commande = Object.keys(MOTS).find((k) => MOTS[k].some((m) => dit.includes(m)));
    if (commande === 'suivant') actions.pasSuivant(null, null, app);
    else if (commande === 'retour') actions.pasPrecedent(null, null, app);
    else if (commande === 'repete') actions.lireEtape();
    else if (commande === 'minuteur') document.querySelector('.minuteur-lancer')?.click();
  };
  ecoute.onend = () => {
    if (ecoute) {
      try {
        ecoute.start();
      } catch {
        /* déjà relancée */
      }
    }
  };
  try {
    ecoute.start();
    return true;
  } catch {
    ecoute = null;
    return false;
  }
}

function arreterEcoute() {
  const e = ecoute;
  ecoute = null;
  try {
    e?.stop();
  } catch {
    /* déjà arrêtée */
  }
}

export function quitterCuisine() {
  verrou?.release?.().catch(() => {});
  verrou = null;
  arreterEcoute();
  window.speechSynthesis?.cancel();
}

export function cuisine(id) {
  const r = trouver(id);
  if (!r) return recette(id);
  if (cuisineEtat.id !== id) Object.assign(cuisineEtat, { id, pas: 0, fini: false });
  garderEcranAllume();
  const n = r.steps.length;
  const i = cuisineEtat.pas;
  if (cuisineEtat.fini) {
    brouillon = { etoiles: brouillon.etoiles || 0, photo: brouillon.photo };
    return `<div class="cuisine fin">
      <header><a class="rond" href="#/r/${r.id}" aria-label="${esc(t('fermer'))}">${ico('fermer')}</a></header>
      <main>
        <div class="bravo" aria-hidden="true">${ico('ok')}</div>
        <h1>${esc(t('bravo'))}</h1>
        <p>${esc(t('bravoTexte'))}</p>
        ${formulaireCarnet(r.id)}
        <a class="lien" href="#/r/${r.id}">${esc(t('plusTard'))}</a>
      </main>
    </div>`;
  }
  const s = r.steps[i];
  const g = s.g && GESTES.find((x) => x.id === s.g);
  const reco = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  return `<div class="cuisine">
    <header>
      <a class="rond" href="#/r/${r.id}" aria-label="${esc(t('fermer'))}">${ico('fermer')}</a>
      <div class="progres" role="progressbar" aria-valuemin="1" aria-valuemax="${n}" aria-valuenow="${i + 1}">${r.steps.map((_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</div>
      <button class="rond" data-a="ingredientsCuisine" data-id="${r.id}" aria-label="${esc(t('ingredients'))}">${ico('liste')}</button>
      <button class="rond ${etat.voix ? 'actif' : ''}" data-a="voix" aria-pressed="${etat.voix}" aria-label="${esc(t('voix'))}">${ico('son')}</button>
      ${reco ? `<button class="rond ${ecoute ? 'actif' : ''}" data-a="micro" aria-pressed="${!!ecoute}" aria-label="${esc(t('commandeVocale'))}">${ico('micro')}</button>` : ''}
    </header>
    <main>
      <p class="etape-n">${esc(t('etapeN', { n: i + 1, total: n }))}</p>
      ${g ? `<button class="geste-apercu" data-a="geste" data-id="${g.id}">${media(g)}<span>${ico('video')}${esc(tl(g.t))}</span></button>` : ''}
      <p class="etape-texte" id="etape-texte">${esc(tl(s))}</p>
      ${s.tip ? `<p class="conseil">${ico('idee')}${esc(tl(s.tip))}</p>` : ''}
      ${blocMinuteur(r, i)}
      ${minuteurs.filter((m) => m.cle.startsWith(`${r.id}:`) && m.cle !== `${r.id}:${i}`).map((m) => `<div class="minuteur petit">${ico('minuteur')}<small>${esc(m.titre)}</small><output data-minuteur="${m.cle}"></output></div>`).join('')}
    </main>
    <footer>
      <button class="bouton contour" data-a="pasPrecedent" ${i ? '' : 'disabled'}>${ico('retour', 'dir')}<span>${esc(t('precedent'))}</span></button>
      <button class="bouton" data-a="pasSuivant"><span>${esc(t(i === n - 1 ? 'terminer' : 'suivantEtape'))}</span>${ico(i === n - 1 ? 'ok' : 'suivant', 'dir')}</button>
    </footer>
  </div>`;
}

// À appeler après l'affichage du mode cuisine : lecture de l'étape et remise à l'heure des minuteurs.
export function apresCuisine() {
  tic();
  if (etat.voix && !cuisineEtat.fini) actions.lireEtape();
}

/* ---------- Actions ---------- */

export const actions = {
  favori(el, e, app) {
    const id = el.dataset.id;
    const i = etat.favoris.indexOf(id);
    if (i >= 0) etat.favoris.splice(i, 1);
    else etat.favoris.push(id);
    sauver();
    document.querySelectorAll(`.fav[data-id="${id}"]`).forEach((b) => {
      b.classList.toggle('actif', i < 0);
      b.setAttribute('aria-pressed', String(i < 0));
    });
    if (location.hash.startsWith('#/favoris')) app.rafraichir();
  },
  portion(el, e, app) {
    const r = trouver(el.dataset.id);
    const pas = r.per === 'pcs' && r.serves >= 12 ? Math.max(1, Math.round(r.serves / 4)) : 1;
    choix[r.id] = Math.min(60, Math.max(1, partsDe(r) + Number(el.dataset.d) * pas));
    app.rafraichir();
  },
  mesure(el, e, app) {
    etat.mesure = el.dataset.m;
    sauver();
    app.rafraichir();
  },
  ajouterCourses(el) {
    const r = trouver(el.dataset.id);
    const deja = etat.courses.find((c) => c.id === r.id);
    if (deja) deja.parts = partsDe(r);
    else etat.courses.push({ id: r.id, parts: partsDe(r) });
    sauver();
    toast(t('ajoute'));
  },
  remplacer(el) {
    const id = el.dataset.id;
    feuille(`<h2>${esc(t('remplacerPar'))}</h2><p class="sur">${esc(nomIngredient(id))}</p><p>${esc(tl(REMPLACEMENTS[id]))}</p>`);
  },
  geste(el) {
    ouvrirGeste(el.dataset.id);
  },
  partagerRecette(el) {
    const r = trouver(el.dataset.id);
    partager(tl(r.t), t('partagerTexte', { titre: tl(r.t) }), r.perso ? undefined : location.href.split('#')[0] + `#/r/${r.id}`);
  },
  fait(el) {
    brouillon = { etoiles: 0, photo: null };
    feuille(`<h2>${esc(t('jeLaiFait'))}</h2>${formulaireCarnet(el.dataset.id)}`);
  },
  etoile(el) {
    brouillon.etoiles = Number(el.dataset.n);
    el.parentElement.querySelectorAll('button').forEach((b) => {
      const on = Number(b.dataset.n) <= brouillon.etoiles;
      b.classList.toggle('actif', on);
      b.setAttribute('aria-pressed', String(on));
    });
  },
  enregistrerCarnet(el, e, app) {
    const id = el.dataset.id;
    const note = document.getElementById('note-carnet')?.value.trim() || '';
    etat.journal.push({ id, date: new Date().toISOString(), etoiles: brouillon.etoiles, note, photo: brouillon.photo });
    if (!sauver()) {
      // Stockage plein : on garde l'essai sans la photo.
      etat.journal[etat.journal.length - 1].photo = null;
      sauver();
    }
    brouillon = { etoiles: 0, photo: null };
    Object.assign(cuisineEtat, { id: null, pas: 0, fini: false });
    fermerFeuille();
    toast(t('enregistre'));
    if (location.hash.startsWith('#/cuisine/')) app.aller(`#/r/${id}`);
    else app.rafraichir();
  },
  pasSuivant(el, e, app) {
    const r = trouver(cuisineEtat.id);
    if (!r) return;
    if (cuisineEtat.pas >= r.steps.length - 1) cuisineEtat.fini = true;
    else cuisineEtat.pas += 1;
    app.rafraichir();
  },
  pasPrecedent(el, e, app) {
    if (cuisineEtat.pas > 0) cuisineEtat.pas -= 1;
    app.rafraichir();
  },
  minuteur(el, e, app) {
    const cle = el.dataset.cle;
    const min = Number(el.dataset.min);
    const r = trouver(cle.split(':')[0]);
    minuteurs.push({ cle, titre: tl(r.t), fin: Date.now() + min * 60000, total: min * 60, sonne: false });
    if (!horloge) horloge = setInterval(tic, 1000);
    app.rafraichir();
  },
  minuteurStop(el, e, app) {
    const i = minuteurs.findIndex((m) => m.cle === el.dataset.cle);
    if (i >= 0) minuteurs.splice(i, 1);
    app.rafraichir();
  },
  voix(el, e, app) {
    etat.voix = !etat.voix;
    sauver();
    if (!etat.voix) window.speechSynthesis?.cancel();
    toast(t(etat.voix ? 'voixOn' : 'voixOff'));
    app.rafraichir();
  },
  micro(el, e, app) {
    if (ecoute) {
      arreterEcoute();
      toast(t('microOff'));
    } else toast(t(demarrerEcoute(app) ? 'microOn' : 'microIndispo'));
    app.rafraichir();
  },
  lireEtape() {
    const el = document.getElementById('etape-texte');
    if (el) dire(el.textContent);
  },
  ingredientsCuisine(el) {
    const r = trouver(el.dataset.id);
    feuille(`<h2>${esc(t('ingredients'))}</h2>${listeIngredients(r, partsDe(r))}`);
  },
};

export const changements = {
  async photoCarnet(el) {
    const f = el.files?.[0];
    if (!f) return;
    brouillon.photo = await reduirePhoto(f);
    const libelle = el.parentElement.querySelector('span');
    if (libelle) libelle.textContent = t(brouillon.photo ? 'photoAjoutee' : 'ajouterPhoto');
  },
};

/* ---------- Favoris et carnet ---------- */

export function favoris() {
  const liste = etat.favoris.map(trouver).filter(Boolean);
  return `<div class="page">
    <header class="barre"><button class="rond" data-a="retour" aria-label="${esc(t('retour'))}">${ico('retour', 'dir')}</button><h1>${esc(t('mesFavoris'))}</h1><span></span></header>
    ${liste.length ? `<div class="grille">${liste.map((r) => carte(r)).join('')}</div>` : vide('coeur', t('aucunFavori'), t('aucunFavoriTexte'), `<a class="bouton" href="#/explorer">${esc(t('nav.explorer'))}</a>`)}
  </div>`;
}

export function carnet() {
  const liste = [...etat.journal].reverse();
  return `<div class="page">
    <header class="barre"><button class="rond" data-a="retour" aria-label="${esc(t('retour'))}">${ico('retour', 'dir')}</button><h1>${esc(t('monCarnet'))}</h1><span></span></header>
    ${
      liste.length
        ? `<ul class="carnet">${liste
            .map((j) => {
              const r = trouver(j.id);
              if (!r) return '';
              return `<li>
            ${j.photo ? `<img src="${j.photo}" alt="">` : vignette(r)}
            <div><a href="#/r/${r.id}"><strong>${esc(tl(r.t))}</strong></a>
            <p class="meta"><span>${esc(date(j.date))}</span><span class="or">${'★'.repeat(j.etoiles || 0)}</span></p>
            ${j.note ? `<p>${esc(j.note)}</p>` : ''}</div>
          </li>`;
            })
            .join('')}</ul>`
        : vide('livre', t('carnetVide'), t('carnetVideTexte'), `<a class="bouton" href="#/explorer">${esc(t('nav.explorer'))}</a>`)
    }
  </div>`;
}

export { dejaCuisine };
