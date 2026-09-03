import type { Category, ContentItem } from '@/lib/types/content';
import { STANDARD_CATEGORY_ORDER, category, stubCategory } from './category-templates';

/** 大二上科目与大一相同的板块顺序；教材之外暂无课堂资料，一律 stub。 */
export function sophomoreCategorySkeleton(textbookItems: ContentItem[]): Category[] {
  return STANDARD_CATEGORY_ORDER.map((id) =>
    id === 'textbook' ? category('textbook', textbookItems) : stubCategory(id),
  );
}
