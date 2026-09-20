'use client';

import React from 'react';
import { AgentPlusIcon, AgentHistoryIcon, AgentSettingsIcon, AgentLoopIcon, AgentPanelCloseIcon } from '@/components/icons/AgentIcons';
import { useT } from '@/lib/i18n';

interface ChatPanelHeaderProps {
  topic: string;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onNewChat: () => void;
  /** 隐藏右侧栏顶部标签后，收起按钮改到这条中间导航。 */
  onCollapseRight?: () => void;
  /** 手机 AI 页不展示路径导航，把空间留给对话。 */
  hideTopic?: boolean;
}

const ChatPanelHeader: React.FC<ChatPanelHeaderProps> = ({
  topic,
  onOpenSettings,
  onOpenHistory,
  onNewChat,
  onCollapseRight,
  hideTopic = false,
}) => {
  const t = useT();
  return (
    <div className="chat-header">
      <div className="chat-header-left">
        <AgentLoopIcon size={14} style={{ color: 'var(--ink-soft)' }} />
        <span className="chat-header-title">{t('trace.header.title')}</span>
        {!hideTopic && topic && <span className="chat-header-topic">{topic}</span>}
      </div>
      <div className="chat-header-actions">
        <button onClick={onOpenSettings} title={t('trace.header.settingsTitle')} className="chat-header-btn">
          <AgentSettingsIcon size={12} />
          <span className="chat-header-btn-text">{t('trace.header.settings')}</span>
        </button>
        <button onClick={onOpenHistory} title={t('trace.header.historyTitle')} className="chat-header-btn">
          <AgentHistoryIcon size={12} />
          <span className="chat-header-btn-text">{t('trace.header.history')}</span>
        </button>
        <button onClick={onNewChat} title={t('trace.header.newChatTitle')} className="chat-header-btn chat-header-btn-primary">
          <AgentPlusIcon size={12} />
          <span className="chat-header-btn-text">{t('agent.nav.newChat')}</span>
        </button>
        {onCollapseRight && (
          <button
            type="button"
            onClick={onCollapseRight}
            title={t('agent.dock.collapse')}
            aria-label={t('agent.dock.collapse')}
            className="chat-header-btn"
          >
            <AgentPanelCloseIcon size={12} />
            <span className="chat-header-btn-text">{t('panel.common.collapse')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatPanelHeader;
