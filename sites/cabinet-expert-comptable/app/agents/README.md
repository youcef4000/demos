# Agents IA du cabinet

Deux agents, parce que deux tâches seulement demandent de lire ou de juger (voir `docs/03_architecture.md`) :

| Agent | Ce qu'il fait | Ce qu'il ne fait jamais |
|---|---|---|
| [`lecteur_pieces`](lecteur_pieces/) | Lit une facture, un avoir ou un état de paie et propose une fiche (montants, tiers, nature, mode de paiement) | Valider la fiche, écrire en comptabilité, contacter le client |
| [`imputation_scf`](imputation_scf/) | Propose un compte du SCF pour une ligne qu'aucune règle ne couvre | Valider l'écriture, créer un compte hors du plan du cabinet |

Chaque dossier contient le **prompt système** (`prompt_systeme.md`, lu tel quel par le serveur), le **schéma de sortie**
(`schema.json`, imposé à la réponse par l'API) et sa fiche (`README.md`).

**Validation humaine obligatoire** : aucune sortie d'agent ne quitte l'application et aucune n'entre en comptabilité
sans le clic d'un membre du cabinet. Les seules actions sortantes (e-mail, message WhatsApp, écriture exportée vers
PC Compta, G50 validée, résultat publié) sont des boutons réservés à l'associé ou au collaborateur ; les agents
n'y ont pas accès (`app/noyau/api.js`).

Modèle : Claude Opus 5.5 (`claude-opus-5-5`), effort `low`, sortie JSON imposée par le schéma, repli automatique si
le modèle décline (`fallbacks: "default"`). Réglages dans `.env` : `ANTHROPIC_API_KEY`, `CLAUDE_MODELE`,
`CLAUDE_EFFORT`, `AGENTS` (`claude` ou `desactive`).

Le serveur recopie ce dossier dans la démo (`npm run front`) pour que l'écran « Agents IA » affiche les vrais prompts.
