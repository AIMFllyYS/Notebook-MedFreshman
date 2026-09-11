import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportSection } from "./DataSection";
import { exportAgentLogs } from "@/lib/ai/observability/downloadAgentLog";

vi.mock("@/lib/ai/observability/downloadAgentLog", () => ({
  exportAgentLogs: vi.fn().mockResolvedValue({
    ok: true,
    empty: false,
    filename: "agent-lifecycle.jsonl",
    byteLength: 12,
  }),
}));

describe("ExportSection", () => {
  it("has a one-click button that exports raw agent JSONL", async () => {
    const user = userEvent.setup();
    render(<ExportSection />);

    const button = screen.getByRole("button", { name: "导出全部日志" });
    expect(button).toBeInTheDocument();
    await user.click(button);
    await waitFor(() => {
      expect(exportAgentLogs).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText("已导出")).toBeInTheDocument();
  });
});
