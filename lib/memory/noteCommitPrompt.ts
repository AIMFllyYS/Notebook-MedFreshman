// 写小笔记的共享文案：稳定 system（global.md）讲体例，
// 确认后的撰写指令只放在旁路请求的最后一条 user 消息里，避免改 system 前缀、打穿 cache。

export const NOTE_COMMIT_STYLE =
  "笔记是给学生自己看的短记忆提纲，不是讲义、不是课堂纪要、不是长文。" +
  "核心知识点用 1. 2. 3. 4. 这样的有序列表，或一张对照表；不要写成大段散文。" +
  "只有内容明显分块时才用多级标题分段；默认不要叠很多标题。" +
  "不要写非常详细的 Markdown：少用引用块、折叠、指令块和长代码；公式用 $KaTeX$ 即可。" +
  "一篇以一屏内能扫完为准。";

export function buildNoteCommitPrompt(title?: string): string {
  const heading = title?.trim() || "课堂要点";
  return [
    `用户已确认把这次对话整理成个人短笔记。请立即调用 commitNotes，标题用「${heading}」。`,
    NOTE_COMMIT_STYLE,
    "不要再调用 proposeMemory，不要调用 writeDocument，不要在聊天正文里重复笔记全文。",
  ].join("");
}
