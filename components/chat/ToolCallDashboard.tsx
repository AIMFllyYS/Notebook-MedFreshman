'use client';

import React, { useState } from 'react';
import { Wrench, ChevronDown, ChevronUp, Loader2, CheckCircle, XCircle, Globe, ExternalLink, Zap, MonitorPlay } from 'lucide-react';
import type { ToolCallBlock } from '@/lib/types/chat';
import { useArtifacts } from '@/lib/hooks/useArtifacts';

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

interface ToolCallDashboardProps {
  toolCalls: ToolCallBlock[];
}

const StatusIcon: React.FC<{ status: ToolCallBlock['status'] }> = ({ status }) => {
  switch (status) {
    case 'running':
      return <Loader2 size={14} className="animate-spin" style={{ color: 'var(--md-sys-color-primary)' }} />;
    case 'success':
      return <CheckCircle size={14} style={{ color: 'var(--md-sys-color-tertiary)' }} />;
    case 'error':
      return <XCircle size={14} style={{ color: 'var(--md-sys-color-error)' }} />;
  }
};

const statusLabel: Record<ToolCallBlock['status'], string> = {
  running: '正在运行...',
  success: '运行成功',
  error: '运行失败',
};

const statusBg: Record<ToolCallBlock['status'], string> = {
  running: 'rgba(79, 195, 247, 0.05)',
  success: 'rgba(102, 187, 106, 0.05)',
  error: 'rgba(239, 83, 80, 0.05)',
};

const statusBorder: Record<ToolCallBlock['status'], string> = {
  running: 'rgba(79, 195, 247, 0.2)',
  success: 'rgba(102, 187, 106, 0.2)',
  error: 'rgba(239, 83, 80, 0.2)',
};

const formatArgs = (args: Record<string, any> | string | undefined): string => {
  if (!args) return '{}';
  if (typeof args === 'string') {
    try {
      return JSON.stringify(JSON.parse(args), null, 2);
    } catch {
      return args;
    }
  }
  return JSON.stringify(args, null, 2);
};

const ToolCallItem: React.FC<{ call: ToolCallBlock }> = ({ call }) => {
  const [expandArgs, setExpandArgs] = useState(false);
  const [expandResult, setExpandResult] = useState(false);

  return (
    <div
      style={{
        padding: '0.75rem',
        background: statusBg[call.status],
        border: `1px solid ${statusBorder[call.status]}`,
        borderRadius: '8px',
        fontSize: '0.8rem',
        fontFamily: 'monospace',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5" style={{ color: 'var(--md-sys-color-on-surface)' }}>
          <Wrench size={14} style={{ color: 'var(--md-sys-color-primary)' }} />
          <span>{call.name}()</span>
        </div>
        <div className="flex items-center gap-1 font-bold" style={{ color: 'var(--md-sys-color-primary)' }}>
          <StatusIcon status={call.status} />
          <span>{statusLabel[call.status]}</span>
        </div>
      </div>

      {/* Execution Time */}
      {call.executionTime != null && (
        <div style={{ fontSize: '0.7rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
          执行耗时: {call.executionTime}ms
        </div>
      )}

      {/* 交互演示：查看按钮（点击弹窗渲染 HTML 产物） */}
      {call.name === 'renderInteractive' && call.artifactId && (
        <button
          type="button"
          onClick={() => {
            const a = useArtifacts.getState();
            if (a.byId[call.artifactId!]) a.openViewer(call.artifactId!);
          }}
          disabled={!useArtifacts.getState().byId[call.artifactId]}
          className="flex items-center gap-1.5 self-start rounded-lg px-2.5 py-1.5"
          style={{
            background: 'var(--md-sys-color-primary-container)',
            color: 'var(--md-sys-color-primary)',
            fontSize: '0.76rem',
            fontWeight: 600,
            fontFamily: 'inherit',
            border: '1px solid var(--md-sys-color-primary)',
            cursor: 'pointer',
          }}
        >
          <MonitorPlay size={13} />
          {useArtifacts.getState().byId[call.artifactId] ? '查看交互演示' : '演示已失效（请重新生成）'}
        </button>
      )}

      {/* 联网搜索来源卡片 */}
      {call.name === 'webSearch' && call.sources && call.sources.length > 0 && (
        <div className="flex flex-col gap-1.5" style={{ fontFamily: 'inherit' }}>
          <div className="flex items-center gap-1.5" style={{ fontSize: '0.72rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
            <Globe size={12} style={{ color: 'var(--md-sys-color-primary)' }} />
            <span>联网来源 · {call.sources.length} 条</span>
            {call.cacheHit && (
              <span className="inline-flex items-center gap-0.5" style={{ color: 'var(--md-sys-color-tertiary)' }}>
                <Zap size={11} /> 缓存命中
              </span>
            )}
          </div>
          {call.sources.map((s, i) => (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-0.5 rounded-lg px-2.5 py-2 transition-colors"
              style={{
                background: 'var(--md-sys-color-surface-container)',
                border: '1px solid var(--md-sys-color-outline-variant)',
                textDecoration: 'none',
                fontFamily: 'inherit',
              }}
            >
              <div className="flex items-center gap-1" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--md-sys-color-primary)' }}>
                <span className="truncate">{i + 1}. {s.title}</span>
                <ExternalLink size={11} className="shrink-0" />
              </div>
              {s.snippet && (
                <div
                  style={{ fontSize: '0.72rem', lineHeight: 1.5, color: 'var(--md-sys-color-on-surface-variant)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                >
                  {s.snippet}
                </div>
              )}
              <div style={{ fontSize: '0.68rem', color: 'var(--md-sys-color-outline)' }}>{hostOf(s.url)}</div>
            </a>
          ))}
        </div>
      )}

      {/* Arguments Toggle */}
      <div style={{ border: '1px solid var(--md-sys-color-outline-variant)', borderRadius: '4px', overflow: 'hidden' }}>
        <button
          onClick={() => setExpandArgs(!expandArgs)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 bg-transparent border-none cursor-pointer text-left"
          style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}
          type="button"
        >
          <span>输入参数 (Arguments)</span>
          {expandArgs ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {expandArgs && (
          <pre
            style={{
              padding: '0.6rem',
              margin: 0,
              background: 'var(--md-sys-color-surface-container)',
              color: 'var(--md-sys-color-on-surface-variant)',
              overflowX: 'auto',
              fontSize: '0.75rem',
              lineHeight: '1.4',
            }}
          >
            {formatArgs(call.arguments ?? call.argumentsStr)}
          </pre>
        )}
      </div>

      {/* Result Toggle */}
      {call.status !== 'running' && call.result && (
        <div style={{ border: '1px solid var(--md-sys-color-outline-variant)', borderRadius: '4px', overflow: 'hidden' }}>
          <button
            onClick={() => setExpandResult(!expandResult)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 bg-transparent border-none cursor-pointer text-left"
            style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}
            type="button"
          >
            <span>返回结果 (Result)</span>
            {expandResult ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {expandResult && (
            <pre
              style={{
                padding: '0.6rem',
                margin: 0,
                background: 'var(--md-sys-color-surface-container)',
                color: 'var(--md-sys-color-on-surface-variant)',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                fontSize: '0.75rem',
                lineHeight: '1.4',
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {call.result}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export const ToolCallDashboard: React.FC<ToolCallDashboardProps> = ({ toolCalls }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!toolCalls || toolCalls.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        margin: '8px 0',
        borderRadius: '8px',
        background: 'var(--md-sys-color-surface-container-high)',
        border: '1px solid var(--md-sys-color-outline-variant)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 border-none bg-transparent cursor-pointer transition-colors duration-200 hover:bg-[var(--md-sys-color-surface-container-highest)]"
        type="button"
      >
        <div className="flex items-center gap-1.5">
          <Wrench size={14} style={{ color: 'var(--md-sys-color-primary)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--md-sys-color-primary)' }}>
            工具调用 ({toolCalls.length})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            {isExpanded ? '收起' : '展开'}
          </span>
          {isExpanded ? (
            <ChevronUp size={14} style={{ color: 'var(--md-sys-color-on-surface-variant)' }} />
          ) : (
            <ChevronDown size={14} style={{ color: 'var(--md-sys-color-on-surface-variant)' }} />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div
          className="flex flex-col gap-2"
          style={{
            padding: '0 12px 12px 12px',
            borderTop: '1px solid var(--md-sys-color-outline-variant)',
          }}
        >
          {toolCalls.map((call, idx) => (
            <ToolCallItem key={call.id ?? idx} call={call} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ToolCallDashboard;
