// Vidéos filmées à l'écran par le formateur (voix off en darija) : visite de la plateforme
// (les formations) et pratique pas à pas (Formation Créative).
// Une entrée sans vidéo (video: '') est une place réservée : la leçon existe, le lecteur affiche
// « Vidéo bientôt disponible ». Pour la publier : déposer le MP4 dans video/, remplir `video` et `d` (secondes).
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
  // Formation Sites & Apps : les trois vidéos de présentation de la plateforme (places réservées, à tourner).
  devPlateforme: {
    video: '',
    d: 0,
    title: 'Présentation de la plateforme Hooked Academy',
    ar: 'تقديم منصة Hooked Academy',
    sub: 'Ton espace, tes formations, ta progression et l’aide Claude',
    key: [
      'Ton espace élève réunit tes formations, ta progression et tes ressources.',
      'L’aide Claude répond à tes questions sur chaque leçon, à toute heure.',
      'Ta progression est enregistrée : tu reprends toujours là où tu t’es arrêté.',
    ],
    quiz: [
      {
        q: 'Où reprends-tu ta formation après une pause ?',
        a: ['Au tout début, à chaque fois', 'Là où tu t’es arrêté : ta progression est enregistrée', 'Il faut recréer un compte'],
        ok: 1,
        why: 'La plateforme garde ta progression et te ramène à ta dernière leçon.',
      },
    ],
    todo: [
      'Ouvre ton espace et repère tes formations',
      'Pose une première question à l’aide Claude',
      'Installe la plateforme sur ton téléphone pour suivre les leçons partout',
    ],
  },
  devFormation: {
    video: '',
    d: 0,
    title: 'Visite de la Formation Sites & Apps',
    ar: 'جولة في تكوين المواقع والتطبيقات',
    sub: 'Les modules, la leçon vidéo, les prompts à copier, l’exercice et le quiz',
    key: [
      'La formation est découpée en modules, et chaque module en courtes leçons vidéo.',
      'Sous chaque vidéo : l’essentiel, des cartes mémo, l’exercice et les prompts prêts à copier pour ton agent.',
      'Les leçons « Pratique » se font en même temps que la vidéo, sur ton fil rouge.',
    ],
    quiz: [
      {
        q: 'Que fais-tu des prompts donnés sous une leçon ?',
        a: ['Rien, ils sont décoratifs', 'Je les copie, je complète les crochets et je les envoie à mon agent', 'Je les apprends par cœur'],
        ok: 1,
        why: 'Chaque prompt est prêt à l’emploi : tu complètes les crochets avec ton projet et tu l’envoies à Claude Code ou Codex.',
      },
    ],
    todo: [
      'Ouvre la formation et parcours la liste des modules',
      'Repère une leçon « Pratique » et ses prompts à copier',
      'Choisis le commerce qui sera ton fil rouge',
    ],
  },
  devProjet: {
    video: '',
    d: 0,
    title: 'Le projet final et ton certificat',
    ar: 'المشروع النهائي والشهادة',
    sub: 'Trois projets en ligne, le rendu, le retour de l’équipe et ton certificat',
    key: [
      'Le projet final : un site vitrine, une application et une démo, tous en ligne.',
      'Tu rends les liens de tes projets ; l’équipe les analyse et te fait un retour.',
      'Ton certificat vient après la validation du projet final.',
    ],
    quiz: [
      {
        q: 'Comment obtiens-tu ton certificat ?',
        a: ['En regardant les vidéos', 'En rendant ton projet final, analysé par l’équipe', 'En payant un supplément'],
        ok: 1,
        why: 'Le certificat vient après le projet final : l’équipe l’analyse et te fait un retour.',
      },
    ],
    todo: [
      'Lis le brief du projet final dans le dernier module',
      'Note le commerce de ton fil rouge et ce que tu veux lui construire',
      'Garde tes meilleurs exercices : ils serviront pour le projet final',
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
    ...(v.video ? { video: v.video, voice: true } : { soon: true }),
    screen: true,
    scenes: [{ type: 'title', sub: v.sub, d: v.d || 60 }],
    key: [...v.key],
    quiz: v.quiz.map((q) => ({ ...q, a: [...q.a] })),
    todo: [...v.todo],
  };
}
