// 生成导航瘦身 JSON：仅 id/title/children/status。
// 用法: npx tsx scripts/gen-nav-manifest.ts
import * as fs from 'node:fs';
import * as path from 'node:path';
import { contentTree } from '../lib/content-data/manifest';
import type { ContentItem } from '@/lib/types/content';

function slimItem(item: ContentItem): ContentItem {
  const out: ContentItem = {
    id: item.id,
    title: item.title,
    type: item.type,
    status: item.status,
  };
  if (item.children?.length) out.children = item.children.map(slimItem);
  return out;
}

const nav = {
  subjects: contentTree.subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
    icon: subject.icon,
    categories: subject.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      items: cat.items.map(slimItem),
    })),
  })),
};

const outPath = path.join(process.cwd(), 'lib/content-data/nav.generated.json');
fs.writeFileSync(outPath, JSON.stringify(nav, null, 2));
console.log(`Wrote ${outPath}`);
