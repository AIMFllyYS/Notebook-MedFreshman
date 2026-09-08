import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SourcePreviewViewer from "./SourcePreviewViewer";
import { clearEmbedCache } from "@/lib/browser/canEmbed";
import { openSourcePreview } from "@/lib/chat/openSourcePreview";
import { useWindowManager } from "@/lib/hooks/useWindowManager";

afterEach(() => {
  cleanup();
  useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
  clearEmbedCache();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("SourcePreviewViewer", () => {
  it("renders nothing when no source preview is open", () => {
    render(<SourcePreviewViewer />);
    expect(screen.queryByTestId("source-preview-window")).not.toBeInTheDocument();
  });

  it("embeds the page in an iframe and keeps 打开原页面 in the chrome", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ json: async () => ({ embeddable: true }) })));
    const open = vi.fn();
    vi.stubGlobal("open", open);
    openSourcePreview({ url: "https://example.edu/course", title: "大学课程" });
    render(<SourcePreviewViewer />);

    const frame = screen.getByTitle("大学课程");
    expect(frame.tagName).toBe("IFRAME");
    expect(frame).toHaveAttribute("src", "https://example.edu/course");
    await userEvent.click(screen.getByRole("button", { name: "打开原页面" }));
    expect(open).toHaveBeenCalledWith("https://example.edu/course", "_blank", "noopener,noreferrer");
  });

  it("shows a disaster-recovery panel when the site refuses to be embedded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ json: async () => ({ embeddable: false, reason: "X-Frame-Options: DENY" }) })),
    );
    openSourcePreview({ url: "https://blocked.example/x", title: "被拦截" });
    render(<SourcePreviewViewer />);

    await waitFor(() => {
      expect(screen.getByText("无法内嵌该页面")).toBeVisible();
    });
    expect(screen.getByText(/X-Frame-Options: DENY/)).toBeVisible();
    expect(screen.getByRole("link", { name: /打开原页面/ })).toHaveAttribute("href", "https://blocked.example/x");
    expect(screen.queryByTitle("被拦截")).not.toBeInTheDocument();
  });
});
