# Ressources des leçons — mode d'emploi

Les fichiers déposés ici apparaissent dans l'espace étudiant : dans la leçon (atelier des leçons IA,
onglet Ressources des leçons créatives) et dans la page Ressources. L'équipe les retrouve dans
**Admin → Ressources**.

## Où déposer

Un dossier par leçon, au nom de la leçon : `ressources/ia1-l2/`, `ressources/m3-l1/`… L'identifiant est
affiché sous chaque leçon dans Admin → Ressources.

1. Admin → Ressources → ouvrir la leçon → **Déposer des fichiers** : GitHub s'ouvre dans le bon dossier.
2. Glisser les fichiers, puis **Commit changes** (branche `main`).
3. Environ deux minutes plus tard, c'est en ligne : l'action « Ressources hooked-academy » met à jour
   `manifest.json`, puis le site se redéploie.

Si le dossier de la leçon n'existe pas encore et que GitHub refuse l'envoi : **Add file → Create new file**,
taper par exemple `ia1-l2/liens.txt` comme nom (le dossier est créé avec le fichier), valider, puis
déposer les autres fichiers dans ce dossier.

## Formats

| Fichier | Devient |
|---|---|
| `guide-des-hooks.pdf` | un PDF, à ouvrir ou télécharger |
| `prompt-ugc.txt` ou `.md` | un prompt (un par fichier), copié en un geste ; une première ligne `# Titre` donne son titre |
| `liens.txt` | une ligne par lien : `Titre \| https://…` (lignes vides et lignes `#` ignorées) |
| `.png`, `.jpg`, `.webp`, `.gif` | une image, affichée en aperçu |
| autre (`.zip`, modèle, preset…) | un fichier à télécharger |

- **Titre** : tiré du nom du fichier, `01-guide-des-hooks.pdf` → « Guide des hooks ». Un numéro au début
  sert seulement à ordonner.
- **Une seule langue** : code de langue avant l'extension, `guide.ar.pdf`, `prompt.en.txt`,
  `liens.fr.txt` (`fr`, `en` ou `ar`). Sans code, la ressource s'affiche dans les trois langues.
- **Noms** : éviter `# ? % \ < > " | * :` ; pas de sous-dossier dans un dossier de leçon.
- **Taille** : 25 Mo au plus par fichier. Au-delà (vidéo…), le mettre sur Drive et ajouter son lien
  dans `liens.txt`.
- **Retirer** une ressource : supprimer le fichier sur GitHub, la liste se met à jour toute seule.

`manifest.json` ne se modifie pas à la main : il est régénéré par `tools/hooked-academy/ressources.mjs`.
Comme tout le site, ces fichiers sont publics (accessibles à qui a le lien) : rien de confidentiel.
