'use client';

import React from 'react';
import { AgentPlusIcon, AgentHistoryIcon, AgentSettingsIcon, AgentLoopIcon } from '@/components/icons/AgentIcons';

interface ChatPanelHeaderProps {
  topic: string;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onNewChat: () => void;
}

const ChatPanelHeader: React.FC<ChatPanelHeaderProps> = ({
  topic,
  onOpenSettings,
  onOpenHistory,
  onNewChat,
}) => {
  return (
    <div className="chat-header">
      <div className="chat-header-left">
        <AgentLoopIcon size={14} style={{ color: 'var(--ink-soft)' }} />
        <span className="chat-header-title">AI 助教</span>
        {topic && <span className="chat-header-topic">{topic}</span>}
      </div>
      <div className="chat-header-actions">
        <button onClick={onOpenSettings} title="AI 设置" className="chat-header-btn">
          <AgentSettingsIcon size={12} />
          <span className="chat-header-btn-text">设置</span>
        </button>
        <button onClick={onOpenHistory} title="历史记录" className="chat-header-btn">
          <AgentHistoryIcon size={12} />
          <span className="chat-header-btn-text">历史</span>
        </button>
        <button onClick={onNewChat} title="开启新对话" className="chat-header-btn chat-header-btn-primary">
          <AgentPlusIcon size={12} />
          <span className="chat-header-btn-text">新对话</span>
        </button>
      </div>
    </div>
  );
};

export default ChatPanelHeader;
