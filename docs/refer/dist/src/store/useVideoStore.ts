import { create } from 'zustand';

interface VideoState {
  floatingVideoSrc: string | null;
  floatingVideoTitle: string;
  isOpen: boolean;
  setFloatingVideo: (src: string | null, title?: string) => void;
  closeFloatingVideo: () => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  floatingVideoSrc: null,
  floatingVideoTitle: '微课动画',
  isOpen: false,
  setFloatingVideo: (src, title = '微课动画') =>
    set({ floatingVideoSrc: src, floatingVideoTitle: title, isOpen: true }),
  closeFloatingVideo: () => set({ floatingVideoSrc: null, isOpen: false }),
}));
