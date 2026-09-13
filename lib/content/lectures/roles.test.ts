import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LECTURE_MATERIAL_ROLES,
  LECTURE_ROLE_SPEC,
  isValidLessonId,
  lectureArticleId,
  parseLectureArticleId,
} from "@/lib/content/lectures/roles";

test("lessonId 规则：合法单节/连堂通过，非法拒绝", () => {
  assert.equal(isValidLessonId("rec-2026-fall-007"), true);
  assert.equal(isValidLessonId("rec-2026-fall-007-008"), true);
  assert.equal(isValidLessonId("rec-2026-spring-001"), true);
  assert.equal(isValidLessonId("rec-2026-autumn-001"), false);
  assert.equal(isValidLessonId("rec-26-fall-007"), false);
  assert.equal(isValidLessonId("rec-2026-fall-7"), false);
  assert.equal(isValidLessonId("../etc"), false);
});

test("articleId 编解码对四个角色可逆", () => {
  const lessonId = "rec-2026-fall-007-008";
  for (const role of LECTURE_MATERIAL_ROLES) {
    const aid = lectureArticleId(lessonId, role);
    const parsed = parseLectureArticleId(aid);
    assert.ok(parsed, `${role} 应可解析`);
    assert.equal(parsed!.lessonId, lessonId);
    assert.equal(parsed!.role, role);
  }
});

test("articleId 前缀符合规划固定值", () => {
  assert.equal(lectureArticleId("rec-2026-fall-007-008", "recording"), "rec-rec-2026-fall-007-008");
  assert.equal(lectureArticleId("rec-2026-fall-007-008", "minutes"), "min-rec-2026-fall-007-008");
  assert.equal(lectureArticleId("rec-2026-fall-007-008", "notes"), "note-rec-2026-fall-007-008");
  assert.equal(lectureArticleId("rec-2026-fall-007-008", "cards"), "card-rec-2026-fall-007-008");
});

test("非课堂文章 id 解析为 null", () => {
  assert.equal(parseLectureArticleId("rec-01"), null);
  assert.equal(parseLectureArticleId("ch02-1"), null);
});

test("角色固定文件名/渲染格式冻结", () => {
  assert.equal(LECTURE_ROLE_SPEC.recording.file, "recording.md");
  assert.equal(LECTURE_ROLE_SPEC.recording.render, "text");
  assert.equal(LECTURE_ROLE_SPEC.minutes.render, "markdown");
  assert.equal(LECTURE_ROLE_SPEC.notes.file, "notes.html");
  assert.equal(LECTURE_ROLE_SPEC.notes.render, "html");
  assert.equal(LECTURE_ROLE_SPEC.cards.render, "markdown");
});
