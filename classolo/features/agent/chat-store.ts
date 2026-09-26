import { createStore } from 'zustand/vanilla'

export interface ChatPrivateState {
  open: boolean
  input: string
  streaming: boolean
  answer: string
  reasoning: string
  error: string | null
}

export const initialChatPrivate: ChatPrivateState = {
  open: false,
  input: '',
  streaming: false,
  answer: '',
  reasoning: '',
  error: null,
}

export const chatPrivateStore = createStore<ChatPrivateState>(
  () => initialChatPrivate,
)

export function getChatPrivate(): ChatPrivateState {
  return chatPrivateStore.getState()
}

export function patchChatPrivate(patch: Partial<ChatPrivateState>): void {
  chatPrivateStore.setState(patch)
}

export function resetChatPrivate(): void {
  chatPrivateStore.setState(initialChatPrivate)
}

export function toggleChatOpen(): void {
  chatPrivateStore.setState((state) => ({ open: !state.open }))
}
