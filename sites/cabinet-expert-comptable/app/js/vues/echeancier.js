// Échéancier fiscal et social du mois, dossier par dossier (règles modifiables dans Paramètres → Échéancier).
import { h, brut, monter, icone, da, dateFr, periodeFr, badge, sur, toast, dateBloc, vide } from '../ui.js';
import { decalerPeriode, jourSemaine } from '../../noyau/format.js';

const pc = (p) => (/^\d{4}-\d{2}$/.test(p) ? periodeFr(p) : p);

export default async function (el, ctx) {
  const client = ctx.u.role === 'client';
  const mois = ctx.q.mois || ctx.moi.aujourdhui.slice(0, 7);
  const r = await ctx.c.appel('GET', `/echeances?mois=${mois}`);
  const parDate = new Map();
  for (const e of r.echeances) {
    if (!parDate.has(e.date)) parDate.set(e.date, []);
    parDate.get(e.date).push(e);
  }
  monter(
    el,
    h`<div class="filtres">
      <button class="btn btn-petit" data-mois="${decalerPeriode(mois, -1)}">← ${periodeFr(decalerPeriode(mois, -1))}</button>
      <b style="padding:0 8px">${periodeFr(mois)}</b>
      <button class="btn btn-petit" data-mois="${decalerPeriode(mois, 1)}">${periodeFr(decalerPeriode(mois, 1))} →</button>
      <span class="ecart"></span>${!client && ctx.u.role === 'associe' ? h`<a class="btn btn-petit btn-fantome" href="#/parametres?onglet=echeancier">${icone('reglages')} Modifier les règles</a>` : ''}
    </div>
    ${parDate.size
      ? [...parDate].map(([date, liste]) => h`<section class="carte">
          <div class="carte-tete">${dateBloc(date)}<div><h2>${jourSemaine(date)} ${dateFr(date)}</h2>${liste[0].avertissement ? h`<p class="petit" style="margin:0;color:var(--alerte)">${icone('attention')} ${liste[0].avertissement}</p>` : ''}</div></div>
          <div class="table-defile"><table class="tableau empile"><thead><tr><th>Échéance</th><th>Organisme</th>${client ? '' : h`<th>Dossier</th>`}<th>Période</th><th>État</th><th></th></tr></thead><tbody>
          ${liste.map((e) => h`<tr>
            <td class="titre" data-l="Échéance">${e.libelle}${e.verifie ? '' : h` <span class="badge" title="Date à confirmer auprès de l'organisme">à confirmer</span>`}</td>
            <td data-l="Organisme"><span class="badge ${e.organisme === 'DGI' ? 'primaire' : 'accent'}">${e.organisme}</span></td>
            ${client ? '' : h`<td data-l="Dossier">${e.dossier}</td>`}
            <td data-l="Période">${pc(e.periodeConcernee)}</td>
            <td data-l="État">${e.lien === 'g50' && e.statut && !['fait', 'a_faire', 'en_retard'].includes(e.statut) ? badge('echeance', e.statut) : badge('echeance', e.statut)}${e.montant != null ? h` <span class="petit">${da(e.montant)}</span>` : ''}</td>
            <td data-l="">${client ? '' : e.lien === 'g50' ? h`<a class="btn btn-petit" href="#/g50/${e.dossierId}">Ouvrir la G50</a>` : h`<button class="btn btn-petit ${e.fait ? 'btn-fantome' : ''}" data-suivi="${e.regleId}" data-dossier="${e.dossierId}" data-periode="${e.periodeConcernee}" data-fait="${e.fait ? '' : '1'}">${e.fait ? 'Rouvrir' : h`${icone('ok')} Fait`}</button>`}</td>
          </tr>`)}
          </tbody></table></div>
        </section>`)
      : h`<section class="carte">${vide('Aucune échéance ce mois-ci pour vos dossiers.', 'calendrier')}</section>`}
    <p class="tres-petit muet">Dates de base, modifiables par le cabinet. « À confirmer » : date à vérifier auprès de l'organisme (reports, lois de finances). Une échéance qui tombe un vendredi ou un samedi est signalée.</p>`,
  );
  sur(el, 'click', '[data-mois]', (e, b) => ctx.aller(`echeancier?mois=${b.dataset.mois}`));
  sur(el, 'click', '[data-suivi]', async (e, b) => {
    try {
      await ctx.c.appel('POST', '/echeances/suivi', { regleId: b.dataset.suivi, dossierId: b.dataset.dossier, periodeConcernee: b.dataset.periode, fait: Boolean(b.dataset.fait) });
    } catch (err) {
      toast(err.message, 'erreur');
    }
    ctx.rafraichir();
  });
}
