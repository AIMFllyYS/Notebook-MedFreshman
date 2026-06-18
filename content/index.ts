export { contentTree, manifest } from './manifest';
export type {
  ContentTree,
  Subject,
  Category,
  ContentItem,
  ContentRoute,
  SubjectId,
  CategoryId,
} from '@/lib/types/content';

import { contentTree } from './manifest';
import type {
  Subject,
  Category,
  ContentItem,
  SubjectId,
  CategoryId,
} from '@/lib/types/content';

export function getSubject(id: SubjectId): Subject | undefined {
  return contentTree.subjects.find((s) => s.id === id);
}

export function getCategory(
  subjectId: SubjectId,
  categoryId: CategoryId,
): Category | undefined {
  const subject = getSubject(subjectId);
  return subject?.categories.find((c) => c.id === categoryId);
}

export function getContentItem(
  subjectId: SubjectId,
  categoryId: CategoryId,
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
