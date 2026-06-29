import { parseKeyCombo } from "./match";
import { SHORTCUT_BY_ID } from "./shortcuts";

function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? navigator.userAgent);
}

const KEY_LABELS: Record<string, string> = {
  arrowleft: "←",
  arrowright: "→",
  arrowup: "↑",
  arrowdown: "↓",
  space: "Space",
  enter: "Enter",
  escape: "Esc",
  "/": "/",
};

function formatPart(part: string, mac: boolean): string {
  if (part === "mod") return mac ? "⌘" : "Ctrl";
  if (part === "shift") return mac ? "⇧" : "Shift";
  if (part === "alt") return mac ? "⌥" : "Alt";
  return KEY_LABELS[part] ?? part.toUpperCase();
}

/** 将 "mod+shift+f" 格式化为平台感知显示文本。 */
export function formatKeyCombo(combo: string, mac = isMac()): string {
  const parsed = parseKeyCombo(combo);
  const parts: string[] = [];
  if (parsed.mod) parts.push(formatPart("mod", mac));
  if (parsed.alt) parts.push(formatPart("alt", mac));
  if (parsed.shift) parts.push(formatPart("shift", mac));
  parts.push(formatPart(parsed.key, mac));
  return mac ? parts.join("") : parts.join("+");
}

/** 格式化 shortcut id 对应的键位（多选用 / 连接）。 */
export function formatShortcut(id: string): string {
  const def = SHORTCUT_BY_ID[id];
  if (!def) return "";
  return def.keys.split("|").map((c) => formatKeyCombo(c.trim())).join(" / ");
}
