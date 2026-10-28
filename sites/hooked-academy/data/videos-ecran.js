// Vidéos filmées à l'écran par le formateur (voix off en darija) : visite de la plateforme
// (les deux formations) et pratique pas à pas (Formation Créative).
// Le lecteur montre le MP4 dans toutes les langues (screen: true) ; la scène unique porte la durée
// du MP4, pour la carte de la leçon et la progression.

const VIDEOS = {
  formations: {
    video: 'video/visite-formations.mp4',
    d: 138.2,
    title: 'Visite de la plateforme : les formations',
    ar: 'جولة في المنصة: التكوينات',
    sub: 'Les modules, la leçon vidéo, l’essentiel, les cartes mémo, l’exercice et le quiz',
    key: [
      'Chaque formation est découpée en modules, et chaque module en courtes leçons vidéo.',
      'Sous chaque vidéo : l’essentiel à retenir et des cartes mémo pour réviser en quelques secondes.',
      'Chaque leçon se termine par un exercice sur ton produit et un quiz, avec l’explication de chaque réponse.',
    ],
    quiz: [
      {
        q: 'Que trouves-tu sous la vidéo d’une leçon ?',
        a: ['Rien, seulement la vidéo', 'L’essentiel, des cartes mémo, un exercice et un quiz', 'Une publicité'],
        ok: 1,
        why: 'Chaque leçon combine la vidéo, l’essentiel à retenir, des cartes mémo, un exercice et un quiz.',
      },
    ],
    todo: [
      'Ouvre ta formation et repère le module où tu en es',
      'Lance une leçon et lis l’essentiel sous la vidéo',
      'Retourne une carte mémo après avoir répondu de tête',
      'Fais l’exercice de la leçon, puis réussis son quiz',
    ],
  },
  projet: {
    video: 'video/visite-projet-final.mp4',
    d: 90.2,
    title: 'Visite de la plateforme : le projet final et le certificat',
    ar: 'المشروع النهائي والشهادة',
    sub: 'Le brief du projet final, le rendu, le retour de l’équipe et ton certificat',
    key: [
      'À la fin de la formation, le projet final met en pratique tout ce que tu as appris.',
      'Le brief du projet final explique ce qu’il faut produire et comment le rendre.',
      'L’équipe analyse ton projet et te fait un retour ; ton certificat vient ensuite.',
    ],
    quiz: [
      {
        q: 'Comment obtiens-tu ton certificat ?',
        a: ['En regardant une seule vidéo', 'En rendant ton projet final, analysé par l’équipe', 'En sautant les exercices'],
        ok: 1,
        why: 'Le certificat vient après le projet final : l’équipe l’analyse et te fait un retour.',
      },
    ],
    todo: [
      'Ouvre le dernier module de ta formation et lis le brief du projet final',
      'Note dès maintenant le produit que tu utiliseras pour ton projet',
      'Garde tes meilleurs exercices : ils serviront pour le projet final',
    ],
  },
  produit: {
    video: 'video/pratique-produit-videos.mp4',
    d: 145.3,
    title: 'Pratique : trouver le produit et ses vidéos',
    ar: 'تطبيق: نلقاو المنتج والفيديوهات تاعو',
    sub: 'Recherche par image sur AliExpress, vidéos du produit sur TikTok, téléchargement avec SnapTik',
    key: [
      'Pars d’une capture du produit : la recherche par image d’AliExpress retrouve le produit et son nom.',
      'Copie le nom du produit et cherche-le sur TikTok pour trouver les vidéos qui le montrent.',
      'Copie le lien de chaque vidéo choisie et télécharge-la avec SnapTik.',
    ],
    quiz: [
      {
        q: 'À quoi sert la recherche par image sur AliExpress ?',
        a: ['À retrouver le produit et son nom à partir d’une capture', 'À publier la pub', 'À monter la vidéo'],
        ok: 0,
        why: 'Avec une simple capture, AliExpress retrouve le produit : tu récupères son nom pour chercher ses vidéos sur TikTok.',
      },
    ],
    todo: [
      'Fais une capture de ton produit et lance une recherche par image sur AliExpress',
      'Copie le nom du produit',
      'Cherche ce nom sur TikTok et choisis 5 vidéos qui montrent bien le produit',
      'Télécharge-les avec SnapTik et range-les dans un dossier',
    ],
  },
  capcut: {
    video: 'video/pratique-capcut.mp4',
    d: 130.1,
    title: 'Pratique : installer CapCut et importer tes vidéos',
    ar: 'تطبيق: نسطاليو CapCut ونحطو الفيديوهات',
    sub: 'CapCut pour PC, un nouveau projet et l’import des vidéos téléchargées',
    key: [
      'Télécharge CapCut sur capcut.com et choisis la version PC : elle offre plus d’options pour le montage.',
      'Depuis l’accueil de CapCut, crée un nouveau projet.',
      'Importe les vidéos téléchargées : le montage commence dans la vidéo suivante.',
    ],
    quiz: [
      {
        q: 'Quelle version de CapCut est conseillée pour monter ?',
        a: ['La version PC', 'Aucune : il faut un autre logiciel', 'Peu importe, elles sont identiques'],
        ok: 0,
        why: 'La version PC offre plus d’options pour le montage.',
      },
    ],
    todo: [
      'Télécharge CapCut pour PC sur capcut.com et installe-le',
      'Crée un nouveau projet',
      'Importe les vidéos téléchargées dans la leçon précédente',
    ],
  },
};

/** Leçon vidéo `nom` sous l'identifiant `id` (un objet neuf à chaque appel : chaque formation a le sien). */
export function leconEcran(nom, id, n) {
  const v = VIDEOS[nom];
  return {
    id,
    n,
    title: v.title,
    ar: v.ar,
    video: v.video,
    voice: true,
    screen: true,
    scenes: [{ type: 'title', sub: v.sub, d: v.d }],
    key: [...v.key],
    quiz: v.quiz.map((q) => ({ ...q, a: [...q.a] })),
    todo: [...v.todo],
  };
}
