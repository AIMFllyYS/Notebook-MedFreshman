import type { ContentTree, Subject } from "@/lib/types/content";

/** 学年：大一下学期 / 大二上学期。切换只隐藏内容，不删除文件。 */
export const ACADEMIC_YEAR_IDS = ["freshman-2", "sophomore-1"] as const;
export type AcademicYearId = (typeof ACADEMIC_YEAR_IDS)[number];

export const ACADEMIC_YEAR_LABELS: Record<AcademicYearId, string> = {
  "freshman-2": "大一下学期",
  "sophomore-1": "大二上学期",
};

export const DEFAULT_ACADEMIC_YEAR: AcademicYearId = "sophomore-1";
export const ACADEMIC_YEAR_STORAGE_KEY = "gailvlun-academic-year";

export const FRESHMAN_SUBJECT_IDS = [
  "probability",
  "physics",
  "chemistry",
  "modern-history",
  "maogai",
  "other",
] as const;

export const SOPHOMORE_SUBJECT_IDS = [
  "cell-biology",
  "biochemistry",
  "anatomy",
  "histology",
  "instrumental-analysis",
] as const;

const SOPHOMORE_SET = new Set<string>(SOPHOMORE_SUBJECT_IDS);
const FRESHMAN_SET = new Set<string>(FRESHMAN_SUBJECT_IDS);

export function isAcademicYearId(value: unknown): value is AcademicYearId {
  return value === "freshman-2" || value === "sophomore-1";
}

/** 科目所属学年。未登记的科目视为大一下学期，避免误藏旧内容。 */
export function academicYearOfSubject(subjectId: string): AcademicYearId {
  if (SOPHOMORE_SET.has(subjectId)) return "sophomore-1";
  return "freshman-2";
}

export function filterSubjectsByYear<T extends { id: string }>(
  subjects: readonly T[],
  year: AcademicYearId,
): T[] {
  const allowed = year === "sophomore-1" ? SOPHOMORE_SET : FRESHMAN_SET;
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
