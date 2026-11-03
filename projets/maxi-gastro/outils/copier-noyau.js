// Recopie le noyau partagé depuis la démo (source de vérité) vers le moteur.
// La démo exécute dans le navigateur exactement le code qui tourne sur le serveur.
import { copyFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ici = dirname(fileURLToPath(import.meta.url));
const source = join(ici, '../../../sites/maxi-gastro-le-passe/app/noyau');
const cible = join(ici, '../src/noyau');
for (const f of readdirSync(source).filter((n) => n.endsWith('.js'))) {
  copyFileSync(join(source, f), join(cible, f));
  console.log(`noyau/${f} copié`);
}
