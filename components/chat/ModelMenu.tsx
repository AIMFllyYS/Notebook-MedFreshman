"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Cpu, SlidersHorizontal } from "lucide-react";
import { useSettings } from "@/lib/hooks/useSettings";
import { getModelGroups, getModelInfo, CUSTOM_MODEL_ID } from "@/lib/ai/models";

/** 模型选择下拉菜单（agent 软件风格）：硅基流动精选模型 + 自定义模型。 */
export default function ModelMenu({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const selectedModelId = useSettings((s) => s.selectedModelId);
  const setSelectedModelId = useSettings((s) => s.setSelectedModelId);
  const customConfigured = useSettings(
    (s) => !!(s.customBaseUrl && s.customApiKey && s.customModelId),
  );

  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: 0, bottom: 0 });

  const current = getModelInfo(selectedModelId);
  const label =
    selectedModelId === CUSTOM_MODEL_ID ? "自定义模型" : current?.label ?? selectedModelId;
  const groups = getModelGroups();

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const width = 264;
    let left = r.left;
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
    if (left < 8) left = 8;
    // 向上弹出：菜单底部对齐到触发按钮上沿
    setPos({ left, bottom: window.innerHeight - r.top + 6 });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node) || popRef.current?.contains(e.target as Node))
        return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const pick = (id: string) => {
    setSelectedModelId(id);
    setOpen(false);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        title="选择模型"
        className="press flex max-w-[180px] min-w-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--ink-soft)] hover:bg-[var(--bg-muted)] [flex-shrink:1]"
      >
        <Cpu size={12} className="shrink-0 text-[var(--accent-ink)]" />
        <span className="model-menu-label model-menu-label-full truncate">{label}</span>
        <span className="model-menu-label model-menu-label-short">model</span>
        <ChevronDown size={12} className="shrink-0" />
      </button>

      {open &&
        createPortal(
          <div
            ref={popRef}
            style={{ left: pos.left, bottom: pos.bottom, width: 264 }}
            className="fixed z-[9999] max-h-[360px] overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--bg-panel)] p-1.5 shadow-lg animate-[dropdown-in_0.15s_ease-out]"
          >
            {groups.map((g) => (
              <div key={g.group} className="mb-1">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
                  {g.group}
                </div>
                {g.models.map((m) => {
                  const active = m.id === selectedModelId;
                  return (
                    <button
                      key={m.id}
                      onClick={() => pick(m.id)}
                      className={
                        "flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors " +
                        (active ? "bg-[var(--accent-weak)]" : "hover:bg-[var(--bg-muted)]")
                      }
                    >
                      <span className="mt-0.5 w-3.5 shrink-0">
                        {active && <Check size={13} className="text-[var(--accent-ink)]" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-[12.5px] font-medium text-[var(--ink)]">
                            {m.label}
                          </span>
                          {m.thinking && (
                            <span className="shrink-0 rounded bg-[var(--bg-muted)] px-1 text-[9px] text-[var(--ink-soft)]">
                              思考
                            </span>
                          )}
                        </span>
                        <span className="block truncate text-[10.5px] text-[var(--ink-faint)]">
                          {m.hint}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}

            {/* 自定义模型 */}
            <div className="mt-1 border-t border-[var(--line)] pt-1">
              <button
                onClick={() => {
                  if (onOpenSettings && !customConfigured) {
                    setOpen(false);
                    onOpenSettings();
                  } else {
                    pick(CUSTOM_MODEL_ID);
                  }
                }}
                className={
                  "flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors " +
                  (selectedModelId === CUSTOM_MODEL_ID
                    ? "bg-[var(--accent-weak)]"
                    : "hover:bg-[var(--bg-muted)]")
                }
              >
                <span className="mt-0.5 w-3.5 shrink-0">
                  {selectedModelId === CUSTOM_MODEL_ID && (
                    <Check size={13} className="text-[var(--accent-ink)]" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--ink)]">
                    <SlidersHorizontal size={12} /> 自定义模型
                  </span>
                  <span className="block truncate text-[10.5px] text-[var(--ink-faint)]">
                    {customConfigured ? "使用你在设置里填写的端点" : "未配置，点击前往设置填写"}
                  </span>
                </span>
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
