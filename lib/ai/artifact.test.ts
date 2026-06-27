import assert from "node:assert/strict";
import { test } from "node:test";
import { stripFences, extractHtml, finalizeHtml } from "./artifact.ts";

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

test("finalizeHtml：去围栏 + 提取 + 补全组合", () => {
  const raw = "```html\n<!DOCTYPE html>\n<html>\n<body>\n<script>hi\n```";
  const result = finalizeHtml(raw, false);
  assert.ok(result.startsWith("<!DOCTYPE html>"));
  assert.ok(result.includes("</script>"));
  assert.ok(result.includes("</body>"));
  assert.ok(result.includes("</html>"));
});
