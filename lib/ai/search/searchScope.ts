import { subjectVisibleToAgent, type AcademicYearId } from "@/lib/constants/academic-year";

export type SearchScope = AcademicYearId | "all";

export interface SearchFilter {
  /** 默认 all。智能体默认传入当前学年。 */
  academicYear?: SearchScope;
  /** 硬过滤：只保留该科目。 */
  subjectId?: string;
  /** 软加权：当前正在阅读的科目，RRF 之后轻微提升。 */
  preferSubjectId?: string;
}

export function chunkInScope(subjectId: string, filter?: SearchFilter): boolean {
  if (!filter) return true;
  if (filter.subjectId && subjectId !== filter.subjectId) return false;
  const year = filter.academicYear;
  if (year && year !== "all" && !subjectVisibleToAgent(subjectId, year)) return false;
  return true;
}
