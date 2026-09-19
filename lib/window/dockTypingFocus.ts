"use client";

import { useCallback, useSyncExternalStore } from "react";
import { isTypingTarget } from "@/lib/keyboard/guards";

function subscribeToFocusChanges(onStoreChange: () => void): () => void {
  if (typeof document === "undefined") return () => {};
  document.addEventListener("focusin", onStoreChange);
  document.addEventListener("focusout", onStoreChange);
  return () => {
    document.removeEventListener("focusin", onStoreChange);
    document.removeEventListener("focusout", onStoreChange);
  };
}

/**
 * Agent 右侧工作区是非模态区域：焦点仍停在中央对话等右栏之外的输入框时，
 * Esc 不应命中右栏里的文档。这里只把「焦点在外部输入框」这一种情况摘出来，
 * 与 KeyboardShortcutProvider 现有的输入框保护规则保持一致。
 */
export function useDockTypingFocusGuard(host: HTMLElement | null | undefined): boolean {
  const getSnapshot = useCallback(() => {
    if (!host || typeof document === "undefined") return false;
    const active = document.activeElement;
    return isTypingTarget(active) && !host.contains(active);
  }, [host]);

  return useSyncExternalStore(subscribeToFocusChanges, getSnapshot, () => false);
}
