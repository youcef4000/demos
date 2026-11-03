// Client Shopify (Admin GraphQL, version 2026-10 par défaut).
// - Jeton : « client credentials » d'une application du Dev Dashboard (valable 24 h, renouvelé seul),
//   ou jeton direct d'une ancienne application personnalisée (SHOPIFY_JETON).
// - Création / contenu : productSet (crée ou met à jour un produit complet, en brouillon par défaut).
// - Prix : productVariantsBulkUpdate (léger, ne touche à rien d'autre).
// - Stock : inventorySetQuantities avec changeFromQuantity et clé d'idempotence (obligatoires depuis 2026-04).
// - Mode à blanc : aucune requête, chaque mutation est écrite dans sortie/shopify-a-blanc.jsonl pour relecture.
import { appendFileSync, mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const PRODUITS_QUERY = `query Produits($apres: String) {
  products(first: 100, after: $apres) {
    pageInfo { hasNextPage endCursor }
    nodes { id handle title vendor productType status
      variants(first: 20) { nodes { id sku barcode price inventoryItem { id } inventoryQuantity } } }
  }
}`;

const PRODUCT_SET = `mutation Creer($produit: ProductSetInput!, $identifiant: ProductSetIdentifiers) {
  productSet(input: $produit, identifier: $identifiant, synchronous: true) {
    product { id handle variants(first: 1) { nodes { id inventoryItem { id } } } }
    userErrors { field message code }
  }
}`;

const PRIX = `mutation Prix($produitId: ID!, $variantes: [ProductVariantsBulkInput!]!) {
  productVariantsBulkUpdate(productId: $produitId, variants: $variantes) {
    productVariants { id price }
    userErrors { field message }
  }
}`;

const STOCK = `mutation Stock($input: InventorySetQuantitiesInput!, $cleIdempotence: String!) {
  inventorySetQuantities(input: $input) @idempotent(key: $cleIdempotence) {
    inventoryAdjustmentGroup { changes { name delta quantityAfterChange } }
    userErrors { code field message }
  }
}`;

export function creerShopify({
  boutique = process.env.SHOPIFY_BOUTIQUE,
  clientId = process.env.SHOPIFY_CLIENT_ID,
  clientSecret = process.env.SHOPIFY_CLIENT_SECRET,
  jeton = process.env.SHOPIFY_JETON,
  version = process.env.SHOPIFY_VERSION_API || '2026-10',
  emplacement = process.env.SHOPIFY_EMPLACEMENT,
  aBlanc = false,
  sortie = './sortie',
  fetch: f = globalThis.fetch,
  attente = (ms) => new Promise((r) => setTimeout(r, ms)),
} = {}) {
  let acces = jeton ? { valeur: jeton, expire: Infinity } : null;

  async function token() {
    if (acces && acces.expire > Date.now() + 60_000) return acces.valeur;
    if (!boutique || !clientId || !clientSecret) throw new Error('Shopify : SHOPIFY_BOUTIQUE + SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET (ou SHOPIFY_JETON) requis');
    const r = await f(`https://${boutique}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, grant_type: 'client_credentials' }),
    });
    if (!r.ok) throw new Error(`Shopify : jeton refusé (HTTP ${r.status})`);
    const d = await r.json();
    acces = { valeur: d.access_token, expire: Date.now() + (d.expires_in ?? 86399) * 1000 };
    return acces.valeur;
  }

  async function graphql(query, variables) {
    if (aBlanc) {
      mkdirSync(sortie, { recursive: true });
      appendFileSync(`${sortie}/shopify-a-blanc.jsonl`, JSON.stringify({ date: new Date().toISOString(), query: query.split('(')[0].trim(), variables }) + '\n');
      return null;
    }
    for (let essai = 1; ; essai++) {
      const r = await f(`https://${boutique}/admin/api/${version}/graphql.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': await token() },
        body: JSON.stringify({ query, variables }),
      });
      if (r.status === 429 || r.status >= 500) {
        if (essai >= 5) throw new Error(`Shopify HTTP ${r.status}`);
        await attente(1000 * essai);
        continue;
      }
      if (!r.ok) throw new Error(`Shopify HTTP ${r.status}`);
      const d = await r.json();
      const limite = d.errors?.find((x) => x.extensions?.code === 'THROTTLED');
      if (limite && essai < 5) {
        const statut = d.extensions?.cost?.throttleStatus;
        const besoin = d.extensions?.cost?.requestedQueryCost ?? 100;
        const ms = statut ? Math.max(1000, ((besoin - statut.currentlyAvailable) / statut.restoreRate) * 1000) : 2000;
        await attente(ms);
        continue;
      }
      if (d.errors?.length) throw new Error(`Shopify : ${d.errors.map((x) => x.message).join(' ; ')}`);
      return d.data;
    }
  }

  const erreursUtilisateur = (bloc) => {
    if (bloc?.userErrors?.length) throw new Error(bloc.userErrors.map((u) => `${(u.field || []).join('.')} ${u.message}`).join(' ; '));
  };

  return {
    aBlanc,

    /** Tous les produits de la boutique (pour relier l'existant aux fournisseurs). */
    async lireProduits() {
      const tous = [];
      let apres = null;
      for (;;) {
        const d = await graphql(PRODUITS_QUERY, { apres });
        if (!d) return tous;
        for (const p of d.products.nodes) {
          for (const v of p.variants.nodes) tous.push({ id: p.id, varianteId: v.id, inventaireId: v.inventoryItem?.id, sku: v.sku, barcode: v.barcode, vendor: p.vendor, titre: p.title, prix: Number(v.price), stock: v.inventoryQuantity });
        }
        if (!d.products.pageInfo.hasNextPage) return tous;
        apres = d.products.pageInfo.endCursor;
      }
    },

    async executer(action, charge) {
      if (action === 'prix') return this.fixerPrix(charge);
      if (action === 'stock') return this.fixerStock(charge);
      if (action === 'creer' || action === 'contenu') return this.ecrireProduit(charge);
      throw new Error(`Action Shopify inconnue : ${action}`);
    },

    async fixerPrix({ produitId, varianteId, prixHT }) {
      const d = await graphql(PRIX, { produitId, variantes: [{ id: varianteId, price: prixHT.toFixed(2) }] });
      if (d) erreursUtilisateur(d.productVariantsBulkUpdate);
      return {};
    },

    async fixerStock({ inventoryItemId, quantite, precedente = null }) {
      if (!emplacement && !aBlanc) throw new Error('SHOPIFY_EMPLACEMENT manquant (gid://shopify/Location/…)');
      const d = await graphql(STOCK, {
        input: {
          name: 'available',
          reason: 'correction',
          referenceDocumentUri: `le-passe://synchro/${new Date().toISOString()}`,
          quantities: [{ inventoryItemId, locationId: emplacement, quantity: quantite, changeFromQuantity: Number.isFinite(precedente) ? precedente : null }],
        },
        cleIdempotence: randomUUID(),
      });
      if (d) erreursUtilisateur(d.inventorySetQuantities);
      return {};
    },

    /** Crée (en brouillon) ou met à jour le contenu d'un produit à partir de l'offre et de la fiche Claude validée. */
    async ecrireProduit({ produitId, offre, fiche, prixHT, statut = 'DRAFT' }) {
      const produit = construireProduit({ offre, fiche, prixHT, statut, emplacement });
      const d = await graphql(PRODUCT_SET, { produit, identifiant: produitId ? { id: produitId } : { handle: produit.handle } });
      if (!d) return {};
      erreursUtilisateur(d.productSet);
      const p = d.productSet.product;
      const v = p?.variants?.nodes?.[0];
      return { produitId: p?.id, varianteId: v?.id, inventaireId: v?.inventoryItem?.id };
    },
  };
}

const slug = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);

/** Construit l'entrée productSet. Exportée pour les tests (et pour relire ce qui partirait). */
export function construireProduit({ offre, fiche, prixHT, statut = 'DRAFT', emplacement }) {
  const titre = fiche?.titre || offre?.designation || offre?.ref;
  const images = offre?.images ? (typeof offre.images === 'string' ? JSON.parse(offre.images) : offre.images) : [];
  const variante = {
    optionValues: [{ optionName: 'Title', name: 'Default Title' }],
    price: Number(prixHT || 0).toFixed(2),
    sku: offre?.ref,
    inventoryItem: {
      tracked: true,
      ...(offre?.prix_achat ? { cost: Number(offre.prix_achat).toFixed(2) } : {}),
      ...(offre?.poids_kg ? { measurement: { weight: { unit: 'KILOGRAMS', value: Number(offre.poids_kg) } } } : {}),
    },
    ...(offre?.ean ? { barcodes: [{ value: String(offre.ean) }] } : {}),
    ...(emplacement && Number.isFinite(offre?.stock) ? { inventoryQuantities: [{ locationId: emplacement, name: 'available', quantity: offre.stock }] } : {}),
  };
  return {
    title: titre,
    handle: slug(`${titre}-${offre?.ref ?? ''}`),
    vendor: offre?.marque || undefined,
    status: statut,
    ...(fiche ? { descriptionHtml: fiche.description_html, seo: { title: fiche.meta_title, description: fiche.meta_description }, productType: fiche.categorie_proposee?.split('>').pop().trim() } : {}),
    productOptions: [{ name: 'Title', values: [{ name: 'Default Title' }] }],
    variants: [variante],
    ...(images.length ? { files: images.slice(0, 10).map((url, i) => ({ originalSource: url, contentType: 'IMAGE', alt: i === 0 ? titre : undefined })) } : {}),
    metafields: [
      { namespace: 'le_passe', key: 'fournisseur', type: 'single_line_text_field', value: String(offre?.fournisseur ?? '') },
      { namespace: 'le_passe', key: 'ref_fournisseur', type: 'single_line_text_field', value: String(offre?.ref ?? '') },
    ],
  };
}
