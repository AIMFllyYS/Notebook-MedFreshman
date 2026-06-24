import assert from "node:assert/strict";
import { test } from "node:test";
import normalizeDirectiveLabels from "./normalizeDirectiveLabels.ts";

test("含空格的 label 用 ASCII 双引号定界（LF）", () => {
  assert.equal(
    normalizeDirectiveLabels(":::example{label=SN2 构型翻转}"),
    ':::example{label="SN2 构型翻转"}',
  );
});

test("CRLF 行尾下含空格 label 仍被归一（回归：\\r 曾导致整行不匹配）", () => {
  const out = normalizeDirectiveLabels(":::example{label=SN2 构型翻转}\r\ncontent\r\n:::\r\n");
  assert.ok(
    out.includes(':::example{label="SN2 构型翻转"}\r'),
    `CRLF 归一失败，实际首行：${JSON.stringify(out.split("\n")[0])}`,
  );
  // \r 行尾必须保留，不得被吞
  assert.ok(out.startsWith(':::example{label="SN2 构型翻转"}\r\n'));
});

test("成对 ASCII 直引号转中文弯引号", () => {
  assert.equal(
    normalizeDirectiveLabels(':::insight{label=从"衣食住行"讲起}'),
    ':::insight{label="从“衣食住行”讲起"}',
  );
});

test("幂等：已定界的值再次归一不变", () => {
  const once = normalizeDirectiveLabels(":::example{label=SN2 构型翻转}");
  assert.equal(normalizeDirectiveLabels(once), once);
});

test("代码围栏内的伪指令行不被改写", () => {
  const src = "```\n:::example{label=a b}\n```";
  assert.equal(normalizeDirectiveLabels(src), src);
});

test("无 label/title 的指令与普通文本保持不变", () => {
  const src = "普通段落\n::video{id=ch01-1.4}\n:::note\n正文\n:::";
  assert.equal(normalizeDirectiveLabels(src), src);
});

test("无 :: 的文本走快速返回", () => {
  assert.equal(normalizeDirectiveLabels("纯文本无指令"), "纯文本无指令");
});
