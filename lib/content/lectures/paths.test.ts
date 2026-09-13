import assert from "node:assert/strict";
import { test } from "node:test";
import path from "node:path";
import { CONTENT_ROOT } from "@/lib/content/contentPaths";
import { isResolvedPathInside } from "@/lib/content/contentPathGuard";
import { lectureLessonDirAbs } from "@/lib/content/lectures/paths";

test("lectureLessonDirAbs：合法课节目录落在 CONTENT_ROOT 内（守卫实参顺序回归）", () => {
  const dir = lectureLessonDirAbs("instrumental-analysis", "rec-2026-fall-007-008");
  assert.equal(
    dir,
    path.join(CONTENT_ROOT, "instrumental-analysis", "lectures", "rec-2026-fall-007-008"),
  );
  // 这正是此前写反 isResolvedPathInside 实参顺序会失败的断言。
  assert.equal(isResolvedPathInside(dir, CONTENT_ROOT), true);
});

test("lectureLessonDirAbs：非法 lessonId 直接拒绝", () => {
  assert.throws(() => lectureLessonDirAbs("instrumental-analysis", "../escape"), /非法 lessonId/);
});
