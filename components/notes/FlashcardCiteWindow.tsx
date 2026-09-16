"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Check, Download, ExternalLink, Layers, Quote } from "lucide-react";
import ManagedWindow from "@/components/window/ManagedWindow";
import DocumentWorkspace from "@/components/window/DocumentWorkspace";
import FlipCard from "@/components/review/FlipCard";
import QuizMarkdown from "@/components/quiz/QuizMarkdown";
import { useCiteToChat } from "@/components/notes/useCiteToChat";
import { useFlashcardCitations } from "@/lib/stores/flashcardCitations";
import { useReviewCards } from "@/lib/stores/reviewCards";
import { useWindowManager } from "@/lib/stores/windowManager";
import { FLASHCARD_CITE_WINDOW_ID, formatFlashcardQuote, plainSnippet } from "@/lib/notes/userNote";
import { listFlashcardSubjectGroups } from "@/lib/notes/flashcardSubjects";
import { downloadFlashcardMarkdown, downloadFlashcardsCsv } from "@/lib/review/exportCards";
import type { CardStatus, ReviewCard } from "@/lib/review/types";

const STATUS_LABEL: Record<CardStatus, string> = {
  saved: "待处理",
  processing: "处理中",
  parsing: "处理中",
  ready: "已成卡",
  error: "失败",
};

export default function FlashcardCiteWindow() {
  const open = useFlashcardCitations((s) => s.open);
  if (!open) return null;
  return <FlashcardCitePicker />;
}

function FlashcardCitePicker() {
  const managed = useWindowManager((s) => s.windows.find((w) => w.id === FLASHCARD_CITE_WINDOW_ID));
  const subjectId = useFlashcardCitations((s) => s.subjectId);
  const activeCardId = useFlashcardCitations((s) => s.activeCardId);
  const setActiveCardId = useFlashcardCitations((s) => s.setActiveCardId);
  const closePicker = useFlashcardCitations((s) => s.closePicker);
  const byId = useReviewCards((s) => s.byId);
  const order = useReviewCards((s) => s.order);
  const { cited, cite } = useCiteToChat();
  const router = useRouter();

  const cards = useMemo(
    () =>
      order
        .map((id) => byId[id])
        .filter((card): card is ReviewCard => Boolean(card))
        .filter((card) => (subjectId ? card.subjectId === subjectId : true))
        .sort((a, b) => b.createdAt - a.createdAt),
    [byId, order, subjectId],
  );

  const active = cards.find((card) => card.id === activeCardId) ?? cards[0] ?? null;

  if (!managed) return null;

  const toolbar = (
    <div className="user-note-library-toolbar" data-no-drag>
      <button
        type="button"
        data-no-drag
        className="user-note-toolbar-primary"
        disabled={!active}
        onClick={() => {
          if (active) cite(formatFlashcardQuote(active));
        }}
      >
        {cited ? <Check size={13} /> : <Quote size={13} />} {cited ? "已引用到对话" : "引用到对话"}
      </button>
      <button
        type="button"
        data-no-drag
        className="user-note-toolbar-link"
        disabled={!active}
        onClick={() => {
          if (active) downloadFlashcardMarkdown(active);
        }}
      >
        <Download size={12} /> 下载这张
      </button>
      <button
        type="button"
        data-no-drag
        className="user-note-toolbar-link"
        disabled={cards.length === 0}
        onClick={() => downloadFlashcardsCsv(cards, subjectId ? `复习闪卡-${subjectId}` : "复习闪卡")}
      >
        <Download size={12} /> 下载 CSV
      </button>
      <button
        type="button"
        data-no-drag
        className="user-note-toolbar-link"
        onClick={() => router.push(subjectId ? `/${subjectId}/review` : "/")}
      >
        <ExternalLink size={12} /> 打开复习板
      </button>
    </div>
  );

  return (
    <ManagedWindow
      windowId={FLASHCARD_CITE_WINDOW_ID}
      title={managed.title}
      icon={<Layers size={15} />}
      onClose={closePicker}
      fullscreenTarget="notes"
      minSize={{ minW: 640, minH: 380 }}
      overlayId="flashcard-cite-picker"
      bodyClassName="flex min-h-0 min-w-0 flex-1 overflow-hidden"
      unmountWhenMinimized
    >
      <div className="flashcard-cite-layout">
        <FlashcardSubjectSidebar selectedId={subjectId} />
        {cards.length === 0 ? (
          <div className="user-note-stage">
            <p className="user-note-empty">还没有复习闪卡。在正文划词或右键消息选择『记录』即可生成。</p>
            <div className="user-note-stage-actions" style={{ padding: "0 20px 20px" }} data-no-drag>
              <button
                type="button"
                data-no-drag
                className="user-note-action"
                onClick={() => router.push(subjectId ? `/${subjectId}/review` : "/")}
              >
                <ExternalLink size={12} /> 打开复习板
              </button>
            </div>
          </div>
        ) : (
          <DocumentWorkspace
            outlineLabel="复习闪卡"
            outline={cards.map((card) => ({
              id: card.id,
              kindLabel: STATUS_LABEL[card.status],
              title: plainSnippet(card.front || card.originalText, 80) || "（空白卡）",
              meta: card.sourceLabel,
            }))}
            activeId={active?.id ?? ""}
            onSelect={setActiveCardId}
            toolbar={toolbar}
            emptyLabel="还没有闪卡"
          >
            {active ? <FlashcardStage key={active.id} card={active} /> : null}
          </DocumentWorkspace>
        )}
      </div>
    </ManagedWindow>
  );
}

function FlashcardSubjectSidebar({ selectedId }: { selectedId: string | null }) {
  const setSubjectId = useFlashcardCitations((s) => s.setSubjectId);
  const groups = useMemo(() => listFlashcardSubjectGroups(), []);

  return (
    <nav className="flashcard-cite-folders" aria-label="学科" data-no-drag>
      <button
        type="button"
        data-no-drag
        className={clsx("flashcard-cite-folder-all", selectedId === null && "is-active")}
        aria-current={selectedId === null ? "true" : undefined}
        onClick={() => setSubjectId(null)}
      >
        全部
      </button>
      {groups.map((group) => (
        <section key={group.yearId} className="flashcard-cite-folder-group">
          <h3 className="flashcard-cite-folder-group-label">{group.label}</h3>
          {group.subjects.map((subject) => {
            const selected = selectedId === subject.id;
            return (
              <button
                key={subject.id}
                type="button"
                data-no-drag
                className={clsx("flashcard-cite-folder", selected && "is-active")}
                aria-label={subject.fullName}
                title={subject.fullName}
                aria-current={selected ? "true" : undefined}
                onClick={() => setSubjectId(subject.id)}
              >
                {subject.name}
              </button>
            );
          })}
        </section>
      ))}
    </nav>
  );
}

function FlashcardStage({ card }: { card: ReviewCard }) {
  const [flipped, setFlipped] = useState(false);

  if (!card.front) {
    return (
      <div className="user-note-stage">
        <div className="user-note-stage-head">
          <div className="user-note-stage-title">{STATUS_LABEL[card.status]}</div>
          <div className="user-note-stage-meta">{card.sourceLabel}</div>
        </div>
        <div className="user-note-preview chat-prose">
          <p className="note-citation-status">这张卡还没有成卡，下面是记录下来的原文。</p>
          <QuizMarkdown className="chat-prose">{card.originalText}</QuizMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div className="flashcard-cite-stage">
      <FlipCard card={card} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
    </div>
  );
}
