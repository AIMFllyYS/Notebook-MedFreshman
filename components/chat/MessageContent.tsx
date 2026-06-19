'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { parseXmlTags } from '@/lib/utils/xmlParser';
import { ChatMessageVisualizations } from '@/components/chat/ChatMessageVisualizations';
import { ToolCallDashboard } from '@/components/chat/ToolCallDashboard';
import { FollowUpQuestions } from '@/components/chat/FollowUpQuestions';

interface MessageContentProps {
  content: string;
  enableVisualizations?: boolean;
  onFollowUpSelect?: (question: string) => void;
}

/* ---- Markdown rendering components ----
   排版交由 .chat-prose CSS 统一控制（行距/段距/标题/列表/引用/代码/表格/KaTeX）；
   这里只保留必要的行为：链接新开页、表格横向滚动包裹。 */
const mdComponents = {
  a: ({ node, ...props }: any) => (
    <a target="_blank" rel="noopener noreferrer" {...props} />
  ),
  table: ({ node, ...props }: any) => (
    <div className="chat-table-scroll">
      <table {...props} />
    </div>
  ),
};

const remarkPlugins = [remarkMath, remarkGfm];
const rehypePlugins = [rehypeKatex];

/* ---- Render a single parsed block ---- */
const renderParsedBlock = (block: any, idx: number, enableVisualizations?: boolean, onFollowUpSelect?: (question: string) => void) => {
  if (block.type === 'markdown') {
    return (
      <ReactMarkdown key={idx} remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={mdComponents}>
        {block.content || ''}
      </ReactMarkdown>
    );
  }

  const { tagName, props: compProps, childrenText } = block;

  // Visualization components
  const vizTags = ['InteractiveVenn', 'InteractiveDistribution', 'FormulaSteps', 'ManimPlayer', 'ManimAnimation', 'InteractiveFormulaDerivation'];
  if (enableVisualizations && vizTags.includes(tagName || '')) {
    return <ChatMessageVisualizations key={idx} tagName={tagName!} props={compProps || {}} childrenText={childrenText || ''} />;
  }

  // Inline ToolCall
  if (tagName === 'ToolCall') {
    return <ToolCallDashboard key={idx} toolCalls={[{ id: `inline-${idx}`, name: compProps?.name || '', arguments: compProps || {}, status: 'success' }]} />;
  }

  // Answer / Thinking tags rendered as markdown
  if (tagName === 'Answer' || tagName === 'Thinking') {
    return (
      <ReactMarkdown key={idx} remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={mdComponents}>
        {childrenText || ''}
      </ReactMarkdown>
    );
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
const extractFollowUpQuestions = (content: string): string[] => {
  if (!content) return [];
  const match = content.match(/<FollowUp>(.*?)<\/FollowUp>/s);
  if (match) return match[1].split('|').map((q) => q.trim()).filter(Boolean);
  return [];
};

const getCleanedContent = (content: string): string =>
  content.replace(/<FollowUp>.*?<\/FollowUp>/s, '');

/* ---- Main MessageContent component ---- */
export const MessageContent: React.FC<MessageContentProps> = ({
  content,
  enableVisualizations = true,
  onFollowUpSelect,
}) => {
  const followUps = extractFollowUpQuestions(content);
  const cleanedContent = getCleanedContent(content);

  return (
    <>
      {parseXmlTags(cleanedContent).map((block, idx) =>
        renderParsedBlock(block, idx, enableVisualizations, onFollowUpSelect)
      )}
      {followUps.length > 0 && onFollowUpSelect && (
        <FollowUpQuestions questions={followUps} onSelect={onFollowUpSelect} />
      )}
    </>
  );
};

export default MessageContent;