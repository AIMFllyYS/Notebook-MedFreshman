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

// 课堂纪要 minutes 叶子归入 summary 板块：summary 现带 search+quiz 能力与 category-item 策略。
const summaryCat: CategoryLike = {
  id: "summary",
  capabilities: ["search", "quiz"],
  keyStrategy: "category-item",
};

test("无 quizRef 时回退 category-item 推导（quizId=itemId）", () => {
  assert.equal(resolveQuizId(recordingCat, "rec-01"), "rec-01");
  assert.equal(resolveQuizId(summaryCat, "sum-01"), "sum-01");
});

test("recording 下三份材料（原文/笔记/手卡）用显式 quizRef 共享同一套题", () => {
  const shared = "rec-2026-fall-007-008";
  for (const aid of [
    "rec-rec-2026-fall-007-008",
    "note-rec-2026-fall-007-008",
    "card-rec-2026-fall-007-008",
  ]) {
    assert.equal(resolveQuizId(recordingCat, aid, { quizRef: shared }), shared);
    const keys = deriveActiveKeys(recordingCat, aid, { quizRef: shared });
    assert.equal(keys.activeChapterId, shared);
  }
});

test("summary 下的课堂纪要 minutes 叶子同样用 quizRef 共享同一套题", () => {
  const shared = "rec-2026-fall-007-008";
  const minutesArticleId = "min-rec-2026-fall-007-008";
  assert.equal(resolveQuizId(summaryCat, minutesArticleId, { quizRef: shared }), shared);
  const keys = deriveActiveKeys(summaryCat, minutesArticleId, { quizRef: shared });
  assert.equal(keys.activeChapterId, shared);
});
