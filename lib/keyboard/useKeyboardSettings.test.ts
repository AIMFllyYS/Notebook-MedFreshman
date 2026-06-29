import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import { useKeyboardSettings } from "@/lib/keyboard/useKeyboardSettings";

beforeEach(() => {
  useKeyboardSettings.setState({ disabledShortcuts: [] });
});

test("useKeyboardSettings toggles shortcut enabled state", () => {
  assert.equal(useKeyboardSettings.getState().isEnabled("global.search"), true);
  useKeyboardSettings.getState().setEnabled("global.search", false);
  assert.equal(useKeyboardSettings.getState().isEnabled("global.search"), false);
  useKeyboardSettings.getState().setEnabled("global.search", true);
  assert.equal(useKeyboardSettings.getState().isEnabled("global.search"), true);
});

test("useKeyboardSettings disableAll disables every shortcut", () => {
  useKeyboardSettings.getState().disableAll();
  assert.equal(useKeyboardSettings.getState().disabledShortcuts.length > 0, true);
  assert.equal(useKeyboardSettings.getState().isEnabled("global.search"), false);
});

test("useKeyboardSettings enableAll clears disabled list", () => {
  useKeyboardSettings.getState().disableAll();
  useKeyboardSettings.getState().enableAll();
  assert.deepEqual(useKeyboardSettings.getState().disabledShortcuts, []);
});
