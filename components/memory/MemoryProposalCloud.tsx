"use client";

import { Sparkles } from "lucide-react";
import ManagedWindow from "@/components/window/ManagedWindow";
import { AgentTrace } from "@/components/chat/AgentTrace";
import { useMemoryInbox, type MemoryProposal } from "@/lib/stores/memoryInbox";
import { useUserNotes } from "@/lib/stores/userNotes";
import { useFlashcardCitations } from "@/lib/stores/flashcardCitations";
import { memoryProposalWindowId } from "@/lib/notes/userNote";
import { buildTrace } from "@/lib/chat/buildTrace";
import type { RecordMode } from "@/lib/review/types";

const MODES: { id: RecordMode; label: string }[] = [
  { id: "excerpt", label: "摘录" },
  { id: "cloze", label: "挖空" },
  { id: "quiz", label: "出题" },
  { id: "custom", label: "自定义" },
];

export default function MemoryProposalCloud({ proposal }: { proposal: MemoryProposal }) {
  const confirm = useMemoryInbox((s) => s.confirm);
  const dismiss = useMemoryInbox((s) => s.dismiss);
  const setDraft = useMemoryInbox((s) => s.setDraft);

  const question = proposal.kind === "note" ? "要把这次对话整理成笔记吗？" : "要把这次对话整理成闪卡吗？";
  const streaming = proposal.status === "committing";
  const trace = streaming || proposal.commitMessage
    ? buildTrace(proposal.commitMessage ?? { parts: [] }, streaming)
    : null;
  const committingLabel = proposal.kind === "note" ? "正在整理笔记…" : "正在整理闪卡…";

  return (
    <ManagedWindow
      windowId={memoryProposalWindowId(proposal.id)}
      title={proposal.kind === "note" ? "笔记提议" : "闪卡提议"}
      icon={<Sparkles size={15} />}
      onClose={() => dismiss(proposal.id)}
      fullscreenTarget="notes"
      minSize={{ minW: 300, minH: 180 }}
      overlayId={`memory-proposal-${proposal.id}`}
      bodyClassName="flex min-h-0 min-w-0 flex-1 overflow-hidden"
    >
      <div className="memory-cloud" data-no-drag>
        {proposal.status === "proposed" ? (
          <>
            <p className="memory-cloud-question">{question}</p>
            <p className="memory-cloud-reason">{proposal.reason}</p>
          </>
        ) : null}

        {proposal.status === "proposed" && proposal.kind === "note" ? (
          <label className="memory-cloud-field">
            <span>标题</span>
            <input
              value={proposal.titleDraft}
              placeholder="课堂要点"
              aria-label="笔记标题建议"
              onChange={(event) => setDraft(proposal.id, { titleDraft: event.target.value })}
            />
          </label>
        ) : null}

        {proposal.status === "proposed" && proposal.kind === "flashcard" ? (
          <div className="user-note-modes" role="group" aria-label="闪卡模式">
            {MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`user-note-mode${proposal.modeDraft === item.id ? " is-active" : ""}`}
                aria-pressed={proposal.modeDraft === item.id}
                onClick={() => setDraft(proposal.id, { modeDraft: item.id })}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}

        {proposal.status === "committing" && trace ? (
          <div className="memory-cloud-trace">
            <AgentTrace trace={trace} isStreaming summaryMode="process" />
          </div>
        ) : null}

        {proposal.status === "done" ? (
          <p className="memory-cloud-reason">
            {proposal.kind === "note" ? "已写入个人笔记并打开编辑器。" : "已写入复习板，并打开成卡预览。"}
          </p>
        ) : null}

        {proposal.error ? <p className="memory-cloud-error">{proposal.error}</p> : null}

        <div className="memory-cloud-actions">
          {proposal.status === "proposed" ? (
            <>
              <button type="button" className="user-note-toolbar-link" onClick={() => dismiss(proposal.id)}>
                不用了
              </button>
              <button type="button" className="user-note-toolbar-primary" onClick={() => confirm(proposal.id)}>
                整理
              </button>
            </>
          ) : null}
          {proposal.status === "committing" ? (
            <span className="memory-cloud-reason">{committingLabel}</span>
          ) : null}
          {proposal.status === "done" && proposal.kind === "note" && proposal.createdNoteId ? (
            <button
              type="button"
              className="user-note-toolbar-primary"
              onClick={() => useUserNotes.getState().openEditor(proposal.createdNoteId!)}
            >
              打开笔记
            </button>
          ) : null}
          {proposal.status === "done" && proposal.kind === "flashcard" ? (
            <button
              type="button"
              className="user-note-toolbar-primary"
              onClick={() => useFlashcardCitations.getState().openPicker()}
            >
              查看闪卡
            </button>
          ) : null}
        </div>
      </div>
    </ManagedWindow>
  );
}
