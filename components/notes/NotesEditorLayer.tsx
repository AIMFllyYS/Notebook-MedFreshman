"use client";

import NotesEditorWindow from "@/components/notes/NotesEditorWindow";
import { useWindowManager } from "@/lib/hooks/useWindowManager";

/**
 * 笔记编辑器窗口层。由 AppShell 全局挂载（portal 到 document.body），
 * 不属于右侧面板或笔记栏——见执行契约第六节第一条。
 */
export default function NotesEditorLayer() {
  // 选出稳定引用的 windows 再派生 id 列表：直接在 selector 里 filter+map 每次都返回新数组，
  // zustand v5 的 Object.is 比较会因此判定「状态变了」而无限重渲染。
  const windows = useWindowManager((s) => s.windows);
  const ids = windows.filter((win) => win.type === "notes-editor").map((win) => win.id);
  if (ids.length === 0) return null;
  return (
    <>
      {ids.map((id) => (
        <NotesEditorWindow key={id} windowId={id} />
      ))}
    </>
  );
}
