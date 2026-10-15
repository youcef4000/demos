// Programme en en : formations, parties, puis un fichier par module (m1.js … ia9.js) ajouté au fil des traductions.
// Ne pas traduire `say` (texte du prompteur du formateur) : il fixe la durée des scènes.
const base = {
  tracks: { creative: { title: 'Creative Course', pitch: 'Understand what makes an ad sell, and produce it with your phone, CapCut and Canva.' }, ia: { title: 'AI Course', pitch: 'Prompting, AI images and videos, voice, UGC, cinematic — then analyse, sell and sign your clients.' } },
  parts: { p1: { title: 'The fundamentals', pitch: 'Understand what makes an ad creative sell, and produce it without AI.' }, p2: { title: 'Creative AI', pitch: 'Prompting, images, videos, voice, UGC and cinematic.' }, p3: { title: 'Sell your skills', pitch: 'Analyse, iterate and sign your first clients.' } },
  modules: {},
  lessons: {},
};
// MODULES : liste des fichiers de module disponibles pour cette langue (mis à jour quand une traduction arrive).
const MODULES = ['m0', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'ia0', 'ia1', 'ia2', 'ia3', 'ia4', 'ia5', 'ia6', 'ia7', 'ia8', 'ia9'];
const loaded = await Promise.all(MODULES.map((m) => import(`./${m}.js`).then((x) => x.default).catch((e) => (console.warn('[i18n]', m, e), null))));
for (const f of loaded.filter(Boolean)) for (const k of ['tracks', 'parts', 'modules', 'lessons']) Object.assign(base[k], f[k] || {});
export default base;
