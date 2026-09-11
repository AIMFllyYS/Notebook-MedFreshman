import { beforeEach, describe, expect, it } from "vitest";
import { useStore } from "@/lib/stores/ui";

const DEFAULT_RIGHT = { full: false, article: true, reference: false } as const;

function resetLayout() {
  useStore.setState({
    sidebarCollapsed: false,
    topBarCollapsed: false,
    rightCollapsedByProfile: { ...DEFAULT_RIGHT },
  });
  document.documentElement.removeAttribute("data-sidebar-collapsed");
  document.documentElement.removeAttribute("data-topbar-collapsed");
  document.documentElement.removeAttribute("data-right-collapsed-full");
  document.documentElement.removeAttribute("data-right-collapsed-article");
  document.documentElement.removeAttribute("data-right-collapsed-reference");
  localStorage.setItem("gailvlun-sidebar-collapsed", "true");
  localStorage.setItem("gailvlun-topbar-collapsed", "true");
  localStorage.setItem(
    "gailvlun-right-collapsed-by-profile",
    JSON.stringify({ full: true, article: false, reference: true }),
  );
}

describe("layout persist contract", () => {
  beforeEach(() => {
    resetLayout();
  });

  it("init / 重置后不读 LS，保持默认展开契约", () => {
    expect(useStore.getState().sidebarCollapsed).toBe(false);
    expect(useStore.getState().topBarCollapsed).toBe(false);
    expect(useStore.getState().rightCollapsedByProfile).toEqual(DEFAULT_RIGHT);
  });

  it("hydrateLayout 从 data 属性回填，缺属性保持默认", () => {
    document.documentElement.setAttribute("data-sidebar-collapsed", "true");
    document.documentElement.setAttribute("data-right-collapsed-full", "true");
    useStore.getState().hydrateLayout();
    expect(useStore.getState().sidebarCollapsed).toBe(true);
    expect(useStore.getState().topBarCollapsed).toBe(false);
    expect(useStore.getState().rightCollapsedByProfile).toEqual({
      full: true,
      article: true,
      reference: false,
    });
  });

  it("setRightCollapsedForProfile 同步 data 属性", () => {
    useStore.getState().setRightCollapsedForProfile("full", true);
    expect(document.documentElement.getAttribute("data-right-collapsed-full")).toBe("true");
    expect(useStore.getState().rightCollapsedByProfile.full).toBe(true);
  });

  it("setActiveRoute 把 reference 页写成只含 ai 的右栏", () => {
    useStore.getState().setActiveRoute("histology", "shizhan-yanlian", "real-04");
    expect(useStore.getState().layoutProfile).toBe("reference");
    expect(useStore.getState().rightTabs).toEqual(["ai"]);
  });
});
