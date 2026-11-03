// Réponses factices de GET /dealer/products, construites sur le format de la spécification equip.me
// (enveloppe « response », champs code_1c, fields, prices, available, files). Valeurs inventées.
export function page(numero, total, produits) {
  return {
    response: {
      success: true,
      page: numero,
      page_count: total,
      per_page: produits.length,
      total: produits.length * total,
      link_next: numero < total ? `https://api.equip.me/v1/dealer/products?page=${numero + 1}` : undefined,
      products: produits,
    },
  };
}

export const BLENDER = {
  code_1c: 129888,
  active: 1,
  catalog_type_id: 1,
  date_update: '2026-11-01 10:00:00',
  fields: {
    brand: 'HURAKAN',
    model: 'HKN-EXEMPLE',
    name: 'Blender professionnel (exemple)',
    description: 'Description fournisseur (exemple).',
    image: 'https://exemple.invalid/blender.jpg',
    add_images: ['https://exemple.invalid/blender-2.jpg'],
    delivery_time: '45',
    category_id: 12,
    weightlb: '11',
    widthin: '8',
    lengthin: '9',
    heightin: '20',
  },
  prices: [{ price_eur: '210.00', price_eur_rrc: '349.00' }],
  available: [{ stock: 'MSK', quantity_free: '7', reserve_unpaid: '0' }, { stock: 'EU1', quantity_free: '3' }],
  files: [{ type: 'manual', name: 'Notice', items: ['https://exemple.invalid/notice.pdf'] }],
};

export const PIECE = { ...BLENDER, code_1c: 555001, catalog_type_id: 2, fields: { ...BLENDER.fields, name: 'Joint de porte (pièce détachée)' } };
export const ARRETE = { ...BLENDER, code_1c: 129999, fields: { ...BLENDER.fields, name: 'Grill (exemple)', delivery_time: 'not_carry' }, available: [] };
