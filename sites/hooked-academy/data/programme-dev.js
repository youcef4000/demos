// Formation Sites & Apps (track « dev ») : modules D00 à D15, réunis à partir de trois fichiers.
// Partie 1 (p4) : programme-dev-1.js · Partie 2 (p5) : programme-dev-2.js · Partie 3 (p6) : programme-dev-3.js
// Thème visuel « code » des vidéos : motion/dev.css et motion/scenes-dev.js (classe .is-dev posée par engine.js).
// Voix off : enregistrée par le formateur dans le studio (texte « say » de chaque scène = prompteur).

import { DEV_P1 } from './programme-dev-1.js';
import { DEV_P2 } from './programme-dev-2.js';
import { DEV_P3 } from './programme-dev-3.js';

export const MODULES_DEV = [...DEV_P1, ...DEV_P2, ...DEV_P3];
