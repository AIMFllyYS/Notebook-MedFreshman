/** 8GB 机器上同时挂多个 Crepe 会挤爆内存。只给最前的笔记窗挂重编辑器。 */
export function shouldMountHeavyEditor(activeWindowId: string | null, windowId: string): boolean {
  return activeWindowId === windowId;
}
