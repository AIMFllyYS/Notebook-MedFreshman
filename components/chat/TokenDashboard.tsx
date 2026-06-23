'use client';

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { X, Pin } from 'lucide-react';
import { useTokenTracker } from '@/lib/hooks/useTokenTracker';
import { useSettings } from '@/lib/hooks/useSettings';
import { getModelInfo } from '@/lib/ai/models';

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

export default function TokenDashboard() {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const sessionTotal = useTokenTracker((s) => s.sessionTotal);
  const lastTurn = useTokenTracker((s) => s.lastTurn);
  const ctxTokens = useTokenTracker((s) => s.currentContextTokens);
  const ctxLimit = useTokenTracker((s) => s.modelContextLimit);
  const lastRequestTime = useTokenTracker((s) => s.lastRequestTime);
  const breakdown = useTokenTracker((s) => s.contextBreakdown);

  const selectedModelId = useSettings((s) => s.selectedModelId);
  const modelInfo = getModelInfo(selectedModelId);
  const pricing = modelInfo?.pricing;
  const cacheTtlSec = modelInfo?.cacheTtlSec;

  // ── Prefix cache 倒计时 ──
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!open || !lastRequestTime || !cacheTtlSec) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [open, lastRequestTime, cacheTtlSec]);

  const cacheElapsed = lastRequestTime && cacheTtlSec ? (now - lastRequestTime) / 1000 : 0;
  const cacheRemaining = lastRequestTime && cacheTtlSec ? Math.max(0, cacheTtlSec - cacheElapsed) : null;
  const cacheExpired = cacheRemaining !== null && cacheRemaining <= 0;
  const cacheRatio = cacheTtlSec && cacheRemaining !== null ? cacheRemaining / cacheTtlSec : 0;
  const cacheBarColor =
    cacheExpired ? 'var(--md-sys-color-error)' :
    cacheRatio < 0.2 ? 'var(--md-sys-color-error)' :
    cacheRatio < 0.5 ? 'var(--md-sys-color-tertiary)' :
    'var(--md-sys-color-primary)';

  const ratio = ctxLimit > 0 ? ctxTokens / ctxLimit : 0;
  const pctText = `${Math.min(Math.round(ratio * 100), 999)}%`;
  const barColor =
    ratio >= 1 ? 'var(--md-sys-color-error)' :
    ratio >= 0.8 ? 'var(--md-sys-color-tertiary)' :
    'var(--md-sys-color-primary)';

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
      if (btnRef.current?.contains(e.target as Node) || panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open, pinned]);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setPos({
        x: dragRef.current.origX + (ev.clientX - dragRef.current.startX),
        y: dragRef.current.origY - (ev.clientY - dragRef.current.startY),
      });
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [pos]);

  const iconSvg = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        title="上下文看板"
        className="press flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
      >
        {iconSvg}
        <span className="model-menu-label model-menu-label-full">{fmtTokens(ctxTokens)}</span>
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
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
            onMouseDown={handleDragStart}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderBottom: '1px solid var(--line)',
              cursor: 'grab', userSelect: 'none',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>上下文看板</span>
            <span style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setPinned((v) => !v)}
                title={pinned ? '取消固定' : '固定面板'}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                  color: pinned ? 'var(--md-sys-color-primary)' : 'var(--ink-faint)',
                }}
              >
                <Pin size={13} style={{ transform: pinned ? 'rotate(-45deg)' : undefined }} />
              </button>
              <button
                onClick={() => { setOpen(false); setPinned(false); }}
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
            {breakdown && breakdown.total > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'var(--ink-soft)' }}>
                  <span>上下文构成</span>
                  <span style={{ fontWeight: 600 }}>{fmtTokens(breakdown.total)}</span>
                </div>
                <div style={{ display: 'flex', height: 8, borderRadius: 4, background: 'var(--bg-muted)', overflow: 'hidden' }}>
                  {BREAKDOWN_CATS.map((c) => {
                    const v = breakdown[c.key];
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
                    const v = breakdown[c.key];
                    const pct = breakdown.total > 0 ? Math.round((v / breakdown.total) * 100) : 0;
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
            )}

            {/* Last turn */}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 8, marginBottom: 8 }}>
              <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>本轮对话</div>
              <Row label="输入 token" value={fmtTokens(lastTurn.promptTokens)} />
              <Row label="输出 token" value={fmtTokens(lastTurn.completionTokens)} />
              <Row label="缓存命中" value={fmtTokens(lastTurn.cachedTokens)} />
              {pricing && <Row label="本轮费用" value={fmtCost(turnCost)} accent />}
            </div>

            {/* Prefix cache countdown */}
            {cacheTtlSec && lastRequestTime && (
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
                        {fmtDuration(cacheRemaining!)}
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
            )}

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
