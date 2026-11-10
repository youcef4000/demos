// Messagerie cabinet ↔ client (les messages validés dans la boîte d'envoi y sont copiés).
import { h, monter, dateHeureFr, sur, toast, vide, initiales } from '../ui.js';
import { choixDossier } from './commun.js';

export default async function (el, ctx) {
  const client = ctx.u.role === 'client';
  const dossiers = client ? [ctx.moi.dossier] : (await ctx.c.appel('GET', '/dossiers')).dossiers;
  const { messages: tous } = await ctx.c.appel('GET', '/messages');
  const nonLus = (id) => tous.filter((m) => m.dossierId === id && !m.lu && m.de === (client ? 'cabinet' : 'client')).length;
  const dossierId = client ? ctx.moi.dossier.id : ctx.q.dossierId || [...tous].reverse().find((m) => m.de === 'client')?.dossierId || dossiers[0]?.id;
  const fil = tous.filter((m) => m.dossierId === dossierId);
  const moi = (m) => (client ? m.de === 'client' : m.de === 'cabinet');

  monter(
    el,
    h`<div class="grille ${client ? '' : 'grille-2-1'}">
      <section class="carte">
        ${client ? h`<h2>Échanges avec ${ctx.moi.cabinet.nom}</h2>` : h`<div class="filtres">${choixDossier(dossiers, dossierId)}</div>`}
        <div class="fil" id="fil">${fil.length ? fil.map((m) => h`<div class="bulle ${moi(m) ? 'moi' : ''}">${m.objet ? h`<b class="objet">${m.objet}</b>` : ''}${m.texte}<small>${m.auteur || (m.de === 'client' ? 'Client' : 'Cabinet')} · ${dateHeureFr(m.le)}</small></div>`) : vide('Aucun message pour le moment.', 'message')}</div>
        <form id="f-message" style="margin-top:12px"><label class="champ"><span>Votre message</span><textarea name="texte" rows="3" required placeholder="${client ? 'Écrire au cabinet…' : 'Écrire au client…'}"></textarea></label><button class="btn btn-primaire" type="submit">Envoyer</button></form>
      </section>
      ${client
        ? ''
        : h`<aside class="carte"><h2>Dossiers</h2><ul class="liste">${dossiers.map((d) => {
            const n = nonLus(d.id);
            const dernier = [...tous].reverse().find((m) => m.dossierId === d.id);
            return h`<li data-dossier="${d.id}" style="cursor:pointer"><span class="avatar">${initiales(d.raisonSociale.replace(/^(SARL|EURL|SPA) /, ''))}</span><div class="corps"><b>${d.raisonSociale}</b><span>${dernier ? `${dernier.de === 'client' ? 'Client' : 'Cabinet'} · ${dateHeureFr(dernier.le)}` : 'Aucun message'}</span></div>${n ? h`<span class="badge accent">${n}</span>` : ''}</li>`;
          })}</ul></aside>`}
    </div>`,
  );
  const f = el.querySelector('#fil');
  f.scrollTop = f.scrollHeight;
  if (fil.some((m) => !m.lu && !moi(m))) ctx.c.appel('POST', '/messages/lus', { dossierId }).then(() => ctx.rafraichirCompteurs());
  sur(el, 'change', '[name=dossierId]', (e) => ctx.aller(`messages?dossierId=${e.target.value}`));
  sur(el, 'click', '[data-dossier]', (e, li) => ctx.aller(`messages?dossierId=${li.dataset.dossier}`));
  sur(el, 'submit', '#f-message', async (e) => {
    e.preventDefault();
    try {
      await ctx.c.appel('POST', '/messages', { dossierId, texte: e.target.texte.value });
      ctx.rafraichir();
    } catch (err) {
      toast(err.message, 'erreur');
    }
  });
}
