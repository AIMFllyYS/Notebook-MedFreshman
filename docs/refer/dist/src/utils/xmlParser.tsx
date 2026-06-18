export interface ParsedBlock {
  type: 'markdown' | 'component';
  content?: string;
  tagName?: string;
  props?: Record<string, any>;
  childrenText?: string;
}

/**
 * Parses a string containing mixed markdown and custom self-closing XML tags
 * (e.g. <InteractiveVenn a={0.6} b={0.4} ab={0.2} /> or <ToolCall name="search" ... />)
 * into a list of structured blocks.
 */
export const parseXmlTags = (text: string): ParsedBlock[] => {
  if (!text) return [];

  // Match tags like <TagName prop="val" prop2={val2} /> or <TagName ...>children</TagName>
  // We match standard tags that look like XML.
  const tagRegex = /(<[A-Za-z0-9]+(?:\s+[a-zA-Z_][a-zA-Z0-9_-]*=(?:"[^"]*"|'[^']*'|\{(?:[^{}]|\{[^{}]*\})*\}|[0-9.]+))*?\s*(?:\/>|>[\s\S]*?<\/[A-Za-z0-9]+>))/g;

  const parts = text.split(tagRegex);
  const blocks: ParsedBlock[] = [];

  parts.forEach((part) => {
    if (!part) return;

    if (part.startsWith('<') && part.endsWith('>')) {
      try {
        const isSelfClosing = part.endsWith('/>');
        // Extract tag name and content
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
          return;
        }

        tagName = nameMatch[1];
        const propsStr = tagInner.substring(tagName.length).trim();
        const props: Record<string, any> = {};

        const attrRegex = /([a-zA-Z_][a-zA-Z0-9_-]*)=(?:"([^"]*)"|'([^']*)'|\{((?:[^{}]|\{[^{}]*\})*)\}|([0-9.-]+))/g;
        let match;
        while ((match = attrRegex.exec(propsStr)) !== null) {
          const key = match[1];
          const val = match[2] || match[3] || match[4] || match[5];

          // Parse values to appropriate JS types
          if (val === 'true') {
            props[key] = true;
          } else if (val === 'false') {
            props[key] = false;
          } else if (!isNaN(Number(val)) && val.trim() !== '') {
            props[key] = Number(val);
          } else if ((val.startsWith('{') && val.endsWith('}')) || (val.startsWith('[') && val.endsWith(']'))) {
            try {
              props[key] = JSON.parse(val);
            } catch {
              props[key] = val.startsWith('{') ? val.slice(1, -1) : val;
            }
          } else {
            // Check if stringified JSON array/object was passed without braces
            const trimmed = val.trim();
            if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
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

        blocks.push({
          type: 'component',
          tagName,
          props,
          childrenText
        });
      } catch (e) {
        console.error('Failed to parse tag:', part, e);
        blocks.push({ type: 'markdown', content: part });
      }
    } else {
      blocks.push({ type: 'markdown', content: part });
    }
  });

  return blocks;
};
