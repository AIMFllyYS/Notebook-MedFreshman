"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import type { ThinkingEffort } from "@/lib/hooks/useSettings";
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";

interface EffortOption {
  value: ThinkingEffort;
  label: string;
  hint: string;
}

const OPTIONS: EffortOption[] = [
  { value: "low", label: "Low", hint: "~8k tokens · 快速回答" },
  { value: "medium", label: "Med", hint: "~16k tokens · 平衡（默认）" },
  { value: "high", label: "High", hint: "~32k tokens · 深入推理" },
  { value: "max", label: "Max", hint: "~64k tokens · 极致思考" },
];

export interface ThinkingEffortPillProps {
  value: ThinkingEffort;
  onChange: (v: ThinkingEffort) => void;
  disabled?: boolean;
}

/** 会话级思考力度胶囊。灯泡开关右侧显示，点击弹出 4 档菜单。 */
export default function ThinkingEffortPill({
  value,
  onChange,
  disabled = false,
}: ThinkingEffortPillProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: 0, bottom: 0 });

  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[1];

  const closeMenu = useCallback(() => setOpen(false), []);
  useOverlayRegistration({ id: "thinking-effort-pill", open, onClose: closeMenu, priority: 46 });

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const width = 200;
    let left = r.left;
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
    if (left < 8) left = 8;
    setPos({ left, bottom: window.innerHeight - r.top + 6 });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node) || popRef.current?.contains(e.target as Node))
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const pick = (v: ThinkingEffort) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={`chat-input-toggle chat-input-toggle-thinking-effort ${
          disabled ? "chat-input-toggle-disabled" : ""
        }`}
        title={`思考力度：${current.label}（点击调整）`}
        aria-label="调整思考力度"
        data-testid="thinking-effort-pill"
        data-effort={current.value}
      >
        <span className="chat-input-toggle-text" style={{ fontVariantNumeric: "tabular-nums" }}>
          {current.label}
        </span>
      </button>

      {open &&
        createPortal(
          <div
            ref={popRef}
            style={{ left: pos.left, bottom: pos.bottom, width: 200 }}
            className="fixed z-[9999] rounded-xl border border-[var(--line)] bg-[var(--bg-panel)] p-1.5 shadow-lg animate-[dropdown-in_0.15s_ease-out]"
            role="menu"
          >
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
              思考力度
            </div>
            {OPTIONS.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => pick(opt.value)}
                  data-testid={`thinking-effort-option-${opt.value}`}
                  className={
                    "flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors " +
                    (active ? "bg-[var(--accent-weak)]" : "hover:bg-[var(--bg-muted)]")
                  }
                >
                  <span className="mt-0.5 w-3.5 shrink-0">
                    {active && <Check size={12} className="text-[var(--accent-ink)]" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-medium text-[var(--ink)]">
                      {opt.label}
                    </span>
                    <span className="block truncate text-[10.5px] text-[var(--ink-faint)]">
                      {opt.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
