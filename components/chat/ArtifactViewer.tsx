"use client";

/**
 * HTML 演示（Artifact）全局浮窗 —— 要改「右侧 Agent 里那个可视化 HTML」请改本文件。
 * AppShell 挂载，portal 到 document.body；既不属于右侧面板，也不属于中间笔记区。
 * 全屏对齐目标由设置 artifactFullscreenTarget 控制（默认笔记栏）。
 * 完整链路见 lib/ai/agent/tools.ts 的 renderInteractive 路径地图。
 */
import { Download, MonitorPlay } from "lucide-react";
import { useArtifacts } from "@/lib/hooks/useArtifacts";
import { useSettings } from "@/lib/hooks/useSettings";
import { downloadHtmlFile } from "@/lib/utils/downloadHtml";
import { openHtmlInNewTab } from "@/lib/utils/openHtmlInNewTab";
import ManagedWindow from "@/components/window/ManagedWindow";

function artifactWindowId(id: string) {
  return `artifact-viewer:${id}`;
}

export default function ArtifactViewer() {
  const viewerId = useArtifacts((s) => s.viewerId);
  const art = useArtifacts((s) => (s.viewerId ? s.byId[s.viewerId] : null));
  const closeViewer = useArtifacts((s) => s.closeViewer);
  const fullscreenTarget = useSettings((s) => s.artifactFullscreenTarget);

  if (!art || !viewerId) return null;

  return (
    <ManagedWindow
      windowId={artifactWindowId(viewerId)}
      title={art.title}
      icon={<MonitorPlay size={15} />}
      onClose={closeViewer}
      fullscreenTarget={fullscreenTarget}
      overlayId={`artifact-viewer-${viewerId}`}
      externalLink={{ onOpen: () => openHtmlInNewTab(art.html) }}
      actions={
        <button
          type="button"
          data-no-drag
          onClick={() => downloadHtmlFile(art.html, art.title)}
          title="下载 HTML"
          className="press flex h-7 w-7 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--md-sys-color-surface-variant)]"
        >
          <Download size={15} />
        </button>
      }
      bodyClassName="flex flex-col bg-white"
      unmountWhenMinimized
    >
      <iframe
        title={art.title}
        srcDoc={art.html}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-downloads"
        className="min-h-0 w-full flex-1 border-0 bg-white"
      />
    </ManagedWindow>
  );
}
