import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import * as Icons from 'lucide-react';
import 'katex/dist/katex.min.css';
import type { ChatMessage } from '../../types/chat';
import { parseXmlTags } from '../../utils/xmlParser';
import type { ParsedBlock } from '../../utils/xmlParser';
import { InlineVenn, InlineDistribution, FormulaSteps, ManimPlayer } from './ChatMessageVisualizations';
import { ToolCallDashboard } from './ToolCallDashboard';
import { ReasoningBlock } from './ReasoningBlock';
import { FollowUpQuestions } from './FollowUpQuestions';

interface ChatMessageProps {
  message: ChatMessage;
  onSendMessage?: (content: string) => void;
  isStreaming?: boolean;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, onSendMessage, isStreaming }) => {
  const isUser = message.role === 'user';


  // 折叠处理过程的内部组件
  const ProcessingSteps: React.FC<{ msg: typeof message, streaming?: boolean }> = ({ msg, streaming }) => {
    const hasReasoning = !!msg.reasoningContent;
    const hasTools = !!msg.toolCalls && msg.toolCalls.length > 0;
    
    if (!hasReasoning && !hasTools) return null;

    const isProcessing = streaming || (msg.toolCalls && msg.toolCalls.some(t => t.status === 'running'));
    const [userExpanded, setUserExpanded] = useState<boolean | null>(null);

    // 如果用户没有手动切换过，则根据是否正在处理自动展开/折叠
    const expanded = userExpanded !== null ? userExpanded : isProcessing;

    return (
      <div style={{ 
        border: '1px solid var(--md-sys-color-outline-variant)', 
        borderRadius: '8px', 
        overflow: 'hidden',
        marginBottom: '12px',
        marginTop: '4px'
      }}>
        <button 
          onClick={() => setUserExpanded(!expanded)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'var(--md-sys-color-surface-container-high)',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--md-sys-color-on-surface-variant)',
            fontSize: '13px',
            fontWeight: 500
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isProcessing ? <Icons.Loader size={14} className="animate-spin" /> : <Icons.CheckCircle2 size={14} style={{ color: 'var(--success, #4CAF50)' }} />}
            <span>{isProcessing ? '正在深度思考与调用工具...' : '处理完毕'}</span>
          </div>
          {expanded ? <Icons.ChevronUp size={14} /> : <Icons.ChevronDown size={14} />}
        </button>
        
        {expanded && (
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--md-sys-color-surface-container)' }}>
            {msg.reasoningContent && (
              <ReasoningBlock 
                content={msg.reasoningContent} 
                isStreaming={streaming && !hasTools}
              />
            )}

            {msg.toolCalls && msg.toolCalls.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {msg.toolCalls.map((toolCall, idx) => (
                  <ToolCallDashboard
                    key={toolCall.id || `tool-${idx}`}
                    name={toolCall.name}
                    args={toolCall.arguments}
                    status={toolCall.status}
                    result={toolCall.result}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderParsedBlock = (block: ParsedBlock, idx: number) => {
    if (block.type === 'markdown') {
      return (
        <ReactMarkdown
          key={idx}
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex]}
          components={{
            p: ({node, ...props}) => <p style={{ marginBottom: '0.4rem' }} {...props} />,
            a: ({node, ...props}) => <a style={{ color: 'var(--primary)' }} target="_blank" rel="noopener noreferrer" {...props} />,
            table: ({node, ...props}) => (
              <div style={{ overflowX: 'auto', marginBottom: '0.5rem' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.9em' }} {...props} />
              </div>
            ),
            th: ({node, ...props}) => <th style={{ border: '1px solid var(--md-sys-color-outline-variant)', padding: '6px 8px', background: 'var(--md-sys-color-surface-container-high)', textAlign: 'left' }} {...props} />,
            td: ({node, ...props}) => <td style={{ border: '1px solid var(--md-sys-color-outline-variant)', padding: '6px 8px' }} {...props} />,
          }}
        >
          {block.content || ''}
        </ReactMarkdown>
      );
    }

    const { tagName, props } = block;
    switch (tagName) {
      case 'InteractiveVenn':
        return <InlineVenn key={idx} {...(props as any)} />;
      case 'InteractiveDistribution':
        return <InlineDistribution key={idx} {...(props as any)} />;
      case 'InteractiveFormulaDerivation':
      case 'FormulaSteps':
        return <FormulaSteps key={idx} formula={props?.formula || ''} {...(props as any)} />;
      case 'ManimVideo':
      case 'ManimAnimation':
        return <ManimPlayer key={idx} src={props?.src || ''} {...(props as any)} />;
      case 'ToolCall':
        return <ToolCallDashboard key={idx} name={props?.name || ''} {...(props as any)} />;
      case 'Answer':
      case 'Thinking':
        return (
          <ReactMarkdown
            key={idx}
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex]}
            components={{
              p: ({node, ...props}) => <p style={{ marginBottom: '0.4rem' }} {...props} />,
              table: ({node, ...props}) => <div style={{ overflowX: 'auto', marginBottom: '0.5rem' }}><table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.9em' }} {...props} /></div>,
              th: ({node, ...props}) => <th style={{ border: '1px solid var(--md-sys-color-outline-variant)', padding: '6px 8px', background: 'var(--md-sys-color-surface-container-high)', textAlign: 'left' }} {...props} />,
              td: ({node, ...props}) => <td style={{ border: '1px solid var(--md-sys-color-outline-variant)', padding: '6px 8px' }} {...props} />
            }}
          >
            {block.childrenText || ''}
          </ReactMarkdown>
        );
      default:
        return (
          <div key={idx} style={{ padding: '0.5rem', border: '1px dashed var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', borderRadius: '6px', margin: '0.5rem 0' }}>
            [&lt;{tagName} /&gt; 交互式内容正在加载或不可用]
          </div>
        );
    }
  };

  // 提取FollowUp问题
  const extractFollowUpQuestions = (): string[] => {
    if (!message.content) return [];
    const followUpMatch = message.content.match(/<FollowUp>(.*?)<\/FollowUp>/s);
    if (followUpMatch) {
      return followUpMatch[1].split('|').map(q => q.trim()).filter(q => q);
    }
    return message.followUpQuestions || [];
  };

  // 清理后的内容（移除FollowUp标签）
  const getCleanedContent = (): string => {
    return message.content.replace(/<FollowUp>.*?<\/FollowUp>/s, '');
  };

  const handleFollowUpClick = (question: string) => {
    if (onSendMessage) {
      onSendMessage(question);
    }
  };

  return (
    <div 
      className={`chat-message ${isUser ? 'user' : 'assistant'}`} 
      style={{ 
        width: '100%', 
        maxWidth: '100%',
        padding: '8px 0'
      }}
    >
      {/* Header */}
      <div style={{ 
        fontSize: '12px', 
        color: 'var(--md-sys-color-on-surface-variant)', 
        marginBottom: '8px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        {isUser ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icons.User size={12} /> 
            <span style={{ fontWeight: 500 }}>你</span>
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icons.Sparkles size={12} style={{ color: 'var(--md-sys-color-primary)' }} /> 
            <span style={{ fontWeight: 500 }}>概率助教</span>
            {message.metadata?.thinkingEnabled && (
              <span style={{ 
                fontSize: '10px', 
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-primary)'
              }}>
                深度思考
              </span>
            )}
            {message.metadata?.searchEnabled && (
              <span style={{ 
                fontSize: '10px', 
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'var(--md-sys-color-tertiary-container)',
                color: 'var(--md-sys-color-tertiary)'
              }}>
                联网搜索
              </span>
            )}
          </span>
        )}
      </div>

      {/* Content Area */}
      <div style={{ 
        color: isUser ? 'var(--md-sys-color-on-surface)' : 'inherit', 
        overflowWrap: 'break-word', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px' 
      }}>
        {isUser ? (
          <div style={{ 
            whiteSpace: 'pre-wrap',
            padding: '8px 12px',
            background: 'var(--md-sys-color-primary-container)',
            borderRadius: '12px',
            borderBottomRightRadius: '4px',
            fontSize: '13px',
            lineHeight: '1.5'
          }}>
            {message.content}
          </div>
        ) : (
          <>
            {/* Processing Steps Container (Thinking & Tools) */}
            <ProcessingSteps msg={message} streaming={isStreaming} />

            {/* Main Content */}
            <div style={{
              background: 'var(--md-sys-color-surface-container)',
              padding: '12px',
              borderRadius: '12px',
              borderBottomLeftRadius: '4px',
              fontSize: '13px',
              lineHeight: '1.5'
            }}>
              {parseXmlTags(getCleanedContent()).map((block, idx) => renderParsedBlock(block, idx))}
            </div>

            {/* Follow Up Questions */}
            {extractFollowUpQuestions().length > 0 && onSendMessage && (
              <FollowUpQuestions 
                questions={extractFollowUpQuestions()}
                onQuestionClick={handleFollowUpClick}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessageComponent;
