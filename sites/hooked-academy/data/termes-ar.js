// Vocabulaire arabe de Hooked Academy : « Créative » s'écrit كرياتيف, jamais إبداع ni إبداعي
// (« Formation Créative » = تكوين الكرياتيف). Les fichiers du site sont déjà écrits ainsi ; cette liste corrige
// aussi, à l'affichage, les textes gardés par le serveur (FAQ de l'équipe), écrits avant la règle.
export const TERMES_AR = [
  ['للتكوين الإبداعي', 'لتكوين الكرياتيف'],
  ['التكوين الإبداعي', 'تكوين الكرياتيف'],
  ['الذكاء الاصطناعي الإبداعي', 'الكرياتيف بالذكاء الاصطناعي'],
  ['المنظومة الإبداعية', 'منظومة الكرياتيف'],
  ['مدير إبداعي', 'مدير كرياتيف'],
  ['باقة الإبداعي', 'باقة الكرياتيف'],
  ['وماذا عن الإبداع؟', 'وماذا عن الكرياتيف؟'],
  ['الإبداع يبيع', 'الكرياتيف يبيع'],
  ['الإبداع أولًا', 'الكرياتيف أولًا'],
  ['محتوى الإبداع', 'محتوى الكرياتيف'],
  ['اختر الإبداع', 'اختر الكرياتيف'],
  ['+ إبداع +', '+ كرياتيف +'],
  ['لا يعوّض إبداعك، بل *يضاعفه*', 'لا يعوّض أفكارك، بل *يضاعفها*'],
  ['ما يعوّضش الإبداع تاعك… يضاعفو', 'ما يعوّضش الأفكار تاعك… يضاعفهم'],
  ['الإبداعي', 'الكرياتيف'],
];

/** Le texte arabe avec le bon vocabulaire. */
export function termesAr(s) {
  if (typeof s !== 'string' || !/إبداع/.test(s)) return s;
  for (const [a, b] of TERMES_AR) if (s.includes(a)) s = s.split(a).join(b);
  return s;
}
