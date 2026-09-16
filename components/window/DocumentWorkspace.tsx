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
    <nav className="note-citation-sidebar" aria-label={outlineLabel}>
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

export default function DocumentWorkspace({
  outline,
  activeId,
  onSelect,
  toolbar,
  children,
  outlineLabel = "目录",
  emptyLabel,
  resizable = false,
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
  const stage = <Stage toolbar={toolbar}>{children}</Stage>;

  if (!resizable) {
    return (
      <div className="note-citation-layout document-workspace">
        {nav}
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
        <div className="flex h-full min-h-0 min-w-0 flex-col">{nav}</div>
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
