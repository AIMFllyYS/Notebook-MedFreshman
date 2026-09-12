import type { ChatMessage, ChatMessagePart } from '@/lib/types/chat';
import type { ChatToolPart } from '@/lib/chat/messageParts';
import { hasStepStart } from '@/lib/chat/messageParts';
import { splitThinkContent } from '@/lib/chat/rendering/parseChatContent';
import { getToolPresentation } from '@/lib/ai/agent/tools/presentations';

export type TraceStatus = 'running' | 'complete' | 'error' | 'interrupted' | 'waiting';
export type TraceToolPart = ChatToolPart | Extract<ChatMessagePart, { type: 'dynamic-tool' }>;

interface TraceStepBase {
  id: string;
  partIndex: number;
  status: TraceStatus;
  title: string;
  summary: string;
}

export interface TraceTextStep extends TraceStepBase {
  kind: 'reasoning' | 'text';
  text: string;
}

export interface TraceToolStep extends TraceStepBase {
  kind: 'tool';
  name: string;
  part: TraceToolPart;
}

export type TraceStep = TraceTextStep | TraceToolStep;

export type TraceRenderBlock =
  | { kind: 'trace'; steps: TraceStep[] }
  | { kind: 'answer'; text: string };

export interface AgentTraceModel {
  steps: TraceStep[];
  blocks: TraceRenderBlock[];
  answerText: string;
  toolCount: number;
  errorCount: number;
  interruptedCount: number;
  waitingCount: number;
}

export function isTraceToolPart(part: ChatMessagePart): part is TraceToolPart {
  return part.type === 'dynamic-tool' || part.type.startsWith('tool-');
}

export function traceToolName(part: TraceToolPart): string {
  return part.type === 'dynamic-tool' ? part.toolName : part.type.slice(5);
}

function preview(text: string): string {
  const compact = text.replace(/\s+/g, ' ').trim();
  return compact.length > 110 ? `${compact.slice(0, 110)}…` : compact;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function getTraceToolOutput(part: TraceToolPart): string {
  if (part.state === 'output-error') return part.errorText;
  if (part.state === 'output-denied') return part.approval.reason || '此次工具调用未获批准';
  if (part.state === 'approval-responded' && !part.approval.approved) return part.approval.reason || '此次工具调用未获批准';
  if (part.state !== 'output-available') return '';
  if (typeof part.output === 'string') return part.output;
  const output = record(part.output);
  if (typeof output.text === 'string') return output.text;
  return JSON.stringify(part.output, null, 2) ?? '';
}

export function getTraceToolStatus(part: TraceToolPart, isStreaming: boolean): TraceStatus {
  if (part.state === 'output-error' || part.state === 'output-denied') return 'error';
  if (part.state === 'output-available' && !part.preliminary) return 'complete';
  if (part.state === 'approval-requested') return 'waiting';
  if (part.state === 'approval-responded' && !part.approval.approved) return 'error';
  // A saved or aborted incomplete call must never keep a historical message spinning.
  return isStreaming ? 'running' : 'interrupted';
}

export function buildToolTraceStep(part: TraceToolPart, partIndex: number, isStreaming = false): TraceToolStep {
  const name = traceToolName(part);
  const status = getTraceToolStatus(part, isStreaming);
  const input = record(part.input);
  const output = part.state === 'output-available' ? record(part.output) : {};
  let summary = '';

  if (status === 'error') {
    summary = getTraceToolOutput(part) || '此次工具调用未获批准';
  } else if (status === 'interrupted') {
    summary = '已停止，未收到完整结果';
  } else if (status === 'waiting') {
    summary = '等待批准后继续';
  } else if (output.deduped) {
    summary = '已在上下文中，复用已加载内容';
  } else if (Array.isArray(output.images)) {
    summary = `找到 ${output.images.length} 张笔记图片`;
  } else if (Array.isArray(output.questions)) {
    summary = `${output.questions.length} 道题${output.title ? ` · ${output.title}` : ''}`;
  } else if (output.documentId) {
    const docTitle = typeof output.spec === 'object' && output.spec ? (output.spec as Record<string, unknown>).title : undefined;
    summary = `文档：${typeof docTitle === 'string' ? docTitle : '未命名'}`;
  } else if (Array.isArray(output.sources)) {
    summary = `${output.sources.length} ${name === 'imageSearch' ? '张图片' : '条来源'}${output.cacheHit ? ' · 缓存命中' : ''}`;
  } else if (Array.isArray(output.hits)) {
    summary = `找到 ${output.hits.length} 条笔记`;
  } else if (typeof output.skill === 'string') {
    summary = `${output.found === false ? '未找到技能' : '已调用技能'}：${output.skill}`;
  } else if (typeof output.title === 'string' && output.title) {
    summary = output.title;
  } else {
    summary = [input.query, input.title, input.name, input.path, input.sectionId]
      .find((value): value is string => typeof value === 'string' && value.length > 0)
      ?? (status === 'running'
        ? (part.state === 'input-streaming' ? '正在准备参数…' : '正在运行…')
        : getTraceToolOutput(part));
  }

  return {
    id: `tool:${part.toolCallId}`,
    partIndex,
    kind: 'tool',
    status,
    name,
    title: getToolPresentation(name)?.label ?? part.title ?? name,
    summary: preview(summary),
    part,
  };
}

function summarizeTrace(steps: TraceStep[], answerText: string, blocks: TraceRenderBlock[]): AgentTraceModel {
  return {
    steps,
    blocks,
    answerText,
    toolCount: steps.filter((step) => step.kind === 'tool').length,
    errorCount: steps.filter((step) => step.status === 'error').length,
    interruptedCount: steps.filter((step) => step.status === 'interrupted').length,
    waitingCount: steps.filter((step) => step.status === 'waiting').length,
  };
}

function pushTextStep(
  steps: TraceStep[],
  kind: TraceTextStep['kind'],
  text: string,
  partIndex: number,
  streaming: boolean,
  isStreaming: boolean,
  suffix = '',
): TraceTextStep | undefined {
  if (!text.trim() && !streaming) return undefined;
  const step: TraceTextStep = {
    id: `${kind}:${partIndex}${suffix}`,
    kind,
    partIndex,
    text,
    status: streaming ? (isStreaming ? 'running' : 'interrupted') : 'complete',
    title: kind === 'reasoning' ? '思考' : '进展说明',
    summary: preview(text) || '正在思考…',
  };
  steps.push(step);
  return step;
}

/**
 * A view projection, never a second message store. Reasoning and tool calls retain
 * their exact parts positions. Messages with step-start keep text as answer segments
 * in parts order (same boundary as getAnswerText). Messages without step-start fall
 * back to two buckets: text before the last tool is commentary; the rest is the answer.
 * A later streamed tool can move a provisional two-bucket answer into the trace, but
 * it is never rendered in both places in the same snapshot.
 */
export function buildTrace(message: Pick<ChatMessage, 'parts'>, isStreaming = false): AgentTraceModel {
  return hasStepStart(message.parts)
    ? buildTimelineTrace(message.parts, isStreaming)
    : buildBucketTrace(message.parts, isStreaming);
}

function buildBucketTrace(parts: readonly ChatMessagePart[], isStreaming: boolean): AgentTraceModel {
  const steps: TraceStep[] = [];
  const answer: string[] = [];
  let lastToolIndex = -1;
  for (let index = parts.length - 1; index >= 0; index--) {
    if (isTraceToolPart(parts[index])) {
      lastToolIndex = index;
      break;
    }
  }

  parts.forEach((part, partIndex) => {
    if (isTraceToolPart(part)) {
      steps.push(buildToolTraceStep(part, partIndex, isStreaming));
    } else if (part.type === 'reasoning') {
      pushTextStep(steps, 'reasoning', part.text, partIndex, part.state === 'streaming', isStreaming);
    } else if (part.type === 'text') {
      const split = splitThinkContent(part.text);
      if (split.reasoning) {
        pushTextStep(steps, 'reasoning', split.reasoning, partIndex, part.state === 'streaming' && !split.content.trim(), isStreaming, ':think');
      }
      if (partIndex <= lastToolIndex) {
        pushTextStep(steps, 'text', split.content, partIndex, part.state === 'streaming', isStreaming);
      } else if (split.content.trim()) {
        answer.push(split.content);
      }
    }
  });

  const answerText = answer.join('\n\n');
  const blocks: TraceRenderBlock[] = [];
  if (steps.length) blocks.push({ kind: 'trace', steps });
  if (answerText) blocks.push({ kind: 'answer', text: answerText });
  return summarizeTrace(steps, answerText, blocks);
}

function buildTimelineTrace(parts: readonly ChatMessagePart[], isStreaming: boolean): AgentTraceModel {
  const steps: TraceStep[] = [];
  const answer: string[] = [];
  const blocks: TraceRenderBlock[] = [];
  let currentSteps: TraceStep[] = [];
  let separateAnswer = false;

  const flushSteps = () => {
    if (!currentSteps.length) return;
    blocks.push({ kind: 'trace', steps: currentSteps });
    currentSteps = [];
  };

  const addStep = (step: TraceStep) => {
    steps.push(step);
    currentSteps.push(step);
  };

  parts.forEach((part, partIndex) => {
    if (part.type === 'step-start') {
      separateAnswer = true;
      return;
    }
    if (isTraceToolPart(part)) {
      addStep(buildToolTraceStep(part, partIndex, isStreaming));
      return;
    }
    if (part.type === 'reasoning') {
      const step = pushTextStep(steps, 'reasoning', part.text, partIndex, part.state === 'streaming', isStreaming);
      if (step) currentSteps.push(step);
      return;
    }
    if (part.type !== 'text') return;

    const split = splitThinkContent(part.text);
    if (split.reasoning) {
      const step = pushTextStep(
        steps,
        'reasoning',
        split.reasoning,
        partIndex,
        part.state === 'streaming' && !split.content.trim(),
        isStreaming,
        ':think',
      );
      if (step) currentSteps.push(step);
    }
    if (!split.content.trim()) return;

    flushSteps();
    const prev = blocks[blocks.length - 1];
    if (prev?.kind === 'answer' && !separateAnswer) {
      prev.text = `${prev.text}\n\n${split.content}`;
    } else {
      blocks.push({ kind: 'answer', text: split.content });
    }
    separateAnswer = false;
    answer.push(split.content);
  });

  flushSteps();
  return summarizeTrace(steps, answer.join('\n\n'), blocks);
}
