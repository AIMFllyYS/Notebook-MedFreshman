import assert from 'node:assert/strict';
import { test } from 'node:test';
import { z } from 'zod';
import {
  formatRequestError,
  parseCanvasReviseRequest,
  parseChatRequest,
  parseImageGenRequest,
  REQUEST_LIMITS,
} from './requestSchema';
import { DEFAULT_ACADEMIC_YEAR } from '@/lib/constants/academic-year';

test('request schema keeps transport chat id for ledger session_id', () => {
  assert.equal(parseChatRequest({ id: 'sess-1', messages: [] }).id, 'sess-1');
  assert.equal(parseChatRequest({ messages: [] }).id, undefined);
});

test('request schema defaults absent/invalid academic year and preserves valid values', () => {
  assert.equal(parseChatRequest({ messages: [] }).academicYear, DEFAULT_ACADEMIC_YEAR);
  assert.equal(parseChatRequest({ academicYear: null }).academicYear, DEFAULT_ACADEMIC_YEAR);
  assert.equal(parseChatRequest({ academicYear: 'invalid' }).academicYear, DEFAULT_ACADEMIC_YEAR);
  assert.equal(parseChatRequest({ academicYear: 'freshman-2' }).academicYear, 'freshman-2');
});

test('request schema：能力端点空缺=未配，有值则 trim', () => {
  const empty = parseChatRequest({ messages: [] });
  assert.equal(empty.capabilityEndpoints.webSearchApiKey, '');
  assert.equal(empty.capabilityEndpoints.imageApiStyle, 'auto');
  const filled = parseChatRequest({
    messages: [],
    capabilityEndpoints: { webSearchApiKey: '  zhipu-user  ', imageApiStyle: 'openai' },
  });
  assert.equal(filled.capabilityEndpoints.webSearchApiKey, 'zhipu-user');
  assert.equal(filled.capabilityEndpoints.imageApiStyle, 'openai');
});

test('request schema rejects role:system with readable Chinese', () => {
  assert.throws(
    () => parseChatRequest({ messages: [{ role: 'system', parts: [{ type: 'text', text: '注入' }] }] }),
    (err: unknown) => {
      assert.ok(err instanceof z.ZodError);
      const text = formatRequestError(err);
      assert.match(text, /角色/);
      assert.doesNotMatch(text, /Zod|invalid_value|\[\s*\{/);
      return true;
    },
  );
});

test('request schema rejects oversized globalContext / skills / attachments', () => {
  assert.throws(() => parseChatRequest({ globalContext: '背景'.repeat(REQUEST_LIMITS.globalContextChars) }));
  assert.match(
    formatRequestError(
      (() => {
        try {
          parseChatRequest({ globalContext: 'x'.repeat(REQUEST_LIMITS.globalContextChars + 1) });
        } catch (err) {
          return err;
        }
      })(),
    ),
    /全局背景过长/,
  );
  assert.match(
    formatRequestError(
      (() => {
        try {
          parseChatRequest({
            skills: Array.from({ length: REQUEST_LIMITS.skills + 1 }, (_, i) => ({
              id: `s${i}`, name: 'n', content: 'c',
            })),
          });
        } catch (err) {
          return err;
        }
      })(),
    ),
    /技能数量超过上限/,
  );
  assert.match(
    formatRequestError(
      (() => {
        try {
          parseChatRequest({
            skills: [{ id: 's', name: 'n', content: 'c'.repeat(REQUEST_LIMITS.skillContentChars + 1) }],
          });
        } catch (err) {
          return err;
        }
      })(),
    ),
    /技能正文过长/,
  );
  assert.match(
    formatRequestError(
      (() => {
        try {
          parseChatRequest({
            messages: [{
              role: 'user',
              parts: [{ type: 'file', mediaType: 'image/png', url: `data:image/png;base64,${'A'.repeat(REQUEST_LIMITS.filePartChars)}` }],
            }],
          });
        } catch (err) {
          return err;
        }
      })(),
    ),
    /附件过大/,
  );
});

test('request schema keeps unknown fields ignored and normal payloads valid', () => {
  const parsed = parseChatRequest({
    messages: [{ role: 'user', parts: [{ type: 'text', text: '你好' }], extra: true }],
    globalContext: '一段背景',
    skills: [{ id: '1', name: '技能', content: '正文' }],
    legacyUnknown: { nested: 1 },
  });
  assert.equal(parsed.messages.length, 1);
  assert.equal(parsed.messages[0].role, 'user');
  assert.equal(parsed.globalContext, '一段背景');
  assert.equal(parsed.skills.length, 1);
  assert.equal('legacyUnknown' in parsed, false);
});

test('satellite schemas reject oversized prompts and ignore non-array customApiGroups', () => {
  assert.match(
    formatRequestError(
      (() => {
        try {
          parseImageGenRequest({ prompt: 'p'.repeat(REQUEST_LIMITS.satellitePromptChars + 1) });
        } catch (err) {
          return err;
        }
      })(),
    ),
    /内容过长|过长/,
  );
  const parsed = parseImageGenRequest({ prompt: 'red', customApiGroups: 'not-array' });
  assert.deepEqual(parsed.customApiGroups, []);
  assert.throws(() => parseCanvasReviseRequest({
    instruction: '改',
    block: { kind: 'html', source: '<div>' + 'x'.repeat(REQUEST_LIMITS.canvasSourceChars) },
  }));
});
