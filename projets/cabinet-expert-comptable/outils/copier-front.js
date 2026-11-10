// Recopie le site et l'application depuis la démo (source de vérité : sites/cabinet-expert-comptable/)
// vers public/, servi par le serveur. La démo exécute dans le navigateur exactement le noyau du serveur.
// Un test (test/noyau.test.js) vérifie que les deux copies sont identiques.
import { cpSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ici = dirname(fileURLToPath(import.meta.url));
const source = join(ici, '../../../sites/cabinet-expert-comptable');
const cible = join(ici, '../public');
if (!existsSync(source)) throw new Error(`Démo introuvable : ${source}`);
rmSync(cible, { recursive: true, force: true });
cpSync(source, cible, { recursive: true });
console.log('public/ recopié depuis sites/cabinet-expert-comptable/');
