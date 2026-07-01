"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Lightbulb, LightbulbOff } from "lucide-react";
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

export interface ThinkingMenuButtonProps {
  enabled: boolean;
  effort: ThinkingEffort;
  onChange: (next: { enabled: boolean; effort: ThinkingEffort }) => void;
  /** 当前所选模型是否支持思考。false 时按钮置灰、点击无响应。 */
  supported: boolean;
  /** 请求级禁用（发送中 / 输入禁用等）。 */
  disabled?: boolean;
}

/**
 * 深度思考按钮 —— 灯泡即菜单：
 *  - 未开启：灯泡 + "深度思考"
 *  - 已开启：亮灯泡 + "深度思考·<档位>"
 *  - 点击弹出菜单：Off / Low / Med / High / Max
 *  - 模型不支持时按钮置灰，tooltip 提示原因
 */
export default function ThinkingMenuButton({
  enabled,
  effort,
  onChange,
  supported,
  disabled = false,
}: ThinkingMenuButtonProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: 0, bottom: 0 });

  const current = OPTIONS.find((o) => o.value === effort) ?? OPTIONS[1];
  const activeLabel = enabled ? current.label : null;
  const trulyDisabled = disabled || !supported;

  const closeMenu = useCallback(() => setOpen(false), []);
  useOverlayRegistration({ id: "thinking-menu", open, onClose: closeMenu, priority: 46 });

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const width = 220;
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

  const pickLevel = (v: ThinkingEffort) => {
    onChange({ enabled: true, effort: v });
    setOpen(false);
  };
  const pickOff = () => {
    onChange({ enabled: false, effort });
    setOpen(false);
  };

  const title = !supported
    ? "当前模型不支持深度思考"
    : enabled
      ? `深度思考已开启 · ${current.label}（点击可调整）`
      : "点击开启深度思考";

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => !trulyDisabled && setOpen((v) => !v)}
        disabled={trulyDisabled}
        className={`chat-input-toggle chat-input-toggle-thinking ${
          enabled && supported ? "chat-input-toggle-thinking-active" : ""
        } ${trulyDisabled ? "chat-input-toggle-disabled" : ""}`}
        title={title}
        aria-label="深度思考"
        aria-haspopup="menu"
        aria-expanded={open}
        data-testid="thinking-menu-button"
        data-enabled={enabled && supported ? "1" : "0"}
        data-effort={activeLabel ? effort : ""}
      >
        <Lightbulb size={12} />
        <span className="chat-input-toggle-text">
          {activeLabel ? `深度思考·${activeLabel}` : "深度思考"}
        </span>
      </button>

      {open &&
        createPortal(
          <div
            ref={popRef}
            style={{ left: pos.left, bottom: pos.bottom, width: 220 }}
            className="fixed z-[9999] rounded-xl border border-[var(--line)] bg-[var(--bg-panel)] p-1.5 shadow-lg animate-[dropdown-in_0.15s_ease-out]"
            role="menu"
          >
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
              深度思考
            </div>

            <button
              type="button"
              role="menuitemradio"
              aria-checked={!enabled}
              onClick={pickOff}
              data-testid="thinking-menu-option-off"
              className={
                "flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors " +
                (!enabled ? "bg-[var(--accent-weak)]" : "hover:bg-[var(--bg-muted)]")
              }
            >
              <span className="mt-0.5 w-3.5 shrink-0">
                {!enabled && <Check size={12} className="text-[var(--accent-ink)]" strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--ink)]">
                  <LightbulbOff size={11} />
                  关闭
                </span>
                <span className="block truncate text-[10.5px] text-[var(--ink-faint)]">
                  不启用推理链，直接回答
                </span>
              </span>
            </button>

            <div className="my-1 h-px bg-[var(--line)]/60" />

            {OPTIONS.map((opt) => {
              const active = enabled && opt.value === effort;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => pickLevel(opt.value)}
                  data-testid={`thinking-menu-option-${opt.value}`}
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
