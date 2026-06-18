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

/* ---- Markdown rendering components ---- */
const mdComponents = {
  p: ({ node, ...props }: any) => <p style={{ marginBottom: '0.4rem' }} {...props} />,
  a: ({ node, ...props }: any) => (
    <a style={{ color: 'var(--md-sys-color-primary)' }} target="_blank" rel="noopener noreferrer" {...props} />
  ),
  table: ({ node, ...props }: any) => (
    <div style={{ overflowX: 'auto', marginBottom: '0.5rem' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.9em' }} {...props} />
    </div>
  ),
  th: ({ node, ...props }: any) => (
    <th style={{ border: '1px solid var(--md-sys-color-outline-variant)', padding: '6px 8px', background: 'var(--md-sys-color-surface-container-high)', textAlign: 'left' }} {...props} />
  ),
  td: ({ node, ...props }: any) => (
    <td style={{ border: '1px solid var(--md-sys-color-outline-variant)', padding: '6px 8px' }} {...props} />
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