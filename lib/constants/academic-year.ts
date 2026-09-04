import type { ContentTree, Subject } from "@/lib/types/content";
import { SUBJECT_REGISTRY, getSubjectMeta } from "@/lib/content-data/subjects.registry";

/**
 * 学年：大一～大五，上 / 下学期均可选。
 * 切换只隐藏内容，不删除文件。尚无教材的学期为空书架。
 */
export const ACADEMIC_YEAR_IDS = [
  "freshman-1",
  "freshman-2",
  "sophomore-1",
  "sophomore-2",
  "junior-1",
  "junior-2",
  "senior-1",
  "senior-2",
  "fifth-1",
  "fifth-2",
] as const;
export type AcademicYearId = (typeof ACADEMIC_YEAR_IDS)[number];

export const ACADEMIC_YEAR_LABELS: Record<AcademicYearId, string> = {
  "freshman-1": "大一上学期",
  "freshman-2": "大一下学期",
  "sophomore-1": "大二上学期",
  "sophomore-2": "大二下学期",
  "junior-1": "大三上学期",
  "junior-2": "大三下学期",
  "senior-1": "大四上学期",
  "senior-2": "大四下学期",
  "fifth-1": "大五上学期",
  "fifth-2": "大五下学期",
};

export type AcademicGrade = 1 | 2 | 3 | 4 | 5;
export type AcademicTerm = "fall" | "spring";

export interface AcademicYearGrade {
  grade: AcademicGrade;
  /** 年级短标签，如「大二」 */
  shortLabel: string;
  fall: AcademicYearId;
  spring: AcademicYearId;
}

export const ACADEMIC_YEAR_GRADES: readonly AcademicYearGrade[] = [
  { grade: 1, shortLabel: "大一", fall: "freshman-1", spring: "freshman-2" },
  { grade: 2, shortLabel: "大二", fall: "sophomore-1", spring: "sophomore-2" },
  { grade: 3, shortLabel: "大三", fall: "junior-1", spring: "junior-2" },
  { grade: 4, shortLabel: "大四", fall: "senior-1", spring: "senior-2" },
  { grade: 5, shortLabel: "大五", fall: "fifth-1", spring: "fifth-2" },
] as const;

export const DEFAULT_ACADEMIC_YEAR: AcademicYearId = "sophomore-1";
export const ACADEMIC_YEAR_STORAGE_KEY = "gailvlun-academic-year";

/** 书架学科卡与学年格共用，保证左右与列宽对齐。
 *  学年格的 CSS 容器查询断点必须同步：392 / 598 / 804 / 1010
 *  （n 列下限 = n * CARD_MIN + (n-1) * GAP）。 */
export const BOOKSHELF_CARD_MIN = 186;
export const BOOKSHELF_GRID_GAP = 20;
export const BOOKSHELF_GRID_COLUMNS = `repeat(auto-fill, minmax(${BOOKSHELF_CARD_MIN}px, 1fr))`;

/** 与 `auto-fill + minmax(186px, 1fr) + gap` 算出的学科卡同宽。 */
export function bookshelfColumnWidth(containerWidth: number): number {
  const cols = Math.max(1, Math.floor((containerWidth + BOOKSHELF_GRID_GAP) / (BOOKSHELF_CARD_MIN + BOOKSHELF_GRID_GAP)));
  return (containerWidth - BOOKSHELF_GRID_GAP * (cols - 1)) / cols;
}

/** 学年 → 学科 id 集合，由 registry 派生；空学期是合法的空集合。 */
const SUBJECTS_BY_YEAR: Record<AcademicYearId, Set<string>> = Object.fromEntries(
  ACADEMIC_YEAR_IDS.map((id) => [
    id,
    new Set(SUBJECT_REGISTRY.filter((s) => s.year === id).map((s) => s.id)),
  ]),
) as Record<AcademicYearId, Set<string>>;

export function isAcademicYearId(value: unknown): value is AcademicYearId {
  return typeof value === "string" && (ACADEMIC_YEAR_IDS as readonly string[]).includes(value);
}

export function gradeOfAcademicYear(year: AcademicYearId): AcademicYearGrade {
  const group = ACADEMIC_YEAR_GRADES.find((g) => g.fall === year || g.spring === year);
  if (!group) {
    throw new Error(`Unknown academic year: ${year}`);
  }
  return group;
}

export function termOfAcademicYear(year: AcademicYearId): AcademicTerm {
  return gradeOfAcademicYear(year).fall === year ? "fall" : "spring";
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
