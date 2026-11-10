// Noyau du cabinet — base de données en mémoire (démo dans le navigateur, tests).
// Même interface que la base SQLite du serveur (projets/cabinet-expert-comptable/src/base.js) :
//   tous(col) · liste(col, filtre) · lire(col, id) · ecrire(col, doc) · supprimer(col, id) · param(cle) · ecrireParam(cle, v)
// apresEcriture(instantane) est appelé après chaque modification (la démo s'en sert pour enregistrer dans le navigateur).

export function creerBaseMemoire(depart = {}, { apresEcriture } = {}) {
  const cols = new Map();
  const params = new Map(Object.entries(depart.parametres || {}));
  for (const [col, docs] of Object.entries(depart.collections || {})) cols.set(col, new Map(docs.map((d) => [d.id, d])));
  const col = (c) => {
    if (!cols.has(c)) cols.set(c, new Map());
    return cols.get(c);
  };
  const copie = (d) => (d == null ? d : structuredClone(d));
  const signaler = () => apresEcriture?.(instantane);

  function instantane() {
    return { collections: Object.fromEntries([...cols].map(([c, m]) => [c, [...m.values()]])), parametres: Object.fromEntries(params) };
  }

  return {
    tous: (c) => [...col(c).values()].map(copie),
    liste: (c, filtre = {}) => [...col(c).values()].filter((d) => Object.entries(filtre).every(([k, v]) => d[k] === v)).map(copie),
    lire: (c, id) => copie(col(c).get(id) ?? null),
    ecrire(c, doc) {
      if (!doc.id) throw new Error('Document sans identifiant');
      col(c).set(doc.id, copie(doc));
      signaler();
      return copie(doc);
    },
    supprimer(c, id) {
      col(c).delete(id);
      signaler();
    },
    param: (cle) => copie(params.get(cle) ?? null),
    ecrireParam(cle, v) {
      params.set(cle, copie(v));
      signaler();
    },
    instantane,
  };
}
