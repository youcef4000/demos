# Hooked Academy — notice

Site : `sites/hooked-academy/` → https://demos.bornzstudio.com/hooked-academy/

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
