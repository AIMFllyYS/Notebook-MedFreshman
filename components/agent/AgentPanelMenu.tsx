"use client";

import { createPortal } from "react-dom";
import { Archive, ChevronRight, Folder, FolderPlus, PenLine, Trash2 } from "lucide-react";
import type { ChatFolder, SessionMeta } from "@/lib/storage/chatStorage";

export type AgentMenuTarget =
  | { kind: "panel" }
  | { kind: "session"; session: SessionMeta }
  | { kind: "project"; folder: ChatFolder };

export interface AgentPanelMenuActions {
  newChat: () => void;
  newProject: () => void;
  renameSession: (id: string) => void;
  moveSession: (id: string, projectId: string | null) => void;
  archiveSession: (id: string, archived: boolean) => void;
  renameProject: (id: string) => void;
  deleteProject: (id: string) => void;
  newChatInProject: (id: string) => void;
}

const ITEM_CLASS =
  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] text-[var(--ink)] hover:bg-[var(--bg-muted)]";

/**
 * 左栏右键菜单。删除走「菜单里就地问一次」：先点删除，再点确认，确认才真的落 deleteSession
 * （那条路径会 tombstone 云端那一行）。系统项目的会话不给「移动到项目」——归属由来源决定。
 */
export default function AgentPanelMenu({
  x,
  y,
  target,
  userProjects,
  pendingDeleteId,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  close,
  actions,
}: {
  x: number;
  y: number;
  target: AgentMenuTarget;
  userProjects: ChatFolder[];
  pendingDeleteId: string | null;
  onRequestDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
  close: () => void;
  actions: AgentPanelMenuActions;
}) {
  if (typeof document === "undefined") return null;
  const session = target.kind === "session" ? target.session : null;
  const systemSession = session?.kind === "note" || session?.kind === "floating";

  return createPortal(
    <div
      role="menu"
      aria-label="对话整理"
      data-testid="agent-panel-menu"
      style={{ position: "fixed", left: x, top: y }}
      className="z-[12000] w-56 rounded-xl border border-[var(--line)] bg-[var(--bg-panel)] p-1.5 shadow-xl"
      onPointerDown={(event) => event.stopPropagation()}
    >
      {target.kind === "panel" && (
        <>
          <button type="button" role="menuitem" className={ITEM_CLASS} onClick={() => { actions.newChat(); close(); }}>
            <PenLine size={14} className="text-[var(--md-sys-color-primary)]" />
            新建对话
          </button>
          <button type="button" role="menuitem" className={ITEM_CLASS} onClick={() => { actions.newProject(); close(); }}>
            <FolderPlus size={14} className="text-[var(--md-sys-color-primary)]" />
            新建项目
          </button>
        </>
      )}

      {target.kind === "project" && (
        <>
          <div className="truncate px-2.5 py-1 text-[11px] text-[var(--ink-faint)]">{target.folder.name}</div>
          <button type="button" role="menuitem" className={ITEM_CLASS} onClick={() => { actions.newChatInProject(target.folder.id); close(); }}>
            <PenLine size={14} className="text-[var(--md-sys-color-primary)]" />
            在此新建对话
          </button>
          <button type="button" role="menuitem" className={ITEM_CLASS} onClick={() => { actions.renameProject(target.folder.id); close(); }}>
            <PenLine size={14} />
            重命名项目
          </button>
          {target.folder.system ? null : (
            <button
              type="button"
              role="menuitem"
              className={`${ITEM_CLASS} text-[var(--md-sys-color-error)]`}
              onClick={() => { actions.deleteProject(target.folder.id); close(); }}
            >
              <Trash2 size={14} />
              删除项目
            </button>
          )}
        </>
      )}

      {session && (
        <>
          <div className="truncate px-2.5 py-1 text-[11px] text-[var(--ink-faint)]">{session.title || "新对话"}</div>
          <button type="button" role="menuitem" className={ITEM_CLASS} onClick={() => { actions.renameSession(session.id); close(); }}>
            <PenLine size={14} />
            重命名
          </button>
          {!systemSession && userProjects.length > 0 && (
            <>
              <div className="px-2.5 pb-0.5 pt-1.5 text-[11px] text-[var(--ink-faint)]">移动到项目</div>
              {userProjects.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] text-[var(--ink)] hover:bg-[var(--bg-muted)]"
                  onClick={() => { actions.moveSession(session.id, folder.id); close(); }}
                >
                  <Folder size={13} />
                  {folder.name}
                </button>
              ))}
              {session.folderId ? (
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] text-[var(--ink)] hover:bg-[var(--bg-muted)]"
                  onClick={() => { actions.moveSession(session.id, null); close(); }}
                >
                  <ChevronRight size={13} />
                  移出项目
                </button>
              ) : null}
            </>
          )}
          {systemSession ? (
            <p className="px-2.5 pb-1 pt-0.5 text-[10.5px] leading-relaxed text-[var(--ink-faint)]">
              这一组由来源决定（{session.kind === "note" ? "笔记窗内的 Agent" : "划词助手"}），不能改挂到别的项目。
            </p>
          ) : null}
          <button
            type="button"
            role="menuitem"
            className={ITEM_CLASS}
            onClick={() => { actions.archiveSession(session.id, true); close(); }}
          >
            <Archive size={14} className="text-[var(--md-sys-color-primary)]" />
            归档
          </button>
        </>
      )}

      {pendingDeleteId ? (
        <div
          data-testid="session-delete-confirm"
          className="mt-1 rounded-lg border border-[color-mix(in_srgb,var(--md-sys-color-error)_45%,transparent)] p-2"
        >
          <p className="text-[11.5px] leading-relaxed text-[var(--md-sys-color-error)]">
            删除后云端记录一并删除，无法恢复。
          </p>
          <div className="mt-1.5 flex items-center justify-end gap-1.5">
            <button
              type="button"
              className="rounded-md px-2 py-1 text-[11.5px] text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
              onClick={onCancelDelete}
            >
              取消
            </button>
            <button
              type="button"
              className="rounded-md bg-[var(--md-sys-color-error)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--md-sys-color-on-error)]"
              onClick={() => onConfirmDelete(pendingDeleteId)}
            >
              删除
            </button>
          </div>
        </div>
      ) : session ? (
        <button
          type="button"
          role="menuitem"
          className={`${ITEM_CLASS} text-[var(--md-sys-color-error)]`}
          onClick={() => onRequestDelete(session.id)}
        >
          <Trash2 size={14} />
          删除对话
        </button>
      ) : null}
    </div>,
    document.body,
  );
}