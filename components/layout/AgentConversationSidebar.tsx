"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Archive,
  ChevronRight,
  Folder,
  FolderOpen,
  FolderPlus,
  MessageSquare,
  MessagesSquare,
  PanelLeftClose,
  PenLine,
  Search,
  Trash2,
} from "lucide-react";
import FolderTreeRow from "./FolderTreeRow";
import GlobalSettings from "./GlobalSettings";
import LeftDock from "./LeftDock";
import AnimatedCollapse from "@/components/ui/AnimatedCollapse";
import PencilSparklesIcon from "@/components/icons/PencilSparklesIcon";
import { ensureChatHistoryBootstrap, useChatHistory } from "@/lib/hooks/useChatHistory";
import { useFloatingChats } from "@/lib/hooks/useFloatingChats";
import { useGlobalSearch } from "@/lib/keyboard/useGlobalSearch";
import { useStore } from "@/lib/stores/ui";
import { useTokenTracker } from "@/lib/hooks/useTokenTracker";
import { openNoteLibrary } from "@/lib/notes/openUserNote";
import type { ChatContext } from "@/lib/types/chat";
import type { SessionMeta } from "@/lib/storage/chatStorage";

/** 正常对话默认只展示前 5 条，其余通过「···」渐进披露。 */
const SESSION_PREVIEW_LIMIT = 5;

type MenuTarget =
  | { kind: "panel" }
  | { kind: "session"; session: SessionMeta; group: "main" | "floating" }
  | { kind: "folder"; folderId: string };

interface PanelMenu {
  x: number;
  y: number;
  target: MenuTarget;
}

function sessionPreview(session: SessionMeta): string {
  if (session.preview?.trim()) return session.preview;
  const count = session.messageCount ?? 0;
  return count > 0 ? `${count} 条消息` : "空对话";
}

/**
 * Agent 左侧工作区面板内容：对话 / 资产 / 添加内容 / 归档。
 * 由 `AgentWorkspace` 作为常驻列渲染；本组件只在展开时挂载，所以「折叠」按钮只负责收起。
 */
export default function AgentConversationSidebar({
  chatContext,
}: {
  chatContext: ChatContext;
}) {
  const sessions = useChatHistory((s) => s.sessionsMeta);
  const folders = useChatHistory((s) => s.folders);
  const activeSessionId = useChatHistory((s) => s.activeSessionId);
  const startNewChat = useChatHistory((s) => s.startNewChat);
  const deleteSession = useChatHistory((s) => s.deleteSession);
  const switchSession = useChatHistory((s) => s.switchSession);
  const archiveSession = useChatHistory((s) => s.archiveSession);
  const createFolder = useChatHistory((s) => s.createFolder);
  const renameFolder = useChatHistory((s) => s.renameFolder);
  const deleteFolder = useChatHistory((s) => s.deleteFolder);
  const moveSessionToFolder = useChatHistory((s) => s.moveSessionToFolder);
  const setCollapsed = useStore((s) => s.setSidebarCollapsed);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [mainExpanded, setMainExpanded] = useState(true);
  const [floatingExpanded, setFloatingExpanded] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [menu, setMenu] = useState<PanelMenu | null>(null);
  const [showAllMain, setShowAllMain] = useState(false);
  const [showAllFloating, setShowAllFloating] = useState(false);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    void ensureChatHistoryBootstrap();
  }, []);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
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

  const live = useMemo(() => sessions.filter((s) => !s.archived), [sessions]);
  const archived = useMemo(() => sessions.filter((s) => s.archived), [sessions]);
  const mainSessions = useMemo(
    () => live.filter((s) => s.kind !== "floating" && s.kind !== "note"),
    [live],
  );
  const floatingSessions = useMemo(() => live.filter((s) => s.kind === "floating"), [live]);
  const looseMainSessions = useMemo(
    () => mainSessions.filter((s) => !s.folderId),
    [mainSessions],
  );
  const visibleMain = showAllMain ? looseMainSessions : looseMainSessions.slice(0, SESSION_PREVIEW_LIMIT);
  const visibleFloating = showAllFloating
    ? floatingSessions
    : floatingSessions.slice(0, SESSION_PREVIEW_LIMIT);
  const hiddenMainCount = looseMainSessions.length - visibleMain.length;
  const hiddenFloatingCount = floatingSessions.length - visibleFloating.length;

  const handleNewChat = useCallback(() => {
    startNewChat(chatContext);
    useTokenTracker.getState().resetSession();
  }, [chatContext, startNewChat]);

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

  const openMenu = (event: React.MouseEvent, target: MenuTarget) => {
    event.preventDefault();
    event.stopPropagation();
    setMenu({ x: event.clientX, y: event.clientY, target });
  };

  const renderSession = (session: SessionMeta, kind: "main" | "floating") => {
    const selected = kind === "main" && session.id === activeSessionId;
    return (
      <div
        key={session.id}
        className="group relative flex items-center"
        onContextMenu={(event) => openMenu(event, { kind: "session", session, group: kind })}
      >
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

  const renderMore = (hidden: number, onShow: () => void, label: string, slot: "main" | "floating") => {
    if (hidden <= 0) return null;
    return (
      <button
        type="button"
        onClick={onShow}
        title={`展开其余 ${hidden} 个${label}`}
        aria-label={`展开其余 ${hidden} 个${label}`}
        data-testid={`session-show-more-${slot}`}
        className="press mx-2 my-0.5 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] text-[var(--ink-faint)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--ink-soft)]"
      >
        <span className="tracking-[0.15em]">···</span>
        <span>还有 {hidden} 个{label}</span>
      </button>
    );
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
        style={{
          height: 40,
          padding: "0 8px 0 12px",
          borderBottom: "1px solid var(--line-soft)",
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

      <div className="flex shrink-0 flex-col gap-0.5 px-1 pt-1.5">
        <button
          type="button"
          onClick={handleNewChat}
          className="press flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]"
        >
          <PenLine size={15} />
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
        {showArchived ? (
          <>
            <FolderTreeRow
              depth={0}
              title="已归档"
              isFolder
              isExpanded
              icon={<Archive size={15} style={{ color: "var(--md-sys-color-primary)" }} />}
              onClick={() => setShowArchived(false)}
              fontWeight={600}
              ariaLabel="已归档"
            />
            {archived.length === 0 ? (
              <div className="px-8 py-2 text-[12px] text-[var(--ink-faint)]">没有归档的对话</div>
            ) : (
              archived.map((session) => renderSession(session, session.kind === "floating" ? "floating" : "main"))
            )}
          </>
        ) : (
          <>
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
              {folders.map((folder) => {
                const items = mainSessions.filter((s) => s.folderId === folder.id);
                const expanded = expandedFolders[folder.id] !== false;
                return (
                  <div key={folder.id}>
                    <div
                      className="group relative flex items-center"
                      onContextMenu={(event) => openMenu(event, { kind: "folder", folderId: folder.id })}
                    >
                      <div className="min-w-0 flex-1">
                        {renamingFolderId === folder.id ? (
                          <input
                            autoFocus
                            defaultValue={folder.name}
                            aria-label="文件夹名称"
                            className="mx-2 my-0.5 w-[calc(100%-1rem)] rounded-md border border-[var(--accent)] bg-[var(--bg-muted)] px-2 py-0.5 text-[12px] text-[var(--ink)] outline-none"
                            onBlur={(event) => {
                              renameFolder(folder.id, event.target.value);
                              setRenamingFolderId(null);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                renameFolder(folder.id, event.currentTarget.value);
                                setRenamingFolderId(null);
                              }
                              if (event.key === "Escape") setRenamingFolderId(null);
                            }}
                          />
                        ) : (
                          <FolderTreeRow
                            depth={1}
                            title={folder.name}
                            isFolder
                            isExpanded={expanded}
                            icon={
                              expanded ? (
                                <FolderOpen size={14} style={{ color: "var(--md-sys-color-primary)" }} />
                              ) : (
                                <Folder size={14} style={{ color: "var(--md-sys-color-outline)" }} />
                              )
                            }
                            onClick={() =>
                              setExpandedFolders((prev) => ({ ...prev, [folder.id]: !expanded }))
                            }
                            ariaLabel={folder.name}
                          />
                        )}
                      </div>
                    </div>
                    <AnimatedCollapse isOpen={expanded}>
                      {items.length === 0 ? (
                        <div className="px-8 py-1.5 text-[12px] text-[var(--ink-faint)]">空文件夹</div>
                      ) : (
                        items.map((session) => renderSession(session, "main"))
                      )}
                    </AnimatedCollapse>
                  </div>
                );
              })}

              {looseMainSessions.length === 0 && folders.length === 0 ? (
                <div className="px-8 py-2 text-[12px] text-[var(--ink-faint)]">暂无对话</div>
              ) : (
                visibleMain.map((session) => renderSession(session, "main"))
              )}
              {renderMore(hiddenMainCount, () => setShowAllMain(true), "对话", "main")}
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
                visibleFloating.map((session) => renderSession(session, "floating"))
              )}
              {renderMore(hiddenFloatingCount, () => setShowAllFloating(true), "划词对话", "floating")}
            </AnimatedCollapse>
          </>
        )}
      </div>

      <div
        className="flex shrink-0 items-center gap-1"
        style={{
          height: 40,
          padding: "0 8px",
          borderTop: "1px solid var(--line-soft)",
        }}
      >
        <LeftDock
          buttonRef={settingsBtnRef}
          settingsOpen={settingsOpen}
          onToggle={() => setSettingsOpen((v) => !v)}
        />
        <button
          type="button"
          onClick={() => setShowArchived((v) => !v)}
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

      {menu && typeof document !== "undefined"
        ? createPortal(
            <div
              role="menu"
              aria-label="对话整理"
              data-testid="agent-panel-menu"
              style={{ position: "fixed", left: menu.x, top: menu.y }}
              className="z-[12000] w-52 rounded-xl border border-[var(--line)] bg-[var(--bg-panel)] p-1.5 shadow-xl"
              onPointerDown={(event) => event.stopPropagation()}
            >
              {menu.target.kind === "panel" && (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] text-[var(--ink)] hover:bg-[var(--bg-muted)]"
                    onClick={() => {
                      handleNewChat();
                      setMenu(null);
                    }}
                  >
                    <PenLine size={14} className="text-[var(--md-sys-color-primary)]" />
                    新建对话
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] text-[var(--ink)] hover:bg-[var(--bg-muted)]"
                    onClick={() => {
                      const id = createFolder();
                      setExpandedFolders((prev) => ({ ...prev, [id]: true }));
                      setRenamingFolderId(id);
                      setMenu(null);
                    }}
                  >
                    <FolderPlus size={14} className="text-[var(--md-sys-color-primary)]" />
                    新建文件夹
                  </button>
                </>
              )}

              {menu.target.kind === "session" && (
                <>
                  <div className="truncate px-2.5 py-1 text-[11px] text-[var(--ink-faint)]">
                    {menu.target.session.title || "新对话"}
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] text-[var(--ink)] hover:bg-[var(--bg-muted)]"
                    onClick={() => {
                      archiveSession(menu.target.kind === "session" ? menu.target.session.id : "", true);
                      setMenu(null);
                    }}
                  >
                    <Archive size={14} className="text-[var(--md-sys-color-primary)]" />
                    归档
                  </button>
                  {menu.target.group === "main" && folders.length > 0 && (
                    <>
                      <div className="px-2.5 pt-1.5 pb-0.5 text-[11px] text-[var(--ink-faint)]">移动到文件夹</div>
                      {folders.map((folder) => (
                        <button
                          key={folder.id}
                          type="button"
                          role="menuitem"
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] text-[var(--ink)] hover:bg-[var(--bg-muted)]"
                          onClick={() => {
                            if (menu.target.kind === "session") {
                              moveSessionToFolder(menu.target.session.id, folder.id);
                            }
                            setMenu(null);
                          }}
                        >
                          <Folder size={13} />
                          {folder.name}
                        </button>
                      ))}
                      {menu.target.session.folderId ? (
                        <button
                          type="button"
                          role="menuitem"
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] text-[var(--ink)] hover:bg-[var(--bg-muted)]"
                          onClick={() => {
                            if (menu.target.kind === "session") {
                              moveSessionToFolder(menu.target.session.id, null);
                            }
                            setMenu(null);
                          }}
                        >
                          <ChevronRight size={13} />
                          移出文件夹
                        </button>
                      ) : null}
                    </>
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] text-[var(--md-sys-color-error)] hover:bg-[var(--bg-muted)]"
                    onClick={() => {
                      if (menu.target.kind === "session") handleDelete(menu.target.session.id);
                      setMenu(null);
                    }}
                  >
                    <Trash2 size={14} />
                    删除
                  </button>
                </>
              )}

              {menu.target.kind === "folder" && menu.target.folderId && (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] text-[var(--ink)] hover:bg-[var(--bg-muted)]"
                    onClick={() => {
                      if (menu.target.kind === "folder") setRenamingFolderId(menu.target.folderId);
                      setMenu(null);
                    }}
                  >
                    <PenLine size={14} className="text-[var(--md-sys-color-primary)]" />
                    重命名文件夹
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] text-[var(--md-sys-color-error)] hover:bg-[var(--bg-muted)]"
                    onClick={() => {
                      if (menu.target.kind === "folder") deleteFolder(menu.target.folderId);
                      setMenu(null);
                    }}
                  >
                    <Trash2 size={14} />
                    删除文件夹
                  </button>
                </>
              )}
            </div>,
            document.body,
          )
        : null}

    </aside>
  );
}
