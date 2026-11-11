// Apprendre : parcours par niveaux, gestes en boucle, SOS cuisine, astuces.

import { t, tl } from '../i18n.js';
import { etat, acces, dejaCuisine } from '../etat.js';
import { GESTES, SOS, PARCOURS, ASTUCES, PAR_ID } from '../data/index.js';
import { ico, esc, entete, vignette, duree } from '../ui.js';
import { tempsActif } from '../core.js';
import { media } from './recette.js';

const ONGLETS = ['parcours', 'gestes', 'sos', 'astuces'];
const fait = (e) => (e[0] === 'r' ? dejaCuisine(e[1]) : etat.gestesVus.includes(e[1]));
const avancement = (p) => p.etapes.filter(fait).length;

function listeParcours() {
  return `<div class="parcours-liste">${PARCOURS.map((p) => {
    const n = avancement(p);
    const ferme = p.plus && !acces('plus');
    return `<a class="parcours-carte" href="#/parcours/${p.id}">
      <div><span class="etiquette">${esc(t(`niveau.${p.niveau}`))}</span>${ferme ? `<span class="etiquette or">${ico('cadenas')}Benna+</span>` : ''}</div>
      <h3>${esc(tl(p.t))}</h3>
      <p>${esc(tl(p.d))}</p>
      <div class="jauge"><i style="width:${Math.round((n / p.etapes.length) * 100)}%"></i></div>
      <small>${esc(t('etapesFaites', { n, total: p.etapes.length }))}</small>
    </a>`;
  }).join('')}</div>`;
}

function listeGestes() {
  return `<p class="intro">${esc(t('gestesIntro'))}</p><div class="gestes">${GESTES.map(
    (g) => `<button class="geste-carte" data-a="geste" data-id="${g.id}">
      ${media(g)}
      <span>${g.v ? ico('lecture') : ''}${esc(tl(g.t))}</span>
      ${etat.gestesVus.includes(g.id) ? `<i class="vu" aria-label="${esc(t('vu'))}">${ico('ok')}</i>` : ''}
    </button>`,
  ).join('')}</div>`;
}

function listeSos() {
  return `<p class="intro">${esc(t('sosIntro'))}</p>${['gateaux', 'pates', 'sale']
    .map(
      (cat) => `<h2 class="sos-cat">${esc(t(`sos.${cat}`))}</h2>${SOS.filter((s) => s.cat === cat)
        .map(
          (s) => `<details class="sos" id="sos-${s.id}">
        <summary>${esc(tl(s.t))}${ico('suivant', 'dir')}</summary>
        <dl>
          <dt>${esc(t('sosPourquoi'))}</dt><dd>${esc(tl(s.why))}</dd>
          <dt class="vert">${esc(t('sosRattraper'))}</dt><dd>${esc(tl(s.now))}</dd>
          <dt>${esc(t('sosProchaine'))}</dt><dd>${esc(tl(s.next))}</dd>
        </dl>
      </details>`,
        )
        .join('')}`,
    )
    .join('')}`;
}

const listeAstuces = () => `<ul class="astuces">${ASTUCES.map((a) => `<li>${ico('idee')}<p>${esc(tl(a))}</p></li>`).join('')}</ul>`;

export function apprendre(onglet) {
  const actif = ONGLETS.includes(onglet) ? onglet : 'parcours';
  const corps = { parcours: listeParcours, gestes: listeGestes, sos: listeSos, astuces: listeAstuces }[actif]();
  return `<div class="page">
    ${entete(t('nav.apprendre'), { retour: false })}
    <div class="onglets" role="tablist">${ONGLETS.map((o) => `<a role="tab" aria-selected="${o === actif}" class="${o === actif ? 'actif' : ''}" href="#/apprendre/${o}">${esc(t(`onglet.${o}`))}</a>`).join('')}</div>
    ${corps}
  </div>`;
}

export function parcours(id) {
  const p = PARCOURS.find((x) => x.id === id);
  if (!p) return apprendre('parcours');
  const ferme = p.plus && !acces('plus');
  const n = avancement(p);
  const prochaine = p.etapes.findIndex((e) => !fait(e));
  return `<div class="page">
    ${entete(tl(p.t))}
    <p class="intro">${esc(tl(p.d))}</p>
    <div class="jauge"><i style="width:${Math.round((n / p.etapes.length) * 100)}%"></i></div>
    <p class="note">${esc(t('etapesFaites', { n, total: p.etapes.length }))}</p>
    ${ferme ? `<div class="verrou">${ico('cadenas')}<h2>${esc(t('reserveA'))}</h2><p>${esc(t('parcoursReserve'))}</p><a class="bouton large" href="#/offres">${esc(t('voirOffres'))}</a></div>` : ''}
    <ol class="lecons ${ferme ? 'ferme' : ''}">${p.etapes
      .map(([type, cle], i) => {
        const ok = fait([type, cle]);
        const etatLecon = ok ? 'faite' : i === prochaine ? 'suivante' : '';
        if (type === 'g') {
          const g = GESTES.find((x) => x.id === cle);
          return `<li class="${etatLecon}"><span class="rang">${ok ? ico('ok') : i + 1}</span>
            <button class="lecon" data-a="geste" data-id="${g.id}" ${ferme ? 'disabled' : ''}><span class="lecon-img">${media(g)}</span><span><small>${esc(t('unGeste'))}</small><strong>${esc(tl(g.t))}</strong></span></button></li>`;
        }
        const r = PAR_ID[cle];
        return `<li class="${etatLecon}"><span class="rang">${ok ? ico('ok') : i + 1}</span>
          <a class="lecon" ${ferme ? '' : `href="#/r/${r.id}"`}><span class="lecon-img">${vignette(r)}</span><span><small>${esc(t('uneRecette'))} · ${duree(tempsActif(r))}</small><strong>${esc(tl(r.t))}</strong></span></a></li>`;
      })
      .join('')}</ol>
    <p class="note">${esc(t('parcoursRegle'))}</p>
  </div>`;
}
