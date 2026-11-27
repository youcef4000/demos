# Hooked Academy — notice

Site : `sites/hooked-academy/` → https://hooked-academy.tech/

| Adresse | Contenu |
|---|---|
| `/hooked-academy/` | Landing (inscription en 3 étapes) |
| `/hooked-academy/app/` | Espace étudiant (compte démo : `demo@hooked.academy` / `DEMO-2026`, ou `app/?demo=1` ; il ne voit que les 3 premières vidéos de chaque formation, `FREE_OPEN`) |
| `/hooked-academy/app/#/prompts` | Studio de prompts : 18 modèles (Créative, IA, Sites & Apps, Vendre), mode expert, contexte de marque ; voir `formations/prompts/README.md` |
| `/hooked-academy/admin/` | Espace équipe (code démo : `HOOKED-TEAM`) |
| `/hooked-academy/motion/player.html?id=m2-l1` | Une leçon animée seule (plein écran) |

## Le circuit d'une inscription

1. Le visiteur remplit le formulaire de la landing (nom, WhatsApp, e-mail, ville, profil, objectif).
2. La fiche arrive dans **Admin → Inscriptions** (colonne « Nouvelle »).
3. L'équipe clique **Contacter** : WhatsApp s'ouvre avec un message prêt (session, tarif, paiement à la livraison).
4. Paiement reçu → **Valider** : l'accès étudiant est créé (code `HA-XXXX-XXXX`) et le message de bienvenue
   (lien, identifiant, code) s'envoie en un clic sur WhatsApp.
5. L'étudiant se connecte sur `/app/` avec son e-mail (ou téléphone) et son code.

Campagnes publicitaires : chaque inscription garde `utm_source`, `utm_campaign` et `utm_content` (vides sans lien UTM)
et le pixel Meta reçoit `Lead` après une inscription réussie (voir DEPLOIEMENT-VPS.md, « Pixel Meta »).

Nombres de leçons et de modules des pages publiques : calculés depuis le programme au chargement, et écrits aussi dans
le HTML (visibles même sans JavaScript). Après avoir ajouté ou retiré une leçon :
`node tools/hooked-academy/compteurs.mjs` (ou `--check` pour vérifier).

### Accès : ce qui est payé, un an par formation

- **Pack payé** : dans le tiroir d'une inscription (avant validation), le menu « Pack payé » corrige le pack si le prospect
  a payé autre chose que ce qu'il a choisi dans le formulaire. C'est ce pack qui s'ouvre à la validation (le choix
  d'origine reste affiché).
- **Une date par formation** (`until` de l'étudiant, côté serveur et `assets/js/store.js`) : chaque formation est ouverte
  un an à partir de son paiement. Ajouter une formation ne prolonge pas les autres ; une formation terminée ne revient pas
  avec l'achat d'une autre ; racheter une formation encore ouverte ajoute un an à partir de sa fin.
- **Admin → Étudiants → Accès** : une ligne par formation (cocher pour ouvrir, « +1 an » pour prolonger, décocher pour retirer).
- **Contrôle serveur** : les voix off des leçons (fichiers `video/voix/` et voix déposées depuis le studio) ne sont servies
  qu'à l'équipe et aux étudiants qui ont la formation, plus les leçons de l'aperçu offert.

### Aperçu offert : 5 vidéos de chaque formation non achetée

Un étudiant inscrit voit, dans les formations qu'il n'a jamais achetées, 5 leçons marquées « Offerte » (`PREVIEW`, même
liste dans `server/plateforme.js` et `assets/js/store.js`) : la vidéo et la voix off, sans les PDF ni les ressources.
Le compte démo n'y a pas accès (il reste aux 3 premières vidéos). Choix des leçons et raisons : `formations/tarifs/README.md`.

Démo sans serveur : tout est enregistré dans le navigateur (localStorage). Les fiches marquées
« exemple » sont fictives. Pour la production, seules les fonctions de `assets/js/store.js` sont à
brancher sur une API (Worker Cloudflare + D1, ou la base de Hooked Lab) : elles gardent les mêmes
entrées et sorties.

## Programme

`data/programme.js` (partie 1) et `data/programme-ia.js` (parties 2 et 3) : 13 modules, 57 leçons de
2 minutes maximum. Chaque leçon contient ses scènes animées, le texte « à dire » de chaque scène, les
points clés, le quiz et l'exercice interactif.

**Formation Sites & Apps** (troisième formation, novembre 2026) : `data/programme-dev.js`, qui réunit
`programme-dev-1.js`, `-2.js` et `-3.js` (16 modules D00–D15, 89 leçons `dv…`, dont 13 pratiques `prat: true` et les
3 vidéos de présentation de D00, places réservées dans `data/videos-ecran.js`). **100 % vibe coding** : l'élève dirige
Claude Code ou Codex par des demandes en français, sans commande ni éditeur de code ; les scènes montrent la demande et la
réponse de l'agent (type `prompt`). Ses vidéos ont leur propre thème « code » (`motion/dev.css`, classe `.is-dev` posée par
`engine.js`) et ses types de scènes (`motion/scenes-dev.js` : `terminal`, `code`, `browser`, `tree`, `diff`, `gitgraph`,
`alert`, dont seuls `browser`, `tree`, `gitgraph`, `alert` et `code` pour les fichiers en français servent encore).
Images des leçons : `assets/img/lecons/dv*.webp` (comme les deux autres formations) ; fiches PDF :
`TRACK=dev LANGS=fr node tools/hooked-academy/fiches-lecons.mjs`.
Documents (recherches, tournages, modèles) : `formations/sites-et-apps/`.
Anglais et arabe : `data/i18n/<langue>/dv0.js … dv15.js` traduisent les titres, les présentations des modules et les
points essentiels (environ 10 % des textes, voir `i18n-check.mjs`) ; les scènes, quiz et exercices restent en français.

Sur la landing (`index.html`) et la page `/ia/`, la formation a son panneau « Formation 03 », du même format que les
deux autres, avec à côté le site qui se construit au défilement en cinq étapes (décrire, coder, vérifier, mobile, en
ligne) : `assets/js/site-build.js` et `assets/css/site-build.css`, partagés par les deux pages.

## Les offres (novembre 2026)

Prix (`data/offres.js`, ou Admin → Réglages, qui priment alors) : Créative 20 000 DA, IA 25 000 DA, Sites & Apps
30 000 DA, pack Créative + IA 35 000 DA, pack complet (les trois) 50 000 DA.

La section prix de la landing et de `/ia/` est un configurateur, **« Compose ta formule »** (`assets/js/compose.js`,
`assets/css/compose.css`) : trois formules toutes faites, ou les formations à cocher (les trois le sont au départ), et un
ticket qui calcule en direct la meilleure formule, la remise, le prix par leçon et par jour, « À payer aujourd'hui : 0 DA »,
et propose le pack qui ajoute le plus pour le moins. Thème « cut » sur la landing (sauts, panneau à volets, tampon),
« glass » sur `/ia/` (verre, bordure animée, confettis au pack complet) ; immobile en mouvement réduit, liste des prix sans
JavaScript. Le bouton du ticket remplit le formulaire (identifiants serveur inchangés : `creative`, `ia`, `dev`, `both`,
`all`). Leviers psychologiques, sources et limites (aucun faux avis, faux compte à rebours ni fausse rareté) :
`formations/tarifs/README.md`.

## Hooked Lab masqué (novembre 2026)

Hooked Lab n'est pas encore ouvert : la plateforme n'en parle nulle part, mais rien n'est supprimé. L'interrupteur est
`data/hooked-lab.js` (`LAB = false`) :

- landing et `/ia/` : section, liens, question de la FAQ et mentions cachées (attribut `hidden`, texte d'origine en commentaire) ;
- espace étudiant : lien du menu et cartes Hooked Lab non affichés ; FAQ : la question « Quel est le lien avec Hooked Lab ? »
  est cachée et les autres réponses passent par le masque ;
- leçons (9 leçons, français, anglais, arabe et darija du prompteur) : `MASQUE` remplace les passages à l'affichage
  (`data/programme.js`, étape 4) ; l'animation d'analyse (IA08 · L02) affiche « Analyse » au lieu de la marque ;
- fiches PDF et `liens.txt` : régénérés sans Hooked Lab (`fiches-lecons.mjs` applique le même masque).

Pour tout remettre : `LAB = true`, puis `node tools/hooked-academy/fiches-lecons.mjs m2-l10 m7-l1 ia0-l1 ia7-l1 ia7-l2
ia7-l3 ia7-l4 ia8-l3 ia9-l1` et `node tools/hooked-academy/ressources.mjs`, et retirer les attributs `hidden` notés
« caché tant que Hooked Lab n’est pas ouvert ».

## Les vidéos

Chaque leçon est une composition animée (`motion/`) : la plateforme la lit directement, et le même
code la rend en MP4 image par image.

- **Montées sur la voix off réelle** (reprises et faux départs coupés, pauses resserrées, son nettoyé et
  normalisé à −16 LUFS) :

  | Leçon | Rush utilisé | Durée |
  |---|---|---|
  | M01 · L01 — Qu’est-ce qu’une créative ? | 25/06 20:29, prise unique | 0:52 |
  | M01 · L02 — Les outils nécessaires | 25/06 20:35, dernière prise (à partir de 3:11) | 0:58 |
  | M02 · L01 — Hook · Body · CTA (la structure) | 25/06 20:41, dernière prise (à partir de 2:32) | 1:49 |

  Les premières prises (25/06 20:01 et 20:04) restent dans l’historique Git.
- **Les autres leçons** : animation complète, voix off à enregistrer.

### Enregistrer une voix off (sans montage)

1. **Admin → Studio voix off** → choisir la leçon → **Enregistrer ma voix**.
2. Compte à rebours, l'animation démarre : le texte à dire s'affiche scène par scène sous la vidéo.
3. Écouter la prise avec l'animation, recommencer si besoin, puis **Télécharger la voix**.
4. Déposer le fichier tel quel dans `sites/hooked-academy/video/voix/` sur GitHub
   (**Add file → Upload files**, branche `main`).
5. L'action **Vidéos hooked-academy** rend le MP4 avec la voix (nettoyée et normalisée), le publie dans
   `video/` et met à jour `video/manifest.json` : la plateforme lit alors ce MP4.

### Rendre des MP4 à la main

Actions → **Vidéos hooked-academy** → Run workflow : `toutes`, `voix`, ou une liste (`m2-l1 m2-l2`).
Les MP4 sont aussi fournis en artefact téléchargeable (muets si pas de voix, prêts pour CapCut).

En local :

```bash
cd tools/hooked-academy && npm i --no-save playwright@1.56.1 && npx playwright install chromium && cd ../..
node tools/hooked-academy/render.mjs m2-l1            # une leçon
node tools/hooked-academy/render.mjs --all --out out  # tout, dans out/
```

## Les ressources des leçons (PDF, prompts, liens, fichiers)

L'équipe ajoute ses supports leçon par leçon, sans toucher au code : ils s'affichent dans l'espace
étudiant (atelier des leçons IA, onglet Ressources des leçons créatives, page Ressources) et dans
**Admin → Ressources**, qui explique la marche à suivre et montre ce qui est en ligne.

1. **Admin → Ressources** → ouvrir la leçon → **Déposer des fichiers** : GitHub s'ouvre sur
   `sites/hooked-academy/ressources/<leçon>/` (ex. `ressources/ia1-l2/`).
2. Glisser les fichiers, **Commit changes** sur `main`.
3. L'action **Ressources hooked-academy** lance `tools/hooked-academy/ressources.mjs`, qui régénère
   `ressources/manifest.json` (commité seulement s'il change), puis relance le miroir GitHub Pages.

| Fichier | Devient |
|---|---|
| `.pdf` | PDF |
| `.txt`, `.md` | un prompt par fichier (texte copié par l'étudiant ; `# Titre` en première ligne, facultatif) |
| `liens.txt` | une ligne par lien : `Titre \| https://…` |
| `.png`, `.jpg`, `.webp`, `.gif`… | image (aperçu) |
| autre | fichier à télécharger |

Titre tiré du nom du fichier (`01-guide-des-hooks.pdf` → « Guide des hooks », le numéro ne sert qu'à
ordonner). Une seule langue : `guide.ar.pdf`, `prompt.en.txt`, `liens.fr.txt`. Le script ne lit que les
dossiers qui portent l'identifiant d'une leçon de `data/programme.js`, ignore fichiers cachés,
sous-dossiers et liens symboliques, plafonne le texte d'un prompt (20 000 caractères) et écarte les
fichiers de plus de 25 Mo (limite de Cloudflare) ; chaque écart est signalé dans le résumé de l'action.
Mode d'emploi pour l'équipe : `sites/hooked-academy/ressources/LISEZMOI.md`.

```bash
node tools/hooked-academy/ressources.mjs           # régénère le manifeste (s'il a changé)
node tools/hooked-academy/ressources.mjs --check   # vérifie seulement (code 1 s'il n'est pas à jour)
```

Forme du manifeste :

```json
{
  "generated": "2026-10-14T12:00:00.000Z",
  "lessons": {
    "ia1-l2": [
      { "kind": "pdf", "title": "Guide du prompt", "file": "01-guide-du-prompt.pdf", "path": "ressources/ia1-l2/01-guide-du-prompt.pdf", "size": 48213 },
      { "kind": "prompt", "title": "Prompt de départ", "file": "prompt.ar.txt", "lang": "ar", "path": "ressources/ia1-l2/prompt.ar.txt", "size": 412, "text": "…" },
      { "kind": "link", "title": "Documentation", "file": "liens.txt", "url": "https://…" }
    ]
  }
}
```

### Fiches PDF et liens générés (les deux formations)

Chaque leçon (Créative et IA) a une fiche PDF en trois langues et un fichier de liens, générés depuis le programme :
`ressources/<leçon>/01-fiche-de-la-leçon.fr.pdf` (+ `01-lesson-sheet.en.pdf`, `01-ملخص-الدرس.ar.pdf`) avec
l'essentiel, la méthode de la vidéo, les prompts (atelier et vidéo), l'exercice, le quiz corrigé et les outils ;
`ressources/<leçon>/liens.txt` avec les outils cités. Les leçons ont aussi un prompt ou un modèle à remplir dans
l'atelier : `data/programme-ia-prompts.js` (IA) et `data/programme-creative-res.js` (Créative), avec leur traduction
recopiée dans `data/i18n/<langue>/<module>.js`. À relancer quand une leçon change :

```bash
node tools/hooked-academy/fiches-lecons.mjs            # toutes les leçons (ou : … m2-l1 ia3-l4)
TRACK=creative node tools/hooked-academy/fiches-lecons.mjs   # une seule formation (creative ou ia)
node tools/hooked-academy/ressources.mjs               # puis le manifeste
```

## Images des leçons et couvertures

Chaque leçon a sa propre image, `sites/hooked-academy/assets/img/lecons/<id>.webp` (1280×720),
générée avec Nano Banana Pro (Higgsfield, 16:9, 2K) puis réduite en WebP. Les images ne contiennent
aucun texte : la même sert en français, en anglais et en arabe. Les couvertures des trois formations
sont `assets/img/couv-creative.webp`, `assets/img/couv-ia.webp` et `assets/img/couv-dev.webp`. Les 89 images de la
Formation Sites & Apps (novembre 2026) suivent le style de sa couverture : verre dépoli, menthe et violet, fond noir.

Les prompts utilisés sont dans `images-lecons-prompts.json` (`{ "<id de leçon>": "<prompt>" }`).
Pour une nouvelle leçon : écrire un prompt sur le même modèle (une scène propre à la leçon, puis la
phrase de style de la formation, puis la phrase « Strictly no text… »), générer en 16:9, convertir
en WebP 1280×720 et l'enregistrer sous l'id de la leçon. Si l'image manque, la plateforme affiche
la capture de la vidéo animée (`video/vignettes/<id>.jpg`), puis l'icône du module.
