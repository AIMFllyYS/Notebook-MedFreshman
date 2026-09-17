import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { SAVED_TOAST_MESSAGE, TOAST_DURATION_MS, useToast } from "./toast";

afterEach(() => {
  useToast.getState().clear();
});

test("showSaved 文案是已成功保存，相同文案只保留一条", () => {
  useToast.getState().showSaved();
  useToast.getState().showSaved();
  const toasts = useToast.getState().toasts;
  assert.equal(toasts.length, 1);
  assert.equal(toasts[0]?.message, SAVED_TOAST_MESSAGE);
});

test("toast 几秒后自动关闭", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  useToast.getState().showSaved();
  assert.equal(useToast.getState().toasts.length, 1);
  t.mock.timers.tick(TOAST_DURATION_MS);
  assert.equal(useToast.getState().toasts.length, 0);
});
