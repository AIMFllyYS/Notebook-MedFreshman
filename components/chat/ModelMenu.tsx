"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Check, Cpu, Compass, Gift, Zap, Layers, Crown, Image as ImageIcon, Plug, Server, type LucideIcon } from "lucide-react";
import { submenuTop } from '@/lib/chat/modelMenuPosition';
import { useSettings, type ThinkingEffort } from "@/lib/hooks/useSettings";
import {
  AUTO_MODEL_ID, AUTO_MODEL_INFO, MODELS, modelsForPicker, getAllModels, getModelInfoWithCustom, CUSTOM_PREFIX,
  modelSupportsThinkingEffort, modelAllowsDisableThinking, modelThinkingLevels,
  clampThinkingEffort, defaultEffortFor, type ModelInfo,
} from "@/lib/ai/models";
import { ModelIcon } from "@/components/icons/ModelBrandIcons";
import { AgentCheckIcon, AgentPauseIcon } from "@/components/icons/AgentIcons";
import { THINKING_EFFORT_OPTIONS } from "@/components/chat/ThinkingMenu";
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";
import { useT } from "@/lib/i18n";

const CATEGORIES = ["免费模型", "快速模型", "多模态模型", "旗舰模型", "生图模型"];
const CATEGORY_ICONS: Record<string, LucideIcon> = { '免费模型': Gift, '快速模型': Zap, '多模态模型': Layers, '旗舰模型': Crown, '生图模型': ImageIcon };
/** 分类中文名 → 词典 key。分类名同时是 series 状态与 CATEGORY_ICONS 的标识，保持中文不动，只在渲染时翻译。 */
const CATEGORY_LABEL_KEYS: Record<string, string> = {
  "免费模型": "menu.model.category.free",
  "快速模型": "menu.model.category.fast",
  "多模态模型": "menu.model.category.multimodal",
  "旗舰模型": "menu.model.category.flagship",
  "生图模型": "menu.model.category.image",
};
const COLUMN_WIDTHS = [190, 210, 224];
const GAP = 6;
function category(model: ModelInfo) { return model.group === "多模态" ? "多模态模型" : model.group; }
function formatContextWindow(k?: number): string | null {
  if (!k || k <= 0) return null;
  return k >= 1000 ? `${Number((k / 1000).toFixed(2))}M` : `${k}K`;
}

export default function ModelMenu({
  value, onChange, thinkingEnabled = false, thinkingEffort = "medium", onThinkingChange,
}: {
  onOpenSettings?: () => void; value?: string; onChange?: (id: string) => void;
  thinkingEnabled?: boolean; thinkingEffort?: ThinkingEffort;
  onThinkingChange?: (next: { enabled: boolean; effort: ThinkingEffort }) => void;
}) {
  const t = useT();
  const globalSelected = useSettings((s) => s.selectedModelId);
  const globalSet = useSettings((s) => s.setSelectedModelId);
  const customApiGroups = useSettings((s) => s.customApiGroups);
  const selectedId = value ?? globalSelected;
  const current = getModelInfoWithCustom(selectedId, customApiGroups);
  const [open, setOpen] = useState(false);
  const [series, setSeries] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [position, setPosition] = useState({ left: 8, bottom: 8, maxHeight: 380, mobile: false, growLeft: true });
  const focusRequest = useRef<number | null>(null);
  const [focusNonce, setFocusNonce] = useState(0);
  const focusColumn = (level: number) => { focusRequest.current = level; setFocusNonce((n) => n + 1); };
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const seriesAnchor = useRef<HTMLButtonElement | null>(null);
  const modelAnchor = useRef<HTMLButtonElement | null>(null);
  const close = useCallback(() => {
    setOpen(false); setSeries(null); setDetailId(null); focusRequest.current = null; btnRef.current?.focus();
  }, []);
  useOverlayRegistration({ id: "model-menu", open, onClose: close, priority: 45 });
  const models = series?.startsWith("category:")
    ? modelsForPicker(MODELS).filter((model) => category(model) === series.slice(9))
    : series?.startsWith("custom:")
      ? getAllModels(customApiGroups.filter((group) => group.id === series.slice(7))).filter((model) => model.id.startsWith(CUSTOM_PREFIX))
      : [];
  const detail = models.find((model) => model.id === detailId);
  const count = 1 + (series ? 1 : 0) + (detail ? 1 : 0);
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = btnRef.current?.getBoundingClientRect();
      if (!rect) return;
      const viewport = window.visualViewport;
      const height = viewport?.height ?? window.innerHeight;
      const width = viewport?.width ?? window.innerWidth;
      const top = viewport?.offsetTop ?? 0;
      const mobile = width < 768;
      const totalWidth = mobile ? Math.min(300, width - 16) : COLUMN_WIDTHS.slice(0, count).reduce((a, b) => a + b, 0) + GAP * (count - 1);
      const growLeft = rect.right > width / 2;
      setPosition({
        left: Math.max(8, Math.min(growLeft ? rect.right - totalWidth : rect.left, width - totalWidth - 8)),
        bottom: mobile ? Math.max(8, window.innerHeight - top - height + 8) : Math.max(8, window.innerHeight - rect.top + 6),
        maxHeight: Math.max(120, Math.min(mobile ? 520 : 380, mobile ? height * 0.75 : rect.top - top - 16)),
        mobile, growLeft,
      });
    };
    place();
    window.addEventListener("resize", place);
    window.visualViewport?.addEventListener("resize", place);
    window.visualViewport?.addEventListener("scroll", place);
    return () => {
      window.removeEventListener("resize", place);
      window.visualViewport?.removeEventListener("resize", place);
      window.visualViewport?.removeEventListener("scroll", place);
    };
  }, [open, count]);
  useLayoutEffect(() => {
    if (!open) return;
    const root = panelRef.current;
    if (!root) return;
    let frame = 0;
    const place = () => {
      frame = 0;
      const rootRect = root.getBoundingClientRect();
      const viewport = window.visualViewport;
      for (const [level, anchor] of [[2, seriesAnchor.current], [3, modelAnchor.current]] as const) {
        const column = root.querySelector<HTMLElement>(`[data-menu-level="${level}"]`);
        if (!column) continue;
        if (position.mobile) { column.style.top = ''; continue; }
        if (!anchor?.isConnected) continue;
        const top = submenuTop(anchor.getBoundingClientRect().top, column.offsetHeight, viewport?.offsetTop ?? 0, viewport?.height ?? window.innerHeight);
        column.style.top = `${top - rootRect.top}px`;
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(place); };
    place();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    for (const child of Array.from(root.children)) observer?.observe(child);
    root.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); root.removeEventListener('scroll', schedule, true); window.removeEventListener('resize', schedule); window.visualViewport?.removeEventListener('resize', schedule); };
  }, [open, series, detailId, position]);
  useEffect(() => {
    if (open) btnRef.current?.blur();
  }, [open]);
  useEffect(() => {
    if (!open || focusRequest.current === null) return;
    panelRef.current?.querySelector<HTMLButtonElement>(`[data-menu-level="${focusRequest.current}"] button`)?.focus();
    focusRequest.current = null;
  }, [open, focusNonce, series, detailId]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node) && !btnRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open, close]);
  const navigate = (next: string, anchor: HTMLButtonElement, focus = false) => {
    seriesAnchor.current = anchor;
    if (series !== next) { setSeries(next); setDetailId(null); }
    if (focus || position.mobile) focusColumn(2);
  };
  const back = (level: number) => {
    if (level === 3) { setDetailId(null); focusColumn(2); }
    else { setSeries(null); setDetailId(null); focusColumn(1); }
  };
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    const column = (event.target as HTMLElement).closest<HTMLElement>("[data-menu-level]");
    const level = Number(column?.dataset.menuLevel ?? 1);
    if (event.key === "Escape") { event.stopPropagation(); event.preventDefault(); close(); return; }
    const enterKey = !position.mobile && position.growLeft ? 'ArrowLeft' : 'ArrowRight';
    const backKey = enterKey === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
    if (event.key === backKey && level > 1) { event.preventDefault(); back(level); return; }
    if (event.key === enterKey && level < 3) {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[aria-expanded]");
      if (button) { event.preventDefault(); button.click(); focusColumn(level + 1); }
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      const buttons = Array.from(panelRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
      const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const next = index + (event.shiftKey ? -1 : 1);
      if (next < 0 || next >= buttons.length) close(); else buttons[next]?.focus();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const buttons = Array.from((column ?? panelRef.current)?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1
      : (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
    event.preventDefault(); buttons[next]?.focus();
  };
  const pick = (model: ModelInfo, thinking?: { enabled: boolean; effort: ThinkingEffort }) => {
    (onChange ?? globalSet)(model.id);
    if (thinking) onThinkingChange?.(thinking);
    else if (modelSupportsThinkingEffort(model)) onThinkingChange?.({
      enabled: model.thinkingRequired || thinkingEnabled, effort: clampThinkingEffort(model, thinkingEffort),
    });
    close();
  };
  const rowClass = "flex w-full items-center gap-2 rounded-md text-left text-[var(--ink)] hover:bg-[var(--bg-muted)] focus-visible:outline-2 focus-visible:outline-[var(--accent-ink)] " +
    (position.mobile ? "min-h-11 px-3 py-2 text-[13px]" : "min-h-8 px-2 py-1.5 text-[12px]");
  const columnClass = "hide-scrollbar min-w-0 overflow-y-auto overscroll-contain rounded-xl border border-[var(--line)] bg-[var(--bg-panel)] p-1.5 shadow-lg";
  const columnStyle = (index: number) => ({
    width: position.mobile ? "min(300px, calc(100vw - 16px))" : COLUMN_WIDTHS[index],
    maxHeight: position.maxHeight,
    ...(!position.mobile && index > 0 ? { position: 'absolute' as const, left: position.growLeft
      ? -(COLUMN_WIDTHS.slice(1, index + 1).reduce((a, b) => a + b, 0) + GAP * index)
      : COLUMN_WIDTHS.slice(0, index).reduce((a, b) => a + b, 0) + GAP * index } : {}),
  });
  const categoryName = series?.startsWith("category:") ? series.slice(9) : null;
  const categoryKey = categoryName ? CATEGORY_LABEL_KEYS[categoryName] : undefined;
  const title = categoryName ? (categoryKey ? t(categoryKey) : categoryName)
    : customApiGroups.find((group) => group.id === series?.slice(7))?.name ?? t("menu.model.custom");
  const details = detail ? <>
    <ModelDetails model={detail} onUse={() => pick(detail)} />
    {detail.thinking && (modelSupportsThinkingEffort(detail) || modelAllowsDisableThinking(detail)) ? <div role="menu" aria-label={t("menu.thinking.strength")} data-testid="model-thinking-submenu"><ThinkingSubmenu model={detail} selected={selectedId === detail.id} thinkingEnabled={thinkingEnabled} thinkingEffort={thinkingEffort} onPick={(thinking) => pick(detail, thinking)} /></div> : null}
  </> : null;

  return <>
    <button ref={btnRef} type="button" aria-haspopup="dialog" aria-expanded={open}
      onClick={() => { if (open) close(); else { setOpen(true); focusColumn(1); } }} title={t("menu.model.choose")} data-testid="model-menu-button"
      className="press flex max-w-[180px] min-w-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]">
      {selectedId === AUTO_MODEL_ID ? <Compass size={12} /> : <Cpu size={12} />}
      <span className="model-menu-label model-menu-label-full truncate">{current?.label ?? selectedId}</span>
      <span className="model-menu-label model-menu-label-short">{t("menu.model.short")}</span><ChevronDown size={12} />
    </button>
    {open ? createPortal(<div ref={panelRef} role="dialog" aria-label={t("menu.model.dialog")} onKeyDown={keyboard}
      style={{ left: position.left + (!position.mobile && position.growLeft ? COLUMN_WIDTHS.slice(1, count).reduce((a, b) => a + b, 0) + GAP * (count - 1) : 0), bottom: position.bottom, gap: GAP }}
      className="fixed z-[9999] flex items-end" data-testid="model-menu-panel" data-layout={position.mobile ? "drilldown" : "cascade"}>
      {(!position.mobile || !series) ? <section data-menu-level="1" aria-label={t("menu.model.series")} className={columnClass} style={columnStyle(0)}>
        <div className="px-2 py-1.5 text-[10px] font-semibold text-[var(--ink-faint)]">{t("menu.model.builtin")}</div>
        <button type="button" className={rowClass} onClick={() => pick(AUTO_MODEL_INFO)} data-testid="model-menu-item-auto"><Compass aria-hidden size={14} className="shrink-0 text-[var(--accent-ink)]" /><span className="flex-1">{t("menu.model.auto")}</span>{selectedId === AUTO_MODEL_ID ? <Check size={12} /> : null}</button>
        {CATEGORIES.map((name) => { const Icon = CATEGORY_ICONS[name]; const labelKey = CATEGORY_LABEL_KEYS[name]; return <button type="button" key={name} className={rowClass + (series === "category:" + name ? " bg-[var(--accent-weak)]" : "")}
          aria-expanded={series === "category:" + name} onMouseEnter={(event) => { if (!position.mobile) navigate("category:" + name, event.currentTarget); }} onClick={(event) => navigate("category:" + name, event.currentTarget)}>
          {!position.mobile && position.growLeft ? <ChevronLeft data-branch-side="left" aria-hidden size={12} className="shrink-0 opacity-60" /> : null}
          <Icon aria-hidden size={14} className="shrink-0 text-[var(--ink-soft)]" />
          <span className="flex-1">{labelKey ? t(labelKey) : name}</span>{position.mobile || !position.growLeft ? <ChevronRight data-branch-side="right" aria-hidden size={12} className="shrink-0 opacity-60" /> : null}
        </button>; })}
        {customApiGroups.length ? <div className="mt-1 flex items-center gap-2 border-t border-[var(--line)] px-2 py-2 text-[10px] text-[var(--ink-faint)]"><Plug aria-hidden size={13} />{t("menu.model.customHeading")}</div> : null}
        {customApiGroups.map((group) => <button type="button" key={group.id} className={rowClass} aria-expanded={series === "custom:" + group.id}
          onMouseEnter={(event) => { if (!position.mobile) navigate("custom:" + group.id, event.currentTarget); }} onClick={(event) => navigate("custom:" + group.id, event.currentTarget)}>
          {!position.mobile && position.growLeft ? <ChevronLeft data-branch-side="left" aria-hidden size={12} className="shrink-0 opacity-60" /> : null}
          <Server aria-hidden size={14} className="shrink-0 text-[var(--ink-soft)]" /><span className="min-w-0 flex-1 truncate">{group.name}</span>{position.mobile || !position.growLeft ? <ChevronRight data-branch-side="right" aria-hidden size={12} className="shrink-0 opacity-60" /> : null}
        </button>)}
      </section> : null}
      {series ? <section data-menu-level="2" aria-label={t("menu.model.models")} className={columnClass} style={columnStyle(1)}>
        <div className="flex items-center gap-1 px-1 py-1 text-[10px] text-[var(--ink-faint)]">
          {position.mobile ? <button type="button" aria-label={t("menu.model.backToSeries")} onClick={() => back(2)} className="rounded p-2"><ChevronLeft size={14} /></button> : null}{title}
        </div>
        {models.map((model) => <div key={model.id}>
          <button type="button" className={rowClass + (detailId === model.id ? " bg-[var(--accent-weak)]" : "")} aria-expanded={detailId === model.id}
            data-testid={`model-menu-item-${model.id}`}
            onMouseEnter={(event) => { modelAnchor.current = event.currentTarget; if (!position.mobile) setDetailId(model.id); }}
            onClick={(event) => { modelAnchor.current = event.currentTarget; setDetailId(position.mobile && detailId === model.id ? null : model.id); }}>
            {!position.mobile && position.growLeft ? <ChevronLeft data-branch-side="left" aria-hidden size={12} className="shrink-0 opacity-60" /> : null}
            <ModelIcon brand={model.icon} size={14} /><span className="min-w-0 flex-1"><span className="block truncate">{model.label}</span>
            {model.vendorTrainingNotice ? <span className="block text-[10px] text-[var(--md-sys-color-error)]">{model.vendorTrainingNotice}</span> : null}</span>
            {selectedId === model.id ? <Check aria-label={t("menu.model.selected")} size={12} className="shrink-0" /> : null}
            {position.mobile ? <ChevronDown aria-hidden size={12} className="shrink-0" /> : !position.growLeft ? <ChevronRight data-branch-side="right" aria-hidden size={12} className="shrink-0 opacity-60" /> : null}
          </button>
          {position.mobile && detail?.id === model.id ? <div data-testid="model-submenu" className="mx-1 mb-2 rounded-lg border border-[var(--line)] bg-[var(--bg-muted)] p-2">{details}</div> : null}
        </div>)}
      </section> : null}
      {!position.mobile && detail ? <section data-menu-level="3" aria-label={t("menu.model.details")} data-testid="model-submenu" className={columnClass} style={columnStyle(2)}>{details}</section> : null}
    </div>, document.body) : null}
  </>;
}

function ModelDetails({
  model,
  onUse,
}: {
  model: ModelInfo;
  onUse: () => void;
}) {
  const t = useT();
  const ctx = formatContextWindow(model.contextK);
  const badges: { key: string; label: string; className: string }[] = [];
  if (model.vision) {
    badges.push({
      key: "vision",
      label: t("menu.model.badge.vision"),
      className: "bg-[color-mix(in_srgb,var(--md-sys-color-tertiary)_15%,transparent)] text-[var(--md-sys-color-tertiary)]",
    });
  }
  if (ctx) {
    badges.push({
      key: "ctx",
      label: t("menu.model.badge.context", { window: ctx }),
      className: "bg-[var(--bg-muted)] text-[var(--ink-soft)]",
    });
  }
  if (model.thinking) {
    badges.push({
      key: "think",
      label: model.thinkingRequired ? t("menu.model.badge.thinkingRequired") : t("menu.model.badge.thinking"),
      className: "bg-[var(--bg-muted)] text-[var(--ink-soft)]",
    });
  }
  if (model.type === "image") {
    badges.push({
      key: "image",
      label: t("menu.model.badge.image"),
      className: "bg-[color-mix(in_srgb,var(--md-sys-color-secondary)_18%,transparent)] text-[var(--md-sys-color-secondary)]",
    });
  }

  return (
    <>
      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
        {t("menu.model.info")}
      </div>
      <div className="px-2 pb-2">
        <div className="text-[12.5px] font-medium text-[var(--ink)]">{model.label}</div>
        <div className="mt-0.5 text-[10.5px] leading-relaxed text-[var(--ink-faint)]">{model.hint}</div>
        {model.vendorTrainingNotice && (
          <div
            className="mt-1.5 rounded-md px-2 py-1.5 text-[11.5px] font-semibold leading-snug"
            style={{
              background: "color-mix(in srgb, var(--md-sys-color-error) 12%, transparent)",
              color: "var(--md-sys-color-error)",
            }}
            data-testid="vendor-training-notice"
          >
            {model.vendorTrainingNotice}
          </div>
        )}
        {badges.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {badges.map((b) => (
              <span key={b.key} className={`rounded px-1 py-0.5 text-[9px] ${b.className}`}>
                {b.label}
              </span>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        data-testid="model-submenu-use"
        onClick={onUse}
        className="mb-1 flex w-full items-center rounded-lg px-2 py-1.5 text-left text-[12.5px] font-medium text-[var(--ink)] hover:bg-[var(--bg-muted)]"
      >
        {t("menu.model.use")}
      </button>
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
  const t = useT();
  const levels = modelThinkingLevels(model);
  const options = THINKING_EFFORT_OPTIONS.filter((o) => levels.includes(o.value));
  const allowOff = modelAllowsDisableThinking(model);
  const activeEffort = selected && thinkingEnabled ? clampThinkingEffort(model, thinkingEffort) : defaultEffortFor(model);

  return (
    <>
      <div className="my-1 h-px bg-[var(--line)]/60" />
      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
        {t("menu.thinking.strength")}
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
                {t("menu.thinking.off.label")}
              </span>
              <span className="block truncate text-[10.5px] text-[var(--ink-faint)]">
                {t("menu.thinking.off.hint")}
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
              <span className="block truncate text-[10.5px] text-[var(--ink-faint)]">{t(opt.hintKey)}</span>
            </span>
          </button>
        );
      })}
    </>
  );
}
