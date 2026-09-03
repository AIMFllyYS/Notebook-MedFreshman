// 标准板块模板：名称、能力、key 推导策略与默认顺序的唯一声明处。
// 新增一个所有学科通用的板块：在 STANDARD_CATEGORIES 加一项并放入 STANDARD_CATEGORY_ORDER。
// 某学科私有板块：直接在 manifest 里写完整 Category 对象（含 capabilities）。
import type { Category, CategoryCapability, CategoryKeyStrategy, ContentItem } from '@/lib/types/content';

export interface CategoryTemplate {
  name: string;
  capabilities: readonly CategoryCapability[];
  keyStrategy?: CategoryKeyStrategy;
}

export const STANDARD_CATEGORIES = {
  textbook: { name: '教材', capabilities: ['examples', 'quiz', 'search'], keyStrategy: 'chapter-prefix' },
  detail: { name: '详解', capabilities: ['examples', 'quiz', 'search', 'media'], keyStrategy: 'section-dot' },
  recording: { name: '课上录音', capabilities: ['examples', 'quiz', 'search'], keyStrategy: 'category-item' },
  summary: { name: '课堂纪要', capabilities: ['search'] },
  'kaoqian-moni': { name: '考前模拟', capabilities: [] },
  'shizhan-yanlian': { name: '实战演练', capabilities: [] },
} as const satisfies Record<string, CategoryTemplate>;

export type StandardCategoryId = keyof typeof STANDARD_CATEGORIES;

/** 一门课的标准板块顺序。 */
export const STANDARD_CATEGORY_ORDER: readonly StandardCategoryId[] = [
  'textbook',
  'detail',
  'recording',
  'summary',
  'kaoqian-moni',
  'shizhan-yanlian',
];

export const STUB_ITEM: ContentItem = {
  id: 'placeholder',
  title: '敬请期待',
  type: 'document',
  status: 'stub',
};

/** 以模板构建板块；overrides 可覆盖 name / capabilities 等。 */
export function category(
  id: StandardCategoryId,
  items: ContentItem[],
  overrides?: Partial<Omit<Category, 'id' | 'items'>>,
): Category {
  const tpl = STANDARD_CATEGORIES[id];
  return {
    id,
    name: tpl.name,
    capabilities: tpl.capabilities,
    ...('keyStrategy' in tpl ? { keyStrategy: tpl.keyStrategy } : {}),
    ...overrides,
    items,
  };
}

/** 尚无内容的板块占位。 */
export function stubCategory(id: StandardCategoryId): Category {
  return category(id, [STUB_ITEM]);
}

/** 单条 stub 教材占位（大一部分学科尚未接入教材正文）。 */
export function stubTextbookItem(title: string, id = 'main'): ContentItem {
  return { id, title, type: 'document', status: 'stub' };
}
