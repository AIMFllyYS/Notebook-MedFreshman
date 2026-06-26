"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, MonitorPlay, ExternalLink, Download } from "lucide-react";
import { useArtifacts } from "@/lib/hooks/useArtifacts";
import { downloadHtmlFile } from "@/lib/utils/downloadHtml";

/** 交互演示弹窗：在左侧以模态形式用 iframe 渲染 AI 生成的自包含 HTML。 */
export default function ArtifactViewer() {
  const viewerId = useArtifacts((s) => s.viewerId);
  const byId = useArtifacts((s) => s.byId);
  const closeViewer = useArtifacts((s) => s.closeViewer);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const art = viewerId ? byId[viewerId] : null;

  useEffect(() => {
    if (!art) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeViewer();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [art, closeViewer]);

  if (!mounted || !art) return null;

  const openExternal = () => {
    const url = URL.createObjectURL(new Blob([art.html], { type: "text/html" }));
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  return createPortal(
    <div
      onClick={closeViewer}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.42)",
        zIndex: 3000,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "3vh 24px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(860px, 72vw)",
          height: "94vh",
          marginLeft: "2vw",
          background: "var(--bg-panel)",
          borderRadius: 14,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
          border: "1px solid var(--line)",
        }}
      >
        <div
          className="flex shrink-0 items-center gap-2 border-b border-[var(--line)] px-4 py-2.5"
          style={{ background: "var(--bg-muted)" }}
        >
          <MonitorPlay size={15} className="text-[var(--accent-ink)]" />
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[var(--ink)]">
            {art.title}
          </span>
          <button
            onClick={() => downloadHtmlFile(art.html, art.title)}
            title="下载 HTML"
            className="press flex h-7 w-7 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-panel)]"
          >
            <Download size={15} />
          </button>
          <button
            onClick={openExternal}
            title="在新标签页打开"
            className="press flex h-7 w-7 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-panel)]"
          >
            <ExternalLink size={15} />
          </button>
          <button
            onClick={closeViewer}
            title="关闭"
            className="press flex h-7 w-7 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--bg-panel)]"
          >
            <X size={16} />
          </button>
        </div>
        <iframe
          title={art.title}
          srcDoc={art.html}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-downloads"
          className="min-h-0 w-full flex-1 border-0 bg-white"
        />
      </div>
    </div>,
    document.body,
  );
}
