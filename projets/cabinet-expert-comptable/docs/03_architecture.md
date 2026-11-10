# 03 — Architecture

Principe : **un seul outil par fonction**, on garde PC Compta et Excel, et **rien ne sort sans un clic humain**.

- Les **agents IA** lisent et proposent (une fiche, un compte). Ils ne valident rien et n'envoient rien.
- Les **workflows** appliquent des règles fixes et préparent (écritures, G50, relances en brouillon).
- Les **membres du cabinet** valident : écritures, G50, messages, publication du résultat.

Un agent n'est utilisé que si la tâche demande du **jugement ou du langage**. Une règle fixe reste un workflow.

## 1. Outil retenu pour chaque tâche

Les identifiants renvoient à [02_analyse_besoins.md](02_analyse_besoins.md).

| Tâche | Outil retenu | Type | Justification |
|---|---|---|---|
| E1 Dossier par client | Écran **Dossiers** (fiche fiscale : NIF, NIS, RC, AI, régime, salariés, collaborateur) | Fonctionnalité | Données structurées, aucune décision |
| E2 Scanner et envoyer les papiers | Écran **Déposer des pièces** (photo depuis le téléphone, PDF, scan) + scanner du cabinet | Fonctionnalité + existant | Le geste reste humain ; l'envoi et le rangement sont automatiques |
| E3 Lire HT, TVA, timbre, TTC | Agent **`lecteur_pieces`** | Agent IA | Factures de toutes mises en page, parfois manuscrites : il faut lire, pas appliquer une règle |
| E4 Lire le mode de paiement | Agent `lecteur_pieces` (lecture) puis **W3** (journal de règlement) | Agent + workflow | Lire = jugement ; espèces → caisse, chèque / virement → banque = règle |
| E5 Trier achats et ventes | **W1** : l'émetteur porte-t-il le NIF du dossier ? | Workflow | Règle fixe, sans ambiguïté |
| E6 Nature (prestation, revente en l'état, production, travaux) | Agent `lecteur_pieces` propose, le collaborateur confirme | Agent IA | Jugement sur les libellés et l'activité du client |
| E7 Proposer les écritures par journal | **W4** (schémas par nature, historique du fournisseur, mots-clés) ; agent **`imputation_scf`** pour les seules lignes sans règle | Workflow + agent | Le schéma est une règle ; choisir un compte pour une ligne inhabituelle est un jugement |
| E8 Excel au modèle PC Compta | **W5** : export .xlsx, colonnes réglables | Workflow | Mise en forme fixe |
| E9 Import dans PC Compta | **PC Compta** (import Excel du cabinet) | Logiciel existant | Pas d'interface de programmation connue ; on garde le logiciel du cabinet |
| E10 G50 chaque mois | **W6** (calcul) + validation de l'associé | Workflow | Arithmétique fiscale fixe |
| E11 État des achats du mois | **W6** (export Excel) | Workflow | Liste filtrée |
| E12 CA, déduction, précompte ou TVA à payer | **W6** | Workflow | TVA collectée − déductible − précompte |
| E13 IRG salaires tiré de la paie | Agent `lecteur_pieces` lit l'état de paie, **W6** reprend l'IRG | Agent + workflow | Lire l'état = jugement ; le reporter = règle |
| E14 Résultat du mois | **W7** + bouton « Publier au client » | Workflow | Somme des classes 6 et 7 |
| E15 G50 sur Excel | **W6** (export Excel) + Excel du cabinet | Workflow + existant | Le cabinet garde son outil de travail |
| I3 Collecte des pièces, relances | **W9** (pièces attendues, modèles) + boîte d'envoi ; e-mail du cabinet ; WhatsApp | Workflow | Modèle de texte rempli = règle fixe, pas besoin d'IA |
| I4 Échéancier fiscal et social | **W8** (règles de dates éditables) | Workflow | Calendrier fixe |
| I5 Contrôles des factures, doublons | **W2** | Workflow | Arithmétique et comparaison |
| I6 TVA à l'encaissement | **W6** (réglage par dossier) | Workflow | Règle du CTCA |
| I7 Précompte reporté | **W6** | Workflow | Report du crédit du mois précédent |
| I8 Montant G50 au client | **W6** prépare le message → boîte d'envoi | Workflow | Modèle rempli, envoi après validation |
| I9 Traçabilité | **Journal d'activité** (qui, quoi, quand) | Fonctionnalité | Enregistrement automatique |
| I10 Format d'export | Paramètre **Format d'export PC Compta** | Fonctionnalité | Réglage sans développement |
| I12 Dépôt des déclarations | **Jibaya'tic** ou guichet, à la main, à partir de la G50 prête à saisir | Existant | Pas d'API officielle vérifiée |
| I13 Relevé bancaire | Rangé comme justificatif, sans écriture | Fonctionnalité | Les règlements viennent des factures |
| B1 Site public | **Site du cabinet** (textes éditables, formulaire de contact) | Fonctionnalité | Vitrine et accès client |
| B2 Rôles, connexion | **Comptes** associé, collaborateur, client | Fonctionnalité | Droits par rôle sur chaque route |
| B4 Éditable depuis l'admin | **Paramètres** : textes du site, modèles, échéancier, pièces à demander (+ schémas, export, agents) | Fonctionnalité | Le cabinet change ses règles sans développeur |

## 2. Agents IA

Deux agents seulement : ce sont les deux tâches qui demandent de lire ou de juger. Prompts système dans
[`agents/`](../agents/). Modèle : Claude Opus 5.5 (`claude-opus-5-5`), effort `low` (lecture et classement), sortie JSON
imposée par un schéma, repli automatique côté serveur si le modèle décline.

### Agent `lecteur_pieces` — lire une pièce

| | |
|---|---|
| Rôle | Lire une facture, un avoir ou un état de paie et en tirer une fiche structurée |
| Déclencheur | Dépôt d'une pièce (client ou cabinet), ou bouton « Relire avec l'agent » |
| Entrées | L'image ou le PDF de la pièce ; raison sociale, NIF et activité du dossier ; le type annoncé par la personne qui dépose |
| Sorties | Fiche : type, numéro, date, émetteur et destinataire (nom, NIF, RC), lignes (libellé, HT, taux de TVA), totaux HT, TVA, timbre, TTC, mode et date de paiement, **nature proposée** (prestation, revente en l'état, production, travaux, immobilisation, frais) ; pour un état de paie : brut, retenues CNAS, IRG, net, charges patronales ; **confiance** et champs incertains |
| Ce qu'il ne fait pas | Il ne choisit pas de compte, ne valide pas, n'écrit rien en comptabilité, ne contacte personne |
| Validation humaine | La fiche reste **« À valider »**. Le collaborateur la relit à côté de l'image, corrige, puis clique **« Valider la fiche »**. Sous le seuil de confiance (80 %), une alerte demande de relire chaque champ |
| Garde-fous | Les contrôles W2 (HT + TVA + timbre = TTC, NIF, taux, doublon) tournent sur sa sortie ; une erreur bloque la validation |

### Agent `imputation_scf` — proposer un compte

| | |
|---|---|
| Rôle | Proposer un compte du SCF pour une ligne de facture qu'aucune règle ne couvre |
| Déclencheur | Validation d'une fiche dont une ligne n'a ni compte saisi, ni historique fournisseur, ni mot-clé, ni schéma de nature |
| Entrées | La ligne (libellé, montant), la nature, le fournisseur, l'activité du dossier, l'extrait du plan de comptes et les schémas du cabinet |
| Sorties | Un compte, une justification d'une phrase, une confiance |
| Ce qu'il ne fait pas | Il ne crée pas de compte hors du plan fourni et ne valide pas l'écriture |
| Validation humaine | L'écriture est **« Proposée »**, marquée « compte proposé par l'agent » avec sa justification. Le collaborateur la corrige ou la valide ; seules les écritures validées partent dans l'export PC Compta |

## 3. Workflows (règles fixes)

| Code | Ce qu'il fait | Déclencheur |
|---|---|---|
| W1 | Achat ou vente d'après le NIF de l'émetteur | Chaque lecture ou correction de fiche |
| W2 | Contrôles : totaux, NIF, taux 19 / 9 / 0 %, période, doublon, timbre et mode de paiement | Chaque lecture, correction, validation |
| W3 | Journal de règlement : espèces → caisse (53), chèque, virement, carte → banque (512), à terme → aucun | Génération des écritures |
| W4 | Écritures proposées : achats (6x / 4456 / 401), ventes (411 / 70x / 4457 / 447), règlements, paie (631 / 431 / 442 / 421 / 635) | Validation d'une fiche |
| W5 | Export .xlsx PC Compta des écritures validées, feuille de contrôle par journal | Bouton « Exporter vers PC Compta » |
| W6 | G50 : TVA collectée par taux (exigibilité), déductible (biens et services, immobilisations), précompte, IRG salaires, timbre, total ; export Excel ; message au client préparé | Bouton « Préparer la G50 » ; validation par l'associé |
| W7 | Résultat du mois par grandes masses, cumul de l'exercice | Écran Résultats ; bouton « Publier au client » |
| W8 | Échéances du mois par dossier, état (fait, à faire, en retard), alerte si vendredi ou samedi | Écran Échéancier, tableau de bord |
| W9 | Pièces attendues par dossier, brouillons de relance à partir des modèles | Bouton « Préparer les relances » ; chaque matin les jours choisis (5 et 12 du mois par défaut) |

## 4. Rôles

| Action | Associé | Collaborateur | Client |
|---|---|---|---|
| Voir les dossiers | Tous | Son portefeuille | Le sien |
| Déposer une pièce | Oui | Oui | Oui (son dossier) |
| Corriger et valider une fiche, valider des écritures | Oui | Oui | Non |
| Exporter vers PC Compta | Oui | Oui | Non |
| Préparer une G50 | Oui | Oui | Non |
| **Valider une G50** | **Oui** | Non | Non |
| Marquer une G50 déposée | Oui | Oui | Non |
| Valider et envoyer un message au client | Oui | Oui | Non |
| Publier le résultat du mois | Oui | Oui | Voit le résultat publié |
| Paramètres, comptes, journal d'activité | Oui | Non | Non |

## 5. Stack technique

| Brique | Choix | Pourquoi |
|---|---|---|
| Écrans | HTML, CSS, JavaScript sans étape de construction ; pensés téléphone d'abord | Rien à compiler, maintenance simple |
| Noyau métier | Modules JavaScript partagés (`noyau/`) : règles, G50, export, routes et droits | **Le même code** tourne dans la démo et sur le serveur |
| Serveur | Node.js 22, une seule application (`src/serveur.js`) | Aucun autre service à faire tourner |
| Base | SQLite intégré à Node (un fichier), pièces sur disque, sauvegarde quotidienne gardée 30 jours | Volume d'un cabinet ; sauvegarde = copier un fichier |
| Connexion | Mots de passe hachés (scrypt), cookie de session `HttpOnly`, `Secure`, `SameSite=Strict`, 8 h ; blocage après 5 échecs ; droits vérifiés sur chaque route | Toute page interne exige une connexion |
| Agents | API Claude par le SDK officiel `@anthropic-ai/sdk` | Lecture d'images et de PDF, sortie JSON garantie |
| E-mails | Boîte du cabinet en SMTP (`nodemailer`) | Les relances partent de l'adresse que les clients connaissent |
| WhatsApp | Lien `wa.me` avec le message prérempli : la personne appuie elle-même sur Envoyer | Aucun abonnement, validation humaine par construction |
| HTTPS | Caddy devant Node (certificat Let's Encrypt automatique) | Gratuit, renouvelé seul |
| Paiement en ligne | Aucun en V1 : aucun besoin de 02 ne le demande. Si le cabinet veut encaisser ses honoraires plus tard : CIB et Edahabia via sa banque (SATIM) | Rien d'inventé hors de 02 |

## 6. Hébergement, loi 18-07 et secret professionnel

Ce qui est en jeu :

- **Secret professionnel** de l'expert-comptable (loi 10-01) : pièces et chiffres des clients.
- **Loi 18-07** : elle protège les données des **personnes physiques** (gérants, salariés, clients particuliers,
  entrepreneurs individuels). Le traitement se déclare à l'ANPDP. Un **transfert vers l'étranger** n'est permis que
  **sur autorisation de l'ANPDP**, vers un pays offrant une protection suffisante (art. 44), sauf dérogations de
  l'art. 45. Une délibération de l'ANPDP de juillet 2026 a rappelé que des données hébergées à l'étranger valent
  transfert.

### Option A — hébergement en Algérie (recommandée)

| | |
|---|---|
| Où | VPS ICOSNET (datacenters à Alger et Oran), offre VMware VPS S : 1 vCPU, 4 Go, 80 Go |
| Données | Base, pièces et sauvegardes restent en Algérie |
| Paiement | En DA, CIB ou Edahabia, ou virement |
| Agents IA | L'API Claude est hors d'Algérie : chaque lecture **envoie la pièce à l'étranger**. Ils restent **désactivés** (`AGENTS=desactive`) tant que le cabinet n'a pas l'autorisation de transfert de l'ANPDP et prévenu ses clients (lettre de mission). Sans agents, tout fonctionne : la fiche se remplit à la main et tous les workflows restent actifs |
| Risques | Hébergeur moins outillé (sauvegardes, supervision à prévoir) ; prix plus élevé qu'à l'étranger ; agents soumis à autorisation |

### Option B — hébergement à l'étranger

| | |
|---|---|
| Où | VPS Hostinger KVM 2 (centre de données dans l'Union européenne) : 2 vCPU, 8 Go, 100 Go |
| Données | Tout le dossier client (pièces, chiffres, comptes) est **stocké hors d'Algérie** : c'est un transfert permanent |
| Paiement | En euros, carte bancaire internationale |
| Agents IA | Activables tout de suite techniquement, mais le transfert reste soumis à l'autorisation de l'ANPDP |
| Risques | Transfert permanent de données de personnes physiques sans autorisation : sanction possible ; secret professionnel exposé à un droit étranger ; paiement en devises ; tarif promotionnel lié à 24 mois d'engagement |

### Mesures communes aux deux options

- HTTPS partout ; cookies sécurisés ; en-têtes de sécurité (CSP, `X-Frame-Options`, `Referrer-Policy`).
- Droits vérifiés sur chaque route par le noyau (un client ne voit que son dossier, un collaborateur son portefeuille).
- **Minimisation** : un agent ne reçoit que la pièce à lire et l'identité du dossier, jamais l'historique ni les autres clients.
- Anthropic ne s'entraîne pas sur les contenus envoyés par l'API (conditions commerciales, section B).
- Journal d'activité : chaque lecture, validation, export, envoi.
- Sauvegarde chiffrée quotidienne, 30 jours gardés ; copie hors serveur hebdomadaire par le cabinet.
- Déclaration du traitement à l'ANPDP ; contrat de sous-traitance avec le prestataire ; clause « traitement
  informatique et IA » dans la lettre de mission.

## 7. Démo en ligne et version réelle

| | Démo (GitHub Pages) | Version réelle (serveur du cabinet) |
|---|---|---|
| Écrans et noyau | Identiques | Identiques |
| Base | Dans le navigateur de la personne (données fictives, bouton « Réinitialiser ») | SQLite sur le serveur |
| Connexion | Comptes de démo vérifiés dans le navigateur | Comptes réels, sessions serveur |
| Agents | Simulés sur les pièces d'exemple | API Claude (si activés) |
| E-mails | Marqués « envoyés (démo) » | Envoyés par la boîte du cabinet |
