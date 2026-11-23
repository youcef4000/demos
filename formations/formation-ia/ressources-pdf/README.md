# Sources des guides PDF de la Formation IA

Textes Markdown des guides publiés dans `sites/hooked-academy/ressources/<leçon>/`, gardés ici pour pouvoir les
corriger et les régénérer (jamais publiés tels quels).

| Source | PDF généré |
|---|---|
| `ia1-l6-prompt-avance.ar.md` | `ressources/ia1-l6/01-البرومبت-المتقدّم-تقنيات-المحترفين.ar.pdf` (traduit depuis la version française, novembre 2026) |

Régénérer un guide (la langue vient du nom du fichier : `.ar.md` → arabe, de droite à gauche) :

```bash
node tools/hooked-academy/pdf-ressource.mjs formations/formation-ia/ressources-pdf/ia1-l6-prompt-avance.ar.md "sites/hooked-academy/ressources/ia1-l6/01-البرومبت-المتقدّم-تقنيات-المحترفين.ar.pdf" --formation ia
node tools/hooked-academy/ressources.mjs
```

Arabe : « Créative » s'écrit كرياتيف (voir `tools/hooked-academy/glossaire-i18n.md`).
