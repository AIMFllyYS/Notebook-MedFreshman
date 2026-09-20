"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, ChevronDown, Pencil, Trash2, X } from "lucide-react";
import type { ResultCardProps } from "@/lib/ai/agent/tools/registry";
import type { UpdateUserNoteOutput } from "@/lib/ai/agent/tools/updateUserNote/types";
import { isUsableOutput, proposalFromToolOutput, type NoteChangeStatus } from "@/lib/notes/noteChangeProposal";
import { sessionIdOfMessage, useNoteChangeProposals } from "@/lib/stores/noteChangeProposals";
import { useUserNotes } from "@/lib/stores/userNotes";

/**
 * 笔记变更确认卡。
 *
 * Agent 改了笔记不会直接落盘：这张卡是唯一的写入入口，用户点「同意修改 / 确认删除」才执行。
 * 卡本身不持有权限语义——每次同意只对应这一份候选稿，没有「以后都同意」。
 */
export default function NoteChangeConsentCard({ part, message }: ResultCardProps<"updateUserNote">) {
  if (part.state !== "output-available") return null;
  const output = part.output as UpdateUserNoteOutput;
  if (!isUsableOutput(output)) return null;
  return <ConsentCardBody output={output} messageId={message.id} />;
}

function statusSelector(id: string, s: ReturnType<typeof useNoteChangeProposals.getState>): NoteChangeStatus {
  const entry = s.byId[id] as { status?: NoteChangeStatus } | undefined;
  if (entry?.status) return entry.status;
  if (s.appliedIds.includes(id)) return "applied";
  if (s.dismissedIds.includes(id)) return "dismissed";
  return "pending";
}

function ConsentCardBody({ output, messageId }: { output: UpdateUserNoteOutput; messageId: string }) {
  const id = output.proposalId;
  const ingest = useNoteChangeProposals((s) => s.ingest);
  const approve = useNoteChangeProposals((s) => s.approve);
  const dismiss = useNoteChangeProposals((s) => s.dismiss);
  const status = useNoteChangeProposals((s) => statusSelector(id, s));
  const noteTitle = useUserNotes((s) => s.byId[output.noteId]?.title);
  const noteMarkdown = useUserNotes((s) => s.byId[output.noteId]?.markdown);
  const [expanded, setExpanded] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    const proposal = proposalFromToolOutput(output, {
      sessionId: sessionIdOfMessage(messageId),
      ...(noteTitle ? { noteTitle } : {}),
    });
    if (proposal) ingest(proposal);
  }, [id, ingest, messageId, noteTitle, output]);

  const diff = useMemo(
    () => (output.action === "update" ? diffSlices(noteMarkdown ?? "", output.markdown) : null),
    [output.action, output.markdown, noteMarkdown],
  );

  const isDelete = output.action === "delete";
  const blocked = !output.sourceComplete;

  const onApprove = () => {
    const result = approve(id);
    setFailure(result.ok ? null : (result.reason ?? "这次写入没有执行。"));
  };
  const onDismiss = () => {
    setFailure(null);
    dismiss(id);
  };

  return (
    <section className="note-consent" data-note-consent={id} aria-label="笔记变更确认">
      <header className="note-consent-head">
        <span className="note-consent-icon" aria-hidden>
          {isDelete ? <Trash2 size={13} /> : <Pencil size={13} />}
        </span>
        <div className="note-consent-title">
          <span className="note-consent-eyebrow">{statusLabel(status)}</span>
          <span className="note-consent-summary">{output.summary}</span>
        </div>
      </header>

      {status === "pending" ? (
        <>
          {blocked ? (
            <p className="note-consent-warn">
              <AlertTriangle size={12} aria-hidden /> 原文过长，模型只读到前面一部分。整篇替换会丢掉没读到的结尾，因此不能执行。
            </p>
          ) : null}

          {diff ? (
            <>
              <button
                type="button"
                className="note-consent-toggle"
                aria-expanded={expanded}
                onClick={() => setExpanded((v) => !v)}
              >
                <ChevronDown size={12} className={expanded ? "is-open" : undefined} aria-hidden />
                {expanded ? "收起改动" : "查看改动"}
                <span className="note-consent-count">
                  +{diff.afterAdded.length} / −{diff.beforeRemoved.length} 行
                </span>
              </button>
              {expanded ? (
                <div className="note-consent-diff" data-no-drag>
                  {diff.head > 0 ? <p className="note-consent-diff-note">前 {diff.head} 行未变</p> : null}
                  {diff.beforeRemoved.map((line, index) => (
                    <p key={`b${index}`} className="note-consent-line is-removed">
                      <span aria-hidden>−</span>
                      {line || " "}
                    </p>
                  ))}
                  {diff.afterAdded.map((line, index) => (
                    <p key={`a${index}`} className="note-consent-line is-added">
                      <span aria-hidden>+</span>
                      {line || " "}
                    </p>
                  ))}
                  {diff.tail > 0 ? <p className="note-consent-diff-note">后 {diff.tail} 行未变</p> : null}
                </div>
              ) : null}
            </>
          ) : null}

          {failure ? <p className="note-consent-error">{failure}</p> : null}

          <div className="note-consent-actions">
            <button
              type="button"
              className="note-consent-btn is-primary"
              disabled={blocked}
              onClick={onApprove}
            >
              <Check size={13} aria-hidden />
              {isDelete ? "确认删除" : "同意修改"}
            </button>
            <button type="button" className="note-consent-btn" onClick={onDismiss}>
              <X size={13} aria-hidden />
              取消
            </button>
          </div>
        </>
      ) : (
        <p className="note-consent-result">
          {status === "applied"
            ? isDelete
              ? "已删除，原笔记不再保留。"
              : "已修改，笔记正文已更新。"
            : status === "dismissed"
              ? "已取消，原笔记没有改动。"
              : "这次改动被阻止了。"}
        </p>
      )}

      {status !== "pending" && failure ? <p className="note-consent-error">{failure}</p> : null}
      {status === "stale" || status === "blocked" ? (
        <p className="note-consent-warn">
          <AlertTriangle size={12} aria-hidden /> 可以再让助手重新整理一次。
        </p>
      ) : null}
    </section>
  );
}

/** 小标签只表达「进行到哪一步」；改的是哪一篇由 summary 说，避免两句同义话叠在一起。 */
function statusLabel(status: NoteChangeStatus): string {
  if (status === "applied") return "已完成";
  if (status === "dismissed") return "已取消";
  if (status === "stale" || status === "blocked") return "未执行";
  return "待你确认";
}

/** 逐行前后对照：掐掉公共前后缀，中间就是改动区间。 */
function diffSlices(before: string, after: string) {
  const b = before.split("\n");
  const a = after.split("\n");
  let head = 0;
  while (head < b.length && head < a.length && b[head] === a[head]) head += 1;
  let endB = b.length;
  let endA = a.length;
  while (endB > head && endA > head && b[endB - 1] === a[endA - 1]) {
    endB -= 1;
    endA -= 1;
  }
  return {
    head,
    tail: b.length - endB,
    beforeRemoved: b.slice(head, endB),
    afterAdded: a.slice(head, endA),
  };
}
