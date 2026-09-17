import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ClassPlaceholder from "./ClassPlaceholder";

describe("ClassPlaceholder", () => {
  it("显示 Class 页与开发中占位", () => {
    render(<ClassPlaceholder />);
    expect(document.querySelector("[data-class-placeholder]")).not.toBeNull();
    expect(screen.getByText("StudySolo · Class")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "开发中" })).toBeInTheDocument();
    expect(screen.getByText("班级名称")).toBeInTheDocument();
    expect(screen.getByText("加入方式")).toBeInTheDocument();
  });
});
