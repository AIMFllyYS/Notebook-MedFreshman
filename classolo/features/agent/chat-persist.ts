import { getDb, insertChatMessage } from '@/classolo/lib/db'
import { getTranscriptPublic } from '@/classolo/lib/session'

const seqBySession = new Map<string, number>()

export interface ChatTerminalRecord {
  role: 'user' | 'assistant'
  content: string
}

export type PersistChatTerminal = (record: ChatTerminalRecord) => Promise<void>

function nextSeq(sessionId: string): number {
  const current = seqBySession.get(sessionId) ?? 0
  seqBySession.set(sessionId, current + 1)
  return current
}

export function resetChatPersistSeq(): void {
  seqBySession.clear()
}

export async function persistChatTerminal(
  record: ChatTerminalRecord,
): Promise<void> {
  const sessionId = getTranscriptPublic().sessionId
  if (!sessionId) return
  try {
    const db = await getDb()
    await insertChatMessage(db, {
      sessionId,
      seq: nextSeq(sessionId),
      role: record.role,
      content: record.content,
    })
  } catch {
    // persistence must never blank the chat UI
  }
}
