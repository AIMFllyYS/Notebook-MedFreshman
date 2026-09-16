import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ToolsSection } from "./ToolsSection";
import { useSettings } from "@/lib/stores/settings";

afterEach(() => {
  cleanup();
  useSettings.getState().setMaxToolRounds(6);
});

describe("ToolsSection", () => {
  it("可以改最大工具调用轮数并写入 store", () => {
    render(<ToolsSection />);
    const input = screen.getByTestId("max-tool-rounds");
    expect(input).toHaveValue(6);
    fireEvent.change(input, { target: { value: "10" } });
    expect(useSettings.getState().maxToolRounds).toBe(10);
  });
});
