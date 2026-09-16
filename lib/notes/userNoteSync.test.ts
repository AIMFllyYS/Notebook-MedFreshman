import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { notifyUserNoteChanged } from "@/lib/notes/userNoteSync";

test("notifyUserNoteChanged 接到 user-note 云同步", () => {
  assert.equal(notifyUserNoteChanged("n1", "upsert"), undefined);
  assert.equal(notifyUserNoteChanged("n1", "tombstone"), undefined);
  const src = readFileSync(new URL("./userNoteSync.ts", import.meta.url), "utf8");
  assert.match(src, /SYNC POINT/);
  assert.match(src, /user-notes/);
  assert.match(src, /scheduleCloudUpsert/);
  assert.match(src, /user-note/);
});
