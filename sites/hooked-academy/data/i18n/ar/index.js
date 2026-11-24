// Programme en ar : formations, parties, puis un fichier par module (m1.js … ia9.js, dv0.js … dv15.js) ajouté au fil des traductions.
// Ne pas traduire `say` (texte du prompteur du formateur) : il fixe la durée des scènes.
const base = {
  tracks: { creative: { title: 'تكوين الكرياتيف', pitch: 'افهم ما الذي يجعل الإعلان يبيع، وأنتجه بهاتفك وCapCut وCanva.' }, ia: { title: 'تكوين الذكاء الاصطناعي', pitch: 'البرومبت، صور وفيديوهات بالذكاء الاصطناعي، الصوت، UGC، الأسلوب السينمائي — ثم التحليل والبيع وكسب عملائك.' }, dev: { title: 'تكوين المواقع والتطبيقات', pitch: 'اصنع المواقع والتطبيقات واحمها وانشرها وبِعها بتوجيه الذكاء الاصطناعي (vibe coding)، دون كتابة كود، من الصفر إلى أول زبون.' } },
  parts: { p1: { title: 'الأساسيات', pitch: 'افهم ما الذي يجعل الكرياتيف يبيع، وأنتجه دون ذكاء اصطناعي.' }, p2: { title: 'الكرياتيف بالذكاء الاصطناعي', pitch: 'البرومبت، الصور، الفيديوهات، الصوت، UGC والأسلوب السينمائي.' }, p3: { title: 'بيع مهاراتك', pitch: 'حلّل، حسّن، واكسب عملاءك الأوائل.' }, p4: { title: 'أساسيات الـ vibe coding', pitch: 'افهم الويب، قُد الذكاء الاصطناعي، اعرف أدواتك، وانشر أول موقع لك.' }, p5: { title: 'البناء والحماية والتثبيت', pitch: 'النشر، الخلفية وSupabase، الأمن السيبراني، تطبيق حقيقي، الاختبارات، الموشن ديزاين.' }, p6: { title: 'الاحتراف والبيع', pitch: 'طوّر Claude، عروض تجلب العقود، تسليم نظيف، المشروع النهائي.' } },
  modules: {},
  lessons: {},
};
// MODULES : liste des fichiers de module disponibles pour cette langue (mis à jour quand une traduction arrive).
const MODULES = ['m0', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11', 'm12', 'ia0', 'ia1', 'ia2', 'ia3', 'ia4', 'ia5', 'ia6', 'ia7', 'ia8', 'ia9', 'ia10', 'dv0', 'dv1', 'dv2', 'dv3', 'dv4', 'dv5', 'dv6', 'dv7', 'dv8', 'dv9', 'dv10', 'dv11', 'dv12', 'dv13', 'dv14', 'dv15'];
const loaded = await Promise.all(MODULES.map((m) => import(`./${m}.js`).then((x) => x.default).catch((e) => (console.warn('[i18n]', m, e), null))));
for (const f of loaded.filter(Boolean)) for (const k of ['tracks', 'parts', 'modules', 'lessons']) Object.assign(base[k], f[k] || {});
export default base;
