'use client'

import { MarkdownStream } from '@/classolo/components/markdown'

import type { RenderMessage } from '../types'

export type RichTextModuleProps = {
  markdown: string
}

export function RichTextModule({
  props,
}: {
  props: RichTextModuleProps
  message: RenderMessage<RichTextModuleProps>
  onAnchorClick?: (segmentId: string) => void
}) {
  return <MarkdownStream markdown={props.markdown} />
}
