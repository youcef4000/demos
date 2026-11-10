# Agent `imputation_scf`

| | |
|---|---|
| Rôle | Proposer un compte du SCF pour une ligne de facture qu'aucune règle ne couvre |
| Besoin couvert | E7 (proposer les écritures, schéma de comptabilisation par journal) — `docs/02_analyse_besoins.md` |
| Déclencheur | « Valider la fiche » quand une ligne n'a ni compte saisi, ni historique fournisseur, ni mot-clé, ni schéma de nature |
| Entrées | La ligne (libellé, montant HT, taux), la nature, le sens (achat ou vente), le fournisseur, l'activité du dossier, le plan de comptes et les schémas du cabinet |
| Sorties | `{ compte, justification, confiance }` conforme à `schema.json` ; un compte absent du plan est refusé et la ligne reste « compte à choisir » |
| Validation humaine | L'écriture est « Proposée », marquée « compte proposé par l'agent » avec la justification. Le collaborateur la corrige ou la valide ; seules les écritures validées partent dans l'export PC Compta |
| Données envoyées | La ligne, le nom du fournisseur, l'activité du dossier ; ni montants des autres pièces, ni données de personnes |
| Coût estimé | ≈ 0,01 $ par ligne, quelques lignes par mois et par dossier |
| Code | `src/agents.js` → `imputer()` |
