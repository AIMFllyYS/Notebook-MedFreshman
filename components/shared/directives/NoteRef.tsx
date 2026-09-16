"use client";

import { useRouter } from "next/navigation";
import { BookOpen, CornerDownRight } from "lucide-react";
import { requestCitedNote } from "@/lib/notes/openCitedNote";
import { noteBreadcrumb, parseNotePath } from "@/lib/content/notePath";

interface NodeProps {
  node?: { properties?: Record<string, unknown> };
}

/**
 * 课程讲义引用芯片（Markdown 指令式）。
 *
 * 用法（一般由笔记编辑器的「引用讲义」选择器写入，也可手写）：
 *   ::noteref{path="probability/detail/1.4" title="全概率公式" snippet="设 B1…Bn 为划分"}
 *
 * 点击后走的是既有引用链路：requestCitedNote 落一次定位请求 → router.push 到讲义页 →
 * ContentPageClient 的 useCitationLocator 消费它，把 snippet 高亮并滚到视口上方。
 * 这里不自己实现定位，避免出现第二套高亮逻辑。
 */
export function NoteRef({ node }: NodeProps) {
  const router = useRouter();
  const path = String(node?.properties?.path ?? "").trim();
  const snippet = String(node?.properties?.snippet ?? "").trim();
  const rawTitle = String(node?.properties?.title ?? "").trim();

  const parsed = path ? parseNotePath(path) : null;
  const broken = !parsed;
  const label = parsed ? noteBreadcrumb(parsed, rawTitle) : path || "未知讲义";

  function open() {
    if (broken) return;
    const href = requestCitedNote(path, snippet);
    if (href) router.push(href);
  }

  return (
    <span className="note-ref">
      <button
        type="button"
        className="note-ref-chip"
        data-no-drag
        data-broken={broken ? "1" : undefined}
        onClick={open}
        disabled={broken}
        title={broken ? `引用路径无法解析：${path}` : `跳转到讲义并定位：${label}`}
      >
        <BookOpen size={13} className="note-ref-icon" aria-hidden="true" />
        <span className="note-ref-kind">讲义</span>
        <span className="note-ref-title">{rawTitle || label}</span>
      </button>
      {snippet ? (
        <span className="note-ref-snippet">
          <CornerDownRight size={12} className="note-ref-snippet-icon" aria-hidden="true" />
          {snippet}
        </span>
      ) : null}
    </span>
  );
}
