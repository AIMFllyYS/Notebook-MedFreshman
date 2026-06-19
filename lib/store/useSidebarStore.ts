import { create } from 'zustand';

interface SidebarState {
  /** 已展开的科目/分类/章节键。科目用 `${subjectId}`，分类用 `${subjectId}-${categoryId}`，
   *  章节叶子用 `${subjectId}/${categoryId}/${itemId}`（命名空间化，避免跨学科碰撞）。 */
  expandedIds: Set<string>;
  isCollapsed: boolean;
  toggleExpand: (id: string) => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  // 初始展开：概率论科目 + 详解分类（catId 拼接规则为 `${subjectId}-${categoryId}`）。
  // 选中态不再存于此 store，而是由路由（usePathname）派生。
  expandedIds: new Set(['probability', 'probability-detail']),
  isCollapsed: false,
  toggleExpand: (id) => set((state) => {
    const next = new Set(state.expandedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    return { expandedIds: next };
  }),
  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
}));
