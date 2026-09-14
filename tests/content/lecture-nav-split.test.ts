import assert from "node:assert/strict";
import { test } from "node:test";
import { getCategory, getContentItem } from "@/lib/content-data";
import type { ContentItem } from "@/lib/types/content";
import type { LectureMaterialRole } from "@/lib/content/lectures/roles";

// 课堂四材料导航归属重构：recording 挂「课节父节点 + 课堂原文/课堂笔记/复习手卡」3 叶子，
// 课堂纪要 minutes 单独归入 summary 板块（full 布局以显示共享测验）。
// 目前唯一已接入课节：分析化学 instrumental-analysis / rec-2026-fall-007-008。

const SUBJECT = "instrumental-analysis";
const LESSON = "rec-2026-fall-007-008";
const RECORDING_ROLES: LectureMaterialRole[] = ["recording", "notes", "cards"];

test("recording 板块：课节父节点 navigationOnly，下挂原文/笔记/手卡 3 叶子（不含 minutes）", () => {
  const recording = getCategory(SUBJECT, "recording")!;
  assert.ok(recording, "recording 板块存在");
  const group: ContentItem | undefined = recording.items.find((i) => i.id === LESSON);
  assert.ok(group, "课节父节点存在");
  assert.equal(group.navigationOnly, true, "课节父节点不可路由");
  const children: ContentItem[] = group.children ?? [];
  assert.deepEqual(children.map((c) => c.id), [
    `rec-${LESSON}`,
    `note-${LESSON}`,
    `card-${LESSON}`,
  ]);
  for (const role of RECORDING_ROLES) {
    const child = children.find((c) => c.materialRole === role);
    assert.ok(child, `${role} 叶子存在`);
    assert.equal(child!.quizRef, LESSON, `${role} 叶子带共享 quizRef`);
    assert.equal(child!.navigationOnly, undefined, "叶子可路由");
  }
  assert.ok(
    !children.some((c) => c.materialRole === "minutes"),
    "minutes 不再挂在 recording 课节组下",
  );
});

test("summary 板块：课堂纪要 minutes 叶子独立存在，full 布局且共享同一套题", () => {
  const summary = getCategory(SUBJECT, "summary")!;
  assert.ok(summary, "summary 板块存在");
  assert.ok((summary.capabilities ?? []).includes("quiz"), "summary 声明 quiz 能力");
  const minutes = summary.items.find((i) => i.id === `min-${LESSON}`);
  assert.ok(minutes, "minutes 叶子在 summary 下");
  assert.equal(minutes!.materialRole, "minutes");
  assert.equal(minutes!.quizRef, LESSON, "minutes 共享同一套题");
  assert.equal(minutes!.lessonRef, LESSON);
  assert.equal(minutes!.layoutProfile, "full", "minutes 用 full 覆盖 summary 默认 article");
  assert.equal(minutes!.navigationOnly, undefined, "minutes 叶子可路由");
  assert.ok(
    !summary.items.some((i) => i.materialRole === "recording"),
    "summary 下不放课堂原文",
  );
});

test("getContentItem 能在新的 summary 路径下取到 minutes（解析不依赖 category）", () => {
  const minutes = getContentItem(SUBJECT, "summary", `min-${LESSON}`);
  assert.ok(minutes, "summary/min-... 可解析");
  assert.equal(minutes!.materialRole, "minutes");
});
