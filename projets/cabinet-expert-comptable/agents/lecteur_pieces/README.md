# Agent `lecteur_pieces`

| | |
|---|---|
| Rôle | Retranscrire une pièce comptable (photo, scan, PDF) en fiche structurée |
| Besoins couverts | E3 (HT, TVA, timbre, TTC), E4 (mode de paiement), E6 (nature proposée), E13 (IRG de l'état de paie) — `docs/02_analyse_besoins.md` |
| Déclencheur | Dépôt d'une pièce par le client ou le cabinet ; bouton « Relire avec l'agent » |
| Entrées | Le fichier (JPEG, PNG, WebP, GIF ou PDF, 15 Mo au plus) ; raison sociale, NIF et activité du dossier ; type annoncé au dépôt |
| Sorties | Fiche conforme à `schema.json` : type, numéro, date, émetteur, destinataire, lignes, totaux, timbre, mode et date de paiement, nature, totaux de paie, confiance, champs incertains, remarques |
| Validation humaine | La pièce passe « À valider ». Le collaborateur compare la fiche à l'image, corrige si besoin, puis clique « Valider la fiche ». Sous 80 % de confiance (réglable), une alerte demande de relire chaque champ |
| Contrôles automatiques après lecture | W1 achat ou vente (NIF), W2 totaux, NIF, taux, période, doublon, timbre — une erreur bloque la validation |
| Données envoyées | La pièce et l'identité du dossier, rien d'autre (ni historique, ni autres clients) |
| Coût estimé | ≈ 0,04 $ par pièce (≈ 3 000 jetons lus, ≈ 1 500 écrits) |
| Code | `src/agents.js` → `lirePiece()` |
