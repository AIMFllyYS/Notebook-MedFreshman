import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { closeReferenceMaterials } from './types.ts';

test('SemanticSearchManager 不再把用户提问拼进参考材料', () => {
  const source = readFileSync(new URL('./semanticSearch.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /用户提问：/);
  assert.match(source, /closeReferenceMaterials/);
  assert.match(source, /hybridSearch\(userMessage/);
});

test('closeReferenceMaterials 只加结构性收尾、不含用户原话', () => {
  assert.equal(closeReferenceMaterials(''), '');
  assert.equal(closeReferenceMaterials('  '), '  ');
  assert.equal(closeReferenceMaterials('页正文'), '页正文\n\n以上是参考材料');
  assert.doesNotMatch(closeReferenceMaterials('页正文'), /用户提问：/);
});
