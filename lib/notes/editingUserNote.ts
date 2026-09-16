/** 笔记编辑窗交给 Agent 的上下文（纯函数，服务端 / 客户端都能用）。 */

export interface EditingUserNoteContext {
  id: string;
  title: string;
  markdown: string;
}

/** 写入 system 易变段的正文上限，避免一篇长笔记撑爆前缀后的定位段。 */
export const EDITING_NOTE_CONTEXT_MAX_CHARS = 8000;

/** 把正在编辑的个人笔记编进 Agent 易变上下文；写回仍走 updateUserNote。 */
export function formatEditingUserNoteContext(note: EditingUserNoteContext): string {
  const title = note.title.trim() || "无标题笔记";
  const markdown =
    note.markdown.length > EDITING_NOTE_CONTEXT_MAX_CHARS
      ? `${note.markdown.slice(0, EDITING_NOTE_CONTEXT_MAX_CHARS)}\n\n…（笔记较长，已截断；写回时请给出完整正文）`
      : note.markdown;
  return [
    `【正在编辑的个人笔记】id=${note.id} 标题「${title}」。`,
    "学生从笔记编辑窗打开了你。请用 updateUserNote 直接改这篇笔记的 markdown，不要调用 commitNotes 或 writeDocument 另开一篇。",
    "",
    markdown,
  ].join("\n");
}
