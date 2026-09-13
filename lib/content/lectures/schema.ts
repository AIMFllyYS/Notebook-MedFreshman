// 一节课 lesson.json 的严格 schema 与跨字段校验（P0 契约核心）。
//
// 设计原则：
//  - 用 zod 的 strict object 拒绝一切未声明字段（防止作者随手塞私有键、防止 typo）；
//  - 只做「与文件系统无关」的结构 / 语义校验，文件存在性、hash、静态 HTML 安全等
//    需要读盘的检查放在 scripts 侧（validate.ts），本模块保持纯函数、可单测；
//  - 所有报错聚合成字符串数组返回，便于一次性给作者全部问题，而不是挤牙膏。

import { z } from "zod";
import {
  LECTURE_MATERIAL_ROLES,
  LECTURE_ROLE_SPEC,
  isValidLessonId,
  type LectureMaterialRole,
} from "@/lib/content/lectures/roles";
import { resolveSubjectByCourseName } from "@/lib/content/lectures/subjectAliases";
import type { SubjectId } from "@/lib/content-data/subjects.registry";

export const LESSON_SCHEMA_VERSION = 1 as const;

const materialSchema = z
  .object({
    file: z.string().min(1),
    format: z.enum(["text", "markdown", "html"]),
  })
  .strict();

const sessionRangeSchema = z
  .object({
    start: z.number().int().positive(),
    end: z.number().int().positive(),
  })
  .strict();

const sourceRefSchema = z
  .object({
    cloudRecording: z.string().min(1).optional(),
    minutesDoc: z.string().min(1).optional(),
    notesArtifact: z.string().min(1).optional(),
    cardsArtifact: z.string().min(1).optional(),
  })
  .strict()
  .optional();

const rawLessonSchema = z
  .object({
    schemaVersion: z.literal(LESSON_SCHEMA_VERSION),
    subjectId: z.string().min(1),
    courseInstanceId: z.string().min(1),
    lessonId: z.string().min(1),
    courseName: z.string().min(1),
    sessionRange: sessionRangeSchema,
    taughtOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "taughtOn 必须是 YYYY-MM-DD"),
    topic: z.string().min(1),
    revision: z.number().int().positive(),
    materials: z
      .object({
        recording: materialSchema,
        minutes: materialSchema,
        notes: materialSchema,
        cards: materialSchema,
      })
      .strict(),
    quizId: z.string().min(1),
    sourceRef: sourceRefSchema,
  })
  .strict();

export type LessonMaterialMeta = { file: string; format: "text" | "markdown" | "html" };
export type LessonSessionRange = { start: number; end: number };
export type LessonSourceRef = {
  cloudRecording?: string;
  minutesDoc?: string;
  notesArtifact?: string;
  cardsArtifact?: string;
};

/** 通过校验后的规范化课节元数据。 */
export interface LessonManifest {
  schemaVersion: 1;
  subjectId: SubjectId;
  courseInstanceId: string;
  lessonId: string;
  courseName: string;
  sessionRange: LessonSessionRange;
  taughtOn: string;
  topic: string;
  revision: number;
  materials: Record<LectureMaterialRole, LessonMaterialMeta>;
  quizId: string;
  sourceRef?: LessonSourceRef;
}

function pad3(n: number): string {
  return String(n).padStart(3, "0");
}

/** 由学期实例与节次推导规范 lessonId（单节 rec-x-fall-007；连堂 rec-x-fall-007-008）。 */
export function expectedLessonId(
  courseInstanceId: string,
  range: LessonSessionRange,
): string {
  return range.start === range.end
    ? `${courseInstanceId}-${pad3(range.start)}`
    : `${courseInstanceId}-${pad3(range.start)}-${pad3(range.end)}`;
}

/** 合法样例（同时作为文档与测试夹具的基准，作者照抄即可）。 */
export function exampleValidLessonManifest(): unknown {
  return {
    schemaVersion: 1,
    subjectId: "instrumental-analysis",
    courseInstanceId: "rec-2026-fall",
    lessonId: "rec-2026-fall-007-008",
    courseName: "分析化学",
    sessionRange: { start: 7, end: 8 },
    taughtOn: "2026-09-11",
    topic: "萃取技术与紫外可见分光光度法",
    revision: 1,
    materials: {
      recording: { file: "recording.md", format: "text" },
      minutes: { file: "minutes.md", format: "markdown" },
      notes: { file: "notes.html", format: "html" },
      cards: { file: "cards.md", format: "markdown" },
    },
    quizId: "rec-2026-fall-007-008",
  };
}

export interface ValidateResult {
  ok: boolean;
  errors: string[];
  /** 仅当 ok 时存在。 */
  manifest?: LessonManifest;
}

/**
 * 校验一份原始 lesson.json（已 JSON.parse 的对象）。
 * @param expectedDirSubjectId 该 lesson 目录所在的学科目录名（content/<subjectId>/...），
 *        用于交叉校验 manifest.subjectId；不传则跳过该项。
 * @param expectedDirLessonId 目录名（<lessonId>），交叉校验 manifest.lessonId。
 */
export function validateLessonManifest(
  raw: unknown,
  opts: { expectedDirSubjectId?: string; expectedDirLessonId?: string } = {},
): ValidateResult {
  const errors: string[] = [];

  const parsed = rawLessonSchema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push(`lesson.json 结构非法：${issue.path.join(".") || "(根)"} ${issue.message}`);
    }
    return { ok: false, errors };
  }
  const m = parsed.data;

  // 1) 课程名 → subjectId 必须可解析，且与写入的 subjectId、目录学科三者一致。
  let resolvedSubject: SubjectId | null = null;
  try {
    resolvedSubject = resolveSubjectByCourseName(m.courseName);
  } catch (e) {
    errors.push(e instanceof Error ? e.message : String(e));
  }
  if (resolvedSubject && resolvedSubject !== m.subjectId) {
    errors.push(
      `subjectId 不一致：lesson.json 写的是「${m.subjectId}」，但课程名「${m.courseName}」应映射到「${resolvedSubject}」`,
    );
  }
  if (
    opts.expectedDirSubjectId &&
    m.subjectId !== opts.expectedDirSubjectId
  ) {
    errors.push(
      `subjectId 与目录不一致：文件位于 content/${opts.expectedDirSubjectId}/lectures/，lesson.json 却写「${m.subjectId}」`,
    );
  }

  // 2) lessonId 格式 + 与 courseInstanceId/节次一致 + 与目录名一致。
  if (!isValidLessonId(m.lessonId)) {
    errors.push(`lessonId「${m.lessonId}」不符合 rec-YYYY-season-NNN[-NNN] 规则`);
  }
  const wantLessonId = expectedLessonId(m.courseInstanceId, m.sessionRange);
  if (m.lessonId !== wantLessonId) {
    errors.push(
      `lessonId「${m.lessonId}」与学期实例/节次推导出的「${wantLessonId}」不一致`,
    );
  }
  if (opts.expectedDirLessonId && m.lessonId !== opts.expectedDirLessonId) {
    errors.push(
      `lessonId「${m.lessonId}」与目录名「${opts.expectedDirLessonId}」不一致`,
    );
  }

  // 3) 节次起止合法、日期真实存在。
  if (m.sessionRange.end < m.sessionRange.start) {
    errors.push(
      `sessionRange 非法：end(${m.sessionRange.end}) 不能小于 start(${m.sessionRange.start})`,
    );
  }
  const d = new Date(`${m.taughtOn}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== m.taughtOn) {
    errors.push(`taughtOn「${m.taughtOn}」不是有效日历日期`);
  }

  // 4) 四份材料的文件名 / 格式必须与 roles 冻结值完全一致（不允许改名、不允许换格式）。
  for (const role of LECTURE_MATERIAL_ROLES) {
    const spec = LECTURE_ROLE_SPEC[role];
    const mat = m.materials[role];
    if (mat.file !== spec.file) {
      errors.push(`materials.${role}.file 必须是「${spec.file}」，当前「${mat.file}」`);
    }
    if (mat.format !== spec.render) {
      errors.push(
        `materials.${role}.format 必须是「${spec.render}」，当前「${mat.format}」`,
      );
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, errors: [], manifest: m as unknown as LessonManifest };
}
