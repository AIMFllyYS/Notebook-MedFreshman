import type { Category, ContentItem } from '@/lib/types/content';
import { STANDARD_CATEGORY_ORDER, category, stubCategory } from './category-templates';

/** 大二上科目与大一相同的板块顺序；教材之外暂无课堂资料，一律 stub。 */
export function sophomoreCategorySkeleton(textbookItems: ContentItem[]): Category[] {
  return STANDARD_CATEGORY_ORDER.map((id) =>
    id === 'textbook' ? category('textbook', textbookItems) : stubCategory(id),
  );
}

/** 教材保留，其余标准板块按有料填、没料 stub。 */
export function sophomoreCategories(filled: {
  textbook: ContentItem[];
  detail?: ContentItem[];
  recording?: ContentItem[];
  summary?: ContentItem[];
  kaoqianMoni?: ContentItem[];
  shizhanYanlian?: ContentItem[];
}): Category[] {
  const byId: Record<string, ContentItem[] | undefined> = {
    textbook: filled.textbook,
    detail: filled.detail,
    recording: filled.recording,
    summary: filled.summary,
    'kaoqian-moni': filled.kaoqianMoni,
    'shizhan-yanlian': filled.shizhanYanlian,
  };
  return STANDARD_CATEGORY_ORDER.map((id) => {
    const items = byId[id];
    if (items && items.length > 0) {
      return category(id, items);
    }
    return stubCategory(id);
  });
}
