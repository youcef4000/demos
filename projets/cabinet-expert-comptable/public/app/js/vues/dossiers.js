// Dossiers clients (mémo 1 : « on crée un dossier ») : identité fiscale, réglages, état du mois.
import { h, brut, monter, icone, da, dateFr, periodeFr, badge, sur, toast, fenetre, champ, montantSaisie } from '../ui.js';
import { NATURES } from './commun.js';
import { lireMontant } from '../../noyau/format.js';

export default async function (el, ctx) {
  const [id] = ctx.params;
  const { dossiers, collaborateurs } = await ctx.c.appel('GET', `/dossiers?periode=${ctx.periode}`);
  const associe = ctx.u.role === 'associe';
  if (id) return fiche(el, ctx, id, collaborateurs, associe);
  monter(
    el,
    h`<div class="ligne-actions" style="margin-bottom:14px"><p class="sous-titre ecart" style="margin:0">${dossiers.length} dossier(s) ${associe ? 'du cabinet' : 'de votre portefeuille'} — état de ${periodeFr(ctx.periode)}.</p>${associe ? h`<button class="btn btn-primaire" data-nouveau>${icone('plus')} Nouveau dossier</button>` : ''}</div>
    <section class="carte"><div class="table-defile"><table class="tableau empile"><thead><tr><th>Dossier</th><th>NIF</th><th>Activité</th><th>Salariés</th><th>Collaborateur</th><th>Pièces du mois</th><th>G50</th></tr></thead><tbody>
    ${dossiers.map((d) => h`<tr class="cliquable" data-dossier="${d.id}"><td class="titre" data-l="Dossier"><b>${d.raisonSociale}</b><span class="sous">${d.wilaya} · ${d.centreImpots || ''}</span></td><td class="mono" data-l="NIF">${d.nif}</td><td data-l="Activité">${NATURES[d.nature] || d.activite}</td><td data-l="Salariés">${d.salaries || 0}</td><td data-l="Collaborateur">${d.collaborateur}</td><td data-l="Pièces">${d.pieces.total}${d.manquantes.length ? h` <span class="badge erreur">${d.manquantes.length} manquante(s)</span>` : ''}</td><td data-l="G50">${d.g50 ? badge('g50', d.g50.statut) : h`<span class="badge">À préparer</span>`}</td></tr>`)}
    </tbody></table></div></section>`,
  );
  sur(el, 'click', '[data-dossier]', (e, tr) => ctx.aller(`dossiers/${tr.dataset.dossier}`));
  sur(el, 'click', '[data-nouveau]', () => modifier(ctx, null, collaborateurs));
}

async function fiche(el, ctx, id, collaborateurs, associe) {
  const r = await ctx.c.appel('GET', `/dossiers/${id}?periode=${ctx.periode}`);
  const d = r.dossier;
  monter(
    el,
    h`<div class="ligne-actions" style="margin-bottom:12px"><a class="btn btn-fantome" href="#/dossiers">${icone('retour')} Dossiers</a><span class="ecart"></span>${associe ? h`<button class="btn" data-modifier>${icone('crayon')} Modifier</button>` : ''}</div>
    <div class="grille grille-2-1">
      <div>
        <section class="carte">
          <h2>${d.raisonSociale}</h2>
          <p class="sous-titre">${d.activite} · ${d.adresse}</p>
          <div class="table-defile"><table class="tableau"><tbody>
            <tr><td class="muet">NIF</td><td class="mono">${d.nif}</td><td class="muet">NIS</td><td class="mono">${d.nis || '—'}</td></tr>
            <tr><td class="muet">RC</td><td class="mono">${d.rc || '—'}</td><td class="muet">Article d'imposition</td><td class="mono">${d.ai || '—'}</td></tr>
            <tr><td class="muet">Régime</td><td>${d.regime === 'ifu' ? 'IFU' : 'Réel (G50 mensuelle)'} · ${d.impot || 'IBS'}</td><td class="muet">Centre des impôts</td><td>${d.centreImpots || '—'}</td></tr>
            <tr><td class="muet">Salariés</td><td>${d.salaries || 0}</td><td class="muet">Collaborateur</td><td>${d.collaborateur}</td></tr>
            <tr><td class="muet">Contact</td><td colspan="3">${d.contact?.nom || '—'} · ${d.contact?.email || ''} · ${d.contact?.telephone || ''}</td></tr>
            <tr><td class="muet">Réglages</td><td colspan="3">${d.caisse ? 'Caisse (espèces)' : 'Pas de caisse'} · TVA des prestations et travaux ${d.tvaSurEncaissements !== false ? "à l'encaissement" : 'à la facturation'} · ${d.casnos ? 'Gérant non salarié (CASNOS)' : 'Pas de CASNOS'}</td></tr>
          </tbody></table></div>
        </section>
        <section class="carte">
          <div class="carte-tete"><h2>${periodeFr(ctx.periode)}</h2></div>
          <div class="ligne-actions" style="flex-wrap:wrap">
            <a class="btn" href="#/pieces?statut=&dossierId=${d.id}">${icone('piece')} Pièces (${d.pieces.total})</a>
            <a class="btn" href="#/ecritures?dossierId=${d.id}">${icone('livre')} Écritures${d.ecritures.proposees ? ` (${d.ecritures.proposees} à valider)` : ''}</a>
            <a class="btn" href="#/g50/${d.id}">${icone('recu')} G50${r.declaration ? ` · ${da(r.declaration.calcul.total)}` : ''}</a>
            <a class="btn" href="#/resultats?dossierId=${d.id}">${icone('graphique')} Résultat ${r.resultat?.nbEcritures ? `· ${da(r.resultat.resultat)}` : ''}</a>
            <a class="btn" href="#/messages?dossierId=${d.id}">${icone('message')} Messages</a>
            <a class="btn" href="#/deposer?dossierId=${d.id}">${icone('depot')} Déposer</a>
          </div>
        </section>
      </div>
      <aside class="carte">
        <h2>Pièces attendues</h2>
        <ul class="liste">${r.attendues.map((a) => h`<li><span class="badge ${a.recues ? 'ok' : a.neant ? '' : 'erreur'}">${a.recues ? `${a.recues} reçue(s)` : a.neant ? 'Néant' : 'Manquante'}</span><div class="corps">${a.libelle}</div></li>`)}</ul>
        ${d.manquantes.length ? h`<a class="btn btn-petit" href="#/relances">${icone('cloche')} Préparer une relance</a>` : ''}
      </aside>
    </div>`,
  );
  sur(el, 'click', '[data-modifier]', () => modifier(ctx, d, collaborateurs));
}

async function modifier(ctx, d, collaborateurs) {
  const v = d || { regime: 'reel', impot: 'IBS', nature: 'marchandises', salaries: 0, caisse: false, casnos: true, tvaSurEncaissements: true, contact: {} };
  const r = await fenetre({
    titre: d ? `Modifier ${d.raisonSociale}` : 'Nouveau dossier',
    corps: h`<div class="champs champs-2">
      ${champ({ nom: 'raisonSociale', libelle: 'Raison sociale', valeur: v.raisonSociale, requis: true })}
      ${champ({ nom: 'forme', libelle: 'Forme', valeur: v.forme, options: [['SARL', 'SARL'], ['EURL', 'EURL'], ['SPA', 'SPA'], ['SNC', 'SNC'], ['EI', 'Entreprise individuelle']] })}
      ${champ({ nom: 'activite', libelle: 'Activité', valeur: v.activite })}
      ${champ({ nom: 'nature', libelle: 'Nature principale', valeur: v.nature, options: Object.entries(NATURES).slice(0, 4) })}
      ${champ({ nom: 'nif', libelle: 'NIF', valeur: v.nif, requis: true, attrs: 'inputmode="numeric"' })}
      ${champ({ nom: 'nis', libelle: 'NIS', valeur: v.nis })}
      ${champ({ nom: 'rc', libelle: 'RC', valeur: v.rc })}
      ${champ({ nom: 'ai', libelle: "Article d'imposition", valeur: v.ai })}
      ${champ({ nom: 'wilaya', libelle: 'Wilaya', valeur: v.wilaya })}
      ${champ({ nom: 'adresse', libelle: 'Adresse', valeur: v.adresse })}
      ${champ({ nom: 'centreImpots', libelle: 'Centre des impôts', valeur: v.centreImpots })}
      ${champ({ nom: 'regime', libelle: 'Régime', valeur: v.regime, options: [['reel', 'Réel (G50 mensuelle)'], ['ifu', 'IFU']] })}
      ${champ({ nom: 'impot', libelle: 'Impôt sur le bénéfice', valeur: v.impot, options: [['IBS', 'IBS'], ['IRG', 'IRG (BIC)']] })}
      ${champ({ nom: 'salaries', libelle: 'Nombre de salariés', valeur: v.salaries, type: 'number', attrs: 'min="0"' })}
      ${champ({ nom: 'collaborateurId', libelle: 'Collaborateur', valeur: v.collaborateurId, options: collaborateurs.map((c) => [c.id, c.nom]) })}
      ${champ({ nom: 'creditTvaInitial', libelle: 'Crédit de TVA au démarrage', valeur: montantSaisie(v.creditTvaInitial || 0), attrs: 'inputmode="decimal"' })}
      ${champ({ nom: 'contactNom', libelle: 'Contact (gérant)', valeur: v.contact?.nom })}
      ${champ({ nom: 'contactEmail', libelle: 'E-mail du contact', valeur: v.contact?.email, type: 'email' })}
      ${champ({ nom: 'contactTel', libelle: 'Téléphone / WhatsApp', valeur: v.contact?.telephone, attrs: 'inputmode="tel"' })}
    </div>
    <label class="case"><input type="checkbox" name="caisse" ${v.caisse ? brut('checked') : ''}> Le client encaisse ou paie en espèces (caisse)</label>
    <label class="case"><input type="checkbox" name="casnos" ${v.casnos ? brut('checked') : ''}> Gérant ou associés non salariés (CASNOS)</label>
    <label class="case"><input type="checkbox" name="tvaSurEncaissements" ${v.tvaSurEncaissements !== false ? brut('checked') : ''}> TVA des prestations et travaux exigible à l'encaissement</label>`,
    boutons: [{ libelle: 'Annuler', valeur: 'annuler' }, { libelle: 'Enregistrer', valeur: 'ok', classe: 'btn-primaire' }],
  });
  if (!r) return;
  const x = r.donnees;
  const corps = { ...x, salaries: Number(x.salaries) || 0, caisse: Boolean(x.caisse), casnos: Boolean(x.casnos), tvaSurEncaissements: Boolean(x.tvaSurEncaissements), creditTvaInitial: lireMontant(x.creditTvaInitial) || 0, contact: { nom: x.contactNom, email: x.contactEmail, telephone: x.contactTel } };
  try {
    const res = d ? await ctx.c.appel('PUT', `/dossiers/${d.id}`, corps) : await ctx.c.appel('POST', '/dossiers', corps);
    toast('Dossier enregistré.', 'ok');
    ctx.aller(`dossiers/${res.id}`);
    ctx.rafraichir();
  } catch (err) {
    toast(err.message, 'erreur');
  }
}
