import { normalizeDirectiveLabels } from '@/lib/markdown/normalizeDirectiveLabels';
import type { ParsedBlock } from '@/lib/types/chat';
import { parseXmlTags, stripUnclosedCustomTagTails } from '@/lib/utils/xmlParser';

export interface ChatRenderMetadata {
  type: 'metadata';
  kind: 'followup' | 'reasoning';
  questions: string[];
  content?: string;
}

export interface ParsedChatContent {
  markdown: string;
  blocks: ParsedBlock[];
  metadata: ChatRenderMetadata[];
  followUps: string[];
  reasoning: string[];
}

interface ParseChatContentOptions {
  streaming?: boolean;
}

const COMPLETE_FOLLOWUP_RE = /<FollowUp\b[^>]*>([\s\S]*?)<\/FollowUp>/gi;
const COMPLETE_THINK_RE = /<think\b[^>]*>([\s\S]*?)<\/think>/gi;
const UNCLOSED_THINK_RE = /<think\b[^>]*>[\s\S]*$/i;
const UNCLOSED_RAW_SVG_RE = /<svg\b(?:(?!<\/svg>)[\s\S])*$/i;

export function parseFollowUpQuestions(text: string): string[] {
  return text
    .split('|')
    .map((question) => question.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function extractFollowUpQuestionsFromContent(content: string): string[] {
  if (!content) return [];

  const questions: string[] = [];
  COMPLETE_FOLLOWUP_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = COMPLETE_FOLLOWUP_RE.exec(content)) !== null) {
    questions.push(...parseFollowUpQuestions(match[1]));
  }
  return questions;
}

export function extractThinkBlocksFromContent(content: string): string[] {
  if (!content) return [];

  const reasoning: string[] = [];
  COMPLETE_THINK_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = COMPLETE_THINK_RE.exec(content)) !== null) {
    const value = match[1].trim();
    if (value) reasoning.push(value);
  }
  return reasoning;
}

export function stripThinkTagsFromContent(content: string, options: ParseChatContentOptions = {}): string {
  if (!content) return '';
  const withoutComplete = content.replace(COMPLETE_THINK_RE, '');
  return options.streaming === false
    ? withoutComplete
    : withoutComplete.replace(UNCLOSED_THINK_RE, '');
}

/**
 * 把正文中已闭合 + 正在流式生成（尚未闭合）的 <think> 内容都拆到 reasoning 里。
 * 用于实时思考面板：不少 OpenAI 兼容自定义端点（自部署 vLLM/SGLang/Ollama、部分中转网关）
 * 不走独立的 reasoning_content 字段，而是把思考过程直接以 <think>...</think> 混在正文流里。
 * 若只等闭合标签出现才提取（见 extractThinkBlocksFromContent），思考过程会在生成期间完全不可见，
 * 直到模型吐出 </think> 才整段一次性出现，体验上等同于"思考面板不工作"。
 */
export function splitThinkContent(
  content: string,
  options: ParseChatContentOptions = {},
): { content: string; reasoning: string } {
  if (!content) return { content: '', reasoning: '' };

  const reasoningParts = extractThinkBlocksFromContent(content);
  const withoutComplete = content.replace(COMPLETE_THINK_RE, '');

  if (options.streaming === false) {
    return { content: withoutComplete, reasoning: reasoningParts.join('\n\n') };
  }

  const unclosedMatch = withoutComplete.match(UNCLOSED_THINK_RE);
  if (unclosedMatch) {
    const partial = unclosedMatch[0].replace(/^<think\b[^>]*>/i, '').trim();
    if (partial) reasoningParts.push(partial);
    return {
      content: withoutComplete.slice(0, unclosedMatch.index),
      reasoning: reasoningParts.join('\n\n'),
    };
  }

  return { content: withoutComplete, reasoning: reasoningParts.join('\n\n') };
}

function prepareMarkdown(content: string, options: ParseChatContentOptions): string {
  const withoutThinking = stripThinkTagsFromContent(content, options);
  const withoutFollowUps = withoutThinking.replace(COMPLETE_FOLLOWUP_RE, '');
  const streamingSafe = options.streaming === false
    ? withoutFollowUps
    : stripUnclosedCustomTagTails(withoutFollowUps).replace(UNCLOSED_RAW_SVG_RE, '');
  return normalizeDirectiveLabels(streamingSafe);
}

export function parseChatContent(
  content: string,
  options: ParseChatContentOptions = {},
): ParsedChatContent {
  const followUps = extractFollowUpQuestionsFromContent(content);
  const reasoning = extractThinkBlocksFromContent(content);
  const markdown = prepareMarkdown(content, options);
  const rawBlocks = parseXmlTags(markdown);
  const metadata: ChatRenderMetadata[] = [
    ...(followUps.length ? [{ type: 'metadata' as const, kind: 'followup' as const, questions: followUps }] : []),
    ...(reasoning.length
      ? reasoning.map((content) => ({ type: 'metadata' as const, kind: 'reasoning' as const, questions: [], content }))
      : []),
  ];

  const blocks = rawBlocks.filter((block) => block.tagName !== 'FollowUp');

  return {
    markdown,
    blocks,
    metadata,
    followUps,
    reasoning,
  };
}
