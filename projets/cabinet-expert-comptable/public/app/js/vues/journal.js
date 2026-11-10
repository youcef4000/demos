// Journal d'activité (traçabilité : qui a fait quoi, quand) et demandes de contact reçues par le site.
import { h, monter, icone, dateHeureFr, sur, vide } from '../ui.js';

export default async function (el, ctx) {
  const contacts = location.hash.startsWith('#/contacts');
  if (contacts) {
    const { contacts: liste } = await ctx.c.appel('GET', '/contacts');
    monter(
      el,
      h`<p class="sous-titre">Demandes envoyées par le formulaire du site public.</p>${liste.length
        ? liste.map((c) => h`<section class="carte"><div class="carte-tete"><b>${c.nom}</b><span class="muet petit">${c.entreprise}</span><span class="actions"><span class="badge ${c.traite ? 'ok' : 'accent'}">${c.traite ? 'Traitée' : 'Nouvelle'}</span></span></div><p class="petit muet">${dateHeureFr(c.le)} · ${c.email || ''} ${c.telephone || ''}</p><div class="apercu-message">${c.message}</div><button class="btn btn-petit" style="margin-top:10px" data-traite="${c.id}" data-valeur="${c.traite ? '' : '1'}">${c.traite ? 'Rouvrir' : h`${icone('ok')} Marquer traitée`}</button></section>`)
        : h`<section class="carte">${vide('Aucune demande.', 'courrier')}</section>`}`,
    );
    sur(el, 'click', '[data-traite]', async (e, b) => {
      await ctx.c.appel('PUT', `/contacts/${b.dataset.traite}`, { traite: Boolean(b.dataset.valeur) });
      ctx.rafraichir();
    });
    return;
  }
  const { journal } = await ctx.c.appel('GET', '/journal?n=300');
  const filtre = ctx.q.f || '';
  const liste = journal.filter((j) => !filtre || `${j.nom} ${j.action} ${j.objet} ${j.details}`.toLowerCase().includes(filtre.toLowerCase()));
  monter(
    el,
    h`<div class="filtres"><input class="saisie" id="filtre" placeholder="Filtrer (nom, action, dossier…)" value="${filtre}" style="max-width:340px"><span class="petit muet">${liste.length} événement(s) — les plus récents d'abord</span></div>
    <section class="carte"><div class="table-defile"><table class="tableau empile"><thead><tr><th>Quand</th><th>Qui</th><th>Action</th><th>Objet</th><th>Détail</th></tr></thead><tbody>
    ${liste.map((j) => h`<tr><td data-l="Quand" class="petit">${dateHeureFr(j.le)}</td><td data-l="Qui">${j.nom === 'Agent IA' ? h`<span class="badge agent">${icone('agent')} Agent IA</span>` : j.nom}</td><td class="titre" data-l="Action">${j.action}</td><td data-l="Objet">${j.objet}</td><td data-l="Détail" class="petit muet">${j.details}</td></tr>`)}
    </tbody></table></div></section>`,
  );
  el.querySelector('#filtre').addEventListener('change', (e) => ctx.aller(`journal?f=${encodeURIComponent(e.target.value)}`));
}
