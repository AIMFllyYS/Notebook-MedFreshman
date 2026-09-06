'use client';

import React, { useMemo } from 'react';
import type { ChatMessage } from '@/lib/types/chat';
import { buildTrace } from '@/lib/chat/buildTrace';
import { AgentTrace } from '@/components/chat/AgentTrace';

/** Compatibility entry point; new message rendering uses AgentTrace directly. */
export default function ProcessingSteps({ msg, streaming = false }: { msg: ChatMessage; streaming?: boolean }) {
  const parts = msg.parts;
  const trace = useMemo(() => buildTrace({ parts }, streaming), [parts, streaming]);
  return <AgentTrace trace={trace} isStreaming={streaming} durationMs={msg.metadata?.durationMs} />;
}
