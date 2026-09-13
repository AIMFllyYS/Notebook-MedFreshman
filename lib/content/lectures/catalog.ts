// 课堂内容生成目录（lectures.generated.json）的类型与常量（纯类型 / 无 fs）。
// 生成器 scripts/gen-lectures-manifest.ts 写出该文件；运行时由 lib/content-data/lectures.ts 读取。

import type { SubjectId } from "@/lib/content-data/subjects.registry";
import type {
  LectureMaterialRole,
} from "@/lib/content/lectures/roles";
import type { LessonSessionRange } from "@/lib/content/lectures/schema";

export const LECTURES_GENERATED_VERSION = 1;

export interface LectureMaterialEntry {
  role: LectureMaterialRole;
  file: string;
  format: "text" | "markdown" | "html";
  /** 路由文章 id（= `${prefix}-${lessonId}`）。 */
  articleId: string;
}

export interface LectureCatalogEntry {
  subjectId: SubjectId;
  lessonId: string;
  courseInstanceId: string;
  courseName: string;
  sessionRange: LessonSessionRange;
  taughtOn: string;
  topic: string;
  revision: number;
  quizId: string;
  materials: Record<LectureMaterialRole, LectureMaterialEntry>;
  /** 内容哈希，用于题源绑定与变更检测。 */
  hashes: { recording: string; notesText: string };
}

export interface LectureCatalog {
  schemaVersion: number;
  lessons: LectureCatalogEntry[];
}
