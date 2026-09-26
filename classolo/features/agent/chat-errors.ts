import { MissingAISecretError } from '@/classolo/lib/ai'

export type ChatFailureKind = 'missing-key' | 'rate-limit' | 'timeout' | 'network' | 'unknown'

export function classifyChatError(error: unknown): ChatFailureKind {
  if (error instanceof MissingAISecretError) return 'missing-key'
  const status = readStatus(error)
  const message = error instanceof Error ? error.message : String(error)
  if (status === 429 || /rate limit|too many requests|429/i.test(message)) {
    return 'rate-limit'
  }
  if (status === 408 || /timeout|etimedout|aborted/i.test(message)) {
    return 'timeout'
  }
  if (
    status === 503 ||
    /network|fetch failed|econnreset|enotfound|failed to fetch/i.test(message)
  ) {
    return 'network'
  }
  return 'unknown'
}

export function isRetryableChatError(error: unknown): boolean {
  const kind = classifyChatError(error)
  return kind === 'rate-limit' || kind === 'timeout' || kind === 'network'
}

export function formatChatError(error: unknown): string {
  switch (classifyChatError(error)) {
    case 'missing-key':
      return '缺密钥：未配置 AI API key'
    case 'rate-limit':
      return '模型限流，请稍后重试'
    case 'timeout':
      return '模型请求超时，请稍后重试'
    case 'network':
      return '网络异常，无法完成本轮对话'
    default:
      return error instanceof Error && error.message.trim()
        ? error.message
        : '对话失败'
  }
}

function readStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined
  if ('statusCode' in error && typeof error.statusCode === 'number') {
    return error.statusCode
  }
  if ('status' in error && typeof error.status === 'number') {
    return error.status
  }
  return undefined
}
