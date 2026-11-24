# Studio de prompts de Hooked Academy

Page de l'espace élève : `#/prompts` (ou `#/prompts/<modèle>`), entrée « Studio de prompts » dans la barre latérale,
juste sous l'accueil, et bouton central de la barre du bas sur téléphone. Elle remplace le petit générateur de la page
« Outils IA » (qui garde un lien vers le studio).

- Modèles et moteur : `sites/hooked-academy/data/prompts.js`
- Page : `sites/hooked-academy/assets/js/prompt-studio.js` (styles : `assets/css/app.css`, section « Studio de prompts »)
- Textes de l'interface : `assets/js/i18n/app.js` (clés `app.ps.*`), en français, anglais et arabe

## Ce que fait la page

| Fonction | Détail |
|---|---|
| 18 modèles, 5 familles | Créative (hooks, angles et objections, script, plan de tournage, analyse d'une pub, texte d'annonce) · IA (image produit, retouche, vidéo, voix off ElevenLabs v3, storyboard complet) · Sites & Apps (site vitrine, fonctionnalité, bug, audit de sécurité) · Vendre (prospection, offre en 3 formules) · Mieux prompter (améliorer mon prompt) |
| Mode Expert / Rapide | Expert : rôle, contexte, tâche, méthode, règles avec leur raison, exemples, format, vérification notée, gestion des infos manquantes, le tout en balises. Rapide : la version courte, avec des titres. |
| Aperçu annoté | Chaque partie du prompt est nommée et colorée (survol : pourquoi elle sert). « Texte brut » montre exactement ce qui est copié. |
| Force du prompt | Note de 0 à 100 et le prochain conseil (champ qui manque, mode expert, contexte de marque). |
| Options | Nombre, langue du résultat (darija en lettres arabes ou latines, français, arabe, anglais), plateforme, ton, durée, format, outil, mouvement de caméra, son, etc. |
| Mon contexte | La marque de l'élève (nom, ville, cible, ton, ce qu'il faut toujours rappeler), ajoutée à ses prompts. |
| Prompts récents | Les 12 derniers prompts copiés, à recopier ou rouvrir. |
| Étape suivante | Chaîne de prompts : hooks → script → tournage / voix off → storyboard…, les champs suivent. |
| Ouvrir dans… | ChatGPT et Claude s'ouvrent avec le prompt pré-rempli (s'il n'est pas trop long) ; les autres outils s'ouvrent et le prompt est déjà copié. |
| Leçons | Sous la vidéo d'une leçon dont le module a un modèle (ex. M02 → hooks, IA02 → image, D04 → site vitrine), une carte « Générer le prompt de cette leçon ». |
| Compte démo | 3 modèles ouverts (hooks, image produit, site vitrine) ; les autres affichent « s'ouvre à l'inscription ». |

« Mon contexte » et les prompts récents restent dans le navigateur de l'élève (localStorage) : ce sont des aides de
confort, rien n'est envoyé au serveur.

## Les techniques appliquées (guides officiels, novembre 2026)

| Technique | Où dans le prompt | Source |
|---|---|---|
| Donner tout le contexte (produit, cible, marché, contraintes) | `<context>`, `<brand>` | Anthropic, OpenAI |
| Tâche explicite et chiffrée (nombre, durée, format) | `<task>` | Anthropic (« ask for the action explicitly ») |
| La raison de chaque consigne | `<rules>` | Anthropic (« give the why ») |
| Consignes en positif, sans contradiction | `<rules>` | Anthropic ; OpenAI GPT-5.2 (les contradictions coûtent cher) ; Google (« empty street » plutôt que « no cars ») |
| Parties séparées par des balises | tout le prompt (mode expert) | Anthropic (XML) ; OpenAI GPT-5.2 (blocs balisés) |
| Exemples variés, « s'inspirer du niveau sans copier » | `<examples>` | Anthropic (3 à 5 exemples variés) |
| Longueur demandée explicitement, aller droit au but | `<output_format>` | Anthropic (modèles récents) ; OpenAI GPT-5.2 (longueur chiffrée) |
| Relecture avec des critères, notes sur 10, réécrire sous 8 | `<quality_check>` | Anthropic (brouillon → relecture → correction) ; OpenAI (grille de qualité) |
| 1 à 3 questions OU hypothèse annoncée | `<missing_info>` | OpenAI GPT-5.2 |
| Faire exactement ce qui est demandé, le reste en option | règles des modèles Sites & Apps | OpenAI GPT-5.2 (« scope discipline ») |
| Métaprompt : améliorer un prompt, retouches minimales ou réécriture | modèle « Améliorer mon prompt » | OpenAI (metaprompting) |
| Image : verbe d'action + sujet, scène en phrases, cadrage, lumière et objectif, texte exact entre guillemets avec la police, rôle de la photo de référence, ce qui doit rester identique, format | modèles « Image produit » et « Retoucher une photo » | Google (Nano Banana Pro / Nano Banana 2) |
| Vidéo : cadrage + sujet + action + contexte + style, un seul mouvement de caméra, dialogue entre guillemets, sons décrits, durée 4/6/8 s pour Veo | modèle « Vidéo IA » | Google (Veo 3.1) |
| Kling : sujet + mouvement + scène + caméra + lumière, champ « negative prompt » séparé | modèle « Vidéo IA » (outil Kling) | Kling |
| Voix : balises audio entre crochets accordées à la voix, pauses par la ponctuation (pas de SSML), une majuscule d'insistance, réglage Creative ou Natural | modèle « Voix off ElevenLabs v3 » | ElevenLabs |

Règle de la maison appliquée partout : aucun avis, chiffre ou promesse inventé (et contenus d'exemple signalés).

## Sources

- [Anthropic — Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [OpenAI — GPT-5.2 prompting guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5-2_prompting_guide) ·
  [GPT-5 prompting guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide)
- [Google — 7 tips for Nano Banana Pro](https://blog.google/products/gemini/prompting-tips-nano-banana-pro/) ·
  [Ultimate prompting guide for Nano Banana](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)
- [Google — Ultimate prompting guide for Veo 3.1](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1) ·
  [Veo prompt guide (DeepMind)](https://deepmind.google/models/veo/prompt-guide/)
- [Kling — Negative prompts](https://kling.ai/blog/kling-ai-negative-prompts-fix-video-distortion)
- [ElevenLabs — Prompting Eleven v3](https://elevenlabs.io/docs/best-practices/prompting/eleven-v3)

## Ajouter ou modifier un modèle

Dans `data/prompts.js`, un modèle est un objet de `TEMPLATES` : `id`, famille `g`, `icon`, `title` et `sub` (FR, EN, AR),
`fields` (voir `FIELDS`) et `req` (obligatoires), `opts` (voir `OPTS`) et `def` (valeurs par défaut), `tools` (où
l'ouvrir), `next` (étape suivante), puis le texte : `role`, `task`, `method` (mode expert), `rules`, `examples` (mode
expert), `format`, `check` (+ `score`, `recommend`), `honest` (ajoute la règle « rien d'inventé »), et `ex` pour remplacer
l'exemple d'un champ (bouton « Voir un exemple ») quand celui de `FIELDS` ne colle pas au modèle. Les modèles d'image et
de vidéo (`media`) sont assemblés en anglais par `mediaImage`, `mediaEdit` et `mediaVideo`. Pour proposer un modèle sous
les leçons d'un module : `LESSON_TEMPLATE`.
