"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AgentLoopIcon } from "@/components/icons/AgentIcons";
import BrandLogo from "@/components/layout/BrandLogo";
import ChatThread from "@/components/chat/ChatThread";
import { ShareViewProvider } from "@/components/share/ShareViewContext";
import { APP_NAME } from "@/lib/constants/app-mode";
import { useT } from "@/lib/i18n";
import { readSharedConversation } from "@/lib/share/read";
import type { SharedConversationSnapshot } from "@/lib/share/types";
import { useSettings } from "@/lib/stores/settings";

/**
 * 公开只读分享页的正文（/s/<shareId>）。
 *
 * 只读体现在三处，缺一不可：
 * 1. 没有输入区 —— 本文件压根不渲染 ChatInput；
 * 2. 追问不可用 —— ChatThread 的 showFollowUps={false} 直接把追问块摘掉
 *    （不传 onFollowUpClick 的空实现「点了没反应」更糟：按钮还在，用户会以为坏了）；
 * 3. 图片走占位 —— 云端 payload 刻意剥掉了媒体（lib/sync/payload.ts），
 *    由 ShareViewProvider 让 ChatImage 渲染 share.page.imagePlaceholder。
 * 另外：
 * - 不给 ChatThread 传 sessionId / repairModelId：那两个是「修复可视化」的上下文，
 *   带上就等于给一个访客页面留了条打 AI 接口的路；
 * - 快照里的 HTML 演示通过 ShareViewProvider 交给消息内卡片**只读**渲染，
 *   全程不碰 useArtifacts（公开页不产生任何写入）。
 */

/** 只读页不会发生的回调；模块级常量，避免每次渲染换个新函数把 memo 打穿。 */
const NOOP = () => {};

type LoadState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "ready"; snapshot: SharedConversationSnapshot };

function CenteredNotice({ label, busy = false }: { label: string; busy?: boolean }) {
  const t = useT();
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      {busy ? (
        <AgentLoopIcon size={18} className="animate-pulse motion-reduce:animate-none" style={{ color: "var(--ink-soft)" }} />
      ) : null}
      <p className="text-[13px] text-[var(--ink-soft)]" role={busy ? "status" : "alert"} data-testid="share-page-notice">
        {label}
      </p>
      {/* 打不开的分享链接不该是死胡同：给访客一条回 Agent 的路。*/}
      {!busy ? (
        <Link
          href="/agent"
          className="rounded-lg px-3 py-1.5 text-[12.5px] font-semibold"
          style={{ background: "var(--md-sys-color-primary)", color: "var(--md-sys-color-on-primary)" }}
        >
          {t("share.route.backToAgent")}
        </Link>
      ) : null}
    </div>
  );
}

export default function SharePage({ shareId }: { shareId: string }) {
  /**
   * key={shareId}：换一条分享链接时强制换实例。
   * 这样加载态从 useState 的初值开始，不必在 effect 里同步 setState 复位
   * （那是级联渲染，会被 react-hooks/set-state-in-effect 拦下），
   * 也保证不会把上一条链接的快照留在屏幕上。
   */
  return <ShareLoader key={shareId} shareId={shareId} />;
}

function ShareLoader({ shareId }: { shareId: string }) {
  const t = useT();
  const fontScale = useSettings((s) => s.fontScale);
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    void readSharedConversation(shareId)
      .then((snapshot) => {
        if (cancelled) return;
        setState(snapshot ? { status: "ready", snapshot } : { status: "missing" });
      })
      // readSharedConversation 自己已经吞掉了失败并返回 null；这里再兜一层，
      // 是为了「读的时候把组件卸载了」之外的意外（比如未来它改成抛）。
      .catch(() => {
        if (!cancelled) setState({ status: "missing" });
      });
    return () => { cancelled = true; };
  }, [shareId]);

  if (state.status === "loading") {
    return <CenteredNotice busy label={t("share.route.loading")} />;
  }
  if (state.status === "missing") {
    return <CenteredNotice label={t("share.page.notFound")} />;
  }
  return <SharedConversation snapshot={state.snapshot} fontScale={fontScale} />;
}

function SharedConversation({
  snapshot,
  fontScale,
}: {
  snapshot: SharedConversationSnapshot;
  fontScale: number;
}) {
  const t = useT();

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-share-source={snapshot.sourceClientId}>
      <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-[var(--line-soft)] bg-[var(--bg-panel)] px-4 py-2.5">
        <Link href="/" className="flex items-center gap-2">
          <BrandLogo size={22} />
          <span className="text-[13.5px] font-semibold text-[var(--ink)]">{APP_NAME}</span>
        </Link>
        <span
          data-testid="share-page-badge"
          className="rounded-full border border-[var(--line-soft)] px-2 py-0.5 text-[11.5px] text-[var(--ink-soft)]"
        >
          {t("share.page.badge")}
        </span>
        <span
          data-testid="share-page-readonly"
          className="rounded-full bg-[var(--bg-muted)] px-2 py-0.5 text-[11.5px] text-[var(--ink-faint)]"
        >
          {t("share.page.readonly")}
        </span>
        <Link
          href="/agent"
          className="ml-auto shrink-0 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold"
          style={{ background: "var(--md-sys-color-primary)", color: "var(--md-sys-color-on-primary)" }}
        >
          {t("share.page.cta")}
        </Link>
      </header>

      <div className="shrink-0 border-b border-[var(--line-soft)] bg-[var(--bg-panel)] px-4 py-2">
        <h1 className="truncate text-[15px] font-semibold text-[var(--ink)]" title={snapshot.title} data-testid="share-page-title">
          {snapshot.title}
        </h1>
      </div>

      <ShareViewProvider imagePlaceholder={t("share.page.imagePlaceholder")} artifacts={snapshot.artifacts}>
        {/* 正文收进与 Agent 页同一条阅读宽度（--agent-chat-max）并居中：
            裸壳没有 [data-agent-shell]，那条居中规则不会自动生效。 */}
        <div className="mx-auto flex min-h-0 w-full max-w-[var(--agent-chat-max,920px)] flex-1 flex-col">
          <ChatThread
            messages={snapshot.messages}
            isLoading={false}
            error={null}
            onClearError={NOOP}
            onFollowUpClick={NOOP}
            hydrated
            fontScale={fontScale}
            showFollowUps={false}
            emptyState={
              <div className="px-4 py-10 text-center text-[13px] text-[var(--ink-soft)]">{t("share.empty")}</div>
            }
          />
        </div>
      </ShareViewProvider>
    </div>
  );
}
