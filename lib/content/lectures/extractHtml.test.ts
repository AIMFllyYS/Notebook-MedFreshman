import assert from "node:assert/strict";
import { test } from "node:test";
import { extractHtmlText, findUnsafeHtml } from "@/lib/content/lectures/extractHtml";

const HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{color:#000}.page{width:210mm}td{padding:2px}
</style></head><body>
<div class="page">
  <div class="page-header"><span class="chapter-badge">第一章</span><span class="page-title">基础液液萃取</span></div>
  <div class="section">
    <div class="section-title">分配系数</div>
    <div class="section-body">
      <div class="kv-card"><div class="k">分配系数 KD</div><div class="v">K<sub>D</sub>=[A]<sub>O</sub>/[A]<sub>W</sub>，π* 与 V<sup>O</sup></div></div>
      <table>
        <tr><th>参数</th><th>定义</th></tr>
        <tr><td>分配比 D</td><td>总浓度比 C<sub>O</sub>/C<sub>W</sub></td></tr>
      </table>
    </div>
  </div>
</div>
</body></html>`;

test("提取标题与正文，剥离 style", () => {
  const r = extractHtmlText(HTML);
  assert.ok(r.text.includes("基础液液萃取"));
  assert.ok(r.text.includes("分配系数"));
  assert.ok(!r.text.includes("width:210mm"), "style 内容不应出现");
  assert.ok(r.headings.includes("基础液液萃取"));
});

test("表格单元格以 | 保留列结构", () => {
  const r = extractHtmlText(HTML);
  assert.ok(r.text.includes("参数 | 定义"), r.text);
  assert.ok(r.text.includes("分配比 D | 总浓度比"), r.text);
});

test("上下标保留为 _ / ^ 前缀，公式不丢", () => {
  const r = extractHtmlText(HTML);
  assert.ok(r.text.includes("K_D"), r.text);
  assert.ok(r.text.includes("V^O"), r.text);
});

test("空壳 HTML 抛错而不是静默返回空", () => {
  assert.throws(() => extractHtmlText("<html><head><style>x{}</style></head><body></body></html>"));
  assert.throws(() => extractHtmlText("   "));
});

test("findUnsafeHtml：脚本/事件/外链被识别", () => {
  assert.ok(findUnsafeHtml('<div onclick="x()">a</div>').length > 0);
  assert.ok(findUnsafeHtml('<script>alert(1)</script>').length > 0);
  assert.ok(findUnsafeHtml('<img src="https://x.com/a.png">').length > 0);
  assert.ok(findUnsafeHtml('<a href="javascript:alert(1)">x</a>').length > 0);
  assert.ok(findUnsafeHtml('<meta http-equiv="refresh" content="0;url=https://x">').length > 0);
  assert.deepEqual(findUnsafeHtml('<meta charset="utf-8"><div><b>安全</b>自包含</div>'), []);
});
