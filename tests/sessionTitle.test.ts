import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { join } from "node:path";
import {
  DEFAULT_SESSION_TITLE_MODEL,
  buildFallbackSessionTitle,
  sanitizeSessionTitle,
} from "@/lib/chat/sessionTitle";

const root = process.cwd();

test("session title generator defaults to SiliconFlow cheap Qwen3-8B model", () => {
  assert.equal(DEFAULT_SESSION_TITLE_MODEL, "Qwen/Qwen3-8B");
});

test("sanitizeSessionTitle returns one-line plain text around twenty Chinese characters", () => {
  const title = sanitizeSessionTitle("《那个分子和青蒿素背后的化学逻辑：从结构到反应》\n解释如下：");

  assert.equal(title, "那个分子和青蒿素背后的化学逻辑：从结构");
  assert.ok(!/[《》\n\r]/.test(title));
  assert.ok(title.length <= 22);
});

test("buildFallbackSessionTitle strips quotes and collapses whitespace", () => {
  const title = buildFallbackSessionTitle("  针对当前页面这段原文：\n\n> 样本空间 Ω 与事件 A\n\n请总结一下  ");

  assert.equal(title, "样本空间 Ω 与事件 A 请总结一下");
});

test("useChat generates first-turn titles through the lightweight title endpoint", () => {
  const source = readFileSync(join(root, "lib/hooks/useChat.ts"), "utf8");

  assert.match(source, /\/api\/chat-title/);
  assert.match(source, /buildFallbackSessionTitle/);
  assert.doesNotMatch(source, /content\.slice\(0,\s*15\)/);
});
