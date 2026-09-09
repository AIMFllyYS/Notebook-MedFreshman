import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import WriteDocumentResultCard from "./ResultCard";
import type { ChatMessage } from "@/lib/types/chat";
import type { ToolPart } from "@/lib/ai/agent/tools/registry";

afterEach(() => cleanup());

const message = { id: "m", role: "assistant", timestamp: 1, parts: [] } as ChatMessage;

describe("writeDocument ResultCard", () => {
  it("renders document title on the card", () => {
    const part = {
      type: "tool-writeDocument",
      toolCallId: "c1",
      state: "output-available",
      input: { title: "细胞综述", format: "markdown", genre: "review-notes", brief: "写一篇" },
      output: {
        text: "…",
        documentId: "doc_1",
        spec: { title: "细胞综述", format: "markdown", genre: "review-notes", brief: "写一篇" },
      },
    } as ToolPart<"writeDocument">;
    render(<WriteDocumentResultCard part={part} message={message} isStreaming={false} ctx={{ isStreaming: false }} />);
    expect(screen.getByText("细胞综述")).toBeVisible();
  });
});
