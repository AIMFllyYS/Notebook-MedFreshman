import type { ParsedBlock } from '@/lib/types/chat';

/**
 * Parse mixed markdown + custom XML tags into structured blocks.
 * Supports self-closing tags (<Tag prop={0.6} />) and
 * content tags (<Tag>children</Tag>).
 */
export function parseXmlTags(text: string): ParsedBlock[] {
  if (!text) return [];

  // 仅匹配“大写字母开头”的自定义组件标签（InteractiveVenn/FormulaSteps/Answer…）。
  // 普通 HTML 标签（<div>/<script>/<html>…）一律小写，永远不在此匹配，
  // 从而避免助教把 HTML 写进正文时被切碎成“未知标签占位框”。
  const tagRegex =
    /(<[A-Z][A-Za-z0-9]*(?:\s+[a-zA-Z_][a-zA-Z0-9_-]*=(?:"[^"]*"|'[^']*'|\{(?:[^{}]|\{[^{}]*\})*\}|[0-9.]+))*?\s*(?:\/>|>[\s\S]*?<\/[A-Z][A-Za-z0-9]*>))/g;

  const parts = text.split(tagRegex);
  const blocks: ParsedBlock[] = [];

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith('<') && part.endsWith('>')) {
      try {
        const isSelfClosing = part.endsWith('/>');
        let tagInner = '';
        let childrenText = '';
        let tagName = '';

        if (isSelfClosing) {
          tagInner = part.slice(1, -2).trim();
        } else {
          const closeTagIndex = part.indexOf('>');
          tagInner = part.slice(1, closeTagIndex).trim();
          const tagEndName = tagInner.split(/\s+/)[0];
          const closingTag = `</${tagEndName}>`;
          childrenText = part.slice(closeTagIndex + 1, -closingTag.length);
        }

        const nameMatch = tagInner.match(/^([A-Za-z0-9]+)/);
        if (!nameMatch) {
          blocks.push({ type: 'markdown', content: part });
          continue;
        }

        tagName = nameMatch[1];
        const propsStr = tagInner.substring(tagName.length).trim();
        const props: Record<string, any> = {};

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

        blocks.push({ type: 'component', tagName, props, childrenText });
      } catch {
        blocks.push({ type: 'markdown', content: part });
      }
    } else {
      blocks.push({ type: 'markdown', content: part });
    }
  }

  return blocks;
}
