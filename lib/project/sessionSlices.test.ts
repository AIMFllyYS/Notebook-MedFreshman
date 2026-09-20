import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  collectReadSliceIds,
  MAX_REMEMBERED_SLICES,
  mergeRememberedSlices,
} from "./sessionSlices.ts";
import type { ChatMessagePart } from "@/lib/types/chat";

function toolPart(sliceIds: unknown, type = "tool-readProjectSlices"): ChatMessagePart {
  return { type, output: { sliceIds } } as unknown as ChatMessagePart;
}

describe("collectReadSliceIds", () => {
  test("只收 readProjectSlices 的结果，按出现顺序去重", () => {
    const parts = [
      { type: "text", text: "读一下" },
      toolPart(["s1", "s2"]),
      toolPart(["s2", "s3"]),
      toolPart(["s9"], "tool-getProjectFiles"),
    ] as ChatMessagePart[];
    assert.deepEqual(collectReadSliceIds(parts), ["s1", "s2", "s3"]);
  });

  test("空 / 异常输出不炸，也不产出垃圾 id", () => {
    const parts = [
      undefined,
      null,
      toolPart(undefined),
      toolPart("not-an-array"),
      toolPart([1, "", null, "ok"]),
    ] as unknown as ChatMessagePart[];
    assert.deepEqual(collectReadSliceIds(parts), ["ok"]);
    assert.deepEqual(collectReadSliceIds(undefined), []);
    assert.deepEqual(collectReadSliceIds([]), []);
  });

  test("dynamic-tool 形状也认（toolName 在 part 上）", () => {
    const part = { type: "dynamic-tool", toolName: "readProjectSlices", output: { sliceIds: ["d1"] } } as unknown as ChatMessagePart;
    assert.deepEqual(collectReadSliceIds([part]), ["d1"]);
  });
});

describe("mergeRememberedSlices", () => {
  test("新读的追加在后，重复的不重复记", () => {
    assert.deepEqual(mergeRememberedSlices(["s1"], ["s1", "s2"]), ["s1", "s2"]);
  });

  test("没有新 id 时内容不变", () => {
    assert.deepEqual(mergeRememberedSlices(["s1", "s2"], ["s2", "s1"]), ["s1", "s2"]);
    assert.deepEqual(mergeRememberedSlices(undefined, []), []);
  });

  test("超过上限时丢最旧的，保住最近读过的", () => {
    const existing = Array.from({ length: MAX_REMEMBERED_SLICES }, (_, i) => `old-${i}`);
    const merged = mergeRememberedSlices(existing, ["new-1"]);
    assert.equal(merged.length, MAX_REMEMBERED_SLICES);
    assert.equal(merged[merged.length - 1], "new-1");
    assert.equal(merged.includes("old-0"), false, "最旧的一条被挤掉");
    assert.equal(merged.includes("old-1"), true);
  });
});
