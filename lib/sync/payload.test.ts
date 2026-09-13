import assert from "node:assert/strict";
import { test } from "node:test";
import type { ChatMessage } from "@/lib/types/chat";
import type { SessionMeta } from "@/lib/storage/chatStorage";
import {
  buildArtifactPayload,
  buildChatSessionPayload,
  formatKindLimitMessage,
  formatUserLimitMessage,
  payloadLooksUnsafe,
  preparePayload,
  redactMediaString,
  stripForbiddenFields,
} from "./payload.ts";
import { MAX_ARTIFACT_BYTES, MAX_USER_SYNC_BYTES } from "./types.ts";

function meta(id: string): SessionMeta {
  return {
    id,
    title: id,
    createdAt: 1,
    updatedAt: 2,
    messageCount: 1,
    artifactIds: [],
  };
}

function msg(id: string, extra?: Partial<ChatMessage>): ChatMessage {
  return {
    id,
    role: "user",
    parts: [{ type: "text", text: "hi" }],
    timestamp: 1,
    ...extra,
  };
}

test("buildChatSessionPayload strips inline base64 and keeps blob id refs", () => {
  const payload = buildChatSessionPayload(meta("s1"), [
    msg("m1", {
      attachments: [
        { type: "image", mimeType: "image/png", base64: "data:image/png;base64,AAAA" },
        { type: "image", mimeType: "image/jpeg", id: "blob-1" },
      ],
    }),
  ]);
  const json = JSON.stringify(payload);
  assert.equal(payloadLooksUnsafe(payload), false);
  assert.equal(json.includes("AAAA"), false);
  assert.equal(json.includes("data:image"), false);
  assert.equal(json.includes('"base64"'), false);
  assert.equal(json.includes("blob-1"), true);
  assert.deepEqual(Object.keys(payload).sort(), ["messages", "meta", "v"]);
});

test("stripForbiddenFields drops apiKey and data URLs", () => {
  const stripped = stripForbiddenFields({
    html: '<img src="data:image/png;base64,QUJDRA==" />',
    apiKey: "sk-secret",
    nested: { base64: "QUJDRA==", text: "ok" },
  }) as { html: string; nested: { text: string } };
  assert.equal("apiKey" in (stripped as object), false);
  assert.equal("base64" in stripped.nested, false);
  assert.equal(stripped.nested.text, "ok");
  assert.equal(stripped.html.includes("data:image"), false);
  assert.equal(payloadLooksUnsafe(stripped), false);
});

test("preparePayload rejects oversized artifacts with a readable limit", () => {
  const html = "x".repeat(MAX_ARTIFACT_BYTES + 8);
  const result = preparePayload("artifact", buildArtifactPayload({
    id: "a1",
    title: "big",
    html,
    status: "done",
  }));
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.reason, "kind-limit");
  assert.match(formatKindLimitMessage("artifact", result.bytes, result.limit), /未上传云端/);
  assert.match(formatUserLimitMessage(MAX_USER_SYNC_BYTES), /上限/);
});

test("redactMediaString leaves ordinary text and https images", () => {
  const src = "see https://example.com/a.png and data:image/png;base64,AAAA";
  const out = redactMediaString(src);
  assert.equal(out.includes("https://example.com/a.png"), true);
  assert.equal(out.includes("data:image"), false);
});
