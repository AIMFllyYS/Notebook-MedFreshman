import assert from "node:assert/strict";
import { test } from "node:test";
import { shouldMountHeavyEditor } from "./heavyEditor.ts";

test("shouldMountHeavyEditor 只给最前窗挂 Crepe", () => {
  assert.equal(shouldMountHeavyEditor("user-note-editor:a", "user-note-editor:a"), true);
  assert.equal(shouldMountHeavyEditor("user-note-editor:a", "user-note-editor:b"), false);
  assert.equal(shouldMountHeavyEditor(null, "user-note-editor:a"), false);
});
