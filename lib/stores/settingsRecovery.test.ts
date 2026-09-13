import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decodeApiBackup, encodeApiBackup, mergeApiGroups, normalizeStoredSettings } from './settingsRecovery';

const group = { id: 'old-group', name: '我的模型', baseUrl: 'https://example.invalid/v1', apiKey: 'test-private-key', models: [{ id: 'old-model' }] };
test('legacy wrapped settings and invalid optional IDs retain every usable API group', () => {
  const data = normalizeStoredSettings(JSON.stringify({ state: { selectedModelId: null, customApiGroups: [group, { id: 'second', models: ['model-two'] }] }, version: 1 }));
  assert.equal((data.customApiGroups as unknown[]).length, 2);
  assert.equal('selectedModelId' in data, false);
  assert.equal((data.customApiGroups as typeof group[])[1].models[0].id, 'model-two');
});
test('portable API backups round trip keys, identity and model selection without plain key text', () => {
  const raw = encodeApiBackup([group], 'custom:old-group:old-model');
  assert.ok(!raw.includes(group.apiKey));
  assert.deepEqual(decodeApiBackup(raw), { groups: [group], selectedModelId: 'custom:old-group:old-model' });
});
test('import preserves newer existing credentials and adds missing models and groups', () => {
  const result = mergeApiGroups([{ ...group, apiKey: 'new-key' }], [{ ...group, models: [...group.models, { id: 'missing' }] }, { ...group, id: 'another' }]);
  assert.equal(result[0].apiKey, 'new-key');
  assert.equal(result[0].models.length, 2);
  assert.equal(result.length, 2);
});
