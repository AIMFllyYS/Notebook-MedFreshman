import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GlobalSearchButton from "./GlobalSearchButton";
import { SPOTLIGHT_BODY_CLASS, SPOTLIGHT_PANEL_CLASS } from "./spotlightChrome";
import { useGlobalSearch } from "@/lib/keyboard/useGlobalSearch";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  useGlobalSearch.setState({ open: false });
});

describe("GlobalSearchButton", () => {
  it("opens a spotlight dialog with the shared panel size", () => {
    render(<GlobalSearchButton />);
    fireEvent.click(screen.getByTitle(/全局搜索/));
    const dialog = screen.getByRole("dialog", { name: "全局搜索" });
    expect(dialog).toHaveClass(...SPOTLIGHT_PANEL_CLASS.split(" "));
    expect(dialog.innerHTML).toContain(SPOTLIGHT_BODY_CLASS.split(" ")[0]);
  });
});
