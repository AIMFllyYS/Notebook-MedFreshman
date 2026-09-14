// 课堂内容运行时适配层：读取 lectures.generated.json，对外提供
//  1) 合并进导航的「一节课分组 + 四材料叶子」ContentItem[]；
//  2) articleId → 课节/材料/文件/格式 的受控索引（供 loader 解析物理文件）。
//
// 只依赖生成产物（无 fs、无副作用），因此客户端导航与服务端读取都能用。

import generated from "./lectures.generated.json";
import type { ContentItem, RenderType } from "@/lib/types/content";
import type { SubjectId } from "@/lib/content-data/subjects.registry";
import {
  LECTURE_MATERIAL_ROLES,
  LECTURE_ROLE_SPEC,
  type LectureMaterialRole,
} from "@/lib/content/lectures/roles";
import type {
  LectureCatalog,
  LectureCatalogEntry,
  LectureMaterialEntry,
} from "@/lib/content/lectures/catalog";

const catalog = generated as LectureCatalog;

export interface LectureArticleRef {
  entry: LectureCatalogEntry;
  role: LectureMaterialRole;
  material: LectureMaterialEntry;
}

function sessionLabel(start: number, end: number): string {
  return start === end ? `第${start}节` : `第${start}-${end}节`;
}

function lessonGroupTitle(entry: LectureCatalogEntry): string {
  return `${sessionLabel(entry.sessionRange.start, entry.sessionRange.end)} · ${entry.topic}`;
}

function materialLeafTitle(entry: LectureCatalogEntry, role: LectureMaterialRole): string {
  return `${LECTURE_ROLE_SPEC[role].label} · ${sessionLabel(
    entry.sessionRange.start,
    entry.sessionRange.end,
  )}`;
}

/** recording（课上录音）板块下挂载的材料角色：课堂原文 / 课堂笔记 / 复习手卡。
 *  课堂纪要 minutes 单独归入 summary（课堂纪要）板块，见 lectureSummaryLeavesBySubject。 */
const RECORDING_ROLES = LECTURE_MATERIAL_ROLES.filter((role) => role !== "minutes");

/** 把一节课转成 recording 板块下的 navigationOnly 分组节点（父节点不生成路由，3 叶子才是文章）。 */
function toRecordingNavGroup(entry: LectureCatalogEntry): ContentItem {
  const children: ContentItem[] = RECORDING_ROLES.map((role) => {
    const material = entry.materials[role];
    return {
      id: material.articleId,
      title: materialLeafTitle(entry, role),
      type: "document",
      status: "done",
      renderType: material.format as RenderType,
      materialRole: role,
      lessonRef: entry.lessonId,
      quizRef: entry.quizId,
    };
  });
  return {
    id: entry.lessonId,
    title: lessonGroupTitle(entry),
    type: "document",
    status: "done",
    navigationOnly: true,
    children,
  };
}

/** 把一节课的课堂纪要（minutes）转成 summary 板块下的叶子。
 *  summary 板块默认 article 布局，这里用 item.layoutProfile="full" 覆盖，
 *  使其显示与其他三材料共享的测验 Tab（quizRef 一致）。 */
function toSummaryLeaf(entry: LectureCatalogEntry): ContentItem {
  const material = entry.materials.minutes;
  return {
    id: material.articleId,
    title: materialLeafTitle(entry, "minutes"),
    type: "document",
    status: "done",
    renderType: material.format as RenderType,
    materialRole: "minutes",
    lessonRef: entry.lessonId,
    quizRef: entry.quizId,
    layoutProfile: "full",
  };
}

/** 某学科全部课节，按上课日期、节次排序。 */
function sortedLessonsForSubject(subjectId: SubjectId | string): LectureCatalogEntry[] {
  return catalog.lessons
    .filter((l) => l.subjectId === subjectId)
    .sort(
      (a, b) =>
        a.taughtOn.localeCompare(b.taughtOn) || a.sessionRange.start - b.sessionRange.start,
    );
}

/** 某学科 recording 板块下的课堂分组（按上课日期、节次排序）。 */
export function lectureNavGroupsBySubject(subjectId: SubjectId | string): ContentItem[] {
  return sortedLessonsForSubject(subjectId).map(toRecordingNavGroup);
}

/** 某学科 summary 板块下的课堂纪要叶子（按上课日期、节次排序）。 */
export function lectureSummaryLeavesBySubject(subjectId: SubjectId | string): ContentItem[] {
  return sortedLessonsForSubject(subjectId).map(toSummaryLeaf);
}

export function hasLectures(subjectId: SubjectId | string): boolean {
  return catalog.lessons.some((l) => l.subjectId === subjectId);
}

const articleIndex = new Map<string, LectureArticleRef>();
for (const entry of catalog.lessons) {
  for (const role of LECTURE_MATERIAL_ROLES) {
    const material = entry.materials[role];
    articleIndex.set(material.articleId, { entry, role, material });
  }
}

/** 学科 + 文章 id 查课堂材料，学科不匹配返回 null（loader / paths 的受控入口）。 */
export function getLectureArticleForSubject(
  subjectId: string,
  articleId: string,
): LectureArticleRef | null {
  const ref = articleIndex.get(articleId);
  if (!ref || ref.entry.subjectId !== subjectId) return null;
  return ref;
}
