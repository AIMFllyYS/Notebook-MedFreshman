import { create } from "zustand";

export interface OverlayEntry {
  id: string;
  onClose: () => void;
  priority: number;
}

interface OverlayStackState {
  stack: OverlayEntry[];
  register: (entry: OverlayEntry) => void;
  unregister: (id: string) => void;
  closeTop: () => boolean;
}

export const useOverlayStack = create<OverlayStackState>((set, get) => ({
  stack: [],

  register: (entry) => {
    set((state) => {
      const filtered = state.stack.filter((e) => e.id !== entry.id);
      const next = [...filtered, entry].sort((a, b) => a.priority - b.priority);
      return { stack: next };
    });
  },

  unregister: (id) => {
    set((state) => ({ stack: state.stack.filter((e) => e.id !== id) }));
  },

  closeTop: () => {
    const { stack } = get();
    if (stack.length === 0) return false;
    const top = stack[stack.length - 1];
    top.onClose();
    return true;
  },
}));
