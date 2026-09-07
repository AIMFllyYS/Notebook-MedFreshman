import assert from "node:assert/strict";
import { test } from "node:test";
import { stripFences, extractHtml, finalizeHtml, looksLikeHtmlDocument } from "./artifact.ts";

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
