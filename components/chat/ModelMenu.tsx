"use client";

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Check, Cpu } from "lucide-react";
import { useSettings, type ThinkingEffort } from "@/lib/hooks/useSettings";
import {
  getModelGroupsWithCustom,
  getModelInfoWithCustom,
  CUSTOM_PREFIX,
  modelSupportsThinkingEffort,
  modelAllowsDisableThinking,
  modelThinkingLevels,
  clampThinkingEffort,
  defaultEffortFor,
  type ModelInfo,
} from "@/lib/ai/models";
import { ModelIcon } from "@/components/icons/ModelBrandIcons";
import { AgentCheckIcon, AgentPauseIcon } from "@/components/icons/AgentIcons";
import { THINKING_EFFORT_OPTIONS } from "@/components/chat/ThinkingMenu";
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";

const PRIMARY_WIDTH = 264;
const SECONDARY_WIDTH = 220;

export default function ModelMenu({
  value,
  onChange,
  thinkingEnabled = false,
  thinkingEffort = "medium",
  onThinkingChange,
}: {
  /** 保留给调用方；菜单内暂不使用（设置入口在聊天顶栏）。 */
  onOpenSettings?: () => void;
  value?: string;
  onChange?: (id: string) => void;
  thinkingEnabled?: boolean;
  thinkingEffort?: ThinkingEffort;
  onThinkingChange?: (next: { enabled: boolean; effort: ThinkingEffort }) => void;
}) {
  const globalSelected = useSettings((s) => s.selectedModelId);
  const globalSet = useSettings((s) => s.setSelectedModelId);
  const selectedModelId = value ?? globalSelected;
  const setSelectedModelId = onChange ?? globalSet;
  const customApiGroups = useSettings((s) => s.customApiGroups);

  const [open, setOpen] = useState(false);
  const [flyoutId, setFlyoutId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | null>(null);
  const [pos, setPos] = useState({ left: 0, bottom: 0, height: 0 });
  const [subPos, setSubPos] = useState({ left: 0, bottom: 0, width: SECONDARY_WIDTH, place: "left" as "left" | "above" });

  const current = getModelInfoWithCustom(selectedModelId, customApiGroups);
  const label =
    selectedModelId.startsWith(CUSTOM_PREFIX)
      ? (current?.label ?? selectedModelId.slice(CUSTOM_PREFIX.length))
      : current?.label ?? selectedModelId;
  const groups = getModelGroupsWithCustom(customApiGroups);
  const flyoutModel = flyoutId ? getModelInfoWithCustom(flyoutId, customApiGroups) : undefined;
  const showFlyout = !!(flyoutModel && modelSupportsThinkingEffort(flyoutModel));

  const closeMenu = useCallback(() => {
    setOpen(false);
    setFlyoutId(null);
  }, []);
  useOverlayRegistration({ id: "model-menu", open, onClose: closeMenu, priority: 45 });

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const mobile = window.innerWidth < 640;
    setIsMobile(mobile);
    let left = r.left;
    if (left + PRIMARY_WIDTH > window.innerWidth - 8) left = window.innerWidth - PRIMARY_WIDTH - 8;
    if (left < 8) left = 8;
    setPos({ left, bottom: window.innerHeight - r.top + 6, height: 0 });
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !popRef.current) return;
    const primary = popRef.current.getBoundingClientRect();
    setPos((p) => ({ ...p, height: primary.height }));
    if (!showFlyout) return;

    if (isMobile) {
      setSubPos({
        left: primary.left,
        bottom: window.innerHeight - primary.top + 6,
        width: primary.width,
        place: "above",
      });
      return;
    }

    const leftCandidate = primary.left - SECONDARY_WIDTH - 8;
    if (leftCandidate >= 8) {
      setSubPos({
        left: leftCandidate,
        bottom: window.innerHeight - primary.bottom,
        width: SECONDARY_WIDTH,
        place: "left",
      });
    } else {
      setSubPos({
        left: primary.left,
        bottom: window.innerHeight - primary.top + 6,
        width: SECONDARY_WIDTH,
        place: "above",
      });
    }
  }, [open, showFlyout, flyoutId, isMobile]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || popRef.current?.contains(t) || subRef.current?.contains(t)) return;
      closeMenu();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, closeMenu]);

  useEffect(() => {
    return () => {
      if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    };
  }, []);

  const pickModel = (id: string, thinking?: { enabled: boolean; effort: ThinkingEffort }) => {
    setSelectedModelId(id);
    if (thinking && onThinkingChange) onThinkingChange(thinking);
    closeMenu();
  };

  const openFlyout = (id: string) => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    setFlyoutId(id);
  };
  const scheduleCloseFlyout = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setFlyoutId(null), 140);
  };

  const onRowClick = (m: ModelInfo) => {
    if (modelSupportsThinkingEffort(m) && (isMobile || !onThinkingChange)) {
      setFlyoutId((cur) => (cur === m.id ? null : m.id));
      return;
    }
    if (modelSupportsThinkingEffort(m) && onThinkingChange) {
      const effort = clampThinkingEffort(m, thinkingEffort);
      pickModel(m.id, {
        enabled: m.thinkingRequired ? true : thinkingEnabled,
        effort,
      });
      return;
    }
    pickModel(m.id);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        title="选择模型"
        data-testid="model-menu-button"
        className="press flex max-w-[180px] min-w-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--ink-soft)] hover:bg-[var(--bg-muted)] [flex-shrink:1]"
      >
        <Cpu size={12} className="shrink-0 text-[var(--accent-ink)]" />
        <span className="model-menu-label model-menu-label-full truncate">{label}</span>
        <span className="model-menu-label model-menu-label-short">model</span>
        <ChevronDown size={12} className="shrink-0" />
      </button>

      {open &&
        createPortal(
          <>
            <div
              ref={popRef}
              style={{ left: pos.left, bottom: pos.bottom, width: PRIMARY_WIDTH }}
              className="fixed z-[9999] max-h-[360px] overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--bg-panel)] p-1.5 shadow-lg animate-[dropdown-in_0.15s_ease-out]"
              data-testid="model-menu-panel"
              onMouseLeave={() => {
                if (!isMobile) scheduleCloseFlyout();
              }}
            >
              {groups.map((g) => (
                <div key={g.group} className="mb-1">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
                    {g.group}
                  </div>
                  {g.models.map((m) => {
                    const active = m.id === selectedModelId;
                    const hasEffort = modelSupportsThinkingEffort(m);
                    const flyoutOpen = flyoutId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        data-testid={`model-menu-item-${m.id}`}
                        onClick={() => onRowClick(m)}
                        onMouseEnter={() => {
                          if (!isMobile && hasEffort) openFlyout(m.id);
                          else if (!isMobile) setFlyoutId(null);
                        }}
                        className={
                          "flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors " +
                          (active || flyoutOpen ? "bg-[var(--accent-weak)]" : "hover:bg-[var(--bg-muted)]")
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
                            {hasEffort && (
                              <span className="shrink-0 rounded bg-[var(--bg-muted)] px-1 text-[9px] text-[var(--ink-soft)]">
                                强度
                              </span>
                            )}
                            {m.vision && (
                              <span className="shrink-0 rounded bg-[color-mix(in_srgb,var(--md-sys-color-tertiary)_15%,transparent)] px-1 text-[9px] text-[var(--md-sys-color-tertiary)]">
                                视觉
                              </span>
                            )}
                            {m.type === "image" && (
                              <span className="shrink-0 rounded bg-[color-mix(in_srgb,var(--md-sys-color-secondary)_18%,transparent)] px-1 text-[9px] text-[var(--md-sys-color-secondary)]">
                                生图
                              </span>
                            )}
                          </span>
                          <span className="block truncate text-[10.5px] text-[var(--ink-faint)]">
                            {m.hint}
                          </span>
                        </span>
                        {hasEffort && (
                          <span className="mt-0.5 shrink-0 text-[var(--ink-faint)]" aria-hidden>
                            {isMobile ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {showFlyout && flyoutModel && (
              <div
                ref={subRef}
                style={{ left: subPos.left, bottom: subPos.bottom, width: subPos.width }}
                className="fixed z-[10000] rounded-xl border border-[var(--line)] bg-[var(--bg-panel)] p-1.5 shadow-lg animate-[dropdown-in_0.15s_ease-out]"
                data-testid="model-thinking-submenu"
                data-placement={subPos.place}
                onMouseEnter={() => flyoutId && openFlyout(flyoutId)}
                onMouseLeave={() => {
                  if (!isMobile) scheduleCloseFlyout();
                }}
              >
                <ThinkingSubmenu
                  model={flyoutModel}
                  selected={flyoutModel.id === selectedModelId}
                  thinkingEnabled={thinkingEnabled}
                  thinkingEffort={thinkingEffort}
                  onPick={(next) => pickModel(flyoutModel.id, next)}
                />
              </div>
            )}
          </>,
          document.body,
        )}
    </>
  );
}

function ThinkingSubmenu({
  model,
  selected,
  thinkingEnabled,
  thinkingEffort,
  onPick,
}: {
  model: ModelInfo;
  selected: boolean;
  thinkingEnabled: boolean;
  thinkingEffort: ThinkingEffort;
  onPick: (next: { enabled: boolean; effort: ThinkingEffort }) => void;
}) {
  const levels = modelThinkingLevels(model);
  const options = THINKING_EFFORT_OPTIONS.filter((o) => levels.includes(o.value));
  const allowOff = modelAllowsDisableThinking(model);
  const activeEffort = selected && thinkingEnabled ? clampThinkingEffort(model, thinkingEffort) : defaultEffortFor(model);

  return (
    <>
      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
        思考强度 · {model.label}
      </div>
      {allowOff && (
        <>
          <button
            type="button"
            role="menuitemradio"
            aria-checked={selected && !thinkingEnabled}
            data-testid="model-thinking-option-off"
            onClick={() => onPick({ enabled: false, effort: activeEffort })}
            className={
              "flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors " +
              (selected && !thinkingEnabled ? "bg-[var(--bg-muted)]" : "hover:bg-[var(--bg-muted)]")
            }
          >
            <span className="mt-0.5 w-3.5 shrink-0">
              {selected && !thinkingEnabled && <AgentCheckIcon size={12} className="text-[var(--ink)]" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--ink)]">
                <AgentPauseIcon size={11} />
                关闭
              </span>
              <span className="block truncate text-[10.5px] text-[var(--ink-faint)]">
                不启用推理链，直接回答
              </span>
            </span>
          </button>
          <div className="my-1 h-px bg-[var(--line)]/60" />
        </>
      )}
      {options.map((opt) => {
        const active = selected && thinkingEnabled && clampThinkingEffort(model, thinkingEffort) === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="menuitemradio"
            aria-checked={active}
            data-testid={`model-thinking-option-${opt.value}`}
            onClick={() => onPick({ enabled: true, effort: opt.value })}
            className={
              "flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors " +
              (active ? "bg-[var(--bg-muted)]" : "hover:bg-[var(--bg-muted)]")
            }
          >
            <span className="mt-0.5 w-3.5 shrink-0">
              {active && <AgentCheckIcon size={12} className="text-[var(--ink)]" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-medium text-[var(--ink)]">{opt.label}</span>
              <span className="block truncate text-[10.5px] text-[var(--ink-faint)]">{opt.hint}</span>
            </span>
          </button>
        );
      })}
    </>
  );
}
