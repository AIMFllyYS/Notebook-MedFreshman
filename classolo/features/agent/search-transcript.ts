import { z } from 'zod'

import { tool } from '@/classolo/lib/ai'
import { getTranscriptPublic } from '@/classolo/lib/session'
import type { TranscriptCommittedSegment } from '@/classolo/lib/session'

export interface TranscriptHit {
  segmentId: string
  seq: number
  text: string
}

export function searchTranscriptSnapshot(
  query: string,
  committed: readonly TranscriptCommittedSegment[] = getTranscriptPublic()
    .committed,
): readonly TranscriptHit[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return []
  return committed
    .filter((segment) => segment.text.toLowerCase().includes(needle))
    .map((segment) => ({
      segmentId: segment.id,
      seq: segment.seq,
      text: segment.text,
    }))
}

export const searchTranscriptTool = tool({
  description:
    '检索本节课已确认文稿。必须用这个工具回答“刚才老师说了什么”，不要靠模型记忆。',
  inputSchema: z.object({
    query: z.string().describe('关键词，如“惯性”'),
  }),
  execute: async ({ query }: { query: string }) =>
    searchTranscriptSnapshot(query),
})
