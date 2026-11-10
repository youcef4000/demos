// Noyau du cabinet — formats communs (navigateur et serveur).
// Montants en dinars algériens (DA), dates au format JJ/MM/AAAA, périodes « AAAA-MM ».
// Les montants sont gardés en centimes entiers pour éviter les erreurs d'arrondi.

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/** 1 234 567,89 DA (espaces fines insécables comme séparateur de milliers). */
export function da(centimes, { signe = false, sansUnite = false } = {}) {
  const c = Math.round(Number(centimes) || 0);
  const neg = c < 0;
  const abs = Math.abs(c);
  const entier = Math.floor(abs / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const dec = String(abs % 100).padStart(2, '0');
  const s = `${neg ? '−' : signe && c > 0 ? '+' : ''}${entier},${dec}`;
  return sansUnite ? s : `${s} DA`;
}

/** Lit un montant saisi par une personne (« 12 500,50 », « 12500.5 », « 12 500 DA ») en centimes. */
export function lireMontant(texte) {
  if (typeof texte === 'number') return Math.round(texte * 100);
  if (texte == null) return 0;
  let s = String(texte).replace(/[\s  ]/g, '').replace(/DA|DZD|د\.ج/gi, '');
  if (!s) return 0;
  const neg = /^[-−]/.test(s);
  s = s.replace(/^[-−+]/, '');
  // Virgule décimale (usage français) ; un point suivi de 3 chiffres est un séparateur de milliers
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  const n = Number(s);
  if (!Number.isFinite(n)) return NaN;
  return (neg ? -1 : 1) * Math.round(n * 100);
}

/** Date ISO (AAAA-MM-JJ) → JJ/MM/AAAA. */
export function dateFr(iso) {
  if (!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(iso);
}

/** Date et heure ISO → JJ/MM/AAAA à HH:MM (heure d'Alger, UTC+1 sans changement d'heure). */
export function dateHeureFr(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const alger = new Date(d.getTime() + 60 * 60 * 1000);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(alger.getUTCDate())}/${p(alger.getUTCMonth() + 1)}/${alger.getUTCFullYear()} à ${p(alger.getUTCHours())}:${p(alger.getUTCMinutes())}`;
}

/** JJ/MM/AAAA (ou J/M/AAAA, séparateurs / - .) → AAAA-MM-JJ ; null si la date n'existe pas. */
export function lireDate(texte) {
  if (!texte) return null;
  const s = String(texte).trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) return dateValide(+m[1], +m[2], +m[3]);
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/.exec(s);
  if (!m) return null;
  const an = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  return dateValide(an, +m[2], +m[1]);
}

function dateValide(a, mo, j) {
  const d = new Date(Date.UTC(a, mo - 1, j));
  if (d.getUTCFullYear() !== a || d.getUTCMonth() !== mo - 1 || d.getUTCDate() !== j) return null;
  return `${a}-${String(mo).padStart(2, '0')}-${String(j).padStart(2, '0')}`;
}

/** « 2026-10 » → « octobre 2026 ». */
export function periodeFr(periode) {
  const m = /^(\d{4})-(\d{2})$/.exec(periode || '');
  return m ? `${MOIS[Number(m[2]) - 1]} ${m[1]}` : String(periode || '');
}

export function moisFr(n) {
  return MOIS[(Number(n) - 1 + 12) % 12];
}

/** Période (AAAA-MM) d'une date ISO. */
export function periodeDe(iso) {
  return String(iso || '').slice(0, 7);
}

/** Décale une période de n mois. */
export function decalerPeriode(periode, n) {
  const [a, m] = periode.split('-').map(Number);
  const t = a * 12 + (m - 1) + n;
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}`;
}

/** Dernier jour d'une période → AAAA-MM-JJ. */
export function finDePeriode(periode) {
  const [a, m] = periode.split('-').map(Number);
  const d = new Date(Date.UTC(a, m, 0));
  return d.toISOString().slice(0, 10);
}

/** Nombre de jours entre deux dates ISO (b − a). */
export function joursEntre(a, b) {
  return Math.round((Date.parse(`${b.slice(0, 10)}T00:00:00Z`) - Date.parse(`${a.slice(0, 10)}T00:00:00Z`)) / 86400000);
}

/** Jour de la semaine en français pour une date ISO. */
export function jourSemaine(iso) {
  return ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][new Date(`${iso.slice(0, 10)}T12:00:00Z`).getUTCDay()];
}

/** Arrondi au centime d'un montant × taux (taux en pourcentage, ex. 19). */
export function appliquerTaux(centimes, taux) {
  return Math.round((centimes * Number(taux)) / 100);
}

/** Remplit un modèle « Bonjour {{contact}} » avec des valeurs ; les clés inconnues restent visibles. */
export function remplir(modele, valeurs) {
  return String(modele || '').replace(/\{\{\s*([a-zA-Z_]+)\s*\}\}/g, (tout, cle) => (valeurs[cle] != null && valeurs[cle] !== '' ? String(valeurs[cle]) : tout));
}

/** Échappe un texte pour l'insérer dans du HTML. */
export function html(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/** Identifiant court, lisible, unique (horodatage + aléa). */
export function nouvelId(prefixe = '') {
  const alea = typeof crypto !== 'undefined' && crypto.getRandomValues ? Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => b.toString(16).padStart(2, '0')).join('') : Math.random().toString(16).slice(2, 10);
  return `${prefixe}${Date.now().toString(36)}${alea}`;
}

/** Normalise un NIF (chiffres uniquement). */
export function nif(s) {
  return String(s || '').replace(/\D/g, '');
}
