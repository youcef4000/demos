// Résultat du mois (mémo 2 : « on déroule les comptes sur le résultat, on donne le résultat du mois »).
import { h, brut, monter, icone, da, periodeFr, sur, toast, confirmer, moisCourt, vide } from '../ui.js';
import { choixDossier, encadreHumain } from './commun.js';
import { libellesGroupes } from '../../noyau/resultat.js';

export default async function (el, ctx) {
  const client = ctx.u.role === 'client';
  const dossiers = client ? [ctx.moi.dossier] : (await ctx.c.appel('GET', `/dossiers?periode=${ctx.periode}`)).dossiers;
  const dossierId = client ? ctx.moi.dossier.id : ctx.q.dossierId || dossiers[0]?.id;
  const r = await ctx.c.appel('GET', `/resultats?dossierId=${dossierId}&periode=${ctx.periode}`);
  const publies = new Set(r.publications.map((p) => p.periode));
  const max = Math.max(1, ...r.mois.map((m) => Math.abs(m.resultat)));
  const courant = r.mois.find((m) => m.periode === ctx.periode);
  const groupes = libellesGroupes();

  monter(
    el,
    h`${client ? '' : h`<div class="filtres">${choixDossier(dossiers, dossierId)}</div>`}
    ${r.mois.length
      ? h`<div class="kpis">
          <div class="kpi accent"><small>Résultat ${courant ? periodeFr(courant.periode) : ''}</small><b>${courant ? da(courant.resultat) : '—'}</b><span>${courant ? `marge ${courant.marge} %` : ''}</span></div>
          <div class="kpi"><small>Chiffre d'affaires du mois</small><b class="petit">${courant ? da(courant.groupes.ventes) : '—'}</b></div>
          <div class="kpi"><small>Résultat cumulé de l'exercice</small><b class="petit">${da(r.cumul.resultat)}</b><span>${r.mois.length} mois</span></div>
          <div class="kpi"><small>Chiffre d'affaires cumulé</small><b class="petit">${da(r.cumul.produits)}</b></div>
        </div>
        <section class="carte">
          <h2>Résultat mois par mois</h2>
          <div class="barres" role="img" aria-label="Résultat de chaque mois">${r.mois.map((m) => h`<div class="barre-mois" title="${periodeFr(m.periode)} : ${da(m.resultat)}"><i class="${m.resultat < 0 ? 'neg' : m.nbEcritures ? '' : 'vide'}" style="height:${Math.max(2, Math.round((Math.abs(m.resultat) / max) * 100))}%"></i></div>`)}</div>
          <div class="barres-etiquettes">${r.mois.map((m) => h`<span>${moisCourt(m.periode)}</span>`)}</div>
        </section>
        <section class="carte">
          <div class="carte-tete"><h2>Détail</h2>${client ? '' : h`<span class="actions">${courant && !publies.has(ctx.periode) ? h`<button class="btn btn-primaire" data-publier>${icone('envoi')} Publier ${periodeFr(ctx.periode)} au client</button>` : courant ? h`<span class="badge ok">${periodeFr(ctx.periode)} publié au client</span>` : ''}</span>`}</div>
          <div class="table-defile"><table class="tableau"><thead><tr><th>Mois</th>${groupes.map((g) => h`<th class="num">${g.libelle}</th>`)}<th class="num">Résultat</th>${client ? '' : h`<th>Client</th>`}</tr></thead><tbody>
          ${[...r.mois].reverse().map((m) => h`<tr><td><b>${periodeFr(m.periode)}</b></td>${groupes.map((g) => h`<td class="num">${m.groupes[g.cle] ? da(m.groupes[g.cle]) : '—'}</td>`)}<td class="num"><b>${da(m.resultat)}</b></td>${client ? '' : h`<td>${publies.has(m.periode) ? h`<span class="badge ok">Publié</span>` : h`<span class="badge">Non publié</span>`}</td>`}</tr>`)}
          </tbody><tfoot><tr><td>Cumul</td>${groupes.map(() => h`<td></td>`)}<td class="num">${da(r.cumul.resultat)}</td>${client ? '' : h`<td></td>`}</tr></tfoot></table></div>
          <p class="tres-petit muet">Résultat de gestion : produits (classe 7) moins charges (classe 6) des écritures validées du mois, sans inventaire ni amortissements. Le bilan annuel reste établi dans PC Compta.</p>
        </section>
        ${client ? '' : encadreHumain("Le client ne voit un mois qu'après publication par le cabinet ; le message qui l'en informe passe par la boîte d'envoi.")}`
      : h`<section class="carte">${vide(client ? 'Aucun résultat publié pour le moment.' : 'Aucune écriture validée sur cet exercice.', 'graphique')}</section>`}`,
  );
  sur(el, 'change', '[name=dossierId]', (e) => ctx.aller(`resultats?dossierId=${e.target.value}`));
  sur(el, 'click', '[data-publier]', async () => {
    if (!(await confirmer('Publier le résultat ?', `Le résultat de ${periodeFr(ctx.periode)} (${da(courant.resultat)}) devient visible dans l'espace du client ; un message l'informant est préparé dans la boîte d'envoi.`, 'Publier'))) return;
    try {
      await ctx.c.appel('POST', '/resultats/publier', { dossierId, periode: ctx.periode });
      toast('Résultat publié. Message préparé dans la boîte d’envoi.', 'ok');
    } catch (err) {
      toast(err.message, 'erreur');
    }
    ctx.rafraichir();
  });
}
