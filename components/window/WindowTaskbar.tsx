"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Plus, Link2, Upload, BookOpen, Layers, FileDigit, MonitorPlay } from "lucide-react";
import { useWindowManager, type ManagedWindow } from "@/lib/hooks/useWindowManager";
import NotebookFormulaIcon from "@/components/icons/NotebookFormulaIcon";
import { createAndOpenNote, openArtifactImportPicker, openDocumentImportPicker, openFlashcardCitePicker, openNoteLibrary } from "@/lib/notes/openUserNote";
import OverflowMenu from "@/components/window/OverflowMenu";
import { WindowTypeIcon } from "@/components/window/WindowTypeIcon";
import { fileTypeAccent } from "@/components/icons/file-types/FileTypeIcon";
import { ACCEPTED_DOCUMENT_FILE_TYPES, filesToAttachments, MAX_LOCAL_FILE_SIZE, type AttachmentPreview, type ImageAttachmentPreview } from "@/lib/ai/imageUtils";
import { attachmentPreviewKind } from "@/lib/chat/attachmentPreviewKind";
import { openAttachmentPreview } from "@/lib/chat/openAttachmentPreview";
import { openSourcePreview } from "@/lib/chat/openSourcePreview";

interface WindowTaskbarProps {
  host: "topbar" | "content-tab";
}

const ICON_SLOT = 32;

type TaskbarTooltip = {
  win: ManagedWindow;
  right: number;
  top: number;
};

function taskbarAccent(win: ManagedWindow): string | undefined {
  if (win.type !== "attachment-preview") return undefined;
  return fileTypeAccent(win.data as { kind?: string; mimeType?: string; name?: string });
}

function previewKind(attachment: AttachmentPreview) {
  const name = isImagePreview(attachment) ? attachment.file.name : attachment.name;
  return attachmentPreviewKind({ name, mimeType: attachment.mimeType });
}

function previewContent(attachment: AttachmentPreview): string {
  if (isImagePreview(attachment)) return attachment.base64;
  if (attachment.type === "local-file") return attachment.dataUrl;
  return attachment.previewUrl || attachment.text;
}

function isImagePreview(attachment: AttachmentPreview): attachment is ImageAttachmentPreview {
  return attachment.type !== "document" && attachment.type !== "local-file";
}

function FileErrorDialog({ message, onClose }: { message: string; onClose: () => void }) {
  return createPortal(
    <div className="app-dialog-backdrop">
      <div role="alertdialog" aria-modal="true" aria-label="文件添加失败" className="app-dialog">
        <div className="app-dialog-eyebrow">文件添加提醒</div>
        <h2>文件无法添加</h2>
        <p>{message}</p>
        <button type="button" className="app-dialog-confirm" onClick={onClose}>知道了</button>
      </div>
    </div>,
    document.body,
  );
}

function AddContentButton() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const updateMenuPosition = () => {
    const button = buttonRef.current;
    if (!button || typeof window === "undefined") return;
    const rect = button.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 8,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  };

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const reposition = () => updateMenuPosition();
    document.addEventListener("pointerdown", close);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    updateMenuPosition();
    return () => {
      document.removeEventListener("pointerdown", close);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open]);

  const handleFiles = async (files: File[]) => {
    const { attachments, errors } = await filesToAttachments(files, { maxFileSize: MAX_LOCAL_FILE_SIZE });
    attachments.forEach((attachment, index) => {
      const originalName = isImagePreview(attachment) ? attachment.file.name : attachment.name;
      const kind = previewKind(attachment);
      const name = kind === "html" ? `HTML · ${originalName}` : originalName;
      openAttachmentPreview(`topbar:${originalName}:${attachment.file.lastModified}:${index}`, {
        name,
        mimeType: attachment.mimeType,
        kind,
        content: previewContent(attachment),
      });
    });
    if (errors.length > 0) setFileError(errors[0]);
    setOpen(false);
  };

  const addUrl = () => {
    const raw = url.trim();
    if (!raw) return;
    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error();
      const isHtml = /\.html?(?:$|[?#])/i.test(parsed.pathname);
      openSourcePreview({ url: parsed.toString(), title: `${isHtml ? "HTML" : "网址"} · ${parsed.hostname}` });
      setUrl("");
      setUrlError(null);
      setOpen(false);
    } catch {
      setUrlError("请输入有效的 http:// 或 https:// 地址");
    }
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-label="添加内容"
        aria-expanded={open}
        title="添加笔记、闪卡、文件或网址"
        onClick={() => {
          setOpen((value) => {
            const next = !value;
            if (next) requestAnimationFrame(updateMenuPosition);
            return next;
          });
          setUrlError(null);
        }}
        className={clsx(
          "window-taskbar-add relative flex h-7 w-7 items-center justify-center rounded-lg border shadow-sm transition-all",
          open
            ? "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)]"
            : "border-[color-mix(in_srgb,var(--md-sys-color-primary)_42%,var(--line))] bg-[var(--bg-elevated)] text-[var(--md-sys-color-primary)] hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--bg-muted)]",
        )}
      >
        <Plus size={15} strokeWidth={2.3} />
      </button>
      <input
        ref={fileRef}
        type="file"
        accept={`image/jpeg,image/png,image/gif,image/webp,${ACCEPTED_DOCUMENT_FILE_TYPES}`}
        multiple
        hidden
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length > 0) void handleFiles(files);
        }}
      />
      {open && menuPosition && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          role="menu"
          aria-label="添加内容"
          style={{ position: "fixed", top: menuPosition.top, right: menuPosition.right }}
          className="window-taskbar-add-menu z-[12000] w-64 rounded-xl border border-[var(--line)] bg-[var(--bg-panel)] p-2 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              createAndOpenNote();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] text-[var(--ink)] hover:bg-[var(--bg-muted)]"
          >
            <NotebookFormulaIcon size={14} className="text-[var(--md-sys-color-primary)]" />
            <span><strong className="font-semibold">新建笔记</strong><small className="ml-1 text-[var(--ink-soft)]">Markdown · 公式</small></span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              openNoteLibrary({ intent: "cite" });
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] text-[var(--ink)] hover:bg-[var(--bg-muted)]"
          >
            <BookOpen size={14} className="text-[var(--md-sys-color-primary)]" />
            <span><strong className="font-semibold">选择笔记</strong><small className="ml-1 text-[var(--ink-soft)]">引用我的 / 课程笔记</small></span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              openFlashcardCitePicker();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] text-[var(--ink)] hover:bg-[var(--bg-muted)]"
          >
            <Layers size={14} className="text-[var(--md-sys-color-primary)]" />
            <span><strong className="font-semibold">复习闪卡页面</strong><small className="ml-1 text-[var(--ink-soft)]">管理记忆卡</small></span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              openDocumentImportPicker();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] text-[var(--ink)] hover:bg-[var(--bg-muted)]"
          >
            <FileDigit size={14} className="text-[var(--md-sys-color-primary)]" />
            <span><strong className="font-semibold">导入长文本</strong><small className="ml-1 text-[var(--ink-soft)]">Agent 讲义</small></span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              openArtifactImportPicker();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] text-[var(--ink)] hover:bg-[var(--bg-muted)]"
          >
            <MonitorPlay size={14} className="text-[var(--md-sys-color-primary)]" />
            <span><strong className="font-semibold">导入可交互 HTML</strong><small className="ml-1 text-[var(--ink-soft)]">Agent 演示</small></span>
          </button>
          <div className="my-1 border-t border-[var(--line)]" />
          <button type="button" role="menuitem" onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] text-[var(--ink)] hover:bg-[var(--bg-muted)]">
            <Upload size={14} className="text-[var(--md-sys-color-primary)]" />
            <span><strong className="font-semibold">添加文件</strong><small className="ml-1 text-[var(--ink-soft)]">PDF、文本、代码</small></span>
          </button>
          <div className="my-1 border-t border-[var(--line)]" />
          <div className="flex items-center gap-1.5 px-1">
            <Link2 size={14} className="shrink-0 text-[var(--md-sys-color-primary)]" />
            <input
              value={url}
              onChange={(event) => { setUrl(event.target.value); setUrlError(null); }}
              onKeyDown={(event) => { if (event.key === "Enter") addUrl(); }}
              placeholder="输入网址…"
              aria-label="网址"
              className="min-w-0 flex-1 rounded-md border border-[var(--line)] bg-[var(--bg-muted)] px-2 py-1.5 text-[12px] text-[var(--ink)] outline-none focus:border-[var(--md-sys-color-primary)]"
            />
            <button type="button" onClick={addUrl} className="rounded-md bg-[var(--md-sys-color-primary)] px-2 py-1.5 text-[11px] font-medium text-[var(--md-sys-color-on-primary)]">打开</button>
          </div>
          {urlError ? <p className="px-1 pt-1 text-[10px] text-[var(--md-sys-color-error)]">{urlError}</p> : null}
          <p className="px-1 pt-1.5 text-[10px] leading-relaxed text-[var(--ink-faint)]">笔记、闪卡、长文本和演示都从本机仓库打开，不会重新生成。</p>
        </div>,
        document.body,
      )}
      {fileError && typeof document !== "undefined" ? <FileErrorDialog message={fileError} onClose={() => setFileError(null)} /> : null}
    </div>
  );
}

export function partitionTaskbarWindows(
  windows: ManagedWindow[],
  host: WindowTaskbarProps["host"],
  width: number,
) {
  void host;
  if (windows.length === 0) return { visible: [] as ManagedWindow[], overflow: [] as ManagedWindow[] };
  const maxWidth = Math.max(0, width);
  if (maxWidth < ICON_SLOT) return { visible: [] as ManagedWindow[], overflow: windows };

  const needsOverflow = windows.length * ICON_SLOT > maxWidth;
  const overflowSlot = needsOverflow ? 1 : 0;
  const maxVisible = Math.max(0, Math.floor(maxWidth / ICON_SLOT) - overflowSlot);
  return {
    visible: windows.slice(0, maxVisible),
    overflow: windows.slice(maxVisible),
  };
}

export default function WindowTaskbar({ host }: WindowTaskbarProps) {
  const windows = useWindowManager((state) => state.windows);
  const { minimizeWindow, restoreWindow } = useWindowManager();
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const [tooltip, setTooltip] = useState<TaskbarTooltip | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const { visible, overflow } = useMemo(() => {
    return partitionTaskbarWindows(windows, host, width);
  }, [host, width, windows]);

  const toggle = (id: string) => {
    const win = useWindowManager.getState().windows.find((item) => item.id === id);
    if (!win) return;
    if (win.minimized) restoreWindow(id);
    else minimizeWindow(id);
  };

  const showTooltip = (win: ManagedWindow, node: HTMLElement) => {
    const rect = node.getBoundingClientRect();
    setTooltip({
      win,
      right: Math.max(8, window.innerWidth - rect.right),
      top: rect.bottom + 6,
    });
  };

  const activeTooltip = tooltip && windows.some((win) => win.id === tooltip.win.id) ? tooltip : null;

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      <motion.div
        ref={ref}
        layoutId="window-taskbar"
        className="flex min-w-0 flex-1 flex-row-reverse items-center gap-1 overflow-visible"
        transition={{ type: "spring", stiffness: 480, damping: 38 }}
      >
        {overflow.length > 0 && <OverflowMenu windows={overflow} onToggle={toggle} />}
        {visible.map((win) => (
          <button
            key={win.id}
            type="button"
            onClick={() => toggle(win.id)}
            onPointerEnter={(event) => showTooltip(win, event.currentTarget)}
            onPointerLeave={() => setTooltip(null)}
            onFocus={(event) => showTooltip(win, event.currentTarget)}
            onBlur={() => setTooltip(null)}
            aria-label={win.title}
            className={clsx(
              "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[var(--ink-soft)] shadow-sm transition-colors",
              "border-[color-mix(in_srgb,var(--line)_88%,var(--md-sys-color-primary)_12%)] bg-[var(--bg-elevated)]",
              "hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--bg-muted)]",
              !taskbarAccent(win) && "hover:text-[var(--md-sys-color-primary)]",
              !taskbarAccent(win) && !win.minimized && "text-[var(--md-sys-color-primary)]",
            )}
          >
            <WindowTypeIcon type={win.type} icon={win.icon} data={win.data} size={15} />
            <span
              className={clsx(
                "absolute bottom-0.5 left-1/2 h-0.5 -translate-x-1/2 rounded-full transition-all",
                win.minimized ? "w-4" : "w-2",
                !taskbarAccent(win) && (win.minimized ? "bg-[var(--md-sys-color-primary)]" : "bg-[var(--ink-faint)]"),
              )}
              style={taskbarAccent(win) ? { background: taskbarAccent(win) } : undefined}
            />
            {win.badge && win.badge > 1 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--md-sys-color-primary)] px-1 text-[10px] font-semibold leading-none text-[var(--md-sys-color-on-primary)]">
                {win.badge}
              </span>
            )}
          </button>
        ))}
      </motion.div>
      <AddContentButton />
      {activeTooltip && typeof document !== "undefined" && createPortal(
        <div
          role="tooltip"
          style={{ position: "fixed", right: activeTooltip.right, top: activeTooltip.top }}
          className="pointer-events-none z-[11000] w-max max-w-[min(70vw,28rem)] truncate whitespace-nowrap rounded-md border border-[var(--line)] bg-[var(--bg-panel)] px-2 py-1 text-[12px] text-[var(--ink)] opacity-100 shadow-lg"
        >
          {activeTooltip.win.title}
        </div>,
        document.body,
      )}
    </div>
  );
}
