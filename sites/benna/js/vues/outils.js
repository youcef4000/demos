// Les outils du quotidien : « Ce soir on mange quoi ? », frigo, liste de courses, planificateur.

import { t, tl, lang } from '../i18n.js';
import { etat, sauver, acces } from '../etat.js';
import { RECETTES, INGREDIENTS, RAYONS, PLACARD } from '../data/index.js';
import { carte, ico, esc, entete, vide, toast, feuille, fermerFeuille, nomIngredient, quantite, prix, vignette, whatsapp, unite } from '../ui.js';
import { ceSoir, selonFrigo, besoins, listeCourses, coutRecette, simplifier, UNITES_COMPTEES } from '../core.js';
import { trouver } from './recette.js';
import { CONFIG } from '../config.js';

const puce = (action, valeur, libelle, actif, attr = 'v') =>
  `<button class="puce ${actif ? 'actif' : ''}" data-a="${action}" data-${attr}="${valeur}" aria-pressed="${actif}">${esc(libelle)}</button>`;

const manque = (x) =>
  x.manque.length
    ? `<p class="manque">${esc(t('ilManque', { liste: x.manque.slice(0, 4).map((id) => nomIngredient(id)).join(lang() === 'ar' ? '، ' : ', ') }))}${x.manque.length > 4 ? ` +${x.manque.length - 4}` : ''}</p>`
    : `<p class="manque ok">${ico('ok')}${esc(t('toutLa'))}</p>`;

/* ---------- Ce soir on mange quoi ? ---------- */

const soir = { minutes: 30, budget: 0, envie: '', frigo: false, idees: null };

function idees() {
  if (!soir.idees) return '';
  if (!soir.idees.length) return vide('idee', t('aucuneIdee'), t('aucuneIdeeTexte'));
  return `<div class="grille">${soir.idees.map((x) => carte(x.recette, soir.frigo ? manque(x) : '')).join('')}</div>
    <button class="bouton contour large" data-a="proposer">${ico('relancer')}${esc(t('autresIdees'))}</button>`;
}

export function cesoir() {
  return `<div class="page">
    ${entete(t('ceSoirTitre'), { retour: false })}
    <section class="question"><h2>${esc(t('qTemps'))}</h2><div class="puces fixes">
      ${[20, 30, 45, 60].map((m) => puce('soirTemps', m, `${m} ${t('min')}`, soir.minutes === m)).join('')}${puce('soirTemps', 0, t('peuImporte'), !soir.minutes)}
    </div></section>
    <section class="question"><h2>${esc(t('qBudget'))}</h2><div class="puces fixes">
      ${[1, 2].map((b) => puce('soirBudget', b, t(`budget.${b}`), soir.budget === b)).join('')}${puce('soirBudget', 0, t('peuImporte'), !soir.budget)}
    </div></section>
    <section class="question"><h2>${esc(t('qEnvie'))}</h2><div class="puces fixes">
      ${['sale', 'sucre', 'leger'].map((e) => puce('soirEnvie', e, t(`envie.${e}`), soir.envie === e)).join('')}${puce('soirEnvie', '', t('peuImporte'), !soir.envie)}
    </div></section>
    <label class="bascule"><input type="checkbox" data-c="soirFrigo" ${soir.frigo ? 'checked' : ''}><span>${esc(t('avecFrigo', { n: etat.frigo.length }))}</span><a href="#/frigo">${esc(t('outilFrigo'))}</a></label>
    <button class="bouton large" data-a="proposer">${ico('idee')}${esc(t('proposer'))}</button>
    <div id="idees">${idees()}</div>
  </div>`;
}

/* ---------- Frigo ---------- */

let frigoRecherche = '';
const utiles = [...new Set(RECETTES.flatMap(besoins))];

function frigoChoix() {
  const q = simplifier(frigoRecherche);
  return RAYONS.map((rayon) => {
    const ids = utiles.filter((id) => INGREDIENTS[id].rayon === rayon && (!q || simplifier(Object.values(INGREDIENTS[id].n).join(' ')).includes(q)));
    if (!ids.length) return '';
    return `<h3>${esc(t(`rayon.${rayon}`))}</h3><div class="puces fixes">${ids
      .sort((a, b) => nomIngredient(a).localeCompare(nomIngredient(b), lang()))
      .map((id) => puce('frigoBascule', id, nomIngredient(id), etat.frigo.includes(id), 'id'))
      .join('')}</div>`;
  }).join('');
}

function frigoResultats() {
  if (!etat.frigo.length) return `<p class="note">${esc(t('frigoVide'))}</p>`;
  const liste = selonFrigo(RECETTES, etat.frigo).filter((x) => x.score >= 0.4).slice(0, 12);
  if (!liste.length) return `<p class="note">${esc(t('frigoPeu'))}</p>`;
  return `<div class="grille">${liste.map((x) => carte(x.recette, manque(x))).join('')}</div>`;
}

export function frigo() {
  return `<div class="page">
    ${entete(t('outilFrigo'))}
    <p class="intro">${esc(t('frigoIntro'))}</p>
    <label class="recherche">${ico('chercher')}<input type="search" data-s="frigoRecherche" value="${esc(frigoRecherche)}" placeholder="${esc(t('frigoChercher'))}" aria-label="${esc(t('frigoChercher'))}" autocomplete="off"></label>
    <div id="frigo-choix" class="frigo-choix">${frigoChoix()}</div>
    <section class="bloc"><h2>${esc(t('frigoPossible'))}</h2><div id="frigo-resultats">${frigoResultats()}</div></section>
  </div>`;
}

/* ---------- Liste de courses ---------- */

const choixCourses = () => etat.courses.map((c) => ({ recette: trouver(c.id), parts: c.parts })).filter((c) => c.recette && !c.recette.perso);

function ligneCourse(it) {
  const q = it.q == null ? '' : quantite(it.id, it.q, it.u).principal;
  const coche = !!etat.coches[it.id];
  return `<li class="${coche ? 'fait' : ''}"><label><input type="checkbox" data-c="coche" data-id="${it.id}" ${coche ? 'checked' : ''}>
    <span>${esc(nomIngredient(it.id, it.q || 1, UNITES_COMPTEES.includes(it.u) && it.u === 'pc'))}</span></label>
    <span class="qte">${q ? `<b>${esc(q)}</b>` : ''}${it.cout ? `<small>${prix(it.cout)}</small>` : ''}</span></li>`;
}

function texteCourses() {
  const l = listeCourses(choixCourses(), etat.devise, etat.prix);
  const lignes = [`🛒 ${t('listeTitre')} · ${CONFIG.nom}`];
  for (const g of l.rayons) {
    lignes.push('', `*${t(`rayon.${g.rayon}`)}*`);
    for (const it of g.items) lignes.push(`• ${nomIngredient(it.id)}${it.q != null ? ` : ${quantite(it.id, it.q, it.u).principal}` : ''}`);
  }
  if (etat.coursesLibres.length) lignes.push('', `*${t('autres')}*`, ...etat.coursesLibres.map((x) => `• ${x.texte}`));
  lignes.push('', `${t('totalEstime')} : ${prix(l.total)}`);
  return lignes.join('\n');
}

export function courses() {
  const choisies = etat.courses.map((c) => ({ ...c, recette: trouver(c.id) })).filter((c) => c.recette);
  if (!choisies.length && !etat.coursesLibres.length) {
    return `<div class="page">${entete(t('outilCourses'))}${vide('panier', t('coursesVide'), t('coursesVideTexte'), `<a class="bouton" href="#/explorer">${esc(t('nav.explorer'))}</a>`)}
      ${formulaireArticle()}</div>`;
  }
  const l = listeCourses(choixCourses(), etat.devise, etat.prix);
  return `<div class="page">
    ${entete(t('outilCourses'))}
    <section class="bloc">
      <h2>${esc(t('recettesListe'))}</h2>
      <ul class="liste-recettes">${choisies
        .map(
          (c) => `<li>${vignette(c.recette)}<a href="#/r/${c.id}">${esc(tl(c.recette.t))}</a>
        <div class="pas petit"><button class="rond" data-a="coursesParts" data-id="${c.id}" data-d="-1" aria-label="${esc(t('moins'))}">${ico('moins')}</button><output><b>${c.parts}</b></output><button class="rond" data-a="coursesParts" data-id="${c.id}" data-d="1" aria-label="${esc(t('plus'))}">${ico('plus')}</button></div>
        <button class="rond" data-a="coursesRetirer" data-id="${c.id}" aria-label="${esc(t('retirer'))}">${ico('corbeille')}</button></li>`,
        )
        .join('')}</ul>
    </section>
    ${l.rayons.map((g) => `<section class="rayon"><h3>${esc(t(`rayon.${g.rayon}`))}</h3><ul class="courses">${g.items.map(ligneCourse).join('')}</ul></section>`).join('')}
    ${l.placard.length ? `<section class="rayon"><h3>${esc(t('aVerifier'))}</h3><ul class="courses">${l.placard.map(ligneCourse).join('')}</ul></section>` : ''}
    <section class="rayon"><h3>${esc(t('autres'))}</h3>
      <ul class="courses">${etat.coursesLibres.map((x, i) => `<li class="${x.fait ? 'fait' : ''}"><label><input type="checkbox" data-c="cocheLibre" data-i="${i}" ${x.fait ? 'checked' : ''}><span>${esc(x.texte)}</span></label><button class="rond" data-a="libreRetirer" data-i="${i}" aria-label="${esc(t('retirer'))}">${ico('fermer')}</button></li>`).join('')}</ul>
      ${formulaireArticle()}
    </section>
    <p class="total"><span>${esc(t('totalEstime'))}</span><b>${prix(l.total)}</b></p>
    <p class="note">${esc(t('prixIndicatifs'))} <a href="#/prix">${esc(t('modifierPrix'))}</a></p>
    <a class="bouton large" href="${whatsapp(texteCourses())}" target="_blank" rel="noopener noreferrer">${ico('message')}${esc(t('envoyerWhatsApp'))}</a>
    <button class="bouton contour large" data-a="coursesVider">${ico('corbeille')}${esc(t('viderListe'))}</button>
  </div>`;
}

const formulaireArticle = () =>
  `<div class="ajout"><input type="text" id="article" placeholder="${esc(t('ajouterArticle'))}" aria-label="${esc(t('ajouterArticle'))}" data-entree="libreAjouter" maxlength="60"><button class="rond plein" data-a="libreAjouter" aria-label="${esc(t('ajouterArticle'))}">${ico('plus')}</button></div>`;

/* ---------- Planificateur : semaine et Ramadan ---------- */

const CRENEAUX = { semaine: ['dej', 'din'], ramadan: ['soupe', 'entree', 'plat', 'douceur'] };
const NB_JOURS = { semaine: 7, ramadan: CONFIG.ramadan.jours };
const page = { ramadan: 0 };

function candidats(creneau) {
  const dans = (...cats) => (r) => cats.includes(r.cat);
  const regle = {
    dej: (r) => r.kind === 'sale' && dans('plat', 'street', 'soupe')(r),
    din: (r) => r.kind === 'sale' && dans('plat', 'street', 'soupe')(r),
    soupe: dans('soupe'),
    entree: (r) => r.kind === 'sale' && dans('entree', 'street')(r),
    plat: dans('plat'),
    douceur: (r) => r.kind === 'sucre' && dans('dessert', 'gateau', 'petit-dej')(r),
  }[creneau];
  return RECETTES.filter(regle);
}

// Remplit tous les jours en faisant tourner les recettes mélangées : pas deux fois le même plat de suite.
function remplir(type) {
  const melange = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
  const files = Object.fromEntries(CRENEAUX[type].map((c) => [c, melange(candidats(c))]));
  const decalage = { din: 3 };
  etat.plans[type] = Array.from({ length: NB_JOURS[type] }, (_, j) =>
    Object.fromEntries(CRENEAUX[type].map((c) => [c, files[c][(j + (decalage[c] || 0)) % files[c].length].id])),
  );
  sauver();
}

const partsPlan = (r) => (r.per === 'pcs' ? r.serves : etat.planParts || 4);

function joursAffiches(type) {
  if (type === 'semaine') return [0, 7];
  const debut = page.ramadan * 7;
  return [debut, Math.min(NB_JOURS.ramadan, debut + 7)];
}

function verrou(type) {
  return `<div class="page">
    ${entete(t(type === 'ramadan' ? 'planRamadan' : 'planSemaine'))}
    <div class="verrou">${ico('cadenas')}<h2>${esc(t('reserveA'))}</h2><p>${esc(t('reserveTexte'))}</p>
      ${etat.essai ? '' : `<button class="bouton large" data-a="essai">${esc(t('essayer', { n: CONFIG.essaiJours }))}</button>`}
      <a class="bouton contour large" href="#/offres">${esc(t('voirOffres'))}</a></div>
  </div>`;
}

export function plan(type) {
  if (!CRENEAUX[type]) type = 'semaine';
  if (!acces('plus')) return verrou(type);
  const jours = etat.plans[type];
  const titre = t(type === 'ramadan' ? 'planRamadan' : 'planSemaine');
  const autre = type === 'ramadan' ? 'semaine' : 'ramadan';
  const bascule = `<a class="lien" href="#/plan/${autre}">${esc(t(autre === 'ramadan' ? 'planRamadan' : 'planSemaine'))}</a>`;
  if (!jours) {
    return `<div class="page">${entete(titre)}${vide('calendrier', t('planVide'), t('reserveTexte'), `<button class="bouton" data-a="planRemplir" data-type="${type}">${esc(t('remplirAuto'))}</button>`)}<p class="centre">${bascule}</p></div>`;
  }
  const [debut, fin] = joursAffiches(type);
  const visibles = jours.slice(debut, fin);
  const total = visibles.reduce((s, j) => s + Object.values(j).reduce((x, id) => { const r = trouver(id); return r ? x + coutRecette(r, partsPlan(r), etat.devise, etat.prix) : x; }, 0), 0);
  const onglets =
    type === 'ramadan'
      ? `<div class="puces fixes">${[0, 1, 2, 3, 4].map((s) => puce('planPage', s, t('semaineN', { n: s + 1 }), page.ramadan === s)).join('')}</div>`
      : '';
  return `<div class="page">
    ${entete(titre)}
    ${onglets}
    <div class="plan-reglage">
      <span>${ico('parts')}${esc(t('personnes'))}</span>
      <div class="pas petit"><button class="rond" data-a="planParts" data-d="-1" aria-label="${esc(t('moins'))}">${ico('moins')}</button><output><b>${etat.planParts || 4}</b></output><button class="rond" data-a="planParts" data-d="1" aria-label="${esc(t('plus'))}">${ico('plus')}</button></div>
    </div>
    <ol class="plan">${visibles
      .map((j, k) => {
        const n = debut + k;
        return `<li><h3>${esc(type === 'ramadan' ? t('jourN', { n: n + 1 }) : t(`jour.${n}`))}</h3>
        ${CRENEAUX[type]
          .map((c) => {
            const r = j[c] && trouver(j[c]);
            return `<div class="creneau"><small>${esc(t(`creneau.${c}`))}</small>${r ? `<a href="#/r/${r.id}">${esc(tl(r.t))}</a>` : `<span class="rien">—</span>`}
            <button class="rond" data-a="planChanger" data-type="${type}" data-j="${n}" data-c="${c}" aria-label="${esc(t('choisir'))}">${ico('crayon')}</button></div>`;
          })
          .join('')}</li>`;
      })
      .join('')}</ol>
    <p class="total"><span>${esc(t('budgetPlan', { n: etat.planParts || 4 }))}</span><b>${prix(total)}</b></p>
    <button class="bouton large" data-a="planCourses" data-type="${type}">${ico('panier')}${esc(t('planVersCourses'))}</button>
    <button class="bouton contour large" data-a="planRemplir" data-type="${type}">${ico('relancer')}${esc(t('autresMenus'))}</button>
    <p class="centre">${bascule}</p>
  </div>`;
}

/* ---------- Actions ---------- */

export const actions = {
  soirTemps(el, e, app) { soir.minutes = Number(el.dataset.v); soir.idees = null; app.rafraichir(); },
  soirBudget(el, e, app) { soir.budget = Number(el.dataset.v); soir.idees = null; app.rafraichir(); },
  soirEnvie(el, e, app) { soir.envie = el.dataset.v; soir.idees = null; app.rafraichir(); },
  proposer(el, e, app) {
    soir.idees = ceSoir(RECETTES, { minutes: soir.minutes, budget: soir.budget, envie: soir.envie, frigo: soir.frigo ? etat.frigo : [], devise: etat.devise, perso: etat.prix });
    app.rafraichir();
    document.getElementById('idees')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
  frigoBascule(el) {
    const id = el.dataset.id;
    const i = etat.frigo.indexOf(id);
    if (i >= 0) etat.frigo.splice(i, 1);
    else etat.frigo.push(id);
    sauver();
    el.classList.toggle('actif', i < 0);
    el.setAttribute('aria-pressed', String(i < 0));
    document.getElementById('frigo-resultats').innerHTML = frigoResultats();
  },
  coursesParts(el, e, app) {
    const c = etat.courses.find((x) => x.id === el.dataset.id);
    if (!c) return;
    c.parts = Math.min(60, Math.max(1, c.parts + Number(el.dataset.d)));
    sauver();
    app.rafraichir();
  },
  coursesRetirer(el, e, app) {
    etat.courses = etat.courses.filter((x) => x.id !== el.dataset.id);
    sauver();
    app.rafraichir();
  },
  coursesVider(el, e, app) {
    etat.courses = [];
    etat.coches = {};
    etat.coursesLibres = [];
    sauver();
    app.rafraichir();
  },
  libreAjouter(el, e, app) {
    const champ = document.getElementById('article');
    const texte = champ?.value.trim();
    if (!texte) return;
    etat.coursesLibres.push({ texte, fait: false });
    sauver();
    app.rafraichir();
    document.getElementById('article')?.focus();
  },
  libreRetirer(el, e, app) {
    etat.coursesLibres.splice(Number(el.dataset.i), 1);
    sauver();
    app.rafraichir();
  },
  planRemplir(el, e, app) {
    remplir(el.dataset.type);
    app.rafraichir();
  },
  planPage(el, e, app) {
    page.ramadan = Number(el.dataset.v);
    app.rafraichir();
  },
  planParts(el, e, app) {
    etat.planParts = Math.min(20, Math.max(1, (etat.planParts || 4) + Number(el.dataset.d)));
    sauver();
    app.rafraichir();
  },
  planChanger(el) {
    const { type, j, c } = el.dataset;
    feuille(`<h2>${esc(t(`creneau.${c}`))}</h2><div class="choix-liste">
      ${candidats(c).map((r) => `<button data-a="planChoisir" data-type="${type}" data-j="${j}" data-c="${c}" data-id="${r.id}">${vignette(r)}<span>${esc(tl(r.t))}</span></button>`).join('')}
      <button data-a="planChoisir" data-type="${type}" data-j="${j}" data-c="${c}" data-id="">${ico('fermer')}<span>${esc(t('vider'))}</span></button>
    </div>`);
  },
  planChoisir(el, e, app) {
    const { type, j, c, id } = el.dataset;
    etat.plans[type][Number(j)][c] = id || null;
    sauver();
    fermerFeuille();
    app.rafraichir();
  },
  planCourses(el) {
    const type = el.dataset.type;
    const [debut, fin] = joursAffiches(type);
    let n = 0;
    for (const j of etat.plans[type].slice(debut, fin)) {
      for (const id of Object.values(j)) {
        const r = id && trouver(id);
        if (!r) continue;
        const deja = etat.courses.find((x) => x.id === id);
        if (deja) deja.parts += partsPlan(r);
        else etat.courses.push({ id, parts: partsPlan(r) });
        n += 1;
      }
    }
    sauver();
    toast(t('ajouteN', { n }));
  },
};

export const saisies = {
  frigoRecherche(el) {
    frigoRecherche = el.value;
    document.getElementById('frigo-choix').innerHTML = frigoChoix();
  },
};

export const changements = {
  soirFrigo(el) {
    soir.frigo = el.checked;
    soir.idees = null;
    document.getElementById('idees').innerHTML = '';
  },
  coche(el) {
    if (el.checked) etat.coches[el.dataset.id] = true;
    else delete etat.coches[el.dataset.id];
    sauver();
    el.closest('li').classList.toggle('fait', el.checked);
  },
  cocheLibre(el) {
    etat.coursesLibres[Number(el.dataset.i)].fait = el.checked;
    sauver();
    el.closest('li').classList.toggle('fait', el.checked);
  },
};

export { PLACARD, unite };
