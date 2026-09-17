import { create } from "zustand";

export const SAVED_TOAST_MESSAGE = "已成功保存";
export const TOAST_DURATION_MS = 2800;

export interface ToastItem {
  id: string;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  show: (message: string) => string;
  showSaved: () => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const dismissTimers = new Map<string, ReturnType<typeof setTimeout>>();

function genId() {
  return Math.random().toString(36).slice(2, 11);
}

function clearTimer(id: string) {
  const timer = dismissTimers.get(id);
  if (timer) clearTimeout(timer);
  dismissTimers.delete(id);
}

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],

  show: (message) => {
    const text = message.trim();
    if (!text) return "";
    for (const toast of get().toasts) {
      if (toast.message === text) get().dismiss(toast.id);
    }
    const id = genId();
    set((s) => ({ toasts: [...s.toasts, { id, message: text }] }));
    dismissTimers.set(
      id,
      setTimeout(() => {
        get().dismiss(id);
      }, TOAST_DURATION_MS),
    );
    return id;
  },

  showSaved: () => get().show(SAVED_TOAST_MESSAGE),

  dismiss: (id) => {
    clearTimer(id);
    set((s) => ({ toasts: s.toasts.filter((toast) => toast.id !== id) }));
  },

  clear: () => {
    for (const id of [...dismissTimers.keys()]) clearTimer(id);
    set({ toasts: [] });
  },
}));
