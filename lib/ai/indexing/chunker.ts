// 内容分块管道：遍历 contentTree 全部可搜索叶节点，读取 md，按语义边界分块。
import { contentTree } from '@/lib/content-data/manifest';
import { readContentMarkdown, findContentItem, stripMarkdown } from '@/lib/content/loader';
import type { ContentItem } from '@/lib/types/content';

export interface ContentChunk {
  id: string;           // "probability/detail/1.4#0"
  path: string;         // "probability/detail/1.4" — 可直传 getSection
  subjectId: string;
  subjectName: string;
  categoryId: string;
  itemId: string;
  title: string;        // 完整面包屑标题
  chunkIndex: number;
  text: string;         // 分块纯文本（已 strip markdown）
  contextPrefix: string; // 文档级摘要（前 100 token，用于上下文化嵌入）
}

const SEARCHABLE_CATEGORIES = new Set(['detail', 'recording', 'summary']);
const TARGET_CHUNK_TOKENS = 300;
const MAX_CHUNK_TOKENS = 400;
const MIN_SPLIT_TOKENS = 100;

function estimateTokens(text: string): number {
  let tokens = 0;
  for (const char of text) {
    const code = char.codePointAt(0)!;
    if (code > 0x4dff && code < 0x9fff) {
      tokens += 2;
    } else if (/[a-zA-Z]/.test(char)) {
      tokens += 0.3;
    } else {
      tokens += 1;
    }
  }
  return Math.ceil(tokens);
}

function splitByHeadings(text: string): string[] {
  const sections = text.split(/(?=^#{2,3}\s)/m);
  return sections.filter((s) => s.trim().length > 0);
}

function splitByParagraphs(text: string): string[] {
  return text.split(/\n{2,}/).filter((p) => p.trim().length > 0);
}

function buildChunks(plainText: string, maxTokens: number): string[] {
  const totalTokens = estimateTokens(plainText);

  if (totalTokens <= maxTokens) {
    return [plainText];
  }

  // 先按标题切分
  const headingSections = splitByHeadings(plainText);
  const chunks: string[] = [];

  for (const section of headingSections) {
    const sectionTokens = estimateTokens(section);
    if (sectionTokens <= maxTokens) {
      chunks.push(section.trim());
    } else {
      // 标题段太长，按段落继续切
      const paragraphs = splitByParagraphs(section);
      let current = '';
      for (const para of paragraphs) {
        const paraTokens = estimateTokens(para);
        const currentTokens = estimateTokens(current);

        if (currentTokens + paraTokens <= maxTokens) {
          current += (current ? '\n\n' : '') + para;
        } else {
          if (current.trim() && estimateTokens(current) >= MIN_SPLIT_TOKENS) {
            chunks.push(current.trim());
          }
          if (paraTokens > maxTokens) {
            // 超长段落直接按字符硬切
            const words = para.split('');
            current = '';
            for (const w of words) {
              if (estimateTokens(current + w) > maxTokens) {
                if (current.trim()) chunks.push(current.trim());
                current = w;
              } else {
                current += w;
              }
            }
          } else {
            current = para;
          }
        }
      }
      if (current.trim() && estimateTokens(current) >= MIN_SPLIT_TOKENS) {
        chunks.push(current.trim());
      } else if (current.trim() && chunks.length > 0) {
        chunks[chunks.length - 1] += '\n\n' + current.trim();
      } else if (current.trim()) {
        chunks.push(current.trim());
      }
    }
  }

  return chunks.length ? chunks : [plainText.slice(0, 2000)];
}

function buildContextPrefix(
  subjectName: string,
  categoryId: string,
  title: string,
  plainText: string,
): string {
  const firstLine = plainText.split('\n')[0]?.slice(0, 80) || '';
  return `[${subjectName}/${categoryId}] ${title} | ${firstLine}`;
}

export function generateChunks(): ContentChunk[] {
  const allChunks: ContentChunk[] = [];

  for (const subject of contentTree.subjects) {
    if (subject.id === 'other') continue;

    for (const cat of subject.categories) {
      if (!SEARCHABLE_CATEGORIES.has(cat.id)) continue;

      const leafItems: { item: ContentItem; parentTitle?: string }[] = [];
      for (const item of cat.items) {
        if (item.children?.length) {
          for (const child of item.children) {
            leafItems.push({ item: child, parentTitle: item.title });
          }
        } else {
          leafItems.push({ item });
        }
      }

      for (const { item, parentTitle } of leafItems) {
        if (item.status === 'stub') continue;
        const md = readContentMarkdown(subject.id, cat.id, item.id);
        if (!md) continue;

        const plainText = stripMarkdown(md);
        if (!plainText.trim()) continue;

        const found = findContentItem(subject.id, cat.id, item.id);
        const titleParts = [subject.name, cat.name];
        if (parentTitle) titleParts.push(parentTitle);
        titleParts.push(`${item.id} ${item.title}`);
        const fullTitle = titleParts.join(' > ');

        const contextPrefix = buildContextPrefix(
          subject.name,
          cat.id,
          fullTitle,
          plainText,
        );

        const textChunks = buildChunks(plainText, MAX_CHUNK_TOKENS);
        const basePath = `${subject.id}/${cat.id}/${item.id}`;

        for (let idx = 0; idx < textChunks.length; idx++) {
          allChunks.push({
            id: `${basePath}#${idx}`,
            path: basePath,
            subjectId: subject.id,
            subjectName: subject.name,
            categoryId: cat.id,
            itemId: item.id,
            title: fullTitle,
            chunkIndex: idx,
            text: textChunks[idx],
            contextPrefix,
          });
        }
      }
    }
  }

  return allChunks;
}
