import assert from "node:assert/strict";
import { test } from "node:test";
import {
  avatarInitial,
  defaultNickname,
  membershipLabel,
  normalizeNickname,
  resolveNickname,
} from "./displayName";

test("default nickname is the email local part", () => {
  assert.equal(defaultNickname("sofia.lin@example.com"), "sofia.lin");
  assert.equal(defaultNickname(null), "访客");
});

test("avatar uses the first character of the username", () => {
  assert.equal(avatarInitial("sofia.lin"), "S");
  assert.equal(avatarInitial("访客"), "访");
  assert.equal(avatarInitial(""), "我");
});

test("resolveNickname prefers a saved name", () => {
  assert.equal(resolveNickname("  苏  ", "sofia@example.com"), "苏");
  assert.equal(resolveNickname("", "sofia@example.com"), "sofia");
});

test("normalizeNickname trims and rejects oversized names", () => {
  assert.equal(normalizeNickname("  Ada  "), "Ada");
  assert.equal(normalizeNickname("   "), null);
  assert.throws(() => normalizeNickname("字".repeat(41)), /最多 40/);
});

test("membership labels stay in Chinese", () => {
  assert.equal(membershipLabel("free"), "免费会员");
  assert.equal(membershipLabel("plus"), "Plus 会员");
  assert.equal(membershipLabel("pro"), "Pro 会员");
});
