import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseChatRequest } from './requestSchema';
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
