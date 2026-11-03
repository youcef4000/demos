import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { parametresFiche, lireReponse } from '../src/claude.js';
import { SCHEMA_FICHE } from '../src/noyau/prompt-fiche.js';

const DEMO = new URL('../../../sites/maxi-gastro-le-passe/app/data/atelier.js', import.meta.url);

test('requête Claude : consigne en cache, sortie structurée, effort explicite', () => {
  const p = parametresFiche({ donnees: { ref: '1' }, motsCles: ['arrière bar'], ficheActuelle: '' });
  assert.equal(p.model, process.env.CLAUDE_MODELE || 'claude-opus-5-5');
  assert.deepEqual(p.system[0].cache_control, { type: 'ephemeral' });
  assert.equal(p.output_config.format.type, 'json_schema');
  assert.equal(p.output_config.format.schema, SCHEMA_FICHE);
  assert.ok(['low', 'medium', 'high', 'xhigh', 'max'].includes(p.output_config.effort));
  assert.ok(!('thinking' in p), 'Opus 5.5 : pas de paramètre thinking');
  assert.match(p.messages[0].content, /<donnees_fournisseur>/);
});

test('réponse Claude : la fiche d\'exemple de la démo passe tous les contrôles', async () => {
  if (!existsSync(DEMO)) return;
  const { EXEMPLE } = await import(DEMO);
  const r = lireReponse({ stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(EXEMPLE.fiche) }], usage: {} }, EXEMPLE.donnees);
  assert.deepEqual(r.controles.orphelins, []);
  assert.deepEqual(r.controles.longueurs, []);
  assert.equal(r.controles.publiable, true);
});

test('réponse Claude : refus et coupure gérés', () => {
  assert.throws(() => lireReponse({ stop_reason: 'refusal', stop_details: { category: 'cyber' }, content: [] }, {}), /décliné/);
  assert.throws(() => lireReponse({ stop_reason: 'max_tokens', content: [] }, {}), /coupée/);
});
