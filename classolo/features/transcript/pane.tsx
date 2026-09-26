'use client'

import { useEffect, useRef } from 'react'
import { useStore } from 'zustand'

import { Button } from '@/classolo/components/ui/button'
import { cn } from '@/classolo/lib/utils'
import { useTranscriptPublic } from '@/classolo/lib/session'

import {
  pauseSession,
  resumeSession,
  startSession,
  stopSession,
} from './pipeline'
import { transcriptPrivateStore } from './private-store'

export function TranscriptPane({enabled=true}:{enabled?:boolean}) {
  const status = useTranscriptPublic((state) => state.recordingStatus)
  const committed = useTranscriptPublic((state) => state.committed)
  const error = useStore(transcriptPrivateStore, (state) => state.error)
  const level = useStore(transcriptPrivateStore, (state) => state.level)
  const partial = useStore(transcriptPrivateStore, (state) => state.partial)
  const highlightId = useStore(
    transcriptPrivateStore,
    (state) => state.highlightId,
  )
  const connection = useStore(
    transcriptPrivateStore,
    (state) => state.connection,
  )
  const streaming = useStore(
    transcriptPrivateStore,
    (state) => state.streaming,
  )
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [committed.length, partial])

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 text-sm">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => void startSession()}
          disabled={!enabled || status === 'recording' || status === 'paused'}
        >
          开始
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() =>
            void (status === 'paused' ? resumeSession() : pauseSession())
          }
          disabled={status !== 'recording' && status !== 'paused'}
        >
          {status === 'paused' ? '继续' : '暂停'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void stopSession()}
          disabled={status !== 'recording' && status !== 'paused'}
        >
          结束
        </Button>
      </div>
      <p className="text-muted-foreground">
        录音状态：<span className="text-foreground">{status}</span>
        <span className="mx-2">·</span>
        电平 {Math.round(level * 100)}%
        <span className="mx-2">·</span>
        连接 {connection}
        {streaming === 'pseudo' ? (
          <>
            <span className="mx-2">·</span>
            <span data-slot="asr-latency">准实时</span>
          </>
        ) : null}
      </p>
      {error ? (
        <p className="text-destructive" data-slot="capture-error">
          {error}
        </p>
      ) : null}
      <div className="min-h-0 flex-1 space-y-2 overflow-auto" data-slot="transcript-stream">
        {committed.map((segment) => (
          <p
            key={segment.id}
            data-segment-id={segment.id}
            className={cn(
              'rounded-md px-2 py-1 text-foreground',
              highlightId === segment.id && 'bg-accent/20',
            )}
          >
            {segment.text}
          </p>
        ))}
        {partial ? (
          <p className="px-2 py-1 text-muted-foreground italic" data-slot="transcript-partial">
            {partial}
          </p>
        ) : null}
        <div ref={endRef} />
      </div>
    </div>
  )
}
