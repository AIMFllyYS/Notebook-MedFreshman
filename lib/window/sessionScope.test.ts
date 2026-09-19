import assert from "node:assert/strict";
import { test } from "node:test";
import { filterWindowsForSession, windowBelongsToSession } from "./sessionScope.ts";

test("未标记会话的窗口一律可见（Studio 打开的、测试构造的老窗口）", () => {
  assert.equal(windowBelongsToSession(undefined, "s1"), true);
  assert.equal(windowBelongsToSession(null, "s1"), true);
  assert.equal(windowBelongsToSession("", "s1"), true);
  // 有标记、但当前没有活动会话（例如对话都被删了）：按「不属于」处理，
  // 免得那块右栏在没有对话可归属的时候仍然亮着别人的内容。
  assert.equal(windowBelongsToSession("s1", null), false);
});

test("标记了会话的窗口只在自己对话里可见", () => {
  assert.equal(windowBelongsToSession("s1", "s1"), true);
  assert.equal(windowBelongsToSession("s1", "s2"), false);
  assert.equal(windowBelongsToSession("s2", null), false);
});

test("filterWindowsForSession 保留未标记项、按会话筛掉别人的窗口", () => {
  const windows = [
    { id: "a", sessionId: "s1" },
    { id: "b", sessionId: "s2" },
    { id: "c" },
    { id: "d", sessionId: null },
  ];
  assert.deepEqual(filterWindowsForSession(windows, "s1").map((w) => w.id), ["a", "c", "d"]);
  assert.deepEqual(filterWindowsForSession(windows, "s2").map((w) => w.id), ["b", "c", "d"]);
  // 没有活动会话：只留没标记的两个（c/d）——标记过归属的窗口不属于任何当前对话。
  assert.deepEqual(filterWindowsForSession(windows, null).map((w) => w.id), ["c", "d"]);
});