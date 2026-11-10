// Boîte d'envoi : tout message au client (relance, montant G50, résultat) attend ici une validation humaine.
import { h, brut, monter, icone, dateFr, dateHeureFr, sur, toast, fenetre, badge, vide } from '../ui.js';
import { encadreHumain } from './commun.js';

const ORIGINES = { relance: 'Relance pièces', g50: 'Montant G50', resultat: 'Résultat du mois', agent: 'Agent IA' };

export default async function (el, ctx) {
  const onglet = ctx.q.onglet || 'a_valider';
  const { envois } = await ctx.c.appel('GET', `/envois?statut=${onglet}`);
  const demo = ctx.c.mode === 'demo';
  monter(
    el,
    h`<nav class="onglets"><a href="#/envois" class="${onglet === 'a_valider' ? 'actif' : ''}">À valider</a><a href="#/envois?onglet=envoye" class="${onglet === 'envoye' ? 'actif' : ''}">Envoyés</a><a href="#/envois?onglet=rejete" class="${onglet === 'rejete' ? 'actif' : ''}">Écartés</a></nav>
    ${onglet === 'a_valider' ? encadreHumain("Rien ne part sans votre clic. Relisez, modifiez si besoin, puis validez : l'e-mail part de la boîte du cabinet ; pour WhatsApp, le message s'ouvre prérempli et vous appuyez vous-même sur Envoyer.") : ''}
    ${envois.length
      ? envois.map((e) => h`<section class="carte">
          <div class="carte-tete">
            <span class="badge ${e.canal === 'whatsapp' ? 'ok' : 'info'}">${icone(e.canal === 'whatsapp' ? 'telephone' : 'courrier')} ${e.canal === 'whatsapp' ? 'WhatsApp' : 'E-mail'}</span>
            <span class="badge">${ORIGINES[e.origine] || e.origine}</span>
            <b>${e.dossier}</b>
            <span class="actions">${badge('envoi', e.statut)}</span>
          </div>
          <p class="petit muet">À : ${e.destinataire || h`<b style="color:var(--erreur)">destinataire manquant</b>`} · préparé ${e.creePar === 'workflow' ? 'automatiquement (règle fixe)' : 'par le cabinet'} le ${dateHeureFr(e.creeLe)}${e.envoyeLe ? ` · envoyé le ${dateHeureFr(e.envoyeLe)}${e.valideePar ? ` par ${e.valideePar}` : ''}` : ''}</p>
          ${e.objet ? h`<p><b>${e.objet}</b></p>` : ''}
          <div class="apercu-message">${e.corps}</div>
          ${e.statut === 'a_valider'
            ? h`<div class="ligne-actions" style="margin-top:12px">
                <button class="btn btn-primaire" data-valider="${e.id}">${icone('envoi')} ${e.canal === 'whatsapp' ? 'Valider et ouvrir WhatsApp' : "Valider et envoyer l'e-mail"}</button>
                <button class="btn" data-modifier="${e.id}">${icone('crayon')} Modifier</button>
                <span class="ecart"></span><button class="btn btn-danger" data-ecarter="${e.id}">Écarter</button>
              </div>`
            : e.resultat?.simulation ? h`<p class="tres-petit muet" style="margin-top:8px">Démonstration : envoi simulé, aucun message réel.</p>` : ''}
        </section>`)
      : h`<section class="carte">${vide(onglet === 'a_valider' ? 'Aucun message en attente de validation.' : 'Aucun message.', 'boite')}</section>`}`,
  );

  sur(el, 'click', '[data-valider]', async (ev, b) => {
    const e = envois.find((x) => x.id === b.dataset.valider);
    b.disabled = true;
    try {
      const r = await ctx.c.appel('POST', `/envois/${e.id}/valider`);
      if (r.canal === 'whatsapp' && r.resultat?.lien) {
        if (demo) toast('Message validé. En démonstration, WhatsApp ne s’ouvre pas (numéro fictif).', 'ok');
        else window.open(r.resultat.lien, '_blank', 'noopener');
      } else toast(demo ? 'E-mail validé (envoi simulé en démonstration).' : 'E-mail envoyé depuis la boîte du cabinet.', 'ok');
    } catch (err) {
      toast(err.message, 'erreur');
    }
    ctx.rafraichir();
  });
  sur(el, 'click', '[data-ecarter]', async (ev, b) => {
    await ctx.c.appel('POST', `/envois/${b.dataset.ecarter}/rejeter`);
    toast('Brouillon écarté.');
    ctx.rafraichir();
  });
  sur(el, 'click', '[data-modifier]', async (ev, b) => {
    const e = envois.find((x) => x.id === b.dataset.modifier);
    const r = await fenetre({
      titre: 'Modifier le message',
      corps: h`<label class="champ"><span>${e.canal === 'whatsapp' ? 'Numéro WhatsApp' : 'Adresse e-mail'}</span><input name="destinataire" value="${e.destinataire || ''}"></label>${e.canal === 'email' ? h`<label class="champ"><span>Objet</span><input name="objet" value="${e.objet || ''}"></label>` : ''}<label class="champ"><span>Message</span><textarea name="corps" rows="10">${e.corps}</textarea></label>`,
      boutons: [{ libelle: 'Annuler', valeur: 'annuler' }, { libelle: 'Enregistrer', valeur: 'ok', classe: 'btn-primaire' }],
    });
    if (!r) return;
    await ctx.c.appel('PUT', `/envois/${e.id}`, r.donnees);
    toast('Message modifié, toujours en attente de validation.');
    ctx.rafraichir();
  });
}
