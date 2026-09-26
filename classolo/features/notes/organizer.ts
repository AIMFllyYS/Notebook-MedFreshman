import { isClassHydrating } from '@/classolo/lib/db'
import { createModel, generateText } from '@/classolo/lib/ai'
import { resolveSecret } from '@/classolo/lib/providers/secrets'
import { getTranscriptPublic, subscribeTranscriptPublic } from '@/classolo/lib/session'
import { patchNotesPublic } from '@/classolo/lib/session/writes/notes'
import type { OutlineDigestNode } from '@/classolo/lib/session'

export const OUTLINE_DEBOUNCE_MS = 4000

export type OutlineGenerator = (
  texts: string[],
) => Promise<readonly OutlineDigestNode[]>

export interface OutlineOrganizerOptions {
  generate?: OutlineGenerator
  debounceMs?: number
  subscribeCommitted?: (onCommitted: () => void) => () => void
  readTexts?: () => string[]
}

let timer: ReturnType<typeof setTimeout> | null = null
let generateCalls = 0
let runId = 0
let stopCurrent: (() => void) | null = null

function stableId(title: string): string {
  let hash = 0
  for (let i = 0; i < title.length; i += 1) {
    hash = (hash * 31 + title.charCodeAt(i)) | 0
  }
  return `outline-${Math.abs(hash)}`
}

function defaultReadTexts(): string[] {
  return getTranscriptPublic().committed.map((segment) => segment.text)
}

async function outlineFromTranscript(
  texts: string[],
): Promise<readonly OutlineDigestNode[]> {
  const titled = await modelOutline(texts)
  const committed = getTranscriptPublic().committed
  return titled.map((node, index) => ({
    id: committed[index]?.id ?? node.id,
    title: node.title,
  }))
}

function defaultSubscribeCommitted(onCommitted: () => void): () => void {
  return subscribeTranscriptPublic(
    (state) => state.committedVersion,
    () => {
      if(!isClassHydrating())onCommitted()
    },
  )
}

function readAiRuntime(): { baseUrl: string; model: string } {
  const env =
    typeof process === 'undefined' || !process.env ? undefined : process.env
  const baseUrl =
    env?.NEXT_PUBLIC_AI_BASE_URL?.trim() ||
    env?.AI_BASE_URL?.trim() ||
    'https://api.openai.com/v1'
  const model =
    env?.NEXT_PUBLIC_AI_MODEL?.trim() ||
    env?.AI_MODEL?.trim() ||
    'z-ai/glm-5.3-flash'
  return { baseUrl, model }
}

export async function heuristicOutline(
  texts: string[],
): Promise<readonly OutlineDigestNode[]> {
  const titles = texts
    .map((text) => text.trim().slice(0, 24))
    .filter((title) => title.length > 0)
  const unique: OutlineDigestNode[] = []
  const seen = new Set<string>()
  for (const title of titles) {
    const id = stableId(title)
    if (seen.has(id)) continue
    seen.add(id)
    unique.push({ id, title })
  }
  return unique
}

export async function modelOutline(
  texts: string[],
): Promise<readonly OutlineDigestNode[]> {
  if (texts.every((text) => text.trim().length === 0)) {
    return []
  }
  const secret = resolveSecret('ai')
  if (secret.value === null) {
    return heuristicOutline(texts)
  }
  try {
    const runtime = readAiRuntime()
    const model = createModel({
      baseUrl: runtime.baseUrl,
      model: runtime.model,
    })
    const result = await generateText({
      model,maxOutputTokens:1024,maxRetries:0,
      prompt: `用中文列出本节课大纲标题，每行一个，不要编号，不要解释。\n${texts.slice(-12).join('\n')}`,
    })
    const lines = result.text
      .split('\n')
      .map((line) => line.replace(/^\d+[\.、)\s]*/u, '').trim())
      .filter(Boolean)
    return heuristicOutline(lines.length > 0 ? lines : texts)
  } catch {
    return heuristicOutline(texts)
  }
}

export function getOutlineGenerateCalls(): number {
  return generateCalls
}

export function startOutlineOrganizer(
  options: OutlineOrganizerOptions = {},
): () => void {
  stopCurrent?.()

  const generate = options.generate ?? outlineFromTranscript
  const debounceMs = options.debounceMs ?? OUTLINE_DEBOUNCE_MS
  const readTexts = options.readTexts ?? defaultReadTexts
  const subscribeCommitted =
    options.subscribeCommitted ?? defaultSubscribeCommitted

  const schedule = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      const currentRun = runId + 1
      runId = currentRun
      generateCalls += 1
      void (async () => {
        const texts = readTexts()
        if (texts.every((text) => text.trim().length === 0)) {
          return
        }
        const sessionId=getTranscriptPublic().sessionId
        const digest = await generate(texts)
        if (getTranscriptPublic().sessionId!==sessionId || currentRun !== runId) return
        patchNotesPublic({ outlineDigest: digest })
      })()
    }, debounceMs)
  }

  const unsubscribe = subscribeCommitted(schedule)

  const stop = () => {
    unsubscribe()
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    runId += 1
    if (stopCurrent === stop) {
      stopCurrent = null
    }
  }
  stopCurrent = stop
  return stop
}
