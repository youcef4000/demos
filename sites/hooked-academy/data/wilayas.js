// Les 58 wilayas d'Algérie : numéro, nom en français (aussi utilisé en anglais) et en arabe.
// Utilisé par le formulaire d'inscription (landing et /ia/), le serveur (validation) et l'espace équipe (affichage).
// Une inscription garde le numéro sur deux chiffres (« 16 ») ; le nom s'affiche dans la langue de l'écran.

export const WILAYAS = [
  ['01', 'Adrar', 'أدرار'],
  ['02', 'Chlef', 'الشلف'],
  ['03', 'Laghouat', 'الأغواط'],
  ['04', 'Oum El Bouaghi', 'أم البواقي'],
  ['05', 'Batna', 'باتنة'],
  ['06', 'Béjaïa', 'بجاية'],
  ['07', 'Biskra', 'بسكرة'],
  ['08', 'Béchar', 'بشار'],
  ['09', 'Blida', 'البليدة'],
  ['10', 'Bouira', 'البويرة'],
  ['11', 'Tamanrasset', 'تمنراست'],
  ['12', 'Tébessa', 'تبسة'],
  ['13', 'Tlemcen', 'تلمسان'],
  ['14', 'Tiaret', 'تيارت'],
  ['15', 'Tizi Ouzou', 'تيزي وزو'],
  ['16', 'Alger', 'الجزائر'],
  ['17', 'Djelfa', 'الجلفة'],
  ['18', 'Jijel', 'جيجل'],
  ['19', 'Sétif', 'سطيف'],
  ['20', 'Saïda', 'سعيدة'],
  ['21', 'Skikda', 'سكيكدة'],
  ['22', 'Sidi Bel Abbès', 'سيدي بلعباس'],
  ['23', 'Annaba', 'عنابة'],
  ['24', 'Guelma', 'قالمة'],
  ['25', 'Constantine', 'قسنطينة'],
  ['26', 'Médéa', 'المدية'],
  ['27', 'Mostaganem', 'مستغانم'],
  ['28', 'M’Sila', 'المسيلة'],
  ['29', 'Mascara', 'معسكر'],
  ['30', 'Ouargla', 'ورقلة'],
  ['31', 'Oran', 'وهران'],
  ['32', 'El Bayadh', 'البيض'],
  ['33', 'Illizi', 'إليزي'],
  ['34', 'Bordj Bou Arréridj', 'برج بوعريريج'],
  ['35', 'Boumerdès', 'بومرداس'],
  ['36', 'El Tarf', 'الطارف'],
  ['37', 'Tindouf', 'تندوف'],
  ['38', 'Tissemsilt', 'تيسمسيلت'],
  ['39', 'El Oued', 'الوادي'],
  ['40', 'Khenchela', 'خنشلة'],
  ['41', 'Souk Ahras', 'سوق أهراس'],
  ['42', 'Tipaza', 'تيبازة'],
  ['43', 'Mila', 'ميلة'],
  ['44', 'Aïn Defla', 'عين الدفلى'],
  ['45', 'Naâma', 'النعامة'],
  ['46', 'Aïn Témouchent', 'عين تموشنت'],
  ['47', 'Ghardaïa', 'غرداية'],
  ['48', 'Relizane', 'غليزان'],
  ['49', 'Timimoun', 'تيميمون'],
  ['50', 'Bordj Badji Mokhtar', 'برج باجي مختار'],
  ['51', 'Ouled Djellal', 'أولاد جلال'],
  ['52', 'Béni Abbès', 'بني عباس'],
  ['53', 'In Salah', 'عين صالح'],
  ['54', 'In Guezzam', 'عين قزام'],
  ['55', 'Touggourt', 'تقرت'],
  ['56', 'Djanet', 'جانت'],
  ['57', 'El M’Ghair', 'المغير'],
  ['58', 'El Menia', 'المنيعة'],
];

export const WILAYA_CODES = WILAYAS.map((w) => w[0]);

/** Numéro sur deux chiffres (« 16 ») à partir de « 16 », « 9 », « 09 » ; null si ce n'est pas une wilaya. */
export function wilayaCode(v) {
  const n = String(v ?? '').trim();
  if (!/^\d{1,2}$/.test(n)) return null;
  const c = n.padStart(2, '0');
  return WILAYA_CODES.includes(c) ? c : null;
}

/** « 16 · Alger » (ou « 16 · الجزائر » en arabe) ; chaîne vide si inconnue. */
export function wilayaLabel(code, lang = 'fr') {
  const w = WILAYAS.find((x) => x[0] === wilayaCode(code));
  return w ? `${w[0]} · ${lang === 'ar' ? w[2] : w[1]}` : '';
}

/** Les options d'une liste déroulante, dans la langue de la page (le numéro d'abord). */
export function wilayaOptions(lang = 'fr') {
  return WILAYAS.map((w) => ({ value: w[0], label: wilayaLabel(w[0], lang) }));
}
