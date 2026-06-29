/** 将纯文本写入系统剪贴板；优先 Clipboard API，失败时 fallback 到 execCommand。 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  const trimmed = text.trim();
  if (!trimmed) return false;

  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy copy
  }

  if (typeof document === "undefined") return false;

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/**
 * 划词菜单打开时，是否应拦截 copy 事件并用 pop.text 填充剪贴板。
 * - 输入框 / contenteditable 内复制：不拦截
 * - 用户另有非空选区：不拦截
 */
export function shouldInterceptSelectionCopy(
  popText: string,
  activeElement: Element | null,
  selection: Selection | null,
): boolean {
  if (!popText.trim()) return false;

  if (isEditableElement(activeElement)) return false;

  if (selection && !selection.isCollapsed) {
    const selected = selection.toString().trim();
    if (selected.length > 0) return false;
  }

  return true;
}

function isEditableElement(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName?.toUpperCase();
  if (tag === "INPUT" || tag === "TEXTAREA") return true;
  if ("isContentEditable" in el && Boolean((el as HTMLElement).isContentEditable)) return true;
  return false;
}
