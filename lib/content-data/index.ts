export { contentTree, manifest } from './manifest';
export type {
  ContentTree,
  Subject,
  Category,
  ContentItem,
  ContentRoute,
  SubjectId,
  CategoryId,
  RenderType,
} from '@/lib/types/content';

import { contentTree } from './manifest';
import type {
  Subject,
  Category,
  ContentItem,
  SubjectId,
} from '@/lib/types/content';

export function getSubject(id: SubjectId): Subject | undefined {
  return contentTree.subjects.find((s) => s.id === id);
}

export function getCategory(
  subjectId: SubjectId,
  categoryId: string,
): Category | undefined {
  const subject = getSubject(subjectId);
  return subject?.categories.find((c) => c.id === categoryId);
}

export function getContentItem(
  subjectId: SubjectId,
  categoryId: string,
  itemId: string,
): ContentItem | undefined {
  const category = getCategory(subjectId, categoryId);
  function findItem(items: ContentItem[]): ContentItem | undefined {
    for (const item of items) {
      if (item.id === itemId) return item;
      if (item.children) {
        const found = findItem(item.children);
        if (found) return found;
      }
    }
    return undefined;
  }
  return category ? findItem(category.items) : undefined;
}

/** 查找 itemId 的父节点及其兄弟列表（同父节点的所有 children）。
 *  若 itemId 本身是顶层 item（无父节点），返回 parent=null + category.items。 */
export function getSiblings(
  subjectId: SubjectId,
  categoryId: string,
  itemId: string,
): { parent: ContentItem | null; siblings: ContentItem[] } {
  const category = getCategory(subjectId, categoryId);
  if (!category) return { parent: null, siblings: [] };

  function findParent(items: ContentItem[], target: string): ContentItem | null {
    for (const item of items) {
      if (item.children?.some((child) => child.id === target)) return item;
      if (item.children) {
        const found = findParent(item.children, target);
        if (found) return found;
      }
    }
    return null;
  }

  const parent = findParent(category.items, itemId);
  const siblings = parent?.children ?? category.items;
  return { parent, siblings };
}
