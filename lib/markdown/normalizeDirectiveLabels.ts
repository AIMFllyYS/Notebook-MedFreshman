/**
 * 规范化容器指令的 label / title 属性值，使其在 remark-directive 下稳健解析。
 *
 * 背景：remark-directive 的属性语法 `:::type{label=值}` 中，**未加引号的属性值**不能
 * 包含空格、ASCII 引号等字符。一旦中文标题里出现：
 *   - 空格：`:::definition{label=σ-p 超共轭}`
 *   - ASCII 直引号：`:::insight{label=为什么从"衣食住行"讲起}`
 * 属性解析就会失败 → 整个指令被丢弃，渲染成字面文本 `:::definition{...}`
 *  （callout 框消失、::: 围栏裸露、块结构坍塌）。
 *
 * 处理策略（仅作用于指令起始行的 `{label=…}` / `{title=…}`，代码块内一律跳过）：
 *   1. 把值里成对的 ASCII 直引号 `"`/`'` 转为中文弯引号 `“”`/`‘’`（更符合中文排版）；
 *   2. 用 ASCII 双引号把整个值「定界」包起来 → `{label="σ-p 超共轭"}`，
 *      这样空格、斜杠等字符都能被 micromark 正确接受。
 *
 * 该规范化同时作用于笔记侧（NoteRenderer）与聊天侧（MessageContent），
 * 因此既修复既有内容（所有学科），也兜底 AI 生成内容与未来作者的笔误。
 *
 * 注意：解析后属性值会去掉定界引号，故渲染出的 label 文本与包裹前一致（弯引号除外）。
 */

// 指令起始行：可选缩进 + 1~4 个冒号 + 名称 + 紧跟的 {属性块}
// 末段用 [^\n]* 而非 .*：CRLF 文件按 \n 切行后每行尾留有 \r，而正则的 `.` 不匹配 \r、
// `$`（无 m 标志）也不在 \r 前结束，会导致「无尾随内容」的指令行整体匹配失败 →
// 含空格/引号的 label 在 CRLF 文件里得不到归一 → remark-directive 解析失败 → callout 泄漏成裸文本。
// [^\n] 可匹配并保留行尾 \r，修复 CRLF 行尾下的指令归一。
const DIRECTIVE_OPEN = /^(\s*:{1,4}[A-Za-z][\w-]*)(\{[^}\n]*\})([^\n]*)$/;
// 仅处理 {label=…} 或 {title=…} 这种单属性花括号
const LABEL_BRACE = /^\{(label|title)=([\s\S]*)\}$/;

function fixBraces(braces: string): string {
  return braces.replace(LABEL_BRACE, (_m, key: string, rawVal: string) => {
    let v = rawVal.trim();
    // 去掉已有的一层 ASCII 双引号定界（幂等：避免重复包裹）
    if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    // 成对的 ASCII 引号 → 中文弯引号；残留奇数个统一转左引号，避免破坏定界
    v = v.replace(/"([^"]*)"/g, "“$1”").replace(/"/g, "“");
    v = v.replace(/'([^']*)'/g, "‘$1’").replace(/'/g, "‘");
    return `{${key}="${v}"}`;
  });
}

export function normalizeDirectiveLabels(src: string): string {
  if (!src || src.indexOf("::") === -1) return src;

  const lines = src.split("\n");
  let inFence = false;
  let fenceChar = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 跟踪围栏代码块状态，块内不做任何替换
    const fence = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      const ch = fence[1][0];
      if (!inFence) {
        inFence = true;
        fenceChar = ch;
      } else if (ch === fenceChar) {
        inFence = false;
        fenceChar = "";
      }
      continue;
    }
    if (inFence) continue;

    const m = line.match(DIRECTIVE_OPEN);
    if (!m) continue;
    const [, head, braces, tail] = m;
    const fixed = fixBraces(braces);
    if (fixed !== braces) lines[i] = head + fixed + tail;
  }

  return lines.join("\n");
}

export default normalizeDirectiveLabels;
