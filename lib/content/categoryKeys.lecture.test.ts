import assert from "node:assert/strict";
import { test } from "node:test";
import {
  deriveActiveKeys,
  resolveQuizId,
  type CategoryLike,
} from "@/lib/content/categoryKeys";

const recordingCat: CategoryLike = {
  id: "recording",
  capabilities: ["examples", "quiz", "search"],
  keyStrategy: "category-item",
};

test("无 quizRef 时回退 category-item 推导（quizId=itemId）", () => {
  assert.equal(resolveQuizId(recordingCat, "rec-01"), "rec-01");
});

test("课堂四材料用显式 quizRef 共享同一套题", () => {
  const shared = "rec-2026-fall-007-008";
  for (const aid of [
    "rec-rec-2026-fall-007-008",
    "min-rec-2026-fall-007-008",
    "note-rec-2026-fall-007-008",
    "card-rec-2026-fall-007-008",
  ]) {
    assert.equal(resolveQuizId(recordingCat, aid, { quizRef: shared }), shared);
    const keys = deriveActiveKeys(recordingCat, aid, { quizRef: shared });
    assert.equal(keys.activeChapterId, shared);
  }
});
