# Démos mises hors ligne

Les dossiers ici ne sont pas servis par le VPS (le serveur des démos ne publie que `sites/`).
Pour remettre une démo en ligne :

```bash
git mv hors-ligne/<slug> sites/<slug>
git commit -m "Démo <slug> : remise en ligne" && git push origin main
```

- `melissa-atelier` : site et espace atelier bloqués à la demande, en attente de validation.
