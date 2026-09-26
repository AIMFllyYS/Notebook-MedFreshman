import {getClassUserId} from '@/classolo/lib/db'
import { MissingAISecretError, streamText, stepCountIs } from '@/classolo/lib/ai'
import { resolveSecret } from '@/classolo/lib/providers/secrets'
import { getNotesPublic, getTranscriptPublic } from '@/classolo/lib/session'

import { formatChatError, isRetryableChatError } from './chat-errors'
import { getChatModel } from './chat-model'
import { persistChatTerminal, type PersistChatTerminal } from './chat-persist'
import { patchChatPrivate } from './chat-store'
import {
  searchTranscriptSnapshot,
  searchTranscriptTool,
} from './search-transcript'

export type ChatDeltaStream = (
  prompt: string,
) => AsyncIterable<{ text?: string; reasoning?: string }>

export const CHAT_RETRY_DELAYS_MS:readonly number[] = []

export type ChatSleep = (ms: number) => Promise<void>

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function* defaultModelStream(
  prompt: string,
): AsyncIterable<{ text?: string; reasoning?: string }> {
  const secret = resolveSecret('ai')
  if (secret.value === null) {
    throw new MissingAISecretError()
  }
  const result = streamText({
    model: getChatModel(),
    prompt,
    tools: { search_transcript: searchTranscriptTool },
    stopWhen:stepCountIs(4),maxOutputTokens:2048,maxRetries:0,
  })
  for await (const part of result.textStream) {
    yield { text: part }
  }
}

function packPrompt(prompt: string): string {
  const outline = getNotesPublic()
    .outlineDigest.map((node) => node.title)
    .join('、')
  const recent = getTranscriptPublic()
    .committed.slice(-6)
    .map((segment) => segment.text)
    .join('\n')
  const hits = searchTranscriptSnapshot(prompt)
  const evidence =
    hits.length > 0
      ? hits.map((hit) => `[${hit.segmentId}] ${hit.text}`).join('\n')
      : '（无命中，请调用 search_transcript 工具）'
  return `课堂提纲：${outline || '（尚无）'}\n最近文稿：\n${recent}\n检索命中：\n${evidence}\n\n学生提问：${prompt}`
}

export async function runChatTurn(
  prompt: string,
  stream: ChatDeltaStream = defaultModelStream,
  options: {
    persist?: PersistChatTerminal
    sleep?: ChatSleep
  } = {},
): Promise<void> {
  const sessionId=getTranscriptPublic().sessionId; const owner=getClassUserId()
  const current=()=>getTranscriptPublic().sessionId===sessionId&&getClassUserId()===owner
  const save=options.persist ?? persistChatTerminal
  const persist:PersistChatTerminal=async record=>{if(current())await save(record)}
  const sleep = options.sleep ?? defaultSleep
  const packed = packPrompt(prompt)
  patchChatPrivate({
    streaming: true,
    answer: '',
    reasoning: '正在思考…',
    error: null,
  })
  await persist({ role: 'user', content: prompt })
  const attempts = CHAT_RETRY_DELAYS_MS.length + 1
  try {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        let answer = ''
        for await (const delta of stream(packed)) {
          if(!current())return
          if (delta.reasoning) {
            patchChatPrivate({ reasoning: delta.reasoning })
          }
          if (delta.text) {
            answer += delta.text
            patchChatPrivate({ answer, error: null })
          }
        }
        await persist({ role: 'assistant', content: answer })
        patchChatPrivate({ reasoning: '' })
        return
      } catch (error) {
        if(!current())return
        const delay = CHAT_RETRY_DELAYS_MS[attempt]
        if (isRetryableChatError(error) && delay !== undefined) {
          patchChatPrivate({
            reasoning: `${formatChatError(error)}，正在重试（${attempt + 2}/${attempts}）…`,
          })
          await sleep(delay)
          continue
        }
        const message = formatChatError(error)
        patchChatPrivate({ answer: '', reasoning: '', error: message })
        await persist({ role: 'assistant', content: message })
        return
      }
    }
  } finally {
    if(current())patchChatPrivate({ streaming: false })
  }
}
