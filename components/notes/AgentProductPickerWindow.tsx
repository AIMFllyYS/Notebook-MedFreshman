"use client";

import { useMemo } from "react";
import { FileDigit, MonitorPlay } from "lucide-react";
import ManagedWindow from "@/components/window/ManagedWindow";
import DocumentWorkspace from "@/components/window/DocumentWorkspace";
import { useAgentProductPicker } from "@/lib/stores/agentProductPicker";
import { useArtifacts } from "@/lib/stores/artifacts";
import { useDocuments } from "@/lib/stores/documents";
import { useWindowManager } from "@/lib/stores/windowManager";
import { AGENT_PRODUCT_PICKER_WINDOW_ID } from "@/lib/notes/userNote";

function formatUpdatedAt(timestamp: number): string {
  const date = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AgentProductPickerWindow() {
  const open = useAgentProductPicker((s) => s.open);
  if (!open) return null;
  return <AgentProductPicker />;
}

function AgentProductPicker() {
  const managed = useWindowManager((s) => s.windows.find((w) => w.id === AGENT_PRODUCT_PICKER_WINDOW_ID));
  const kind = useAgentProductPicker((s) => s.kind);
  const closePicker = useAgentProductPicker((s) => s.closePicker);
  const documents = useDocuments((s) => s.byId);
  const artifacts = useArtifacts((s) => s.byId);
  const artifactOrder = useArtifacts((s) => s.order);
  const openDocument = useDocuments((s) => s.openViewer);
  const openArtifact = useArtifacts((s) => s.openViewer);

  const documentItems = useMemo(
    () =>
      Object.values(documents)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((doc) => ({
          id: doc.id,
          title: doc.spec.title || "未命名长文本",
          meta: `${formatUpdatedAt(doc.updatedAt)} · ${doc.status === "done" ? "已完成" : "生成中"}`,
        })),
    [documents],
  );

  const artifactItems = useMemo(
    () =>
      artifactOrder
        .map((id) => artifacts[id])
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .map((art) => ({
          id: art.id,
          title: art.title || "未命名演示",
          meta: "可交互 HTML",
        })),
    [artifactOrder, artifacts],
  );

  const items = kind === "document" ? documentItems : artifactItems;

  if (!managed) return null;

  return (
    <ManagedWindow
      windowId={AGENT_PRODUCT_PICKER_WINDOW_ID}
      title={managed.title}
      icon={kind === "document" ? <FileDigit size={15} /> : <MonitorPlay size={15} />}
      onClose={closePicker}
      fullscreenTarget="notes"
      minSize={{ minW: 480, minH: 340 }}
      overlayId="agent-product-picker"
      bodyClassName="flex min-h-0 min-w-0 flex-1 overflow-hidden"
      unmountWhenMinimized
    >
      {items.length === 0 ? (
        <div className="user-note-stage">
          <p className="user-note-empty">
            {kind === "document"
              ? "还没有长文本。在对话里让 Agent 调用「撰写长文档」（writeDocument）后会出现在这里。"
              : "还没有可交互 HTML。在对话里让 Agent 调用「生成可交互演示」（renderInteractive）后会出现在这里。"}
          </p>
        </div>
      ) : (
        <DocumentWorkspace
          outlineLabel={kind === "document" ? "长文本" : "可交互 HTML"}
          outline={items.map((item) => ({
            id: item.id,
            title: item.title,
            meta: item.meta,
          }))}
          activeId=""
          onSelect={(id) => {
            if (kind === "document") openDocument(id);
            else openArtifact(id);
            closePicker();
          }}
          emptyLabel={kind === "document" ? "还没有长文本" : "还没有可交互 HTML"}
        >
          <div className="user-note-stage">
            <p className="user-note-empty">点左侧条目即可打开已有产物，不会重新生成。</p>
          </div>
        </DocumentWorkspace>
      )}
    </ManagedWindow>
  );
}
