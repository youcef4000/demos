// G50 du mois (mémo 2) : préparée par le workflow, validée par l'associé, déposée à la main sur Jibaya'tic
// ou au guichet. Aucune transmission automatique à la DGI.
import { h, brut, monter, icone, da, dateFr, periodeFr, badge, sur, toast, fenetre, confirmer, telechargerFichier, vide, montantSaisie } from '../ui.js';
import { frise, encadreHumain } from './commun.js';
import { lignesG50 } from '../../noyau/g50.js';
import { jourSemaine, decalerPeriode } from '../../noyau/format.js';

const ETAPES = [['a_preparer', 'À préparer'], ['preparee', 'Préparée'], ['validee', "Validée par l'associé"], ['deposee', 'Déposée et payée']];

export default async function (el, ctx) {
  const [dossierId] = ctx.params;
  if (ctx.u.role === 'client') return vueClient(el, ctx);
  if (dossierId) return detail(el, ctx, dossierId);
  const [{ dossiers }, { declarations }] = await Promise.all([ctx.c.appel('GET', `/dossiers?periode=${ctx.periode}`), ctx.c.appel('GET', `/declarations?periode=${ctx.periode}`)]);
  const total = declarations.reduce((s, d) => s + d.calcul.total, 0);
  monter(
    el,
    h`<p class="sous-titre">G50 de ${periodeFr(ctx.periode)} — préparées automatiquement à partir des pièces validées, validées par l'associé, puis saisies sur Jibaya'tic ou au guichet.</p>
    <section class="carte">
      <div class="table-defile"><table class="tableau empile"><thead><tr><th>Dossier</th><th>Statut</th><th class="num">TVA nette</th><th class="num">IRG salaires</th><th class="num">Timbre</th><th class="num">Crédit reporté</th><th class="num">Total à payer</th><th>Date limite</th></tr></thead><tbody>
      ${dossiers.map((d) => {
        const g = declarations.find((x) => x.dossierId === d.id);
        const c = g?.calcul;
        return h`<tr class="cliquable" data-dossier="${d.id}">
          <td class="titre" data-l="Dossier"><b>${d.raisonSociale}</b><span class="sous">${d.collaborateur}${d.manquantes.length ? ` · ${d.manquantes.length} pièce(s) manquante(s)` : ''}${d.pieces.aValider ? ` · ${d.pieces.aValider} pièce(s) à valider` : ''}</span></td>
          <td data-l="Statut">${g ? badge('g50', g.statut) : h`<span class="badge">À préparer</span>`}</td>
          <td class="num" data-l="TVA nette">${c ? da(c.tva.tvaNette) : '—'}</td>
          <td class="num" data-l="IRG">${c ? da(c.irg.montant) : '—'}</td>
          <td class="num" data-l="Timbre">${c ? da(c.timbre) : '—'}</td>
          <td class="num" data-l="Crédit">${c?.tva.creditAReporter ? da(c.tva.creditAReporter) : '—'}</td>
          <td class="num" data-l="Total"><b>${c ? da(c.total) : '—'}</b></td>
          <td data-l="Date limite">${dateFr(c?.dateLimite || `${decalerPeriode(ctx.periode, 1)}-20`)}</td>
        </tr>`;
      })}
      </tbody><tfoot><tr><td colspan="6">Total des G50 préparées</td><td class="num">${da(total)}</td><td></td></tr></tfoot></table></div>
    </section>
    ${encadreHumain("La G50 est préparée par le workflow, jamais transmise automatiquement : l'associé la valide, puis elle est saisie sur Jibaya'tic ou déposée au guichet à partir de l'écran « prête à saisir ».")}`,
  );
  sur(el, 'click', '[data-dossier]', (e, tr) => ctx.aller(`g50/${tr.dataset.dossier}`));
}

function tableauLignes(calcul) {
  return h`<table class="tableau"><thead><tr><th>Rubrique</th><th>Ligne de la G50</th><th class="num">Montant</th></tr></thead><tbody>${lignesG50(calcul).map((l) => h`<tr class="${l.final ? 'final' : l.total ? 'total' : ''}"><td>${l.rubrique}</td><td>${l.libelle}</td><td class="num">${da(l.montant)}</td></tr>`)}</tbody></table>`;
}

async function detail(el, ctx, dossierId) {
  const r = await ctx.c.appel('GET', `/dossiers/${dossierId}?periode=${ctx.periode}`);
  const g = r.declaration;
  const d = r.dossier;
  const associe = ctx.u.role === 'associe';
  const c = g?.calcul;
  const js = c ? jourSemaine(c.dateLimite) : '';
  monter(
    el,
    h`<div class="ligne-actions ne-pas-imprimer" style="margin-bottom:12px"><a class="btn btn-fantome" href="#/g50">${icone('retour')} Toutes les G50</a><span class="ecart"></span>${g ? badge('g50', g.statut) : ''}</div>
    ${frise(ETAPES, g?.statut || 'a_preparer')}
    <div class="grille grille-2-1">
      <div>
        <section class="carte">
          <div class="carte-tete"><h2>G50 — ${d.raisonSociale} — ${periodeFr(ctx.periode)}</h2></div>
          <p class="petit muet">NIF ${d.nif} · AI ${d.ai} · ${d.centreImpots}${c ? h` · date limite <b>${js} ${dateFr(c.dateLimite)}</b>` : ''}</p>
          ${!g ? h`<div class="encadre info">${icone('info')}<p>G50 pas encore préparée. ${d.pieces.aValider ? `${d.pieces.aValider} pièce(s) restent à valider. ` : ''}${d.manquantes.length ? `Pièces manquantes : ${d.manquantes.join(', ')}.` : ''}</p></div>` : ''}
          ${c ? tableauLignes(c) : ''}
          ${c?.alertes.length ? h`<div class="encadre alerte" style="margin-top:12px">${icone('attention')}<ul>${c.alertes.map((a) => h`<li>${a}</li>`)}</ul></div>` : ''}
          <div class="ligne-actions ne-pas-imprimer" style="margin-top:12px">
            ${!g || g.statut === 'preparee' ? h`<button class="btn ${g ? '' : 'btn-primaire'}" data-preparer>${icone('relire')} ${g ? 'Recalculer' : 'Préparer la G50'}</button>` : ''}
            ${g?.statut === 'preparee' && associe ? h`<button class="btn btn-primaire" data-valider>${icone('ok')} Valider la G50</button>` : ''}
            ${g?.statut === 'preparee' && !associe ? h`<span class="badge alerte">En attente de validation par l'associé</span>` : ''}
            ${g?.statut === 'validee' ? h`<button class="btn btn-primaire" data-deposee>${icone('ok')} Marquer déposée et payée</button>` : ''}
            ${g?.statut === 'validee' && associe ? h`<button class="btn" data-rouvrir>Rouvrir</button>` : ''}
            ${g ? h`<button class="btn" data-excel>${icone('telecharger')} Excel</button><button class="btn" data-imprimer>${icone('imprimer')} Imprimer</button>` : ''}
          </div>
        </section>
        ${c
          ? h`<section class="carte"><h2>Détail retenu</h2>
              <h3>Ventes (TVA exigible ce mois)</h3>
              ${c.detailVentes.length ? h`<table class="tableau petit"><tbody>${c.detailVentes.map((v) => h`<tr><td>${dateFr(v.date)}</td><td>${v.numero}</td><td>${v.tiers}</td><td class="num">${da(v.ht)}</td><td class="num">${da(v.tva)}</td></tr>`)}</tbody></table>` : h`<p class="muet petit">Aucune vente exigible ce mois.</p>`}
              ${c.enAttente.length ? h`<p class="petit"><b>En attente d'encaissement</b> (prestations, TVA exigible à l'encaissement) : ${c.enAttente.map((x) => `${x.numero} ${x.client} (${da(x.tva)} de TVA)`).join(' ; ')}.</p>` : ''}
              <h3>Achats (TVA déductible)</h3>
              ${c.detailAchats.length ? h`<table class="tableau petit"><tbody>${c.detailAchats.map((v) => h`<tr><td>${dateFr(v.date)}</td><td>${v.numero}</td><td>${v.tiers}${v.nature === 'immobilisation' ? h` <span class="badge">immobilisation</span>` : ''}</td><td class="num">${da(v.ht)}</td><td class="num">${da(v.tva)}</td></tr>`)}</tbody></table>` : h`<p class="muet petit">Aucun achat ce mois.</p>`}
            </section>`
          : ''}
      </div>
      <aside class="ne-pas-imprimer">
        ${g?.statut === 'preparee'
          ? h`<form class="carte" id="f-saisies"><h2>Corrections du cabinet</h2><p class="petit muet">Laisser vide pour garder la valeur calculée.</p>
              <label class="champ"><span>Précompte (crédit du mois précédent)</span><input name="precompte" inputmode="decimal" value="${g.saisies?.precompte != null ? montantSaisie(g.saisies.precompte) : ''}" placeholder="${montantSaisie(c.tva.precompteAuto)} (calculé)"></label>
              <label class="champ"><span>IRG salaires</span><input name="irg" inputmode="decimal" value="${g.saisies?.irg != null ? montantSaisie(g.saisies.irg) : ''}" placeholder="${montantSaisie(c.irg.lu)} (état de paie)"></label>
              <fieldset><legend>Autres lignes (acompte IBS…)</legend>${[0, 1].map((i) => h`<div class="champs champs-2"><label class="champ"><span>Libellé</span><input name="autre${i}l" value="${g.saisies?.autres?.[i]?.libelle || ''}"></label><label class="champ"><span>Montant</span><input name="autre${i}m" inputmode="decimal" value="${g.saisies?.autres?.[i] ? montantSaisie(g.saisies.autres[i].montant) : ''}"></label></div>`)}</fieldset>
              <button class="btn btn-primaire" type="submit">Enregistrer et recalculer</button></form>`
          : ''}
        ${encadreHumain(g?.statut === 'deposee' ? `Déposée le ${dateFr(g.deposeLe)}${g.reference ? ` — ${g.reference}` : ''}.` : "Prête à saisir : reporter les montants sur Jibaya'tic ou sur le formulaire G n° 50. Le message au client (montant et date limite) part de la boîte d'envoi après validation.")}
        ${g?.validePar ? h`<p class="petit muet">Préparée par ${g.preparePar} · validée par ${g.validePar}${g.valideLe ? ` le ${dateFr(g.valideLe)}` : ''}.</p>` : g?.preparePar ? h`<p class="petit muet">Préparée par ${g.preparePar}.</p>` : ''}
      </aside>
    </div>`,
  );

  const action = async (fn, ok) => {
    try {
      await fn();
      if (ok) toast(ok, 'ok');
    } catch (err) {
      toast(err.message, 'erreur');
    }
    ctx.rafraichir();
  };
  sur(el, 'click', '[data-preparer]', () => action(() => ctx.c.appel('POST', '/declarations/g50', { dossierId, periode: ctx.periode }), 'G50 calculée à partir des pièces validées.'));
  sur(el, 'click', '[data-valider]', async () => {
    if (!(await confirmer('Valider la G50 ?', `Total à payer : ${da(c.total)}. Un message au client (montant et date limite) sera préparé dans la boîte d'envoi : il ne partira qu'après validation.`, 'Valider'))) return;
    action(() => ctx.c.appel('POST', `/declarations/${g.id}/valider`), 'G50 validée. Message au client préparé dans la boîte d’envoi.');
  });
  sur(el, 'click', '[data-rouvrir]', () => action(() => ctx.c.appel('POST', `/declarations/${g.id}/rouvrir`)));
  sur(el, 'click', '[data-deposee]', async () => {
    const res = await fenetre({ titre: 'G50 déposée et payée', corps: h`<label class="champ"><span>Date du dépôt (JJ/MM/AAAA)</span><input name="date" value="${dateFr(ctx.moi.aujourdhui)}" required></label><label class="champ"><span>Référence (accusé Jibaya'tic, quittance)</span><input name="reference" placeholder="Ex. : accusé n° …"></label>`, boutons: [{ libelle: 'Annuler', valeur: 'annuler' }, { libelle: 'Enregistrer', valeur: 'ok', classe: 'btn-primaire' }] });
    if (!res) return;
    const [jj, mm, aa] = res.donnees.date.split('/');
    action(() => ctx.c.appel('POST', `/declarations/${g.id}/deposee`, { date: `${aa}-${mm}-${jj}`, reference: res.donnees.reference }), 'G50 marquée déposée.');
  });
  sur(el, 'click', '[data-excel]', async () => telechargerFichier(await ctx.c.telecharger(`/export/g50?id=${g.id}`)));
  sur(el, 'click', '[data-imprimer]', () => window.print());
  sur(el, 'submit', '#f-saisies', async (e) => {
    e.preventDefault();
    const f = e.target;
    const autres = [0, 1].map((i) => ({ libelle: f[`autre${i}l`].value, montant: f[`autre${i}m`].value })).filter((a) => a.libelle);
    action(() => ctx.c.appel('PUT', `/declarations/${g.id}`, { saisies: { precompte: f.precompte.value, irg: f.irg.value, autres } }), 'G50 recalculée.');
  });
}

async function vueClient(el, ctx) {
  const { declarations } = await ctx.c.appel('GET', '/declarations');
  monter(
    el,
    h`<p class="sous-titre">Vos déclarations G50 préparées et validées par le cabinet. Le montant est à payer au plus tard à la date limite.</p>
    ${declarations.length
      ? declarations.map((g) => h`<section class="carte">
          <div class="carte-tete"><h2>G50 — ${periodeFr(g.periode)}</h2><span class="actions">${badge('g50', g.statut)}</span></div>
          <div class="kpis"><div class="kpi accent"><small>Total à payer</small><b>${da(g.calcul.total)}</b><span>avant le ${dateFr(g.calcul.dateLimite)}</span></div><div class="kpi"><small>TVA nette</small><b class="petit">${da(g.calcul.tva.tvaNette)}</b></div><div class="kpi"><small>IRG salaires</small><b class="petit">${da(g.calcul.irg.montant)}</b></div><div class="kpi"><small>Crédit de TVA reporté</small><b class="petit">${da(g.calcul.tva.creditAReporter)}</b></div></div>
          <details><summary>Détail des lignes</summary>${tableauLignes(g.calcul)}</details>
          <div class="ligne-actions" style="margin-top:10px"><button class="btn btn-petit" data-excel="${g.id}">${icone('telecharger')} Télécharger (Excel)</button>${g.statut === 'deposee' ? h`<span class="petit muet">Déposée le ${dateFr(g.deposeLe)}</span>` : ''}</div>
        </section>`)
      : h`<section class="carte">${vide('Aucune G50 validée pour le moment.', 'recu')}</section>`}`,
  );
  sur(el, 'click', '[data-excel]', async (e, b) => telechargerFichier(await ctx.c.telecharger(`/export/g50?id=${b.dataset.excel}`)));
}
