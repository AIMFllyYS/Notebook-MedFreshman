// 用户笔记数据模型（单一真相源）。
//
// 与 content/ 下的教材笔记完全无关：这里是用户自己写的 Markdown，本机 IndexedDB 持久化，
// 不做云同步（与复习卡一致）。正文走 NoteRenderer 渲染管线，因此 `$...$` / `$$...$$` /
// `\ce{}` 都能直接生效。

export interface UserNote {
  id: string;
  title: string;
  markdown: string;
  subjectId: string; // 合法 SubjectId
  createdAt: number;
  updatedAt: number;
}

/** 新建笔记的缺省标题。 */
export const DEFAULT_USER_NOTE_TITLE = "未命名笔记";

/**
 * 新建笔记的起始模板。刻意带一个行内公式 + 一个 `$$` 块 + 一个 mhchem 化学式，
 * 让用户第一次打开预览就能发现公式是可渲染、可编辑的。
 */
export const DEFAULT_USER_NOTE_MARKDOWN = [
  "## 随手记",
  "",
  "在这里写你的笔记。行内公式这样写：$E = mc^2$。",
  "",
  "$$",
  "\\int_0^1 x^2 \\,\\mathrm{d}x = \\frac{1}{3}",
  "$$",
  "",
  "化学式也可以：$\\ce{2H2 + O2 -> 2H2O}$。",
  "",
].join("\n");
