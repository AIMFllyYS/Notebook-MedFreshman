import React, { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UIMessageChunk } from 'ai';
import ChatPanel from './ChatPanel';
import { useChatHistory } from '@/lib/hooks/useChatHistory';
import { useStore } from '@/lib/store';
import { useSettings } from '@/lib/hooks/useSettings';
import { getMessageText } from '@/lib/chat/messageParts';

vi.mock('@/lib/storage/idbStorage', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/storage/idbStorage')>(),
  idbStorage: { getItem: vi.fn(async () => null), setItem: vi.fn(), removeItem: vi.fn(async () => {}) },
}));
vi.mock('@/lib/hooks/useChatHistory', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/hooks/useChatHistory')>(),
  ensureChatHistoryBootstrap: vi.fn(async () => {}),
}));
vi.mock('@/lib/hooks/useAutoHideChatHeader', () => ({ useAutoHideChatHeader: () => ({ autoHideEnabled: false, headerCollapsed: false }) }));
vi.mock('@/components/chat/ChatThread', () => ({ default: ({ isLoading, info, onClearInfo }: {
  isLoading: boolean; info: string | null; onClearInfo: () => void;
}) => <div><span data-testid="loading">{String(isLoading)}</span><span data-testid="info">{info}</span><button onClick={onClearInfo}>清除提示</button></div> }));
vi.mock('@/components/chat/ChatInput', () => ({ default: ({ onSend, onStop }: {
  onSend: (text: string) => void; onStop: () => void;
}) => <div><button onClick={() => onSend('手动问题')}>手动发送</button><button onClick={onStop}>停止</button></div> }));
vi.mock('@/components/notes/SelectionPopover', () => ({ default: () => null }));
vi.mock('@/components/shared/ImageLightbox', () => ({ ImageLightbox: () => null }));
vi.mock('@/components/chat/ChatSettings', () => ({ default: () => null }));
vi.mock('@/components/chat/ChatPanelHeader', () => ({ default: () => null }));
vi.mock('@/components/chat/ChatEmptyState', () => ({ default: () => null }));
vi.mock('@/components/chat/ChatHistoryOverlay', () => ({ default: () => null }));

const context = { subjectId: 'cell-biology', categoryId: 'textbook', itemId: 'ch01', currentTopic: '细胞' };
let requests: Array<Record<string, unknown>>;
function responseControl() {
  let controller: ReadableStreamDefaultController<Uint8Array>;
  const cancel = vi.fn();
  const response = new Response(new ReadableStream<Uint8Array>({ start(c) { controller = c; }, cancel }), {
    headers: { 'Content-Type': 'text/event-stream' },
  });
  const emit = (...chunks: UIMessageChunk[]) => chunks.forEach((chunk) => controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`)));
  const finish = () => {
    emit({ type: 'text-start', id: 't' }, { type: 'text-delta', id: 't', delta: '主面板答案' }, { type: 'text-end', id: 't' },
      { type: 'data-info', data: { message: '备用端点提示' }, transient: true }, { type: 'finish' });
    controller.close();
  };
  return { response, cancel, finish };
}
function mockFetch(response?: () => Response) {
  vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
    if (url === '/api/chat-title') return Response.json({ title: '自动标题' });
    requests.push(JSON.parse(String(init?.body)));
    if (response) return response();
    const control = responseControl(); control.finish(); return control.response;
  }));
}
const settle = async () => { await act(async () => { await vi.advanceTimersByTimeAsync(0); }); };
const users = () => useChatHistory.getState().messagesById.main.filter((m) => m.role === 'user').map(getMessageText);

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  requests = [];
  useStore.setState({ outbound: null });
  useSettings.setState({ selectedModelId: 'mimo-v2.5', customApiGroups: [] });
  useChatHistory.setState({ activeSessionId: 'main', _hasHydrated: true, _activeMessagesReady: true,
    messagesById: { main: [] }, sessionLoadState: { main: 'loaded' },
    sessionsMeta: [{ id: 'main', title: 'main', createdAt: 1, updatedAt: 1, messageCount: 0, artifactIds: [] }],
    loadedSessionIds: ['main'], pinnedSessionIds: [],
  });
});
afterEach(async () => {
  cleanup(); await vi.advanceTimersByTimeAsync(0);
  vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals();
});

describe('ChatPanel outbound lifecycle with real useChat', () => {
  it('StrictMode 挂载时已有 outbound 只发送一次，不在 cleanup 时丢掉请求，info props 保留', async () => {
    useStore.getState().sendToChat('来自选区的问题');
    mockFetch();
    render(<StrictMode><ChatPanel chatContext={context} /></StrictMode>);
    await settle();
    expect(requests).toHaveLength(1);
    expect(users()).toEqual(['来自选区的问题']);
    expect(useChatHistory.getState().messagesById.main).toHaveLength(2);
    expect(getMessageText(useChatHistory.getState().messagesById.main[1])).toBe('主面板答案');
    expect(useStore.getState().outbound).toBeNull();
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('info')).toHaveTextContent('备用端点提示');
    fireEvent.click(screen.getByText('清除提示'));
    expect(screen.getByTestId('info')).toBeEmptyDOMElement();
  });

  it('忙碌时新 outbound 保留到完成后自动发送，不被 sendMessage 的门控吞掉', async () => {
    const first = responseControl();
    const second = responseControl();
    let count = 0;
    mockFetch(() => ++count === 1 ? first.response : second.response);
    render(<StrictMode><ChatPanel chatContext={context} /></StrictMode>);
    fireEvent.click(screen.getByText('手动发送'));
    await settle();
    act(() => useStore.getState().sendToChat('忙碌时排队的问题'));
    await settle();
    expect(requests).toHaveLength(1);
    expect(useStore.getState().outbound?.content).toBe('忙碌时排队的问题');
    first.finish();
    await settle();
    expect(requests).toHaveLength(2);
    expect(users()).toEqual(['手动问题', '忙碌时排队的问题']);
    expect(useStore.getState().outbound).toBeNull();
    second.finish();
    await settle();
  });

  it('微任务派发前手动请求已占用同步 loadingRef，outbound 拒绝后仍可重试', async () => {
    const first = responseControl();
    const second = responseControl();
    let count = 0;
    mockFetch(() => ++count === 1 ? first.response : second.response);
    useStore.getState().sendToChat('自动问题');
    render(<StrictMode><ChatPanel chatContext={context} /></StrictMode>);
    fireEvent.click(screen.getByText('手动发送'));
    await settle();
    expect(users()).toEqual(['手动问题']);
    expect(useStore.getState().outbound?.content).toBe('自动问题');
    first.finish();
    await settle();
    expect(users()).toEqual(['手动问题', '自动问题']);
    expect(requests).toHaveLength(2);
    second.finish(); await settle();
  });

  it('水合完成前不清空 outbound，挂载前后同一消息只产生一个请求', async () => {
    useChatHistory.setState({ _hasHydrated: false, _activeMessagesReady: false });
    useStore.getState().sendToChat('等待水合的问题');
    mockFetch();
    render(<StrictMode><ChatPanel chatContext={context} /></StrictMode>);
    await settle();
    expect(requests).toHaveLength(0);
    expect(useStore.getState().outbound?.content).toBe('等待水合的问题');
    act(() => useChatHistory.setState({ _hasHydrated: true, _activeMessagesReady: true }));
    await settle();
    expect(requests).toHaveLength(1);
    expect(useStore.getState().outbound).toBeNull();
  });

  it('未派发的旧 outbound 被新对象替换时只发送新项；清空后重用 nonce 也不会误去重', async () => {
    useStore.getState().sendToChat('旧问题');
    mockFetch();
    render(<StrictMode><ChatPanel chatContext={context} /></StrictMode>);
    act(() => useStore.getState().sendToChat('最新问题'));
    await settle();
    expect(users()).toEqual(['最新问题']);
    act(() => useStore.getState().sendToChat('最新问题'));
    await settle();
    expect(users()).toEqual(['最新问题', '最新问题']);
    expect(requests).toHaveLength(2);
  });

  it('发送同步订阅期间新增 outbound 不被旧项的 clear 覆盖', async () => {
    const first = responseControl();
    const second = responseControl();
    let count = 0;
    mockFetch(() => ++count === 1 ? first.response : second.response);
    useStore.getState().sendToChat('第一条');
    let injected = false;
    const unsubscribe = useChatHistory.subscribe((state) => {
      if (!injected && state.messagesById.main.some((m) => m.role === 'user')) {
        injected = true;
        useStore.getState().sendToChat('同步插入的第二条');
      }
    });
    try {
      render(<StrictMode><ChatPanel chatContext={context} /></StrictMode>);
      await settle();
      expect(useStore.getState().outbound?.content).toBe('同步插入的第二条');
      expect(requests).toHaveLength(1);
      first.finish(); await settle();
      expect(users()).toEqual(['第一条', '同步插入的第二条']);
      expect(requests).toHaveLength(2);
      second.finish(); await settle();
    } finally { unsubscribe(); }
  });

  it('微任务前卸载不清空待发送项，重新挂载发送；已启动流仍在卸载时取消', async () => {
    const control = responseControl();
    mockFetch(() => control.response);
    useStore.getState().sendToChat('稍后挂载');
    const first = render(<StrictMode><ChatPanel chatContext={context} /></StrictMode>);
    first.unmount();
    await settle();
    expect(users()).toEqual([]);
    expect(requests).toHaveLength(0);
    expect(useStore.getState().outbound?.content).toBe('稍后挂载');
    const second = render(<StrictMode><ChatPanel chatContext={context} /></StrictMode>);
    await settle();
    expect(requests).toHaveLength(1);
    second.unmount(); await settle();
    expect(control.cancel).toHaveBeenCalledTimes(1);
  });
});
