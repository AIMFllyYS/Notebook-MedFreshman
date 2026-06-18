"use client";

import { useEffect, useRef, useState } from "react";
import { Lightbulb, Pen, MessageSquare, Send } from "lucide-react";
import { useStore } from "@/lib/store";
import { useChatUI } from "@/lib/hooks/useChatUI";

interface PopState {
  x: number;
  y: number;
  text: string;
}

function PopBtn({
  onClick,
  icon: Icon,
  label,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="press flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-secondary-container)] hover:text-[var(--md-sys-color-on-secondary-container)]"
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

export default function SelectionPopover({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const sendToChat = useStore((s) => s.sendToChat);
  const { setQuickExplain, setQuotedText } = useChatUI();
  const [pop, setPop] = useState<PopState | null>(null);
  const [asking, setAsking] = useState(false);
  const [q, setQ] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseUp(e: MouseEvent) {
      if (boxRef.current && boxRef.current.contains(e.target as Node)) return;
      window.setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
          if (!asking) setPop(null);
          return;
        }
        const text = sel.toString().trim();
        if (text.length < 2) {
          if (!asking) setPop(null);
          return;
        }
        const range = sel.getRangeAt(0);
        const root = containerRef.current;
        if (!root || !root.contains(range.commonAncestorContainer)) return;
        const rect = range.getBoundingClientRect();
        setPop({ x: rect.left + rect.width / 2, y: rect.top, text });
        setAsking(false);
        setQ("");
      }, 0);
    }
    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, [containerRef, asking]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setPop(null);
        setAsking(false);
      }
    }
    function onScroll() {
      if (!asking) setPop(null);
    }
    document.addEventListener("keydown", onKey);
    const root = containerRef.current;
    root?.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      root?.removeEventListener("scroll", onScroll, true);
    };
  }, [containerRef, asking]);

  if (!pop) return null;

  function handleExplain() {
    if (!pop) return;
    setQuickExplain(pop.text, { x: pop.x, y: pop.y }, "explain");
    setPop(null);
  }

  function handleExample() {
    if (!pop) return;
    setQuickExplain(pop.text, { x: pop.x, y: pop.y }, "example");
    setPop(null);
  }

  function handleFollowUp() {
    if (!pop) return;
    setAsking(true);
  }

  function handleQuote() {
    if (!pop) return;
    setQuotedText(pop.text);
    setPop(null);
  }

  function askCustom() {
    if (!pop || !q.trim()) return;
    const quote = pop.text.length > 180 ? pop.text.slice(0, 180) + "…" : pop.text;
    const prompt = `${q.trim()}\n\n（针对当前页面这段原文：> ${quote}）`;
    sendToChat(prompt);
    setPop(null);
    setAsking(false);
    setQ("");
  }

  const left = Math.min(
    Math.max(pop.x, 150),
    (typeof window !== "undefined" ? window.innerWidth : 1200) - 150,
  );
  const top = Math.max(pop.y - 8, 10);

  return (
    <div
      ref={boxRef}
      onMouseDown={(e) => {
        if (!(e.target instanceof HTMLInputElement)) e.preventDefault();
      }}
      style={{ position: "fixed", left, top, transform: "translate(-50%, -100%)" }}
      className="z-50 animate-fade-up"
    >
      <div className="flex items-center gap-0.5 rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] p-1 shadow-lg">
        {!asking ? (
          <>
            <PopBtn onClick={handleExplain} icon={Lightbulb} label="解释" />
            <PopBtn onClick={handleExample} icon={Pen} label="举例" />
            <PopBtn onClick={handleFollowUp} icon={MessageSquare} label="追问" />
            <div className="mx-0.5 h-5 w-px bg-[var(--md-sys-color-outline-variant)]" />
            <PopBtn onClick={handleQuote} icon={Send} label="引用" />
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              askCustom();
            }}
            className="flex items-center gap-1"
          >
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="对这段内容问点什么…"
              className="w-56 rounded-lg bg-[var(--md-sys-color-surface-container-highest)] px-3 py-1.5 text-[13px] text-[var(--md-sys-color-on-surface)] outline-none placeholder:text-[var(--md-sys-color-on-surface-variant)] focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/30"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-[var(--md-sys-color-primary)] px-3 py-1.5 text-[13px] font-medium text-[var(--md-sys-color-on-primary)]"
            >
              问 AI
            </button>
          </form>
        )}
      </div>
      <div className="mx-auto h-2 w-2 -translate-y-1 rotate-45 border-b border-r border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]" />
    </div>
  );
}
