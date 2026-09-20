"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Link2, Share2 } from "lucide-react";
import SpotlightDialog from "@/components/search/SpotlightDialog";
import { SPOTLIGHT_SEARCH_FIELD_CLASS } from "@/components/search/spotlightChrome";
import { copyTextToClipboard } from "@/lib/clipboard/copyText";
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";
import { useT } from "@/lib/i18n";

/**
 * 分享弹窗：确认 → 生成 → 复制，三态在同一块弹窗里走完。
 *
 * 为什么要确认这一步（用户口径）：分享是**不可逆的信息外流** —— 点一下就生成一个谁都能看的公开链接。
 * 所以先把「会分享出去什么」摊开讲清楚，再让用户按确认。
 *
 * 复制那块复用全局搜索的圆形框（~`SPOTLIGHT_SEARCH_FIELD_CLASS`~）：同一个容器形状、
 * 同样的「右侧一个动作按钮 + 就地反馈」，用户在两个地方看到的是同一套交互。
 *
 * 弹窗由父组件在打开时才挂载，所以状态天然是干净的，不需要在 effect 里复位。
 */
export default function ShareDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  /** 真正生成链接；返回 url。抛错 = 失败。 */
  onConfirm: () => Promise<string>;
}) {
  const t = useT();
  const [phase, setPhase] = useState<"confirm" | "creating" | "done">("confirm");
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  // Esc 关闭：与仓库其它弹层同一套栈（SpotlightDialog 自己不注册，交给内容决定要不要可关）。
  useOverlayRegistration({ id: "share-dialog", open: true, onClose: onClose, priority: 60 });

  useEffect(() => () => {
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
  }, []);

  const create = useCallback(async () => {
    setPhase("creating");
    setError(null);
    try {
      setUrl(await onConfirm());
      setPhase("done");
    } catch {
      setError(t("share.failed"));
      setPhase("confirm");
    }
  }, [onConfirm, t]);

  const copy = useCallback(async () => {
    if (!url) return;
    const ok = await copyTextToClipboard(url);
    if (!ok) return;
    setCopied(true);
    // 1.6 秒后退回「复制」：用户可以反复复制（用户口径 c）。
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => {
      copyTimerRef.current = null;
      setCopied(false);
    }, 1600);
  }, [url]);

  return (
    <SpotlightDialog
      open
      onClose={onClose}
      label={t("share.dialog.title")}
      icon={<Share2 size={16} className="shrink-0 text-[var(--ink-soft)]" />}
      input={
        phase === "done" ? (
          <div className={SPOTLIGHT_SEARCH_FIELD_CLASS} data-testid="share-link-field">
            <Link2 size={15} className="shrink-0 text-[var(--ink-soft)]" />
            <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--ink)]" title={url} data-testid="share-link">
              {url}
            </span>
            <button
              type="button"
              onClick={() => void copy()}
              title={copied ? t("share.dialog.copied") : t("share.dialog.copy")}
              aria-label={copied ? t("share.dialog.copied") : t("share.dialog.copy")}
              aria-live="polite"
              data-testid="share-link-copy"
              className="press flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-medium text-[var(--ink-soft)] hover:bg-[var(--bg-muted)] hover:text-[var(--ink)]"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? t("share.dialog.copied") : t("share.dialog.copy")}
            </button>
          </div>
        ) : (
          <span className="min-w-0 flex-1 truncate text-[15px] text-[var(--ink)]">{t("share.dialog.title")}</span>
        )
      }
    >
      <div className="p-4" data-testid="share-dialog-body">
        {phase === "done" ? (
          <>
            <p className="text-[13px] font-medium text-[var(--ink)]">{t("share.dialog.linkTitle")}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-[var(--ink-soft)]">{t("share.dialog.hint")}</p>
          </>
        ) : (
          <>
            <p className="text-[13px] leading-relaxed text-[var(--ink)]">{t("share.dialog.intro")}</p>
            <ul className="mt-3 flex flex-col gap-1.5 text-[12.5px] text-[var(--ink-soft)]">
              <li className="flex gap-2"><span aria-hidden>·</span><span>{t("share.dialog.itemText")}</span></li>
              <li className="flex gap-2"><span aria-hidden>·</span><span>{t("share.dialog.itemSources")}</span></li>
              <li className="flex gap-2"><span aria-hidden>·</span><span>{t("share.dialog.itemArtifacts")}</span></li>
            </ul>
            <p className="mt-3 rounded-lg bg-[var(--bg-muted)] px-3 py-2 text-[12px] leading-relaxed text-[var(--ink-soft)]">
              {t("share.dialog.warning")}
            </p>
            {error ? (
              <p role="alert" className="mt-3 text-[12px] text-[var(--md-sys-color-error)]">{error}</p>
            ) : null}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="press rounded-lg px-3 py-1.5 text-[12.5px] text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
              >
                {t("share.dialog.cancel")}
              </button>
              <button
                type="button"
                onClick={() => void create()}
                disabled={phase === "creating"}
                data-testid="share-dialog-confirm"
                className="press rounded-lg bg-[var(--accent)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--md-sys-color-on-primary)] disabled:opacity-55"
              >
                {phase === "creating" ? t("share.dialog.creating") : t("share.dialog.confirm")}
              </button>
            </div>
          </>
        )}
      </div>
    </SpotlightDialog>
  );
}
