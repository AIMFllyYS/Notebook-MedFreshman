import assert from "node:assert/strict";
import { test } from "node:test";
import { SHARE_ID_LENGTH, createShareId, isShareId } from "./slug.ts";

test("createShareId 长度固定为 SHARE_ID_LENGTH", () => {
  for (let i = 0; i < 200; i += 1) {
    assert.equal(createShareId().length, SHARE_ID_LENGTH);
  }
});

test("createShareId 只产出 base62 字符", () => {
  for (let i = 0; i < 500; i += 1) {
    assert.match(createShareId(), /^[0-9A-Za-z]{12}$/);
  }
});

test("两万个 id 不重复（碰撞就等于可枚举）", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 20000; i += 1) {
    seen.add(createShareId());
  }
  assert.equal(seen.size, 20000);
});

test("id 的字符分布没有明显偏斜（拒绝采样生效）", () => {
  const counts = new Map<string, number>();
  const total = 4000 * SHARE_ID_LENGTH;
  for (let i = 0; i < 4000; i += 1) {
    for (const ch of createShareId()) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  }
  // 62 个字符都要出现过；均匀分布下每个字符期望 4000/62 ≈ 64.5 次，均值上下留足余量。
  assert.equal(counts.size, 62);
  const expected = total / 62;
  for (const count of counts.values()) {
    assert.ok(count > expected * 0.6 && count < expected * 1.4, `字符出现次数偏离过大: ${count}`);
  }
});

test("isShareId 接受自己生成的 id", () => {
  for (let i = 0; i < 100; i += 1) {
    assert.equal(isShareId(createShareId()), true);
  }
  assert.equal(isShareId("ABCDEFGHIJKL"), true);
  assert.equal(isShareId("0123456789ab"), true);
});

test("isShareId 拒绝长度、字符集、类型不对的一切", () => {
  for (const bad of [
    "",
    "abc",
    "ABCDEFGHIJK", // 11 位
    "ABCDEFGHIJKLM", // 13 位
    "ABCDEFGHIJ-L",
    "ABCDEFGHIJ_L",
    "ABCDEFGHIJ L",
    "abcdefghijk\u00e9",
    "abcdefghijk!",
    "ABCDEFGHIJK\n",
    null,
    undefined,
    123456789012,
    { id: "ABCDEFGHIJKL" },
    ["ABCDEFGHIJKL"],
  ]) {
    assert.equal(isShareId(bad), false, `应当拒绝: ${String(bad)}`);
  }
});
