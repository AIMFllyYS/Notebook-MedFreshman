import { useCallback, useEffect, useRef, type RefObject } from 'react';

/**
 * 让一个可滚动容器在内容增长时「贴底跟随」，用户上滑则退出跟随、滑回底部自动恢复。
 *
 * 与 ChatThread 主聊天流同策（components/chat/ChatThread.tsx）：用
 * `scrollHeight - scrollTop - clientHeight < threshold` 判定是否贴底；`active`（如流式中）
 * 时跑 requestAnimationFrame 循环，贴底则把 scrollTop 推到 scrollHeight。
 *
 * 用法：
 *   const ref = useRef<HTMLDivElement>(null);
 *   const onScroll = useStickToBottom(ref, isStreaming);
 *   <div ref={ref} onScroll={onScroll} style={{ overflowY: 'auto' }}>…</div>
 *
 * @param ref       目标滚动容器
 * @param active    是否处于「应跟随」阶段（通常 = 内容仍在流式生成）
 * @param threshold 距底多少 px 内算「贴底」（默认 80）
 * @returns         绑到容器 onScroll 的处理函数
 */
export function useStickToBottom(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  threshold = 80,
) {
  const atBottom = useRef(true);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, [ref, threshold]);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const tick = () => {
      const el = ref.current;
      if (el && atBottom.current && el.scrollHeight - el.scrollTop - el.clientHeight > 1) {
        el.scrollTop = el.scrollHeight;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, ref]);

  return onScroll;
}

export default useStickToBottom;
