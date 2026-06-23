'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader, MonitorPlay, Code2, ChevronDown, ChevronUp, AlertTriangle, ExternalLink } from 'lucide-react';
import { useArtifacts } from '@/lib/hooks/useArtifacts';
import { useSettings } from '@/lib/hooks/useSettings';
import { CUSTOM_MODEL_ID } from '@/lib/ai/models';
import { parseSseJsonEvents } from '@/lib/utils/sseEvents';

/**
 * 消息内的交互演示卡片：直接挂在对话气泡里（用户视线所在处），而非顶部独立横幅。
 * - 生成中：实时流式显示 HTML 源码 + 进度，让用户看到"正在写代码"；
 * - 完成后：常驻、显眼的「打开演示」按钮（不会被折叠面板藏起来）。
 * artifact HTML 通过独立 /api/artifact SSE 流生成，完成后才持久化到 useArtifacts。
 */
export default function ArtifactCard({
  artifactId,
  title: titleProp,
  prompt,
  autoStart = false,
}: {
  artifactId: string;
  title?: string;
  prompt?: string;
  autoStart?: boolean;
}) {
  const art = useArtifacts((s) => s.byId[artifactId]);
  const openViewer = useArtifacts((s) => s.openViewer);
  const saveDone = useArtifacts((s) => s.saveDone);
  const [status, setStatus] = useState<'idle' | 'streaming' | 'done' | 'error'>('idle');
  const [streamHtml, setStreamHtml] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(autoStart);
  const preRef = useRef<HTMLPreElement>(null);
  const startedRef = useRef(false);

  const title = titleProp || art?.title || '交互演示';
  const html = streamHtml || art?.html || '';
  const streaming = status === 'streaming';
  const preparing = autoStart && !art && status === 'idle';
  const done = status === 'done' || art?.status === 'done';
  const errored = status === 'error';
  const expired = !art && !streaming && !preparing && !done && !autoStart;

  // 流式时自动滚到底部
  useEffect(() => {
    if (showCode && preRef.current) preRef.current.scrollTop = preRef.current.scrollHeight;
  }, [html, showCode]);

  useEffect(() => {
    if (!autoStart || startedRef.current || art || !prompt) return;
    const abortController = new AbortController();
    startedRef.current = true;
    setStatus('streaming');
    setShowCode(true);
    setError(null);
    setStreamHtml('');

    const settings = useSettings.getState();
    const isCustom = settings.selectedModelId === CUSTOM_MODEL_ID;

    (async () => {
      try {
        const response = await fetch('/api/artifact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: artifactId,
            title,
            prompt,
            modelId: settings.selectedModelId,
            customProvider: isCustom
              ? { baseUrl: settings.customBaseUrl, apiKey: settings.customApiKey, model: settings.customModelId }
              : undefined,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`生成请求失败: ${response.status} ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('流读取失败');
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let htmlBuf = '';

        while (true) {
          const { done: streamDone, value } = await reader.read();
          if (streamDone) break;
          buffer += decoder.decode(value, { stream: true });
          const parsed = parseSseJsonEvents(buffer);
          buffer = parsed.remaining;

          for (const event of parsed.events) {
            if (event.type === 'ping') continue;
            if (event.type !== 'artifact' || event.id !== artifactId) continue;
            if (event.status === 'start') {
              setStatus('streaming');
              setShowCode(true);
            } else if (event.status === 'delta') {
              htmlBuf += event.delta || '';
              setStreamHtml(htmlBuf);
            } else if (event.status === 'done') {
              const finalHtml = event.html || htmlBuf;
              htmlBuf = finalHtml;
              setStreamHtml(finalHtml);
              setStatus('done');
              setShowCode(true);
              saveDone(artifactId, title, finalHtml);
            } else if (event.status === 'error') {
              setStatus('error');
              setError(event.message || '交互演示生成失败');
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setStatus('error');
        setError(err instanceof Error ? err.message : '交互演示生成失败');
      }
    })();

    return () => abortController.abort();
  }, [artifactId, art, autoStart, prompt, saveDone, title]);

  const openExternal = () => {
    if (!html) return;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const codeChars = html.length;

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
        {streaming || preparing ? (
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
          {streaming || preparing
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

      {/* 生成依据（prompt 参数展示） */}
      {prompt && (streaming || preparing || done) && (
        <div
          className="px-3 py-1.5 text-[11px]"
          style={{
            color: 'var(--md-sys-color-on-surface-variant)',
            background: 'color-mix(in srgb, var(--md-sys-color-primary) 6%, transparent)',
            borderBottom: '1px solid color-mix(in srgb, var(--md-sys-color-primary) 15%, transparent)',
          }}
        >
          <span style={{ fontWeight: 600 }}>生成依据：</span>
          {prompt}
        </div>
      )}

      {/* 生成进度（流式时）/ 代码切换条 */}
      {(streaming || preparing || done) && (
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
            {streaming || preparing ? `生成中 · 已写入 ${codeChars} 字符` : `${codeChars} 字符`}
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
      {showCode && (streaming || preparing || done) && (
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
          {html || '正在生成 HTML…'}
        </pre>
      )}

      {errored && (
        <div className="px-3 pb-3 text-[12px]" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
          {error || '该演示生成出错，可让助教重新生成，或改用文字讲解。'}
        </div>
      )}
    </div>
  );
}
