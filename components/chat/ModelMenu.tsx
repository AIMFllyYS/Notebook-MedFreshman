"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Cpu } from "lucide-react";
import { useSettings } from "@/lib/hooks/useSettings";
import { getModelGroupsWithCustom, getModelInfoWithCustom, CUSTOM_PREFIX } from "@/lib/ai/models";
import { ModelIcon } from "@/components/icons/ModelBrandIcons";

/** 模型选择下拉菜单（agent 软件风格）：硅基流动精选模型 + 自定义模型。
 *  默认读写全局 useSettings.selectedModelId；传入 value/onChange 则改为受控（供划词
 *  浮窗等每个实例独立选模型用，互不影响也不改全局）。 */
export default function ModelMenu({
  onOpenSettings,
  value,
  onChange,
}: {
  onOpenSettings?: () => void;
  value?: string;
  onChange?: (id: string) => void;
}) {
  const globalSelected = useSettings((s) => s.selectedModelId);
  const globalSet = useSettings((s) => s.setSelectedModelId);
  const selectedModelId = value ?? globalSelected;
  const setSelectedModelId = onChange ?? globalSet;
  const customConfigured = useSettings(
    (s) => !!(s.customBaseUrl && s.customApiKey && s.customModels.length > 0),
  );
  const customModels = useSettings((s) => s.customModels);

  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: 0, bottom: 0 });

  const current = getModelInfoWithCustom(selectedModelId, customModels);
  const label =
    selectedModelId.startsWith(CUSTOM_PREFIX) ? (current?.label ?? selectedModelId.slice(CUSTOM_PREFIX.length)) : current?.label ?? selectedModelId;
  const groups = getModelGroupsWithCustom(customModels);

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
                      <span className="relative mt-0.5 w-3.5 shrink-0">
                        <ModelIcon brand={m.icon} size={14} className="text-[var(--ink)]" />
                        {active && (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[var(--accent-ink)]">
                            <Check size={8} className="text-[var(--bg-panel)]" strokeWidth={3} />
                          </span>
                        )}
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
                          {m.vision && (
                            <span className="shrink-0 rounded bg-[color-mix(in_srgb,var(--md-sys-color-tertiary)_15%,transparent)] px-1 text-[9px] text-[var(--md-sys-color-tertiary)]">
                              视觉
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

          </div>,
          document.body,
        )}
    </>
  );
}
