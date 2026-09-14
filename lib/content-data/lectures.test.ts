import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LECTURE_MATERIAL_ROLES,
  LECTURE_ROLE_SPEC,
  lectureArticleId,
} from "@/lib/content/lectures/roles";
import type { LectureCatalog, LectureCatalogEntry } from "@/lib/content/lectures/catalog";
import { buildLectureArticleIndex } from "@/lib/content-data/lectures";

function mkEntry(subjectId: string, lessonId: string, topic: string): LectureCatalogEntry {
  const materials = {} as LectureCatalogEntry["materials"];
  for (const role of LECTURE_MATERIAL_ROLES) {
    materials[role] = {
      role,
      file: LECTURE_ROLE_SPEC[role].file,
      format: LECTURE_ROLE_SPEC[role].render as "text" | "markdown" | "html",
      articleId: lectureArticleId(lessonId, role),
    };
  }
  return {
    subjectId: subjectId as LectureCatalogEntry["subjectId"],
    lessonId,
    courseInstanceId: "rec-2026-fall",
    courseName: subjectId,
    sessionRange: { start: 1, end: 2 },
    taughtOn: "2026-08-31",
    topic,
    revision: 1,
    quizId: lessonId,
    materials,
    hashes: { recording: "r", notesText: "n" },
  };
}

function catalogOf(...entries: LectureCatalogEntry[]): LectureCatalog {
  return { schemaVersion: 1, lessons: entries };
}

test("跨学科相同节次：复合索引互不覆盖，各自能查到本学科材料", () => {
  const cat = catalogOf(
    mkEntry("cell-biology", "rec-2026-fall-001-002", "细胞"),
    mkEntry("histology", "rec-2026-fall-001-002", "组胚"),
  );
  const idx = buildLectureArticleIndex(cat);
  // 四材料 × 两学科 = 8 个互不相同的复合键（裸 articleId 全局键只会剩 4 个）
  assert.equal(idx.size, LECTURE_MATERIAL_ROLES.length * 2);

  const cellAid = lectureArticleId("rec-2026-fall-001-002", "recording");
  const cell = idx.get(`cell-biology::${cellAid}`);
  const histo = idx.get(`histology::${cellAid}`);
  assert.ok(cell, "细胞生物学材料必须可查（此前会被后写学科覆盖）");
  assert.ok(histo, "人体组织学材料必须可查");
  assert.equal(cell!.entry.subjectId, "cell-biology");
  assert.equal(histo!.entry.subjectId, "histology");
  assert.equal(cell!.entry.topic, "细胞");
  assert.equal(histo!.entry.topic, "组胚");
});

test("跨学科相同节次：A 学科键不会取到 B 学科条目", () => {
  const cat = catalogOf(
    mkEntry("anatomy", "rec-2026-fall-003-004", "解剖"),
    mkEntry("biochemistry", "rec-2026-fall-003-004", "生化"),
  );
  const idx = buildLectureArticleIndex(cat);
  const aid = lectureArticleId("rec-2026-fall-003-004", "notes");
  assert.equal(idx.get(`anatomy::${aid}`)!.entry.subjectId, "anatomy");
  assert.equal(idx.get(`biochemistry::${aid}`)!.entry.subjectId, "biochemistry");
  assert.equal(idx.get(`chemistry::${aid}`), undefined);
});
