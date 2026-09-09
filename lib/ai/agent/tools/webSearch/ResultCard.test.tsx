import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import WebSearchResultCard from "./ResultCard";
import type { ChatMessage } from "@/lib/types/chat";
import type { ToolPart } from "@/lib/ai/agent/tools/registry";

afterEach(() => cleanup());

const message = { id: "m", role: "assistant", timestamp: 1, parts: [] } as ChatMessage;

describe("webSearch ResultCard", () => {
  it("renders source fold title", () => {
    const part = {
      type: "tool-webSearch",
      toolCallId: "c1",
      state: "output-available",
      input: { query: "q" },
      output: { text: "…", sources: [{ title: "来源甲", url: "https://a.example", snippet: "" }] },
    } as ToolPart<"webSearch">;
    render(<WebSearchResultCard part={part} message={message} isStreaming={false} ctx={{ isStreaming: false }} />);
    expect(screen.getByText(/联网来源 · 1 条/)).toBeVisible();
  });
});
