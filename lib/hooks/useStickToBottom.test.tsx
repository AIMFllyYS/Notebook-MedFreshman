import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createRef } from 'react';
import { useStickToBottom } from '@/lib/hooks/useStickToBottom';

describe('useStickToBottom', () => {
  const rafQueue: FrameRequestCallback[] = [];

  beforeEach(() => {
    rafQueue.length = 0;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafQueue.push(cb);
      return rafQueue.length;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      rafQueue[id - 1] = () => {};
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps scrollTop monotonically increasing across rAF ticks and lands on max scroll', () => {
    const el = {
      scrollHeight: 200,
      clientHeight: 100,
      scrollTop: 0,
    };
    const ref = createRef<HTMLElement | null>();
    Object.defineProperty(ref, 'current', { value: el, writable: true });

    renderHook(() => useStickToBottom(ref, true));

    const tops: number[] = [];
    act(() => {
      for (let i = 0; i < 5; i++) {
        el.scrollHeight = 200 + i * 40;
        const cb = rafQueue.shift();
        cb?.(i * 16);
        tops.push(el.scrollTop);
      }
    });

    for (let i = 1; i < tops.length; i++) {
      expect(tops[i]).toBeGreaterThanOrEqual(tops[i - 1]);
    }
    expect(el.scrollTop).toBe(el.scrollHeight - el.clientHeight);
    expect(tops[tops.length - 1]).toBe(el.scrollHeight - el.clientHeight);
  });
});
