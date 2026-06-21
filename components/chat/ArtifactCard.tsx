'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader, MonitorPlay, Code2, ChevronDown, ChevronUp, AlertTriangle, ExternalLink } from 'lucide-react';
import { useArtifacts } from '@/lib/hooks/useArtifacts';

/**
 * 消息内的交互演示卡片：直接挂在对话气泡里（用户视线所在处），而非顶部独立横幅。
 * - 生成中：实时流式显示 HTML 源码 + 进度，让用户看到“正在写代码”；
 * - 完成后：常驻、显眼的「打开演示」按钮（不会被折叠面板藏起来）。
 * 通过 artifactId 反应式订阅 useArtifacts —— 该 id 在工具调用伊始即下发，故全程可见。
 */
export default function ArtifactCard({ artifactId }: { artifactId: string }) {
  const art = useArtifacts((s) => s.byId[artifactId]);
  const openViewer = useArtifacts((s) => s.openViewer);
  const [showCode, setShowCode] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const status = art?.status;
  const streaming = status === 'streaming';
  const done = status === 'done';
  const errored = status === 'error';
  // artifact 已持久化到 IndexedDB：刷新后从存储恢复，不再"已失效"。
  // 仅在极旧消息（迁移前）或 prune 后才会 expired。
  const expired = !art;

  // 生成中默认展开源码以呈现“流式输出”；完成后默认收起，把焦点交给「打开演示」按钮。
  useEffect(() => {
    if (streaming) setShowCode(true);
    if (done) setShowCode(false);
  }, [streaming, done]);

  // 流式时自动滚到底部
  useEffect(() => {
    if (showCode && preRef.current) preRef.current.scrollTop = preRef.current.scrollHeight;
  }, [art?.html, showCode]);

  const openExternal = () => {
    if (!art?.html) return;
    const url = URL.createObjectURL(new Blob([art.html], { type: 'text/html' }));
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const title = art?.title || '交互演示';
  const codeChars = art?.html.length ?? 0;

  return (
    <div
      className="my-2 overflow-hidden rounded-xl border"
      style={{
        borderColor: errored || expired ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-primary)',
        background: expired ? 'var(--md-sys-color-surface-container-high)' : 'var(--md-sys-color-primary-container)',
      }}
    >
      {/* 头部：状态 + 主操作 */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
        {streaming ? (
          <Loader size={15} className="animate-spin shrink-0" style={{ color: 'var(--md-sys-color-primary)' }} />
        ) : errored || expired ? (
          <AlertTriangle size={15} className="shrink-0" style={{ color: 'var(--md-sys-color-error)' }} />
        ) : (
          <MonitorPlay size={15} className="shrink-0" style={{ color: 'var(--md-sys-color-primary)' }} />
        )}
        <span
          className="min-w-0 flex-1 truncate text-[12.5px] font-semibold"
          style={{ color: expired ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-primary-container)' }}
        >
          {streaming
            ? `正在生成交互演示：${title}…`
            : errored
              ? '交互演示生成失败'
              : expired
                ? '交互演示数据缺失（可让助教重新生成）'
                : `交互演示已就绪：${title}`}
        </span>

        {done && (
          <button
            type="button"
            onClick={() => openViewer(artifactId)}
            className="press inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold"
            style={{ background: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)' }}
          >
            <MonitorPlay size={14} /> 打开演示
          </button>
        )}
      </div>

      {/* 生成进度（流式时）/ 代码切换条 */}
      {(streaming || done) && (
        <div
          className="flex items-center gap-2 border-t px-3 py-1.5"
          style={{ borderColor: 'color-mix(in srgb, var(--md-sys-color-primary) 22%, transparent)' }}
        >
          <button
            type="button"
            onClick={() => setShowCode((v) => !v)}
            className="inline-flex items-center gap-1 text-[11.5px] font-medium"
            style={{ color: 'var(--md-sys-color-on-primary-container)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <Code2 size={13} /> {showCode ? '隐藏源码' : '查看源码'}
            {showCode ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <span className="text-[11px]" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            {streaming ? `生成中 · 已写入 ${codeChars} 字符` : `${codeChars} 字符`}
          </span>
          {done && (
            <button
              type="button"
              onClick={openExternal}
              title="在新标签页打开"
              className="ml-auto inline-flex items-center gap-1 text-[11.5px] font-medium"
              style={{ color: 'var(--md-sys-color-primary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <ExternalLink size={13} /> 新标签打开
            </button>
          )}
        </div>
      )}

      {/* 流式源码 */}
      {showCode && (streaming || done) && (
        <pre
          ref={preRef}
          className="hide-scrollbar m-0 max-h-[40vh] overflow-auto px-3 py-2 text-[11px] leading-relaxed"
          style={{
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            background: 'var(--md-sys-color-surface-container-lowest)',
            color: 'var(--md-sys-color-on-surface-variant)',
          }}
        >
          {art?.html || '正在生成 HTML…'}
        </pre>
      )}

      {errored && (
        <div className="px-3 pb-3 text-[12px]" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
          该演示生成出错，可让助教重新生成，或改用文字讲解。
        </div>
      )}
    </div>
  );
}
