import assert from "node:assert/strict";
import { test } from "node:test";
import { classifySendError } from "./classifySendError.ts";

test("classifySendError：超时优先于其它错误", () => {
  assert.equal(
    classifySendError(new Error("ignored"), { stalled: true, aborted: true }),
    "连接超过 60 秒没有响应，请重试。",
  );
});

test("classifySendError：用户取消或 AbortError 不展示", () => {
  assert.equal(classifySendError(new Error("x"), { stalled: false, aborted: true }), null);
  const abort = new Error("生成被中断");
  abort.name = "AbortError";
  assert.equal(classifySendError(abort, { stalled: false, aborted: false }), null);
});

test("classifySendError：其它错误取 message，非 Error 用通用文案", () => {
  assert.equal(classifySendError(new Error("上游返回错误"), { stalled: false, aborted: false }), "上游返回错误");
  assert.equal(classifySendError("boom", { stalled: false, aborted: false }), "发生未知错误");
});
