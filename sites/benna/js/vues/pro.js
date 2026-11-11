// Atelier Pro (prix de revient, fiches produit, devis, commandes) et recettes personnelles.

import { t, tl, lang } from '../i18n.js';
import { etat, sauver, acces } from '../etat.js';
import { RECETTES } from '../data/index.js';
import { ico, esc, entete, vide, toast, prix, whatsapp, feuille, fermerFeuille, date } from '../ui.js';
import { coutRecette, prixDeRevient } from '../core.js';
import { trouver } from './recette.js';
import { CONFIG } from '../config.js';

/* ---------- Atelier Pro ---------- */

const nouvelleFiche = () => ({ id: `f${Date.now()}`, nom: '', recette: 'makrout', pieces: 30, matieres: 0, emballage: 10, frais: 200, heures: 2, taux: 400, marge: 40 });
let fiche = null; // fiche en cours d'édition

const matieresDe = (f) => {
  const r = f.recette && trouver(f.recette);
  if (!r || r.perso) return Number(f.matieres) || 0;
  return coutRecette(r, r.per === 'pcs' ? f.pieces : r.serves, etat.devise, etat.prix);
};

const calcul = (f) => prixDeRevient({ matieres: matieresDe(f), pieces: Number(f.pieces) || 1, emballage: Number(f.emballage) || 0, frais: Number(f.frais) || 0, heures: Number(f.heures) || 0, taux: Number(f.taux) || 0, marge: Number(f.marge) || 0 });

function resultat(f) {
  const c = calcul(f);
  const parts = [['matieres', c.parPiece.matieres], ['emballage', c.parPiece.emballage], ['frais', c.parPiece.frais], ['travail', c.parPiece.travail]];
  const somme = c.revient || 1;
  return `<div class="pro-resultat">
    <div class="pro-chiffres">
      <p><small>${esc(t('proRevient'))}</small><b>${prix(c.revient)}</b></p>
      <p class="fort"><small>${esc(t('proVente'))}</small><b>${prix(c.vente)}</b></p>
      <p><small>${esc(t('proBenefice'))}</small><b>${prix(c.benefice)}</b></p>
    </div>
    <div class="barre-parts" role="img" aria-label="${esc(t('proDetail'))}">${parts.map(([k, v]) => `<i class="p-${k}" style="width:${(v / somme) * 100}%"></i>`).join('')}</div>
    <ul class="legende">${parts.map(([k, v]) => `<li><i class="p-${k}"></i>${esc(t(`pro.c.${k}`))}<b>${prix(v)}</b></li>`).join('')}</ul>
    ${c.travail === 0 ? `<p class="conseil">${ico('idee')}${esc(t('proOubli'))}</p>` : ''}
  </div>`;
}

const champ = (cle, f, { pas = 1, suffixe = '' } = {}) =>
  `<label class="champ"><span>${esc(t(`pro.f.${cle}`))}</span><span class="saisie"><input type="number" inputmode="decimal" min="0" step="${pas}" value="${f[cle]}" data-s="proChamp" data-k="${cle}">${suffixe ? `<small>${esc(suffixe)}</small>` : ''}</span></label>`;

function editeur(f) {
  const r = f.recette && trouver(f.recette);
  const monnaie = etat.devise === 'DZD' ? (lang() === 'ar' ? 'دج' : 'DA') : '€';
  const options = [...RECETTES.filter((x) => x.per === 'pcs' || x.kind === 'sucre'), ...RECETTES.filter((x) => x.per !== 'pcs' && x.kind !== 'sucre')];
  return `<div class="page">
    ${entete(t('proFiche'))}
    <label class="champ large"><span>${esc(t('pro.f.nom'))}</span><input type="text" value="${esc(f.nom)}" data-s="proChamp" data-k="nom" maxlength="60" placeholder="${esc(t('proNomEx'))}"></label>
    <label class="champ large"><span>${esc(t('pro.f.recette'))}</span>
      <select data-c="proRecette"><option value="">${esc(t('proSansRecette'))}</option>${options.map((x) => `<option value="${x.id}" ${x.id === f.recette ? 'selected' : ''}>${esc(tl(x.t))}</option>`).join('')}</select></label>
    <div class="champs">
      ${champ('pieces', f)}
      ${r ? `<p class="champ"><span>${esc(t('pro.f.matieres'))}</span><b id="pro-matieres">${prix(matieresDe(f))}</b></p>` : champ('matieres', f, { pas: 10, suffixe: monnaie })}
      ${champ('emballage', f, { pas: 5, suffixe: monnaie })}
      ${champ('frais', f, { pas: 10, suffixe: monnaie })}
      ${champ('heures', f, { pas: 0.5, suffixe: t('h') })}
      ${champ('taux', f, { pas: 10, suffixe: monnaie })}
    </div>
    <label class="champ large"><span>${esc(t('pro.f.marge'))} : <b id="pro-marge">${f.marge} %</b></span><input type="range" min="0" max="150" step="5" value="${f.marge}" data-s="proChamp" data-k="marge"></label>
    <div id="pro-resultat">${resultat(f)}</div>
    <button class="bouton large" data-a="proEnregistrer">${ico('ok')}${esc(t('enregistrer'))}</button>
    <button class="bouton contour large" data-a="proDevis">${ico('message')}${esc(t('proDevis'))}</button>
    ${etat.pro.fiches.some((x) => x.id === f.id) ? `<button class="lien danger" data-a="proSupprimer">${esc(t('supprimer'))}</button>` : ''}
  </div>`;
}

const STATUTS = ['afaire', 'prete', 'livree'];

export function pro(sous) {
  if (!acces('pro')) {
    return `<div class="page">${entete(t('atelierPro'))}
      <div class="verrou">${ico('pro')}<h2>${esc(t('proAccroche'))}</h2><p>${esc(t('proTexte'))}</p>
      <ul class="regles">${[1, 2, 3, 4].map((i) => `<li>${ico('ok')}${esc(t(`pro.${i}`))}</li>`).join('')}</ul>
      ${etat.essai ? '' : `<button class="bouton large" data-a="essai">${esc(t('essayer', { n: CONFIG.essaiJours }))}</button>`}
      <a class="bouton contour large" href="#/offres">${esc(t('voirOffres'))}</a></div></div>`;
  }
  if (sous === 'fiche') {
    fiche ||= nouvelleFiche();
    return editeur(fiche);
  }
  const reste = etat.pro.commandes.filter((c) => c.statut !== 'livree').reduce((s, c) => s + Math.max(0, c.total - c.acompte), 0);
  return `<div class="page">
    ${entete(t('atelierPro'))}
    <section class="bloc">
      <div class="bloc-tete"><h2>${esc(t('proFiches'))}</h2><button class="bouton petit" data-a="proNouvelle">${ico('plus')}${esc(t('nouvelle'))}</button></div>
      ${
        etat.pro.fiches.length
          ? `<ul class="fiches">${etat.pro.fiches
              .map((f) => {
                const c = calcul(f);
                return `<li><button data-a="proOuvrir" data-id="${f.id}"><strong>${esc(f.nom || t('sansNom'))}</strong><small>${esc(t('proLot', { n: f.pieces }))} · ${esc(t('proRevient'))} ${prix(c.revient)}</small></button><b>${prix(c.vente)}</b></li>`;
              })
              .join('')}</ul>`
          : `<p class="note">${esc(t('proAucuneFiche'))}</p>`
      }
    </section>
    <section class="bloc">
      <div class="bloc-tete"><h2>${esc(t('proCommandes'))}</h2><button class="bouton petit" data-a="proCommande">${ico('plus')}${esc(t('nouvelle'))}</button></div>
      ${
        etat.pro.commandes.length
          ? `<ul class="commandes">${etat.pro.commandes
              .map(
                (c, i) => `<li class="s-${c.statut}"><div><strong>${esc(c.client)}</strong><small>${esc(c.quoi)}${c.pour ? ` · ${esc(date(c.pour))}` : ''}</small>
                <small>${prix(c.total)}${c.acompte ? ` · ${esc(t('proAcompte'))} ${prix(c.acompte)}` : ''}</small></div>
                <button class="pastille bouton-pastille" data-a="proStatut" data-i="${i}">${esc(t(`statut.${c.statut}`))}</button>
                <button class="rond" data-a="proCommandeRetirer" data-i="${i}" aria-label="${esc(t('retirer'))}">${ico('corbeille')}</button></li>`,
              )
              .join('')}</ul><p class="total"><span>${esc(t('proAEncaisser'))}</span><b>${prix(reste)}</b></p>`
          : `<p class="note">${esc(t('proAucuneCommande'))}</p>`
      }
    </section>
  </div>`;
}

/* ---------- Recettes personnelles ---------- */

// Sépare un texte collé (description d'une vidéo, message) en ingrédients et en étapes :
// une ligne courte qui commence par un nombre ou une puce est un ingrédient.
export function decouper(texte) {
  const ingredients = [];
  const etapes = [];
  for (const brute of String(texte || '').split(/\r?\n/)) {
    const ligne = brute.replace(/^[\s•*\-–—·✓✔▪◦]+/, '').trim();
    if (!ligne || /^https?:\/\//i.test(ligne)) continue;
    // Les intertitres (« Ingrédients : », « Préparation ») ne sont ni un ingrédient ni une étape.
    if (/^(ingr[ée]dients?|pr[ée]paration|[ée]tapes?|recette|ingredients?|method|steps?|instructions?|directions?|المكونات|المقادير|طريقة التحضير|التحضير)\s*:?$/i.test(ligne)) continue;
    const numerotee = /^\d+\s*[.)\]:-]\s+/.test(ligne);
    const quantite = /^(\d+([.,/]\d+)?|½|¼|¾|un|une|deux|trois|quelques|a|an|one|two)\b/i.test(ligne) || /^[٠-٩\d]+\s/.test(ligne);
    if (!numerotee && quantite && ligne.length < 70) ingredients.push(ligne);
    else if (!numerotee && brute !== ligne && ligne.length < 50) ingredients.push(ligne);
    else etapes.push(ligne.replace(/^\d+\s*[.)\]:-]\s+/, ''));
  }
  return { ingredients, etapes };
}

export function mesRecettes(sous) {
  if (sous === 'nouvelle') {
    const limite = !acces('plus') && etat.perso.length >= CONFIG.persoGratuites;
    if (limite) {
      return `<div class="page">${entete(t('nouvelleRecette'))}<div class="verrou">${ico('cadenas')}<h2>${esc(t('reserveA'))}</h2><p>${esc(t('persoLimite', { n: CONFIG.persoGratuites }))}</p><a class="bouton large" href="#/offres">${esc(t('voirOffres'))}</a></div></div>`;
    }
    return `<div class="page">
      ${entete(t('nouvelleRecette'))}
      <p class="intro">${esc(t('persoIntro'))}</p>
      <label class="champ large"><span>${esc(t('persoTitre'))}</span><input type="text" id="perso-titre" maxlength="80"></label>
      <label class="champ large"><span>${esc(t('persoLien'))}</span><input type="url" id="perso-lien" inputmode="url" placeholder="https://"></label>
      <label class="champ large"><span>${esc(t('persoParts'))}</span><input type="number" id="perso-parts" min="1" max="60" value="4" inputmode="numeric"></label>
      <button class="bouton contour large" data-a="persoColler">${ico('liste')}${esc(t('persoColler'))}</button>
      <label class="champ large"><span>${esc(t('ingredients'))}</span><small>${esc(t('persoUneParLigne'))}</small><textarea id="perso-ingredients" rows="6"></textarea></label>
      <label class="champ large"><span>${esc(t('preparation'))}</span><small>${esc(t('persoUneParLigne'))}</small><textarea id="perso-etapes" rows="7"></textarea></label>
      <button class="bouton large" data-a="persoEnregistrer">${ico('ok')}${esc(t('enregistrer'))}</button>
    </div>`;
  }
  return `<div class="page">
    ${entete(t('mesRecettes'), { droite: `<a class="rond plein" href="#/mes-recettes/nouvelle" aria-label="${esc(t('nouvelleRecette'))}">${ico('plus')}</a>` })}
    ${
      etat.perso.length
        ? `<ul class="fiches">${etat.perso.map((p) => `<li><a href="#/r/${p.id}"><strong>${esc(p.titre)}</strong><small>${esc(t('persoResume', { i: p.ingredients.length, e: p.etapes.length }))}</small></a><button class="rond" data-a="persoSupprimer" data-id="${p.id}" aria-label="${esc(t('supprimer'))}">${ico('corbeille')}</button></li>`).join('')}</ul>`
        : vide('crayon', t('persoVide'), t('persoVideTexte'), `<a class="bouton" href="#/mes-recettes/nouvelle">${esc(t('nouvelleRecette'))}</a>`)
    }
  </div>`;
}

/* ---------- Actions ---------- */

const lignesDe = (id) => (document.getElementById(id)?.value || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

export const actions = {
  proNouvelle(el, e, app) {
    fiche = nouvelleFiche();
    app.aller('#/pro/fiche');
  },
  proOuvrir(el, e, app) {
    fiche = { ...etat.pro.fiches.find((f) => f.id === el.dataset.id) };
    app.aller('#/pro/fiche');
  },
  proEnregistrer(el, e, app) {
    const i = etat.pro.fiches.findIndex((f) => f.id === fiche.id);
    if (i >= 0) etat.pro.fiches[i] = { ...fiche };
    else etat.pro.fiches.push({ ...fiche });
    sauver();
    toast(t('enregistre'));
    app.aller('#/pro');
  },
  proSupprimer(el, e, app) {
    etat.pro.fiches = etat.pro.fiches.filter((f) => f.id !== fiche.id);
    sauver();
    app.aller('#/pro');
  },
  proDevis() {
    const c = calcul(fiche);
    const nom = fiche.nom || (fiche.recette && tl(trouver(fiche.recette).t)) || t('sansNom');
    const texte = t('proDevisTexte', { nom, n: fiche.pieces, piece: prix(c.vente), total: prix(c.vente * fiche.pieces) });
    window.open(whatsapp(texte), '_blank', 'noopener');
  },
  proCommande() {
    feuille(`<h2>${esc(t('proCommandes'))}</h2>
      <label class="champ large"><span>${esc(t('cmd.client'))}</span><input type="text" id="cmd-client" maxlength="60"></label>
      <label class="champ large"><span>${esc(t('cmd.quoi'))}</span><input type="text" id="cmd-quoi" maxlength="80"></label>
      <label class="champ large"><span>${esc(t('cmd.pour'))}</span><input type="date" id="cmd-pour"></label>
      <div class="champs"><label class="champ"><span>${esc(t('cmd.total'))}</span><input type="number" id="cmd-total" min="0" inputmode="decimal"></label>
      <label class="champ"><span>${esc(t('proAcompte'))}</span><input type="number" id="cmd-acompte" min="0" inputmode="decimal"></label></div>
      <button class="bouton large" data-a="proCommandeAjouter">${esc(t('enregistrer'))}</button>`);
  },
  proCommandeAjouter(el, e, app) {
    const v = (id) => document.getElementById(id)?.value.trim() || '';
    if (!v('cmd-client')) return;
    etat.pro.commandes.unshift({ client: v('cmd-client'), quoi: v('cmd-quoi'), pour: v('cmd-pour'), total: Number(v('cmd-total')) || 0, acompte: Number(v('cmd-acompte')) || 0, statut: 'afaire' });
    sauver();
    fermerFeuille();
    app.rafraichir();
  },
  proStatut(el, e, app) {
    const c = etat.pro.commandes[Number(el.dataset.i)];
    c.statut = STATUTS[(STATUTS.indexOf(c.statut) + 1) % STATUTS.length];
    sauver();
    app.rafraichir();
  },
  proCommandeRetirer(el, e, app) {
    etat.pro.commandes.splice(Number(el.dataset.i), 1);
    sauver();
    app.rafraichir();
  },
  async persoColler() {
    let texte = '';
    try {
      texte = await navigator.clipboard.readText();
    } catch {
      texte = '';
    }
    if (!texte.trim()) {
      toast(t('persoPressePapier'));
      return;
    }
    const d = decouper(texte);
    document.getElementById('perso-ingredients').value = d.ingredients.join('\n');
    document.getElementById('perso-etapes').value = d.etapes.join('\n');
    toast(t('persoTrie'));
  },
  persoEnregistrer(el, e, app) {
    const titre = document.getElementById('perso-titre')?.value.trim();
    const etapes = lignesDe('perso-etapes');
    if (!titre || !etapes.length) {
      toast(t('persoIncomplet'));
      return;
    }
    const lien = document.getElementById('perso-lien')?.value.trim();
    const id = `p${Date.now()}`;
    etat.perso.push({ id, titre, lien: /^https?:\/\//i.test(lien) ? lien : '', serves: Math.max(1, Number(document.getElementById('perso-parts')?.value) || 4), ingredients: lignesDe('perso-ingredients'), etapes });
    sauver();
    toast(t('enregistre'));
    app.aller(`#/r/${id}`);
  },
  persoSupprimer(el, e, app) {
    etat.perso = etat.perso.filter((p) => p.id !== el.dataset.id);
    etat.favoris = etat.favoris.filter((id) => id !== el.dataset.id);
    sauver();
    app.rafraichir();
  },
};

export const saisies = {
  proChamp(el) {
    const k = el.dataset.k;
    fiche[k] = k === 'nom' ? el.value : Number(el.value) || 0;
    if (k === 'marge') document.getElementById('pro-marge').textContent = `${fiche.marge} %`;
    const m = document.getElementById('pro-matieres');
    if (m) m.textContent = prix(matieresDe(fiche));
    document.getElementById('pro-resultat').innerHTML = resultat(fiche);
  },
};

export const changements = {
  proRecette(el, e, app) {
    fiche.recette = el.value;
    const r = el.value && trouver(el.value);
    if (r) fiche.pieces = r.serves;
    app.rafraichir();
  },
};
