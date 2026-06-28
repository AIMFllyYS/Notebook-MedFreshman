'use client';

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { Clock, AlertTriangle, X, Pin, RefreshCw, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTokenTracker } from '@/lib/hooks/useTokenTracker';
import { useFloatingTokenTracker } from '@/lib/hooks/useFloatingTokenTracker';
import { useSettings } from '@/lib/hooks/useSettings';
import { getModelInfoWithCustom } from '@/lib/ai/models';
import { useChatHistory } from '@/lib/hooks/useChatHistory';
import { estimateTokens } from '@/lib/context/estimateTokens';
import { useDraggable } from '@/lib/hooks/useDraggable';
import { Tooltip } from '@/components/ui/Tooltip';

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function fmtCost(yuan: number): string {
  if (yuan < 0.0001) return '¥0';
  if (yuan < 0.01) return `¥${yuan.toFixed(4)}`;
  return `¥${yuan.toFixed(2)}`;
}

function fmtDuration(sec: number): string {
  if (sec <= 0) return '已过期';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function calcCost(
  prompt: number, completion: number, cached: number,
  pricing?: { input: number; cachedInput: number; output: number },
): number {
  if (!pricing) return 0;
  const uncached = Math.max(0, prompt - cached);
  return (uncached * pricing.input + cached * pricing.cachedInput + completion * pricing.output) / 1_000_000;
}

// 上下文分项（IDE 式构成条）：键对应 ContextBreakdown，色值固定且明暗主题均可辨。
const BREAKDOWN_CATS: { key: 'tools' | 'skills' | 'pages' | 'webSearch' | 'conversation'; label: string; color: string }[] = [
  { key: 'tools', label: '系统提示词', color: '#8b5cf6' },
  { key: 'skills', label: '技能', color: '#ec4899' },
  { key: 'pages', label: '笔记页面', color: '#f59e0b' },
  { key: 'webSearch', label: '联网搜索', color: '#3b82f6' },
  { key: 'conversation', label: '对话', color: '#10b981' },
];

export default function TokenDashboard({ isLoading = false, floatingSessionId, modelId }: { isLoading?: boolean; floatingSessionId?: string; modelId?: string }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const [pos, setPos] = useState({ x: 0, y: 0 });
  // 拖动：rAF + transform（零重渲染），松手才提交。left 正向、bottom 反向（向上拖 = bottom 增大）。
  const { elRef, onPointerDown } = useDraggable((dx, dy) => setPos((p) => ({ x: p.x + dx, y: p.y - dy })));

  // 全局 tracker（主面板用）
  const gSessionTotal = useTokenTracker((s) => s.sessionTotal);
  const gLastTurn = useTokenTracker((s) => s.lastTurn);
  const gCtxTokens = useTokenTracker((s) => s.currentContextTokens);
  const gCtxLimit = useTokenTracker((s) => s.modelContextLimit);
  const gLastRequestTime = useTokenTracker((s) => s.lastRequestTime);
  const gBreakdown = useTokenTracker((s) => s.contextBreakdown);
  const gServerContextTokens = useTokenTracker((s) => s.serverContextTokens);

  // 浮窗 tracker（划词浮窗用，按 sessionId 隔离）
  const fData = useFloatingTokenTracker((s) => floatingSessionId ? (s.sessions[floatingSessionId] ?? null) : null);

  const sessionTotal = fData?.sessionTotal ?? gSessionTotal;
  const lastTurn = fData?.lastTurn ?? gLastTurn;
  const ctxTokens = fData?.currentContextTokens ?? gCtxTokens;
  const ctxLimit = fData?.modelContextLimit ?? gCtxLimit;
  const lastRequestTime = fData?.lastRequestTime ?? gLastRequestTime;
  const breakdown = fData?.contextBreakdown ?? gBreakdown;
  const serverContextTokens = fData?.serverContextTokens ?? gServerContextTokens;

  const globalSelectedModelId = useSettings((s) => s.selectedModelId);
  const customModels = useSettings((s) => s.customModels);
  const selectedModelId = modelId ?? globalSelectedModelId;
  const modelInfo = getModelInfoWithCustom(selectedModelId, customModels);
  const pricing = modelInfo?.pricing;
  const cacheTtlSec = modelInfo?.cacheTtlSec;

  // ── 上下文实时估算（前端先算，后端 usage 再覆盖为真值）+ 手动刷新 ──
  // 读 getState 不订阅 sessions，避免流式时整组件重渲染风暴。
  const recompute = useCallback(() => {
    const st = useChatHistory.getState();
    const sid = floatingSessionId ?? st.activeSessionId;
    const msgs = st.sessions.find((s) => s.id === sid)?.messages ?? [];
    const limit = (getModelInfoWithCustom(modelId ?? useSettings.getState().selectedModelId, useSettings.getState().customModels)?.contextK ?? 128) * 1000;

    const serverCtx = floatingSessionId
      ? useFloatingTokenTracker.getState().getSession(floatingSessionId).serverContextTokens
      : useTokenTracker.getState().serverContextTokens;

    const setCurrentContext = (tokens: number) => {
      if (floatingSessionId) {
        useFloatingTokenTracker.getState().setCurrentContext(floatingSessionId, tokens, limit);
      } else {
        useTokenTracker.getState().setCurrentContext(tokens, limit);
      }
    };

    if (serverCtx > 0) {
      const lastAssistantIdx = (() => {
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i].role === 'assistant') return i;
        }
        return -1;
      })();
      const newMsgs = lastAssistantIdx >= 0 ? msgs.slice(lastAssistantIdx + 1) : msgs;
      const newText = newMsgs
        .map((m) => (typeof m.content === 'string' ? m.content : JSON.stringify(m.content ?? '')))
        .join('');
      const newTokens = estimateTokens(newText);
      setCurrentContext(serverCtx + newTokens);
    } else {
      const text = msgs
        .map((m) => (typeof m.content === 'string' ? m.content : JSON.stringify(m.content ?? '')))
        .join('');
      const est = estimateTokens(text) + 3000;
      setCurrentContext(est);
    }
  }, [floatingSessionId, modelId]);

  // 始终定时刷新上下文估算（面板开关均运行），确保按钮数字实时更新。
  // 面板开时 2.5s 高频刷新（展开详情需要跟手）；关时 5s 低频刷新（仅更新按钮数字）。
  useEffect(() => {
    recompute();
    const interval = open ? 2500 : 5000;
    const id = setInterval(recompute, interval);
    return () => clearInterval(id);
  }, [open, recompute]);

  const ratio = ctxLimit > 0 ? ctxTokens / ctxLimit : 0;
  const pctText = `${Math.min(Math.round(ratio * 100), 999)}%`;
  const ringColor =
    ratio > 0.7 ? 'var(--md-sys-color-error)' :
    ratio > 0.4 ? '#f59e0b' :
    '#10b981';
  const barColor = ringColor;

  const turnCost = calcCost(lastTurn.promptTokens, lastTurn.completionTokens, lastTurn.cachedTokens, pricing);
  const totalCost = calcCost(sessionTotal.promptTokens, sessionTotal.completionTokens, sessionTotal.cachedTokens, pricing);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const pw = 280;
    let x = r.left;
    if (x + pw > window.innerWidth - 8) x = window.innerWidth - pw - 8;
    if (x < 8) x = 8;
    setPos({ x, y: window.innerHeight - r.top + 6 });
  }, [open]);

  useEffect(() => {
    if (!open || pinned) return;
    const onDown = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node) || elRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open, pinned, elRef]);

  const hasContextData = serverContextTokens > 0 || ctxTokens > 0;
  const RING_R = 14;
  const RING_C = 2 * Math.PI * RING_R;
  const ringDash = hasContextData ? `${Math.max(ratio, 0.02) * RING_C} ${RING_C}` : `0 ${RING_C}`;
  const iconSvg = hasContextData ? (
    <svg width="14" height="14" viewBox="0 0 32 32" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="16" cy="16" r={RING_R} fill="none" stroke={ringColor} strokeWidth="4" strokeOpacity={0.15} />
      <circle
        cx="16" cy="16" r={RING_R} fill="none"
        stroke={ringColor} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={ringDash}
        style={{ transition: 'stroke-dasharray 0.3s ease, stroke 0.3s ease' }}
      />
    </svg>
  ) : (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );

  return (
    <>
      <Tooltip
        content={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {isLoading && <Loader2 size={11} className="animate-spin" />}
            {pctText} ({fmtTokens(ctxTokens)} / {fmtTokens(ctxLimit)}) 上下文已使用
          </span>
        }
        placement="top"
      >
        <button
          ref={btnRef}
          onClick={() => setOpen((v) => !v)}
          className="press flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
        >
          {iconSvg}
          <span
            className="model-menu-label model-menu-label-full"
            style={hasContextData ? { color: ringColor, opacity: 0.85, transition: 'color 0.3s ease' } : undefined}
          >
            {fmtTokens(ctxTokens)}
          </span>
        </button>
      </Tooltip>

      {open && createPortal(
        <div
          ref={elRef}
          style={{
            position: 'fixed',
            left: pos.x,
            bottom: pos.y,
            width: 280,
            zIndex: 9999,
          }}
          className="rounded-xl border border-[var(--line)] bg-[var(--bg-panel)] shadow-lg animate-[dropdown-in_0.15s_ease-out]"
        >
          {/* Title bar — draggable */}
          <div
            onPointerDown={onPointerDown}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderBottom: '1px solid var(--line)',
              cursor: 'grab', userSelect: 'none', touchAction: 'none',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>上下文看板</span>
            <span style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => {
                  setRefreshing(true);
                  recompute();
                  setTimeout(() => setRefreshing(false), 600);
                }}
                title="刷新上下文估算"
                data-no-drag
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--ink-faint)' }}
              >
                <RefreshCw size={13} className={refreshing ? 'animate-spin' : undefined} />
              </button>
              <button
                onClick={() => setPinned((v) => !v)}
                title={pinned ? '取消固定' : '固定面板'}
                data-no-drag
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                  color: pinned ? 'var(--md-sys-color-primary)' : 'var(--ink-faint)',
                }}
              >
                <Pin size={13} style={{ transform: pinned ? 'rotate(-45deg)' : undefined }} />
              </button>
              <button
                onClick={() => { setOpen(false); setPinned(false); }}
                data-no-drag
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--ink-faint)' }}
              >
                <X size={13} />
              </button>
            </span>
          </div>

          <div style={{ padding: '10px 12px', fontSize: 11 }}>
            {/* Context usage bar */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'var(--ink-soft)' }}>
                <span>上下文使用</span>
                <span style={{ color: barColor, fontWeight: 600 }}>
                  {fmtTokens(ctxTokens)} / {fmtTokens(ctxLimit)} &nbsp;{pctText}
                </span>
              </div>
              <div style={{
                height: 6, borderRadius: 3,
                background: 'var(--bg-muted)', overflow: 'hidden',
              }}>
                <div style={{
                  width: `${Math.min(ratio * 100, 100)}%`,
                  height: '100%', borderRadius: 3,
                  background: barColor,
                  transition: 'width 0.3s ease, background 0.3s ease',
                }} />
              </div>
            </div>

            {/* Context composition (IDE 式分项构成) */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'var(--ink-soft)' }}>
                <span>上下文构成</span>
                <span style={{ fontWeight: 600 }}>{fmtTokens(breakdown?.total ?? 0)}</span>
              </div>
              <div style={{ display: 'flex', height: 8, borderRadius: 4, background: 'var(--bg-muted)', overflow: 'hidden' }}>
                {BREAKDOWN_CATS.map((c) => {
                  const v = breakdown?.[c.key] ?? 0;
                  const w = ctxLimit > 0 ? (v / ctxLimit) * 100 : 0;
                  if (w <= 0) return null;
                  return (
                    <div
                      key={c.key}
                      title={`${c.label} ${fmtTokens(v)}`}
                      style={{ width: `${w}%`, height: '100%', background: c.color, transition: 'width 0.3s ease' }}
                    />
                  );
                })}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 10px', marginTop: 6 }}>
                {BREAKDOWN_CATS.map((c) => {
                  const v = breakdown?.[c.key] ?? 0;
                  const total = breakdown?.total ?? 0;
                  const pct = total > 0 ? Math.round((v / total) * 100) : 0;
                  return (
                    <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--ink-soft)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                      <span>{c.label}</span>
                      <span style={{ color: 'var(--ink-faint)', fontVariantNumeric: 'tabular-nums' }}>
                        {fmtTokens(v)}·{pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Last turn */}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 8, marginBottom: 8 }}>
              <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>本轮对话</div>
              <Row label="输入 token" value={fmtTokens(lastTurn.promptTokens)} />
              <Row label="输出 token" value={fmtTokens(lastTurn.completionTokens)} />
              <Row label="缓存命中" value={fmtTokens(lastTurn.cachedTokens)} />
              {pricing && <Row label="本轮费用" value={fmtCost(turnCost)} accent />}
            </div>

            {/* Prefix cache countdown — 隔离到子组件，其每秒 tick 不再重渲整个看板 */}
            <CacheCountdown
              cacheTtlSec={cacheTtlSec}
              lastRequestTime={lastRequestTime}
              pricing={pricing}
              lastTurn={lastTurn}
              turnCost={turnCost}
            />

            {/* Session total */}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 8 }}>
              <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>会话累计</div>
              <Row label="总输入" value={fmtTokens(sessionTotal.promptTokens)} />
              <Row label="总输出" value={fmtTokens(sessionTotal.completionTokens)} />
              {pricing && <Row label="累计费用" value={fmtCost(totalCost)} accent />}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', padding: '1.5px 0',
      color: accent ? 'var(--md-sys-color-primary)' : 'var(--ink-soft)',
    }}>
      <span>{label}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: accent ? 600 : 400 }}>{value}</span>
    </div>
  );
}

// Prefix cache 倒计时：自带每秒 tick，隔离重渲染范围（不影响外层看板）。
function CacheCountdown({
  cacheTtlSec, lastRequestTime, pricing, lastTurn, turnCost,
}: {
  cacheTtlSec?: number;
  lastRequestTime?: number | null;
  pricing?: { input: number; cachedInput: number; output: number };
  lastTurn: { promptTokens: number; completionTokens: number; cachedTokens: number };
  turnCost: number;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!lastRequestTime || !cacheTtlSec) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [lastRequestTime, cacheTtlSec]);

  if (!cacheTtlSec || !lastRequestTime) {
    return (
      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 8, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <Clock size={11} style={{ color: 'var(--ink-faint)' }} />
          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>缓存倒计时</span>
          <span style={{ fontSize: 9, color: 'var(--ink-faint)', fontWeight: 400 }}>估算</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, color: 'var(--ink-soft)' }}>
          <span>剩余时间</span>
          <span style={{ color: 'var(--ink-faint)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>0s</span>
        </div>
        <div style={{ height: 5, borderRadius: 2.5, background: 'var(--bg-muted)', overflow: 'hidden' }}>
          <div style={{ width: '0%', height: '100%', borderRadius: 2.5, background: 'var(--ink-faint)' }} />
        </div>
        <div style={{ fontSize: 9, color: 'var(--ink-faint)', marginTop: 3, lineHeight: 1.3 }}>
          等待首次对话
        </div>
      </div>
    );
  }

  const cacheElapsed = (now - lastRequestTime) / 1000;
  const cacheRemaining = Math.max(0, cacheTtlSec - cacheElapsed);
  const cacheExpired = cacheRemaining <= 0;
  const cacheRatio = cacheRemaining / cacheTtlSec;
  const cacheBarColor =
    cacheExpired ? 'var(--md-sys-color-error)' :
    cacheRatio < 0.2 ? 'var(--md-sys-color-error)' :
    cacheRatio < 0.5 ? 'var(--md-sys-color-tertiary)' :
    'var(--md-sys-color-primary)';

  return (
    <div style={{ borderTop: '1px solid var(--line)', paddingTop: 8, marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
        <Clock size={11} style={{ color: 'var(--ink-faint)' }} />
        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>缓存倒计时</span>
        <span style={{ fontSize: 9, color: 'var(--ink-faint)', fontWeight: 400 }}>估算</span>
      </div>
      {cacheExpired ? (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 4,
          padding: '4px 6px', borderRadius: 4,
          background: 'color-mix(in srgb, var(--md-sys-color-error) 12%, transparent)',
          color: 'var(--md-sys-color-error)', fontSize: 10, lineHeight: 1.4,
        }}>
          <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            缓存可能已过期，下次请求将按全价计费
            {pricing && lastTurn.cachedTokens > 0 && (
              <strong>（约 {fmtCost(calcCost(lastTurn.promptTokens, lastTurn.completionTokens, 0, pricing) - turnCost)} 更贵）</strong>
            )}
          </span>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, color: 'var(--ink-soft)' }}>
            <span>剩余时间</span>
            <span style={{ color: cacheBarColor, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {fmtDuration(cacheRemaining)}
            </span>
          </div>
          <div style={{ height: 5, borderRadius: 2.5, background: 'var(--bg-muted)', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.max(cacheRatio * 100, 0)}%`,
              height: '100%', borderRadius: 2.5,
              background: cacheBarColor,
              transition: 'width 1s linear, background 0.3s ease',
            }} />
          </div>
          <div style={{ fontSize: 9, color: 'var(--ink-faint)', marginTop: 3, lineHeight: 1.3 }}>
            过期后输入价格将从 {pricing ? `¥${pricing.cachedInput}` : '—'} → {pricing ? `¥${pricing.input}` : '—'} /百万token
          </div>
        </>
      )}
    </div>
  );
}
