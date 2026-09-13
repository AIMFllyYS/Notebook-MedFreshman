'use client';

import React, { useCallback, useState } from 'react';
import { ArrowLeft, Clock, Trash2, MessageSquare, ImagePlus } from 'lucide-react';
import { useChatHistory } from '@/lib/hooks/useChatHistory';
import { useFloatingChats } from '@/lib/hooks/useFloatingChats';
import { useImageGen, type ImageGenSession } from '@/lib/hooks/useImageGen';
import PencilSparklesIcon from '@/components/icons/PencilSparklesIcon';
import { useOverlayRegistration } from '@/lib/keyboard/useOverlayRegistration';

interface ChatHistoryOverlayProps {
  /** 「对话」栏行点击：切换主对话会话。 */
  onSelectMain: (sessionId: string) => void;
  /** 「划词」栏行点击：还原（重开）该划词浮窗。 */
  onRestoreFloating: (sessionId: string) => void;
  onClose: () => void;
}

type TabType = 'main' | 'floating' | 'image';

/** 历史记录面板：分「对话 / 划词 / 生图」三栏；仅在打开时挂载并订阅 sessions。 */
const ChatHistoryOverlay: React.FC<ChatHistoryOverlayProps> = ({
  onSelectMain,
  onRestoreFloating,
  onClose,
}) => {
  const sessions = useChatHistory((s) => s.sessionsMeta);
  const activeSessionId = useChatHistory((s) => s.activeSessionId);
  const deleteSession = useChatHistory((s) => s.deleteSession);
  const imageSessions = useImageGen((s) => s.sessions);
  const bringToFront = useImageGen((s) => s.bringToFront);
  const removeSession = useImageGen((s) => s.removeSession);
  const close = useCallback(() => onClose(), [onClose]);
  useOverlayRegistration({ id: 'chat-history-workspace', open: true, onClose: close, priority: 50 });

  const handleDelete = (id: string) => {
    const fc = useFloatingChats.getState();
    const win = fc.windows.find((w) => w.sessionId === id);
    if (win) fc.closeWindow(win.id);
    deleteSession(id);
  };
  const [tab, setTab] = useState<TabType>('main');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const mainSessions = sessions.filter((s) => s.kind !== 'floating');
  const floatingSessions = sessions.filter((s) => s.kind === 'floating');

  const imageSessionList: ImageGenSession[] = Object.values(imageSessions).sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  const isFloating = tab === 'floating';
  const isImage = tab === 'image';
  const list = isFloating ? floatingSessions : mainSessions;
  const pageTitle = isImage ? '生图记录' : isFloating ? '划词对话' : '对话记录';
  const pageDescription = isImage
    ? '查看曾经生成的图片任务与完成状态。'
    : isFloating
      ? '恢复由划词解释和追问创建的独立对话。'
      : '继续此前的主对话，当前会话会保持高亮。';

  const switchTab = (t: TabType) => { setTab(t); setConfirmId(null); };

  const statusLabel: Record<string, string> = {
    done: '已完成',
    loading: '生成中',
    error: '失败',
    idle: '待批准',
  };

  return (
    <div className="chat-history-overlay" data-testid="chat-history-workspace">
      <aside className="chat-history-sidebar" aria-label="历史记录分类">
        <button onClick={close} className="chat-settings-back" aria-label="返回对话">
          <ArrowLeft size={15} /><span>返回对话</span>
        </button>
        <div className="chat-settings-brand">
          <span className="chat-settings-brand-icon"><Clock size={16} /></span>
          <span><strong>历史记录</strong><small>AI Agent</small></span>
        </div>
        <nav className="chat-history-tabs">
        <button
          className={`chat-history-tab ${tab === 'main' ? 'chat-history-tab-active' : ''}`}
          aria-current={tab === 'main' ? 'page' : undefined}
          onClick={() => switchTab('main')}
        >
          <MessageSquare size={15} /><span><strong>对话</strong><small>{mainSessions.length} 个会话</small></span>
        </button>
        <button
          className={`chat-history-tab ${isFloating ? 'chat-history-tab-active' : ''}`}
          aria-current={isFloating ? 'page' : undefined}
          onClick={() => switchTab('floating')}
        >
          <PencilSparklesIcon size={15} /><span><strong>划词</strong><small>{floatingSessions.length} 个会话</small></span>
        </button>
        <button
          className={`chat-history-tab ${isImage ? 'chat-history-tab-active' : ''}`}
          aria-current={isImage ? 'page' : undefined}
          onClick={() => switchTab('image')}
        >
          <ImagePlus size={15} /><span><strong>生图</strong><small>{imageSessionList.length} 个任务</small></span>
        </button>
        </nav>
      </aside>

      <main className="chat-history-main">
        <header className="chat-history-content-header">
          <h1>{pageTitle}</h1>
          <p>{pageDescription}</p>
        </header>
        <div className="chat-history-list">
        {isImage ? (
          imageSessionList.length === 0 ? (
            <div className="chat-history-empty">暂无生图记录</div>
          ) : (
            imageSessionList.map((s) => (
              <div
                key={s.id}
                className="chat-history-item"
                onClick={() => {
                  if (confirmId) { setConfirmId(null); return; }
                  bringToFront(s.id);
                  onClose();
                }}
                title="点击查看生图弹窗"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {s.images.length > 0 && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={s.images[0].url || (s.images[0].b64_json ? `data:image/png;base64,${s.images[0].b64_json}` : undefined)}
                      alt={s.title}
                      className="h-9 w-9 shrink-0 rounded object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="chat-history-item-title">{s.title}</div>
                    <div className="chat-history-item-meta">
                      <span>{new Date(s.createdAt).toLocaleString()}</span>
                      <span
                        style={{
                          color: s.status === 'done'
                            ? 'var(--md-sys-color-tertiary)'
                            : s.status === 'error'
                              ? 'var(--md-sys-color-error)'
                              : 'var(--md-sys-color-on-surface-variant)',
                        }}
                      >
                        {statusLabel[s.status] ?? s.status}
                        {s.status === 'done' && s.images.length > 0 && ` · ${s.images.length} 张`}
                      </span>
                    </div>
                  </div>
                </div>

                {confirmId === s.id ? (
                  <div className="chat-history-confirm" onClick={(e) => e.stopPropagation()}>
                    <span className="chat-history-confirm-label">删除？</span>
                    <button
                      className="chat-history-confirm-yes"
                      onClick={(e) => { e.stopPropagation(); removeSession(s.id); setConfirmId(null); }}
                    >
                      删除
                    </button>
                    <button
                      className="chat-history-confirm-no"
                      onClick={(e) => { e.stopPropagation(); setConfirmId(null); }}
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmId(s.id); }}
                    className="chat-history-item-delete"
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))
          )
        ) : (
          list.length === 0 ? (
            <div className="chat-history-empty">{isFloating ? '暂无划词记录' : '暂无历史记录'}</div>
          ) : (
            list.map((session) => (
              <div
                key={session.id}
                className={`chat-history-item ${session.id === activeSessionId && !isFloating ? 'chat-history-item-active' : ''}`}
                onClick={() => {
                  if (confirmId) { setConfirmId(null); return; }
                  if (isFloating) onRestoreFloating(session.id);
                  else onSelectMain(session.id);
                }}
                title={isFloating ? '点击还原划词浮窗' : undefined}
              >
                <div className="chat-history-item-title">{session.title}</div>
                <div className="chat-history-item-meta">
                  <span>{new Date(session.updatedAt).toLocaleString()}</span>
                  <span>{session.messageCount ?? 0} 条消息</span>
                </div>

                {confirmId === session.id ? (
                  <div className="chat-history-confirm" onClick={(e) => e.stopPropagation()}>
                    <span className="chat-history-confirm-label">删除？</span>
                    <button
                      className="chat-history-confirm-yes"
                      onClick={(e) => { e.stopPropagation(); handleDelete(session.id); setConfirmId(null); }}
                    >
                      删除
                    </button>
                    <button
                      className="chat-history-confirm-no"
                      onClick={(e) => { e.stopPropagation(); setConfirmId(null); }}
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmId(session.id); }}
                    className="chat-history-item-delete"
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))
          )
        )}
        </div>
      </main>
    </div>
  );
};

export default ChatHistoryOverlay;
