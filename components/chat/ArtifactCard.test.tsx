import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ArtifactCard from './ArtifactCard';
import { useArtifacts } from '@/lib/hooks/useArtifacts';

vi.mock('@/components/chat/MessageContent', () => ({
  MessageContent: ({ content }: { content: string }) => <div data-testid="message-content">{content}</div>,
}));

describe('ArtifactCard', () => {
  beforeEach(() => {
    useArtifacts.setState({ order: [], byId: {}, viewerId: null });
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('collapses 生成依据 by default and streams a thinking block before HTML', async () => {
    const encoder = new TextEncoder();
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        controller = c;
      },
    });
    vi.mocked(fetch).mockResolvedValue(
      new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } }),
    );

    render(<ArtifactCard artifactId="art_1" title="演示" prompt="概率分布滑块" autoStart />);

    expect(await screen.findByTestId('artifact-thinking-toggle')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('artifact-thinking-body')).toHaveTextContent('正在思考生成方案');
    expect(screen.queryByTestId('artifact-prompt-body')).toBeNull();

    await act(async () => {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'artifact', id: 'art_1', status: 'start', title: '演示' })}\n\n`));
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'artifact', id: 'art_1', status: 'reasoning', delta: '先画坐标轴' })}\n\n`));
    });
    expect(await screen.findByTestId('artifact-thinking-body')).toHaveTextContent('先画坐标轴');

    const html = '<!DOCTYPE html><html><body>ok</body></html>';
    await act(async () => {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'artifact', id: 'art_1', status: 'delta', delta: html })}\n\n`));
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'artifact', id: 'art_1', status: 'done', html })}\n\n`));
      controller.close();
    });

    await waitFor(() => {
      expect(screen.getByText('交互演示已就绪：演示')).toBeTruthy();
    });
    expect(useArtifacts.getState().byId.art_1?.html).toBe(html);
    fireEvent.click(screen.getByTestId('artifact-prompt-toggle'));
    expect(screen.getByTestId('artifact-prompt-body')).toHaveTextContent('概率分布滑块');
  });
});
