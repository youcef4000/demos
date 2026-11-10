// Comptes (associé) : associés, collaborateurs, clients ; création, désactivation, mot de passe.
import { h, brut, monter, icone, dateFr, sur, toast, fenetre, champ, initiales } from '../ui.js';

const ROLES = { associe: 'Associé', collaborateur: 'Collaborateur', client: 'Client' };

export default async function (el, ctx) {
  const { utilisateurs, dossiers } = await ctx.c.appel('GET', '/utilisateurs');
  monter(
    el,
    h`<div class="ligne-actions" style="margin-bottom:14px"><p class="sous-titre ecart" style="margin:0">Chaque personne a son compte. Un client ne voit que son dossier, un collaborateur son portefeuille.</p><button class="btn btn-primaire" data-nouveau>${icone('plus')} Nouveau compte</button></div>
    <section class="carte"><div class="table-defile"><table class="tableau empile"><thead><tr><th>Nom</th><th>E-mail</th><th>Rôle</th><th>Dossier</th><th>État</th><th></th></tr></thead><tbody>
    ${utilisateurs.map((x) => h`<tr><td class="titre" data-l="Nom"><span class="avatar" style="display:inline-grid;vertical-align:middle;margin-right:8px">${initiales(x.nom)}</span>${x.nom}${x.titre ? h`<span class="sous">${x.titre}</span>` : ''}</td><td data-l="E-mail">${x.email}</td><td data-l="Rôle"><span class="badge ${x.role === 'associe' ? 'accent' : x.role === 'collaborateur' ? 'primaire' : ''}">${ROLES[x.role]}</span></td><td data-l="Dossier">${dossiers.find((d) => d.id === x.dossierId)?.raisonSociale || '—'}</td><td data-l="État">${x.actif !== false ? h`<span class="badge ok">Actif</span>` : h`<span class="badge">Désactivé</span>`}</td>
      <td data-l=""><div class="ligne-actions"><button class="btn btn-petit" data-mdp="${x.id}">Mot de passe</button>${x.id !== ctx.u.id ? h`<button class="btn btn-petit ${x.actif !== false ? 'btn-danger' : ''}" data-actif="${x.id}" data-valeur="${x.actif !== false ? '' : '1'}">${x.actif !== false ? 'Désactiver' : 'Réactiver'}</button>` : ''}</div></td></tr>`)}
    </tbody></table></div></section>`,
  );
  sur(el, 'click', '[data-nouveau]', async () => {
    const r = await fenetre({
      titre: 'Nouveau compte',
      corps: h`${champ({ nom: 'nom', libelle: 'Nom', requis: true })}${champ({ nom: 'email', libelle: 'E-mail (identifiant)', type: 'email', requis: true })}${champ({ nom: 'role', libelle: 'Rôle', options: Object.entries(ROLES) })}${champ({ nom: 'dossierId', libelle: 'Dossier (pour un client)', options: [['', '—'], ...dossiers.map((d) => [d.id, d.raisonSociale])] })}${champ({ nom: 'motDePasse', libelle: 'Mot de passe provisoire (10 caractères au moins)', type: 'text', requis: true, attrs: 'minlength="10" autocomplete="new-password"' })}<p class="petit muet">Transmettez le mot de passe de vive voix ou par téléphone, jamais dans le même message que l'adresse.</p>`,
      boutons: [{ libelle: 'Annuler', valeur: 'annuler' }, { libelle: 'Créer le compte', valeur: 'ok', classe: 'btn-primaire' }],
    });
    if (!r) return;
    try {
      await ctx.c.appel('POST', '/utilisateurs', r.donnees);
      toast('Compte créé.', 'ok');
      ctx.rafraichir();
    } catch (err) {
      toast(err.message, 'erreur');
    }
  });
  sur(el, 'click', '[data-mdp]', async (e, b) => {
    const r = await fenetre({ titre: 'Nouveau mot de passe', corps: champ({ nom: 'motDePasse', libelle: 'Mot de passe (10 caractères au moins)', requis: true, attrs: 'minlength="10" autocomplete="new-password"' }), boutons: [{ libelle: 'Annuler', valeur: 'annuler' }, { libelle: 'Enregistrer', valeur: 'ok', classe: 'btn-primaire' }] });
    if (!r) return;
    try {
      await ctx.c.appel('PUT', `/utilisateurs/${b.dataset.mdp}`, r.donnees);
      toast('Mot de passe changé.', 'ok');
    } catch (err) {
      toast(err.message, 'erreur');
    }
  });
  sur(el, 'click', '[data-actif]', async (e, b) => {
    await ctx.c.appel('PUT', `/utilisateurs/${b.dataset.actif}`, { actif: Boolean(b.dataset.valeur) });
    ctx.rafraichir();
  });
}
