'use client';

import React, { useMemo, Children, isValidElement } from 'react';
import ReactMarkdown from 'react-markdown';
import { sharedRemarkPlugins, sharedRehypePlugins } from '@/lib/markdown/plugins';
import remarkSoftBreaks from '@/lib/markdown/remarkSoftBreaks';
import { directiveComponents } from '@/lib/markdown/directiveComponents';
import { normalizeDirectiveLabels } from '@/lib/markdown/normalizeDirectiveLabels';
import 'katex/dist/katex.min.css';
import { parseXmlTags } from '@/lib/utils/xmlParser';
import { ChatMessageVisualizations } from '@/components/chat/ChatMessageVisualizations';
import { ToolCallDashboard } from '@/components/chat/ToolCallDashboard';
import { FollowUpQuestions } from '@/components/chat/FollowUpQuestions';
import CodeBlock from '@/components/shared/CodeBlock';
import { ChatImage } from '@/components/chat/ChatImage';
import { ImageStrip } from '@/components/chat/ImageStrip';
import { RawSvgViewer } from '@/components/canvas';
import { sanitizeSvg } from '@/lib/utils/sanitizeSvg';

interface MessageContentProps {
  content: string;
  enableVisualizations?: boolean;
  onFollowUpSelect?: (question: string) => void;
  /** 聊天体文本（用户输入/思考过程/生成依据）启用软换行：段内单 \n 渲染为 <br>。 */
  preserveLineBreaks?: boolean;
}

/**
 * Custom <p> component: when a paragraph contains 2+ images,
 * wrap them in an ImageStrip for horizontal scrolling.
 */
function ChatParagraph({ node, children, ...props }: any) {
  const childArray = Children.toArray(children);
  const imgChildren = childArray.filter(
    (c) => isValidElement(c) && (c.type === ChatImage || (c.props as any)?.src),
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
  a: ({ node, ...props }: any) => (
    <a target="_blank" rel="noopener noreferrer" {...props} />
  ),
  table: ({ node, ...props }: any) => (
    <div className="chat-table-scroll">
      <table {...props} />
    </div>
  ),
  pre: ({ node, ...props }: any) => <CodeBlock {...props} />,
};

/* ---- Markdown rendering that routes raw inline <svg> to the sanitized viewer ----
   助教有时直接吐裸 <svg>…</svg>（未用 <SvgDiagram> 包裹）。裸 SVG 会落进 markdown 块、
   被 rehype-raw 逐元素交给 React 渲染，而 <text>/<g>/<tspan> 等 SVG 命名空间标签在
   非 <svg> React 上下文下会触发「unrecognized tag」告警（流式半截 SVG 尤甚）。
   这里把完整的 <svg>…</svg> 切出来，经 sanitizeSvg(DOMPurify) 后交给 RawSvgViewer
   以 innerHTML 渲染（浏览器原生处理 SVG 命名空间，零告警）；其余文本仍走 ReactMarkdown。 */
const SVG_BLOCK_RE = /<svg[\s\S]*?<\/svg>/gi;

function renderMarkdownWithSvg(
  text: string,
  keyPrefix: string,
  remarkPlugins: typeof sharedRemarkPlugins,
): React.ReactNode {
  const content = text || '';
  const md = (key: string, value: string) => (
    <ReactMarkdown key={key} remarkPlugins={remarkPlugins} rehypePlugins={sharedRehypePlugins} components={mdComponents}>
      {value}
    </ReactMarkdown>
  );

  if (!content.includes('<svg')) return md(keyPrefix, content);

  const out: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  SVG_BLOCK_RE.lastIndex = 0;
  while ((m = SVG_BLOCK_RE.exec(content)) !== null) {
    const before = content.slice(last, m.index);
    if (before.trim()) out.push(md(`${keyPrefix}-md-${i}`, before));
    out.push(<RawSvgViewer key={`${keyPrefix}-svg-${i}`} svg={sanitizeSvg(m[0])} />);
    last = m.index + m[0].length;
    i++;
  }
  const tail = content.slice(last);
  if (tail.trim()) out.push(md(`${keyPrefix}-md-${i}`, tail));

  return <React.Fragment key={keyPrefix}>{out}</React.Fragment>;
}

/* ---- Render a single parsed block ---- */
const renderParsedBlock = (block: any, idx: number, enableVisualizations?: boolean, onFollowUpSelect?: (question: string) => void, remarkPlugins: typeof sharedRemarkPlugins = sharedRemarkPlugins) => {
  if (block.type === 'markdown') {
    return renderMarkdownWithSvg(block.content || '', `md-${idx}`, remarkPlugins);
  }

  const { tagName, props: compProps, childrenText } = block;

  // Visualization components
  const vizTags = ['InteractiveVenn', 'InlineDistribution', 'FormulaSteps', 'ManimPlayer', 'SvgDiagram'];
  if (enableVisualizations && vizTags.includes(tagName || '')) {
    return <ChatMessageVisualizations key={idx} tagName={tagName!} props={compProps || {}} childrenText={childrenText || ''} />;
  }

  // Inline ToolCall
  if (tagName === 'ToolCall') {
    return <ToolCallDashboard key={idx} toolCalls={[{ id: `inline-${idx}`, name: compProps?.name || '', arguments: compProps || {}, status: 'success' }]} />;
  }

  // Answer / Thinking tags rendered as markdown
  if (tagName === 'Answer' || tagName === 'Thinking') {
    return renderMarkdownWithSvg(childrenText || '', `at-${idx}`, remarkPlugins);
  }

  // Fallback: unknown tag
  return (
    <div key={idx} style={{
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

/* ---- Extract FollowUp questions from content ---- */
// 大小写不敏感：LLM 偶尔输出 <followup>；闭合标签到齐才提取（流式期间不显示，待完整再渲染按钮）。
const extractFollowUpQuestions = (content: string): string[] => {
  if (!content) return [];
  const match = content.match(/<FollowUp>([\s\S]*?)<\/FollowUp>/i);
  if (match) return match[1].split('|').map((q) => q.trim()).filter(Boolean);
  return [];
};

// 既剥离成对的 <FollowUp>…</FollowUp>，也剥离「流式输出期未闭合的尾巴」(<FollowUp>… 还没等到 </FollowUp>)。
// 否则半截标签会漏进下游 markdown，被 rehype-raw 当作 <followup> 原始 HTML 元素 → React「unrecognized tag」告警。
const getCleanedContent = (content: string): string =>
  content
    .replace(/<FollowUp>[\s\S]*?<\/FollowUp>/gi, '')
    .replace(/<FollowUp>[\s\S]*$/i, '')
    // 流式期未闭合的 <SvgDiagram> 尾巴：隐藏，待整体到齐再渲染（与 FollowUp 同理）。
    .replace(/<SvgDiagram\b(?:(?!<\/SvgDiagram>)[\s\S])*$/i, '')
    // 流式期未闭合的裸 <svg> 尾巴：先隐藏，待 </svg> 到齐再由 RawSvgViewer 整体渲染。
    // 否则半截 SVG 漏进 rehype-raw → <text>/<g> 等 SVG 命名空间标签触发 React「unrecognized tag」。
    .replace(/<svg\b(?:(?!<\/svg>)[\s\S])*$/i, '');

/* ---- Main MessageContent component ---- */
export const MessageContent: React.FC<MessageContentProps> = React.memo(({
  content,
  enableVisualizations = true,
  onFollowUpSelect,
  preserveLineBreaks = false,
}) => {
  const { followUps, blocks } = useMemo(() => {
    const followUps = extractFollowUpQuestions(content);
    const cleanedContent = normalizeDirectiveLabels(getCleanedContent(content));
    return { followUps, blocks: parseXmlTags(cleanedContent) };
  }, [content]);

  const remarkPlugins = useMemo(
    () => (preserveLineBreaks ? [...sharedRemarkPlugins, remarkSoftBreaks] : sharedRemarkPlugins),
    [preserveLineBreaks],
  );

  return (
    <>
      {blocks.map((block, idx) =>
        renderParsedBlock(block, idx, enableVisualizations, onFollowUpSelect, remarkPlugins)
      )}
      {followUps.length > 0 && onFollowUpSelect && (
        <FollowUpQuestions questions={followUps} onSelect={onFollowUpSelect} />
      )}
    </>
  );
});

export default MessageContent;