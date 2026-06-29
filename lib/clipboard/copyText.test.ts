import assert from "node:assert/strict";
import { test } from "node:test";
import { shouldInterceptSelectionCopy } from "./copyText.ts";

test("shouldInterceptSelectionCopy：pop 文本为空时不拦截", () => {
  assert.equal(shouldInterceptSelectionCopy("", null, null), false);
  assert.equal(shouldInterceptSelectionCopy("   ", null, null), false);
});

test("shouldInterceptSelectionCopy：有 pop 文本且无冲突时拦截", () => {
  assert.equal(shouldInterceptSelectionCopy("hello", null, null), true);
});

test("shouldInterceptSelectionCopy：焦点在 input 时不拦截", () => {
  assert.equal(
    shouldInterceptSelectionCopy("hello", { tagName: "INPUT" } as Element, null),
    false,
  );
});

test("shouldInterceptSelectionCopy：焦点在 textarea 时不拦截", () => {
  assert.equal(
    shouldInterceptSelectionCopy("hello", { tagName: "TEXTAREA" } as Element, null),
    false,
  );
});

test("shouldInterceptSelectionCopy：焦点在 contenteditable 时不拦截", () => {
  assert.equal(
    shouldInterceptSelectionCopy(
      "hello",
      { tagName: "DIV", isContentEditable: true } as unknown as Element,
      null,
    ),
    false,
  );
});

test("shouldInterceptSelectionCopy：用户另有非空选区时不拦截", () => {
  const selection = {
    isCollapsed: false,
    toString: () => "other selection",
  } as Selection;
  assert.equal(shouldInterceptSelectionCopy("hello", null, selection), false);
});

test("shouldInterceptSelectionCopy：选区仅空白时不视为冲突", () => {
  const selection = {
    isCollapsed: false,
    toString: () => "  \n  ",
  } as Selection;
  assert.equal(shouldInterceptSelectionCopy("hello", null, selection), true);
});
