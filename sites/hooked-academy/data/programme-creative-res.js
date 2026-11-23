// Ressources d'atelier de la Formation Créative : un prompt ou un modèle à remplir pour les leçons qui n'en avaient pas.
// Chaque entrée : une liste de { fr, en, ar } ({ title, text } par langue). Le français s'ajoute au programme
// (programme.js) ; l'anglais et l'arabe sont recopiés dans data/i18n/<langue>/<module>.js.
// Les crochets [ ] sont à remplacer par le produit, la cible, la ville de l'étudiant.
const R = (fr, en, ar) => ({ fr, en, ar });

export const RES_CREATIVE = {
  'm0-l1': [
    R(
      {
        title: 'Ma fiche de départ',
        text: `Mon produit : [nom du produit]
Ce qu’il fait, en une phrase : [  ]
À qui il s’adresse : [âge, ville, situation]
Où je le vends : [page, WhatsApp, boutique]

Mon heure de leçon chaque jour : [  ] h — rappel mis sur le téléphone : oui / non
CapCut installé : oui / non — Canva installé : oui / non
Album « Formation » créé sur le téléphone : oui / non

Ce que je veux savoir faire à la fin : [  ]`,
      },
      {
        title: 'My starting sheet',
        text: `My product: [product name]
What it does, in one sentence: [  ]
Who it is for: [age, city, situation]
Where I sell it: [page, WhatsApp, shop]

My lesson time every day: [  ] — reminder set on my phone: yes / no
CapCut installed: yes / no — Canva installed: yes / no
“Course” album created on my phone: yes / no

What I want to be able to do by the end: [  ]`,
      },
      {
        title: 'بطاقة الانطلاق',
        text: `منتجي: [اسم المنتج]
ماذا يفعل في جملة واحدة: [  ]
لمن هو موجّه: [العمر، المدينة، الوضعية]
أين أبيعه: [صفحة، واتساب، متجر]

ساعة درسي كل يوم: [  ] — وضعت تذكيرًا في الهاتف: نعم / لا
CapCut مثبّت: نعم / لا — Canva مثبّت: نعم / لا
أنشأت ألبوم «التكوين» في الهاتف: نعم / لا

ما أريد أن أتقنه في النهاية: [  ]`,
      },
    ),
  ],
  'm0-l4': [
    R(
      {
        title: 'Mon carnet du projet final',
        text: `Le produit de mon projet final : [  ]
Pourquoi celui-là : [je le vends vraiment / je le connais bien / j’ai des photos et vidéos]

Mes meilleurs exercices à garder (note la leçon et le fichier) :
- Hook : [leçon] — [nom du fichier]
- Script : [leçon] — [nom du fichier]
- Plans filmés : [leçon] — [nom du fichier]
- Carte CTA : [leçon] — [nom du fichier]

Ce que je dois encore apprendre avant le projet : [  ]`,
      },
      {
        title: 'My final project notebook',
        text: `The product for my final project: [  ]
Why this one: [I really sell it / I know it well / I have photos and videos]

My best exercises to keep (note the lesson and the file):
- Hook: [lesson] — [file name]
- Script: [lesson] — [file name]
- Filmed shots: [lesson] — [file name]
- CTA card: [lesson] — [file name]

What I still need to learn before the project: [  ]`,
      },
      {
        title: 'دفتر المشروع النهائي',
        text: `منتج مشروعي النهائي: [  ]
لماذا هذا المنتج: [أبيعه فعلًا / أعرفه جيدًا / عندي صور وفيديوهات له]

أفضل تماريني التي أحتفظ بها (اكتب الدرس والملف):
- الهوك: [الدرس] — [اسم الملف]
- السكريبت: [الدرس] — [اسم الملف]
- اللقطات المصوّرة: [الدرس] — [اسم الملف]
- بطاقة CTA: [الدرس] — [اسم الملف]

ما بقي عليّ تعلّمه قبل المشروع: [  ]`,
      },
    ),
  ],
  'm1-l1': [
    R(
      {
        title: 'Prompt — quel format pour mon produit ?',
        text: `Agis comme un créateur de publicités pour les réseaux sociaux. Mon produit : [produit]. Ma cible : [cible]. Ce qu’il faut voir pour y croire : [ce que le produit fait de visible].
Compare pour ce produit les 3 formats : vidéo courte (15 à 30 s), image et carrousel. Pour chacun : ce qu’il montrerait, sa force, sa limite. Termine par le format à produire en premier et explique pourquoi en 2 phrases. N’invente aucune caractéristique du produit.`,
      },
      {
        title: 'Prompt — which format for my product?',
        text: `Act as a social media ad creator. My product: [product]. My audience: [audience]. What people need to see to believe it: [what the product visibly does].
For this product, compare the 3 formats: short video (15 to 30 s), image and carousel. For each one: what it would show, its strength, its limit. End with the format to produce first and explain why in 2 sentences. Do not invent any product feature.`,
      },
      {
        title: 'برومبت — أي صيغة تناسب منتجي؟',
        text: `تصرّف كصانع إعلانات لمواقع التواصل. منتجي: [المنتج]. جمهوري: [الجمهور]. ما يجب أن يُرى ليصدّقه الناس: [ما يفعله المنتج بشكل مرئي].
قارن لهذا المنتج بين الصيغ الثلاث: فيديو قصير (15 إلى 30 ثانية)، صورة، كاروسيل. لكل صيغة: ماذا ستُظهر، نقطة قوتها، حدّها. اختم بالصيغة التي أنتجها أولًا واشرح السبب في جملتين. لا تخترع أي خاصية للمنتج.`,
      },
    ),
  ],
  'm1-l3': [
    R(
      {
        title: 'Aide-mémoire — formats, tailles et zones cachées',
        text: `9:16 — 1080 × 1920 px : Reels, TikTok, Stories, Shorts. Le format à produire en premier.
4:5 — 1080 × 1350 px : le fil Instagram et Facebook.
1:1 — 1080 × 1080 px : carrousels et fil.
16:9 — 1920 × 1080 px : YouTube.

Zones cachées en 9:16 (repères approximatifs, l’interface change selon l’appli) :
- en haut : environ 250 px (nom du compte, bouton fermer) ;
- en bas : environ 350 px (légende, bouton d’action) ;
- à droite : environ 150 px (j’aime, commentaires, partage).
Garde le produit, le texte et le visage au centre.

Méthode : filme en 9:16 avec de la marge en haut et en bas, puis duplique le projet et recadre en 4:5 et 1:1.`,
      },
      {
        title: 'Cheat sheet — formats, sizes and hidden areas',
        text: `9:16 — 1080 × 1920 px: Reels, TikTok, Stories, Shorts. The format to produce first.
4:5 — 1080 × 1350 px: Instagram and Facebook feed.
1:1 — 1080 × 1080 px: carousels and feed.
16:9 — 1920 × 1080 px: YouTube.

Hidden areas in 9:16 (approximate, the interface changes with each app):
- top: about 250 px (account name, close button);
- bottom: about 350 px (caption, action button);
- right: about 150 px (likes, comments, share).
Keep the product, text and face in the centre.

Method: film in 9:16 with margin at the top and bottom, then duplicate the project and reframe in 4:5 and 1:1.`,
      },
      {
        title: 'مذكّرة — الصيغ والمقاسات والمناطق المخفية',
        text: `9:16 — 1080 × 1920 بكسل: ريلز، تيك توك، ستوري، شورتس. الصيغة التي تنتجها أولًا.
4:5 — 1080 × 1350 بكسل: خلاصة إنستغرام وفيسبوك.
1:1 — 1080 × 1080 بكسل: الكاروسيل والخلاصة.
16:9 — 1920 × 1080 بكسل: يوتيوب.

المناطق المخفية في 9:16 (تقريبية، الواجهة تختلف من تطبيق لآخر):
- في الأعلى: حوالي 250 بكسل (اسم الحساب، زر الإغلاق)؛
- في الأسفل: حوالي 350 بكسل (النص، زر الإجراء)؛
- على اليمين: حوالي 150 بكسل (الإعجاب، التعليقات، المشاركة).
اترك المنتج والنص والوجه في الوسط.

الطريقة: صوّر بصيغة 9:16 مع هامش في الأعلى والأسفل، ثم انسخ المشروع وأعد التأطير إلى 4:5 و1:1.`,
      },
    ),
  ],
  'm1-l4': [
    R(
      {
        title: 'Prompt — une créative par étape du client',
        text: `Agis comme un stratège en publicité sur les réseaux sociaux. Produit : [produit]. Cible : [cible]. Prix : [prix]. Ce que je peux prouver : [faits vrais].
Propose une idée de créative pour chacune des 4 étapes : notoriété, considération, conversion, fidélisation. Pour chaque idée : l’objectif en une phrase, le format (vidéo, image, carrousel), le hook, ce qu’on montre, l’action demandée. Une idée = un seul objectif. Ne promets rien que je ne peux pas prouver.`,
      },
      {
        title: 'Prompt — one creative per customer stage',
        text: `Act as a social media advertising strategist. Product: [product]. Audience: [audience]. Price: [price]. What I can prove: [true facts].
Suggest one creative idea for each of the 4 stages: awareness, consideration, conversion, loyalty. For each idea: the goal in one sentence, the format (video, image, carousel), the hook, what we show, the action requested. One idea = one goal. Promise nothing I cannot prove.`,
      },
      {
        title: 'برومبت — إعلان لكل مرحلة من رحلة الزبون',
        text: `تصرّف كاستراتيجي إعلانات على مواقع التواصل. المنتج: [المنتج]. الجمهور: [الجمهور]. السعر: [السعر]. ما أستطيع إثباته: [حقائق صحيحة].
اقترح فكرة إعلان لكل مرحلة من المراحل الأربع: التعريف، الاهتمام، الشراء، الوفاء. لكل فكرة: الهدف في جملة، الصيغة (فيديو، صورة، كاروسيل)، الهوك، ما نُظهره، الإجراء المطلوب. فكرة واحدة = هدف واحد. لا تَعِد بشيء لا أستطيع إثباته.`,
      },
    ),
  ],
  'm2-l1': [
    R(
      {
        title: 'Prompt — mon script Hook · Body · CTA',
        text: `Agis comme un copywriter de publicités vidéo courtes. Produit : [produit]. Cible : [cible]. Problème qu’il règle : [problème]. Points forts vrais : [3 points]. Offre et livraison : [offre].
Écris le script d’une pub de 20 à 25 secondes en 3 parties :
1. HOOK (0–3 s) : ce qu’on voit, ce qu’on entend, le texte à l’écran.
2. BODY (3–20 s) : ce que c’est, comment on l’utilise, ses points forts, le problème réglé — un plan par phrase.
3. CTA (3 à 5 dernières secondes) : une seule action claire.
Phrases courtes, à dire à voix haute, en [langue : darija en lettres latines / français].`,
      },
      {
        title: 'Prompt — my Hook · Body · CTA script',
        text: `Act as a short video ad copywriter. Product: [product]. Audience: [audience]. Problem it solves: [problem]. True strengths: [3 points]. Offer and delivery: [offer].
Write the script for a 20 to 25 second ad in 3 parts:
1. HOOK (0–3 s): what we see, what we hear, the on-screen text.
2. BODY (3–20 s): what it is, how to use it, its strengths, the problem solved — one shot per sentence.
3. CTA (last 3 to 5 seconds): one clear action.
Short sentences, to be read aloud, in [language].`,
      },
      {
        title: 'برومبت — سكريبت هوك · بودي · CTA',
        text: `تصرّف ككاتب إعلانات فيديو قصيرة. المنتج: [المنتج]. الجمهور: [الجمهور]. المشكلة التي يحلّها: [المشكلة]. نقاط قوة حقيقية: [3 نقاط]. العرض والتوصيل: [العرض].
اكتب سكريبت إعلان مدته 20 إلى 25 ثانية في 3 أجزاء:
1. الهوك (0–3 ثوانٍ): ما نراه، ما نسمعه، النص على الشاشة.
2. البودي (3–20 ثانية): ما هو المنتج، كيف يُستعمل، نقاط قوته، المشكلة التي يحلّها — لقطة لكل جملة.
3. CTA (آخر 3 إلى 5 ثوانٍ): إجراء واحد واضح.
جمل قصيرة تُقال بصوت عالٍ، بـ[اللغة: الدارجة / العربية / الفرنسية].`,
      },
    ),
  ],
  'm2-l2': [
    R(
      {
        title: 'Grille — les pubs qui m’ont arrêté',
        text: `Pub 1 : [marque / produit]
Ce qui m’a arrêté (image, son, texte) : [  ]
Sans le son, le hook se comprend-il ? oui / non
Le produit apparaît à : [  ] s

Pub 2 : [marque / produit]
Ce qui m’a arrêté : [  ]
Sans le son : oui / non — Produit à : [  ] s

Pub 3 : [marque / produit]
Ce qui m’a arrêté : [  ]
Sans le son : oui / non — Produit à : [  ] s

Ce qui revient dans les 3 : [  ]
Mes 3 hooks (3 secondes chacun) :
1. [  ]
2. [  ]
3. [  ]`,
      },
      {
        title: 'Grid — the ads that stopped me',
        text: `Ad 1: [brand / product]
What stopped me (image, sound, text): [  ]
Without sound, is the hook clear? yes / no
The product appears at: [  ] s

Ad 2: [brand / product]
What stopped me: [  ]
Without sound: yes / no — Product at: [  ] s

Ad 3: [brand / product]
What stopped me: [  ]
Without sound: yes / no — Product at: [  ] s

What the 3 have in common: [  ]
My 3 hooks (3 seconds each):
1. [  ]
2. [  ]
3. [  ]`,
      },
      {
        title: 'جدول — الإعلانات التي أوقفتني',
        text: `الإعلان 1: [العلامة / المنتج]
ما الذي أوقفني (صورة، صوت، نص): [  ]
بدون صوت، هل يُفهم الهوك؟ نعم / لا
يظهر المنتج عند: [  ] ثانية

الإعلان 2: [العلامة / المنتج]
ما الذي أوقفني: [  ]
بدون صوت: نعم / لا — المنتج عند: [  ] ثانية

الإعلان 3: [العلامة / المنتج]
ما الذي أوقفني: [  ]
بدون صوت: نعم / لا — المنتج عند: [  ] ثانية

ما يتكرّر في الثلاثة: [  ]
هوكاتي الثلاثة (3 ثوانٍ لكل واحد):
1. [  ]
2. [  ]
3. [  ]`,
      },
    ),
  ],
  'm2-l4': [
    R(
      {
        title: 'Prompt — trouver un chiffre vrai (sans l’inventer)',
        text: `Le problème de mon client : [problème], dans [pays].
1. Indique-moi quels types de sources fiables publient des chiffres sur ce problème (organismes publics, études universitaires, associations professionnelles) et quels mots-clés taper pour les trouver.
2. N’invente aucun chiffre. Si tu en cites un, donne la source exacte et l’année, et précise que je dois la vérifier moi-même.
3. Avec le chiffre que j’aurai vérifié — [chiffre + source] — écris 3 hooks statistiques de moins de 10 mots, sur le modèle « 1 femme sur 2… ».`,
      },
      {
        title: 'Prompt — find a true number (without inventing it)',
        text: `My customer’s problem: [problem], in [country].
1. Tell me which kinds of reliable sources publish figures on this problem (public bodies, university studies, professional associations) and which keywords to search to find them.
2. Do not invent any figure. If you quote one, give the exact source and year, and say that I must check it myself.
3. With the figure I will have checked — [figure + source] — write 3 statistical hooks of under 10 words, on the model “1 woman in 2…”.`,
      },
      {
        title: 'برومبت — إيجاد رقم صحيح (دون اختراعه)',
        text: `مشكلة زبوني: [المشكلة]، في [البلد].
1. أخبرني بأنواع المصادر الموثوقة التي تنشر أرقامًا عن هذه المشكلة (هيئات عمومية، دراسات جامعية، جمعيات مهنية) وبالكلمات المفتاحية التي أبحث بها.
2. لا تخترع أي رقم. إن ذكرت رقمًا، أعطِ المصدر الدقيق والسنة، ووضّح أن عليّ التحقق منه بنفسي.
3. بالرقم الذي سأتحقق منه — [الرقم + المصدر] — اكتب 3 هوكات إحصائية بأقل من 10 كلمات، على نموذج «امرأة من كل اثنتين…».`,
      },
    ),
  ],
  'm2-l5': [
    R(
      {
        title: 'Prompt — le body en 3 sections',
        text: `Agis comme un vendeur honnête qui présente un produit en vidéo. Produit : [produit]. Cible : [cible]. Problème du client : [problème]. Caractéristiques vraies : [liste].
Écris le body d’une pub (10 à 15 secondes) en 3 sections :
1. DÉFINITION : ce que c’est et pour qui, en une phrase.
2. UTILISATION : comment on s’en sert, en 3 gestes simples à filmer.
3. POINTS FORTS : 3 caractéristiques, chacune transformée en bénéfice pour le client (« … donc tu … »).
Termine par une phrase qui relie le produit au problème du client. À côté de chaque phrase, indique le plan à filmer.`,
      },
      {
        title: 'Prompt — the body in 3 sections',
        text: `Act as an honest salesperson presenting a product on video. Product: [product]. Audience: [audience]. Customer’s problem: [problem]. True features: [list].
Write the body of an ad (10 to 15 seconds) in 3 sections:
1. DEFINITION: what it is and who it is for, in one sentence.
2. USE: how to use it, in 3 simple gestures to film.
3. STRENGTHS: 3 features, each turned into a benefit for the customer (“… so you …”).
End with a sentence linking the product to the customer’s problem. Next to each sentence, give the shot to film.`,
      },
      {
        title: 'برومبت — البودي في 3 أقسام',
        text: `تصرّف كبائع صادق يقدّم منتجًا في فيديو. المنتج: [المنتج]. الجمهور: [الجمهور]. مشكلة الزبون: [المشكلة]. خصائص حقيقية: [القائمة].
اكتب بودي إعلان (10 إلى 15 ثانية) في 3 أقسام:
1. التعريف: ما هو ولمن، في جملة واحدة.
2. الاستعمال: كيف يُستعمل، في 3 حركات بسيطة تُصوَّر.
3. نقاط القوة: 3 خصائص، تتحوّل كل واحدة إلى فائدة للزبون («… إذن أنت …»).
اختم بجملة تربط المنتج بمشكلة الزبون. بجانب كل جملة، اذكر اللقطة التي تُصوَّر.`,
      },
    ),
  ],
  'm2-l6': [
    R(
      {
        title: 'Banque de CTA clairs',
        text: `Un CTA = un verbe d’action + ce qu’on obtient + une réassurance vraie.

Commander
- « Commande maintenant, tu paies à la livraison. »
- « Clique sur Commander et choisis ta couleur. »
Écrire
- « Écris-nous sur WhatsApp, on te répond aujourd’hui. »
- « Envoie "INFO" en message pour le prix et la livraison. »
Réserver / venir
- « Réserve ta place avec le bouton en bas. »
- « Passe à la boutique, [adresse], ouvert jusqu’à [heure]. »
En darija (exemples)
- « Commandi daba, tkhalles ki tewsellek. »
- « Ekteb-lna f WhatsApp, nraddou 3lik lyoum. »

À éviter : « Plus d’infos », « N’hésitez pas », deux actions à la fois, une offre ou un délai qui n’existe pas.`,
      },
      {
        title: 'Bank of clear CTAs',
        text: `A CTA = an action verb + what you get + a true reassurance.

Order
- “Order now, pay on delivery.”
- “Tap Order and choose your colour.”
Write
- “Message us on WhatsApp, we reply today.”
- “Send ‘INFO’ by message for the price and delivery.”
Book / visit
- “Book your spot with the button below.”
- “Come to the shop, [address], open until [time].”

Avoid: “More info”, “Don’t hesitate”, two actions at once, an offer or deadline that does not exist.`,
      },
      {
        title: 'بنك عبارات CTA واضحة',
        text: `CTA = فعل إجراء + ما يحصل عليه الزبون + طمأنة صحيحة.

الطلب
- «اطلب الآن، وادفع عند الاستلام.»
- «اضغط على اطلب واختر لونك.»
المراسلة
- «راسلنا على واتساب، نردّ عليك اليوم.»
- «أرسل كلمة "معلومات" لتعرف السعر والتوصيل.»
الحجز / الزيارة
- «احجز مكانك بالزر في الأسفل.»
- «زرنا في المتجر، [العنوان]، مفتوح حتى [الساعة].»

تجنّب: «للمزيد من المعلومات»، «لا تتردد»، إجراءين في آن واحد، عرضًا أو أجلًا غير موجود.`,
      },
    ),
  ],
  'm3-l1': [
    R(
      {
        title: 'Les 4 formules en une page',
        text: `AIDA — Attention, Intérêt, Désir, Action
Sert à : structurer toute une vidéo ou un carrousel (une slide par étape).

PAS — Problème, Agitation, Solution
Sert à : construire le body quand le produit règle une douleur connue. L’agitation reste honnête.

CAP — Caractéristique, Avantage, Preuve
Sert à : convaincre les sceptiques avec des faits démontrés.

SONCAS — Sécurité, Orgueil, Nouveauté, Confort, Argent, Sympathie
Sert à : trouver pourquoi le client achète vraiment, et donc l’angle de la pub.

Ce que je prépare pour mon produit :
- Le problème principal de mon client (PAS) : [  ]
- 3 faits que je peux prouver (CAP) : [  ]
- La vraie raison d’achat (SONCAS) : [  ]`,
      },
      {
        title: 'The 4 formulas on one page',
        text: `AIDA — Attention, Interest, Desire, Action
Use it to: structure a whole video or a carousel (one slide per step).

PAS — Problem, Agitation, Solution
Use it to: build the body when the product solves a known pain. The agitation stays honest.

CAP — Characteristic, Advantage, Proof
Use it to: convince sceptics with demonstrated facts.

SONCAS — Security, Pride, Novelty, Comfort, Money, Sympathy
Use it to: find why the customer really buys, and so the angle of the ad.

What I prepare for my product:
- My customer’s main problem (PAS): [  ]
- 3 facts I can prove (CAP): [  ]
- The real reason to buy (SONCAS): [  ]`,
      },
      {
        title: 'الصيغ الأربع في صفحة واحدة',
        text: `AIDA — الانتباه، الاهتمام، الرغبة، الفعل
تفيد في: هيكلة فيديو كامل أو كاروسيل (شريحة لكل مرحلة).

PAS — المشكلة، الإثارة، الحل
تفيد في: بناء البودي حين يحلّ المنتج ألمًا معروفًا. الإثارة تبقى صادقة.

CAP — الخاصية، الميزة، الدليل
تفيد في: إقناع المتشكّكين بحقائق مُثبتة.

SONCAS — الأمان، الاعتزاز، الجديد، الراحة، المال، التعاطف
تفيد في: معرفة لماذا يشتري الزبون فعلًا، وبالتالي زاوية الإعلان.

ما أحضّره لمنتجي:
- المشكلة الرئيسية لزبوني (PAS): [  ]
- 3 حقائق أستطيع إثباتها (CAP): [  ]
- السبب الحقيقي للشراء (SONCAS): [  ]`,
      },
    ),
  ],
  'm3-l2': [
    R(
      {
        title: 'Prompt — script AIDA avec les plans',
        text: `Agis comme un copywriter publicitaire. Produit : [produit]. Cible : [cible]. Problème : [problème]. Preuves vraies : [faits]. Offre : [offre].
Écris une pub de 20 à 30 secondes selon AIDA. Pour chaque étape (Attention, Intérêt, Désir, Action) : la phrase à dire, le texte à l’écran et le plan à filmer.
Puis adapte le même message en carrousel de 4 slides, une slide par étape, avec un titre de moins de 8 mots par slide.
L’Action finale demande une seule chose, clairement.`,
      },
      {
        title: 'Prompt — AIDA script with shots',
        text: `Act as an ad copywriter. Product: [product]. Audience: [audience]. Problem: [problem]. True proof: [facts]. Offer: [offer].
Write a 20 to 30 second ad following AIDA. For each step (Attention, Interest, Desire, Action): the line to say, the on-screen text and the shot to film.
Then adapt the same message into a 4-slide carousel, one slide per step, with a title of under 8 words per slide.
The final Action asks for one thing, clearly.`,
      },
      {
        title: 'برومبت — سكريبت AIDA مع اللقطات',
        text: `تصرّف ككاتب إعلانات. المنتج: [المنتج]. الجمهور: [الجمهور]. المشكلة: [المشكلة]. أدلة حقيقية: [حقائق]. العرض: [العرض].
اكتب إعلانًا من 20 إلى 30 ثانية حسب AIDA. لكل مرحلة (الانتباه، الاهتمام، الرغبة، الفعل): الجملة التي تُقال، النص على الشاشة، واللقطة التي تُصوَّر.
ثم حوّل الرسالة نفسها إلى كاروسيل من 4 شرائح، شريحة لكل مرحلة، بعنوان أقل من 8 كلمات لكل شريحة.
الفعل الأخير يطلب شيئًا واحدًا بوضوح.`,
      },
    ),
  ],
  'm3-l3': [
    R(
      {
        title: 'Prompt — script PAS honnête',
        text: `Agis comme un copywriter qui respecte ses clients. Produit : [produit]. Cible : [cible]. Le problème avec les mots du client : [phrase du client]. Ce que le produit règle vraiment : [fait vrai].
Écris un script PAS de 15 à 20 secondes :
- PROBLÈME : nomme la douleur en une phrase, avec les mots du client.
- AGITATION : une situation concrète du quotidien où ce problème gêne. Pas d’exagération, pas de peur, pas de promesse médicale.
- SOLUTION : comment le produit règle ce problème, avec le fait vrai, puis un CTA.
Ensuite, relis ton agitation et signale toute phrase qui exagère.`,
      },
      {
        title: 'Prompt — honest PAS script',
        text: `Act as a copywriter who respects their customers. Product: [product]. Audience: [audience]. The problem in the customer’s words: [customer’s sentence]. What the product really solves: [true fact].
Write a 15 to 20 second PAS script:
- PROBLEM: name the pain in one sentence, in the customer’s words.
- AGITATION: a concrete everyday situation where this problem gets in the way. No exaggeration, no fear, no medical promise.
- SOLUTION: how the product solves this problem, with the true fact, then a CTA.
Then reread your agitation and flag any sentence that exaggerates.`,
      },
      {
        title: 'برومبت — سكريبت PAS صادق',
        text: `تصرّف ككاتب إعلانات يحترم زبائنه. المنتج: [المنتج]. الجمهور: [الجمهور]. المشكلة بكلمات الزبون: [جملة الزبون]. ما يحلّه المنتج فعلًا: [حقيقة].
اكتب سكريبت PAS من 15 إلى 20 ثانية:
- المشكلة: سمِّ الألم في جملة بكلمات الزبون.
- الإثارة: موقف يومي ملموس تزعج فيه هذه المشكلة. بلا مبالغة ولا تخويف ولا وعد طبي.
- الحل: كيف يحلّ المنتج هذه المشكلة بالحقيقة المذكورة، ثم CTA.
بعد ذلك، أعد قراءة الإثارة ونبّه إلى كل جملة فيها مبالغة.`,
      },
    ),
  ],
  'm3-l4': [
    R(
      {
        title: 'Tableau CAP à remplir',
        text: `Caractéristique (un fait) → Avantage (à quoi ça sert pour le client) → Preuve (comment je le montre)

1. [ex. : acier inoxydable] → [ne rouille pas au lavage] → [je le lave devant la caméra]
2. [  ] → [  ] → [  ]
3. [  ] → [  ] → [  ]
4. [  ] → [  ] → [  ]

Types de preuves : démonstration en un plan, avant / après honnête (même lumière, même cadre), avis réel d’un client (avec son accord), document (garantie, fiche technique).
Règle : pas de preuve = on barre l’avantage.`,
      },
      {
        title: 'CAP table to fill in',
        text: `Characteristic (a fact) → Advantage (what it does for the customer) → Proof (how I show it)

1. [e.g. stainless steel] → [does not rust when washed] → [I wash it on camera]
2. [  ] → [  ] → [  ]
3. [  ] → [  ] → [  ]
4. [  ] → [  ] → [  ]

Types of proof: a one-shot demonstration, an honest before / after (same light, same framing), a real customer review (with their consent), a document (warranty, spec sheet).
Rule: no proof = cross out the advantage.`,
      },
      {
        title: 'جدول CAP للملء',
        text: `الخاصية (حقيقة) ← الميزة (ماذا تفيد الزبون) ← الدليل (كيف أُظهرها)

1. [مثال: فولاذ مقاوم للصدأ] ← [لا يصدأ عند الغسل] ← [أغسله أمام الكاميرا]
2. [  ] ← [  ] ← [  ]
3. [  ] ← [  ] ← [  ]
4. [  ] ← [  ] ← [  ]

أنواع الأدلة: عرض في لقطة واحدة، قبل / بعد صادق (نفس الإضاءة، نفس الإطار)، رأي حقيقي لزبون (بموافقته)، وثيقة (ضمان، بطاقة تقنية).
القاعدة: لا دليل = نشطب الميزة.`,
      },
    ),
  ],
  'm3-l5': [
    R(
      {
        title: 'Prompt — 6 angles SONCAS',
        text: `Agis comme un stratège publicitaire. Produit : [produit]. Cible : [cible]. Faits vrais sur le produit : [liste].
Pour chacun des 6 boutons SONCAS (Sécurité, Orgueil, Nouveauté, Confort, Argent, Sympathie), écris :
- l’angle en une phrase ;
- un hook de moins de 10 mots ;
- le plan d’ouverture à filmer.
Utilise uniquement les faits donnés. Puis classe les 6 angles du plus pertinent au moins pertinent pour cette cible, et explique le premier choix en 2 phrases.`,
      },
      {
        title: 'Prompt — 6 SONCAS angles',
        text: `Act as an advertising strategist. Product: [product]. Audience: [audience]. True facts about the product: [list].
For each of the 6 SONCAS buttons (Security, Pride, Novelty, Comfort, Money, Sympathy), write:
- the angle in one sentence;
- a hook of under 10 words;
- the opening shot to film.
Use only the facts given. Then rank the 6 angles from most to least relevant for this audience, and explain the top choice in 2 sentences.`,
      },
      {
        title: 'برومبت — 6 زوايا SONCAS',
        text: `تصرّف كاستراتيجي إعلانات. المنتج: [المنتج]. الجمهور: [الجمهور]. حقائق صحيحة عن المنتج: [القائمة].
لكل زر من أزرار SONCAS الستة (الأمان، الاعتزاز، الجديد، الراحة، المال، التعاطف)، اكتب:
- الزاوية في جملة؛
- هوك بأقل من 10 كلمات؛
- لقطة الافتتاح التي تُصوَّر.
استعمل الحقائق المذكورة فقط. ثم رتّب الزوايا الست من الأنسب إلى الأقل مناسبة لهذا الجمهور، واشرح الاختيار الأول في جملتين.`,
      },
    ),
  ],
  'm3-l6': [
    R(
      {
        title: 'Prompt — combiner les 4 formules',
        text: `Agis comme un copywriter publicitaire. Produit : [produit]. Cible : [cible]. Bouton SONCAS choisi : [bouton]. Problème du client : [problème]. Preuve la plus forte : [caractéristique → avantage → preuve].
Écris une pub de 25 à 30 secondes :
- structure générale en AIDA ;
- angle donné par le bouton SONCAS choisi ;
- body construit en PAS ;
- une preuve CAP dans le body, montrée à l’image.
Indique entre crochets quelle formule agit à chaque phrase. Puis réécris la version finale sans les crochets, comme si tu parlais à une seule personne.`,
      },
      {
        title: 'Prompt — combine the 4 formulas',
        text: `Act as an ad copywriter. Product: [product]. Audience: [audience]. Chosen SONCAS button: [button]. Customer’s problem: [problem]. Strongest proof: [characteristic → advantage → proof].
Write a 25 to 30 second ad:
- overall structure in AIDA;
- angle set by the chosen SONCAS button;
- body built with PAS;
- one CAP proof in the body, shown on screen.
Mark in brackets which formula is at work in each sentence. Then rewrite the final version without brackets, as if speaking to one person.`,
      },
      {
        title: 'برومبت — الجمع بين الصيغ الأربع',
        text: `تصرّف ككاتب إعلانات. المنتج: [المنتج]. الجمهور: [الجمهور]. زر SONCAS المختار: [الزر]. مشكلة الزبون: [المشكلة]. أقوى دليل: [خاصية ← ميزة ← دليل].
اكتب إعلانًا من 25 إلى 30 ثانية:
- الهيكل العام حسب AIDA؛
- الزاوية يحدّدها زر SONCAS المختار؛
- البودي مبني على PAS؛
- دليل CAP واحد في البودي يظهر في الصورة.
اكتب بين معقوفين أي صيغة تعمل في كل جملة. ثم أعد كتابة النسخة النهائية بلا معقوفين، كأنك تكلّم شخصًا واحدًا.`,
      },
    ),
  ],
  'm4-l1': [
    R(
      {
        title: 'Prompt — mes points à dire, sans script vendeur',
        text: `Je veux filmer une vidéo UGC au téléphone sur [produit], pour [cible]. Ce que j’en pense vraiment : [mon avis, avec mes mots]. Ce que j’ai constaté en l’utilisant : [faits vécus].
Ne m’écris pas de script. Donne-moi :
- 3 points à dire, chacun en quelques mots (je parlerai avec mes propres phrases) ;
- une première phrase naturelle, comme si je parlais à un ami ;
- 3 gestes à faire avec le produit pendant que je parle ;
- 3 phrases « pub » à éviter parce qu’elles sonnent faux.`,
      },
      {
        title: 'Prompt — my talking points, no sales script',
        text: `I want to film a UGC video on my phone about [product], for [audience]. What I really think of it: [my opinion, in my words]. What I noticed while using it: [real experience].
Do not write me a script. Give me:
- 3 points to say, each in a few words (I will talk in my own sentences);
- a natural first sentence, as if talking to a friend;
- 3 gestures to make with the product while I talk;
- 3 “advert” phrases to avoid because they sound fake.`,
      },
      {
        title: 'برومبت — نقاطي للكلام، بلا سكريبت بيع',
        text: `أريد تصوير فيديو UGC بالهاتف عن [المنتج] لـ[الجمهور]. رأيي الحقيقي فيه: [رأيي بكلماتي]. ما لاحظته عند استعماله: [تجربة حقيقية].
لا تكتب لي سكريبت. أعطني:
- 3 نقاط أقولها، كل واحدة في بضع كلمات (سأتكلم بجملي الخاصة)؛
- جملة أولى طبيعية كأني أكلّم صديقًا؛
- 3 حركات أقوم بها بالمنتج وأنا أتكلم؛
- 3 عبارات «إعلانية» أتجنّبها لأنها تبدو مزيّفة.`,
      },
    ),
  ],
  'm4-l2': [
    R(
      {
        title: 'Fiche — le test classique ou UGC',
        text: `Version A (posée, type studio) : [nom du fichier]
Version B (naturelle, en main) : [nom du fichier]

Montre les deux à 3 proches, sans rien expliquer, puis demande :
1. « Laquelle tu crois le plus ? »
2. « Pourquoi ? Qu’est-ce qui t’a fait douter dans l’autre ? »
3. « Après celle-là, tu aurais envie de demander le prix ? »

Personne 1 : A / B — raison : [  ]
Personne 2 : A / B — raison : [  ]
Personne 3 : A / B — raison : [  ]

Ce que je garde pour ma prochaine vidéo : [  ]`,
      },
      {
        title: 'Sheet — the classic vs UGC test',
        text: `Version A (polished, studio style): [file name]
Version B (natural, in hand): [file name]

Show both to 3 people close to you, without explaining, then ask:
1. “Which one do you believe more?”
2. “Why? What made you doubt the other one?”
3. “After that one, would you want to ask the price?”

Person 1: A / B — reason: [  ]
Person 2: A / B — reason: [  ]
Person 3: A / B — reason: [  ]

What I keep for my next video: [  ]`,
      },
      {
        title: 'بطاقة — اختبار الإعلان الكلاسيكي أو UGC',
        text: `النسخة أ (مُتقنة، بأسلوب الاستوديو): [اسم الملف]
النسخة ب (طبيعية، في اليد): [اسم الملف]

اعرضهما على 3 من المقرّبين دون شرح، ثم اسأل:
1. «أيّهما تصدّق أكثر؟»
2. «لماذا؟ ما الذي جعلك تشكّ في الأخرى؟»
3. «بعد هذه، هل تريد أن تسأل عن السعر؟»

الشخص 1: أ / ب — السبب: [  ]
الشخص 2: أ / ب — السبب: [  ]
الشخص 3: أ / ب — السبب: [  ]

ما أحتفظ به لفيديوهي القادم: [  ]`,
      },
    ),
  ],
  'm4-l3': [
    R(
      {
        title: 'Prompt — portrait de mon client et ses vrais mots',
        text: `Aide-moi à décrire mon client type pour une vidéo UGC. Produit : [produit]. Ce que je sais de mes acheteurs : [âge, ville, situation, questions qu’ils posent, messages reçus].
1. Résume mon client type en 3 lignes : qui il est, son problème, sa façon de parler.
2. Liste 5 questions qu’il se pose avant d’acheter.
3. Propose le profil de la personne idéale pour filmer l’UGC (quelqu’un qui utilise vraiment le produit).
Base-toi uniquement sur ce que je t’ai donné ; si une information manque, dis-moi quoi demander à mes clients au lieu de l’inventer.`,
      },
      {
        title: 'Prompt — my customer portrait and their real words',
        text: `Help me describe my typical customer for a UGC video. Product: [product]. What I know about my buyers: [age, city, situation, questions they ask, messages received].
1. Sum up my typical customer in 3 lines: who they are, their problem, the way they talk.
2. List 5 questions they ask themselves before buying.
3. Suggest the profile of the ideal person to film the UGC (someone who really uses the product).
Base everything only on what I gave you; if information is missing, tell me what to ask my customers instead of inventing it.`,
      },
      {
        title: 'برومبت — صورة زبوني وكلماته الحقيقية',
        text: `ساعدني على وصف زبوني النموذجي لفيديو UGC. المنتج: [المنتج]. ما أعرفه عن المشترين: [العمر، المدينة، الوضعية، الأسئلة التي يطرحونها، الرسائل التي تصلني].
1. لخّص زبوني النموذجي في 3 أسطر: من هو، مشكلته، طريقة كلامه.
2. اذكر 5 أسئلة يطرحها على نفسه قبل الشراء.
3. اقترح ملامح الشخص المثالي لتصوير الـUGC (شخص يستعمل المنتج فعلًا).
اعتمد فقط على ما أعطيتك؛ إن نقصت معلومة، قل لي ماذا أسأل زبائني بدل اختراعها.`,
      },
    ),
  ],
  'm6-l1': [
    R(
      {
        title: 'Prompt — des idées de Brand Content',
        text: `Agis comme un directeur de création. Ma marque vend [produit] à [cible]. Ce que je veux que les gens ressentent : [3 mots]. Le style de vie de mon client idéal : [une phrase].
Propose 10 idées de publications qui montrent ce style de vie sans dire « achète » : coulisses, rituels du quotidien, moments où le produit a sa place, valeurs de la marque. Pour chacune : le format (photo, reel, carrousel), ce qu’on voit, la légende en une phrase. Évite les clichés et les promesses.`,
      },
      {
        title: 'Prompt — Brand Content ideas',
        text: `Act as a creative director. My brand sells [product] to [audience]. What I want people to feel: [3 words]. My ideal customer’s lifestyle: [one sentence].
Suggest 10 post ideas that show this lifestyle without saying “buy”: behind the scenes, everyday rituals, moments where the product belongs, brand values. For each: the format (photo, reel, carousel), what we see, the caption in one sentence. Avoid clichés and promises.`,
      },
      {
        title: 'برومبت — أفكار محتوى العلامة',
        text: `تصرّف كمدير كرياتيف. علامتي تبيع [المنتج] لـ[الجمهور]. ما أريد أن يشعر به الناس: [3 كلمات]. نمط حياة زبوني المثالي: [جملة].
اقترح 10 أفكار منشورات تُظهر نمط الحياة هذا دون قول «اشترِ»: كواليس، طقوس يومية، لحظات يجد فيها المنتج مكانه، قيم العلامة. لكل فكرة: الصيغة (صورة، ريل، كاروسيل)، ما نراه، التعليق في جملة. تجنّب الكليشيهات والوعود.`,
      },
    ),
  ],
  'm6-l2': [
    R(
      {
        title: 'Planning d’une semaine : vendre et bâtir',
        text: `Ma priorité du moment : vendre vite / fidéliser et monter en gamme

Lundi — [créative / Brand Content] : [idée]
Mardi — [créative / Brand Content] : [idée]
Mercredi — [créative / Brand Content] : [idée]
Jeudi — [créative / Brand Content] : [idée]
Vendredi — [créative / Brand Content] : [idée]
Samedi — [créative / Brand Content] : [idée]
Dimanche — [créative / Brand Content] : [idée]

Repère : priorité « vendre » ≈ 4 créatives + 3 Brand Content ; priorité « bâtir » ≈ 3 créatives + 4 Brand Content.
Ma phrase de créative : [problème réglé → action]
Ma phrase de Brand Content : [ma vision → le mouvement que le client rejoint]`,
      },
      {
        title: 'One-week plan: sell and build',
        text: `My current priority: sell fast / build loyalty and move upmarket

Monday — [creative / Brand Content]: [idea]
Tuesday — [creative / Brand Content]: [idea]
Wednesday — [creative / Brand Content]: [idea]
Thursday — [creative / Brand Content]: [idea]
Friday — [creative / Brand Content]: [idea]
Saturday — [creative / Brand Content]: [idea]
Sunday — [creative / Brand Content]: [idea]

Guide: “sell” priority ≈ 4 creatives + 3 Brand Content; “build” priority ≈ 3 creatives + 4 Brand Content.
My creative sentence: [problem solved → action]
My Brand Content sentence: [my vision → the movement the customer joins]`,
      },
      {
        title: 'تخطيط أسبوع: البيع والبناء',
        text: `أولويتي الحالية: البيع بسرعة / الوفاء والارتقاء بالعلامة

الإثنين — [إعلان / محتوى علامة]: [الفكرة]
الثلاثاء — [إعلان / محتوى علامة]: [الفكرة]
الأربعاء — [إعلان / محتوى علامة]: [الفكرة]
الخميس — [إعلان / محتوى علامة]: [الفكرة]
الجمعة — [إعلان / محتوى علامة]: [الفكرة]
السبت — [إعلان / محتوى علامة]: [الفكرة]
الأحد — [إعلان / محتوى علامة]: [الفكرة]

مرجع: أولوية «البيع» ≈ 4 إعلانات + 3 محتوى علامة؛ أولوية «البناء» ≈ 3 إعلانات + 4 محتوى علامة.
جملة الإعلان: [المشكلة المحلولة ← الإجراء]
جملة محتوى العلامة: [رؤيتي ← الحركة التي ينضمّ إليها الزبون]`,
      },
    ),
  ],
  'm6-l3': [
    R(
      {
        title: 'Ma charte de marque express',
        text: `Couleur principale : [nom + code, ex. #1E3A5F]
Couleur secondaire : [nom + code]
Police des titres : [  ] — Police du texte : [  ]
Style photo : [lumière naturelle / fond uni / décor de vie…]

Mon « pourquoi » en 3 phrases :
1. Ma mission : [  ]
2. Mes coulisses : [  ]
3. Ce qui rend mon produit soigné : [  ]

La personne que mon client rêve de devenir : [  ]

Check prestige avant de publier : image nette ☐ — mes 2 couleurs ☐ — ma police ☐ — une histoire ☐ — le client peut se projeter ☐`,
      },
      {
        title: 'My express brand guide',
        text: `Main colour: [name + code, e.g. #1E3A5F]
Secondary colour: [name + code]
Heading font: [  ] — Body font: [  ]
Photo style: [natural light / plain background / lifestyle setting…]

My “why” in 3 sentences:
1. My mission: [  ]
2. Behind the scenes: [  ]
3. What makes my product carefully made: [  ]

The person my customer dreams of becoming: [  ]

Prestige check before posting: sharp image ☐ — my 2 colours ☐ — my font ☐ — a story ☐ — the customer can picture themselves ☐`,
      },
      {
        title: 'دليل علامتي المختصر',
        text: `اللون الرئيسي: [الاسم + الرمز، مثلًا #1E3A5F]
اللون الثانوي: [الاسم + الرمز]
خط العناوين: [  ] — خط النص: [  ]
أسلوب الصور: [إضاءة طبيعية / خلفية موحّدة / ديكور من الحياة…]

«لماذا» علامتي في 3 جمل:
1. مهمّتي: [  ]
2. الكواليس: [  ]
3. ما يجعل منتجي متقنًا: [  ]

الشخص الذي يحلم زبوني أن يصبحه: [  ]

فحص الفخامة قبل النشر: صورة واضحة ☐ — لوناي ☐ — خطّي ☐ — قصة ☐ — الزبون يتخيّل نفسه ☐`,
      },
    ),
  ],
  'm6-l4': [
    R(
      {
        title: 'Plan de pub complet (à envoyer à l’équipe)',
        text: `Produit : [  ] — Cible : [  ] — Objectif : [vente / message WhatsApp / visite]

L’ÉTINCELLE — Hook (0–3 s)
Ce qu’on voit : [  ] — Ce qu’on entend : [  ] — Texte : [  ]

LE MOTEUR — Body
Formule : AIDA / PAS
Ce qui vend : [  ]
Moment UGC qui rassure : [  ]
Détail soigné qui valorise la marque : [  ]

LA DESTINATION — CTA
Action unique : [  ] — Réassurance vraie : [  ]

Durée visée : [  ] s — Format : 9:16
Retour de l’équipe : [  ]`,
      },
      {
        title: 'Full ad plan (to send to the team)',
        text: `Product: [  ] — Audience: [  ] — Goal: [sale / WhatsApp message / visit]

THE SPARK — Hook (0–3 s)
What we see: [  ] — What we hear: [  ] — Text: [  ]

THE ENGINE — Body
Formula: AIDA / PAS
What sells: [  ]
UGC moment that reassures: [  ]
Polished detail that elevates the brand: [  ]

THE DESTINATION — CTA
Single action: [  ] — True reassurance: [  ]

Target length: [  ] s — Format: 9:16
Team feedback: [  ]`,
      },
      {
        title: 'خطة إعلان كاملة (تُرسل إلى الفريق)',
        text: `المنتج: [  ] — الجمهور: [  ] — الهدف: [بيع / رسالة واتساب / زيارة]

الشرارة — الهوك (0–3 ثوانٍ)
ما نراه: [  ] — ما نسمعه: [  ] — النص: [  ]

المحرّك — البودي
الصيغة: AIDA / PAS
ما يبيع: [  ]
لحظة UGC تطمئن: [  ]
تفصيل متقن يرفع قيمة العلامة: [  ]

الوجهة — CTA
إجراء واحد: [  ] — طمأنة صحيحة: [  ]

المدة المستهدفة: [  ] ثانية — الصيغة: 9:16
ملاحظات الفريق: [  ]`,
      },
    ),
  ],
  'm5-l1': [
    R(
      {
        title: 'Check-list de montage CapCut',
        text: `Rushes à importer : ☐ hook ☐ démo ☐ détails ☐ CTA

1. Couper — ☐ temps morts supprimés, début et fin de chaque prise compris
2. Ordonner — ☐ du hook au CTA ☐ un changement à l’écran toutes les 2 à 3 s
3. Sous-titrer — ☐ sous-titres automatiques ☐ relus ligne par ligne
4. Musique — ☐ assez basse pour entendre la voix ☐ autorisée pour la publicité
5. CTA — ☐ écrit à l’écran ☐ dit en voix off

Avant d’exporter :
☐ le hook est là dès la première image
☐ le produit est visible vite
☐ rien d’important dans les zones cachées
☐ export 1080 × 1920, 30 i/s, MP4 — nom : [produit-v1]`,
      },
      {
        title: 'CapCut editing checklist',
        text: `Footage to import: ☐ hook ☐ demo ☐ details ☐ CTA

1. Cut — ☐ dead time removed, including the start and end of each take
2. Order — ☐ from hook to CTA ☐ a change on screen every 2 to 3 s
3. Caption — ☐ auto captions ☐ checked line by line
4. Music — ☐ low enough to hear the voice ☐ licensed for advertising
5. CTA — ☐ written on screen ☐ said in voice-over

Before exporting:
☐ the hook is there from the first frame
☐ the product is visible early
☐ nothing important in the hidden areas
☐ export 1080 × 1920, 30 fps, MP4 — name: [product-v1]`,
      },
      {
        title: 'قائمة مراجعة المونتاج في CapCut',
        text: `اللقطات التي أستوردها: ☐ الهوك ☐ العرض ☐ التفاصيل ☐ CTA

1. القص — ☐ حذف الأوقات الميتة، بما فيها بداية ونهاية كل لقطة
2. الترتيب — ☐ من الهوك إلى CTA ☐ تغيير على الشاشة كل 2 إلى 3 ثوانٍ
3. الترجمة — ☐ ترجمة تلقائية ☐ مراجعة سطرًا بسطر
4. الموسيقى — ☐ منخفضة بما يكفي لسماع الصوت ☐ مسموح بها في الإعلانات
5. CTA — ☐ مكتوب على الشاشة ☐ مقول بالتعليق الصوتي

قبل التصدير:
☐ الهوك موجود من أول صورة
☐ المنتج يظهر بسرعة
☐ لا شيء مهم في المناطق المخفية
☐ تصدير 1080 × 1920، 30 صورة/ث، MP4 — الاسم: [المنتج-v1]`,
      },
    ),
  ],
  'm5-l2': [
    R(
      {
        title: 'Prompt — titres et preuve pour mon image',
        text: `Je crée une image publicitaire dans Canva pour [produit], destinée à [cible]. Le bénéfice principal : [bénéfice]. Preuves vraies disponibles : [livraison, garantie, paiement à la livraison…].
Propose :
- 8 titres de 6 mots maximum, un seul message chacun ;
- 3 lignes de preuve courtes, uniquement avec les preuves données ;
- 3 textes de bouton (2 à 3 mots, verbe d’action).
Puis choisis la meilleure combinaison titre + preuve + bouton et dis pourquoi elle se comprend en une seconde.`,
      },
      {
        title: 'Prompt — headlines and proof for my image',
        text: `I am creating an ad image in Canva for [product], aimed at [audience]. The main benefit: [benefit]. True proof available: [delivery, warranty, cash on delivery…].
Suggest:
- 8 headlines of 6 words maximum, one message each;
- 3 short proof lines, using only the proof given;
- 3 button texts (2 to 3 words, action verb).
Then pick the best headline + proof + button combination and say why it is understood in one second.`,
      },
      {
        title: 'برومبت — عناوين ودليل لصورتي',
        text: `أصمّم صورة إعلانية في Canva لـ[المنتج]، موجّهة لـ[الجمهور]. الفائدة الرئيسية: [الفائدة]. أدلة حقيقية متوفرة: [التوصيل، الضمان، الدفع عند الاستلام…].
اقترح:
- 8 عناوين من 6 كلمات كحد أقصى، برسالة واحدة لكل عنوان؛
- 3 أسطر دليل قصيرة، بالأدلة المذكورة فقط؛
- 3 نصوص للزر (2 إلى 3 كلمات، فعل إجراء).
ثم اختر أفضل تركيبة عنوان + دليل + زر وقل لماذا تُفهم في ثانية واحدة.`,
      },
    ),
  ],
  'm5-l3': [
    R(
      {
        title: 'Prompt — carrousel en 5 slides',
        text: `Agis comme un créateur de carrousels publicitaires. Produit : [produit]. Cible : [cible]. Problème : [problème]. Preuve vraie : [preuve]. Action voulue : [action].
Écris le texte de 5 slides carrées : 1. hook qui donne envie de glisser, 2. problème, 3. solution, 4. preuve, 5. CTA.
Pour chaque slide : un titre de 8 mots maximum, une ligne de texte facultative, et l’image à mettre. Une seule idée par slide. La slide 1 ne révèle pas tout : elle crée l’envie de voir la suite.`,
      },
      {
        title: 'Prompt — 5-slide carousel',
        text: `Act as an ad carousel creator. Product: [product]. Audience: [audience]. Problem: [problem]. True proof: [proof]. Desired action: [action].
Write the text for 5 square slides: 1. a hook that makes people swipe, 2. problem, 3. solution, 4. proof, 5. CTA.
For each slide: a title of 8 words maximum, an optional line of text, and the image to use. One idea per slide. Slide 1 does not reveal everything: it makes people want to see the rest.`,
      },
      {
        title: 'برومبت — كاروسيل من 5 شرائح',
        text: `تصرّف كصانع كاروسيل إعلاني. المنتج: [المنتج]. الجمهور: [الجمهور]. المشكلة: [المشكلة]. دليل حقيقي: [الدليل]. الإجراء المطلوب: [الإجراء].
اكتب نص 5 شرائح مربعة: 1. هوك يدفع إلى التمرير، 2. المشكلة، 3. الحل، 4. الدليل، 5. CTA.
لكل شريحة: عنوان من 8 كلمات كحد أقصى، سطر نص اختياري، والصورة المناسبة. فكرة واحدة لكل شريحة. الشريحة الأولى لا تكشف كل شيء: تخلق الرغبة في رؤية البقية.`,
      },
    ),
  ],
  'm5-l4': [
    R(
      {
        title: 'Aide-mémoire — réglages d’export',
        text: `VIDÉO (CapCut)
Résolution : 1080 × 1920 (9:16) — 1080 × 1350 pour le 4:5
Images par seconde : 30 (60 si tu as filmé en 60 et que tu gardes des ralentis)
Format : MP4 (H.264)

IMAGES (Canva)
Story / Reel : 1080 × 1920 — Fil : 1080 × 1350 — Carré : 1080 × 1080
Format : PNG pour le texte et les aplats, JPG pour les photos

NOMMER SES FICHIERS
[produit]-[format]-v[numéro] — ex. : sac-cuir-9x16-v2

CHECK FINAL
☐ vue en entier sur téléphone ☐ revue sans le son ☐ orthographe relue ☐ aucun texte dans les zones cachées`,
      },
      {
        title: 'Cheat sheet — export settings',
        text: `VIDEO (CapCut)
Resolution: 1080 × 1920 (9:16) — 1080 × 1350 for 4:5
Frame rate: 30 fps (60 if you filmed at 60 and keep slow motion)
Format: MP4 (H.264)

IMAGES (Canva)
Story / Reel: 1080 × 1920 — Feed: 1080 × 1350 — Square: 1080 × 1080
Format: PNG for text and flat colours, JPG for photos

NAMING FILES
[product]-[format]-v[number] — e.g. leather-bag-9x16-v2

FINAL CHECK
☐ watched in full on a phone ☐ watched without sound ☐ spelling checked ☐ no text in the hidden areas`,
      },
      {
        title: 'مذكّرة — إعدادات التصدير',
        text: `الفيديو (CapCut)
الدقة: 1080 × 1920 (9:16) — 1080 × 1350 لصيغة 4:5
عدد الصور في الثانية: 30 (أو 60 إن صوّرت بـ60 واحتفظت بالحركة البطيئة)
الصيغة: MP4 (H.264)

الصور (Canva)
ستوري / ريل: 1080 × 1920 — الخلاصة: 1080 × 1350 — مربع: 1080 × 1080
الصيغة: PNG للنصوص والألوان الموحّدة، JPG للصور

تسمية الملفات
[المنتج]-[الصيغة]-v[الرقم] — مثال: حقيبة-جلد-9x16-v2

الفحص الأخير
☐ مشاهدة كاملة على الهاتف ☐ مشاهدة بدون صوت ☐ مراجعة الإملاء ☐ لا نص في المناطق المخفية`,
      },
    ),
  ],
  'm7-l10': [
    R(
      {
        title: 'Fiche — retrouver le produit et ses vidéos',
        text: `1. Capture du produit (photo nette, produit seul si possible).
2. AliExpress → icône appareil photo dans la barre de recherche → importe la capture.
3. Copie le nom exact du produit : [  ]
4. TikTok → recherche avec ce nom (essaie aussi en anglais) → garde 5 vidéos qui montrent bien le produit.
5. Copie le lien de chaque vidéo et télécharge-la avec SnapTik.
6. Range tout dans un dossier : [produit]/videos-source/

Vidéos retenues :
1. [lien] — ce qu’elle montre : [  ]
2. [lien] — [  ]
3. [lien] — [  ]
4. [lien] — [  ]
5. [lien] — [  ]

Droits : ces vidéos appartiennent à leurs créateurs. Sers-t’en pour t’entraîner au montage ; avant de les utiliser dans une pub payante, demande l’accord du créateur ou du fournisseur, ou filme tes propres plans.`,
      },
      {
        title: 'Sheet — find the product and its videos',
        text: `1. Screenshot of the product (sharp, product alone if possible).
2. AliExpress → camera icon in the search bar → upload the screenshot.
3. Copy the exact product name: [  ]
4. TikTok → search with that name (try English too) → keep 5 videos that show the product well.
5. Copy each video’s link and download it with SnapTik.
6. Put everything in one folder: [product]/source-videos/

Selected videos:
1. [link] — what it shows: [  ]
2. [link] — [  ]
3. [link] — [  ]
4. [link] — [  ]
5. [link] — [  ]

Rights: these videos belong to their creators. Use them to practise editing; before using them in a paid ad, ask the creator or supplier for permission, or film your own shots.`,
      },
      {
        title: 'بطاقة — إيجاد المنتج وفيديوهاته',
        text: `1. لقطة شاشة للمنتج (واضحة، والمنتج وحده إن أمكن).
2. AliExpress ← أيقونة الكاميرا في شريط البحث ← ارفع اللقطة.
3. انسخ الاسم الدقيق للمنتج: [  ]
4. TikTok ← ابحث بهذا الاسم (جرّب بالإنجليزية أيضًا) ← احتفظ بـ5 فيديوهات تُظهر المنتج جيدًا.
5. انسخ رابط كل فيديو وحمّله بـSnapTik.
6. رتّب كل شيء في مجلد واحد: [المنتج]/فيديوهات-المصدر/

الفيديوهات المختارة:
1. [الرابط] — ما يُظهره: [  ]
2. [الرابط] — [  ]
3. [الرابط] — [  ]
4. [الرابط] — [  ]
5. [الرابط] — [  ]

الحقوق: هذه الفيديوهات ملك لأصحابها. استعملها للتدرّب على المونتاج؛ وقبل استعمالها في إعلان مموّل، اطلب موافقة صاحبها أو المورّد، أو صوّر لقطاتك الخاصة.`,
      },
    ),
  ],
  'm7-l2': [
    R(
      {
        title: 'Fiche — durée visée et liste de coupe',
        text: `Repères de durée
- 6–15 s : stories et reels, un seul message
- 15–30 s : la plupart des pubs TikTok et Reels
- 30–60 s : UGC, démonstrations, produits à expliquer

Ma pub : ce que le produit doit montrer : [  ] → durée visée : [  ] s

Liste de coupe
☐ l’intro « salam, aujourd’hui je vais… »
☐ les silences et les « euh »
☐ les phrases dites deux fois
☐ les plans où rien ne change pendant plus de 3 s
☐ le moment où je m’ennuie en regardant : [  ] s

Durée finale : [  ] s — écart avec la durée visée : [  ] s`,
      },
      {
        title: 'Sheet — target length and cut list',
        text: `Length guides
- 6–15 s: stories and reels, a single message
- 15–30 s: most TikTok and Reels ads
- 30–60 s: UGC, demos, products that need explaining

My ad: what the product needs to show: [  ] → target length: [  ] s

Cut list
☐ the “hi, today I’m going to…” intro
☐ silences and “um”s
☐ sentences said twice
☐ shots where nothing changes for more than 3 s
☐ the moment I get bored while watching: [  ] s

Final length: [  ] s — gap with the target: [  ] s`,
      },
      {
        title: 'بطاقة — المدة المستهدفة وقائمة القص',
        text: `مراجع المدة
- 6–15 ثانية: ستوري وريلز، رسالة واحدة
- 15–30 ثانية: أغلب إعلانات تيك توك وريلز
- 30–60 ثانية: UGC، العروض، المنتجات التي تحتاج شرحًا

إعلاني: ما يجب أن يُظهره المنتج: [  ] ← المدة المستهدفة: [  ] ثانية

قائمة القص
☐ مقدمة «السلام، اليوم سأ…»
☐ لحظات الصمت و«آآه»
☐ الجمل المكرّرة
☐ اللقطات التي لا يتغيّر فيها شيء لأكثر من 3 ثوانٍ
☐ اللحظة التي أشعر فيها بالملل أثناء المشاهدة: [  ] ثانية

المدة النهائية: [  ] ثانية — الفرق مع المدة المستهدفة: [  ] ثانية`,
      },
    ),
  ],
  'm7-l5': [
    R(
      {
        title: 'Prompt — corriger mes sous-titres',
        text: `Voici les sous-titres automatiques de ma pub pour [produit], en [darija / français / arabe] : [colle le texte].
Corrige uniquement les erreurs de reconnaissance (mots mal entendus, noms, prix, marque : [nom de la marque], prix : [prix]). Ne change pas le sens ni le ton.
Puis découpe le texte en lignes de 2 lignes maximum à l’écran (environ 5 à 7 mots par ligne) et indique pour chaque phrase 1 ou 2 mots clés à mettre en couleur (le prix, le bénéfice, l’accroche).`,
      },
      {
        title: 'Prompt — fix my captions',
        text: `Here are the auto captions of my ad for [product], in [language]: [paste the text].
Fix only recognition errors (misheard words, names, prices, brand: [brand name], price: [price]). Do not change the meaning or the tone.
Then split the text into lines of 2 on-screen lines maximum (about 5 to 7 words per line) and mark, for each sentence, 1 or 2 key words to colour (the price, the benefit, the hook).`,
      },
      {
        title: 'برومبت — تصحيح الترجمة على الشاشة',
        text: `هذه الترجمة التلقائية لإعلاني عن [المنتج]، بـ[الدارجة / العربية / الفرنسية]: [الصق النص].
صحّح أخطاء التعرّف فقط (كلمات مسموعة خطأ، أسماء، أسعار، العلامة: [اسم العلامة]، السعر: [السعر]). لا تغيّر المعنى ولا الأسلوب.
ثم قسّم النص إلى سطرين كحد أقصى على الشاشة (حوالي 5 إلى 7 كلمات في السطر) وحدّد لكل جملة كلمة أو كلمتين مفتاحيتين تُلوَّنان (السعر، الفائدة، الهوك).`,
      },
    ),
  ],
  'm7-l6': [
    R(
      {
        title: 'Modèle — ma carte CTA',
        text: `Format : 1080 × 1920, fond uni, 2 à 3 secondes à la fin de la vidéo

1. Le produit : [photo nette, détourée ou sur fond uni]
2. L’offre (seulement si elle est vraie) : [ex. : livraison 58 wilayas]
3. L’action, en gros sur un bouton qui tranche : [ex. : « Commande sur WhatsApp »]
4. La réassurance : [ex. : paiement à la livraison]

Texte dit en voix off au même moment : [  ]

Avant de valider
☐ lisible en une seconde
☐ dans la zone sûre (rien en bas ni à droite)
☐ une seule action demandée
☐ offre et conditions vraies`,
      },
      {
        title: 'Template — my CTA card',
        text: `Format: 1080 × 1920, plain background, 2 to 3 seconds at the end of the video

1. The product: [sharp photo, cut out or on a plain background]
2. The offer (only if it is true): [e.g. nationwide delivery]
3. The action, big on a button that stands out: [e.g. “Order on WhatsApp”]
4. The reassurance: [e.g. pay on delivery]

Line said in voice-over at the same moment: [  ]

Before approving
☐ readable in one second
☐ in the safe area (nothing at the bottom or right)
☐ only one action requested
☐ true offer and conditions`,
      },
      {
        title: 'نموذج — بطاقة CTA',
        text: `الصيغة: 1080 × 1920، خلفية موحّدة، 2 إلى 3 ثوانٍ في نهاية الفيديو

1. المنتج: [صورة واضحة، مفرّغة أو على خلفية موحّدة]
2. العرض (فقط إن كان صحيحًا): [مثال: التوصيل إلى 58 ولاية]
3. الإجراء، بخط كبير على زر بلون بارز: [مثال: «اطلب عبر واتساب»]
4. الطمأنة: [مثال: الدفع عند الاستلام]

الجملة التي تُقال بالتعليق الصوتي في اللحظة نفسها: [  ]

قبل الاعتماد
☐ مقروءة في ثانية
☐ في المنطقة الآمنة (لا شيء في الأسفل ولا على اليمين)
☐ إجراء واحد مطلوب
☐ عرض وشروط صحيحة`,
      },
    ),
  ],
  'm8-l1': [
    R(
      {
        title: 'Fiche — réussir un match cut',
        text: `Le geste choisi : [poser / tourner / ouvrir / lever]

Tournage
☐ deux plans avec le même geste
☐ l’objet au même endroit du cadre dans les deux plans (active la grille)
☐ même sens de mouvement
☐ le geste filmé en entier, avec 1 s avant et après

Montage dans CapCut
☐ coupe pendant le mouvement, pas avant ni après
☐ vérifié image par image : l’objet ne saute pas
☐ aucune transition ajoutée : la coupe suffit

Ailleurs dans la vidéo : coupes franches partout ; une zoom transition au maximum, un seul style.
Nom de l’export : [produit-transitions-v2]`,
      },
      {
        title: 'Sheet — nailing a match cut',
        text: `The chosen gesture: [put down / turn / open / lift]

Filming
☐ two shots with the same gesture
☐ the object in the same place in the frame in both shots (turn on the grid)
☐ same direction of movement
☐ the whole gesture filmed, with 1 s before and after

Editing in CapCut
☐ cut during the movement, not before or after
☐ checked frame by frame: the object does not jump
☐ no transition added: the cut is enough

Elsewhere in the video: hard cuts everywhere; one zoom transition at most, a single style.
Export name: [product-transitions-v2]`,
      },
      {
        title: 'بطاقة — إتقان الـmatch cut',
        text: `الحركة المختارة: [وضع / تدوير / فتح / رفع]

التصوير
☐ لقطتان بالحركة نفسها
☐ الشيء في المكان نفسه من الإطار في اللقطتين (فعّل الشبكة)
☐ اتجاه الحركة نفسه
☐ الحركة مصوّرة كاملة، مع ثانية قبلها وبعدها

المونتاج في CapCut
☐ القص أثناء الحركة، لا قبلها ولا بعدها
☐ مراجعة صورة بصورة: الشيء لا يقفز
☐ بلا انتقال مضاف: القص يكفي

في بقية الفيديو: قص مباشر في كل مكان؛ انتقال زوم واحد على الأكثر، بأسلوب واحد.
اسم التصدير: [المنتج-انتقالات-v2]`,
      },
    ),
  ],
  'm8-l2': [
    R(
      {
        title: 'Aide-mémoire — punch-in, Ken Burns, keyframes',
        text: `PUNCH-IN (zoom sec sur un mot fort)
1. Place la tête de lecture juste avant le mot fort → Diviser.
2. Sélectionne la 2ᵉ partie → agrandis à 110–120 %.
3. Recadre pour garder le visage ou le produit au centre.
Mes mots forts : [prix] / [bénéfice] / [détail]

KEN BURNS (zoom lent sur une photo)
Keyframe au début à 100 %, keyframe à la fin à environ 110 %. Même sens pour toutes les photos de la série.

KEYFRAMES
Le bouton en losange (selon ta version) : un point de départ, un point d’arrivée, CapCut calcule le trajet.

Règle : chaque mouvement montre quelque chose de plus. Sinon, on le supprime.
Astuce : filmer en 4K garde le punch-in net.`,
      },
      {
        title: 'Cheat sheet — punch-in, Ken Burns, keyframes',
        text: `PUNCH-IN (sharp zoom on a key word)
1. Put the playhead just before the key word → Split.
2. Select the 2nd part → scale to 110–120%.
3. Reframe to keep the face or product centred.
My key words: [price] / [benefit] / [detail]

KEN BURNS (slow zoom on a photo)
Keyframe at the start at 100%, keyframe at the end at about 110%. Same direction for every photo in the series.

KEYFRAMES
The diamond button (depending on your version): a start point, an end point, CapCut works out the path.

Rule: every movement shows something more. Otherwise, delete it.
Tip: filming in 4K keeps the punch-in sharp.`,
      },
      {
        title: 'مذكّرة — punch-in وKen Burns والـkeyframes',
        text: `PUNCH-IN (زوم سريع على كلمة قوية)
1. ضع مؤشر التشغيل قبل الكلمة القوية مباشرة ← تقسيم.
2. اختر الجزء الثاني ← كبّره إلى 110–120 %.
3. أعد التأطير ليبقى الوجه أو المنتج في الوسط.
كلماتي القوية: [السعر] / [الفائدة] / [التفصيل]

KEN BURNS (زوم بطيء على صورة)
keyframe في البداية على 100 %، وkeyframe في النهاية على حوالي 110 %. الاتجاه نفسه لكل صور السلسلة.

KEYFRAMES
زر المعيّن (حسب نسختك): نقطة بداية ونقطة وصول، وCapCut يحسب المسار.

القاعدة: كل حركة تُظهر شيئًا إضافيًا، وإلا نحذفها.
نصيحة: التصوير بدقة 4K يحافظ على وضوح الـpunch-in.`,
      },
    ),
  ],
  'm8-l3': [
    R(
      {
        title: 'Fiche — speed ramp et musique autorisée',
        text: `SPEED RAMP
☐ geste clé filmé en 60 i/s : [spray / fermoir / ouverture]
☐ CapCut → Vitesse → Courbe (selon ta version)
☐ rapide sur le trajet, lent sur le moment clé, puis retour à la normale

MONTER SUR LA MUSIQUE
☐ temps forts marqués (repères automatiques ou manuels)
☐ coupes posées sur des repères, pas sur chaque temps
☐ le geste clé sur le temps le plus fort
☐ musique sous la voix

MUSIQUE D’UNE PUB PAYANTE
Choisis un titre autorisé pour un usage commercial : bibliothèque musicale commerciale de TikTok, Meta Sound Collection, ou musique achetée avec une licence. Un son tendance n’est pas forcément autorisé dans une pub.
Ma musique : [titre] — source : [bibliothèque] — licence vérifiée ☐`,
      },
      {
        title: 'Sheet — speed ramp and licensed music',
        text: `SPEED RAMP
☐ key gesture filmed at 60 fps: [spray / clasp / opening]
☐ CapCut → Speed → Curve (depending on your version)
☐ fast on the movement, slow on the key moment, then back to normal

EDITING TO THE MUSIC
☐ strong beats marked (automatic or manual markers)
☐ cuts placed on markers, not on every beat
☐ the key gesture on the strongest beat
☐ music below the voice

MUSIC FOR A PAID AD
Choose a track licensed for commercial use: TikTok’s Commercial Music Library, Meta Sound Collection, or music bought with a licence. A trending sound is not necessarily allowed in an ad.
My music: [title] — source: [library] — licence checked ☐`,
      },
      {
        title: 'بطاقة — الـspeed ramp والموسيقى المسموح بها',
        text: `SPEED RAMP
☐ الحركة المهمة مصوّرة بـ60 صورة/ث: [رشّ / إغلاق / فتح]
☐ CapCut ← السرعة ← المنحنى (حسب نسختك)
☐ سريع أثناء الحركة، بطيء في اللحظة المهمة، ثم العودة إلى السرعة العادية

المونتاج على الموسيقى
☐ تحديد الإيقاعات القوية (علامات تلقائية أو يدوية)
☐ القص على العلامات، لا على كل إيقاع
☐ الحركة المهمة على أقوى إيقاع
☐ الموسيقى تحت الصوت

موسيقى الإعلان المموّل
اختر مقطعًا مسموحًا للاستعمال التجاري: مكتبة الموسيقى التجارية في تيك توك، Meta Sound Collection، أو موسيقى مشتراة برخصة. الصوت الرائج ليس بالضرورة مسموحًا في إعلان.
موسيقاي: [العنوان] — المصدر: [المكتبة] — تحققت من الرخصة ☐`,
      },
    ),
  ],
  'm9-l2': [
    R(
      {
        title: 'Liste de plans — les 4 valeurs',
        text: `Avant de filmer : grille activée ☐ — téléphone à la verticale ☐ — objectif nettoyé ☐

1. PLAN MOYEN (la personne en entier, le produit en situation)
Ce que je filme : [  ] — fait ☐
2. PLAN RAPPROCHÉ (de la poitrine à la tête, face caméra)
Yeux sur la ligne du haut de la grille ☐ — ce que je dis : [  ] — fait ☐
3. GROS PLAN (le visage, une réaction)
Ce que je filme : [  ] — fait ☐
4. PLAN DE DÉTAIL (bouchon, texture, couture, cadran)
Détail 1 : [  ] ☐ — Détail 2 : [  ] ☐ — Détail 3 : [  ] ☐

Vérification : rien d’important en bas ni à droite ☐ — marge en haut et en bas pour le 4:5 ☐ — espace du côté du regard ☐`,
      },
      {
        title: 'Shot list — the 4 shot sizes',
        text: `Before filming: grid on ☐ — phone vertical ☐ — lens cleaned ☐

1. MEDIUM-WIDE SHOT (the whole person, the product in use)
What I film: [  ] — done ☐
2. MEDIUM CLOSE-UP (chest to head, talking to camera)
Eyes on the top line of the grid ☐ — what I say: [  ] — done ☐
3. CLOSE-UP (the face, a reaction)
What I film: [  ] — done ☐
4. DETAIL SHOT (cap, texture, stitching, watch face)
Detail 1: [  ] ☐ — Detail 2: [  ] ☐ — Detail 3: [  ] ☐

Check: nothing important at the bottom or right ☐ — margin at top and bottom for 4:5 ☐ — space on the side of the gaze ☐`,
      },
      {
        title: 'قائمة اللقطات — أحجام اللقطة الأربعة',
        text: `قبل التصوير: الشبكة مفعّلة ☐ — الهاتف عمودي ☐ — العدسة نظيفة ☐

1. لقطة متوسطة (الشخص كاملًا، المنتج في الاستعمال)
ما أصوّره: [  ] — تمّ ☐
2. لقطة قريبة (من الصدر إلى الرأس، مواجهة الكاميرا)
العينان على الخط العلوي للشبكة ☐ — ما أقوله: [  ] — تمّ ☐
3. لقطة مقرّبة (الوجه، ردّ فعل)
ما أصوّره: [  ] — تمّ ☐
4. لقطة تفصيلية (الغطاء، الملمس، الخياطة، ميناء الساعة)
التفصيل 1: [  ] ☐ — التفصيل 2: [  ] ☐ — التفصيل 3: [  ] ☐

التحقق: لا شيء مهم في الأسفل ولا على اليمين ☐ — هامش في الأعلى والأسفل لصيغة 4:5 ☐ — مساحة في جهة النظر ☐`,
      },
    ),
  ],
  'm11-l3': [
    R(
      {
        title: 'Prompt — un produit, quatre formats organiques',
        text: `Agis comme un community manager. Ma page vend [produit] à [cible], à [ville]. Mon WhatsApp sert à commander.
Pour ce produit, propose :
- 1 idée de reel pour toucher de nouvelles personnes (hook + déroulé en 3 plans) ;
- 1 carrousel de 5 slides qui explique un point utile de ma niche ;
- 3 stories pour aujourd’hui : une coulisse, un sondage, un rappel du WhatsApp ;
- le plan d’un live de 10 minutes : les produits à montrer, l’ordre, 3 questions à poser aux spectateurs, et le message d’annonce à publier la veille.
Pas de faux avis, pas de fausse urgence.`,
      },
      {
        title: 'Prompt — one product, four organic formats',
        text: `Act as a community manager. My page sells [product] to [audience], in [city]. Orders go through my WhatsApp.
For this product, suggest:
- 1 reel idea to reach new people (hook + 3-shot outline);
- 1 five-slide carousel that explains a useful point in my niche;
- 3 stories for today: behind the scenes, a poll, a WhatsApp reminder;
- the plan for a 10-minute live: the products to show, the order, 3 questions to ask viewers, and the announcement to post the day before.
No fake reviews, no fake urgency.`,
      },
      {
        title: 'برومبت — منتج واحد وأربع صيغ عضوية',
        text: `تصرّف كمسيّر صفحات. صفحتي تبيع [المنتج] لـ[الجمهور] في [المدينة]. الطلبات تتم عبر واتساب.
لهذا المنتج، اقترح:
- فكرة ريل واحدة للوصول إلى أشخاص جدد (هوك + تسلسل من 3 لقطات)؛
- كاروسيل من 5 شرائح يشرح نقطة مفيدة في مجالي؛
- 3 ستوريات لليوم: كواليس، استطلاع، تذكير بالواتساب؛
- خطة لايف من 10 دقائق: المنتجات المعروضة، الترتيب، 3 أسئلة للمشاهدين، ونص الإعلان الذي يُنشر في اليوم السابق.
بلا آراء مزيّفة ولا استعجال مزيّف.`,
      },
    ),
  ],
};
