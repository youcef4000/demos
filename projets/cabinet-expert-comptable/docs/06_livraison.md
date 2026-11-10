# 06 — Livraison de la V1

Livrée le 10/11/2026. Tout le périmètre de [03_architecture.md](03_architecture.md) est construit : site public,
application à trois rôles, deux agents IA, neuf workflows, serveur réel et démonstration en ligne.

## 1. Démonstration en ligne

| | Adresse |
|---|---|
| Site public du cabinet | https://demos.bornzstudio.com/cabinet-expert-comptable/ |
| Application (cabinet et clients) | https://demos.bornzstudio.com/cabinet-expert-comptable/app/ |

Données **fictives** (six entreprises algériennes imaginaires, NIF commençant par 999, montants en DA), démo figée au
mardi 10/11/2026 : on prépare les G50 d'octobre 2026 (date limite 20/11/2026). Tout se passe dans le navigateur de la
personne qui visite ; le bouton **Réinitialiser la démo** remet les données de départ.

### Comptes de démonstration (un par rôle)

| Rôle | E-mail | Mot de passe | Ce qu'il voit |
|---|---|---|---|
| **Associé** | `associe@cabinet.demo` | `Associe-2026` | Les 6 dossiers, la validation des G50, les paramètres, les comptes, le journal |
| **Collaborateur** | `collaborateur@cabinet.demo` | `Collab-2026` | Son portefeuille (3 dossiers) : pièces, écritures, G50 à préparer, relances, boîte d'envoi |
| **Client** | `client@atlas.demo` | `Client-2026` | Son dossier (SARL Atlas Distribution Alimentaire) : dépôt, pièces, G50, résultats, échéances, messages |

Comptes supplémentaires : `lina@cabinet.demo` / `Collab-2026` (collaboratrice, 3 autres dossiers),
`client@sahel.demo` / `Client-2026` (gérante d'EURL Sahel Travaux Bâtiment). La page de connexion de la démo propose
les trois premiers en un clic.

### Parcours de présentation conseillé (10 minutes)

1. **Associé** → tableau de bord : 5 pièces à valider, G50 d'octobre par dossier.
2. **Pièces** → facture floue de la Biscuiterie : l'agent a mal lu le TTC (confiance 62 %), le contrôle le signale ;
   corriger, **Valider la fiche**, voir les écritures AC et BQ proposées, les valider.
3. Facture du restaurant : aucune règle → l'agent d'imputation propose le compte 625 et dit pourquoi.
4. **Écritures** → Atlas → **Télécharger l'Excel PC Compta**.
5. Se reconnecter en **client** → **Déposer** → pièce d'exemple « Relevé bancaire » : elle est lue, la relance devient inutile.
6. **G50** → Djurdjura Agro : achat d'une ligne d'extraction → crédit de TVA reporté ; **Valider la G50** (associé) ;
   le message au client attend dans la **Boîte d'envoi** ; **Marquer déposée**.
7. **Paramètres** → changer un texte du site, ouvrir le site public : il a changé.

## 2. Ce qui est livré

| Livrable | Où |
|---|---|
| Transcriptions des deux mémos (Whisper large-v3 en local, horodatées, `[?]`) | `docs/01_transcriptions/` |
| Analyse des besoins, hypothèses | `docs/02_analyse_besoins.md` |
| Architecture, agents, hébergement et loi 18-07 | `docs/03_architecture.md` |
| Abonnements, prix vérifiés, totaux | `docs/04_abonnements.md` |
| Guide d'utilisation | `docs/05_guide_utilisateur.md` |
| Site public du cabinet (textes éditables, formulaire de contact) | `sites/cabinet-expert-comptable/` |
| Application associé, collaborateur, client | `sites/cabinet-expert-comptable/app/` (copie identique dans `public/`) |
| Noyau métier partagé (règles SCF, G50, échéancier, relances, export, droits) | `app/noyau/` |
| Agents IA : prompts système, schémas, fiches | `agents/lecteur_pieces/`, `agents/imputation_scf/` |
| Serveur réel (Node 22, SQLite, sessions, fichiers, e-mails, agents Claude, sauvegardes) | `src/` |
| Mise en service (systemd, Caddy, `.env.example` sans clé) | `deploiement/`, `README.md` |
| Tests | `test/` : 22 tests (`npm test`) ; parcours complet dans Chromium sur la démo et sur le serveur |

## 3. Chaque besoin de 02 et l'endroit où le voir dans la démo

| Besoin (02) | Fonctionnalité visible |
|---|---|
| E1 Dossier par client | **Dossiers** → fiche du dossier (NIF, NIS, RC, AI, régime, salariés, collaborateur) |
| E2 Scanner et envoyer | **Déposer** (photo, scan, PDF ; pièces d'exemple dans la démo) |
| E3 Lire HT, TVA, timbre, TTC | **Pièces** → une pièce : fiche lue par l'agent, champs incertains surlignés |
| E4 Mode de paiement | Fiche : mode et date de règlement → écriture BQ ou CA |
| E5 Trier achats et ventes | Fiche : « Classée en achat / vente » (règle du NIF) |
| E6 Nature de l'opération | Fiche : nature proposée (prestation, revente en l'état, production, travaux…), modifiable |
| E7 Proposer les écritures par journal | Pièce validée → écritures AC, VT, BQ, CA, PA proposées ; **Écritures** |
| E8 Excel au modèle PC Compta | **Écritures** → Télécharger l'Excel PC Compta ; aperçu du fichier |
| E9 Import dans PC Compta | Fichier prêt ; colonnes réglables dans **Paramètres → Export PC Compta** |
| E10 G50 chaque mois | **G50** : liste, préparation, validation par l'associé, dépôt |
| E11 État des factures d'achat | **Écritures** → État des achats du mois (Excel) ; G50 → Achats retenus |
| E12 CA, déduction, précompte, TVA à payer | **G50** → lignes prêtes à saisir, crédit reporté |
| E13 IRG sur salaire tiré de la paie | État de paie lu par l'agent ; ligne IRG de la G50 |
| E14 Résultat du mois | **Résultats** (graphique, détail, publication) ; client → **Mes résultats** |
| E15 G50 sur Excel | **G50** → Excel ; impression |
| I1 Secret professionnel | Connexion obligatoire, droits par rôle, **Journal** |
| I2 Trois rôles | Comptes associé, collaborateur, client ; validation G50 réservée à l'associé |
| I3 Collecte, relances | Espace client, **Relances**, **Boîte d'envoi**, e-mail et WhatsApp |
| I4 Échéancier | **Échéancier** ; **Paramètres → Échéancier** |
| I5 Contrôles, doublons | Fiche → Contrôles (erreurs bloquantes, alertes) |
| I6 TVA à l'encaissement | G50 → « En attente d'encaissement » (Tassili) ; réglage dans la fiche dossier |
| I7 Précompte reporté | G50 → précompte repris du mois précédent |
| I8 Montant au client | Message préparé à la validation de la G50 ; client → **Mes G50** |
| I9 Traçabilité | **Journal** |
| I10 Format d'export réglable | **Paramètres → Export PC Compta** |
| I11 Validation humaine | Boîte d'envoi, écritures « proposées », G50 « préparée » |
| I12 Prêt à saisir | G50 : écran, Excel, impression ; aucune transmission |
| I13 Relevé bancaire | Pièce rangée comme justificatif, sans écriture |
| B1 Site public | Site du cabinet, formulaire → **Demandes du site** |
| B2 Rôles, connexion | Page de connexion, menus par rôle |
| B3 Agents IA | **Agents IA** (rôle, prompt, chiffres, interrupteur) |
| B4 Admin éditable | **Paramètres** : textes du site, modèles de relance, échéancier, pièces à demander |
| B5 Français, DA, JJ/MM/AAAA | Partout |
| B6 Logiciels gardés | Export PC Compta, exports Excel, Jibaya'tic à la main |

## 4. Hypothèses prises

| N° | Ambiguïté | Hypothèse retenue | Où la changer |
|---|---|---|---|
| H1 | Le nom du cabinet n'est pas donné | Nom provisoire « Cabinet Mizane », coordonnées entre crochets à compléter | Paramètres → Textes du site, Coordonnées |
| H2 | « CISI » (mémo 1, 00:05) | « Saisie comptable » : le mémo 1 décrit la saisie automatisée des pièces | — |
| H3 | « الاروفونتونيتا » / « le venteur » (mémo 1, 00:45) | « Revente en l'état » = négoce de marchandises (comptes 600 / 700) | Paramètres → Schémas comptables |
| H4 | Journal « de paie ou de paiement » (mémo 1, 01:48) | Cinq journaux : achats (AC), ventes (VT), banque (BQ), caisse (CA), paie (PA) | Paramètres → Export PC Compta (codes) |
| H5 | « Il me propose des écritures » (mémo 1, 01:05) | Écritures « proposées » jusqu'à validation ; seules les validées partent vers PC Compta | — |
| H6 | Modèle Excel PC Compta non transmis | Colonnes Journal, Date, N° pièce, Compte, Libellé, Débit, Crédit ; dates JJ/MM/AAAA | Paramètres → Export PC Compta |
| H7 | « Acheter dans l'Excel » (mémo 1, 01:11) | « Importer » : l'import se fait dans PC Compta par le cabinet | — |
| H8 | Exigibilité de la TVA | Marchandises et production : mois de la facture ; prestations et travaux : mois de l'encaissement | Fiche du dossier |
| H9 | « Précompte » (mémo 2, 00:26) | Crédit de TVA du mois précédent, repris automatiquement ; correction possible | Écran G50 |
| H10 | « L'IRG sort de [la paie] » (mémo 2, 00:34) | IRG lu sur l'état de paie du mois, non recalculé | Écran G50 |
| H11 | « Le résultat du mois » (mémo 2, 00:41) | Produits − charges des écritures validées, sans inventaire ni amortissement ; publié par le cabinet | — |
| H12 | « Un état … selon l'ampleur fiscale » (mémo 2, 00:04) | État des achats du mois (date, n°, fournisseur, NIF, HT, TVA, TTC) en Excel | — |
| H13 | Régime des clients | Réel, G50 mensuelle ; dossier IFU possible hors G50 | Fiche du dossier |
| H14 | Taux de TVA | 19 %, 9 %, exonéré | — |
| H15 | Droit de timbre | Lu sur la facture, non recalculé ; alerte si espèces sans timbre | — |
| H16 | Pièces à demander | Factures d'achat, de vente, relevé bancaire, état de paie, pièces de caisse | Paramètres → Pièces à demander |
| H17 | Canal des relances | E-mail (boîte du cabinet) et WhatsApp (prérempli, envoyé par la personne) | Paramètres → Modèles de relance |
| H18 | Échéances sociales non citées | CNAS J+30 (mensuel au-delà de 10 salariés, trimestriel sinon), DAS le 30/01, CASNOS le 30/06, marquées « à confirmer » | Paramètres → Échéancier |
| H19 | Jibaya'tic non cité | G50 « prête à saisir » (écran, impression, Excel), dépôt fait à la main | — |
| H20 | Moteur des agents IA | Claude (Anthropic) par API, selon l'option d'hébergement (03) | `.env` |
| H21 | Ordre des mémos | memo-01 puis memo-02 (ordre des fichiers reçus) | — |
| H22 | « On crée un dossier » (mémo 1, 00:28) | Un dossier par client, pièces rangées par mois | — |
| H23 | TAP | Plus déclarée (supprimée par la loi de finances 2024) | — |
| H24 | Date de la démonstration | Démo figée au 10/11/2026 (G50 d'octobre, avant le 20/11/2026) | — |
| H25 | « Résultat du mois d'août » (mémo 2, 00:41) | Exemple ou erreur de lecture : le résultat est donné chaque mois | — |

Choix de construction, faits pour appliquer ces hypothèses :

- Agents IA réservés à la lecture des pièces et au choix d'un compte sans règle. Les relances, la G50 et l'échéancier
  suivent des règles fixes.
- Immobilisations et frais sans mot-clé : pas de compte par défaut, l'agent propose et le collaborateur valide.
- Option d'hébergement recommandée : A (Algérie), agents désactivés tant que l'ANPDP n'a pas autorisé le transfert.

## 5. Limites connues

| Limite | Conséquence | Comment la lever |
|---|---|---|
| Format d'import PC Compta non essayé sur le vrai logiciel (H6) | Les colonnes ou les codes journaux peuvent différer | Recevoir le modèle du cabinet, régler **Paramètres → Export PC Compta**, faire un import d'essai |
| Agents réels non appelés pendant la construction (aucun compte ni clé créé) | La qualité de lecture sur les vraies factures du cabinet n'est pas mesurée | Avec la clé du cabinet : lire 20 vraies pièces, comparer, ajuster le prompt et le seuil |
| E-mails : boîte SMTP du cabinet non branchée | Sans configuration, la validation d'un e-mail est refusée avec un message clair | Renseigner `SMTP_*` dans `.env` |
| Démo : connexion vérifiée dans le navigateur, données dans le navigateur | La démo n'est pas sécurisée : données fictives seulement | La version réelle (`src/`) a de vraies sessions serveur |
| Démo : l'agent simulé ne lit que les pièces d'exemple | Un fichier personnel déposé dans la démo reste à remplir à la main | Sur le serveur avec `AGENTS=claude`, toute pièce est lue |
| Résultat de gestion sans stocks ni amortissements (H11) | Le résultat mensuel d'un négociant est approximatif | Saisir les écritures d'inventaire dans PC Compta ; le bilan reste fait dans PC Compta |
| G50 : TVA, IRG salaires et timbre calculés ; autres lignes saisies à la main | Acomptes IBS, retenues à la source sur prestataires étrangers, TVA à l'importation, prorata : non calculés | Ligne « Autres » de la G50 ; développement en V2 si le client le demande |
| Dates CNAS et CASNOS non vérifiées sur source officielle (H18) | Peuvent être fausses | Le cabinet les corrige dans **Paramètres → Échéancier** |
| Droit de timbre non recalculé (H15) | Une erreur de barème sur la facture n'est pas détectée | Lire l'alerte « vérifier le barème » ; règle de calcul à ajouter si besoin |
| Photos HEIC d'iPhone | Converties en JPEG par le navigateur quand il le peut ; sinon refusées (format non lu) | Régler l'iPhone sur « Le plus compatible » ou envoyer en PDF |
| Interface en français seulement | Pas d'arabe (non demandé dans les mémos) | Traduction possible en V2 |
| Un seul serveur | Une panne arrête le service jusqu'au redémarrage (automatique) | Sauvegarde quotidienne ; copie hebdomadaire hors serveur |
| Pas de paiement en ligne | Les honoraires ne s'encaissent pas dans l'application (non demandé) | CIB / Edahabia via la banque du cabinet si besoin |

## 6. Ce qui demande les abonnements de [04_abonnements.md](04_abonnements.md) pour tourner en réel

| Fonctionnalité | Sans l'abonnement | Abonnement nécessaire |
|---|---|---|
| Application et espace client en ligne, base, pièces | Démo seulement (données fictives) | Hébergement : ICOSNET VPS S (option A) ou Hostinger KVM 2 (option B) |
| Adresse du site et de l'espace client, HTTPS | Adresse de démonstration | Nom de domaine `.dz` (Let's Encrypt est gratuit) |
| Lecture automatique des pièces, imputation SCF par l'agent | Fiches remplies à la main ; tous les workflows tournent | API Claude (Anthropic), après l'autorisation de l'ANPDP si option A |
| Envoi des e-mails validés | Refus explicite ; WhatsApp reste possible | Boîte e-mail du cabinet (SMTP) |
| Sauvegarde hors serveur | Sauvegardes sur le serveur, copie manuelle | ICOSNET Backup (optionnel) |

Aucune fonctionnalité n'a besoin d'un abonnement payant pour WhatsApp, Excel ou PC Compta (outils existants).

## 7. Prochaines étapes

1. Présenter la démo au client (parcours du § 1) et recueillir ses retours.
2. Lui faire confirmer les points du § 6 de 02 (modèle PC Compta, journal de paie, logiciel de paie, dates sociales,
   coordonnées, option d'hébergement).
3. Option retenue : souscription **au nom du cabinet** (04), puis installation du serveur en suivant `README.md`.
4. Si l'IA est retenue : demande d'autorisation de transfert à l'ANPDP, clause dans la lettre de mission, clé API.
