'use client';

import React from 'react';
import { Clock, X, Trash2 } from 'lucide-react';
import type { ChatSession } from '@/lib/hooks/useChatHistory';

interface ChatHistoryOverlayProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onClose: () => void;
}

const ChatHistoryOverlay: React.FC<ChatHistoryOverlayProps> = ({
  sessions,
  activeSessionId,
  onSelect,
  onDelete,
  onClose,
}) => {
  return (
    <div className="chat-history-overlay">
      <div className="chat-history-header">
        <h3 className="chat-history-title">
          <Clock size={16} /> 历史对话
        </h3>
        <button onClick={onClose} className="chat-history-close">
          <X size={18} />
        </button>
      </div>
      <div className="chat-history-list">
        {sessions.length === 0 ? (
          <div className="chat-history-empty">暂无历史记录</div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`chat-history-item ${session.id === activeSessionId ? 'chat-history-item-active' : ''}`}
              onClick={() => onSelect(session.id)}
            >
              <div className="chat-history-item-title">{session.title}</div>
              <div className="chat-history-item-meta">
                <span>{new Date(session.updatedAt).toLocaleString()}</span>
                <span>{session.messages.length} 条消息</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
                className="chat-history-item-delete"
                title="删除"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatHistoryOverlay;
