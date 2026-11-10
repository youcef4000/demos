// Écritures par dossier, période et journal ; validation ; export Excel au modèle PC Compta (mémo 1, 01:05).
import { h, brut, monter, icone, da, periodeFr, sur, toast, fenetre, telechargerFichier, vide, montantSaisie } from '../ui.js';
import { choixDossier, blocEcriture, encadreHumain, JOURNAUX } from './commun.js';
import { lireMontant } from '../../noyau/format.js';

export default async function (el, ctx) {
  const { dossiers } = await ctx.c.appel('GET', `/dossiers?periode=${ctx.periode}`);
  const dossierId = ctx.q.dossierId || dossiers.find((d) => d.ecritures.proposees)?.id || dossiers[0]?.id;
  const journal = ctx.q.journal || '';
  const statut = ctx.q.statut || '';
  const q = new URLSearchParams({ dossierId, periode: ctx.periode, ...(journal ? { journal } : {}), ...(statut ? { statut } : {}) });
  const r = await ctx.c.appel('GET', `/ecritures?${q}`);
  const dossier = dossiers.find((d) => d.id === dossierId);
  const proposees = r.ecritures.filter((e) => e.statut === 'proposee');
  const exportables = r.ecritures.filter((e) => e.statut !== 'proposee' && e.source !== 'reprise');

  monter(
    el,
    h`<div class="filtres">
      ${choixDossier(dossiers, dossierId)}
      <div class="pastilles"><button class="pastille ${!statut ? 'actif' : ''}" data-statut="">Toutes</button><button class="pastille ${statut === 'proposee' ? 'actif' : ''}" data-statut="proposee">Proposées</button><button class="pastille ${statut === 'validee' ? 'actif' : ''}" data-statut="validee">Validées</button><button class="pastille ${statut === 'exportee' ? 'actif' : ''}" data-statut="exportee">Exportées</button></div>
    </div>
    <nav class="onglets" aria-label="Journaux"><button class="${!journal ? 'actif' : ''}" data-journal="">Tous les journaux</button>${Object.entries(JOURNAUX).map(([k, l]) => h`<button class="${journal === k ? 'actif' : ''}" data-journal="${k}">${k} · ${l.replace('Journal ', '').replace(/^de |^des /, '')}</button>`)}</nav>
    <div class="grille grille-2-1">
      <section class="carte">
        <div class="carte-tete"><h2>${dossier?.raisonSociale} — ${periodeFr(ctx.periode)}</h2><span class="actions">${proposees.length ? h`<button class="btn btn-primaire" data-valider>${icone('ok')} Valider la sélection (${proposees.length})</button>` : ''}</span></div>
        ${proposees.length ? encadreHumain("Écritures proposées par les règles du cabinet et, pour les lignes sans règle, par l'agent d'imputation. Décochez celles à revoir, corrigez si besoin, puis validez.") : ''}
        ${r.ecritures.length ? r.ecritures.map((e) => blocEcriture(e, { selection: true, modifiable: true })) : vide('Aucune écriture pour ce filtre.', 'livre')}
      </section>
      <aside>
        <section class="carte">
          <h2>Export vers PC Compta</h2>
          <p class="petit">Fichier Excel au format d'import du cabinet (${r.apercuExport.colonnes.map((c) => c.titre).join(', ')}). Seules les écritures <b>validées</b> partent. Dans PC Compta : importer le fichier dans les journaux, selon les paramètres d'import habituels.</p>
          <button class="btn btn-primaire btn-large" data-export ${exportables.length ? '' : brut('disabled')}>${icone('telecharger')} Télécharger l'Excel PC Compta</button>
          ${proposees.length ? h`<p class="tres-petit muet" style="margin-top:6px">${proposees.length} écriture(s) encore proposée(s) ne seront pas exportées.</p>` : ''}
          <hr><button class="btn btn-large" data-etat-achats>${icone('telecharger')} État des achats du mois (Excel)</button>
        </section>
        <section class="carte">
          <h2>Contrôle des journaux</h2>
          <table class="tableau"><thead><tr><th>Journal</th><th class="num">Débit</th><th class="num">Crédit</th></tr></thead><tbody>
          ${Object.entries(r.totaux).filter(([, t]) => t.debit || t.credit).map(([j, t]) => h`<tr><td><b>${j}</b> ${t.ok ? h`<span class="badge ok">équilibré</span>` : h`<span class="badge erreur">écart ${da(t.ecart)}</span>`}</td><td class="num">${da(t.debit)}</td><td class="num">${da(t.credit)}</td></tr>`)}
          </tbody></table>
        </section>
        ${r.apercuExport.lignes.length
          ? h`<section class="carte"><h2>Aperçu du fichier</h2><div class="table-defile"><table class="tableau petit"><thead><tr>${r.apercuExport.colonnes.map((c) => h`<th>${c.titre}</th>`)}</tr></thead><tbody>${r.apercuExport.lignes.slice(0, 12).map((l) => h`<tr>${l.map((v, i) => h`<td class="${['debit', 'credit', 'montant'].includes(r.apercuExport.colonnes[i].champ) ? 'num' : ''}">${typeof v === 'number' ? (v ? montantSaisie(v) : '') : /^\d{4}-\d{2}-\d{2}$/.test(v) ? v.split('-').reverse().join('/') : v}</td>`)}</tr>`)}</tbody></table></div><p class="tres-petit muet">${r.apercuExport.lignes.length} ligne(s) au total (12 premières affichées).</p></section>`
          : ''}
      </aside>
    </div>`,
  );

  const naviguer = (ch) => ctx.aller(`ecritures?${new URLSearchParams({ dossierId, ...(journal ? { journal } : {}), ...(statut ? { statut } : {}), ...ch })}`);
  sur(el, 'change', '[name=dossierId]', (e) => naviguer({ dossierId: e.target.value }));
  sur(el, 'click', '[data-journal]', (e, b) => naviguer({ journal: b.dataset.journal }));
  sur(el, 'click', '[data-statut]', (e, b) => naviguer({ statut: b.dataset.statut }));
  sur(el, 'click', '[data-valider]', async () => {
    const ids = [...el.querySelectorAll('.choix-ecriture:checked')].map((i) => i.value);
    if (!ids.length) return toast('Aucune écriture sélectionnée.', 'erreur');
    try {
      const v = await ctx.c.appel('POST', '/ecritures/valider', { ids });
      toast(`${v.validees} écriture(s) validée(s).`, 'ok');
    } catch (err) {
      toast(err.message, 'erreur');
    }
    ctx.rafraichir();
  });
  sur(el, 'click', '[data-export]', async () => {
    try {
      telechargerFichier(await ctx.c.telecharger(`/export/pccompta?dossierId=${dossierId}&periode=${ctx.periode}`));
      toast('Fichier PC Compta téléchargé ; les écritures passent « exportées ».', 'ok');
      ctx.rafraichir();
    } catch (err) {
      toast(err.message, 'erreur');
    }
  });
  sur(el, 'click', '[data-etat-achats]', async () => {
    try {
      telechargerFichier(await ctx.c.telecharger(`/export/etat-achats?dossierId=${dossierId}&periode=${ctx.periode}`));
    } catch (err) {
      toast(err.message, 'erreur');
    }
  });
  sur(el, 'click', '[data-modifier-ecriture]', async (e, b) => {
    const ec = r.ecritures.find((x) => x.id === b.dataset.modifierEcriture);
    const ligneHtml = (l = {}) => h`<tr data-l><td><input class="saisie" name="compte" value="${l.compte || ''}" list="plan-e" style="width:90px"></td><td><input class="saisie" name="libelle" value="${l.libelle || ''}"></td><td><input class="saisie" name="debit" value="${l.debit ? montantSaisie(l.debit) : ''}" inputmode="decimal" style="width:120px"></td><td><input class="saisie" name="credit" value="${l.credit ? montantSaisie(l.credit) : ''}" inputmode="decimal" style="width:120px"></td></tr>`;
    const res = await fenetre({
      titre: `Corriger l'écriture ${ec.journal} ${ec.numeroPiece}`,
      corps: h`<p class="petit muet">La somme des débits doit égaler celle des crédits.</p><div class="table-defile"><table class="lignes-fiche"><thead><tr><th>Compte</th><th>Libellé</th><th>Débit</th><th>Crédit</th></tr></thead><tbody id="lignes-e">${ec.lignes.map(ligneHtml)}${ligneHtml()}</tbody></table></div><datalist id="plan-e">${Object.entries(r.plan).map(([c, l]) => h`<option value="${c}">${l}</option>`)}</datalist>`,
      boutons: [{ libelle: 'Annuler', valeur: 'annuler' }, { libelle: 'Enregistrer', valeur: 'ok', classe: 'btn-primaire' }],
    });
    if (!res) return;
    const lignes = [...res.el.querySelectorAll('[data-l]')].map((tr) => ({ compte: tr.querySelector('[name=compte]').value, libelle: tr.querySelector('[name=libelle]').value, debit: lireMontant(tr.querySelector('[name=debit]').value) || 0, credit: lireMontant(tr.querySelector('[name=credit]').value) || 0 }));
    try {
      await ctx.c.appel('PUT', `/ecritures/${ec.id}`, { lignes });
      toast('Écriture corrigée.', 'ok');
      ctx.rafraichir();
    } catch (err) {
      toast(err.message, 'erreur');
    }
  });
}
