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
 * 处理策略（仅作用于花括号**以** `label=` / `title=` 开头的指令行，代码块内一律跳过）：
 *   1. 只改第一个 label/title 的值，其后属性（如 `mode=cloze`）原样拼回；
 *   2. 把值里成对的 ASCII 直引号 `"`/`'` 转为中文弯引号 `“”`/`‘’`（更符合中文排版）；
 *   3. 用 ASCII 双引号把该值「定界」包起来 → `{label="σ-p 超共轭"}`，
 *      这样空格、斜杠等字符都能被 micromark 正确接受。
 * 未加引号的值边界是「下一个 `\s+[\w-]+=`」之前；已加引号的值按成对引号切分，
 * 因此 `{label="… A260=1.0"}` 里的公式不会被误判成第二个属性。
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
const LABEL_KEY = /^(label|title)=/;

// 「下一个属性」的边界只认这份白名单——它是 lib/markdown/remarkDirectives.ts 里
// 真正会被读取的 attrs.* 全集。**不能退回 /\s+[\w-]+=/ 那种形状匹配**：
// 结构上 `mode=cloze` 与标题正文里的 `k=0`、`y=10sin(10πt−x/100)`、`A260=1.0`
// 长得完全一样，形状匹配会把公式误切成属性、把标题截断（实测正文里有 2 处这种写法）。
// 新增指令属性时要同步这份名单，否则该属性会被当成标题正文吞掉。
const KNOWN_ATTRS = [
  "alt", "axes", "caption", "color", "fn", "grid", "height", "id", "impact",
  "kind", "label", "location", "mode", "people", "period", "points", "result",
  "samples", "src", "term", "title", "width", "xlabel", "xmax", "xmin", "year",
  "ylabel", "ymax", "ymin",
] as const;
const NEXT_ATTR = new RegExp(`\\s+(?:${KNOWN_ATTRS.join("|")})=`);

function normalizeLabelValue(raw: string): string {
  let v = raw.trim();
  // 去掉整体包裹的一层 ASCII 双引号（幂等：避免重复包裹）
  if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  // 成对的 ASCII 引号 → 中文弯引号；残留奇数个统一转左引号，避免破坏定界
  v = v.replace(/"([^"]*)"/g, "“$1”").replace(/"/g, "“");
  v = v.replace(/'([^']*)'/g, "‘$1’").replace(/'/g, "‘");
  return v;
}

/**
 * 切出「label/title 的值」与「其后的其他属性」。
 *
 * 关键点：值本身可能带引号，而引号也可能只是标题正文的一部分
 * （例如 `{label="熵"的本质}`——作者在标题里用了 ASCII 引号）。
 * 所以闭合引号之后**必须**是白名单属性才算属性边界；否则整段都算标题正文，
 * 交给 normalizeLabelValue 去做弯引号转换 + 整体定界（这是 24738d98 / 72c7464d
 * 两次修复换来的行为，实测正文里有 21 处依赖它）。
 */
function splitLabelValue(afterEq: string): { value: string; rest: string } {
  // 带引号时，边界搜索必须从闭合引号之后开始，否则标题里含白名单词
  // （如 `{label="用 width=3 画图" mode=cloze}`）会被切进引号内部。
  let searchFrom = 0;
  const quote = afterEq[0] === '"' ? '"' : afterEq[0] === "'" ? "'" : "";
  if (quote) {
    const close = afterEq.indexOf(quote, 1);
    if (close !== -1) searchFrom = close + 1;
  }

  const tail = afterEq.slice(searchFrom);
  const next = NEXT_ATTR.exec(tail);
  if (!next) return { value: afterEq, rest: "" };

  const cut = searchFrom + next.index;
  if (cut === 0) return { value: "", rest: afterEq };
  return { value: afterEq.slice(0, cut), rest: afterEq.slice(cut) };
}

/**
 * 只改花括号里第一个 label=/title= 的值，其余属性原样拼回。
 * `{kind=note label=…}` 不以 label= 开头，整段跳过（保持既有行为）。
 */
function fixBraces(braces: string): string {
  if (braces.length < 2 || braces[0] !== "{" || braces[braces.length - 1] !== "}") {
    return braces;
  }
  const inner = braces.slice(1, -1);
  const keyMatch = inner.match(LABEL_KEY);
  if (!keyMatch) return braces;

  const key = keyMatch[1];
  const afterEq = inner.slice(keyMatch[0].length);
  const { value, rest } = splitLabelValue(afterEq);

  return `{${key}="${normalizeLabelValue(value)}"${rest}}`;
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
