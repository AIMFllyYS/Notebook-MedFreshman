// 多科内容树类型定义 —— 科目 / 分类 / 内容项层级，驱动多科导航与 AI 工具。

export type SubjectId = 'probability' | 'physics' | 'chemistry' | 'modern-history' | 'maogai' | 'other';
export type CategoryId = 'textbook' | 'detail' | 'recording' | 'summary';

export interface Subject {
  id: SubjectId;
  name: string;
  icon: string;
  categories: Category[];
}

export interface Category {
  id: CategoryId;
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
}

export interface ContentTree {
  subjects: Subject[];
}

export interface ContentRoute {
  subjectId: SubjectId;
  categoryId: CategoryId;
  itemId: string;
}
