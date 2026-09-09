import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import SearchNotesResultCard from "./ResultCard";
import type { ChatMessage } from "@/lib/types/chat";
import type { ToolPart } from "@/lib/ai/agent/tools/registry";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

afterEach(() => cleanup());

const message = { id: "m", role: "assistant", timestamp: 1, parts: [] } as ChatMessage;

describe("searchNotes ResultCard", () => {
  it("renders citation fold title", () => {
    const part = {
      type: "tool-searchNotes",
      toolCallId: "c1",
      state: "output-available",
      input: { query: "贝叶斯" },
      output: { text: "…", hits: [{ title: "贝叶斯公式", path: "probability/detail/1.4", snippet: "s" }] },
    } as ToolPart<"searchNotes">;
    render(<SearchNotesResultCard part={part} message={message} isStreaming={false} ctx={{ isStreaming: false }} />);
    expect(screen.getByText(/引用笔记 · 1 条/)).toBeVisible();
  });
});
