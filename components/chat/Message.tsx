"use client";

import { memo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import AnimatedCollapse from "@/components/ui/AnimatedCollapse";

const NoteRenderer = dynamic(() => import("@/components/notes/NoteRenderer"), {
  ssr: false,
  loading: () => <div className="py-2 text-center text-[12px] text-[var(--ink-faint)]">加载中…</div>,
});

export interface ToolEvent {
  id: string;
  name: string;
  args?: Record<string, unknown>;
  status: "call" | "result";
}

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  tools: ToolEvent[];
  streaming?: boolean;
  followUps?: string[];
  error?: string;
}

const TOOL_LABEL: Record<string, string> = {
  get_current_page: "阅读当前页面",
  get_outline: "查阅课程大纲",
  get_section: "读取指定小节",
  search_notes: "检索全书笔记",
};

function Dots() {
  return (
    <span className="inline-flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1 w-1 rounded-full bg-current"
          style={{ animation: "pulse-dot 1.1s ease-in-out infinite", animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </span>
  );
}

function ThinkingBlock({ reasoning, streaming }: { reasoning: string; streaming?: boolean }) {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (!streaming) setOpen(false);
  }, [streaming]);
  if (!reasoning) return null;
  return (
    <div className="mb-2 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-[12.5px] font-medium text-[var(--ink-soft)]"
      >
        <span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5a3 3 0 1 0-5.196 1.737A7 7 0 0 0 8 14.5a7 7 0 0 0 7 0 7 7 0 0 0 1.196-7.763A3 3 0 1 0 12 5z" /><path d="M12 5v2" /><circle cx="12" cy="17" r="1" /></svg>
        </span>
        <span>{streaming ? "思考中" : "思考过程"}</span>
        {streaming && <Dots />}
        <span className="ml-auto text-[11px] text-[var(--ink-faint)]">{open ? "收起" : "展开"}</span>
      </button>
      <AnimatedCollapse isOpen={open}>
        <div className="max-h-72 overflow-y-auto whitespace-pre-wrap border-t border-[var(--line)] px-3 py-2 text-[12.5px] leading-relaxed text-[var(--ink-faint)] scroll-y">
          {reasoning}
        </div>
      </AnimatedCollapse>
    </div>
  );
}

function ToolChips({ tools }: { tools: ToolEvent[] }) {
  if (!tools.length) return null;
  return (
    <div className="mb-2 flex flex-wrap gap-1.5">
      {tools.map((t) => (
        <span
          key={t.id}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--md-sys-color-surface-container)] px-2.5 py-1 text-[12px] text-[var(--ink-soft)]"
        >
          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
          </span>
          {TOOL_LABEL[t.name] ?? t.name}
          {t.status === "result" ? (
            <span className="text-[var(--color-success)]">[OK]</span>
          ) : (
            <Dots />
          )}
        </span>
      ))}
    </div>
  );
}

function MessageBase({
  message,
  onFollow,
}: {
  message: ChatMsg;
  onFollow?: (q: string) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[var(--accent)] px-3.5 py-2 text-[14px] leading-relaxed text-white">
          {message.content}
        </div>
      </div>
    );
  }

  const empty = !message.content && !message.reasoning && message.tools.length === 0;
  return (
    <div className="animate-fade-up">
      <ThinkingBlock reasoning={message.reasoning ?? ""} streaming={message.streaming} />
      <ToolChips tools={message.tools} />

      {message.error && (
        <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-600">
          {message.error}
        </div>
      )}

      {empty && message.streaming ? (
        <div className="flex items-center gap-2 text-[13px] text-[var(--ink-faint)]">
          正在思考 <Dots />
        </div>
      ) : (
        <div className="prose-notes max-w-none text-[14.5px]">
          <NoteRenderer content={message.content} />
          {message.streaming && (
            <span className="ml-0.5 inline-block h-4 w-[2px] -translate-y-0.5 animate-pulse bg-[var(--accent)] align-middle" />
          )}
        </div>
      )}

      {!message.streaming && message.followUps && message.followUps.length > 0 && (
        <div className="mt-3 border-t border-[var(--line-soft)] pt-2.5">
          <div className="mb-1.5 text-[11.5px] font-semibold text-[var(--ink-faint)]">举一反三 · 继续追问</div>
          <div className="flex flex-col gap-1.5">
            {message.followUps.map((q, i) => (
              <button
                key={i}
                onClick={() => onFollow?.(q)}
                className="group flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--md-sys-color-surface-container)] px-3 py-1.5 text-left text-[13px] text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-weak)] hover:text-[var(--accent-ink)]"
              >
                <span className="text-[var(--accent)]">→</span>
                <span className="flex-1">{q}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(MessageBase);
