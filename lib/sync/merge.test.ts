import assert from "node:assert/strict";
import { test } from "node:test";
import type { ChatMessage } from "@/lib/types/chat";
import { isRemoteNewer, mergeChatMessages, mergeChatSessionPayloads } from "./merge.ts";
import type { ChatSessionSyncPayload } from "./types.ts";

function msg(id: string, text: string, timestamp: number): ChatMessage {
  return {
    id,
    role: "user",
    parts: [{ type: "text", text }],
    timestamp,
  };
}

test("mergeChatMessages unions by id and does not drop either side", () => {
  const merged = mergeChatMessages(
    [msg("a", "local-a", 1), msg("b", "local-b", 2)],
    [msg("a", "remote-a-longer", 3), msg("c", "remote-c", 4)],
  );
  assert.deepEqual(new Set(merged.map((m) => m.id)), new Set(["a", "b", "c"]));
  assert.deepEqual(merged.map((m) => m.id), ["b", "a", "c"]);
  const a = merged.find((m) => m.id === "a");
  assert.equal(a && "parts" in a && a.parts[0].type === "text" ? a.parts[0].text : "", "remote-a-longer");
});

test("mergeChatSessionPayloads reports newly added remote ids", () => {
  const local: ChatSessionSyncPayload = {
    v: 1,
    meta: {
      id: "s1",
      title: "local",
      createdAt: 1,
      updatedAt: 10,
      messageCount: 1,
      artifactIds: ["art-1"],
    },
    messages: [msg("m1", "one", 1)],
  };
  const remote: ChatSessionSyncPayload = {
    v: 1,
    meta: {
      id: "s1",
      title: "remote",
      createdAt: 1,
      updatedAt: 20,
      messageCount: 2,
      artifactIds: ["art-2"],
    },
    messages: [msg("m1", "one", 1), msg("m2", "two", 2)],
  };
  const result = mergeChatSessionPayloads(local, remote);
  assert.equal(result.added, 1);
  assert.deepEqual(result.payload.messages.map((m) => m.id), ["m1", "m2"]);
  assert.deepEqual(result.payload.meta.artifactIds, ["art-1", "art-2"]);
  assert.equal(result.payload.meta.title, "remote");
});

test("pickRicherMessage 在一侧已 compact 时仍选 compact 规范，不靠未压缩 JSON 长度", () => {
  const fat: ChatMessage = {
    id: "m1",
    role: "assistant",
    timestamp: 10,
    parts: [
      {
        type: "tool-getCurrentPage",
        toolCallId: "c1",
        state: "output-available",
        input: {},
        output: { text: "【页】\n\n" + "很长的笔记正文".repeat(80), contextKey: "page:a/b/c" },
      },
      { type: "text", text: "短答", state: "done" },
    ],
  };
  const slim: ChatMessage = {
    id: "m1",
    role: "assistant",
    timestamp: 10,
    parts: [
      {
        type: "tool-getCurrentPage",
        toolCallId: "c1",
        state: "output-available",
        input: {},
        output: { text: "【已加载】getCurrentPage：page:a/b/c。需要时再调用该工具取回全文。", contextKey: "page:a/b/c" },
      },
      { type: "text", text: "短答", state: "done" },
    ],
  };
  const merged = mergeChatMessages([fat], [slim]);
  const page = merged[0].parts.find((p) => p.type === "tool-getCurrentPage") as { output: { text: string } };
  assert.match(page.output.text, /【已加载】/);
  assert.doesNotMatch(page.output.text, /很长的笔记正文/);
});

test("isRemoteNewer treats missing baseline as newer", () => {
  assert.equal(isRemoteNewer("2026-01-02T00:00:00.000Z", undefined), true);
  assert.equal(isRemoteNewer("2026-01-02T00:00:00.000Z", "2026-01-03T00:00:00.000Z"), false);
  assert.equal(isRemoteNewer("2026-01-04T00:00:00.000Z", "2026-01-03T00:00:00.000Z"), true);
});
