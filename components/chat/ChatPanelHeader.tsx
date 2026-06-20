'use client';

import React from 'react';
import { Sparkles, Plus, Trash2, Clock, Settings } from 'lucide-react';

interface ChatPanelHeaderProps {
  topic: string;
  hasMessages: boolean;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onNewChat: () => void;
  onClearCurrent: () => void;
}

const ChatPanelHeader: React.FC<ChatPanelHeaderProps> = ({
  topic,
  hasMessages,
  onOpenSettings,
  onOpenHistory,
  onNewChat,
  onClearCurrent,
}) => {
  return (
    <div className="chat-header">
      <div className="chat-header-left">
        <Sparkles size={14} style={{ color: 'var(--md-sys-color-primary)' }} />
        <span className="chat-header-title">AI 助教</span>
        {topic && <span className="chat-header-topic">{topic}</span>}
      </div>
      <div className="chat-header-actions">
        <button onClick={onOpenSettings} title="AI 设置" className="chat-header-btn">
          <Settings size={12} /> 设置
        </button>
        <button onClick={onOpenHistory} title="历史记录" className="chat-header-btn">
          <Clock size={12} /> 历史
        </button>
        <button onClick={onNewChat} title="开启新对话" className="chat-header-btn chat-header-btn-primary">
          <Plus size={12} /> 新对话
        </button>
        {hasMessages && (
          <button onClick={onClearCurrent} title="清空当前记录" className="chat-header-btn chat-header-btn-danger">
            <Trash2 size={12} /> 清空
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatPanelHeader;
