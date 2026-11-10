# Annexe — sorties brutes de Whisper large-v3

Sorties non retouchées des trois passes, mot par mot. `[?]` suit chaque mot dont la probabilité Whisper est inférieure à 0,5. Les boucles de répétition (hallucinations connues de Whisper sur de la parole mêlée de deux langues) sont laissées telles quelles pour la traçabilité ; elles ne sont pas retenues dans memo-01.md et memo-02.md.

## memo-01 — détection automatique sur le fichier entier

```text
[00:05–00:11]  pour[?] l[?]'instant ce[?] que je vais te[?] dire c[?]'est que[?] c[?]'est un[?] CISI,[?] un[?] CISI c[?]'est un CISI comptable
[00:13–00:30]  selon le code comptable algérien, SCF, système financier comptable, c[?]'est-à-dire qu[?]'il y[?] a des
[00:30–00:33]  qui[?] nous[?] a[?] donné[?] la[?] rentrée,[?] nous[?] avons[?] déjà le[?] dossier.
[00:34–00:40]  Ensuite[?] on[?] va[?] scanner,[?] il[?] va[?] nous[?] donner[?] une[?] information[?] sur[?] la[?] vente et[?] la[?] valeur.[?]
[00:40–00:44]  Ensuite[?] on[?] va sélectionner les[?] achats et[?] les[?] ventes.
[00:44–00:53]  On[?] va le[?] dire[?] ce[?] que[?] c[?]'est la[?] prestation, le[?] venteur, la production, les[?] travaux pour[?] savoir si[?] on[?] les[?] utilise.[?]
[00:54–00:59]  Ensuite on va scanner ce[?] qui est disponible[?] sur[?] le[?] site,[?] le[?] Ortax TV, le[?] Droite[?] Timbre TTC,
[00:59–01:06]  Ici,[?] le[?] mode de paiement est[?] proposé pour[?] la[?] sécurité comptable.
[01:06–01:09]  Lorsqu[?]'il y[?] a une sécurité comptable, il est[?] mis[?] dans l[?]'excel.
[01:09–01:11]  C[?]'est un modèle PC[?] comptable.
[01:11–01:13]  Parce[?] que PC comptable, tu[?] peux l[?]'acheter dans[?] l'excel.
[01:14–01:15]  L[?]'excel, c[?]'est ce[?] que l[?]'on utilise[?] pour l[?]'achat.
[01:16–01:20]  C[?]'est l[?]'achat des[?] paramètres et[?] ce[?] que[?] l'on incorpore.
[01:21–01:25]  Ce[?] que l'on injecte dans le journal.
[01:27–01:31]  C[?]'est ce[?] qu[?]'on appelle le[?] 50[?]% de[?] l[?]'emploi.
[01:32–01:36]  On scanne les lettres, on les donne[?] et[?] on les met[?] dans[?] un[?] bureau.[?]
[01:37–01:41]  On[?] sélectionne les[?] achats et[?] les ventes.
[01:45–01:48]  On propose un[?] schéma de crédibilité pour chaque journal.
[01:48–01:55]  Il y a un journal des achats, un[?] journal de[?] paiement, un journal de vente, un journal de la[?] caisse.
[01:55–02:00]  On[?] va donner[?] la comptabilisation pour chaque journal.
[02:00–02:02]  On va quand[?] même l[?]'injecter dans la comptabilité.
[02:03–02:04]  C'est la première chose.
```

## memo-01 — détection automatique segment par segment

```text
[00:05–00:11]  pour[?] l[?]'instant ce[?] que je vais te[?] dire c[?]'est que[?] c[?]'est un[?] CISI,[?] un[?] CISI c[?]'est un CISI comptable
[00:13–00:30]  selon le code comptable algérien, SCF, système financier comptable, c[?]'est-à-dire qu[?]'il y[?] a des
[00:33–01:01]  ونقوم[?] بإعطاءه[?] ونقوم[?] بإعطاءه ونقوم بإعطاءه ونقوم بإعطاءه ونقوم بإعطاءه ونقوم بإعطاءه ونقوم بإعطاءه ونقوم بإعطاءه ونقوم بإعطاءه ونقوم بإعطاءه ونقوم بإعطاءه ونقوم بإعطاءه ونقوم بإعطاءه ونقوم بإعطاءه ونقوم
[01:01–01:30]  او[?] ايضا[?] يمكنك[?] اكتب ايضا[?] يمكنك[?] اكتب ايضا يمكنك اكتب ايضا يمكنك اكتب ايضا يمكنك اكتب ايضا يمكنك اكتب ايضا يمكنك اكتب ايضا يمكنك اكتب ايضا يمكنك اكتب ايضا يمكنك اكتب ايضا يمكنك اكتب ايضا يمكنك اكتب ايضا يمك
[01:30–01:36]  من[?] خدمة. سمعنا[?] نسكاني[?] الورق. نضعهم له. نبعتهم له ام[?] بغيت
[01:36–01:42]  هكذا دعية.[?] هو يتفاعي شكون[?] هي الاشاة. شكون هي الاشاة. شكون
[01:42–01:48]  هو شكون الهونت.[?] ونبقى هو[?] ينفذ[?] الشيء[?] ما يكون اتمنى[?] لك[?] لشك[?]
[01:48–01:52]  جورنال. لانه يوجد جورنال للاشاة. يوجد جورنال للبيع. يوجد جورنال
[01:52–01:58]  للهونت. يوجد جورنال للكاس. هو يشغل كما يقولوا. يدي
[01:58–02:00]  ونقوم[?] بإعادة المساعدة[?] على[?] كل[?] جورنمت[?]
[02:00–02:02]  ومن[?] ثم نقوم بإعادة المساعدة على كل جورنمت
[02:03–02:04]  هذا[?] هو الأول
```

## memo-01 — contre-lecture en arabe (darija)

```text
[00:00–00:02]  السلام عليكم ورحمة الله وبركاته.
[00:02–00:06]  أريد[?] أن[?] أرسل لكم رسالة وكما[?] قلت قبل[?] أن[?] أتحدث عن كورتيكو.[?]
[00:06–00:10]  الآن سأخبركم بشيء[?] سهل.
[00:10–00:12]  سيزي[?] تحتوي على أجهزة كونتابل.
[00:13–00:17]  ويعتمد[?] على كود كونتابل أجري.
[00:17–00:19]  كونتابل في[?] نظام النظام[?] المالي.
[00:19–00:23]  يمكنكم[?] معرفة كونتابل وشيء سهل.
[00:23–00:28]  حاجة[?] سهلة له.[?] الاية[?] هادا. بقى[?] حينما[?] شنو دي احنا نسكانو. نكريو
[00:28–00:32]  نسكانو ندوكيومو. زي ما بوشك[?] كريو نعطيه ندير ندوسي. بوعدي[?]
[00:32–00:36]  ديجا هادية. بقى نسكانو. ديو كمان ما[?] كي نسكانو يبعطي لي[?] شو كما
[00:36–00:41]  قولو[?] تطازيمي.[?] يبعطي لي ازاشة[?] معالي وانت[?] كده اياه. بقى هو يتري
[00:41–00:46]  ما[?] هو يصير يعرف بلي شكون الاشاة شكون لا[?] فونت. حنا[?] نقولو زي ما
[00:46–00:50]  نقول[?] له[?] هذا[?] يدي البرستانسيو هذا[?] يدي الاروفونتونيتا هذا يدي
[00:50–00:55]  البرودوكسيو هذا يدي ترابو باش اعرف[?] اللي يستعملهم. ونبقى
[00:55–00:59]  كي[?] يسكاني كي اعرف لا[?] بياس لأورتاكس تي فيا دروات[?] تامبر تي تي
[00:59–01:05]  سي. المودي باي مويدة كي ينكتبو. يعني[?] كي ميقولي بروبوزي
[01:05–01:08]  ديزي كريتي كونتابل. ونبقى ديك ديزي كريتي كونتابل يحطم في
[01:08–01:12]  الاكسيل. سمعنا[?] موديل تاع بيسي كونتا. بس كوبيسي كونتا هذا[?]
[01:12–01:26]  تستطيع اختيار[?] بريكسا لعمل[?] المخدوم على[?] حسب البرامتر والتنجيك في[?] الجورنال
[01:26–01:30]  هاك[?] دايا سمع[?] دي البرمير هادي هادي يشغل حاجة الاولى كما يقولوا
[01:30–01:35]  واحد ساكنة بروسانو[?] من الخدمة. سمع نسكاني الورق. نعطيهم له.[?]
[01:35–01:39]  نبعتهم له امبوريت هاك دايا. هو يسلكشوني. يدفع شكون هي
[01:39–01:46]  الاشاة. شكون هي الاشاة. شكون هو اه[?] شكون الهونت.[?] قم[?] بك هو ي
[01:46–01:49]  يبرموزين[?] الشي ما[?] دي كان[?] يتيل[?] بو شاك جورنال. بصر كاين جورنال
[01:49–01:54]  دي اشاة. كاين جورنال دي ابي.[?] كاين جورنال دي اه وونت. كاين
[01:57–02:00]  ويقومون[?] بإعطاء[?] المال[?] لجميع الجوانب[?]
[02:00–02:02]  ومن[?] ثم ننجكهم[?] في المال
[02:03–02:04]  هذا[?] هو أول شيء
```

## memo-02 — détection automatique sur le fichier entier

```text
[00:00–00:04]  On[?] va[?] dire[?] que les G50, les G50, on[?] a chaque mois les[?] G50 qui[?] nous[?] servent.
[00:04–00:13]  Je[?] vais[?] dire, les factures d'achat, tu as le mois, il y a un état que[?] tu veux récupérer selon l'ampleur fiscale.
[00:14–00:16]  On va dire un[?] autre, il y a le chiffre d'affaires.
[00:17–00:22]  On va dire la compensation pour les G50, le chiffre d'affaires, le chiffre d'affaires,
[00:22–00:26]  le chiffre d'affaires sur[?] la vente, le chiffre d'affaires sur l'achat,
[00:26–00:30]  la[?] déduction, tu[?] reçois un pré-compte ou la[?] TVAPI.
[00:31–00:34]  Il[?] y a l[?]'IRG sur le[?] salaire.
[00:34–00:36]  L[?]'IRG sort[?] de[?] l[?]'ARICA.[?]
[00:37–00:41]  Et[?] les[?] comptes, on[?] les déroule[?] sur[?] le[?] résultat.
[00:41–00:43]  Nous,[?] on[?] donne[?] le résultat du[?] mois d[?]'août,
[00:43–00:46]  et[?] on fait[?] le[?] G50 ou[?] l[?]'Excel.
[00:47–00:48]  C[?]'est tout[?] pour aujourd[?]'hui.
[00:49–00:49]  C[?]'est tout[?] pour aujourd'hui.
[00:49–00:50]  On[?] se[?] revoit dans[?] le[?] musée,
[00:50–00:51]  et on va[?] envoyer un[?] message.
```

## memo-02 — détection automatique segment par segment

```text
[00:00–00:04]  On[?] va[?] dire[?] que les G50, les G50, on[?] a chaque mois les[?] G50 qui[?] nous[?] servent.
[00:04–00:13]  Je[?] vais[?] dire, les factures d'achat, tu as le mois, il y a un état que[?] tu veux récupérer selon l'ampleur fiscale.
[00:14–00:16]  On va dire un[?] autre, il y a le chiffre d'affaires.
[00:17–00:22]  On va dire la compensation pour les G50, le chiffre d'affaires, le chiffre d'affaires,
[00:22–00:26]  le chiffre d'affaires sur[?] la vente, le chiffre d'affaires sur l'achat,
[00:26–00:30]  ويجب[?] عليك[?] الاختصار[?] بضرورة[?] تلك[?] الرسالة
[00:30–00:36]  ويمكنك[?] إختيار[?] تلك[?] الرسالة باستخدام الارجي[?]
[00:36–00:41]  ويمكنك إختيارها بهذه[?] الرسالة
[00:41–00:45]  نحن[?] سنطرح[?] الرسالة للموزع[?] ونقتله[?] يوم[?] السبت[?]
[00:46–00:51]  هذه[?] هي نتيجة الاجتماع للموزع
```

## memo-02 — contre-lecture en arabe (darija)

```text
[00:00–00:03]  سنقوم[?] بإعطاء الـ[?] G50 للموظفين
[00:03–00:04]  ونقوم[?] بإعطاء الـ[?] G50 للموظفين
[00:04–00:07]  ونقوم بإعطاء الـ G50 للموظفين
[00:07–00:08]  ونقوم بإعطاء الـ G50 للموظفين
[00:08–00:13]  ونقوم بإعطاء الـ G50 للموظفين
[00:13–00:16]  ونقوم بإعطاء الـ G50 للموظفين
[00:16–00:21]  ونقوم بإعطاء الـ G50 للموظفين
[00:21–00:22]  ونقوم بإعطاء الـ G50 للموظفين
[00:22–00:24]  ونقوم بإعطاء الـ G50 للموظفين
[00:24–00:30]  ونقوم بإعطاء الـ G50 للموظفين
[00:31–00:35]  او[?] كانت[?] اا[?] كأن[?] الاير[?] جي سر[?] صالح اذا[?] كنت هو[?] اللي احنا اهي[?]
[00:35–00:40]  امد[?] الله[?] عليك اهي[?] خرج منها الاير جي اودك[?] ليس[?] اهي[?] يديرهم
[00:40–00:45]  هو على حساب الهيزلتة[?] احنا باخنا[?] نعطي له[?] هيخدم[?] ناجي[?] ساكونت
[00:45–00:51]  ونكسال[?] هادي[?] هادي[?] هادي هادي شغلة[?] لكفيرا[?] ميوزيزي نباتي
[00:51–00:51]  للمساجد
```

