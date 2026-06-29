"use client";

import { Keyboard } from "lucide-react";
import { SHORTCUTS, SHORTCUT_CATEGORIES } from "@/lib/keyboard/shortcuts";
import { formatShortcut } from "@/lib/keyboard/format";
import { useKeyboardSettings } from "@/lib/keyboard/useKeyboardSettings";
import { useShortcutHelp } from "@/lib/keyboard/useShortcutHelp";

function ShortcutSwitch({
  id,
  label,
  description,
}: {
  id: string;
  label: string;
  description: string;
}) {
  const enabled = useKeyboardSettings((s) => s.isEnabled(id));
  const setEnabled = useKeyboardSettings((s) => s.setEnabled);

  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-[var(--md-sys-color-surface-container-high)]">
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-[var(--md-sys-color-on-surface)]">{label}</div>
        <div className="text-[11.5px] text-[var(--md-sys-color-on-surface-variant)]">{description}</div>
      </div>
      <kbd className="hidden shrink-0 rounded border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--md-sys-color-on-surface-variant)] sm:inline">
        {formatShortcut(id)}
      </kbd>
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => setEnabled(id, e.target.checked)}
        className="h-4 w-4 shrink-0 accent-[var(--md-sys-color-primary)]"
        aria-label={`启用 ${label}`}
      />
    </label>
  );
}

export default function KeyboardShortcutsSettings() {
  const disabledCount = useKeyboardSettings((s) => s.disabledShortcuts.length);
  const enableAll = useKeyboardSettings((s) => s.enableAll);
  const disableAll = useKeyboardSettings((s) => s.disableAll);
  const setHelpOpen = useShortcutHelp((s) => s.setOpen);
  const total = SHORTCUTS.length;
  const enabledCount = total - disabledCount;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)]">
          已启用 {enabledCount} / {total}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={enableAll}
            className="rounded-full px-2.5 py-1 text-[11.5px] font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary-container)]"
          >
            全部启用
          </button>
          <button
            type="button"
            onClick={disableAll}
            className="rounded-full px-2.5 py-1 text-[11.5px] font-medium text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
          >
            全部关闭
          </button>
        </div>
      </div>

      {SHORTCUT_CATEGORIES.map((cat) => {
        const items = SHORTCUTS.filter((s) => s.category === cat.id);
        if (items.length === 0) return null;
        return (
          <div key={cat.id}>
            <div className="mb-1 px-2 text-[11px] font-bold uppercase tracking-wide text-[var(--md-sys-color-on-surface-variant)]">
              {cat.label}
            </div>
            <div className="flex flex-col">
              {items.map((item) => (
                <ShortcutSwitch
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  description={item.description}
                />
              ))}
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => setHelpOpen(true)}
        className="press flex items-center justify-center gap-2 rounded-xl border border-[var(--md-sys-color-outline-variant)] py-2.5 text-[12.5px] font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary-container)]"
      >
        <Keyboard size={14} />
        查看完整快捷键参考
        <kbd className="rounded border border-[var(--md-sys-color-outline-variant)] px-1.5 py-0.5 font-mono text-[10px]">
          {formatShortcut("global.shortcutHelp")}
        </kbd>
      </button>
    </div>
  );
}
