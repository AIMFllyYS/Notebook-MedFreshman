// 课堂笔记（notes.html，notes-to-handbook 产出的静态自包含 HTML）→ 纯文本块。
//
// 纯函数、不依赖浏览器 / DOM（服务端与脚本可直接跑）。v1 只适配已冻结的上游模板：
// .page / .page-title / .section-title / table / .kv-card 等；遇到非模板结构时按
// 通用块级标签兜底，并在「提取结果为空」时抛错（宁可拦下也不静默产出空检索文本）。
//
// 同时提供静态 HTML 安全检查 findUnsafeHtml：课堂笔记默认不允许脚本 / 事件 / 外链资源。

const BLOCK_TAGS = new Set([
  "div", "p", "section", "article", "header", "footer", "main",
  "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "table", "thead", "tbody", "tr",
  "blockquote", "pre", "figure", "figcaption", "hr",
]);
const SKIP_TAGS = new Set(["style", "script", "noscript", "svg"]);
const TITLE_CLASS_HINTS = ["page-title", "section-title", "chapter-badge", "cover-kicker"];

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&hellip;/gi, "…")
    .replace(/&laquo;/gi, "«")
    .replace(/&raquo;/gi, "»")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

export interface HtmlExtraction {
  /** 有序纯文本行（已去空、解码实体、保留表格单元格与上下标）。 */
  lines: string[];
  /** 拼接后的纯文本（行之间用换行连接）。 */
  text: string;
  /** 提取到的页面 / 小节标题，用于 QA 与题源定位。 */
  headings: string[];
}

interface StackNode {
  tag: string;
  cls: string;
  /** 是否为标题类节点，其文本计入 headings。 */
  title: boolean;
  /** 开标签时全局 buf 的长度，闭标签时据此截取节点自身文本。 */
  start: number;
}

/**
 * 把受控 HTML 提取为纯文本。表格单元格之间用 " | " 分隔以保留列结构；
 * <sub>/<sup> 分别以前缀 _ / ^ 保留（模板多数上下标已是 Unicode 字符）。
 */
export function extractHtmlText(html: string): HtmlExtraction {
  if (!html || !html.trim()) throw new Error("extractHtmlText：输入为空");

  const tokenRe =
    /<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<\/?[a-zA-Z][^>]*?>|[^<]+/g;
  const stack: StackNode[] = [];
  const lines: string[] = [];
  const headings: string[] = [];
  let buf = "";
  let skipDepth = 0;

  const pushBreak = () => {
    buf += "\n";
  };
  const current = () => stack[stack.length - 1];

  let m: RegExpExecArray | null;
  while ((m = tokenRe.exec(html)) !== null) {
    const tok = m[0];
    if (tok.startsWith("<!--") || /^<!DOCTYPE/i.test(tok)) continue;

    if (tok.startsWith("<")) {
    const isClose = tok[1] === "/";
    const tagMatch = tok.slice(isClose ? 2 : 1).match(/^([a-zA-Z0-9]+)/);
    const tag = tagMatch ? tagMatch[1].toLowerCase() : "";
    if (!tag) continue;

    if (isClose) {
      if (SKIP_TAGS.has(tag)) {
        skipDepth = Math.max(0, skipDepth - 1);
        continue;
      }
      if (skipDepth > 0) continue;
      const node = stack.pop();
      if (tag === "br") continue;
      if (tag === "td" || tag === "th") {
        buf += " | ";
      } else if (tag === "li") {
        pushBreak();
      } else if (tag === "sub" || tag === "sup") {
        // 结束不另加字符（开标签已加 _ / ^）
      } else if (BLOCK_TAGS.has(tag)) {
        pushBreak();
      }
      if (node?.title) {
        // 只截取该标题节点自身范围内的文本，避免被前面内联的 badge（如「第一章」）粘连。
        const t = buf
          .slice(node.start)
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean)
          .join(" ")
          .trim();
        if (t) headings.push(t);
      }
      continue;
    }

    // 开标签
    if (SKIP_TAGS.has(tag)) {
      skipDepth += 1;
      continue;
    }
    if (skipDepth > 0) continue;
    const selfClose = /\/>\s*$/.test(tok);
    const clsAttr = tok.match(/class\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
    const title = TITLE_CLASS_HINTS.some((h) => clsAttr.includes(h));
    if (tag === "br") {
      pushBreak();
      continue;
    }
    if (tag === "sub") buf += "_";
    else if (tag === "sup") buf += "^";
    else if (tag === "li") {
      pushBreak();
      buf += "· ";
    } else if (tag === "td" || tag === "th") {
      // 单元格起始：若当前行已有内容，先补分隔
      if (buf && !buf.endsWith("| ") && !buf.endsWith("\n")) buf += " | ";
    } else if (BLOCK_TAGS.has(tag)) {
      pushBreak();
    }
    if (!selfClose) stack.push({ tag, cls: clsAttr, title, start: buf.length });
    } else {
      if (skipDepth > 0) continue;
      buf += decodeEntities(tok);
    }
  }

  // 规整：逐行 trim、去重空行、去残留的多余分隔。
  for (const rawLine of buf.split("\n")) {
    let line = rawLine.replace(/[ \t]+/g, " ").replace(/\s*\|\s*$/g, "").trim();
    line = line.replace(/\|\s*\|/g, "|").replace(/^\|\s*/, "");
    if (line) lines.push(line);
  }
  const text = lines.join("\n").trim();
  if (!text) throw new Error("extractHtmlText：未从 HTML 中提取到任何文本（疑似空壳/非模板结构）");
  void current;
  return { lines, text, headings: headings.filter((h, i, a) => a.indexOf(h) === i) };
}

/**
 * 静态课堂笔记安全检查：返回违规原因列表（空数组 = 通过）。
 * 默认禁止脚本、内联事件、javascript: 协议、外部网络资源与可嵌入对象。
 */
export function findUnsafeHtml(html: string): string[] {
  const problems: string[] = [];
  if (/<script[\s>]/i.test(html) || /<\/script\s*>/i.test(html)) {
    problems.push("包含 <script> 脚本标签");
  }
  if (/\son[a-z]+\s*=\s*["']?[^"'\s>]/i.test(html)) {
    problems.push("包含内联事件属性 on*");
  }
  if (/(href|src)\s*=\s*["']?\s*javascript:/i.test(html)) {
    problems.push("包含 javascript: 协议");
  }
  if (/<(iframe|object|embed|link)[\s>]/i.test(html)) {
    const t = html.match(/<(iframe|object|embed|link)[\s>]/i);
    problems.push(`包含受限标签 <${t?.[1] ?? "?"}>`);
  }
  // <meta charset="utf-8"> 自包含页面需要且无害；但 http-equiv 刷新/CSP 等一律禁止。
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of metaTags) {
    if (!/charset\s*=/i.test(tag) || /http-equiv\s*=/i.test(tag)) {
      problems.push(`包含非 charset 的 <meta>：${tag.slice(0, 60)}`);
    }
  }
  if (/(src|href)\s*=\s*["']https?:\/\//i.test(html)) {
    problems.push("引用了外部网络资源（http/https 的 src/href），课堂笔记必须自包含");
  }
  return problems;
}
