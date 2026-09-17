import type { FocusEvent as ReactFocusEvent } from "react";
import { getSettingsPersistGeneration } from "@/lib/stores/settings";
import { useToast } from "@/lib/stores/toast";

const SKIP_INPUT_TYPES = new Set([
  "checkbox",
  "radio",
  "button",
  "submit",
  "reset",
  "file",
  "hidden",
  "range",
  "color",
  "image",
]);

let generationAtFocus = 0;
let focusedField: EventTarget | null = null;

export function isSettingsPersistField(
  target: EventTarget | null,
): target is HTMLInputElement | HTMLTextAreaElement {
  if (target instanceof HTMLTextAreaElement) return true;
  if (!(target instanceof HTMLInputElement)) return false;
  return !SKIP_INPUT_TYPES.has(target.type);
}

/** 记录该输入框获得焦点时的 persist 代数。 */
export function onSettingsFieldFocus(event: ReactFocusEvent<HTMLElement>) {
  const target = event.target;
  if (!isSettingsPersistField(target)) return;
  focusedField = target;
  generationAtFocus = getSettingsPersistGeneration();
}

/**
 * 输入框 blur / 鼠标移开失焦后：只有这次编辑里 settings 已成功 persist 才提示。
 * 不在 keystroke 时弹。
 */
export function onSettingsFieldBlur(event: ReactFocusEvent<HTMLElement>) {
  const target = event.target;
  if (!isSettingsPersistField(target)) return;
  if (focusedField !== target) return;
  focusedField = null;
  if (getSettingsPersistGeneration() > generationAtFocus) {
    useToast.getState().showSaved();
  }
}
