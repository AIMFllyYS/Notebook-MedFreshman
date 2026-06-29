'use client';

import React, { useMemo, Children, isValidElement } from 'react';
import ReactMarkdown from 'react-markdown';
import { sharedRemarkPlugins, sharedRehypePlugins } from '@/lib/markdown/plugins';
import remarkSoftBreaks from '@/lib/markdown/remarkSoftBreaks';
import { directiveComponents } from '@/lib/markdown/directiveComponents';
import 'katex/dist/katex.min.css';
import { parseXmlTags, hasKnownCustomTags, stripOrphanCustomTagMarkers, CHAT_VIZ_TAGS } from '@/lib/utils/xmlParser';
import { parseChatContent } from '@/lib/chat/rendering/parseChatContent';
import type { ParsedBlock } from '@/lib/types/chat';
import { ChatMessageVisualizations } from '@/components/chat/ChatMessageVisualizations';
import { ToolCallDashboard } from '@/components/chat/ToolCallDashboard';
import { FollowUpQuestions } from '@/components/chat/FollowUpQuestions';
import CodeBlock from '@/components/shared/CodeBlock';
import { ChatImage } from '@/components/chat/ChatImage';
import { ImageStrip } from '@/components/chat/ImageStrip';
import { RawSvgViewer } from '@/components/canvas';
import { sanitizeSvg } from '@/lib/utils/sanitizeSvg';
import { VizErrorBoundary } from '@/components/chat/VizErrorBoundary';

interface MessageContentProps {
  content: string;
  enableVisualizations?: boolean;
  onFollowUpSelect?: (question: string) => void;
  /** 聊天体文本（用户输入/思考过程/生成依据）启用软换行：段内单 \n 渲染为 <br>。 */
  preserveLineBreaks?: boolean;
  sessionId?: string;
  messageId?: string;
  repairModelId?: string;
  topic?: string;
}

type MarkdownElementProps<T extends keyof React.JSX.IntrinsicElements> =
  React.ComponentPropsWithoutRef<T> & { node?: unknown };

/**
 * Custom <p> component: when a paragraph contains 2+ images,
 * wrap them in an ImageStrip for horizontal scrolling.
 */
function ChatParagraph({ node: _node, children, ...props }: MarkdownElementProps<'p'>) {
  void _node;
  const childArray = Children.toArray(children);
  const imgChildren = childArray.filter(
    (c) => isValidElement<{ src?: string }>(c) && (c.type === ChatImage || Boolean(c.props.src)),
  );

  if (imgChildren.length >= 2) {
    return <ImageStrip>{children}</ImageStrip>;
  }

  return <p {...props}>{children}</p>;
}

/* ---- Markdown rendering components ----
   排版交由 .chat-prose CSS 统一控制（行距/段距/标题/列表/引用/代码/表格/KaTeX）；
   这里只保留必要的行为：链接新开页、表格横向滚动包裹、代码块复制按钮。 */
const mdComponents = {
  ...directiveComponents,
  img: ChatImage,
  p: ChatParagraph,
  a: ({ node: _node, ...props }: MarkdownElementProps<'a'>) => (
    void _node,
    <a target="_blank" rel="noopener noreferrer" {...props} />
  ),
  table: ({ node: _node, ...props }: MarkdownElementProps<'table'>) => (
    void _node,
    <div className="chat-table-scroll">
      <table {...props} />
    </div>
  ),
  pre: ({ node: _node, className, children }: MarkdownElementProps<'pre'>) => (
    void _node,
    <CodeBlock className={className}>{children}</CodeBlock>
  ),
};

/* ---- Markdown rendering that routes raw inline <svg> to the sanitized viewer ----
   助教有时直接吐裸 <svg>…</svg>（未用 <SvgDiagram> 包裹）。裸 SVG 会落进 markdown 块、
   被 rehype-raw 逐元素交给 React 渲染，而 <text>/<g>/<tspan> 等 SVG 命名空间标签在
   非 <svg> React 上下文下会触发「unrecognized tag」告警（流式半截 SVG 尤甚）。
   这里把完整的 <svg>…</svg> 切出来，经 sanitizeSvg(DOMPurify) 后交给 RawSvgViewer
   以 innerHTML 渲染（浏览器原生处理 SVG 命名空间，零告警）；其余文本仍走 ReactMarkdown。
   此外，助教在思考过程中偶尔输出不带 <svg> 包裹的裸 SVG 子元素（<text>/<line>/…），
   同样会被 rehype-raw 当作 HTML 自定义元素交给 React → unrecognized tag + kebab-case
   属性告警。stripBareSvgChildren 在文本送入 ReactMarkdown 前清除这些孤儿标签。 */
const SVG_BLOCK_RE = /<svg[\s\S]*?<\/svg>/gi;

const SVG_CHILD_TAGS = [
  'text', 'tspan', 'textPath', 'line', 'circle', 'ellipse', 'rect', 'path',
  'polyline', 'polygon', 'g', 'use', 'defs', 'marker', 'stop', 'symbol',
  'linearGradient', 'radialGradient', 'clipPath', 'mask', 'pattern', 'image',
];
const BARE_SVG_CHILD_RE = new RegExp(
  `</?(?:${SVG_CHILD_TAGS.join('|')})\\b[^>]*/?>`,
  'gi',
);

function stripBareSvgChildren(text: string): string {
  return text.replace(BARE_SVG_CHILD_RE, '');
}

function renderMarkdownWithSvg(
  text: string,
  keyPrefix: string,
  remarkPlugins: typeof sharedRemarkPlugins,
): React.ReactNode {
  const content = stripOrphanCustomTagMarkers(text || '');
  const md = (key: string, value: string) => (
    <ReactMarkdown key={key} remarkPlugins={remarkPlugins} rehypePlugins={sharedRehypePlugins} components={mdComponents}>
      {value}
    </ReactMarkdown>
  );

  if (!content.includes('<svg')) return md(keyPrefix, stripBareSvgChildren(content));

  const out: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  SVG_BLOCK_RE.lastIndex = 0;
  while ((m = SVG_BLOCK_RE.exec(content)) !== null) {
    const before = content.slice(last, m.index);
    if (before.trim()) out.push(md(`${keyPrefix}-md-${i}`, stripBareSvgChildren(before)));
    out.push(
      <VizErrorBoundary key={`${keyPrefix}-svg-${i}`} label="图形" source={m[0]}>
        <RawSvgViewer svg={sanitizeSvg(m[0])} />
      </VizErrorBoundary>,
    );
    last = m.index + m[0].length;
    i++;
  }
  const tail = content.slice(last);
  if (tail.trim()) out.push(md(`${keyPrefix}-md-${i}`, stripBareSvgChildren(tail)));

  return <React.Fragment key={keyPrefix}>{out}</React.Fragment>;
}

const VIZ_TAG_SET = new Set<string>(CHAT_VIZ_TAGS);

interface MessageRenderContext {
  sessionId?: string;
  messageId?: string;
  repairModelId?: string;
  topic?: string;
  nextSvgBlockIndex?: () => number;
}

/* ---- Render parsed blocks (supports nested Answer/Thinking re-parse) ---- */
function renderBlocks(
  blocks: ParsedBlock[],
  keyPrefix: string,
  enableVisualizations: boolean | undefined,
  onFollowUpSelect: ((question: string) => void) | undefined,
  remarkPlugins: typeof sharedRemarkPlugins,
  renderContext?: MessageRenderContext,
): React.ReactNode {
  return blocks.map((block, idx) =>
    renderParsedBlock(block, `${keyPrefix}-${idx}`, enableVisualizations, onFollowUpSelect, remarkPlugins, renderContext),
  );
}

/* ---- Render a single parsed block ---- */
const renderParsedBlock = (
  block: ParsedBlock,
  key: string,
  enableVisualizations?: boolean,
  onFollowUpSelect?: (question: string) => void,
  remarkPlugins: typeof sharedRemarkPlugins = sharedRemarkPlugins,
  renderContext?: MessageRenderContext,
) => {
  if (block.type === 'markdown') {
    const raw = block.content || '';
    // markdown 块中若仍含已知自定义标签（嵌套拆分解耦 / 流式半截后残留），二次 parse 走组件管道。
    if (hasKnownCustomTags(raw)) {
      const nested = parseXmlTags(raw);
      if (nested.some((b) => b.type === 'component')) {
        return (
          <React.Fragment key={key}>
            {renderBlocks(nested, key, enableVisualizations, onFollowUpSelect, remarkPlugins, renderContext)}
          </React.Fragment>
        );
      }
    }
    return renderMarkdownWithSvg(raw, key, remarkPlugins);
  }

  const { tagName, props: compProps, childrenText } = block;

  // Visualization components
  if (enableVisualizations && tagName && VIZ_TAG_SET.has(tagName)) {
    const repairContext = tagName === 'SvgDiagram'
      ? {
          sessionId: renderContext?.sessionId,
          messageId: renderContext?.messageId,
          blockIndex: renderContext?.nextSvgBlockIndex?.(),
          modelId: renderContext?.repairModelId,
          topic: renderContext?.topic,
        }
      : undefined;
    return (
      <VizErrorBoundary key={key} label="图形" source={childrenText || ''}>
        <ChatMessageVisualizations
          tagName={tagName}
          props={compProps || {}}
          childrenText={childrenText || ''}
          repairContext={repairContext}
        />
      </VizErrorBoundary>
    );
  }

  // Inline ToolCall
  if (tagName === 'ToolCall') {
    return <ToolCallDashboard key={key} toolCalls={[{ id: `inline-${key}`, name: compProps?.name || '', arguments: compProps || {}, status: 'success' }]} />;
  }

  // Answer / Thinking：内层可能含 FormulaSteps 等，必须二次 parse，不可直接 rehype-raw。
  if (tagName === 'Answer' || tagName === 'Thinking') {
    const innerBlocks = parseXmlTags(childrenText || '');
    return (
      <React.Fragment key={key}>
        {renderBlocks(innerBlocks, key, enableVisualizations, onFollowUpSelect, remarkPlugins, renderContext)}
      </React.Fragment>
    );
  }

  // Fallback: unknown tag
  return (
    <div key={key} style={{
      padding: '0.5rem',
      border: '1px dashed var(--md-sys-color-outline-variant)',
      color: 'var(--md-sys-color-on-surface-variant)',
      fontSize: '0.8rem',
      borderRadius: '6px',
      margin: '0.5rem 0',
    }}>
      [&lt;{tagName} /&gt; 交互式内容正在加载或不可用]
    </div>
  );
};

/* ---- Main MessageContent component ---- */
const MessageContentComponent: React.FC<MessageContentProps> = ({
  content,
  enableVisualizations = true,
  onFollowUpSelect,
  preserveLineBreaks = false,
  sessionId,
  messageId,
  repairModelId,
  topic,
}) => {
  const { followUps, blocks } = useMemo(() => {
    return parseChatContent(content);
  }, [content]);

  const remarkPlugins = useMemo(
    () => (preserveLineBreaks ? [...sharedRemarkPlugins, remarkSoftBreaks] : sharedRemarkPlugins),
    [preserveLineBreaks],
  );

  const svgBlockCounter = { current: 0 };
  const renderContext: MessageRenderContext = {
    sessionId,
    messageId,
    repairModelId,
    topic,
    nextSvgBlockIndex: () => svgBlockCounter.current++,
  };

  return (
    <>
      {renderBlocks(blocks, 'root', enableVisualizations, onFollowUpSelect, remarkPlugins, renderContext)}
      {followUps.length > 0 && onFollowUpSelect && (
        <FollowUpQuestions questions={followUps} onSelect={onFollowUpSelect} />
      )}
    </>
  );
};

export const MessageContent = React.memo(MessageContentComponent);
MessageContent.displayName = 'MessageContent';

export default MessageContent;
