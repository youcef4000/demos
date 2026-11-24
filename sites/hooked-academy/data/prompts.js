// Studio de prompts (#/prompts) : les modèles et le moteur qui assemble les prompts.
// Chaque prompt suit les guides officiels les plus récents (novembre 2026) :
//   Anthropic (Claude) — contexte et raison de chaque consigne, consignes en positif, sections balisées,
//     3 à 5 exemples variés, relecture avec des critères avant de répondre, longueur demandée explicitement ;
//   OpenAI (GPT-5.2) — pas de contradictions, longueur chiffrée, 1 à 3 questions OU hypothèses annoncées,
//     faire exactement ce qui est demandé (le reste en option), « métaprompt » pour améliorer un prompt ;
//   Google (Nano Banana Pro, Veo 3.1) — scène décrite en phrases, verbe d'action en tête, texte exact entre
//     guillemets, rôle de chaque image de référence, ce qui doit rester identique ; vidéo : cadrage + sujet +
//     action + contexte + style, dialogue entre guillemets, sons décrits (SFX, ambiance) ;
//   Kling — sujet + mouvement + scène + caméra + lumière, champ « negative prompt » séparé ;
//   ElevenLabs v3 — balises audio entre crochets accordées à la voix, pauses par la ponctuation, majuscules.
// Sources et détails : formations/prompts/README.md.
//
// Les prompts d'écriture suivent la langue de l'interface (fr, en, ar) ; ceux d'image et de vidéo sont en
// anglais (les modèles le comprennent mieux), seuls les champs de l'élève y sont insérés tels quels.

const T = (fr, en, ar) => ({ fr, en, ar });
const pick = (o, L) => (o && typeof o === 'object' && !Array.isArray(o) ? o[L] || o.fr : o || '');

/* ------------------------------------------------------------------ */
/* Groupes (une couleur par formation)                                 */
/* ------------------------------------------------------------------ */

export const GROUPS = [
  { id: 'creative', icon: 'film', title: T('Créative', 'Creative', 'كرياتيف') },
  { id: 'ia', icon: 'sparkles', title: T('IA', 'AI', 'الذكاء الاصطناعي') },
  { id: 'dev', icon: 'layout', title: T('Sites & Apps', 'Sites & Apps', 'المواقع والتطبيقات') },
  { id: 'vendre', icon: 'handshake', title: T('Vendre', 'Sell', 'البيع') },
  { id: 'mieux', icon: 'wand', title: T('Mieux prompter', 'Better prompts', 'برومبت أفضل') },
];

/* ------------------------------------------------------------------ */
/* Champs : libellé (aussi utilisé dans le prompt), exemple, conseil   */
/* ------------------------------------------------------------------ */

export const FIELDS = {
  p: {
    label: T('Produit ou service', 'Product or service', 'المنتج أو الخدمة'),
    ph: T('Ex. : un parfum ambré en coffret cadeau', 'E.g. an amber perfume in a gift box', 'مثال: عطر عنبري في علبة هدايا'),
    ex: T('« Oud Ambré » (exemple), parfum ambré de 100 ml en coffret cadeau', '“Oud Ambré” (example), a 100 ml amber perfume in a gift box', '« عود عنبري » (مثال)، عطر عنبري 100 مل في علبة هدايا'),
    tip: T('Décris ton produit : l’IA ne peut rien inventer de juste sans lui.', 'Describe your product: the AI can’t get anything right without it.', 'صِف منتجك: لا يستطيع الذكاء الاصطناعي أن يصيب دونه.'),
  },
  c: {
    label: T('Cible', 'Target audience', 'الجمهور المستهدف'),
    ph: T('Ex. : hommes de 25 à 40 ans qui cherchent un cadeau', 'E.g. men aged 25 to 40 looking for a gift', 'مثال: رجال من 25 إلى 40 سنة يبحثون عن هدية'),
    ex: T('hommes de 25 à 40 ans à Alger et Oran qui cherchent un cadeau élégant', 'men aged 25 to 40 in Algiers and Oran looking for an elegant gift', 'رجال من 25 إلى 40 سنة في الجزائر العاصمة ووهران يبحثون عن هدية أنيقة'),
    tip: T('Précise la cible : les mots et les exemples seront les siens.', 'Name the audience: the words and examples will be theirs.', 'حدّد الجمهور: ستكون الكلمات والأمثلة كلماته وأمثلته.'),
  },
  b: {
    label: T('Bénéfice principal', 'Main benefit', 'الفائدة الأساسية'),
    ph: T('Ex. : une odeur qui tient toute la journée', 'E.g. a scent that lasts all day', 'مثال: رائحة تدوم طوال اليوم'),
    ex: T('une odeur chaude et élégante qui tient toute la journée', 'a warm, elegant scent that lasts all day', 'رائحة دافئة وأنيقة تدوم طوال اليوم'),
    tip: T('Ajoute le bénéfice principal : c’est lui qui fait vendre.', 'Add the main benefit: that’s what sells.', 'أضف الفائدة الأساسية: هي التي تبيع.'),
  },
  o: {
    label: T('Offre et appel à l’action', 'Offer and call to action', 'العرض والدعوة إلى الفعل'),
    ph: T('Ex. : livraison partout en Algérie, commande sur WhatsApp', 'E.g. delivery across Algeria, order on WhatsApp', 'مثال: توصيل لكل الجزائر، الطلب عبر واتساب'),
    ex: T('livraison partout en Algérie, paiement à la livraison, commande sur WhatsApp', 'delivery across Algeria, cash on delivery, order on WhatsApp', 'توصيل لكل الجزائر، الدفع عند الاستلام، الطلب عبر واتساب'),
    tip: T('Ajoute l’offre et l’action attendue : la pub doit dire quoi faire.', 'Add the offer and the expected action: the ad must say what to do.', 'أضف العرض والفعل المطلوب: يجب أن يقول الإعلان ماذا نفعل.'),
  },
  x: {
    label: T('Faits réels à utiliser', 'Real facts to use', 'حقائق حقيقية للاستعمال'),
    ph: T('Ex. : flacon en verre, tenue d’environ 8 heures', 'E.g. glass bottle, lasts about 8 hours', 'مثال: قارورة زجاجية، يدوم حوالي 8 ساعات'),
    ex: T('flacon en verre de 100 ml, tenue d’environ 8 heures sur la peau, coffret prêt à offrir', '100 ml glass bottle, lasts about 8 hours on skin, gift-ready box', 'قارورة زجاجية 100 مل، يدوم حوالي 8 ساعات على البشرة، علبة جاهزة للإهداء'),
    tip: T('Ajoute des faits réels : des preuves vraies valent mieux que des promesses.', 'Add real facts: true proof beats promises.', 'أضف حقائق حقيقية: الدليل الصادق أفضل من الوعود.'),
  },
  pr: {
    label: T('Prix', 'Price', 'السعر'),
    ph: T('Ex. : 4 500 DA', 'E.g. 4,500 DZD', 'مثال: 4500 دج'),
    ex: T('4 500 DA', '4,500 DZD', '4500 دج'),
    tip: T('Ajoute le prix : les objections dépendent souvent de lui.', 'Add the price: objections often depend on it.', 'أضف السعر: كثير من الاعتراضات مرتبطة به.'),
  },
  pl: {
    label: T('Lieu et matériel', 'Location and gear', 'المكان والمعدات'),
    ph: T('Ex. : chez moi, un téléphone, une fenêtre, un fond blanc', 'E.g. at home, a phone, a window, a white background', 'مثال: في البيت، هاتف، نافذة، خلفية بيضاء'),
    ex: T('chez moi, un téléphone récent, la lumière d’une fenêtre, une table en bois et un drap blanc', 'at home, a recent phone, window light, a wooden table and a white sheet', 'في البيت، هاتف حديث، ضوء نافذة، طاولة خشبية وقماش أبيض'),
    tip: T('Dis avec quoi tu tournes : les plans seront faisables pour de vrai.', 'Say what you film with: the shots will be truly doable.', 'قل بماذا ستصوّر: ستكون اللقطات قابلة للتنفيذ فعلًا.'),
  },
  ad: {
    label: T('La pub à analyser', 'The ad to analyse', 'الإعلان المراد تحليله'),
    ph: T('Décris-la plan par plan ou colle sa transcription', 'Describe it shot by shot or paste its transcript', 'صِفه لقطة بلقطة أو الصق نصّه'),
    ex: T('0-2 s : une femme sent son poignet et grimace, texte « Ton parfum disparaît à midi ? ». 2-8 s : elle montre un flacon doré, voix : « Celui-là tient du matin au soir ». 8-14 s : plans rapides au bureau, en soirée. 14-18 s : « Commande sur WhatsApp, paiement à la livraison ».', '0-2 s: a woman smells her wrist and grimaces, text “Your perfume gone by noon?”. 2-8 s: she shows a gold bottle, voice: “This one lasts from morning to night”. 8-14 s: quick shots at the office, at a party. 14-18 s: “Order on WhatsApp, cash on delivery”.', '0-2 ث: امرأة تشمّ معصمها وتعبس، نص « عطرك يختفي عند الظهر؟ ». 2-8 ث: تُظهر قارورة ذهبية، صوت: « هذا يدوم من الصباح إلى المساء ». 8-14 ث: لقطات سريعة في المكتب وفي سهرة. 14-18 ث: « اطلب عبر واتساب، الدفع عند الاستلام ».'),
    tip: T('Colle ou décris la pub : l’analyse partira de ce qu’on voit vraiment.', 'Paste or describe the ad: the analysis starts from what we actually see.', 'الصق الإعلان أو صِفه: ينطلق التحليل مما يظهر فعلًا.'),
    area: true,
    tag: 'ad_to_analyze',
  },
  s: {
    label: T('Scène et ambiance', 'Scene and mood', 'المشهد والأجواء'),
    ph: T('Ex. : sur une table en marbre beige, lumière chaude du matin', 'E.g. on a beige marble table, warm morning light', 'مثال: على طاولة رخام بيج، ضوء صباحي دافئ'),
    ex: T('sur une table en marbre beige, quelques fleurs séchées, lumière chaude du matin', 'on a beige marble table with a few dried flowers, warm morning light', 'على طاولة رخام بيج مع بعض الزهور المجففة، ضوء صباحي دافئ'),
    tip: T('Décris la scène : sans elle, l’IA choisit un décor au hasard.', 'Describe the scene: otherwise the AI picks a random setting.', 'صِف المشهد: وإلا اختار الذكاء الاصطناعي ديكورًا عشوائيًا.'),
  },
  t: {
    label: T('Texte exact sur l’image', 'Exact text on the image', 'النص المطلوب على الصورة'),
    ph: T('Facultatif. Ex. : Livraison partout en Algérie', 'Optional. E.g. Delivery across Algeria', 'اختياري. مثال: توصيل لكل الجزائر'),
    ex: T('Livraison partout en Algérie', 'Delivery across Algeria', 'توصيل لكل الجزائر'),
    tip: T('Un texte court et exact s’affiche mieux sur l’image.', 'A short, exact text renders best on the image.', 'النص القصير والدقيق يظهر بشكل أفضل على الصورة.'),
  },
  k: {
    label: T('Ce qu’il faut changer', 'What to change', 'ما يجب تغييره'),
    ph: T('Ex. : remplace le fond par une table en bois clair', 'E.g. replace the background with a light wooden table', 'مثال: استبدل الخلفية بطاولة خشب فاتح'),
    ex: T('remplace le fond gris par une table en bois clair près d’une fenêtre', 'replace the grey background with a light wooden table near a window', 'استبدل الخلفية الرمادية بطاولة خشب فاتح قرب نافذة'),
    tip: T('Dis exactement ce qui change : une seule modification à la fois marche mieux.', 'Say exactly what changes: one edit at a time works best.', 'قل بالضبط ما الذي يتغير: تعديل واحد في كل مرة أفضل.'),
  },
  g: {
    label: T('Ce qui doit rester identique', 'What must stay the same', 'ما يجب أن يبقى كما هو'),
    ph: T('Ex. : le flacon, l’étiquette, le cadrage', 'E.g. the bottle, the label, the framing', 'مثال: القارورة، الملصق، التأطير'),
    ex: T('le flacon, son étiquette, ses couleurs et le cadrage', 'the bottle, its label, its colors and the framing', 'القارورة وملصقها وألوانها والتأطير'),
    tip: T('Dis ce qui ne doit pas bouger : c’est ce qui protège ton produit.', 'Say what must not move: that’s what protects your product.', 'قل ما لا يجب أن يتحرك: هذا ما يحمي منتجك.'),
  },
  a: {
    label: T('Action dans la vidéo', 'Action in the video', 'الحركة في الفيديو'),
    ph: T('Ex. : le flacon tourne lentement, une lumière balaie l’étiquette', 'E.g. the bottle slowly turns, light sweeps the label', 'مثال: القارورة تدور ببطء ويمرّ ضوء على الملصق'),
    ex: T('le flacon tourne lentement sur lui-même pendant qu’une lumière dorée balaie l’étiquette', 'the bottle slowly turns while a golden light sweeps across the label', 'القارورة تدور ببطء بينما يمرّ ضوء ذهبي على الملصق'),
    tip: T('Une seule action claire par vidéo : c’est ce qui évite les déformations.', 'One clear action per video: that’s what avoids distortions.', 'حركة واحدة واضحة لكل فيديو: هذا ما يمنع التشوهات.'),
  },
  d: {
    label: T('Phrase dite à l’écran', 'Spoken line', 'جملة منطوقة'),
    ph: T('Facultatif (Veo). Ex. : This scent stays with you all day.', 'Optional (Veo). E.g. This scent stays with you all day.', 'اختياري (Veo). مثال: This scent stays with you all day.'),
    ex: T('This scent stays with you all day.', 'This scent stays with you all day.', 'This scent stays with you all day.'),
    tip: T('Une phrase courte, entre guillemets, est mieux synchronisée.', 'A short line in quotes syncs best.', 'الجملة القصيرة بين علامتي تنصيص تتزامن بشكل أفضل.'),
  },
  biz: {
    label: T('Commerce', 'Business', 'المحل'),
    ph: T('Ex. : Salon Amina, coiffure à Oran', 'E.g. Salon Amina, hair salon in Oran', 'مثال: صالون أمينة، حلاقة نسائية في وهران'),
    ex: T('« Salon Amina » (exemple), salon de coiffure pour femmes à Oran', '“Salon Amina” (example), a women’s hair salon in Oran', '« صالون أمينة » (مثال)، صالون حلاقة نسائية في وهران'),
    tip: T('Nomme le commerce, son activité et sa ville.', 'Name the business, its trade and its city.', 'اذكر اسم المحل ونشاطه ومدينته.'),
  },
  made: {
    label: T('Ce que tu as préparé', 'What you prepared', 'ما الذي حضّرته'),
    ph: T('Ex. : une démo de site avec réservation WhatsApp', 'E.g. a demo website with WhatsApp booking', 'مثال: نموذج موقع مع حجز عبر واتساب'),
    ex: T('une démo de site avec réservation en 30 secondes sur WhatsApp, et une vidéo de 40 secondes qui la montre', 'a demo website with 30-second WhatsApp booking, and a 40-second video showing it', 'نموذج موقع مع حجز في 30 ثانية عبر واتساب، وفيديو من 40 ثانية يعرضه'),
    tip: T('Dis ce que tu montres : une démo concrète ouvre plus de portes qu’une offre.', 'Say what you’re showing: a concrete demo opens more doors than an offer.', 'قل ما الذي تعرضه: النموذج الملموس يفتح أبوابًا أكثر من العرض.'),
  },
  perso: {
    label: T('Un détail vrai sur ce commerce', 'A true detail about this business', 'تفصيل حقيقي عن هذا المحل'),
    ph: T('Ex. : leurs coiffures de mariée sur Instagram', 'E.g. their bridal hairstyles on Instagram', 'مثال: تسريحات العرائس عندهم على إنستغرام'),
    ex: T('leurs coiffures de mariée très partagées sur Instagram, mais les réservations se font seulement par téléphone', 'their bridal hairstyles are widely shared on Instagram, but bookings only happen by phone', 'تسريحات العرائس عندهم منتشرة على إنستغرام، لكن الحجز يتم بالهاتف فقط'),
    tip: T('Un détail vrai prouve que ton message n’est pas un copier-coller.', 'A true detail proves your message isn’t copy-paste.', 'التفصيل الحقيقي يثبت أن رسالتك ليست منسوخة.'),
  },
  serv: {
    label: T('Ton service', 'Your service', 'خدمتك'),
    ph: T('Ex. : pubs vidéo pour les boutiques en ligne', 'E.g. video ads for online stores', 'مثال: إعلانات فيديو للمتاجر الإلكترونية'),
    ex: T('création de pubs vidéo UGC et d’images produit pour les boutiques en ligne', 'UGC video ads and product images for online stores', 'صناعة إعلانات فيديو UGC وصور منتجات للمتاجر الإلكترونية'),
    tip: T('Décris ton service en une phrase.', 'Describe your service in one sentence.', 'صِف خدمتك في جملة واحدة.'),
  },
  feat: {
    label: T('Fonctionnalité', 'Feature', 'الميزة'),
    ph: T('Ex. : réservation en ligne d’un créneau', 'E.g. online slot booking', 'مثال: حجز موعد عبر الإنترنت'),
    ex: T('réservation en ligne d’un créneau, avec confirmation sur WhatsApp', 'online slot booking, with a WhatsApp confirmation', 'حجز موعد عبر الإنترنت مع تأكيد عبر واتساب'),
    tip: T('Décris la fonctionnalité en une phrase.', 'Describe the feature in one sentence.', 'صِف الميزة في جملة واحدة.'),
  },
  crit: {
    label: T('Ce qui doit marcher', 'What must work', 'ما يجب أن يعمل'),
    ph: T('Une règle par ligne : ce que l’utilisateur doit pouvoir faire, ce qui doit être refusé', 'One rule per line: what the user must be able to do, what must be refused', 'قاعدة في كل سطر: ما يجب أن يستطيع المستخدم فعله، وما يجب رفضه'),
    ex: T('la cliente choisit un service et un créneau libre\nun créneau pris n’est plus proposé\nelle reçoit une confirmation sur WhatsApp\nimpossible de réserver dans le passé', 'the customer picks a service and a free slot\na booked slot is no longer offered\nshe gets a WhatsApp confirmation\nbooking in the past is impossible', 'الزبونة تختار خدمة وموعدًا متاحًا\nالموعد المحجوز لا يُعرض مرة أخرى\nتصلها رسالة تأكيد عبر واتساب\nلا يمكن الحجز في وقت مضى'),
    tip: T('Écris les règles à respecter : elles deviennent les tests.', 'Write the rules to respect: they become the tests.', 'اكتب القواعد الواجب احترامها: ستصبح هي الاختبارات.'),
    area: true,
    tag: 'acceptance_criteria',
  },
  keep: {
    label: T('Ce qui ne doit pas changer', 'What must not change', 'ما يجب ألا يتغير'),
    ph: T('Facultatif. Ex. : le design de la page d’accueil', 'Optional. E.g. the home page design', 'اختياري. مثال: تصميم الصفحة الرئيسية'),
    ex: T('le design de la page d’accueil et les textes existants', 'the home page design and the existing texts', 'تصميم الصفحة الرئيسية والنصوص الحالية'),
    tip: T('Dis ce qu’il ne faut pas toucher : ton agent restera dans son périmètre.', 'Say what not to touch: your agent will stay in scope.', 'قل ما لا يجب لمسه: سيبقى وكيلك في حدود المهمة.'),
  },
  bug: {
    label: T('Ce que tu vois', 'What you see', 'ما تراه'),
    ph: T('Ex. : le bouton Réserver ne fait rien', 'E.g. the Book button does nothing', 'مثال: زر الحجز لا يفعل شيئًا'),
    ex: T('le bouton « Réserver » ne fait rien quand on appuie dessus', 'the “Book” button does nothing when tapped', 'زر « احجز » لا يفعل شيئًا عند الضغط عليه'),
    tip: T('Décris ce que tu vois, précisément.', 'Describe exactly what you see.', 'صِف ما تراه بدقة.'),
  },
  exp: {
    label: T('Ce que tu attendais', 'What you expected', 'ما كنت تتوقعه'),
    ph: T('Ex. : le formulaire de réservation s’ouvre', 'E.g. the booking form opens', 'مثال: تُفتح استمارة الحجز'),
    ex: T('le formulaire de réservation s’ouvre', 'the booking form opens', 'تُفتح استمارة الحجز'),
    tip: T('Dis ce qui aurait dû se passer.', 'Say what should have happened.', 'قل ما كان يجب أن يحدث.'),
  },
  where: {
    label: T('Où et quand', 'Where and when', 'أين ومتى'),
    ph: T('Ex. : page Contact, iPhone, Safari', 'E.g. Contact page, iPhone, Safari', 'مثال: صفحة الاتصال، آيفون، سفاري'),
    ex: T('page Contact, sur iPhone avec Safari ; sur ordinateur ça marche', 'Contact page, on iPhone with Safari; it works on desktop', 'صفحة الاتصال، على آيفون مع سفاري؛ على الحاسوب يعمل'),
    tip: T('Dis où et sur quel appareil : la moitié du diagnostic est là.', 'Say where and on which device: that’s half the diagnosis.', 'قل أين وعلى أي جهاز: هنا نصف التشخيص.'),
  },
  err: {
    label: T('Message d’erreur', 'Error message', 'رسالة الخطأ'),
    ph: T('Facultatif : colle-le exactement', 'Optional: paste it exactly', 'اختياري: الصقها كما هي'),
    ex: T('TypeError: Cannot read properties of null (reading \'addEventListener\')', 'TypeError: Cannot read properties of null (reading \'addEventListener\')', 'TypeError: Cannot read properties of null (reading \'addEventListener\')'),
    tip: T('Le message exact fait gagner beaucoup de temps.', 'The exact message saves a lot of time.', 'الرسالة الدقيقة توفّر الكثير من الوقت.'),
    area: true,
    tag: 'error_message',
  },
  proj: {
    label: T('Le projet', 'The project', 'المشروع'),
    ph: T('Ex. : site de réservation avec Supabase, publié sur Vercel', 'E.g. booking site with Supabase, deployed on Vercel', 'مثال: موقع حجز مع Supabase منشور على Vercel'),
    ex: T('site de réservation pour un salon, avec comptes clientes, Supabase et une Edge Function d’envoi WhatsApp', 'booking site for a salon, with customer accounts, Supabase and a WhatsApp Edge Function', 'موقع حجز لصالون، مع حسابات للزبونات وSupabase ودالة Edge لإرسال واتساب'),
    tip: T('Décris le projet et ses outils.', 'Describe the project and its tools.', 'صِف المشروع وأدواته.'),
  },
  data: {
    label: T('Données gérées', 'Data handled', 'البيانات المُعالجة'),
    ph: T('Ex. : noms et téléphones des clientes', 'E.g. customers’ names and phone numbers', 'مثال: أسماء الزبونات وأرقام هواتفهن'),
    ex: T('noms, téléphones et rendez-vous des clientes', 'customers’ names, phone numbers and appointments', 'أسماء الزبونات وهواتفهن ومواعيدهن'),
    tip: T('Dis quelles données tu protèges : le risque dépend d’elles.', 'Say which data you protect: the risk depends on it.', 'قل ما البيانات التي تحميها: الخطر يعتمد عليها.'),
  },
  mine: {
    label: T('Ton prompt', 'Your prompt', 'البرومبت الخاص بك'),
    ph: T('Colle ici le prompt à améliorer', 'Paste the prompt to improve here', 'الصق هنا البرومبت المراد تحسينه'),
    ex: T('fais moi des idées de pub pour mon parfum', 'give me ad ideas for my perfume', 'أعطني أفكار إعلان لعطري'),
    tip: T('Colle ton prompt : c’est la base du travail.', 'Paste your prompt: it’s the starting point.', 'الصق البرومبت: هو أساس العمل.'),
    area: true,
    tag: 'my_prompt',
  },
  goal: {
    label: T('Ce que tu veux obtenir', 'What you want to get', 'ما تريد الحصول عليه'),
    ph: T('Ex. : 10 hooks en darija pour TikTok', 'E.g. 10 darija hooks for TikTok', 'مثال: 10 هوكات بالدارجة لتيك توك'),
    ex: T('10 hooks de 3 secondes en darija pour une pub TikTok', '10 three-second darija hooks for a TikTok ad', '10 هوكات من 3 ثوانٍ بالدارجة لإعلان تيك توك'),
    tip: T('Dis le résultat attendu : le prompt sera construit pour lui.', 'Say the expected result: the prompt will be built for it.', 'قل النتيجة المنتظرة: سيُبنى البرومبت من أجلها.'),
  },
  pb: {
    label: T('Ce qui ne va pas dans le résultat', 'What’s wrong with the result', 'ما الخطأ في النتيجة'),
    ph: T('Facultatif. Ex. : trop long, pas assez vendeur', 'Optional. E.g. too long, not persuasive enough', 'اختياري. مثال: طويل جدًا، غير مقنع بما يكفي'),
    ex: T('les idées sont trop générales et en français classique, pas en darija', 'the ideas are too generic and in formal French, not darija', 'الأفكار عامة جدًا وبالفرنسية الكلاسيكية، لا بالدارجة'),
    tip: T('Dis ce qui ne va pas : la correction sera ciblée.', 'Say what’s wrong: the fix will be targeted.', 'قل ما الخطأ: سيكون التصحيح دقيقًا.'),
  },
};

/* ------------------------------------------------------------------ */
/* Options : libellé du choix (interface) et texte inséré (prompt)     */
/* ------------------------------------------------------------------ */

const num = (values) => Object.fromEntries(values.map((v) => [v, { name: T(String(v), String(v), String(v)), say: T(String(v), String(v), String(v)) }]));

export const OPTS = {
  n: { label: T('Combien', 'How many', 'كم'), values: num([5, 10, 20]) },
  na: { label: T('Combien d’angles', 'How many angles', 'كم زاوية'), values: num([3, 5, 7]) },
  nv: { label: T('Versions', 'Versions', 'النسخ'), values: num([3, 5]) },
  shots: { label: T('Plans', 'Shots', 'اللقطات'), values: num([4, 5, 6]) },
  dur: { label: T('Durée (secondes)', 'Length (seconds)', 'المدة (ثوانٍ)'), values: num([15, 30, 45]) },
  vdur: { label: T('Durée (secondes)', 'Length (seconds)', 'المدة (ثوانٍ)'), values: num([5, 8, 10]) },
  lang: {
    label: T('Langue du résultat', 'Output language', 'لغة النتيجة'),
    values: {
      dz: { name: T('Darija', 'Darija', 'الدارجة'), say: T('en darija algérienne naturelle, écrite en lettres arabes (les mots français courants restent en français, comme on parle vraiment)', 'in natural Algerian darija written in Arabic script (common French words stay in French, the way people really speak)', 'بالدارجة الجزائرية الطبيعية مكتوبة بالحروف العربية (الكلمات الفرنسية الشائعة تبقى بالفرنسية كما نتكلم فعلًا)') },
      dzl: { name: T('Darija (lettres latines)', 'Darija (Latin letters)', 'الدارجة (حروف لاتينية)'), say: T('en darija algérienne écrite en lettres latines, comme sur les réseaux (« bezzaf », « 3andek »)', 'in Algerian darija written in Latin letters, as on social media (“bezzaf”, “3andek”)', 'بالدارجة الجزائرية مكتوبة بالحروف اللاتينية كما في مواقع التواصل (« bezzaf »، « 3andek »)') },
      fr: { name: T('Français', 'French', 'الفرنسية'), say: T('en français simple et naturel', 'in simple, natural French', 'بالفرنسية البسيطة والطبيعية') },
      ar: { name: T('Arabe', 'Arabic', 'العربية'), say: T('en arabe standard simple', 'in simple Modern Standard Arabic', 'بالعربية الفصحى البسيطة') },
      en: { name: T('Anglais', 'English', 'الإنجليزية'), say: T('en anglais simple et naturel', 'in simple, natural English', 'بالإنجليزية البسيطة والطبيعية') },
    },
  },
  plat: {
    label: T('Plateforme', 'Platform', 'المنصة'),
    values: {
      reels: { name: T('Reels', 'Reels', 'ريلز'), say: T('Instagram et Facebook (Reels)', 'Instagram and Facebook (Reels)', 'إنستغرام وفيسبوك (Reels)') },
      tiktok: { name: T('TikTok', 'TikTok', 'تيك توك'), say: T('TikTok', 'TikTok', 'تيك توك') },
      shorts: { name: T('Shorts', 'Shorts', 'شورتس'), say: T('YouTube Shorts', 'YouTube Shorts', 'يوتيوب شورتس') },
    },
  },
  tone: {
    label: T('Ton', 'Tone', 'النبرة'),
    values: {
      energie: { name: T('Énergique', 'Energetic', 'حماسية'), say: T('énergique', 'energetic', 'حماسية') },
      chaleur: { name: T('Chaleureux', 'Warm', 'دافئة'), say: T('chaleureux et proche', 'warm and friendly', 'دافئة وقريبة') },
      premium: { name: T('Premium', 'Premium', 'راقية'), say: T('premium et posé', 'premium and calm', 'راقية وهادئة') },
      humour: { name: T('Humour', 'Humour', 'فكاهية'), say: T('drôle mais crédible', 'funny but credible', 'فكاهية لكن موثوقة') },
      direct: { name: T('Direct', 'Direct', 'مباشرة'), say: T('direct et sans détour', 'direct and to the point', 'مباشرة ودون مراوغة') },
    },
  },
  fmt: {
    label: T('Format de pub', 'Ad format', 'شكل الإعلان'),
    values: {
      ugc: { name: T('Face caméra (UGC)', 'Talking head (UGC)', 'أمام الكاميرا (UGC)'), say: T('UGC face caméra (une personne qui parle à la caméra comme à une amie)', 'UGC talking head (a person speaking to camera like to a friend)', 'UGC أمام الكاميرا (شخص يتكلم مع الكاميرا كأنه يكلّم صديقًا)') },
      demo: { name: T('Démonstration', 'Demonstration', 'عرض المنتج'), say: T('démonstration du produit en action', 'product demonstration in action', 'عرض المنتج وهو يُستعمل') },
      ba: { name: T('Avant / après', 'Before / after', 'قبل / بعد'), say: T('avant / après honnête', 'honest before / after', 'قبل / بعد بصدق') },
      unbox: { name: T('Déballage', 'Unboxing', 'فتح العلبة'), say: T('déballage (unboxing)', 'unboxing', 'فتح العلبة (unboxing)') },
    },
  },
  ratio: {
    label: T('Format', 'Format', 'المقاس'),
    values: {
      '4:5': { name: T('4:5 fil', '4:5 feed', '4:5 منشور'), say: T('4:5', '4:5', '4:5') },
      '1:1': { name: T('1:1 carré', '1:1 square', '1:1 مربع'), say: T('1:1', '1:1', '1:1') },
      '9:16': { name: T('9:16 story', '9:16 story', '9:16 ستوري'), say: T('9:16', '9:16', '9:16') },
      '16:9': { name: T('16:9 large', '16:9 wide', '16:9 عريض'), say: T('16:9', '16:9', '16:9') },
    },
  },
  vratio: {
    label: T('Format', 'Format', 'المقاس'),
    values: {
      '9:16': { name: T('9:16 vertical', '9:16 vertical', '9:16 عمودي'), say: T('9:16', '9:16', '9:16') },
      '1:1': { name: T('1:1 carré', '1:1 square', '1:1 مربع'), say: T('1:1', '1:1', '1:1') },
      '16:9': { name: T('16:9 large', '16:9 wide', '16:9 عريض'), say: T('16:9', '16:9', '16:9') },
    },
  },
  style: {
    label: T('Style', 'Style', 'الأسلوب'),
    values: {
      studio: { name: T('Studio premium', 'Premium studio', 'استوديو راقٍ'), say: T('studio', 'studio', 'studio') },
      life: { name: T('Mise en situation', 'Lifestyle', 'في الاستعمال'), say: T('lifestyle', 'lifestyle', 'lifestyle') },
      ugc: { name: T('Photo de téléphone', 'Phone photo', 'صورة هاتف'), say: T('ugc', 'ugc', 'ugc') },
      flat: { name: T('Vue de dessus', 'Flat lay', 'من الأعلى'), say: T('flat', 'flat', 'flat') },
    },
  },
  itool: {
    label: T('Outil', 'Tool', 'الأداة'),
    values: {
      gemini: { name: T('Nano Banana (Gemini)', 'Nano Banana (Gemini)', 'Nano Banana (Gemini)'), say: T('Nano Banana', 'Nano Banana', 'Nano Banana') },
      chatgpt: { name: T('ChatGPT Images', 'ChatGPT Images', 'ChatGPT Images'), say: T('ChatGPT', 'ChatGPT', 'ChatGPT') },
      higgsfield: { name: T('Higgsfield', 'Higgsfield', 'Higgsfield'), say: T('Higgsfield', 'Higgsfield', 'Higgsfield') },
    },
  },
  vtool: {
    label: T('Outil', 'Tool', 'الأداة'),
    values: {
      veo: { name: T('Veo 3.1', 'Veo 3.1', 'Veo 3.1'), say: T('Veo 3.1', 'Veo 3.1', 'Veo 3.1') },
      kling: { name: T('Kling', 'Kling', 'Kling'), say: T('Kling', 'Kling', 'Kling') },
      higgsfield: { name: T('Higgsfield', 'Higgsfield', 'Higgsfield'), say: T('Higgsfield', 'Higgsfield', 'Higgsfield') },
    },
  },
  cam: {
    label: T('Mouvement de caméra', 'Camera move', 'حركة الكاميرا'),
    values: {
      push: { name: T('Avance lente', 'Slow push-in', 'اقتراب بطيء'), say: T('push', 'push', 'push') },
      orbit: { name: T('Tour du produit', 'Orbit', 'دوران حول المنتج'), say: T('orbit', 'orbit', 'orbit') },
      hand: { name: T('À la main (UGC)', 'Handheld (UGC)', 'باليد (UGC)'), say: T('hand', 'hand', 'hand') },
      reveal: { name: T('Révélation', 'Reveal', 'كشف'), say: T('reveal', 'reveal', 'reveal') },
      static: { name: T('Plan fixe', 'Static', 'ثابتة'), say: T('static', 'static', 'static') },
    },
  },
  audio: {
    label: T('Son (Veo)', 'Sound (Veo)', 'الصوت (Veo)'),
    values: {
      amb: { name: T('Ambiance', 'Ambience', 'أجواء'), say: T('amb', 'amb', 'amb') },
      music: { name: T('Musique', 'Music', 'موسيقى'), say: T('music', 'music', 'music') },
      none: { name: T('Silence', 'Silence', 'صمت'), say: T('none', 'none', 'none') },
    },
  },
  ref: {
    label: T('Photo du produit', 'Product photo', 'صورة المنتج'),
    values: {
      yes: { name: T('Je la joins', 'I attach it', 'أرفقها'), say: T('yes', 'yes', 'yes') },
      no: { name: T('Pas de photo', 'No photo', 'بدون صورة'), say: T('no', 'no', 'no') },
    },
  },
  vstyle: {
    label: T('Voix', 'Voice', 'الصوت'),
    values: {
      chaleur: { name: T('Chaleureuse', 'Warm', 'دافئ'), say: T('chaleureuse', 'warm', 'دافئ') },
      energie: { name: T('Énergique', 'Energetic', 'حماسي'), say: T('énergique', 'energetic', 'حماسي') },
      calme: { name: T('Calme et premium', 'Calm, premium', 'هادئ وراقٍ'), say: T('calme et premium', 'calm and premium', 'هادئ وراقٍ') },
    },
  },
  agent: {
    label: T('Ton agent', 'Your agent', 'وكيلك'),
    values: {
      claude: { name: T('Claude Code', 'Claude Code', 'Claude Code'), say: T('Claude Code', 'Claude Code', 'Claude Code') },
      codex: { name: T('Codex', 'Codex', 'Codex'), say: T('Codex', 'Codex', 'Codex') },
      lovable: { name: T('Lovable / Bolt', 'Lovable / Bolt', 'Lovable / Bolt'), say: T('Lovable', 'Lovable', 'Lovable') },
    },
  },
  pages: {
    label: T('Pages', 'Pages', 'الصفحات'),
    values: {
      one: { name: T('Une page', 'One page', 'صفحة واحدة'), say: T('une seule page qui défile', 'a single scrolling page', 'صفحة واحدة تُمرَّر') },
      multi: { name: T('Plusieurs pages', 'Several pages', 'عدة صفحات'), say: T('plusieurs pages (accueil, services, contact)', 'several pages (home, services, contact)', 'عدة صفحات (الرئيسية، الخدمات، الاتصال)') },
    },
  },
  look: {
    label: T('Style', 'Style', 'الأسلوب'),
    values: {
      premium: { name: T('Premium', 'Premium', 'راقٍ'), say: T('premium et épuré', 'premium and clean', 'راقٍ وبسيط') },
      sobre: { name: T('Sobre', 'Minimal', 'بسيط'), say: T('sobre et très lisible', 'minimal and very readable', 'بسيط وسهل القراءة') },
      colore: { name: T('Coloré', 'Colourful', 'ملوّن'), say: T('coloré et chaleureux', 'colourful and warm', 'ملوّن ودافئ') },
    },
  },
  channel: {
    label: T('Canal', 'Channel', 'القناة'),
    values: {
      whatsapp: { name: T('WhatsApp', 'WhatsApp', 'واتساب'), say: T('WhatsApp', 'WhatsApp', 'واتساب') },
      insta: { name: T('Instagram', 'Instagram', 'إنستغرام'), say: T('en message privé Instagram', 'Instagram direct message', 'رسالة خاصة على إنستغرام') },
      email: { name: T('E-mail', 'Email', 'بريد إلكتروني'), say: T('par e-mail', 'email', 'بالبريد الإلكتروني') },
    },
  },
  stage: {
    label: T('Moment', 'Stage', 'المرحلة'),
    values: {
      first: { name: T('Premier message', 'First message', 'أول رسالة'), say: T('first', 'first', 'first') },
      relance: { name: T('Relance', 'Follow-up', 'متابعة'), say: T('relance', 'relance', 'relance') },
      prix: { name: T('« C’est combien ? »', '“How much?”', '« بكم؟ »'), say: T('prix', 'prix', 'prix') },
    },
  },
  level: {
    label: T('Niveau', 'Level', 'المستوى'),
    values: {
      full: { name: T('Réécriture complète', 'Full rewrite', 'إعادة كتابة كاملة'), say: T('full', 'full', 'full') },
      min: { name: T('Retouches minimales', 'Minimal edits', 'تعديلات بسيطة'), say: T('min', 'min', 'min') },
    },
  },
  ai: {
    label: T('Pour quel outil', 'For which tool', 'لأي أداة'),
    values: {
      chat: { name: T('ChatGPT, Claude, Gemini', 'ChatGPT, Claude, Gemini', 'ChatGPT وClaude وGemini'), say: T('un assistant comme ChatGPT, Claude ou Gemini', 'an assistant such as ChatGPT, Claude or Gemini', 'مساعد مثل ChatGPT أو Claude أو Gemini') },
      image: { name: T('Image', 'Image', 'صورة'), say: T('un générateur d’images (Nano Banana, ChatGPT Images)', 'an image generator (Nano Banana, ChatGPT Images)', 'مولّد صور (Nano Banana، ChatGPT Images)') },
      video: { name: T('Vidéo', 'Video', 'فيديو'), say: T('un générateur de vidéos (Veo, Kling)', 'a video generator (Veo, Kling)', 'مولّد فيديوهات (Veo، Kling)') },
      code: { name: T('Claude Code, Codex', 'Claude Code, Codex', 'Claude Code وCodex'), say: T('un agent de code comme Claude Code ou Codex', 'a coding agent such as Claude Code or Codex', 'وكيل برمجة مثل Claude Code أو Codex') },
    },
  },
};

/* ------------------------------------------------------------------ */
/* Phrases communes                                                    */
/* ------------------------------------------------------------------ */

const SH = {
  honest: T(
    'N’utilise que les informations que je te donne : aucun avis, chiffre ou promesse inventé, pour que la pub reste crédible et respecte les règles des plateformes.',
    'Use only the information I give you: no invented reviews, numbers or promises, so the ad stays credible and complies with platform rules.',
    'استعمل فقط المعلومات التي أعطيك إياها: لا آراء ولا أرقام ولا وعود مخترعة، حتى يبقى الإعلان موثوقًا ويحترم قواعد المنصات.',
  ),
  ask: T(
    'Avant de commencer, pose-moi jusqu’à 3 questions précises sur ce qui te manque vraiment, puis attends mes réponses.',
    'Before you start, ask me up to 3 precise questions about what you really need, then wait for my answers.',
    'قبل أن تبدأ، اطرح عليّ حتى 3 أسئلة دقيقة حول ما ينقصك فعلًا، ثم انتظر أجوبتي.',
  ),
  assume: T(
    'S’il manque une information, choisis l’hypothèse la plus simple et annonce-la en une ligne au début de ta réponse.',
    'If some information is missing, pick the simplest assumption and state it in one line at the start of your answer.',
    'إذا نقصت معلومة، اختر الفرضية الأبسط وأعلنها في سطر واحد في بداية إجابتك.',
  ),
  checkIntro: T(
    'Avant de répondre, relis ton travail avec ces critères et réécris ce qui ne les respecte pas :',
    'Before answering, review your work against these criteria and rewrite whatever fails them:',
    'قبل أن تجيب، راجع عملك وفق هذه المعايير وأعد كتابة ما لا يحترمها:',
  ),
  score: T(
    'Note chaque proposition sur 10 avec ces critères, garde seulement celles à 8 ou plus et remplace les autres.',
    'Score each proposal out of 10 on these criteria, keep only those at 8 or above and replace the others.',
    'قيّم كل اقتراح من 10 وفق هذه المعايير، واحتفظ فقط بما حصل على 8 أو أكثر واستبدل الباقي.',
  ),
  recommend: T(
    'Termine par ta recommandation : la meilleure proposition et pourquoi, en une phrase.',
    'End with your recommendation: the best proposal and why, in one sentence.',
    'اختم بتوصيتك: أفضل اقتراح ولماذا، في جملة واحدة.',
  ),
  direct: T('Va droit au but : pas d’introduction ni de conclusion inutile.', 'Get straight to the point: no unnecessary intro or conclusion.', 'ادخل في الموضوع مباشرة: لا مقدمة ولا خاتمة غير ضرورية.'),
  exIntro: T('Exemples du niveau attendu (inspire-toi du niveau, ne les copie pas) :', 'Examples of the expected level (match the level, don’t copy them):', 'أمثلة على المستوى المنتظر (استلهم المستوى ولا تنسخها):'),
  scope: T('Fais exactement ce qui est demandé ; propose les idées en plus à part, comme options.', 'Do exactly what is asked; offer extra ideas separately, as options.', 'نفّذ بالضبط ما هو مطلوب؛ واقترح الأفكار الإضافية على حدة كخيارات.'),
};

/** Titres des sections (mode rapide) et balises (mode expert). */
export const SECTIONS = {
  context: { label: T('Contexte', 'Context', 'السياق'), tag: 'context' },
  brand: { label: T('Ma marque', 'My brand', 'علامتي'), tag: 'brand' },
  task: { label: T('Tâche', 'Task', 'المهمة'), tag: 'task' },
  method: { label: T('Méthode', 'Method', 'الطريقة'), tag: 'method' },
  rules: { label: T('Règles', 'Rules', 'القواعد'), tag: 'rules' },
  examples: { label: T('Exemples', 'Examples', 'أمثلة'), tag: 'examples' },
  format: { label: T('Format de réponse', 'Response format', 'شكل الإجابة'), tag: 'output_format' },
  check: { label: T('Vérification', 'Self-check', 'التحقق'), tag: 'quality_check' },
  missing: { label: T('Si une info manque', 'If information is missing', 'إذا نقصت معلومة'), tag: 'missing_info' },
};

/* ------------------------------------------------------------------ */
/* Les modèles                                                         */
/* ------------------------------------------------------------------ */

export const TEMPLATES = [
  /* ============================== Créative ============================== */
  {
    id: 'hooks',
    g: 'creative',
    icon: 'hook',
    title: T('Hooks qui arrêtent le scroll', 'Scroll-stopping hooks', 'هوكات توقف التمرير'),
    sub: T('Les 3 premières secondes, par familles de hooks.', 'The first 3 seconds, by hook family.', 'الثواني الثلاث الأولى، حسب عائلات الهوك.'),
    tools: ['chatgpt', 'claude', 'gemini'],
    fields: ['p', 'c', 'b', 'x'],
    req: ['p', 'c', 'b'],
    opts: ['n', 'lang', 'plat', 'tone'],
    def: { n: 10, lang: 'dz', plat: 'reels', tone: 'energie' },
    next: ['script', 'texte'],
    role: T(
      'Tu es concepteur-rédacteur senior, spécialiste des publicités vidéo courtes qui arrêtent le scroll sur le marché algérien.',
      'You are a senior copywriter specialised in short video ads that stop the scroll in the Algerian market.',
      'أنت كاتب إعلانات محترف، متخصص في إعلانات الفيديو القصيرة التي توقف التمرير في السوق الجزائري.',
    ),
    task: T(
      'Écris {n} hooks de 3 secondes maximum pour une publicité verticale sur {plat}, {lang}, avec un ton {tone}.',
      'Write {n} hooks of 3 seconds maximum for a vertical ad on {plat}, {lang}, with a {tone} tone.',
      'اكتب {n} هوكات لا تتجاوز 3 ثوانٍ لإعلان عمودي على {plat}، {lang}، بنبرة {tone}.',
    ),
    method: T(
      'Avant d’écrire, repère pour toi les 3 désirs et les 3 peurs les plus forts de la cible face à ce produit. Puis répartis les hooks entre 5 familles : question qui pique, avant/après honnête, démonstration immédiate, interpellation directe de la cible, mini-histoire personnelle.',
      'Before writing, identify for yourself the target’s 3 strongest desires and 3 strongest fears about this product. Then spread the hooks across 5 families: pointed question, honest before/after, instant demonstration, direct call-out to the target, short personal story.',
      'قبل الكتابة، حدّد لنفسك أقوى 3 رغبات وأقوى 3 مخاوف لدى الجمهور تجاه هذا المنتج. ثم وزّع الهوكات على 5 عائلات: سؤال يلمس المشكلة، قبل/بعد صادق، عرض فوري، نداء مباشر للجمهور، قصة شخصية قصيرة.',
    ),
    rules: [
      T('Chaque hook se comprend en moins d’une seconde, même sans le son : c’est le temps qu’on t’accorde avant de faire défiler.', 'Each hook is understood in under a second, even without sound: that’s all the time you get before people scroll.', 'كل هوك يُفهم في أقل من ثانية حتى دون صوت: هذا كل الوقت المتاح قبل أن يمرّر الناس.'),
      T('Un seul message par hook, avec les mots que la cible emploie vraiment.', 'One message per hook, in the words the target really uses.', 'رسالة واحدة لكل هوك، بالكلمات التي يستعملها الجمهور فعلًا.'),
      T('Le produit ou le problème apparaît dès la première image, pour attirer les bonnes personnes et pas seulement les curieux.', 'The product or the problem appears in the very first frame, to attract the right people, not just the curious.', 'يظهر المنتج أو المشكلة من الصورة الأولى، لجذب الأشخاص المناسبين لا الفضوليين فقط.'),
    ],
    honest: true,
    examples: T(
      '- Question qui pique : « Ton parfum a disparu avant midi ? » — première image : un poignet qu’on sent, avec une moue déçue.\n- Démonstration : « Je l’ai mis à 8 h, regarde à 18 h. » — première image : une montre qui affiche 18:00 à côté du flacon.\n- Interpellation : « Les hommes qui ne savent jamais quoi offrir, restez 5 secondes. » — première image : un homme hésitant devant une vitrine.',
      '- Pointed question: “Your perfume gone before noon?” — first frame: someone smelling a wrist, disappointed.\n- Demonstration: “I put it on at 8 am, look at 6 pm.” — first frame: a watch showing 18:00 next to the bottle.\n- Call-out: “Guys who never know what to give, stay 5 seconds.” — first frame: a man hesitating in front of a shop window.',
      '- سؤال يلمس المشكلة: « عطرك اختفى قبل الظهر؟ » — الصورة الأولى: شخص يشمّ معصمه بخيبة.\n- عرض: « وضعته على الثامنة صباحًا، انظر على السادسة مساءً. » — الصورة الأولى: ساعة تُظهر 18:00 بجانب القارورة.\n- نداء مباشر: « الرجال الذين لا يعرفون أبدًا ماذا يهدون، ابقوا 5 ثوانٍ. » — الصورة الأولى: رجل متردد أمام واجهة محل.',
    ),
    format: T(
      'Un tableau : n°, famille, hook (ce qu’on entend), texte à l’écran (6 mots au plus), première image (ce qu’on voit).',
      'A table: no., family, hook (what we hear), on-screen text (6 words max), first frame (what we see).',
      'جدول: الرقم، العائلة، الهوك (ما نسمعه)، النص على الشاشة (6 كلمات كحد أقصى)، الصورة الأولى (ما نراه).',
    ),
    direct: true,
    check: [
      T('arrêt du scroll en moins d’une seconde', 'stops the scroll in under a second', 'يوقف التمرير في أقل من ثانية'),
      T('clarté du message', 'clarity of the message', 'وضوح الرسالة'),
      T('crédibilité (rien d’exagéré)', 'credibility (nothing exaggerated)', 'المصداقية (لا مبالغة)'),
      T('lien direct avec le produit et la cible', 'direct link to the product and the target', 'ارتباط مباشر بالمنتج والجمهور'),
    ],
    score: true,
    recommend: true,
  },
  {
    id: 'angles',
    g: 'creative',
    icon: 'target',
    title: T('Angles et objections', 'Angles and objections', 'الزوايا والاعتراضات'),
    sub: T('Ce qui fait acheter ta cible, avant d’écrire la pub.', 'What makes your audience buy, before writing the ad.', 'ما الذي يجعل جمهورك يشتري، قبل كتابة الإعلان.'),
    tools: ['chatgpt', 'claude', 'gemini'],
    fields: ['p', 'c', 'b', 'pr', 'x'],
    req: ['p', 'c', 'b'],
    opts: ['na'],
    def: { na: 5 },
    next: ['hooks', 'script'],
    role: T(
      'Tu es stratège marketing, spécialiste de la vente en ligne en Algérie (paiement à la livraison, commandes sur WhatsApp et Messenger).',
      'You are a marketing strategist specialised in online selling in Algeria (cash on delivery, orders via WhatsApp and Messenger).',
      'أنت خبير استراتيجيات تسويق، متخصص في البيع عبر الإنترنت في الجزائر (الدفع عند الاستلام، الطلبات عبر واتساب وماسنجر).',
    ),
    task: T(
      'Trouve {na} angles de vente différents pour ce produit, puis les objections qui empêchent la cible d’acheter.',
      'Find {na} different selling angles for this product, then the objections that stop the target from buying.',
      'جد {na} زوايا بيع مختلفة لهذا المنتج، ثم الاعتراضات التي تمنع الجمهور من الشراء.',
    ),
    method: T(
      'Pense d’abord comme la cible : ses désirs, ses peurs, ce qu’elle a déjà essayé, ce qu’elle dit à ses proches. Puis construis chaque angle sur une seule motivation.',
      'First think like the target: their desires, fears, what they’ve already tried, what they say to their friends. Then build each angle on a single motivation.',
      'فكّر أولًا مثل الجمهور: رغباته ومخاوفه وما جرّبه من قبل وما يقوله لأقاربه. ثم ابنِ كل زاوية على دافع واحد.',
    ),
    rules: [
      T('Chaque angle repose sur une motivation différente (gain, peur de manquer, identité, comparaison, simplicité…), pour pouvoir les tester les uns contre les autres.', 'Each angle rests on a different motivation (gain, fear of missing out, identity, comparison, simplicity…), so they can be tested against each other.', 'كل زاوية تقوم على دافع مختلف (مكسب، خوف من الفوات، هوية، مقارنة، بساطة…) حتى نستطيع اختبارها ضد بعضها.'),
      T('Les objections sont écrites avec les mots de la cible (« c’est sûrement une arnaque », « trop cher », « ça ne marchera pas sur moi »).', 'Objections are written in the target’s own words (“it’s surely a scam”, “too expensive”, “it won’t work for me”).', 'تُكتب الاعتراضات بكلمات الجمهور نفسه (« أكيد احتيال »، « غالٍ جدًا »، « لن ينفع معي »).'),
    ],
    honest: true,
    format: T(
      'Pour chaque angle : nom, motivation, promesse en une phrase, un exemple de hook, la preuve qu’il faudrait montrer. Puis un tableau des 5 objections principales avec la réponse à donner dans la pub.',
      'For each angle: name, motivation, one-sentence promise, a sample hook, the proof to show. Then a table of the top 5 objections with the answer to give in the ad.',
      'لكل زاوية: الاسم، الدافع، الوعد في جملة، مثال هوك، الدليل الذي يجب إظهاره. ثم جدول بأهم 5 اعتراضات مع الرد الذي نقدّمه في الإعلان.',
    ),
    direct: true,
    check: [
      T('chaque angle est vraiment différent des autres', 'each angle is truly different from the others', 'كل زاوية مختلفة فعلًا عن الأخرى'),
      T('chaque réponse s’appuie sur un fait réel du produit', 'each answer relies on a real fact about the product', 'كل رد يستند إلى حقيقة فعلية عن المنتج'),
      T('rien n’est exagéré', 'nothing is exaggerated', 'لا مبالغة'),
    ],
    recommend: true,
  },
  {
    id: 'script',
    g: 'creative',
    icon: 'film',
    title: T('Script de pub plan par plan', 'Shot-by-shot ad script', 'سيناريو إعلان لقطة بلقطة'),
    sub: T('Hook, problème, solution, preuve, appel à l’action.', 'Hook, problem, solution, proof, call to action.', 'هوك، مشكلة، حل، دليل، دعوة إلى الفعل.'),
    tools: ['chatgpt', 'claude', 'gemini'],
    fields: ['p', 'c', 'b', 'o', 'x'],
    req: ['p', 'c', 'b', 'o'],
    opts: ['dur', 'fmt', 'lang', 'plat', 'tone'],
    def: { dur: 30, fmt: 'ugc', lang: 'dz', plat: 'reels', tone: 'chaleur' },
    next: ['tournage', 'voix', 'texte'],
    role: T(
      'Tu es scénariste de publicités vidéo UGC qui vendent, sur TikTok, Instagram et Facebook en Algérie.',
      'You are a scriptwriter of UGC video ads that sell, on TikTok, Instagram and Facebook in Algeria.',
      'أنت كاتب سيناريو لإعلانات فيديو UGC تبيع، على تيك توك وإنستغرام وفيسبوك في الجزائر.',
    ),
    task: T(
      'Écris le script d’une publicité verticale de {dur} secondes, format {fmt}, pour {plat}, {lang}, avec un ton {tone}.',
      'Write the script of a {dur}-second vertical ad, {fmt} format, for {plat}, {lang}, with a {tone} tone.',
      'اكتب سيناريو إعلان عمودي مدته {dur} ثانية، بصيغة {fmt}، لـ {plat}، {lang}، بنبرة {tone}.',
    ),
    method: T(
      'Structure : hook (0 à 3 s), problème vécu, solution (le produit en action), preuve concrète, appel à l’action unique. Change de plan toutes les 2 à 3 secondes pour garder l’attention.',
      'Structure: hook (0 to 3 s), lived problem, solution (the product in action), concrete proof, a single call to action. Change shot every 2 to 3 seconds to hold attention.',
      'الهيكل: الهوك (من 0 إلى 3 ث)، المشكلة المعاشة، الحل (المنتج وهو يعمل)، دليل ملموس، دعوة واحدة إلى الفعل. غيّر اللقطة كل 2 إلى 3 ثوانٍ للحفاظ على الانتباه.',
    ),
    rules: [
      T('Le hook arrive dans les 2 premières secondes et montre le produit ou le problème.', 'The hook lands in the first 2 seconds and shows the product or the problem.', 'يأتي الهوك في أول ثانيتين ويُظهر المنتج أو المشكلة.'),
      T('La voix off fait environ {w} mots en tout (2,5 mots par seconde), pour tenir vraiment en {dur} secondes.', 'The voice-over is about {w} words in total (2.5 words per second), to really fit in {dur} seconds.', 'يكون التعليق الصوتي حوالي {w} كلمة إجمالًا (2.5 كلمة في الثانية) ليتسع فعلًا في {dur} ثانية.'),
      T('Un seul appel à l’action, à la fin, qui reprend l’offre.', 'A single call to action, at the end, restating the offer.', 'دعوة واحدة إلى الفعل في النهاية، تعيد ذكر العرض.'),
      T('Le texte à l’écran reprend l’idée clé en peu de mots : beaucoup regardent sans le son.', 'On-screen text repeats the key idea in a few words: many people watch without sound.', 'يعيد النص على الشاشة الفكرة الأساسية بكلمات قليلة: كثيرون يشاهدون دون صوت.'),
    ],
    honest: true,
    format: T(
      'Un tableau : temps (ex. 0-3 s), ce qu’on voit, voix off, texte à l’écran, son ou musique. Puis 2 hooks de remplacement pour un test A/B, et la légende de la publication en 2 lignes.',
      'A table: timing (e.g. 0-3 s), what we see, voice-over, on-screen text, sound or music. Then 2 alternative hooks for an A/B test, and a 2-line post caption.',
      'جدول: التوقيت (مثلًا 0-3 ث)، ما نراه، التعليق الصوتي، النص على الشاشة، الصوت أو الموسيقى. ثم هوكان بديلان لاختبار A/B، ونص المنشور في سطرين.',
    ),
    direct: true,
    check: [
      T('le script se lit à voix haute en {dur} secondes', 'the script reads aloud in {dur} seconds', 'يُقرأ السيناريو بصوت عالٍ في {dur} ثانية'),
      T('le produit est visible avant 3 secondes', 'the product is visible before 3 seconds', 'المنتج ظاهر قبل 3 ثوانٍ'),
      T('un seul appel à l’action', 'a single call to action', 'دعوة واحدة إلى الفعل'),
      T('chaque plan donne une raison de rester', 'each shot gives a reason to keep watching', 'كل لقطة تعطي سببًا للبقاء'),
    ],
  },
  {
    id: 'tournage',
    g: 'creative',
    icon: 'camera',
    title: T('Plan de tournage au téléphone', 'Phone shot list', 'خطة التصوير بالهاتف'),
    sub: T('La liste des plans à filmer, prête pour ton tournage.', 'The list of shots to film, ready for your shoot.', 'قائمة اللقطات الواجب تصويرها، جاهزة للتصوير.'),
    tools: ['chatgpt', 'claude', 'gemini'],
    fields: ['p', 'pl', 'b'],
    req: ['p', 'pl'],
    opts: ['fmt', 'dur'],
    def: { fmt: 'demo', dur: 30 },
    next: ['voix'],
    role: T(
      'Tu es réalisateur de publicités tournées au smartphone, spécialiste du contenu UGC qui fait vrai.',
      'You are a director of smartphone-shot ads, specialised in UGC content that feels real.',
      'أنت مخرج إعلانات مصوّرة بالهاتف، متخصص في محتوى UGC الذي يبدو حقيقيًا.',
    ),
    task: T(
      'Prépare le plan de tournage d’une publicité {fmt} de {dur} secondes pour ce produit, à filmer avec un téléphone.',
      'Prepare the shot list of a {dur}-second {fmt} ad for this product, to be filmed with a phone.',
      'حضّر خطة تصوير إعلان بصيغة {fmt} مدته {dur} ثانية لهذا المنتج، يُصوَّر بالهاتف.',
    ),
    rules: [
      T('Chaque plan dure 1 à 3 secondes et a une seule action claire : le montage restera dynamique.', 'Each shot lasts 1 to 3 seconds with a single clear action: the edit stays dynamic.', 'كل لقطة تدوم من 1 إلى 3 ثوانٍ بحركة واحدة واضحة: يبقى المونتاج حيويًا.'),
      T('Tout se fait avec le matériel indiqué, sans équipement professionnel : la lumière d’une fenêtre ou une lampe suffit.', 'Everything is done with the gear listed, no professional equipment: a window or a lamp is enough light.', 'يُنجز كل شيء بالمعدات المذكورة دون معدات احترافية: ضوء نافذة أو مصباح يكفي.'),
      T('Prévois des plans de coupe (gros plans de texture, de détail, d’utilisation) pour couvrir la voix off.', 'Plan cutaways (close-ups of texture, details, use) to cover the voice-over.', 'خطّط للقطات قطع (لقطات قريبة للملمس والتفاصيل والاستعمال) لتغطية التعليق الصوتي.'),
      T('Filme en vertical 9:16 en gardant le sujet au centre : les bords sont cachés par l’interface de l’application.', 'Film vertical 9:16 with the subject centred: the edges are hidden by the app interface.', 'صوّر عموديًا 9:16 مع إبقاء الموضوع في الوسط: الأطراف تخفيها واجهة التطبيق.'),
    ],
    format: T(
      'Une liste numérotée de 8 à 12 plans : cadre (gros plan, plan moyen…), angle, mouvement, ce qu’on voit, durée, astuce lumière. Puis une check-list du matériel et une check-list avant de filmer.',
      'A numbered list of 8 to 12 shots: framing (close-up, medium shot…), angle, movement, what we see, duration, lighting tip. Then a gear checklist and a pre-shoot checklist.',
      'قائمة مرقّمة من 8 إلى 12 لقطة: الإطار (لقطة قريبة، متوسطة…)، الزاوية، الحركة، ما نراه، المدة، نصيحة إضاءة. ثم قائمة تحقق للمعدات وقائمة تحقق قبل التصوير.',
    ),
    direct: true,
    check: [
      T('chaque plan est faisable avec un téléphone et le matériel indiqué', 'every shot is doable with a phone and the gear listed', 'كل لقطة ممكنة بالهاتف والمعدات المذكورة'),
      T('le produit est mis en valeur dans au moins 3 plans', 'the product is showcased in at least 3 shots', 'المنتج مُبرز في 3 لقطات على الأقل'),
      T('l’ordre suit le script : hook, problème, solution, preuve, appel à l’action', 'the order follows the script: hook, problem, solution, proof, call to action', 'الترتيب يتبع السيناريو: هوك، مشكلة، حل، دليل، دعوة إلى الفعل'),
    ],
  },
  {
    id: 'analyse',
    g: 'creative',
    icon: 'search',
    title: T('Analyser une pub qui marche', 'Break down a winning ad', 'تحليل إعلان ناجح'),
    sub: T('Pourquoi elle vend, et comment adapter l’idée à ton produit.', 'Why it sells, and how to adapt the idea to your product.', 'لماذا يبيع، وكيف تكيّف الفكرة مع منتجك.'),
    tools: ['chatgpt', 'claude', 'gemini'],
    fields: ['ad', 'p', 'c'],
    req: ['ad', 'p'],
    opts: [],
    def: {},
    next: ['hooks', 'script'],
    role: T(
      'Tu es analyste de créatives publicitaires : tu décortiques les pubs performantes pour en tirer des principes réutilisables.',
      'You are an ad creative analyst: you break down top-performing ads to extract reusable principles.',
      'أنت محلل للإعلانات: تفكك الإعلانات الناجحة لتستخرج منها مبادئ قابلة لإعادة الاستعمال.',
    ),
    task: T(
      'Analyse cette publicité, explique pourquoi elle fonctionne, puis propose 3 idées de pub pour mon produit qui reprennent ses principes sans la copier.',
      'Analyse this ad, explain why it works, then propose 3 ad ideas for my product that reuse its principles without copying it.',
      'حلّل هذا الإعلان واشرح لماذا ينجح، ثم اقترح 3 أفكار إعلان لمنتجي تعتمد مبادئه دون نسخه.',
    ),
    rules: [
      T('Sépare ce qui est observable (ce qu’on voit, ce qu’on entend) de ton interprétation.', 'Separate what is observable (what we see and hear) from your interpretation.', 'افصل بين ما يمكن ملاحظته (ما نراه ونسمعه) وبين تفسيرك.'),
      T('Adapte les principes, jamais le texte ni les images : copier une pub est risqué et ne marche pas pour un autre produit.', 'Adapt the principles, never the text or images: copying an ad is risky and doesn’t work for another product.', 'كيّف المبادئ لا النص ولا الصور: نسخ إعلان أمر خطير ولا ينجح مع منتج آخر.'),
    ],
    honest: true,
    format: T(
      '1) Découpage : hook, corps, appel à l’action, avec le temps de chaque partie. 2) Les 3 raisons principales de son efficacité. 3) Ses faiblesses. 4) Trois idées pour mon produit : angle, hook, déroulé en 4 plans.',
      '1) Breakdown: hook, body, call to action, with the timing of each part. 2) The 3 main reasons it works. 3) Its weaknesses. 4) Three ideas for my product: angle, hook, 4-shot outline.',
      '1) التقسيم: الهوك، الجسم، الدعوة إلى الفعل، مع توقيت كل جزء. 2) أهم 3 أسباب لنجاحه. 3) نقاط ضعفه. 4) ثلاث أفكار لمنتجي: الزاوية، الهوك، تسلسل من 4 لقطات.',
    ),
    direct: true,
    check: [
      T('chaque raison s’appuie sur un élément précis de la pub', 'each reason relies on a specific element of the ad', 'كل سبب يستند إلى عنصر محدد من الإعلان'),
      T('les 3 idées sont adaptées à mon produit et à ma cible', 'the 3 ideas fit my product and my audience', 'الأفكار الثلاث مناسبة لمنتجي وجمهوري'),
      T('rien n’est copié mot pour mot', 'nothing is copied word for word', 'لا شيء منسوخ حرفيًا'),
    ],
    recommend: true,
  },
  {
    id: 'texte',
    g: 'creative',
    icon: 'pen',
    title: T('Texte de la publicité', 'Ad copy', 'نص الإعلان'),
    sub: T('Texte principal, titre et description pour Meta ou TikTok.', 'Primary text, headline and description for Meta or TikTok.', 'النص الرئيسي والعنوان والوصف لميتا أو تيك توك.'),
    tools: ['chatgpt', 'claude', 'gemini'],
    fields: ['p', 'c', 'b', 'o', 'x'],
    req: ['p', 'c', 'b', 'o'],
    opts: ['nv', 'lang', 'plat', 'tone'],
    def: { nv: 3, lang: 'fr', plat: 'reels', tone: 'chaleur' },
    next: ['image'],
    role: T(
      'Tu es rédacteur publicitaire, spécialiste des annonces Facebook, Instagram et TikTok pour l’e-commerce en Algérie.',
      'You are an ad copywriter specialised in Facebook, Instagram and TikTok ads for e-commerce in Algeria.',
      'أنت كاتب إعلانات متخصص في إعلانات فيسبوك وإنستغرام وتيك توك للتجارة الإلكترونية في الجزائر.',
    ),
    task: T(
      'Écris {nv} versions du texte de cette publicité pour {plat}, {lang}, avec un ton {tone}.',
      'Write {nv} versions of this ad’s copy for {plat}, {lang}, with a {tone} tone.',
      'اكتب {nv} نسخ من نص هذا الإعلان لـ {plat}، {lang}، بنبرة {tone}.',
    ),
    rules: [
      T('La première ligne accroche à elle seule : c’est tout ce qu’on voit avant « Voir plus ».', 'The first line hooks on its own: it’s all people see before “See more”.', 'السطر الأول يجذب وحده: هو كل ما يُرى قبل « عرض المزيد ».'),
      T('Une idée par version (bénéfice, problème, preuve), pour pouvoir les tester entre elles.', 'One idea per version (benefit, problem, proof), so they can be tested against each other.', 'فكرة واحدة لكل نسخة (فائدة، مشكلة، دليل) حتى نختبرها ضد بعضها.'),
      T('Termine par un appel à l’action clair qui reprend l’offre.', 'End with a clear call to action restating the offer.', 'اختم بدعوة واضحة إلى الفعل تعيد ذكر العرض.'),
      T('Des emojis seulement s’ils aident à lire, 3 au plus.', 'Emojis only if they help reading, 3 at most.', 'رموز تعبيرية فقط إذا ساعدت على القراءة، 3 كحد أقصى.'),
    ],
    honest: true,
    format: T(
      'Pour chaque version : texte principal (première ligne de 125 caractères au plus), titre (40 caractères au plus), description (30 caractères au plus).',
      'For each version: primary text (first line of 125 characters max), headline (40 characters max), description (30 characters max).',
      'لكل نسخة: النص الرئيسي (سطر أول لا يتجاوز 125 حرفًا)، العنوان (40 حرفًا كحد أقصى)، الوصف (30 حرفًا كحد أقصى).',
    ),
    direct: true,
    check: [
      T('la première ligne donne envie de lire la suite', 'the first line makes people want to read on', 'السطر الأول يدفع لقراءة البقية'),
      T('les limites de caractères sont respectées', 'character limits are respected', 'حدود الأحرف محترمة'),
      T('aucune promesse exagérée', 'no exaggerated promise', 'لا وعود مبالغ فيها'),
    ],
    recommend: true,
  },

  /* ================================ IA ================================== */
  {
    id: 'image',
    g: 'ia',
    icon: 'image',
    media: 'image',
    title: T('Image produit pro', 'Pro product image', 'صورة منتج احترافية'),
    sub: T('Nano Banana, ChatGPT Images ou Higgsfield, avec ta photo comme référence.', 'Nano Banana, ChatGPT Images or Higgsfield, with your photo as reference.', 'Nano Banana أو ChatGPT Images أو Higgsfield، مع صورتك كمرجع.'),
    tools: ['gemini', 'chatgpt', 'higgsfield'],
    toolOpt: 'itool',
    fields: ['p', 's', 'b', 't'],
    req: ['p', 's'],
    opts: ['style', 'ratio', 'ref', 'itool'],
    def: { style: 'studio', ratio: '4:5', ref: 'yes', itool: 'gemini' },
    next: ['retouche', 'video'],
  },
  {
    id: 'retouche',
    g: 'ia',
    icon: 'crop',
    media: 'edit',
    title: T('Retoucher une photo', 'Edit a photo', 'تعديل صورة'),
    sub: T('Changer un seul détail sans abîmer le produit.', 'Change one detail without damaging the product.', 'غيّر تفصيلًا واحدًا دون إفساد المنتج.'),
    tools: ['gemini', 'chatgpt'],
    toolOpt: 'itool',
    fields: ['k', 'g'],
    req: ['k'],
    opts: ['itool'],
    def: { itool: 'gemini' },
    next: ['video'],
  },
  {
    id: 'video',
    g: 'ia',
    icon: 'video',
    media: 'video',
    title: T('Vidéo IA du produit', 'AI product video', 'فيديو منتج بالذكاء الاصطناعي'),
    sub: T('Veo 3.1, Kling ou Higgsfield : caméra, action, lumière et son.', 'Veo 3.1, Kling or Higgsfield: camera, action, light and sound.', 'Veo 3.1 أو Kling أو Higgsfield: الكاميرا والحركة والضوء والصوت.'),
    tools: ['veo', 'kling', 'higgsfield'],
    toolOpt: 'vtool',
    fields: ['p', 'a', 's', 'b', 'd'],
    req: ['p', 'a'],
    opts: ['vtool', 'cam', 'vdur', 'vratio', 'audio', 'ref'],
    def: { vtool: 'veo', cam: 'push', vdur: 8, vratio: '9:16', audio: 'amb', ref: 'yes' },
    next: ['voix', 'storyboard'],
  },
  {
    id: 'voix',
    g: 'ia',
    icon: 'mic',
    title: T('Voix off ElevenLabs v3', 'ElevenLabs v3 voice-over', 'تعليق صوتي ElevenLabs v3'),
    sub: T('Un texte avec les balises d’émotion, prêt à coller dans ElevenLabs.', 'A script with emotion tags, ready to paste into ElevenLabs.', 'نص مع وسوم المشاعر، جاهز للصق في ElevenLabs.'),
    tools: ['chatgpt', 'claude', 'elevenlabs'],
    fields: ['p', 'c', 'b', 'o'],
    req: ['p', 'b', 'o'],
    opts: ['dur', 'lang', 'vstyle'],
    def: { dur: 30, lang: 'dz', vstyle: 'chaleur' },
    next: ['storyboard'],
    role: T(
      'Tu es auteur de voix off publicitaires et tu maîtrises ElevenLabs v3 et ses balises audio.',
      'You are an ad voice-over writer and you master ElevenLabs v3 and its audio tags.',
      'أنت كاتب تعليقات صوتية إعلانية وتتقن ElevenLabs v3 ووسومه الصوتية.',
    ),
    task: T(
      'Écris une voix off de {dur} secondes (environ {w} mots) {lang}, pour une voix {vstyle}, prête à coller dans ElevenLabs v3.',
      'Write a {dur}-second voice-over (about {w} words) {lang}, for a {vstyle} voice, ready to paste into ElevenLabs v3.',
      'اكتب تعليقًا صوتيًا مدته {dur} ثانية (حوالي {w} كلمة) {lang}، لصوت {vstyle}، جاهزًا للصق في ElevenLabs v3.',
    ),
    rules: [
      T('Ajoute 3 à 5 balises audio entre crochets, en anglais, juste avant les mots concernés ([warmly], [excited], [curious], [whispers], [laughs softly]…), choisies pour une voix {vstyle} : une voix posée réagit mal aux balises trop joueuses.', 'Add 3 to 5 audio tags in square brackets, in English, right before the words they affect ([warmly], [excited], [curious], [whispers], [laughs softly]…), chosen for a {vstyle} voice: a calm voice reacts badly to overly playful tags.', 'أضف من 3 إلى 5 وسوم صوتية بين معقوفين، بالإنجليزية، قبل الكلمات المعنية مباشرة ([warmly]، [excited]، [curious]، [whispers]، [laughs softly]…)، مختارة لصوت {vstyle}: الصوت الهادئ لا يتجاوب مع الوسوم المرحة جدًا.'),
      T('Fais les pauses avec la ponctuation : « … » pour une pause hésitante, un tiret « — » pour une pause courte (v3 ne lit pas les balises SSML).', 'Make pauses with punctuation: “…” for a hesitant pause, a dash “—” for a short pause (v3 doesn’t read SSML tags).', 'اصنع الوقفات بعلامات الترقيم: « … » لوقفة مترددة، وشرطة « — » لوقفة قصيرة (v3 لا يقرأ وسوم SSML).'),
      T('Mets en MAJUSCULES un seul mot important au plus, pour l’appuyer.', 'Put at most one key word in CAPITALS, to stress it.', 'اكتب كلمة مهمة واحدة على الأكثر بالأحرف الكبيرة لتأكيدها (إن كانت بحروف لاتينية).'),
      T('Le hook est dans la première phrase, l’appel à l’action à la fin.', 'The hook is in the first sentence, the call to action at the end.', 'الهوك في الجملة الأولى، والدعوة إلى الفعل في النهاية.'),
      T('Écris les mots comme ils se prononcent, pour que la voix IA les dise correctement.', 'Write words as they are pronounced, so the AI voice says them correctly.', 'اكتب الكلمات كما تُنطق حتى يقولها الصوت الاصطناعي بشكل صحيح.'),
    ],
    honest: true,
    format: T(
      'Le texte final seul, prêt à coller, puis sur une ligne à part : la durée estimée et le réglage conseillé (Stability sur Creative ou Natural).',
      'The final text alone, ready to paste, then on a separate line: the estimated length and the recommended setting (Stability on Creative or Natural).',
      'النص النهائي وحده جاهزًا للصق، ثم في سطر منفصل: المدة المقدّرة والإعداد المنصوح به (Stability على Creative أو Natural).',
    ),
    check: [
      T('le texte se lit en {dur} secondes', 'the text reads in {dur} seconds', 'يُقرأ النص في {dur} ثانية'),
      T('les balises correspondent à la voix choisie', 'the tags suit the chosen voice', 'الوسوم تناسب الصوت المختار'),
      T('aucune promesse inventée', 'no invented promise', 'لا وعود مخترعة'),
    ],
  },
  {
    id: 'storyboard',
    g: 'ia',
    icon: 'layers',
    title: T('Pub IA complète (storyboard)', 'Full AI ad (storyboard)', 'إعلان كامل بالذكاء الاصطناعي (ستوري بورد)'),
    sub: T('Tous les prompts d’une pub IA : image, vidéo, voix, plan par plan.', 'All the prompts of an AI ad: image, video, voice, shot by shot.', 'كل برومبتات إعلان بالذكاء الاصطناعي: صورة، فيديو، صوت، لقطة بلقطة.'),
    tools: ['chatgpt', 'claude', 'gemini'],
    fields: ['p', 'c', 'b', 'o'],
    req: ['p', 'c', 'b', 'o'],
    opts: ['shots', 'lang', 'vtool'],
    def: { shots: 5, lang: 'dz', vtool: 'veo' },
    next: ['image', 'video', 'voix'],
    role: T(
      'Tu es directeur de création, spécialiste des publicités faites avec l’IA (images Nano Banana, vidéos {vtool}, voix ElevenLabs).',
      'You are a creative director specialised in AI-made ads (Nano Banana images, {vtool} videos, ElevenLabs voices).',
      'أنت مدير إبداعي متخصص في الإعلانات المصنوعة بالذكاء الاصطناعي (صور Nano Banana، فيديوهات {vtool}، أصوات ElevenLabs).',
    ),
    task: T(
      'Crée le storyboard complet d’une publicité verticale de {shots} plans pour ce produit, avec pour chaque plan les prompts prêts à coller.',
      'Create the full storyboard of a {shots}-shot vertical ad for this product, with ready-to-paste prompts for each shot.',
      'أنشئ ستوري بورد كاملًا لإعلان عمودي من {shots} لقطات لهذا المنتج، مع برومبتات جاهزة للصق لكل لقطة.',
    ),
    method: T(
      'Commence par une fiche de cohérence : la description exacte du produit et, s’il y en a un, du personnage (âge, style, vêtements). Répète cette description mot pour mot dans chaque prompt d’image, pour que tout reste identique d’un plan à l’autre.',
      'Start with a consistency sheet: the exact description of the product and, if any, of the character (age, style, clothes). Repeat that description word for word in every image prompt, so everything stays identical from shot to shot.',
      'ابدأ ببطاقة تناسق: الوصف الدقيق للمنتج، وللشخصية إن وُجدت (العمر، الأسلوب، الملابس). كرّر هذا الوصف حرفيًا في كل برومبت صورة حتى يبقى كل شيء متطابقًا من لقطة لأخرى.',
    ),
    rules: [
      T('Les prompts d’image et de vidéo sont en anglais, rédigés en phrases (sujet, action, lieu, cadrage, lumière, style), pas en liste de mots-clés.', 'Image and video prompts are in English, written as sentences (subject, action, location, framing, lighting, style), not keyword lists.', 'برومبتات الصور والفيديو بالإنجليزية، مكتوبة كجمل (الموضوع، الحركة، المكان، التأطير، الإضاءة، الأسلوب) لا كقوائم كلمات.'),
      T('Chaque plan vidéo a un seul mouvement de caméra et une seule action, et précise les sons (ambiance, effets).', 'Each video shot has one camera move and one action, and specifies the sounds (ambience, effects).', 'كل لقطة فيديو بحركة كاميرا واحدة وفعل واحد، مع تحديد الأصوات (الأجواء، المؤثرات).'),
      T('La voix off et le texte à l’écran sont {lang}.', 'The voice-over and on-screen text are {lang}.', 'التعليق الصوتي والنص على الشاشة {lang}.'),
    ],
    honest: true,
    format: T(
      'La fiche de cohérence, puis pour chaque plan : n°, durée, rôle (hook, problème, solution, preuve, appel à l’action), prompt image (anglais), prompt vidéo (anglais), voix off, texte à l’écran. Termine par l’ordre de montage et la musique conseillée.',
      'The consistency sheet, then for each shot: no., duration, role (hook, problem, solution, proof, call to action), image prompt (English), video prompt (English), voice-over, on-screen text. End with the edit order and suggested music.',
      'بطاقة التناسق، ثم لكل لقطة: الرقم، المدة، الدور (هوك، مشكلة، حل، دليل، دعوة إلى الفعل)، برومبت الصورة (بالإنجليزية)، برومبت الفيديو (بالإنجليزية)، التعليق الصوتي، النص على الشاشة. اختم بترتيب المونتاج والموسيقى المقترحة.',
    ),
    check: [
      T('le produit et le personnage sont décrits de la même façon partout', 'the product and character are described the same way everywhere', 'المنتج والشخصية موصوفان بالطريقة نفسها في كل مكان'),
      T('le hook tient dans le premier plan', 'the hook fits in the first shot', 'الهوك في اللقطة الأولى'),
      T('l’ensemble dure moins de 30 secondes', 'the whole ad lasts under 30 seconds', 'الإعلان كله أقل من 30 ثانية'),
    ],
  },

  /* ============================ Sites & Apps ============================ */
  {
    id: 'site',
    g: 'dev',
    icon: 'layout',
    code: true,
    ex: {
      c: T('femmes de 20 à 45 ans à Oran qui réservent depuis Instagram', 'women aged 20 to 45 in Oran who book from Instagram', 'نساء من 20 إلى 45 سنة في وهران يحجزن عبر إنستغرام'),
      b: T('des coiffures de mariée réputées et une équipe 100 % féminine', 'renowned bridal hairstyles and an all-female team', 'تسريحات عرائس مشهورة وفريق نسائي بالكامل'),
      o: T('réserver un créneau sur WhatsApp en 30 secondes', 'book a slot on WhatsApp in 30 seconds', 'حجز موعد عبر واتساب في 30 ثانية'),
    },
    title: T('Site vitrine', 'Showcase website', 'موقع تعريفي'),
    sub: T('Le prompt de départ pour Claude Code, Codex ou Lovable.', 'The starting prompt for Claude Code, Codex or Lovable.', 'برومبت البداية لـ Claude Code أو Codex أو Lovable.'),
    tools: ['claudecode', 'codex', 'lovable'],
    toolOpt: 'agent',
    fields: ['biz', 'c', 'b', 'o'],
    req: ['biz', 'c', 'b', 'o'],
    opts: ['agent', 'pages', 'look'],
    def: { agent: 'claude', pages: 'one', look: 'premium' },
    next: ['feature', 'secu', 'prospect'],
    role: T('Tu es développeur web senior et designer exigeant.', 'You are a senior web developer and a demanding designer.', 'أنت مطوّر ويب محترف ومصمم دقيق.'),
    task: T(
      'Construis le site vitrine de ce commerce : {pages}, style {look}, pensé d’abord pour le téléphone.',
      'Build this business’s showcase website: {pages}, {look} style, designed for phones first.',
      'ابنِ الموقع التعريفي لهذا المحل: {pages}، بأسلوب {look}، مصمم أولًا للهاتف.',
    ),
    method: T(
      '1. Lis CLAUDE.md (ou AGENTS.md) et brief.md s’ils existent. 2. Propose-moi d’abord un plan : sections, textes, couleurs, polices ; attends ma validation. 3. Construis section par section et montre-moi l’aperçu à chaque étape. 4. Termine par un résumé de ce qui est fait et de comment le vérifier.',
      '1. Read CLAUDE.md (or AGENTS.md) and brief.md if they exist. 2. First propose a plan: sections, copy, colours, fonts; wait for my approval. 3. Build section by section and show me the preview at each step. 4. Finish with a summary of what’s done and how to check it.',
      '1. اقرأ CLAUDE.md (أو AGENTS.md) وbrief.md إن وُجدا. 2. اقترح عليّ أولًا خطة: الأقسام، النصوص، الألوان، الخطوط؛ وانتظر موافقتي. 3. ابنِ قسمًا بقسم وأرني المعاينة في كل مرحلة. 4. اختم بملخص لما أُنجز وكيف أتحقق منه.',
    ),
    rules: [
      T('Mobile d’abord : tout doit être parfait sur un écran de 375 px, car la plupart des visiteurs viennent d’Instagram, de TikTok ou de WhatsApp.', 'Mobile first: everything must be perfect on a 375 px screen, since most visitors come from Instagram, TikTok or WhatsApp.', 'الهاتف أولًا: يجب أن يكون كل شيء ممتازًا على شاشة 375 بكسل، لأن أغلب الزوار يأتون من إنستغرام وتيك توك وواتساب.'),
      T('Sections : un hero avec le bouton d’action principal, les services ou produits avec leurs prix, des preuves réelles, les questions fréquentes, le contact (horaires, carte, téléphone cliquable).', 'Sections: a hero with the main action button, services or products with prices, real proof, FAQ, contact (hours, map, tap-to-call phone).', 'الأقسام: واجهة رئيسية بزر الفعل الأساسي، الخدمات أو المنتجات مع أسعارها، أدلة حقيقية، الأسئلة الشائعة، الاتصال (الأوقات، الخريطة، هاتف قابل للضغط).'),
      T('Titre, description et aperçu de partage (Open Graph) remplis, pour un bel aperçu sur WhatsApp.', 'Title, description and share preview (Open Graph) filled in, for a nice WhatsApp preview.', 'العنوان والوصف ومعاينة المشاركة (Open Graph) مملوءة، لمعاينة جميلة على واتساب.'),
      T('Chemins relatifs, images légères (WebP), aucune clé secrète dans le code du navigateur.', 'Relative paths, light images (WebP), no secret key in browser code.', 'مسارات نسبية، صور خفيفة (WebP)، ولا مفتاح سري في كود المتصفح.'),
      T('Contenus d’exemple clairement signalés : aucun faux avis, aucun faux chiffre.', 'Sample content clearly labelled: no fake reviews, no fake numbers.', 'محتوى المثال موسوم بوضوح: لا آراء ولا أرقام مزيفة.'),
      T('Animations douces, désactivées si le visiteur a choisi de réduire les animations.', 'Gentle animations, turned off if the visitor chose reduced motion.', 'حركات لطيفة تتوقف إذا اختار الزائر تقليل الحركة.'),
    ],
    format: T(
      'Plan d’abord. À la fin : la liste des fichiers créés, ce qui reste à compléter (vraies photos, vrais avis) et comment vérifier (aperçu, téléphone, Lighthouse).',
      'Plan first. At the end: the list of files created, what’s left to complete (real photos, real reviews) and how to check (preview, phone, Lighthouse).',
      'الخطة أولًا. في النهاية: قائمة الملفات المنشأة، وما بقي لإكماله (صور حقيقية، آراء حقيقية)، وكيف نتحقق (المعاينة، الهاتف، Lighthouse).',
    ),
    check: [
      T('Lighthouse mobile au-dessus de 90 partout', 'Lighthouse mobile above 90 everywhere', 'Lighthouse على الهاتف فوق 90 في كل شيء'),
      T('le bouton d’action principal marche sur téléphone', 'the main action button works on phone', 'زر الفعل الأساسي يعمل على الهاتف'),
      T('aucune erreur dans l’aperçu', 'no error in the preview', 'لا خطأ في المعاينة'),
      T('rien n’est inventé sur le commerce', 'nothing is invented about the business', 'لا شيء مخترع عن المحل'),
    ],
  },
  {
    id: 'feature',
    g: 'dev',
    icon: 'cube',
    code: true,
    ex: { c: T('les clientes du salon, sur leur téléphone', 'the salon’s customers, on their phones', 'زبونات الصالون على هواتفهن') },
    title: T('Nouvelle fonctionnalité', 'New feature', 'ميزة جديدة'),
    sub: T('Spec, plan, construction et tests, en petites étapes vérifiées.', 'Spec, plan, build and tests, in small verified steps.', 'المواصفات والخطة والبناء والاختبارات، بخطوات صغيرة مُتحقَّق منها.'),
    tools: ['claudecode', 'codex'],
    toolOpt: 'agent',
    fields: ['feat', 'c', 'crit', 'keep'],
    req: ['feat', 'crit'],
    opts: ['agent'],
    def: { agent: 'claude' },
    next: ['bug', 'secu'],
    role: T('Tu es développeur senior rigoureux : tu avances par petites étapes vérifiées.', 'You are a rigorous senior developer: you move in small verified steps.', 'أنت مطوّر محترف دقيق: تتقدم بخطوات صغيرة مُتحقَّق منها.'),
    task: T('Ajoute cette fonctionnalité au projet.', 'Add this feature to the project.', 'أضف هذه الميزة إلى المشروع.'),
    method: T(
      '1. Lis CLAUDE.md (ou AGENTS.md) et le code concerné. 2. Écris une courte spec avec des critères d’acceptation testables, puis un plan en étapes ; attends ma validation avant de modifier quoi que ce soit. 3. Construis étape par étape et lance les tests après chacune. 4. Montre-moi l’aperçu et résume ce qui a changé.',
      '1. Read CLAUDE.md (or AGENTS.md) and the relevant code. 2. Write a short spec with testable acceptance criteria, then a step plan; wait for my approval before changing anything. 3. Build step by step and run the tests after each one. 4. Show me the preview and summarise what changed.',
      '1. اقرأ CLAUDE.md (أو AGENTS.md) والكود المعني. 2. اكتب مواصفات قصيرة بمعايير قبول قابلة للاختبار ثم خطة بخطوات؛ وانتظر موافقتي قبل تعديل أي شيء. 3. ابنِ خطوة بخطوة وشغّل الاختبارات بعد كل واحدة. 4. أرني المعاينة ولخّص ما تغيّر.',
    ),
    rules: [
      SH.scope,
      T('Ne touche pas au reste du projet sans me demander, en particulier à ce qui ne doit pas changer.', 'Don’t touch the rest of the project without asking me, especially what must not change.', 'لا تلمس بقية المشروع دون أن تسألني، خاصة ما يجب ألا يتغير.'),
      T('Vérifie les données côté serveur, protège chaque table (RLS) et ne mets aucune clé secrète dans le navigateur.', 'Validate data on the server, protect every table (RLS) and put no secret key in the browser.', 'تحقق من البيانات في الخادم، واحمِ كل جدول (RLS) ولا تضع أي مفتاح سري في المتصفح.'),
      T('Écris des tests pour les cas normaux et pour les cas interdits.', 'Write tests for the normal cases and for the forbidden cases.', 'اكتب اختبارات للحالات العادية وللحالات الممنوعة.'),
    ],
    format: T(
      'Spec et plan d’abord. À la fin : fichiers modifiés, tests lancés et leur résultat, comment vérifier moi-même.',
      'Spec and plan first. At the end: files changed, tests run and their result, how I can check it myself.',
      'المواصفات والخطة أولًا. في النهاية: الملفات المعدّلة، الاختبارات المشغّلة ونتيجتها، وكيف أتحقق بنفسي.',
    ),
    check: [
      T('chaque critère d’acceptation est vérifié par un test ou dans l’aperçu', 'each acceptance criterion is checked by a test or in the preview', 'كل معيار قبول مُتحقَّق منه باختبار أو في المعاينة'),
      T('rien d’autre n’a été cassé', 'nothing else was broken', 'لم يتعطل شيء آخر'),
    ],
  },
  {
    id: 'bug',
    g: 'dev',
    icon: 'search',
    code: true,
    title: T('Corriger un bug', 'Fix a bug', 'إصلاح خطأ'),
    sub: T('La cause d’abord, puis la plus petite correction possible.', 'The cause first, then the smallest possible fix.', 'السبب أولًا، ثم أصغر إصلاح ممكن.'),
    tools: ['claudecode', 'codex'],
    toolOpt: 'agent',
    fields: ['bug', 'exp', 'where', 'err'],
    req: ['bug', 'exp', 'where'],
    opts: ['agent'],
    def: { agent: 'claude' },
    next: ['feature'],
    role: T('Tu es développeur senior méthodique : tu trouves la cause avant de corriger.', 'You are a methodical senior developer: you find the cause before fixing.', 'أنت مطوّر محترف منهجي: تجد السبب قبل الإصلاح.'),
    task: T('Corrige ce bug.', 'Fix this bug.', 'أصلح هذا الخطأ.'),
    method: T(
      '1. Reproduis le problème, ou explique comment tu le reproduis. 2. Trouve la cause exacte et explique-la-moi en une phrase simple. 3. Propose la correction la plus petite possible. 4. Corrige, puis vérifie que c’est réglé et que rien d’autre n’est cassé (tests, aperçu).',
      '1. Reproduce the problem, or explain how you reproduce it. 2. Find the exact cause and explain it to me in one simple sentence. 3. Propose the smallest possible fix. 4. Fix it, then check it’s solved and nothing else is broken (tests, preview).',
      '1. أعد إنتاج المشكلة، أو اشرح كيف تعيد إنتاجها. 2. جد السبب الدقيق واشرحه لي في جملة بسيطة. 3. اقترح أصغر إصلاح ممكن. 4. أصلح، ثم تحقق أن المشكلة حُلّت وأن لا شيء آخر تعطّل (الاختبارات، المعاينة).',
    ),
    rules: [
      T('Garde intact ce qui marche : corrige seulement la cause.', 'Keep what works intact: fix only the cause.', 'أبقِ ما يعمل كما هو: أصلح السبب فقط.'),
      T('Si tu n’es pas sûr de la cause, dis-le et propose comment la confirmer.', 'If you’re not sure of the cause, say so and propose how to confirm it.', 'إذا لم تكن متأكدًا من السبب، قل ذلك واقترح كيف نؤكده.'),
      T('Ajoute un test qui aurait attrapé ce bug.', 'Add a test that would have caught this bug.', 'أضف اختبارًا كان سيكشف هذا الخطأ.'),
    ],
    format: T(
      'Cause (une phrase), correction (fichiers modifiés), vérification faite, comment je peux vérifier moi-même.',
      'Cause (one sentence), fix (files changed), check done, how I can check it myself.',
      'السبب (جملة واحدة)، الإصلاح (الملفات المعدّلة)، التحقق المنجز، وكيف أتحقق بنفسي.',
    ),
    check: [
      T('le bug ne se reproduit plus', 'the bug no longer reproduces', 'لم يعد الخطأ يتكرر'),
      T('les tests passent', 'the tests pass', 'الاختبارات تنجح'),
    ],
  },
  {
    id: 'secu',
    g: 'dev',
    icon: 'shield',
    code: true,
    title: T('Audit de sécurité', 'Security audit', 'تدقيق أمني'),
    sub: T('Tout vérifier avant la mise en ligne, sans rien casser.', 'Check everything before going live, without breaking anything.', 'تحقق من كل شيء قبل النشر دون كسر شيء.'),
    tools: ['claudecode', 'codex'],
    toolOpt: 'agent',
    fields: ['proj', 'data'],
    req: ['proj', 'data'],
    opts: ['agent'],
    def: { agent: 'claude' },
    next: ['bug'],
    role: T('Tu es auditeur en sécurité des applications web.', 'You are a web application security auditor.', 'أنت مدقق أمن تطبيقات الويب.'),
    task: T('Fais l’audit de sécurité complet de ce projet avant sa mise en ligne, sans rien modifier.', 'Run a full security audit of this project before it goes live, without changing anything.', 'أجرِ تدقيقًا أمنيًا كاملًا لهذا المشروع قبل نشره، دون تعديل أي شيء.'),
    method: T(
      'Vérifie dans cet ordre : 1. secrets (code, historique, fichiers .env) ; 2. accès aux données (RLS de chaque table, test à deux comptes, rôles, identifiants devinables) ; 3. dépendances (failles connues, librairies inconnues) ; 4. entrées (validation côté serveur, XSS, injections) ; 5. configuration (en-têtes de sécurité, CSP, HTTPS, messages d’erreur) ; 6. comptes (double authentification, clés avec trop de droits).',
      'Check in this order: 1. secrets (code, history, .env files); 2. data access (RLS on every table, two-account test, roles, guessable IDs); 3. dependencies (known flaws, unknown libraries); 4. inputs (server-side validation, XSS, injections); 5. configuration (security headers, CSP, HTTPS, error messages); 6. accounts (two-factor authentication, over-privileged keys).',
      'تحقق بهذا الترتيب: 1. الأسرار (الكود، السجل، ملفات .env)؛ 2. الوصول إلى البيانات (RLS لكل جدول، اختبار بحسابين، الأدوار، المعرّفات القابلة للتخمين)؛ 3. المكتبات (الثغرات المعروفة، المكتبات المجهولة)؛ 4. المدخلات (التحقق في الخادم، XSS، الحقن)؛ 5. الإعدادات (ترويسات الأمان، CSP، HTTPS، رسائل الخطأ)؛ 6. الحسابات (المصادقة الثنائية، المفاتيح ذات الصلاحيات الزائدة).',
    ),
    rules: [
      T('N’affiche jamais la valeur complète d’un secret.', 'Never display the full value of a secret.', 'لا تعرض أبدًا القيمة الكاملة لأي سر.'),
      T('Classe chaque problème par gravité : critique, élevé, moyen, faible.', 'Rank each issue by severity: critical, high, medium, low.', 'صنّف كل مشكلة حسب الخطورة: حرجة، عالية، متوسطة، منخفضة.'),
      T('Pour chaque problème : où il est, le risque concret pour les données, la correction.', 'For each issue: where it is, the concrete risk for the data, the fix.', 'لكل مشكلة: أين توجد، والخطر الملموس على البيانات، والإصلاح.'),
    ],
    format: T(
      'Un rapport AUDIT.md : le tableau des problèmes, puis les 3 corrections à faire en premier. Attends ma validation avant de corriger.',
      'An AUDIT.md report: the table of issues, then the 3 fixes to do first. Wait for my approval before fixing.',
      'تقرير AUDIT.md: جدول المشاكل، ثم الإصلاحات الثلاثة الأولى. انتظر موافقتي قبل الإصلاح.',
    ),
    check: [
      T('chaque table a été vérifiée', 'every table was checked', 'تم التحقق من كل جدول'),
      T('aucun secret n’apparaît en clair dans le rapport', 'no secret appears in plain text in the report', 'لا يظهر أي سر بشكل واضح في التقرير'),
    ],
  },

  /* ================================ Vendre ============================== */
  {
    id: 'prospect',
    g: 'vendre',
    icon: 'message',
    ex: { b: T('des réservations qui arrivent toutes seules, sans répondre au téléphone toute la journée', 'bookings that come in on their own, without answering the phone all day', 'حجوزات تصل وحدها دون الرد على الهاتف طوال اليوم') },
    title: T('Message de prospection', 'Outreach message', 'رسالة استقطاب'),
    sub: T('Premier message, relance ou réponse à « c’est combien ? ».', 'First message, follow-up or reply to “how much?”.', 'أول رسالة، متابعة أو رد على « بكم؟ ».'),
    tools: ['chatgpt', 'claude', 'gemini'],
    fields: ['biz', 'made', 'b', 'perso'],
    req: ['biz', 'made', 'b'],
    opts: ['stage', 'channel', 'lang'],
    def: { stage: 'first', channel: 'whatsapp', lang: 'dz' },
    next: ['offre'],
    role: T(
      'Tu es un freelance qui sait vendre sans forcer : tes messages sont courts, personnels et respectueux.',
      'You are a freelancer who sells without pushing: your messages are short, personal and respectful.',
      'أنت مستقل يعرف كيف يبيع دون ضغط: رسائلك قصيرة وشخصية ومحترمة.',
    ),
    task: {
      first: T('Écris 3 versions du premier message {channel} à envoyer à ce commerçant, {lang}.', 'Write 3 versions of the first {channel} message to send to this business owner, {lang}.', 'اكتب 3 نسخ من أول رسالة {channel} نرسلها لصاحب هذا المحل، {lang}.'),
      relance: T('Écris 2 messages de relance {channel}, à envoyer 3 jours après un premier message resté sans réponse, {lang}.', 'Write 2 {channel} follow-up messages, to send 3 days after an unanswered first message, {lang}.', 'اكتب رسالتي متابعة {channel} تُرسلان بعد 3 أيام من رسالة أولى بلا رد، {lang}.'),
      prix: T('Le commerçant demande « c’est combien ? ». Écris 2 réponses {channel}, {lang}, qui donnent un repère de prix honnête et proposent un appel de 10 minutes.', 'The business owner asks “how much?”. Write 2 {channel} replies, {lang}, that give an honest price range and offer a 10-minute call.', 'صاحب المحل يسأل « بكم؟ ». اكتب ردّين {channel}، {lang}، يعطيان سعرًا تقريبيًا صادقًا ويقترحان مكالمة من 10 دقائق.'),
    },
    rules: [
      T('Commence par un détail vrai et précis sur son commerce, pour montrer que le message n’est pas un copier-coller.', 'Start with a true, specific detail about their business, to show the message isn’t copy-paste.', 'ابدأ بتفصيل حقيقي ودقيق عن محله، لتُظهر أن الرسالة ليست منسوخة.'),
      T('Parle de son bénéfice à lui, pas de ta technique.', 'Talk about their benefit, not your technique.', 'تحدث عن فائدته هو، لا عن تقنيتك.'),
      T('Une seule question à la fin, facile à accepter (« Je vous envoie la vidéo de 40 secondes ? »).', 'A single easy-to-accept question at the end (“Shall I send you the 40-second video?”).', 'سؤال واحد سهل القبول في النهاية (« أرسل لك الفيديو ذا 40 ثانية؟ »).'),
      T('5 lignes au plus : il lit sur son téléphone, entre deux clients.', '5 lines at most: they read on their phone, between two customers.', '5 أسطر كحد أقصى: يقرأ على هاتفه بين زبونين.'),
      T('Aucune fausse urgence, aucun faux chiffre.', 'No fake urgency, no fake numbers.', 'لا استعجال مزيف ولا أرقام مزيفة.'),
    ],
    format: T(
      'Chaque version séparée, prête à copier, avec en dessous une ligne : pourquoi elle peut marcher.',
      'Each version separate, ready to copy, with one line below: why it can work.',
      'كل نسخة منفصلة وجاهزة للنسخ، مع سطر تحتها: لماذا قد تنجح.',
    ),
    direct: true,
    check: [
      T('le message tient sur un écran de téléphone', 'the message fits on a phone screen', 'الرسالة تتسع في شاشة هاتف'),
      T('il est personnalisé', 'it is personalised', 'الرسالة شخصية'),
      T('il se termine par une seule question', 'it ends with a single question', 'تنتهي بسؤال واحد'),
    ],
    recommend: true,
  },
  {
    id: 'offre',
    g: 'vendre',
    icon: 'money',
    ex: {
      c: T('petites boutiques en ligne de cosmétiques et de mode en Algérie', 'small online cosmetics and fashion stores in Algeria', 'متاجر إلكترونية صغيرة لمستحضرات التجميل والأزياء في الجزائر'),
      pr: T('entre 15 000 et 60 000 DA par mois', 'between 15,000 and 60,000 DZD per month', 'بين 15000 و60000 دج شهريًا'),
      x: T('3 pubs vidéo déjà réalisées pour des boutiques d’Oran, à montrer en exemple', '3 video ads already made for stores in Oran, to show as examples', '3 إعلانات فيديو منجزة لمتاجر في وهران، تُعرض كأمثلة'),
    },
    title: T('Offre en 3 formules', '3-tier offer', 'عرض من 3 باقات'),
    sub: T('Prix, livrables et délais clairs pour tes clients.', 'Clear prices, deliverables and timelines for your clients.', 'أسعار ومخرجات ومواعيد واضحة لزبائنك.'),
    tools: ['chatgpt', 'claude', 'gemini'],
    fields: ['serv', 'c', 'pr', 'x'],
    req: ['serv', 'c'],
    opts: ['lang'],
    def: { lang: 'fr' },
    next: ['prospect'],
    role: T(
      'Tu es consultant en tarification pour les freelances de la création (pubs, sites, contenu) en Algérie.',
      'You are a pricing consultant for creative freelancers (ads, websites, content) in Algeria.',
      'أنت مستشار تسعير للمستقلين في المجال الإبداعي (إعلانات، مواقع، محتوى) في الجزائر.',
    ),
    task: T(
      'Construis ma proposition commerciale en 3 formules (essentielle, recommandée, complète) pour ce type de client, {lang}.',
      'Build my commercial offer in 3 tiers (essential, recommended, complete) for this type of client, {lang}.',
      'ابنِ عرضي التجاري في 3 باقات (أساسية، موصى بها، كاملة) لهذا النوع من الزبائن، {lang}.',
    ),
    rules: [
      T('La formule du milieu est la plus intéressante et elle est mise en avant : c’est celle que la plupart des clients choisiront.', 'The middle tier is the best value and is highlighted: it’s the one most clients will choose.', 'الباقة الوسطى هي الأفضل قيمة وتُبرز: هي التي سيختارها أغلب الزبائن.'),
      T('Chaque formule a des livrables concrets et comptables (nombre de vidéos, de pages, de retouches, délais).', 'Each tier has concrete, countable deliverables (number of videos, pages, revisions, timelines).', 'لكل باقة مخرجات ملموسة وقابلة للعدّ (عدد الفيديوهات، الصفحات، التعديلات، المواعيد).'),
      T('Prix en dinars, cohérents avec le marché local et avec la fourchette indiquée.', 'Prices in dinars, consistent with the local market and the range given.', 'الأسعار بالدينار، متناسقة مع السوق المحلي ومع المجال المذكور.'),
      T('Aucune garantie de résultat chiffrée : on promet du travail et des délais, pas des ventes.', 'No numeric results guarantee: promise work and deadlines, not sales.', 'لا ضمان لنتائج بالأرقام: نَعِد بالعمل والمواعيد لا بالمبيعات.'),
    ],
    format: T(
      'Un tableau des 3 formules (prix, livrables, délais, révisions), puis les conditions (acompte, paiement, droits d’utilisation), puis un court message pour présenter l’offre au client.',
      'A table of the 3 tiers (price, deliverables, timelines, revisions), then the terms (deposit, payment, usage rights), then a short message to present the offer to the client.',
      'جدول الباقات الثلاث (السعر، المخرجات، المواعيد، التعديلات)، ثم الشروط (العربون، الدفع، حقوق الاستعمال)، ثم رسالة قصيرة لتقديم العرض للزبون.',
    ),
    direct: true,
    check: [
      T('les écarts de prix entre les formules sont logiques', 'price gaps between tiers make sense', 'فروق الأسعار بين الباقات منطقية'),
      T('chaque livrable est clair et vérifiable', 'each deliverable is clear and verifiable', 'كل مُخرَج واضح وقابل للتحقق'),
    ],
  },

  /* ============================ Mieux prompter ========================== */
  {
    id: 'ameliorer',
    g: 'mieux',
    icon: 'wand',
    title: T('Améliorer mon prompt', 'Improve my prompt', 'حسّن البرومبت الخاص بي'),
    sub: T('Colle un prompt : l’IA le réécrit avec les meilleures pratiques.', 'Paste a prompt: the AI rewrites it with best practices.', 'الصق برومبت: يعيد الذكاء الاصطناعي كتابته بأفضل الممارسات.'),
    tools: ['chatgpt', 'claude', 'gemini'],
    fields: ['mine', 'goal', 'pb'],
    req: ['mine', 'goal'],
    opts: ['level', 'ai'],
    def: { level: 'full', ai: 'chat' },
    next: [],
    role: T(
      'Tu es expert en rédaction de prompts, à jour des guides officiels d’Anthropic, d’OpenAI et de Google.',
      'You are a prompt-writing expert, up to date with the official guides from Anthropic, OpenAI and Google.',
      'أنت خبير في كتابة البرومبت، مطّلع على أحدث الأدلة الرسمية من Anthropic وOpenAI وGoogle.',
    ),
    task: {
      full: T('Réécris mon prompt pour qu’il donne le meilleur résultat possible avec {ai}, sans changer mon intention.', 'Rewrite my prompt so it gets the best possible result with {ai}, without changing my intent.', 'أعد كتابة البرومبت ليعطي أفضل نتيجة ممكنة مع {ai}، دون تغيير مقصدي.'),
      min: T('Propose les modifications et ajouts les plus petits possibles qui corrigeraient le problème avec {ai}, en gardant mon prompt tel quel autant que possible.', 'Propose the smallest possible edits and additions that would fix the problem with {ai}, keeping my prompt as is as much as possible.', 'اقترح أصغر التعديلات والإضافات الممكنة التي تصلح المشكلة مع {ai}، مع إبقاء البرومبت كما هو قدر الإمكان.'),
    },
    rules: [
      T('Rends la tâche explicite et précise, avec le nombre et le format de résultats attendus.', 'Make the task explicit and precise, with the number and format of expected results.', 'اجعل المهمة صريحة ودقيقة، مع عدد النتائج المنتظرة وشكلها.'),
      T('Ajoute le contexte qui manque (cible, usage, contraintes) et la raison des consignes importantes.', 'Add the missing context (audience, use, constraints) and the reason behind important instructions.', 'أضف السياق الناقص (الجمهور، الاستعمال، القيود) وسبب التعليمات المهمة.'),
      T('Sépare les parties avec des balises ou des titres (contexte, tâche, règles, format).', 'Separate the parts with tags or headings (context, task, rules, format).', 'افصل الأجزاء بوسوم أو عناوين (السياق، المهمة، القواعد، الشكل).'),
      T('Formule les consignes en positif (ce qu’il faut faire) et retire toute contradiction.', 'Phrase instructions positively (what to do) and remove any contradiction.', 'صُغ التعليمات بشكل إيجابي (ما يجب فعله) واحذف أي تناقض.'),
      T('Ajoute une vérification finale avec des critères concrets.', 'Add a final self-check with concrete criteria.', 'أضف تحققًا نهائيًا بمعايير ملموسة.'),
      T('Pour un outil d’image ou de vidéo : décris la scène en phrases (sujet, action, lieu, cadrage, lumière, style), en anglais, et le texte exact entre guillemets.', 'For an image or video tool: describe the scene in sentences (subject, action, location, framing, lighting, style), in English, with exact text in quotes.', 'لأداة صور أو فيديو: صِف المشهد بجمل (الموضوع، الحركة، المكان، التأطير، الإضاءة، الأسلوب) بالإنجليزية، والنص الدقيق بين علامتي تنصيص.'),
    ],
    format: T(
      '1) Le prompt amélioré, dans un bloc à copier. 2) Les changements et leur raison, en 5 points au plus. 3) Si une information essentielle manque, 2 questions au plus.',
      '1) The improved prompt, in a copyable block. 2) The changes and why, in 5 points at most. 3) If essential information is missing, 2 questions at most.',
      '1) البرومبت المحسّن في كتلة قابلة للنسخ. 2) التغييرات وأسبابها في 5 نقاط كحد أقصى. 3) إن نقصت معلومة أساسية، سؤالان كحد أقصى.',
    ),
    check: [
      T('le prompt amélioré garde mon intention', 'the improved prompt keeps my intent', 'البرومبت المحسّن يحافظ على مقصدي'),
      T('il ne contient aucune contradiction', 'it contains no contradiction', 'لا يحتوي أي تناقض'),
    ],
  },
];

export const TEMPLATE_IDS = TEMPLATES.map((x) => x.id);
export const byId = Object.fromEntries(TEMPLATES.map((x) => [x.id, x]));

/** Modèles ouverts au compte démo (un par formation). */
export const DEMO_TEMPLATES = ['hooks', 'image', 'site'];

/** Module de leçon → modèle à proposer sous la vidéo (« Générer le prompt de cette leçon »). */
export const LESSON_TEMPLATE = {
  m2: 'hooks', m3: 'script', m4: 'script', m5: 'tournage', m6: 'angles', m7: 'script', m9: 'tournage', m10: 'angles', m11: 'texte', m12: 'script',
  ia1: 'ameliorer', ia2: 'image', ia3: 'video', ia4: 'voix', ia10: 'angles', ia5: 'storyboard', ia6: 'video', ia7: 'analyse', ia8: 'prospect',
  dv4: 'site', dv8: 'secu', dv9: 'feature', dv10: 'bug', dv13: 'prospect', dv14: 'offre',
};

/* ------------------------------------------------------------------ */
/* Moteur : assemble le prompt                                          */
/* ------------------------------------------------------------------ */

const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));

/** Texte inséré pour une option (ex. lang → « en darija… »). */
function optSay(key, value, L) {
  const o = OPTS[key];
  if (!o) return String(value ?? '');
  const v = o.values[value];
  return v ? pick(v.say, L) : String(value ?? '');
}

/** Valeur d'un champ, ou un repère visible quand il est vide et requis. */
const valueOf = (tpl, v, k, L) => (v[k] && String(v[k]).trim() ? String(v[k]).trim() : tpl.req.includes(k) ? `[${pick(FIELDS[k].label, L)}]` : '');

/* ---------------------- Image, retouche, vidéo (anglais) ---------------------- */

const STYLE = {
  studio: {
    open: 'Create a high-end commercial product photograph of',
    comp: 'The product is the hero: centred, in sharp focus, with generous negative space around it for ad text.',
    light: 'Lighting: three-point softbox setup with a soft rim light, realistic reflections and soft contact shadows. Camera: 85mm lens at f/8, the whole product tack sharp.',
  },
  life: {
    open: 'Create a realistic lifestyle advertising photo of',
    comp: 'The product is used naturally in the scene and stays the clear focal point.',
    light: 'Lighting: warm natural daylight. Camera: 50mm lens at f/2.8, shallow depth of field so the background stays soft.',
  },
  ugc: {
    open: 'Create an authentic smartphone photo, like real customer content, of',
    comp: 'Slightly imperfect handheld framing, an everyday background and true-to-life colours: it should look real, not staged.',
    light: 'Lighting: natural window light, no heavy retouching, a little natural grain.',
  },
  flat: {
    open: 'Create a top-down flat lay product photograph of',
    comp: 'Shot from directly above, with a neat arrangement of a few complementary props around the product.',
    light: 'Lighting: even, diffused daylight from a large window, soft shadows.',
  },
};
const CAM = {
  push: 'Slow dolly-in close-up shot',
  orbit: 'Smooth 180-degree orbit shot around the product',
  hand: 'Handheld smartphone shot with a natural slight shake, like authentic UGC',
  reveal: 'Low-angle crane shot rising to reveal the product',
  static: 'Locked-off static shot',
};
const AUDIO = {
  amb: 'Audio: soft ambient room tone, and a subtle whoosh as the light passes.',
  music: 'Audio: an elegant, minimal music bed that builds gently.',
  none: '',
};

function mediaImage(tpl, v, o) {
  const st = STYLE[o.style] || STYLE.studio;
  const P = valueOf(tpl, v, 'p', 'en');
  const segs = [{ k: 'subject', text: `${st.open} ${P}.` }];
  if (o.ref === 'yes') segs.push({ k: 'ref', text: 'Use the attached photo as the exact product reference: keep its shape, colours, materials, label and logo identical; only the scene around it changes.' });
  segs.push({ k: 'scene', text: `Setting: ${valueOf(tpl, v, 's', 'en')}.` });
  segs.push({ k: 'comp', text: st.comp });
  segs.push({ k: 'light', text: st.light });
  if (v.b) segs.push({ k: 'mood', text: `The image conveys this benefit and mood: ${v.b}.` });
  segs.push(
    v.t
      ? { k: 'text', text: `Add the exact text "${v.t}" in a bold, clean sans-serif font, large and perfectly legible, placed where it doesn’t cover the product.` }
      : { k: 'text', text: 'Keep the image free of added text: only the writing already printed on the product appears.' },
  );
  segs.push({ k: 'format', text: `Aspect ratio ${o.ratio}, high resolution, premium e-commerce quality.` });
  return { segs };
}

function mediaEdit(tpl, v) {
  const keep = v.g && v.g.trim() ? v.g.trim() : 'the product, its label and colours, the framing, the lighting and the background';
  return {
    segs: [
      { k: 'action', text: `Edit the attached image: ${valueOf(tpl, v, 'k', 'en')}.` },
      { k: 'keep', text: `Keep everything else exactly the same: ${keep}.` },
      { k: 'light', text: 'Make the change look natural, with consistent lighting, shadows, reflections and perspective.' },
      { k: 'format', text: 'Return the same aspect ratio and resolution as the original.' },
    ],
  };
}

function mediaVideo(tpl, v, o) {
  const tool = o.vtool || 'veo';
  let d = Number(o.vdur) || 8;
  if (tool === 'veo') d = d <= 4 ? 4 : d <= 6 ? 6 : 8;
  else d = d <= 5 ? 5 : 10;
  const P = valueOf(tpl, v, 'p', 'en');
  const A = valueOf(tpl, v, 'a', 'en');
  const segs = [];
  if (o.ref === 'yes') segs.push({ k: 'ref', text: 'Animate the attached product image; the product stays exactly identical throughout (same shape, colours and label).' });
  segs.push({ k: 'camera', text: `${CAM[o.cam] || CAM.push}:` });
  segs.push({ k: 'subject', text: `${P}, ${A}${v.s ? `, ${v.s}` : ''}.` });
  segs.push({ k: 'style', text: `Premium commercial look, realistic physics and lighting, one single continuous action${v.b ? `; mood: ${v.b}` : ''}.` });
  if (tool === 'veo') {
    if (v.d) segs.push({ k: 'dialogue', text: `A warm voice says: "${v.d}"` });
    if (AUDIO[o.audio]) segs.push({ k: 'audio', text: AUDIO[o.audio] });
    segs.push({ k: 'format', text: `${o.vratio} aspect ratio, ${d} seconds. The video contains no on-screen text and no subtitles.` });
  } else {
    segs.push({ k: 'format', text: `${o.vratio} aspect ratio, ${d} seconds, smooth natural motion.` });
  }
  const neg = tool === 'kling' ? 'blurry, distorted product, warped or changing label, morphing, extra objects, extra fingers, flicker, jitter, on-screen text, subtitles, watermark, low quality' : '';
  return { segs, neg };
}

/* ------------------------------ Prompts d'écriture ----------------------------- */

/**
 * Assemble un prompt.
 * @param {object} tpl   modèle (TEMPLATES)
 * @param {object} v     valeurs des champs
 * @param {object} o     options choisies
 * @param {object} cfg   { L: 'fr'|'en'|'ar', expert: bool, ask: bool, brand: string }
 * @returns {{ kind: 'chat'|'media', blocks: {k, label, body}[], text: string, neg?: string }}
 */
export function buildPrompt(tpl, v, o, cfg) {
  const L = cfg.L || 'fr';
  if (tpl.media) {
    const r = tpl.media === 'image' ? mediaImage(tpl, v, o) : tpl.media === 'edit' ? mediaEdit(tpl, v, o) : mediaVideo(tpl, v, o);
    const blocks = r.segs.map((s) => ({ k: s.k, body: s.text }));
    return { kind: 'media', blocks, text: r.segs.map((s) => s.text).join(' '), neg: r.neg || '' };
  }
  const dur = Number(o.dur) || 30;
  const vars = { w: Math.round(dur * 2.5) };
  for (const k of tpl.opts) vars[k] = optSay(k, o[k], L);
  vars.dur = dur;
  const say = (x) => fill(pick(x, L), vars);
  const expert = !!cfg.expert;

  const blocks = [];
  if (tpl.role) blocks.push({ k: 'role', body: say(tpl.role) });

  // Contexte : les champs remplis (et les requis vides, avec un repère), les longs textes dans leur propre bloc
  const lines = [];
  const docs = [];
  for (const k of tpl.fields) {
    const val = valueOf(tpl, v, k, L);
    if (!val) continue;
    const F = FIELDS[k];
    if (F.area) docs.push({ k, label: pick(F.label, L), tag: F.tag, val });
    else lines.push(`- ${pick(F.label, L)}${L === 'fr' ? ' : ' : ': '}${val}`);
  }
  if (lines.length) blocks.push({ k: 'context', body: lines.join('\n') });
  for (const d of docs) blocks.push({ k: 'context', doc: d.tag, label: d.label, body: d.val });
  if (cfg.brand) blocks.push({ k: 'brand', body: cfg.brand });

  const task = tpl.task && !tpl.task.fr ? tpl.task[o.stage || o.level] || Object.values(tpl.task)[0] : tpl.task;
  blocks.push({ k: 'task', body: say(task) });
  if (expert && tpl.method) blocks.push({ k: 'method', body: say(tpl.method) });

  const rules = (expert ? tpl.rules : tpl.rules.slice(0, 3)).map(say);
  if (tpl.honest) rules.push(say(SH.honest));
  if (rules.length) blocks.push({ k: 'rules', body: rules.map((r) => `- ${r}`).join('\n') });
  if (expert && tpl.examples) blocks.push({ k: 'examples', body: `${say(SH.exIntro)}\n${say(tpl.examples)}` });

  let fmt = say(tpl.format);
  if (expert && tpl.direct) fmt += ` ${say(SH.direct)}`;
  blocks.push({ k: 'format', body: fmt });

  if (expert && tpl.check?.length) {
    const head = say(tpl.score ? SH.score : SH.checkIntro);
    const crit = tpl.check.map((c) => `- ${say(c)}`).join('\n');
    blocks.push({ k: 'check', body: `${head}\n${crit}${tpl.recommend ? `\n${say(SH.recommend)}` : ''}` });
  } else if (tpl.recommend && !expert) {
    blocks.push({ k: 'check', body: say(SH.recommend) });
  }
  if (cfg.ask) blocks.push({ k: 'missing', body: say(SH.ask) });
  else if (expert) blocks.push({ k: 'missing', body: say(SH.assume) });

  return { kind: 'chat', blocks, text: render(blocks, L, expert) };
}

/** Texte final : balises en mode expert (Claude, ChatGPT et Gemini les lisent bien), titres en mode rapide. */
export function render(blocks, L, expert) {
  const out = [];
  for (const b of blocks) {
    if (b.k === 'role') {
      out.push(b.body);
      continue;
    }
    const S = SECTIONS[b.k];
    if (expert) {
      const tag = b.doc || S.tag;
      out.push(`<${tag}>\n${b.body}\n</${tag}>`);
    } else {
      const label = b.doc ? b.label : pick(S.label, L);
      const sep = L === 'fr' ? ' :' : ':';
      out.push(b.k === 'task' || b.k === 'format' || b.k === 'missing' ? `${label}${sep} ${b.body}` : `${label}${sep}\n${b.doc ? `"""\n${b.body}\n"""` : b.body}`);
    }
  }
  return out.join('\n\n');
}

/** Force du prompt (0 à 100) et le prochain conseil. */
export function strength(tpl, v, cfg) {
  const filled = (k) => v[k] && String(v[k]).trim().length > 2;
  const req = tpl.req.filter(filled).length / Math.max(1, tpl.req.length);
  const opt = tpl.fields.filter((k) => !tpl.req.includes(k));
  const optN = opt.length ? opt.filter(filled).length / opt.length : 1;
  let s = 30 + req * 50 + optN * 10;
  if (tpl.media) s += 10;
  else {
    if (cfg.expert) s += 6;
    if (cfg.brand) s += 4;
  }
  s = Math.round(Math.min(100, s));
  const missing = tpl.req.find((k) => !filled(k)) || opt.find((k) => !filled(k));
  return { score: s, missing };
}
