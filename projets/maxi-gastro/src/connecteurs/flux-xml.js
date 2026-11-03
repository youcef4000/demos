// Connecteur « flux XML » — pour le lien de flux live que Tefcold fournit à ses revendeurs
// (https://www.tefcold.com/news/new-feature-a-live-xml-feed-for-your-website : produits, données techniques, images, stock).
// Le format exact du flux n'est pas public : ce lecteur gère les flux « à plat »
// (<produit><champ>valeur</champ>…</produit>) et la correspondance des balises se règle dans « champs ».
// À valider dès réception du lien.

const CHAMPS_DEFAUT = {
  conteneur: ['product', 'item', 'produit', 'article'],
  ref: ['itemnumber', 'item_number', 'sku', 'reference', 'ref', 'artnr', 'id'],
  ean: ['ean', 'ean13', 'gtin', 'barcode'],
  designation: ['name', 'title', 'designation', 'productname'],
  marque: ['brand', 'marque', 'manufacturer'],
  prixAchat: ['price', 'netprice', 'dealerprice', 'prix'],
  stock: ['stock', 'quantity', 'qty', 'available', 'stockquantity'],
  poids: ['grossweight', 'weight', 'poids', 'netweight'],
  dimensions: ['dimensions', 'externaldimensions', 'size'],
  categorie: ['category', 'categorie', 'productgroup'],
  image: ['image', 'imageurl', 'picture', 'mainimage'],
  description: ['description', 'longdescription', 'text'],
};

export function creerConnecteurFluxXml({ id = 'tefcold', nom = 'Tefcold', url = process.env.TEFCOLD_FLUX_XML, champs = {}, fetch: f = globalThis.fetch } = {}) {
  if (!url) throw new Error(`Lien du flux XML ${nom} manquant (à demander au service client ${nom}).`);
  const carte = { ...CHAMPS_DEFAUT, ...champs };
  return {
    id,
    nom,
    async *lire() {
      const r = await f(url, { headers: { Accept: 'application/xml, text/xml' } });
      if (!r.ok) throw new Error(`${nom} : flux XML HTTP ${r.status}`);
      const xml = await r.text();
      for (const bloc of extraireBlocs(xml, carte.conteneur)) {
        const o = normaliserBloc(bloc, carte, id);
        if (o.ref) yield o;
      }
    },
  };
}

/** Découpe les blocs <product>…</product> (ou équivalent). */
export function extraireBlocs(xml, conteneurs) {
  for (const balise of conteneurs) {
    const re = new RegExp(`<${balise}(?:\\s[^>]*)?>([\\s\\S]*?)</${balise}>`, 'gi');
    const blocs = [...xml.matchAll(re)].map((m) => m[1]);
    if (blocs.length) return blocs;
  }
  return [];
}

function valeurs(bloc) {
  const v = {};
  for (const m of bloc.matchAll(/<([A-Za-z_][\w.-]*)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g)) {
    const cle = m[1].toLowerCase().replace(/[-_.]/g, '');
    if (!(cle in v)) v[cle] = decoder(m[2].trim());
  }
  return v;
}

function decoder(s) {
  return s
    .replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&');
}

export function normaliserBloc(bloc, carte, fournisseur) {
  const v = valeurs(bloc);
  const prendre = (champ) => {
    for (const nom of carte[champ] || []) {
      const k = nom.toLowerCase().replace(/[-_.]/g, '');
      if (v[k] !== undefined && v[k] !== '') return v[k];
    }
    return null;
  };
  const num = (x) => {
    if (x === null) return null;
    const n = Number(String(x).replace(',', '.').replace(/[^\d.-]/g, ''));
    return String(x).trim() !== '' && Number.isFinite(n) ? n : null;
  };
  const stock = num(prendre('stock'));
  return {
    fournisseur,
    ref: prendre('ref'),
    ean: prendre('ean'),
    designation: prendre('designation'),
    marque: prendre('marque'),
    prixAchatHT: num(prendre('prixAchat')),
    stock: stock ?? null,
    statutStock: stock === null ? 'inconnu' : stock > 0 ? 'en-stock' : 'rupture',
    poidsKg: num(prendre('poids')),
    dimensions: prendre('dimensions'),
    categorie: prendre('categorie'),
    images: [prendre('image')].filter(Boolean),
    description: prendre('description'),
    brut: v,
  };
}
