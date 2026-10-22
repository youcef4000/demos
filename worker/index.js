// Worker « demos » : sert le dossier sites/ tel quel (fichiers statiques).
// Seules les adresses du serveur de Hooked Academy passent par ce code (wrangler.jsonc, run_worker_first) :
// /hooked-academy/api/* et /hooked-academy/media/* sont confiées au Durable Object de la plateforme.

import { Academy } from './academy.js';

export { Academy };

const SERVER = /^\/hooked-academy\/(api|media)\//;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!SERVER.test(url.pathname)) return env.ASSETS.fetch(request);
    // L'adresse IP vient de Cloudflare : l'en-tête envoyé par le visiteur est écrasé
    const headers = new Headers(request.headers);
    headers.set('x-ha-ip', request.headers.get('cf-connecting-ip') || '');
    const stub = env.ACADEMY.get(env.ACADEMY.idFromName('main'));
    return stub.fetch(new Request(request, { headers }));
  },
};
