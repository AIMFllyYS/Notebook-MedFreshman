import { create } from "zustand";

/** 复习板页面注册的键盘回调（由 review/page 写入，Provider 读取）。 */
export interface ReviewKeyboardHandlers {
  onPrev: () => void;
  onNext: () => void;
  onFlip: () => void;
  canFlip: boolean;
}

interface ReviewKeyboardState {
  handlers: ReviewKeyboardHandlers | null;
  register: (handlers: ReviewKeyboardHandlers) => void;
  unregister: () => void;
}

export const useReviewKeyboard = create<ReviewKeyboardState>((set) => ({
  handlers: null,
  register: (handlers) => set({ handlers }),
  unregister: () => set({ handlers: null }),
}));
