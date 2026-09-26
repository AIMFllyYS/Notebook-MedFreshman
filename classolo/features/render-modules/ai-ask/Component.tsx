'use client'

import type { RenderMessage } from '../types'

type Props = {
  question: string
  choices?: string[]
}

export function AiAskModule({
  props,
}: {
  props: Props
  message: RenderMessage<Props>
  onAnchorClick?: (segmentId: string) => void
}) {
  return (
    <div data-slot="ai-ask" className="text-sm">
      <p className="font-medium text-foreground">随堂提问</p>
      <p className="mt-1 text-card-foreground">{props.question}</p>
      {props.choices && props.choices.length > 0 ? (
        <ul className="mt-2 list-disc pl-4 text-muted-foreground">
          {props.choices.map((choice) => (
            <li key={choice}>{choice}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
