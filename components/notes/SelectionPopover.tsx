"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Lightbulb, Pen, MessageSquare, Send } from "lucide-react";
import { useChatUI } from "@/lib/hooks/useChatUI";
import { useFloatingChats } from "@/lib/hooks/useFloatingChats";

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
  const setQuotedText = useChatUI((s) => s.setQuotedText);
  const openWindow = useFloatingChats((s) => s.openWindow);
  const [pop, setPop] = useState<PopState | null>(null);
  const [boxWidth, setBoxWidth] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (boxRef.current) {
      setBoxWidth(boxRef.current.offsetWidth);
    }
  }, [pop]);

  useEffect(() => {
    function onMouseUp(e: MouseEvent) {
      if (boxRef.current && boxRef.current.contains(e.target as Node)) return;
      window.setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
          setPop(null);
          return;
        }
        const text = sel.toString().trim();
        if (text.length < 2) {
          setPop(null);
          return;
        }
        const range = sel.getRangeAt(0);
        const root = containerRef.current;
        if (!root || !root.contains(range.commonAncestorContainer)) return;
        const rect = range.getBoundingClientRect();
        setPop({ x: rect.left + rect.width / 2, y: rect.top, text });
      }, 0);
    }
    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, [containerRef]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPop(null);
    }
    function onScroll() {
      setPop(null);
    }
    document.addEventListener("keydown", onKey);
    const root = containerRef.current;
    root?.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      root?.removeEventListener("scroll", onScroll, true);
    };
  }, [containerRef]);

  if (!pop) return null;

  // 解释 / 举例 / 追问 都开一个独立的划词浮窗（多开、互不影响）。
  function spawn(seedMode: "explain" | "example" | "ask") {
    if (!pop) return;
    openWindow({ anchor: { x: pop.x, y: pop.y }, seedMode, seedText: pop.text });
    setPop(null);
  }

  function handleQuote() {
    if (!pop) return;
    setQuotedText(pop.text);
    setPop(null);
  }

  const halfW = (boxWidth || 300) / 2;
  const left = Math.min(
    Math.max(pop.x, halfW + 8),
    window.innerWidth - halfW - 8,
  );
  const top = Math.max(pop.y - 8, 10);

  return createPortal(
    <div
      style={{ position: "fixed", left, top, width: "max-content", transform: "translate(-50%, -100%)", zIndex: 9999 }}
    >
      <div
        ref={boxRef}
        onMouseDown={(e) => {
          if (!(e.target instanceof HTMLInputElement)) e.preventDefault();
        }}
        className="animate-fade-up"
      >
        <div className="flex items-center gap-0.5 rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] p-1 shadow-lg">
          <PopBtn onClick={() => spawn("explain")} icon={Lightbulb} label="解释" />
          <PopBtn onClick={() => spawn("example")} icon={Pen} label="举例" />
          <PopBtn onClick={() => spawn("ask")} icon={MessageSquare} label="追问" />
          <div className="mx-0.5 h-5 w-px bg-[var(--md-sys-color-outline-variant)]" />
          <PopBtn onClick={handleQuote} icon={Send} label="引用" />
        </div>
        <div className="mx-auto h-2 w-2 -translate-y-1 rotate-45 border-b border-r border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]" />
      </div>
    </div>,
    document.body
  );
}
