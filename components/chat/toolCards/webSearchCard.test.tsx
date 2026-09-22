import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import WebSearchResultCard from "./webSearchCard";
import type { ChatMessage } from "@/lib/types/chat";
import type { ToolPart } from "@/lib/ai/agent/tools/registry";

afterEach(() => cleanup());

const message = { id: "m", role: "assistant", timestamp: 1, parts: [] } as ChatMessage;

function part(overrides: Record<string, unknown>) {
  return {
    type: "tool-webSearch",
    toolCallId: "c1",
    input: { query: "q" },
    ...overrides,
  } as ToolPart<"webSearch">;
}

describe("webSearch ResultCard", () => {
  it("renders source fold title and strip cards", () => {
    render(
      <WebSearchResultCard
        part={part({
          state: "output-available",
          output: { text: "…", sources: [{ title: "来源甲", url: "https://a.example/x", snippet: "" }] },
        })}
        message={message}
        isStreaming={false}
        ctx={{ isStreaming: false }}
      />,
    );
    expect(screen.getByText(/联网来源 · 1 条/)).toBeVisible();
    expect(screen.getByText("a.example")).toBeInTheDocument();
  });

  it("input-available 时渲染 live 卡：供应商脉冲点 + 骨架来源", () => {
    render(
      <WebSearchResultCard
        part={part({ state: "input-available", input: { query: "如何复习", mode: "daily" } })}
        message={message}
        isStreaming
        ctx={{ isStreaming: true }}
      />,
    );
    expect(screen.getByText(/正在搜索 Kimi · 智谱/)).toBeVisible();
    expect(document.querySelectorAll(".web-search-chip[data-state='running']")).toHaveLength(2);
    expect(document.querySelectorAll(".web-source-card.is-skeleton")).toHaveLength(3);
  });

  it("preliminary 输出 = live 卡但带已流到的来源", () => {
    render(
      <WebSearchResultCard
        part={part({
          state: "output-available",
          preliminary: true,
          input: { query: "临床试验", mode: "academic" },
          output: {
            text: "",
            sources: [{ title: "半流", url: "https://b.example/y", snippet: "" }],
            providers: ["perplexity"],
          },
        })}
        message={message}
        isStreaming
        ctx={{ isStreaming: true }}
      />,
    );
    // 已回执的 Perplexity 转勾，计划内未完成的 Kimi 仍在脉冲。
    expect(document.querySelectorAll(".web-search-chip[data-state='done']")).toHaveLength(1);
    expect(document.querySelectorAll(".web-search-chip[data-state='running']")).toHaveLength(1);
    expect(screen.getByText("b.example")).toBeInTheDocument();
    expect(document.querySelectorAll(".web-source-card.is-skeleton")).toHaveLength(3);
  });

  it("output-error → 失败卡：原因 + 计划源灰态", () => {
    render(
      <WebSearchResultCard
        part={part({ state: "output-error", errorText: "all providers failed" })}
        message={message}
        isStreaming={false}
        ctx={{ isStreaming: false }}
      />,
    );
    expect(screen.getByText("搜索失败")).toBeVisible();
    expect(screen.getByText("all providers failed")).toBeInTheDocument();
    expect(document.querySelectorAll(".web-search-chip[data-state='skipped']")).toHaveLength(2);
  });

  it("完成后有 providers 回执 → 勾态；无回执 → 不出芯片", () => {
    const withReceipt = render(
      <WebSearchResultCard
        part={part({
          state: "output-available",
          output: {
            text: "…",
            sources: [{ title: "x", url: "https://a.example", snippet: "" }],
            providers: ["kimi", "zhipu"],
            skipped: [{ provider: "perplexity", reason: "超时" }],
          },
        })}
        message={message}
        isStreaming={false}
        ctx={{ isStreaming: false }}
      />,
    );
    expect(document.querySelectorAll(".web-search-chip[data-state='done']")).toHaveLength(2);
    expect(document.querySelectorAll(".web-search-chip[data-state='skipped']")).toHaveLength(1);
    withReceipt.unmount();

    render(
      <WebSearchResultCard
        part={part({
          state: "output-available",
          output: { text: "…", sources: [{ title: "x", url: "https://a.example", snippet: "" }] },
        })}
        message={message}
        isStreaming={false}
        ctx={{ isStreaming: false }}
      />,
    );
    expect(document.querySelectorAll(".web-search-chip")).toHaveLength(0);
  });

  it("output-denied / 空结果不渲染", () => {
    const { container } = render(
      <WebSearchResultCard
        part={part({ state: "output-denied" })}
        message={message}
        isStreaming={false}
        ctx={{ isStreaming: false }}
      />,
    );
    expect(container.firstChild).toBeNull();
  });
});
