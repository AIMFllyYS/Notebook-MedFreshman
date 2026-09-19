"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, RefreshCw, Search } from "lucide-react";
import AgentAssetCard from "./AgentAssetCard";
import { useAgentAssets } from "@/lib/hooks/useAgentAssets";
import { useIsClient } from "@/lib/hooks/useIsClient";
import {
  ASSET_KINDS,
  ASSET_KIND_LABELS,
  assetCounts,
  filterAssets,
  type AssetKind,
  type AssetSort,
} from "@/lib/agent/assetCatalog";

type ViewMode = "grid" | "list";
type KindFilter = AssetKind | "all";

const VIEW_STORAGE_KEY = "agent-assets-view";

const SORT_LABELS: Record<AssetSort, string> = { recent: "最近更新", title: "按名称" };

/** 视图偏好只在本机生效；读不到就用橱窗（隐私模式下 localStorage 会抛）。 */
function readStoredView(): ViewMode {
  try {
    const raw = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (raw === "grid" || raw === "list") return raw;
  } catch {
    /* ignore */
  }
  return "grid";
}

function writeStoredView(view: ViewMode): void {
  try {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
  } catch {
    /* ignore */
  }
}

/**
 * 我的资产：顶部标签（全部 + 六类）+ 最右视图切换/搜索/排序，主体是橱窗或列表。
 * 橱窗**不预览内容**：只给图标与标题，点卡片跳到 /agent/assets/{kind}/{id} 详情页。
 *
 * 数据以本机为准（用户口径）：本机有、云端没上传的也列出来，用「仅本机」角标标出。
 */
export default function AgentAssetsPage() {
  const assets = useAgentAssets();
  const [kind, setKind] = useState<KindFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<AssetSort>("recent");
  /**
   * 视图偏好是纯 UI 选择：放 localStorage，不动 store。
   * 不在 effect 里 setState（会触发级联渲染，也过不了 lint）：挂载前固定按橱窗渲染，
   * 挂载后按持久化偏好，用户点过就以点击结果为准。
   */
  const mounted = useIsClient();
  const [viewChoice, setViewChoice] = useState<ViewMode | null>(null);
  const view: ViewMode = viewChoice ?? (mounted ? readStoredView() : "grid");
  const [refreshing, setRefreshing] = useState(false);

  const chooseView = (next: ViewMode) => {
    setViewChoice(next);
    writeStoredView(next);
  };

  const counts = useMemo(() => assetCounts(assets ?? []), [assets]);
  const visible = useMemo(
    () => filterAssets(assets ?? [], { kind, query, sort }),
    [assets, kind, query, sort],
  );

  /** 刷新只做一件事：重新拉一次云端行，让同步角标变准（内容本来就在本机）。 */
  const refresh = () => {
    setRefreshing(true);
    void import("@/lib/sync/schedule")
      .then((mod) => mod.scheduleCloudPull())
      .catch(() => {})
      .finally(() => window.setTimeout(() => setRefreshing(false), 900));
  };

  const tabs: { id: KindFilter; label: string; count: number }[] = [
    { id: "all", label: "全部", count: counts.all },
    ...ASSET_KINDS.map((item) => ({ id: item as KindFilter, label: ASSET_KIND_LABELS[item], count: counts.byKind[item] })),
  ];

  return (
    <section data-testid="agent-assets-page" className="flex h-full min-h-0 flex-col bg-[var(--md-sys-color-surface-container-low)]">
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--line-soft)] px-4 py-2.5">
        <h1 className="text-[15px] font-semibold text-[var(--ink)]">我的资产</h1>
        <span className="text-[11.5px] text-[var(--ink-faint)]">
          {counts.all} 项 · 本机为准，角标显示同步状态
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 rounded-lg border border-[var(--line-soft)] p-0.5">
            <button
              type="button"
              data-testid="assets-view-grid"
              aria-pressed={view === "grid"}
              aria-label="橱窗视图"
              title="橱窗视图"
              onClick={() => chooseView("grid")}
              className={`flex h-7 w-7 items-center justify-center rounded-md ${view === "grid" ? "bg-[var(--accent-weak)] text-[var(--accent-ink)]" : "text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"}`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              data-testid="assets-view-list"
              aria-pressed={view === "list"}
              aria-label="列表视图"
              title="列表视图"
              onClick={() => chooseView("list")}
              className={`flex h-7 w-7 items-center justify-center rounded-md ${view === "list" ? "bg-[var(--accent-weak)] text-[var(--accent-ink)]" : "text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"}`}
            >
              <List size={15} />
            </button>
          </div>
          <label className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--line-soft)] px-2">
            <Search size={14} className="shrink-0 text-[var(--ink-faint)]" />
            <input
              data-testid="assets-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索标题、科目、路径或网址"
              aria-label="搜索资产"
              className="w-[190px] bg-transparent text-[12.5px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
            />
          </label>
          <select
            data-testid="assets-sort"
            value={sort}
            aria-label="排序方式"
            onChange={(event) => setSort(event.target.value as AssetSort)}
            className="h-8 rounded-lg border border-[var(--line-soft)] bg-transparent px-2 text-[12.5px] text-[var(--ink-soft)] outline-none"
          >
            {(Object.keys(SORT_LABELS) as AssetSort[]).map((key) => (
              <option key={key} value={key}>{SORT_LABELS[key]}</option>
            ))}
          </select>
          <button
            type="button"
            data-testid="assets-refresh"
            onClick={refresh}
            title="重新对齐云端状态"
            aria-label="重新对齐云端状态"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : undefined} />
          </button>
        </div>
      </header>

      <div className="hide-scrollbar flex shrink-0 items-center gap-1 overflow-x-auto border-b border-[var(--line-soft)] px-3 py-2" role="tablist" aria-label="资产类型">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={kind === tab.id}
            data-testid={`assets-tab-${tab.id}`}
            onClick={() => setKind(tab.id)}
            className={`press shrink-0 rounded-full px-3 py-1 text-[12.5px] font-medium ${
              kind === tab.id
                ? "bg-[var(--accent-weak)] text-[var(--accent-ink)]"
                : "text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
            }`}
          >
            {tab.label}
            <span className="ml-1 text-[11px] text-[var(--ink-faint)]">{tab.count}</span>
          </button>
        ))}
      </div>

      <div data-testid="assets-body" className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {assets === null ? (
          <div className="flex flex-col gap-2" role="status" aria-label="资产加载中">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-9 animate-shimmer rounded-lg bg-[var(--bg-muted)]" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-[13px] text-[var(--ink-soft)]">
              {query.trim()
                ? `没有匹配「${query.trim()}」的资产`
                : kind === "all"
                  ? "还没有资产。让 Agent 整理笔记、出闪卡、写长文或生成演示，就会出现在这里。"
                  : `还没有${ASSET_KIND_LABELS[kind as AssetKind]}。`}
            </p>
            {query.trim() ? (
              <button type="button" onClick={() => setQuery("")} className="text-[12px] text-[var(--md-sys-color-primary)]">
                清空搜索
              </button>
            ) : null}
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(176px,1fr))] gap-3" data-testid="assets-grid">
            {visible.map((item) => (
              <AgentAssetCard key={`${item.kind}-${item.id}`} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5" data-testid="assets-list">
            {visible.map((item) => (
              <AgentAssetCard key={`${item.kind}-${item.id}`} item={item} view="list" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}