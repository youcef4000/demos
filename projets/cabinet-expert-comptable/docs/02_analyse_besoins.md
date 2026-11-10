# 02 — Analyse des besoins

Sources : [mémo 01](01_transcriptions/memo-01.md) (02:05) et [mémo 02](01_transcriptions/memo-02.md) (00:52), transcrits
le 10/11/2026 ; brief du prestataire (site public, application à trois rôles, agents IA). Les renvois `M1 01:45` se
lisent « mémo 01, à 01:45 ».

## 1. Profil du cabinet — uniquement ce qui est dit

| Élément | Ce que disent les mémos | Source |
|---|---|---|
| Activité | Cabinet d'expert-comptable en Algérie | Brief |
| Référentiel comptable | **SCF**, « selon le code comptable algérien » | M1 00:13 |
| G50 | **Oui, chaque mois** ; préparée aujourd'hui **sur Excel** | M2 00:00, M2 00:43 |
| Contenu de la G50 cité | Chiffre d'affaires sur la vente, sur l'achat, déduction, **précompte ou TVA à payer**, **IRG sur salaire** | M2 00:14 – 00:36 |
| IBS | Non mentionné | — |
| IRG | **IRG sur salaire**, qui « sort de [la paie ?] » | M2 00:31 |
| TAP | Non mentionnée (supprimée par la loi de finances 2024) | — |
| CNAS | Non mentionnée | — |
| CASNOS | Non mentionnée | — |
| Bilans | Non mentionnés ; le **résultat du mois** est cité | M2 00:37 |
| Jibaya'tic | Non mentionné | — |
| Logiciels utilisés | **PC Compta** (import d'un Excel « selon des paramètres », injecté dans les journaux) ; **Excel** (modèle d'import PC Compta, G50) ; **scanner** | M1 01:05 – 01:26, M2 00:43, M1 00:23 |
| Journaux | Achats, ventes, caisse, et un journal « de paie ou de paiement » [?] | M1 01:48 |
| Natures d'opération | **Prestation, revente en l'état, production, travaux** | M1 00:45 |
| Données lues sur une pièce | **HT, TVA, droit de timbre, TTC, mode de paiement** | M1 00:55 – 01:08 |
| Langue des mémos | Darija et français mêlés ; aucune demande d'interface en arabe | M1, M2 |

## 2. Tâches décrites par le client (besoins exprimés)

Classement : **totalement automatisable** = la machine fait le travail, le cabinet valide d'un clic ;
**partiellement** = une part reste humaine (geste physique, décision de métier) ; **non automatisable** = acte qui
reste dans un autre logiciel ou chez l'administration.

| ID | Tâche décrite | Source | Classement | Pourquoi |
|---|---|---|---|---|
| E1 | Créer un dossier (par client) et y ranger les pièces | M1 00:28 | Totalement | Rangement par client et par mois à la réception de la pièce |
| E2 | Scanner les papiers et les envoyer au programme | M1 00:23, M1 01:30 | Partiellement | La photo ou le scan reste un geste humain ; l'envoi, le rangement et la lecture sont automatiques |
| E3 | Lire la pièce : HT, TVA, droit de timbre, TTC | M1 00:55 | Totalement | Lecture du document (texte ou image) puis contrôle arithmétique |
| E4 | Lire le mode de paiement tel qu'il est écrit | M1 00:59 | Totalement | Champ lu sur la pièce ; il décide du journal de règlement |
| E5 | Trier achats et ventes | M1 00:40, M1 01:37 | Totalement | Règle fixe : l'émetteur est-il le client du cabinet (NIF) ? |
| E6 | Classer par nature : prestation, revente en l'état, production, travaux | M1 00:45 | Partiellement | « Nous, on lui indique » : la nature est proposée d'après les lignes et l'activité, le collaborateur la confirme |
| E7 | Proposer les écritures comptables, avec un schéma de comptabilisation par journal | M1 01:05, M1 01:45, M1 01:55 | Totalement | Schémas fixes par nature et par journal ; jugement seulement pour les lignes sans règle ; validation humaine |
| E8 | Mettre les écritures dans un Excel au modèle PC Compta | M1 01:05 | Totalement | Fichier .xlsx généré au format d'import |
| E9 | Importer l'Excel dans PC Compta, selon ses paramètres, dans les journaux | M1 01:11, M1 02:00 | Non automatisable | Geste fait dans PC Compta (aucune interface de programmation connue) ; l'application fournit le fichier prêt |
| E10 | Faire la G50 chaque mois | M2 00:00 | Partiellement | Calcul automatique ; validation par l'associé, dépôt et paiement restent humains |
| E11 | Récupérer l'état des factures d'achat du mois | M2 00:04 | Totalement | Relevé des achats (fournisseur, NIF, HT, TVA, TTC) tiré des pièces validées |
| E12 | Chiffre d'affaires ventes et achats, déduction, précompte ou TVA à payer | M2 00:14 – 00:30 | Totalement | Calcul fixe : TVA collectée − TVA déductible − précompte |
| E13 | IRG sur salaire tiré de la paie | M2 00:31 | Partiellement | L'IRG est lu sur l'état de paie du mois ; la paie elle-même reste dans son logiciel |
| E14 | Dérouler les comptes sur le résultat, donner le résultat du mois au client | M2 00:37 | Totalement | Produits − charges des écritures validées ; publication au client par un clic |
| E15 | Faire la G50 sur Excel | M2 00:43 | Totalement | Export Excel de la G50 prête à saisir |

## 3. Besoins implicites d'un cabinet comptable algérien (non dits dans les mémos)

| ID | Besoin implicite | Pourquoi il s'impose |
|---|---|---|
| I1 | Secret professionnel, accès réservé et tracé | Loi 10-01 (profession d'expert-comptable) ; loi 18-07 (données à caractère personnel : salariés, gérants, clients personnes physiques) |
| I2 | Trois rôles : associé (valide et signe), collaborateur (prépare), client (dépose et consulte) | Organisation d'un cabinet ; responsabilité de l'expert-comptable sur la G50 |
| I3 | Collecte des pièces auprès des clients : espace client sur téléphone, liste des pièces à demander, relances par e-mail et WhatsApp | La G50 du 20 dépend des pièces reçues ; les clients envoient surtout depuis leur téléphone |
| I4 | Échéancier fiscal et social par dossier : G50 le 20, acomptes IBS, liasse annuelle, CNAS, DAS, CASNOS | Pénalités de retard ; dates qui changent avec les lois de finances |
| I5 | Contrôles des factures : numéro, date, NIF du tiers, taux de TVA, totaux, doublons | Conditions de la facture (décret exécutif 05-468) ; droit à déduction de la TVA |
| I6 | TVA des prestations et travaux exigible à l'encaissement | Article 14 du code des taxes sur le chiffre d'affaires |
| I7 | Précompte reporté automatiquement de mois en mois | Évite les reports oubliés d'une G50 à l'autre |
| I8 | Montant de la G50 communiqué au client avant la date limite | Le client paie ; il doit connaître le montant à temps |
| I9 | Conservation et traçabilité des pièces et des validations | Durée légale de conservation des pièces comptables (dix ans, à confirmer par le cabinet) ; contrôle fiscal |
| I10 | Format d'export réglable | Le modèle Excel exact de PC Compta n'a pas été transmis |
| I11 | Validation humaine avant tout envoi, toute écriture, toute déclaration | Responsabilité professionnelle ; erreur coûteuse |
| I12 | Déclarations préparées « prêtes à saisir », sans transmission automatique | Aucune API officielle vérifiée pour Jibaya'tic, CNAS ou CASNOS |
| I13 | Pièces sans écriture : relevé bancaire conservé comme justificatif | Contrôle des règlements banque |

### Exigences du brief du prestataire

| ID | Exigence | Source |
|---|---|---|
| B1 | Site public du cabinet (présentation des missions, accès client, contact) | Brief |
| B2 | Application avec rôles associé, collaborateur, client ; authentification sur toute page interne | Brief |
| B3 | Agents IA qui automatisent le maximum, avec validation humaine avant toute action sortante | Brief |
| B4 | Éditables depuis l'admin : textes du site, modèles de relance, échéancier fiscal et social, liste des pièces à demander | Brief |
| B5 | Interface en français, montants en DA, dates JJ/MM/AAAA, utilisable par un non-technicien | Brief |
| B6 | Garder les logiciels du cabinet (PC Compta, Excel), un seul outil par fonction | Brief |

## 4. Synthèse du classement

| Classement | Tâches |
|---|---|
| Totalement automatisable (validation d'un clic) | E1, E3, E4, E5, E7, E8, E11, E12, E14, E15 |
| Partiellement automatisable | E2 (scan), E6 (nature confirmée), E10 (validation, dépôt), E13 (paie hors application) |
| Non automatisable depuis l'application | E9 (import dans PC Compta), dépôt et paiement de la G50 sur Jibaya'tic ou au guichet |

## 5. Hypothèses prises

Quand un mémo est ambigu, l'hypothèse la plus logique pour un cabinet algérien a été retenue. Toutes sont
modifiables sans développement (paramètres de l'admin), sauf mention contraire.

| N° | Ambiguïté | Hypothèse retenue | Où la changer |
|---|---|---|---|
| H1 | Le nom du cabinet n'est pas donné | Nom provisoire « Cabinet Mizane », coordonnées entre crochets à compléter | Admin → Textes du site |
| H2 | « CISI » (M1 00:05) | « Saisie comptable » : le mémo 01 décrit la saisie automatisée des pièces | — |
| H3 | « الاروفونتونيتا » / « le venteur » (M1 00:45) | « Revente en l'état » = négoce de marchandises (comptes 600 / 700) | Admin → Schémas de comptabilisation |
| H4 | Journal « de paie ou de paiement » (M1 01:48) | Cinq journaux : achats (AC), ventes (VT), banque (BQ, règlements par chèque, virement, carte), caisse (CA), paie (PA) | Admin → Format d'export (codes journaux) |
| H5 | « Il me propose des écritures » (M1 01:05) | Les écritures restent « proposées » jusqu'à la validation d'un collaborateur ; seules les validées partent vers PC Compta | — (règle de sécurité) |
| H6 | Modèle Excel PC Compta non transmis | Colonnes : Journal, Date, N° pièce, Compte, Libellé, Débit, Crédit ; dates JJ/MM/AAAA | Admin → Format d'export |
| H7 | « Acheter dans l'Excel » (M1 01:11) | « Importer » : l'import se fait dans PC Compta par le cabinet | — |
| H8 | Exigibilité de la TVA | Marchandises et production : mois de la facture ; prestations et travaux : mois de l'encaissement | Fiche du dossier |
| H9 | « Précompte » (M2 00:26) | Crédit de TVA du mois précédent, repris automatiquement ; correction manuelle possible | Écran G50 |
| H10 | « L'IRG sort de [la paie] » (M2 00:34) | L'IRG salaires est lu sur l'état de paie du mois, non recalculé | Écran G50 (saisie manuelle possible) |
| H11 | « Le résultat du mois » (M2 00:41) | Produits − charges des écritures validées, sans inventaire ni amortissement (résultat de gestion) ; publié au client par le cabinet | — |
| H12 | « Un état … selon l'ampleur fiscale » (M2 00:04) | État des achats du mois (date, n°, fournisseur, NIF, HT, TVA, TTC) en Excel | — |
| H13 | Régime des clients | Régime du réel, G50 mensuelle ; un dossier IFU reste possible (hors G50) | Fiche du dossier |
| H14 | Taux de TVA | 19 %, 9 %, exonéré | — |
| H15 | Droit de timbre | Lu sur la facture, non recalculé ; alerte si espèces sans timbre | — |
| H16 | Pièces à demander | Factures d'achat, factures de vente, relevé bancaire, état de paie, pièces de caisse | Admin → Pièces à demander |
| H17 | Canal des relances | E-mail (boîte du cabinet) et WhatsApp (message prérempli, envoyé par la personne) | Admin → Modèles |
| H18 | Échéances sociales non citées | CNAS : J+30 (mensuel au-delà de 10 salariés, trimestriel sinon) ; DAS le 30/01 ; CASNOS le 30/06 — marquées « à confirmer » | Admin → Échéancier |
| H19 | Jibaya'tic non cité | G50 « prête à saisir » (écran, impression, Excel), dépôt fait par le cabinet ou le client | — |
| H20 | Moteur des agents IA | Claude (Anthropic) par API, sous réserve de l'option d'hébergement retenue (03) | `.env` |
| H21 | Ordre des mémos | memo-01 puis memo-02 (ordre des fichiers reçus) | — |
| H22 | « On crée un dossier » (M1 00:28) | Un dossier par client ; les pièces y sont rangées par mois | — |
| H23 | TAP | Plus déclarée (supprimée par la loi de finances 2024, art. 14) | — |
| H24 | Date de la démonstration | Démo figée au 10/11/2026 : on prépare les G50 d'octobre 2026, à déposer avant le 20/11/2026 | — |
| H25 | « Résultat du mois d'août » (M2 00:41) | « Août » est un exemple ou une erreur de lecture : le résultat est donné chaque mois | — |

## 6. Points à confirmer au retour du client

Sans effet sur la V1 livrée (les hypothèses ci-dessus s'appliquent), à vérifier lors de ses retours :

1. Le modèle Excel d'import de PC Compta (une copie suffit pour caler l'export, H6).
2. Le journal « de paie » ou « de paiement » (H4).
3. Le logiciel de paie utilisé et la forme de l'état de paie (H10).
4. Les dates CNAS et CASNOS retenues par le cabinet (H18).
5. Le nom, les coordonnées et le numéro d'inscription à l'Ordre (H1).
6. L'option d'hébergement (Algérie ou étranger) et l'accord pour l'usage d'une IA hébergée hors d'Algérie (03).
