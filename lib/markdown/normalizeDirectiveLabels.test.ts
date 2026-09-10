import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeDirectiveLabels } from "./normalizeDirectiveLabels.ts";

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

test('label 后的 mode="cloze" 不被吞进标题', () => {
  assert.equal(
    normalizeDirectiveLabels(':::memory{label="氨基酸等电点" mode="cloze"}'),
    ':::memory{label="氨基酸等电点" mode="cloze"}',
  );
});

test("label 后的 mode=cloze（值不带引号）不被吞进标题", () => {
  assert.equal(
    normalizeDirectiveLabels(':::memory{label="名词解释答题三问" mode=cloze}'),
    ':::memory{label="名词解释答题三问" mode=cloze}',
  );
});

test("单属性含空格的 memory label 原样（已定界）", () => {
  assert.equal(
    normalizeDirectiveLabels(':::memory{label="融合与 S 期"}'),
    ':::memory{label="融合与 S 期"}',
  );
});

test("单属性含特殊字符的 definition label 原样", () => {
  assert.equal(
    normalizeDirectiveLabels(':::definition{label="σ-p 超共轭"}'),
    ':::definition{label="σ-p 超共轭"}',
  );
});

test("不以 label= 开头的多属性花括号整段跳过", () => {
  assert.equal(
    normalizeDirectiveLabels(':::callout{kind=note label="题目"}'),
    ':::callout{kind=note label="题目"}',
  );
});

test("label 值内的公式 X= 不被误判成后续属性", () => {
  assert.equal(
    normalizeDirectiveLabels(':::derivation{label="核酸定量 A260=1.0"}'),
    ':::derivation{label="核酸定量 A260=1.0"}',
  );
});

test("未加引号的 label 后跟 mode=cloze 时只定界 label", () => {
  assert.equal(
    normalizeDirectiveLabels(":::memory{label=不带引号的标题 mode=cloze}"),
    ':::memory{label="不带引号的标题" mode=cloze}',
  );
});

test("多属性形状幂等：f(f(x)) === f(x)", () => {
  const samples = [
    ':::memory{label="氨基酸等电点" mode="cloze"}',
    ':::memory{label="名词解释答题三问" mode=cloze}',
    ":::memory{label=不带引号的标题 mode=cloze}",
    ':::memory{label="融合与 S 期"}',
    ':::callout{kind=note label="题目"}',
    ':::derivation{label="核酸定量 A260=1.0"}',
  ];
  for (const src of samples) {
    const once = normalizeDirectiveLabels(src);
    assert.equal(normalizeDirectiveLabels(once), once, src);
  }
});

// 以下两组钉住「属性边界必须按白名单判定」。若把边界退回 /\s+[\w-]+=/ 这种形状匹配，
// 这两组会立刻变红：正文里确有 2 处未加引号含公式、21 处标题内嵌 ASCII 引号的写法。
test("未加引号的 label 内含非属性公式 k= 时，整段仍算标题", () => {
  assert.equal(
    normalizeDirectiveLabels(":::pitfall{label=易错点：泊松分布中 k=0 不要漏掉}"),
    ':::pitfall{label="易错点：泊松分布中 k=0 不要漏掉"}',
  );
});

test("未加引号的 label 内含波函数 y= 时，整段仍算标题", () => {
  assert.equal(
    normalizeDirectiveLabels(":::example{label=波函数 y=10sin(10πt−x/100) cm}"),
    ':::example{label="波函数 y=10sin(10πt−x/100) cm"}',
  );
});

test("标题内嵌 ASCII 引号后仍有正文时，引号只是标题的一部分", () => {
  assert.equal(
    normalizeDirectiveLabels(':::insight{label="熵"的本质}'),
    ':::insight{label="“熵”的本质"}',
  );
});

test("引号内含白名单属性名时，边界从闭合引号之后才开始找", () => {
  assert.equal(
    normalizeDirectiveLabels(':::memory{label="用 width=3 画图" mode=cloze}'),
    ':::memory{label="用 width=3 画图" mode=cloze}',
  );
});

test("CRLF 行尾下多属性 memory 指令仍保留 mode", () => {
  const out = normalizeDirectiveLabels(':::memory{label="氨基酸等电点" mode="cloze"}\r\n**pH**\r\n:::\r\n');
  assert.ok(
    out.startsWith(':::memory{label="氨基酸等电点" mode="cloze"}\r\n'),
    `CRLF 多属性归一失败，实际首行：${JSON.stringify(out.split("\n")[0])}`,
  );
});
