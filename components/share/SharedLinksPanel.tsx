"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Link2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { shareUrl } from "@/lib/share/siteUrl";
import type { SharedLinkSummary } from "@/lib/share/types";
import { useToast } from "@/lib/stores/toast";

/**
 * 「我的资产 → 分享的链接」面板：列出自己分享过的对话，逐条开 / 关。
 *
 * 为什么是独立面板，而不是往 ASSET_KINDS 里加第七种 kind：ASSET_KINDS 描述的是**本机产物**
 * （笔记 / 闪卡 / 长文 / 演示 / 文件 / 网址），assetCounts 与 filterAssets 都按它算。
 * 分享列表在云端、要联网、还能开关，混进去会让计数与筛选语义一起变形；
 * 所以它是资产页上的一个独立顶级标签，选中时整块换成本面板。
 *
 * 开 / 关一律**就地更新**：只翻转被点的那一行，不重拉整表（用户口径）。
 * 云端才是真相，所以先乐观翻转发 PATCH；失败再翻回**点击前的值**并给提示。
 */

type Status = "loading" | "ready" | "signedOut" | "failed";

/** 形状守卫：行数据直接来自服务端，坏行宁可少一条，也不要渲染出 "Invalid Date"。 */
function isShareRow(value: unknown): value is SharedLinkSummary {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.title === "string" &&
    typeof row.createdAt === "string" &&
    typeof row.revoked === "boolean"
  );
}

type LoadResult = { status: "ready"; rows: SharedLinkSummary[] } | { status: "signedOut" | "failed" };

/** 拉一次自己的分享列表。任何异常都折成 failed——面板只需要知道该显示哪一种状态。 */
async function loadSharedLinks(): Promise<LoadResult> {
  try {
    const response = await fetch("/api/share", { headers: { Accept: "application/json" } });
    // 401 单独成一态：未登录要提示先登录，不能和「加载失败」混为一谈（用户口径）。
    if (response.status === 401) return { status: "signedOut" };
    if (!response.ok) return { status: "failed" };
    const data = (await response.json().catch(() => null)) as { shares?: unknown } | null;
    return { status: "ready", rows: Array.isArray(data?.shares) ? data.shares.filter(isShareRow) : [] };
  } catch {
    return { status: "failed" };
  }
}

/** 时间走本地化（仓库口径：不手写 yyyy-MM-dd）；解析不出来就原样显示，好过 "Invalid Date"。 */
function formatCreatedAt(iso: string): string {
  const time = new Date(iso);
  return Number.isNaN(time.getTime()) ? iso : time.toLocaleString();
}

/** 加载 / 未登录 / 失败 / 空：四种「没有列表可看」的状态共用同一块居中提示。 */
function Notice({ testId, label, role }: { testId: string; label: string; role?: "status" | "alert" }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
      <p className="text-[13px] text-[var(--ink-soft)]" role={role} data-testid={testId}>
        {label}
      </p>
    </div>
  );
}

export default function SharedLinksPanel() {
  const t = useT();
  const showToast = useToast((s) => s.show);
  const [status, setStatus] = useState<Status>("loading");
  const [rows, setRows] = useState<SharedLinkSummary[]>([]);
  /** 有请求在飞时锁住所有开关：两条并发 PATCH 的返回顺序不定，回滚值会互相踩。 */
  const [busy, setBusy] = useState(false);

  // 只在挂载时拉一次：之后的开 / 关都是就地更新，不重拉整表（用户口径）。
  useEffect(() => {
    let cancelled = false;
    void loadSharedLinks().then((result) => {
      if (cancelled) return; // 卸载后不再 setState
      if (result.status === "ready") setRows(result.rows);
      setStatus(result.status);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback(
    async (row: SharedLinkSummary) => {
      if (busy) return;
      const nextRevoked = !row.revoked;
      setBusy(true);
      // 乐观翻转这一行：开关立刻有反馈，列表其余部分一个字节都不动。
      setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, revoked: nextRevoked } : item)));
      try {
        const response = await fetch("/api/share", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: row.id, enabled: !nextRevoked }),
        });
        if (!response.ok) throw new Error(`PATCH /api/share ${response.status}`);
      } catch {
        // 回滚到点击前的值，而不是「再取反一次」：这一行可能已被别处改过。
        setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, revoked: row.revoked } : item)));
        showToast(t("share.assets.toggleFailed"));
      } finally {
        setBusy(false);
      }
    },
    [busy, showToast, t],
  );

  return (
    <div className="h-full" data-testid="shared-links-panel">
      {status === "loading" ? (
        <Notice testId="shared-links-loading" role="status" label={t("share.assets.loading")} />
      ) : status === "signedOut" ? (
        <Notice testId="shared-links-signed-out" role="alert" label={t("share.assets.loginRequired")} />
      ) : status === "failed" ? (
        <Notice testId="shared-links-failed" role="alert" label={t("share.assets.failed")} />
      ) : rows.length === 0 ? (
        <Notice testId="shared-links-empty" label={t("share.assets.empty")} />
      ) : (
        <ul className="mx-auto flex w-full max-w-[720px] flex-col gap-1.5" data-testid="shared-links-list">
          {rows.map((row) => (
            <li
              key={row.id}
              data-testid={`shared-link-${row.id}`}
              className="flex items-center gap-2.5 rounded-xl border border-[var(--line-soft)] bg-[var(--bg-panel)] px-3 py-2.5"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-muted)] text-[var(--md-sys-color-primary)]">
                <Link2 size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] text-[var(--ink)]" title={row.title}>
                  {row.title}
                </span>
                <span className="block truncate text-[11.5px] text-[var(--ink-faint)]">
                  {t("share.assets.createdAt", { time: formatCreatedAt(row.createdAt) })}
                </span>
              </span>
              <span
                data-testid={`shared-link-state-${row.id}`}
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] ${
                  row.revoked
                    ? "border border-[var(--line-soft)] text-[var(--ink-faint)]"
                    : "bg-[var(--accent-weak)] text-[var(--accent-ink)]"
                }`}
              >
                {row.revoked ? t("share.assets.disabled") : t("share.assets.enabled")}
              </span>
              {/* 已关闭的链接打不开，就不给「打开」入口——按钮在但点开是 404 更糟。 */}
              {row.revoked ? null : (
                <a
                  href={shareUrl(row.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`shared-link-open-${row.id}`}
                  className="press inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[12px] text-[var(--md-sys-color-primary)] hover:bg-[var(--bg-muted)]"
                >
                  <ExternalLink size={13} />
                  {t("share.assets.open")}
                </a>
              )}
              <button
                type="button"
                onClick={() => void toggle(row)}
                disabled={busy}
                data-testid={`shared-link-toggle-${row.id}`}
                className="press shrink-0 rounded-lg border border-[var(--line-soft)] px-2.5 py-1 text-[12px] font-medium text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--ink)] disabled:opacity-55"
              >
                {row.revoked ? t("share.assets.enable") : t("share.assets.disable")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
