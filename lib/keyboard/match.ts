import type { ShortcutDef } from "./shortcuts";

export function modKey(e: KeyboardEvent): boolean {
  return e.ctrlKey || e.metaKey;
}

function normalizeKey(key: string): string {
  const k = key.toLowerCase();
  if (k === " ") return "space";
  return k;
}

export interface ParsedKeys {
  mod: boolean;
  alt: boolean;
  shift: boolean;
  key: string;
}

/** 解析 "mod+shift+f" 等键位字符串。 */
export function parseKeyCombo(combo: string): ParsedKeys {
  const parts = combo.toLowerCase().split("+");
  const key = parts[parts.length - 1];
  return {
    mod: parts.includes("mod"),
    alt: parts.includes("alt"),
    shift: parts.includes("shift"),
    key: normalizeKey(key),
  };
}

/** 判断 KeyboardEvent 是否匹配单个键位组合。 */
export function eventMatchesCombo(e: KeyboardEvent, combo: string): boolean {
  const parsed = parseKeyCombo(combo);
  const eventKey = normalizeKey(e.key);

  if (parsed.mod !== modKey(e)) return false;
  if (parsed.alt !== e.altKey) return false;
  if (parsed.shift !== e.shiftKey) return false;

  // 带 mod/alt 的组合键不要求额外检查裸 ctrl/meta 冲突
  if (parsed.key === eventKey) return true;

  // Shift+/ 在多数键盘上产生 ?
  if (parsed.key === "/" && parsed.shift && (eventKey === "/" || eventKey === "?")) return true;

  return false;
}

/** 判断事件是否匹配 ShortcutDef（支持 keys 中的 | 分隔多选）。 */
export function eventMatchesShortcut(e: KeyboardEvent, def: ShortcutDef): boolean {
  const combos = def.keys.split("|").map((c) => c.trim());
  return combos.some((combo) => eventMatchesCombo(e, combo));
}

/** 在列表中查找第一个匹配的 shortcut id。 */
export function findMatchingShortcut(
  e: KeyboardEvent,
  defs: ShortcutDef[],
  isEnabled: (id: string) => boolean,
): ShortcutDef | null {
  for (const def of defs) {
    if (!isEnabled(def.id)) continue;
    if (eventMatchesShortcut(e, def)) return def;
  }
  return null;
}
