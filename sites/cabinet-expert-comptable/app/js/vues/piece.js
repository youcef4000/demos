// Une pièce : l'image à gauche, la fiche lue par l'agent à droite ; le collaborateur corrige puis valide.
// Valider la fiche fait proposer les écritures (règles fixes, agent d'imputation pour les lignes sans règle) ;
// les écritures restent « proposées » jusqu'à un second clic.
import { h, brut, monter, icone, da, dateFr, dateHeureFr, periodeFr, badge, sur, toast, fenetre, confirmer, montantSaisie } from '../ui.js';
import { TYPES_PIECE, NATURES, MODES_PAIEMENT, PLAN_COMPTES, blocEcriture, frise, encadreHumain } from './commun.js';
import { lireMontant, lireDate } from '../../noyau/format.js';
import { totaux } from '../../noyau/pieces.js';

const ETAPES = [['recue', 'Reçue'], ['a_valider', "Lue par l'agent"], ['validee', 'Fiche validée'], ['comptabilisee', 'Écritures validées'], ['exportee', 'Exportée PC Compta']];
const FACTURES = ['facture_achat', 'facture_vente', 'avoir'];

export default async function (el, ctx) {
  const [id] = ctx.params;
  let d = await ctx.c.appel('GET', `/pieces/${id}`);
  const client = ctx.u.role === 'client';
  const url = await ctx.c.urlFichier(d.piece.fichier);

  function dessiner() {
    const p = d.piece;
    const f = p.fiche || { typeDoc: p.type, lignes: [] };
    const modifiable = !client && p.statut === 'a_valider';
    const exportee = d.ecritures.length && d.ecritures.every((e) => e.statut === 'exportee');
    const etape = p.statut === 'comptabilisee' && exportee ? 'exportee' : p.statut === 'en_lecture' ? 'recue' : p.statut;
    const incertains = new Set(p.lecture?.incertains || []);
    const erreurs = new Set((p.controles || []).filter((c) => c.niveau === 'erreur').map((c) => c.code));
    const cl = (champ, code) => (incertains.has(champ) ? 'incertain' : erreurs.has(code || champ) ? 'en-erreur' : '');
    const dis = modifiable ? '' : 'disabled';
    const ch = (nom, lib, val, { classe = '', aide = '', type = 'text', mode = '' } = {}) => h`<label class="champ ${classe}"><span>${lib}</span><input name="${nom}" type="${type}" value="${val ?? ''}" ${brut(dis)} ${mode ? brut(`inputmode="${mode}"`) : ''}>${aide ? h`<small class="aide">${aide}</small>` : ''}</label>`;
    const sel = (nom, lib, val, options, classe = '') => h`<label class="champ ${classe}"><span>${lib}</span><select name="${nom}" ${brut(dis)}>${options.map(([v, l]) => h`<option value="${v}" ${String(v) === String(val ?? '') ? brut('selected') : ''}>${l}</option>`)}</select></label>`;
    const t = totaux(f);
    const imp = d.imputations || [];

    monter(
      el,
      h`<div class="ligne-actions ne-pas-imprimer" style="margin-bottom:12px">
        <a class="btn btn-fantome" href="#/pieces${client ? '' : `?statut=&dossierId=${p.dossierId}`}">${icone('retour')} ${client ? 'Mes pièces' : 'Pièces'}</a>
        <span class="ecart"></span>${badge('piece', p.statut)}
      </div>
      ${frise(ETAPES, etape)}
      <div class="piece-vue">
        <div class="piece-image">${url ? (p.fichier.mime === 'application/pdf' ? h`<iframe src="${url}" title="Pièce"></iframe>` : h`<img src="${url}" alt="Pièce déposée : ${p.fichier.nom}">`) : h`<p class="muet">Aperçu indisponible.</p>`}</div>
        <div>
          <section class="carte">
            <div class="carte-tete"><h2>${d.dossier.raisonSociale}</h2><span class="actions muet petit">${periodeFr(p.periode)}</span></div>
            <p class="petit muet">Déposée le ${dateHeureFr(p.recueLe)} ${p.source === 'client' ? 'par le client' : 'par le cabinet'} · ${p.fichier.nom}${p.commentaire ? h` · « ${p.commentaire} »` : ''}</p>
            ${p.statut === 'en_lecture' || p.statut === 'recue' ? h`<div class="encadre info">${icone('agent')}<p><span class="rond"></span> L'agent lit la pièce…</p></div>` : ''}
            ${p.lecture ? h`<div class="encadre ${p.lecture.confiance >= 0.8 ? 'info' : 'alerte'}">${icone('agent')}<div><p><b>Lue par l'agent ${p.lecture.agent ? '« lecture des pièces »' : ''}</b> le ${dateHeureFr(p.lecture.le)} · confiance ${Math.round((p.lecture.confiance || 0) * 100)} %${p.lecture.modele ? ` · ${p.lecture.modele}` : ''}</p>${(p.lecture.remarques || []).length ? h`<ul>${p.lecture.remarques.map((r) => h`<li>${r}</li>`)}</ul>` : ''}${incertains.size ? h`<p class="petit">Champs incertains surlignés : ${[...incertains].join(', ')}.</p>` : ''}</div></div>` : ''}
            ${p.statut === 'rejetee' ? h`<div class="encadre erreur">${icone('fermer')}<p>Pièce rejetée : ${p.motifRejet || 'sans motif'}.</p></div>` : ''}
          </section>
          <form class="carte" id="f-fiche">
            <div class="carte-tete"><h2>Fiche de la pièce</h2>${modifiable ? h`<span class="actions"><button type="button" class="btn btn-petit" data-relire>${icone('relire')} Relire avec l'agent</button></span>` : ''}</div>
            <div class="champs champs-2">
              ${sel('typeDoc', 'Type de pièce', f.typeDoc || p.type, Object.entries(TYPES_PIECE))}
              ${FACTURES.includes(f.typeDoc) ? sel('nature', "Nature de l'opération", f.nature, [['', '— à préciser —'], ...Object.entries(NATURES)], erreurs.has('nature') ? 'en-erreur' : '') : ''}
              ${ch('numero', 'Numéro', f.numero, { classe: cl('numero') })}
              ${ch('date', 'Date (JJ/MM/AAAA)', dateFr(f.date), { classe: cl('date') })}
            </div>
            ${f.typeDoc === 'etat_paie'
              ? h`<fieldset><legend>Totaux du mois (état de paie)</legend><div class="champs champs-3">
                  ${ch('paie.effectif', 'Effectif', f.paie?.effectif, { mode: 'numeric' })}
                  ${ch('paie.brut', 'Masse salariale brute', montantSaisie(f.paie?.brut), { mode: 'decimal' })}
                  ${ch('paie.cotisationsSalariales', 'Retenue CNAS (9 %)', montantSaisie(f.paie?.cotisationsSalariales), { mode: 'decimal' })}
                  ${ch('paie.irg', 'IRG retenu', montantSaisie(f.paie?.irg), { mode: 'decimal', aide: 'Repris dans la G50 du mois' })}
                  ${ch('paie.net', 'Net à payer', montantSaisie(f.paie?.net), { mode: 'decimal' })}
                  ${ch('paie.cotisationsPatronales', 'Charges patronales CNAS', montantSaisie(f.paie?.cotisationsPatronales), { mode: 'decimal' })}
                </div></fieldset>`
              : ''}
            ${FACTURES.includes(f.typeDoc) || f.typeDoc === 'piece_caisse'
              ? h`<fieldset><legend>${f.typeDoc === 'facture_vente' ? 'Émetteur (le dossier) et client' : 'Fournisseur et destinataire'}</legend><div class="champs champs-2">
                  ${ch('emetteur.nom', 'Émetteur', f.emetteur?.nom, { classe: cl('emetteur', 'tiers') })}
                  ${ch('emetteur.nif', "NIF de l'émetteur", f.emetteur?.nif, { classe: cl('nif', 'nif'), mode: 'numeric' })}
                  ${f.typeDoc === 'piece_caisse' ? '' : ch('destinataire.nom', 'Destinataire', f.destinataire?.nom)}
                  ${f.typeDoc === 'piece_caisse' ? '' : ch('destinataire.nif', 'NIF du destinataire', f.destinataire?.nif, { mode: 'numeric' })}
                </div>
                ${f.sens ? h`<p class="petit">Classée en <b>${f.sens === 'vente' ? 'vente' : 'achat'}</b> : ${f.sens === 'vente' ? "l'émetteur porte le NIF du dossier" : "le dossier est destinataire"} (règle fixe).</p>` : ''}</fieldset>
                <fieldset><legend>Lignes</legend>
                  <table class="lignes-fiche"><thead><tr><th>Libellé</th><th>Montant HT</th><th>TVA</th>${client ? '' : h`<th>Compte</th>`}${modifiable ? h`<th></th>` : ''}</tr></thead><tbody id="lignes">
                  ${(f.lignes || []).map((l, i) => h`<tr data-ligne>
                    <td><input name="libelle" value="${l.libelle || ''}" ${brut(dis)} aria-label="Libellé"></td>
                    <td class="etroit"><input name="montantHT" value="${montantSaisie(l.montantHT)}" inputmode="decimal" ${brut(dis)} aria-label="Montant HT"></td>
                    <td style="width:72px"><select name="tauxTVA" ${brut(dis)} aria-label="Taux de TVA">${[19, 9, 0].map((x) => h`<option value="${x}" ${Number(l.tauxTVA) === x ? brut('selected') : ''}>${x ? `${x} %` : 'Exo.'}</option>`)}</select></td>
                    ${client ? '' : h`<td class="compte"><input name="compte" list="plan" value="${l.compte || ''}" placeholder="${imp[i]?.compte ? `${imp[i].compte} (${imp[i].source === 'historique' ? 'historique' : imp[i].source === 'regle' ? 'mot-clé' : 'schéma'})` : imp[i]?.source === 'a_proposer' ? "agent à l'étape suivante" : ''}" ${brut(dis)} aria-label="Compte"></td>`}
                    ${modifiable ? h`<td><button type="button" class="btn btn-petit btn-fantome" data-suppr-ligne aria-label="Supprimer la ligne">${icone('fermer')}</button></td>` : ''}
                  </tr>`)}
                  </tbody></table>
                  ${modifiable ? h`<button type="button" class="btn btn-petit" data-ajout-ligne>${icone('plus')} Ajouter une ligne</button>` : ''}
                  <datalist id="plan">${Object.entries(PLAN_COMPTES).map(([c, l]) => h`<option value="${c}">${l}</option>`)}</datalist>
                </fieldset>`
              : ''}
            ${FACTURES.includes(f.typeDoc)
              ? h`<fieldset><legend>Totaux et règlement</legend><div class="champs champs-3">
                  ${ch('totalHT', 'Total HT imprimé', montantSaisie(f.totalHT), { classe: cl('totalHT', 'ht'), mode: 'decimal', aide: `Recalculé : ${da(t.ht)}` })}
                  ${ch('totalTVA', 'TVA imprimée', montantSaisie(f.totalTVA), { classe: cl('totalTVA', 'tva'), mode: 'decimal', aide: `Recalculée : ${da(t.tva)}` })}
                  ${ch('timbre', 'Droit de timbre', montantSaisie(f.timbre || 0), { mode: 'decimal' })}
                  ${ch('totalTTC', 'Total TTC imprimé', montantSaisie(f.totalTTC), { classe: cl('totalTTC', 'ttc'), mode: 'decimal', aide: `HT + TVA + timbre : ${da(t.ttc)}` })}
                  ${sel('modePaiement', 'Mode de paiement', f.modePaiement || 'a_terme', Object.entries(MODES_PAIEMENT))}
                  ${ch('datePaiement', 'Date du règlement', dateFr(f.datePaiement), { aide: 'Espèces → caisse ; chèque, virement, carte → banque' })}
                </div></fieldset>`
              : ['releve_bancaire', 'autre'].includes(f.typeDoc)
                ? h`<p class="petit muet">Pièce conservée comme justificatif : aucune écriture n'est générée.</p>`
                : ''}
            ${(p.controles || []).length ? h`<h3>Contrôles</h3><ul class="controles">${p.controles.map((c) => h`<li class="${c.niveau}">${c.message}</li>`)}</ul>` : p.statut !== 'en_lecture' ? h`<ul class="controles"><li class="ok">Contrôles passés : totaux, NIF, taux, période, doublon.</li></ul>` : ''}
            ${modifiable
              ? h`<div class="ligne-actions">
                  <button type="submit" class="btn btn-primaire" value="valider">${icone('ok')} Valider la fiche</button>
                  <button type="submit" class="btn" value="enregistrer">Enregistrer les corrections</button>
                  <span class="ecart"></span>
                  <button type="button" class="btn btn-danger" data-rejeter>Rejeter</button>
                </div>
                <p class="tres-petit muet" style="margin-top:8px">Valider la fiche fait proposer les écritures ; rien n'entre en comptabilité avant leur validation.</p>`
              : ''}
          </form>
          ${!client && d.ecritures.length
            ? h`<section class="carte">
                <div class="carte-tete"><h2>Écritures</h2><span class="actions">${d.ecritures.some((e) => e.statut === 'proposee') ? h`<button class="btn btn-primaire btn-petit" data-valider-ecritures>${icone('ok')} Valider les écritures</button>` : ''}</span></div>
                ${d.ecritures.map((e) => blocEcriture(e))}
                ${d.ecritures.some((e) => e.statut === 'proposee') ? encadreHumain("Écritures proposées : vérifiez les comptes, surtout ceux proposés par l'agent, puis validez. Seules les écritures validées partent dans l'export PC Compta.") : ''}
                ${!exportee ? h`<button class="btn btn-petit btn-fantome" data-rouvrir>${icone('relire')} Rouvrir la fiche</button>` : ''}
              </section>`
            : ''}
        </div>
      </div>`,
    );
  }
  dessiner();

  function lireFiche() {
    const form = el.querySelector('#f-fiche');
    const v = (n) => form.elements[n]?.value ?? '';
    const ancienne = d.piece.fiche || {};
    const typeDoc = v('typeDoc');
    const f = { ...ancienne, typeDoc, numero: v('numero').trim(), date: lireDate(v('date')) || '' };
    if (form.elements['emetteur.nom']) {
      f.emetteur = { ...(ancienne.emetteur || {}), nom: v('emetteur.nom').trim(), nif: v('emetteur.nif').trim() };
      if (form.elements['destinataire.nom']) f.destinataire = { ...(ancienne.destinataire || {}), nom: v('destinataire.nom').trim(), nif: v('destinataire.nif').trim() };
    }
    if (form.elements.nature) f.nature = v('nature');
    f.lignes = [...form.querySelectorAll('[data-ligne]')].map((tr, i) => {
      const ancienneL = (ancienne.lignes || [])[i] || {};
      const compte = tr.querySelector('[name=compte]')?.value.trim() || '';
      return { ...ancienneL, libelle: tr.querySelector('[name=libelle]').value.trim(), montantHT: lireMontant(tr.querySelector('[name=montantHT]').value) || 0, tauxTVA: Number(tr.querySelector('[name=tauxTVA]').value), compte: compte || undefined, ...(compte && compte !== ancienneL.compte ? { sourceCompte: 'manuel', justification: '' } : {}) };
    });
    if (form.elements.totalHT) {
      for (const k of ['totalHT', 'totalTVA', 'totalTTC', 'timbre']) f[k] = v(k) === '' ? null : lireMontant(v(k));
      f.timbre ||= 0;
      f.modePaiement = v('modePaiement');
      f.datePaiement = lireDate(v('datePaiement')) || '';
    }
    if (form.elements['paie.brut']) {
      f.paie = {};
      for (const k of ['brut', 'cotisationsSalariales', 'irg', 'net', 'cotisationsPatronales']) f.paie[k] = lireMontant(v(`paie.${k}`)) || 0;
      f.paie.effectif = Number(v('paie.effectif')) || 0;
    }
    return f;
  }

  const recharger = async () => {
    d = await ctx.c.appel('GET', `/pieces/${id}`);
    dessiner();
    ctx.rafraichirCompteurs();
  };

  sur(el, 'submit', '#f-fiche', async (e) => {
    e.preventDefault();
    const action = e.submitter?.value;
    const boutons = el.querySelectorAll('#f-fiche [type=submit]');
    boutons.forEach((b) => (b.disabled = true));
    try {
      await ctx.c.appel('PUT', `/pieces/${id}`, { fiche: lireFiche(), type: lireFiche().typeDoc });
      if (action === 'valider') {
        const r = await ctx.c.appel('POST', `/pieces/${id}/valider`);
        toast(r.ecritures.length ? `Fiche validée : ${r.ecritures.length} écriture(s) proposée(s), à vérifier.` : 'Fiche validée et rangée.', 'ok');
      } else toast('Corrections enregistrées, contrôles relancés.');
    } catch (err) {
      toast(err.message, 'erreur');
    }
    await recharger();
  });
  sur(el, 'change', '[name=typeDoc]', async () => {
    await ctx.c.appel('PUT', `/pieces/${id}`, { fiche: lireFiche(), type: lireFiche().typeDoc }).catch((err) => toast(err.message, 'erreur'));
    await recharger();
  });
  sur(el, 'click', '[data-ajout-ligne]', () => {
    const tr = el.querySelector('[data-ligne]')?.cloneNode(true);
    if (!tr) {
      d.piece.fiche = { ...lireFiche(), lignes: [{ libelle: '', montantHT: 0, tauxTVA: 19 }] };
      return dessiner();
    }
    tr.querySelectorAll('input').forEach((i) => (i.value = ''));
    el.querySelector('#lignes').append(tr);
  });
  sur(el, 'click', '[data-suppr-ligne]', (e, b) => {
    if (el.querySelectorAll('[data-ligne]').length > 1) b.closest('tr').remove();
  });
  sur(el, 'click', '[data-relire]', async (e, b) => {
    b.disabled = true;
    b.innerHTML = '<span class="rond"></span> Lecture…';
    try {
      await ctx.c.appel('POST', `/pieces/${id}/lire`);
      toast("Pièce relue par l'agent.", 'ok');
    } catch (err) {
      toast(err.message, 'erreur');
    }
    await recharger();
  });
  sur(el, 'click', '[data-rejeter]', async () => {
    const r = await fenetre({ titre: 'Rejeter la pièce', corps: h`<label class="champ"><span>Motif (visible par le client)</span><input name="motif" required placeholder="Ex. : photo illisible, merci de la reprendre"></label>`, boutons: [{ libelle: 'Annuler', valeur: 'annuler' }, { libelle: 'Rejeter', valeur: 'ok', classe: 'btn-danger' }] });
    if (!r) return;
    await ctx.c.appel('POST', `/pieces/${id}/rejeter`, { motif: r.donnees.motif });
    await recharger();
  });
  sur(el, 'click', '[data-valider-ecritures]', async () => {
    const ids = d.ecritures.filter((x) => x.statut === 'proposee').map((x) => x.id);
    const r = await ctx.c.appel('POST', '/ecritures/valider', { ids });
    toast(`${r.validees} écriture(s) validée(s) : prêtes pour l'export PC Compta.`, 'ok');
    await recharger();
  });
  sur(el, 'click', '[data-rouvrir]', async () => {
    if (!(await confirmer('Rouvrir la fiche ?', 'Les écritures non exportées de cette pièce sont supprimées ; la fiche repasse « à valider ».', 'Rouvrir'))) return;
    try {
      await ctx.c.appel('POST', `/pieces/${id}/rouvrir`);
    } catch (err) {
      toast(err.message, 'erreur');
    }
    await recharger();
  });

  // Lecture en cours : on attend l'agent
  let minuterie;
  const surveiller = () => {
    if (['en_lecture', 'recue'].includes(d.piece.statut)) minuterie = setTimeout(async () => {
      await recharger();
      surveiller();
    }, 1200);
  };
  surveiller();
  return () => clearTimeout(minuterie);
}
