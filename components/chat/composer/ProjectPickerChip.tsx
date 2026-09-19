"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Folder, FolderPlus, X } from "lucide-react";
import AnchoredMenu from "@/components/ui/AnchoredMenu";
import { useChatHistory } from "@/lib/hooks/useChatHistory";
import { buildProjectViews, recentProjects } from "@/lib/agent/projectViews";

/**
 * 输入框右下角的项目 chip：默认 No Projects（= 对话进 Recents）。
 *
 * 语义：
 * - 点某个项目 → 既改「下次新建对话的落点」（activeProjectId），也把**当前这条**会话挂过去；
 * - 空白新对话同样直接挂，用户不用再回左栏拖一次；
 * - 系统项目的会话（笔记记录 / 划词摘录）不允许改挂，store 层会拒绝。
 */
export default function ProjectPickerChip() {
  const folders = useChatHistory((s) => s.folders);
  const sessionsMeta = useChatHistory((s) => s.sessionsMeta);
  const activeSessionId = useChatHistory((s) => s.activeSessionId);
  const activeProjectId = useChatHistory((s) => s.activeProjectId);
  const setActiveProject = useChatHistory((s) => s.setActiveProject);
  const createFolder = useChatHistory((s) => s.createFolder);
  const moveSessionToFolder = useChatHistory((s) => s.moveSessionToFolder);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState("");

  const recent = useMemo(() => recentProjects(buildProjectViews(folders, sessionsMeta), 5), [folders, sessionsMeta]);
  const activeSession = sessionsMeta.find((session) => session.id === activeSessionId) ?? null;
  const currentProjectId = activeSession ? (activeSession.folderId ?? null) : activeProjectId;
  const currentName = folders.find((folder) => folder.id === currentProjectId)?.name ?? null;

  const apply = (projectId: string | null) => {
    setActiveProject(projectId);
    if (activeSession) moveSessionToFolder(activeSession.id, projectId);
  };

  const commitNewProject = (close: () => void) => {
    const name = draft.trim();
    const id = createFolder(name || undefined);
    apply(id);
    setDraft("");
    setCreating(false);
    close();
  };

  return (
    <AnchoredMenu
      label="对话所属项目"
      placement="top"
      width={248}
      className="chat-input-project-chip"
      testId="composer-project-chip"
      trigger={
        <>
          <Folder size={12} />
          <span className="chat-input-project-chip-text">{currentName ?? "No Projects"}</span>
          <ChevronDown size={11} />
        </>
      }
    >
      {(close) => (
        <>
          <div className="app-menu-heading">最近项目</div>
          {recent.length === 0 ? (
            <p className="px-2.5 py-1.5 text-[11.5px] text-[var(--ink-faint)]">还没有项目，先建一个。</p>
          ) : (
            recent.map((project) => (
              <button
                key={project.id}
                type="button"
                role="menuitemradio"
                aria-checked={project.id === currentProjectId}
                data-testid={`composer-project-option-${project.id}`}
                className="app-menu-item"
                onClick={() => {
                  apply(project.id);
                  close();
                }}
              >
                <span className="app-menu-check"><Folder size={13} /></span>
                <span>{project.name}<small>{project.sessions.length} 个对话</small></span>
              </button>
            ))
          )}
          <div className="app-menu-separator" />
          {creating ? (
            <div className="flex items-center gap-1.5 px-1.5 py-1">
              <input
                autoFocus
                value={draft}
                aria-label="新项目名称"
                data-testid="composer-project-name"
                placeholder="项目名称"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") commitNewProject(close);
                  if (event.key === "Escape") setCreating(false);
                }}
                className="min-w-0 flex-1 rounded-md border border-[var(--line)] bg-[var(--bg-muted)] px-2 py-1 text-[12px] text-[var(--ink)] outline-none"
              />
              <button
                type="button"
                data-testid="composer-project-create"
                onClick={() => commitNewProject(close)}
                className="shrink-0 rounded-md bg-[var(--md-sys-color-primary)] px-2 py-1 text-[11.5px] font-medium text-[var(--md-sys-color-on-primary)]"
              >
                建
              </button>
            </div>
          ) : (
            <button
              type="button"
              role="menuitem"
              data-testid="composer-project-add"
              className="app-menu-item"
              onClick={() => setCreating(true)}
            >
              <span className="app-menu-check"><FolderPlus size={13} /></span>
              <span>添加新项目<small>建好后当前对话就归它</small></span>
            </button>
          )}
          {currentProjectId ? (
            <button
              type="button"
              role="menuitem"
              data-testid="composer-project-clear"
              className="app-menu-item"
              onClick={() => {
                apply(null);
                close();
              }}
            >
              <span className="app-menu-check"><X size={13} /></span>
              <span>不使用项目<small>回到 Recents</small></span>
            </button>
          ) : null}
        </>
      )}
    </AnchoredMenu>
  );
}