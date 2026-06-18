import { create } from 'zustand';

interface SidebarState {
  expandedIds: Set<string>;
  selectedId: string | null;
  isCollapsed: boolean;
  toggleExpand: (id: string) => void;
  setSelected: (id: string | null) => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  // 初始展开：概率论科目 + 详解分类（catId 拼接规则为 `${subjectId}-${categoryId}`）
  expandedIds: new Set(['probability', 'probability-detail']),
  selectedId: null,
  isCollapsed: false,
  toggleExpand: (id) => set((state) => {
    const next = new Set(state.expandedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    return { expandedIds: next };
  }),
  setSelected: (id) => set({ selectedId: id }),
  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
}));
