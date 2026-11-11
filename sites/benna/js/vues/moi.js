// Profil, réglages, offres et activation, page des marques, à propos, carnet de prix.

import { t, lang } from '../i18n.js';
import { etat, sauver, stats, droits, calculerDroits, lireJeton, toutEffacer } from '../etat.js';
import { INGREDIENTS, RAYONS, GESTES } from '../data/index.js';
import { ico, esc, entete, toast, nomIngredient, whatsapp, date } from '../ui.js';
import { ecrirePrix, prixDe } from '../core.js';
import { CONFIG } from '../config.js';

const segment = (action, valeurs, actuel, libelle) => `<div class="segment" role="group">
  ${valeurs.map((v) => `<button data-a="${action}" data-v="${v}" data-m="${v}" data-l="${v}" class="${actuel === v ? 'actif' : ''}" aria-pressed="${actuel === v}">${esc(libelle(v))}</button>`).join('')}
</div>`;

function etatOffre() {
  if (droits.source === 'licence') return t('offreActive', { plan: droits.plan === 'pro' ? 'Benna Pro' : 'Benna+', date: date(droits.fin) });
  if (droits.source === 'essai') return t('offreEssai', { n: droits.essaiReste });
  return t('offreGratuit');
}

export function moi() {
  const s = stats();
  const lien = (href, icone, cle, badge = '') => `<a href="${href}">${ico(icone)}<span>${esc(t(cle))}</span>${badge}${ico('suivant', 'dir')}</a>`;
  return `<div class="page moi">
    ${entete(t('nav.moi'), { retour: false })}
    <section class="profil">
      <div class="toque">${ico('niveau')}</div>
      <div><small>${esc(t('niveauN', { n: s.niveau }))}</small><h2>${esc(t(`rang.${s.niveau}`))}</h2>
      <div class="jauge"><i style="width:${s.versSuivant}%"></i></div><small>${esc(t('xpVers', { n: 100 - s.versSuivant }))}</small></div>
    </section>
    <ul class="chiffres">
      <li><b>${s.cuisinees}</b><small>${esc(t('stat.cuisinees'))}</small></li>
      <li><b>${s.serie}</b><small>${esc(t('stat.serie'))}</small></li>
      <li><b>${etat.gestesVus.length}/${GESTES.length}</b><small>${esc(t('stat.gestes'))}</small></li>
    </ul>
    <a class="bandeau offre" href="#/offres"><span class="pastille or">${droits.plan === 'gratuit' ? 'Benna+' : droits.plan === 'pro' ? 'Pro' : 'Benna+'}</span><span><strong>${esc(t('offres'))}</strong><small>${esc(etatOffre())}</small></span>${ico('suivant', 'dir')}</a>
    <nav class="menu">
      ${lien('#/favoris', 'coeur', 'mesFavoris', etat.favoris.length ? `<b>${etat.favoris.length}</b>` : '')}
      ${lien('#/carnet', 'livre', 'monCarnet', etat.journal.length ? `<b>${etat.journal.length}</b>` : '')}
      ${lien('#/mes-recettes', 'crayon', 'mesRecettes', etat.perso.length ? `<b>${etat.perso.length}</b>` : '')}
      ${lien('#/pro', 'pro', 'atelierPro')}
      ${lien('#/prix', 'prix', 'carnetPrix')}
    </nav>
    <section class="bloc reglages">
      <h2>${esc(t('reglages'))}</h2>
      <p class="label">${esc(t('langue'))}</p>${segment('langue', ['fr', 'ar', 'en'], lang(), (v) => ({ fr: 'Français', ar: 'العربية', en: 'English' })[v])}
      <p class="label">${esc(t('mesures'))}</p>${segment('mesure', ['metric', 'maison', 'cups'], etat.mesure, (v) => t(`mesure.${v}`))}
      <p class="label">${esc(t('devise'))}</p>${segment('devise', ['DZD', 'EUR'], etat.devise, (v) => t(`devise.${v}`))}
      <p class="label">${esc(t('theme'))}</p>${segment('theme', ['auto', 'clair', 'sombre'], etat.theme, (v) => t(`theme.${v}`))}
    </section>
    <section class="bloc installer">
      <h2>${esc(t('installer'))}</h2>
      <p>${esc(t('installerTexte'))}</p>
      <button class="bouton contour large" data-a="installer" id="bouton-installer" hidden>${ico('installer')}${esc(t('installer'))}</button>
      <p class="note">${esc(t('installerIos'))}</p>
    </section>
    <nav class="menu">
      ${lien('#/partenaires', 'message', 'pourMarques')}
      ${lien('#/apropos', 'info', 'aPropos')}
    </nav>
    <button class="lien danger" data-a="effacer">${esc(t('effacer'))}</button>
  </div>`;
}

/* ---------- Offres ---------- */

const tarif = (plan) => {
  const p = CONFIG.prix[plan][etat.devise];
  return `<p class="tarif"><b>${ecrirePrix(p.mois, etat.devise, lang())}</b> ${esc(t('parMois'))}<small>${esc(t('ouAn', { prix: ecrirePrix(p.an, etat.devise, lang()) }))}</small></p>`;
};

const carteOffre = (plan, n) => {
  const nom = plan === 'pro' ? 'Benna Pro' : 'Benna+';
  return `<article class="offre ${plan}">
    <h2>${nom}</h2><p>${esc(t(`${plan}Texte`))}</p>
    ${tarif(plan)}
    <ul>${Array.from({ length: n }, (_, i) => `<li>${ico('ok')}${esc(t(`${plan}.${i + 1}`))}</li>`).join('')}</ul>
    <a class="bouton large" href="${whatsapp(t('demandeTexte', { plan: nom }), CONFIG.whatsapp)}" target="_blank" rel="noopener noreferrer">${ico('message')}${esc(t('demander', { plan: nom }))}</a>
  </article>`;
};

export function offres() {
  return `<div class="page">
    ${entete(t('offres'))}
    <p class="intro">${esc(etatOffre())}${droits.nom ? ` ${esc(t('licenceDe', { nom: droits.nom }))}` : ''}</p>
    <p class="note">${esc(t('gratuitReste'))}</p>
    ${!etat.essai ? `<button class="bouton large" data-a="essai">${esc(t('essayer', { n: CONFIG.essaiJours }))}</button>` : ''}
    ${carteOffre('plus', 4)}
    ${carteOffre('pro', 4)}
    <section class="bloc"><h2>${esc(t('commentPayer'))}</h2><ol class="pas-a-pas">${[1, 2, 3].map((i) => `<li>${esc(t(`payer.${i}`))}</li>`).join('')}</ol></section>
    <section class="bloc"><h2>${esc(t('jaiUnCode'))}</h2>
      <div class="ajout"><input type="text" id="code" placeholder="${esc(t('collerCode'))}" aria-label="${esc(t('collerCode'))}" autocomplete="off" autocapitalize="off" spellcheck="false" data-entree="activerCode"><button class="bouton" data-a="activerCode">${esc(t('activer'))}</button></div>
    </section>
  </div>`;
}

// Active un jeton reçu par lien (#/activer/<jeton>) ou collé dans le champ.
export async function activer(jeton, app) {
  const propre = String(jeton || '').trim().split('#/activer/').pop();
  const contenu = await lireJeton(propre);
  if (!contenu || contenu.x < new Date().toISOString().slice(0, 10)) {
    toast(t('codeFaux'));
    return false;
  }
  etat.licence = propre;
  sauver();
  await calculerDroits();
  toast(t('codeBon'));
  app.aller('#/offres');
  return true;
}

/* ---------- Pour les marques ---------- */

export function partenaires() {
  return `<div class="page">
    ${entete(t('pourMarques'))}
    <p class="intro">${esc(t('pmIntro'))}</p>
    <div class="formats">${[1, 2, 3, 4].map((i) => `<article><span class="num">${i}</span><h3>${esc(t(`pm.${i}.t`))}</h3><p>${esc(t(`pm.${i}.x`))}</p></article>`).join('')}</div>
    <section class="bloc"><h2>${esc(t('pmRegles'))}</h2><ul class="regles">${[1, 2, 3].map((i) => `<li>${ico('ok')}${esc(t(`pmRegle.${i}`))}</li>`).join('')}</ul></section>
    <a class="bouton large" href="${whatsapp(t('pmMessage'), CONFIG.whatsapp)}" target="_blank" rel="noopener noreferrer">${ico('message')}${esc(t('pmBouton'))}</a>
  </div>`;
}

export function apropos() {
  return `<div class="page">
    ${entete(t('aPropos'))}
    <div class="texte">${[1, 2, 3, 4, 5].map((i) => `<p>${esc(t(`ap.${i}`))}</p>`).join('')}
    <p class="note">${esc(CONFIG.nom)} ${esc(CONFIG.version)} · <a href="https://bornzstudio.com" target="_blank" rel="noopener noreferrer">Bornz Studio</a></p></div>
  </div>`;
}

/* ---------- Carnet de prix ---------- */

export function carnetPrix() {
  const perso = etat.prix[etat.devise] || {};
  return `<div class="page">
    ${entete(t('carnetPrix'))}
    <p class="intro">${esc(t('prixIntro'))}</p>
    ${segment('devise', ['DZD', 'EUR'], etat.devise, (v) => t(`devise.${v}`))}
    ${RAYONS.map(
      (rayon) => `<section class="rayon"><h3>${esc(t(`rayon.${rayon}`))}</h3><ul class="prix-liste">${Object.values(INGREDIENTS)
        .filter((i) => i.rayon === rayon && i.id !== 'eau')
        .map(
          (i) => `<li class="${perso[i.id] != null ? 'modifie' : ''}"><label for="p-${i.id}">${esc(nomIngredient(i.id))}<small>${esc(t(`per.${i.per}`))}</small></label>
          <input id="p-${i.id}" type="number" inputmode="decimal" min="0" step="${etat.devise === 'DZD' ? 5 : 0.05}" value="${prixDe(i.id, etat.devise, etat.prix)}" data-c="prixIngredient" data-id="${i.id}"></li>`,
        )
        .join('')}</ul></section>`,
    ).join('')}
    <button class="bouton contour large" data-a="prixDefaut">${ico('relancer')}${esc(t('reinitialiser'))}</button>
  </div>`;
}

/* ---------- Actions ---------- */

export const actions = {
  theme(el, e, app) {
    etat.theme = el.dataset.v;
    sauver();
    app.theme();
    app.rafraichir();
  },
  devise(el, e, app) {
    etat.devise = el.dataset.v;
    sauver();
    app.rafraichir();
  },
  async essai(el, e, app) {
    if (!etat.essai) {
      etat.essai = new Date().toISOString();
      sauver();
      await calculerDroits();
      toast(t('essaiLance', { n: CONFIG.essaiJours }));
    }
    app.rafraichir();
  },
  activerCode(el, e, app) {
    activer(document.getElementById('code')?.value, app);
  },
  installer(el, e, app) {
    app.installer();
  },
  async effacer(el, e, app) {
    if (!window.confirm(t('effacerConfirm'))) return;
    const l = etat.lang;
    toutEffacer();
    etat.lang = l;
    sauver();
    await calculerDroits();
    toast(t('efface'));
    app.langue();
  },
  prixDefaut(el, e, app) {
    etat.prix[etat.devise] = {};
    sauver();
    app.rafraichir();
  },
};

export const changements = {
  prixIngredient(el) {
    const id = el.dataset.id;
    const v = parseFloat(el.value);
    etat.prix[etat.devise] ||= {};
    if (!Number.isFinite(v) || v < 0 || v === INGREDIENTS[id].p[etat.devise]) delete etat.prix[etat.devise][id];
    else etat.prix[etat.devise][id] = v;
    sauver();
    el.closest('li').classList.toggle('modifie', etat.prix[etat.devise][id] != null);
  },
};
