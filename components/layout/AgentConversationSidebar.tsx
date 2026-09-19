"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Archive, Folder, FolderOpen, MessagesSquare, PanelLeftClose, Plus, Search } from "lucide-react";
import FolderTreeRow from "./FolderTreeRow";
import GlobalSettings from "./GlobalSettings";
import LeftDock from "./LeftDock";
import AgentNavRows from "@/components/agent/AgentNavRows";
import AgentSectionHeader from "@/components/agent/AgentSectionHeader";
import AgentSessionList from "@/components/agent/AgentSessionList";
import AgentPanelMenu, { type AgentMenuTarget } from "@/components/agent/AgentPanelMenu";
import AnimatedCollapse from "@/components/ui/AnimatedCollapse";
import { ensureChatHistoryBootstrap, useChatHistory } from "@/lib/hooks/useChatHistory";
import { useFloatingChats } from "@/lib/hooks/useFloatingChats";
import { useGlobalSearch } from "@/lib/keyboard/useGlobalSearch";
import { useStore } from "@/lib/stores/ui";
import { useTokenTracker } from "@/lib/hooks/useTokenTracker";
import { buildProjectViews, selectArchivedSessions, selectRecentSessions } from "@/lib/agent/projectViews";
import type { ChatContext } from "@/lib/types/chat";
import type { SessionMeta } from "@/lib/storage/chatStorage";

interface PanelMenuState {
  x: number;
  y: number;
  target: AgentMenuTarget;
}

/**
 * Agent 左栏。结构（用户口径）：
 * 固定头（标题 + 全局搜索 + 折叠）→ 固定四行导航（新对话 / 我的资产 / 定时任务 / 插件市场）
 * → **一起滚动**的 Projects 与 Recents → 固定底（头像/设置 + 归档开关）。
 *
 * 项目就是会话分组（folders）：两个系统项目由 kind 决定成员（笔记记录 / 划词摘录），
 * 用户项目按 meta.folderId 归拢；Recents 是「不属于任何项目的普通对话」。
 */
export default function AgentConversationSidebar({ chatContext }: { chatContext: ChatContext }) {
  const pathname = usePathname();
  const sessionsMeta = useChatHistory((s) => s.sessionsMeta);
  const folders = useChatHistory((s) => s.folders);
  const activeSessionId = useChatHistory((s) => s.activeSessionId);
  const activeProjectId = useChatHistory((s) => s.activeProjectId);
  const startNewChat = useChatHistory((s) => s.startNewChat);
  const deleteSession = useChatHistory((s) => s.deleteSession);
  const switchSession = useChatHistory((s) => s.switchSession);
  const archiveSession = useChatHistory((s) => s.archiveSession);
  const updateSessionTitle = useChatHistory((s) => s.updateSessionTitle);
  const createFolder = useChatHistory((s) => s.createFolder);
  const renameFolder = useChatHistory((s) => s.renameFolder);
  const deleteFolder = useChatHistory((s) => s.deleteFolder);
  const moveSessionToFolder = useChatHistory((s) => s.moveSessionToFolder);
  const setActiveProject = useChatHistory((s) => s.setActiveProject);
  const setCollapsed = useStore((s) => s.setSidebarCollapsed);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menu, setMenu] = useState<PanelMenuState | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [recentsExpanded, setRecentsExpanded] = useState(true);
  const [collapsedProjects, setCollapsedProjects] = useState<Record<string, boolean>>({});
  const settingsBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    void ensureChatHistoryBootstrap();
  }, []);

  useEffect(() => {
    if (!menu) return;
    const close = () => {
      setMenu(null);
      setPendingDeleteId(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const projects = useMemo(() => buildProjectViews(folders, sessionsMeta), [folders, sessionsMeta]);
  const userProjects = useMemo(() => projects.filter((project) => !project.system).map((project) => ({ id: project.id, name: project.name, createdAt: project.updatedAt })), [projects]);
  const recentSessions = useMemo(() => selectRecentSessions(sessionsMeta), [sessionsMeta]);
  const archivedSessions = useMemo(() => selectArchivedSessions(sessionsMeta), [sessionsMeta]);
  const activeMeta = sessionsMeta.find((session) => session.id === activeSessionId) ?? null;
  const onBlankChat = pathname === "/agent" && (activeMeta?.messageCount ?? 0) === 0;

  const handleNewChat = useCallback(
    (projectId?: string | null) => {
      startNewChat(chatContext, projectId);
      useTokenTracker.getState().resetSession();
    },
    [chatContext, startNewChat],
  );

  const handleSelect = useCallback(
    (session: SessionMeta) => {
      setRenamingSessionId(null);
      if (session.kind === "floating") {
        useFloatingChats.getState().restoreWindow(session.id);
        return;
      }
      // 点进某个项目的会话，就把「下次新建」的落点也切到那个项目（与最近项目一致）。
      setActiveProject(session.kind === "note" ? null : (session.folderId ?? null));
      switchSession(session.id);
    },
    [setActiveProject, switchSession],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const floating = useFloatingChats.getState();
      const win = floating.windows.find((item) => item.sessionId === id);
      if (win) floating.closeWindow(win.id);
      deleteSession(id);
      setPendingDeleteId(null);
      setMenu(null);
    },
    [deleteSession],
  );

  const openMenu = (event: React.MouseEvent, target: AgentMenuTarget) => {
    event.preventDefault();
    event.stopPropagation();
    setPendingDeleteId(null);
    setMenu({ x: event.clientX, y: event.clientY, target });
  };

  const handleCreateProject = () => {
    const id = createFolder();
    setProjectsExpanded(true);
    setRenamingProjectId(id);
  };

  const sessionMenuProps = {
    activeSessionId,
    renamingId: renamingSessionId,
    onSelect: handleSelect,
    onContextMenu: (event: React.MouseEvent, session: SessionMeta) => openMenu(event, { kind: "session", session }),
    onRenameSubmit: (id: string, title: string) => {
      const next = title.trim();
      const prev = sessionsMeta.find((session) => session.id === id)?.title ?? "";
      if (next && next !== prev) updateSessionTitle(id, next);
      setRenamingSessionId(null);
    },
    onRenameCancel: () => setRenamingSessionId(null),
  };

  return (
    <aside
      data-testid="agent-conversation-sidebar"
      className="flex h-full flex-col"
      style={{
        background: "var(--md-sys-color-surface-container-lowest)",
        borderRight: "1px solid var(--line-soft)",
      }}
      onContextMenu={(event) => openMenu(event, { kind: "panel" })}
    >
      <div
        className="flex shrink-0 items-center gap-1"
        style={{ height: 40, padding: "0 8px 0 12px", borderBottom: "1px solid var(--line-soft)" }}
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
        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => useGlobalSearch.getState().setOpen(true)}
            title="全局搜索"
            aria-label="全局搜索"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--md-sys-color-surface-container-high)]"
          >
            <Search size={15} />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            title="折叠侧边栏"
            aria-label="折叠侧边栏"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--md-sys-color-surface-container-high)]"
          >
            <PanelLeftClose size={15} />
          </button>
        </div>
      </div>

      <AgentNavRows onNewChat={() => handleNewChat(activeProjectId)} newChatActive={onBlankChat} />

      <div className="scroll-y min-h-0 flex-1 py-1" data-agent-scroll data-testid="agent-conversation-groups">
        {showArchived ? (
          <>
            <AgentSectionHeader
              label="已归档"
              expanded
              onToggle={() => setShowArchived(false)}
              testId="agent-archived-header"
              action={
                <button
                  type="button"
                  onClick={() => setShowArchived(false)}
                  title="返回对话列表"
                  aria-label="返回对话列表"
                  className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--ink-soft)] hover:bg-[var(--md-sys-color-surface-container-high)]"
                >
                  <MessagesSquare size={14} />
                </button>
              }
            />
            <AgentSessionList
              slot="archived"
              sessions={archivedSessions}
              emptyLabel="没有归档的对话"
              depth={1}
              {...sessionMenuProps}
            />
          </>
        ) : (
          <>
            <AgentSectionHeader
              label="Projects"
              expanded={projectsExpanded}
              onToggle={() => setProjectsExpanded((open) => !open)}
              testId="agent-projects"
              action={
                <button
                  type="button"
                  data-testid="agent-project-add"
                  onClick={handleCreateProject}
                  title="新建项目"
                  aria-label="新建项目"
                  className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--ink-soft)] hover:bg-[var(--md-sys-color-surface-container-high)]"
                >
                  <Plus size={14} />
                </button>
              }
            />
            <AnimatedCollapse isOpen={projectsExpanded}>
              {projects.map((project) => {
                const expanded = collapsedProjects[project.id] !== true;
                const emptyLabel = project.system
                  ? project.system === "note"
                    ? "暂无笔记对话"
                    : "暂无划词对话"
                  : "空项目";
                return (
                  <div key={project.id}>
                    <div
                      className="flex items-center"
                      onContextMenu={(event) =>
                        openMenu(event, {
                          kind: "project",
                          folder: { id: project.id, name: project.name, createdAt: project.updatedAt, system: project.system },
                        })
                      }
                    >
                      <div className="min-w-0 flex-1">
                        {renamingProjectId === project.id ? (
                          <input
                            autoFocus
                            defaultValue={project.name}
                            aria-label="项目名称"
                            data-testid="project-rename-input"
                            className="mx-2 my-0.5 w-[calc(100%-1rem)] rounded-md border border-[var(--accent)] bg-[var(--bg-muted)] px-2 py-0.5 text-[12px] text-[var(--ink)] outline-none"
                            onPointerDown={(event) => event.stopPropagation()}
                            // 新建项目时输入框里是「新建项目 N」这个临时名：全选一下，直接打字就是干净的名字。
                            onFocus={(event) => event.currentTarget.select()}
                            onBlur={(event) => {
                              renameFolder(project.id, event.target.value);
                              setRenamingProjectId(null);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                renameFolder(project.id, event.currentTarget.value);
                                setRenamingProjectId(null);
                              }
                              if (event.key === "Escape") setRenamingProjectId(null);
                            }}
                          />
                        ) : (
                          <FolderTreeRow
                            depth={0}
                            title={project.name}
                            isFolder
                            isExpanded={expanded}
                            icon={
                              expanded ? (
                                <FolderOpen size={15} style={{ color: "var(--md-sys-color-primary)" }} />
                              ) : (
                                <Folder size={15} style={{ color: "var(--md-sys-color-outline)" }} />
                              )
                            }
                            onClick={() => setCollapsedProjects((prev) => ({ ...prev, [project.id]: expanded }))}
                            fontWeight={600}
                            ariaLabel={project.name}
                          />
                        )}
                      </div>
                    </div>
                    <AnimatedCollapse isOpen={expanded}>
                      <AgentSessionList
                        slot={`project-${project.id}`}
                        sessions={project.sessions}
                        emptyLabel={emptyLabel}
                        depth={1}
                        {...sessionMenuProps}
                      />
                    </AnimatedCollapse>
                  </div>
                );
              })}
            </AnimatedCollapse>

            <AgentSectionHeader
              label="Recents"
              expanded={recentsExpanded}
              onToggle={() => setRecentsExpanded((open) => !open)}
              testId="agent-recents"
            />
            <AnimatedCollapse isOpen={recentsExpanded}>
              <AgentSessionList slot="main" sessions={recentSessions} emptyLabel="暂无对话" depth={1} {...sessionMenuProps} />
            </AnimatedCollapse>
          </>
        )}
      </div>

      <div
        className="flex shrink-0 items-center gap-1"
        style={{ height: 40, padding: "0 8px", borderTop: "1px solid var(--line-soft)" }}
      >
        <LeftDock
          buttonRef={settingsBtnRef}
          settingsOpen={settingsOpen}
          onToggle={() => setSettingsOpen((open) => !open)}
        />
        <button
          type="button"
          onClick={() => setShowArchived((value) => !value)}
          title={showArchived ? "返回对话列表" : "查看已归档对话"}
          aria-label={showArchived ? "返回对话列表" : "查看已归档对话"}
          aria-pressed={showArchived}
          data-testid="archived-toggle"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--md-sys-color-surface-container-high)]"
        >
          {showArchived ? <MessagesSquare size={15} /> : <Archive size={15} />}
        </button>
      </div>

      {settingsOpen && (
        <GlobalSettings anchorRef={settingsBtnRef} onClose={() => setSettingsOpen(false)} />
      )}

      {menu && (
        <AgentPanelMenu
          x={menu.x}
          y={menu.y}
          target={menu.target}
          userProjects={userProjects}
          pendingDeleteId={pendingDeleteId}
          onRequestDelete={setPendingDeleteId}
          onConfirmDelete={handleDelete}
          onCancelDelete={() => setPendingDeleteId(null)}
          close={() => {
            setMenu(null);
            setPendingDeleteId(null);
          }}
          actions={{
            newChat: () => handleNewChat(activeProjectId),
            newProject: handleCreateProject,
            renameSession: (id) => setRenamingSessionId(id),
            moveSession: (id, projectId) => moveSessionToFolder(id, projectId),
            archiveSession: (id, archived) => archiveSession(id, archived),
            renameProject: (id) => setRenamingProjectId(id),
            deleteProject: (id) => {
              deleteFolder(id);
            },
            newChatInProject: (id) => handleNewChat(id),
          }}
        />
      )}
    </aside>
  );
}
