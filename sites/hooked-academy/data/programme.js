// Programme Hooked Academy — modules, leçons, scènes animées, quiz et exercices.
// Les leçons « voix enregistrée » ont des scènes calées au dixième de seconde sur la voix off montée.
// Les autres ont leur texte « à dire » (say) : le studio de l'équipe l'affiche en prompteur pendant
// que l'animation tourne, pour enregistrer la voix off en darija parfaitement synchronisée.

import { MODULES_IA } from './programme-ia.js';
import { OVERLAY } from './i18n/index.js';

/**
 * Deux formations distinctes :
 *  - « creative » : bienvenue M00 (m0), puis modules M01 à M06, les bases, sans IA ;
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
          { type: 'outro', text: 'On commence ?', say: 'يلا، نبداو! أول درس: واش هي الكرياتيف؟' },
        ],
        key: ['L’objectif : des pubs qui arrêtent le scroll et qui vendent.', 'Le parcours : comprendre, produire, puis bâtir ta marque.', 'Une leçon par jour, l’exercice à chaque fois, le quiz avant d’avancer.'],
        quiz: [{ q: 'Quelle est la meilleure façon d’avancer dans la formation ?', a: ['Tout regarder en une soirée', 'Une leçon par jour, avec l’exercice et le quiz', 'Sauter les exercices'], ok: 1, why: 'La régularité et la pratique font la différence.' }],
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
          { type: 'outro', say: 'Fin de la première partie. Place à l’IA créative !' },
        ],
        key: ['Vidéo : 1080 × 1920, 30 images/s, MP4 (H.264).', 'Images : 1080 × 1920, 1080 × 1350 ou 1080 × 1080 selon le format.', 'Toujours vérifier sur téléphone, sans le son, et nommer ses versions.'],
        quiz: [{ q: 'Quelle résolution pour une vidéo verticale ?', a: ['1080 × 1920', '640 × 480', '1920 × 1080'], ok: 0, why: '1080 de large, 1920 de haut : vertical HD.' }],
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
