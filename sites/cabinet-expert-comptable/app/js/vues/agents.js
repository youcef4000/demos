// Agents IA : ce qu'ils font, ce qu'ils ne font pas, leur prompt système, leurs chiffres, leurs réglages.
import { h, brut, monter, icone, sur, toast } from '../ui.js';
import { encadreHumain } from './commun.js';

const FICHES = {
  lecteur_pieces: {
    role: 'Lit une facture, un avoir ou un état de paie (photo, scan, PDF) et propose une fiche : montants HT, TVA, timbre, TTC, tiers et NIF, mode de paiement, nature de l’opération, IRG de la paie.',
    declencheur: 'Dépôt d’une pièce par le client ou le cabinet ; bouton « Relire avec l’agent ».',
    entrees: 'La pièce, la raison sociale, le NIF et l’activité du dossier. Rien d’autre : ni historique, ni autres clients.',
    sorties: 'Une fiche structurée, une confiance, les champs incertains, des remarques.',
    validation: 'La fiche reste « À valider » : un collaborateur la compare à l’image, corrige, puis clique « Valider la fiche ».',
    besoins: 'Mémo 1 (00:55 – 01:08) : HT, TVA, droit de timbre, TTC, mode de paiement ; nature (00:45) ; mémo 2 (00:31) : IRG de la paie.',
  },
  imputation_scf: {
    role: 'Propose un compte du SCF pour une ligne qu’aucune règle du cabinet ne couvre (immobilisation, frais inhabituel), avec une justification d’une phrase.',
    declencheur: '« Valider la fiche », seulement pour les lignes sans compte saisi, sans historique fournisseur, sans mot-clé et sans schéma de nature.',
    entrees: 'La ligne, la nature, le fournisseur, l’activité du dossier, le plan de comptes du cabinet.',
    sorties: 'Un compte du plan, une justification, une confiance.',
    validation: 'L’écriture reste « Proposée », marquée « compte proposé par l’agent » : un collaborateur la corrige ou la valide avant tout export vers PC Compta.',
    besoins: 'Mémo 1 (01:45 – 01:55) : proposer le schéma de comptabilisation de chaque journal.',
  },
};

export default async function (el, ctx) {
  const r = await ctx.c.appel('GET', '/agents');
  const associe = ctx.u.role === 'associe';
  const s = r.stats;
  monter(
    el,
    h`${encadreHumain('Deux agents seulement, pour les deux tâches qui demandent de lire ou de juger. Tout le reste (achat ou vente, journal, G50, échéances, relances) suit des règles fixes. Aucun agent ne peut envoyer un message, valider une écriture ou une déclaration.')}
    ${ctx.c.mode === 'demo' ? h`<div class="encadre info">${icone('info')}<p>Démonstration : les agents sont simulés sur les pièces d'exemple. Sur le serveur du cabinet, ils appellent Claude (Anthropic) avec les prompts ci-dessous, si l'option est activée (voir 03_architecture.md, hébergement et loi 18-07).</p></div>` : ''}
    <div class="grille grille-2">
      ${r.agents.map((a) => {
        const f = FICHES[a.id];
        const st = a.id === 'lecteur_pieces' ? h`<div class="kpis" style="grid-template-columns:repeat(3,1fr)"><div class="kpi"><small>Pièces lues</small><b>${s.lecteur_pieces.lues}</b></div><div class="kpi"><small>Corrigées</small><b>${s.lecteur_pieces.corrigees}</b></div><div class="kpi"><small>Confiance moyenne</small><b>${s.lecteur_pieces.confianceMoyenne} %</b></div></div>` : h`<div class="kpis" style="grid-template-columns:repeat(2,1fr)"><div class="kpi"><small>Comptes proposés</small><b>${s.imputation_scf.proposees}</b></div><div class="kpi"><small>Corrigés par le cabinet</small><b>${s.imputation_scf.corrigees}</b></div></div>`;
        const reglage = r.reglages[a.id] || {};
        return h`<section class="carte">
          <div class="carte-tete"><span class="avatar" style="background:#efe9fb;color:#5b3aa8">${icone('agent')}</span><h2>${a.nom}</h2><span class="actions"><span class="badge ${reglage.actif === false ? '' : 'ok'}">${reglage.actif === false ? 'Désactivé' : 'Actif'}</span></span></div>
          ${st}
          <table class="tableau petit"><tbody>
            <tr><td class="muet">Rôle</td><td>${f.role}</td></tr>
            <tr><td class="muet">Déclencheur</td><td>${f.declencheur}</td></tr>
            <tr><td class="muet">Entrées</td><td>${f.entrees}</td></tr>
            <tr><td class="muet">Sorties</td><td>${f.sorties}</td></tr>
            <tr><td class="muet"><b>Validation humaine</b></td><td><b>${f.validation}</b></td></tr>
            <tr><td class="muet">Besoin couvert</td><td>${f.besoins}</td></tr>
          </tbody></table>
          <details><summary>Prompt système (agents/${a.id}/prompt_systeme.md)</summary><pre class="apercu-message" style="max-height:360px;overflow:auto;font-size:0.8rem">${a.prompt || 'Prompt non chargé.'}</pre></details>
          ${associe
            ? h`<form class="ligne-actions" data-reglage="${a.id}" style="margin-top:10px"><label class="case" style="margin:0"><input type="checkbox" name="actif" ${reglage.actif === false ? '' : brut('checked')}> Agent actif</label>${a.id === 'lecteur_pieces' ? h`<label class="periode-choix">Seuil d'alerte <input class="saisie" name="seuil" type="number" min="50" max="99" value="${Math.round((reglage.seuilConfiance ?? 0.8) * 100)}" style="width:70px"> %</label>` : ''}<button class="btn btn-petit" type="submit">Enregistrer</button></form>`
            : ''}
        </section>`;
      })}
    </div>`,
  );
  sur(el, 'submit', '[data-reglage]', async (e) => {
    e.preventDefault();
    const f = e.target;
    const v = structuredClone(r.reglages);
    v[f.dataset.reglage] = { ...(v[f.dataset.reglage] || {}), actif: f.actif.checked, ...(f.seuil ? { seuilConfiance: Number(f.seuil.value) / 100 } : {}) };
    try {
      await ctx.c.appel('PUT', '/parametres/agents', { valeur: v });
      toast('Réglage enregistré.', 'ok');
      ctx.rafraichir();
    } catch (err) {
      toast(err.message, 'erreur');
    }
  });
}
