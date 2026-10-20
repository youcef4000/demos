// Programme Hooked Academy — modules, leçons, scènes animées, quiz et exercices.
// Les leçons « voix enregistrée » ont des scènes calées au dixième de seconde sur la voix off montée.
// Les autres ont leur texte « à dire » (say) : le studio de l'équipe l'affiche en prompteur pendant
// que l'animation tourne, pour enregistrer la voix off en darija parfaitement synchronisée.

import { MODULES_IA } from './programme-ia.js';
import { OVERLAY } from './i18n/index.js';

/**
 * Deux formations distinctes :
 *  - « creative » : bienvenue M00 (m0), puis modules M01 à M12, des bases au projet final, sans IA ;
 *  - « ia »       : bienvenue IA00 (ia0), puis modules IA01 à IA09, l'IA créative puis la vente.
 * Chaque formation a son identité (couleur, icône), sa progression et sa fin.
 */
export const TRACKS = [
  { id: 'creative', code: 'M', title: 'Formation Créative', ar: 'التكوين الإبداعي', color: '#e0be55', icon: 'film', pitch: 'Comprendre ce qui fait vendre une publicité, et la produire avec ton téléphone, CapCut et Canva.' },
  { id: 'ia', code: 'IA', title: 'Formation IA', ar: 'تكوين الذكاء الاصطناعي', color: '#c8b6ff', icon: 'sparkles', pitch: 'Prompting, images et vidéos IA, voix, UGC, cinématique — puis analyser, vendre et signer tes clients.' },
];

export const PARTS = [
  { id: 'p1', n: 1, track: 'creative', title: 'Les fondamentaux', ar: 'الأساسيات', pitch: 'Comprendre ce qui fait vendre une créative, et la produire sans IA.' },
  { id: 'p2', n: 2, track: 'ia', title: 'L’IA créative', ar: 'الذكاء الاصطناعي الإبداعي', pitch: 'Prompting, images, vidéos, voix, UGC et cinématique.' },
  { id: 'p3', n: 3, track: 'ia', title: 'Vendre son savoir-faire', ar: 'بيع خدماتك', pitch: 'Analyser, itérer et signer ses premiers clients.' },
];

const MODULES_1 = [
  // Bienvenue (leçon 00) : ce qui attend l'étudiant et comment réussir. Ouverte à tous, même en démo.
  // Texte « say » en darija (écriture arabe) : prompteur de l'enregistrement, ou texte de la voix clonée.
  {
    id: 'm0',
    n: 0,
    part: 'p1',
    intro: true,
    title: 'Bienvenue',
    ar: 'مرحبا بيك',
    color: '#e0be55',
    icon: 'play',
    pitch: 'Ce qui t’attend dans la formation, et ce qu’il faut faire pour la réussir.',
    lessons: [
      {
        id: 'm0-l1',
        n: 0,
        title: 'Bienvenue dans la Formation Créative',
        ar: 'مرحبا بيك في التكوين الإبداعي',
        scenes: [
          { type: 'title', kicker: 'Module 00 · Bienvenue', sub: 'Ce qui t’attend, et ce qu’il faut faire pour réussir', say: 'مرحبا بيك في الفورماسيون الكرياتيف تاع Hooked Academy! قبل ما نبداو، حبيت نقولك واش راك رايح تلقى هنا، وواش لازم عليك دير باش تنجح.' },
          { type: 'big', kicker: 'Ton objectif', text: 'Faire des pubs qui *arrêtent le scroll*… et qui *vendent*.', say: 'الهدف تاعنا واضح: تولّي تدير إعلانات توقّف السكرول، وفوق كلش… تبيع.' },
          {
            type: 'cards',
            title: 'Ce qui t’attend',
            items: [
              { icon: 'hook', label: 'Comprendre', sub: 'Hook, structure, formules de vente', c: 'hook' },
              { icon: 'video', label: 'Produire', sub: 'Ton téléphone, CapCut, Canva, l’UGC', c: 'body' },
              { icon: 'diamond', label: 'Bâtir ta marque', sub: 'Le brand content qui crée du prestige', c: 'cta' },
            ],
            say: 'راك رايح تفهم واش اللي يخلّي إعلان يبيع: الهوك، الهيكل، والفورمولات تاع البيع. من بعد تتعلم تنتج بالتيليفون تاعك، بـ CapCut و Canva، وتدخل لعالم الـ UGC. وفي الأخير تتعلم كيفاش تبني ماركة عندها قيمة وهيبة.',
          },
          {
            type: 'checklist',
            title: 'Pour réussir',
            items: ['Une leçon par jour : *10 minutes* suffisent', 'Fais *l’exercice*, ne te contente pas de regarder', 'Réussis le *quiz* avant de passer à la suite', 'Publie, teste, *recommence*'],
            say: 'باش تنجح، كاين أربعة قواعد: درس واحد في النهار، عشر دقايق برك. دير التمرين، ما تكتفاش بالشوف. جاوب على الكويز قبل ما تفوت للدرس اللي موراه. ومن بعد: انشر، جرّب، وعاود.',
          },
          { type: 'quote', text: 'Une créative parfaite qui reste dans ton téléphone ne vend *rien*.', say: 'وتفكّر مليح: كرياتيف مليحة تبقى في التيليفون تاعك ما تبيع والو. اللي يفرق هو الخدمة.' },
          { type: 'outro', text: 'On commence ?', say: 'يلا، نبداو! أول حاجة: نوريك كيفاش تستعمل المنصة.' },
        ],
        key: ['L’objectif : des pubs qui arrêtent le scroll et qui vendent.', 'Le parcours : comprendre, produire, puis bâtir ta marque.', 'Une leçon par jour, l’exercice à chaque fois, le quiz avant d’avancer.'],
        quiz: [{ q: 'Quelle est la meilleure façon d’avancer dans la formation ?', a: ['Tout regarder en une soirée', 'Une leçon par jour, avec l’exercice et le quiz', 'Sauter les exercices'], ok: 1, why: 'La régularité et la pratique font la différence.' }],
      },
      {
        id: 'm0-l2',
        n: 1,
        title: 'Prise en main de la plateforme',
        ar: 'التعرّف على المنصة',
        scenes: [
          { type: 'title', sub: 'Où trouver quoi, et comment avancer chaque jour', say: 'Avant la première leçon, faisons le tour de la plateforme : tes leçons, tes exercices, tes ressources et ta progression.' },
          {
            type: 'cards',
            title: 'La page de la *formation*',
            items: [
              { icon: 'layers', label: 'Les modules', sub: 'Dans l’ordre, jusqu’au projet final', c: 'gold' },
              { icon: 'image', label: 'Les cartes de leçon', sub: 'Une image et une courte intro', c: 'hook' },
              { icon: 'chart', label: 'La barre de progression', sub: 'Ce qui est fait, ce qui reste', c: 'body' },
            ],
            say: 'Sur la page de la formation, les modules sont dans l’ordre. Chaque leçon a sa carte : une image, une courte intro. Et la barre de progression montre ce qui est fait.',
          },
          {
            type: 'steps',
            title: 'Une *leçon*, dans l’ordre',
            items: [
              { k: '1', label: 'La vidéo', sub: 'Courte, une seule idée', c: 'hook' },
              { k: '2', label: 'L’essentiel', sub: 'Les 3 points à retenir', c: 'gold' },
              { k: '3', label: 'L’exercice', sub: 'La to-do list, cochée après la vidéo', c: 'body' },
              { k: '4', label: 'Le quiz', sub: 'Pour vérifier que c’est acquis', c: 'cta' },
              { k: '5', label: 'Les ressources', sub: 'Modèles, prompts et PDF à copier', c: 'ia' },
            ],
            say: 'Une leçon se suit dans l’ordre : la vidéo, l’essentiel à retenir, l’exercice avec sa to-do list à cocher après la vidéo, le quiz, puis les ressources à copier.',
          },
          {
            type: 'checklist',
            title: 'Ta *motivation*',
            items: ['Des *XP* à chaque leçon, quiz et exercice', 'Ton *niveau* qui monte', 'Ta *série* : les jours d’affilée', 'Des *badges* à débloquer'],
            say: 'Chaque leçon, quiz et exercice te rapporte des XP, et ton niveau monte. Ta série compte tes jours d’affilée : ne la casse pas. Et des badges se débloquent en chemin.',
          },
          {
            type: 'cards',
            title: 'Les *autres pages*',
            items: [
              { icon: 'book', label: 'Ressources', sub: 'Tous les modèles, au même endroit', c: 'gold' },
              { icon: 'help', label: 'Aide', sub: 'Questions fréquentes et assistant', c: 'body' },
              { icon: 'user', label: 'Profil', sub: 'Ta progression, ton certificat', c: 'cta' },
              { icon: 'globe', label: 'Réglages', sub: 'FR, EN, AR · mode clair ou sombre', c: 'ia' },
            ],
            say: 'Ressources : tous les modèles au même endroit. Questions fréquentes et assistant : une réponse rapide. Profil : ta progression et ton certificat. Et les réglages : la langue, le mode clair ou sombre.',
          },
          {
            type: 'big',
            kicker: 'La règle d’or',
            text: 'Une leçon *par jour*. Et sa *to-do list*, cochée.',
            sub: 'Au bout du parcours : ton projet final, une pub de 30 secondes',
            say: 'La règle d’or : une leçon par jour, avec sa to-do list cochée. La régularité fait la différence. Au bout du parcours : ton projet final, une pub de trente secondes.',
          },
          { type: 'outro', say: 'Leçon suivante : qu’est-ce qu’une créative ?' },
        ],
        key: [
          'La page de la formation : les modules dans l’ordre, une carte par leçon (image, courte intro) et ta barre de progression.',
          'Une leçon : la vidéo, L’essentiel, l’Exercice avec sa to-do list à cocher après la vidéo, le Quiz, puis les Ressources (modèles, prompts, PDF).',
          'XP, niveau, série et badges suivent ta régularité ; Ressources, Questions fréquentes, assistant et Profil t’accompagnent. La règle d’or : une leçon par jour et sa to-do list.',
        ],
        quiz: [
          { q: 'Quand fais-tu la to-do list de l’exercice ?', a: ['Juste après la vidéo de la leçon', 'À la fin de la formation', 'Jamais, la vidéo suffit'], ok: 0, why: 'C’est en pratiquant tout de suite que la leçon devient un savoir-faire.' },
          { q: 'Tu bloques sur une question simple. Où regardes-tu d’abord ?', a: ['Dans les questions fréquentes, ou tu demandes à l’assistant', 'Tu abandonnes la leçon', 'Tu recommences la formation'], ok: 0, why: 'Les réponses rapides sont là ; pour le reste, l’équipe répond sur WhatsApp.' },
        ],
        todo: [
          'Ouvre la page de la formation et repère le module du projet final',
          'Ouvre la leçon suivante et repère ses onglets : L’essentiel, Exercice, Quiz',
          'Choisis ta langue et ton mode, clair ou sombre',
          'Ouvre ton profil : regarde ta progression et ton niveau',
          'Cherche une question dans les questions fréquentes, ou pose-la à l’assistant',
          'Coche la leçon et passe le quiz',
        ],
      },
    ],
  },
  {
    id: 'm1',
    n: 1,
    part: 'p1',
    title: 'Les bases de la créative',
    ar: 'أساسيات الكرياتيف',
    color: '#e0be55',
    icon: 'spark',
    pitch: 'Ce qu’est une créative, ses trois formats et les outils pour la produire.',
    lessons: [
      {
        id: 'm1-l1',
        n: 1,
        title: 'Qu’est-ce qu’une créative ?',
        ar: 'وشنو هي لا كرياتيف',
        voice: true,
        video: 'video/m1-l1.mp4',
        audio: 'video/voix/m1-l1.m4a',
        poster: 'video/m1-l1.jpg',
        scenes: [
          { type: 'title', d: 3.1, kicker: 'Module 01 · Leçon 01', sub: 'Définition et types de créatives' },
          { type: 'big', d: 3.4, kicker: 'Définition', text: 'La créative, c’est le *contenu visuel* de ta *publicité*.', ar: 'الكرياتيف هي المحتوى البصري للإعلان' },
          {
            type: 'flow',
            d: 7.7,
            title: 'Elle fait la promotion d’un produit',
            nodes: [
              { icon: 'box', label: 'Ton produit', at: 1.0 },
              { icon: 'sparkles', label: 'La créative', at: 2.5 },
              { icon: 'globe', label: 'Les plateformes', sub: 'Facebook · Instagram · TikTok', at: 5.4 },
            ],
          },
          {
            type: 'cards',
            d: 6.9,
            items: [
              { icon: 'video', label: 'Vidéo', at: 1.0, c: 'hook' },
              { icon: 'image', label: 'Image', at: 2.9, c: 'body' },
              { icon: 'carousel', label: 'Carrousel', at: 3.8, c: 'cta' },
            ],
          },
          {
            type: 'phone',
            d: 10.9,
            mode: 'video',
            kicker: 'Type 01',
            title: 'La vidéo',
            ar: 'الفيديو',
            bg: 'teal',
            caption: 'Le parfum qui tient toute la journée ✨',
            captions: [
              { t: 'NOUVEAU', at: 1.2 },
              { t: '15 à 30 s', at: 4.4 },
              { t: 'On te montre', at: 7.2 },
              { t: 'Livraison 58 wilayas', at: 9.2 },
            ],
            side: [
              { icon: 'play', label: 'Une vidéo courte', sub: 'Le format roi des réseaux', at: 0.9 },
              { icon: 'clock', label: '15 à 30 secondes', sub: 'Assez pour montrer, pas pour lasser', at: 4.2 },
              { icon: 'eye', label: 'On montre le produit', sub: 'En action, sous tous les angles', at: 7.4 },
            ],
          },
          {
            type: 'phone',
            d: 9.2,
            mode: 'image',
            kicker: 'Type 02',
            title: 'L’image',
            ar: 'الصورة',
            align: 'right',
            bg: 'sable',
            headline: 'Un parfum qui *reste* toute la journée',
            caption: 'Découvre NOOR, notre parfum signature.',
            side: [
              { icon: 'image', label: 'Une seule image', sub: 'Lisible en une seconde', at: 1.2, c: 'body' },
              { icon: 'target', label: 'Produit + message', sub: 'Une idée, pas dix', at: 3.4, c: 'body' },
              { icon: 'cart', label: 'Un bouton d’action', sub: 'Commander, découvrir…', at: 5.8, c: 'cta' },
            ],
          },
          {
            type: 'phone',
            d: 8,
            mode: 'carousel',
            kicker: 'Type 03',
            title: 'Le carrousel',
            ar: 'الكاروسيل',
            bg: 'teal',
            swipeAt: 3.4,
            swipe: 0.95,
            caption: 'Glisse pour tout savoir →',
            side: [
              { icon: 'carousel', label: 'Une suite d’images', sub: 'Que l’on fait défiler', at: 0.6, c: 'cta' },
              { icon: 'arrow', label: 'Une image après l’autre', sub: 'Chaque slide apporte une info', at: 3.4, c: 'cta' },
              { icon: 'cart', label: 'Jusqu’à la commande', sub: 'La dernière slide pousse à l’action', at: 5.6, c: 'cta' },
            ],
          },
          { type: 'outro', d: 3, text: 'Vidéo, image, carrousel : trois formats, un seul but — *vendre*.' },
        ],
        key: [
          'Une créative est le contenu visuel d’une publicité : c’est elle qui fait la promotion du produit sur les plateformes.',
          'Il existe trois formats : la vidéo (courte, 15 à 30 secondes), l’image et le carrousel.',
          'Chaque format a son rôle : la vidéo montre, l’image résume, le carrousel raconte slide après slide.',
        ],
        quiz: [
          { q: 'Une créative, c’est…', a: ['Le budget de la campagne', 'Le contenu visuel de la publicité', 'Le ciblage de l’audience'], ok: 1, why: 'La créative est ce que le client voit : la vidéo, l’image ou le carrousel.' },
          { q: 'Quel format montre plusieurs images que l’on fait défiler ?', a: ['La vidéo', 'L’image', 'Le carrousel'], ok: 2, why: 'Le carrousel est une suite d’images : chaque slide apporte une information.' },
          { q: 'Une bonne image publicitaire contient…', a: ['Un seul message clair et un bouton d’action', 'Le plus d’informations possible', 'Uniquement le logo'], ok: 0, why: 'Une image se lit en une seconde : un produit, un message, une action.' },
        ],
        widget: 'formats',
      },
      {
        id: 'm1-l2',
        n: 2,
        title: 'Les outils nécessaires',
        ar: 'الأدوات اللازمة',
        voice: true,
        video: 'video/m1-l2.mp4',
        audio: 'video/voix/m1-l2.m4a',
        poster: 'video/m1-l2.jpg',
        scenes: [
          { type: 'title', d: 3.2, kicker: 'Module 01 · Leçon 02', sub: 'CapCut · Canva · l’IA' },
          { type: 'stat', d: 2.7, value: '3', label: 'outils *indispensables*', ar: 'ثلاث أدوات', ring: true, ringDur: 2, countDur: 1 },
          {
            type: 'timeline',
            d: 9.9,
            kicker: 'Outil 01 · CapCut',
            title: 'Le gros du travail : la vidéo',
            app: 'CapCut',
            clipsAt: 2.4,
            clipStep: 0.4,
            playEnd: 9.6,
            clips: [
              { label: 'Hook', c: 'hook', w: 2 },
              { label: 'Produit', c: 'body', w: 3 },
              { label: 'Démo', c: 'body', w: 3 },
              { label: 'Détails', c: 'body', w: 2 },
              { label: 'CTA', c: 'cta', w: 2 },
            ],
            tracks: [
              { label: 'Sous-titres', c: 'gold', icon: 'captions', from: 0.02, to: 0.96, at: 6.6 },
              { label: 'Musique', c: 'ia', icon: 'music', from: 0, to: 1, at: 7 },
            ],
            cuts: [
              { x: 0.17, at: 7.6 },
              { x: 0.58, at: 8 },
            ],
            steps: [
              { icon: 'download', label: 'Importer les rushes', at: 2 },
              { icon: 'scissors', label: 'Couper, monter', at: 3.6 },
              { icon: 'layers', label: 'Ordonner chaque plan', at: 5.1 },
              { icon: 'captions', label: 'Sous-titres, musique', at: 6.6 },
            ],
          },
          {
            type: 'layers',
            d: 15.4,
            kicker: 'Outil 02 · Canva',
            title: 'Des templates pour tes *images*',
            bg: 'teal',
            layers: [
              { label: 'Un template de départ', kind: 'bg' },
              { label: 'La photo produit', kind: 'product' },
              { label: 'Le titre', kind: 'title' },
              { label: 'Le badge', kind: 'badge' },
              { label: 'Le bouton', kind: 'cta' },
            ],
          },
          {
            type: 'cards',
            d: 6.1,
            kicker: 'Outil 03 · L’IA',
            title: 'ChatGPT, ou une autre IA',
            items: [
              { icon: 'chat', label: 'ChatGPT', c: 'cta', at: 0.3 },
              { icon: 'sparkles', label: 'Claude', c: 'ia', at: 3.1 },
              { icon: 'spark', label: 'Gemini', c: 'body', at: 4.4 },
            ],
          },
          {
            type: 'prompt',
            d: 17.3,
            kicker: 'Outil 03 · L’IA',
            app: 'ChatGPT',
            cps: 30,
            segments: [{ text: 'Écris 3 hooks pour une vidéo de parfum, en darija, ton direct.' }],
            result: { kind: 'text', cps: 36, lines: ['1. « Ton parfum disparaît avant midi ? »', '2. « 3 secondes pour sentir la différence »', '3. « Ce que personne ne te dit sur les parfums »'] },
            side: [
              { label: 'Des idées', sub: 'Angles, hooks, concepts', at: 2, c: 'ia' },
              { label: 'Des scripts', sub: 'Le texte de tes vidéos', at: 6.5, c: 'ia' },
              { label: 'Des prompts', sub: 'Pour les images et vidéos IA : on y revient dans la formation IA', at: 11, c: 'ia' },
            ],
          },
          { type: 'outro', d: 3, text: 'Installe CapCut et Canva, et ouvre un compte sur une IA.' },
        ],
        key: [
          'Trois outils suffisent pour suivre la formation : CapCut (vidéo), Canva (images, carrousels) et une IA — ChatGPT, Claude ou Gemini — (idées, scripts, prompts).',
          'CapCut, c’est le gros du travail : couper, ordonner les plans, ajouter sous-titres et musique.',
          'Canva est connu pour ses templates : on part d’un modèle pour les images et les créatives statiques.',
          'Les trois existent en version gratuite : tu peux commencer dès aujourd’hui.',
        ],
        quiz: [
          { q: 'Quel outil sert au montage vidéo ?', a: ['Canva', 'CapCut', 'ChatGPT'], ok: 1, why: 'CapCut : couper, ordonner, sous-titrer, exporter.' },
          { q: 'Pour écrire des hooks et des scripts, on utilise…', a: ['Une IA comme ChatGPT, Claude ou Gemini', 'CapCut', 'Aucun outil'], ok: 0, why: 'L’IA t’aide à trouver des idées, à écrire des scripts et des prompts.' },
          { q: 'Canva est surtout connu pour…', a: ['Ses templates', 'Le montage vidéo', 'La publicité payante'], ok: 0, why: 'On part d’un template et on l’adapte à son produit : images, carrousels, créatives statiques.' },
        ],
        widget: 'outils',
        res: [
          { title: 'Prompt de départ — hooks', text: 'Tu es un créateur de publicités pour les réseaux sociaux en Algérie. Écris 10 hooks (phrases d’accroche de moins de 8 mots) pour une vidéo qui présente [produit] à [cible]. Mélange questions, chiffres et contrastes. Ton direct, en darija écrite en lettres latines.' },
        ],
      },
      {
        id: 'm1-l3',
        n: 3,
        title: 'Formats et ratios par plateforme',
        ar: 'المقاسات حسب المنصة',
        scenes: [
          { type: 'title', sub: '9:16 · 4:5 · 1:1 · 16:9', say: 'Dans cette leçon, on voit les bons formats d’image pour chaque plateforme.' },
          { type: 'big', text: 'Le bon format, c’est *plus d’écran* pour ta pub.', sub: 'Une créative mal cadrée se fait couper… ou ignorer.', say: 'Le format, c’est la forme de ta vidéo. Le bon format te donne plus de place sur l’écran du téléphone, donc plus d’attention.' },
          { type: 'ratio', safe: true, title: 'Les 4 formats à connaître', say: 'Le 9:16, vertical plein écran, pour les Reels, TikTok et les Stories. Le 4:5 pour le fil Instagram et Facebook. Le 1:1, carré, pour les carrousels. Et le 16:9 pour YouTube. Attention aux zones de sécurité : en haut et en bas, l’interface de la plateforme cache ton contenu.' },
          { type: 'checklist', title: 'La règle simple', items: ['Tourne et monte en *9:16*', 'Garde le texte au centre de l’écran', 'Décline en *4:5* pour le fil', 'Vérifie sur ton propre téléphone avant de publier'], say: 'La règle simple : tourne en vertical, garde ton texte au centre, décline en 4:5 pour le fil, et vérifie toujours sur ton téléphone avant de publier.' },
          { type: 'outro', text: 'Crée en vertical, pense mobile.', say: 'Retiens : on crée en vertical, on pense mobile.' },
        ],
        key: ['9:16 pour Reels, TikTok et Stories ; 4:5 pour le fil ; 1:1 pour les carrousels ; 16:9 pour YouTube.', 'Les zones de sécurité : le haut et le bas de l’écran sont cachés par l’interface.', 'Produis en 9:16, puis décline les autres formats.'],
        quiz: [
          { q: 'Quel format pour une vidéo TikTok ou Reels ?', a: ['16:9', '9:16', '1:1'], ok: 1, why: 'Vertical plein écran : 9:16.' },
          { q: 'Où éviter de placer ton texte en 9:16 ?', a: ['Au centre', 'Tout en haut et tout en bas', 'Nulle part'], ok: 1, why: 'Le haut et le bas sont recouverts par les boutons, la légende et le CTA de la plateforme.' },
        ],
        widget: 'ratio',
      },
      {
        id: 'm1-l4',
        n: 4,
        title: 'L’objectif d’une créative',
        ar: 'هدف الكرياتيف',
        scenes: [
          { type: 'title', sub: 'Une créative = un objectif', say: 'Avant de créer quoi que ce soit, il faut savoir à quoi va servir ta créative.' },
          {
            type: 'funnel',
            title: 'Le parcours du client',
            levels: [
              { label: 'Notoriété', sub: 'On te découvre', c: 'gold' },
              { label: 'Considération', sub: 'On s’intéresse, on compare', c: 'hook' },
              { label: 'Conversion', sub: 'On commande', c: 'cta' },
              { label: 'Fidélisation', sub: 'On revient, on recommande', c: 'body' },
            ],
            say: 'Un client passe par quatre étapes. Il te découvre, il s’intéresse et compare, il commande, puis il revient et te recommande. Chaque étape a besoin d’une créative différente.',
          },
          {
            type: 'cards',
            title: 'Un objectif, un type de créative',
            cols: 3,
            items: [
              { icon: 'eye', label: 'Faire connaître', sub: 'Vidéo courte, hook fort, marque visible', c: 'hook' },
              { icon: 'search', label: 'Convaincre', sub: 'Démonstration, comparaison, preuves', c: 'body' },
              { icon: 'cart', label: 'Faire acheter', sub: 'Offre claire, urgence honnête, CTA', c: 'cta' },
            ],
            say: 'Pour faire connaître, une vidéo courte avec un hook fort. Pour convaincre, une démonstration et des preuves. Pour faire acheter, une offre claire et un appel à l’action.',
          },
          { type: 'quote', text: 'Une créative qui veut tout faire *ne fait rien*.', say: 'Retiens ça : une créative qui veut tout faire ne fait rien. Un objectif à la fois.' },
          { type: 'outro', say: 'Dans le prochain module, on attaque la structure d’une créative qui vend.' },
        ],
        key: ['Le client passe par la notoriété, la considération, la conversion puis la fidélisation.', 'Chaque étape demande une créative différente.', 'Une créative = un objectif : sinon elle ne fait rien.'],
        quiz: [
          { q: 'Pour faire acheter, ta créative doit surtout contenir…', a: ['Une offre claire et un CTA', 'Une musique tendance', 'Le plus d’effets possible'], ok: 0, why: 'La conversion se joue sur l’offre et l’appel à l’action.' },
          { q: 'Une créative doit viser…', a: ['Tous les objectifs à la fois', 'Un seul objectif', 'Aucun objectif précis'], ok: 1, why: 'Un objectif clair donne un message clair.' },
        ],
      },
    ],
  },

  {
    id: 'm2',
    n: 2,
    part: 'p1',
    title: 'La structure d’une créative qui vend',
    ar: 'هيكل الكرياتيف',
    color: '#ec7a45',
    icon: 'layers',
    pitch: 'Hook, Body, CTA : la colonne vertébrale de toutes les publicités qui convertissent.',
    lessons: [
      {
        id: 'm2-l1',
        n: 1,
        title: 'Hook · Body · CTA',
        ar: 'هيكل الكرياتيف',
        voice: true,
        video: 'video/m2-l1.mp4',
        audio: 'video/voix/m2-l1.m4a',
        poster: 'video/m2-l1.jpg',
        scenes: [
          { type: 'title', d: 3.7, fr: 'La structure d’une créative', kicker: 'Module 02 · Leçon 01', sub: 'Hook · Body · CTA' },
          {
            type: 'formula',
            d: 10.3,
            kicker: 'Toutes les pubs vidéo',
            title: 'Une pub vidéo = *3 parties*',
            parts: [
              { t: 'Hook', sub: 'Accrocher', c: 'hook', at: 7.3 },
              { t: 'Body', sub: 'Convaincre', c: 'body', at: 7.9 },
              { t: 'CTA', sub: 'Faire agir', c: 'cta', at: 8.5 },
            ],
            chips: [
              { icon: 'camera', label: 'Instagram', c: 'mist', at: 5.2 },
              { icon: 'users', label: 'Facebook', c: 'mist', at: 5.7 },
              { icon: 'music', label: 'TikTok', c: 'mist', at: 6.6 },
            ],
            note: 'Toujours la même structure, quelle que soit la plateforme.',
            noteAt: 9.2,
          },
          {
            type: 'anatomy',
            d: 8,
            kicker: 'Partie 01',
            title: 'Tout se joue au début',
            parts: [
              { k: 'hook', label: 'Hook', from: 0, to: 3, at: 2.4, when: '0 → 3 s', fr: 'Les *3 premières secondes* de la vidéo', frAt: 0.7, ar: 'الثلاث ثواني الأولى من الفيديو', arAt: 1.6 },
              { k: 'body', label: 'Body', from: 3, to: 11 },
              { k: 'cta', label: 'CTA', from: 11, to: 15 },
            ],
          },
          {
            type: 'phone',
            d: 20,
            mode: 'feed',
            flick: true,
            scrollAt: 0.6,
            scrollDur: 15.6,
            hookIndex: 6,
            kicker: 'Pourquoi le hook ?',
            title: 'La partie *la plus importante*',
            bg: 'teal',
            headline: '*Stop.* Ton parfum tient combien de temps ?',
            side: [
              { icon: 'move', label: 'On scrolle sans s’arrêter', sub: 'Facebook, Instagram, TikTok', at: 5 },
              { icon: 'x', label: 'Une seconde pour décider', sub: 'Sinon, on passe à la suivante', at: 13 },
              { icon: 'hook', label: 'Le hook arrête le pouce', sub: 'Et ta vidéo est enfin regardée', at: 16.4, c: 'hook' },
            ],
          },
          {
            type: 'curve',
            d: 11.3,
            kicker: 'Le rôle du hook',
            title: 'Retenir *l’attention*',
            curves: [
              { label: 'Hook faible', c: 'mist', dim: true, pts: [100, 38, 26, 21, 18, 16, 15, 14, 13, 12, 12], at: 1.2 },
              { label: 'Hook fort', c: 'gold', pts: [100, 72, 61, 55, 51, 48, 46, 44, 42, 41, 40], at: 3.8 },
            ],
            marks: [{ x: 0.2, label: '3 s', c: 'hook', at: 2.6 }],
          },
          {
            type: 'anatomy',
            d: 18.2,
            kicker: 'Partie 02',
            title: 'On présente le produit',
            parts: [
              { k: 'hook', label: 'Hook', from: 0, to: 3 },
              {
                k: 'body',
                label: 'Body',
                from: 3,
                to: 11,
                at: 0.3,
                when: 'le cœur',
                ar: 'تعريف المنتج، كيفية الاستخدام، نقاط القوة',
                arAt: 0.6,
                items: [
                  { label: 'Définition du produit', cap: 'C’est quoi ?', at: 0.8 },
                  { label: 'Comment l’utiliser', at: 4.5 },
                  { label: 'Ses points forts', at: 8.2 },
                  { label: 'Le problème qu’il règle', cap: 'Le problème réglé', at: 11.2 },
                ],
              },
              { k: 'cta', label: 'CTA', from: 11, to: 15 },
            ],
          },
          {
            type: 'anatomy',
            d: 17.1,
            kicker: 'Partie 03',
            title: 'On dit quoi faire',
            parts: [
              { k: 'hook', label: 'Hook', from: 0, to: 3 },
              { k: 'body', label: 'Body', from: 3, to: 11 },
              { k: 'cta', label: 'CTA', from: 11, to: 15, at: 1.5, when: '3 à 5 dernières s', fr: 'Un *appel à l’action* — Call To Action', frAt: 3, ar: 'آخر 3 إلى 5 ثواني من الفيديو', arAt: 6.1 },
            ],
          },
          {
            type: 'phone',
            d: 16.8,
            mode: 'image',
            align: 'right',
            kicker: 'Le CTA en action',
            title: 'On guide vers *l’achat*',
            bg: 'or',
            headline: 'Sens bon *jusqu’au soir*',
            btn: 'Acheter maintenant',
            badge: 'Paiement à la livraison',
            caption: 'Commande en 1 clic, on te livre.',
            side: [
              { icon: 'eye', label: 'On montre le produit', sub: 'La personne sait ce qu’elle achète', at: 1, c: 'cta' },
              { icon: 'cart', label: 'On l’invite à acheter', sub: 'Un message direct, sans détour', at: 4.1, c: 'cta' },
              { icon: 'arrow', label: '« Clique sur Acheter »', sub: 'Ou ouvre la page de vente', at: 12.5, c: 'cta' },
            ],
          },
          { type: 'outro', d: 3.2, text: 'Hook, Body, CTA : *accroche*, *convaincs*, *fais agir*.' },
        ],
        key: [
          'Toute pub vidéo — Instagram, Facebook, TikTok — se découpe en trois parties : Hook (accrocher), Body (convaincre), CTA (faire agir).',
          'Le hook, ce sont les 3 premières secondes : la partie la plus importante. Il arrête le scroll et capte l’attention.',
          'Le body présente le produit : ce que c’est, comment l’utiliser, ses points forts et le problème qu’il règle.',
          'Le CTA, ce sont les 3 à 5 dernières secondes : on dit clairement quoi faire — acheter, ouvrir la page de vente.',
        ],
        quiz: [
          { q: 'Que veut dire CTA ?', a: ['Call To Action — appel à l’action', 'Content To Advertise', 'Clic Total Annonce'], ok: 0, why: 'Le CTA dit au client quoi faire maintenant.' },
          { q: 'Combien de temps dure le hook, en général ?', a: ['Les 3 premières secondes', 'Les 30 premières secondes', 'Toute la vidéo'], ok: 0, why: 'C’est dans les toutes premières secondes que l’on décide de rester ou de scroller.' },
          { q: 'Le body sert à…', a: ['Présenter et convaincre', 'Dire au revoir', 'Mettre le logo'], ok: 0, why: 'Définition, utilisation, points forts : le body construit l’envie.' },
          { q: 'Le CTA occupe…', a: ['Les 3 premières secondes', 'Le milieu de la vidéo', 'Les 3 à 5 dernières secondes'], ok: 2, why: 'Le CTA arrive à la fin : il dit quoi faire maintenant que la personne est convaincue.' },
        ],
        widget: 'anatomie',
      },
      {
        id: 'm2-l2',
        n: 2,
        title: 'Le Hook : arrêter le scroll',
        ar: 'الهوك',
        voice: true,
        video: 'video/m2-l2.mp4',
        audio: 'video/voix/m2-l2.m4a',
        poster: 'video/m2-l2.jpg',
        scenes: [
          { type: 'title', d: 3.8, kicker: 'Module 02 · Leçon 02', sub: 'Un seul objectif : stop le scroll' },
          {
            type: 'phone',
            d: 13.6,
            mode: 'feed',
            flick: true,
            scrollAt: 0.5,
            scrollDur: 10.4,
            hookIndex: 6,
            kicker: 'Objectif',
            title: '*Stop* le scroll !',
            ar: 'تحبس البنادم لي راه يسكرولي',
            bg: 'teal',
            headline: '*Stop.* Regarde ça',
            side: [
              { icon: 'target', label: 'Un seul objectif', sub: 'Pas deux, pas trois', at: 0.6, c: 'hook' },
              { icon: 'move', label: 'Arrêter la personne qui scrolle', sub: 'Le pouce va très vite', at: 7.4, c: 'hook' },
              { icon: 'eye', label: 'Pour qu’elle regarde ta vidéo', sub: 'Et capter son attention', at: 11.3, c: 'hook' },
            ],
          },
          {
            type: 'flow',
            d: 14.8,
            title: 'Son *seul* but : qu’on s’arrête',
            nodes: [
              { icon: 'hook', label: 'Le hook arrête', at: 1 },
              { icon: 'eye', label: 'On regarde', sub: 'Sinon, on ne voit rien', at: 5 },
              { icon: 'box', label: 'On découvre le produit', at: 7.8 },
              { icon: 'cart', label: 'On achète', at: 12.8 },
            ],
          },
          { type: 'stat', d: 5.3, value: '3', suffix: 's', label: 'les *premières secondes* de ta créative', ar: 'الثواني الثلاث الأولى', ring: true, ringDur: 3, countDur: 0.8 },
          { type: 'outro', d: 8.2, text: 'Maintenant, place aux *exemples*.' },
        ],
        key: [
          'Le hook a un seul objectif : arrêter la personne qui scrolle, pour qu’elle regarde ta vidéo.',
          'Si personne ne s’arrête, personne ne voit ce que tu vends : tout commence par le hook.',
          'Le hook occupe les 3 premières secondes de la créative.',
        ],
        quiz: [
          { q: 'Quel est l’objectif du hook ?', a: ['Présenter toutes les qualités du produit', 'Arrêter le scroll', 'Donner le prix'], ok: 1, why: 'Un seul but : que la personne s’arrête et regarde.' },
          { q: 'Le hook occupe…', a: ['Les 3 premières secondes', 'Le milieu de la vidéo', 'Les dernières secondes'], ok: 0, why: 'C’est dans les toutes premières secondes que l’on décide de rester ou de scroller.' },
          { q: 'Un hook doit se comprendre…', a: ['Uniquement avec le son', 'Même sans le son', 'Seulement après 10 secondes'], ok: 1, why: 'Beaucoup regardent sans le son : texte à l’écran et image doivent suffire.' },
        ],
      },
      {
        id: 'm2-l3',
        n: 3,
        title: 'Exemples de hooks : positifs et négatifs',
        ar: 'أمثلة على الهوك',
        voice: true,
        video: 'video/m2-l3.mp4',
        audio: 'video/voix/m2-l3.m4a',
        poster: 'video/m2-l3.jpg',
        scenes: [
          { type: 'title', d: 4.6, kicker: 'Module 02 · Leçon 03', sub: 'Des hooks qui marchent en ce moment' },
          {
            type: 'cards',
            d: 7.2,
            title: '3 types de hooks',
            items: [
              { icon: 'smile', label: 'Positif', sub: 'On montre le résultat', c: 'body', at: 0.6 },
              { icon: 'x', label: 'Négatif', sub: 'On part du problème', c: 'danger', at: 1.0 },
              { icon: 'chart', label: 'Statistique', sub: 'Un chiffre qui interpelle', c: 'hook', at: 1.4 },
            ],
          },
          { type: 'big', d: 10, kicker: 'Type 01 · Positif', text: 'On commence par *le résultat* du produit.', ar: 'نبداو بالنتيجة تاع المنتج' },
          {
            type: 'hooks',
            d: 19.9,
            kicker: 'Exemples · hook positif',
            title: 'On montre le résultat',
            family: 'Positif',
            c: 'body',
            items: [
              { text: 'Choufe m3aya résultat hada !', fr: '« Regarde ce résultat avec moi ! »', at: 0.4 },
              { text: 'Ida rak hab tonobiltek tweli hakda, teba3 m3aya', fr: '« Tu veux que ta voiture devienne comme ça ? Suis-moi. »', at: 6.5 },
            ],
            note: 'La personne veut voir la suite : elle *reste*.',
            noteAt: 16.6,
          },
          {
            type: 'flow',
            d: 13.3,
            title: 'Le hook *négatif* : on part du problème',
            nodes: [
              { icon: 'x', label: 'Le problème', sub: 'Celui de ton client', at: 5.4 },
              { icon: 'box', label: 'Ton produit', at: 8.4 },
              { icon: 'check', label: 'La solution', sub: 'Chaque produit règle un problème', at: 12.6 },
            ],
          },
          {
            type: 'hooks',
            d: 30.6,
            kicker: 'Exemples · hook négatif',
            title: 'On nomme le problème',
            family: 'Négatif',
            c: 'cta',
            items: [
              { text: 'Hablek namousse ou ma lkitlouche hal ?', fr: '« Les moustiques te rendent fou et tu n’as pas trouvé de solution ? »', at: 8.4 },
              { text: 'Cha3rek hrache hakda ou ma 3reftiche wech diri ?', fr: '« Tes cheveux sont secs comme ça et tu ne sais pas quoi faire ? »', at: 18.4 },
            ],
            note: 'La personne *se reconnaît* : elle veut la solution.',
            noteAt: 26,
          },
          { type: 'outro', d: 3, text: 'Positif : le résultat. Négatif : *le problème*.' },
        ],
        key: [
          'Trois types de hooks : positif (le résultat), négatif (le problème), statistique (un chiffre).',
          'Hook positif : on commence par le résultat du produit — « Choufe m3aya résultat hada ! ».',
          'Hook négatif : on part du problème que le produit règle — la personne se reconnaît et veut la solution.',
        ],
        quiz: [
          { q: '« Tes cheveux sont secs et tu ne sais pas quoi faire ? » est un hook…', a: ['Positif', 'Négatif', 'Statistique'], ok: 1, why: 'Il nomme un problème : c’est un hook négatif.' },
          { q: 'Un hook positif commence par…', a: ['Le prix', 'Le résultat du produit', 'Le logo de la marque'], ok: 1, why: 'On montre tout de suite le résultat que la personne veut.' },
          { q: 'Un hook parle surtout…', a: ['De la marque', 'Du client et de son problème ou de son envie', 'De la livraison'], ok: 1, why: 'Le client s’arrête quand il se reconnaît.' },
        ],
        widget: 'hooks',
        res: [{ title: 'Prompt — 10 hooks en 3 familles', text: 'Agis comme un copywriter publicitaire. Produit : [produit]. Cible : [cible]. Problème principal : [problème]. Écris 10 hooks de moins de 10 mots : 4 positifs (résultat désiré), 4 négatifs (problème ou erreur), 2 avec un emplacement [chiffre] que je remplirai avec une donnée vraie. Classe-les du plus fort au plus faible.' }],
      },
      {
        id: 'm2-l4',
        n: 4,
        title: 'Le hook statistique',
        ar: 'الهوك الإحصائي',
        voice: true,
        video: 'video/m2-l4.mp4',
        audio: 'video/voix/m2-l4.m4a',
        poster: 'video/m2-l4.jpg',
        scenes: [
          { type: 'title', d: 4.6, kicker: 'Module 02 · Leçon 04', sub: 'Un chiffre qui interpelle' },
          {
            type: 'checklist',
            d: 13.8,
            title: 'Un bon hook *statistique*',
            items: [
              { t: 'Un chiffre *vrai*, trouvé dans une étude ou sur Google', at: 6.2 },
              { t: 'Placé *dès la première seconde*', at: 11 },
              { t: 'Qui parle *du problème* de ton client', at: 12.4 },
            ],
          },
          {
            type: 'hooks',
            d: 25.4,
            kicker: 'Exemples · hook statistique',
            title: 'Un chiffre, et on s’arrête',
            family: 'Statistique',
            c: 'hook',
            items: [
              { text: '1 femme sur 2 t3ani men tassakoute cha3re', fr: '« 1 femme sur 2 souffre de chute de cheveux »', at: 1.6 },
              { text: '60 % m rdjel ma yelkawche les pointures kbar f les baskets', fr: '« 60 % des hommes ne trouvent pas leur grande pointure en baskets »', at: 12.7 },
            ],
            note: 'Exemples du cours : vérifie toujours *ta* source.',
            noteAt: 21,
          },
          { type: 'quote', d: 5.9, text: 'Un chiffre doit être *vrai* : sinon, tu perds la confiance.' },
          { type: 'outro', d: 3, text: 'Positif, négatif, statistique : *teste les trois*.' },
        ],
        key: [
          'Le hook statistique ouvre la vidéo avec un chiffre qui interpelle.',
          'Le chiffre doit être vrai et vérifiable : cherche une étude ou une source fiable.',
          'Il parle du problème du client : « 1 femme sur 2… », « 60 % des hommes… ».',
        ],
        quiz: [
          { q: 'Un hook statistique doit utiliser…', a: ['Un chiffre inventé qui impressionne', 'Un chiffre vrai que tu peux prouver', 'Le plus grand chiffre possible'], ok: 1, why: 'Un faux chiffre détruit la confiance — et peut faire refuser la publicité.' },
          { q: 'Où place-t-on la statistique ?', a: ['À la fin', 'Dès la première seconde', 'Dans la description seulement'], ok: 1, why: 'C’est un hook : il doit arrêter le scroll tout de suite.' },
        ],
      },
      {
        id: 'm2-l5',
        n: 5,
        title: 'Le Body : présenter le produit',
        ar: 'البودي',
        voice: true,
        video: 'video/m2-l5.mp4',
        audio: 'video/voix/m2-l5.m4a',
        poster: 'video/m2-l5.jpg',
        scenes: [
          { type: 'title', d: 6.9, kicker: 'Module 02 · Leçon 05', sub: 'Après le hook, le body' },
          {
            type: 'phone',
            d: 17.8,
            mode: 'video',
            kicker: 'Objectif du body',
            title: 'Présenter, et *garder l’attention*',
            ar: 'تعريف المنتج والحفاظ على الاهتمام',
            bg: 'cuisine',
            art: 'creme',
            caption: 'Texture légère, absorbée en quelques secondes',
            captions: [
              { t: 'C’est quoi ?', at: 2.4 },
              { t: 'Comment ça marche', at: 6.5 },
              { t: 'Le résultat', at: 11 },
            ],
            side: [
              { icon: 'box', label: 'Présenter le produit', sub: 'Ce que c’est, pour qui', at: 2.1, c: 'body' },
              { icon: 'eye', label: 'Garder l’intérêt', sub: 'La personne continue de regarder', at: 4.5, c: 'body' },
              { icon: 'clock', label: 'Le client prend le temps', sub: 'De découvrir ton produit', at: 10.8, c: 'body' },
            ],
          },
          {
            type: 'formula',
            d: 20.8,
            kicker: 'On développe la valeur',
            title: 'Ton produit, *la solution idéale*',
            parts: [
              { t: 'Le problème', sub: 'Celui du client', c: 'danger', at: 5 },
              { t: 'Ton produit', sub: 'Présenté clairement', c: 'body', at: 9.5 },
            ],
            result: { t: 'La solution', sub: 'idéale, pour lui', c: 'body' },
            resultAt: 13.8,
          },
          {
            type: 'anatomy',
            d: 46.5,
            kicker: 'Les sections du body',
            title: '3 sections, dans l’ordre',
            parts: [
              { k: 'hook', label: 'Hook', from: 0, to: 3 },
              {
                k: 'body',
                label: 'Body',
                from: 3,
                to: 11,
                at: 0.3,
                when: '3 sections',
                ar: 'تعريف المنتج، كيفية الاستخدام، نقاط القوة',
                arAt: 0.6,
                items: [
                  { label: 'Définition du produit', cap: 'C’est quoi ?', at: 6.5 },
                  { label: 'Comment l’utiliser', at: 18.7 },
                  { label: 'Ses points forts', at: 34.5 },
                ],
              },
              { k: 'cta', label: 'CTA', from: 11, to: 15 },
            ],
          },
          {
            type: 'checklist',
            d: 16.2,
            title: 'Le body, en résumé',
            items: [
              { t: '*Définis* le produit : ce que c’est, pour qui', at: 1 },
              { t: '*Montre* comment l’utiliser', at: 4 },
              { t: 'Mets en avant *ses points forts*', at: 7 },
            ],
          },
          { type: 'outro', d: 3, text: 'Le body construit *l’envie*. Reste le CTA.' },
        ],
        key: [
          'Le body vient après le hook : il présente le produit et garde l’intérêt de la personne.',
          'C’est là qu’on développe la valeur : le produit est présenté comme la solution idéale à son problème.',
          'Trois sections : la définition du produit, comment l’utiliser, ses points forts.',
        ],
        quiz: [
          { q: 'Quelles sont les 3 sections du body ?', a: ['Prix, livraison, logo', 'Définition, utilisation, points forts', 'Hook, CTA, musique'], ok: 1, why: 'On définit le produit, on montre comment l’utiliser, puis ses points forts.' },
          { q: 'Dans le body, le produit est présenté comme…', a: ['La solution idéale au problème du client', 'Un objet parmi d’autres', 'Une promotion'], ok: 0, why: 'On développe la valeur : il règle le problème du client.' },
          { q: 'Lequel est un bénéfice ?', a: ['« Flacon de 50 ml »', '« Tu sens bon jusqu’au soir »', '« Fabriqué en 2026 »'], ok: 1, why: 'Le bénéfice décrit ce que gagne le client.' },
        ],
      },
      {
        id: 'm2-l6',
        n: 6,
        title: 'Le CTA : un CTA clair = une vente',
        ar: 'CTA واضح = عملية بيع',
        voice: true,
        video: 'video/m2-l6.mp4',
        audio: 'video/voix/m2-l6.m4a',
        poster: 'video/m2-l6.jpg',
        scenes: [
          { type: 'title', d: 6.3, kicker: 'Module 02 · Leçon 06', sub: 'Call to action : l’appel à l’action' },
          {
            type: 'anatomy',
            d: 19.1,
            kicker: 'Objectif',
            title: 'L’instruction *finale*',
            parts: [
              { k: 'hook', label: 'Hook', from: 0, to: 3 },
              { k: 'body', label: 'Body', from: 3, to: 11 },
              { k: 'cta', label: 'CTA', from: 11, to: 15, at: 0.3, when: 'la fin', fr: 'On dit au client *quoi faire*', frAt: 2.6, ar: 'التوجيه النهائي', arAt: 4 },
            ],
            btn: 'Commander',
          },
          {
            type: 'compare',
            d: 21.7,
            title: 'Ne le laisse pas *deviner*',
            left: { title: 'CTA flou', tone: 'bad', items: ['« Plus d’infos »', 'Le client hésite… et part'] },
            right: { title: 'CTA clair', tone: 'good', items: ['« Commande maintenant »', '« Clique sur le lien »'] },
            rightAt: 9,
          },
          {
            type: 'phone',
            d: 12.3,
            mode: 'image',
            align: 'right',
            kicker: 'Les dernières secondes',
            title: 'Dis-lui *d’acheter*',
            bg: 'or',
            headline: 'Ton parfum *toute la journée*',
            btn: 'Commander maintenant',
            badge: 'Paiement à la livraison',
            caption: 'On te livre dans les 58 wilayas.',
            side: [
              { icon: 'cart', label: 'Un verbe d’action', sub: 'Commande, clique, écris', at: 1.2, c: 'cta' },
              { icon: 'check', label: 'Clair, sans détour', sub: 'Une seule action', at: 5, c: 'cta' },
            ],
          },
          {
            type: 'formula',
            d: 14.9,
            title: 'Retiens la règle',
            parts: [{ t: 'Un CTA clair', sub: 'CTA واضح', c: 'cta', at: 0.6 }],
            result: { t: 'Une vente', sub: 'عملية بيع', c: 'body' },
            resultAt: 1.4,
          },
          { type: 'stat', d: 10.6, kicker: 'Jusqu’à', value: '80', suffix: '%', label: 'd’efficacité en moins *sans appel à l’action fort*', countDur: 1.6 },
          { type: 'quote', d: 14.7, text: 'Guide la personne *jusqu’au bout*.' },
          { type: 'outro', d: 3, text: 'Hook, Body, CTA : *ta créative est complète*.' },
        ],
        key: [
          'Le CTA (call to action) est l’instruction finale : il arrive dans les dernières secondes de la créative.',
          'Ne laisse pas le client deviner : dis-lui clairement d’acheter, de commander ou de cliquer.',
          'Un CTA clair = une vente. Sans appel à l’action fort, une publicité perd une grande partie de son efficacité.',
        ],
        quiz: [
          { q: 'Lequel est le CTA le plus clair ?', a: ['« En savoir plus »', '« Commande maintenant, paiement à la livraison »', '« Bienvenue »'], ok: 1, why: 'Verbe d’action + facilité : le client sait quoi faire.' },
          { q: 'Où se place le CTA ?', a: ['Au début', 'Dans les dernières secondes', 'Il est facultatif'], ok: 1, why: 'C’est l’instruction finale, une fois la personne convaincue.' },
        ],
        widget: 'cta',
      },
      {
        id: 'm2-l7',
        n: 7,
        title: 'Les 7 familles de hooks',
        ar: 'العائلات السبع للهوك',
        scenes: [
          { type: 'title', sub: 'Pour ne jamais être à court d’idées', say: 'Positif, négatif, statistique : tu connais la base. On va plus loin avec sept familles de hooks, et pour chacune, le bon moment pour l’utiliser.' },
          {
            type: 'cards',
            title: 'Les familles *1 à 4*',
            items: [
              { icon: 'help', label: 'La question qui pique', sub: '« Ton parfum ne tient pas jusqu’à midi ? »', c: 'hook' },
              { icon: 'repeat', label: 'L’avant / après honnête', sub: 'Une basket sale, puis propre : sans filtre', c: 'body' },
              { icon: 'chart', label: 'Le chiffre, la preuve vraie', sub: '« 1 an de garantie » : un fait vérifiable', c: 'gold' },
              { icon: 'bolt', label: 'La démonstration choc', sub: 'Le hachoir face à l’oignon, dès la 1ʳᵉ seconde', c: 'cta' },
            ],
            say: 'La question qui pique touche un problème que ta cible vit déjà. L’avant-après honnête montre un vrai résultat, sans filtre. Le chiffre ou la preuve vraie s’appuie sur un fait vérifiable. Et la démonstration choc montre le produit en action dès la première seconde.',
          },
          {
            type: 'cards',
            title: 'Les familles *5 à 7*',
            items: [
              { icon: 'user', label: 'L’histoire personnelle', sub: '« Ma sœur m’a demandé où j’ai acheté ce caftan »', c: 'hook' },
              { icon: 'eye', label: 'Le stop visuel', sub: 'Un mouvement brusque, un objet inattendu', c: 'body' },
              { icon: 'megaphone', label: 'L’interpellation', sub: '« Les filles aux cheveux bouclés, c’est pour vous »', c: 'cta' },
            ],
            say: 'L’histoire personnelle, souvent en UGC : une vraie personne raconte un vrai moment. Le stop visuel : un mouvement brusque ou un objet inattendu. Et l’interpellation : tu appelles ta cible, elle se sent concernée.',
          },
          {
            type: 'steps',
            title: 'Quelle famille, *quand* ?',
            items: [
              { k: '1', label: 'Un problème connu de tous', sub: 'La question qui pique', c: 'hook' },
              { k: '2', label: 'Un résultat qui se voit', sub: 'L’avant / après, la démonstration', c: 'body' },
              { k: '3', label: 'Un client méfiant', sub: 'La preuve vraie, l’histoire personnelle', c: 'gold' },
              { k: '4', label: 'Un accessoire, une montre', sub: 'Le stop visuel', c: 'cta' },
              { k: '5', label: 'Une cible très précise', sub: 'L’interpellation', c: 'hook' },
            ],
            say: 'Pour choisir : un problème connu, la question. Un résultat visible, l’avant-après ou la démo. Un client méfiant, la preuve ou l’histoire. Un accessoire sans problème évident, le stop visuel. Une cible précise, l’interpellation.',
          },
          {
            type: 'quote',
            text: 'Le hook promet. La vidéo *tient la promesse*.',
            say: 'Une règle pour les sept familles : ton hook ne promet jamais ce que ta vidéo ne montre pas. Pas de faux avant-après, pas de chiffre inventé.',
          },
          { type: 'outro', say: 'Leçon suivante : la banque de hooks, vingt formules à adapter.' },
        ],
        key: [
          'Sept familles : la question qui pique, l’avant / après honnête, le chiffre ou la preuve vraie, la démonstration choc, l’histoire personnelle (UGC), le stop visuel, l’interpellation de la cible.',
          'On choisit selon le produit et la cible : problème connu → question ; résultat visible → avant / après ou démonstration ; client méfiant → preuve vraie ou histoire ; accessoire → stop visuel ; cible précise → interpellation.',
          'Le hook ne promet jamais ce que la vidéo ne montre pas. Pas de faux avant / après ni de chiffre inventé ; et les plateformes encadrent les avant / après (santé, minceur, peau) : vérifie leurs règles.',
        ],
        quiz: [
          { q: 'Tu vends une montre élégante, qui ne règle aucun problème particulier. Quelle famille essaies-tu d’abord ?', a: ['La question qui pique', 'Le stop visuel', 'Un chiffre inventé'], ok: 1, why: 'Sans problème évident, un mouvement ou un objet inattendu arrête le pouce. Et un chiffre doit toujours être vrai.' },
          { q: 'Un avant / après honnête, c’est…', a: ['Même lumière, même cadrage, sans filtre', 'Un filtre sur la photo « après »', 'Deux photos trouvées sur internet'], ok: 0, why: 'Seul le produit doit faire la différence entre les deux images.' },
        ],
        todo: [
          'Choisis un de tes produits et écris un hook pour chacune des 7 familles, dans ta fiche',
          'Note à côté de chaque hook sa famille et la cible à qui il parle',
          'Barre chaque hook que ta vidéo ne pourra pas prouver',
          'Lis les hooks restants à voix haute, dans la langue de ta cible, et entoure les 3 plus naturels',
          'Coche la leçon et passe le quiz',
        ],
        res: [
          {
            title: 'Les 7 familles de hooks (fiche)',
            text: '1. LA QUESTION QUI PIQUE\nCe que c’est : une question sur un problème que ta cible vit déjà.\nExemple : « Ton parfum ne tient pas jusqu’à midi ? »\nQuand : le produit règle un problème du quotidien, connu de tous.\n\n2. L’AVANT / APRÈS HONNÊTE\nCe que c’est : le même objet, avant puis après, même lumière, même cadrage, sans filtre.\nExemple : une basket blanche sale, nettoyée en une seule prise.\nQuand : le résultat se voit (nettoyage, rangement, coiffure). Attention : les plateformes encadrent les avant / après sur la santé, la minceur et la peau ; vérifie leurs règles.\n\n3. LE CHIFFRE OU LA PREUVE VRAIE\nCe que c’est : un fait vérifiable : une garantie, une caractéristique, un test que tu as vraiment fait.\nExemple : « 1 an de garantie sur ce mixeur » (si c’est écrit sur la garantie).\nQuand : le client compare, hésite ou se méfie (électroménager, montres).\n\n4. LA DÉMONSTRATION CHOC\nCe que c’est : le produit en action dès la première seconde, avec un résultat surprenant mais réel.\nExemple : le hachoir qui réduit un oignon en miettes en quelques secondes.\nQuand : le produit a une fonction visible (électroménager, gadgets, textures).\n\n5. L’HISTOIRE PERSONNELLE (UGC)\nCe que c’est : une vraie personne raconte un vrai moment avec le produit.\nExemple : « Ma sœur m’a demandé où j’ai acheté ce caftan. »\nQuand : il faut créer la confiance (cosmétiques, vêtements, cadeaux).\n\n6. LE STOP VISUEL\nCe que c’est : une image qui casse le fil : mouvement brusque, objet inattendu, angle inhabituel.\nExemple : la montre posée d’un coup sur la table, en très gros plan.\nQuand : le produit ne règle pas de problème évident (accessoires, mode, déco).\n\n7. L’INTERPELLATION DE LA CIBLE\nCe que c’est : tu nommes ta cible, elle se reconnaît.\nExemple : « Les filles aux cheveux bouclés, cette vidéo est pour vous. »\nQuand : la cible est précise (un type de cheveux, une ville, un métier, un moment comme le Ramadan).\n\nRègle commune : le hook ne promet jamais ce que la vidéo ne montre pas.',
          },
        ],
      },
      {
        id: 'm2-l8',
        n: 8,
        title: 'La banque de hooks : 20 formules à adapter',
        ar: 'بنك الهوك: 20 صيغة للتكييف',
        scenes: [
          { type: 'title', sub: 'Une formule, ton produit, un hook', say: 'Page blanche ? Voici vingt formules de hooks, rangées par famille. Tu les adaptes à ton produit en quelques minutes.' },
          {
            type: 'big',
            kicker: 'Le principe',
            text: 'Une formule + *du vrai* = un hook.',
            sub: 'Les [crochets] se remplissent avec ton produit, ta cible et des faits',
            say: 'Une formule, c’est un squelette. Tu remplaces les crochets par ton produit, ta cible et des faits vrais. La formule donne la forme ; toi, tu donnes le fond.',
          },
          {
            type: 'cards',
            title: 'De la *formule* au *hook*',
            items: [
              { icon: 'help', label: 'Ton [produit] ne [effet] plus après [moment] ?', sub: '→ Ton parfum ne sent plus rien après midi ?', c: 'hook' },
              { icon: 'repeat', label: 'J’ai testé [produit] sur la moitié de [surface]', sub: '→ … sur la moitié de ma basket : regarde', c: 'body' },
              { icon: 'megaphone', label: 'Arrête de [erreur] si tu veux [résultat]', sub: '→ Arrête de choisir ton parfum au hasard si tu veux qu’on le remarque', c: 'cta' },
            ],
            say: 'Trois exemples. « Ton produit ne fait plus effet après tel moment ? » devient : « Ton parfum ne sent plus rien après midi ? ». « J’ai testé sur la moitié » devient une basket nettoyée à moitié. Et « Arrête de… si tu veux… » parle directement à ta cible.',
          },
          {
            type: 'steps',
            title: 'Adapter en *4 gestes*',
            items: [
              { k: '1', label: 'Choisis la famille', sub: 'Selon ton produit et ta cible', c: 'gold' },
              { k: '2', label: 'Remplis les crochets', sub: 'Des faits vrais, les mots de ton client', c: 'hook' },
              { k: '3', label: 'Dis-la à voix haute', sub: 'En darija, en français ou en arabe', c: 'body' },
              { k: '4', label: 'Coupe pour l’écran', sub: '7 mots maximum en texte', c: 'cta' },
            ],
            say: 'Pour adapter : choisis la famille selon ton produit. Remplis les crochets avec des faits vrais et les mots de ton client. Dis la phrase à voix haute, dans sa langue. Puis coupe la version écran à sept mots.',
          },
          {
            type: 'compare',
            title: 'Au hasard *ou* précis',
            left: { title: 'Rempli au hasard', tone: 'bad', items: ['« Ce produit va changer ta vie »', 'Personne ne se sent concerné'] },
            right: { title: 'Rempli de vrai', tone: 'good', items: ['Un moment, un problème, un détail', 'Ta cible se reconnaît'] },
            say: 'Remplie au hasard, une formule sonne creux : « ce produit va changer ta vie ». Avec un moment, un problème et un détail précis, ta cible se reconnaît. Plus c’est concret, plus ça arrête.',
          },
          { type: 'outro', say: 'Leçon suivante : le hook visuel, tes trois premières images.' },
        ],
        key: [
          'Une formule est un squelette : les [crochets] se remplissent avec ton produit, ta cible et des faits vrais, jamais avec une promesse inventée.',
          'Adapter en 4 gestes : choisir la famille, remplir les crochets, dire la phrase à voix haute dans la langue de la cible, couper la version écran à 7 mots.',
          'Plus le hook est concret (un moment, un problème, un détail), plus la cible se reconnaît. Range tes meilleurs hooks par famille pour les tester.',
        ],
        quiz: [
          { q: 'Avec quoi remplis-tu les crochets d’une formule ?', a: ['Des faits vrais et les mots de ton client', 'La promesse la plus forte possible', 'Le nom de ta page'], ok: 0, why: 'La formule donne la forme ; le fond doit être vrai, sinon tu perds la confiance du client.' },
          { q: '« Ce produit va changer ta vie » : quel est le problème ?', a: ['Il est trop court', 'Il est vague : personne ne se reconnaît', 'Il est trop précis'], ok: 1, why: 'Un hook concret (un moment, un problème, un détail) parle à quelqu’un ; une phrase vague ne parle à personne.' },
        ],
        todo: [
          'Choisis 5 formules dans la banque, de 5 familles différentes',
          'Remplis les crochets pour ton produit, uniquement avec des faits vrais',
          'Écris chaque hook en deux versions : parlée, et écran en 7 mots maximum',
          'Lis-les à voix haute dans la langue de ta cible et garde les 3 plus naturels',
          'Range-les dans ta fiche de hooks, avec leur famille',
        ],
        res: [
          {
            title: 'Banque de 20 hooks (formules à adapter)',
            text: 'Remplace chaque [crochet] par du vrai : ton produit, ta cible, tes faits. Version écran : 7 mots maximum.\n\nLA QUESTION QUI PIQUE\n1. « Ton [produit] ne [effet attendu] plus après [moment] ? » → « Ton parfum ne sent plus rien après midi ? »\n2. « Pourquoi [problème] alors que tu [effort] ? » → « Pourquoi tes cheveux frisent alors que tu les lisses chaque matin ? »\n3. « Tu [geste du quotidien] encore comme ça ? » → « Tu haches encore tes oignons au couteau ? »\n\nL’AVANT / APRÈS HONNÊTE\n4. « [Durée réelle] avec [produit] : avant / après, sans filtre » → « 5 minutes avec ce détachant : avant / après, sans filtre »\n5. « J’ai testé [produit] sur la moitié de [surface] : regarde » → « J’ai testé ce nettoyant sur la moitié de ma basket : regarde »\n6. « Mon [espace] avant… et après [produit] » → « Mon placard avant… et après ces boîtes de rangement »\n\nLE CHIFFRE OU LA PREUVE VRAIE\n7. « [Durée réelle] de [usage] : voilà l’état de [produit] » → « 6 mois au poignet : voilà l’état de cette montre »\n8. « On a utilisé [produit] [durée réelle] : verdict » → « On a utilisé ce mixeur tout le Ramadan : verdict »\n9. « [Caractéristique vraie, avec son chiffre] : ce que ça change pour toi » → « 2 vitesses et un bol en verre : ce que ça change pour ta chorba »\n\nLA DÉMONSTRATION CHOC\n10. « Regarde ce que [produit] fait à [problème] en [durée réelle] » → « Regarde ce que ce hachoir fait à un oignon en 5 secondes »\n11. « J’ai [épreuve réelle] [produit] : regarde » → « J’ai mis cette montre sous le robinet : regarde » (seulement si elle est vraiment étanche)\n12. « [Méthode habituelle] contre [produit] : même test » → « La serpillière contre ce balai vapeur : même carrelage »\n\nL’HISTOIRE PERSONNELLE (UGC)\n13. « Ça fait [durée] que je cherchais [solution], et puis… » → « Ça fait deux ans que je cherchais un parfum qui tient, et puis… »\n14. « Ma [proche] m’a demandé où j’ai acheté [produit] » → « Ma sœur m’a demandé où j’ai acheté ce caftan »\n15. « Je ne croyais pas aux [type de produit] jusqu’à [moment] » → « Je ne croyais pas aux robots de cuisine jusqu’à mon premier Ramadan avec celui-ci »\n\nLE STOP VISUEL (le texte accompagne l’image)\n16. « Attends… regarde [détail] » + [le produit qui entre d’un coup dans le cadre] → « Attends… regarde ce fermoir » + la montre posée d’un coup sur la table\n17. « Pourquoi [objet inattendu] à côté de [produit] ? » + [la réponse en image] → « Pourquoi une pastèque à côté de ce couteau ? » + la pastèque coupée d’un geste\n\nL’INTERPELLATION DE LA CIBLE\n18. « Les [cible] qui [situation], cette vidéo est pour vous » → « Les filles aux cheveux bouclés qui galèrent l’été, cette vidéo est pour vous »\n19. « Si tu habites à [ville] et que tu [besoin], écoute ça » → « Si tu habites à Constantine et que tu cherches un cadeau, écoute ça »\n20. « Arrête de [erreur] si tu veux [résultat] » → « Arrête de choisir ton parfum au hasard si tu veux qu’on le remarque »\n\nÀ chaque fois : un hook qui promet seulement ce que la vidéo montre. Teste 3 à 5 hooks sur le même body.',
          },
        ],
      },
      {
        id: 'm2-l9',
        n: 9,
        title: 'Le hook visuel : tes 3 premières images',
        ar: 'الهوك البصري: أول ثلاث لقطات',
        scenes: [
          { type: 'title', sub: 'Ce qu’on voit avant d’entendre', say: 'Beaucoup de gens regardent sans le son : ton hook doit d’abord se voir. Voici comment construire tes premières images.' },
          {
            type: 'cards',
            title: '4 couches, *en même temps*',
            items: [
              { icon: 'frame', label: 'La 1ʳᵉ image', sub: 'Nette, le produit ou un visage', c: 'gold' },
              { icon: 'move', label: 'Le mouvement', sub: 'Dès la 1ʳᵉ seconde', c: 'hook' },
              { icon: 'captions', label: 'Le texte', sub: '7 mots maximum, contrasté', c: 'body' },
              { icon: 'mic', label: 'Le son', sub: 'Un premier mot fort, un clic net', c: 'cta' },
            ],
            say: 'Un hook visuel, c’est quatre couches en même temps. Une première image nette, souvent reprise en miniature. Du mouvement dès la première seconde. Un texte court et contrasté. Et un son qui accroche : le premier mot, ou un clic.',
          },
          {
            type: 'compare',
            title: 'La 1ʳᵉ image : *ratée ou réussie*',
            left: { title: 'Ratée', tone: 'bad', items: ['Un logo, un écran noir, « Salam »', 'Le visage flou, le produit hors champ'] },
            right: { title: 'Réussie', tone: 'good', items: ['L’action déjà en cours', 'Le produit ou le visage, net et lumineux'] },
            say: 'Commence au milieu de l’action, jamais par un logo ou un « salam ». Coupe la seconde où tu lances l’enregistrement. La première image montre déjà le produit ou un visage, net.',
          },
          {
            type: 'stat',
            value: '7',
            label: 'mots *maximum* pour le texte du hook',
            sub: 'Gros, contrasté, au centre de l’écran',
            say: 'Le texte à l’écran : sept mots maximum, lus en une seconde. Gros caractères, contour ou fond sombre, et au centre, loin du bas et de la droite, que l’appli recouvre.',
          },
          {
            type: 'checklist',
            title: 'Casser le *rythme du fil*',
            items: ['Un mouvement *vers la caméra*', 'Un objet *inattendu* dans le cadre', 'Un angle *inhabituel* : très près, par le dessus', { t: 'Un effet sans lien avec le produit', bad: true }],
            say: 'Le pattern interrupt casse le rythme du fil : un mouvement vers la caméra, un objet inattendu, un angle très proche ou par le dessus. Mais l’effet doit mener au produit.',
          },
          {
            type: 'steps',
            title: 'Ce que tu *filmes* pour ça',
            items: [
              { k: '1', label: 'Le produit qui entre dans le cadre', sub: 'Posé, lancé, sorti de la boîte', c: 'gold' },
              { k: '2', label: 'Le geste en gros plan', sub: 'Le spray, la goutte, le fermoir', c: 'hook' },
              { k: '3', label: 'Le face caméra déjà lancé', sub: 'Le premier mot est le mot fort', c: 'body' },
            ],
            say: 'Au tournage, prévois tes ouvertures : le produit qui entre dans le cadre, un geste en gros plan, et un face caméra qui commence par le mot fort. Filme au moins trois ouvertures.',
          },
          { type: 'outro', say: 'Leçon suivante : trouver les hooks et les formats gagnants.' },
        ],
        key: [
          'Quatre couches en même temps : une 1ʳᵉ image nette (souvent reprise en miniature), du mouvement dès la 1ʳᵉ seconde, un texte de 7 mots maximum, un son qui accroche (le premier mot, un clic).',
          'On commence au milieu de l’action : pas de logo, pas de « salam », pas la seconde où l’on lance l’enregistrement. Texte gros, contrasté, au centre, loin du bas et de la droite.',
          'Le pattern interrupt (mouvement vers la caméra, objet inattendu, angle inhabituel) doit mener au produit. Au tournage : au moins 3 ouvertures différentes à tester.',
        ],
        quiz: [
          { q: 'Par quoi commence ta vidéo ?', a: ['Ton logo et une musique', 'L’action déjà en cours', '« Salam, aujourd’hui je vais vous présenter… »'], ok: 1, why: 'Chaque fraction de seconde sans action est une occasion de scroller.' },
          { q: 'Où places-tu le texte du hook en 9:16 ?', a: ['Tout en bas, près de la description', 'Au centre, loin du bas et de la droite', 'Collé au bord droit'], ok: 1, why: 'Le bas et la droite sont recouverts par l’interface de l’appli.' },
        ],
        todo: [
          'Fais une capture de la 1ʳᵉ image de ta dernière vidéo : est-elle nette, et montre-t-elle le produit ou un visage ?',
          'Coupe tout ce qui précède l’action, y compris la seconde où tu lances l’enregistrement',
          'Écris le texte du hook en 7 mots maximum et place-le au centre de l’écran',
          'Filme 3 ouvertures du même produit : entrée dans le cadre, geste en gros plan, face caméra',
          'Regarde chaque ouverture sans le son et garde celle qu’on comprend tout de suite',
        ],
        res: [
          {
            title: 'Check-list du hook visuel',
            text: '1ʳᵉ IMAGE : nette, lumineuse, le produit ou un visage, l’action déjà en cours (pas de logo, pas de « salam »).\nMOUVEMENT : dès la 1ʳᵉ seconde (le produit entre dans le cadre, un geste, un mouvement vers la caméra).\nTEXTE : 7 mots maximum · gros · contour ou fond sombre · au centre, loin du bas et de la droite.\nSON : le premier mot est le mot fort, ou un bruit net (clic, spray, fermoir).\nPATTERN INTERRUPT : objet inattendu, angle inhabituel… toujours relié au produit.\n\nÀ FILMER\n1. Le produit qui entre dans le cadre (posé, lancé, sorti de la boîte).\n2. Le geste en gros plan (spray, goutte, fermoir).\n3. Le face caméra qui commence par le mot fort.\n→ Au moins 3 ouvertures différentes, pour les tester.\n\nTEST : regarde les 3 premières secondes sans le son. On comprend ce que tu vends ? C’est bon.',
          },
        ],
      },
      {
        id: 'm2-l10',
        n: 10,
        title: 'Trouver les hooks et formats gagnants',
        ar: 'البحث عن الهوك والأشكال الناجحة',
        scenes: [
          { type: 'title', sub: 'Ton swipe file de pubs qui marchent', say: 'Les hooks qui marchent dans ta niche sont déjà dans le fil. On les trouve, on les classe, on les adapte, sans copier.' },
          {
            type: 'cards',
            title: 'Deux sources *gratuites*',
            items: [
              { icon: 'search', label: 'Bibliothèque publicitaire de Meta', sub: 'Pays : Algérie · un mot-clé de ta niche', c: 'body' },
              { icon: 'fire', label: 'TikTok Creative Center', sub: 'Top Ads · selon les régions proposées', c: 'hook' },
            ],
            say: 'La Bibliothèque publicitaire de Meta : choisis l’Algérie, tape un mot-clé de ta niche, en français, en arabe et en darija. Le TikTok Creative Center, rubrique Top Ads : si l’Algérie n’y est pas, regarde des régions proches.',
          },
          {
            type: 'steps',
            title: 'La chasse en *4 gestes*',
            items: [
              { k: '1', label: 'Tape les mots de ta niche', sub: 'parfum, sérum, montre, « livraison »…', c: 'gold' },
              { k: '2', label: 'Garde les pubs qui durent', sub: 'Actives depuis des semaines : un indice', c: 'hook' },
              { k: '3', label: 'Repère les séries', sub: 'Même vidéo, débuts différents', c: 'body' },
              { k: '4', label: 'Sauvegarde', sub: 'Capture, lien, date', c: 'cta' },
            ],
            say: 'Tape les mots de ta niche. Garde les pubs actives depuis des semaines : souvent bon signe. Repère les séries : même vidéo, débuts différents, c’est un annonceur qui teste ses hooks. Sauvegarde capture, lien et date.',
          },
          {
            type: 'flow',
            title: 'Ton *swipe file*',
            nodes: [
              { icon: 'download', label: 'Sauvegarder', sub: 'Capture, lien, date', c: 'gold' },
              { icon: 'chart', label: 'Décortiquer', sub: 'Avec Hooked Lab', c: 'hook' },
              { icon: 'layers', label: 'Classer', sub: 'Famille de hook · format', c: 'body' },
            ],
            say: 'Le swipe file, c’est ta collection de pubs qui marchent. Hooked Lab, l’application d’analyse de l’équipe, t’aide à les décortiquer. Puis classe par famille de hook et par format : UGC, démo, avant-après, carrousel, packshot.',
          },
          {
            type: 'compare',
            title: 'Copier *ou* adapter',
            left: { title: 'Copier', tone: 'bad', items: ['Son texte, ses images, sa vidéo', 'Une pub en double, et des ennuis'] },
            right: { title: 'Adapter', tone: 'good', items: ['La mécanique : famille, rythme, format', 'Ton produit, ta cible, tes mots'] },
            say: 'Le texte, les images et la vidéo d’un autre lui appartiennent. Tu reprends la mécanique, famille de hook, rythme, format, avec ton produit et tes mots.',
          },
          {
            type: 'big',
            kicker: 'Le test',
            text: 'Un body, *3 à 5 hooks*.',
            sub: 'Seules les 3 premières secondes changent',
            say: 'Puis teste : même body, même CTA, trois à cinq hooks, publiés en même temps avec le même budget. Garde celui qui apporte des commandes, pas seulement des vues.',
          },
          { type: 'outro', say: 'Leçon suivante : les formules magiques de la vente.' },
        ],
        key: [
          'Deux sources gratuites : la Bibliothèque publicitaire de Meta (pays, mot-clé en français, en arabe et en darija) et le TikTok Creative Center (Top Ads, selon les régions proposées). Les outils évoluent, la méthode reste.',
          'Les signaux : une pub active depuis des semaines (un indice, pas une preuve) et une série de versions du même body (l’annonceur teste ses hooks). Chaque pub va dans ton swipe file, classée par famille de hook et par format ; Hooked Lab aide à la décortiquer.',
          'On adapte la mécanique, jamais le texte, les images ni la vidéo. Puis on teste 3 à 5 hooks sur le même body, en même temps, avec le même budget, et on garde celui qui apporte des commandes.',
        ],
        quiz: [
          { q: 'Un annonceur diffuse la même vidéo avec 4 débuts différents. Ça veut dire…', a: ['Il s’est trompé en publiant', 'Il teste ses hooks', 'Il a perdu ses fichiers'], ok: 1, why: 'Même body, débuts différents : c’est un test de hooks. Une très bonne source d’idées.' },
          { q: 'Que reprends-tu d’une pub gagnante ?', a: ['Son texte et ses images', 'Sa mécanique : famille de hook, rythme, format', 'Sa musique et son logo'], ok: 1, why: 'La structure s’adapte à ton produit ; le contenu appartient à son auteur.' },
        ],
        todo: [
          'Cherche des pubs de ta niche dans la Bibliothèque publicitaire de Meta, avec un mot-clé en français, un en arabe et un en darija',
          'Garde les 5 pubs actives depuis le plus longtemps et note leur date de début',
          'Remplis une fiche de swipe file pour chacune : hook, famille, format',
          'Écris 3 à 5 hooks adaptés à ton produit, pour un même body',
          'Coche la leçon et passe le quiz',
        ],
        res: [
          {
            title: 'Swipe file : hooks et formats (gabarit)',
            text: 'SWIPE FILE · Pub n° [  ] · sauvegardée le [date]\nLien : [lien de la pub] · Plateforme : [Facebook / Instagram / TikTok]\nPage / marque : [nom] · Pays : [  ] · Niche : [  ]\nEn ligne depuis : [date de début de diffusion] · Autres versions repérées : [oui / non, combien]\n\nHOOK\nCe qu’on voit (1ʳᵉ image) : [  ]\nCe qu’on lit (texte à l’écran) : [  ]\nCe qu’on entend (premier mot, son) : [  ]\nFamille : [question qui pique / avant-après honnête / chiffre ou preuve vraie / démonstration choc / histoire personnelle / stop visuel / interpellation]\n\nFORMAT : [UGC / démo / avant-après / face caméra / carrousel / packshot / déballage…] · Durée : [  ] s\n\nCe que je reprends (la mécanique, jamais le texte, les images ni la vidéo) : [  ]\nMon hook adapté : [  ]\n\nTEST : même body, même CTA, même budget, publiés en même temps\nHook A : [  ]\nHook B : [  ]\nHook C : [  ]\n(jusqu’à 5)\nRésultat : [commandes, coût par commande] → gagnant : [  ]',
          },
        ],
      },
    ],
  },
  {
    id: 'm3',
    n: 3,
    part: 'p1',
    title: 'Les formules magiques de la vente',
    ar: 'الوصفات السحرية للبيع',
    color: '#55b894',
    icon: 'wand',
    pitch: 'AIDA, PAS, CAP, SONCAS : les règles d’or de la persuasion, et quand utiliser chacune.',
    lessons: [
      {
        id: 'm3-l1',
        n: 1,
        title: 'Les formules magiques de la vente',
        ar: 'استراتيجيات البيع',
        voice: true,
        video: 'video/m3-l1.mp4',
        audio: 'video/voix/m3-l1.m4a',
        poster: 'video/m3-l1.jpg',
        scenes: [
          { type: 'title', d: 5.1, kicker: 'Module 03 · Leçon 01', sub: 'AIDA · PAS · CAP · SONCAS' },
          { type: 'stat', d: 4.2, value: '4', label: 'formules : *les règles d’or* de la persuasion', ar: 'القواعد الذهبية للإقناع', countDur: 0.8 },
          {
            type: 'cards',
            d: 8.8,
            title: 'Les 4 formules',
            items: [
              { icon: 'route', label: 'AIDA', sub: 'L’itinéraire du client', c: 'hook', at: 2.1 },
              { icon: 'bolt', label: 'PAS', sub: 'La force de la douleur', c: 'danger', at: 3 },
              { icon: 'shield', label: 'CAP', sub: 'L’art de prouver', c: 'body', at: 3.7 },
              { icon: 'brain', label: 'SONCAS', sub: 'Les 6 boutons psychologiques', c: 'ia', at: 4.4 },
            ],
          },
          { type: 'big', d: 9.6, kicker: 'À quoi elles servent', text: 'Chaque formule t’aide à *convaincre* ton client — et à l’amener jusqu’à l’achat.' },
          { type: 'outro', d: 7, text: 'On commence par *AIDA*.' },
        ],
        key: [
          'Quatre formules de vente, les règles d’or de la persuasion : AIDA, PAS, CAP et SONCAS.',
          'Chacune aide à convaincre le client et à l’amener jusqu’à l’achat.',
          'On les voit une par une, puis on apprend laquelle utiliser et quand.',
        ],
        quiz: [
          { q: 'Combien de formules de vente voit-on dans ce module ?', a: ['2', '4', '10'], ok: 1, why: 'AIDA, PAS, CAP et SONCAS.' },
          { q: 'À quoi servent ces formules ?', a: ['À choisir la musique', 'À convaincre le client', 'À calculer le budget'], ok: 1, why: 'Ce sont des structures de persuasion.' },
        ],
      },
      {
        id: 'm3-l2',
        n: 2,
        title: 'AIDA : l’itinéraire du client',
        ar: 'مسار الزبون',
        voice: true,
        video: 'video/m3-l2.mp4',
        audio: 'video/voix/m3-l2.m4a',
        poster: 'video/m3-l2.jpg',
        scenes: [
          { type: 'title', d: 4.6, fr: 'AIDA', kicker: 'Module 03 · Leçon 02', sub: 'L’itinéraire du client' },
          {
            type: 'flow',
            d: 19,
            title: 'La structure *de base*',
            nodes: [
              { icon: 'eye', label: 'Le premier regard', at: 3 },
              { icon: 'sparkles', label: 'L’envie', at: 9 },
              { icon: 'cart', label: 'L’achat', at: 15.5 },
            ],
          },
          {
            type: 'acronym',
            d: 26,
            title: 'A · I · D · A',
            letters: [
              { k: 'A', word: 'Attention', sub: 'Le hook !', c: 'hook', at: 3.2 },
              { k: 'I', word: 'Intérêt', sub: 'Le captiver', c: 'body', at: 5 },
              { k: 'D', word: 'Désir', sub: 'Lui donner envie', c: 'body', at: 15.6 },
              { k: 'A', word: 'Action', sub: 'Le CTA final', c: 'cta', at: 24.3 },
            ],
          },
          { type: 'outro', d: 3, text: 'Attention, Intérêt, Désir, *Action*.' },
        ],
        key: [
          'AIDA est la structure de base : elle guide l’esprit du client, du premier regard jusqu’à l’achat.',
          'Attention = le hook ; Intérêt = on le captive ; Désir = on lui donne envie ; Action = le CTA final.',
          'Idéale pour structurer toute une vidéo, ou un carrousel (une slide par étape).',
        ],
        quiz: [
          { q: 'Que veut dire le D de AIDA ?', a: ['Démonstration', 'Désir', 'Délai'], ok: 1, why: 'Attention, Intérêt, Désir, Action.' },
          { q: 'Quelle étape correspond au hook ?', a: ['Attention', 'Désir', 'Action'], ok: 0, why: 'Le A d’Attention, c’est le hook.' },
          { q: 'Quelle étape correspond au CTA ?', a: ['Attention', 'Intérêt', 'Action'], ok: 2, why: 'L’action est l’appel à agir.' },
        ],
        widget: 'aida',
      },
      {
        id: 'm3-l3',
        n: 3,
        title: 'PAS : la force de la douleur',
        ar: 'قوة الألم',
        voice: true,
        video: 'video/m3-l3.mp4',
        audio: 'video/voix/m3-l3.m4a',
        poster: 'video/m3-l3.jpg',
        scenes: [
          { type: 'title', d: 3.9, fr: 'PAS', kicker: 'Module 03 · Leçon 03', sub: 'Problème · Agitation · Solution' },
          { type: 'big', d: 11.9, kicker: 'La force de la douleur', text: 'On touche *le problème* du client, et ce qu’il ressent.', ar: 'نهز مشاعر الزبون' },
          {
            type: 'flow',
            d: 15.6,
            title: 'Identifier le mal, puis apporter *le remède*',
            nodes: [
              { icon: 'x', label: 'Le problème', at: 0.6 },
              { icon: 'bolt', label: 'On le rend concret', at: 6 },
              { icon: 'check', label: 'Le remède : ton produit', at: 12.5 },
            ],
          },
          {
            type: 'acronym',
            d: 33.2,
            title: 'P · A · S',
            letters: [
              { k: 'P', word: 'Problème', sub: 'Identifier la douleur', c: 'danger', at: 0.3 },
              { k: 'A', word: 'Agitation', sub: 'Remuer le couteau', c: 'cta', at: 9.7 },
              { k: 'S', word: 'Solution', sub: 'Ton produit est le remède', c: 'body', at: 22.6 },
            ],
            note: 'Agiter, c’est rendre le problème concret — *sans mentir ni faire peur*.',
            noteAt: 27,
          },
          { type: 'outro', d: 3, text: 'Problème, Agitation, *Solution*.' },
        ],
        key: [
          'PAS, c’est la force de la douleur : on identifie le problème du client et ce qu’il ressent.',
          'Problème : nommer la douleur. Agitation : la rendre concrète. Solution : ton produit est le remède.',
          'L’agitation reste honnête : on rend le problème concret, sans exagérer ni faire peur.',
        ],
        quiz: [
          { q: 'Dans PAS, l’agitation sert à…', a: ['Rendre le problème concret', 'Inventer un problème', 'Donner le prix'], ok: 0, why: 'On montre ce que le problème coûte au client, honnêtement.' },
          { q: 'Dans PAS, le produit arrive…', a: ['Au début', 'À l’étape Solution', 'Jamais'], ok: 1, why: 'Le produit est le remède, après le problème et l’agitation.' },
        ],
      },
      {
        id: 'm3-l4',
        n: 4,
        title: 'CAP : l’art de prouver',
        ar: 'فن الإثبات',
        voice: true,
        video: 'video/m3-l4.mp4',
        audio: 'video/voix/m3-l4.m4a',
        poster: 'video/m3-l4.jpg',
        scenes: [
          { type: 'title', d: 4, fr: 'CAP', kicker: 'Module 03 · Leçon 04', sub: 'Caractéristique · Avantage · Preuve' },
          { type: 'big', d: 14, kicker: 'L’art de prouver', text: 'Indispensable pour convaincre *les sceptiques* : des faits, des bénéfices, des *preuves*.', ar: 'فن الإثبات' },
          {
            type: 'acronym',
            d: 29.8,
            title: 'C · A · P',
            letters: [
              { k: 'C', word: 'Caractéristique', sub: 'C’est quoi ? Un fait', c: 'hook', at: 1.5 },
              { k: 'A', word: 'Avantage', sub: 'Ça sert à quoi ?', c: 'body', at: 7.7 },
              { k: 'P', word: 'Preuve', sub: 'Démontre-le !', c: 'cta', at: 17.5 },
            ],
            note: 'On transforme des faits en *bénéfices réels*, avec des preuves.',
            noteAt: 23,
          },
          { type: 'outro', d: 3, text: 'Un fait, un avantage, *une preuve*.' },
        ],
        key: [
          'CAP, c’est l’art de prouver : indispensable pour convaincre les clients sceptiques.',
          'Caractéristique : ce que c’est (un fait). Avantage : à quoi ça sert. Preuve : on le démontre.',
          'On transforme des faits en bénéfices réels, avec des preuves concrètes (démonstration, avant/après honnête, avis réels).',
        ],
        quiz: [
          { q: 'Que veut dire le P de CAP ?', a: ['Prix', 'Preuve', 'Promotion'], ok: 1, why: 'Caractéristique, Avantage, Preuve.' },
          { q: 'CAP est surtout utile pour…', a: ['Les clients sceptiques', 'Choisir une musique', 'Écrire un hook'], ok: 0, why: 'Les preuves rassurent ceux qui doutent.' },
        ],
      },
      {
        id: 'm3-l5',
        n: 5,
        title: 'SONCAS : les 6 boutons psychologiques',
        ar: 'الأزرار النفسية الستة',
        voice: true,
        video: 'video/m3-l5.mp4',
        audio: 'video/voix/m3-l5.m4a',
        poster: 'video/m3-l5.jpg',
        scenes: [
          { type: 'title', d: 3.6, fr: 'SONCAS', kicker: 'Module 03 · Leçon 05', sub: 'Les 6 boutons psychologiques' },
          {
            type: 'flow',
            d: 17.2,
            title: 'Pourquoi ton client achète *vraiment* ?',
            nodes: [
              { icon: 'user', label: 'Ton client', at: 1 },
              { icon: 'heart', label: 'Son levier émotionnel', at: 8 },
              { icon: 'cart', label: 'L’achat', at: 11.5 },
            ],
          },
          {
            type: 'acronym',
            d: 27.2,
            title: 'Les *6 boutons* psychologiques',
            letters: [
              { k: 'S', word: 'Sécurité', c: 'body', at: 17.8 },
              { k: 'O', word: 'Orgueil', c: 'hook', at: 19.5 },
              { k: 'N', word: 'Nouveauté', c: 'ia', at: 21 },
              { k: 'C', word: 'Confort', c: 'body', at: 22.5 },
              { k: 'A', word: 'Argent', c: 'gold', at: 24.4 },
              { k: 'S', word: 'Sympathie', c: 'cta', at: 25.9 },
            ],
          },
          {
            type: 'grid',
            d: 25.2,
            title: 'Un angle par bouton',
            cols: 3,
            items: [
              { icon: 'shield', label: 'Sécurité', sub: '« Paiement à la livraison »', c: 'body', at: 0.3 },
              { icon: 'star', label: 'Orgueil', sub: '« Le parfum qu’on te demandera »', c: 'hook', at: 3 },
              { icon: 'sparkles', label: 'Nouveauté', sub: '« La nouvelle formule est là »', c: 'ia', at: 6.3 },
              { icon: 'home', label: 'Confort', sub: '« Livré chez toi, sans effort »', c: 'body', at: 7.5 },
              { icon: 'money', label: 'Argent', sub: '« Un flacon qui dure 3 mois »', c: 'gold', at: 11.4 },
              { icon: 'heart', label: 'Sympathie', sub: '« Une marque d’ici, proche de toi »', c: 'cta', at: 16.3 },
            ],
          },
          { type: 'outro', d: 3, text: 'Trouve *le bon bouton* de ton client.' },
        ],
        key: [
          'SONCAS : les 6 boutons psychologiques — Sécurité, Orgueil, Nouveauté, Confort, Argent, Sympathie.',
          'Pourquoi ton client achète-t-il vraiment ? Trouve son levier émotionnel.',
          'Chaque bouton donne un angle de créative différent à tester (les phrases du cours sont des exemples).',
        ],
        quiz: [
          { q: '« Paiement à la livraison » joue sur quel bouton ?', a: ['Sécurité', 'Orgueil', 'Nouveauté'], ok: 0, why: 'Le client ne prend aucun risque : c’est la sécurité.' },
          { q: 'Que veut dire le A de SONCAS ?', a: ['Attention', 'Argent', 'Action'], ok: 1, why: 'Sécurité, Orgueil, Nouveauté, Confort, Argent, Sympathie.' },
        ],
      },
      {
        id: 'm3-l6',
        n: 6,
        title: 'Quelle formule, et quand ?',
        ar: 'أي أسلوب نستعمل ومتى؟',
        voice: true,
        video: 'video/m3-l6.mp4',
        audio: 'video/voix/m3-l6.m4a',
        poster: 'video/m3-l6.jpg',
        scenes: [
          { type: 'title', d: 4.3, kicker: 'Module 03 · Leçon 06', sub: 'AIDA · PAS · CAP · SONCAS' },
          {
            type: 'table',
            d: 51.9,
            title: 'Quelle formule utiliser, et *quand* ?',
            cols: ['Méthode', 'Quand l’utiliser ?', 'Son rôle en darija'],
            rows: [
              { cells: ['AIDA', 'Pour structurer toute la vidéo', 'الطريق لي يدينا للبيع'], c: 'hook', at: 5.1 },
              { cells: ['PAS', 'Dans le body : trouver la solution idéale', 'توفير و بيع الحل'], c: 'danger', at: 16.9 },
              { cells: ['CAP', 'Pour donner confiance, prouver', 'بينلو أهمية المنتج'], c: 'body', at: 27.5 },
              { cells: ['SONCAS', 'Pour choisir l’angle psychologique', 'افهم واش راهو حاب في راسو'], c: 'ia', at: 35.6 },
            ],
            note: 'La technique ne remplace pas l’empathie : *parle à l’humain* avant de parler au client.',
            noteAt: 43,
          },
          { type: 'outro', d: 3, text: 'La bonne formule, *au bon moment*.' },
        ],
        key: [
          'AIDA structure toute la vidéo ; PAS sert le body (trouver la solution idéale) ; CAP donne confiance avec des preuves ; SONCAS aide à choisir l’angle psychologique.',
          'Les formules se combinent : une vidéo AIDA peut avoir un body PAS et des preuves CAP.',
          'La technique ne remplace pas l’empathie : parle à l’humain avant de parler au client.',
        ],
        quiz: [
          { q: 'Pour structurer toute une vidéo, on utilise…', a: ['AIDA', 'SONCAS', 'CAP'], ok: 0, why: 'AIDA guide du premier regard jusqu’à l’action.' },
          { q: 'Pour choisir l’angle psychologique, on utilise…', a: ['PAS', 'SONCAS', 'AIDA'], ok: 1, why: 'SONCAS : les 6 boutons psychologiques.' },
          { q: 'Pour donner confiance avec des preuves…', a: ['CAP', 'PAS', 'AIDA'], ok: 0, why: 'Caractéristique, Avantage, Preuve.' },
        ],
      },
    ],
  },
  {
    id: 'm4',
    n: 4,
    part: 'p1',
    title: 'La révolution UGC',
    ar: 'ثورة UGC',
    color: '#55b894',
    icon: 'users',
    pitch: 'Le contenu créé par de vrais clients : pourquoi il convertit mieux qu’une pub parfaite.',
    lessons: [
      {
        id: 'm4-l1',
        n: 1,
        title: 'C’est quoi l’UGC ?',
        ar: 'شنو هو UGC',
        voice: true,
        video: 'video/m4-l1.mp4',
        audio: 'video/voix/m4-l1.m4a',
        poster: 'video/m4-l1.jpg',
        scenes: [
          { type: 'title', d: 9.2, fr: 'La révolution UGC', kicker: 'Module 04 · Leçon 01', sub: 'User Generated Content : le nouveau standard publicitaire' },
          {
            type: 'phone',
            d: 15.5,
            mode: 'ugc',
            kicker: 'C’est quoi l’UGC ?',
            title: 'Du contenu créé par *de vrais clients*',
            ar: 'محتوى يصنعه أشخاص حقيقيون',
            bg: 'cuisine',
            art: 'creme',
            hijab: true,
            captions: [
              { t: 'Je l’ai testée…', at: 1.5 },
              { t: 'Franchement ?', at: 6 },
              { t: 'Je recommande', at: 11 },
            ],
            side: [
              { icon: 'users', label: 'Créé par des utilisateurs', sub: 'Des clients réels', at: 1.1, c: 'body' },
              { icon: 'user', label: 'Ou des créateurs', sub: 'Qui parlent comme de vrais clients', at: 4.5, c: 'body' },
              { icon: 'chat', label: 'Ils partagent leur expérience', sub: 'Simplement, avec le produit', at: 9, c: 'body' },
            ],
          },
          {
            type: 'checklist',
            d: 19.2,
            title: 'Ce qu’il faut — et ce qu’il ne faut pas',
            items: [
              { t: 'Un studio', bad: true, at: 1 },
              { t: 'Un script « vendeur »', bad: true, at: 5 },
              { t: 'Juste *un smartphone*', at: 9 },
              { t: 'Et de *l’authenticité*', at: 13 },
            ],
          },
          {
            type: 'flow',
            d: 20.1,
            title: 'L’authenticité crée *la confiance*',
            nodes: [
              { icon: 'user', label: 'Une vraie personne', at: 1 },
              { icon: 'chat', label: 'Son expérience', at: 6 },
              { icon: 'shield', label: 'La confiance', sub: 'Et l’envie d’acheter', at: 14.7 },
            ],
          },
          { type: 'quote', d: 17.6, text: 'Le client sent quand c’est *faux*. L’UGC, c’est *la différence*.' },
          { type: 'outro', d: 3, text: 'L’UGC : *le nouveau standard* publicitaire.' },
        ],
        key: [
          'UGC = User Generated Content : du contenu créé par des utilisateurs, ou par des créateurs qui parlent comme de vrais clients.',
          'Pas de studio, pas de script « vendeur » : juste un smartphone et de l’authenticité.',
          'L’authenticité crée la confiance : c’est ce qui fait la force de l’UGC.',
        ],
        quiz: [
          { q: 'Que veut dire UGC ?', a: ['User Generated Content', 'Unique Graphic Creation', 'Ultra Good Campaign'], ok: 0, why: 'Du contenu généré par les utilisateurs.' },
          { q: 'Pour faire de l’UGC, il faut surtout…', a: ['Un studio professionnel', 'Un smartphone et de l’authenticité', 'Un script de vendeur'], ok: 1, why: 'La force de l’UGC, c’est son naturel.' },
        ],
      },
      {
        id: 'm4-l2',
        n: 2,
        title: 'Pub classique vs UGC',
        ar: 'إعلان كلاسيكي أم UGC',
        voice: true,
        video: 'video/m4-l2.mp4',
        audio: 'video/voix/m4-l2.m4a',
        poster: 'video/m4-l2.jpg',
        scenes: [
          { type: 'title', d: 4.7, kicker: 'Module 04 · Leçon 02', sub: 'Parfaite… ou vraie ?' },
          {
            type: 'phone',
            d: 18.9,
            mode: 'video',
            kicker: 'Publicité classique',
            title: 'Parfaite… mais *perçue comme fausse*',
            ar: 'إعلانات كلاسيكية: مثالية لكنها تبدو غير حقيقية',
            bg: 'studio',
            caption: 'La nouvelle collection est arrivée.',
            captions: [
              { t: 'NOUVEAU', at: 1.2 },
              { t: 'Qualité premium', at: 6 },
              { t: 'Disponible', at: 12 },
            ],
            side: [
              { icon: 'camera', label: 'Image parfaite, studio', at: 1.8, c: 'mist' },
              { icon: 'eye', label: 'On sent la mise en scène', at: 3.3, c: 'mist' },
              { icon: 'x', label: 'Alors on se méfie', at: 13.9, c: 'danger' },
            ],
          },
          {
            type: 'phone',
            d: 21.3,
            mode: 'ugc',
            align: 'right',
            kicker: 'UGC',
            title: 'Brute, réelle… *comme un conseil d’ami*',
            ar: 'واقعية وتبدو كنصيحة من صديق',
            bg: 'bain',
            art: 'serum',
            captions: [
              { t: 'Je vous montre…', at: 1.5 },
              { t: 'Sans filtre', at: 7.5 },
              { t: 'Je recommande', at: 14.5 },
            ],
            side: [
              { icon: 'phone', label: 'Filmé au téléphone', at: 1, c: 'body' },
              { icon: 'check', label: 'Rien de mis en scène', at: 7.2, c: 'body' },
              { icon: 'chat', label: 'Comme le conseil d’un ami', at: 14.7, c: 'body' },
            ],
          },
          { type: 'stat', d: 10.6, value: '92', suffix: '%', label: 'des consommateurs font confiance aux *recommandations* de vraies personnes', sub: 'Chiffre cité dans le cours, souvent attribué à une étude Nielsen', countDur: 1.6 },
          {
            type: 'compare',
            d: 13.8,
            title: 'Classique ou UGC ?',
            left: { title: 'Pub classique', tone: 'bad', items: ['Parfaite', 'Perçue comme « fausse »'] },
            right: { title: 'UGC', tone: 'good', items: ['Brute, réelle', 'Perçue comme un conseil d’ami'] },
            rightAt: 4,
          },
          { type: 'outro', d: 3, text: 'On fait confiance *aux gens*, pas aux pubs.' },
        ],
        key: [
          'La publicité classique est parfaite… mais perçue comme « fausse » : on sent la mise en scène.',
          'L’UGC est brut et réel : il est perçu comme le conseil d’un ami.',
          'On fait davantage confiance aux recommandations de vraies personnes qu’aux publicités.',
        ],
        quiz: [
          { q: 'Comment est perçue une pub classique trop parfaite ?', a: ['Comme un conseil d’ami', 'Comme « fausse »', 'Comme gratuite'], ok: 1, why: 'La mise en scène se voit : on se méfie.' },
          { q: 'L’UGC est perçu comme…', a: ['Un conseil d’ami', 'Une annonce officielle', 'Une promotion'], ok: 0, why: 'Une vraie personne, son vrai avis.' },
        ],
      },
      {
        id: 'm4-l3',
        n: 3,
        title: 'Pourquoi l’UGC convertit',
        ar: 'لماذا يبيع UGC',
        voice: true,
        video: 'video/m4-l3.mp4',
        audio: 'video/voix/m4-l3.m4a',
        poster: 'video/m4-l3.jpg',
        scenes: [
          { type: 'title', d: 5.3, kicker: 'Module 04 · Leçon 03', sub: 'Confiance · Identification · Rentabilité' },
          {
            type: 'cards',
            d: 25.7,
            title: 'Pourquoi ça *convertit* ?',
            items: [
              { icon: 'shield', label: 'Confiance', sub: 'On achète à des humains, pas à des logos', ar: 'الثقة: نحن نشتري من البشر', c: 'body', at: 0.6 },
              { icon: 'users', label: 'Identification', sub: '« Si ça marche pour lui, ça marchera pour moi »', ar: 'التشابه: إذا نجح معه، سينجح معي', c: 'hook', at: 7.5 },
              { icon: 'money', label: 'Rentabilité', sub: 'Une production bien moins chère qu’un tournage pro', ar: 'التكلفة: إنتاج أرخص بكثير', c: 'cta', at: 19.3 },
            ],
          },
          { type: 'big', d: 11.8, kicker: 'Retiens', text: 'L’UGC : *plus de confiance*, et un budget *bien plus léger*.' },
          { type: 'outro', d: 3, text: 'Prochaine étape : *produire* tes créatives.' },
        ],
        key: [
          'Confiance : on achète à des humains, pas à des logos.',
          'Identification : « si ça marche pour lui, ça marchera pour moi ».',
          'Rentabilité : une vidéo UGC coûte bien moins cher qu’un tournage professionnel (dans le cours : jusqu’à 10 fois moins).',
        ],
        quiz: [
          { q: 'Pourquoi l’UGC crée-t-il la confiance ?', a: ['On achète à des humains, pas à des logos', 'Il est plus long', 'Il est tourné en studio'], ok: 0, why: 'Une vraie personne inspire plus confiance qu’une marque.' },
          { q: '« Si ça marche pour lui, ça marchera pour moi » : c’est…', a: ['La rentabilité', 'L’identification', 'La sécurité'], ok: 1, why: 'Le client se reconnaît dans la personne.' },
        ],
      },
    ],
  },
  {
    id: 'm6',
    n: 5,
    part: 'p1',
    title: 'Le Brand Content',
    ar: 'محتوى العلامة التجارية',
    color: '#f2dfa0',
    icon: 'diamond',
    pitch: 'L’art de vendre un style de vie : des créatives qui construisent l’identité, l’autorité et le prestige de ta marque.',
    lessons: [
      {
        id: 'm6-l1',
        n: 1,
        title: 'C’est quoi le Brand Content ?',
        ar: 'ما هو محتوى العلامة التجارية',
        scenes: [
          { type: 'title', kicker: 'Module 05 · Leçon 01', fr: 'Le Brand Content', sub: 'L’art de vendre un style de vie et de bâtir un empire', say: 'On passe au Brand Content : l’art de vendre un style de vie, et de bâtir une marque qui dure.' },
          { type: 'big', kicker: 'Définition', text: 'Vendre *un style de vie*, pas seulement un produit.', ar: 'فن بيع أسلوب حياة', say: 'Le Brand Content, ce n’est pas une pub qui crie « achète ». C’est du contenu qui vend un style de vie, et qui construit ta marque.' },
          {
            type: 'cards',
            title: 'Des pubs qui construisent *ta marque*',
            items: [
              { icon: 'smile', label: 'L’identité', sub: 'Qui tu es, ce que tu défends', ar: 'الهوية', c: 'hook' },
              { icon: 'shield', label: 'L’autorité', sub: 'Tu deviens la référence de ton domaine', ar: 'السلطة', c: 'body' },
              { icon: 'diamond', label: 'Le prestige', sub: 'Ton produit vaut plus à leurs yeux', ar: 'المكانة', c: 'cta' },
            ],
            say: 'Ces publicités sont conçues pour construire trois choses : l’identité de ton entreprise, son autorité, et son prestige.',
          },
          {
            type: 'flow',
            title: 'L’objectif : *plus de valeur*, plus longtemps',
            nodes: [
              { icon: 'chart', label: 'La valeur perçue', sub: 'Ton produit vaut plus' },
              { icon: 'heart', label: 'Une connexion émotionnelle', sub: 'Le client s’attache' },
              { icon: 'users', label: 'Un client fidèle', sub: 'Sur le long terme' },
            ],
            say: 'L’objectif : augmenter la valeur perçue de tes produits, et créer une connexion émotionnelle à long terme avec le client.',
          },
          { type: 'quote', text: 'Ta marque, c’est *ce que les gens ressentent* quand ils voient ton produit.', say: 'Retiens : ta marque, c’est ce que les gens ressentent quand ils voient ton produit.' },
          { type: 'outro', text: 'Leçon suivante : *vendre ou bâtir* ?', say: 'Leçon suivante : vendre, ou bâtir ?' },
        ],
        key: [
          'Le Brand Content vend un style de vie, pas seulement un produit.',
          'Ces créatives construisent l’identité, l’autorité et le prestige de ton entreprise.',
          'L’objectif : augmenter la valeur perçue et créer une connexion émotionnelle à long terme avec le client.',
        ],
        quiz: [
          { q: 'Le Brand Content vend surtout…', a: ['Une promotion du jour', 'Un style de vie', 'Une fiche technique'], ok: 1, why: 'On vend un univers auquel le client veut appartenir.' },
          { q: 'Quel est l’objectif du Brand Content ?', a: ['Augmenter la valeur perçue et fidéliser', 'Vendre le moins cher possible', 'Remplacer le CTA'], ok: 0, why: 'Plus de valeur perçue, et un lien émotionnel qui dure.' },
        ],
      },
      {
        id: 'm6-l2',
        n: 2,
        title: 'Vendre ou bâtir ?',
        ar: 'البيع أم البناء',
        scenes: [
          { type: 'title', kicker: 'Module 05 · Leçon 02', sub: 'Deux objectifs, deux types de créatives', say: 'Deux objectifs, deux types de créatives : vendre, ou bâtir.' },
          {
            type: 'compare',
            title: 'Vendre *ou* bâtir',
            left: { title: 'La créative : le vendeur', tone: 'good', items: ['« Ce produit a résolu mon problème, achète-le ! »', 'Focus : la conversion immédiate'] },
            right: { title: 'Le Brand Content : l’univers', tone: 'good', items: ['« Voici notre vision du monde, rejoins notre mouvement. »', 'Focus : le désir et la fidélisation'] },
            say: 'La créative, c’est le vendeur : ce produit a résolu mon problème, achète-le. Elle vise la conversion immédiate. Le Brand Content, c’est l’univers : voici notre vision du monde, rejoins notre mouvement. Il vise le désir et la fidélisation.',
          },
          {
            type: 'cards',
            title: 'Quand utiliser *quoi* ?',
            items: [
              { icon: 'bolt', label: 'La créative', sub: 'Lancer un produit, vendre vite', ar: 'البيع الفوري وحل المشكلة', c: 'cta' },
              { icon: 'diamond', label: 'Le Brand Content', sub: 'Fidéliser, monter en gamme', ar: 'بناء الثقة والانتماء للعلامة', c: 'hook' },
            ],
            say: 'Tu lances un produit et tu veux vendre vite : la créative. Tu veux fidéliser et monter en gamme : le Brand Content.',
          },
          { type: 'big', kicker: 'Retiens', text: 'La créative *vend aujourd’hui*. Le Brand Content *fait revenir demain*.', say: 'Les deux sont complémentaires : la créative vend aujourd’hui, le Brand Content fait revenir demain.' },
          { type: 'outro', text: 'Leçon suivante : les *3 piliers* du prestige.', say: 'Leçon suivante : les trois piliers du prestige.' },
        ],
        key: [
          'La créative est un vendeur : elle résout un problème et vise la conversion immédiate.',
          'Le Brand Content est un univers : il partage une vision et vise le désir et la fidélisation.',
          'Les deux sont complémentaires : l’une vend aujourd’hui, l’autre fait revenir demain.',
        ],
        quiz: [
          { q: '« Voici notre vision du monde, rejoins notre mouvement » : c’est…', a: ['Une créative de conversion', 'Du Brand Content', 'Un CTA'], ok: 1, why: 'On invite à rejoindre un univers, pas à acheter tout de suite.' },
          { q: 'Tu lances un produit et tu veux vendre cette semaine. Tu choisis…', a: ['La créative', 'Le Brand Content', 'Aucune publicité'], ok: 0, why: 'La créative vise la conversion immédiate.' },
        ],
      },
      {
        id: 'm6-l3',
        n: 3,
        title: 'Les 3 piliers du prestige',
        ar: 'الركائز الثلاث للمكانة',
        scenes: [
          { type: 'title', kicker: 'Module 05 · Leçon 03', sub: 'Esthétique · Storytelling · Aspiration', say: 'Les trois piliers de l’ingénierie du prestige : l’esthétique, le storytelling et l’aspiration.' },
          {
            type: 'cards',
            title: 'L’ingénierie *du prestige*',
            items: [
              { icon: 'image', label: 'Esthétique', sub: 'Image irréprochable, charte stricte : couleurs, typographie', c: 'hook' },
              { icon: 'book', label: 'Storytelling', sub: 'Le « pourquoi » : ta mission, les coulisses, l’artisanat', c: 'body' },
              { icon: 'star', label: 'Aspiration', sub: 'La personne que ton client rêve de devenir', c: 'cta' },
            ],
            say: 'Un : l’esthétique. Une image irréprochable, une charte graphique stricte, couleurs et typographie : tout doit respirer le premium. Deux : le storytelling. Raconte le pourquoi : ta mission, les coulisses de fabrication, l’artisanat derrière le produit. Trois : l’aspiration.',
          },
          { type: 'big', kicker: 'Aspiration', text: 'Ne montre pas seulement le produit : montre *qui devient* ton client.', say: 'Ne montre pas seulement le produit : montre la personne que le client rêve de devenir en l’utilisant.' },
          {
            type: 'checklist',
            title: 'Ta créative respire *le premium* ?',
            items: [{ t: 'Une image nette, une lumière soignée' }, { t: 'Les mêmes couleurs, les mêmes polices' }, { t: 'Une histoire, pas une fiche technique' }, { t: 'Le client *se projette*' }],
            say: 'Avant de publier, vérifie : une image nette, les mêmes couleurs et polices, une histoire plutôt qu’une fiche technique, et un client qui se projette.',
          },
          { type: 'outro', text: 'Leçon suivante : *l’écosystème* complet.', say: 'Leçon suivante : l’écosystème créatif complet.' },
        ],
        key: [
          'Esthétique : image irréprochable et charte graphique stricte, tout doit respirer le premium.',
          'Storytelling : raconte le « pourquoi » (ta mission, les coulisses, l’artisanat derrière le produit).',
          'Aspiration : montre la personne que le client rêve de devenir en utilisant ton produit.',
        ],
        quiz: [
          { q: 'Raconter les coulisses de fabrication, c’est quel pilier ?', a: ['L’esthétique', 'Le storytelling', 'L’aspiration'], ok: 1, why: 'Le storytelling raconte le « pourquoi » et les coulisses.' },
          { q: 'Le pilier « aspiration » consiste à montrer…', a: ['Le prix barré', 'La personne que le client rêve de devenir', 'La fiche technique'], ok: 1, why: 'On vend une projection, pas seulement un objet.' },
        ],
      },
      {
        id: 'm6-l4',
        n: 4,
        title: 'L’écosystème créatif parfait',
        ar: 'المنظومة الإبداعية المثالية',
        scenes: [
          { type: 'title', kicker: 'Module 05 · Leçon 04', sub: 'Tout ce que tu as appris, en une équation', say: 'On assemble tout ce que tu as appris : l’écosystème créatif parfait.' },
          {
            type: 'formula',
            title: 'Une pub qui rapporte = *une équation*',
            parts: [
              { t: 'Hook', sub: 'L’étincelle : arrêter le scroll', c: 'hook' },
              { t: 'Body', sub: 'Le moteur : convaincre', c: 'body' },
              { t: 'CTA', sub: 'La destination : le clic', c: 'cta' },
            ],
            say: 'L’étincelle, c’est le hook : il arrête le scroll dans les trois premières secondes. Le moteur, c’est le body. Et la destination, c’est le CTA : il récolte le clic et la conversion.',
          },
          {
            type: 'cards',
            title: 'Le moteur, *en détail*',
            items: [
              { icon: 'target', label: 'AIDA, PAS', sub: 'Vendre la solution', c: 'body' },
              { icon: 'users', label: 'L’UGC', sub: 'Rassurer avec de vraies personnes', c: 'body' },
              { icon: 'diamond', label: 'Le Brand Content', sub: 'Bâtir le prestige', c: 'hook' },
            ],
            say: 'Dans le moteur, tu vends la solution avec AIDA ou PAS, tu rassures avec l’UGC, et tu bâtis le prestige avec le Brand Content.',
          },
          { type: 'quote', text: 'Une pub rentable n’est *jamais un hasard* : c’est une équation.', ar: 'الإعلان المربح ليس صدفة، بل هو معادلة', say: 'Retiens : une publicité rentable n’est jamais un hasard. C’est une équation : attirer tout de suite, convaincre et rassurer, puis guider vers l’action.' },
          { type: 'outro', text: 'Prochaine étape : *produire* tes créatives.', say: 'Prochaine étape : produire tes créatives.' },
        ],
        key: [
          'Le Hook est l’étincelle : il arrête le scroll dans les 3 premières secondes.',
          'Le Body est le moteur : il vend la solution (AIDA, PAS), rassure avec l’UGC et bâtit le prestige avec le Brand Content.',
          'Le CTA est la destination : il récolte le clic et la conversion. Une pub rentable n’est pas un hasard, c’est une équation.',
        ],
        quiz: [
          { q: 'Dans l’écosystème créatif, le Body est…', a: ['L’étincelle', 'Le moteur', 'La destination'], ok: 1, why: 'Il convainc, rassure et bâtit le prestige.' },
          { q: 'Une publicité rentable, c’est…', a: ['Une question de chance', 'Une équation : Hook + Body + CTA', 'Uniquement un gros budget'], ok: 1, why: 'Attirer, convaincre, guider : chaque partie a son rôle.' },
        ],
      },
    ],
  },
  {
    id: 'm5',
    n: 6,
    part: 'p1',
    title: 'Produire sans IA : vidéo, image, carrousel',
    ar: 'الإنتاج بدون ذكاء اصطناعي',
    color: '#d4af37',
    icon: 'film',
    pitch: 'Les gestes de base dans CapCut et Canva, avant d’ajouter l’IA.',
    lessons: [
      {
        id: 'm5-l1',
        n: 1,
        title: 'Monter une pub vidéo dans CapCut',
        ar: 'المونتاج في CapCut',
        scenes: [
          { type: 'title', sub: 'Rythme · sous-titres · musique', say: 'On passe à la pratique : monter une publicité vidéo dans CapCut.' },
          { type: 'timeline', title: 'Le workflow en 5 étapes', app: 'CapCut', clips: [{ label: 'Hook', c: 'hook', w: 2 }, { label: 'Problème', c: 'body', w: 2 }, { label: 'Produit', c: 'body', w: 3 }, { label: 'Preuve', c: 'body', w: 2 }, { label: 'CTA', c: 'cta', w: 2 }], tracks: [{ label: 'Sous-titres', c: 'gold', icon: 'captions', from: 0, to: 0.97 }, { label: 'Musique', c: 'ia', icon: 'music', from: 0, to: 1 }], cuts: [{ x: 0.2 }, { x: 0.38 }, { x: 0.65 }], steps: [{ icon: 'download', label: 'Importer les rushes' }, { icon: 'scissors', label: 'Couper les temps morts' }, { icon: 'layers', label: 'Ordonner Hook → CTA' }, { icon: 'captions', label: 'Sous-titres auto' }, { icon: 'music', label: 'Musique à −20 dB' }], say: 'Le workflow : importe tes rushes, coupe tous les temps morts, ordonne les plans du hook jusqu’au CTA, ajoute les sous-titres automatiques, puis une musique assez basse pour qu’on entende la voix.' },
          { type: 'stat', value: '2', suffix: 's', label: 'un nouveau plan toutes les 2 à 3 secondes', say: 'La règle du rythme : un nouveau plan, ou un changement à l’écran, toutes les deux à trois secondes.' },
          { type: 'checklist', title: 'Avant d’exporter', items: ['Le hook est visible *dès la 1ʳᵉ image*', 'Sous-titres lisibles, au centre', 'Le produit apparaît avant 5 secondes', 'Le CTA est écrit *et* dit'], say: 'Avant d’exporter, vérifie : le hook est visible dès la première image, les sous-titres sont lisibles, le produit apparaît vite, et le CTA est à la fois écrit et dit.' },
          { type: 'outro', say: 'Leçon suivante : une image qui convertit dans Canva.' },
        ],
        key: ['Importer, couper les temps morts, ordonner du Hook au CTA, sous-titrer, ajouter la musique.', 'Un changement à l’écran toutes les 2 à 3 secondes.', 'Le CTA doit être écrit à l’écran et dit en voix off.'],
        quiz: [{ q: 'À quel rythme change-t-on de plan ?', a: ['Toutes les 2 à 3 secondes', 'Toutes les 15 secondes', 'Jamais'], ok: 0, why: 'Un rythme rapide garde l’attention.' }],
      },
      {
        id: 'm5-l2',
        n: 2,
        title: 'Une image qui convertit dans Canva',
        ar: 'صورة تبيع في Canva',
        scenes: [
          { type: 'title', sub: 'Hiérarchie · contraste · un seul message', say: 'Maintenant, une image publicitaire qui convertit, dans Canva.' },
          { type: 'layers', title: 'Une image = 5 calques', bg: 'teal', layers: [{ label: 'Le fond', sub: 'Uni ou décor simple', kind: 'bg' }, { label: 'Le produit', sub: 'Net, bien éclairé', kind: 'product' }, { label: 'Le titre', sub: '6 mots maximum', kind: 'title' }, { label: 'La preuve', sub: 'Livraison, garantie…', kind: 'badge' }, { label: 'Le CTA', sub: 'Un bouton visible', kind: 'cta' }], say: 'Une image publicitaire, c’est cinq calques : le fond, le produit bien éclairé, un titre de six mots maximum, une preuve comme la livraison ou une garantie, et le bouton d’action.' },
          { type: 'compare', title: 'Trop d’infos tue l’info', left: { title: 'Surchargée', tone: 'bad', items: ['5 couleurs, 4 polices', '3 messages en même temps'] }, right: { title: 'Lisible', tone: 'good', items: ['2 couleurs, 1 police', 'Un seul message'] }, say: 'Le piège classique : trop de couleurs, trop de polices, trop de messages. Deux couleurs, une police, un message.' },
          { type: 'quote', text: 'Si on ne comprend pas ton image en *1 seconde*, elle est trop chargée.', say: 'Le test : si on ne comprend pas ton image en une seconde, elle est trop chargée.' },
          { type: 'outro', say: 'Leçon suivante : construire un carrousel.' },
        ],
        key: ['Cinq calques : fond, produit, titre, preuve, CTA.', 'Deux couleurs, une police, un seul message.', 'Le test de la seconde : on doit comprendre l’image immédiatement.'],
        quiz: [{ q: 'Combien de messages dans une image publicitaire ?', a: ['Un seul', 'Trois', 'Le plus possible'], ok: 0, why: 'Un message clair se lit en une seconde.' }],
      },
      {
        id: 'm5-l3',
        n: 3,
        title: 'Construire un carrousel slide par slide',
        ar: 'بناء الكاروسيل',
        scenes: [
          { type: 'title', sub: 'Une histoire en 5 slides', say: 'Le carrousel, c’est une histoire racontée slide par slide.' },
          { type: 'storyboard', title: 'La structure en 5 slides', frames: [{ label: 'Hook', sub: 'La promesse ou la question', shot: 'gros', bg: 'nuit', dur: 'slide 1' }, { label: 'Problème', sub: 'Ce que vit le client', shot: 'moyen', bg: 'rose', dur: 'slide 2' }, { label: 'Solution', sub: 'Le produit', shot: 'detail', bg: 'teal', dur: 'slide 3' }, { label: 'Preuve', sub: 'Démo, garantie', shot: 'detail', art: 'creme', bg: 'sable', dur: 'slide 4' }, { label: 'CTA', sub: 'Ce qu’il faut faire', shot: 'detail', bg: 'or', dur: 'slide 5' }], say: 'Slide un : le hook. Slide deux : le problème. Slide trois : la solution, ton produit. Slide quatre : la preuve. Slide cinq : l’appel à l’action.' },
          { type: 'checklist', title: 'Les règles du carrousel', items: ['La slide 1 doit donner envie de *glisser*', 'Une idée par slide', 'Le même style sur toutes les slides', 'Le CTA sur la *dernière*'], say: 'Les règles : la première slide doit donner envie de glisser, une idée par slide, le même style partout, et le CTA sur la dernière.' },
          { type: 'outro', say: 'Leçon suivante : exporter sans perdre la qualité.' },
        ],
        key: ['Cinq slides : hook, problème, solution, preuve, CTA.', 'La slide 1 doit donner envie de glisser.', 'Une idée par slide, un style cohérent, le CTA à la fin.'],
        quiz: [{ q: 'Où placer le CTA dans un carrousel ?', a: ['Sur la première slide', 'Sur la dernière slide', 'Nulle part'], ok: 1, why: 'La dernière slide conclut et pousse à l’action.' }],
        widget: 'carrousel',
      },
      {
        id: 'm5-l4',
        n: 4,
        title: 'Exporter sans perdre la qualité',
        ar: 'التصدير بجودة عالية',
        scenes: [
          { type: 'title', sub: 'Les bons réglages', say: 'Dernière étape avant de publier : l’export.' },
          { type: 'cards', title: 'Les réglages à retenir', items: [{ icon: 'frame', label: '1080 × 1920', sub: 'Vertical, en haute définition', c: 'gold' }, { icon: 'film', label: '30 images/s', sub: 'Fluide et léger', c: 'gold' }, { icon: 'download', label: 'MP4 · H.264', sub: 'Accepté partout', c: 'gold' }], say: 'Retiens trois réglages : 1080 par 1920 en vertical, trente images par seconde, et le format MP4.' },
          { type: 'ratio', safe: true, items: [{ r: '9:16', use: '1080 × 1920 px' }, { r: '4:5', use: '1080 × 1350 px' }, { r: '1:1', use: '1080 × 1080 px' }], say: 'Pour les images : 1080 par 1920 en vertical, 1080 par 1350 en 4:5 et 1080 par 1080 en carré. Et garde tes textes hors des zones cachées par l’interface.' },
          { type: 'checklist', title: 'Check final', items: ['Regarder la vidéo *en entier* sur son téléphone', 'Tester *sans le son*', 'Vérifier l’orthographe des textes', 'Nommer le fichier : produit-hook-version'], say: 'Le check final : regarde la vidéo en entier sur ton téléphone, teste sans le son, vérifie l’orthographe, et nomme bien tes fichiers pour t’y retrouver quand tu testeras plusieurs versions.' },
          { type: 'outro', say: 'Place à la pratique : on monte ta pub de A à Z, en commençant par trouver les pubs qui marchent.' },
        ],
        key: ['Vidéo : 1080 × 1920, 30 images/s, MP4 (H.264).', 'Images : 1080 × 1920, 1080 × 1350 ou 1080 × 1080 selon le format.', 'Toujours vérifier sur téléphone, sans le son, et nommer ses versions.'],
        quiz: [{ q: 'Quelle résolution pour une vidéo verticale ?', a: ['1080 × 1920', '640 × 480', '1920 × 1080'], ok: 0, why: '1080 de large, 1920 de haut : vertical HD.' }],
      },
    ],
  },
  // Atelier pratique (M07) : de la recherche à la pub publiée, pas à pas.
  {
    id: 'm7',
    n: 7,
    part: 'p1',
    title: 'Atelier pratique : ta pub de A à Z',
    ar: 'ورشة تطبيقية',
    color: '#e8956b',
    icon: 'scissors',
    pitch: 'De la recherche des pubs qui marchent jusqu’à ta pub publiée : chaque étape, avec ton téléphone, CapCut et Canva.',
    lessons: [
      {
        id: 'm7-l1',
        n: 1,
        title: 'Trouver les pubs qui marchent',
        ar: 'البحث عن الإعلانات الناجحة',
        scenes: [
          { type: 'title', sub: 'La recherche de data, avant de filmer', say: 'Avant de filmer quoi que ce soit, on cherche : quelles pubs marchent déjà dans ta niche ?' },
          {
            type: 'cards',
            title: 'Deux bibliothèques *gratuites*',
            items: [
              { icon: 'search', label: 'Bibliothèque publicitaire de Meta', sub: 'Facebook et Instagram · par pays et mot-clé', c: 'body' },
              { icon: 'fire', label: 'TikTok Creative Center', sub: 'Rubrique Top Ads · par région et secteur', c: 'hook' },
            ],
            say: 'Deux outils gratuits. La Bibliothèque publicitaire de Meta : les pubs en cours sur Facebook et Instagram, par pays et par mot-clé. Le TikTok Creative Center, rubrique Top Ads : des pubs TikTok qui performent.',
          },
          {
            type: 'steps',
            title: 'Ta recherche en *4 gestes*',
            items: [
              { k: '1', label: 'Choisis le pays', sub: 'Algérie · « Toutes les publicités »', c: 'gold' },
              { k: '2', label: 'Tape un mot-clé', sub: 'parfum, sérum, montre, « livraison »…', c: 'hook' },
              { k: '3', label: 'Regarde la date de début', sub: '« Diffusion commencée le… »', c: 'body' },
              { k: '4', label: 'Garde les meilleures', sub: 'Une capture et le lien', c: 'cta' },
            ],
            say: 'Sur Meta : choisis l’Algérie et toutes les publicités. Tape un mot-clé : parfum, sérum, montre, ou même « livraison ». Regarde la date de début de diffusion, et garde les meilleures avec le lien.',
          },
          {
            type: 'big',
            kicker: 'L’indice',
            text: 'Une pub active *depuis des semaines* rapporte *souvent*.',
            sub: 'On ne paie pas longtemps une pub qui perd. Un indice, pas une preuve.',
            say: 'L’indice qui compte : une pub active depuis plusieurs semaines rapporte souvent, parce qu’on ne paie pas longtemps une pub qui perd. C’est un indice, pas une certitude.',
          },
          {
            type: 'checklist',
            title: 'Ta *fiche d’analyse*',
            items: ['Le *hook* : les 3 premières secondes', 'La *durée* et le *format* : UGC, démo, face caméra…', 'L’*angle* : problème, envie, prix, cadeau…', 'L’*offre* et le *CTA*'],
            say: 'Pour chaque pub gardée, remplis ta fiche : le hook, ce qu’on voit et entend au début. La durée et le format. L’angle choisi. Puis l’offre et le CTA.',
          },
          {
            type: 'flow',
            title: 'Et ensuite ?',
            nodes: [
              { icon: 'search', label: 'Trouver', sub: 'Les pubs qui durent', c: 'gold' },
              { icon: 'chart', label: 'Décortiquer', sub: 'Avec Hooked Lab', c: 'hook' },
              { icon: 'pen', label: 'Adapter', sub: 'À ton produit', c: 'body' },
            ],
            say: 'Pour aller plus vite, Hooked Lab, l’application d’analyse de l’équipe, t’aide à décortiquer une pub. Ensuite, tu adaptes la structure à ton produit, sans copier le contenu.',
          },
          { type: 'outro', say: 'Leçon suivante : la bonne durée d’une créative.' },
        ],
        key: [
          'Bibliothèque publicitaire de Meta (pays + mot-clé) et TikTok Creative Center (Top Ads) : deux sources gratuites de vraies pubs. Les outils évoluent, le principe reste.',
          'Une pub active depuis longtemps rapporte souvent : c’est un indice, pas une preuve.',
          'Pour chaque pub : hook, durée, format, angle, offre, CTA. On s’inspire de la structure, on ne copie pas le contenu.',
        ],
        quiz: [
          { q: 'Une pub diffusée depuis plusieurs semaines, c’est…', a: ['La preuve absolue qu’elle vend', 'Souvent le signe qu’elle rapporte', 'Le signe qu’elle est ratée'], ok: 1, why: 'Un annonceur paie rarement longtemps une pub qui perd, mais ce n’est qu’un indice.' },
          { q: 'Dans ta fiche d’analyse, le hook, c’est…', a: ['Le prix du produit', 'Ce qui se passe dans les 3 premières secondes', 'Le nom de la page'], ok: 1, why: 'C’est le moment qui arrête le scroll : ce qu’on voit, entend et lit au tout début.' },
        ],
        res: [
          {
            title: 'Fiche d’analyse d’une pub',
            text: 'Pub n° [  ]\nLien : [lien de la pub]\nPage / marque : [nom]\nPlateforme : [Facebook / Instagram / TikTok]\nEn ligne depuis : [date de début de diffusion]\n\nHook (3 premières secondes) : [ce qu’on voit] / [ce qu’on entend] / [texte à l’écran]\nDurée : [  ] s\nFormat : [UGC / démo / face caméra / avant-après / déballage…]\nAngle : [problème / envie / prix / cadeau / nouveauté…]\nOffre : [prix, pack, livraison, paiement…]\nCTA : [ce qu’on demande de faire]\n\nCe que je reprends (la structure, pas le contenu) : [  ]',
          },
        ],
      },
      {
        id: 'm7-l2',
        n: 2,
        title: 'La bonne durée d’une créative',
        ar: 'المدة المناسبة للإعلان',
        scenes: [
          { type: 'title', sub: 'Ni trop court, ni trop long', say: 'Combien de secondes doit durer ta pub ? Il n’y a pas de chiffre magique, mais il y a des repères.' },
          {
            type: 'steps',
            title: 'Trois *repères* de durée',
            items: [
              { k: '1', label: '6 à 15 secondes', sub: 'Stories, Reels : un message, une offre', c: 'hook' },
              { k: '2', label: '15 à 30 secondes', sub: 'Le format courant des pubs TikTok et Reels', c: 'body' },
              { k: '3', label: '30 à 60 secondes', sub: 'UGC, démonstration, produit à expliquer', c: 'cta' },
            ],
            say: 'Six à quinze secondes pour les stories et les reels : un message, une offre. Quinze à trente secondes, le format courant des pubs TikTok et Reels. Trente à soixante secondes pour un UGC ou une démonstration.',
          },
          {
            type: 'quote',
            text: 'Aussi court que possible, *aussi long que nécessaire*.',
            say: 'La vraie règle : aussi court que possible, aussi long que nécessaire. Une montre se montre en dix secondes. Un robot de cuisine a besoin d’une démonstration.',
          },
          {
            type: 'stat',
            value: '2',
            suffix: 's',
            label: 'un changement à l’écran toutes les 2 à 3 secondes',
            sub: 'Un nouveau plan, un zoom, un texte',
            say: 'Et quelle que soit la durée, garde le rythme : un changement à l’écran toutes les deux à trois secondes. Un nouveau plan, un zoom, un texte.',
          },
          {
            type: 'compare',
            title: 'Ce qu’on *coupe*',
            left: { title: 'Avant', tone: 'bad', items: ['« Salam, aujourd’hui je vais vous présenter… »', 'Les répétitions et les silences'] },
            right: { title: 'Après', tone: 'good', items: ['Le hook dès la 1ʳᵉ seconde', 'Chaque plan apporte une info'] },
            say: 'Pour raccourcir, coupe ce qui n’apporte rien : l’intro « salam, aujourd’hui je vais vous présenter », les répétitions, les silences. Commence direct par le hook. Le test : si toi tu t’ennuies, ton client aussi.',
          },
          { type: 'outro', say: 'Leçon suivante : préparer le tournage au téléphone.' },
        ],
        key: [
          'Repères : 6–15 s pour stories et reels, 15–30 s pour la plupart des pubs TikTok et Reels, 30–60 s pour l’UGC et les démos.',
          'Aussi court que possible, aussi long que nécessaire : la durée dépend de ce que le produit demande à montrer.',
          'Un changement à l’écran toutes les 2 à 3 secondes, et on coupe tout ce qui n’apporte rien.',
        ],
        quiz: [
          { q: 'Tu fais la démonstration d’un robot de cuisine. Quelle durée vises-tu plutôt ?', a: ['6 secondes', '30 à 60 secondes', '3 minutes'], ok: 1, why: 'Un produit à expliquer a besoin de temps, mais pas plus que nécessaire.' },
          { q: 'Quelle est la règle de la durée ?', a: ['Toujours 60 secondes', 'Aussi court que possible, aussi long que nécessaire', 'Le plus long possible pour tout montrer'], ok: 1, why: 'La durée dépend du message : on coupe tout ce qui n’apporte rien.' },
        ],
      },
      {
        id: 'm7-l3',
        n: 3,
        title: 'Préparer le tournage au téléphone',
        ar: 'التحضير للتصوير بالهاتف',
        scenes: [
          { type: 'title', sub: 'Ton téléphone suffit, si tu prépares', say: 'Ton téléphone suffit pour filmer une pub qui vend. La différence, c’est la préparation. Voici ta checklist.' },
          {
            type: 'checklist',
            title: 'Avant d’appuyer sur *REC*',
            items: ['La lumière du jour, *face à une fenêtre*', 'L’objectif *nettoyé*', 'Le téléphone *à la verticale* : 9:16', 'Posé sur un trépied ou un support', 'Un endroit calme, en *mode avion*'],
            say: 'Avant d’enregistrer : lumière du jour, face à une fenêtre. Objectif nettoyé avec un tissu doux. Téléphone à la verticale, posé sur un trépied ou calé contre des livres. Et un endroit calme, en mode avion pour éviter les appels.',
          },
          {
            type: 'steps',
            title: 'Ta *liste de plans*, écrite avant',
            items: [
              { k: '1', label: 'Le produit en main', sub: 'On voit ce qu’on achète', c: 'gold' },
              { k: '2', label: 'Les détails', sub: 'Matière, bouchon, texture, en gros plan', c: 'hook' },
              { k: '3', label: 'L’utilisation', sub: 'Le vrai geste, du début à la fin', c: 'body' },
              { k: '4', label: 'Le résultat', sub: 'Ce que ça change, sans filtre', c: 'body' },
              { k: '5', label: 'Face caméra', sub: 'Ton avis, phrase par phrase', c: 'cta' },
            ],
            say: 'Écris ta liste de plans avant de filmer. Le produit en main. Les détails en gros plan : le bouchon du parfum, la texture du sérum. L’utilisation, le vrai geste. Le résultat, sans filtre. Et un passage face caméra.',
          },
          {
            type: 'big',
            kicker: 'Le réflexe pro',
            text: 'Chaque plan, *3 fois*. Et des *plans de coupe* en plus.',
            sub: 'Mains, emballage, décor : de quoi couvrir chaque coupe au montage.',
            say: 'Le réflexe pro : filme chaque plan trois fois. Et ajoute des plans de coupe : tes mains, l’emballage, le décor. Au montage, ils te sauvent chaque fois qu’il faut cacher une coupe.',
          },
          {
            type: 'compare',
            title: 'Des rushes : *trop* vaut mieux que *pas assez*',
            left: { title: 'Le strict minimum', tone: 'bad', items: ['Un plan raté : tout refaire', 'Un montage sans rythme'] },
            right: { title: 'Plus que nécessaire', tone: 'good', items: ['Tu choisis la meilleure prise', 'De quoi faire des variantes'] },
            say: 'Filme toujours plus que nécessaire. Avec le strict minimum, un plan raté t’oblige à tout refaire. Avec plus de rushes, tu choisis la meilleure prise, et tu as déjà de quoi faire des variantes.',
          },
          { type: 'outro', say: 'Leçon suivante : la voix off au téléphone.' },
        ],
        key: [
          'Lumière du jour face à une fenêtre, objectif propre, vertical 9:16, téléphone stable, endroit calme.',
          'Une liste de plans écrite : produit en main, détails, utilisation, résultat, face caméra, plans de coupe.',
          'Chaque plan filmé 3 fois, et toujours plus de rushes que nécessaire.',
        ],
        quiz: [
          { q: 'Où te places-tu par rapport à la fenêtre ?', a: ['Dos à la fenêtre', 'Face à la fenêtre', 'Loin de toute fenêtre'], ok: 1, why: 'La lumière du jour éclaire ton visage et le produit ; dos à la fenêtre, tu es à contre-jour.' },
          { q: 'Combien de prises pour chaque plan ?', a: ['Une seule', 'Trois', 'Dix au minimum'], ok: 1, why: 'Trois prises te laissent le choix au montage, sans y passer la journée.' },
        ],
        res: [
          {
            title: 'Liste de plans (shot list)',
            text: 'Produit : [nom]\nLieu : [pièce calme, près d’une fenêtre] · Moment : [en journée]\nRéglages : vertical 9:16 · objectif nettoyé · téléphone sur trépied ou support · mode avion\n\n1. Produit en main : [on le prend, on le montre à la caméra]\n2. Détails : [gros plans : matière, bouchon, texture, étiquette]\n3. Utilisation : [le vrai geste, du début à la fin]\n4. Résultat : [ce que ça change, sans filtre ni retouche]\n5. Face caméra : [ton avis ou ton explication, phrase par phrase]\n6. Plans de coupe : [mains, emballage, décor, ambiance]\n\nPour chaque plan : 3 prises · 2 secondes de marge avant et après · plus de rushes que nécessaire.',
          },
        ],
      },
      {
        id: 'm7-l4',
        n: 4,
        title: 'La voix off au téléphone',
        ar: 'التعليق الصوتي بالهاتف',
        scenes: [
          { type: 'title', sub: 'Un son propre, sans micro', say: 'Une bonne voix off s’enregistre avec ton téléphone. Pas besoin de micro : il faut juste la bonne méthode.' },
          {
            type: 'big',
            kicker: 'Étape 1',
            text: 'D’abord *le script*. Ensuite le micro.',
            sub: 'Hook · Body · CTA, écrit et lu à voix haute',
            say: 'Première règle : on n’improvise pas. Écris ton script, hook, body, CTA, et lis-le à voix haute en chronométrant. Si tu bloques sur une phrase, raccourcis-la.',
          },
          {
            type: 'cards',
            title: 'Un *studio* à la maison',
            items: [
              { icon: 'home', label: 'Une petite pièce', sub: 'Vêtements, rideaux, coussins : ils absorbent l’écho', c: 'body' },
              { icon: 'phone', label: '15 à 20 cm', sub: 'De ta bouche, un peu de côté', c: 'hook' },
              { icon: 'wave', label: 'Le silence', sub: 'Climatiseur, ventilateur et télé éteints', c: 'cta' },
            ],
            say: 'Ton studio : une petite pièce pleine de vêtements, de rideaux ou de coussins, qui absorbent l’écho. Le téléphone à quinze ou vingt centimètres de ta bouche, un peu de côté. Et coupe le climatiseur, le ventilateur et la télé.',
          },
          {
            type: 'checklist',
            title: 'Au moment d’enregistrer',
            items: ['Parle avec *énergie*', 'Souris : *ça s’entend*', 'Fais *3 prises*', { t: 'Réciter d’une voix monotone', bad: true }],
            say: 'Quand tu enregistres : parle avec énergie, un peu plus qu’en conversation. Souris, ça s’entend dans la voix. Fais trois prises, tu garderas la meilleure. Le pire, c’est une voix monotone qui récite.',
          },
          {
            type: 'steps',
            title: 'Dans *CapCut*',
            items: [
              { k: '1', label: 'Voix off', sub: 'Tu enregistres directement sur ta vidéo', c: 'gold' },
              { k: '2', label: 'La meilleure prise', sub: 'Tu supprimes les autres', c: 'body' },
              { k: '3', label: 'Réduction de bruit', sub: 'Dans les options de l’audio', c: 'cta' },
            ],
            say: 'Enregistre directement dans CapCut avec la fonction voix off, ou avec une appli d’enregistrement puis importe le fichier. Garde la meilleure prise, et active la réduction de bruit dans les options de l’audio.',
          },
          { type: 'outro', say: 'Leçon suivante : des sous-titres qui retiennent.' },
        ],
        key: [
          'Le script d’abord (Hook, Body, CTA), lu à voix haute et chronométré.',
          'Une petite pièce pleine de tissus, le téléphone à 15–20 cm de la bouche, les appareils bruyants coupés.',
          'De l’énergie, le sourire, 3 prises ; puis voix off et réduction de bruit dans CapCut.',
        ],
        quiz: [
          { q: 'À quelle distance de ta bouche places-tu le téléphone ?', a: ['2 à 3 cm', '15 à 20 cm', 'À l’autre bout de la pièce'], ok: 1, why: 'Assez près pour une voix claire, assez loin pour éviter les souffles.' },
          { q: 'Quelle pièce choisir pour enregistrer ?', a: ['Une grande pièce vide', 'Une petite pièce avec des vêtements ou des rideaux', 'La cuisine, climatiseur allumé'], ok: 1, why: 'Les tissus absorbent l’écho ; une pièce vide résonne.' },
        ],
        res: [
          {
            title: 'Script de voix off (gabarit)',
            text: 'Produit : [nom] · Durée visée : [  ] s · Langue : [darija / français / arabe]\n\nHOOK (0 à 3 s) : [une phrase qui arrête le scroll]\nBODY : [le problème] → [le produit] → [comment on l’utilise] → [la preuve : démonstration, garantie réelle]\nCTA : [l’action] + [la réassurance, par exemple paiement à la livraison, si c’est vrai]\n\nAvant d’enregistrer : lire à voix haute, chronométrer, raccourcir les phrases où tu bloques.\nPendant : petite pièce, téléphone à 15–20 cm, climatiseur et ventilateur coupés, 3 prises.\nAprès : garder la meilleure prise, réduction de bruit dans CapCut.',
          },
        ],
      },
      {
        id: 'm7-l5',
        n: 5,
        title: 'Des sous-titres qui retiennent',
        ar: 'ترجمة نصية تشدّ المشاهد',
        scenes: [
          { type: 'title', sub: 'Pour ceux qui regardent sans le son', say: 'Beaucoup de gens scrollent sans le son. Tes sous-titres doivent faire passer le message à eux seuls.' },
          {
            type: 'steps',
            title: 'Dans *CapCut*',
            items: [
              { k: '1', label: 'Sous-titres automatiques', sub: 'Menu Texte ou Sous-titres, choisis la langue', c: 'gold' },
              { k: '2', label: 'Corrige chaque ligne', sub: 'Noms, prix, mots en darija', c: 'body' },
              { k: '3', label: 'Un seul style', sub: 'Le même sur toute la vidéo', c: 'cta' },
            ],
            say: 'Dans CapCut, lance les sous-titres automatiques et choisis la langue. Puis relis chaque ligne : la reconnaissance se trompe souvent sur les noms, les prix et la darija. Enfin, choisis un style et garde-le partout.',
          },
          {
            type: 'compare',
            title: 'Illisible *ou* lisible',
            left: { title: 'Illisible', tone: 'bad', items: ['4 lignes de texte d’un coup', 'Texte fin, blanc sur fond clair'] },
            right: { title: 'Lisible', tone: 'good', items: ['2 lignes maximum', 'Gros, contrasté, *mots clés* en couleur'] },
            say: 'Deux lignes maximum à la fois. Un texte assez gros, avec un contour ou un fond sombre pour le contraste. Et un ou deux mots clés par phrase en couleur : le prix, le bénéfice, le mot qui accroche.',
          },
          {
            type: 'cards',
            title: 'Reste dans la *zone sûre*',
            items: [
              { icon: 'x', label: 'Tout en bas', sub: 'Description, nom du compte, bouton', c: 'cta' },
              { icon: 'x', label: 'À droite', sub: 'J’aime, commentaires, partage', c: 'cta' },
              { icon: 'check', label: 'Au centre', sub: 'Loin des bords et des boutons', c: 'body' },
            ],
            say: 'Attention à l’interface de l’appli. Tout en bas : la description, le nom du compte, le bouton. À droite : les j’aime, les commentaires, le partage. Place tes sous-titres au centre, loin des bords.',
          },
          {
            type: 'quote',
            text: 'Coupe le son. Si on comprend ta pub, *tes sous-titres font le travail*.',
            say: 'Le test final : regarde ta pub sans le son. Si on comprend le produit et l’offre, tes sous-titres font le travail.',
          },
          { type: 'outro', say: 'Leçon suivante : la carte CTA dans Canva.' },
        ],
        key: [
          'Sous-titres automatiques de CapCut, puis relecture ligne par ligne : la reconnaissance se trompe souvent, surtout en darija.',
          '2 lignes maximum, un texte gros et contrasté, 1 ou 2 mots clés en couleur.',
          'Dans la zone sûre : ni tout en bas ni à droite, là où l’interface de l’appli se superpose.',
        ],
        quiz: [
          { q: 'Combien de lignes de sous-titres à l’écran en même temps ?', a: ['Deux au maximum', 'Quatre', 'Tout le texte d’un coup'], ok: 0, why: 'Deux lignes se lisent d’un coup d’œil, même en scrollant.' },
          { q: 'Où éviter de placer tes sous-titres ?', a: ['Au centre de l’écran', 'Tout en bas et à droite, sous l’interface de l’appli', 'Nulle part, tout reste visible'], ok: 1, why: 'La description, le nom du compte et les boutons cachent ces zones.' },
        ],
      },
      {
        id: 'm7-l6',
        n: 6,
        title: 'La carte CTA dans Canva',
        ar: 'بطاقة CTA في Canva',
        scenes: [
          { type: 'title', sub: 'Les 2 à 3 dernières secondes de ta pub', say: 'La fin de ta pub, c’est la carte CTA : deux à trois secondes qui disent exactement quoi faire.' },
          {
            type: 'cards',
            title: 'Ce qu’il y a *sur la carte*',
            items: [
              { icon: 'box', label: 'Le produit', sub: 'Net, bien éclairé', c: 'gold' },
              { icon: 'gift', label: 'L’offre', sub: 'Prix, pack ou cadeau, si elle est vraie', c: 'hook' },
              { icon: 'cart', label: 'L’action', sub: '« Commande maintenant »', c: 'cta' },
              { icon: 'shield', label: 'La réassurance', sub: 'Ex. : paiement à la livraison, livraison dans toutes les wilayas', c: 'body' },
            ],
            say: 'Quatre éléments. Le produit, net. L’offre, seulement si elle est vraie. L’action : commande maintenant. Et la réassurance, par exemple paiement à la livraison et livraison dans toutes les wilayas, si c’est ce que tu proposes.',
          },
          {
            type: 'steps',
            title: 'Dans *Canva*',
            items: [
              { k: '1', label: '1080 × 1920', sub: 'Vertical 9:16, comme ta vidéo', c: 'gold' },
              { k: '2', label: 'Fond uni, gros titre', sub: 'Un contraste fort, lisible en 1 seconde', c: 'hook' },
              { k: '3', label: 'Le bouton d’action', sub: 'Une couleur qui tranche', c: 'cta' },
              { k: '4', label: 'Télécharge', sub: 'En PNG, ou en MP4 si tu l’animes', c: 'body' },
            ],
            say: 'Dans Canva, crée un design en 1080 par 1920, le format de ta vidéo. Un fond uni, un gros titre, un contraste fort. Un bouton d’une couleur qui tranche. Puis télécharge en PNG, ou en MP4 si tu l’animes.',
          },
          {
            type: 'flow',
            title: 'Puis dans *CapCut*',
            nodes: [
              { icon: 'download', label: 'Importe', sub: 'La carte, à la fin', c: 'gold' },
              { icon: 'clock', label: '2 à 3 s', sub: 'À l’écran', c: 'body' },
              { icon: 'mic', label: 'Dis-le aussi', sub: 'Le CTA en voix off', c: 'cta' },
            ],
            say: 'Dans CapCut, ajoute la carte à la fin de ta vidéo, pendant deux à trois secondes. Et dis le CTA en voix off au même moment : écrit et dit, il est compris.',
          },
          {
            type: 'checklist',
            title: 'Avant de valider',
            items: ['Lisible *en 1 seconde*', 'Dans la zone sûre, loin des bords', '*Une seule* action demandée', { t: 'Une offre ou un délai inventés', bad: true }],
            say: 'Avant de valider : elle se lit en une seconde, elle reste dans la zone sûre, elle demande une seule action. Et jamais d’offre ni de délai inventés pour presser le client.',
          },
          { type: 'outro', say: 'Leçon suivante : le texte de l’annonce.' },
        ],
        key: [
          'La carte CTA : 2 à 3 secondes à la fin, avec le produit, l’offre, l’action et la réassurance.',
          'Dans Canva : 1080 × 1920, fond uni, gros titre, contraste fort, un bouton d’une couleur qui tranche.',
          'Dans CapCut : la carte à la fin, et le CTA dit en voix off. Uniquement des offres et des conditions vraies.',
        ],
        quiz: [
          { q: 'Combien de temps la carte CTA reste-t-elle à l’écran ?', a: ['Une demi-seconde', '2 à 3 secondes', '15 secondes'], ok: 1, why: 'Assez pour la lire, assez court pour garder le rythme.' },
          { q: 'Quel format pour la carte CTA d’une vidéo verticale ?', a: ['1080 × 1920 (9:16)', '1920 × 1080', 'N’importe lequel'], ok: 0, why: 'Le même format que la vidéo, sinon la carte est rognée ou entourée de bandes.' },
        ],
      },
      {
        id: 'm7-l7',
        n: 7,
        title: 'Le texte de l’annonce',
        ar: 'نص الإعلان',
        scenes: [
          { type: 'title', sub: 'Ce qu’on lit autour de ta vidéo', say: 'Ta vidéo ne vient pas seule : autour, il y a le texte de l’annonce. Bien écrit, il pousse au clic.' },
          {
            type: 'cards',
            title: 'Les *3 champs* d’une annonce Meta',
            items: [
              { icon: 'message', label: 'Texte principal', sub: 'Au-dessus de la vidéo', c: 'hook' },
              { icon: 'pen', label: 'Titre', sub: 'Sous la vidéo, près du bouton', c: 'body' },
              { icon: 'doc', label: 'Description', sub: 'Sous le titre, pas toujours affichée', c: 'cta' },
            ],
            say: 'Sur Meta, trois champs. Le texte principal, au-dessus de la vidéo. Le titre, sous la vidéo, près du bouton. La description, qui n’est pas affichée partout. Sur TikTok, c’est une seule ligne courte.',
          },
          {
            type: 'steps',
            title: 'Le *texte principal*, ligne par ligne',
            items: [
              { k: '1', label: 'La ligne hook', sub: 'Visible avant « Voir plus »', c: 'hook' },
              { k: '2', label: 'Les bénéfices', sub: '2 ou 3, courts', c: 'body' },
              { k: '3', label: 'La preuve', sub: 'Démonstration, garantie réelle, vrais avis', c: 'body' },
              { k: '4', label: 'L’appel à l’action', sub: '+ paiement à la livraison, si c’est vrai', c: 'cta' },
            ],
            say: 'Le texte principal se construit comme ta vidéo. Une première ligne qui accroche, souvent la seule visible avant « Voir plus ». Deux ou trois bénéfices. Une preuve vraie. Puis l’appel à l’action.',
          },
          {
            type: 'checklist',
            title: 'Les règles',
            items: ['*Court* : chaque mot doit servir', 'Des emojis *avec modération*', 'La langue de ta cible : darija, français ou arabe', { t: '« Résultat garanti en 3 jours »', bad: true }],
            say: 'Les règles : court, chaque mot doit servir. Un ou deux emojis pour aérer, pas dix. La langue de ta cible : darija, français ou arabe. Et aucune promesse que tu ne peux pas prouver.',
          },
          {
            type: 'big',
            kicker: 'Avant de publier',
            text: 'Écris *3 versions*. Les résultats choisissent.',
            sub: 'Un angle problème, un angle bénéfice, un angle offre',
            say: 'Enfin, écris trois versions avec trois angles : le problème, le bénéfice, l’offre. Tu les testes, et ce sont les résultats qui choisissent, pas toi.',
          },
          { type: 'outro', say: 'Leçon suivante : décliner une gagnante en cinq variantes.' },
        ],
        key: [
          'Sur Meta : texte principal, titre, description (pas toujours affichée). Sur TikTok : une ligne courte.',
          'Texte principal : une ligne hook, 2 ou 3 bénéfices, une preuve vraie, l’appel à l’action.',
          'Court, peu d’emojis, dans la langue de la cible, 3 versions à tester, aucune promesse impossible à prouver.',
        ],
        quiz: [
          { q: 'Pourquoi soigner la première ligne du texte principal ?', a: ['C’est souvent la seule lue avant « Voir plus »', 'Elle n’est jamais affichée', 'Elle sert seulement au référencement'], ok: 0, why: 'Le reste est replié : la première ligne doit donner envie de lire ou de regarder.' },
          { q: 'Quelle phrase n’a pas sa place dans ton annonce ?', a: ['« Paiement à la livraison », si c’est vrai', '« Résultat garanti en 3 jours »', '« Livré dans une boîte cadeau », si c’est vrai'], ok: 1, why: 'Une promesse impossible à prouver trompe le client, et peut faire refuser la pub.' },
        ],
        res: [
          {
            title: 'Texte d’annonce (gabarit)',
            text: 'TEXTE PRINCIPAL\n[Ligne hook : la question ou le problème de ton client]\n[Bénéfice 1]\n[Bénéfice 2]\n[Preuve vraie : démonstration, garantie réelle, avis réel]\n[Appel à l’action] + [réassurance : paiement à la livraison, délai… si c’est vrai]\n\nTITRE (court) : [le bénéfice ou l’offre en quelques mots]\nDESCRIPTION (pas toujours affichée) : [un détail rassurant]\n\n3 versions à tester :\nV1, angle problème : [  ]\nV2, angle bénéfice : [  ]\nV3, angle offre : [  ]\n\nLangue : [darija / français / arabe] · 1 ou 2 emojis maximum · aucune promesse qu’on ne peut pas prouver.',
          },
        ],
      },
      {
        id: 'm7-l8',
        n: 8,
        title: 'Décliner une gagnante : 5 variantes',
        ar: 'من إعلان ناجح إلى 5 نسخ',
        scenes: [
          { type: 'title', sub: 'Une seule variable à la fois', say: 'Une pub marche ? On ne la jette pas, on ne la refait pas de zéro : on la décline en cinq variantes.' },
          {
            type: 'steps',
            title: 'Les *5 variantes*',
            items: [
              { k: '1', label: 'Le hook', sub: 'Les 3 premières secondes', c: 'hook' },
              { k: '2', label: 'La 1ʳᵉ image', sub: 'Celle qu’on voit en premier', c: 'gold' },
              { k: '3', label: 'La musique', sub: 'Une autre ambiance', c: 'ia' },
              { k: '4', label: 'Le format', sub: '9:16, 1:1 ou 4:5', c: 'body' },
              { k: '5', label: 'Le CTA', sub: 'Une autre carte ou une autre phrase', c: 'cta' },
            ],
            say: 'Un : un nouveau hook, les trois premières secondes. Deux : une autre première image. Trois : une autre musique. Quatre : un autre format, carré ou 4:5. Cinq : un autre CTA.',
          },
          {
            type: 'quote',
            text: 'Une variante = *une seule* chose qui change.',
            say: 'La règle d’or : une variante, une seule chose qui change. Si tu changes le hook et la musique en même temps, tu ne sauras jamais lequel a fait la différence.',
          },
          {
            type: 'flow',
            title: 'Dans *CapCut*',
            nodes: [
              { icon: 'copy', label: 'Duplique', sub: 'Le projet gagnant', c: 'gold' },
              { icon: 'scissors', label: 'Change', sub: 'Une seule chose', c: 'hook' },
              { icon: 'download', label: 'Exporte', sub: 'Avec un nom clair', c: 'body' },
            ],
            say: 'Dans CapCut : duplique le projet gagnant, change une seule chose, exporte. Pour le format, recadre chaque plan pour garder le produit visible. Puis publie les variantes en même temps, avec le même budget.',
          },
          {
            type: 'big',
            kicker: 'Nomme tes fichiers',
            text: 'parfum-hookB-9x16-v2',
            sub: 'produit · variable testée · format · version',
            say: 'Et nomme tes fichiers clairement : le produit, la variable testée, le format, la version. Quand les résultats arrivent, tu sais tout de suite quelle vidéo a gagné.',
          },
          { type: 'outro', say: 'Leçon suivante : le brief UGC.' },
        ],
        key: [
          'Une gagnante se décline : hook, première image, musique, format (9:16, 1:1, 4:5), CTA.',
          'Une seule variable par variante, sinon impossible de savoir ce qui a marché.',
          'Dupliquer le projet dans CapCut, changer une chose, exporter avec un nom clair : produit-variable-format-version.',
        ],
        quiz: [
          { q: 'Tu changes le hook ET la musique dans la même variante. Le problème ?', a: ['Aucun', 'Tu ne sauras pas lequel a fait la différence', 'La vidéo sera trop longue'], ok: 1, why: 'Une seule variable par variante, sinon le test ne t’apprend rien.' },
          { q: 'Quel nom de fichier est le plus utile ?', a: ['video-finale-OK-2', 'parfum-hookB-9x16-v2', 'IMG_4521'], ok: 1, why: 'Produit, variable testée, format, version : tu sais tout d’un coup d’œil.' },
        ],
        res: [
          {
            title: 'Plan de variantes',
            text: 'Règle de nom : produit-variable-format-version (ex. : parfum-hookB-9x16-v2)\n\nGagnante : [produit]-hookA-9x16-v1\n\nVariante 1, hook : [nouvelles 3 premières secondes] → [produit]-hookB-9x16-v2\nVariante 2, 1ʳᵉ image : [nouvelle image d’ouverture] → [produit]-imageB-9x16-v3\nVariante 3, musique : [nouvelle musique] → [produit]-musiqueB-9x16-v4\nVariante 4, format : [1:1 ou 4:5] → [produit]-hookA-4x5-v5\nVariante 5, CTA : [nouvelle carte ou nouvelle phrase] → [produit]-ctaB-9x16-v6\n\nUne seule chose change par variante. Publie-les en même temps, avec le même budget, puis compare.',
          },
        ],
      },
      {
        id: 'm7-l9',
        n: 9,
        title: 'Le brief UGC : ce que tu envoies au créateur',
        ar: 'موجز الطلب لصانع المحتوى',
        scenes: [
          { type: 'title', sub: 'Un brief clair, une vidéo utilisable', say: 'Tu travailles avec un créateur UGC ? La qualité de sa vidéo dépend beaucoup de ton brief. Voici quoi lui envoyer.' },
          {
            type: 'cards',
            title: 'Le *fond* du brief',
            items: [
              { icon: 'box', label: 'Le produit', sub: 'Ce qu’il fait, comment l’utiliser', c: 'gold' },
              { icon: 'target', label: 'La cible', sub: 'À qui il parle', c: 'hook' },
              { icon: 'message', label: 'Le message clé', sub: 'Une seule idée à retenir', c: 'body' },
              { icon: 'doc', label: 'Le script', sub: 'Ou les points clés à dire', c: 'cta' },
            ],
            say: 'Sur le fond : le produit, ce qu’il fait et comment l’utiliser. La cible. Un seul message clé. Et le script, ou juste les points clés, pour que le créateur garde ses mots et reste naturel.',
          },
          {
            type: 'checklist',
            title: 'Le cadre, *par écrit*',
            items: ['Les *plans* à filmer', 'Format 9:16 et *durée* visée', 'La *date* de livraison', 'Les *droits d’utilisation* : où, combien de temps', 'Le nombre de *retouches*'],
            say: 'Sur la forme : les plans à filmer, le format vertical, la durée visée, la date de livraison. Et par écrit : où et combien de temps tu utilises la vidéo, et combien de retouches sont prévues.',
          },
          {
            type: 'compare',
            title: 'Flou *ou* clair',
            left: { title: 'Brief flou', tone: 'bad', items: ['« Fais une vidéo sympa sur mon parfum »', 'Des allers-retours sans fin'] },
            right: { title: 'Brief clair', tone: 'good', items: ['Cible, message, plans, durée, date', 'Une vidéo proche de ce que tu veux'] },
            say: '« Fais une vidéo sympa sur mon parfum » : c’est flou, et ce sont des allers-retours. Avec la cible, le message, les plans, la durée et la date, tu reçois une vidéo proche de ce que tu veux.',
          },
          {
            type: 'steps',
            title: 'À la livraison, *vérifie*',
            items: [
              { k: '1', label: 'Le hook', sub: 'Il accroche dès les 3 premières secondes', c: 'hook' },
              { k: '2', label: 'Le produit', sub: 'Bien visible, bien nommé', c: 'body' },
              { k: '3', label: 'L’image et le son', sub: 'Vertical, net, voix claire', c: 'gold' },
              { k: '4', label: 'Le discours', sub: 'Rien de faux, rien de promis en trop', c: 'cta' },
            ],
            say: 'À la livraison, vérifie : le hook accroche dès le début. Le produit est visible et bien nommé. L’image est verticale et nette, la voix claire. Et rien de faux n’est dit sur le produit.',
          },
          {
            type: 'outro',
            text: 'De la recherche à la pub publiée : *à toi de jouer*.',
            say: 'Tu as toutes les étapes, de la recherche à la pub publiée. Module suivant : les effets et le montage avancé.',
          },
        ],
        key: [
          'Le fond : le produit, la cible, un seul message clé, un script ou des points clés.',
          'Le cadre, par écrit : plans à filmer, format et durée, date de livraison, droits d’utilisation, nombre de retouches.',
          'À la livraison : un hook qui accroche, un produit visible, une image et un son propres, rien de faux dit sur le produit.',
        ],
        quiz: [
          { q: 'Pourquoi donner des points clés plutôt qu’un texte à réciter mot à mot ?', a: ['Pour que le créateur reste naturel', 'Pour que la vidéo soit plus longue', 'Parce que le script est interdit'], ok: 0, why: 'L’UGC fonctionne parce qu’il sonne vrai ; un texte récité, ça se sent.' },
          { q: 'Que fixes-tu par écrit avant le tournage ?', a: ['La couleur du t-shirt du créateur', 'Les droits d’utilisation et le nombre de retouches', 'Rien, on verra après'], ok: 1, why: 'Où et combien de temps tu utilises la vidéo, et combien de retouches : ça évite les conflits.' },
        ],
        res: [
          {
            title: 'Brief UGC (gabarit)',
            text: 'BRIEF UGC : [nom du produit]\n\nProduit : [ce qu’il fait, prix, comment l’utiliser] · envoyé le [date]\nCible : [qui, âge, ville, problème ou envie]\nMessage clé : [une seule idée à retenir]\nScript ou points clés : [hook proposé] / [3 points à dire avec tes mots] / [CTA]\nÀ ne pas dire : [promesses interdites, marques concurrentes, prix s’il peut changer]\n\nPlans à filmer : produit en main · détails · utilisation · résultat · face caméra · plans de coupe\nFormat : vertical 9:16 · durée visée [  ] s · lumière du jour · voix claire\nÀ livrer : la vidéo montée + les rushes bruts, sans musique ajoutée\nDate de livraison : [date] · par [WhatsApp / lien de téléchargement]\n\nDroits d’utilisation : plateformes [Facebook, Instagram, TikTok] · durée [  ] mois · en publicité payante : [oui / non]\nRetouches incluses : [nombre]\nRémunération : [montant, modalités de paiement]\n\nÀ la livraison, je vérifie : hook dans les 3 premières secondes · produit visible et bien nommé · vertical, net, voix claire · rien de faux dit sur le produit.',
          },
        ],
      },
    ],
  },
  {
    id: 'm8',
    n: 8,
    part: 'p1',
    level: 'avance',
    title: 'Effets et montage avancé dans CapCut',
    ar: 'المؤثرات والمونتاج المتقدم في CapCut',
    color: '#7fb4e8',
    icon: 'wand',
    pitch: 'Transitions, zooms, keyframes, speed ramp, textes animés et sound design : des effets au service du message, jamais du gadget.',
    lessons: [
      {
        id: 'm8-l1',
        n: 1,
        title: 'Des transitions qui servent le rythme',
        ar: 'انتقالات تخدم الإيقاع',
        scenes: [
          { type: 'title', sub: 'Coupe franche · match cut · zoom transition', say: 'Les transitions, c’est là que beaucoup de pubs deviennent kitsch. Voici celles qui servent vraiment le rythme, et celles à oublier.' },
          {
            type: 'cards',
            title: 'Trois transitions *qui servent*',
            items: [
              { icon: 'scissors', label: 'La coupe franche', sub: 'Par défaut : rapide, invisible', c: 'gold' },
              { icon: 'repeat', label: 'Le match cut', sub: 'Le même geste ou la même forme, d’un plan à l’autre', c: 'hook' },
              { icon: 'zoom', label: 'La zoom transition', sub: 'Un zoom rapide qui enchaîne deux plans', c: 'body' },
            ],
            say: 'La transition par défaut, c’est la coupe franche : un plan, puis le suivant, sans effet. Le match cut enchaîne le même geste d’un plan à l’autre : une main pose un flacon, puis pose une montre. La zoom transition donne de l’énergie.',
          },
          {
            type: 'steps',
            title: 'Réussir un *match cut*',
            items: [
              { k: '1', label: 'Choisis le geste commun', sub: 'Poser, tourner, ouvrir', c: 'gold' },
              { k: '2', label: 'Même place dans le cadre', sub: 'Filme les deux plans au même endroit', c: 'hook' },
              { k: '3', label: 'Coupe pendant le mouvement', sub: 'Pas avant, pas après', c: 'body' },
              { k: '4', label: 'Vérifie image par image', sub: 'Le raccord ne doit pas se voir', c: 'cta' },
            ],
            say: 'Pour un match cut : choisis un geste commun, poser, tourner, ouvrir. Filme les deux plans avec l’objet au même endroit du cadre. Coupe en plein mouvement, et vérifie image par image.',
          },
          {
            type: 'compare',
            title: 'Gadget *ou* utile ?',
            left: { title: 'Transition gadget', tone: 'bad', items: ['Cube 3D, page qui tourne, paillettes', 'On regarde l’effet, pas le produit'] },
            right: { title: 'Transition utile', tone: 'good', items: ['Une coupe sur le geste, un zoom sur le mot fort', 'Elle fait avancer l’histoire'] },
            say: 'Oublie le cube 3D, la page qui tourne et les paillettes : on regarde l’effet, pas ton produit. Une bonne transition fait avancer l’histoire : une coupe sur le geste, un zoom sur le mot fort.',
          },
          {
            type: 'checklist',
            title: 'Dans *CapCut* (selon ta version)',
            items: ['Touche le *petit carré* entre deux plans', 'Choisis une transition *courte*', 'Le *même* style dans toute la vidéo', { t: 'Un effet différent à chaque coupe', bad: true }],
            say: 'Dans CapCut, selon ta version, touche le petit carré entre deux plans pour ouvrir les transitions. Choisis-en une courte, et garde le même style du début à la fin. Un effet différent à chaque coupe, ça fait amateur.',
          },
          { type: 'outro', say: 'Leçon suivante : zooms, keyframes et mouvement.' },
        ],
        key: [
          'La transition par défaut d’une pub est la coupe franche : rapide, invisible, l’attention reste sur le produit.',
          'Le match cut enchaîne le même geste ou la même forme d’un plan à l’autre : même place dans le cadre, coupe en plein mouvement, vérification image par image. La zoom transition apporte de l’énergie, avec modération.',
          'Pas de transition gadget (cube 3D, page qui tourne, paillettes) ; dans CapCut, le petit carré entre deux plans ouvre les transitions (selon ta version) : une transition courte, un seul style pour toute la vidéo.',
        ],
        quiz: [
          { q: 'Quelle transition utiliser par défaut dans une pub ?', a: ['Le cube 3D', 'La coupe franche', 'Une transition différente à chaque plan'], ok: 1, why: 'Rapide et invisible, elle garde l’attention sur le produit.' },
          { q: 'Un match cut, c’est…', a: ['Un fondu au noir', 'Le même geste ou la même forme d’un plan à l’autre', 'Une transition avec des paillettes'], ok: 1, why: 'Le geste continue d’un plan à l’autre : l’œil suit sans voir la coupe.' },
        ],
        todo: [
          'Ouvre ta dernière pub dans CapCut et supprime toutes les transitions gadgets',
          'Remplace-les par des coupes franches, puis regarde la vidéo en entier',
          'Filme deux plans avec le même geste (poser, tourner, ouvrir), l’objet au même endroit du cadre',
          'Monte ce match cut en coupant pendant le mouvement, et vérifie-le image par image',
          'Exporte la nouvelle version avec un nom clair : produit-transitions-v2',
        ],
      },
      {
        id: 'm8-l2',
        n: 2,
        title: 'Zooms, keyframes et mouvement',
        ar: 'الزوم والإطارات المفتاحية والحركة',
        scenes: [
          { type: 'title', sub: 'Faire bouger l’image au bon moment', say: 'Un zoom bien placé réveille un plan fixe. Un zoom au hasard donne le mal de mer. On apprend à zoomer avec une intention.' },
          {
            type: 'cards',
            title: 'Trois mouvements *au montage*',
            items: [
              { icon: 'zoom', label: 'Le punch-in', sub: 'Un zoom sec sur le mot clé', c: 'hook' },
              { icon: 'image', label: 'L’effet Ken Burns', sub: 'Un zoom lent sur une photo', c: 'gold' },
              { icon: 'move', label: 'Les keyframes', sub: 'Un départ, une arrivée : CapCut fait le trajet', c: 'body' },
            ],
            say: 'Le punch-in : un zoom sec sur le mot clé de la phrase. L’effet Ken Burns : un zoom lent qui donne vie à une photo. Et les keyframes, ou images clés : tu fixes un départ et une arrivée.',
          },
          {
            type: 'steps',
            title: 'Le *punch-in* en 3 gestes',
            items: [
              { k: '1', label: 'Coupe juste avant le mot fort', sub: 'Avec Diviser', c: 'gold' },
              { k: '2', label: 'Agrandis la 2ᵉ partie', sub: 'Environ 110 à 120 %', c: 'hook' },
              { k: '3', label: 'Recadre', sub: 'Les yeux ou le produit restent bien placés', c: 'body' },
            ],
            say: 'Le punch-in : divise le plan juste avant le mot fort, le prix ou le bénéfice. Agrandis la deuxième partie, autour de 110 à 120 %, et recadre. Si tu as filmé en 4K, le zoom reste net.',
          },
          {
            type: 'flow',
            title: 'Une *keyframe*, c’est…',
            nodes: [
              { icon: 'frame', label: 'Point A', sub: 'Keyframe 1 : taille 100 %', c: 'gold' },
              { icon: 'move', label: 'Le trajet', sub: 'CapCut le calcule', c: 'hook' },
              { icon: 'zoom', label: 'Point B', sub: 'Keyframe 2 : taille 110 %', c: 'body' },
            ],
            say: 'Place la tête de lecture au début et touche le bouton en losange, selon ta version. Avance, change la taille ou la position : une deuxième keyframe se crée. Entre les deux, CapCut fait le mouvement.',
          },
          {
            type: 'checklist',
            title: 'Ken Burns sur une *photo produit*',
            items: ['Une photo *nette*, en grande taille', 'De 100 à 110 % environ, *lentement*', 'Le *même sens* sur toute la série', { t: 'Zoom rapide et rotation ensemble', bad: true }],
            say: 'Sur une photo produit : une image nette, zoomée lentement, d’environ 100 à 110 %. Garde le même sens sur toute la série. Et évite le zoom rapide mélangé à une rotation.',
          },
          { type: 'quote', text: 'Chaque mouvement doit *montrer quelque chose*.', say: 'Retiens : chaque mouvement montre quelque chose, un mot, un détail, le produit. Sinon, ne bouge pas.' },
          { type: 'outro', say: 'Leçon suivante : le speed ramp et le rythme sur la musique.' },
        ],
        key: [
          'Trois mouvements au montage : le punch-in (zoom sec sur le mot clé), l’effet Ken Burns (zoom lent sur une photo), les keyframes (un départ, une arrivée, CapCut calcule le trajet).',
          'Punch-in : Diviser juste avant le mot fort, agrandir la 2ᵉ partie à environ 110–120 %, recadrer. Filmer en 4K garde le zoom net.',
          'Keyframes : le bouton en losange (selon ta version), une taille ou une position différente à chaque point. Ken Burns lent, de 100 à 110 % environ, même sens sur toute la série ; chaque mouvement doit montrer quelque chose.',
        ],
        quiz: [
          { q: 'Où places-tu un punch-in ?', a: ['Au hasard, toutes les secondes', 'Sur le mot clé de la phrase', 'Uniquement sur le logo'], ok: 1, why: 'Le zoom souligne ce qui compte : le prix, le bénéfice, le détail.' },
          { q: 'Pour l’effet Ken Burns sur une photo, tu zoomes…', a: ['Lentement, d’environ 100 à 110 %', 'Très vite, avec une rotation', 'De 100 à 300 %'], ok: 0, why: 'Un mouvement lent donne vie à la photo sans gêner la lecture.' },
        ],
        todo: [
          'Repère dans ton script les 2 ou 3 mots forts : prix, bénéfice, détail',
          'Ajoute un punch-in sur chacun : Diviser, puis agrandir à 110–120 %',
          'Anime une photo produit avec deux keyframes, de 100 à 110 %',
          'Regarde le résultat sur ton téléphone et supprime chaque zoom qui ne montre rien de plus',
          'Exporte et compare avec la version sans zoom',
        ],
      },
      {
        id: 'm8-l3',
        n: 3,
        title: 'Le speed ramp et le rythme sur la musique',
        ar: 'تغيير السرعة والمونتاج على إيقاع الموسيقى',
        scenes: [
          { type: 'title', sub: 'Accélérer, ralentir, couper sur le temps', say: 'Le rythme d’une pub vient des coupes, mais aussi de la vitesse et de la musique. Voici deux techniques de monteur.' },
          {
            type: 'big',
            kicker: 'Le speed ramp',
            text: '*Vite* sur le trajet, *lent* sur le moment clé.',
            sub: 'La main qui approche, puis le spray au ralenti',
            say: 'Le speed ramp : la vitesse change dans un même plan. On accélère le trajet, la main qui approche, et on ralentit le moment clé : le spray du parfum, le fermoir de la montre.',
          },
          {
            type: 'steps',
            title: 'Dans *CapCut* (selon ta version)',
            items: [
              { k: '1', label: 'Sélectionne le plan', sub: 'Puis Vitesse', c: 'gold' },
              { k: '2', label: 'Choisis Courbe', sub: 'Un préréglage, ou tes propres points', c: 'hook' },
              { k: '3', label: 'Ralentis le moment clé', sub: 'Le reste plus vite', c: 'body' },
              { k: '4', label: 'Filme ce plan en 60 i/s', sub: 'Pour un ralenti fluide', c: 'cta' },
            ],
            say: 'Selon ta version : sélectionne le plan, ouvre Vitesse, puis Courbe. Pars d’un préréglage ou place tes points. Ralentis seulement le moment clé. Pour un ralenti fluide, filme ce plan en soixante images par seconde.',
          },
          {
            type: 'flow',
            title: 'Monter *sur la musique*',
            nodes: [
              { icon: 'music', label: 'Les repères', sub: 'Les temps de la musique', c: 'gold' },
              { icon: 'scissors', label: 'Les coupes', sub: 'Sur un repère, pas entre deux', c: 'hook' },
              { icon: 'bolt', label: 'Le moment fort', sub: 'Le geste clé sur le temps le plus fort', c: 'body' },
            ],
            say: 'Pour monter sur la musique, marque ses temps : CapCut propose des repères de rythme, selon ta version. Coupe sur un repère, et place le geste clé sur le temps le plus fort.',
          },
          {
            type: 'compare',
            title: 'Couper sur *chaque* temps ?',
            left: { title: 'Une coupe par temps', tone: 'bad', items: ['Épuisant à regarder', 'Le produit n’a pas le temps d’exister'] },
            right: { title: 'Des coupes choisies', tone: 'good', items: ['Sur certains temps, selon la voix', 'Le moment clé sur le temps fort'] },
            say: 'Couper sur chaque temps, c’est épuisant, et le produit n’a pas le temps d’exister. Choisis tes temps selon la voix et le message : la musique sert le rythme, elle ne commande pas.',
          },
          {
            type: 'checklist',
            title: 'La *musique* d’une pub',
            items: ['*Autorisée* pour un usage publicitaire', 'Le tempo *selon le produit* : énergique ou posé', 'Toujours *sous* la voix', { t: 'Le son à la mode, sans vérifier les droits', bad: true }],
            say: 'Et choisis une musique autorisée pour la publicité, par exemple dans les bibliothèques commerciales proposées selon ton compte. Un son tendance n’est pas forcément utilisable dans une pub payante.',
          },
          { type: 'outro', say: 'Leçon suivante : textes animés et sous-titres stylés.' },
        ],
        key: [
          'Le speed ramp change la vitesse dans un même plan : vite sur le trajet, lent sur le moment clé. Dans CapCut : Vitesse, puis Courbe (selon ta version) ; filme le plan en 60 i/s pour un ralenti fluide.',
          'Monter sur la musique : marquer les temps (repères de rythme automatiques ou manuels, selon ta version), couper sur un repère, placer le geste clé sur le temps le plus fort, sans couper sur chaque temps.',
          'La musique sert le rythme et reste sous la voix ; pour une pub payante, une musique autorisée pour un usage commercial, pas un son tendance dont tu n’as pas vérifié les droits.',
        ],
        quiz: [
          { q: 'Dans un speed ramp, que ralentit-on ?', a: ['Tout le plan', 'Seulement le moment clé', 'Le trajet où il ne se passe rien'], ok: 1, why: 'On accélère ce qui n’apporte rien, on ralentit ce qui compte.' },
          { q: 'Pour un ralenti fluide, tu filmes ce plan en…', a: ['60 images par seconde', 'Mode photo', 'La cadence la plus basse possible'], ok: 0, why: 'Plus d’images par seconde au tournage, c’est un ralenti sans saccades au montage.' },
        ],
        todo: [
          'Filme un geste clé de ton produit en 60 i/s : spray, fermoir, ouverture',
          'Applique une courbe de vitesse : rapide sur le trajet, lent sur le moment clé',
          'Choisis une musique autorisée pour la publicité et marque ses temps forts',
          'Recale tes coupes sur les repères, et le geste clé sur le temps le plus fort',
          'Exporte et regarde : si c’est épuisant, retire des coupes',
        ],
      },
      {
        id: 'm8-l4',
        n: 4,
        title: 'Textes animés et sous-titres stylés',
        ar: 'نصوص متحركة وترجمة بأسلوب مميز',
        scenes: [
          { type: 'title', sub: 'Lisible d’abord, animé ensuite', say: 'Tu sais déjà faire des sous-titres propres. Maintenant, on leur donne du style, sans jamais sacrifier la lecture.' },
          {
            type: 'cards',
            title: 'Le *style* qui retient',
            items: [
              { icon: 'captions', label: 'Mot par mot', sub: '1 à 3 mots à la fois, calés sur la voix', c: 'hook' },
              { icon: 'palette', label: 'Le mot clé en couleur', sub: 'Le prix, le bénéfice, le détail', c: 'gold' },
              { icon: 'spark', label: 'Une entrée courte', sub: 'Un pop ou un fondu, puis le texte reste immobile', c: 'body' },
            ],
            say: 'Trois techniques. Les sous-titres mot par mot : un à trois mots à la fois, calés sur la voix. Le mot clé en couleur : le prix, le bénéfice. Et une entrée courte, un pop ou un fondu, puis le texte reste immobile.',
          },
          {
            type: 'steps',
            title: 'Le mot par mot dans *CapCut*',
            items: [
              { k: '1', label: 'Sous-titres automatiques', sub: 'Puis relis chaque mot', c: 'gold' },
              { k: '2', label: 'Un modèle qui surligne', sub: 'Le mot prononcé change de couleur, selon ta version', c: 'hook' },
              { k: '3', label: 'Sinon, coupe à la main', sub: 'Des blocs de 1 à 3 mots', c: 'body' },
              { k: '4', label: 'Une couleur d’accent', sub: 'La même dans toute la vidéo', c: 'cta' },
            ],
            say: 'Lance les sous-titres automatiques et relis chaque mot. Selon ta version, certains modèles surlignent le mot prononcé. Sinon, coupe tes sous-titres en blocs d’un à trois mots. Et garde une seule couleur d’accent.',
          },
          {
            type: 'compare',
            title: 'Animé *et* lisible',
            left: { title: 'Illisible', tone: 'bad', items: ['Lettres qui tournent, néon qui clignote', 'Le texte part avant qu’on l’ait lu'] },
            right: { title: 'Lisible', tone: 'good', items: ['Une entrée rapide, puis le texte reste immobile', 'Gros, avec contour ou fond sombre'] },
            say: 'Le piège : des lettres qui tournent, un néon qui clignote, un texte qui part avant qu’on l’ait lu. L’animation dure une fraction de seconde, puis le texte reste immobile, gros et contrasté.',
          },
          {
            type: 'checklist',
            title: 'Deux niveaux de *texte*',
            items: ['Le *titre du hook* : au-dessus du visage, 3 secondes', 'Les *sous-titres* : au milieu, calés sur la voix', 'Tout dans la *zone sûre*', { t: 'Du texte sous les boutons de l’appli', bad: true }],
            say: 'Organise deux niveaux : le titre du hook, au-dessus du visage pendant les trois premières secondes, et les sous-titres au milieu, calés sur la voix. Le tout dans la zone sûre.',
          },
          { type: 'outro', say: 'Leçon suivante : sound design et finitions.' },
        ],
        key: [
          'Trois techniques : sous-titres mot par mot (1 à 3 mots à la fois, calés sur la voix), un mot clé en couleur par phrase, une animation d’entrée courte puis un texte immobile.',
          'Dans CapCut : sous-titres automatiques relus mot à mot, puis un modèle qui surligne le mot prononcé (selon ta version) ou un découpage à la main en blocs de 1 à 3 mots ; une seule couleur d’accent.',
          'Deux niveaux de texte : le titre du hook au-dessus du visage pendant 3 secondes, les sous-titres au milieu ; tout dans la zone sûre, jamais sous les boutons de l’appli.',
        ],
        quiz: [
          { q: 'Combien de mots à la fois dans des sous-titres mot par mot ?', a: ['1 à 3', '8 à 10', 'Toute la phrase'], ok: 0, why: 'Quelques mots à la fois, calés sur la voix : l’œil suit sans effort.' },
          { q: 'Que fait le texte après son animation d’entrée ?', a: ['Il tourne en boucle', 'Il reste immobile pendant la lecture', 'Il clignote'], ok: 1, why: 'Un texte qui bouge pendant qu’on le lit est un texte qu’on ne lit pas.' },
        ],
        todo: [
          'Génère les sous-titres automatiques de ta pub et corrige chaque mot',
          'Découpe-les en blocs de 1 à 3 mots, ou applique un modèle qui surligne le mot prononcé',
          'Choisis une couleur d’accent et mets-la sur 1 mot clé par phrase',
          'Ajoute le titre du hook pour les 3 premières secondes, au-dessus du visage',
          'Vérifie sur ton téléphone que rien n’est caché par les boutons de l’appli',
        ],
        res: [
          {
            title: 'Ma charte texte (pour toutes mes pubs)',
            text: 'Police : [une seule, épaisse et lisible]\nCouleur du texte : [blanc / noir] · Contour ou fond : [noir / blanc]\nCouleur d’accent : [une seule, celle de la marque] → 1 mot clé par phrase\n\nTitre du hook : 7 mots maximum · au-dessus du visage · les 3 premières secondes\nSous-titres : 1 à 3 mots à la fois · au milieu de l’écran · calés sur la voix\nAnimation d’entrée : [pop / fondu] · courte · puis texte immobile\n\nZone sûre : rien tout en bas, rien à droite, rien collé aux bords.\nTest : regardé sur téléphone, avec et sans le son.',
          },
        ],
      },
      {
        id: 'm8-l5',
        n: 5,
        title: 'Sound design et finitions',
        ar: 'تصميم الصوت واللمسات الأخيرة',
        scenes: [
          { type: 'title', sub: 'Effets sonores · niveaux · couleur · export', say: 'Un son soigné rend une pub tout de suite plus pro. Dernière étape du montage : le sound design, puis les finitions.' },
          {
            type: 'cards',
            title: 'Trois effets *qui suffisent*',
            items: [
              { icon: 'wave', label: 'Le whoosh', sub: 'Sur une transition ou un zoom', c: 'hook' },
              { icon: 'spark', label: 'Le pop', sub: 'Quand un texte ou un prix apparaît', c: 'gold' },
              { icon: 'check', label: 'Le clic', sub: 'Bouchon, fermoir, bouton : le vrai son, si possible', c: 'body' },
            ],
            say: 'Le whoosh, sur une transition ou un zoom. Le pop, quand un texte apparaît. Le clic du bouchon ou du fermoir : enregistre-le en vrai au tournage. Les autres sont dans les effets sonores de CapCut.',
          },
          {
            type: 'stat',
            value: '−20',
            suffix: 'dB',
            label: 'la musique, *sous* la voix',
            sub: 'Un repère : ton oreille valide',
            say: 'La voix devant, claire, avec la réduction de bruit. La musique dessous : baisse-la d’environ vingt décibels, ou à l’oreille si ton appli affiche un pourcentage. Si on tend l’oreille, c’est trop fort.',
          },
          {
            type: 'steps',
            title: 'Le *ducking*',
            items: [
              { k: '1', label: 'Repère les phrases', sub: 'Sur la piste de la voix', c: 'gold' },
              { k: '2', label: 'Keyframes de volume', sub: 'Sur la musique, autour de chaque phrase', c: 'hook' },
              { k: '3', label: 'Plus bas pendant la voix', sub: 'La musique remonte dans les silences', c: 'body' },
            ],
            say: 'Le ducking : la musique baisse quand la voix parle, et remonte dans les silences. Certaines versions le font automatiquement. Sinon, place des keyframes de volume sur la musique, autour de chaque phrase.',
          },
          {
            type: 'compare',
            title: 'La *couleur* : léger, toujours',
            left: { title: 'Filtre à fond', tone: 'bad', items: ['Le produit change de couleur', 'Le client reçoit autre chose que ce qu’il a vu'] },
            right: { title: 'Retouche légère', tone: 'good', items: ['Luminosité, contraste, un peu de chaleur', 'Les vraies couleurs du produit'] },
            say: 'Pour l’image : un filtre à faible intensité, ou de légers ajustements, luminosité, contraste, chaleur. Jamais au point de changer la couleur du produit : le client doit recevoir ce qu’il a vu.',
          },
          {
            type: 'checklist',
            title: 'Avant d’*exporter*',
            items: ['1080 × 1920 · 30 i/s · MP4', 'Écouté au casque *et* sur le haut-parleur', 'Regardé une fois *sans le son*', 'Nommé : produit-hook-version'],
            say: 'Avant d’exporter : 1080 par 1920, trente images par seconde, MP4. Écoute au casque et sur le haut-parleur du téléphone, regarde une fois sans le son, et nomme bien ton fichier.',
          },
          { type: 'outro', say: 'Leçon suivante : la lumière, naturelle, réflecteur et trois points.' },
        ],
        key: [
          'Trois effets sonores suffisent : whoosh (transition, zoom), pop (texte qui apparaît), clic (bouchon, fermoir), enregistré en vrai si possible. Un effet utile, pas un effet sur chaque plan.',
          'La voix devant, nettoyée ; la musique dessous (repère : environ −20 dB, ou à l’oreille) ; le ducking fait baisser la musique pendant la voix, automatiquement selon ta version ou avec des keyframes de volume.',
          'Couleur : filtre faible ou légers ajustements, sans changer la couleur du produit. Export en 1080 × 1920, 30 i/s, MP4, écouté au casque et sur haut-parleur, regardé sans le son, bien nommé.',
        ],
        quiz: [
          { q: 'Le ducking, c’est…', a: ['La musique qui baisse quand la voix parle', 'Un filtre de couleur', 'Une transition'], ok: 0, why: 'La voix porte le message : la musique s’efface quand elle parle.' },
          { q: 'Jusqu’où retoucher la couleur de ta vidéo ?', a: ['Jusqu’à changer la couleur du produit si c’est plus joli', 'Légèrement : le produit garde ses vraies couleurs', 'Le filtre le plus fort possible'], ok: 1, why: 'Le client doit recevoir exactement le produit qu’il a vu dans la pub.' },
        ],
        todo: [
          'Ajoute 3 effets sonores à ta pub : un whoosh, un pop, un clic',
          'Baisse la musique sous la voix, et fais-la baisser encore pendant chaque phrase',
          'Applique un filtre faible ou de légers ajustements, puis compare avec le vrai produit',
          'Exporte en 1080 × 1920, 30 i/s, MP4',
          'Écoute au casque, puis sur le haut-parleur, puis regarde sans le son',
        ],
        res: [
          {
            title: 'Check-list son, couleur et export',
            text: 'SON\n• Voix : devant, claire, réduction de bruit activée\n• Musique : sous la voix (repère : environ −20 dB, ou à l’oreille) · autorisée pour la publicité\n• Ducking : la musique baisse pendant chaque phrase (automatique selon ta version, ou keyframes de volume)\n• Effets : whoosh sur les transitions et zooms, pop sur les textes, clic réel (bouchon, fermoir) · pas sur chaque plan\n\nCOULEUR\n• Filtre à faible intensité, ou ajustements légers : luminosité, contraste, chaleur\n• Comparé avec le vrai produit : mêmes couleurs\n\nEXPORT\n• 1080 × 1920 · 30 i/s · MP4\n• Écouté au casque et sur le haut-parleur du téléphone\n• Regardé une fois sans le son\n• Nom du fichier : produit-hook-format-version',
          },
        ],
      },
    ],
  },
  {
    id: 'm9',
    n: 9,
    part: 'p1',
    level: 'avance',
    title: 'Tournage avancé : lumière, cadrage, mouvement',
    ar: 'التصوير المتقدم: الإضاءة والتأطير والحركة',
    color: '#f0c674',
    icon: 'camera',
    pitch: 'Éclairer, cadrer, bouger, régler ton téléphone et mettre en scène ton produit : des images qui inspirent confiance, avec presque rien comme matériel.',
    lessons: [
      {
        id: 'm9-l1',
        n: 1,
        title: 'La lumière : naturelle, réflecteur et 3 points',
        ar: 'الإضاءة: طبيعية، عاكس وثلاث نقاط',
        scenes: [
          { type: 'title', sub: 'Avant la caméra, il y a la lumière', say: 'Un téléphone récent filme très bien… si la lumière est bonne. Voici comment éclairer ton visage et ton produit, presque sans matériel.' },
          {
            type: 'cards',
            title: 'La lumière *naturelle*',
            items: [
              { icon: 'sun', label: 'La fenêtre', sub: 'Face à toi, ou de côté', c: 'gold' },
              { icon: 'clock', label: 'Le bon moment', sub: 'En journée, sans soleil direct', c: 'hook' },
              { icon: 'frame', label: 'Le carton blanc', sub: 'Un réflecteur qui éclaire les ombres', c: 'body' },
            ],
            say: 'La meilleure lumière est gratuite : une fenêtre, face à toi ou de côté. Filme en journée, sans soleil direct, qui fait des ombres dures. Et de l’autre côté, un carton blanc renvoie la lumière dans les ombres.',
          },
          {
            type: 'compare',
            title: 'À *éviter*',
            left: { title: 'Le piège', tone: 'bad', items: ['Dos à la fenêtre : contre-jour', 'Le néon du plafond : ombres sous les yeux'] },
            right: { title: 'La solution', tone: 'good', items: ['Face à la fenêtre', 'Une seule couleur de lumière'] },
            say: 'Dos à la fenêtre, tu deviens une silhouette sombre. Le néon du plafond creuse des ombres sous les yeux. Et ne mélange pas lumière du jour et ampoule jaune : une seule couleur de lumière.',
          },
          {
            type: 'steps',
            title: 'L’éclairage *3 points*, simplement',
            items: [
              { k: '1', label: 'La principale', sub: 'La plus forte, à 45° devant toi', c: 'gold' },
              { k: '2', label: 'Le débouchage', sub: 'De l’autre côté, plus douce : ton carton blanc', c: 'hook' },
              { k: '3', label: 'Le contre', sub: 'Derrière, en hauteur : il détache du fond', c: 'body' },
            ],
            say: 'L’éclairage trois points, version simple. La principale, la plus forte, à quarante-cinq degrés devant toi : la fenêtre ou une lampe. Le débouchage, de l’autre côté : ton carton blanc. Et le contre, derrière, qui te détache du fond.',
          },
          {
            type: 'checklist',
            title: 'Une *lampe LED* simple',
            items: ['*Diffusée* : un tissu blanc devant, à bonne distance', 'Placée *un peu au-dessus* des yeux', 'Même *couleur* que la pièce, si elle se règle', { t: 'Un anneau lumineux face à un flacon brillant', bad: true }],
            say: 'Le soir, une simple lampe LED suffit. Diffuse-la avec un tissu blanc, à bonne distance, un peu au-dessus des yeux. Règle sa couleur comme la pièce, si elle se règle. Et attention aux reflets sur les flacons brillants.',
          },
          { type: 'outro', say: 'Leçon suivante : le cadrage, valeurs de plan et règle des tiers.' },
        ],
        key: [
          'Lumière naturelle : une fenêtre face à toi ou de côté, en journée, sans soleil direct ; un carton blanc de l’autre côté renvoie la lumière dans les ombres.',
          'À éviter : le contre-jour (dos à la fenêtre), le néon du plafond (ombres sous les yeux), le mélange lumière du jour et ampoule jaune.',
          'L’éclairage 3 points : la principale (la plus forte, à 45° devant), le débouchage (plus doux, de l’autre côté : le carton blanc), le contre (derrière, en hauteur, il détache du fond). Le soir, une lampe LED diffusée, un peu au-dessus des yeux.',
        ],
        quiz: [
          { q: 'À quoi sert le carton blanc ?', a: ['À renvoyer la lumière dans les ombres', 'À cacher le décor', 'À remplacer la lampe principale'], ok: 0, why: 'C’est un réflecteur : il adoucit les ombres du côté opposé à la lumière principale.' },
          { q: 'Dans l’éclairage 3 points, le contre…', a: ['Est la lumière la plus forte, devant toi', 'Est placé derrière, pour te détacher du fond', 'Est le néon du plafond'], ok: 1, why: 'Placé derrière et en hauteur, il dessine un liseré de lumière et donne de la profondeur.' },
        ],
        todo: [
          'Filme 10 secondes de face caméra dos à la fenêtre, puis face à la fenêtre, et compare',
          'Ajoute un carton blanc du côté de l’ombre et refilme',
          'Éteins le néon du plafond et les ampoules d’une autre couleur, puis refilme',
          'Installe ton éclairage 3 points et prends une photo de ton installation',
          'Garde la meilleure prise comme référence pour tes prochains tournages',
        ],
        res: [
          {
            title: 'Plan d’éclairage (fiche)',
            text: 'Lieu : [pièce] · Fenêtre : [face / côté] · Moment : [heure, en journée, sans soleil direct]\n\n1. Lumière principale : [fenêtre / lampe LED diffusée] · à 45° devant · un peu au-dessus des yeux\n2. Débouchage : [carton blanc / mur blanc / deuxième lampe faible] · de l’autre côté\n3. Contre : [petite lampe] · derrière · en hauteur · sans entrer dans le cadre\n\nÀ couper : néon du plafond · ampoules d’une autre couleur\nÀ vérifier : pas de contre-jour · pas de reflet sur le produit · une seule couleur de lumière\nProduit brillant (flacon, montre) : lumière diffusée, de côté, pour éviter les reflets',
          },
        ],
      },
      {
        id: 'm9-l2',
        n: 2,
        title: 'Le cadrage : valeurs de plan et règle des tiers',
        ar: 'التأطير وأحجام اللقطات',
        scenes: [
          { type: 'title', sub: 'Choisir ce qu’on montre, et où', say: 'Cadrer, c’est décider ce que le client voit, et où son regard tombe. Quatre valeurs de plan et trois règles suffisent.' },
          {
            type: 'cards',
            title: 'Les *valeurs de plan*',
            items: [
              { icon: 'user', label: 'Plan moyen', sub: 'La personne en entier : tenue, silhouette', c: 'gold' },
              { icon: 'smile', label: 'Plan rapproché', sub: 'De la poitrine à la tête : le face caméra', c: 'hook' },
              { icon: 'eye', label: 'Gros plan', sub: 'Le visage : l’émotion, la réaction', c: 'body' },
              { icon: 'search', label: 'Plan de détail', sub: 'Bouchon, texture, couture, cadran', c: 'cta' },
            ],
            say: 'Le plan moyen montre la personne en entier : idéal pour un vêtement. Le plan rapproché, de la poitrine à la tête : le face caméra. Le gros plan, le visage. Et le plan de détail : le bouchon, la texture, le cadran.',
          },
          {
            type: 'big',
            kicker: 'La règle des tiers',
            text: 'Les yeux sur *la ligne du haut*.',
            sub: 'Active la grille : le produit sur un croisement de lignes',
            say: 'La règle des tiers : active la grille de ton appareil photo, deux lignes et deux colonnes. Place les yeux sur la ligne du haut, et le produit sur un croisement de lignes. L’image respire.',
          },
          {
            type: 'compare',
            title: 'L’*espace* autour du sujet',
            left: { title: 'Mal cadré', tone: 'bad', items: ['Le nez collé au bord du cadre', 'Trop de vide au-dessus de la tête'] },
            right: { title: 'Bien cadré', tone: 'good', items: ['De l’espace du côté du regard', 'Les yeux vers le tiers du haut'] },
            say: 'L’espace de regard : si la personne regarde vers la gauche, laisse de l’espace à gauche, sinon elle semble bloquée par le bord. Et pas trop de vide au-dessus de la tête.',
          },
          {
            type: 'checklist',
            title: 'Cadrer pour le *9:16*',
            items: ['Filme *à la verticale* dès le départ', 'Le sujet loin du *bas* et de la *droite*', 'Une *marge* en haut et en bas, pour le 4:5', { t: 'Le produit sous les boutons de l’appli', bad: true }],
            say: 'Pour le 9:16 : filme à la verticale dès le départ. Garde le sujet loin du bas et de la droite, que l’interface recouvre. Et laisse une marge en haut et en bas, pour recadrer en 4:5 sans couper la tête.',
          },
          { type: 'outro', say: 'Leçon suivante : les mouvements de caméra au téléphone.' },
        ],
        key: [
          'Quatre valeurs de plan : plan moyen (la personne en entier), plan rapproché (de la poitrine à la tête, le face caméra), gros plan (le visage), plan de détail (bouchon, texture, cadran). On les alterne pour le rythme.',
          'La règle des tiers : grille activée, les yeux sur la ligne du haut, le produit sur un croisement ; de l’espace du côté du regard, pas trop de vide au-dessus de la tête.',
          'Pour le 9:16 : filmer à la verticale, garder le sujet loin du bas et de la droite (l’interface), laisser une marge en haut et en bas pour décliner en 4:5.',
        ],
        quiz: [
          { q: 'Pour montrer la texture d’une crème, quel plan ?', a: ['Le plan moyen', 'Le plan de détail', 'Un plan large de la pièce'], ok: 1, why: 'Le plan de détail montre la matière de près : c’est ce que le client veut voir.' },
          { q: 'La personne regarde vers la gauche. Où laisses-tu de l’espace ?', a: ['À gauche, du côté de son regard', 'À droite, derrière sa tête', 'Nulle part, elle doit toucher le bord'], ok: 0, why: 'L’espace de regard évite l’impression que la personne est bloquée par le bord du cadre.' },
        ],
        todo: [
          'Active la grille dans les réglages de l’appareil photo de ton téléphone',
          'Filme ton produit dans les 4 valeurs : plan moyen, plan rapproché, gros plan, plan de détail',
          'Refais ton face caméra avec les yeux sur la ligne du haut',
          'Vérifie chaque plan sur ton téléphone : rien d’important en bas ni à droite',
          'Recadre un plan en 4:5 dans CapCut : la tête et le produit doivent rester entiers',
        ],
      },
      {
        id: 'm9-l3',
        n: 3,
        title: 'Les mouvements de caméra au téléphone',
        ar: 'حركات الكاميرا بالهاتف',
        scenes: [
          { type: 'title', sub: 'Push-in · pull-out · travelling · révélation', say: 'Un mouvement de caméra bien choisi donne de l’émotion à ton plan. Tu peux tous les faire avec ton téléphone, à la main.' },
          {
            type: 'cards',
            title: 'Quatre mouvements, *quatre effets*',
            items: [
              { icon: 'zoom', label: 'Push-in', sub: 'Avancer vers le produit : le désir', c: 'hook' },
              { icon: 'crop', label: 'Pull-out', sub: 'Reculer : on découvre le contexte', c: 'gold' },
              { icon: 'move', label: 'Travelling latéral', sub: 'Glisser de côté : la découverte', c: 'body' },
              { icon: 'eye', label: 'Révélation', sub: 'Caché, puis dévoilé : la surprise', c: 'cta' },
            ],
            say: 'Le push-in : tu avances vers le produit, ça crée le désir. Le pull-out : tu recules, on découvre le contexte. Le travelling latéral : tu glisses de côté, le long d’une table. Et la révélation : le produit caché, puis dévoilé.',
          },
          {
            type: 'big',
            kicker: 'Et souvent le plus utile',
            text: 'Le plan *fixe*, sur trépied.',
            sub: 'Face caméra, démonstration, packshot',
            say: 'Mais le mouvement le plus utile, c’est souvent… aucun mouvement. Un plan fixe sur trépied pour le face caméra et la démonstration. On bouge pour une raison, jamais par habitude.',
          },
          {
            type: 'steps',
            title: 'Bouger *proprement*',
            items: [
              { k: '1', label: 'À deux mains', sub: 'Coudes collés au corps', c: 'gold' },
              { k: '2', label: 'Genoux fléchis', sub: 'Des petits pas glissés', c: 'hook' },
              { k: '3', label: 'Lentement', sub: '3 à 5 secondes par mouvement', c: 'body' },
              { k: '4', label: 'Une seconde immobile', sub: 'Au début et à la fin du plan', c: 'cta' },
            ],
            say: 'Pour bouger proprement : le téléphone à deux mains, coudes collés au corps, genoux fléchis, petits pas glissés. Un mouvement lent, trois à cinq secondes. Et une seconde immobile au début et à la fin, pour couper au montage.',
          },
          {
            type: 'checklist',
            title: 'Sans *gimbal*',
            items: ['La *stabilisation* activée, selon ton téléphone', 'L’objectif *principal* (1×), pas le zoom numérique', 'Le téléphone sur un livre, *glissé* sur une table', { t: 'Marcher vite, bras tendus', bad: true }],
            say: 'Un gimbal aide, mais il est facultatif. Active la stabilisation, reste sur l’objectif principal, et pour un travelling propre, pose le téléphone sur un livre que tu fais glisser sur une table.',
          },
          { type: 'outro', say: 'Leçon suivante : les réglages du téléphone.' },
        ],
        key: [
          'Quatre mouvements : push-in (avancer, le désir), pull-out (reculer, le contexte), travelling latéral (glisser, la découverte), révélation (caché puis dévoilé, la surprise). Un seul mouvement par plan.',
          'Le plan fixe sur trépied reste souvent le plus utile (face caméra, démonstration, packshot) : on bouge pour une raison.',
          'Bouger proprement : deux mains, coudes au corps, genoux fléchis, 3 à 5 secondes, une seconde immobile au début et à la fin. Sans gimbal : stabilisation, objectif principal, téléphone posé sur un livre glissé sur une table.',
        ],
        quiz: [
          { q: 'Pour créer le désir autour d’un parfum, quel mouvement ?', a: ['Un push-in lent vers le flacon', 'Un mouvement rapide dans tous les sens', 'Un pull-out vers le plafond'], ok: 0, why: 'Avancer lentement vers le produit concentre le regard et crée l’envie.' },
          { q: 'Pourquoi garder une seconde immobile au début et à la fin du plan ?', a: ['Pour avoir de quoi couper au montage', 'Pour rallonger la vidéo', 'Pour économiser la batterie'], ok: 0, why: 'Ces secondes stables donnent des points de coupe propres.' },
        ],
        todo: [
          'Filme ton produit avec les 4 mouvements : push-in, pull-out, travelling latéral, révélation',
          'Pour chacun : 3 à 5 secondes, avec une seconde immobile au début et à la fin',
          'Fais un travelling sans gimbal, le téléphone posé sur un livre glissé sur une table',
          'Monte les 4 plans à la suite dans CapCut et garde les 2 plus fluides',
          'Note dans ta liste de plans quel mouvement sert quelle émotion',
        ],
        res: [
          {
            title: 'Liste de mouvements à filmer',
            text: 'Produit : [nom] · Objectif principal (1×) · stabilisation activée\n\n1. Push-in : avancer lentement vers [le produit, le détail] → le désir\n2. Pull-out : partir du [détail] et reculer jusqu’à [la scène complète] → le contexte\n3. Travelling latéral : glisser le long de [la table, la rangée de produits] → la découverte\n4. Révélation : [la main, la boîte, un objet] cache le produit, puis le dévoile → la surprise\n5. Plan fixe sur trépied : [face caméra / démonstration / packshot]\n\nPour chaque mouvement : 3 à 5 secondes · une seconde immobile au début et à la fin · 3 prises.\nSans gimbal : deux mains, coudes au corps, genoux fléchis ; travelling avec le téléphone posé sur un livre glissé sur une table.',
          },
        ],
      },
      {
        id: 'm9-l4',
        n: 4,
        title: 'Les réglages du téléphone',
        ar: 'إعدادات الهاتف قبل التصوير',
        scenes: [
          { type: 'title', sub: 'Cinq minutes avant de filmer', say: 'Cinq minutes de réglages avant de filmer t’évitent des heures de galère au montage. Les menus changent selon les téléphones, le principe reste.' },
          {
            type: 'steps',
            title: 'Avant *chaque* tournage',
            items: [
              { k: '1', label: 'Lentille propre', sub: 'Un chiffon doux et sec', c: 'gold' },
              { k: '2', label: 'Mode avion', sub: 'Ni appel ni notification', c: 'hook' },
              { k: '3', label: 'Grille activée', sub: 'Dans les réglages de l’appareil photo', c: 'body' },
              { k: '4', label: 'Stockage et batterie', sub: 'De la place pour tes rushes', c: 'cta' },
            ],
            say: 'La routine : nettoie la lentille, une trace de doigt rend l’image floue. Mode avion, pour qu’aucun appel ne coupe ta prise. La grille activée. Et assez de stockage et de batterie.',
          },
          {
            type: 'cards',
            title: 'Résolution et *cadence*',
            items: [
              { icon: 'frame', label: '1080p', sub: 'Léger, suffisant pour l’export', c: 'gold' },
              { icon: 'crop', label: '4K', sub: 'De la marge pour zoomer et recadrer', c: 'hook' },
              { icon: 'clock', label: '30 ou 60 i/s', sub: '30 au quotidien, 60 pour les ralentis', c: 'body' },
            ],
            say: 'Le 1080p suffit pour une pub, et il est léger. Le 4K laisse de la marge pour zoomer ou recadrer, mais remplit vite le téléphone. Trente images par seconde au quotidien, soixante pour les plans à ralentir.',
          },
          {
            type: 'big',
            kicker: 'Le réglage qui change tout',
            text: 'Verrouille *la mise au point* et *l’exposition*.',
            sub: 'Appui long sur le sujet, puis ajuste la luminosité',
            say: 'En automatique, l’image s’éclaircit ou s’assombrit dès qu’une main passe. Verrouille la mise au point et l’exposition : souvent, un appui long sur le sujet, puis tu ajustes la luminosité. Sinon, cherche le mode Pro.',
          },
          {
            type: 'checklist',
            title: 'Les *petits pièges*',
            items: ['Vidéo *délavée* dans CapCut ? Essaie sans la vidéo HDR', 'L’image *scintille* sous une lampe ? Change de cadence ou de lumière', '*Pas de zoom numérique* : rapproche-toi'],
            say: 'Vidéo délavée dans CapCut ? Essaie sans la vidéo HDR. L’image scintille sous une lampe ? Le courant est en cinquante hertz en Algérie : essaie vingt-cinq ou cinquante images par seconde si ton téléphone le propose, ou la lumière du jour.',
          },
          { type: 'outro', say: 'Leçon suivante : le son et la mise en scène du produit.' },
        ],
        key: [
          'Avant chaque tournage : lentille nettoyée, mode avion, grille activée, assez de stockage et de batterie.',
          '1080p suffit et reste léger ; 4K laisse de la marge pour zoomer et recadrer. 30 i/s au quotidien, 60 i/s pour les plans à ralentir. Les menus changent selon le téléphone.',
          'Verrouiller la mise au point et l’exposition (souvent un appui long sur le sujet, sinon le mode Pro). Vidéo délavée : essayer sans HDR ; image qui scintille sous une lampe (courant en 50 Hz) : 25 ou 50 i/s si proposé, ou lumière du jour ; pas de zoom numérique.',
        ],
        quiz: [
          { q: 'Pourquoi verrouiller l’exposition ?', a: ['Pour que la luminosité ne change pas pendant le plan', 'Pour filmer en 4K', 'Pour couper le son'], ok: 0, why: 'En automatique, la luminosité varie dès que quelque chose bouge dans le cadre.' },
          { q: 'Quel est l’intérêt du 4K pour une pub exportée en 1080p ?', a: ['Aucun', 'De la marge pour zoomer et recadrer au montage', 'Des couleurs plus vraies'], ok: 1, why: 'Tu peux recadrer ou faire un punch-in sans perdre en netteté.' },
        ],
        todo: [
          'Nettoie la lentille, passe en mode avion et active la grille',
          'Règle la résolution (1080p ou 4K) et la cadence (30 ou 60 i/s) selon tes plans',
          'Filme le même plan en automatique, puis avec mise au point et exposition verrouillées',
          'Compare les deux dans CapCut et garde la version stable',
          'Note tes réglages dans ta fiche, pour les retrouver à chaque tournage',
        ],
        res: [
          {
            title: 'Check-list réglages avant tournage',
            text: 'Téléphone : [modèle] · les noms des menus changent selon le téléphone\n\n☐ Lentille nettoyée (chiffon doux et sec)\n☐ Mode avion · notifications coupées\n☐ Grille activée\n☐ Stockage libre : [  ] Go · batterie chargée\n☐ Résolution : [1080p / 4K (pour zoomer et recadrer)]\n☐ Cadence : [30 i/s / 60 i/s pour les ralentis]\n☐ Objectif principal (1×), pas de zoom numérique\n☐ Mise au point et exposition verrouillées (appui long sur le sujet, ou mode Pro)\n\nSi la vidéo paraît délavée dans CapCut : essayer sans la vidéo HDR.\nSi l’image scintille sous une lampe : lumière du jour, ou 25 / 50 i/s si le téléphone le propose (courant en 50 Hz).',
          },
        ],
      },
      {
        id: 'm9-l5',
        n: 5,
        title: 'Le son et la mise en scène du produit',
        ar: 'الصوت وإخراج المنتج',
        scenes: [
          { type: 'title', sub: 'Un son propre, un décor qui vend', say: 'Dernière leçon de tournage : le son sur le plateau, puis la mise en scène de ton produit, du décor au packshot maison.' },
          {
            type: 'cards',
            title: 'Un son *propre* au tournage',
            items: [
              { icon: 'mic', label: 'Micro-cravate', sub: 'Sur la poitrine, près de la bouche', c: 'gold' },
              { icon: 'phone', label: 'Sans micro', sub: 'Le téléphone proche de toi', c: 'hook' },
              { icon: 'home', label: 'Une pièce calme', sub: 'Des tissus, clim et ventilateur coupés', c: 'body' },
            ],
            say: 'Une belle image avec un son qui résonne, ça fait amateur. Un micro-cravate, accroché sur la poitrine, change tout. Sans micro, rapproche le téléphone. Et filme dans une pièce calme, climatiseur coupé.',
          },
          {
            type: 'checklist',
            title: 'Le *décor*',
            items: ['Un fond *simple* et rangé', 'Une touche des *couleurs de ta marque*', 'Un lieu *lié à l’usage* : salle de bain, cuisine', 'Le sujet *décollé du mur*'],
            say: 'Le décor : un fond simple et rangé. Une touche des couleurs de ta marque. Un lieu lié à l’usage : la salle de bain pour une crème, la cuisine pour un robot. Et décolle-toi du mur, pour éviter les ombres.',
          },
          {
            type: 'steps',
            title: 'Le *packshot* maison',
            items: [
              { k: '1', label: 'Un fond uni', sub: 'Une grande feuille courbée, du mur à la table', c: 'gold' },
              { k: '2', label: 'Près d’une fenêtre', sub: 'La lumière arrive de côté', c: 'hook' },
              { k: '3', label: 'Un carton blanc en face', sub: 'Pour adoucir les ombres', c: 'body' },
              { k: '4', label: 'Le produit impeccable', sub: 'Sans poussière ni traces de doigts', c: 'cta' },
            ],
            say: 'Le packshot maison : une grande feuille unie, courbée du mur jusqu’à la table. Une table près de la fenêtre, lumière de côté. Un carton blanc en face. Et un produit impeccable, sans traces de doigts.',
          },
          {
            type: 'cards',
            title: 'Les *plans de coupe* (B-roll)',
            items: [
              { icon: 'gift', label: 'Les mains', sub: 'Ouvrir, appliquer, porter', c: 'gold' },
              { icon: 'search', label: 'Les détails', sub: 'Texture, couture, cadran, étiquette', c: 'hook' },
              { icon: 'home', label: 'L’ambiance', sub: 'Le produit dans sa vraie vie', c: 'body' },
            ],
            say: 'Enfin, les plans de coupe, le B-roll : les mains qui utilisent le produit, les détails, l’ambiance. Filmes-en une dizaine, de trois à cinq secondes : au montage, ils couvrent les coupes et nourrissent le rythme.',
          },
          { type: 'outro', say: 'Leçon suivante : « Le funnel : une créative pour chaque étape ».' },
        ],
        key: [
          'Le son : un micro-cravate sur la poitrine, ou le téléphone proche ; une pièce calme, avec des tissus, climatiseur et ventilateur coupés.',
          'Le décor : un fond simple et rangé, une touche des couleurs de la marque, un lieu lié à l’usage, le sujet décollé du mur. Le packshot maison : fond uni courbé, table près d’une fenêtre, lumière de côté, carton blanc en face, produit impeccable.',
          'Les plans de coupe (B-roll) : les mains, les détails, l’ambiance ; une dizaine de plans de 3 à 5 secondes pour couvrir les coupes et nourrir le rythme.',
        ],
        quiz: [
          { q: 'Sans micro, comment améliorer le son ?', a: ['Rapprocher le téléphone, dans une pièce calme', 'Filmer près du climatiseur allumé', 'Parler plus vite'], ok: 0, why: 'Plus la source est proche et la pièce calme, plus la voix est claire.' },
          { q: 'À quoi servent les plans de coupe ?', a: ['À couvrir les coupes et nourrir le rythme', 'À rallonger la vidéo', 'À remplacer le hook'], ok: 0, why: 'Ils cachent les raccords et apportent un changement à l’écran toutes les 2 à 3 secondes.' },
        ],
        todo: [
          'Enregistre 10 secondes de voix avec le téléphone loin, puis proche, et compare au casque',
          'Prépare un décor : fond rangé, une touche des couleurs de ta marque, un lieu lié à l’usage',
          'Monte ton studio packshot : feuille courbée, table près de la fenêtre, carton blanc',
          'Fais 3 packshots de ton produit sous 3 angles différents',
          'Filme 10 plans de coupe de 3 à 5 secondes : mains, détails, ambiance',
        ],
        res: [
          {
            title: 'Liste de tournage : packshot et plans de coupe',
            text: 'Produit : [nom] · Couleurs de la marque : [  ]\n\nSON\nMicro : [micro-cravate sur la poitrine / téléphone proche] · Pièce : [calme, avec des tissus] · Climatiseur et ventilateur : coupés\nTest : 10 secondes écoutées au casque avant de tourner\n\nDÉCOR\nFond : [simple, rangé] · Touche de marque : [objet, tissu, fleur] · Lieu lié à l’usage : [salle de bain / cuisine / bureau / extérieur]\nLe sujet à [  ] du mur\n\nPACKSHOT MAISON\nFond : grande feuille unie, courbée du mur à la table · Table près d’une fenêtre, lumière de côté · Carton blanc en face\nProduit : nettoyé, sans poussière ni traces de doigts, étiquette droite\nAngles : 1. [face] 2. [trois quarts] 3. [détail]\n\nPLANS DE COUPE (une dizaine, 3 à 5 s chacun)\nMains : [ouvrir, appliquer, porter, refermer]\nDétails : [texture, couture, cadran, étiquette]\nAmbiance : [le produit dans sa vraie vie]',
          },
        ],
      },
    ],
  },
  {
    id: 'm10',
    n: 10,
    part: 'p1',
    level: 'avance',
    title: 'Stratégie marketing : funnel, angles et confiance',
    ar: 'استراتيجية التسويق: القمع والزوايا والثقة',
    color: '#9fd3a8',
    icon: 'route',
    pitch: 'Une créative pour chaque étape du parcours d’achat, plusieurs angles pour un même produit, et la confiance qui transforme un message en commande.',
    lessons: [
      {
        id: 'm10-l1',
        n: 1,
        title: 'Le funnel : une créative pour chaque étape',
        ar: 'القمع: إعلان لكل مرحلة',
        scenes: [
          { type: 'title', sub: 'Froid, tiède, chaud… puis fidèle', say: 'Tout le monde ne voit pas ta pub au même moment de sa réflexion. À chaque étape, sa créative et son message.' },
          {
            type: 'steps',
            title: 'Les *4 étapes* du funnel',
            items: [
              { k: '1', label: 'Découverte', sub: 'Public froid : il ne te connaît pas', c: 'hook' },
              { k: '2', label: 'Considération', sub: 'Public tiède : il a vu, il hésite', c: 'body' },
              { k: '3', label: 'Conversion', sub: 'Public chaud : il est prêt à commander', c: 'cta' },
              { k: '4', label: 'Fidélisation', sub: 'Client : il a déjà acheté chez toi', c: 'gold' },
            ],
            say: 'Quatre étapes. La découverte : un public froid, qui ne te connaît pas. La considération : il a vu, il compare, il hésite. La conversion : il est prêt. Et la fidélisation : il a déjà acheté chez toi.',
          },
          {
            type: 'cards',
            title: 'Quelle *créative* à quelle étape ?',
            items: [
              { icon: 'hook', label: 'Froid', sub: 'Un hook fort, le problème, une démo', c: 'hook' },
              { icon: 'eye', label: 'Tiède', sub: 'Des preuves vraies, des réponses à ses questions', c: 'body' },
              { icon: 'cart', label: 'Chaud', sub: 'L’offre, le prix, comment commander', c: 'cta' },
              { icon: 'heart', label: 'Client', sub: 'Nouveautés, conseils, offre réservée', c: 'gold' },
            ],
            say: 'Au public froid : un hook fort, le problème, une démonstration. Au tiède : des preuves vraies et des réponses à ses questions. Au chaud : l’offre et comment commander. Au client : nouveautés et conseils.',
          },
          {
            type: 'compare',
            title: 'Le bon message *au bon moment*',
            left: { title: 'Trop tôt', tone: 'bad', items: ['« Promo, commande vite ! » à un inconnu', 'Il passe sans savoir pourquoi acheter'] },
            right: { title: 'Au bon moment', tone: 'good', items: ['Le froid découvre le produit', 'Le chaud reçoit l’offre claire'] },
            say: 'L’erreur courante : envoyer « promo, commande vite » à quelqu’un qui ne connaît ni toi ni ton produit. Il passe. Fais d’abord découvrir le produit, et garde l’offre pour ceux qui sont déjà chauds.',
          },
          {
            type: 'quote',
            text: 'Un inconnu veut *comprendre*. Un client chaud veut *commander*.',
            say: 'Retiens : un inconnu veut d’abord comprendre ce que c’est et pourquoi ça le concerne. Un client chaud veut savoir comment commander. Ce n’est pas la même pub.',
          },
          { type: 'outro', say: 'Leçon suivante : les angles marketing.' },
        ],
        key: [
          'Quatre étapes : découverte (public froid), considération (tiède), conversion (chaud), fidélisation (clients).',
          'Froid : hook, problème, démo. Tiède : preuves vraies, réponses aux questions. Chaud : l’offre et comment commander. Client : nouveautés, conseils, offre réservée.',
          'Une offre pressante montrée à un inconnu le fait fuir : le bon message dépend du moment.',
        ],
        quiz: [
          { q: 'Une personne a regardé ta vidéo et visité ta page, sans commander. Elle est…', a: ['Froide', 'Tiède', 'Déjà cliente'], ok: 1, why: 'Elle te connaît et elle hésite : c’est le moment des preuves et des réponses à ses questions.' },
          { q: 'Quelle créative montrer à un public froid ?', a: ['Un hook fort qui montre le problème et le produit', 'Le récapitulatif de sa commande', 'Un code de fidélité'], ok: 0, why: 'Un inconnu doit d’abord comprendre ce que c’est et pourquoi ça le concerne.' },
        ],
        todo: [
          'Choisis un produit et écris, pour chacune des 4 étapes, à qui tu parles en une phrase',
          'Écris un hook pour le public froid et un message d’offre pour le public chaud',
          'Note 3 questions qu’un client tiède pose avant d’acheter, avec ta réponse vraie à chacune',
          'Trouve dans la Bibliothèque publicitaire de Meta une pub « froide » et une pub « chaude » de ta niche, et note la différence',
          'Coche la leçon et passe le quiz',
        ],
        res: [
          {
            title: 'Plan funnel : une créative par étape',
            text: 'Produit : [nom]\n\n1. DÉCOUVERTE (froid : ne te connaît pas)\nObjectif : faire découvrir · Créative : [hook fort + problème + démo] · Message : [  ]\n\n2. CONSIDÉRATION (tiède : a vu, hésite)\nObjectif : rassurer · Créative : [preuves vraies, comparaison, réponses aux questions] · Message : [  ]\n\n3. CONVERSION (chaud : prêt à commander)\nObjectif : faire commander · Créative : [offre vraie + comment commander + réassurance] · Message : [  ]\n\n4. FIDÉLISATION (clients)\nObjectif : faire revenir · Créative : [nouveauté, conseil d’utilisation, offre réservée aux clients] · Message : [  ]',
          },
        ],
      },
      {
        id: 'm10-l2',
        n: 2,
        title: 'Les angles marketing : un produit, plusieurs façons de le vendre',
        ar: 'الزوايا التسويقية: منتج واحد وعدة طرق لبيعه',
        scenes: [
          { type: 'title', sub: 'Même produit, autre raison d’acheter', say: 'Un même produit peut se vendre de plusieurs façons. Chaque façon, c’est un angle. Et changer d’angle peut tout changer.' },
          {
            type: 'steps',
            title: 'Trois angles *émotion*',
            items: [
              { k: '1', label: 'Le problème', sub: '« Ton parfum ne tient pas jusqu’à midi ? »', c: 'hook' },
              { k: '2', label: 'Le désir', sub: '« Sentir bon au mariage de ta cousine »', c: 'body' },
              { k: '3', label: 'Le cadeau', sub: '« L’idée cadeau pour l’Aïd »', c: 'gold' },
            ],
            say: 'Trois angles émotion. Le problème : ton parfum ne tient pas jusqu’à midi ? Le désir : sentir bon au mariage de ta cousine. Le cadeau : l’idée à offrir pour l’Aïd ou un anniversaire.',
          },
          {
            type: 'cards',
            title: 'Trois angles *raison*',
            items: [
              { icon: 'money', label: 'Prix ou offre', sub: 'Le pack, la livraison, ce qu’on reçoit', c: 'cta' },
              { icon: 'shield', label: 'Autorité', sub: 'Un vrai savoir-faire, un vrai expert', c: 'ia' },
              { icon: 'repeat', label: 'Comparaison', sub: 'Face à ce que ton client utilise déjà', c: 'body' },
            ],
            say: 'Trois angles raison. Le prix ou l’offre : le pack, la livraison, ce qu’on reçoit. L’autorité : un vrai savoir-faire, une vraie experte qui explique. La comparaison : face à l’habitude du client, sans dénigrer de marque.',
          },
          {
            type: 'checklist',
            title: 'La *matrice* angle × audience',
            items: ['Une ligne par *audience* : femmes 25–35 ans, hommes qui offrent…', 'Une colonne par *angle*', 'Dans chaque case : *un hook*', 'Tu testes d’abord les cases les plus *prometteuses*'],
            say: 'Pour t’organiser, fais une matrice. Une ligne par audience : les femmes de vingt-cinq à trente-cinq ans, les hommes qui offrent un cadeau. Une colonne par angle. Un hook dans chaque case. Puis tu testes les plus prometteuses.',
          },
          {
            type: 'quote',
            text: 'Une pub ne marche pas ? Change *l’angle* avant d’abandonner *le produit*.',
            say: 'Retiens : quand une pub ne marche pas, ce n’est pas toujours le produit. Souvent, c’est la raison d’acheter que tu as mise en avant. Teste un autre angle avant d’abandonner.',
          },
          { type: 'outro', say: 'Leçon suivante : gagner la confiance de tes acheteurs.' },
        ],
        key: [
          'Un angle = une raison d’acheter. Émotion : problème, désir, cadeau. Raison : prix ou offre, autorité, comparaison.',
          'La matrice angle × audience : une ligne par audience, une colonne par angle, un hook par case, puis on teste les cases les plus prometteuses.',
          'Une pub qui ne marche pas ? Teste un autre angle avant d’abandonner le produit. L’autorité seulement si elle est réelle, la comparaison sans dénigrer de marque.',
        ],
        quiz: [
          { q: '« L’idée cadeau pour l’Aïd », c’est quel angle ?', a: ['Le problème', 'Le cadeau', 'L’autorité'], ok: 1, why: 'On ne vend pas le produit pour soi, mais pour faire plaisir à quelqu’un.' },
          { q: 'Ta pub avec l’angle « prix » ne marche pas. Que fais-tu d’abord ?', a: ['Tu abandonnes le produit', 'Tu testes un autre angle, par exemple le problème ou le cadeau', 'Tu baisses encore le prix'], ok: 1, why: 'Souvent, ce n’est pas le produit qui bloque, mais la raison d’acheter mise en avant.' },
        ],
        todo: [
          'Choisis un produit et écris un hook pour chacun des 6 angles',
          'Liste 3 audiences différentes pour ce produit',
          'Remplis la matrice angle × audience, avec un hook par case',
          'Entoure les 3 cases que tu testerais en premier, et note pourquoi',
          'Coche la leçon et passe le quiz',
        ],
        res: [
          {
            title: 'Matrice angle × audience',
            text: 'Produit : [nom]\nAngles : Problème · Désir · Prix ou offre · Cadeau · Autorité · Comparaison\n\nAudience 1 : [ex. femmes 25–35 ans]\n  Problème : [hook] · Désir : [hook] · Prix ou offre : [hook]\n  Cadeau : [hook] · Autorité : [hook] · Comparaison : [hook]\n\nAudience 2 : [ex. hommes qui offrent un cadeau]\n  [un hook par angle]\n\nAudience 3 : [ex. étudiantes, petit budget]\n  [un hook par angle]\n\nÀ tester en premier : [3 cases] · pourquoi : [  ]\n\nRègles : autorité seulement si elle est réelle · comparaison sans dénigrer une marque · offre seulement si elle est vraie.',
          },
        ],
      },
      {
        id: 'm10-l3',
        n: 3,
        title: 'Gagner la confiance de tes acheteurs',
        ar: 'كسب ثقة المشترين',
        scenes: [
          { type: 'title', sub: 'Sans confiance, pas de commande', say: 'En ligne, ton client ne te voit pas et ne touche pas le produit. Avant de commander, il se demande : est-ce que je peux faire confiance ?' },
          {
            type: 'cards',
            title: 'Des *vraies* preuves',
            items: [
              { icon: 'star', label: 'Avis réels', sub: 'Publiés avec l’accord du client', c: 'gold' },
              { icon: 'camera', label: 'Photos de clients', sub: 'Le produit reçu, chez eux', c: 'body' },
              { icon: 'video', label: 'UGC', sub: 'Une vraie personne qui utilise le produit', c: 'hook' },
            ],
            say: 'Les preuves qui rassurent : des avis réels, publiés avec l’accord du client. Des photos du produit reçu, envoyées par tes clients. Et de l’UGC : une vraie personne qui utilise vraiment le produit.',
          },
          {
            type: 'checklist',
            title: 'Ce qui *rassure*',
            items: ['Le *paiement à la livraison*', 'L’échange ou la garantie, *écrits*', 'Le prix et les délais *annoncés clairement*', 'Une page et un WhatsApp *pro*, le même style partout'],
            say: 'Ce qui rassure aussi : le paiement à la livraison. L’échange ou la garantie, si tu les proposes, écrits noir sur blanc. Le prix et les délais annoncés clairement. Une page et un WhatsApp professionnels, et le même style partout.',
          },
          {
            type: 'compare',
            title: 'Ce qui *détruit* la confiance',
            left: { title: 'À bannir', tone: 'bad', items: ['Des faux avis, des captures inventées', 'Le prix caché : « prix en privé »'] },
            right: { title: 'À faire', tone: 'good', items: ['Les vrais retours, même peu nombreux', 'Le prix affiché, les frais de livraison dits'] },
            say: 'Jamais de faux avis ni de fausses captures : il suffit d’un client qui s’en rend compte, et c’est ta réputation. Et oublie le « prix en privé » : affiche le prix, et dis les frais de livraison.',
          },
          {
            type: 'big',
            kicker: 'Pas encore d’avis ?',
            text: 'Montre *le produit*, *le geste*, *l’emballage*.',
            sub: 'Une démo honnête rassure plus qu’un faux témoignage',
            say: 'Pas encore d’avis ? Ce n’est pas grave. Montre le produit sous tous les angles, le vrai geste, l’emballage. Puis demande à tes premiers clients une photo, et leur accord pour la partager.',
          },
          { type: 'outro', say: 'Leçon suivante : le retargeting.' },
        ],
        key: [
          'Des preuves vraies : avis réels publiés avec accord, photos de clients, UGC d’une vraie personne qui utilise le produit.',
          'Ce qui rassure : paiement à la livraison, échange ou garantie écrits, prix et délais clairs, page et WhatsApp pro, le même style partout.',
          'Jamais de faux avis ni de captures inventées. Pas encore d’avis ? Une démo honnête, puis photos et accord de tes premiers clients.',
        ],
        quiz: [
          { q: 'Tu n’as pas encore d’avis clients. Que fais-tu ?', a: ['Tu écris quelques avis toi-même', 'Tu montres une démo honnête et tu demandes leur accord à tes premiers clients', 'Tu caches les commentaires'], ok: 1, why: 'Un faux avis découvert détruit la confiance ; une démo vraie et les premiers retours réels la construisent.' },
          { q: 'Qu’est-ce qui rassure un acheteur en ligne en Algérie ?', a: ['« Prix en privé »', 'Le paiement à la livraison et le prix affiché', 'Un compte sans photo de profil'], ok: 1, why: 'Il sait combien il paie, et il paie quand il a le produit en main.' },
        ],
        todo: [
          'Fais la liste des preuves vraies que tu as déjà : avis, photos, vidéos de clients',
          'Écris le message pour demander à un client une photo et son accord pour la publier',
          'Rédige tes conditions en 3 lignes : prix, délais, paiement, échange',
          'Vérifie ta page et ton WhatsApp : photo de profil, description, horaires, même style que tes pubs',
          'Coche la leçon et passe le quiz',
        ],
        res: [
          {
            title: 'Message pour demander un avis (WhatsApp)',
            text: 'Salam [prénom] ! Vous avez bien reçu votre [produit] ?\nSi vous êtes satisfait(e), pourriez-vous m’envoyer une photo du produit chez vous et une phrase sur votre avis ?\nAvec votre accord, je la partagerai sur ma page [avec votre prénom / sans votre nom, comme vous préférez].\nEt si quelque chose ne va pas, dites-le-moi : on trouve une solution.\nMerci beaucoup !',
          },
          {
            title: 'Check-list confiance',
            text: '• Avis : uniquement réels, publiés avec l’accord du client\n• Photos et vidéos de clients : avec leur accord\n• Prix affiché, frais de livraison annoncés\n• Délais de livraison annoncés, et tenus\n• Paiement à la livraison (si tu le proposes)\n• Conditions d’échange ou de garantie écrites\n• Page et WhatsApp pro : photo, description, horaires, réponses rapides\n• Même logo, mêmes couleurs, même ton partout\n• Jamais : faux avis, fausses captures, faux compteurs de ventes',
          },
        ],
      },
      {
        id: 'm10-l4',
        n: 4,
        title: 'Le retargeting : parler à ceux qui ont déjà vu',
        ar: 'إعادة الاستهداف: مخاطبة من شاهد إعلانك',
        scenes: [
          { type: 'title', sub: 'Ils ont regardé, visité, ajouté… sans commander', say: 'Beaucoup de gens voient ta pub sans commander tout de suite. Le retargeting, c’est leur montrer une nouvelle créative, faite pour eux.' },
          {
            type: 'steps',
            title: 'Trois audiences *chaudes*',
            items: [
              { k: '1', label: 'Ils ont regardé', sub: 'Une bonne partie de ta vidéo', c: 'hook' },
              { k: '2', label: 'Ils ont visité', sub: 'Ta page, ton profil ou ton site', c: 'body' },
              { k: '3', label: 'Ils ont presque commandé', sub: 'Ajouté au panier, ou écrit sans finaliser', c: 'cta' },
            ],
            say: 'Trois audiences chaudes. Ceux qui ont regardé une bonne partie de ta vidéo. Ceux qui ont visité ta page ou ton site. Et ceux qui ont ajouté au panier, ou t’ont écrit, sans finaliser.',
          },
          {
            type: 'cards',
            title: 'Ce que la *relance* leur dit',
            items: [
              { icon: 'help', label: 'Répondre aux objections', sub: '« Et si ça ne me va pas ? »', c: 'body' },
              { icon: 'star', label: 'Montrer des preuves', sub: 'Avis réels, photos de clients', c: 'gold' },
              { icon: 'gift', label: 'Rappeler l’offre', sub: 'Prix, livraison, paiement à la livraison', c: 'cta' },
            ],
            say: 'La créative de relance ne répète pas la première. Elle répond aux objections : et si ça ne me va pas ? Elle montre des preuves réelles. Et elle rappelle l’offre : prix, livraison, paiement à la livraison.',
          },
          {
            type: 'compare',
            title: 'La même pub *ou* une relance ?',
            left: { title: 'La même pub, encore', tone: 'bad', items: ['Ils l’ont déjà vue', 'Rien de nouveau pour décider'] },
            right: { title: 'Une vraie relance', tone: 'good', items: ['Elle lève le doute qui bloque', 'Une raison d’agir, si elle est vraie'] },
            say: 'Leur remontrer la même pub, c’est leur redire ce qu’ils savent déjà. Une vraie relance lève le doute qui bloque, et donne une raison d’agir, seulement si elle est vraie : la fin réelle d’une offre, un stock réel.',
          },
          {
            type: 'checklist',
            title: 'Les objections *courantes*',
            items: ['« C’est l’original ? »', '« Et si la taille ne va pas ? »', '« Ça arrive quand chez moi ? »', '« Je paie comment ? »'],
            say: 'Les objections qu’on entend souvent : c’est l’original ? Et si la taille ne va pas ? Ça arrive quand ? Je paie comment ? Une vidéo courte par objection, avec une réponse vraie : voilà ta série de relance.',
          },
          { type: 'outro', say: 'Leçon suivante : de la pub à la vente, le parcours WhatsApp.' },
        ],
        key: [
          'Le retargeting : une nouvelle créative pour ceux qui ont regardé ta vidéo, visité ta page ou ton site, ajouté au panier ou écrit sans finaliser. Ces audiences se créent dans le gestionnaire de publicités, selon ce que la plateforme propose.',
          'La relance ne répète pas la première pub : elle répond aux objections, montre des preuves réelles et rappelle l’offre.',
          'Une vidéo courte par objection courante, et une raison d’agir maintenant seulement si elle est vraie.',
        ],
        quiz: [
          { q: 'Quelqu’un a ajouté ton produit au panier sans commander. Que lui montres-tu ?', a: ['Exactement la même pub', 'Une relance qui répond à son doute et rappelle l’offre', 'Une pub pour un autre produit'], ok: 1, why: 'Il est intéressé, mais quelque chose le bloque : la relance lève ce doute.' },
          { q: 'Quelle raison d’agir maintenant peux-tu utiliser ?', a: ['« Plus que 2 pièces ! », même si c’est faux', 'La fin réelle d’une offre, si elle existe', '« Le prix double demain », inventé'], ok: 1, why: 'Une urgence inventée trompe le client ; une échéance réelle l’aide à décider.' },
        ],
        todo: [
          'Note les 4 questions que tes clients posent le plus souvent avant de commander',
          'Écris une réponse vraie et courte à chacune',
          'Écris le script d’une relance de 15 secondes sur l’objection la plus fréquente',
          'Liste les preuves réelles à montrer dans cette relance : avis, photos, démo',
          'Coche la leçon et passe le quiz',
        ],
        res: [
          {
            title: 'Script de relance (15 s)',
            text: 'Audience : [a regardé la vidéo / a visité la page / a ajouté au panier ou écrit sans finaliser]\nObjection visée : [ex. « Et si la taille ne va pas ? »]\n\nHOOK (0–3 s) : [l’objection, dite comme le client la pense]\nRÉPONSE (3–10 s) : [la réponse vraie : démonstration, conditions d’échange, délai réel]\nPREUVE (10–12 s) : [avis réel ou photo de client, avec son accord]\nCTA (12–15 s) : [rappel de l’offre + comment commander + paiement à la livraison, si c’est vrai]\n\nRaison d’agir maintenant : uniquement si elle est réelle (fin d’offre datée, stock réel).',
          },
        ],
      },
      {
        id: 'm10-l5',
        n: 5,
        title: 'De la pub à la vente : le parcours WhatsApp',
        ar: 'من الإعلان إلى البيع: مسار واتساب',
        scenes: [
          { type: 'title', sub: 'Chaque message compte, jusqu’au colis livré', say: 'Ta pub fait écrire les gens sur WhatsApp. Maintenant, chaque étape de la conversation compte, jusqu’au colis livré.' },
          {
            type: 'steps',
            title: 'Le parcours en *5 étapes*',
            items: [
              { k: '1', label: 'La pub', sub: 'Un bouton qui ouvre WhatsApp', c: 'hook' },
              { k: '2', label: 'Le premier message', sub: 'Accueil, prix, une question', c: 'body' },
              { k: '3', label: 'La conversation', sub: 'Répondre, rassurer, conseiller', c: 'body' },
              { k: '4', label: 'La confirmation', sub: 'Un récap écrit, puis un appel', c: 'cta' },
              { k: '5', label: 'La livraison', sub: 'Suivie, puis un message après', c: 'gold' },
            ],
            say: 'Cinq étapes. La pub, avec un bouton qui ouvre WhatsApp. Le premier message : accueil, prix, une question. La conversation : tu rassures et tu conseilles. La confirmation, écrite puis par appel. Et la livraison, suivie.',
          },
          {
            type: 'big',
            kicker: 'La vitesse',
            text: 'Réponds *vite* : un client qui attend *refroidit*.',
            sub: 'Messages types prêts, notifications activées, horaires affichés',
            say: 'La règle numéro un : réponds vite. Un client qui attend peut déjà avoir écrit à un concurrent. Avec WhatsApp Business, enregistre tes réponses rapides et un message d’accueil, et affiche tes horaires.',
          },
          {
            type: 'checklist',
            title: 'La *confirmation*',
            items: ['Le récap écrit : produit, taille, prix, *frais de livraison*', 'Nom, téléphone, *wilaya*, commune, adresse', 'Un *appel* de confirmation avant l’envoi', 'Le délai *réel*, annoncé'],
            say: 'Avant d’envoyer : un récap écrit avec le produit, la taille, le prix et les frais de livraison. Le nom, le téléphone, la wilaya et l’adresse. Puis un appel rapide de confirmation, et le délai réel.',
          },
          {
            type: 'compare',
            title: 'Moins de *retours*',
            left: { title: 'Ce qui crée des retours', tone: 'bad', items: ['Une commande jamais confirmée', 'Un produit différent de la pub'] },
            right: { title: 'Ce qui les réduit', tone: 'good', items: ['Un récap écrit, puis un appel', 'Le produit montré tel qu’il est'] },
            say: 'Un colis refusé te coûte l’aller et le retour. Les refus viennent souvent d’une commande jamais confirmée, ou d’un produit différent de la pub. Confirme toujours, et montre le produit tel qu’il est.',
          },
          { type: 'outro', say: 'Leçon suivante : ta ligne éditoriale et tes 4 piliers.' },
        ],
        key: [
          'Le parcours : pub → premier message → conversation → confirmation → livraison. Chaque étape peut gagner ou perdre la vente.',
          'Répondre vite : des messages types prêts (par exemple les réponses rapides et le message d’accueil de WhatsApp Business), les notifications activées, les horaires affichés.',
          'Récap écrit, appel de confirmation et délai réel avant l’envoi, et un produit montré tel qu’il est : c’est ce qui réduit les colis refusés.',
        ],
        quiz: [
          { q: 'Pourquoi appeler le client avant d’envoyer le colis ?', a: ['Pour lui vendre un autre produit', 'Pour confirmer la commande et éviter les colis refusés', 'Ce n’est jamais utile'], ok: 1, why: 'Une commande confirmée de vive voix limite les mauvaises surprises à la livraison.' },
          { q: 'Que contient le récap écrit ?', a: ['Produit, taille, prix, frais de livraison, adresse et délai', 'Seulement le prix', 'Un lien vers ta page'], ok: 0, why: 'Le client valide tout par écrit : moins de malentendus, moins de refus.' },
        ],
        todo: [
          'Écris tes messages types : accueil, détails, récap de commande, expédition, après la livraison',
          'Enregistre-les en réponses rapides dans WhatsApp Business, ou dans tes notes',
          'Écris le script de ton appel de confirmation en 4 phrases',
          'Liste ce qu’il faut demander pour chaque commande : nom, téléphone, wilaya, commune, adresse, taille',
          'Coche la leçon et passe le quiz',
        ],
        res: [
          {
            title: 'Messages types WhatsApp',
            text: '1. ACCUEIL\nSalam, merci pour votre message ! Le [produit] est à [prix] DA, livraison en [délai réel] dans [zones livrées], paiement à la livraison. C’est pour vous ou pour offrir ?\n\n2. DÉTAILS\n[Réponse précise à sa question : taille, contenance, utilisation] + [photo ou courte vidéo réelle du produit]\n\n3. RÉCAP DE COMMANDE\nJe récapitule : [produit], [taille / couleur], [prix] DA + livraison [frais] DA = [total] DA.\nNom : [  ] · Téléphone : [  ] · Wilaya : [  ] · Commune : [  ] · Adresse : [  ]\nLivraison prévue : [délai réel]. C’est bon pour vous ?\n\n4. EXPÉDITION\nVotre colis est parti ! [Le livreur vous appellera avant de passer / numéro de suivi : …]\n\n5. APRÈS LA LIVRAISON\nVous avez bien reçu votre [produit] ? Tout vous plaît ? Si quelque chose ne va pas, dites-le-moi.\n\nAPPEL DE CONFIRMATION (30 secondes)\nSalam, c’est [prénom] de [boutique]. Je vous appelle pour confirmer votre commande : [produit], [total] DA, livrée à [commune] en [délai réel]. Tout est bon pour vous ?',
          },
        ],
      },
    ],
  },

  {
    id: 'm11',
    n: 11,
    part: 'p1',
    level: 'avance',
    title: 'Créer du contenu pour les réseaux',
    ar: 'صناعة المحتوى لمواقع التواصل',
    color: '#d9a7e8',
    icon: 'pen',
    pitch: 'Une ligne éditoriale, des textes qui accrochent, le bon format pour chaque objectif, une séance de tournage efficace et un calendrier que tu tiens.',
    lessons: [
      {
        id: 'm11-l1',
        n: 1,
        title: 'Ta ligne éditoriale et tes 4 piliers',
        ar: 'الخط التحريري وركائز المحتوى',
        scenes: [
          { type: 'title', sub: 'Savoir quoi publier, chaque semaine', say: 'Une pub vend. Mais entre deux pubs, ta page doit vivre. Pour ne plus te demander quoi publier, il te faut une ligne éditoriale.' },
          {
            type: 'big',
            kicker: 'La ligne éditoriale',
            text: 'À *qui* tu parles, de *quoi*, et sur quel *ton*.',
            sub: 'Écrite en 3 lignes, relue avant chaque publication',
            say: 'La ligne éditoriale, c’est simple : à qui tu parles, de quoi tu parles, et sur quel ton. Écris-la en trois lignes, et relis-la avant chaque publication.',
          },
          {
            type: 'cards',
            title: 'Les *4 piliers*',
            items: [
              { icon: 'book', label: 'Éduquer', sub: 'Conseils, astuces, bien utiliser', c: 'ia' },
              { icon: 'smile', label: 'Divertir', sub: 'Tendances, coulisses, humour de ta niche', c: 'hook' },
              { icon: 'check', label: 'Prouver', sub: 'Démos, avis réels, colis préparés', c: 'body' },
              { icon: 'cart', label: 'Vendre', sub: 'Le produit, l’offre, comment commander', c: 'cta' },
            ],
            say: 'Quatre piliers. Éduquer : des conseils, comment bien utiliser. Divertir : tendances, coulisses, humour de ta niche. Prouver : démonstrations, avis réels, colis préparés. Et vendre : le produit, l’offre, comment commander.',
          },
          {
            type: 'compare',
            title: 'Tout vendre *ou* bien doser',
            left: { title: 'Que de la vente', tone: 'bad', items: ['« Promo » tous les jours', 'Les abonnés décrochent'] },
            right: { title: 'Les 4 piliers', tone: 'good', items: ['On apprend, on sourit, on voit des preuves', 'Puis on a envie d’acheter'] },
            say: 'Une page qui ne fait que vendre fatigue vite : promo, promo, promo. En alternant les quatre piliers, on apprend, on sourit, on voit des preuves… et l’envie d’acheter vient plus naturellement.',
          },
          {
            type: 'checklist',
            title: 'Exemple : une boutique de *parfum*',
            items: ['Éduquer : où vaporiser pour que l’odeur *tienne*', 'Divertir : le parfum *selon ta wilaya*', 'Prouver : la préparation d’une *vraie commande*', 'Vendre : le coffret du mois, *prix affiché*'],
            say: 'Exemple pour une boutique de parfum. Éduquer : où vaporiser pour que l’odeur tienne. Divertir : le parfum selon ta wilaya. Prouver : la préparation d’une vraie commande. Vendre : le coffret du mois, prix affiché.',
          },
          { type: 'outro', say: 'Leçon suivante : écrire pour les réseaux.' },
        ],
        key: [
          'La ligne éditoriale : à qui tu parles, de quoi, sur quel ton, écrite en 3 lignes et relue avant chaque publication.',
          'Quatre piliers : éduquer, divertir, prouver (uniquement du vrai), vendre.',
          'Une page qui ne fait que vendre fatigue ; alterner les piliers donne envie d’acheter.',
        ],
        quiz: [
          { q: 'Filmer la préparation d’une vraie commande, c’est quel pilier ?', a: ['Éduquer', 'Prouver', 'Divertir'], ok: 1, why: 'Tu montres que de vraies commandes partent : c’est une preuve.' },
          { q: 'Ta page ne publie que des promos. Le risque ?', a: ['Aucun', 'Les abonnés se lassent et décrochent', 'Ta page est supprimée'], ok: 1, why: 'Sans contenu utile ou divertissant, on n’a plus de raison de suivre la page.' },
        ],
        todo: [
          'Écris ta ligne éditoriale en 3 lignes : à qui, de quoi, sur quel ton',
          'Trouve 3 idées de contenus pour chacun des 4 piliers',
          'Classe par pilier les 9 dernières publications d’un concurrent',
          'Repère le pilier qui manque le plus sur ta page, et note une idée pour le combler',
          'Coche la leçon et passe le quiz',
        ],
        res: [
          {
            title: 'Ligne éditoriale et piliers',
            text: 'MA LIGNE ÉDITORIALE\nÀ qui je parle : [qui, âge, ville, envie ou problème]\nDe quoi je parle : [ma niche, mes produits, mes sujets]\nMon ton : [complice, expert, chaleureux…] · Langue : [darija / français / arabe]\n\nMES 4 PILIERS (3 idées chacun)\nÉduquer : [  ] / [  ] / [  ]\nDivertir : [  ] / [  ] / [  ]\nProuver (uniquement du vrai) : [  ] / [  ] / [  ]\nVendre : [  ] / [  ] / [  ]',
          },
        ],
      },
      {
        id: 'm11-l2',
        n: 2,
        title: 'Écrire pour les réseaux',
        ar: 'الكتابة لمواقع التواصل',
        scenes: [
          { type: 'title', sub: 'Accroche, corps, appel… et légende', say: 'Sur les réseaux, ton texte se lit en scrollant. Il doit accrocher, se lire vite, et dire quoi faire ensuite.' },
          {
            type: 'steps',
            title: 'La *structure* d’un texte',
            items: [
              { k: '1', label: 'L’accroche', sub: 'La 1ʳᵉ ligne, avant « … plus »', c: 'hook' },
              { k: '2', label: 'Le corps', sub: 'Une idée, des phrases courtes', c: 'body' },
              { k: '3', label: 'L’appel', sub: 'Une seule action demandée', c: 'cta' },
            ],
            say: 'Trois parties. L’accroche : la première ligne, souvent la seule lue avant « plus ». Le corps : une seule idée, des phrases courtes, des retours à la ligne. L’appel : une seule action, commente, écris-nous ou enregistre.',
          },
          {
            type: 'cards',
            title: 'Les *détails* qui comptent',
            items: [
              { icon: 'captions', label: 'La légende', sub: 'Elle complète la vidéo, sans la répéter', c: 'gold' },
              { icon: 'search', label: 'Des hashtags utiles', sub: 'Peu, précis : ta niche, ta ville', c: 'body' },
              { icon: 'globe', label: 'Darija ou français', sub: 'La langue de ta cible, pas la tienne', c: 'ia' },
            ],
            say: 'La légende complète la vidéo, elle ne la répète pas. Les hashtags : quelques-uns, précis, ta niche et ta ville, plutôt que trente génériques. Et la langue de ta cible : darija, français, ou un mélange.',
          },
          {
            type: 'compare',
            title: 'Une accroche *molle* ou *forte* ?',
            left: { title: 'Molle', tone: 'bad', items: ['« Nouvelle collection disponible »', '« Bonjour à tous, voici… »'] },
            right: { title: 'Forte', tone: 'good', items: ['« Tu mets ton parfum au mauvais endroit »', '« La question qu’on nous pose le plus »'] },
            say: '« Nouvelle collection disponible » : personne ne s’arrête. Une accroche forte parle au lecteur : tu mets ton parfum au mauvais endroit. Ou elle pique sa curiosité : la question qu’on nous pose le plus.',
          },
          {
            type: 'quote',
            text: 'Écris comme tu *parles* à ton client sur WhatsApp.',
            say: 'Le secret : écris comme tu parles à ton client sur WhatsApp. Simple, direct, chaleureux. Relis à voix haute : si ça sonne faux, réécris.',
          },
          { type: 'outro', say: 'Leçon suivante : les formats organiques.' },
        ],
        key: [
          'Accroche (la 1ʳᵉ ligne, souvent la seule lue), corps (une idée, des phrases courtes), appel (une seule action).',
          'La légende complète la vidéo ; quelques hashtags précis (niche, ville) ; la langue de ta cible : darija, français ou un mélange.',
          'Écris comme tu parles à ton client, et relis à voix haute.',
        ],
        quiz: [
          { q: 'Quelle accroche est la plus forte ?', a: ['« Nouvelle collection disponible »', '« Tu mets ton parfum au mauvais endroit »', '« Bonjour à tous »'], ok: 1, why: 'Elle parle directement au lecteur et éveille sa curiosité.' },
          { q: 'Combien d’actions demandes-tu à la fin du texte ?', a: ['Une seule', 'Trois ou quatre', 'Aucune'], ok: 0, why: 'Une seule action claire est plus facile à suivre.' },
        ],
        todo: [
          'Réécris la légende de ta dernière publication : accroche, corps, appel',
          'Écris 5 accroches pour un même produit',
          'Choisis 5 hashtags précis : ta niche, ta ville, ton produit',
          'Lis tes textes à voix haute et corrige ce qui sonne faux',
          'Coche la leçon et passe le quiz',
        ],
        res: [
          {
            title: 'Gabarit de légende',
            text: 'ACCROCHE (1ʳᵉ ligne) : [une question, une erreur courante, une curiosité]\n\nCORPS (une seule idée) :\n[phrase courte]\n[phrase courte]\n[phrase courte]\n\nAPPEL (une seule action) : [commente « … » / écris-nous sur WhatsApp / enregistre pour plus tard]\n\nHashtags (quelques-uns, précis) : #[niche] #[ville] #[produit]\nLangue : [darija / français / mélange] · Relu à voix haute : [oui / non]',
          },
        ],
      },
      {
        id: 'm11-l3',
        n: 3,
        title: 'Les formats organiques : reels, carrousels, stories, lives',
        ar: 'صيغ المحتوى: ريلز، كاروسيل، ستوري، لايف',
        scenes: [
          { type: 'title', sub: 'Chaque format a son rôle', say: 'Reel, carrousel, story, live : chaque format a un rôle différent. Choisis-le selon ce que tu veux obtenir.' },
          {
            type: 'cards',
            title: 'Quatre formats, *quatre rôles*',
            items: [
              { icon: 'video', label: 'Reel', sub: 'Toucher de nouvelles personnes', c: 'hook' },
              { icon: 'carousel', label: 'Carrousel', sub: 'Expliquer, se faire enregistrer', c: 'body' },
              { icon: 'phone', label: 'Story', sub: 'Garder le lien avec tes abonnés', c: 'gold' },
              { icon: 'play', label: 'Live', sub: 'Montrer en vrai, répondre en direct', c: 'cta' },
            ],
            say: 'Le reel sert surtout à toucher de nouvelles personnes. Le carrousel, à expliquer et à se faire enregistrer. La story garde le lien avec ceux qui te suivent déjà. Le live montre le produit en vrai, en direct.',
          },
          {
            type: 'checklist',
            title: 'Les stories, *au quotidien*',
            items: ['Les *coulisses* : colis, arrivage, préparation', 'Un *sondage* ou une question', 'Un retour client, *avec son accord*', 'Le rappel de ton *WhatsApp*'],
            say: 'Les stories, c’est le quotidien : les colis qui partent, un arrivage, un sondage pour choisir la prochaine couleur, un retour client partagé avec son accord, et le rappel de ton WhatsApp.',
          },
          {
            type: 'big',
            kicker: 'Le live',
            text: 'Un live = *une démo* + *les questions* en direct.',
            sub: 'Annoncé la veille, produits prêts, réponses par prénom',
            say: 'Le live fait peur, mais il rassure : on voit le produit en vrai, et tu réponds en direct. Annonce-le la veille, prépare tes produits, et réponds aux gens par leur prénom.',
          },
          {
            type: 'compare',
            title: 'Un format *pour chaque objectif*',
            left: { title: 'Au hasard', tone: 'bad', items: ['Un live improvisé, sans annonce', 'Un long texte dans un reel'] },
            right: { title: 'Au bon endroit', tone: 'good', items: ['Le reel pour être découvert', 'Le carrousel pour expliquer en détail'] },
            say: 'Ne choisis pas le format au hasard. Un live improvisé sans annonce : peu de monde. Un long texte dans un reel : personne ne le lit. Le reel pour être découvert, le carrousel pour expliquer.',
          },
          { type: 'outro', say: 'Leçon suivante : la vidéographie simple, tourner en série.' },
        ],
        key: [
          'Reel : toucher de nouvelles personnes. Carrousel : expliquer, se faire enregistrer. Story : garder le lien. Live : montrer en vrai et répondre en direct.',
          'Les stories du quotidien : coulisses, sondages, retours clients avec accord, rappel du WhatsApp.',
          'Le format se choisit selon l’objectif. Un live s’annonce la veille ; selon la plateforme, il peut demander un minimum d’abonnés.',
        ],
        quiz: [
          { q: 'Tu veux expliquer en détail comment choisir la taille d’une bague. Quel format ?', a: ['Une story de 3 secondes', 'Un carrousel', 'Aucun, c’est trop compliqué'], ok: 1, why: 'Le carrousel explique étape par étape, et on l’enregistre pour plus tard.' },
          { q: 'À quoi sert surtout la story ?', a: ['Garder le lien avec ceux qui te suivent déjà', 'Remplacer ta pub', 'Publier de longs textes'], ok: 0, why: 'La story parle au quotidien à ta communauté : coulisses, sondages, rappels.' },
        ],
        todo: [
          'Choisis un produit et note une idée de reel, de carrousel, de story et de live',
          'Publie 3 stories aujourd’hui : une coulisse, un sondage, un rappel de ton WhatsApp',
          'Prépare le plan d’un carrousel de 5 slides qui explique un point de ta niche',
          'Fixe la date d’un premier live de 10 minutes et liste les produits à montrer',
          'Coche la leçon et passe le quiz',
        ],
      },
      {
        id: 'm11-l4',
        n: 4,
        title: 'La vidéographie simple : tourner en série',
        ar: 'تصوير بسيط: سلسلة محتويات في جلسة واحدة',
        scenes: [
          { type: 'title', sub: 'Une séance, une semaine de contenus', say: 'Filmer un contenu par jour, c’est épuisant. La solution des créateurs : tourner une série de contenus en une seule séance.' },
          {
            type: 'steps',
            title: 'Le *batching* en 4 temps',
            items: [
              { k: '1', label: 'Écris 5 à 7 idées', sub: 'Avec la liste de plans de chacune', c: 'gold' },
              { k: '2', label: 'Prépare le décor', sub: 'Lumière, produits, tenues', c: 'body' },
              { k: '3', label: 'Filme par lieu', sub: 'Tout ce qui se tourne au même endroit', c: 'hook' },
              { k: '4', label: 'Range tes rushes', sub: 'Un dossier par contenu', c: 'cta' },
            ],
            say: 'Le batching en quatre temps. Écris tes idées avec leur liste de plans. Prépare la lumière, les produits, les tenues. Filme d’un coup tout ce qui se tourne au même endroit. Puis range tes rushes, un dossier par contenu.',
          },
          {
            type: 'cards',
            title: 'Les *b-roll*',
            items: [
              { icon: 'move', label: 'Les mains', sub: 'Ouvrir, appliquer, emballer', c: 'body' },
              { icon: 'zoom', label: 'Les détails', sub: 'Texture, bouchon, étiquette', c: 'gold' },
              { icon: 'home', label: 'L’ambiance', sub: 'Le décor, la lumière, les colis', c: 'hook' },
            ],
            say: 'Pendant la séance, filme aussi des b-roll, des plans de coupe : les mains qui ouvrent ou appliquent, les détails en gros plan, l’ambiance et les colis. Ils serviront dans tous tes contenus.',
          },
          {
            type: 'big',
            kicker: 'Ta signature',
            text: 'Un *plan signature* : on te reconnaît en *une seconde*.',
            sub: 'Toujours le même geste, le même décor ou le même cadrage',
            say: 'Crée aussi un plan signature : un geste, un décor ou un cadrage que tu répètes dans chaque vidéo. Le flacon posé sur ton plateau, la boîte que tu ouvres. On te reconnaît tout de suite.',
          },
          {
            type: 'checklist',
            title: 'Avant de *ranger le téléphone*',
            items: ['Chaque idée a *tous* ses plans', 'Des b-roll *en plus*', 'Le plan signature filmé *plusieurs fois*', 'Les rushes *nommés* : date-idée-plan'],
            say: 'Avant de ranger le téléphone : chaque idée a tous ses plans, tu as des b-roll en plus, ton plan signature est filmé plusieurs fois, et tes rushes sont nommés pour les retrouver.',
          },
          { type: 'outro', say: 'Leçon suivante : le calendrier de contenu et le recyclage d’une pub.' },
        ],
        key: [
          'Le batching : écrire 5 à 7 idées avec leurs plans, préparer le décor, filmer par lieu, ranger les rushes par contenu.',
          'Les b-roll (mains, détails, ambiance, colis) servent dans tous tes contenus.',
          'Un plan signature répété (geste, décor ou cadrage) rend ta page reconnaissable.',
        ],
        quiz: [
          { q: 'Pourquoi filmer par lieu pendant une séance ?', a: ['Pour ne pas réinstaller la lumière et le décor à chaque contenu', 'Parce que c’est obligatoire', 'Pour faire des vidéos plus longues'], ok: 0, why: 'Tu installes une fois, tu filmes tout ce qui se tourne là : tu gagnes du temps.' },
          { q: 'Un b-roll, c’est…', a: ['Un plan de coupe : mains, détails, ambiance', 'La musique de fond', 'La carte CTA'], ok: 0, why: 'Ces plans couvrent les coupes et rythment le montage.' },
        ],
        todo: [
          'Écris 5 idées de contenus, avec la liste de plans de chacune',
          'Bloque un créneau de 2 heures, en journée, pour ta séance',
          'Pendant la séance, filme au moins 10 b-roll : mains, détails, ambiance, colis',
          'Choisis ton plan signature et filme-le 3 fois',
          'Range tes rushes dans un dossier par contenu, puis coche la leçon',
        ],
        res: [
          {
            title: 'Plan de séance (batching)',
            text: 'Date : [  ] · Lieu : [près d’une fenêtre, en journée] · Durée prévue : [  ]\nÀ préparer : [produits] · [tenues] · [accessoires] · téléphone chargé, objectif nettoyé, trépied\n\nContenu 1 : [idée] · pilier : [éduquer / divertir / prouver / vendre]\n  Plans : [1] [2] [3] [4]\nContenu 2 : [idée] · pilier : [  ]\n  Plans : [  ]\nContenu 3 : [idée] · pilier : [  ]\n  Plans : [  ]\n(… jusqu’à 7 contenus)\n\nB-roll : mains (ouvrir, appliquer, emballer) · détails (texture, bouchon, étiquette) · ambiance · colis\nPlan signature : [geste / décor / cadrage] · filmé 3 fois\nNom des rushes : date-idée-plan (ex. 2026-10-20-parfum-plan2)',
          },
        ],
      },
      {
        id: 'm11-l5',
        n: 5,
        title: 'Le calendrier de contenu et le recyclage d’une pub',
        ar: 'رزنامة المحتوى وإعادة تدوير الإعلان',
        scenes: [
          { type: 'title', sub: 'Publier régulièrement, sans t’épuiser', say: 'Dernière pièce : un calendrier pour publier régulièrement, et une méthode pour tirer cinq contenus d’une seule pub.' },
          {
            type: 'stat',
            value: '3',
            label: 'publications par semaine, *tenues* : un exemple de rythme de départ',
            sub: 'Un rythme modeste et régulier vaut mieux qu’un rythme intenable',
            say: 'Commence par un rythme que tu peux tenir, par exemple trois publications par semaine. Un rythme modeste mais régulier vaut mieux qu’une semaine de folie suivie d’un mois de silence.',
          },
          {
            type: 'steps',
            title: 'Une *semaine type*',
            items: [
              { k: 'Dim', label: 'Éduquer', sub: 'Un carrousel conseil', c: 'ia' },
              { k: 'Mar', label: 'Prouver ou divertir', sub: 'Un reel démo, coulisses ou tendance', c: 'body' },
              { k: 'Jeu', label: 'Vendre', sub: 'Un reel avec l’offre', c: 'cta' },
              { k: '+', label: 'Stories', sub: 'Chaque jour, quelques minutes', c: 'gold' },
            ],
            say: 'Une semaine type : dimanche, un carrousel conseil. Mardi, un reel de preuve ou de divertissement. Jeudi, un reel qui vend. Et des stories chaque jour : quelques minutes suffisent.',
          },
          {
            type: 'checklist',
            title: 'Une pub, *5 contenus*',
            items: ['Un *reel* : la pub, avec une fin moins vendeuse', 'Un *carrousel* : les images clés et le script', 'Des *stories* : les coulisses du tournage', 'Une *réponse vidéo* à un vrai commentaire', 'Un *visuel* : la meilleure image et une astuce'],
            say: 'Une pub, cinq contenus. Un reel : la pub, avec une fin moins vendeuse. Un carrousel avec les images clés et le script. Des stories des coulisses. Une réponse vidéo à un vrai commentaire. Et un visuel avec une astuce.',
          },
          {
            type: 'quote',
            text: 'Tu n’as pas besoin de *nouvelles idées* chaque jour. Tu as besoin d’un *système*.',
            say: 'Retiens : tu n’as pas besoin de nouvelles idées chaque jour. Avec tes piliers, une séance de tournage et ce calendrier, tu as un système.',
          },
          { type: 'outro', say: 'Leçon suivante : le brief du projet final.' },
        ],
        key: [
          'Un rythme que tu tiens (par exemple 3 publications par semaine) vaut mieux qu’un rythme intenable.',
          'Une semaine type : un contenu pour éduquer, un pour prouver ou divertir, un pour vendre, et des stories chaque jour.',
          'Une pub se recycle en 5 contenus : reel, carrousel, stories des coulisses, réponse vidéo à un commentaire, visuel avec une astuce.',
        ],
        quiz: [
          { q: 'Quel rythme choisir pour commencer ?', a: ['Le plus élevé possible, quitte à arrêter', 'Un rythme modeste, tenu chaque semaine', 'Seulement quand tu as le temps'], ok: 1, why: 'La régularité compte plus que le volume d’une seule semaine.' },
          { q: 'Un commentaire sous ta pub pose une bonne question. Tu…', a: ['L’ignores', 'Y réponds en vidéo : c’est un nouveau contenu', 'Le supprimes'], ok: 1, why: 'La vraie question d’un client fait un contenu utile, qui répond aussi aux autres.' },
        ],
        todo: [
          'Choisis ton rythme de publication et écris-le en haut de ton calendrier',
          'Remplis le calendrier de la semaine prochaine, avec au moins un contenu par pilier',
          'Prends ta dernière pub et liste les 5 contenus que tu peux en tirer',
          'Prépare ou programme les 2 premiers contenus de la semaine',
          'Coche la leçon et passe le quiz',
        ],
        res: [
          {
            title: 'Calendrier de contenu (une semaine)',
            text: 'Semaine du [date] · Rythme : [ex. 3 publications + stories chaque jour]\n\nDIMANCHE : [format] · pilier : [éduquer / divertir / prouver / vendre] · sujet : [  ] · accroche : [  ] · statut : [idée / filmé / monté / publié]\nLUNDI : stories · [coulisses / sondage / rappel du WhatsApp]\nMARDI : [format] · pilier : [  ] · sujet : [  ] · accroche : [  ] · statut : [  ]\nMERCREDI : stories · [  ]\nJEUDI : [format] · pilier : [  ] · sujet : [  ] · accroche : [  ] · statut : [  ]\nVENDREDI : stories · [  ]\nSAMEDI : bilan · [ce qui a le plus fait réagir : commentaires, partages, enregistrements, messages]\n\nRECYCLAGE DE LA PUB : [nom de la pub]\n1. Reel : [la pub, avec une fin moins vendeuse]\n2. Carrousel : [images clés + script]\n3. Stories : [coulisses du tournage]\n4. Réponse vidéo : [commentaire choisi]\n5. Visuel : [meilleure image + astuce]',
          },
        ],
      },
    ],
  },

  {
    id: 'm12',
    n: 12,
    part: 'p1',
    title: 'Projet final : ta pub de 30 secondes',
    ar: 'المشروع النهائي: إعلانك في 30 ثانية',
    color: '#e0be55',
    icon: 'trophy',
    pitch: 'Une pub complète de 30 secondes maximum, pour un vrai produit, avec tes propres images : relue par l’équipe, elle ouvre ton certificat.',
    lessons: [
      {
        id: 'm12-l1',
        n: 1,
        title: 'Le brief du projet final',
        ar: 'موجز المشروع النهائي',
        scenes: [
          { type: 'title', sub: 'Une pub complète, de A à Z', say: 'C’est l’heure du projet final. Voici exactement ce que tu dois produire, étape par étape, pour obtenir ton certificat.' },
          {
            type: 'stat',
            value: '30',
            suffix: 's',
            label: 'maximum, carte CTA comprise',
            sub: 'Un vrai produit · tes images · ta voix',
            say: 'Ton projet : une seule pub complète, trente secondes maximum, carte CTA comprise, pour un vrai produit. Pas un exercice de plus : la preuve que tu sais faire une pub de A à Z.',
          },
          {
            type: 'steps',
            title: 'Phase 1 : *préparer*',
            items: [
              { k: '1', label: 'Choisis un vrai produit', sub: 'Que tu peux filmer toi-même', c: 'gold' },
              { k: '2', label: 'Décortique une pub gagnante', sub: 'De ta niche, avec ta fiche d’analyse', c: 'hook' },
              { k: '3', label: 'Coupe sa bande-son', sub: 'Dans CapCut : elle te sert de guide', c: 'body' },
              { k: '4', label: 'Sépare ses scènes', sub: 'Plan par plan, avec leur durée', c: 'cta' },
            ],
            say: 'Phase un, préparer. Choisis un vrai produit, que tu peux filmer. Décortique une pub gagnante de ta niche. Importe-la dans CapCut, coupe son son, et sépare ses scènes : c’est ton guide de rythme.',
          },
          {
            type: 'steps',
            title: 'Phase 2 : *produire*',
            items: [
              { k: '5', label: 'Écris et enregistre ta voix off', sub: 'Hook, body, CTA, chronométrés', c: 'gold' },
              { k: '6', label: 'Filme tes plans', sub: 'Calqués sur les scènes du guide', c: 'hook' },
              { k: '7', label: 'Monte sur la voix off', sub: 'Dans CapCut, chaque plan synchronisé', c: 'body' },
              { k: '8', label: 'Sous-titres et carte CTA', sub: 'Relus, puis la carte Canva à la fin', c: 'cta' },
            ],
            say: 'Phase deux, produire. Écris ton script et enregistre ta voix off. Filme tes plans. Monte-les sur la voix dans CapCut, chaque plan calé sur sa phrase. Ajoute les sous-titres, puis ta carte CTA Canva à la fin.',
          },
          {
            type: 'checklist',
            title: 'Phase 3 : *finaliser*',
            items: ['*3 hooks* montés : garde le meilleur', 'Durée : *30 secondes* maximum', 'La vidéo guide *supprimée* avant l’export', { t: 'Des plans ou la musique de la pub de référence', bad: true }],
            say: 'Phase trois, finaliser. Monte trois versions du hook et garde celle qui accroche le mieux. Vérifie la durée. Et supprime la vidéo guide avant l’export : dans ta pub, uniquement tes images et ta voix.',
          },
          { type: 'outro', say: 'Leçon suivante : rendre ton projet et obtenir ton certificat.' },
        ],
        key: [
          'Le projet : une pub complète de 30 secondes maximum, carte CTA comprise, pour un vrai produit, avec uniquement tes images et ta voix.',
          'Préparer : un vrai produit, une pub gagnante de ta niche décortiquée, importée dans CapCut sans son et séparée scène par scène comme guide de rythme.',
          'Produire puis finaliser : voix off, plans filmés, montage synchronisé, sous-titres relus, carte CTA Canva, 3 hooks pour garder le meilleur, guide supprimé, durée vérifiée.',
        ],
        quiz: [
          { q: 'Que fais-tu de la pub de référence dans ton projet ?', a: ['Tu reprends ses plans et sa musique', 'Tu t’en sers comme guide de rythme, sans son, puis tu la supprimes avant l’export', 'Tu la mets en entier au début'], ok: 1, why: 'Elle t’aide à caler ton rythme ; ta pub finale n’utilise que tes images et ta voix.' },
          { q: 'Quelle est la durée maximale du projet ?', a: ['15 secondes', '30 secondes, carte CTA comprise', '60 secondes'], ok: 1, why: 'Trente secondes obligent à garder l’essentiel : hook, body, CTA.' },
        ],
        todo: [
          'Choisis un vrai produit et décortique une pub gagnante de sa niche avec ta fiche d’analyse',
          'Importe la pub de référence dans CapCut, coupe son son et sépare ses scènes',
          'Écris ton script, enregistre ta voix off et filme tes plans',
          'Monte tes plans sur la voix off, synchronise-les et ajoute les sous-titres',
          'Ajoute ta carte CTA Canva à la fin, puis monte 3 hooks et garde le meilleur',
          'Supprime la vidéo guide et vérifie que ta pub dure 30 secondes maximum',
        ],
        res: [
          {
            title: 'Check-list du projet final',
            text: 'PROJET FINAL · Formation Créative\nProduit : [nom] · Niche : [  ] · Cible : [  ]\n\nPRÉPARER\n☐ Un vrai produit, que je peux filmer moi-même\n☐ Une pub gagnante de ma niche, décortiquée (hook, durée, format, angle, offre, CTA)\n☐ La pub de référence importée dans CapCut, son coupé\n☐ Ses scènes séparées, avec leur durée : mon guide de rythme\n\nPRODUIRE\n☐ Script Hook / Body / CTA écrit, lu à voix haute, chronométré\n☐ Voix off enregistrée (3 prises, la meilleure gardée, réduction de bruit)\n☐ Mes plans filmés, calqués sur les scènes du guide\n☐ Plans montés sur la voix off et synchronisés dans CapCut\n☐ Sous-titres ajoutés et relus ligne par ligne\n☐ Carte CTA créée dans Canva (1080 × 1920) et ajoutée à la fin\n\nFINALISER\n☐ 3 versions du hook montées, la meilleure gardée\n☐ Vidéo guide supprimée : uniquement mes images, ma voix et une musique que j’ai le droit d’utiliser\n☐ Durée : 30 secondes maximum, carte CTA comprise\n☐ Vérifiée sur téléphone, avec et sans le son\n☐ Aucune promesse, aucun avis, aucune offre inventés',
          },
        ],
      },
      {
        id: 'm12-l2',
        n: 2,
        title: 'Rendre ton projet et obtenir ton certificat',
        ar: 'تسليم المشروع والحصول على الشهادة',
        scenes: [
          { type: 'title', sub: 'Exporter, envoyer, recevoir ton retour', say: 'Ta pub est prête ? Dernière étape : l’exporter correctement, l’envoyer à l’équipe, puis recevoir ton retour et ton certificat.' },
          {
            type: 'cards',
            title: 'L’*export* et l’*envoi*',
            items: [
              { icon: 'frame', label: '9:16 · 1080 × 1920', sub: 'Vertical, en haute définition', c: 'gold' },
              { icon: 'doc', label: 'Un nom clair', sub: 'prenom-produit-projet-final', c: 'body' },
              { icon: 'whatsapp', label: 'L’envoi', sub: 'Sur WhatsApp, ou par le lien de l’équipe', c: 'cta' },
            ],
            say: 'Exporte en vertical 9:16, en 1080 par 1920. Nomme ton fichier clairement : ton prénom, le produit, projet final. Puis envoie-le à l’équipe, sur WhatsApp ou par le lien qu’elle te donne.',
          },
          {
            type: 'steps',
            title: 'La *grille* de l’équipe',
            items: [
              { k: '1', label: 'Le hook', sub: 'Il arrête le scroll dès la 1ʳᵉ seconde', c: 'hook' },
              { k: '2', label: 'La clarté', sub: 'On comprend le produit et l’offre', c: 'body' },
              { k: '3', label: 'Le rythme et le son', sub: 'Aucun temps mort, une voix claire', c: 'gold' },
              { k: '4', label: 'Les sous-titres', sub: 'Lisibles, relus, dans la zone sûre', c: 'ia' },
              { k: '5', label: 'Le CTA et la durée', sub: 'Une action claire, 30 s maximum', c: 'cta' },
            ],
            say: 'L’équipe relit ta pub avec une grille. Le hook arrête-t-il le scroll ? Comprend-on le produit et l’offre ? Le rythme et le son sont-ils bons ? Les sous-titres, lisibles ? Le CTA est-il clair, et la durée respectée ?',
          },
          {
            type: 'flow',
            title: 'Après l’envoi',
            nodes: [
              { icon: 'eye', label: 'Relecture', sub: 'Avec la grille', c: 'gold' },
              { icon: 'message', label: 'Ton retour', sub: 'Ce qui marche, ce qui est à reprendre', c: 'body' },
              { icon: 'trophy', label: 'Ton certificat', sub: 'Une fois le projet validé', c: 'cta' },
            ],
            say: 'L’équipe relit ton projet et t’envoie un retour : ce qui marche, et ce qui est à reprendre. Si une correction est demandée, envoie une nouvelle version. Une fois le projet validé, ton certificat t’attend dans ton profil.',
          },
          {
            type: 'quote',
            text: 'Un retour, ce n’est pas une note. C’est *ta prochaine pub*, en mieux.',
            say: 'Prends chaque retour comme un cadeau : c’est ta prochaine pub, en mieux. Et garde cette pub précieusement : c’est la première pièce de ton portfolio.',
          },
          {
            type: 'outro',
            text: 'Bravo : tu sais faire une pub *de A à Z*.',
            say: 'Félicitations, tu as terminé la Formation Créative ! Tu sais trouver ce qui marche, écrire, filmer, monter et vendre. Maintenant : publie, teste, et recommence.',
          },
        ],
        key: [
          'Export : vertical 9:16, 1080 × 1920, un nom clair (prenom-produit-projet-final), envoyé sur WhatsApp ou par le lien donné par l’équipe.',
          'La grille de relecture : hook, clarté, rythme, son, sous-titres, CTA, durée.',
          'Un retour de l’équipe, une nouvelle version si besoin, puis le certificat dans ton profil une fois le projet validé. Ta pub rejoint ton portfolio.',
        ],
        quiz: [
          { q: 'Quel format d’export pour ton projet ?', a: ['1920 × 1080, horizontal', '1080 × 1920, vertical 9:16', 'Peu importe'], ok: 1, why: 'C’est le format des Reels, de TikTok et des stories, celui de toute la formation.' },
          { q: 'L’équipe te demande une correction. Tu…', a: ['Abandonnes', 'Corriges et renvoies une nouvelle version', 'Envoies une autre pub au hasard'], ok: 1, why: 'Chaque retour rend ta pub meilleure ; le certificat récompense un projet validé.' },
        ],
        todo: [
          'Exporte ta pub en vertical 9:16, en 1080 × 1920',
          'Nomme ton fichier : prenom-produit-projet-final',
          'Relis-la avec la grille : hook, clarté, rythme, son, sous-titres, CTA, durée',
          'Envoie-la à l’équipe sur WhatsApp, ou par le lien donné',
          'Note le retour reçu, corrige si besoin, puis coche la leçon',
        ],
        res: [
          {
            title: 'Grille de relecture du projet',
            text: 'Projet : [prénom]-[produit]-projet-final · Durée : [  ] s\n\n☐ HOOK : arrête le scroll dès la 1ʳᵉ seconde (image, texte, son)\n☐ CLARTÉ : on comprend le produit, pour qui, et l’offre\n☐ RYTHME : un changement à l’écran toutes les 2 à 3 secondes, aucun temps mort\n☐ SON : voix claire, sans écho ni bruit, musique sous la voix\n☐ SOUS-TITRES : lisibles, relus, 2 lignes maximum, dans la zone sûre\n☐ CTA : une seule action, écrite et dite, carte CTA à la fin\n☐ DURÉE : 30 secondes maximum, carte CTA comprise\n☐ HONNÊTETÉ : uniquement mes images, aucune promesse ni offre inventée\n\nExport : 9:16 · 1080 × 1920 · MP4\nEnvoi : sur le WhatsApp de l’équipe, ou par le lien donné par l’équipe',
          },
        ],
      },
    ],
  },
];

export const MODULES = [...MODULES_1, ...MODULES_IA];

/* ------------------------------------------------------------------ */
/* Parcours et numérotation                                            */
/* ------------------------------------------------------------------ */

const PART_TRACK = Object.fromEntries(PARTS.map((p) => [p.id, p.track]));
MODULES.forEach((m) => {
  m.track = PART_TRACK[m.part] || 'creative';
});

/** Code affiché d'un module : M01…M05 pour la formation Créative, IA01…IA09 pour la formation IA. */
export const modCode = (m) => `${m.track === 'ia' ? 'IA' : 'M'}${String(m.n).padStart(2, '0')}`;
export const trackOf = (idOrModule) => TRACKS.find((t) => t.id === (typeof idOrModule === 'string' ? idOrModule : idOrModule?.track)) || TRACKS[0];
export const modulesOf = (track) => MODULES.filter((m) => m.track === track);
/** Modules du programme sans la bienvenue (module 00) : pour les comptes, les plages M01–M06, la landing. */
export const coreModulesOf = (track) => modulesOf(track).filter((m) => !m.intro);

/* ------------------------------------------------------------------ */
/* Traduction : la surcouche de la langue choisie (data/i18n/<langue>/) */
/* ------------------------------------------------------------------ */

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
/** Fusionne une traduction dans l'original : seuls les textes changent, la structure et les temps restent. */
function merge(base, ov) {
  if (ov == null) return base;
  if (Array.isArray(base)) return Array.isArray(ov) ? base.map((b, i) => (i < ov.length ? merge(b, ov[i]) : b)) : base;
  if (isObj(base)) {
    if (!isObj(ov)) return base;
    const out = { ...base };
    for (const k of Object.keys(ov)) out[k] = k in base ? merge(base[k], ov[k]) : typeof ov[k] === 'string' ? ov[k] : out[k];
    return out;
  }
  if (typeof base === 'string') return typeof ov === 'string' && ov.trim() ? ov : base;
  return base;
}

if (OVERLAY) {
  const O = OVERLAY;
  TRACKS.forEach((t, i) => (TRACKS[i] = merge(t, O.tracks?.[t.id])));
  PARTS.forEach((p, i) => (PARTS[i] = merge(p, O.parts?.[p.id])));
  MODULES.forEach((m) => {
    const mo = O.modules?.[m.id];
    if (mo) for (const k of ['title', 'pitch']) if (typeof mo[k] === 'string' && mo[k].trim()) m[k] = mo[k];
    m.lessons = m.lessons.map((l) => merge(l, O.lessons?.[l.id]));
  });
}

/* ------------------------------------------------------------------ */

let _all;
export function allLessons() {
  if (_all) return _all;
  _all = [];
  MODULES.forEach((m) => m.lessons.forEach((l) => _all.push({ ...l, module: m })));
  return _all;
}

/** Une leçon, son module, et ses voisines DANS LA MÊME FORMATION (on ne passe pas de la Créative à l'IA sans le savoir). */
export function findLesson(id) {
  const list = allLessons();
  const i = list.findIndex((l) => l.id === id);
  if (i < 0) return null;
  const L = list[i];
  const same = (x) => (x && x.module.track === L.module.track ? x : null);
  return { lesson: L, module: L.module, track: trackOf(L.module), prev: same(list[i - 1]), next: same(list[i + 1]), index: i };
}

export const lessonsOf = (track) => allLessons().filter((l) => l.module.track === track);
export const totalLessons = (track) => (track ? lessonsOf(track).length : allLessons().length);
