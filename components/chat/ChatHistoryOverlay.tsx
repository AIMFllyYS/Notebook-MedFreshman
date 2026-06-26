'use client';

import React, { useState } from 'react';
import { Clock, X, Trash2, MessageSquare, Sparkles } from 'lucide-react';
import type { ChatSession } from '@/lib/hooks/useChatHistory';

interface ChatHistoryOverlayProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  /** 「对话」栏行点击：切换主对话会话。 */
  onSelectMain: (sessionId: string) => void;
  /** 「划词」栏行点击：还原（重开）该划词浮窗。 */
  onRestoreFloating: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onClose: () => void;
}

/** 历史记录面板：分「对话 / 划词」两栏。对话栏=切换主会话；划词栏=点击还原旧划词浮窗。 */
const ChatHistoryOverlay: React.FC<ChatHistoryOverlayProps> = ({
  sessions,
  activeSessionId,
  onSelectMain,
  onRestoreFloating,
  onDelete,
  onClose,
}) => {
  const [tab, setTab] = useState<'main' | 'floating'>('main');
  // 删除二次确认：记录待确认删除的会话 id（点删除先要求确认，避免误删历史）。
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const mainSessions = sessions.filter((s) => s.kind !== 'floating');
  const floatingSessions = sessions.filter((s) => s.kind === 'floating');
  const isFloating = tab === 'floating';
  const list = isFloating ? floatingSessions : mainSessions;

  const switchTab = (t: 'main' | 'floating') => { setTab(t); setConfirmId(null); };

  return (
    <div className="chat-history-overlay">
      <div className="chat-history-header">
        <h3 className="chat-history-title">
          <Clock size={16} /> 历史记录
        </h3>
        <button onClick={onClose} className="chat-history-close">
          <X size={18} />
        </button>
      </div>

      <div className="chat-history-tabs">
        <button
          className={`chat-history-tab ${!isFloating ? 'chat-history-tab-active' : ''}`}
          onClick={() => switchTab('main')}
        >
          <MessageSquare size={13} /> 对话{mainSessions.length ? ` · ${mainSessions.length}` : ''}
        </button>
        <button
          className={`chat-history-tab ${isFloating ? 'chat-history-tab-active' : ''}`}
          onClick={() => switchTab('floating')}
        >
          <Sparkles size={13} /> 划词{floatingSessions.length ? ` · ${floatingSessions.length}` : ''}
        </button>
      </div>

      <div className="chat-history-list">
        {list.length === 0 ? (
          <div className="chat-history-empty">{isFloating ? '暂无划词记录' : '暂无历史记录'}</div>
        ) : (
          list.map((session) => (
            <div
              key={session.id}
              className={`chat-history-item ${session.id === activeSessionId && !isFloating ? 'chat-history-item-active' : ''}`}
              onClick={() => {
                // 有待确认删除时，点击行先取消确认（不触发选择/还原），避免误操作。
                if (confirmId) { setConfirmId(null); return; }
                if (isFloating) onRestoreFloating(session.id);
                else onSelectMain(session.id);
              }}
              title={isFloating ? '点击还原划词浮窗' : undefined}
            >
              <div className="chat-history-item-title">{session.title}</div>
              <div className="chat-history-item-meta">
                <span>{new Date(session.updatedAt).toLocaleString()}</span>
                <span>{session.messages.length} 条消息</span>
              </div>

              {confirmId === session.id ? (
                <div className="chat-history-confirm" onClick={(e) => e.stopPropagation()}>
                  <span className="chat-history-confirm-label">删除？</span>
                  <button
                    className="chat-history-confirm-yes"
                    onClick={(e) => { e.stopPropagation(); onDelete(session.id); setConfirmId(null); }}
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
        )}
      </div>
    </div>
  );
};

export default ChatHistoryOverlay;
