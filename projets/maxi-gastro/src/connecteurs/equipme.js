// Connecteur equip.me — d'après la spécification publique « Dealers API 1.0.4 » (https://equip.me/api/).
// Service : https://api.equip.me/v1 · authentification : paramètre de requête « apikey »
// (clé créée par un compte au rôle « Superviseur »).
//
// Ce qui est exploité :
//   GET /dealer/products  — catalogue paginé (per_page ≤ 1000), réponse { response: { products, page, page_count, link_next, success } }
//     change_from   → seulement les produits modifiés depuis la dernière synchro réussie
//     catalog_type  → 1 = assortiment principal ; 2 = pièces détachées (jamais demandé ici)
//     with_rrc, with_add_photo, with_add_props, with_files, with_category → prix conseillé, galerie, caractéristiques, PDF
//     unit=metric, lang=fr
//   POST /dealer/order    — création d'une commande chez equip.me (voir creerCommande)
//
// À vérifier avec une vraie clé : les noms des champs de dimensions en système métrique (la spécification ne montre
// que les champs impériaux : weightlb, widthin…), la liste des entrepôts utiles pour la France, et la limite d'appels.

const BASE = 'https://api.equip.me/v1';
const LB = 0.45359237;
const POUCE = 25.4;

export function creerConnecteurEquipme({ cle = process.env.EQUIPME_CLE, fetch: f = globalThis.fetch, parPage = 500, entrepots = null, attente = attendre } = {}) {
  if (!cle) throw new Error('EQUIPME_CLE manquante : la clé API equip.me se crée depuis un compte « Superviseur ».');

  async function appeler(chemin, params = {}, { methode = 'GET', corps } = {}) {
    const url = new URL(BASE + chemin);
    url.searchParams.set('apikey', cle);
    for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    for (let essai = 1; ; essai++) {
      const r = await f(url, {
        method: methode,
        headers: { Accept: 'application/json', ...(corps ? { 'Content-Type': 'application/json' } : {}) },
        body: corps ? JSON.stringify(corps) : undefined,
      });
      if (r.status === 429 || r.status >= 500) {
        if (essai >= 4) throw new Error(`equip.me ${chemin} : HTTP ${r.status} après ${essai} essais`);
        await attente(1000 * 2 ** essai);
        continue;
      }
      if (r.status === 401 || r.status === 403) throw new Error(`equip.me : clé refusée (HTTP ${r.status}). Vérifier la clé et le rôle Superviseur.`);
      if (!r.ok) throw new Error(`equip.me ${chemin} : HTTP ${r.status} ${await r.text().catch(() => '')}`.trim());
      const data = await r.json();
      if (data?.response?.success === false) throw new Error(`equip.me ${chemin} : requête refusée (${JSON.stringify(data.response).slice(0, 200)})`);
      return data;
    }
  }

  return {
    id: 'equipme',
    nom: 'equip.me',

    /** Parcourt le catalogue (ou seulement ce qui a changé depuis « depuis »). */
    async *lire({ depuis } = {}) {
      let page = 1;
      for (;;) {
        const data = await appeler('/dealer/products', {
          page,
          per_page: parPage,
          catalog_type: 1,
          change_from: depuis ? formaterDate(depuis) : undefined,
          with_rrc: 1,
          with_add_photo: 1,
          with_add_props: 1,
          with_files: 1,
          with_category: 1,
          unit: 'metric',
          lang: 'fr',
        });
        const rep = data?.response ?? {};
        for (const p of rep.products ?? []) {
          if (String(p.catalog_type_id ?? '1') === '2') continue; // ceinture et bretelles : jamais de pièces détachées
          yield normaliserProduit(p, { entrepots });
        }
        const total = Number(rep.page_count ?? 1);
        if (!rep.link_next || page >= total) break;
        page++;
      }
    },

    /** Crée la commande chez equip.me après une vente (marketplace ou boutique). Le corps exact est à valider sur l'environnement réel. */
    async creerCommande(commande) {
      return appeler('/dealer/order', {}, { methode: 'POST', corps: commande });
    },

    async entrepots() {
      return appeler('/dealer/stocks');
    },

    async categories() {
      return appeler('/dealer/products/categories', { lang: 'fr' });
    },
  };
}

/** equip.me → offre normalisée du Passe. Exportée pour les tests. */
export function normaliserProduit(p, { entrepots = null } = {}) {
  const champs = p.fields ?? {};
  const prix = (p.prices ?? []).find((x) => x.price_eur !== undefined) ?? (p.prices ?? [])[0] ?? {};
  const dispo = (p.available ?? []).filter((a) => !entrepots || entrepots.includes(a.stock));
  const stock = dispo.reduce((s, a) => s + Math.max(0, Number(a.quantity_free) || 0), 0);
  const delai = champs.delivery_time;
  const arrete = delai === 'not_carry';
  const images = [champs.image, ...(champs.add_images ?? [])].flat().filter(Boolean);
  const notices = (p.files ?? []).flatMap((fi) => fi.items ?? []).filter(Boolean);
  const nombre = (v) => (v === undefined || v === null || v === '' ? null : Number(v));
  const kg = nombre(champs.grossweight ?? champs.weight_gross) ?? (nombre(champs.grossweightlb) !== null ? round1(nombre(champs.grossweightlb) * LB) : null)
    ?? nombre(champs.weight) ?? (nombre(champs.weightlb) !== null ? round1(nombre(champs.weightlb) * LB) : null);
  const mm = (metrique, pouces) => nombre(champs[metrique]) ?? (nombre(champs[pouces]) !== null ? Math.round(nombre(champs[pouces]) * POUCE) : null);
  const l = mm('width', 'widthin');
  const pr = mm('length', 'lengthin');
  const h = mm('height', 'heightin');
  return {
    fournisseur: 'equipme',
    ref: String(p.code_1c),
    ean: null, // aucun champ EAN dans la spécification
    designation: champs.name ?? null,
    marque: champs.brand ?? null,
    modele: champs.model ?? null,
    categorie: champs.category_id !== undefined ? String(champs.category_id) : null,
    prixAchatHT: nombre(prix.price_eur),
    prixConseilleHT: nombre(prix.price_eur_rrc),
    stock: arrete ? 0 : stock,
    statutStock: arrete ? 'rupture' : stock > 0 ? 'en-stock' : 'sur-commande',
    delaiJours: /^\d+$/.test(String(delai ?? '')) ? Number(delai) : null,
    poidsKg: kg,
    dimensions: l && pr && h ? `${l} × ${pr} × ${h} mm` : null,
    images,
    notice: notices[0] ?? null,
    description: [champs.description, p.add_desc].filter(Boolean).join('\n\n') || null,
    caracteristiques: p.add_props ?? null,
    actif: p.active === undefined ? true : String(p.active) === '1' || p.active === true,
    brut: p,
  };
}

function formaterDate(d) {
  return new Date(d).toISOString().slice(0, 19); // format de l'exemple : 2020-06-01T09:00:00
}
const round1 = (n) => Math.round(n * 10) / 10;
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
