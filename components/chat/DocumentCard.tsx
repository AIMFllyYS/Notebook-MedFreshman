'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDocuments, getDocumentMarkdown } from '@/lib/hooks/useDocuments';
import { useSettings } from '@/lib/hooks/useSettings';
import { getModelInfoWithCustom, selectCustomApiGroupsForRequest } from '@/lib/ai/models';
import { parseSseJsonEvents } from '@/lib/utils/sseEvents';
import type { DocumentApiEvent, DocumentSpec, DocumentSection } from '@/lib/documents/types';
import { AgentDocumentIcon, AgentAlertIcon, AgentArrowUpRightIcon } from '@/components/icons/AgentIcons';

interface DocumentCardProps {
  documentId: string;
  spec: DocumentSpec;
  modelId?: string;
  unsupportedReason?: string;
  autoStart?: boolean;
}

export default function DocumentCard({ documentId, spec, modelId, unsupportedReason, autoStart = false }: DocumentCardProps) {
  const doc = useDocuments((s) => s.byId[documentId]);
  const { create, openViewer, setSections, setSectionStatus, setSectionMarkdown, setStatus } = useDocuments();
  const [reasoning, setReasoning] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const startedRef = useRef(false);
  // 只取首帧 autoStart：主聊天结束导致 autoStart 翻转时，不中断正在生成的文档。
  const [shouldAutoGen] = useState(autoStart);

  useEffect(() => {
    if (startedRef.current) return;
    if (!shouldAutoGen) return;
    const existing = useDocuments.getState().byId[documentId];
    if (existing?.status === 'done' || existing?.status === 'error') return;
    startedRef.current = true;
    if (!existing) create(documentId, spec, modelId);

    const settings = useSettings.getState();
    const docModelId = modelId || settings.selectedModelId;
    const docModelInfo = getModelInfoWithCustom(docModelId, settings.customApiGroups);
    if (docModelInfo?.type === 'image') {
      /* eslint-disable react-hooks/set-state-in-effect */
      setStatus(documentId, 'error', unsupportedReason || '当前生图模型不支持长文档撰写，请切换文本模型后重试。');
      setError(unsupportedReason || '当前生图模型不支持长文档撰写。');
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }
    const customApiGroups = selectCustomApiGroupsForRequest(settings.customApiGroups, docModelId);

    setGenerating(true);

    // 不在 cleanup 里 abort：create() 会写入 store，若 effect 依赖 doc 会 setup→cleanup→setup，
    // 把首个请求掐掉且 startedRef 已置位，进度永远停在 0/N（与 ArtifactCard 同一类坑）。
    const run = async () => {
      try {
        setStatus(documentId, 'outlining');

        const outlineRes = await fetch('/api/document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: documentId,
            spec,
            modelId: docModelId,
            phase: 'outline',
            customApiGroups,
          }),
        });
        if (!outlineRes.ok) throw new Error(`大纲请求失败: ${outlineRes.status}`);
        const outline = await consumeOutline(outlineRes, documentId, (r) => setReasoning(r));
        if (!outline.length) throw new Error('未能生成章节大纲');

        setSections(documentId, outline.map((o) => ({ ...o, status: 'pending' })));
        setStatus(documentId, 'writing');

        for (let i = 0; i < outline.length; i++) {
          const previousMarkdown = getDocumentMarkdown(documentId) || '';
          const sectionRes = await fetch('/api/document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: documentId,
              spec,
              modelId: docModelId,
              phase: 'section',
              outline,
              sectionIndex: i,
              previousMarkdown,
              customApiGroups,
            }),
          });
          if (!sectionRes.ok) throw new Error(`第 ${i + 1} 节请求失败: ${sectionRes.status}`);
          await consumeSection(sectionRes, documentId, i, setSectionStatus, setSectionMarkdown);
        }

        setStatus(documentId, 'done');
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : '文档生成失败';
        setStatus(documentId, 'error', message);
        setError(message);
      } finally {
        setGenerating(false);
      }
    };

    void run();
  }, [documentId, spec, modelId, shouldAutoGen, create, setSections, setSectionStatus, setSectionMarkdown, setStatus, unsupportedReason]);

  if (unsupportedReason) {
    return (
      <div className="my-3 rounded-2xl border border-[var(--md-sys-color-error)] bg-[var(--md-sys-color-error-container)] p-3 text-[13px] text-[var(--md-sys-color-on-error-container)]">
        <div className="flex items-center gap-2 font-semibold">
          <AgentAlertIcon size={16} />
          无法撰写长文档
        </div>
        <div className="mt-1 opacity-90">{unsupportedReason}</div>
      </div>
    );
  }

  const inFlight = generating;
  const isStreaming = inFlight;
  const done = doc?.status === 'done';
  const errored = doc?.status === 'error' || error;
  const progressText = doc ? `${doc.sections.filter((s) => s.status === 'done' || s.status === 'streaming').length} / ${doc.sections.length} 节` : '';

  return (
    <div className="my-3 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] p-3">
      <div className="flex items-center gap-2">
        <AgentDocumentIcon size={18} className={isStreaming ? 'animate-pulse' : ''} />
        <span className="text-[13px] font-semibold text-[var(--md-sys-color-on-surface)] truncate">{spec.title}</span>
        <span className="ml-auto text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
          {isStreaming ? progressText : done ? '已完成' : errored ? '生成失败' : (progressText || '准备中')}
        </span>
      </div>
      {doc?.error ? (
        <div className="mt-2 text-[12px] text-[var(--md-sys-color-error)]">{doc.error}</div>
      ) : null}
      {isStreaming && reasoning ? (
        <div className="mt-2 text-[11px] text-[var(--md-sys-color-on-surface-variant)] line-clamp-2">{reasoning}</div>
      ) : null}
      {done || (doc && !inFlight) ? (
        <button
          type="button"
          onClick={() => openViewer(documentId)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[var(--md-sys-color-primary)] px-3 py-1.5 text-[12px] font-medium text-[var(--md-sys-color-on-primary)]"
        >
          <AgentArrowUpRightIcon size={14} />
          查看文档
        </button>
      ) : null}
    </div>
  );
}

async function consumeOutline(
  response: Response,
  documentId: string,
  onReasoning: (s: string) => void,
): Promise<Pick<DocumentSection, 'title' | 'brief'>[]> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('流读取失败');
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let outline: Pick<DocumentSection, 'title' | 'brief'>[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parsed = parseSseJsonEvents<DocumentApiEvent>(buffer);
    buffer = parsed.remaining;
    for (const event of parsed.events) {
      if (event.type === 'ping') continue;
      if (event.type !== 'document' || event.id !== documentId) continue;
      if (event.status === 'reasoning') onReasoning(event.delta || '');
      if (event.status === 'outline') outline = event.outline || [];
      if (event.status === 'error') throw new Error(event.message || '大纲生成失败');
    }
  }
  return outline;
}

async function consumeSection(
  response: Response,
  documentId: string,
  index: number,
  setSectionStatus: (id: string, index: number, status: DocumentSection['status'], error?: string) => void,
  setSectionMarkdown: (id: string, index: number, markdown: string) => void,
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('流读取失败');
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let markdown = '';

  setSectionStatus(documentId, index, 'streaming');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parsed = parseSseJsonEvents<DocumentApiEvent>(buffer);
    buffer = parsed.remaining;
    for (const event of parsed.events) {
      if (event.type === 'ping') continue;
      if (event.type !== 'document' || event.id !== documentId) continue;
      if (event.status === 'delta') {
        const d = event.delta || '';
        markdown += d;
        setSectionMarkdown(documentId, index, markdown);
      }
      if (event.status === 'section-done') {
        const m = event.markdown;
        if (m) setSectionMarkdown(documentId, index, m);
        setSectionStatus(documentId, index, 'done');
        return;
      }
      if (event.status === 'error') {
        setSectionStatus(documentId, index, 'error', event.message || '本节生成失败');
        throw new Error(event.message || '本节生成失败');
      }
    }
  }
  setSectionStatus(documentId, index, 'done');
}
