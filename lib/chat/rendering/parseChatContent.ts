import { normalizeDirectiveLabels } from '@/lib/markdown/normalizeDirectiveLabels';
import type { ParsedBlock } from '@/lib/types/chat';
import { parseXmlTags, stripUnclosedCustomTagTails } from '@/lib/utils/xmlParser';

export interface ChatRenderMetadata {
  type: 'metadata';
  kind: 'followup';
  questions: string[];
}

export interface ParsedChatContent {
  markdown: string;
  blocks: ParsedBlock[];
  metadata: ChatRenderMetadata[];
  followUps: string[];
}

interface ParseChatContentOptions {
  streaming?: boolean;
}

const COMPLETE_FOLLOWUP_RE = /<FollowUp\b[^>]*>([\s\S]*?)<\/FollowUp>/gi;
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

function prepareMarkdown(content: string, options: ParseChatContentOptions): string {
  const withoutFollowUps = content.replace(COMPLETE_FOLLOWUP_RE, '');
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
  const markdown = prepareMarkdown(content, options);
  const rawBlocks = parseXmlTags(markdown);
  const metadata: ChatRenderMetadata[] = followUps.length
    ? [{ type: 'metadata', kind: 'followup', questions: followUps }]
    : [];

  const blocks = rawBlocks.filter((block) => block.tagName !== 'FollowUp');

  return {
    markdown,
    blocks,
    metadata,
    followUps,
  };
}
