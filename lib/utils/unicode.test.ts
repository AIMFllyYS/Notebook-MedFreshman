import assert from 'node:assert/strict';
import { test } from 'node:test';
import { repairTextValues, truncateText, wellFormedText } from './unicode';

test('replaces lone surrogates without changing valid pairs, scripts or combining characters', () => {
  const valid = '中文📖🧬👩🏽‍💻e\u0301\n';
  assert.equal(wellFormedText(valid), valid);
  assert.equal(wellFormedText('a\ud83db\udc00c'), 'a�b�c');
  assert.equal(wellFormedText('\ud83d\ud83d\udc00\udc00'), '�\ud83d\udc00�');
});
test('code-point truncation cannot bisect the emoji at the 120-character boundary', () => {
  const text = 'a'.repeat(119) + '📖tail';
  assert.equal(truncateText(text, 120), 'a'.repeat(119) + '📖');
  assert.equal(truncateText(text, 119), 'a'.repeat(119));
  assert.equal(truncateText('x\ud83d', 2), 'x�');
  assert.equal(truncateText(text, 0), '');
  assert.equal(truncateText(text, -1), '');
  assert.equal(truncateText(text, NaN), '');
});
test('repairs nested message/tool text while preserving original history and binary objects', () => {
  const image = new Uint8Array([0xd8, 0x3d, 0, 255]);
  const url = new URL('https://example.invalid/image.png');
  const stable = { text: 'valid 📖' };
  const input = { messages: [{ text: 'old\ud83d', result: { value: ['bad\udc00'] } }], image, url, stable };
  const next = repairTextValues(input);
  assert.equal(next.messages[0].text, 'old�');
  assert.equal(next.messages[0].result.value[0], 'bad�');
  assert.equal(input.messages[0].text, 'old\ud83d');
  assert.equal(next.image, image); assert.equal(next.url, url); assert.equal(next.stable, stable);
  assert.equal(repairTextValues(stable), stable);
});
