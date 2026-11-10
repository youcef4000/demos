// Agents IA du cabinet sur l'API Claude (SDK officiel @anthropic-ai/sdk).
// - Prompts système lus dans agents/<nom>/prompt_systeme.md, mis en cache (seule la pièce change d'un appel à l'autre).
// - Sortie JSON imposée par agents/<nom>/schema.json (structured outputs), revérifiée par les contrôles du noyau.
// - Repli automatique côté serveur si le modèle décline (fallbacks « default »).
// - Les agents ne reçoivent que la pièce et l'identité du dossier : ni historique, ni autres clients.
// - Ils ne font que proposer : la validation et toute action sortante restent dans les routes réservées au cabinet.
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ici = dirname(fileURLToPath(import.meta.url));
const DOSSIER_AGENTS = join(ici, '..', 'agents');
const lireAgent = (nom) => ({
  prompt: readFileSync(join(DOSSIER_AGENTS, nom, 'prompt_systeme.md'), 'utf8'),
  schema: JSON.parse(readFileSync(join(DOSSIER_AGENTS, nom, 'schema.json'), 'utf8')),
});
const LECTEUR = lireAgent('lecteur_pieces');
const IMPUTATION = lireAgent('imputation_scf');

const MODELE = () => process.env.CLAUDE_MODELE || 'claude-opus-5-5';
const EFFORT = () => process.env.CLAUDE_EFFORT || 'low';
const IMAGES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

let clientAnthropic;
async function client() {
  if (!clientAnthropic) {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    clientAnthropic = new Anthropic(); // ANTHROPIC_API_KEY lu dans l'environnement
  }
  return clientAnthropic;
}

async function appeler({ agent, contenu }) {
  const anthropic = await client();
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  try {
    const message = await anthropic.beta.messages.create({
      model: MODELE(),
      max_tokens: 16000,
      system: [{ type: 'text', text: agent.prompt, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: contenu }],
      output_config: { effort: EFFORT(), format: { type: 'json_schema', schema: agent.schema } },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    });
    if (message.stop_reason === 'refusal') throw new Error(`l'agent a décliné (${message.stop_details?.category ?? 'sans catégorie'})`);
    if (message.stop_reason === 'max_tokens') throw new Error('réponse coupée, relancer la lecture');
    const texte = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    return { sortie: JSON.parse(texte), modele: message.model, usage: message.usage };
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) throw new Error('clé ANTHROPIC_API_KEY invalide', { cause: err });
    if (err instanceof Anthropic.RateLimitError) throw new Error('limite de débit atteinte, réessayer dans une minute', { cause: err });
    if (err instanceof Anthropic.BadRequestError) throw new Error(`requête refusée par l'API (${err.message})`, { cause: err });
    if (err instanceof Anthropic.APIConnectionError) throw new Error('API Claude injoignable', { cause: err });
    throw err;
  }
}

const propre = (t) => Object.fromEntries(Object.entries(t || {}).map(([k, v]) => [k, v ?? '']));

/**
 * Crée les moteurs d'agents. fichiers.lire(ref) → { octets: Buffer, mime }.
 * AGENTS=desactive : pas d'appel externe (option A tant que l'autorisation ANPDP n'est pas obtenue).
 */
export function creerMoteursClaude({ fichiers }) {
  if (process.env.AGENTS === 'desactive') return {};
  return {
    async lirePiece({ piece, dossier }) {
      const { octets, mime } = await fichiers.lire(piece.fichier.ref);
      const donnees = octets.toString('base64');
      const bloc = mime === 'application/pdf' ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: donnees } } : IMAGES.has(mime) ? { type: 'image', source: { type: 'base64', media_type: mime, data: donnees } } : null;
      if (!bloc) throw new Error(`format ${mime} non lu (JPEG, PNG, WebP, GIF ou PDF)`);
      const contexte = [
        `Dossier : ${dossier.raisonSociale}`,
        `NIF du dossier : ${dossier.nif || 'non renseigné'}`,
        `Activité : ${dossier.activite || 'non renseignée'}`,
        `Type annoncé au dépôt : ${piece.type}`,
        `Période de rattachement annoncée : ${piece.periode}`,
        piece.commentaire ? `Commentaire du déposant : ${piece.commentaire}` : '',
      ].filter(Boolean).join('\n');
      const { sortie, modele } = await appeler({ agent: LECTEUR, contenu: [bloc, { type: 'text', text: `${contexte}\n\nLis cette pièce et rends la fiche.` }] });
      const fiche = {
        typeDoc: sortie.typeDoc,
        numero: sortie.numero || '',
        date: sortie.date || '',
        emetteur: propre(sortie.emetteur),
        destinataire: propre(sortie.destinataire),
        nature: sortie.nature || '',
        lignes: (sortie.lignes || []).map((l) => ({ libelle: l.libelle, montantHT: l.montantHT, tauxTVA: l.tauxTVA })),
        totalHT: sortie.totalHT,
        totalTVA: sortie.totalTVA,
        timbre: sortie.timbre || 0,
        totalTTC: sortie.totalTTC,
        modePaiement: sortie.modePaiement || 'a_terme',
        datePaiement: sortie.datePaiement || '',
        ...(sortie.paie ? { paie: sortie.paie } : {}),
      };
      return { fiche, confiance: Math.max(0, Math.min(1, Number(sortie.confiance) || 0)), incertains: sortie.incertains || [], remarques: sortie.remarques || [], modele };
    },

    async imputer({ ligne, fiche, dossier, plan }) {
      const comptes = Object.entries(plan).filter(([c]) => /^[1-7]/.test(c) && !/^(401|404|411|445|512|53)/.test(c)).map(([c, l]) => `${c} — ${l}`).join('\n');
      const texte = [
        `Dossier : ${dossier.raisonSociale} — activité : ${dossier.activite || 'non renseignée'}`,
        `Sens : ${fiche.sens === 'vente' ? 'vente' : 'achat'} — nature de la facture : ${fiche.nature || 'non précisée'}`,
        `${fiche.sens === 'vente' ? 'Client' : 'Fournisseur'} : ${(fiche.sens === 'vente' ? fiche.destinataire : fiche.emetteur)?.nom || 'non indiqué'}`,
        `Ligne : « ${ligne.libelle || 'sans libellé'} » — ${(ligne.montantHT / 100).toFixed(2)} DA HT — TVA ${ligne.tauxTVA} %`,
        '',
        'Plan de comptes du cabinet (choisir uniquement dans cette liste) :',
        comptes,
      ].join('\n');
      const { sortie } = await appeler({ agent: IMPUTATION, contenu: [{ type: 'text', text: texte }] });
      if (!plan[sortie.compte]) return null; // compte inventé : la ligne reste « compte à choisir »
      return { compte: sortie.compte, justification: sortie.justification, confiance: sortie.confiance };
    },
  };
}

/** Description des agents pour l'écran « Agents IA ». */
export function infosAgents() {
  return [
    { id: 'lecteur_pieces', nom: 'Lecture des pièces', prompt: LECTEUR.prompt },
    { id: 'imputation_scf', nom: 'Imputation SCF', prompt: IMPUTATION.prompt },
  ];
}

export async function lireFichierTexte(chemin) {
  return readFile(chemin, 'utf8');
}
