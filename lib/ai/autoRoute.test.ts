import assert from 'node:assert/strict';
import { test } from 'node:test';
import { selectAutomaticModels } from './autoRoute';
import { getModelInfo } from './models';
import { relayModelConfig } from './relayConfig';

const input = { hasImages: false, estimatedTokens: 100, text: '解释概念', thinking: false };
test('automatic routes stay within available fast/free candidates', () => {
  const ids = selectAutomaticModels(input, () => true);
  assert.equal(ids.length, 3);
  assert.ok(ids.every((id) => ['快速模型', '免费模型'].includes(getModelInfo(id)!.group)));
  assert.ok(!ids.includes('Qwen/Qwen3.7-Flash'));
  assert.deepEqual(selectAutomaticModels(input, () => false), []);
});
test('automatic vision never falls back to a text-only or premium model', () => {
  assert.deepEqual(selectAutomaticModels({ ...input, hasImages: true }, () => true), ['deepseek/deepseek-v4.1-flash']);
  assert.deepEqual(selectAutomaticModels({ ...input, hasImages: true }, () => false), []);
  assert.deepEqual(selectAutomaticModels({ ...input, estimatedTokens: 2_000_000 }, () => true), []);
});
test('relay preserves exact IDs and has explicit, validated protocol overrides', () => {
  assert.equal(relayModelConfig('deepseek', '').thinkingRequestStyle, 'openai-reasoning-effort');
  assert.deepEqual(relayModelConfig('deepseek', JSON.stringify({ deepseek: { apiModelId: 'DeepSeek V4.1 flash', thinkingRequestStyle: 'none', enabled: false } })), {
    apiModelId: 'DeepSeek V4.1 flash', thinkingRequestStyle: 'none', enabled: false,
  });
  assert.throws(() => relayModelConfig('x', '{oops'), /配置格式/);
});
