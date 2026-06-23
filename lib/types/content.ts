// 多科内容树类型定义 —— 科目 / 分类 / 内容项层级，驱动多科导航与 AI 工具。

export type SubjectId = 'probability' | 'physics' | 'chemistry' | 'modern-history' | 'maogai' | 'other';
export type CategoryId = string;

export type RenderType = 'markdown' | 'html' | 'component';

/** 合法科目的单一真相源，供路由运行时校验复用。 */
export const SUBJECT_IDS: readonly SubjectId[] = [
  'probability', 'physics', 'chemistry', 'modern-history', 'maogai', 'other',
];

export function isSubjectId(value: string | undefined | null): value is SubjectId {
  return value != null && (SUBJECT_IDS as readonly string[]).includes(value);
}

export interface Subject {
  id: SubjectId;
  name: string;
  icon: string;
  categories: Category[];
}

export interface Category {
  id: string;
  name: string;
  items: ContentItem[];
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'section' | 'document';
  status?: 'done' | 'draft' | 'stub';
  summary?: string;
  videoIds?: string[];
  interactiveIds?: string[];
  children?: ContentItem[];
  renderType?: RenderType;
}

export interface ContentTree {
  subjects: Subject[];
}

export interface ContentRoute {
  subjectId: SubjectId;
  categoryId: string;
  itemId: string;
}
