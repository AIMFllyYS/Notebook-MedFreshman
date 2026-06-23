import { create } from "zustand";

interface LightboxState {
  src: string | null;
  alt: string;
  open: (src: string, alt?: string) => void;
  close: () => void;
}

export const useLightbox = create<LightboxState>((set) => ({
  src: null,
  alt: "",
  open: (src, alt = "") => set({ src, alt }),
  close: () => set({ src: null, alt: "" }),
}));
