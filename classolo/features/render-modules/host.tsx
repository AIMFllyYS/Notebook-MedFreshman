'use client'

import { getRenderMessages, useRenderProjection } from '@/classolo/lib/session'

import { resolveRenderView } from './dispatch'
import { RenderErrorCard } from './error-card'
import { renderModuleRegistry } from './registry'
import type { RenderMessage } from './types'

export function RenderHost({
  target,
  onAnchorClick,
}: {
  target: RenderMessage['target']
  onAnchorClick?: (segmentId: string) => void
}) {
  const projection=useRenderProjection(state=>state.byId)
  const messages = getRenderMessages(target)
  void projection

  if (messages.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {target === 'transcript' ? '文稿' : '笔记'}渲染区空闲
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {messages.map((message) => (
        <li key={message.id}>
          <RenderMessageView
            message={message}
            onAnchorClick={onAnchorClick}
          />
        </li>
      ))}
    </ul>
  )
}

function RenderMessageView({
  message,
  onAnchorClick,
}: {
  message: RenderMessage
  onAnchorClick?: (segmentId: string) => void
}) {
  const resolved = resolveRenderView(message, renderModuleRegistry)
  if (!resolved.ok) {
    return <RenderErrorCard message={message} error={resolved.error} />
  }
  const mod = renderModuleRegistry[message.module]
  if (!mod) {
    return <RenderErrorCard message={message} error="模块在分发后消失" />
  }
  const Module = mod.Component
  const anchor = message.meta.transcriptAnchor
  return (
    <div
      className="rounded-md border border-border bg-card p-2 text-sm text-card-foreground"
      data-slot="render-message"
      data-module={message.module}
    >
      <Module
        props={resolved.props}
        message={message}
        onAnchorClick={onAnchorClick}
      />
      {anchor ? (
        <button
          type="button"
          className="mt-2 text-xs text-primary hover:underline"
          onClick={() => onAnchorClick?.(anchor)}
        >
          回跳文稿
        </button>
      ) : null}
    </div>
  )
}
