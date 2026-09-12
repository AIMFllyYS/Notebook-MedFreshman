import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportSection, RedemptionSection } from "./DataSection";
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

describe("RedemptionSection", () => {
  it("rejects an invalid code without leaking whether it exists", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "兑换失败，请检查兑换码后重试。" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<RedemptionSection />);
    await user.type(screen.getByLabelText("兑换码"), "NOT-A-REAL-CODE");
    await user.click(screen.getByRole("button", { name: "兑换" }));
    expect(await screen.findByText("兑换失败，请检查兑换码后重试。")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.code).toBe("NOT-A-REAL-CODE");
    expect(screen.queryByText(/该码不存在|无效码|max_uses/i)).toBeNull();
    vi.unstubAllGlobals();
  });
});
