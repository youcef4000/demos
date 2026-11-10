# 05 — Guide d'utilisation

Ce guide explique, sans jargon technique, comment le cabinet et ses clients utilisent l'application chaque mois.
Il suit la démonstration : https://demos.bornzstudio.com/cabinet-expert-comptable/app/

## L'essentiel en 5 lignes

1. Le client dépose ses pièces (photo, scan ou PDF) dans son espace.
2. L'agent de lecture remplit une fiche pour chaque pièce ; un collaborateur la vérifie et la valide.
3. Les écritures sont proposées journal par journal ; le collaborateur les valide puis télécharge l'Excel pour PC Compta.
4. La G50 du mois se calcule toute seule ; l'associé la valide ; le cabinet la saisit sur Jibaya'tic ou la dépose.
5. Aucun message ne part chez le client sans un clic dans la **boîte d'envoi**.

## Se connecter

- Adresse : `https://<domaine du cabinet>/app/` (dans la démo : le lien ci-dessus).
- Saisir son e-mail et son mot de passe. Après 5 essais faux, le compte est bloqué 15 minutes.
- Mot de passe oublié : l'associé en donne un nouveau (menu **Comptes** → **Mot de passe**).
- Sur téléphone, le menu s'ouvre avec le bouton ☰ en haut à gauche ; les raccourcis sont en bas de l'écran.
- **Période de travail** (en haut à droite) : le mois que l'on traite. Par défaut, le mois précédent
  (le 10 novembre, on traite octobre).

## Le mois type au cabinet

| Quand | Qui | Où | Quoi |
|---|---|---|---|
| Du 1er au 10 | Clients | Espace client → **Déposer** | Envoient factures, relevé bancaire, état de paie |
| Le 5 et le 12 (réglable) | Le serveur | **Boîte d'envoi** | Prépare des relances pour les dossiers incomplets (brouillons) |
| Chaque jour | Collaborateur | **Pièces** | Vérifie et valide les fiches lues par l'agent |
| Chaque jour | Collaborateur | **Écritures** | Valide les écritures proposées, télécharge l'Excel PC Compta |
| Vers le 15 | Collaborateur | **G50** | Prépare la G50 de chaque dossier |
| Vers le 16 | Associé | **G50** | Valide les G50 ; un message au client est préparé |
| Avant le 20 | Cabinet | Jibaya'tic ou guichet | Saisit ou dépose la G50, puis la marque « déposée » |
| Après validation du mois | Collaborateur | **Résultats** | Publie le résultat du mois au client |

## Pièces : vérifier ce que l'agent a lu

1. Menu **Pièces** → filtre **À valider**.
2. Cliquer une pièce : l'image est à gauche, la fiche à droite.
3. Relire la fiche à côté de l'image. Les champs surlignés en orange sont ceux dont l'agent n'est pas sûr.
4. Regarder **Contrôles** en bas :
   - point rouge : erreur bloquante (exemple : « TTC imprimé ≠ HT + TVA + timbre ») ; il faut corriger le champ ;
   - point orange : alerte à lire (NIF absent, timbre manquant…) ;
   - « Contrôles passés » : tout est cohérent.
5. Vérifier la **nature de l'opération** (marchandises, production, prestation, travaux, immobilisation, frais) :
   elle décide du compte.
6. Cliquer **Valider la fiche**. Les écritures sont alors **proposées** (rien n'est encore en comptabilité).
7. Pièce illisible ou hors sujet : **Rejeter** avec un motif.

Achat ou vente est décidé tout seul : si l'émetteur porte le NIF du client du cabinet, c'est une vente.

## Écritures et export vers PC Compta

1. Menu **Écritures** → choisir le dossier. Les onglets AC, VT, BQ, CA, PA filtrent par journal.
2. Les écritures marquées **« compte proposé par l'agent »** demandent un coup d'œil : la raison est écrite en violet.
3. **Corriger** si besoin (le total des débits doit égaler celui des crédits).
4. Cocher et cliquer **Valider la sélection**.
5. Cliquer **Télécharger l'Excel PC Compta**, puis dans PC Compta : importer ce fichier dans les journaux, comme d'habitude.
   Les écritures passent « exportées » et ne peuvent plus être modifiées ici (une correction se fait alors dans PC Compta).
6. **État des achats du mois** : un Excel avec chaque facture d'achat, son NIF, son HT, sa TVA et son TTC.

## G50 du mois

1. Menu **G50** : la liste des dossiers avec l'état de chaque G50.
2. Ouvrir un dossier → **Préparer la G50**. Le calcul prend les pièces **validées** :
   TVA collectée par taux, TVA déductible (biens et services, immobilisations), précompte (crédit du mois précédent),
   IRG salaires (lu sur l'état de paie), droit de timbre des ventes en espèces.
3. Lire les **alertes** (état de paie manquant, prestations pas encore encaissées…).
4. Si besoin, **Corrections du cabinet** : forcer le précompte ou l'IRG, ajouter une ligne (par exemple un acompte IBS).
5. **L'associé** clique **Valider la G50**. Un message au client (montant et date limite) arrive dans la boîte d'envoi.
6. Saisir les montants sur Jibaya'tic ou sur le formulaire papier, à partir de l'écran, de l'**Excel** ou de l'**impression**.
7. Cliquer **Marquer déposée et payée** et noter la référence (accusé, quittance).

L'application ne transmet rien à la DGI : c'est voulu (pas d'interface officielle vérifiée).

## Boîte d'envoi : rien ne part sans vous

Tous les messages aux clients y attendent : relances de pièces, montant de la G50, résultat du mois.

- **Modifier** : changer l'objet, le texte ou l'adresse.
- **Valider et envoyer l'e-mail** : l'e-mail part de la boîte du cabinet.
- **Valider et ouvrir WhatsApp** : WhatsApp s'ouvre avec le message prérempli ; c'est vous qui appuyez sur Envoyer.
- **Écarter** : le brouillon est abandonné.

Les messages envoyés sont copiés dans **Messages**, que le client voit dans son espace.

## Relances de pièces

Menu **Relances** : pour chaque dossier, les pièces attendues ce mois (✓ reçue, ✗ manquante, « néant »).
**Préparer les relances** crée un brouillon par dossier incomplet (1er rappel par e-mail, puis rappel WhatsApp).
Un client qui n'a pas de ventes ce mois peut cliquer **Néant ce mois** dans son espace : la pièce n'est plus réclamée.

## Résultats du mois

Menu **Résultats** → dossier : chiffre d'affaires, achats, services, personnel, impôts et résultat, mois par mois, et le
cumul de l'exercice. Le client ne voit un mois qu'après **Publier au client**. C'est un résultat de gestion (sans
inventaire ni amortissements) ; le bilan annuel reste fait dans PC Compta.

## Échéancier

Menu **Échéancier** : chaque échéance du mois par dossier (G50, acomptes IBS, liasse, CNAS, DAS, CASNOS).
Les G50 se suivent seules ; les autres se cochent **Fait**. « À confirmer » signale une date à vérifier auprès de
l'organisme. Une échéance un vendredi ou un samedi est signalée.

## Ce que fait le client

Son espace (sur téléphone le plus souvent) :

- **Accueil** : ce qu'il reste à envoyer, la G50 à payer et sa date limite, le dernier résultat, les échéances.
- **Déposer** : choisir le mois et le type, prendre la photo ou joindre le PDF, envoyer.
- **Mes pièces** : l'état de chaque pièce (lue, validée, comptabilisée, rejetée avec le motif).
- **Mes G50**, **Mes résultats**, **Messages**.

## Réglages (associé)

Menu **Paramètres**, onglet par onglet, puis **Enregistrer** (ou **Remettre les valeurs par défaut**) :

| Onglet | Ce qu'on y change |
|---|---|
| Textes du site | Tous les textes du site public (titre, services, méthode, engagements, contact) |
| Coordonnées | Nom du cabinet, adresse, téléphone, e-mail, horaires, n° d'inscription, signature des messages |
| Modèles de relance | Les textes des e-mails et messages WhatsApp ; variables comme `{{contact}}`, `{{mois}}`, `{{liste_pieces}}`, `{{montant}}` |
| Échéancier | Les dates (jour, mois), les organismes, les dossiers concernés, la note « à confirmer » |
| Pièces à demander | La liste des pièces réclamées chaque mois et à qui |
| Schémas comptables | Le compte par nature, les comptes de TVA, de tiers, de trésorerie, de paie, les mots-clés des frais |
| Export PC Compta | Les colonnes du fichier, leur ordre, les codes des journaux, le format des dates |
| Relances automatiques | Les jours du mois où les brouillons sont préparés |

Menu **Agents IA** : ce que fait chaque agent, son texte de consigne, ses chiffres, l'interrupteur actif / inactif.
Menu **Comptes** : créer un compte (associé, collaborateur, client), changer un mot de passe, désactiver un accès.
Menu **Journal** : qui a fait quoi et quand. Menu **Demandes du site** : les messages du formulaire de contact.

## La démonstration

- Données **fictives**, figée au mardi 10/11/2026 ; tout ce que vous faites reste dans votre navigateur.
- **Réinitialiser la démo** (bandeau du haut) remet tout à zéro.
- Dans **Déposer**, des « pièces d'exemple » imitent une photo envoyée par le client : l'agent simulé les lit.
  Un vrai fichier se dépose aussi, mais l'agent simulé ne le lit pas (la fiche se remplit à la main).
- Aucun e-mail ni message WhatsApp n'est réellement envoyé.
