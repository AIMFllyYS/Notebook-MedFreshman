"use client";
import { notifyAccountUsageChanged } from '@/lib/billing/quotaView';

import { useEffect, useState } from "react";
import { Cloud, DollarSign, Download, Ticket } from "lucide-react";
import { UsageProgressBar } from "@/components/chat/UsageProgressBar";
import { useSettings } from "@/lib/hooks/useSettings";
import { useAuthSession } from "@/lib/hooks/useAuthSession";
import { exportAllChats } from "@/lib/chat/exportChats";
import { exportAgentLogs } from "@/lib/ai/observability/downloadAgentLog";
import { getCachedCloudSyncUsage, loadCloudSyncUsage } from "@/lib/sync/engine";
import { clearCloudSyncMessage, useCloudSyncStatus } from "@/lib/sync/status";
import { MAX_USER_SYNC_BYTES } from "@/lib/sync/types";
import { formatSyncBytes, type CloudSyncUsage } from "@/lib/sync/usage";
import { h3Cls, inputCls } from "./_shared";

export function RedemptionSection() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <Ticket size={14} className="text-[var(--md-sys-color-primary)]" />
        <h3 className={h3Cls}>兑换码</h3>
      </div>
      <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
        输入兑换码升级档位。失败不会提示该码是否存在。
      </p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="输入兑换码"
          aria-label="兑换码"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={`${inputCls} flex-1`}
        />
        <button
          type="button"
          disabled={busy || !code.trim()}
          onClick={() => {
            const submitted = code.trim();
            setBusy(true);
            setMessage(null);
            setOk(false);
            void fetch("/api/redeem", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: submitted }),
            })
              .then(async (res) => {
                const body = (await res.json().catch(() => null)) as { error?: string; tier?: string } | null;
                if (!res.ok) {
                  setOk(false);
                  setMessage(typeof body?.error === "string" ? body.error : "兑换失败，请检查兑换码后重试。");
                  return;
                }
                setOk(true);
                notifyAccountUsageChanged();
                setCode("");
                setMessage(body?.tier ? `已兑换为 ${body.tier.toUpperCase()} 档` : "兑换成功");
              })
              .catch(() => {
                setOk(false);
                setMessage("兑换失败，请检查兑换码后重试。");
              })
              .finally(() => setBusy(false));
          }}
          className="press shrink-0 rounded-lg bg-[var(--md-sys-color-primary)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--md-sys-color-on-primary)] disabled:opacity-50"
        >
          {busy ? "兑换中…" : "兑换"}
        </button>
      </div>
      {message && (
        <span
          className="text-[11px] font-medium"
          style={{
            color: ok ? "var(--md-sys-color-primary)" : "var(--md-sys-color-error)",
          }}
        >
          {message}
        </span>
      )}
    </section>
  );
}

export function BillingSection() {
  const usdExchangeRate = useSettings((s) => s.usdExchangeRate);
  const setUsdExchangeRate = useSettings((s) => s.setUsdExchangeRate);

  return (
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-[var(--md-sys-color-primary)]" />
          <h3 className={h3Cls}>计费与汇率</h3>
        </div>
        <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
          计费大盘中支持翻转卡片将人民币 (¥) 切换为美元 ($)。你可以在这里自定义兑换汇率。
        </p>
        <div className="flex items-center justify-between rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2">
          <div className="text-[12.5px] font-medium text-[var(--md-sys-color-on-surface)]">
            美元汇率 (USD/CNY)
          </div>
          <input
            type="number"
            min={0.01}
            max={10.00}
            step={0.01}
            value={usdExchangeRate || ""}
            onBlur={(e) => {
              const val = parseFloat(e.target.value);
              setUsdExchangeRate(Number.isNaN(val) ? 7.00 : val);
            }}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!Number.isNaN(v)) setUsdExchangeRate(v);
            }}
            className="w-20 rounded border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] px-2 py-1 text-right text-[12.5px] outline-none focus:border-[var(--md-sys-color-primary)]"
          />
        </div>
      </section>
  );
}

export function CloudSyncSection() {
  const { status } = useAuthSession();
  const cloudSync = useCloudSyncStatus();
  const signedIn = status === "signedIn";
  const limitMb = Math.round((MAX_USER_SYNC_BYTES / (1024 * 1024)) * 10) / 10;
  const [usage, setUsage] = useState<CloudSyncUsage | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const cached = getCachedCloudSyncUsage();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (cached) setUsage(cached);
    void loadCloudSyncUsage().then((next) => {
      if (!cancelled) setUsage(next);
    });
    return () => {
      cancelled = true;
    };
  }, [signedIn, cloudSync.phase, revision]);

  const title = usage?.source === "local" ? "本机可同步占用" : "云端已用";
  const limitBytes = usage?.limitBytes ?? MAX_USER_SYNC_BYTES;
  const totalBytes = usage?.totalBytes ?? 0;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <Cloud size={14} className="text-[var(--md-sys-color-primary)]" />
        <h3 className={h3Cls}>云端同步</h3>
      </div>
      <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
        登录后同步对话文本、演示 HTML 和长文档。用户上传的图片与 PDF 不上云。工具读过的笔记以摘要同步，全文在教材包。生图会话和 API 密钥不会上传。
        单用户上限约 {limitMb} MB；超限时本机仍保留，并在对话区提示。
      </p>
      <div className="rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-2">
        {!usage ? (
          <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">正在统计占用…</p>
        ) : (
          <>
            <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px]">
              <span className="text-[var(--md-sys-color-on-surface)]">{title}</span>
              <div className="flex items-center gap-2">
                <strong className="text-[var(--md-sys-color-on-surface)]">
                  {formatSyncBytes(totalBytes)}{" "}
                  <span className="font-normal text-[var(--md-sys-color-on-surface-variant)]">
                    / {formatSyncBytes(limitBytes)}
                  </span>
                </strong>
                <button
                  type="button"
                  className="text-[11px] text-[var(--md-sys-color-primary)]"
                  onClick={() => setRevision((n) => n + 1)}
                >
                  刷新占用
                </button>
              </div>
            </div>
            <UsageProgressBar
              ratio={limitBytes > 0 ? totalBytes / limitBytes : 0}
              ariaLabel={title}
            />
            <div className="mt-2 flex flex-col gap-1.5">
              {usage.kinds.map((row) => (
                <div key={row.kind}>
                  <div className="mb-1 flex justify-between gap-2 text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                    <span>
                      {row.label}
                      {row.count > 0 ? ` · ${row.count} ${row.unit}` : ""}
                    </span>
                    <strong className="font-medium text-[var(--md-sys-color-on-surface)]">
                      {formatSyncBytes(row.bytes)}
                    </strong>
                  </div>
                  <UsageProgressBar
                    ratio={totalBytes > 0 ? row.bytes / totalBytes : 0}
                    ariaLabel={`${row.label}占用`}
                    height={4}
                  />
                </div>
              ))}
            </div>
            {usage.error ? (
              <p className="mt-1.5 text-[10px] text-[var(--md-sys-color-error)]">{usage.error}</p>
            ) : (
              <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
                {signedIn
                  ? "占用按同步后的对话、演示与文档合计，不含用户上传的图片与 PDF。"
                  : "未登录时按本机将同步的内容估算，登录后改为云端实际占用。"}
              </p>
            )}
          </>
        )}
      </div>
      <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
        {signedIn ? "已登录，换设备后可拉回历史对话与产物。" : "未登录时数据只留在本机。"}
      </p>
      {cloudSync.message ? (
        <div className="flex items-start justify-between gap-2">
          <span
            className="text-[11px] font-medium"
            style={{
              color: cloudSync.phase === "error"
                ? "var(--md-sys-color-error)"
                : "var(--md-sys-color-primary)",
            }}
          >
            {cloudSync.message}
          </span>
          <button
            type="button"
            className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]"
            onClick={clearCloudSyncMessage}
          >
            关闭
          </button>
        </div>
      ) : null}
    </section>
  );
}

export function ExportSection() {
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [logExportMsg, setLogExportMsg] = useState<string | null>(null);

  return (
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <Download size={14} className="text-[var(--md-sys-color-primary)]" />
          <h3 className={h3Cls}>数据</h3>
        </div>
        <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
          把全部聊天记录（主对话 + 划词）导出为本地 JSON 文件备份。仅保存到你选择的位置，绝不上传任何服务器。
        </p>
        <button
          onClick={() => {
            void exportAllChats().then((r) => {
              setExportMsg(r.ok ? `已导出 ${r.count} 个会话` : "暂无可导出的聊天数据");
            });
          }}
          className="press flex items-center gap-1.5 self-start rounded-lg bg-[var(--md-sys-color-primary)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--md-sys-color-on-primary)]"
        >
          <Download size={13} /> 导出所有聊天数据
        </button>
        {exportMsg && (
          <span className="text-[11px] font-medium text-[var(--md-sys-color-primary)]">
            {exportMsg}
          </span>
        )}
        <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
          导出已落盘的 Agent 生命周期日志，保持原始 JSONL，不做清洗。
        </p>
        <button
          type="button"
          aria-label="导出全部日志"
          onClick={() => {
            void exportAgentLogs().then((r) => {
              setLogExportMsg(r.ok ? (r.empty ? "暂无日志" : "已导出") : (r.error ?? "导出失败"));
            });
          }}
          className="press flex items-center gap-1.5 self-start rounded-lg bg-[var(--md-sys-color-primary)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--md-sys-color-on-primary)]"
        >
          <Download size={13} /> 导出全部日志
        </button>
        {logExportMsg && (
          <span className="text-[11px] font-medium text-[var(--md-sys-color-primary)]">
            {logExportMsg}
          </span>
        )}
      </section>
  );
}
