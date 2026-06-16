"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";

interface PopState {
  x: number;
  y: number;
  text: string;
}

function PopBtn({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-[var(--ink-soft)] hover:bg-[var(--accent-weak)] hover:text-[var(--accent-ink)]"
    >
      <span>{icon}</span>
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
  const [pop, setPop] = useState<PopState | null>(null);
  const [asking, setAsking] = useState(false);
  const [q, setQ] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseUp(e: MouseEvent) {
      if (boxRef.current && boxRef.current.contains(e.target as Node)) return;
      // 等浏览器把选区敲定
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

  function ask(kind: "explain" | "example" | "custom") {
    if (!pop) return;
    const quote = pop.text.length > 180 ? pop.text.slice(0, 180) + "…" : pop.text;
    let prompt = "";
    if (kind === "explain") prompt = `请详细解释当前页面里这段内容：\n> ${quote}`;
    else if (kind === "example")
      prompt = `请就当前页面里这段内容，再举一两个直观例子帮助我理解：\n> ${quote}`;
    else prompt = `${q.trim()}\n\n（针对当前页面这段原文：> ${quote}）`;
    sendToChat(prompt);
    setPop(null);
    setAsking(false);
    setQ("");
  }

  const left = Math.min(Math.max(pop.x, 130), (typeof window !== "undefined" ? window.innerWidth : 1200) - 130);
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
      <div className="flex items-center gap-1 rounded-xl border border-[var(--line)] bg-white p-1 shadow-[var(--shadow-lg)]">
        {!asking ? (
          <>
            <PopBtn onClick={() => ask("explain")} icon="💡" label="解释" />
            <PopBtn onClick={() => ask("example")} icon="✏️" label="举例" />
            <PopBtn onClick={() => setAsking(true)} icon="💬" label="追问…" />
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) ask("custom");
            }}
            className="flex items-center gap-1"
          >
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="对这段内容问点什么…"
              className="w-56 rounded-lg bg-[var(--bg-muted)] px-3 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-[13px] font-medium text-white"
            >
              问 AI
            </button>
          </form>
        )}
      </div>
      <div className="mx-auto h-2 w-2 -translate-y-1 rotate-45 border-b border-r border-[var(--line)] bg-white" />
    </div>
  );
}
