// Surcouche de traduction du programme : chargée seulement si la langue n'est pas le français.
// Chaque langue a son dossier (en/, ar/) avec un fichier par module (m1.js, ia1.js…) réunis par index.js.
// Format d'un fichier de module : export default { modules: { m1: { title, pitch } }, lessons: { 'm1-l1': { title, scenes: […], key: […], quiz: […], res: […] } } }
// Les tableaux se fusionnent par position : seuls les textes changent, jamais les temps (d, at…) ni la structure.

import { lang } from '../../assets/js/i18n.js';

let ov = null;
if (lang !== 'fr') {
  try {
    ov = (await import(`./${lang}/index.js`)).default;
  } catch (err) {
    console.warn(`[i18n] traduction du programme indisponible (${lang})`, err);
  }
}
export const OVERLAY = ov;
