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
  // 课堂内容需要这些字段驱动渲染 / 题库共享 / 分组折叠（正文与路径不进导航瘦身文件）。
  if (item.renderType) out.renderType = item.renderType;
  if (item.navigationOnly) out.navigationOnly = true;
  if (item.materialRole) out.materialRole = item.materialRole;
  if (item.lessonRef) out.lessonRef = item.lessonRef;
  if (item.quizRef) out.quizRef = item.quizRef;
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
      ...(cat.capabilities?.length ? { capabilities: cat.capabilities } : {}),
      ...(cat.keyStrategy ? { keyStrategy: cat.keyStrategy } : {}),
      items: cat.items.map(slimItem),
    })),
  })),
};

const outPath = path.join(process.cwd(), 'lib/content-data/nav.generated.json');
fs.writeFileSync(outPath, JSON.stringify(nav, null, 2));
console.log(`Wrote ${outPath}`);
