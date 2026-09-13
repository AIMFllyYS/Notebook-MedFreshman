'use client';

import { useEffect, useState } from 'react';
import { useAuthSession } from '@/lib/hooks/useAuthSession';
import { fetchQuota } from '@/lib/billing/fetchQuota';
import { ACCOUNT_USAGE_CHANGED, type QuotaView } from '@/lib/billing/quotaView';

const TIERS = { free: '免费会员', plus: 'Plus 会员', pro: 'Pro 会员' };
const money = (n: number) => `¥${Math.max(0, n).toFixed(n > 0 && n < 0.01 ? 4 : 2)}`;

export function AccountQuota() {
  const { userId, status } = useAuthSession();
  const [state, setState] = useState<{ userId: string | null; data?: QuotaView; error?: string }>({ userId: null });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!userId) return;
    let disposed = false;
    let refreshing = false;
    const refresh = async () => {
      if (refreshing || document.visibilityState === 'hidden') return;
      refreshing = true;
      try {
        const data = await fetchQuota(userId);
        if (!disposed) setState({ userId, data });
      } catch (error) {
        if (!disposed) setState((old) => ({ userId, data: old.userId === userId ? old.data : undefined, error: error instanceof Error ? error.message : '额度暂不可用' }));
      } finally { refreshing = false; }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener(ACCOUNT_USAGE_CHANGED, refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      disposed = true;
      window.removeEventListener('focus', refresh);
      window.removeEventListener(ACCOUNT_USAGE_CHANGED, refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [userId, revision]);
  if (!userId) return <p className="text-[11px] text-[var(--ink-faint)]">{status === 'loading' ? '正在读取账户…' : '登录后查看会员与额度'}</p>;
  const data = state.userId === userId ? state.data : undefined;
  const error = state.userId === userId ? state.error : undefined;
  return <section aria-label="会员与额度" className="mb-3 border-b border-[var(--line)] pb-3">
    <div className="mb-2 flex items-center justify-between gap-2">
      <strong className="text-[12px] text-[var(--ink)]">{data ? TIERS[data.tier] : '会员与额度'}</strong>
      <button type="button" className="rounded px-2 py-1 text-[11px] text-[var(--accent-ink)] hover:bg-[var(--bg-muted)]" onClick={() => setRevision((n) => n + 1)}>刷新额度</button>
    </div>
    {data ? <>
      {(['platform', 'byok'] as const).map((key) => <div key={key} className="mb-2">
        <div className="flex justify-between gap-2 text-[11px]"><span>{key === 'platform' ? '平台模型额度' : '自备 API 辅助额度'}</span><strong className={data[key].remaining <= 0 ? 'text-[var(--md-sys-color-error)]' : ''}>{money(data[key].remaining)} <span className="font-normal text-[var(--ink-faint)]">/ {money(data[key].cap)}</span></strong></div>
        <progress aria-label={key === 'platform' ? '平台模型剩余额度' : '自备 API 辅助剩余额度'} className="mt-1 h-1 w-full accent-[var(--accent-ink)]" max={Math.max(1, data[key].cap)} value={Math.max(0, data[key].remaining)} />
      </div>)}
      <p className="text-[10px] leading-relaxed text-[var(--ink-faint)]">辅助额度用于平台提供的搜索等能力，不是外部 API 账户余额。<br />当前额度周期截至 {new Date(data.periodEnd).toLocaleDateString('zh-CN')}。</p>
      {error ? <p className="mt-1 text-[10px] text-[var(--ink-faint)]">上次更新：{new Date(data.updatedAt).toLocaleTimeString('zh-CN')}</p> : null}
    </> : !error ? <p role="status">正在读取额度…</p> : null}
    {error ? <p role="status" className="mt-1 text-[11px] text-[var(--md-sys-color-error)]">{error}</p> : null}
  </section>;
}
