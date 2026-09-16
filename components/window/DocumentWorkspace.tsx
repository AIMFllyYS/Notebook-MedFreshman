"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export interface DocumentOutlineItem {
  id: string;
  title: string;
  meta?: string;
  kindLabel?: string;
  /** 目录副文（如网页 URL）允许换行，避免长链接被截成省略号。 */
  metaWrap?: boolean;
}

function OutlineNav({
  outline,
  activeId,
  onSelect,
  outlineLabel,
  emptyLabel = "没有目录",
}: {
  outline: DocumentOutlineItem[];
  activeId: string;
  onSelect: (id: string) => void;
  outlineLabel: string;
  emptyLabel?: string;
}) {
  return (
    <nav className="note-citation-outline" aria-label={outlineLabel}>
      {outline.length === 0 ? (
        <p className="note-citation-status">{emptyLabel}</p>
      ) : (
        outline.map((item, index) => {
          const selected = item.id === activeId;
          return (
            <button
              key={`${item.id}::${index}`}
              type="button"
              data-no-drag
              className={clsx("note-citation-nav-item", selected && "is-active")}
              onClick={() => onSelect(item.id)}
            >
              {item.kindLabel ? (
                <span className="note-citation-nav-path">{item.kindLabel}</span>
              ) : null}
              <span className="note-citation-nav-title">{item.title}</span>
              {item.meta ? (
                <span className={clsx("note-citation-nav-path", item.metaWrap && "is-wrap")}>{item.meta}</span>
              ) : null}
            </button>
          );
        })
      )}
    </nav>
  );
}

function Stage({ toolbar, children }: { toolbar?: ReactNode; children: ReactNode }) {
  return (
    <div className="document-workspace-stage">
      {toolbar ? <div className="document-workspace-toolbar">{toolbar}</div> : null}
      <div className="document-workspace-body">{children}</div>
    </div>
  );
}

function FolderTreeResizeHandle() {
  return (
    <PanelResizeHandle
      data-no-drag
      data-testid="folder-tree-resize-handle"
      className="document-workspace-resize-handle is-vertical group relative outline-none"
    >
      <span className="absolute -bottom-1 -top-1 inset-x-0 z-10 cursor-row-resize" />
      <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 group-data-[resize-handle-state=drag]:opacity-100">
        <span className="block h-1 w-7 rounded-full bg-[var(--md-sys-color-primary)]/50" />
      </span>
    </PanelResizeHandle>
  );
}

function LeftPane({
  nav,
  folderTree,
}: {
  nav: ReactNode;
  folderTree?: ReactNode;
}) {
  if (!folderTree) {
    return <div className="note-citation-sidebar">{nav}</div>;
  }

  return (
    <div className="note-citation-sidebar has-folder-tree">
      <PanelGroup
        direction="vertical"
        autoSaveId="document-workspace-folder-tree"
        className="h-full min-h-0"
      >
        <Panel defaultSize={75} minSize={28} className="min-h-0">
          <div className="note-citation-outline-pane">{nav}</div>
        </Panel>
        <FolderTreeResizeHandle />
        <Panel defaultSize={25} minSize={14} maxSize={55} className="min-h-0">
          <div className="note-citation-folder-pane">{folderTree}</div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default function DocumentWorkspace({
  outline,
  activeId,
  onSelect,
  toolbar,
  children,
  outlineLabel = "目录",
  emptyLabel,
  resizable = false,
  folderTree,
}: {
  outline: DocumentOutlineItem[];
  activeId: string;
  onSelect: (id: string) => void;
  toolbar?: ReactNode;
  children: ReactNode;
  outlineLabel?: string;
  /** 目录为空时的说明。缺省「没有目录」。 */
  emptyLabel?: string;
  /** PDF / PPT 左右栏可拖拽缩放；笔记来源等保持固定目录宽。 */
  resizable?: boolean;
  /** 左侧列表下方的文件夹树（学年 → 学科），默认约 1/4 高，可上下拖。 */
  folderTree?: ReactNode;
}) {
  const nav = (
    <OutlineNav
      outline={outline}
      activeId={activeId}
      onSelect={onSelect}
      outlineLabel={outlineLabel}
      emptyLabel={emptyLabel}
    />
  );
  const left = <LeftPane nav={nav} folderTree={folderTree} />;
  const stage = <Stage toolbar={toolbar}>{children}</Stage>;

  if (!resizable) {
    return (
      <div className="note-citation-layout document-workspace">
        {left}
        {stage}
      </div>
    );
  }

  return (
    <PanelGroup
      direction="horizontal"
      autoSaveId="document-workspace"
      className="note-citation-layout document-workspace is-resizable"
    >
      <Panel defaultSize={24} minSize={14} maxSize={48} className="min-h-0 min-w-0">
        <div className="flex h-full min-h-0 min-w-0 flex-col">{left}</div>
      </Panel>
      <PanelResizeHandle
        data-no-drag
        data-testid="document-workspace-resize-handle"
        className="document-workspace-resize-handle group relative outline-none"
      >
        <span className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize" />
        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 group-data-[resize-handle-state=drag]:opacity-100">
          <span className="block h-7 w-1 rounded-full bg-[var(--md-sys-color-primary)]/50" />
        </span>
      </PanelResizeHandle>
      <Panel defaultSize={76} minSize={36} className="min-h-0 min-w-0">
        <div className="flex h-full min-h-0 min-w-0 flex-col">{stage}</div>
      </Panel>
    </PanelGroup>
  );
}
