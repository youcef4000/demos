# 04 — Abonnements

**Prix vérifiés le 10/11/2026** sur le site officiel de chaque éditeur (adresse indiquée). Un prix qui n'est pas affiché
publiquement est noté **« à confirmer »**. Aucun compte n'a été créé et aucun abonnement souscrit.

Une seule option d'hébergement est à retenir (voir [03_architecture.md](03_architecture.md), § 6) : **A, en Algérie
(recommandée)**, ou **B, à l'étranger**.

## Tableau

| Outil | Usage | Formule | Prix mensuel | Prix annuel | Devise | Obligatoire ou optionnel | Au nom de | Source (vérifiée le 10/11/2026) |
|---|---|---|---|---|---|---|---|---|
| ICOSNET — VPS | **Option A** : serveur de l'application, base, pièces (Alger / Oran) | VMware VPS S : 1 vCPU, 4 Go, 80 Go | 6 545,00 (5 500 HT) | 78 540,00 (66 000 HT) | DZD | Obligatoire si option A | Client (cabinet) | https://icosnet.com.dz/en/vps-en/ |
| ICOSNET — Backup VPS | Option A : sauvegarde hors serveur (Veeam, 14 jours) | Backup S : 80 Go | à confirmer (sur devis) | à confirmer | DZD | Optionnel | Client | https://icosnet.com.dz/en/backup-vps-en/ |
| Hostinger — VPS | **Option B** : serveur de l'application (Union européenne) | KVM 2 : 2 vCPU, 8 Go, 100 Go — engagement 24 mois, 186,96 € payés d'avance | 7,79 (puis 14,99 au renouvellement) | 93,48 (puis 179,88) | EUR | Obligatoire si option B | Client | https://www.hostinger.com/fr/vps |
| Anthropic — API Claude | Agents `lecteur_pieces` et `imputation_scf` | Paiement à l'usage, Claude Opus 5.5 : 4 $ par million de jetons lus, 20 $ par million écrits | ≈ 45 (estimation pour 1 000 pièces lues par mois) | ≈ 540 (estimation) | USD | Optionnel : nécessaire seulement pour les agents IA | Client (compte API du cabinet) | https://platform.claude.com/docs/en/about-claude/pricing |
| Nom de domaine `.dz` | Adresse du site et de l'application (ex. `cabinet-xxx.dz`) | 1 an, via un bureau d'enregistrement agréé | à confirmer | à confirmer | DZD | Obligatoire pour la mise en ligne réelle | Client (le `.dz` est réservé aux organismes établis en Algérie) | https://www.nic.dz/ (site indisponible le 10/11/2026) |
| Messagerie du cabinet (SMTP) | Envoi des relances et messages validés | Boîte e-mail existante du cabinet | 0 si le cabinet en a déjà une | 0 | — | Obligatoire pour l'envoi d'e-mails | Client | — (outil existant) |
| PC Compta | Comptabilité (import de l'Excel des écritures) | Licence déjà utilisée par le cabinet | 0 (aucun nouvel abonnement) | 0 | — | Existant, gardé | Client | — (outil existant) |
| Microsoft Excel | Ouvrir les exports (PC Compta, G50, état des achats) | Déjà utilisé par le cabinet | 0 | 0 | — | Existant, gardé | Client | — (outil existant) |
| WhatsApp | Relances par message prérempli | Application gratuite | 0 | 0 | — | Optionnel | Client | — |
| Caddy + Let's Encrypt | Certificat HTTPS | Logiciel libre, certificat gratuit | 0 | 0 | — | Obligatoire (inclus) | — | https://letsencrypt.org/ |
| GitHub Pages | Démo en ligne (données fictives) | Gratuit pour un dépôt public | 0 | 0 | — | Démo seulement | Prestataire | https://pages.github.com/ |

Estimation de l'API Claude : une pièce lue ≈ 3 000 jetons lus (image et consigne) et ≈ 1 500 jetons écrits (fiche
et raisonnement), soit ≈ 0,04 $ ; l'agent d'imputation n'intervient que sur les lignes sans règle (quelques centimes par
mois). Le coût réel dépend du nombre de pièces et se lit chaque mois dans la console Anthropic ; un plafond de
dépense mensuel peut y être fixé.

## Totaux

Les montants « à confirmer » (domaine, sauvegarde ICOSNET) ne sont pas inclus. Pas de conversion entre devises : le
cours appliqué est celui du jour de paiement.

| Scénario | Total mensuel | Total annuel |
|---|---|---|
| **Option A sans agents IA** | 6 545,00 DZD TTC | 78 540,00 DZD TTC |
| **Option A avec agents IA** (après autorisation ANPDP) | 6 545,00 DZD TTC + ≈ 45 USD | 78 540,00 DZD TTC + ≈ 540 USD |
| **Option B sans agents IA** | 7,79 EUR (14,99 EUR après 24 mois) | 93,48 EUR (179,88 EUR après 24 mois) |
| **Option B avec agents IA** | 7,79 EUR + ≈ 45 USD | 93,48 EUR + ≈ 540 USD |

## Abonnements facturés en devises

| Abonnement | Devise | Moyen de paiement nécessaire |
|---|---|---|
| Anthropic — API Claude | **USD** | Carte bancaire internationale (Visa ou Mastercard) acceptant les paiements en ligne en dollars, rechargée en crédits prépayés |
| Hostinger — VPS (option B) | **EUR** | Carte bancaire internationale (Visa ou Mastercard) ou PayPal |

En Algérie, une carte internationale s'obtient auprès d'une banque, adossée à un compte en devises : conditions et
plafonds à vérifier auprès de la banque du cabinet. Si le cabinet ne peut pas payer en devises, le prestataire peut
porter l'abonnement et le refacturer en DA ; le compte serait alors **au nom du prestataire**, ce qui impose un contrat
de sous-traitance (loi 18-07) et un transfert des accès au cabinet en fin de contrat.

Les abonnements de l'option A sont en **DZD**, payables en ligne par **CIB ou Edahabia** (paiement en ligne proposé par
ICOSNET) ou par virement.
