"use client";

import { useMemo, useRef, useState } from "react";
import { FilePlus2, Link2, RefreshCw, Trash2 } from "lucide-react";
import ManagedWindow from "@/components/window/ManagedWindow";
import DocumentWorkspace, { type DocumentOutlineItem } from "@/components/window/DocumentWorkspace";
import FolderTreeRow from "@/components/layout/FolderTreeRow";
import FileTypeIcon, { resolveFileGlyphKind } from "@/components/icons/file-types/FileTypeIcon";
import AnchoredMenu from "@/components/ui/AnchoredMenu";
import { useProjectFiles, listProjectFiles } from "@/lib/stores/projectFiles";
import { useChatHistory } from "@/lib/hooks/useChatHistory";
import { localPathOf } from "@/lib/stores/imports";
import { importProjectFile } from "@/lib/project/import";
import { planCarry } from "@/lib/project/catalog";
import { searchStudioRefs } from "@/lib/project/studioRefs";
import type { ProjectFileEntry } from "@/lib/project/types";
import { projectFilesWindowId } from "@/lib/project/openProjectFiles";
import { useWindowManager } from "@/lib/hooks/useWindowManager";

function statusLabel(file: ProjectFileEntry): string {
  if (file.status === "parsing") return "解析中…";
  if (file.status === "error") return `解析失败：${file.error ?? "未知原因"}`;
  if (file.kind === "studio-ref") return "教材引用";
  return `${file.slices.length} 片 · ${file.charCount} 字`;
}

/**
 * 项目文件窗（Agent 右栏）。左边是文件树（文件 → .index.md → 切片），右边是索引或切片正文。
 *
 * 关键口径：**文件内容只在本机**。这里的解析产物不会上云；Agent 通过请求体携带的目录与「带入对话」的切片来读。
 */
export default function ProjectFilesWindow({ projectId }: { projectId: string }) {
  const windowId = projectFilesWindowId(projectId);
  const orders = useProjectFiles((s) => s.order);
  const byId = useProjectFiles((s) => s.byId);
  const setPinned = useProjectFiles((s) => s.setPinned);
  const removeFile = useProjectFiles((s) => s.removeFile);
  const addStudioRef = useProjectFiles((s) => s.addStudioRef);
  const projectName = useChatHistory((s) => s.folders.find((folder) => folder.id === projectId)?.name ?? null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [studioQuery, setStudioQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const files = useMemo(() => listProjectFiles({ order: orders, byId }, projectId), [byId, orders, projectId]);
  const carry = useMemo(() => planCarry(files, projectId), [files, projectId]);
  const activeFile = files.find((file) => activeKey?.startsWith(`${file.id}:`)) ?? files[0] ?? null;
  const activeSliceId = activeKey && activeFile && activeKey !== `${activeFile.id}:index`
    ? activeKey.slice(activeFile.id.length + 1)
    : null;

  const outline: DocumentOutlineItem[] = activeFile
    ? [
        {
          id: `${activeFile.id}:index`,
          title: ".index.md",
          kindLabel: "索引",
          meta: activeFile.name,
        },
        ...activeFile.slices.map((slice) => ({
          id: `${activeFile.id}:${slice.id}`,
          title: slice.title,
          kindLabel: slice.pinned ? "已带入" : undefined,
          meta: `${slice.chars} 字`,
        })),
      ]
    : [];

  const currentId = activeFile
    ? activeSliceId
      ? `${activeFile.id}:${activeSliceId}`
      : `${activeFile.id}:index`
    : "";

  const handleFiles = async (list: FileList | null) => {
    const picked = Array.from(list ?? []);
    if (picked.length === 0) return;
    for (const file of picked) {
      setBusy(file.name);
      await importProjectFile({ projectId, file, absPath: localPathOf(file) });
    }
    setBusy(null);
  };

  const results = useMemo(() => searchStudioRefs(studioQuery), [studioQuery]);

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2" data-no-drag>
      <span className="text-[11.5px] text-[var(--ink-faint)]" data-testid="project-carry-status">
        {carry.mode === "all"
          ? `已全部带入（${carry.totalSlices} 片 · ${carry.totalChars} 字）`
          : carry.mode === "pinned"
            ? `带入 ${carry.sliceIds.length} 片 / 共 ${carry.totalSlices} 片`
            : carry.totalSlices > 0
              ? `项目较大，暂未带入（共 ${carry.totalSlices} 片）：在切片行点「带入」`
              : "还没有可带入的内容"}
      </span>
      <button type="button" data-no-drag className="ml-auto flex items-center gap-1 rounded-lg border border-[var(--line-soft)] px-2 py-1 text-[12px] text-[var(--ink)] hover:border-[var(--accent)]" onClick={() => fileInputRef.current?.click()}>
        <FilePlus2 size={13} /> 添加文件
      </button>
      <AnchoredMenu
        label="引用 Studio 教材"
        trigger={<><Link2 size={13} /> 引用教材</>}
        width={280}
        className="flex items-center gap-1 rounded-lg border border-[var(--line-soft)] px-2 py-1 text-[12px] text-[var(--ink)] hover:border-[var(--accent)]"
      >
        {(close) => (
          <>
            <input
              autoFocus
              value={studioQuery}
              aria-label="搜索 Studio 教材"
              data-testid="project-studio-search"
              placeholder="搜标题，例如「上皮」"
              onChange={(event) => setStudioQuery(event.target.value)}
              className="mx-1.5 my-1 w-[calc(100%-0.75rem)] rounded-md border border-[var(--line)] bg-[var(--bg-muted)] px-2 py-1 text-[12px] text-[var(--ink)] outline-none"
            />
            {results.length === 0 ? (
              <p className="px-2.5 py-1.5 text-[11.5px] text-[var(--ink-faint)]">
                {studioQuery.trim() ? "没有匹配的教材或笔记" : "输入关键词搜索 Studio 内容"}
              </p>
            ) : (
              results.map((ref) => (
                <button
                  key={ref.path}
                  type="button"
                  role="menuitem"
                  data-testid={`project-studio-ref-${ref.path}`}
                  className="app-menu-item"
                  onClick={() => {
                    addStudioRef({ projectId, ref });
                    setStudioQuery("");
                    close();
                  }}
                >
                  <span className="app-menu-check"><Link2 size={13} /></span>
                  <span>{ref.title}<small>{ref.address}</small></span>
                </button>
              ))
            )}
          </>
        )}
      </AnchoredMenu>
      {activeFile ? (
        <>
          <button type="button" data-no-drag className="flex items-center gap-1 rounded-lg border border-[var(--line-soft)] px-2 py-1 text-[12px] text-[var(--ink)] hover:border-[var(--accent)]" onClick={() => fileInputRef.current?.click()} title="重新导入同名文件即可重新解析">
            <RefreshCw size={13} /> 重新导入
          </button>
          <button type="button" data-no-drag className="flex items-center gap-1 rounded-lg border border-[var(--line-soft)] px-2 py-1 text-[12px] text-[var(--md-sys-color-error)] hover:border-[var(--md-sys-color-error)]" onClick={() => removeFile(activeFile.id)}>
            <Trash2 size={13} /> 移除
          </button>
        </>
      ) : null}
    </div>
  );

  const folderTree = (
    <div className="flex flex-col gap-0.5 py-1" data-testid="project-file-tree">
      {files.length === 0 ? (
        <p className="px-3 py-2 text-[11.5px] leading-relaxed text-[var(--ink-faint)]">
          还没有文件。点「添加文件」导入本机文件，或「引用教材」软链接一条 Studio 内容。
          <br />（文件只在本机解析，不会上传。）
        </p>
      ) : (
        files.map((file) => (
          <FolderTreeRow
            key={file.id}
            depth={0}
            title={file.name}
            isSelected={file.id === activeFile?.id}
            icon={
              file.kind === "studio-ref"
                ? <Link2 size={14} />
                : <FileTypeIcon kind={resolveFileGlyphKind({ mimeType: file.mimeType, name: file.name })} mimeType={file.mimeType} name={file.name} size={15} />
            }
            titleAttr={statusLabel(file)}
            ariaLabel={file.name}
            onClick={() => setActiveKey(`${file.id}:index`)}
          />
        ))
      )}
    </div>
  );

  const body = !activeFile ? (
    <div className="flex h-full items-center justify-center px-6 text-center text-[12.5px] text-[var(--ink-soft)]">
      这个项目还没有文件。
    </div>
  ) : activeSliceId ? (
    (() => {
      const slice = activeFile.slices.find((item) => item.id === activeSliceId);
      if (!slice) return null;
      return (
        <div className="flex h-full flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] font-medium text-[var(--ink)]">{slice.title}</span>
            <span className="text-[11.5px] text-[var(--ink-faint)]">{slice.chars} 字</span>
            <button
              type="button"
              data-testid="project-slice-pin"
              className={`ml-auto rounded-lg border px-2 py-1 text-[11.5px] ${slice.pinned ? "border-[var(--accent)] text-[var(--accent-ink)]" : "border-[var(--line-soft)] text-[var(--ink-soft)]"}`}
              onClick={() => setPinned(activeFile.id, slice.id, !slice.pinned)}
              title={carry.mode === "all" ? "项目不大，已经全部带入" : "这一片是否随对话一起带给 Agent"}
            >
              {slice.pinned ? "已带入对话" : "带入对话"}
            </button>
          </div>
          <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap rounded-lg border border-[var(--line-soft)] bg-[var(--bg-panel)] p-3 text-[12.5px] leading-relaxed text-[var(--ink)]">
            {slice.text}
          </pre>
        </div>
      );
    })()
  ) : (
    <div className="flex h-full flex-col gap-2">
      <span className="text-[12.5px] font-medium text-[var(--ink)]">.index.md · 隐藏索引</span>
      <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap rounded-lg border border-[var(--line-soft)] bg-[var(--bg-panel)] p-3 text-[12px] leading-relaxed text-[var(--ink-soft)]">
        {activeFile.indexMarkdown || "（还没有索引：正在解析或解析失败）"}
      </pre>
    </div>
  );

  return (
    <ManagedWindow
      windowId={windowId}
      title={`项目文件 · ${projectName ?? "未命名项目"}`}
      icon={<FilePlus2 size={15} />}
      onClose={() => useWindowManager.getState().closeWindow(windowId)}
      fullscreenTarget="notes"
      minSize={{ minW: 520, minH: 360 }}
      overlayId="project-files"
      bodyClassName="flex min-h-0 min-w-0 flex-1 overflow-hidden"
      unmountWhenMinimized
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        data-testid="project-file-input"
        onChange={(event) => {
          void handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <DocumentWorkspace
        outlineLabel={activeFile ? activeFile.name : "切片"}
        outline={outline}
        activeId={currentId}
        onSelect={setActiveKey}
        toolbar={toolbar}
        folderTree={folderTree}
        emptyLabel="这个文件还没有切片"
      >
        {busy ? (
          <div role="status" className="flex h-full items-center justify-center text-[12.5px] text-[var(--ink-soft)]">
            正在解析 {busy}…
          </div>
        ) : (
          body
        )}
      </DocumentWorkspace>
    </ManagedWindow>
  );
}