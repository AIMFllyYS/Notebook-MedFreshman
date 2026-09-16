"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Download, ExternalLink, Layers, PenLine, Quote } from "lucide-react";
import ManagedWindow from "@/components/window/ManagedWindow";
import DocumentWorkspace from "@/components/window/DocumentWorkspace";
import YearSubjectFolderTree from "@/components/layout/YearSubjectFolderTree";
import FlipCard from "@/components/review/FlipCard";
import QuizMarkdown from "@/components/quiz/QuizMarkdown";
import { useCiteToChat } from "@/components/notes/useCiteToChat";
import { useFlashcardCitations } from "@/lib/stores/flashcardCitations";
import { useRecordPreviews } from "@/lib/stores/recordPreviews";
import { useReviewCards } from "@/lib/stores/reviewCards";
import { useWindowManager } from "@/lib/stores/windowManager";
import SubjectPickerMenu from "@/components/notes/SubjectPickerMenu";
import { FLASHCARD_CITE_WINDOW_ID, formatFlashcardQuote, plainSnippet } from "@/lib/notes/userNote";
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
  const setSubjectId = useFlashcardCitations((s) => s.setSubjectId);
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
      <button
        type="button"
        data-no-drag
        className="user-note-toolbar-link"
        style={{ marginLeft: "auto" }}
        disabled={!active}
        onClick={(e) => {
          if (!active) return;
          useRecordPreviews.getState().open(active.id, { x: e.clientX, y: e.clientY });
        }}
      >
        <PenLine size={12} /> 编辑
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
        toolbar={cards.length > 0 ? toolbar : undefined}
        emptyLabel="还没有闪卡"
        folderTree={<YearSubjectFolderTree selectedId={subjectId} onSelect={setSubjectId} />}
      >
        {active ? (
          <FlashcardStage key={active.id} card={active} />
        ) : (
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
        )}
      </DocumentWorkspace>
    </ManagedWindow>
  );
}

function applyFlashcardSubject(cardId: string, next: string | null) {
  if (!next) return;
  useReviewCards.getState().setSubject(cardId, next);
  const picker = useFlashcardCitations.getState();
  if (picker.subjectId) picker.setSubjectId(next);
}

function FlashcardStage({ card }: { card: ReviewCard }) {
  const [flipped, setFlipped] = useState(false);
  const subjectMenu = (
    <SubjectPickerMenu value={card.subjectId} onChange={(next) => applyFlashcardSubject(card.id, next)} />
  );

  if (!card.front) {
    return (
      <div className="user-note-stage">
        <div className="user-note-stage-head flashcard-cite-stage-head" data-no-drag>
          <div>
            <div className="user-note-stage-title">{STATUS_LABEL[card.status]}</div>
            <div className="user-note-stage-meta">{card.sourceLabel}</div>
          </div>
          {subjectMenu}
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
      <div className="flashcard-cite-stage-head" data-no-drag>
        <div className="user-note-stage-meta">{card.sourceLabel}</div>
        {subjectMenu}
      </div>
      <FlipCard card={card} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
    </div>
  );
}
