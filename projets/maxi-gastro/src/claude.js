// Rédaction des fiches par Claude (API Anthropic, SDK officiel @anthropic-ai/sdk).
// - Consigne figée et mise en cache (prompt caching) : seule la partie produit change d'une fiche à l'autre.
// - Sortie structurée : la réponse respecte SCHEMA_FICHE (JSON garanti), puis le moteur vérifie
//   que chaque chiffre existe dans les données fournisseur (chiffresOrphelins) et les longueurs SEO.
// - Une fiche à la fois (validation au passe) ou par lots de milliers via l'API Message Batches (−50 %).
// - Modèle par défaut : claude-opus-5-5, effort « medium » (réglable par CLAUDE_EFFORT).
import { CONSIGNE_FICHE, SCHEMA_FICHE, messageFiche, chiffresOrphelins, controlerLongueurs } from './noyau/prompt-fiche.js';

const MODELE = () => process.env.CLAUDE_MODELE || 'claude-opus-5-5';
const EFFORT = () => process.env.CLAUDE_EFFORT || 'medium';

async function client() {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  return new Anthropic(); // ANTHROPIC_API_KEY lu dans l'environnement
}

/** Paramètres communs (identiques en direct et en lot, pour profiter du cache). */
export function parametresFiche({ donnees, motsCles, ficheActuelle }) {
  return {
    model: MODELE(),
    max_tokens: 16000,
    system: [{ type: 'text', text: CONSIGNE_FICHE, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: messageFiche({ donnees, motsCles, ficheActuelle }) }],
    output_config: { effort: EFFORT(), format: { type: 'json_schema', schema: SCHEMA_FICHE } },
  };
}

/** Lit la réponse, vérifie la fiche. Renvoie { fiche, controles } ou lève une erreur explicite. */
export function lireReponse(message, donnees) {
  if (message.stop_reason === 'refusal') throw new Error(`Claude a décliné la demande (${message.stop_details?.category ?? 'sans catégorie'})`);
  if (message.stop_reason === 'max_tokens') throw new Error('Réponse coupée (max_tokens) : fiche à relancer');
  const texte = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  const fiche = JSON.parse(texte);
  const orphelins = chiffresOrphelins(fiche, donnees);
  const longueurs = controlerLongueurs(fiche);
  return {
    fiche,
    controles: { orphelins, longueurs, publiable: orphelins.length === 0 && longueurs.length === 0 && fiche.confiance !== 'basse' },
    usage: message.usage,
  };
}

/** Une fiche, tout de suite (avec repli automatique côté serveur si le modèle décline). */
export async function rediger({ donnees, motsCles = [], ficheActuelle = '' }) {
  const anthropic = await client();
  try {
    const message = await anthropic.beta.messages.create({
      ...parametresFiche({ donnees, motsCles, ficheActuelle }),
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    });
    return lireReponse(message, donnees);
  } catch (err) {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    if (err instanceof Anthropic.RateLimitError) throw new Error('Claude : limite de débit atteinte, réessayer plus tard', { cause: err });
    if (err instanceof Anthropic.AuthenticationError) throw new Error('Claude : clé ANTHROPIC_API_KEY invalide', { cause: err });
    if (err instanceof Anthropic.BadRequestError) throw new Error(`Claude : requête refusée (${err.message})`, { cause: err });
    throw err;
  }
}

/**
 * Lance un lot (jusqu'à 100 000 fiches, résultat en général en moins d'une heure, moitié prix).
 * demandes = [{ cle, donnees, motsCles, ficheActuelle }]. Renvoie l'identifiant du lot.
 */
export async function lancerLot(demandes) {
  const anthropic = await client();
  const lot = await anthropic.messages.batches.create({
    requests: demandes.map((d) => ({ custom_id: idLot(d.cle), params: parametresFiche(d) })),
  });
  return { id: lot.id, statut: lot.processing_status, nb: demandes.length };
}

/** Récupère un lot terminé. Les résultats arrivent dans le désordre : on les range par custom_id. */
export async function recupererLot(id, donneesParCle) {
  const anthropic = await client();
  const lot = await anthropic.messages.batches.retrieve(id);
  if (lot.processing_status !== 'ended') return { termine: false, statut: lot.processing_status, compteurs: lot.request_counts };
  const fiches = [];
  const erreurs = [];
  for await (const r of await anthropic.messages.batches.results(id)) {
    const cle = cleDepuisId(r.custom_id, donneesParCle);
    if (r.result.type !== 'succeeded') {
      erreurs.push({ cle, erreur: r.result.type });
      continue;
    }
    try {
      fiches.push({ cle, ...lireReponse(r.result.message, donneesParCle.get(cle)) });
    } catch (err) {
      erreurs.push({ cle, erreur: err.message });
    }
  }
  return { termine: true, fiches, erreurs };
}

// custom_id : 64 caractères maximum, lettres, chiffres, « _ » et « - ».
const idLot = (cle) => cle.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
const cleDepuisId = (id, donneesParCle) => [...donneesParCle.keys()].find((k) => idLot(k) === id) ?? id;
