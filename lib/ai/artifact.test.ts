import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ARTIFACT_SYSTEM,
  stripFences,
  extractHtml,
  finalizeHtml,
  looksLikeHtmlDocument,
} from "./artifact.ts";

function usableCapabilityLine(prompt: string): string {
  const match = prompt.match(/可正常使用[^\n]*/);
  assert.ok(match, "提示词应有「可正常使用」能力句");
  return match[0];
}

// ── stripFences ────────────────────────────────────────────────

test("stripFences：去除 ```html 围栏", () => {
  assert.equal(
    stripFences("```html\n<!DOCTYPE html>\n```"),
    "<!DOCTYPE html>",
  );
});

test("stripFences：去除无语言标记的围栏", () => {
  assert.equal(
    stripFences("```\n<div>hi</div>\n```"),
    "<div>hi</div>",
  );
});

test("stripFences：无围栏时原样返回（trim）", () => {
  assert.equal(stripFences("  <div>hi</div>  "), "<div>hi</div>");
});

// ── extractHtml ────────────────────────────────────────────────

test("extractHtml：优先匹配 DOCTYPE 到 </html>", () => {
  const raw = '解释文字\n<!DOCTYPE html>\n<html><body>hi</body></html>\n更多文字';
  assert.equal(
    extractHtml(raw),
    "<!DOCTYPE html>\n<html><body>hi</body></html>",
  );
});

test("extractHtml：无 DOCTYPE 时回退到 <html>...</html>", () => {
  const raw = '前缀\n<html lang="zh"><body>hi</body></html>\n后缀';
  assert.equal(
    extractHtml(raw),
    '<html lang="zh"><body>hi</body></html>',
  );
});

test("extractHtml：无任何 html 标签时返回原文", () => {
  assert.equal(extractHtml("just text"), "just text");
});

test("extractHtml：截断且没有 </html> 时从 DOCTYPE 截到末尾", () => {
  const raw = "先规划结构\n<!DOCTYPE html>\n<html lang=\"zh\">\n<body><div>hi</div>";
  assert.equal(
    extractHtml(raw),
    "<!DOCTYPE html>\n<html lang=\"zh\">\n<body><div>hi</div>",
  );
});

test("extractHtml：从解释文字中间的 html 围栏取出文档", () => {
  const raw = "说明如下：\n```html\n<!DOCTYPE html><html><body>图</body></html>\n```\n结束";
  assert.equal(extractHtml(raw), "<!DOCTYPE html><html><body>图</body></html>");
});

test("extractHtml：截断的未闭合围栏也能提取", () => {
  const raw = "```html\n<!DOCTYPE html>\n<html>\n<body><script>x";
  assert.ok(extractHtml(raw).startsWith("<!DOCTYPE html>"));
  assert.ok(extractHtml(raw).includes("<script>x"));
});

test("extractHtml：大小写不敏感", () => {
  const raw = "<!doctype HTML><html></html>";
  assert.equal(extractHtml(raw), "<!doctype HTML><html></html>");
});

// ── finalizeHtml ───────────────────────────────────────────────

test("finalizeHtml：完整 HTML 不变", () => {
  const html = "<!DOCTYPE html>\n<html>\n<body>\n<p>hi</p>\n</body>\n</html>";
  assert.equal(finalizeHtml(html, false), html);
});

test("finalizeHtml：截断时丢弃半截标签", () => {
  const html = "<!DOCTYPE html>\n<html>\n<body>\n<p>hi</p>\n</body>\n</html>\n<scr";
  const result = finalizeHtml(html, true);
  assert.ok(!result.endsWith("<scr"));
  assert.ok(result.endsWith("</html>"));
});

test("finalizeHtml：截断时补全未闭合的 script 标签", () => {
  const html = "<!DOCTYPE html>\n<html>\n<body>\n<script>console.log(1)";
  const result = finalizeHtml(html, true);
  assert.ok(result.includes("</script>"), "应补全 </script>");
  assert.ok(result.includes("</body>"), "应补全 </body>");
  assert.ok(result.includes("</html>"), "应补全 </html>");
});

test("finalizeHtml：多个未闭合 script 全部补全", () => {
  const html = "<!DOCTYPE html>\n<html>\n<body>\n<script>a\n<script>b";
  const result = finalizeHtml(html, false);
  const closeCount = (result.match(/<\/script>/g) || []).length;
  assert.equal(closeCount, 2);
});

test("finalizeHtml：未截断时不补全已闭合的标签", () => {
  const html = "<!DOCTYPE html>\n<html>\n<body>\n<script>x</script>\n</body>\n</html>";
  const result = finalizeHtml(html, false);
  assert.equal(result, html);
});

test("finalizeHtml：空字符串返回空", () => {
  assert.equal(finalizeHtml("", false), "");
});

test("looksLikeHtmlDocument：识别完整文档并拒绝纯文本", () => {
  assert.equal(looksLikeHtmlDocument("<!DOCTYPE html><html></html>"), true);
  assert.equal(looksLikeHtmlDocument("<html lang=\"zh\"><body>hi</body></html>"), true);
  assert.equal(looksLikeHtmlDocument("just text"), false);
  assert.equal(looksLikeHtmlDocument(""), false);
});

test("looksLikeHtmlDocument：思考前缀 + 截断骨架仍视为 HTML", () => {
  assert.equal(
    looksLikeHtmlDocument("<!DOCTYPE html>\n<head><style>x</style></head><body><div>hi"),
    true,
  );
  assert.equal(
    looksLikeHtmlDocument("思考中\n<!DOCTYPE html>\n<body><div>hi</div>"),
    true,
  );
});

test("finalizeHtml：思考前缀的截断文档可提取并补全", () => {
  const raw = "我先设计布局\n<!DOCTYPE html>\n<html>\n<body>\n<div>滑块</div>";
  const result = finalizeHtml(raw, true);
  assert.ok(result.startsWith("<!DOCTYPE html>"));
  assert.ok(!result.includes("我先设计布局"));
  assert.ok(result.includes("</body>"));
  assert.ok(result.includes("</html>"));
  assert.equal(looksLikeHtmlDocument(result), true);
});

test("finalizeHtml：去围栏 + 提取 + 补全组合", () => {
  const raw = "```html\n<!DOCTYPE html>\n<html>\n<body>\n<script>hi\n```";
  const result = finalizeHtml(raw, false);
  assert.ok(result.startsWith("<!DOCTYPE html>"));
  assert.ok(result.includes("</script>"));
  assert.ok(result.includes("</body>"));
  assert.ok(result.includes("</html>"));
});

// ── ARTIFACT_SYSTEM 与沙箱能力对齐 ─────────────────────────────

test("ARTIFACT_SYSTEM：不再承诺可用 localStorage 或相对路径 fetch", () => {
  const usable = usableCapabilityLine(ARTIFACT_SYSTEM);
  assert.doesNotMatch(usable, /localStorage/i);
  assert.doesNotMatch(usable, /sessionStorage/i);
  assert.doesNotMatch(usable, /IndexedDB/i);
  assert.doesNotMatch(usable, /fetch/i);

  assert.match(ARTIFACT_SYSTEM, /不可用/);
  assert.match(ARTIFACT_SYSTEM, /localStorage/);
  assert.match(ARTIFACT_SYSTEM, /相对路径/);
  assert.match(ARTIFACT_SYSTEM, /fetch\('\/api\//);
  assert.match(ARTIFACT_SYSTEM, /内联/);
  assert.match(ARTIFACT_SYSTEM, /内存变量/);
});

test("ARTIFACT_SYSTEM：仍鼓励 CDN / canvas / 动画等可视化能力", () => {
  const usable = usableCapabilityLine(ARTIFACT_SYSTEM);
  assert.match(usable, /CDN/);
  assert.match(usable, /Canvas/i);
  assert.match(usable, /SVG/);
  assert.match(usable, /动画/);
  assert.match(usable, /alert/);
  assert.match(usable, /confirm/);
  assert.match(usable, /表单/);
  assert.match(usable, /弹窗/);
  assert.match(usable, /下载/);

  assert.match(ARTIFACT_SYSTEM, /Chart\.js/);
  assert.match(ARTIFACT_SYSTEM, /D3/);
  assert.match(ARTIFACT_SYSTEM, /Three\.js/);
  assert.match(ARTIFACT_SYSTEM, /ECharts/);
  assert.match(ARTIFACT_SYSTEM, /GSAP/);
  assert.match(ARTIFACT_SYSTEM, /应当.*引库/);
  assert.match(ARTIFACT_SYSTEM, /滑块\/按钮\/拖拽/);
});
