const streaming = new Set<string>();

export function markSessionStreaming(sessionId: string, on: boolean): void {
  if (!sessionId) return;
  if (on) streaming.add(sessionId);
  else streaming.delete(sessionId);
}

export function isSessionStreaming(sessionId: string): boolean {
  return streaming.has(sessionId);
}

export function __resetStreamingSessionsForTests(): void {
  streaming.clear();
}
