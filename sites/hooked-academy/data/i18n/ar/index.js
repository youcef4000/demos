// Programme en ar : formations, parties, puis un fichier par module (m1.js … ia9.js) ajouté au fil des traductions.
// Ne pas traduire `say` (texte du prompteur du formateur) : il fixe la durée des scènes.
const base = {
  tracks: { creative: { title: 'التكوين الإبداعي', pitch: 'افهم ما الذي يجعل الإعلان يبيع، وأنتجه بهاتفك وCapCut وCanva.' }, ia: { title: 'تكوين الذكاء الاصطناعي', pitch: 'البرومبت، صور وفيديوهات بالذكاء الاصطناعي، الصوت، UGC، الأسلوب السينمائي — ثم التحليل والبيع وكسب عملائك.' } },
  parts: { p1: { title: 'الأساسيات', pitch: 'افهم ما الذي يجعل الكرياتيف يبيع، وأنتجه دون ذكاء اصطناعي.' }, p2: { title: 'الذكاء الاصطناعي الإبداعي', pitch: 'البرومبت، الصور، الفيديوهات، الصوت، UGC والأسلوب السينمائي.' }, p3: { title: 'بيع مهاراتك', pitch: 'حلّل، حسّن، واكسب عملاءك الأوائل.' } },
  modules: {},
  lessons: {},
};
// MODULES : liste des fichiers de module disponibles pour cette langue (mis à jour quand une traduction arrive).
const MODULES = ['m0', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'ia0', 'ia1', 'ia2', 'ia3', 'ia4', 'ia5', 'ia6', 'ia7', 'ia8', 'ia9'];
const loaded = await Promise.all(MODULES.map((m) => import(`./${m}.js`).then((x) => x.default).catch((e) => (console.warn('[i18n]', m, e), null))));
for (const f of loaded.filter(Boolean)) for (const k of ['tracks', 'parts', 'modules', 'lessons']) Object.assign(base[k], f[k] || {});
export default base;
