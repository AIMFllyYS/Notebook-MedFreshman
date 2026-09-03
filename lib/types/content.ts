// 多科内容树类型定义 —— 科目 / 分类 / 内容项层级，驱动多科导航与 AI 工具。
// SubjectId 与合法学科列表由 lib/content-data/subjects.registry.ts 派生，此处仅 re-export 保持旧 import 路径可用。

export type { SubjectId } from '@/lib/content-data/subjects.registry';
export { SUBJECT_IDS, isSubjectId } from '@/lib/content-data/subjects.registry';
import type { SubjectId } from '@/lib/content-data/subjects.registry';

export type CategoryId = string;

export type RenderType = 'markdown' | 'html' | 'component';

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
