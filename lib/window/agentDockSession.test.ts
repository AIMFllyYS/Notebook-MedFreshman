import assert from "node:assert/strict";
import { test } from "node:test";
import {
  __resetAgentDockMemoryForTests,
  readAgentDockState,
  rememberAgentDockState,
} from "./agentDockSession.ts";

test("右栏记忆按会话存取；没记录就是「没有记忆」", () => {
  __resetAgentDockMemoryForTests();
  assert.equal(readAgentDockState("s1"), null);
  rememberAgentDockState("s1", { collapsed: false, global: true, activeWindowId: "document-viewer:d1" });
  assert.deepEqual(readAgentDockState("s1"), {
    collapsed: false,
    global: true,
    activeWindowId: "document-viewer:d1",
  });
  assert.equal(readAgentDockState("s2"), null);

  // 覆盖写：同一个会话再次离开时以新状态为准
  rememberAgentDockState("s1", { collapsed: true, global: false, activeWindowId: null });
  assert.deepEqual(readAgentDockState("s1"), { collapsed: true, global: false, activeWindowId: null });

  // 空 id 不写（未水合的会话不该污染记忆表）
  rememberAgentDockState("", { collapsed: false, global: false, activeWindowId: null });
  assert.equal(readAgentDockState(null), null);
});