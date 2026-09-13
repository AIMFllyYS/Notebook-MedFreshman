// 课堂四材料（一节课 = 一个 lesson 目录）的角色定义与文章 id 编解码。
//
// 本模块为**纯函数、无 fs / 无 React 依赖**，客户端与服务端均可安全引用。
// 它是「课堂内容同步」最小契约（P0）的一部分：
//   一节课固定 4 份材料，文件名、文章 id 前缀、渲染格式全部在此冻结，
//   生成器、manifest 适配、loader、校验脚本共用同一份定义，禁止各处自行约定。
//
// 目录形态（详见 docs/sop/12-lecture-content-ingest.md）：
//   content/<subjectId>/lectures/<lessonId>/
//     ├── lesson.json     元数据（被 gen-lectures-manifest 读取）
//     ├── recording.md    课堂原文（逐字稿，受控纯文本渲染）
//     ├── minutes.md      课堂纪要（Markdown）
//     ├── notes.html      课堂笔记（静态自包含 HTML）
//     └── cards.md        复习手卡（Markdown，:::memory mode=reveal）

import type { RenderType } from "@/lib/types/content";

/** 四材料角色，顺序即导航顺序。 */
export const LECTURE_MATERIAL_ROLES = [
  "recording",
  "minutes",
  "notes",
  "cards",
] as const;

export type LectureMaterialRole = (typeof LECTURE_MATERIAL_ROLES)[number];

interface RoleSpec {
  /** 文章 id 前缀，拼出全局唯一 articleId = `${prefix}-${lessonId}`。 */
  prefix: string;
  /** lesson 目录内的固定文件名（不允许改名、不允许子目录）。 */
  file: string;
  /** 该材料在站点上的受控渲染格式。 */
  render: RenderType;
  /** 导航中展示的中文材料名。 */
  label: string;
}

export const LECTURE_ROLE_SPEC: Record<LectureMaterialRole, RoleSpec> = {
  recording: { prefix: "rec", file: "recording.md", render: "text", label: "课堂原文" },
  minutes: { prefix: "min", file: "minutes.md", render: "markdown", label: "课堂纪要" },
  notes: { prefix: "note", file: "notes.html", render: "html", label: "课堂笔记" },
  cards: { prefix: "card", file: "cards.md", render: "markdown", label: "复习手卡" },
};

/** 允许作为出题来源的材料角色（只有课堂原文与课堂笔记，纪要/手卡不直接出题）。 */
export const LECTURE_QUIZ_SOURCE_ROLES = ["recording", "notes"] as const;

/**
 * lessonId 规则：学期实例 + 课程内累计节次。
 * 形如 `rec-2026-fall-007-008`（2026 秋季、第 7-8 节连堂）。
 * - 学期段固定 `rec-YYYY-season`，season ∈ spring/fall；
 * - 节次段为 3 位数字，连堂为 `起-止`，单节为单个 `xxx`。
 */
const LESSON_ID_RE = /^rec-\d{4}-(?:spring|fall)-\d{3}(?:-\d{3})?$/;

export function isValidLessonId(lessonId: string): boolean {
  return LESSON_ID_RE.test(lessonId);
}

/** 由 lessonId + 角色拼出文章 id（= 路由 [id]，也是 quizRef 之外的稳定标识）。 */
export function lectureArticleId(lessonId: string, role: LectureMaterialRole): string {
  return `${LECTURE_ROLE_SPEC[role].prefix}-${lessonId}`;
}

export interface ParsedArticleId {
  lessonId: string;
  role: LectureMaterialRole;
}

/**
 * 解析文章 id 回 {lessonId, role}；非课堂材料文章返回 null。
 * 前缀在串首唯一匹配（rec/min/note/card 互不为前缀冲突）。
 */
export function parseLectureArticleId(articleId: string): ParsedArticleId | null {
  for (const role of LECTURE_MATERIAL_ROLES) {
    const p = `${LECTURE_ROLE_SPEC[role].prefix}-`;
    if (articleId.startsWith(p)) {
      const lessonId = articleId.slice(p.length);
      if (isValidLessonId(lessonId)) return { lessonId, role };
    }
  }
  return null;
}
