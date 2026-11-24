// Outils IA de la formation : à quoi ils servent, version gratuite, prix de départ, leçon atelier.
// Utilisé par la landing (« Combien coûte l'IA pour commencer ? ») et la page « Outils IA » de l'espace étudiant.
// Prix en dollars US par mois, relevés en octobre 2026 sur des comparatifs récents : ils changent souvent,
// la page invite toujours à vérifier sur le site de l'outil. Mettre à jour CHECKED en même temps que les prix.
// ref : lien partenaire (parrainage) du formateur, affiché aux étudiants avec une mention claire ; perk : l'avantage
// que la plateforme donne à l'inscrit, seulement quand il est confirmé (sinon rien n'est promis).

export const CHECKED = '2026-10';

const T = (fr, en, ar) => ({ fr, en, ar });

export const OUTILS = [
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com', cat: 'ecrire', price: 20, lesson: 'ia1-l7',
    use: T('Hooks, scripts, textes d’annonce, analyse de pubs', 'Hooks, scripts, ad copy, ad breakdowns', 'الهوك والسكريبت ونصوص الإعلانات وتحليلها'),
    free: T('Version gratuite (limites d’usage)', 'Free version (usage limits)', 'نسخة مجانية (حدود استخدام)'),
    paid: T('Plus : environ 20 $/mois', 'Plus: about $20/month', 'Plus: حوالي 20 دولارًا شهريًا') },
  { id: 'claude', name: 'Claude', url: 'https://claude.ai', ref: 'https://claude.ai/referral/OtTQNvbscA', cat: 'ecrire', price: 20, lesson: 'ia1-l9',
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
  { id: 'higgsfield', name: 'Higgsfield', url: 'https://higgsfield.ai', ref: 'https://higgsfield.ai?fpr=youcef-dc0219', cat: 'video', price: 19, lesson: 'ia6-l6',
    use: T('Plans cinéma, UGC et pubs produit prêtes', 'Cinematic shots, UGC and ready product ads', 'لقطات سينمائية وUGC وإعلانات منتجات جاهزة'),
    free: T('Quelques crédits pour tester', 'A few credits to try', 'رصيد قليل للتجربة'),
    paid: T('À partir d’environ 19 $/mois', 'From about $19/month', 'ابتداءً من حوالي 19 دولارًا شهريًا') },
  { id: 'elevenlabs', name: 'ElevenLabs', url: 'https://elevenlabs.io', ref: 'https://try.elevenlabs.io/hbtya37nta0b', cat: 'voix', price: 6, lesson: 'ia4-l4',
    use: T('Voix off, doublage, effets sonores', 'Voice-over, dubbing, sound effects', 'التعليق الصوتي والدبلجة والمؤثرات الصوتية'),
    free: T('Gratuit : 10 000 crédits/mois, usage non commercial', 'Free: 10,000 credits/month, non-commercial use', 'مجاني: 10000 رصيد شهريًا، استخدام غير تجاري'),
    paid: T('Starter : environ 6 $/mois (clonage de voix, usage commercial)', 'Starter: about $6/month (voice cloning, commercial use)', 'Starter: حوالي 6 دولارات شهريًا (استنساخ الصوت، استخدام تجاري)') },
  { id: 'capcut', name: 'CapCut', url: 'https://www.capcut.com', ref: 'https://www.capcut.com/capcut_pc_web/fission_receive?code=ifMmSl17713579&lng=fr-FR', cat: 'montage', price: 0, lesson: 'm5-l1',
    use: T('Montage, sous-titres, effets, export', 'Editing, captions, effects, export', 'المونتاج والترجمة والمؤثرات والتصدير'),
    free: T('Gratuit (suffisant pour la formation)', 'Free (enough for the course)', 'مجاني (يكفي للتكوين)'),
    paid: T('Option Pro payante', 'Paid Pro option', 'خيار Pro مدفوع') },
  { id: 'canva', name: 'Canva', url: 'https://www.canva.com', cat: 'montage', price: 0, lesson: 'm5-l2',
    use: T('Images pub, carrousels, cartes CTA', 'Ad images, carousels, CTA cards', 'صور الإعلانات والكاروسيل وبطاقات CTA'),
    free: T('Gratuit (suffisant pour la formation)', 'Free (enough for the course)', 'مجاني (يكفي للتكوين)'),
    paid: T('Option Pro payante (fonds transparents…)', 'Paid Pro option (transparent backgrounds…)', 'خيار Pro مدفوع (خلفيات شفافة…)') },
  { id: 'hostinger', name: 'Hostinger', url: 'https://www.hostinger.com/fr', ref: 'https://www.hostinger.com/fr?REFERRALCODE=EORYOUCEFD4E', cat: 'site', price: 0, lesson: 'ia8-l2',
    perk: T('Réduction exclusive à l’inscription avec le lien Hooked Academy', 'Exclusive discount when you sign up with the Hooked Academy link', 'تخفيض حصري عند التسجيل برابط Hooked Academy'),
    use: T('Ton site portfolio, ta boutique ou ta page de vente, avec nom de domaine', 'Your portfolio site, store or sales page, with a domain name', 'موقع البورتفوليو أو المتجر أو صفحة البيع، مع اسم نطاق'),
    free: T('Pas de version gratuite : utile quand tu présentes ton travail à des clients', 'No free version: useful once you pitch clients', 'لا توجد نسخة مجانية: مفيد عندما تعرض عملك على الزبائن'),
    paid: T('Hébergement web à petit prix (promo selon la durée d’engagement)', 'Low-cost web hosting (promo depends on the commitment length)', 'استضافة مواقع بسعر منخفض (العرض حسب مدة الالتزام)') },
];

export const CATS = {
  ecrire: T('Écrire', 'Write', 'الكتابة'),
  image: T('Images', 'Images', 'الصور'),
  video: T('Vidéo', 'Video', 'الفيديو'),
  voix: T('Voix', 'Voice', 'الصوت'),
  montage: T('Montage', 'Editing', 'المونتاج'),
  site: T('Site', 'Website', 'الموقع'),
};

// Le générateur de prompts a sa propre page : le studio de prompts (#/prompts, data/prompts.js).

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
