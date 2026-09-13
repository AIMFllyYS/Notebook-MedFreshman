'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AgentLoopIcon, AgentTerminalIcon, AgentFileIcon, AgentChevronIcon, AgentAlertIcon, AgentArrowUpRightIcon, AgentQuoteIcon } from '@/components/icons/AgentIcons';
import { useArtifacts } from '@/lib/hooks/useArtifacts';
import { useSettings } from '@/lib/hooks/useSettings';
import { getModelInfoWithCustom, selectCustomApiGroupsForRequest } from '@/lib/ai/models';
import { parseSseJsonEvents } from '@/lib/utils/sseEvents';
import { MessageContent } from '@/components/chat/MessageContent';
import { useProcessingDisclosure } from '@/lib/hooks/useProcessingDisclosure';
import { openHtmlInNewTab } from '@/lib/utils/openHtmlInNewTab';

type ArtifactApiEvent =
  | { type: 'ping'; t?: number }
  | { type: 'artifact'; id: string; status: 'start'; title?: string }
  | { type: 'artifact'; id: string; status: 'reasoning'; delta?: string }
  | { type: 'artifact'; id: string; status: 'delta'; delta?: string }
  | { type: 'artifact'; id: string; status: 'done'; html?: string }
  | { type: 'artifact'; id: string; status: 'error'; message?: string };

/**
 * HTML 演示（Artifact）消息内卡片。链路入口见 lib/ai/agent/tools/renderInteractive/tool.ts。
 * 本文件只负责 SSE 生成与「打开演示」；真正的 iframe 浮窗在 ArtifactViewer（AppShell 全局层）。
 * 不要在 components/notes/ 或右侧面板里给演示再做一份组件。
 */
export default function ArtifactCard({
  artifactId,
  title: titleProp,
  prompt,
  modelId,
  unsupportedReason,
  autoStart = false,
}: {
  artifactId: string;
  title?: string;
  prompt?: string;
  modelId?: string;
  unsupportedReason?: string;
  autoStart?: boolean;
}) {
  const art = useArtifacts((s) => s.byId[artifactId]);
  const hydrated = useArtifacts((s) => s._hasHydrated);
  const saveDone = useArtifacts((s) => s.saveDone);
  const [status, setStatus] = useState<'idle' | 'streaming' | 'done' | 'error'>('idle');
  const [streamHtml, setStreamHtml] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);
  const startedRef = useRef(false);
  const [runId, setRunId] = useState(0);
  // 只取首帧 autoStart：主聊天结束导致 autoStart 翻转时，不中断或误标「数据缺失」。
  const [shouldAutoGen, setShouldAutoGen] = useState(autoStart);

  const title = titleProp || art?.title || '交互演示';
  const html = streamHtml || art?.html || '';
  const reasoningText = reasoning || art?.reasoning || '';
  const streaming = status === 'streaming';
  const preparing = shouldAutoGen && !art && status === 'idle';
  const restoring = !hydrated && !art && !shouldAutoGen && status === 'idle';
  const done = status === 'done' || art?.status === 'done';
  const errored = status === 'error';
  const expired = hydrated && !art && !streaming && !preparing && !done && !shouldAutoGen;
  const thinkingActive = streaming || preparing;
  const [showThinking, setShowThinking] = useProcessingDisclosure(thinkingActive);
  const showThinkingSection = thinkingActive || reasoningText.length > 0;

  // 流式时自动滚到底部
  useEffect(() => {
    if (showCode && preRef.current) preRef.current.scrollTop = preRef.current.scrollHeight;
  }, [html, showCode]);

  // artifact 一次性生成：startedRef 保证只发一次请求。
  // 关键：不在 cleanup 里 abort —— 否则 React StrictMode 的 setup→cleanup→setup 会掐断首个
  // 请求且因 startedRef 已置位而不再重发（dev 下「永远生成不出来」的真凶）；主聊天结束
  // (autoStart 翻转) 也会误中断尚在生成的演示。请求时长由服务端 12 分钟滑动超时收口。
  useEffect(() => {
    if (startedRef.current) return;
    if (!shouldAutoGen) return; // 历史消息里的旧卡片：不自动重生成
    if (art || !prompt) return;      // 已有产物 / prompt 尚未就绪
    startedRef.current = true;
    // 一次性进入流式态：本 effect 的职责就是把生成请求这一外部异步系统挂起来，
    // 同步置初始 UI 态是必要的且只发生一次（startedRef 守卫），非级联渲染反模式。
    /* eslint-disable react-hooks/set-state-in-effect */
    setStatus('streaming');
    setShowCode(false);
    setError(null);
    setStreamHtml('');
    setReasoning('');
    /* eslint-enable react-hooks/set-state-in-effect */

    const settings = useSettings.getState();
    const artifactModelId = modelId || settings.selectedModelId;
    const artifactModelInfo = getModelInfoWithCustom(artifactModelId, settings.customApiGroups);
    if (artifactModelInfo?.type === 'image') {
      setStatus('error');
      setError(unsupportedReason || '当前生图模型不支持 HTML 交互组件生成，请切换文本模型后重试。');
      return;
    }
    (async () => {
      try {
        const response = await fetch('/api/artifact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: artifactId,
            title,
            prompt,
            modelId: artifactModelId,
            customApiGroups: selectCustomApiGroupsForRequest(settings.customApiGroups, artifactModelId),
          }),
        });

        if (!response.ok) {
          throw new Error(`生成请求失败: ${response.status} ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('流读取失败');
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let htmlBuf = '';
        let reasoningBuf = '';
        let terminal = false;

        while (true) {
          const { done: streamDone, value } = await reader.read();
          if (streamDone) break;
          buffer += decoder.decode(value, { stream: true });
          const parsed = parseSseJsonEvents<ArtifactApiEvent>(buffer);
          buffer = parsed.remaining;

          for (const event of parsed.events) {
            if (event.type === 'ping') continue;
            if (event.type !== 'artifact' || event.id !== artifactId) continue;
            if (event.status === 'start') {
              setStatus('streaming');
            } else if (event.status === 'reasoning') {
              reasoningBuf += event.delta || '';
              setReasoning(reasoningBuf);
            } else if (event.status === 'delta') {
              htmlBuf += event.delta || '';
              setStreamHtml(htmlBuf);
              setShowCode(true);
            } else if (event.status === 'done') {
              terminal = true;
              const finalHtml = event.html || htmlBuf;
              htmlBuf = finalHtml;
              setStreamHtml(finalHtml);
              setStatus('done');
              setShowCode(true);
              saveDone(artifactId, title, finalHtml, reasoningBuf);
            } else if (event.status === 'error') {
              terminal = true;
              setStatus('error');
              setError(event.message || '交互演示生成失败');
            }
          }
        }
        if (!terminal) {
          setStatus('error');
          setError('生成中断，请重试');
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setStatus('error');
        setError(err instanceof Error ? err.message : '交互演示生成失败');
      }
    })();
  }, [artifactId, art, modelId, prompt, saveDone, title, unsupportedReason, runId, shouldAutoGen]);

  const openExternal = () => {
    if (!html) return;
    openHtmlInNewTab(html);
  };

  const codeChars = html.length;
  const onContainer = expired ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-primary-container)';

  return (
    <div
      className="artifact-card my-2 overflow-hidden rounded-xl border"
      data-testid="artifact-card"
      style={{
        borderColor: errored || expired ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-primary)',
        background: expired ? 'var(--md-sys-color-surface-container-high)' : 'var(--md-sys-color-primary-container)',
      }}
    >
      {/* 头部：状态 + 右上角常驻「打开演示」。必须 wrap，窄栏也不能把按钮裁掉。 */}
      <div className="artifact-card-header" data-testid="artifact-card-header">
        <div className="artifact-card-heading">
          {streaming || preparing ? (
            <AgentLoopIcon size={15} className="animate-pulse motion-reduce:animate-none shrink-0" style={{ color: 'var(--md-sys-color-primary)' }} />
          ) : errored || expired ? (
            <AgentAlertIcon size={15} className="shrink-0" style={{ color: 'var(--md-sys-color-error)' }} />
          ) : (
            <AgentTerminalIcon size={15} className="shrink-0" style={{ color: 'var(--md-sys-color-primary)' }} />
          )}
          <span
            className="min-w-0 flex-1 truncate text-[12.5px] font-semibold"
            style={{ color: onContainer }}
          >
            {streaming || preparing
              ? `正在生成交互演示：${title}…`
              : restoring
                ? `正在恢复交互演示：${title}…`
                : errored
                  ? '交互演示生成失败'
                  : expired
                    ? '交互演示数据缺失（可让助教重新生成）'
                    : `交互演示已就绪：${title}`}
          </span>
        </div>

        {(done || !!html) && !errored ? (
          <button
            type="button"
            data-testid="artifact-open-demo"
            onClick={() => {
              if (html) saveDone(artifactId, title, html, reasoningText);
              useArtifacts.getState().openViewer(artifactId);
            }}
            className="artifact-open-demo press inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold"
            style={{ background: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)' }}
          >
            <AgentTerminalIcon size={14} /> 打开演示
          </button>
        ) : null}
      </div>

      {prompt && (streaming || preparing || restoring || done) && (
        <div
          style={{
            borderBottom: '1px solid color-mix(in srgb, var(--md-sys-color-primary) 15%, transparent)',
          }}
        >
          <button
            type="button"
            data-testid="artifact-prompt-toggle"
            aria-expanded={showPrompt}
            onClick={() => setShowPrompt((v) => !v)}
            className="flex w-full items-center gap-1 px-3 py-1.5 text-left text-[11.5px] font-medium"
            style={{ color: onContainer, background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <AgentQuoteIcon size={13} className="shrink-0" />
            生成依据
            <AgentChevronIcon size={13} style={{ transform: showPrompt ? 'rotate(180deg)' : undefined }} />
          </button>
          {showPrompt && (
            <div
              data-testid="artifact-prompt-body"
              className="chat-prose px-3 pb-2 text-[11px]"
              style={{
                color: 'var(--md-sys-color-on-surface-variant)',
                background: 'color-mix(in srgb, var(--md-sys-color-primary) 6%, transparent)',
              }}
            >
              <MessageContent content={prompt} enableVisualizations={false} preserveLineBreaks />
            </div>
          )}
        </div>
      )}

      {showThinkingSection && (
        <div
          style={{
            borderBottom: '1px solid color-mix(in srgb, var(--md-sys-color-primary) 15%, transparent)',
          }}
        >
          <button
            type="button"
            data-testid="artifact-thinking-toggle"
            aria-expanded={showThinking}
            onClick={() => setShowThinking((v) => !v)}
            className="flex w-full items-center gap-1 px-3 py-1.5 text-left text-[11.5px] font-medium"
            style={{ color: onContainer, background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <AgentLoopIcon
              size={13}
              className={thinkingActive ? 'animate-pulse motion-reduce:animate-none' : undefined}
            />
            {thinkingActive ? '思考中' : '思考过程'}
            <AgentChevronIcon size={13} style={{ transform: showThinking ? 'rotate(180deg)' : undefined }} />
          </button>
          {showThinking && (
            <div
              data-testid="artifact-thinking-body"
              className="chat-prose max-h-48 overflow-auto px-3 pb-2 text-[11px] leading-relaxed"
              style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            >
              {reasoningText
                ? <MessageContent content={reasoningText} enableVisualizations={false} preserveLineBreaks />
                : '正在思考生成方案…'}
            </div>
          )}
        </div>
      )}

      {/* 生成进度（流式时）/ 代码切换条 */}
      {(streaming || preparing || restoring || done) && (
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
            <AgentFileIcon size={13} /> {showCode ? '隐藏源码' : '查看源码'}
            <AgentChevronIcon size={13} style={{ transform: showCode ? 'rotate(180deg)' : undefined }} />
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
              <AgentArrowUpRightIcon size={13} /> 新标签打开
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

      {(errored || expired) && (
        <div className="flex items-center gap-2 px-3 pb-3 text-[12px]" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
          <span className="min-w-0 flex-1">
            {errored
              ? (error || '该演示生成出错，可让助教重新生成，或改用文字讲解。')
              : '交互演示数据缺失（可重新生成，或让助教再调用一次）。'}
          </span>
          {prompt && (
            <button
              type="button"
              data-testid="artifact-retry"
              onClick={() => {
                startedRef.current = false;
                setShouldAutoGen(true);
                setStatus('idle');
                setError(null);
                setStreamHtml('');
                setReasoning('');
                setShowCode(false);
                setRunId((n) => n + 1);
              }}
              className="shrink-0 rounded-lg px-2 py-1 text-[11.5px] font-medium"
              style={{ background: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)', border: 'none', cursor: 'pointer' }}
            >
              重新生成
            </button>
          )}
        </div>
      )}
    </div>
  );
}
