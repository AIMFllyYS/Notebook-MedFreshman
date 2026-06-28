import type { ParsedBlock } from '@/lib/types/chat';

/**
 * Parse mixed markdown + custom XML tags into structured blocks.
 * Supports self-closing tags (<Tag prop={0.6} />) and
 * content tags (<Tag>children</Tag>).
 */
// 已知自定义标签的小写变体 → PascalCase 映射表
// LLM 有时输出全小写标签（如 <formulasteps>），此处做大小写不敏感归一化
const KNOWN_TAGS_LOWER_TO_PASCAL: Record<string, string> = {
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

/** 聊天可视化组件标签（MessageContent → ChatMessageVisualizations）。 */
export const CHAT_VIZ_TAGS = [
  'InteractiveVenn',
  'InlineDistribution',
  'FormulaSteps',
  'ManimPlayer',
  'SvgDiagram',
] as const;

/** 包裹正文的自定义标签（内层需二次 parseXmlTags，不可直接 rehype-raw）。 */
export const CHAT_WRAPPER_TAGS = ['Answer', 'Thinking'] as const;

/** 流式输出时需剥离「未闭合尾巴」的标签（不含 FollowUp — 单独处理）。 */
export const CHAT_STREAMING_STRIP_TAGS = [
  ...CHAT_VIZ_TAGS,
  ...CHAT_WRAPPER_TAGS,
  'ToolCall',
] as const;

const CUSTOM_TAG_DETECT_RE = new RegExp(
  `<(?:${[...CHAT_VIZ_TAGS, ...CHAT_WRAPPER_TAGS, 'ToolCall'].join('|')})\\b`,
  'i',
);

/** 文本中是否含已知自定义组件开标签（大小写不敏感）。 */
export function hasKnownCustomTags(text: string): boolean {
  return CUSTOM_TAG_DETECT_RE.test(text);
}

/** 剥离流式期间未闭合的自定义标签尾巴，避免 rehype-raw 渲染半截 DOM。 */
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
 * 清除嵌套拆分解耦后残留在 markdown 块里的 orphan 开/闭标签
 * （如 "<Answer>intro" / "outro</Answer>"），避免 rehype-raw → unrecognized tag。
 */
export function stripOrphanCustomTagMarkers(text: string): string {
  let result = text;
  const tags = [...CHAT_WRAPPER_TAGS, ...CHAT_VIZ_TAGS];
  for (const tag of tags) {
    result = result.replace(new RegExp(`<${tag}\\b[^>]*>`, 'gi'), '');
    result = result.replace(new RegExp(`<\\/${tag}>`, 'gi'), '');
  }
  return result;
}

function normalizeTagCase(text: string): string {
  let result = text;
  for (const [lower, pascal] of Object.entries(KNOWN_TAGS_LOWER_TO_PASCAL)) {
    result = result.replace(
      new RegExp(`<(/?)${lower}`, 'gi'),
      (_, slash) => `<${slash}${pascal}`,
    );
  }
  return result;
}

const CUSTOM_OPEN_TAG_RE = /^<([A-Z][A-Za-z0-9]*)([\s\S]*?)>/;
const CUSTOM_SELF_CLOSING_RE = /^<([A-Z][A-Za-z0-9]*)([\s\S]*?)\/>/;

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

/** 从 text[offset] 起提取一个 PascalCase 自定义标签（支持嵌套内层异名标签）。 */
function extractCustomTagAt(
  text: string,
  offset: number,
): { block: ParsedBlock; length: number } | null {
  const slice = text.slice(offset);

  const selfMatch = slice.match(CUSTOM_SELF_CLOSING_RE);
  if (selfMatch) {
    const tagName = selfMatch[1];
    const props = parseTagProps(selfMatch[2]);
    return {
      block: { type: 'component', tagName, props, childrenText: '' },
      length: selfMatch[0].length,
    };
  }

  const openMatch = slice.match(CUSTOM_OPEN_TAG_RE);
  if (!openMatch || openMatch[0].endsWith('/>')) return null;

  const tagName = openMatch[1];
  const props = parseTagProps(openMatch[2]);
  const contentStart = offset + openMatch[0].length;
  const openNeedle = `<${tagName}`;
  const closeNeedle = `</${tagName}>`;

  let depth = 1;
  let pos = contentStart;

  while (pos < text.length && depth > 0) {
    const nextClose = text.indexOf(closeNeedle, pos);
    if (nextClose === -1) return null;

    const nextOpen = text.indexOf(openNeedle, pos);
    if (nextOpen !== -1 && nextOpen < nextClose) {
      const afterOpen = nextOpen + openNeedle.length;
      if (text[afterOpen] === '>' || text[afterOpen] === ' ' || text[afterOpen] === '/') {
        depth += 1;
        pos = afterOpen;
        continue;
      }
    }

    depth -= 1;
    if (depth === 0) {
      const childrenText = text
        .slice(contentStart, nextClose)
        .replace(/\\n/g, '\n');
      return {
        block: { type: 'component', tagName, props, childrenText },
        length: nextClose + closeNeedle.length - offset,
      };
    }
    pos = nextClose + closeNeedle.length;
  }

  return null;
}

export function parseXmlTags(text: string): ParsedBlock[] {
  if (!text) return [];

  text = normalizeTagCase(text);
  const blocks: ParsedBlock[] = [];
  let i = 0;

  while (i < text.length) {
    const lt = text.indexOf('<', i);
    if (lt === -1) {
      if (i < text.length) blocks.push({ type: 'markdown', content: text.slice(i) });
      break;
    }

    if (lt > i) {
      blocks.push({ type: 'markdown', content: text.slice(i, lt) });
    }

    // 仅 PascalCase 开标签视为自定义组件；小写 HTML 标签留在 markdown 由 rehype 处理。
    if (!/^<[A-Z]/.test(text.slice(lt))) {
      blocks.push({ type: 'markdown', content: text[lt] });
      i = lt + 1;
      continue;
    }

    const extracted = extractCustomTagAt(text, lt);
    if (extracted) {
      blocks.push(extracted.block);
      i = lt + extracted.length;
      continue;
    }

    blocks.push({ type: 'markdown', content: text[lt] });
    i = lt + 1;
  }

  return blocks;
}
