// Paramètres (associé) : tout ce que le cabinet change sans développeur.
// Textes du site, coordonnées, modèles de relance, échéancier fiscal et social, pièces à demander,
// schémas de comptabilisation, format d'export PC Compta, relances automatiques.
import { h, brut, monter, icone, sur, toast, confirmer } from '../ui.js';
import { CONCERNE } from '../../noyau/echeancier.js';
import { CONDITIONS } from '../../noyau/relances.js';
import { CHAMPS_EXPORT } from '../../noyau/export.js';
import { TYPES_PIECE, NATURES, PLAN_COMPTES } from './commun.js';
import { nouvelId } from '../../noyau/format.js';

const ONGLETS = [
  ['site', 'Textes du site'],
  ['cabinet', 'Coordonnées'],
  ['modeles', 'Modèles de relance'],
  ['echeancier', 'Échéancier'],
  ['pieces', 'Pièces à demander'],
  ['schemas', 'Schémas comptables'],
  ['export', 'Export PC Compta'],
  ['relances', 'Relances automatiques'],
];
const VARIABLES = '{{contact}} {{entreprise}} {{mois}} {{date_limite}} {{liste_pieces}} {{liste_courte}} {{montant}} {{detail}} {{resultat}} {{ca}} {{cabinet}} {{signature}}';
const opt = (liste, v) => liste.map(([k, l]) => h`<option value="${k}" ${String(k) === String(v) ? brut('selected') : ''}>${l}</option>`);
const inp = (nom, v, attrs = '') => h`<input class="saisie" name="${nom}" value="${v ?? ''}" ${brut(attrs)}>`;

export default async function (el, ctx) {
  const onglet = ctx.q.onglet || 'site';
  const r = await ctx.c.appel('GET', `/parametres/${onglet}`);
  let v = structuredClone(r.valeur);

  function formulaire() {
    switch (onglet) {
      case 'site':
        return h`<p class="sous-titre">Textes du site public du cabinet. Ils s'affichent dès l'enregistrement (<a href="../" target="_blank" rel="noopener">voir le site</a>).</p>
          <div class="champs champs-2">${['accroche', 'titre', 'boutonPrincipal', 'boutonSecondaire', 'etapesTitre', 'engagementsTitre', 'contactTitre', 'mentions'].map((k) => h`<label class="champ"><span>${{ accroche: 'Accroche', titre: 'Titre principal', boutonPrincipal: 'Bouton principal', boutonSecondaire: 'Bouton secondaire', etapesTitre: 'Titre « méthode »', engagementsTitre: 'Titre « engagements »', contactTitre: 'Titre « contact »', mentions: 'Mention de bas de page' }[k]}</span>${inp(k, v[k])}</label>`)}</div>
          <label class="champ"><span>Texte d'introduction</span><textarea name="sousTitre">${v.sousTitre}</textarea></label>
          <label class="champ"><span>Texte de contact</span><textarea name="contactTexte" rows="3">${v.contactTexte}</textarea></label>
          ${['services', 'etapes', 'engagements'].map((liste) => h`<fieldset><legend>${{ services: 'Services', etapes: 'Méthode (étapes)', engagements: 'Engagements' }[liste]}</legend>${v[liste].map((x, i) => h`<div class="champs champs-2" data-bloc="${liste}"><label class="champ"><span>Titre ${i + 1}</span>${inp(`${liste}.${i}.titre`, x.titre)}</label><label class="champ"><span>Texte ${i + 1}</span><textarea name="${liste}.${i}.texte" rows="3">${x.texte}</textarea></label></div>`)}</fieldset>`)}`;
      case 'cabinet':
        return h`<p class="sous-titre">Coordonnées affichées sur le site, dans l'espace client et en signature des messages.</p><div class="champs champs-2">${Object.entries({ nom: 'Nom du cabinet', activite: 'Activité', expert: "Nom de l'expert-comptable", ville: 'Ville', adresse: 'Adresse', telephone: 'Téléphone', whatsapp: 'WhatsApp (pour le bouton du site)', email: 'E-mail', horaires: 'Horaires', agrement: "Inscription à l'Ordre", signature: 'Signature des messages' }).map(([k, l]) => h`<label class="champ"><span>${l}</span>${inp(k, v[k])}</label>`)}</div>`;
      case 'modeles':
        return h`<p class="sous-titre">Modèles utilisés par les relances, le message du montant G50 et l'avis de résultat. Variables disponibles : <code class="petit">${VARIABLES}</code></p>
          ${v.map((m, i) => h`<fieldset data-ligne="${i}"><legend>${m.nom}</legend><div class="champs champs-3"><label class="champ"><span>Nom</span>${inp(`${i}.nom`, m.nom)}</label><label class="champ"><span>Usage</span><select class="saisie" name="${i}.usage">${opt([['relance', 'Relance pièces'], ['g50', 'Montant G50'], ['resultat', 'Résultat du mois']], m.usage)}</select></label><label class="champ"><span>Canal</span><select class="saisie" name="${i}.canal">${opt([['email', 'E-mail'], ['whatsapp', 'WhatsApp']], m.canal)}</select></label></div>
            <label class="champ"><span>Objet (e-mail)</span>${inp(`${i}.objet`, m.objet)}</label><label class="champ"><span>Texte</span><textarea name="${i}.corps" rows="7">${m.corps}</textarea></label><button type="button" class="btn btn-petit btn-danger" data-suppr="${i}">Supprimer ce modèle</button></fieldset>`)}
          <button type="button" class="btn" data-ajout>${icone('plus')} Ajouter un modèle</button>`;
      case 'echeancier':
        return h`<p class="sous-titre">Règles de dates par organisme. Mois : numéros séparés par des virgules (ex. 3, 6, 11) pour une échéance annuelle. Décalage : période concernée (−1 = mois précédent, −12 = année précédente).</p>
          <div class="table-defile"><table class="lignes-fiche"><thead><tr><th>Actif</th><th>Organisme</th><th>Échéance</th><th>Fréquence</th><th>Jour</th><th>Mois</th><th>Décalage</th><th>Dossiers concernés</th><th>Vérifiée</th><th>Source, note</th><th></th></tr></thead><tbody>
          ${v.map((x, i) => h`<tr data-ligne="${i}"><td><input type="checkbox" name="${i}.actif" ${x.actif ? brut('checked') : ''}></td><td><select name="${i}.organisme">${opt([['DGI', 'DGI'], ['CNAS', 'CNAS'], ['CASNOS', 'CASNOS']], x.organisme)}</select></td><td style="min-width:220px">${inp(`${i}.libelle`, x.libelle)}</td><td><select name="${i}.frequence">${opt([['mensuelle', 'Mensuelle'], ['annuelle', 'Annuelle']], x.frequence)}</select></td><td style="width:64px">${inp(`${i}.jour`, x.jour, 'inputmode="numeric"')}</td><td style="width:96px">${inp(`${i}.mois`, (x.mois || []).join(', '))}</td><td style="width:70px">${inp(`${i}.decalage`, x.decalage, 'inputmode="numeric"')}</td><td><select name="${i}.concerne">${opt(Object.entries(CONCERNE), x.concerne)}</select></td><td><input type="checkbox" name="${i}.verifie" ${x.verifie ? brut('checked') : ''}></td><td style="min-width:200px">${inp(`${i}.source`, x.source)}${inp(`${i}.note`, x.note, 'placeholder="Note"')}</td><td><button type="button" class="btn btn-petit btn-fantome" data-suppr="${i}" aria-label="Supprimer">${icone('fermer')}</button></td></tr>`)}
          </tbody></table></div><button type="button" class="btn" data-ajout>${icone('plus')} Ajouter une échéance</button>`;
      case 'pieces':
        return h`<p class="sous-titre">Liste des pièces demandées chaque mois aux clients ; elle alimente l'espace client, les pièces manquantes et les relances.</p>
          <table class="lignes-fiche"><thead><tr><th>Actif</th><th>Libellé</th><th>Type de pièce</th><th>Demandée à</th><th></th></tr></thead><tbody>
          ${v.map((x, i) => h`<tr data-ligne="${i}"><td><input type="checkbox" name="${i}.actif" ${x.actif !== false ? brut('checked') : ''}></td><td>${inp(`${i}.libelle`, x.libelle)}</td><td><select name="${i}.type">${opt(Object.entries(TYPES_PIECE), x.type)}</select></td><td><select name="${i}.condition">${opt(Object.entries(CONDITIONS), x.condition)}</select></td><td><button type="button" class="btn btn-petit btn-fantome" data-suppr="${i}" aria-label="Supprimer">${icone('fermer')}</button></td></tr>`)}
          </tbody></table><button type="button" class="btn" data-ajout>${icone('plus')} Ajouter une pièce</button>`;
      case 'schemas': {
        const compte = (nom, val) => h`<input class="saisie mono" name="${nom}" value="${val ?? ''}" list="plan-p" style="width:110px">`;
        return h`<p class="sous-titre">Règles fixes de comptabilisation (SCF). Un compte vide pour une nature laisse l'agent d'imputation proposer, puis le collaborateur valider. À aligner une fois sur le plan de comptes de PC Compta.</p>
          <datalist id="plan-p">${Object.entries(PLAN_COMPTES).map(([c, l]) => h`<option value="${c}">${l}</option>`)}</datalist>
          <div class="grille grille-2">
            <fieldset><legend>Achats : compte de charge par nature</legend>${Object.entries(NATURES).map(([k, l]) => h`<div class="ligne-actions" style="margin-bottom:6px"><span class="ecart petit">${l}</span>${compte(`achats.${k}`, v.achats[k])}</div>`)}</fieldset>
            <fieldset><legend>Ventes : compte de produit par nature</legend>${Object.entries(NATURES).slice(0, 4).map(([k, l]) => h`<div class="ligne-actions" style="margin-bottom:6px"><span class="ecart petit">${l}</span>${compte(`ventes.${k}`, v.ventes[k])}</div>`)}</fieldset>
            <fieldset><legend>Tiers, TVA, timbre, trésorerie</legend>${[['tiers.fournisseur', 'Fournisseurs'], ['tiers.fournisseurImmo', "Fournisseurs d'immobilisations"], ['tiers.client', 'Clients'], ['tva.deductible', 'TVA déductible (biens et services)'], ['tva.deductibleImmo', 'TVA déductible (immobilisations)'], ['tva.collectee', 'TVA collectée'], ['timbre.achat', 'Droit de timbre payé'], ['timbre.vente', 'Droit de timbre collecté'], ['tresorerie.banque', 'Banque'], ['tresorerie.caisse', 'Caisse']].map(([k, l]) => h`<div class="ligne-actions" style="margin-bottom:6px"><span class="ecart petit">${l}</span>${compte(k, k.split('.').reduce((o, p) => o?.[p], v))}</div>`)}</fieldset>
            <fieldset><legend>Paie</legend>${[['paie.brut', 'Salaires bruts'], ['paie.patronal', 'Charges patronales'], ['paie.cnas', 'CNAS'], ['paie.irg', 'IRG retenu'], ['paie.net', 'Net à payer']].map(([k, l]) => h`<div class="ligne-actions" style="margin-bottom:6px"><span class="ecart petit">${l}</span>${compte(k, k.split('.').reduce((o, p) => o?.[p], v))}</div>`)}</fieldset>
          </div>
          <fieldset><legend>Mots-clés des frais (libellé ou fournisseur → compte)</legend><table class="lignes-fiche"><tbody>${v.motsCles.map((m, i) => h`<tr data-ligne="${i}"><td>${inp(`motsCles.${i}.motif`, m.motif)}</td><td style="width:130px">${compte(`motsCles.${i}.compte`, m.compte)}</td><td style="width:40px"><button type="button" class="btn btn-petit btn-fantome" data-suppr="${i}" aria-label="Supprimer">${icone('fermer')}</button></td></tr>`)}</tbody></table><p class="tres-petit muet">Plusieurs mots séparés par « | » : loyer|location.</p><button type="button" class="btn btn-petit" data-ajout>${icone('plus')} Ajouter un mot-clé</button></fieldset>`;
      }
      case 'export':
        return h`<p class="sous-titre">Colonnes du fichier Excel importé dans PC Compta, dans l'ordre. À caler sur le modèle d'import du cabinet (hypothèse H6).</p>
          <div class="champs champs-2"><label class="champ"><span>Nom du fichier</span>${inp('nomFichier', v.nomFichier)}<small class="aide">{dossier} et {periode} sont remplacés.</small></label><div><label class="case"><input type="checkbox" name="dateEnTexte" ${v.dateEnTexte ? brut('checked') : ''}> Dates en texte JJ/MM/AAAA (sinon dates Excel)</label><label class="case"><input type="checkbox" name="compteTiersAuxiliaire" ${v.compteTiersAuxiliaire ? brut('checked') : ''}> Comptes tiers auxiliaires (401 + fin du NIF)</label></div></div>
          <fieldset><legend>Colonnes</legend><table class="lignes-fiche"><tbody>${v.colonnes.map((c, i) => h`<tr data-ligne="${i}"><td style="width:40px" class="muet">${i + 1}</td><td><select name="colonnes.${i}.champ">${opt(Object.entries(CHAMPS_EXPORT), c.champ)}</select></td><td>${inp(`colonnes.${i}.titre`, c.titre)}</td><td style="width:40px"><button type="button" class="btn btn-petit btn-fantome" data-suppr="${i}" aria-label="Supprimer">${icone('fermer')}</button></td></tr>`)}</tbody></table><button type="button" class="btn btn-petit" data-ajout>${icone('plus')} Ajouter une colonne</button></fieldset>
          <fieldset><legend>Codes des journaux dans PC Compta</legend><div class="champs champs-4">${Object.entries(v.codesJournaux).map(([k, c]) => h`<label class="champ"><span>${k}</span>${inp(`codesJournaux.${k}`, c)}</label>`)}</div></fieldset>`;
      case 'relances':
        return h`<p class="sous-titre">Le serveur prépare chaque matin, les jours choisis, les brouillons de relance des dossiers incomplets. Ils attendent toujours une validation dans la boîte d'envoi.</p>
          <div class="champs champs-3"><label class="champ"><span>Jours du mois</span>${inp('jours', (v.jours || []).join(', '))}<small class="aide">Ex. : 5, 12</small></label>
          <label class="champ"><span>Modèle du 1er rappel</span>${inp('modeleParDefaut', v.modeleParDefaut)}</label><label class="champ"><span>Modèle des rappels suivants</span>${inp('modeleRappel', v.modeleRappel)}</label></div>`;
      default:
        return '';
    }
  }

  function dessiner() {
    monter(
      el,
      h`<nav class="onglets">${ONGLETS.map(([k, l]) => h`<a href="#/parametres?onglet=${k}" class="${k === onglet ? 'actif' : ''}">${l}</a>`)}</nav>
      <form class="carte" id="f-param">${formulaire()}
        <div class="ligne-actions" style="margin-top:14px"><button class="btn btn-primaire" type="submit">${icone('ok')} Enregistrer</button><span class="ecart"></span><button class="btn btn-fantome" type="button" data-defaut>Remettre les valeurs par défaut</button></div>
      </form>`,
    );
  }
  dessiner();

  function lire() {
    const f = el.querySelector('#f-param');
    const val = (n) => f.elements[n]?.value ?? '';
    const coche = (n) => Boolean(f.elements[n]?.checked);
    switch (onglet) {
      case 'site': {
        const s = { ...v };
        for (const k of ['accroche', 'titre', 'sousTitre', 'boutonPrincipal', 'boutonSecondaire', 'etapesTitre', 'engagementsTitre', 'contactTitre', 'contactTexte', 'mentions']) s[k] = val(k);
        for (const l of ['services', 'etapes', 'engagements']) s[l] = v[l].map((x, i) => ({ titre: val(`${l}.${i}.titre`), texte: val(`${l}.${i}.texte`) }));
        return s;
      }
      case 'cabinet':
        return Object.fromEntries(Object.keys(v).map((k) => [k, val(k)]));
      case 'modeles':
        return v.map((m, i) => ({ ...m, nom: val(`${i}.nom`), usage: val(`${i}.usage`), canal: val(`${i}.canal`), objet: val(`${i}.objet`), corps: val(`${i}.corps`) }));
      case 'echeancier':
        return v.map((x, i) => ({ ...x, actif: coche(`${i}.actif`), organisme: val(`${i}.organisme`), libelle: val(`${i}.libelle`), frequence: val(`${i}.frequence`), jour: Number(val(`${i}.jour`)), mois: val(`${i}.mois`).split(/[,;\s]+/).filter(Boolean).map(Number), decalage: Number(val(`${i}.decalage`)) || 0, concerne: val(`${i}.concerne`), verifie: coche(`${i}.verifie`), source: val(`${i}.source`), note: val(`${i}.note`) }));
      case 'pieces':
        return v.map((x, i) => ({ ...x, actif: coche(`${i}.actif`), libelle: val(`${i}.libelle`), type: val(`${i}.type`), condition: val(`${i}.condition`) }));
      case 'schemas': {
        const s = structuredClone(v);
        for (const el2 of f.querySelectorAll('input[name]')) {
          const chemin = el2.name.split('.');
          if (chemin[0] === 'motsCles') continue;
          let o = s;
          for (const p of chemin.slice(0, -1)) o = o[p] ||= {};
          const c = el2.value.trim();
          if (c) o[chemin.at(-1)] = c;
          else delete o[chemin.at(-1)];
        }
        s.motsCles = v.motsCles.map((m, i) => ({ motif: val(`motsCles.${i}.motif`), compte: val(`motsCles.${i}.compte`) })).filter((m) => m.motif && m.compte);
        return s;
      }
      case 'export':
        return { ...v, nomFichier: val('nomFichier'), dateEnTexte: coche('dateEnTexte'), compteTiersAuxiliaire: coche('compteTiersAuxiliaire'), colonnes: v.colonnes.map((c, i) => ({ champ: val(`colonnes.${i}.champ`), titre: val(`colonnes.${i}.titre`) })), codesJournaux: Object.fromEntries(Object.keys(v.codesJournaux).map((k) => [k, val(`codesJournaux.${k}`)])) };
      case 'relances':
        return { ...v, jours: val('jours').split(/[,;\s]+/).filter(Boolean).map(Number), modeleParDefaut: val('modeleParDefaut'), modeleRappel: val('modeleRappel') };
      default:
        return v;
    }
  }

  const NOUVEAU = {
    modeles: () => ({ id: nouvelId('mod'), nom: 'Nouveau modèle', usage: 'relance', canal: 'email', objet: '', corps: 'Bonjour {{contact}},\n\n{{signature}}' }),
    echeancier: () => ({ id: nouvelId('ech'), organisme: 'DGI', libelle: 'Nouvelle échéance', frequence: 'annuelle', jour: 20, mois: [1], decalage: 0, concerne: 'tous', lien: '', actif: true, verifie: false, source: '', note: '' }),
    pieces: () => ({ id: nouvelId('pc'), libelle: 'Nouvelle pièce', type: 'autre', condition: 'toujours', actif: true }),
  };
  sur(el, 'click', '[data-ajout]', () => {
    v = lire();
    if (onglet === 'schemas') v.motsCles.push({ motif: '', compte: '' });
    else if (onglet === 'export') v.colonnes.push({ champ: 'libelle', titre: 'Nouvelle colonne' });
    else v.push(NOUVEAU[onglet]());
    dessiner();
  });
  sur(el, 'click', '[data-suppr]', (e, b) => {
    v = lire();
    const i = Number(b.dataset.suppr);
    if (onglet === 'schemas') v.motsCles.splice(i, 1);
    else if (onglet === 'export') v.colonnes.splice(i, 1);
    else v.splice(i, 1);
    dessiner();
  });
  sur(el, 'submit', '#f-param', async (e) => {
    e.preventDefault();
    try {
      v = lire();
      await ctx.c.appel('PUT', `/parametres/${onglet}`, { valeur: v });
      toast('Paramètres enregistrés.', 'ok');
    } catch (err) {
      toast(err.message, 'erreur');
    }
  });
  sur(el, 'click', '[data-defaut]', async () => {
    if (!(await confirmer('Remettre les valeurs par défaut ?', 'Les modifications de cet onglet seront perdues.', 'Remettre par défaut', 'btn-danger'))) return;
    await ctx.c.appel('POST', `/parametres/${onglet}/reinitialiser`);
    ctx.rafraichir();
  });
}
