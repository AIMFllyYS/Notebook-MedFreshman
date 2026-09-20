"use client";

import { useCallback, useState } from "react";
import { Share2 } from "lucide-react";
import { useAuthSession } from "@/lib/hooks/useAuthSession";
import { useArtifacts } from "@/lib/stores/artifacts";
import { useChatHistory } from "@/lib/stores/chatHistory";
import { useToast } from "@/lib/stores/toast";
import { buildSharedSnapshot } from "@/lib/share/snapshot";
import type { SharedArtifact } from "@/lib/share/types";
import { useT } from "@/lib/i18n";

/**
 * 分享链接写剪贴板。返回是否成功——调用方据此决定给「已复制」还是「失败」。
 * 非安全上下文（http 局域网、file://）下 navigator.clipboard 根本不存在，
 * 这里直接判失败，不去猜一个「大概是好的」结果。
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 权限被拒 / 页面失焦：链接其实已经生成，但用户拿不到，仍然算失败。
    return false;
  }
}

/** 从会话元信息 + 本机 artifacts 拼出要上传的快照。抽出来是因为它要读三个 store 的当前值。 */
function collectArtifacts(artifactIds: string[]): SharedArtifact[] {
  const byId = useArtifacts.getState().byId;
  return artifactIds
    .map((id) => byId[id])
    .filter((art): art is NonNullable<typeof art> => Boolean(art))
    .map((art) => ({ id: art.id, title: art.title, html: art.html, status: art.status }));
}

/**
 * Agent 对话页顶栏的「分享」入口（与 Perplexity 的 Share 同位置：全屏 / 右侧工作区开关左侧）。
 * 只做一件事：把当前对话打成公开快照 → POST /api/share → 把返回的链接写进剪贴板。
 * 未登录、空对话一律**不发请求**（服务端只认已鉴权用户，发出去也只是一个 401）。
 */
export default function ShareButton() {
  const t = useT();
  const showToast = useToast((s) => s.show);
  const { status } = useAuthSession();
  const activeSessionId = useChatHistory((s) => s.activeSessionId);
  const sessionsMeta = useChatHistory((s) => s.sessionsMeta);
  const messagesById = useChatHistory((s) => s.messagesById);
  const [creating, setCreating] = useState(false);

  const handleShare = useCallback(async () => {
    if (creating) return;
    if (status !== "signedIn") {
      showToast(t("share.loginRequired"));
      return;
    }
    const meta = sessionsMeta.find((item) => item.id === activeSessionId);
    const messages = activeSessionId ? messagesById[activeSessionId] ?? [] : [];
    if (!meta || messages.length === 0) {
      showToast(t("share.empty"));
      return;
    }

    setCreating(true);
    try {
      // 顶层 title / sourceClientId 由 buildSharedSnapshot 从 meta 取，不另传入参。
      const payload = buildSharedSnapshot({
        meta,
        messages,
        artifacts: collectArtifacts(meta.artifactIds),
      });
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceClientId: meta.id, title: meta.title, payload }),
      });
      if (!response.ok) {
        showToast(t("share.failed"));
        return;
      }
      const data = (await response.json()) as { url?: unknown };
      const url = typeof data.url === "string" ? data.url : "";
      if (!url || !(await copyToClipboard(url))) {
        showToast(t("share.failed"));
        return;
      }
      showToast(t("share.copied"));
    } catch {
      showToast(t("share.failed"));
    } finally {
      setCreating(false);
    }
  }, [activeSessionId, creating, messagesById, sessionsMeta, showToast, status, t]);

  return (
    <button
      type="button"
      onClick={() => { void handleShare(); }}
      disabled={creating}
      title={creating ? t("share.creating") : t("share.action")}
      aria-label={creating ? t("share.creating") : t("share.action")}
      aria-busy={creating || undefined}
      data-testid="share-conversation"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)] disabled:opacity-55"
    >
      <Share2 size={18} />
    </button>
  );
}
