import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SubjectSidebar from "./SubjectSidebar";
import { useAcademicYear } from "@/lib/hooks/useAcademicYear";
import { DEFAULT_ACADEMIC_YEAR } from "@/lib/constants/academic-year";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

describe("SubjectSidebar year filter", () => {
  beforeEach(() => {
    localStorage.clear();
    useAcademicYear.setState({ year: DEFAULT_ACADEMIC_YEAR, hydrated: true });
  });

  it("default 大二上学期 hides 大一 subjects and shows the four medical books", () => {
    render(<SubjectSidebar />);
    expect(screen.getByRole("group", { name: "切换学年" })).toBeInTheDocument();
    expect(screen.getByText("系统解剖学")).toBeInTheDocument();
    expect(screen.getByText("医学细胞生物学")).toBeInTheDocument();
    expect(screen.getByText("生物化学与分子生物学")).toBeInTheDocument();
    expect(screen.getByText("组织学与胚胎学")).toBeInTheDocument();
    expect(screen.queryByText("概率论与数理统计")).not.toBeInTheDocument();
    expect(screen.queryByText("大学物理")).not.toBeInTheDocument();
    expect(screen.queryByText("有机化学")).not.toBeInTheDocument();
  });

  it("切换学年 to 大一下学期 restores freshman subjects and hides the four books", async () => {
    const user = userEvent.setup();
    render(<SubjectSidebar />);
    const yearGroup = screen.getByRole("group", { name: "切换学年" });
    await user.click(screen.getByRole("button", { name: "大一下学期" }));
    expect(useAcademicYear.getState().year).toBe("freshman-2");
    expect(yearGroup).toBeInTheDocument();
    expect(screen.getByText("概率论与数理统计")).toBeInTheDocument();
    expect(screen.getByText("大学物理")).toBeInTheDocument();
    expect(screen.getByText("有机化学")).toBeInTheDocument();
    expect(screen.queryByText("系统解剖学")).not.toBeInTheDocument();
    expect(screen.queryByText("医学细胞生物学")).not.toBeInTheDocument();
  });
});
