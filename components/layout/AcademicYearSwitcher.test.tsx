import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AcademicYearSwitcher from "./AcademicYearSwitcher";
import { useAcademicYear } from "@/lib/hooks/useAcademicYear";
import { ACADEMIC_YEAR_STORAGE_KEY, DEFAULT_ACADEMIC_YEAR } from "@/lib/constants/academic-year";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/",
}));

describe("AcademicYearSwitcher", () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockReset();
    useAcademicYear.setState({ year: DEFAULT_ACADEMIC_YEAR, hydrated: true });
  });

  it("shows 切换学年 and both year labels", () => {
    render(<AcademicYearSwitcher />);
    expect(screen.getByRole("group", { name: "切换学年" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "大一下学期" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "大二上学期" })).toBeInTheDocument();
  });

  it("persists the selected year and marks aria-pressed", async () => {
    const user = userEvent.setup();
    render(<AcademicYearSwitcher />);
    await user.click(screen.getByRole("button", { name: "大一下学期" }));
    expect(useAcademicYear.getState().year).toBe("freshman-2");
    expect(localStorage.getItem(ACADEMIC_YEAR_STORAGE_KEY)).toBe("freshman-2");
    expect(screen.getByRole("button", { name: "大一下学期" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "大二上学期" })).toHaveAttribute("aria-pressed", "false");
  });
});
