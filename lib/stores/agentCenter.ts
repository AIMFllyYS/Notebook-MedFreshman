import { create } from "zustand";

/**
 * Agent 中央区当前在看的视图（Perplexity 式的顶部分段：回答 / 来源 / 图片）。
 *
 * 它只是**视图开关**，不落盘：来源与图片都是「这条对话」的附属视图，
 * 换对话就回到回答，所以持久化它只会制造「打开就看不到对话」的困惑。
 */
export type AgentCenterTab = "answer" | "links" | "images";

interface AgentCenterState {
  centerTab: AgentCenterTab;
  setCenterTab: (tab: AgentCenterTab) => void;
}

export const useAgentCenter = create<AgentCenterState>((set) => ({
  centerTab: "answer",
  setCenterTab: (tab) => set((state) => (state.centerTab === tab ? state : { centerTab: tab })),
}));
