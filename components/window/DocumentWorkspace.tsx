"use client";

import type { ReactNode } from "react";
import clsx from "clsx";

export interface DocumentOutlineItem {
  id: string;
  title: string;
  meta?: string;
  kindLabel?: string;
}

export default function DocumentWorkspace({
  outline,
  activeId,
  onSelect,
  toolbar,
  children,
  outlineLabel = "目录",
}: {
  outline: DocumentOutlineItem[];
  activeId: string;
  onSelect: (id: string) => void;
  toolbar?: ReactNode;
  children: ReactNode;
  outlineLabel?: string;
}) {
  return (
    <div className="note-citation-layout document-workspace">
      <nav className="note-citation-sidebar" aria-label={outlineLabel}>
        {outline.length === 0 ? (
          <p className="note-citation-status">没有目录</p>
        ) : (
          outline.map((item) => {
            const selected = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                data-no-drag
                className={clsx("note-citation-nav-item", selected && "is-active")}
                onClick={() => onSelect(item.id)}
              >
                {item.kindLabel ? (
                  <span className="note-citation-nav-path">{item.kindLabel}</span>
                ) : null}
                <span className="note-citation-nav-title">{item.title}</span>
                {item.meta ? <span className="note-citation-nav-path">{item.meta}</span> : null}
              </button>
            );
          })
        )}
      </nav>
      <div className="document-workspace-stage">
        {toolbar ? <div className="document-workspace-toolbar">{toolbar}</div> : null}
        <div className="document-workspace-body">{children}</div>
      </div>
    </div>
  );
}
