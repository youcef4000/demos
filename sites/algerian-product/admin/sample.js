// Données d'exemple de l'admin, clairement signalées comme telles :
// quelques demandes reçues et 90 jours de statistiques de visite plausibles.
// Elles s'additionnent aux vraies actions faites sur le site depuis ce navigateur.
import { readInbox, writeInbox } from '../store.js';

const SEEDED = 'ap:inbox:seeded';
const ago = (d, h = 10) => {
  const t = new Date();
  t.setDate(t.getDate() - d);
  t.setHours(h, 24, 0, 0);
  return t.toISOString();
};

export function seedInbox() {
  try {
    if (localStorage.getItem(SEEDED)) return;
    localStorage.setItem(SEEDED, '1');
  } catch {
    return;
  }
  const y = new Date().getFullYear();
  const ex = [
    { type: 'quote', ref: `DV-${y}-E01`, at: ago(0, 9), status: 'new', lang: 'fr', source: 'linkedin', country: 'CA', city: 'Montréal', incoterm: 'CIF', frequency: 'quarterly', company: 'Épicerie fine (exemple)', name: 'Contact exemple', role: 'Acheteuse', buyerType: 'retailer', email: 'achats@exemple.ca', phone: '', message: 'Nous cherchons des dattes en branchettes pour le Ramadan et une huile d’olive en 500 ml, étiquette en français et en anglais.', items: [{ id: 'dattes-deglet-nour', name: 'Dattes Deglet Nour', qty: '1200', unit: 'kg' }, { id: 'huile-olive-kabylie', name: 'Huile d’olive extra vierge', qty: '600', unit: 'pcs' }] },
    { type: 'quote', ref: `DV-${y}-E02`, at: ago(1, 15), status: 'progress', lang: 'ar', source: 'instagram', country: 'AE', city: 'Dubaï', incoterm: 'CFR', frequency: 'monthly', company: 'Société de négoce (exemple)', name: 'Contact exemple', role: 'Directeur achats', buyerType: 'trading', email: 'trade@exemple.ae', phone: '', message: 'نرغب في عسل السدر بكميات منتظمة مع شهادات التحليل.', items: [{ id: 'miel-jujubier', name: 'Miel de jujubier (sidr)', qty: '400', unit: 'kg' }, { id: 'dattes-deglet-nour', name: 'Dattes Deglet Nour', qty: '1', unit: 'c20' }] },
    { type: 'quote', ref: `DV-${y}-E03`, at: ago(3, 11), status: 'offer', lang: 'es', source: 'search', country: 'ES', city: 'Valence', incoterm: 'FOB', frequency: 'once', company: 'Distributeur céramique (exemple)', name: 'Contact exemple', role: 'Gerente', buyerType: 'distributor', email: 'compras@ejemplo.es', phone: '', message: 'Gres porcelánico 60 × 60, tonos claros.', items: [{ id: 'carreaux-ceramique', name: 'Carreaux de céramique & faïence', qty: '2', unit: 'c20' }] },
    { type: 'quote', ref: `DV-${y}-E04`, at: ago(6, 17), status: 'won', lang: 'fr', source: 'direct', country: 'FR', city: 'Paris', incoterm: 'DAP', frequency: 'once', company: 'Concept-store (exemple)', name: 'Contact exemple', role: 'Fondatrice', buyerType: 'retailer', email: 'contact@exemple.fr', phone: '', message: 'Une sélection de tapis du M’zab et de plateaux en cuivre pour une exposition-vente.', items: [{ id: 'tapis-mzab', name: 'Tapis du M’zab', qty: '12', unit: 'pcs' }, { id: 'cuivre-constantine', name: 'Cuivre ciselé de Constantine', qty: '30', unit: 'pcs' }] },
    { type: 'quote', ref: `DV-${y}-E05`, at: ago(9, 12), status: 'lost', lang: 'en', source: 'linkedin', country: 'GB', city: 'Londres', incoterm: '', frequency: 'monthly', company: 'Food importer (example)', name: 'Example contact', role: 'Buyer', buyerType: 'importer', email: 'buying@example.co.uk', phone: '', message: 'Private label couscous, 1 kg packs.', items: [{ id: 'couscous-ble-dur', name: 'Couscous & semoule de blé dur', qty: '20', unit: 't' }] },
    { type: 'producer', ref: `PR-${y}-E01`, at: ago(2, 10), status: 'new', lang: 'fr', source: 'whatsapp', company: 'Coopérative de dattes (exemple)', name: 'Contact exemple', wilaya: 'Biskra', sector: 'terroir', products: 'Deglet Nour en branchettes et en vrac, pâte de dattes.', capacity: '80 tonnes par saison', certs: 'Analyses par lot', exports: 'no', email: 'coop@exemple.dz', phone: '' },
    { type: 'producer', ref: `PR-${y}-E02`, at: ago(5, 14), status: 'review', lang: 'ar', source: 'facebook', company: 'Atelier de dinanderie (exemple)', name: 'Contact exemple', wilaya: 'Constantine', sector: 'artisanat', products: 'صواني ونحاس منقوش وفوانيس', capacity: '150 pièces / mois', certs: '', exports: 'yes', email: 'atelier@exemple.dz', phone: '' },
    { type: 'contact', ref: `MS-${y}-E01`, at: ago(4, 16), status: 'new', lang: 'fr', source: 'email', name: 'Contact exemple', email: 'salon@exemple.com', subject: 'Salon de l’alimentation — stand pavillon Algérie', message: 'Bonjour, seriez-vous intéressés par un espace sur notre salon professionnel au printemps ?' },
  ].map((x, i) => ({ id: `sample${i}`, notes: '', sample: true, ...x }));
  writeInbox([...readInbox(), ...ex]);
}

/* Statistiques d'exemple ------------------------------------------------------ */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const SOURCES = { linkedin: 0.27, instagram: 0.19, search: 0.2, direct: 0.15, whatsapp: 0.1, facebook: 0.05, email: 0.04 };
const COUNTRIES = { CA: 0.21, FR: 0.2, DZ: 0.14, AE: 0.09, BE: 0.06, ES: 0.06, GB: 0.05, SA: 0.05, US: 0.04, QA: 0.03, DE: 0.03, TR: 0.02, SN: 0.02 };
const LANGS = { fr: 0.46, en: 0.27, ar: 0.19, es: 0.08 };
const DEVICES = { mobile: 0.64, desktop: 0.3, tablet: 0.06 };
const PRODUCT_W = { 'dattes-deglet-nour': 18, 'huile-olive-kabylie': 15, 'tapis-mzab': 11, 'figues-beni-maouche': 9, 'cuivre-constantine': 8, 'miel-jujubier': 8, 'couscous-ble-dur': 7, 'carreaux-ceramique': 6, 'huile-figue-barbarie': 6, 'electromenager': 5, 'broderie-tlemcen': 5, 'oranges-mitidja': 4 };

const split = (n, shares, r) => {
  const out = {};
  for (const [k, w] of Object.entries(shares)) out[k] = Math.max(0, Math.round(n * w * (0.8 + r() * 0.4)));
  return out;
};

// Une ligne par jour : [{ date, visitors, views, productViews, formStarts, quotes, producers, sources, countries, langs, devices, products }]
export function sampleDays(n = 90) {
  const out = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const r = rng(Number(key.replace(/-/g, '')));
    const trend = 34 + (n - i) * 0.85; // le site gagne en visibilité
    const week = [0.86, 1.06, 1.1, 1.08, 1.04, 0.82, 0.74][d.getDay()];
    const spike = i === 21 || i === 52 ? 2.3 : 1; // publications LinkedIn
    const visitors = Math.round(trend * week * spike * (0.82 + r() * 0.36));
    const views = Math.round(visitors * (2.6 + r() * 0.8));
    const productViews = Math.round(visitors * (0.42 + r() * 0.1));
    const formStarts = Math.round(visitors * (0.06 + r() * 0.02));
    const quotes = Math.round(visitors * (0.018 + r() * 0.012));
    const producers = r() < 0.18 ? 1 : 0;
    out.push({
      date: key,
      visitors,
      views,
      productViews,
      formStarts,
      quotes,
      producers,
      sources: split(visitors, SOURCES, r),
      countries: split(visitors, COUNTRIES, r),
      langs: split(visitors, LANGS, r),
      devices: split(visitors, DEVICES, r),
      products: split(productViews, Object.fromEntries(Object.entries(PRODUCT_W).map(([k, w]) => [k, w / 102])), r),
    });
  }
  return out;
}
