// 笔记编辑器的纯文本变换。
//
// 刻意与 React 解耦：工具栏每个按钮都是「(当前值, 选区) → (新值, 新选区)」的纯函数，
// 所以行为可以被单测钉死，也不用在组件里散落 setSelectionRange 的偏移算术。
// 编辑器只负责把结果写回 textarea 并恢复选区。

export interface TextSelection {
  value: string;
  start: number;
  end: number;
}

export interface EditResult {
  value: string;
  /** 应用后的选区（用于 setSelectionRange）。 */
  start: number;
  end: number;
}

function result(value: string, start: number, end = start): EditResult {
  return { value, start, end };
}

/** 选中的文本；无选区时为空串。 */
function selected(sel: TextSelection): string {
  return sel.value.slice(sel.start, sel.end);
}

function splice(value: string, start: number, end: number, insert: string): string {
  return value.slice(0, start) + insert + value.slice(end);
}

/**
 * 成对标记开关：`**粗体**`、`*斜体*`、`` `代码` ``、`~~删除~~`。
 *
 * 已经被同一标记包裹时再点一次会脱掉标记（所见即所得的直觉），
 * 空选区时插入标记并把光标放到中间，直接接着打字。
 */
export function toggleWrap(sel: TextSelection, marker: string): EditResult {
  const text = selected(sel);
  const len = marker.length;

  // 情况一：选区内部自带标记（用户选中了 **粗体** 整段）
  if (text.length >= len * 2 && text.startsWith(marker) && text.endsWith(marker)) {
    const inner = text.slice(len, -len);
    return result(splice(sel.value, sel.start, sel.end, inner), sel.start, sel.start + inner.length);
  }
  // 情况二：标记在选区外侧（用户只选中了 粗体 两个字）
  const before = sel.value.slice(Math.max(0, sel.start - len), sel.start);
  const after = sel.value.slice(sel.end, sel.end + len);
  if (text && before === marker && after === marker) {
    const value = splice(sel.value, sel.start - len, sel.end + len, text);
    return result(value, sel.start - len, sel.start - len + text.length);
  }

  const wrapped = `${marker}${text}${marker}`;
  const value = splice(sel.value, sel.start, sel.end, wrapped);
  if (!text) {
    const caret = sel.start + len;
    return result(value, caret);
  }
  return result(value, sel.start + len, sel.start + len + text.length);
}

/** 选区覆盖到的整行范围（含首行行首、末行行尾）。 */
function lineRange(value: string, start: number, end: number): { from: number; to: number } {
  const from = value.lastIndexOf("\n", start - 1) + 1;
  const nextNl = value.indexOf("\n", end);
  const to = nextNl === -1 ? value.length : nextNl;
  return { from, to };
}

/**
 * 行前缀开关：列表、任务列表、引用块。
 *
 * 每行都已有该前缀 → 整体去掉；否则给缺的行补上。有序列表按 1. 2. 3. 重新编号。
 */
export function toggleLinePrefix(sel: TextSelection, prefix: string | "ordered"): EditResult {
  const { from, to } = lineRange(sel.value, sel.start, sel.end);
  const lines = sel.value.slice(from, to).split("\n");
  const isOrdered = prefix === "ordered";
  const test = isOrdered ? /^\s*\d+\.\s+/ : new RegExp(`^\\s*${escapeRegExp(prefix)}`);
  const allPrefixed = lines.every((line) => line.trim() === "" || test.test(line));

  const next = lines.map((line, i) => {
    if (line.trim() === "") return line;
    if (allPrefixed) return line.replace(test, "");
    return isOrdered ? `${i + 1}. ${line}` : `${prefix}${line}`;
  });

  const block = next.join("\n");
  return result(splice(sel.value, from, to, block), from, from + block.length);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 标题级别循环：正文 → # → ## → ### → #### → 正文。 */
export function cycleHeading(sel: TextSelection): EditResult {
  const { from, to } = lineRange(sel.value, sel.start, sel.end);
  const lines = sel.value.slice(from, to).split("\n");
  const first = lines.find((line) => line.trim() !== "") ?? "";
  const current = first.match(/^(#{1,6})\s+/);
  const level = current ? current[1].length : 0;
  const nextLevel = level >= 4 ? 0 : level + 1;

  const next = lines.map((line) => {
    if (line.trim() === "") return line;
    const bare = line.replace(/^#{1,6}\s+/, "");
    return nextLevel === 0 ? bare : `${"#".repeat(nextLevel)} ${bare}`;
  });

  const block = next.join("\n");
  return result(splice(sel.value, from, to, block), from, from + block.length);
}

/**
 * 在光标处插入一个块级片段，前后补足空行。
 *
 * 叶子/容器指令（`::noteref{…}`、`:::memory`）必须独占一行：紧贴前一段会被 remark
 * 当成段落续行，指令就渲染不出来了。这也是引用插入必须走这里而不是直接拼字符串的原因。
 *
 * `caretOffset` 是插入后光标相对 block 起点的位置，用于把光标送进容器指令内部。
 */
export function insertBlock(sel: TextSelection, block: string, caretOffset?: number): EditResult {
  const before = sel.value.slice(0, sel.start);
  const after = sel.value.slice(sel.end);

  const needLeading = before.length > 0 && !before.endsWith("\n\n");
  const leading = before.length === 0 ? "" : before.endsWith("\n") ? "\n" : "\n\n";
  const trailing = after.startsWith("\n") ? "\n" : "\n\n";

  const insert = `${needLeading ? leading : ""}${block}${trailing}`;
  const value = before + insert + after;
  const blockStart = sel.start + (needLeading ? leading.length : 0);
  const caret = caretOffset === undefined ? blockStart + block.length : blockStart + caretOffset;
  return result(value, caret);
}

/** 在光标处插入一段行内文本，替换掉当前选区。 */
export function insertInline(sel: TextSelection, text: string): EditResult {
  const value = splice(sel.value, sel.start, sel.end, text);
  return result(value, sel.start + text.length);
}

/**
 * 公式：行内 `$…$` 或块级 `$$…$$`（独占段落）。
 * 有选区时把选中内容当公式体，无选区时留空并把光标放进定界符中间。
 */
export function wrapMath(sel: TextSelection, display: boolean): EditResult {
  const body = selected(sel);
  if (!display) return toggleWrap(sel, "$");
  const block = `$$\n${body}\n$$`;
  return insertBlock(sel, block, body ? block.length : 3);
}

/** 链接：选中文本作为链接文字，光标落到 URL 位置。 */
export function insertLink(sel: TextSelection): EditResult {
  const text = selected(sel) || "链接文字";
  const snippet = `[${text}](url)`;
  const value = splice(sel.value, sel.start, sel.end, snippet);
  const urlStart = sel.start + text.length + 3;
  return result(value, urlStart, urlStart + 3);
}

/** 三列两行的 GFM 表格骨架。 */
export function insertTable(sel: TextSelection): EditResult {
  const block = ["| 列 1 | 列 2 | 列 3 |", "| --- | --- | --- |", "|  |  |  |"].join("\n");
  return insertBlock(sel, block, 2);
}

/** 围栏代码块。 */
export function insertCodeBlock(sel: TextSelection): EditResult {
  const body = selected(sel);
  const block = `\`\`\`\n${body}\n\`\`\``;
  return insertBlock(sel, block, body ? block.length : 4);
}

/** 容器指令骨架：callout / 记忆卡等。光标落在正文首行。 */
export function insertContainer(sel: TextSelection, open: string): EditResult {
  const body = selected(sel);
  const block = `${open}\n${body}\n:::`;
  return insertBlock(sel, block, body ? block.length : open.length + 1);
}

/** Tab 缩进：多行时整块缩进/反缩进，单行时插入两个空格。 */
export function indent(sel: TextSelection, outdent: boolean): EditResult {
  const multiline = sel.value.slice(sel.start, sel.end).includes("\n");
  if (!multiline && !outdent) return insertInline(sel, "  ");

  const { from, to } = lineRange(sel.value, sel.start, sel.end);
  const lines = sel.value.slice(from, to).split("\n");
  const next = lines.map((line) => {
    if (outdent) return line.replace(/^ {1,2}/, "");
    return line.trim() === "" ? line : `  ${line}`;
  });
  const block = next.join("\n");
  return result(splice(sel.value, from, to, block), from, from + block.length);
}
