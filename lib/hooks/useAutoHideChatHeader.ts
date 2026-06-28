'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

const HIDE_DELAY_MS = 400;

function subscribeCoarsePointer(onChange: () => void) {
  const mq = window.matchMedia('(hover: none), (pointer: coarse)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function getCoarsePointer() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: none), (pointer: coarse)').matches;
}

/** 触屏 / 粗指针设备：不自动隐藏 header，保持占位布局。 */
export function useCoarsePointer() {
  return useSyncExternalStore(subscribeCoarsePointer, getCoarsePointer, () => false);
}

/**
 * 桌面端对话开始后自动隐藏 ChatPanelHeader；顶部感应区 / header 悬停缓动唤出。
 * pinned=true（设置、历史弹窗）时强制显示。
 */
export function useAutoHideChatHeader(hasUserSent: boolean, pinned: boolean) {
  const coarsePointer = useCoarsePointer();
  const autoHideEnabled = hasUserSent && !coarsePointer;
  const [hovering, setHovering] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!autoHideEnabled) setHovering(false);
  }, [autoHideEnabled]);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = undefined;
  }, []);

  const onPointerEnter = useCallback(() => {
    clearHideTimer();
    setHovering(true);
  }, [clearHideTimer]);

  const onPointerLeave = useCallback(() => {
    if (pinned) return;
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => setHovering(false), HIDE_DELAY_MS);
  }, [pinned, clearHideTimer]);

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  const headerVisible = !autoHideEnabled || pinned || hovering;

  return {
    autoHideEnabled,
    headerVisible,
    onPointerEnter,
    onPointerLeave,
  };
}
