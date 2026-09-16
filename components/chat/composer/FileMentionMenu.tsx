"use client";

import type { AttachedFileRef } from "@/lib/chat/composerIntent";
import { flattenFileMentions, type FileMentionGroup } from "@/lib/chat/fileMentions";
import { AgentFileIcon } from "@/components/icons/AgentIcons";

export interface FileMentionMenuProps {
  groups: FileMentionGroup[];
  activeIndex?: number;
  onSelect: (file: AttachedFileRef) => void;
}

export default function FileMentionMenu({ groups, activeIndex = 0, onSelect }: FileMentionMenuProps) {
  const flat = flattenFileMentions(groups);
  let cursor = -1;
  return (
    <div className="file-mention-menu" data-testid="file-mention-menu" role="listbox" aria-label="引用笔记">
      {groups.map((group) => (
        <div key={group.id}>
          <div className="app-menu-heading">{group.label}</div>
          {group.items.map((item) => {
            cursor += 1;
            return (
              <button
                key={item.path}
                type="button"
                role="option"
                aria-selected={cursor === activeIndex}
                className="app-menu-item"
                onClick={() => onSelect(item)}
              >
                <span className="app-menu-check"><AgentFileIcon size={14} /></span>
                <span>
                  {item.title}
                  <small>{item.address}</small>
                </span>
              </button>
            );
          })}
        </div>
      ))}
      {flat.length === 0 ? <div className="app-menu-heading">没有可引用的笔记</div> : null}
    </div>
  );
}
