// Dépôt de pièces : photo depuis le téléphone, scan ou PDF. L'agent de lecture démarre tout seul.
import { h, monter, icone, periodeFr, toast, sur, preparerImage, periodes, brut } from '../ui.js';
import { TYPES_PIECE, choixDossier } from './commun.js';

export default async function (el, ctx) {
  const client = ctx.u.role === 'client';
  const dossiers = client ? [ctx.moi.dossier] : (await ctx.c.appel('GET', `/dossiers?periode=${ctx.periode}`)).dossiers;
  let dossierId = ctx.q.dossierId || (client ? ctx.moi.dossier.id : dossiers[0]?.id);
  const attendues = (await ctx.c.appel('GET', `/dossiers/${dossierId}?periode=${ctx.periode}`)).attendues;

  function dessiner() {
    const exemples = ctx.c.exemplesDisponibles?.(dossierId) || [];
    monter(
      el,
      h`<div class="grille grille-2-1">
        <section class="carte">
          <h2>Déposer des pièces — ${periodeFr(ctx.periode)}</h2>
          <p class="sous-titre">Photo, scan ou PDF : une pièce par fichier. Chaque pièce est lue par l'agent IA, puis vérifiée par un collaborateur du cabinet.</p>
          <form id="f-depot">
            <div class="champs champs-2">
              ${client ? '' : h`<label class="champ"><span>Dossier</span>${choixDossier(dossiers, dossierId)}</label>`}
              <label class="champ"><span>Mois concerné</span><select name="periode">${periodes(ctx.moi.periodeTravail, 6).map((p) => h`<option value="${p}" ${p === ctx.periode ? brut('selected') : ''}>${periodeFr(p)}</option>`)}</select></label>
              <label class="champ"><span>Type de pièce</span><select name="type">${Object.entries(TYPES_PIECE).map(([v, l]) => h`<option value="${v}">${l}</option>`)}</select></label>
            </div>
            <label class="champ"><span>Fichier(s)</span><input name="fichiers" type="file" accept="image/*,application/pdf" multiple required><small class="aide">Sur téléphone : « Prendre une photo » ouvre l'appareil photo. 15 Mo au plus par fichier.</small></label>
            <label class="champ"><span>Commentaire pour le cabinet (facultatif)</span><input name="commentaire" maxlength="300" placeholder="Ex. : facture réglée en espèces le 12"></label>
            <button class="btn btn-primaire" type="submit">${icone('depot')} Envoyer au cabinet</button>
          </form>
          ${exemples.length
            ? h`<hr><h3>Démonstration : pièces d'exemple à déposer</h3><p class="petit muet">Factures fictives que ce client n'a pas encore envoyées. Un clic les dépose comme une photo : l'agent simulé les lit.</p>
              <div class="grille grille-3">${exemples.map((x) => h`<button type="button" class="carte" data-exemple="${x.id}" style="text-align:left;cursor:pointer;padding:10px;margin:0"><img src="${x.url}" alt="" style="width:100%;aspect-ratio:3/4;object-fit:cover;object-position:top;border-radius:6px;border:1px solid var(--bord)"><b class="petit" style="display:block;margin-top:6px">${TYPES_PIECE[x.type]}</b><span class="tres-petit muet">${x.libelle.split(' — ')[1] || ''} · ${periodeFr(x.periode)}</span></button>`)}</div>`
            : ''}
        </section>
        <aside class="carte">
          <h2>Pièces attendues</h2>
          <p class="sous-titre">${dossiers.find((d) => d.id === dossierId)?.raisonSociale} — ${periodeFr(ctx.periode)}</p>
          <ul class="liste">${attendues.map((a) => h`<li><span class="badge ${a.recues ? 'ok' : a.neant ? '' : 'erreur'}">${a.recues ? `${a.recues} reçue(s)` : a.neant ? 'Néant' : 'Manquante'}</span><div class="corps">${a.libelle}</div>${!a.recues ? h`<button class="btn btn-petit btn-fantome" data-neant="${a.type}" data-valeur="${a.neant ? '' : '1'}" title="Aucune pièce de ce type ce mois-ci">${a.neant ? 'Annuler néant' : 'Néant ce mois'}</button>` : ''}</li>`)}</ul>
        </aside>
      </div>`,
    );
  }
  dessiner();

  async function deposer(corps) {
    return ctx.c.appel('POST', '/pieces', { dossierId, ...corps });
  }
  sur(el, 'change', '[name=dossierId]', (e) => ctx.aller(`deposer?dossierId=${e.target.value}`));
  sur(el, 'change', '[name=periode]', (e) => {
    ctx.changerPeriode(e.target.value);
    ctx.rafraichir();
  });
  sur(el, 'submit', '#f-depot', async (e) => {
    e.preventDefault();
    const f = e.target;
    const fichiers = [...f.fichiers.files];
    if (!fichiers.length) return;
    const b = f.querySelector('[type=submit]');
    b.disabled = true;
    b.innerHTML = '<span class="rond"></span> Envoi…';
    try {
      for (const brutF of fichiers) {
        if (brutF.size > 15 * 1024 * 1024) throw new Error(`${brutF.name} dépasse 15 Mo.`);
        const fichier = await preparerImage(brutF);
        const ref = await ctx.c.deposerFichier(fichier);
        await deposer({ periode: f.periode.value, type: f.type.value, fichier: ref, commentaire: f.commentaire.value });
      }
      toast(`${fichiers.length} pièce(s) envoyée(s) au cabinet. Lecture par l'agent en cours.`, 'ok');
      ctx.aller(client ? 'pieces' : `pieces?statut=&dossierId=${dossierId}`);
    } catch (err) {
      toast(err.message, 'erreur');
      b.disabled = false;
      b.textContent = 'Envoyer au cabinet';
    }
  });
  sur(el, 'click', '[data-exemple]', async (e, b) => {
    const x = ctx.c.exemplesDisponibles(dossierId).find((y) => y.id === b.dataset.exemple);
    b.disabled = true;
    await deposer({ periode: x.periode, type: x.type, fichier: { ref: `exemple:${x.id}`, nom: `${x.numero || x.type}.jpg`, mime: 'image/svg+xml' }, exemple: x.id });
    toast("Pièce d'exemple déposée : l'agent la lit.", 'ok');
    ctx.aller(client ? 'pieces' : `pieces?statut=&dossierId=${dossierId}`);
  });
  sur(el, 'click', '[data-neant]', async (e, b) => {
    await ctx.c.appel('POST', `/dossiers/${dossierId}/neant`, { periode: ctx.periode, type: b.dataset.neant, neant: Boolean(b.dataset.valeur) });
    ctx.rafraichir();
  });
}
