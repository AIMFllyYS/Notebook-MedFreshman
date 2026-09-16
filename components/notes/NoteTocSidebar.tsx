"use client";

import clsx from "clsx";
import { PanelLeftClose } from "lucide-react";
import type { NoteTocItem } from "@/lib/notes/noteToc";

export default function NoteTocSidebar({
  items,
  onSelect,
  onHide,
}: {
  items: NoteTocItem[];
  onSelect: (item: NoteTocItem) => void;
  onHide: () => void;
}) {
  return (
    <nav className="user-note-toc" aria-label="笔记目录">
      <div className="user-note-toc-head" data-no-drag>
        <span>目录</span>
        <button
          type="button"
          data-no-drag
          className="user-note-chrome-btn"
          title="隐藏目录"
          aria-label="隐藏目录"
          onClick={onHide}
        >
          <PanelLeftClose size={13} />
        </button>
      </div>
      <div className="user-note-toc-list" data-no-drag>
        {items.length === 0 ? (
          <p className="user-note-toc-empty">写上标题后会出现目录。</p>
        ) : (
          items.map((item) => (
            <button
              key={`${item.id}:${item.line}`}
              type="button"
              data-no-drag
              className={clsx("user-note-toc-item", `is-h${item.level}`)}
              onClick={() => onSelect(item)}
            >
              {item.title}
            </button>
          ))
        )}
      </div>
    </nav>
  );
}
