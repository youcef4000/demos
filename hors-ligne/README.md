# Démos mises hors ligne

Les dossiers ici ne sont servis ni par le Worker Cloudflare ni par GitHub Pages
(les deux ne publient que `sites/`). Pour remettre une démo en ligne :

```bash
git mv hors-ligne/<slug> sites/<slug>
git commit -m "Démo <slug> : remise en ligne" && git push origin main
```

- `melissa-atelier` : site et espace atelier bloqués à la demande, en attente de validation.
