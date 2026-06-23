import { notFound } from "next/navigation";
import { isSubjectId } from "@/lib/types/content";
import type { ContentItem } from "@/lib/types/content";
import { contentTree, getContentItem, getSubject, getCategory } from "@/lib/content-data";
import { readContent, readExamples, deriveExampleKey } from "@/lib/content/loader";
import { normalizeDirectiveLabels } from "@/lib/markdown/normalizeDirectiveLabels";
import NoteRendererServer from "@/components/notes/NoteRendererServer";
import ContentPageClient from "./ContentPageClient";

interface PageProps {
  params: Promise<{ subject: string; category: string; id: string }>;
}

// 构建期为 manifest 中的全部 (subject, category, id) 预渲染（SSG），EdgeOne 边缘缓存。
// 正文 Markdown→HTML（含 KaTeX/高亮）在此一次完成，客户端切章时不再解析。
export async function generateStaticParams() {
  const params: { subject: string; category: string; id: string }[] = [];
  for (const subject of contentTree.subjects) {
    for (const category of subject.categories) {
      const walk = (items: ContentItem[]) => {
        for (const item of items) {
          params.push({ subject: subject.id, category: category.id, id: item.id });
          if (item.children) walk(item.children);
        }
      };
      walk(category.items);
    }
  }
  return params;
}

// 未在 manifest 中枚举的 id（如 stub）按需在 Node Function 渲染后缓存，不直接 404。
export const dynamicParams = true;
// 内容随 git 提交变动 → 构建期烘焙即可，无需时间型增量再生。
export const revalidate = false;

export default async function ContentPage({ params }: PageProps) {
  const { subject, category, id } = await params;

  // 科目做运行时类型守卫；分类由 manifest 动态查找校验（彻底解耦后 CategoryId 不再是固定联合类型）。
  if (!isSubjectId(subject)) {
    notFound();
  }

  const subjectData = getSubject(subject);
  const categoryData = getCategory(subject, category);
  const item = getContentItem(subject, category, id);

  // 内容项不存在时显示占位
  if (!subjectData || !categoryData) {
    notFound();
  }

  // 服务端直接读取正文做首屏 SSR，消除「客户端挂载后再 fetch /api/section」的瀑布与骨架闪烁。
  const renderType = item?.renderType ?? 'markdown';
  const rawContent = readContent(subject, category, id, renderType);
  const normalizedContent = (rawContent && renderType === 'markdown') ? normalizeDirectiveLabels(rawContent) : rawContent;

  // 正文 markdown 在服务端/构建期渲染为 React 树，作为插槽下传给客户端外壳；
  // 浏览器只做协调 + 交互岛水合，不再在客户端跑 react-markdown + KaTeX + 高亮。
  const renderedNote =
    (normalizedContent && renderType === 'markdown')
      ? <NoteRendererServer content={normalizedContent} />
      : null;

  // 例题同样服务端预读（与正文一致走 SSR），避免点「例题」Tab 时再 fetch。
  const { chapterId, sectionId } = deriveExampleKey(category, id);
  const initialExamples = readExamples(subject, chapterId, sectionId);

  return (
    <ContentPageClient
      subjectId={subject}
      categoryId={category}
      itemId={id}
      initialContent={normalizedContent}
      renderedNote={renderedNote}
      initialExamples={initialExamples}
      sectionId={sectionId}
      itemTitle={item?.title ?? ""}
      itemSummary={item?.summary ?? ""}
      subjectName={subjectData.name}
      categoryName={categoryData.name}
      itemStatus={item?.status ?? "stub"}
      renderType={renderType}
    />
  );
}
