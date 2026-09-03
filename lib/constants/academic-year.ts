import type { ContentTree, Subject } from "@/lib/types/content";
import { SUBJECT_REGISTRY, getSubjectMeta } from "@/lib/content-data/subjects.registry";

/** 学年：大一下学期 / 大二上学期。切换只隐藏内容，不删除文件。 */
export const ACADEMIC_YEAR_IDS = ["freshman-2", "sophomore-1"] as const;
export type AcademicYearId = (typeof ACADEMIC_YEAR_IDS)[number];

export const ACADEMIC_YEAR_LABELS: Record<AcademicYearId, string> = {
  "freshman-2": "大一下学期",
  "sophomore-1": "大二上学期",
};

export const DEFAULT_ACADEMIC_YEAR: AcademicYearId = "sophomore-1";
export const ACADEMIC_YEAR_STORAGE_KEY = "gailvlun-academic-year";

/** 学年 → 学科 id 集合，由 registry 派生。 */
const SUBJECTS_BY_YEAR: Record<AcademicYearId, Set<string>> = {
  "freshman-2": new Set(SUBJECT_REGISTRY.filter((s) => s.year === "freshman-2").map((s) => s.id)),
  "sophomore-1": new Set(SUBJECT_REGISTRY.filter((s) => s.year === "sophomore-1").map((s) => s.id)),
};

/** @deprecated 请用 subjectsOfYear("freshman-2")；保留以兼容旧 import。 */
export const FRESHMAN_SUBJECT_IDS: readonly string[] = [...SUBJECTS_BY_YEAR["freshman-2"]];
/** @deprecated 请用 subjectsOfYear("sophomore-1")；保留以兼容旧 import。 */
export const SOPHOMORE_SUBJECT_IDS: readonly string[] = [...SUBJECTS_BY_YEAR["sophomore-1"]];

export function isAcademicYearId(value: unknown): value is AcademicYearId {
  return typeof value === "string" && (ACADEMIC_YEAR_IDS as readonly string[]).includes(value);
}

/** 科目所属学年。未登记的科目视为大一下学期，避免误藏旧内容。 */
export function academicYearOfSubject(subjectId: string): AcademicYearId {
  return getSubjectMeta(subjectId)?.year ?? "freshman-2";
}

export function filterSubjectsByYear<T extends { id: string }>(
  subjects: readonly T[],
  year: AcademicYearId,
): T[] {
  const allowed = SUBJECTS_BY_YEAR[year];
  return subjects.filter((subject) => allowed.has(subject.id));
}

export function filterContentTreeByYear(
  tree: ContentTree,
  year: AcademicYearId,
): ContentTree {
  return { subjects: filterSubjectsByYear(tree.subjects, year) as Subject[] };
}

/** 智能体默认按当前学年检索；crossYear=true 时不按学年过滤。 */
export function subjectVisibleToAgent(
  subjectId: string,
  year: AcademicYearId | "all",
): boolean {
  if (year === "all") return true;
  return academicYearOfSubject(subjectId) === year;
}
