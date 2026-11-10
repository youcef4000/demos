// Accès aux données : le serveur du cabinet (version réelle) ou la démo (tout dans le navigateur).
// config.json vaut { "mode": "demo" } sur GitHub Pages ; le serveur répond { "mode": "serveur" } à la même adresse.
// Les deux transports exposent les mêmes fonctions : connexion, appel, telecharger, deposerFichier, urlFichier.

let promesse;
export function client() {
  promesse ||= (async () => {
    let mode = 'demo';
    try {
      const r = await fetch(new URL('../config.json', import.meta.url), { cache: 'no-store' });
      if (r.ok) mode = (await r.json()).mode || 'demo';
    } catch {}
    if (mode === 'serveur') return clientServeur();
    const { creerDemo } = await import('./demo.js');
    return creerDemo();
  })();
  return promesse;
}

class ErreurAppel extends Error {
  constructor(statut, message) {
    super(message);
    this.statut = statut;
  }
}

function clientServeur() {
  const base = new URL('../../api', import.meta.url).pathname;
  async function requete(methode, chemin, corps) {
    const r = await fetch(base + chemin, {
      method: methode,
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json', 'x-cabinet': '1' },
      body: corps === undefined || methode === 'GET' ? undefined : JSON.stringify(corps),
    });
    return r;
  }
  async function json(r) {
    const t = r.headers.get('content-type') || '';
    const d = t.includes('json') ? await r.json() : null;
    if (!r.ok) throw new ErreurAppel(r.status, d?.erreur || `Erreur ${r.status}`);
    return d;
  }
  return {
    mode: 'serveur',
    async session() {
      const r = await requete('GET', '/session');
      return r.ok ? (await r.json()).utilisateur : null;
    },
    async connexion(email, motDePasse) {
      return (await json(await requete('POST', '/connexion', { email, motDePasse }))).utilisateur;
    },
    async deconnexion() {
      await requete('POST', '/deconnexion', {});
    },
    async appel(methode, chemin, corps) {
      return json(await requete(methode, chemin, corps));
    },
    async telecharger(chemin) {
      const r = await requete('GET', chemin);
      if (!r.ok) await json(r);
      const nom = decodeURIComponent((r.headers.get('content-disposition') || '').match(/filename\*=UTF-8''([^;]+)/)?.[1] || 'export.xlsx');
      return { nom, blob: await r.blob() };
    },
    async deposerFichier(fichier) {
      const r = await fetch(`${base}/fichiers`, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': fichier.type || 'application/octet-stream', 'x-nom': encodeURIComponent(fichier.name), 'x-cabinet': '1' }, body: fichier });
      return json(r);
    },
    async urlFichier(f) {
      return `${base}/fichiers/${encodeURIComponent(f.ref)}`;
    },
    exemples: null,
  };
}

export { ErreurAppel };
