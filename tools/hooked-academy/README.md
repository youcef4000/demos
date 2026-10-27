# Hooked Academy — notice

Site : `sites/hooked-academy/` → https://hooked-academy.tech/

| Adresse | Contenu |
|---|---|
| `/hooked-academy/` | Landing (inscription en 3 étapes) |
| `/hooked-academy/app/` | Espace étudiant (compte démo : `demo@hooked.academy` / `DEMO-2026`, ou `app/?demo=1`) |
| `/hooked-academy/admin/` | Espace équipe (code démo : `HOOKED-TEAM`) |
| `/hooked-academy/motion/player.html?id=m2-l1` | Une leçon animée seule (plein écran) |

## Le circuit d'une inscription

1. Le visiteur remplit le formulaire de la landing (nom, WhatsApp, e-mail, ville, profil, objectif).
2. La fiche arrive dans **Admin → Inscriptions** (colonne « Nouvelle »).
3. L'équipe clique **Contacter** : WhatsApp s'ouvre avec un message prêt (session, tarif, paiement CCP / BaridiMob / espèces).
4. Paiement reçu → **Valider** : l'accès étudiant est créé (code `HA-XXXX-XXXX`) et le message de bienvenue
   (lien, identifiant, code) s'envoie en un clic sur WhatsApp.
5. L'étudiant se connecte sur `/app/` avec son e-mail (ou téléphone) et son code.

Démo sans serveur : tout est enregistré dans le navigateur (localStorage). Les fiches marquées
« exemple » sont fictives. Pour la production, seules les fonctions de `assets/js/store.js` sont à
brancher sur une API (Worker Cloudflare + D1, ou la base de Hooked Lab) : elles gardent les mêmes
entrées et sorties.

## Programme

`data/programme.js` (partie 1) et `data/programme-ia.js` (parties 2 et 3) : 13 modules, 57 leçons de
2 minutes maximum. Chaque leçon contient ses scènes animées, le texte « à dire » de chaque scène, les
points clés, le quiz et l'exercice interactif.

Structure IA demandée : Prompting → Images → Vidéos → UGC → Cinématique → Acquisition clients.
Ajouts : **Voix, musique et sous-titres** (indispensable pour l'UGC et la cinématique, placé avant),
**Tester et analyser avec Hooked Lab** (on mesure avant de vendre), éthique de l'UGC IA dans le
module UGC, et un **projet final** avec certificat.

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

## Images des leçons et couvertures

Chaque leçon a sa propre image, `sites/hooked-academy/assets/img/lecons/<id>.webp` (1280×720),
générée avec Nano Banana Pro (Higgsfield, 16:9, 2K) puis réduite en WebP. Les images ne contiennent
aucun texte : la même sert en français, en anglais et en arabe. Les couvertures des deux formations
sont `assets/img/couv-creative.webp` et `assets/img/couv-ia.webp`.

Les prompts utilisés sont dans `images-lecons-prompts.json` (`{ "<id de leçon>": "<prompt>" }`).
Pour une nouvelle leçon : écrire un prompt sur le même modèle (une scène propre à la leçon, puis la
phrase de style de la formation, puis la phrase « Strictly no text… »), générer en 16:9, convertir
en WebP 1280×720 et l'enregistrer sous l'id de la leçon. Si l'image manque, la plateforme affiche
la capture de la vidéo animée (`video/vignettes/<id>.jpg`), puis l'icône du module.
