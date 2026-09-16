import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CloudSyncSection, ExportSection, RedemptionSection } from "./DataSection";
import { exportAgentLogs } from "@/lib/ai/observability/downloadAgentLog";
import { loadCloudSyncUsage } from "@/lib/sync/engine";

vi.mock("@/lib/ai/observability/downloadAgentLog", () => ({
  exportAgentLogs: vi.fn().mockResolvedValue({
    ok: true,
    empty: false,
    filename: "agent-lifecycle.jsonl",
    byteLength: 12,
  }),
}));

vi.mock("@/lib/sync/engine", () => ({
  getCachedCloudSyncUsage: vi.fn(() => null),
  loadCloudSyncUsage: vi.fn(),
}));

const usageFixture = {
  source: "cloud" as const,
  totalBytes: 3 * 1024 * 1024,
  limitBytes: 48 * 1024 * 1024,
  kinds: [
    { kind: "chat-session" as const, label: "全部对话", unit: "条", bytes: 2 * 1024 * 1024, count: 4, limitBytes: 5 * 1024 * 1024 },
    { kind: "artifact" as const, label: "演示", unit: "个", bytes: 256 * 1024, count: 2, limitBytes: Math.round(1.5 * 1024 * 1024) },
    { kind: "document" as const, label: "文档", unit: "篇", bytes: 256 * 1024, count: 1, limitBytes: Math.round(2.5 * 1024 * 1024) },
    { kind: "user-note" as const, label: "个人笔记", unit: "篇", bytes: 256 * 1024, count: 3, limitBytes: 2 * 1024 * 1024 },
    { kind: "review-card" as const, label: "复习闪卡", unit: "张", bytes: 256 * 1024, count: 5, limitBytes: 256 * 1024 },
  ],
  pools: [
    { id: "notes" as const, label: "笔记额度池", unit: "篇", bytes: 256 * 1024, count: 3, limitBytes: 20 * 1024 * 1024 },
    { id: "flashcards" as const, label: "闪卡额度池", unit: "张", bytes: 256 * 1024, count: 5, limitBytes: 20 * 1024 * 1024 },
  ],
};

describe("CloudSyncSection", () => {
  it("says personal notes and flashcards sync, while images stay local", async () => {
    vi.mocked(loadCloudSyncUsage).mockResolvedValue(usageFixture);
    render(<CloudSyncSection />);
    expect(screen.getByText(/个人笔记和复习闪卡/)).toBeInTheDocument();
    expect(screen.getByText(/笔记额度池 20 MB/)).toBeInTheDocument();
    expect(screen.getByText(/工具读过的笔记以摘要同步/)).toBeInTheDocument();
    expect(screen.getByText(/用户上传的图片与 PDF 不上云/)).toBeInTheDocument();
    expect(await screen.findByRole("progressbar", { name: "云端已用" })).toBeInTheDocument();
  });

  it("reuses the colored usage bar for total and each sync kind", async () => {
    vi.mocked(loadCloudSyncUsage).mockResolvedValue(usageFixture);
    render(<CloudSyncSection />);
    expect(await screen.findByRole("progressbar", { name: "云端已用" })).toHaveAttribute("aria-valuenow", "6");
    expect(screen.getByRole("progressbar", { name: "笔记额度池" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "闪卡额度池" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "全部对话占用" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "演示占用" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "文档占用" })).toBeInTheDocument();
    expect(screen.getByText(/4 条/)).toBeInTheDocument();
    expect(screen.getByText(/2 个/)).toBeInTheDocument();
    expect(screen.getByText(/1 篇/)).toBeInTheDocument();
  });
});

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
