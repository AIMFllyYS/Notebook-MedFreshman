import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useImageAttachments } from './useImageAttachments';
import { useSettings } from './useSettings';

beforeEach(() => {
  useSettings.setState({ selectedModelId: 'mimo-v2.5', customApiGroups: [] });
});

afterEach(() => {
  localStorage.clear();
});

describe('useImageAttachments documents', () => {
  it('turns a paste longer than 10,000 characters into an in-composer TXT attachment', async () => {
    const pasted = `复习资料\n${'字'.repeat(10_001)}`;
    const preventDefault = vi.fn();
    const { result } = renderHook(() => useImageAttachments());

    act(() => {
      result.current.handlePaste({
        preventDefault,
        clipboardData: {
          items: [] as unknown as DataTransferItemList,
          getData: (type: string) => type === 'text/plain' ? pasted : '',
        },
      } as unknown as React.ClipboardEvent);
    });

    expect(preventDefault).toHaveBeenCalledOnce();
    await waitFor(() => expect(result.current.attachments).toHaveLength(1));
    const attachment = result.current.attachments[0];
    expect(attachment.type).toBe('document');
    if (attachment.type === 'document') {
      expect(attachment.name).toMatch(/^粘贴文本-.*\.txt$/);
      expect(attachment.text).toBe(pasted);
      expect(attachment.characterCount).toBe(10_006);
    }
    expect(result.current.info).toMatch(/已将 10,006 字粘贴内容转为 TXT 附件/);
  });

  it('leaves ordinary pasted text in the textarea', () => {
    const preventDefault = vi.fn();
    const { result } = renderHook(() => useImageAttachments());
    act(() => {
      result.current.handlePaste({
        preventDefault,
        clipboardData: { items: [] as unknown as DataTransferItemList, getData: () => '普通文本' },
      } as unknown as React.ClipboardEvent);
    });
    expect(preventDefault).not.toHaveBeenCalled();
    expect(result.current.attachments).toHaveLength(0);
  });
});
