import assert from "node:assert/strict";
import { test } from "node:test";
import type { SessionMeta } from "@/lib/storage/chatStorage";
import type { ChatMessage } from "@/lib/types/chat";
import {
  MAX_SHARE_PAYLOAD_BYTES,
  buildSharedSnapshot,
  checkSharePayload,
  formatSharePayloadError,
} from "./snapshot.ts";
import { isSharedConversationSnapshot, type SharedArtifact } from "./types.ts";

const SESSION_ID = "session-1";
const DATA_URL = "data:image/png;base64,QUJDRA==";

function meta(overrides: Partial<SessionMeta> = {}): SessionMeta {
  return {
    id: SESSION_ID,
    title: "光合作用",
    createdAt: 1_700_000_000_000,
    updatedAt: 1_700_000_100_000,
    messageCount: 1,
    artifactIds: ["art-1"],
    ...overrides,
  };
}

function message(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "m1",
    role: "user",
    parts: [{ type: "text", text: "这是什么？" }],
    timestamp: 1_700_000_050_000,
    ...overrides,
  };
}

function build(overrides: {
  messages?: ChatMessage[];
  artifacts?: readonly SharedArtifact[];
  meta?: SessionMeta;
} = {}) {
  return buildSharedSnapshot({
    meta: overrides.meta ?? meta(),
    messages: overrides.messages ?? [message()],
    artifacts: overrides.artifacts ?? [],
  });
}

test("媒体被剥掉：消息里的 data:image / base64 不进快照", () => {
  const snapshot = build({
    messages: [
      message({
        parts: [{ type: "text", text: `看这张图 ![叶片](${DATA_URL})` }],
        attachments: [
          { type: "image", mimeType: "image/png", base64: DATA_URL },
          { type: "image", mimeType: "image/jpeg", id: "blob-1", name: "leaf.jpg", size: 2048 },
        ],
      }),
    ],
  });
  const json = JSON.stringify(snapshot);
  assert.equal(json.includes("data:image"), false);
  assert.equal(json.includes("QUJDRA"), false);
  assert.equal(json.includes('"base64"'), false);
  // 附件退化成引用：只留 id / 名字 / 大小，公开页据此显示占位。
  const attachments = snapshot.messages[0]?.attachments;
  assert.equal(attachments?.length, 2);
  const ref = attachments?.[1];
  assert.ok(ref && "id" in ref);
  assert.equal(ref.id, "blob-1");
  assert.equal(ref.name, "leaf.jpg");
  assert.equal(ref.size, 2048);
  assert.equal(json.includes("blob-1"), true);
});

test("meta 里的媒体也不进快照（标题/preview 混进 data URL 不该整单被拒）", () => {
  const snapshot = build({ meta: meta({ preview: DATA_URL }) });
  assert.equal(JSON.stringify(snapshot.meta).includes("data:image"), false);
});

test("artifacts 原样带走，但只带契约里的四列", () => {
  const html = "<html><body><h1>叶片模型</h1></body></html>";
  // 故意多带一个 reasoning：它属于生成过程，不进公开快照。
  const artifacts = [
    { id: "art-1", title: "叶片模型", html, status: "done", reasoning: "先画气孔再画叶脉" },
  ];
  const snapshot = build({ artifacts });
  assert.deepEqual(snapshot.artifacts, [{ id: "art-1", title: "叶片模型", html, status: "done" }]);
  assert.equal(JSON.stringify(snapshot).includes("先画气孔"), false);
  assert.equal(snapshot.artifacts[0]?.html, html);
});

test("字段齐全：v / title / createdAt / sourceClientId / meta / messages / artifacts", () => {
  const snapshot = build({ messages: [message(), message({ id: "m2", role: "assistant" })] });
  assert.deepEqual(Object.keys(snapshot).sort(), [
    "artifacts",
    "createdAt",
    "messages",
    "meta",
    "sourceClientId",
    "title",
    "v",
  ]);
  assert.equal(snapshot.v, 1);
  assert.equal(snapshot.title, "光合作用");
  assert.equal(snapshot.sourceClientId, SESSION_ID);
  assert.equal(typeof snapshot.createdAt, "number");
  assert.equal(snapshot.meta.id, SESSION_ID);
  assert.equal(snapshot.messages.length, 2);
  assert.equal(snapshot.messages[1]?.role, "assistant");
  assert.deepEqual(snapshot.artifacts, []);
  assert.equal(isSharedConversationSnapshot(snapshot), true);
});

test("顶层 title / sourceClientId 一律取自 meta（不另设重复入参）", () => {
  const snapshot = build({ meta: meta({ id: "session-9", title: "条件概率" }) });
  assert.equal(snapshot.sourceClientId, "session-9");
  assert.equal(snapshot.title, "条件概率");
  assert.equal(snapshot.meta.id, "session-9");
  assert.equal(snapshot.meta.title, "条件概率");
});

test("isSharedConversationSnapshot 拒绝形状不对的载荷", () => {
  const snapshot = build();
  for (const bad of [
    null,
    undefined,
    "snapshot",
    [],
    { ...snapshot, v: 2 },
    { ...snapshot, title: 1 },
    { ...snapshot, createdAt: "now" },
    { ...snapshot, sourceClientId: "" },
    { ...snapshot, meta: null },
    { ...snapshot, messages: "nope" },
    { ...snapshot, artifacts: null },
  ]) {
    assert.equal(isSharedConversationSnapshot(bad), false, `应当拒绝: ${JSON.stringify(bad)?.slice(0, 60)}`);
  }
});

test("checkSharePayload：干净快照通过，带 data URL 或超限的拒收", () => {
  const clean = build();
  const ok = checkSharePayload(clean);
  assert.equal(ok.ok, true);
  if (!ok.ok) return;
  assert.ok(ok.bytes > 0 && ok.bytes <= MAX_SHARE_PAYLOAD_BYTES);

  const unsafe = {
    ...clean,
    artifacts: [{ id: "art-1", title: "叶片模型", html: `<img src="${DATA_URL}">`, status: "done" }],
  };
  const unsafeCheck = checkSharePayload(unsafe);
  if (unsafeCheck.ok) assert.fail("带 data URL 的载荷必须被拒");
  assert.equal(unsafeCheck.reason, "unsafe");
  assert.match(formatSharePayloadError(unsafeCheck), /媒体数据/);

  const huge = {
    ...clean,
    messages: [message({ parts: [{ type: "text", text: "x".repeat(MAX_SHARE_PAYLOAD_BYTES + 1) }] })],
  };
  const hugeCheck = checkSharePayload(huge);
  if (hugeCheck.ok) assert.fail("超限载荷必须被拒");
  assert.equal(hugeCheck.reason, "too-large");
  assert.match(formatSharePayloadError(hugeCheck), /超过分享上限 5 MB/);
});
