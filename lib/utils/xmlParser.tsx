import type { ParsedBlock } from '@/lib/types/chat';

/**
 * Parse mixed markdown + project-owned XML-ish tags into structured blocks.
 *
 * Important boundary:
 * - lower-case/native HTML such as <details>, <summary>, <br>, <sub> stays in markdown;
 * - only the project whitelist below becomes component blocks;
 * - unknown PascalCase tags are escaped as text to avoid React unknown-DOM warnings.
 */
export const KNOWN_TAGS_LOWER_TO_PASCAL: Record<string, string> = {
  formulasteps: 'FormulaSteps',
  interactivevenn: 'InteractiveVenn',
  inlinedistribution: 'InlineDistribution',
  manimplayer: 'ManimPlayer',
  svgdiagram: 'SvgDiagram',
  toolcall: 'ToolCall',
  answer: 'Answer',
  thinking: 'Thinking',
  followup: 'FollowUp',
};

/** 聊天可视化组件标签（MessageContent -> ChatMessageVisualizations）。 */
export const CHAT_VIZ_TAGS = [
  'InteractiveVenn',
  'InlineDistribution',
  'FormulaSteps',
  'ManimPlayer',
  'SvgDiagram',
] as const;

/** 包裹正文的自定义标签（内层需二次 parseXmlTags，不可直接 rehype-raw）。 */
export const CHAT_WRAPPER_TAGS = ['Answer', 'Thinking'] as const;

/** 控制标签：提取为 metadata，不进入正文渲染。 */
export const CHAT_CONTROL_TAGS = ['FollowUp'] as const;

/** 内联工具标签。 */
export const CHAT_TOOL_TAGS = ['ToolCall'] as const;

export const CHAT_COMPONENT_TAGS = [
  ...CHAT_VIZ_TAGS,
  ...CHAT_WRAPPER_TAGS,
  ...CHAT_TOOL_TAGS,
] as const;

/** 流式输出时需剥离「未闭合尾巴」的标签。 */
export const CHAT_STREAMING_STRIP_TAGS = [
  ...CHAT_COMPONENT_TAGS,
  ...CHAT_CONTROL_TAGS,
] as const;

const KNOWN_TAG_NAMES = new Set(Object.values(KNOWN_TAGS_LOWER_TO_PASCAL));
const CUSTOM_TAG_DETECT_RE = new RegExp(
  `<(?:${Object.values(KNOWN_TAGS_LOWER_TO_PASCAL).join('|')})\\b`,
  'i',
);

/** 文本中是否含已知项目标签（大小写不敏感）。 */
export function hasKnownCustomTags(text: string): boolean {
  return CUSTOM_TAG_DETECT_RE.test(text);
}

/** 剥离流式期间未闭合的项目标签尾巴，避免 rehype-raw 渲染半截 DOM。 */
export function stripUnclosedCustomTagTails(content: string): string {
  let result = content;
  for (const tag of CHAT_STREAMING_STRIP_TAGS) {
    result = result.replace(
      new RegExp(`<${tag}\\b(?:(?!<\\/${tag}>)[\\s\\S])*$`, 'i'),
      '',
    );
  }
  return result;
}

/**
 * 清除嵌套拆分解耦后残留在 markdown 块里的 orphan 项目标签。
 * 这里只处理项目白名单，普通 HTML 必须保留给 rehype-raw。
 */
export function stripOrphanCustomTagMarkers(text: string): string {
  let result = text;
  for (const tag of [...CHAT_COMPONENT_TAGS, ...CHAT_CONTROL_TAGS]) {
    result = result.replace(new RegExp(`<${tag}\\b[^>]*>`, 'gi'), '');
    result = result.replace(new RegExp(`<\\/${tag}>`, 'gi'), '');
  }
  return result;
}

function normalizeKnownTagName(name: string): string | null {
  return KNOWN_TAGS_LOWER_TO_PASCAL[name.toLowerCase()] ?? null;
}

function isPascalCaseTagName(name: string): boolean {
  return /^[A-Z][A-Za-z0-9]*$/.test(name);
}

function findTagEnd(text: string, offset: number): number {
  let quote: '"' | "'" | null = null;

  for (let i = offset + 1; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === '>') return i;
  }

  return -1;
}

interface TagToken {
  name: string;
  normalizedName: string | null;
  tagEnd: number;
  isClosing: boolean;
  isSelfClosing: boolean;
  propsText: string;
}

function readTagAt(text: string, offset: number): TagToken | null {
  if (text[offset] !== '<') return null;
  const tagEnd = findTagEnd(text, offset);
  if (tagEnd === -1) return null;

  const inside = text.slice(offset + 1, tagEnd).trim();
  if (!inside || inside.startsWith('!') || inside.startsWith('?')) return null;

  const isClosing = inside.startsWith('/');
  const body = (isClosing ? inside.slice(1) : inside).trim();
  const nameMatch = body.match(/^([A-Za-z][A-Za-z0-9]*)\b/);
  if (!nameMatch) return null;

  const name = nameMatch[1];
  const rawPropsText = body.slice(name.length);
  const isSelfClosing = !isClosing && rawPropsText.trimEnd().endsWith('/');
  const propsText = isSelfClosing
    ? rawPropsText.trimEnd().slice(0, -1)
    : rawPropsText;

  return {
    name,
    normalizedName: normalizeKnownTagName(name),
    tagEnd,
    isClosing,
    isSelfClosing,
    propsText,
  };
}

function parseTagProps(propsStr: string): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  const attrRegex =
    /([a-zA-Z_][a-zA-Z0-9_-]*)=(?:"([^"]*)"|'([^']*)'|\{((?:[^{}]|\{[^{}]*\})*)\}|([0-9.-]+))/g;
  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(propsStr)) !== null) {
    const key = match[1];
    const val = match[2] ?? match[3] ?? match[4] ?? match[5];

    if (val === 'true') {
      props[key] = true;
    } else if (val === 'false') {
      props[key] = false;
    } else if (!isNaN(Number(val)) && val.trim() !== '') {
      props[key] = Number(val);
    } else if (
      (val.startsWith('{') && val.endsWith('}')) ||
      (val.startsWith('[') && val.endsWith(']'))
    ) {
      try {
        props[key] = JSON.parse(val);
      } catch {
        props[key] = val.startsWith('{') ? val.slice(1, -1) : val;
      }
    } else {
      const trimmed = val.trim();
      if (
        (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
        (trimmed.startsWith('{') && trimmed.endsWith('}'))
      ) {
        try {
          props[key] = JSON.parse(trimmed);
        } catch {
          props[key] = val;
        }
      } else {
        props[key] = val;
      }
    }
  }
  return props;
}

function escapeHtmlText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function findMatchingKnownClose(
  text: string,
  contentStart: number,
  tagName: string,
): { closeStart: number; closeEnd: number } | null {
  let depth = 1;
  let pos = contentStart;

  while (pos < text.length) {
    const lt = text.indexOf('<', pos);
    if (lt === -1) return null;

    const token = readTagAt(text, lt);
    if (!token) {
      pos = lt + 1;
      continue;
    }

    if (token.normalizedName !== tagName) {
      pos = token.tagEnd + 1;
      continue;
    }

    if (token.isClosing) {
      depth -= 1;
      if (depth === 0) {
        return { closeStart: lt, closeEnd: token.tagEnd + 1 };
      }
    } else if (!token.isSelfClosing) {
      depth += 1;
    }

    pos = token.tagEnd + 1;
  }

  return null;
}

function findMatchingUnknownClose(
  text: string,
  contentStart: number,
  tagName: string,
): { closeEnd: number } | null {
  let pos = contentStart;
  const lower = tagName.toLowerCase();

  while (pos < text.length) {
    const lt = text.indexOf('<', pos);
    if (lt === -1) return null;

    const token = readTagAt(text, lt);
    if (!token) {
      pos = lt + 1;
      continue;
    }

    if (token.isClosing && token.name.toLowerCase() === lower) {
      return { closeEnd: token.tagEnd + 1 };
    }

    pos = token.tagEnd + 1;
  }

  return null;
}

function extractKnownTagAt(
  text: string,
  offset: number,
  token: TagToken,
): { block: ParsedBlock; length: number } | null {
  const tagName = token.normalizedName;
  if (!tagName || !KNOWN_TAG_NAMES.has(tagName) || token.isClosing) return null;

  const props = parseTagProps(token.propsText);
  if (token.isSelfClosing) {
    return {
      block: { type: 'component', tagName, props, childrenText: '' },
      length: token.tagEnd + 1 - offset,
    };
  }

  const contentStart = token.tagEnd + 1;
  const close = findMatchingKnownClose(text, contentStart, tagName);
  if (!close) return null;

  return {
    block: {
      type: 'component',
      tagName,
      props,
      childrenText: text.slice(contentStart, close.closeStart).replace(/\\n/g, '\n'),
    },
    length: close.closeEnd - offset,
  };
}

function findNextSpecialTag(
  text: string,
  from: number,
): { index: number; token: TagToken; kind: 'known' | 'unknown-pascal' } | null {
  let pos = from;

  while (pos < text.length) {
    const lt = text.indexOf('<', pos);
    if (lt === -1) return null;

    const token = readTagAt(text, lt);
    if (!token || token.isClosing) {
      pos = lt + 1;
      continue;
    }

    if (token.normalizedName) {
      return { index: lt, token, kind: 'known' };
    }

    if (isPascalCaseTagName(token.name)) {
      return { index: lt, token, kind: 'unknown-pascal' };
    }

    pos = token.tagEnd + 1;
  }

  return null;
}

function pushMarkdown(blocks: ParsedBlock[], content: string): void {
  if (!content) return;
  const last = blocks[blocks.length - 1];
  if (last?.type === 'markdown') {
    last.content = `${last.content ?? ''}${content}`;
    return;
  }
  blocks.push({ type: 'markdown', content });
}

export function parseXmlTags(text: string): ParsedBlock[] {
  if (!text) return [];

  const blocks: ParsedBlock[] = [];
  let i = 0;

  while (i < text.length) {
    const next = findNextSpecialTag(text, i);
    if (!next) {
      pushMarkdown(blocks, text.slice(i));
      break;
    }

    if (next.index > i) {
      pushMarkdown(blocks, text.slice(i, next.index));
    }

    if (next.kind === 'unknown-pascal') {
      if (next.token.isSelfClosing) {
        pushMarkdown(blocks, escapeHtmlText(text.slice(next.index, next.token.tagEnd + 1)));
        i = next.token.tagEnd + 1;
        continue;
      }

      const contentStart = next.token.tagEnd + 1;
      const close = findMatchingUnknownClose(text, contentStart, next.token.name);
      if (close) {
        pushMarkdown(blocks, escapeHtmlText(text.slice(next.index, close.closeEnd)));
        i = close.closeEnd;
        continue;
      }

      pushMarkdown(blocks, escapeHtmlText(text.slice(next.index, next.token.tagEnd + 1)));
      i = next.token.tagEnd + 1;
      continue;
    }

    const extracted = extractKnownTagAt(text, next.index, next.token);
    if (extracted) {
      blocks.push(extracted.block);
      i = next.index + extracted.length;
      continue;
    }

    pushMarkdown(blocks, escapeHtmlText(text.slice(next.index, next.token.tagEnd + 1)));
    i = next.token.tagEnd + 1;
  }

  return blocks;
}
