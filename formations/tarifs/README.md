# Section prix de Hooked Academy : « Compose ta formule »

Conception de la section prix de la landing (https://hooked-academy.tech, thème « cut ») et de `/ia/` (thème « glass »),
novembre 2026. Code : `sites/hooked-academy/assets/js/compose.js` et `assets/css/compose.css`. Prix : `data/offres.js`
(ou Admin → Réglages).

## Le principe

L'élève choisit une formule toute faite **ou coche ses formations** ; un ticket calcule en direct la meilleure formule :

| Coché | Formule | Prix | Ce que le ticket dit |
|---|---|---|---|
| une formation | cette formation | 20 000 / 25 000 / 30 000 DA | le pack qui ajoute le plus pour le moins (avec le vrai calcul) |
| Créative + IA | pack Créative + IA | 35 000 DA (au lieu de 45 000) | « Ajoute Sites & Apps pour 15 000 DA de plus au lieu de 30 000 » |
| Créative + Sites & Apps | pack complet | 50 000 DA | « au même prix, le pack complet ajoute l'IA » (offerte) |
| IA + Sites & Apps | pack complet | 50 000 DA | « le pack complet coûte 5 000 DA de moins et ajoute la Créative » |
| les trois (par défaut) | pack complet | 50 000 DA (au lieu de 75 000) | « tu as la meilleure offre » |

Le bouton du ticket remplit le formulaire (identifiants serveur inchangés : `creative`, `ia`, `dev`, `both`, `all`).

## Les leviers, leurs sources, et la limite qu'on s'impose

| Levier | Où sur la page | Source |
|---|---|---|
| **Option par défaut** : les trois formations cochées au départ ; on décoche librement | configurateur | Les options par défaut sont suivies largement, surtout par friction (étude sur 8,6 millions de décisions, *Management Science*) ; rapport du gouvernement britannique sur les choix par défaut en ligne |
| **« Je l'ai composé moi-même »** : l'élève construit sa formule | configurateur | Franke, Schreier et Kaiser (2010), *Management Science* : un produit composé soi-même augmente nettement la disposition à payer |
| **Prix de référence réel et remise visible** : la somme des formations vendues séparément, barrée, puis « Remise pack » et le tampon −33 % | ticket | Recherche sur les prix de référence (ancrage) et sur la présentation des remises en lot ; l'ASA rappelle qu'un prix de référence doit être réel |
| **Leurre et option dominée** : les combinaisons avec Sites & Apps deviennent le pack complet, qui coûte autant ou moins | ticket (conseil) | Effet de leurre / dominance asymétrique (expérience d'Ariely sur l'abonnement de *The Economist*) ; effet conditionnel selon Simonson (Stanford) |
| **Effet de centre et effet de compromis** : trois formules, la meilleure mise en avant et signalée | formules toutes faites | Center-stage effect (Valenzuela et Raghubir) ; compromise effect (Simonson, 1989) ; effet d'isolement (von Restorff) pour l'étiquette « Meilleure offre » |
| **Prix ramené à la leçon et au jour** : « soit 230 DA la leçon · 137 DA par jour sur un an » | ticket | Gourville (1998), « pennies-a-day » ; Hershfield, Shu et Benartzi : un montant présenté par jour a multiplié par quatre les inscriptions dans une appli d'épargne |
| **Moins de douleur de payer** : « À payer aujourd'hui : 0 DA », paiement après l'appel | ticket, bande défilante | Prelec et Loewenstein (douleur de payer) ; en Algérie, méfiance envers le paiement en ligne et préférence pour l'espèces (mémoires 2024-2025, rapport CNUCED 2025) |
| **Progression déjà engagée** : étape 1 sur 3 cochée dès qu'une formule est choisie | ticket | Nunes et Drèze (2006), endowed progress effect |
| **Peu d'options visibles** : 3 formules, 3 formations à cocher | section | Iyengar et Lepper (2000) ; effet discuté depuis (méta-analyses), donc on reste simple sans en faire une règle absolue |
| **Mouvement au service du retour visuel** : chiffres qui basculent, lignes imprimées, tampon, conseil qui bouge | partout | Nielsen Norman Group : l'animation sert surtout de retour d'information discret |

**Ce qu'on ne fait pas** (règle du dépôt et rapport de la FTC *Bringing Dark Patterns to Light*, 2022) : pas de faux avis,
de faux nombre d'inscrits, de faux compte à rebours ni de fausse rareté. La seule « urgence » affichée est la session
réelle des réglages (« Inscriptions ouvertes · Prochaine session »).

## Sources

- [Effet de leurre (Wikipédia, expérience The Economist)](https://en.wikipedia.org/wiki/Decoy_effect) ·
  [Stanford GSB, Itamar Simonson](https://www.gsb.stanford.edu/insights/itamar-simonson-what-influences-shoppers)
- [Center-stage effect (BPS Research Digest)](https://bps.org.uk/research-digest/people-prefer-middle-option) ·
  [Commentaire sur Bar-Hillel (PMC)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4934675/)
- [Extremeness aversion (Kellogg)](https://www.kellogg.northwestern.edu/~/media/Files/Faculty/Research/13_Extremeness_Aversion_and_Attribute-Balance_Effects_in_Choice_2004.ashx)
- [Gourville 1998, Pennies-a-Day (IDEAS)](https://ideas.repec.org/a/oup/jconrs/v24y1998i4p395-408.html) ·
  [Atlas et Bartels 2018](https://home.uchicago.edu/~bartels/papers/Atlas-Bartels-2018-JCR.pdf) ·
  [Hershfield, Shu et Benartzi](https://anderson-review.ucla.edu/wp-content/uploads/2021/03/Hershfield_Shu_Benartzi_2018_SSRN-id3097468.pdf)
- [Defaults and Decisions (Management Science)](https://pubsonline.informs.org/doi/full/10.1287/mnsc.2024.05272) ·
  [Choix par défaut en ligne (gouvernement britannique)](https://assets.publishing.service.gov.uk/media/672208443aa14203d06ef49d/research-into-potentially-harmful-online-choice-architecture.pdf)
- [Franke, Schreier et Kaiser 2010 (WU Vienne)](https://www.wu.ac.at/fileadmin/wu/d/i/entrep/4_forschung/full-text-papers/franke_schreier_kaiser_2010_designed_it_myself.pdf)
- [Iyengar et Lepper 2000](https://faculty.washington.edu/jdb/345/345%20Articles/Iyengar%20&%20Lepper%20(2000).pdf) ·
  [Scheibehenne et al. 2010](https://abcwest.cogs.indiana.edu/pmwiki/pdf/scheibehenne.options.2010.pdf)
- [Prix de référence (ASA)](https://www.asa.org.uk/static/uploaded/243ac478-b4ee-4250-9ca5a976543169cd.pdf) ·
  [Présentation des remises en lot (Springer 2020)](https://link.springer.com/article/10.1007/s41464-020-00082-2)
- [Douleur de payer (Wikipédia)](https://Www.Wikipedia.org/wiki/Pain_of_paying)
- [Endowed progress effect (Nunes et Drèze)](https://ideas.repec.org/a/oup/jconrs/v32y2006i4p504-512.html)
- [Commerce électronique en Algérie, CNUCED 2025](https://empretec.unctad.org/system/files/official-document/dtlecde2025d3_en.pdf) ·
  [Mémoire, Université de Béjaïa](https://www.univ-bejaia.dz/jspui/bitstream/123456789/26318/1/Les%20obstacles%20%c3%a0%20la%20pratique%20du%20commerce%20%c3%a9lectronique%20en%20Alg%c3%a9rie.pdf)
- [Animation et UX (Nielsen Norman Group)](https://www.nngroup.com/articles/animation-purpose-ux/)
- [Dark patterns (FTC, 2022)](https://www.ftc.gov/system/files/ftc_gov/pdf/P214800%20Dark%20Patterns%20Report%209.14.2022%20-%20FINAL.pdf)

## Aperçu offert : 5 vidéos des formations non achetées (novembre 2026)

Un étudiant qui a une formation voit 5 leçons de chacune des autres, marquées « Offerte ». Le but : qu'il goûte la
formation qu'il n'a pas, et qu'il l'ajoute à son pack. La psychologie utilisée :

| Principe | Comment il est appliqué |
|---|---|
| Échantillon et réciprocité (Cialdini) | De vraies leçons, pas une bande-annonce : une banque de 20 hooks, la structure d'un prompt, le premier site construit avec Claude Code. |
| Un résultat rapide (sentiment de compétence) | Chaque formation a une leçon « je peux le faire » : banque de hooks, packshot du téléphone au studio, la vitrine avec Claude Code. |
| L'effet « waouh » | Le moment qui fait rêver : animer un packshot, un avatar qui parle, un site en ligne gratuitement. |
| Le désir (l'argent) | La dernière leçon parle de vendre : parcours WhatsApp, fixer ses prix, la stratégie de la démo. |
| Boucle ouverte (effet Zeigarnik) | Une leçon par grande étape, pas une série : chaque vidéo offerte est entourée de leçons fermées, et la suivante est verrouillée. |
| Progression déjà commencée (Nunes et Drèze) | Les vidéos regardées comptent dans la progression (« 2/5 vues »), et la progression est gardée à l'achat. |

| Formation | Les 5 leçons offertes |
|---|---|
| Créative | M02 Le Hook : arrêter le scroll · M02 La banque de hooks : 20 formules · M03 SONCAS : les 6 boutons psychologiques · M07 Trouver les pubs qui marchent · M10 De la pub à la vente : le parcours WhatsApp |
| IA | IA01 La structure d'un bon prompt · IA02 Packshot : du téléphone au studio · IA03 Animer un packshot en 5 secondes · IA05 Créer un avatar et le faire parler · IA08 Fixer ses prix |
| Sites & Apps | D01 C'est quoi, le vibe coding ? · D03 Claude Code : l'agent qui construit avec toi · D04 Construire la vitrine avec Claude Code · D06 GitHub Pages pas à pas · D13 La stratégie de la démo |

Pour changer une leçon : la liste `PREVIEW` dans `server/plateforme.js` et dans `sites/hooked-academy/assets/js/store.js`.

## À mesurer ensuite

Les études donnent des tendances, pas une garantie. La plateforme compte déjà les visites des deux landings (test A/B) et
les inscriptions par formule : comparer la part du pack complet et le taux d'inscription avant et après ce changement,
sur quelques semaines, avant de modifier autre chose.
