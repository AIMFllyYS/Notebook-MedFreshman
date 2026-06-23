import { notFound } from "next/navigation";
import { isSubjectId } from "@/lib/types/content";
import { getContentItem, getSubject, getCategory } from "@/content";
import { readContent, readExamples, deriveExampleKey } from "@/lib/content/loader";
import { normalizeDirectiveLabels } from "@/lib/markdown/normalizeDirectiveLabels";
import ContentPageClient from "./ContentPageClient";

interface PageProps {
  params: Promise<{ subject: string; category: string; id: string }>;
}

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
  // 例题同样服务端预读（与正文一致走 SSR），避免点「例题」Tab 时再 fetch。
  const { chapterId, sectionId } = deriveExampleKey(category, id);
  const initialExamples = readExamples(subject, chapterId, sectionId);

  return (
    <ContentPageClient
      subjectId={subject}
      categoryId={category}
      itemId={id}
      initialContent={normalizedContent}
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
