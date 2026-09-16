"use client";

import { useState } from "react";
import { BookmarkCheck, ChevronRight, AlertTriangle } from "lucide-react";
import { useReviewCards } from "@/lib/hooks/useReviewCards";
// 叶子渲染器，不经过 QuizMarkdown → registry，避免与本文件成环（同 MemoryCard）。
import QuizMarkdownBase from "@/components/quiz/QuizMarkdownBase";

interface NodeProps {
  node?: { properties?: Record<string, unknown> };
}

/**
 * 复习闪卡引用芯片（Markdown 指令式）。
 *
 * 用法（一般由笔记编辑器的「引用闪卡」选择器写入）：
 *   ::cardref{cardid="k3f9x2a1c" label="全概率公式的适用条件"}
 *
 * 只存 cardid：卡面正文实时从 useReviewCards 读，所以在复习板里改过 / 重新出过的卡，
 * 笔记里的引用会跟着更新，不会留下一份过期副本。卡被删掉则降级为失效提示。
 * 点击展开可以就地翻面复习，不用跳去复习板。
 */
export function CardRef({ node }: NodeProps) {
  const cardId = String(node?.properties?.cardid ?? "").trim();
  const label = String(node?.properties?.label ?? "").trim();
  const card = useReviewCards((s) => (cardId ? s.byId[cardId] : undefined));
  const [open, setOpen] = useState(false);
  const [showBack, setShowBack] = useState(false);

  if (!card) {
    return (
      <span className="note-ref">
        <span className="note-ref-chip" data-broken="1" title={`复习卡 ${cardId} 已不存在`}>
          <AlertTriangle size={13} className="note-ref-icon" aria-hidden="true" />
          <span className="note-ref-kind">闪卡</span>
          <span className="note-ref-title">{label || cardId}（已删除）</span>
        </span>
      </span>
    );
  }

  const front = card.front || card.originalText;
  const back = card.back;
  const ready = card.status === "ready";

  return (
    <span className="note-ref is-card">
      <button
        type="button"
        className="note-ref-chip"
        data-no-drag
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        title={open ? "点击收起闪卡" : "点击展开闪卡"}
      >
        <BookmarkCheck size={13} className="note-ref-icon" aria-hidden="true" />
        <span className="note-ref-kind">闪卡</span>
        <span className="note-ref-title">{label || front.slice(0, 40) || "复习卡"}</span>
        <ChevronRight
          size={13}
          className="note-ref-chevron"
          style={{ transform: open ? "rotate(90deg)" : "none" }}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <span className="card-ref-body">
          <span className="card-ref-face">
            <span className="card-ref-face-label">正面</span>
            <QuizMarkdownBase className="chat-prose">{front}</QuizMarkdownBase>
          </span>
          {ready && back ? (
            showBack ? (
              <span className="card-ref-face">
                <span className="card-ref-face-label">背面</span>
                <QuizMarkdownBase className="chat-prose">{back}</QuizMarkdownBase>
              </span>
            ) : (
              <button
                type="button"
                className="card-ref-reveal"
                data-no-drag
                onClick={() => setShowBack(true)}
              >
                点击看背面
              </button>
            )
          ) : (
            <span className="card-ref-status">这张卡还没有生成背面（去复习板处理）</span>
          )}
        </span>
      ) : null}
    </span>
  );
}
