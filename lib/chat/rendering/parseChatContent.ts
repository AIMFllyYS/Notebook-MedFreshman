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
