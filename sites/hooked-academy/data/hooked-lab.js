// Hooked Lab n'est pas encore ouvert (novembre 2026) : la plateforme n'en parle nulle part pour l'instant.
// Rien n'est supprimé : les leçons, la FAQ et les pages gardent leurs textes d'origine dans leurs fichiers ;
// tant que LAB vaut false, les éléments qui citent Hooked Lab sont cachés (landing, /ia/, espace étudiant)
// et les passages des leçons et de la FAQ sont remplacés à l'affichage par MASQUE (français, anglais, arabe,
// darija du prompteur). Pour tout remettre : LAB = true, puis regénérer les fiches PDF des leçons
// (node tools/hooked-academy/fiches-lecons.mjs, voir sa notice).

export const LAB = false;

const RE = /hooked[\s-]?lab/i;
/** Le texte cite-t-il Hooked Lab ? */
export const citeLab = (s) => RE.test(String(s ?? ''));

/** Remplacements, du plus précis au plus général (chaque passage est remplacé tel quel, partout). */
export const MASQUE = [
  // Français : leçons
  ['Tu déposes une vidéo ou une image publicitaire. Hooked Lab reconstitue le script, découpe les séquences — hook, problème, solution, preuve, offre, CTA —, analyse les trois premières secondes, et sort les angles marketing.', 'Tu prends une vidéo ou une image publicitaire. Tu reconstitues le script, tu découpes les séquences — hook, problème, solution, preuve, offre, CTA —, tu analyses les trois premières secondes, et tu sors les angles marketing.'],
  [' Hooked Lab, l’application d’analyse de l’équipe, t’aide à les décortiquer.', ' Décortique chacune : hook, séquences, angle.'],
  ['Pour aller plus vite, Hooked Lab, l’application d’analyse de l’équipe, t’aide à décortiquer une pub.', 'Commence par décortiquer la pub : hook, séquences, angle.'],
  [' ; Hooked Lab aide à la décortiquer.', ' ; décortique-la : hook, séquences, angle.'],
  ['Tester et analyser avec Hooked Lab', 'Tester et analyser tes créatives'],
  [' et itérer avec Hooked Lab.', ' et itérer.'],
  ['nalyser une créative avec Hooked Lab', 'nalyser une créative qui marche'],
  ['Hooked Lab, c’est l’application qui décortique une créative pour toi.', 'Analyser une créative, c’est la décortiquer pièce par pièce.'],
  ['l’analyser avec Hooked Lab', 'la décortiquer'],
  ['Hooked Lab reconstitue le script, découpe les séquences, analyse le hook et les angles.', 'Analyser, c’est reconstituer le script, découper les séquences, juger le hook et les angles.'],
  ['Dépose-la dans Hooked Lab et lis tout le dossier d’analyse', 'Décortique-la : script, séquences, hook, angles'],
  ['Voici l’analyse Hooked Lab d’une pub', 'Voici l’analyse d’une pub'],
  ['Puis compare dans Hooked Lab', 'Puis compare les résultats'],
  ['Prépare le tableau de suivi dans Hooked Lab', 'Prépare ton tableau de suivi'],
  ['Analyse (Hooked Lab) →', 'Analyse →'],
  ['Analyse Hooked Lab', 'Analyse des créatives'],
  ['Hooked Lab, clients, projet final', 'Analyse, clients, projet final'],
  [' qui performent avec Hooked Lab', ' qui performent'],
  [' dans ta niche avec Hooked Lab', ' dans ta niche'],
  // Français : FAQ réservée aux membres
  ['analyse Hooked Lab, rapport mensuel', 'analyse des résultats, rapport mensuel'],
  [' de ta niche avec Hooked Lab', ' de ta niche'],
  ['Avec Hooked Lab', 'Hook, séquences, angle'],
  // Darija (texte du prompteur)
  ['تحلل بـ Hooked Lab، ', 'تحلل، '],
  ['ومن بعد قارن في Hooked Lab.', 'ومن بعد قارن النتائج.'],
  // Anglais
  ['Test and analyse with Hooked Lab', 'Test and analyse your creatives'],
  [' and iterate with Hooked Lab.', ' and iterate.'],
  ['Analysing a creative with Hooked Lab', 'Analysing a creative that works'],
  ['Hooked Lab rebuilds the script, splits it into sequences, and analyses the hook and the angles.', 'Analysing means rebuilding the script, splitting it into sequences, and judging the hook and the angles.'],
  ['Upload it to Hooked Lab and read the full analysis', 'Break it down: script, sequences, hook, angles'],
  ['Here is the Hooked Lab analysis of an ad', 'Here is the analysis of an ad'],
  ['Prepare the tracking table in Hooked Lab', 'Prepare your tracking table'],
  ['Analysis (Hooked Lab) →', 'Analysis →'],
  ['Hooked Lab analysis, monthly report', 'results analysis, monthly report'],
  ['Hooked Lab analysis', 'Creative analysis'],
  [' in your niche with Hooked Lab', ' in your niche'],
  [' from your niche with Hooked Lab', ' from your niche'],
  ['; Hooked Lab helps you break it down.', '; break it down: hook, sequences, angle.'],
  ['Hooked Lab, clients, final project', 'Analysis, clients, final project'],
  ['Then compare in Hooked Lab', 'Then compare the results'],
  ['With Hooked Lab', 'Hook, sequences, angle'],
  // Arabe
  ['الاختبار والتحليل مع Hooked Lab', 'اختبار الكرياتيف وتحليله'],
  ['التحليل مع Hooked Lab', 'الاختبار والتحليل'],
  ['مع Hooked Lab: قِس ما ينجح', 'قِس ما ينجح'],
  ['تحليل كرياتيف بواسطة Hooked Lab', 'تحليل كرياتيف ناجح'],
  ['يعيد Hooked Lab بناء السكريبت، ويقسّم المقاطع، ويحلّل الهوك والزوايا التسويقية.', 'التحليل هو إعادة بناء السكريبت، وتقسيم المقاطع، وتقييم الهوك والزوايا التسويقية.'],
  ['ارفعه إلى Hooked Lab، واقرأ ملف التحليل كاملًا', 'فكّكه: السكريبت، المقاطع، الهوك، الزوايا'],
  ['هذا تحليل Hooked Lab لإعلان', 'هذا تحليل لإعلان'],
  ['جهّز جدول المتابعة في Hooked Lab', 'جهّز جدول المتابعة الخاص بك'],
  ['تحليل عبر Hooked Lab', 'تحليل الكرياتيف'],
  ['التحليل (Hooked Lab) ←', 'التحليل ←'],
  [' بواسطة Hooked Lab', ''],
  ['؛ ويساعدك Hooked Lab على تحليله.', '؛ فكّكه: الهوك، المقاطع، الزاوية.'],
  ['تحليل بـ Hooked Lab، تقرير شهري', 'تحليل النتائج، تقرير شهري'],
  [' بـ Hooked Lab', ''],
  ['Hooked Lab، الزبائن، المشروع النهائي', 'التحليل، الزبائن، المشروع النهائي'],
  ['ثم قارن في Hooked Lab', 'ثم قارن النتائج'],
  ['مع Hooked Lab', 'الهوك، المقاطع، الزاوية'],
];

/** Le texte sans Hooked Lab (inchangé si LAB vaut true). */
export function sansLab(s) {
  if (LAB || typeof s !== 'string' || !citeLab(s)) return s;
  for (const [a, b] of MASQUE) if (s.includes(a)) s = s.split(a).join(b);
  return s;
}

/** Applique sansLab à toutes les chaînes d'un objet (sur place) ; renvoie l'objet. */
export function masquer(o, seen = new Set()) {
  if (LAB || !o || typeof o !== 'object' || seen.has(o)) return o;
  seen.add(o);
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (typeof v === 'string') o[k] = sansLab(v);
    else if (v && typeof v === 'object') masquer(v, seen);
  }
  return o;
}
