// Hooked Academy sur Cloudflare : le cœur du serveur (server/plateforme.js) dans un Durable Object
// avec sa base SQLite. Sur le VPS, c'est server/index.mjs qui le fait tourner.

import { DurableObject } from 'cloudflare:workers';
import { Plateforme } from '../server/plateforme.js';

export class Academy extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.app = new Plateforme(
      { sql: ctx.storage.sql, transactionSync: (fn) => ctx.storage.transactionSync(fn) },
      { base: '/hooked-academy', ip: (req) => req.headers.get('x-ha-ip') || '' },
    );
  }
  fetch(req) {
    return this.app.fetch(req);
  }
}
