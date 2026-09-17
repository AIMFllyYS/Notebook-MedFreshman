"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Folder, FolderOpen, MessageSquare, PanelLeft, PanelLeftClose, Plus, Trash2 } from "lucide-react";
import FolderTreeRow from "./FolderTreeRow";
import GlobalSettings from "./GlobalSettings";
import LeftDock from "./LeftDock";
import UserQuotaPanel from "./UserQuotaPanel";
import AnimatedCollapse from "@/components/ui/AnimatedCollapse";
import PencilSparklesIcon from "@/components/icons/PencilSparklesIcon";
import { ensureChatHistoryBootstrap, useChatHistory } from "@/lib/hooks/useChatHistory";
import { useFloatingChats } from "@/lib/hooks/useFloatingChats";
import { useStore } from "@/lib/stores/ui";
import { useTokenTracker } from "@/lib/hooks/useTokenTracker";
import { openNoteLibrary } from "@/lib/notes/openUserNote";
import type { ChatContext } from "@/lib/types/chat";
import type { SessionMeta } from "@/lib/storage/chatStorage";

function sessionPreview(session: SessionMeta): string {
  if (session.preview?.trim()) return session.preview;
  const count = session.messageCount ?? 0;
  return count > 0 ? `${count} 条消息` : "空对话";
}

export default function AgentConversationSidebar({
  chatContext,
}: {
  chatContext: ChatContext;
}) {
  const sessions = useChatHistory((s) => s.sessionsMeta);
  const activeSessionId = useChatHistory((s) => s.activeSessionId);
  const createSession = useChatHistory((s) => s.createSession);
  const deleteSession = useChatHistory((s) => s.deleteSession);
  const switchSession = useChatHistory((s) => s.switchSession);
  const isCollapsed = useStore((s) => s.sidebarCollapsed);
  const setCollapsed = useStore((s) => s.setSidebarCollapsed);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [quotaOpen, setQuotaOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [mainExpanded, setMainExpanded] = useState(true);
  const [floatingExpanded, setFloatingExpanded] = useState(true);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    void ensureChatHistoryBootstrap();
  }, []);

  const mainSessions = useMemo(
    () => sessions.filter((s) => s.kind !== "floating" && s.kind !== "note"),
    [sessions],
  );
  const floatingSessions = useMemo(
    () => sessions.filter((s) => s.kind === "floating"),
    [sessions],
  );

  const handleNewChat = () => {
    createSession(chatContext);
    useTokenTracker.getState().resetSession();
  };

  const handleSelectMain = (id: string) => {
    if (confirmId) {
      setConfirmId(null);
      return;
    }
    switchSession(id);
  };

  const handleSelectFloating = (id: string) => {
    if (confirmId) {
      setConfirmId(null);
      return;
    }
    useFloatingChats.getState().restoreWindow(id);
  };

  const handleDelete = (id: string) => {
    const fc = useFloatingChats.getState();
    const win = fc.windows.find((w) => w.sessionId === id);
    if (win) fc.closeWindow(win.id);
    deleteSession(id);
    setConfirmId(null);
  };

  const renderSession = (session: SessionMeta, kind: "main" | "floating") => {
    const selected = kind === "main" && session.id === activeSessionId;
    return (
      <div key={session.id} className="group relative flex items-center">
        <div className="min-w-0 flex-1">
          <FolderTreeRow
            depth={1}
            title={session.title || "新对话"}
            isSelected={selected}
            icon={kind === "floating" ? <PencilSparklesIcon size={14} /> : <MessageSquare size={14} />}
            titleAttr={sessionPreview(session)}
            ariaLabel={session.title || "新对话"}
            onClick={() => (kind === "floating" ? handleSelectFloating(session.id) : handleSelectMain(session.id))}
          />
        </div>
        {confirmId === session.id ? (
          <div className="mr-1 flex shrink-0 items-center gap-1">
            <button type="button" className="rounded px-1.5 text-[11px] font-semibold text-[var(--md-sys-color-error)]" onClick={() => handleDelete(session.id)}>
              删除
            </button>
            <button type="button" className="rounded px-1.5 text-[11px] text-[var(--ink-soft)]" onClick={() => setConfirmId(null)}>
              取消
            </button>
          </div>
        ) : (
          <button
            type="button"
            title="删除对话"
            aria-label={`删除 ${session.title || "对话"}`}
            className="mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded text-[var(--ink-faint)] opacity-0 transition-opacity hover:text-[var(--md-sys-color-error)] group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmId(session.id);
            }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    );
  };

  return (
    <aside
      data-testid="agent-conversation-sidebar"
      className="flex h-full flex-col"
      style={{
        background: "var(--md-sys-color-surface-container-lowest)",
        borderRight: "1px solid var(--md-sys-color-outline-variant)",
      }}
    >
      <div
        className="flex shrink-0 items-center justify-between"
        style={{
          height: 36,
          padding: "0 8px 0 12px",
          borderBottom: "1px solid var(--md-sys-color-outline-variant)",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--md-sys-color-outline)",
          }}
        >
          对话
        </span>
        <button
          type="button"
          onClick={() => setCollapsed(!isCollapsed)}
          className="flex items-center justify-center rounded"
          style={{
            width: 24,
            height: 24,
            color: "var(--md-sys-color-outline)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          title={isCollapsed ? "展开侧边栏" : "折叠侧边栏"}
        >
          {isCollapsed ? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>

      <div className="flex shrink-0 flex-col gap-0.5 px-1 pt-1.5">
        <button
          type="button"
          onClick={handleNewChat}
          className="press flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]"
        >
          <Plus size={15} />
          新对话
        </button>
        <button
          type="button"
          onClick={() => openNoteLibrary({ intent: "browse" })}
          className="press flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
        >
          <Folder size={15} />
          我的资产
        </button>
      </div>

      <div className="scroll-y min-h-0 flex-1 py-1" data-testid="agent-conversation-groups">
        <FolderTreeRow
          depth={0}
          title="正常对话"
          isFolder
          isExpanded={mainExpanded}
          icon={
            mainExpanded ? (
              <FolderOpen size={15} style={{ color: "var(--md-sys-color-primary)" }} />
            ) : (
              <Folder size={15} style={{ color: "var(--md-sys-color-outline)" }} />
            )
          }
          onClick={() => setMainExpanded((open) => !open)}
          fontWeight={600}
          ariaLabel="正常对话"
        />
        <AnimatedCollapse isOpen={mainExpanded}>
          {mainSessions.length === 0 ? (
            <div className="px-8 py-2 text-[12px] text-[var(--ink-faint)]">暂无对话</div>
          ) : (
            mainSessions.map((session) => renderSession(session, "main"))
          )}
        </AnimatedCollapse>

        <FolderTreeRow
          depth={0}
          title="划词助手对话"
          isFolder
          isExpanded={floatingExpanded}
          icon={
            floatingExpanded ? (
              <FolderOpen size={15} style={{ color: "var(--md-sys-color-primary)" }} />
            ) : (
              <Folder size={15} style={{ color: "var(--md-sys-color-outline)" }} />
            )
          }
          onClick={() => setFloatingExpanded((open) => !open)}
          fontWeight={600}
          ariaLabel="划词助手对话"
        />
        <AnimatedCollapse isOpen={floatingExpanded}>
          {floatingSessions.length === 0 ? (
            <div className="px-8 py-2 text-[12px] text-[var(--ink-faint)]">暂无划词对话</div>
          ) : (
            floatingSessions.map((session) => renderSession(session, "floating"))
          )}
        </AnimatedCollapse>
      </div>

      <div
        className="flex shrink-0 items-center gap-1"
        style={{
          height: 40,
          padding: "0 8px",
          borderTop: "1px solid var(--md-sys-color-outline-variant)",
        }}
      >
        <LeftDock
          buttonRef={settingsBtnRef}
          onToggle={() => setSettingsOpen((v) => !v)}
          onOpenQuota={() => setQuotaOpen(true)}
        />
      </div>

      {quotaOpen && (
        <UserQuotaPanel anchorRef={settingsBtnRef} onClose={() => setQuotaOpen(false)} />
      )}
      {settingsOpen && (
        <GlobalSettings anchorRef={settingsBtnRef} onClose={() => setSettingsOpen(false)} />
      )}
    </aside>
  );
}
