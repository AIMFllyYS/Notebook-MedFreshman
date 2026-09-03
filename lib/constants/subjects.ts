// 学科常量 —— 全部由 lib/content-data/subjects.registry.ts 派生，保留旧导出名以兼容既有 import。
// 新增学科请改 registry，不要在这里加条目。
import {
  SUBJECT_REGISTRY,
  subjectColor,
  type SubjectId,
} from '@/lib/content-data/subjects.registry';
import type { SubjectIconName } from '@/lib/ui/subjectIcons';

export const SUBJECTS: Record<SubjectId, string> = Object.fromEntries(
  SUBJECT_REGISTRY.map((s) => [s.id, s.name]),
) as Record<SubjectId, string>;

export const SUBJECT_ICONS: Record<SubjectId, SubjectIconName> = Object.fromEntries(
  SUBJECT_REGISTRY.map((s) => [s.id, s.icon]),
) as Record<SubjectId, SubjectIconName>;

export const SUBJECT_COLORS: Record<SubjectId, string> = Object.fromEntries(
  SUBJECT_REGISTRY.map((s) => [s.id, s.color]),
) as Record<SubjectId, string>;

export { subjectColor };

export const DEFAULT_SUBJECT: SubjectId = SUBJECT_REGISTRY[0].id;
export const DEFAULT_CATEGORY: string = 'detail';
