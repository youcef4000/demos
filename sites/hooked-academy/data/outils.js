// Outils IA de la formation : à quoi ils servent, version gratuite, prix de départ, leçon atelier.
// Utilisé par la landing (« Combien coûte l'IA pour commencer ? ») et la page « Outils IA » de l'espace étudiant.
// Prix en dollars US par mois, relevés en octobre 2026 sur des comparatifs récents : ils changent souvent,
// la page invite toujours à vérifier sur le site de l'outil. Mettre à jour CHECKED en même temps que les prix.

export const CHECKED = '2026-10';

const T = (fr, en, ar) => ({ fr, en, ar });

export const OUTILS = [
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com', cat: 'ecrire', price: 20, lesson: 'ia1-l7',
    use: T('Hooks, scripts, textes d’annonce, analyse de pubs', 'Hooks, scripts, ad copy, ad breakdowns', 'الهوك والسكريبت ونصوص الإعلانات وتحليلها'),
    free: T('Version gratuite (limites d’usage)', 'Free version (usage limits)', 'نسخة مجانية (حدود استخدام)'),
    paid: T('Plus : environ 20 $/mois', 'Plus: about $20/month', 'Plus: حوالي 20 دولارًا شهريًا') },
  { id: 'claude', name: 'Claude', url: 'https://claude.ai', cat: 'ecrire', price: 20, lesson: 'ia1-l9',
    use: T('Scripts, storyboards, chaînes de prompts, projets clients', 'Scripts, storyboards, prompt chains, client projects', 'السكريبت والستوري بورد وسلاسل البرومبت ومشاريع الزبائن'),
    free: T('Version gratuite (limites d’usage)', 'Free version (usage limits)', 'نسخة مجانية (حدود استخدام)'),
    paid: T('Pro : environ 20 $/mois', 'Pro: about $20/month', 'Pro: حوالي 20 دولارًا شهريًا') },
  { id: 'gemini', name: 'Gemini · Nano Banana', url: 'https://gemini.google.com', cat: 'image', price: 20, lesson: 'ia2-l7',
    use: T('Retouche et création d’images produit, textes sur image', 'Product image editing and creation, text on images', 'تعديل صور المنتجات وإنشاؤها والنصوص على الصور'),
    free: T('Version gratuite (quotas)', 'Free version (quotas)', 'نسخة مجانية (حصص محدودة)'),
    paid: T('Google AI Pro : environ 20 $/mois (avec Veo selon l’offre)', 'Google AI Pro: about $20/month (Veo depending on plan)', 'Google AI Pro: حوالي 20 دولارًا شهريًا (مع Veo حسب الاشتراك)') },
  { id: 'veo', name: 'Veo 3.1 · Flow', url: 'https://labs.google/flow', cat: 'video', price: 20, lesson: 'ia3-l6',
    use: T('Vidéos à partir d’images : frames et ingrédients', 'Videos from images: frames and ingredients', 'فيديوهات من الصور: الإطارات والمكوّنات'),
    free: T('Accès limité selon le pays et l’offre', 'Limited access depending on country and plan', 'وصول محدود حسب البلد والاشتراك'),
    paid: T('Inclus dans Google AI Pro (crédits limités)', 'Included in Google AI Pro (limited credits)', 'ضمن Google AI Pro (رصيد محدود)') },
  { id: 'kling', name: 'Kling', url: 'https://klingai.com', cat: 'video', price: 10, lesson: 'ia3-l7',
    use: T('Image vers vidéo, mouvements de caméra', 'Image to video, camera moves', 'من الصورة إلى الفيديو، حركات الكاميرا'),
    free: T('Crédits gratuits limités', 'Limited free credits', 'رصيد مجاني محدود'),
    paid: T('Standard : environ 10 $/mois', 'Standard: about $10/month', 'Standard: حوالي 10 دولارات شهريًا') },
  { id: 'higgsfield', name: 'Higgsfield', url: 'https://higgsfield.ai', cat: 'video', price: 19, lesson: 'ia6-l6',
    use: T('Plans cinéma, UGC et pubs produit prêtes', 'Cinematic shots, UGC and ready product ads', 'لقطات سينمائية وUGC وإعلانات منتجات جاهزة'),
    free: T('Quelques crédits pour tester', 'A few credits to try', 'رصيد قليل للتجربة'),
    paid: T('À partir d’environ 19 $/mois', 'From about $19/month', 'ابتداءً من حوالي 19 دولارًا شهريًا') },
  { id: 'elevenlabs', name: 'ElevenLabs', url: 'https://elevenlabs.io', cat: 'voix', price: 6, lesson: 'ia4-l4',
    use: T('Voix off, doublage, effets sonores', 'Voice-over, dubbing, sound effects', 'التعليق الصوتي والدبلجة والمؤثرات الصوتية'),
    free: T('Gratuit : 10 000 crédits/mois, usage non commercial', 'Free: 10,000 credits/month, non-commercial use', 'مجاني: 10000 رصيد شهريًا، استخدام غير تجاري'),
    paid: T('Starter : environ 6 $/mois (clonage de voix, usage commercial)', 'Starter: about $6/month (voice cloning, commercial use)', 'Starter: حوالي 6 دولارات شهريًا (استنساخ الصوت، استخدام تجاري)') },
  { id: 'capcut', name: 'CapCut', url: 'https://www.capcut.com', cat: 'montage', price: 0, lesson: 'm5-l1',
    use: T('Montage, sous-titres, effets, export', 'Editing, captions, effects, export', 'المونتاج والترجمة والمؤثرات والتصدير'),
    free: T('Gratuit (suffisant pour la formation)', 'Free (enough for the course)', 'مجاني (يكفي للتكوين)'),
    paid: T('Option Pro payante', 'Paid Pro option', 'خيار Pro مدفوع') },
  { id: 'canva', name: 'Canva', url: 'https://www.canva.com', cat: 'montage', price: 0, lesson: 'm5-l2',
    use: T('Images pub, carrousels, cartes CTA', 'Ad images, carousels, CTA cards', 'صور الإعلانات والكاروسيل وبطاقات CTA'),
    free: T('Gratuit (suffisant pour la formation)', 'Free (enough for the course)', 'مجاني (يكفي للتكوين)'),
    paid: T('Option Pro payante (fonds transparents…)', 'Paid Pro option (transparent backgrounds…)', 'خيار Pro مدفوع (خلفيات شفافة…)') },
];

export const CATS = {
  ecrire: T('Écrire', 'Write', 'الكتابة'),
  image: T('Images', 'Images', 'الصور'),
  video: T('Vidéo', 'Video', 'الفيديو'),
  voix: T('Voix', 'Voice', 'الصوت'),
  montage: T('Montage', 'Editing', 'المونتاج'),
};

/**
 * Générateur de prompts de la page « Outils IA ». {p} produit, {c} cible, {b} bénéfice, {o} offre et CTA.
 * Les prompts d'écriture suivent la langue de l'interface ; ceux d'image et de vidéo restent en anglais
 * (les modèles le comprennent mieux), seuls les champs de l'étudiant y sont insérés tels quels.
 */
export const PROMPTS = {
  hooks: {
    tools: ['chatgpt', 'claude'],
    text: T(
      'Tu es expert en publicité vidéo pour les réseaux sociaux en Algérie.\nProduit : {p}\nCible : {c}\nBénéfice principal : {b}\n\nÉcris 10 hooks de 3 secondes maximum pour une pub verticale (Reels, TikTok), en darija algérienne simple : 2 questions qui piquent, 2 avant/après honnêtes, 2 démonstrations, 2 interpellations de la cible, 2 histoires personnelles.\nPour chaque hook, décris aussi la première image à l’écran.\nRègles : aucune promesse fausse, aucun chiffre inventé, des phrases courtes.',
      'You are an expert in social video ads for the Algerian market.\nProduct: {p}\nTarget: {c}\nMain benefit: {b}\n\nWrite 10 hooks of 3 seconds maximum for a vertical ad (Reels, TikTok), in simple Algerian darija: 2 pointed questions, 2 honest before/afters, 2 demonstrations, 2 call-outs to the target, 2 personal stories.\nFor each hook, also describe the first image on screen.\nRules: no false promises, no invented numbers, short sentences.',
      'أنت خبير في إعلانات الفيديو على مواقع التواصل في السوق الجزائري.\nالمنتج: {p}\nالجمهور المستهدف: {c}\nالفائدة الأساسية: {b}\n\nاكتب 10 هوكات لا تتجاوز 3 ثوانٍ لإعلان عمودي (Reels، TikTok) بالدارجة الجزائرية البسيطة: سؤالان يلمسان المشكلة، مقارنتان صادقتان قبل/بعد، عرضان للمنتج، نداءان مباشران للجمهور، وقصتان شخصيتان.\nلكل هوك، صِف أيضًا الصورة الأولى على الشاشة.\nالقواعد: لا وعود كاذبة، لا أرقام مخترعة، جمل قصيرة.',
    ),
  },
  script: {
    tools: ['chatgpt', 'claude'],
    text: T(
      'Tu es scénariste de publicités vidéo UGC.\nÉcris le script d’une pub verticale de 30 secondes maximum.\nProduit : {p}\nCible : {c}\nBénéfice principal : {b}\nOffre et appel à l’action : {o}\n\nStructure : Hook (0 à 3 s), Body (problème, solution, preuve), CTA (une seule action).\nPour chaque plan, donne : la durée, ce qu’on voit, la voix off en darija algérienne, le texte à l’écran.\nRien de faux sur le produit, aucun avis ni chiffre inventé.',
      'You are a UGC video ad scriptwriter.\nWrite the script of a vertical ad of 30 seconds maximum.\nProduct: {p}\nTarget: {c}\nMain benefit: {b}\nOffer and call to action: {o}\n\nStructure: Hook (0 to 3 s), Body (problem, solution, proof), CTA (a single action).\nFor each shot, give: the duration, what we see, the voice-over in Algerian darija, the on-screen text.\nNothing false about the product, no invented reviews or numbers.',
      'أنت كاتب سيناريو لإعلانات فيديو UGC.\nاكتب سيناريو إعلان عمودي لا يتجاوز 30 ثانية.\nالمنتج: {p}\nالجمهور المستهدف: {c}\nالفائدة الأساسية: {b}\nالعرض والدعوة إلى الفعل: {o}\n\nالهيكل: الهوك (من 0 إلى 3 ثوانٍ)، البودي (المشكلة، الحل، الدليل)، الـ CTA (فعل واحد فقط).\nلكل لقطة، اذكر: المدة، ما يظهر على الشاشة، التعليق الصوتي بالدارجة الجزائرية، النص المكتوب على الشاشة.\nلا شيء كاذب عن المنتج، ولا آراء أو أرقام مخترعة.',
    ),
  },
  voice: {
    tools: ['chatgpt', 'claude', 'elevenlabs'],
    text: T(
      'Écris une voix off de 30 secondes maximum (environ 70 mots) en darija algérienne naturelle.\nProduit : {p}\nCible : {c}\nBénéfice principal : {b}\nOffre et appel à l’action : {o}\n\nTon chaleureux et direct, phrases courtes, le hook dans la première phrase, l’appel à l’action à la fin.\nMarque les pauses avec « / » pour l’enregistrement ou la voix IA.',
      'Write a voice-over of 30 seconds maximum (about 70 words) in natural Algerian darija.\nProduct: {p}\nTarget: {c}\nMain benefit: {b}\nOffer and call to action: {o}\n\nWarm and direct tone, short sentences, the hook in the first sentence, the call to action at the end.\nMark pauses with “/” for recording or for the AI voice.',
      'اكتب تعليقًا صوتيًا لا يتجاوز 30 ثانية (حوالي 70 كلمة) بالدارجة الجزائرية الطبيعية.\nالمنتج: {p}\nالجمهور المستهدف: {c}\nالفائدة الأساسية: {b}\nالعرض والدعوة إلى الفعل: {o}\n\nنبرة دافئة ومباشرة، جمل قصيرة، الهوك في الجملة الأولى، والدعوة إلى الفعل في النهاية.\nضع علامة « / » عند كل وقفة للتسجيل أو للصوت الاصطناعي.',
    ),
  },
  image: {
    tools: ['gemini'],
    en: true,
    text: 'Advertising product photo of {p}, made for {c}.\nThe image shows the main benefit: {b}.\nHero shot, product centered and sharp, label readable, realistic reflections and soft shadows.\nSoft studio lighting, clean background in harmony with the product colors, premium commercial look.\nVertical 4:5 format. No extra text, no logo other than the product’s own, no watermark.',
  },
  video: {
    tools: ['veo', 'kling', 'higgsfield'],
    en: true,
    text: 'Vertical 9:16 video, 5 seconds, from the attached product image of {p}.\nSlow camera push-in toward the product, a soft light sweep across the label, subtle background movement.\nMood: {b}, for {c}.\nThe product stays identical: same shape, same colors, same label. No text, no distortion, no extra objects.',
  },
};
export const PROMPT_TYPES = Object.keys(PROMPTS);

/** Trois budgets de départ (dollars par mois). */
export const BUDGETS = [
  { id: 'apprendre', min: 0, max: 0, tools: ['chatgpt', 'claude', 'gemini', 'capcut', 'canva', 'elevenlabs'],
    title: T('Pour apprendre', 'To learn', 'للتعلّم'),
    text: T('Les versions gratuites suffisent pour suivre toute la formation et faire tes exercices.', 'Free versions are enough to follow the whole course and do your exercises.', 'النسخ المجانية تكفي لمتابعة التكوين كله وإنجاز تمارينك.') },
  { id: 'produire', min: 26, max: 36, tools: ['gemini', 'elevenlabs', 'kling', 'capcut', 'canva'],
    title: T('Pour produire tes pubs', 'To produce your ads', 'لإنتاج إعلاناتك'),
    text: T('Un abonnement principal (assistant ou Google AI Pro), ElevenLabs Starter, et Kling Standard si tu fais beaucoup de vidéo.', 'One main subscription (assistant or Google AI Pro), ElevenLabs Starter, and Kling Standard if you make a lot of video.', 'اشتراك رئيسي (مساعد أو Google AI Pro) وElevenLabs Starter، وKling Standard إذا كنت تنتج الكثير من الفيديو.') },
  { id: 'clients', min: 55, max: 75, tools: ['chatgpt', 'gemini', 'kling', 'higgsfield', 'elevenlabs', 'capcut'],
    title: T('Pour livrer des clients', 'To deliver for clients', 'للعمل مع الزبائن'),
    text: T('Un assistant, Google AI Pro, un outil vidéo et la voix : à financer avec tes premiers contrats, pas avant.', 'An assistant, Google AI Pro, a video tool and voice: fund it with your first contracts, not before.', 'مساعد وGoogle AI Pro وأداة فيديو والصوت: موّلها من عقودك الأولى لا قبلها.') },
];
