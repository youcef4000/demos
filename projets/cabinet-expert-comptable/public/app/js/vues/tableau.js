// Tableau de bord du cabinet : le mois en cours, dossier par dossier.
import { h, monter, icone, da, dateFr, periodeFr, badge, dateBloc, sur } from '../ui.js';
import { encadreHumain } from './commun.js';
import { jourSemaine } from '../../noyau/format.js';

const pc = (p) => (/^\d{4}-\d{2}$/.test(p) ? periodeFr(p) : p);
function groupes(echeances) {
  const m = new Map();
  for (const e of echeances) {
    const k = `${e.date}|${e.regleId}`;
    if (!m.has(k)) m.set(k, { date: e.date, libelle: e.libelle.split(' : ')[0].split(' (')[0], organisme: e.organisme, periode: pc(e.periodeConcernee), dossiers: [], retard: false });
    const g = m.get(k);
    g.dossiers.push(e.dossier.replace(/^(SARL|EURL|SPA|SNC) /, ''));
    g.retard ||= e.statut === 'en_retard';
  }
  return [...m.values()];
}

export default async function (el, ctx) {
  const t = await ctx.c.appel('GET', `/tableau?periode=${ctx.periode}`);
  const i = t.indicateurs;
  const js = jourSemaine(t.dateLimiteG50);
  monter(
    el,
    h`<p class="sous-titre">Bonjour ${ctx.u.nom.split(' ')[0]}. Période de travail : <b>${periodeFr(t.periode)}</b> — G50 à déposer et payer au plus tard le <b>${js} ${dateFr(t.dateLimiteG50)}</b>${js === 'vendredi' ? ' (prévoir le jeudi)' : ''}.</p>
    <div class="kpis">
      <a class="kpi" href="#/pieces?statut=a_valider"><small>Pièces lues par l'agent, à valider</small><b>${i.piecesAValider}</b><span>Relire et valider les fiches</span></a>
      <a class="kpi" href="#/ecritures?statut=proposee"><small>Écritures proposées</small><b>${i.ecrituresProposees}</b><span>Avant export vers PC Compta</span></a>
      <a class="kpi" href="#/envois"><small>Messages à valider</small><b>${i.envoisAValider}</b><span>Relances et montants G50</span></a>
      <a class="kpi accent" href="#/g50"><small>G50 ${periodeFr(t.periode)}</small><b>${i.g50.deposees} / ${i.dossiers}</b><span>déposées · ${i.g50.validees} validée(s) · ${i.g50.preparees} à valider</span></a>
    </div>
    <section class="carte">
        <div class="carte-tete"><h2>Dossiers du mois</h2><span class="actions"><a class="btn btn-petit" href="#/relances">${icone('cloche')} Relances</a></span></div>
        <div class="table-defile"><table class="tableau empile"><thead><tr><th>Dossier</th><th>Pièces</th><th>Manquantes</th><th>Écritures</th><th>G50</th><th class="num">À payer</th></tr></thead><tbody>
        ${t.dossiers.map((d) => h`<tr class="cliquable" data-dossier="${d.id}">
          <td class="titre" data-l="Dossier"><b>${d.raisonSociale}</b><span class="sous">${d.collaborateur} · ${d.wilaya}</span></td>
          <td data-l="Pièces">${d.pieces.total}${d.pieces.aValider ? h` <span class="badge alerte">${d.pieces.aValider} à valider</span>` : ''}</td>
          <td data-l="Manquantes">${d.manquantes.length ? h`<span class="badge erreur" title="${d.manquantes.join(', ')}">${d.manquantes.length} manquante(s)</span>` : h`<span class="badge ok">Complet</span>`}</td>
          <td data-l="Écritures">${d.ecritures.proposees ? h`<span class="badge alerte">${d.ecritures.proposees} proposée(s)</span>` : h`<span class="muet">${d.ecritures.validees} validée(s)</span>`}</td>
          <td data-l="G50">${d.g50 ? badge('g50', d.g50.statut) : h`<span class="badge">À préparer</span>`}</td>
          <td class="num" data-l="À payer">${d.g50 ? da(d.g50.total) : '—'}</td>
        </tr>`)}
        </tbody></table></div>
      </section>
      <div class="grille grille-2">
        <section class="carte">
          <div class="carte-tete"><h2>Prochaines échéances</h2><span class="actions"><a class="btn btn-petit btn-fantome" href="#/echeancier">Tout voir</a></span></div>
          <ul class="liste">${groupes(t.echeances).slice(0, 6).map((g) => h`<li>${dateBloc(g.date)}<div class="corps"><b>${g.libelle}</b><span>${g.organisme} · ${g.periode} · ${g.dossiers.length} dossier(s) : ${g.dossiers.join(', ')}</span></div>${g.retard ? badge('echeance', 'en_retard') : ''}</li>`)}</ul>
        </section>
        <section class="carte">
          <h2>Agents IA — dernières lectures</h2>
          <ul class="liste">${t.activiteAgents.length ? t.activiteAgents.map((j) => h`<li><span class="avatar" style="background:#efe9fb;color:#5b3aa8">${icone('agent')}</span><div class="corps"><b>${j.objet}</b><span>${j.details} · ${dateFr(j.le)}</span></div></li>`) : h`<li class="muet">Aucune lecture récente.</li>`}</ul>
          ${encadreHumain("Les agents lisent et proposent. Valider une fiche, une écriture, une G50 ou envoyer un message reste un clic d'un membre du cabinet.")}
        </section>
      </div>`,
  );
  sur(el, 'click', '[data-dossier]', (e, tr) => ctx.aller(`dossiers/${tr.dataset.dossier}`));
}
