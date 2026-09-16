import { create } from "zustand";
import { useWindowManager, type AgentProductKind } from "@/lib/stores/windowManager";
import { AGENT_PRODUCT_PICKER_WINDOW_ID } from "@/lib/notes/userNote";

interface AgentProductPickerState {
  open: boolean;
  kind: AgentProductKind;
  openPicker: (kind: AgentProductKind) => void;
  closePicker: () => void;
}

function pickerTitle(kind: AgentProductKind): string {
  return kind === "document" ? "导入长文本" : "导入可交互 HTML";
}

function pickerWindowGeometry() {
  if (typeof window === "undefined") {
    return { pos: { x: 36, y: 68 }, size: { width: 780, height: 580 } };
  }
  const width = Math.min(820, Math.floor(window.innerWidth * 0.66));
  const height = Math.min(640, Math.floor(window.innerHeight * 0.8));
  return {
    pos: {
      x: Math.max(16, Math.floor(window.innerWidth * 0.16)),
      y: Math.max(16, Math.floor(window.innerHeight * 0.1)),
    },
    size: { width, height },
  };
}

export const useAgentProductPicker = create<AgentProductPickerState>((set) => ({
  open: false,
  kind: "document",

  openPicker: (kind) => {
    const { pos, size } = pickerWindowGeometry();
    useWindowManager.getState().openWindow({
      id: AGENT_PRODUCT_PICKER_WINDOW_ID,
      type: "agent-product-picker",
      title: pickerTitle(kind),
      pos,
      size,
      data: { kind },
    });
    set({ open: true, kind });
  },

  closePicker: () => {
    useWindowManager.getState().closeWindow(AGENT_PRODUCT_PICKER_WINDOW_ID);
    set({ open: false });
  },
}));
