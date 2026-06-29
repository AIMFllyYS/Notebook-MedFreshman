"use client";

import { createPortal } from "react-dom";
import { X, Keyboard } from "lucide-react";
import { useShortcutHelp } from "@/lib/keyboard/useShortcutHelp";
import { useOverlayRegistration } from "@/lib/keyboard/useOverlayRegistration";
import { SHORTCUTS, SHORTCUT_CATEGORIES } from "@/lib/keyboard/shortcuts";
import { formatShortcut } from "@/lib/keyboard/format";
import { useKeyboardSettings } from "@/lib/keyboard/useKeyboardSettings";

export default function ShortcutHelpOverlay() {
  const open = useShortcutHelp((s) => s.open);
  const setOpen = useShortcutHelp((s) => s.setOpen);
  const isEnabled = useKeyboardSettings((s) => s.isEnabled);

  useOverlayRegistration({
    id: "shortcut-help",
    open,
    onClose: () => setOpen(false),
    priority: 100,
  });

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/25 backdrop-blur-[2px]"
      onPointerDown={() => setOpen(false)}
    >
      <div
        className="mx-auto flex max-h-[min(80vh,640px)] w-[min(560px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-panel)] shadow-2xl"
        onPointerDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="快捷键帮助"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--line)] px-4 py-3">
          <div className="flex items-center gap-2">
            <Keyboard size={18} className="text-[var(--md-sys-color-primary)]" />
            <span className="text-[15px] font-bold text-[var(--ink)]">快捷键参考</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-7 w-7 place-items-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
            title="关闭"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {SHORTCUT_CATEGORIES.map((cat) => {
            const items = SHORTCUTS.filter((s) => s.category === cat.id);
            if (items.length === 0) return null;
            return (
              <div key={cat.id} className="mb-4 last:mb-0">
                <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-[var(--ink-faint)]">
                  {cat.label}
                </h3>
                <div className="flex flex-col gap-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5"
                      style={{ opacity: isEnabled(item.id) ? 1 : 0.45 }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium text-[var(--ink)]">{item.label}</div>
                        <div className="text-[11.5px] text-[var(--ink-faint)]">{item.description}</div>
                      </div>
                      <kbd className="shrink-0 rounded-md border border-[var(--line)] bg-[var(--bg-muted)] px-2 py-0.5 font-mono text-[11px] text-[var(--ink-soft)]">
                        {formatShortcut(item.id)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
