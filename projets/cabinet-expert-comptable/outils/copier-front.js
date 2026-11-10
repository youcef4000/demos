// 1. Recopie les prompts des agents (source : agents/) dans la démo, pour l'écran « Agents IA ».
// 2. Recopie le site et l'application depuis la démo (source de vérité : sites/cabinet-expert-comptable/)
//    vers public/, servi par le serveur. La démo exécute dans le navigateur exactement le noyau du serveur.
// Un test (test/noyau.test.js) vérifie que les copies sont identiques.
import { cpSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ici = dirname(fileURLToPath(import.meta.url));
const demo = join(ici, '../../../sites/cabinet-expert-comptable');
const agents = join(ici, '../agents');
const cible = join(ici, '../public');
if (!existsSync(demo)) throw new Error(`Démo introuvable : ${demo}`);
rmSync(join(demo, 'app/agents'), { recursive: true, force: true });
cpSync(agents, join(demo, 'app/agents'), { recursive: true });
rmSync(cible, { recursive: true, force: true });
cpSync(demo, cible, { recursive: true });
console.log('agents/ → démo, démo → public/ : recopiés');
