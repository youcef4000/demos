# Mémo 01 — la saisie comptable automatisée

| | |
|---|---|
| Fichier reçu | `memo-01.ogg` — 02:05 (125,2 s), Opus 48 kHz mono — empreinte SHA-256 `1e1c7cc9043eb757…` |
| Ordre | 1er mémo (ordre des fichiers transmis) |
| Transcription | Whisper **large-v3** (poids officiels, version CTranslate2 de `faster-whisper` 1.2.1), exécuté sur la machine de travail (processeur, int8). **Aucun envoi à un service externe.** |
| Langue détectée automatiquement | français 48 % · arabe 45 % → **darija mêlée de termes techniques français** (alternance des deux langues dans une même phrase) |
| Date de transcription | 10/11/2026 |

## Méthode

Whisper ne choisit qu'une langue par passage. Sur un mémo en darija avec des mots français, la passe « français »
**traduit** les passages en darija au lieu de les transcrire (d'où des phrases sans sens : « sécurité comptable »,
« le 50 % de l'emploi »). Trois passes ont donc été faites, toutes en local :

1. détection automatique de la langue sur le fichier entier (français retenu) ;
2. détection automatique segment par segment ;
3. contre-lecture en arabe, qui transcrit la darija telle qu'elle est prononcée (mots français écrits en lettres arabes :
   « ديزي كريتي كونتابل » = « des écritures comptables »).

Pour chaque segment : la sortie Whisper (avec `[?]` après chaque mot de probabilité inférieure à 0,5), puis le
**sens retenu** en français. Le sens retenu croise les passes ; quand elles divergent ou restent floues, le passage est
marqué `[?]`. Les sorties brutes complètes sont dans [annexe-sorties-brutes.md](annexe-sorties-brutes.md).

## Transcription horodatée

**[00:00 – 00:02]** · arabe
- Whisper (ar) : « السلام عليكم ورحمة الله وبركاته. »
- Sens retenu : « Assalamou alaykoum wa rahmatou Allah wa barakatouh. » (salutation)

**[00:02 – 00:06]** · arabe
- Whisper (ar) : « أريد[?] أن[?] أرسل لكم رسالة وكما[?] قلت قبل[?] أن[?] أتحدث عن كورتيكو.[?] »
- Sens retenu : « Je voulais vous envoyer un message ; comme je l'ai dit, avant de parler de […] [?] » — dernier mot non identifié.

**[00:05 – 00:12]** · français
- Whisper (fr) : « pour[?] l[?]'instant ce[?] que je vais te[?] dire c[?]'est que[?] c[?]'est un[?] CISI,[?] un[?] CISI c[?]'est un CISI comptable »
- Whisper (ar) : « الآن سأخبركم بشيء[?] سهل. سيزي[?] تحتوي على أجهزة كونتابل. »
- Sens retenu : « Pour l'instant, ce que je vais te dire, c'est que c'est une **saisie** [?], une saisie comptable. »
  (« CISI » / « سيزي » = « saisie » [?])

**[00:13 – 00:23]** · français
- Whisper (fr) : « selon le code comptable algérien, SCF, système financier comptable, c[?]'est-à-dire qu[?]'il y[?] a des »
- Whisper (ar) : « ويعتمد[?] على كود كونتابل أجري. كونتابل في[?] نظام النظام[?] المالي. يمكنكم[?] معرفة كونتابل وشيء سهل. »
- Sens retenu : « … selon le code comptable algérien, le **SCF**, système comptable financier ; c'est-à-dire qu'il y a des […] »

**[00:23 – 00:28]** · darija
- Whisper (ar) : « حاجة[?] سهلة له.[?] الاية[?] هادا. بقى[?] حينما[?] شنو دي احنا نسكانو. نكريو »
- Sens retenu : « C'est quelque chose de simple. Donc, nous, **on scanne** ; on crée… »

**[00:28 – 00:36]** · darija
- Whisper (ar) : « نسكانو ندوكيومو. زي ما بوشك[?] كريو نعطيه ندير ندوسي. بوعدي[?] ديجا هادية. »
- Whisper (fr) : « qui[?] nous[?] a[?] donné[?] la[?] rentrée,[?] nous[?] avons[?] déjà le[?] dossier. »
- Sens retenu : « On scanne le document, on le lui donne, **on crée un dossier** ; ensuite [?] c'est déjà fait. »

**[00:32 – 00:41]** · darija
- Whisper (ar) : « بقى نسكانو. ديو كمان ما[?] كي نسكانو يبعطي لي[?] شو كما قولو[?] تطازيمي.[?] يبعطي لي ازاشة[?] معالي وانت[?] كده اياه. »
- Whisper (fr) : « Ensuite[?] on[?] va[?] scanner,[?] il[?] va[?] nous[?] donner[?] une[?] information[?] sur[?] la[?] vente et[?] la[?] valeur.[?] »
- Sens retenu : « Donc on scanne ; quand on scanne, il [le programme] me donne […] [?] : il me donne les achats [?], la vente et la valeur [?]. »

**[00:40 – 00:46]** · darija
- Whisper (ar) : « بقى هو يتري ما[?] هو يصير يعرف بلي شكون الاشاة شكون لا[?] فونت. »
- Whisper (fr) : « Ensuite[?] on[?] va sélectionner les[?] achats et[?] les[?] ventes. »
- Sens retenu : « Ensuite **il trie** : il sait reconnaître ce qui est **un achat** et ce qui est **une vente**. »

**[00:45 – 00:55]** · darija
- Whisper (ar) : « حنا[?] نقولو زي ما نقول[?] له[?] هذا[?] يدي البرستانسيو هذا[?] يدي الاروفونتونيتا هذا يدي البرودوكسيو هذا يدي ترابو باش اعرف[?] اللي يستعملهم. »
- Whisper (fr) : « On[?] va le[?] dire[?] ce[?] que[?] c[?]'est la[?] prestation, le[?] venteur, la production, les[?] travaux pour[?] savoir si[?] on[?] les[?] utilise.[?] »
- Sens retenu : « Nous, on lui indique : ceci relève de la **prestation**, ceci de la **revente en l'état** [?], ceci de la
  **production**, ceci des **travaux**, pour savoir lesquels utiliser. » (« الاروفونتونيتا » ≈ « la revente en l'état » [?] ; passe française : « le venteur »)

**[00:55 – 01:00]** · darija et termes français
- Whisper (ar) : « ونبقى كي[?] يسكاني كي اعرف لا[?] بياس لأورتاكس تي فيا دروات[?] تامبر تي تي سي. »
- Whisper (fr) : « Ensuite on va scanner ce[?] qui est disponible[?] sur[?] le[?] site,[?] le[?] Ortax TV, le[?] Droite[?] Timbre TTC, »
- Sens retenu : « Et quand il scanne, il reconnaît **la pièce** : le **hors taxe (HT)**, la **TVA**, le **droit de timbre**, le **TTC**. »
  (« Ortax TV » = « hors taxe, TVA »)

**[00:59 – 01:08]** · darija et termes français
- Whisper (ar) : « المودي باي مويدة كي ينكتبو. يعني[?] كي ميقولي بروبوزي ديزي كريتي كونتابل. »
- Whisper (fr) : « Ici,[?] le[?] mode de paiement est[?] proposé pour[?] la[?] sécurité comptable. »
- Sens retenu : « **Le mode de paiement**, tel qu'il est écrit. C'est-à-dire qu'il me **propose des écritures comptables**. »
  (« sécurité comptable » / « ديزي كريتي كونتابل » = « des écritures comptables »)

**[01:05 – 01:11]** · darija et termes français
- Whisper (ar) : « ونبقى ديك ديزي كريتي كونتابل يحطم في الاكسيل. سمعنا[?] موديل تاع بيسي كونتا. »
- Whisper (fr) : « Lorsqu[?]'il y[?] a une sécurité comptable, il est[?] mis[?] dans l[?]'excel. C[?]'est un modèle PC[?] comptable. »
- Sens retenu : « Et ces écritures comptables, il les met **dans l'Excel**, selon **un modèle de PC Compta**. »

**[01:11 – 01:26]** · darija et termes français (passe arabe peu fiable sur ce passage)
- Whisper (fr) : « Parce[?] que PC comptable, tu[?] peux l[?]'acheter dans[?] l'excel. L[?]'excel, c[?]'est ce[?] que l[?]'on utilise[?] pour l[?]'achat. C[?]'est l[?]'achat des[?] paramètres et[?] ce[?] que[?] l'on incorpore. Ce[?] que l'on injecte dans le journal. »
- Whisper (ar) : « بس كوبيسي كونتا هذا[?] تستطيع اختيار[?] بريكسا لعمل[?] المخدوم على[?] حسب البرامتر والتنجيك في[?] الجورنال »
- Sens retenu : « Parce que **PC Compta, tu peux l'importer [?] depuis l'Excel**. L'Excel, c'est ce qu'on utilise pour
  l'import [?] ; l'import se fait **selon des paramètres**, et ce qu'on incorpore est **injecté dans le journal**. »
  (« acheter » / « achat » : probablement « importer » / « import » [?] ; la passe arabe confirme « البرامتر » = les paramètres et « التنجيك في الجورنال » = l'injection dans le journal)

**[01:26 – 01:30]** · darija
- Whisper (ar) : « هاك[?] دايا سمع[?] دي البرمير هادي هادي يشغل حاجة الاولى كما يقولوا »
- Whisper (fr) : « C[?]'est ce[?] qu[?]'on appelle le[?] 50[?]% de[?] l[?]'emploi. » — non retenu (traduction sans sens)
- Sens retenu : « Voilà, ça, c'est **la première** [chose], comme on dit. » [?]

**[01:30 – 01:39]** · darija
- Whisper (ar) : « واحد ساكنة بروسانو[?] من الخدمة. سمع نسكاني الورق. نعطيهم له.[?] نبعتهم له امبوريت هاك دايا. »
- Whisper (fr) : « On scanne les lettres, on les donne[?] et[?] on les met[?] dans[?] un[?] bureau.[?] »
- Sens retenu : « Le déroulé [?] du travail : **on scanne les papiers, on les lui donne, on les lui envoie**, importés, comme ça. »

**[01:37 – 01:46]** · darija
- Whisper (ar) : « هو يسلكشوني. يدفع شكون هي الاشاة. شكون هي الاشاة. شكون هو اه[?] شكون الهونت.[?] »
- Whisper (fr) : « On[?] sélectionne les[?] achats et[?] les ventes. »
- Sens retenu : « Lui, **il sélectionne** : ce qui est l'achat, ce qui est la vente [?]. »

**[01:45 – 01:49]** · darija
- Whisper (ar) : « قم[?] بك هو ي يبرموزين[?] الشي ما[?] دي كان[?] يتيل[?] بو شاك جورنال. »
- Whisper (fr) : « On propose un[?] schéma de crédibilité pour chaque journal. »
- Sens retenu : « Il nous **propose un schéma de comptabilisation** [?] **pour chaque journal**. » (« crédibilité » → « comptabilisation » [?], cohérent avec 01:55)

**[01:48 – 01:57]** · darija
- Whisper (ar) : « بصر كاين جورنال دي اشاة. كاين جورنال دي ابي.[?] كاين جورنال دي اه وونت. كاين » ; passe par segment : « يوجد جورنال للكاس »
- Whisper (fr) : « Il y a un journal des achats, un[?] journal de[?] paiement, un journal de vente, un journal de la[?] caisse. »
- Sens retenu : « Parce qu'il y a **un journal des achats, un journal de [paie ou de paiement ?], un journal des ventes, un journal de caisse**. »

**[01:55 – 02:02]** · français
- Whisper (fr) : « On[?] va donner[?] la comptabilisation pour chaque journal. On va quand[?] même l[?]'injecter dans la comptabilité. »
- Whisper (ar) : « … ومن[?] ثم ننجكهم[?] في المال »
- Sens retenu : « On donne **la comptabilisation pour chaque journal**, et ensuite **on l'injecte dans la comptabilité**. »

**[02:03 – 02:04]** · français
- Whisper (fr) : « C'est la première chose. » — Whisper (ar) : « هذا[?] هو أول شيء »
- Sens retenu : « C'est **la première chose**. »

## Passages incertains à faire confirmer au client

| Horodatage | Ce qui est incertain | Lecture retenue |
|---|---|---|
| 00:02 | Fin de phrase « … قبل أن أتحدث عن كورتيكو » | Non identifié, sans effet sur les besoins |
| 00:05 | « CISI » | « saisie » (comptable) |
| 00:28 – 00:41 | Début du déroulé (créer le dossier, ce que le programme rend après le scan) | On crée un dossier par client, le scan fait ressortir les montants |
| 00:45 | « الاروفونتونيتا » / « le venteur » | « la revente en l'état » (négoce) |
| 01:11 – 01:26 | « acheter dans l'Excel » | « importer depuis l'Excel » dans PC Compta, selon des paramètres |
| 01:45 | « schéma de crédibilité » | « schéma de comptabilisation » |
| 01:49 | « journal de ابي » / « journal de paiement » | Journal de paie ou de paiement : les deux sont retenus (banque et paie) |
