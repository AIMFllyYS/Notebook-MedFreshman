import type { Category, ContentItem } from '@/lib/types/content';

const STUB_ITEM: ContentItem = {
  id: 'placeholder',
  title: '敬请期待',
  type: 'document',
  status: 'stub',
};

/** 大二上科目与大一相同的板块顺序；教材之外暂无课堂资料，一律 stub。 */
export function sophomoreCategorySkeleton(textbookItems: ContentItem[]): Category[] {
  return [
    { id: 'textbook', name: '教材', items: textbookItems },
    { id: 'detail', name: '详解', items: [STUB_ITEM] },
    { id: 'recording', name: '课上录音', items: [STUB_ITEM] },
    { id: 'summary', name: '课堂纪要', items: [STUB_ITEM] },
    { id: 'kaoqian-moni', name: '考前模拟', items: [STUB_ITEM] },
    { id: 'shizhan-yanlian', name: '实战演练', items: [STUB_ITEM] },
  ];
}
