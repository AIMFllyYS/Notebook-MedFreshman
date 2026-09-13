import assert from "node:assert/strict";
import { test } from "node:test";
import type { ModelMessage } from "ai";
import {
  collectRequestArtifacts,
  compactArtifactMessages,
  compactUiParts,
  formatArtifactCatalog,
  htmlToSummary,
  stubLargeHtml,
} from "./compactArtifacts.ts";

test("stubLargeHtml 把大块 html 换成占位", () => {
  const html = `<html><head><title>概率滑块</title></head><body>${"x".repeat(500)}</body></html>`;
  const out = stubLargeHtml(`见演示：${html}`);
  assert.match(out, /HTML 产物已省略：概率滑块/);
  assert.doesNotMatch(out, /xxxxx/);
  assert.match(out, /getArtifact/);
});

test("compactUiParts：renderInteractive 只留 id+标题+摘要", () => {
  const parts = compactUiParts([
    {
      type: "tool-renderInteractive",
      toolCallId: "c1",
      state: "output-available",
      input: { title: "滑块", prompt: "很长的生成提示词".repeat(10) },
      output: {
        text: "开始生成",
        artifactId: "art_c1",
        title: "滑块",
        prompt: "很长的生成提示词".repeat(10),
      },
    },
  ]);
  const output = (parts[0] as { output: Record<string, unknown> }).output;
  assert.equal(output.artifactId, "art_c1");
  assert.equal(output.title, "滑块");
  assert.ok(typeof output.summary === "string");
  assert.equal("prompt" in output, false);
  assert.equal("html" in output, false);
});

test("compactArtifactMessages 去掉 model 历史里的 html", () => {
  const html = `<html><body>${"div".repeat(200)}</body></html>`;
  const messages: ModelMessage[] = [{ role: "assistant", content: `产物：${html}` }];
  const out = compactArtifactMessages(messages);
  assert.equal(typeof out[0]!.content, "string");
  assert.doesNotMatch(String(out[0]!.content), /divdiv/);
  assert.match(String(out[0]!.content), /getArtifact/);
});

test("formatArtifactCatalog 不含 html", () => {
  const text = formatArtifactCatalog([
    { id: "art_1", title: "滑块", summary: "看参数变化", html: "<html>secret</html>" },
  ]);
  assert.match(text, /art_1/);
  assert.match(text, /滑块/);
  assert.doesNotMatch(text, /secret/);
  assert.match(text, /getArtifact/);
});

test("collectRequestArtifacts 只收集当前会话引用，不混入全局最近产物", () => {
  const items = collectRequestArtifacts(
    [{
      parts: [{
        type: "tool-renderInteractive",
        state: "output-available",
        output: { artifactId: "art_msg" },
      }],
    }],
    {
      order: ["art_store"],
      byId: {
        art_msg: { id: "art_msg", title: "消息里的", html: "<p>hello world</p>" },
        art_store: { id: "art_store", title: "仓库里的", html: "<p>other</p>" },
      },
    },
  );
  assert.equal(items.some((i) => i.id === "art_msg" && i.title === "消息里的"), true);
  assert.equal(items.some((i) => i.id === "art_store"), false);
  assert.ok(items.every((i) => !i.summary.includes("<")));
  assert.equal(htmlToSummary("<p>hello world</p>"), "hello world");
});

test('HTML 摘要边界保留完整 emoji，旧摘要修正不改写原件', () => {
  assert.equal(htmlToSummary(`<p>${'a'.repeat(119)}📖tail</p>`), 'a'.repeat(119) + '📖');
  const item = { id: 'art_old', title: '旧\udc00标题', summary: 'a'.repeat(119) + '\ud83d', html: '<p>原件📖</p>' };
  const before = { ...item };
  assert.doesNotMatch(formatArtifactCatalog([item]), /[\uD800-\uDFFF]/gu);
  const [part] = compactUiParts([{ type: 'tool-renderInteractive', state: 'output-available', output: item }]);
  assert.equal(part.output.summary, 'a'.repeat(119) + '�');
  assert.deepEqual(item, before);
});

test('新会话不附带全局产物，getArtifact 引用仍保留完整原件', () => {
  const artifact = { id: 'art_old', title: '旧产物', html: '<p>原件📖</p>' };
  const store = { order: ['art_old'], byId: { art_old: artifact } };
  assert.deepEqual(collectRequestArtifacts([], store), []);
  const part = { type: 'tool-getArtifact', state: 'output-available', output: { artifactId: 'art_old' } };
  const items = collectRequestArtifacts([{ parts: [part, part] }], store);
  assert.equal(items.length, 1);
  assert.equal(items[0].html, artifact.html);
  assert.equal(store.byId.art_old, artifact);
});

test('产物目录去重后只保留当前会话最近 16 个引用', () => {
  const messages = Array.from({ length: 20 }, (_, i) => ({ parts: [{
    type: 'tool-renderInteractive', state: 'output-available', output: { artifactId: `art_${i}` },
  }] }));
  const items = collectRequestArtifacts(messages, { order: [], byId: {} });
  assert.deepEqual(items.map((item) => item.id), Array.from({ length: 16 }, (_, i) => `art_${19 - i}`));
});
