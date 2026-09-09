import { create } from "zustand";
import { SHORTCUTS } from "./shortcuts";

const LS_KEY = "gailvlun-disabled-shortcuts";

function readDisabled(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeDisabled(ids: string[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

interface KeyboardSettingsState {
  disabledShortcuts: string[];
  isEnabled: (id: string) => boolean;
  setEnabled: (id: string, enabled: boolean) => void;
  toggle: (id: string) => void;
  enableAll: () => void;
  disableAll: () => void;
  hydrate: () => void;
}

export const useKeyboardSettings = create<KeyboardSettingsState>((set, get) => ({
  disabledShortcuts: [],

  isEnabled: (id) => !get().disabledShortcuts.includes(id),

  setEnabled: (id, enabled) => {
    set((state) => {
      const next = enabled
        ? state.disabledShortcuts.filter((x) => x !== id)
        : state.disabledShortcuts.includes(id)
          ? state.disabledShortcuts
          : [...state.disabledShortcuts, id];
      writeDisabled(next);
      return { disabledShortcuts: next };
    });
  },

  toggle: (id) => {
    const enabled = get().isEnabled(id);
    get().setEnabled(id, !enabled);
  },

  enableAll: () => {
    writeDisabled([]);
    set({ disabledShortcuts: [] });
  },

  disableAll: () => {
    const all = SHORTCUTS.map((s) => s.id);
    writeDisabled(all);
    set({ disabledShortcuts: all });
  },

  hydrate: () => {
    set({ disabledShortcuts: readDisabled() });
  },
}));
