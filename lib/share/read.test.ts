import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { readSharedConversation, setShareReadTestDeps } from "./read.ts";
import { createShareId } from "./slug.ts";
import type { SharedConversationSnapshot } from "./types.ts";

afterEach(() => setShareReadTestDeps(null));

const SHARE_ID = createShareId();

function snapshot(): SharedConversationSnapshot {
  return {
    v: 1,
    title: "光合作用",
    createdAt: 1_700_000_000_000,
    sourceClientId: "session-1",
    meta: {
      id: "session-1",
      title: "光合作用",
      createdAt: 1_700_000_000_000,
      updatedAt: 1_700_000_100_000,
      messageCount: 1,
      artifactIds: [],
    },
    messages: [
      { id: "m1", role: "user", parts: [{ type: "text", text: "这是什么？" }], timestamp: 1 },
    ],
    artifacts: [],
  };
}

test("id 形状不对时一个请求都不发", async () => {
  let calls = 0;
  setShareReadTestDeps({
    rpc: async () => {
      calls += 1;
      return { data: [], error: null };
    },
  });
  for (const bad of ["", "short", "../etc/passwd", "ABCDEFGHIJ-L"]) {
    assert.equal(await readSharedConversation(bad), null);
  }
  assert.equal(calls, 0);
});

test("撤回 / 过期 / 不存在都是零行，一律 null", async () => {
  setShareReadTestDeps({ rpc: async () => ({ data: [], error: null }) });
  assert.equal(await readSharedConversation(SHARE_ID), null);
});

test("RPC 报错、网络异常、Supabase 未配置都优雅降级为 null（分享页显示「不存在或已撤回」）", async () => {
  setShareReadTestDeps({ rpc: async () => ({ data: null, error: { message: "rls denied" } }) });
  assert.equal(await readSharedConversation(SHARE_ID), null);

  setShareReadTestDeps({
    rpc: async () => {
      throw new Error("network down");
    },
  });
  assert.equal(await readSharedConversation(SHARE_ID), null);

  setShareReadTestDeps({ rpc: async () => ({ data: null, error: { message: "supabase-unconfigured" } }) });
  assert.equal(await readSharedConversation(SHARE_ID), null);
});

test("正常一行：解出 payload 直接给渲染层，标题等列不参与", async () => {
  const payload = snapshot();
  setShareReadTestDeps({
    rpc: async (id) => {
      assert.equal(id, SHARE_ID);
      return {
        data: [{ title: "库里的旧标题", payload, created_at: "2026-09-21T10:00:00.000Z" }],
        error: null,
      };
    },
  });
  const read = await readSharedConversation(SHARE_ID);
  assert.ok(read);
  assert.deepEqual(read, payload);
  assert.equal(read.title, "光合作用");
  assert.equal(read.sourceClientId, "session-1");
});

test("载荷形状不对（版本不同 / 缺列）当作不存在，不把脏数据交给渲染层", async () => {
  const payload = snapshot();
  for (const row of [
    { title: "x", payload: { ...payload, v: 2 }, created_at: null },
    { title: "x", payload: null, created_at: null },
    { title: "x", payload: { ...payload, messages: null }, created_at: null },
    { title: "x", payload: { ...payload, artifacts: "nope" }, created_at: null },
  ]) {
    setShareReadTestDeps({ rpc: async () => ({ data: [row], error: null }) });
    assert.equal(await readSharedConversation(SHARE_ID), null);
  }
});
