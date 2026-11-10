// Éléments d'écran partagés : choix du dossier, écritures, frise des étapes, montants.
import { h, brut, icone, da, dateFr, badge } from '../ui.js';
import { JOURNAUX, PLAN_COMPTES, NATURES, MODES_PAIEMENT } from '../../noyau/scf.js';
import { TYPES_PIECE } from '../../noyau/pieces.js';

export { JOURNAUX, PLAN_COMPTES, NATURES, MODES_PAIEMENT, TYPES_PIECE };

export function choixDossier(dossiers, choisi, { tous = false, nom = 'dossierId' } = {}) {
  return h`<select name="${nom}" class="saisie" aria-label="Dossier">${tous ? h`<option value="">Tous les dossiers</option>` : ''}${dossiers.map((d) => h`<option value="${d.id}" ${d.id === choisi ? brut('selected') : ''}>${d.raisonSociale}</option>`)}</select>`;
}

export const montant = (c, opts) => h`<span class="montant">${da(c, opts)}</span>`;

export function frise(etapes, courante) {
  const i = etapes.findIndex((e) => e[0] === courante);
  return h`<ol class="etapes">${etapes.map(([cle, lib], k) => h`<li class="${k < i ? 'fait' : k === i ? 'encours' : ''}">${lib}</li>`)}</ol>`;
}

export function blocEcriture(e, { selection = false, modifiable = false } = {}) {
  const libelleCompte = (c) => PLAN_COMPTES[c] || PLAN_COMPTES[String(c).slice(0, 3)] || '';
  return h`<div class="ecriture">
    <div class="ecriture-tete">
      ${selection && e.statut === 'proposee' ? h`<input type="checkbox" class="choix-ecriture" value="${e.id}" checked aria-label="Sélectionner l'écriture">` : ''}
      <span class="badge primaire">${e.journal}</span><b>${dateFr(e.date)}</b><span class="muet">${e.numeroPiece}</span><span>${e.libelle}</span>
      <span class="ecart"></span>
      ${e.source === 'agent' ? h`<span class="badge agent">${icone('agent')} compte proposé par l'agent</span>` : e.source === 'agent_corrige' ? h`<span class="badge agent">compte de l'agent corrigé</span>` : e.source === 'reprise' ? h`<span class="badge">historique PC Compta</span>` : ''}
      ${badge('ecriture', e.statut)}
      ${modifiable && e.statut === 'proposee' ? h`<button class="btn btn-petit btn-fantome" data-modifier-ecriture="${e.id}">${icone('crayon')} Corriger</button>` : ''}
    </div>
    <table><tbody>${e.lignes.map((l) => h`<tr><td class="compte mono">${l.compte}</td><td>${l.libelle}<span class="sous muet tres-petit">${libelleCompte(l.compte)}</span></td><td class="num">${l.debit ? da(l.debit) : ''}</td><td class="num">${l.credit ? da(l.credit) : ''}</td></tr>`)}</tbody></table>
    ${e.justification && (e.source === 'agent' || e.source === 'agent_corrige') ? h`<div class="justif">${icone('agent')} ${e.justification}</div>` : ''}
  </div>`;
}

export function encadreHumain(texte) {
  return h`<div class="encadre humain">${icone('bouclier')}<p>${texte}</p></div>`;
}

export function libelleTiers(p) {
  const f = p.fiche || {};
  if (f.typeDoc === 'facture_vente') return f.destinataire?.nom || '';
  if (f.typeDoc === 'etat_paie') return `${f.paie?.effectif || '—'} salarié(s)`;
  return f.emetteur?.nom || p.fichier?.nom || '';
}

export function ttcPiece(p) {
  const f = p.fiche || {};
  if (f.typeDoc === 'etat_paie') return f.paie?.brut ?? null;
  return f.totalTTC ?? null;
}

export const confiance = (p) => (p.lecture?.agent ? h`<span class="badge ${p.lecture.confiance >= 0.8 ? 'ok' : p.lecture.confiance >= 0.6 ? 'alerte' : 'erreur'}" title="Confiance de lecture de l'agent">${Math.round((p.lecture.confiance || 0) * 100)} %</span>` : h`<span class="muet">—</span>`);
