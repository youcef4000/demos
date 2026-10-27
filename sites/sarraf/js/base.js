// Sarraf — stockage dans le téléphone (IndexedDB) : mémos, enregistrements audio, règlements.
// Les audios sont à part pour que la liste des mémos reste légère à charger.

const NOM = 'sarraf';
const VERSION = 1;
let ouverture;

function ouvrir() {
  ouverture ||= new Promise((ok, ko) => {
    const r = indexedDB.open(NOM, VERSION);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains('memos')) db.createObjectStore('memos', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('audios')) db.createObjectStore('audios');
      if (!db.objectStoreNames.contains('paiements')) db.createObjectStore('paiements', { keyPath: 'id' });
    };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ko(r.error);
  });
  return ouverture;
}

const attendre = (req) => new Promise((ok, ko) => ((req.onsuccess = () => ok(req.result)), (req.onerror = () => ko(req.error))));

async function magasin(nom, mode = 'readonly') {
  return (await ouvrir()).transaction(nom, mode).objectStore(nom);
}

export const tous = async (nom) => attendre((await magasin(nom)).getAll());
export const lire = async (nom, id) => attendre((await magasin(nom)).get(id));
export const ecrire = async (nom, valeur, id) => attendre((await magasin(nom, 'readwrite')).put(valeur, id));
export const effacer = async (nom, id) => attendre((await magasin(nom, 'readwrite')).delete(id));
export const vider = async (nom) => attendre((await magasin(nom, 'readwrite')).clear());

export const nouvelId = (p) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
