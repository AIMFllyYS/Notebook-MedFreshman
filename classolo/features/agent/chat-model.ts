import { createModel, getAiRuntimeConfig } from '@/classolo/lib/ai'
import { subscribeCommands } from '@/classolo/lib/session'

type ChatModel = ReturnType<typeof createModel>

let cached: ChatModel | null = null

export function invalidateChatModel(): void {
  cached = null
}

export function bindAiConfigConsumer(): void {
  subscribeCommands((command) => {
    if (command.type === 'ai.configChanged') {
      invalidateChatModel()
    }
  })
}

export function getChatModel(): ChatModel {
  if (cached) return cached
  cached = createModel(getAiRuntimeConfig())
  return cached
}

bindAiConfigConsumer()
