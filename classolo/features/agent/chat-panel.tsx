'use client'

import { useStore } from 'zustand'

import { Button } from '@/classolo/components/ui/button'
import { Input } from '@/classolo/components/ui/input'

import { chatPrivateStore, patchChatPrivate, toggleChatOpen } from './chat-store'
import { runChatTurn } from './chat-turn'

export function ChatPanel() {
  const open = useStore(chatPrivateStore, (state) => state.open)
  const input = useStore(chatPrivateStore, (state) => state.input)
  const streaming = useStore(chatPrivateStore, (state) => state.streaming)
  const answer = useStore(chatPrivateStore, (state) => state.answer)
  const reasoning = useStore(chatPrivateStore, (state) => state.reasoning)
  const error = useStore(chatPrivateStore, (state) => state.error)

  return (
    <div className="pointer-events-none absolute right-4 bottom-4 z-20 flex flex-col items-end gap-2">
      {open ? (
        <div
          className="glass-panel pointer-events-auto w-80 rounded-2xl p-3 text-sm text-card-foreground shadow-glass motion-fade-up"
          data-slot="agent-chat-panel"
        >
          <p className="font-serif text-sm font-semibold">课堂提问</p>
          {reasoning ? (
            <p className="mt-2 text-xs text-muted-foreground" data-slot="agent-reasoning">
              {reasoning}
            </p>
          ) : null}
          {answer ? (
            <p className="mt-2 whitespace-pre-wrap text-foreground" data-slot="agent-answer">
              {answer}
            </p>
          ) : null}
          {error ? (
            <p
              className="mt-2 text-sm text-destructive"
              data-slot="agent-error"
            >
              {error}
            </p>
          ) : null}
          <form
            className="mt-3 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              const prompt = input.trim()
              if (!prompt || streaming) return
              void runChatTurn(prompt)
            }}
          >
            <Input
              value={input}
              onChange={(event) => patchChatPrivate({ input: event.target.value })}
              placeholder="问一个课堂问题"
              aria-label="课堂提问"
            />
            <Button type="submit" disabled={streaming}>
              {streaming ? '…' : '发送'}
            </Button>
          </form>
        </div>
      ) : null}
      <Button
        type="button"
        className="pointer-events-auto"
        variant={open ? 'secondary' : 'default'}
        onClick={() => toggleChatOpen()}
      >
        {open ? '收起提问' : '提问'}
      </Button>
    </div>
  )
}
