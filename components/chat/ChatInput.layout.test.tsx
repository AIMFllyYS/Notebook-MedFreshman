import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ChatInput from './ChatInput';
import { useSettings } from '@/lib/hooks/useSettings';

const callbacks = vi.hoisted(() => ({
  clearQuote: vi.fn(), clearAttachments: vi.fn(), paste: vi.fn(), drop: vi.fn(), addFiles: vi.fn(), remove: vi.fn(),
  quotedText: '' as string | null,
  attachment: false,
}));

vi.mock('@/components/chat/TokenDashboard', () => ({ default: ({ floatingSessionId, modelId }: { floatingSessionId?: string; modelId?: string }) =>
  <button data-testid="context-dashboard" data-session-id={floatingSessionId} data-model-id={modelId}>上下文</button> }));
vi.mock('@/components/chat/ModelMenu', () => ({ default: ({ value, onChange }: { value?: string; onChange?: (id: string) => void }) =>
  <button data-testid="model-selector" onClick={() => onChange?.('new-floating-model')}>{value ?? '全局模型'}</button> }));
vi.mock('@/components/chat/AttachmentThumbnails', () => ({ default: () => <div data-testid="attachment-preview">图片预览</div> }));
vi.mock('@/lib/hooks/useChatUI', () => ({ useChatUI: () => ({ quotedText: callbacks.quotedText, clearQuotedText: callbacks.clearQuote }) }));
vi.mock('@/lib/hooks/useImageAttachments', () => ({ useImageAttachments: () => ({
  attachments: callbacks.attachment ? [{ id: 'image', preview: 'data:image/png;base64,eA==' }] : [],
  addFiles: callbacks.addFiles, remove: callbacks.remove, clear: callbacks.clearAttachments,
  toChatFormat: () => callbacks.attachment ? [{ type: 'image', mimeType: 'image/png', base64: 'data:image/png;base64,eA==' }] : [],
  handlePaste: callbacks.paste, handleDrop: callbacks.drop, handleDragOver: vi.fn(), handleDragEnter: vi.fn(), handleDragLeave: vi.fn(),
  isDragging: false, error: null,
}) }));

const context = { subjectId: 'physics', categoryId: 'textbook', itemId: '1', currentTopic: '力学' };
const props = { onSend: vi.fn(), onStop: vi.fn(), isLoading: false, chatContext: context };

beforeEach(() => {
  callbacks.quotedText = null;
  callbacks.attachment = false;
  vi.clearAllMocks();
  useSettings.setState({ selectedModelId: 'mimo-v2.5', customApiGroups: [], defaultThinking: false, defaultSearch: false });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('floating transparent composer', () => {
  it('keeps all four controls before the textbox in DOM order, with measured notices/previews in the same dock', () => {
    callbacks.quotedText = '教材原文';
    callbacks.attachment = true;
    const onModelChange = vi.fn();
    const { container, getByRole, getByTestId, getByTitle } = render(<ChatInput {...props} modelId="mimo-v2.5"
      floatingSessionId="floating-session" onModelChange={onModelChange} notice={<div data-testid="notice">80% 上下文警告</div>} />);
    const dock = container.querySelector('.chat-input-container')!;
    const toolbar = dock.querySelector('.chat-input-toolbar')!;
    const row = dock.querySelector('.chat-input-row')!;
    expect(toolbar.compareDocumentPosition(row) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(toolbar.contains(getByTestId('thinking-menu-button'))).toBe(true);
    expect(toolbar.contains(getByTitle('联网搜索（需配置搜索API）'))).toBe(true);
    expect(toolbar.contains(getByTestId('context-dashboard'))).toBe(true);
    expect(toolbar.contains(getByTestId('model-selector'))).toBe(true);
    expect(row.contains(getByRole('textbox'))).toBe(true);
    expect(dock.contains(getByTestId('notice'))).toBe(true);
    expect(dock.contains(getByTestId('attachment-preview'))).toBe(true);
    expect(getByTestId('notice').compareDocumentPosition(toolbar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(getByTestId('context-dashboard')).toHaveAttribute('data-session-id', 'floating-session');
    expect(getByTestId('context-dashboard')).toHaveAttribute('data-model-id', 'mimo-v2.5');
    fireEvent.click(getByTestId('model-selector'));
    expect(onModelChange).toHaveBeenCalledWith('new-floating-model');
  });

  it('reports dynamic dock height plus bottom breathing room for quotes, textarea growth and narrow toolbar wrapping', () => {
    let height = 96;
    let resize: ResizeObserverCallback | undefined;
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: ResizeObserverCallback) { resize = callback; }
      observe = observe;
      disconnect = disconnect;
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      return { x: 0, y: 0, top: 0, bottom: height, left: 0, right: 280, width: 280, height: this.classList.contains('chat-input-container') ? height : 0, toJSON: () => ({}) };
    });
    const originalGetStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      const style = originalGetStyle(element);
      if (element.classList.contains('chat-input-container')) Object.defineProperty(style, 'bottom', { value: '10px' });
      return style;
    });
    const onInset = vi.fn();
    const { container, unmount } = render(<ChatInput {...props} onComposerInsetChange={onInset} />);
    expect(observe).toHaveBeenCalledWith(container.querySelector('.chat-input-container'));
    expect(onInset).toHaveBeenLastCalledWith(122);
    height = 212;
    act(() => resize?.([], {} as ResizeObserver));
    expect(onInset).toHaveBeenLastCalledWith(238);
    height = 248;
    fireEvent(window, new Event('resize'));
    expect(onInset).toHaveBeenLastCalledWith(274);
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(onInset).not.toHaveBeenCalledWith(0); // StrictMode cleanup 不让保留区塌陷。
  });

  it('keeps paste/drop, quote and image-only send behavior on the repositioned composer', () => {
    callbacks.quotedText = '引用段落';
    callbacks.attachment = true;
    const { container, getByRole, getByTitle } = render(<ChatInput {...props} />);
    fireEvent.paste(getByRole('textbox'));
    fireEvent.drop(container.querySelector('.chat-input-container')!);
    expect(callbacks.paste).toHaveBeenCalledOnce();
    expect(callbacks.drop).toHaveBeenCalledOnce();
    fireEvent.click(getByTitle('发送'));
    expect(props.onSend).toHaveBeenCalledWith('请描述这张图片', expect.objectContaining({ quotedText: '引用段落',
      attachments: [{ type: 'image', mimeType: 'image/png', base64: 'data:image/png;base64,eA==' }] }));
    expect(callbacks.clearQuote).toHaveBeenCalledOnce();
    expect(callbacks.clearAttachments).toHaveBeenCalledOnce();
  });

  it('CSS contract anchors a transparent dock and wraps both toolbar groups instead of clipping narrow surfaces', () => {
    const css = readFileSync(resolve(process.cwd(), 'app/styles/prose.css'), 'utf8');
    const rule = (selector: string) => css.match(new RegExp(`${selector.replaceAll('.', '\\.')}\\s*\\{([^}]+)\\}`))?.[1] ?? '';
    const dock = rule('.chat-input-container');
    expect(dock).toContain('position: absolute');
    expect(dock).toContain('background: transparent');
    expect(dock).toContain('border: none');
    expect(dock).toContain('box-shadow: none');
    expect(dock).toContain('safe-area-inset-bottom');
    expect(rule('.chat-input-toolbar')).toContain('flex-wrap: wrap');
    expect(rule('.chat-input-toolbar-group')).toContain('flex-wrap: wrap');
    expect(rule('.chat-input-toolbar-group')).toContain('min-width: 0');
    expect(rule('.chat-input-textarea')).toContain('min-width: 0');
    expect(css).toContain('@container chat-composer (max-width: 320px)');
    expect(rule('.chat-input-row')).toContain('backdrop-filter: blur(14px)');
  });
});
