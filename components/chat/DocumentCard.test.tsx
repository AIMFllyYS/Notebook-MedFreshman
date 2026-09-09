import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import DocumentCard from "./DocumentCard";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { useWindowManager } from "@/lib/hooks/useWindowManager";

function sse(events: object[]) {
  return events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join("");
}

describe("DocumentCard", () => {
  beforeEach(() => {
    useDocuments.setState({ byId: {}, viewerId: null, _hasHydrated: true });
    useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("does not abort generation when create() writes doc into the store", async () => {
    const spec = {
      title: "细胞综述",
      format: "markdown" as const,
      genre: "review-notes" as const,
      brief: "写一篇",
      outline: ["引言", "主体", "小结"],
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          sse([
            { type: "document", id: "doc_1", status: "outline", outline: [
              { title: "引言", brief: "b1" },
              { title: "主体", brief: "b2" },
              { title: "小结", brief: "b3" },
            ] },
          ]),
          { headers: { "Content-Type": "text/event-stream" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          sse([{ type: "document", id: "doc_1", status: "section-done", sectionIndex: 0, markdown: "## 引言\n一", continued: 0 }]),
          { headers: { "Content-Type": "text/event-stream" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          sse([{ type: "document", id: "doc_1", status: "section-done", sectionIndex: 1, markdown: "## 主体\n二", continued: 0 }]),
          { headers: { "Content-Type": "text/event-stream" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          sse([{ type: "document", id: "doc_1", status: "section-done", sectionIndex: 2, markdown: "## 小结\n三", continued: 0 }]),
          { headers: { "Content-Type": "text/event-stream" } },
        ),
      );

    render(<DocumentCard documentId="doc_1" spec={spec} autoStart />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /查看文档/ })).toBeTruthy();
    });
    expect(useDocuments.getState().byId.doc_1?.status).toBe("done");
    expect(fetch).toHaveBeenCalledTimes(4);
    expect(vi.mocked(fetch).mock.calls.every((call) => {
      const init = call[1] as RequestInit | undefined;
      return !init?.signal;
    })).toBe(true);
  });

  it("shows 查看文档 for a persisted outlining doc that is not generating", () => {
    useDocuments.setState({
      byId: {
        doc_stuck: {
          id: "doc_stuck",
          spec: { title: "卡住的文档", format: "markdown", genre: "review-notes", brief: "x" },
          sections: [
            { title: "一", status: "pending" },
            { title: "二", status: "pending" },
            { title: "三", status: "pending" },
          ],
          status: "outlining",
          createdAt: 1,
          updatedAt: 1,
        },
      },
      viewerId: null,
      _hasHydrated: true,
    });

    render(<DocumentCard documentId="doc_stuck" spec={{ title: "卡住的文档", format: "markdown", genre: "review-notes", brief: "x" }} />);

    expect(screen.getByText("卡住的文档")).toBeTruthy();
    expect(screen.getByRole("button", { name: /查看文档/ })).toBeTruthy();
    expect(screen.getByText("0 / 3 节")).toBeTruthy();
  });
});
