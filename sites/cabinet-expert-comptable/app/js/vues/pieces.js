// Pièces reçues : boîte de réception du cabinet (ou « Mes pièces » pour le client).
import { h, monter, icone, da, dateFr, periodeFr, badge, sur, vide } from '../ui.js';
import { TYPES_PIECE, choixDossier, libelleTiers, ttcPiece, confiance } from './commun.js';

const FILTRES = [
  ['a_valider', 'À valider'],
  ['validee', 'Écritures à valider'],
  ['comptabilisee', 'Comptabilisées'],
  ['', 'Toutes'],
];

export default async function (el, ctx) {
  const client = ctx.u.role === 'client';
  const statut = ctx.q.statut ?? (client ? '' : 'a_valider');
  const dossierId = ctx.q.dossierId || '';
  const toutesPeriodes = ctx.q.periode === 'toutes';
  const params = new URLSearchParams();
  if (statut) params.set('statut', statut);
  if (dossierId) params.set('dossierId', dossierId);
  if (!toutesPeriodes) params.set('periode', ctx.periode);
  const [{ pieces }, dossiers] = await Promise.all([ctx.c.appel('GET', `/pieces?${params}`), client ? null : ctx.c.appel('GET', `/dossiers?periode=${ctx.periode}`)]);
  let minuterie;

  monter(
    el,
    h`<div class="ligne-actions" style="margin-bottom:14px">
        <p class="sous-titre ecart" style="margin:0">${client ? `Pièces déposées pour ${periodeFr(ctx.periode)} et leur traitement par le cabinet.` : `Pièces de ${periodeFr(ctx.periode)} : l'agent IA les lit, un membre du cabinet valide chaque fiche.`}</p>
        <a class="btn btn-primaire" href="#/deposer">${icone('depot')} Déposer des pièces</a>
      </div>
      ${client
        ? ''
        : h`<div class="filtres">
        <div class="pastilles">${FILTRES.map(([v, l]) => h`<button class="pastille ${v === statut ? 'actif' : ''}" data-statut="${v}">${l}</button>`)}</div>
        ${choixDossier(dossiers.dossiers, dossierId, { tous: true })}
        <label class="case" style="margin:0"><input type="checkbox" id="toutes" ${toutesPeriodes ? 'checked' : ''}> Toutes les périodes</label>
      </div>`}
      <section class="carte">
      ${pieces.length
        ? h`<div class="table-defile"><table class="tableau empile"><thead><tr><th>Reçue le</th>${client ? '' : h`<th>Dossier</th>`}<th>Pièce</th><th>Tiers</th><th class="num">Montant</th><th>Agent</th><th>Statut</th></tr></thead><tbody>
          ${pieces.map((p) => h`<tr class="cliquable" data-piece="${p.id}">
            <td data-l="Reçue le">${dateFr(p.recueLe)}<span class="sous">${p.source === 'client' ? 'par le client' : 'par le cabinet'}</span></td>
            ${client ? '' : h`<td class="titre" data-l="Dossier">${p.dossier}</td>`}
            <td data-l="Pièce"><b>${TYPES_PIECE[p.fiche?.typeDoc || p.type]}</b><span class="sous">${p.fiche?.numero || p.fichier?.nom || ''}${p.fiche?.date ? ` · ${dateFr(p.fiche.date)}` : ''}</span></td>
            <td data-l="Tiers">${libelleTiers(p) || '—'}</td>
            <td class="num" data-l="Montant">${ttcPiece(p) != null ? da(ttcPiece(p)) : '—'}</td>
            <td data-l="Agent">${p.statut === 'en_lecture' || p.statut === 'recue' ? h`<span class="rond"></span>` : confiance(p)}</td>
            <td data-l="Statut">${badge('piece', p.statut)}</td>
          </tr>`)}
          </tbody></table></div>`
        : vide(statut === 'a_valider' ? 'Aucune pièce à valider : tout est traité pour cette période.' : 'Aucune pièce pour ce filtre.', 'piece')}
      </section>`,
  );

  const naviguer = (changements) => {
    const q = new URLSearchParams({ statut, ...(dossierId ? { dossierId } : {}), ...(toutesPeriodes ? { periode: 'toutes' } : {}), ...changements });
    for (const [k, v] of [...q]) if (v === '' && k !== 'statut') q.delete(k);
    ctx.aller(`pieces?${q}`);
  };
  sur(el, 'click', '[data-statut]', (e, b) => naviguer({ statut: b.dataset.statut }));
  sur(el, 'click', '[data-piece]', (e, tr) => ctx.aller(`piece/${tr.dataset.piece}`));
  el.querySelector('[name=dossierId]')?.addEventListener('change', (e) => naviguer({ dossierId: e.target.value }));
  el.querySelector('#toutes')?.addEventListener('change', (e) => naviguer({ periode: e.target.checked ? 'toutes' : '' }));

  // Une lecture en cours : on rafraîchit la liste jusqu'à ce que l'agent ait fini
  if (pieces.some((p) => p.statut === 'en_lecture' || p.statut === 'recue')) minuterie = setTimeout(() => ctx.rafraichir(), 1500);
  return () => clearTimeout(minuterie);
}
