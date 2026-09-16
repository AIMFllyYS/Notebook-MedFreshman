import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FlashcardCiteWindow from "./FlashcardCiteWindow";
import { useFlashcardCitations } from "@/lib/stores/flashcardCitations";
import { useReviewCards } from "@/lib/stores/reviewCards";
import { useWindowManager } from "@/lib/stores/windowManager";
import { useChatUI } from "@/lib/stores/chatUI";
import { openFlashcardCitePicker } from "@/lib/notes/openUserNote";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("FlashcardCiteWindow", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      disconnect() {}
    });
    useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
    useFlashcardCitations.setState({ open: false, subjectId: null, activeCardId: null });
    useReviewCards.setState({ byId: {}, order: [] });
    useChatUI.getState().clearQuotedText();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows empty guidance when the subject has no cards", () => {
    openFlashcardCitePicker({ subjectId: "probability" });
    render(<FlashcardCiteWindow />);
    expect(screen.getByText(/还没有复习闪卡/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "打开复习板" })).toBeInTheDocument();
  });

  it("cites the selected flashcard into the chat quote tray", () => {
    const id = useReviewCards.getState().addSaved("泊松分布原文", {
      subjectId: "probability",
      sourceLabel: "概率论 / 详解 / 2.3",
    });
    useReviewCards.getState().finalize(
      id,
      {
        mode: "quiz",
        cardType: "quiz",
        front: "泊松分布的期望？",
        back: "$\\lambda$",
        explanation: "母函数",
      },
      "test",
    );
    openFlashcardCitePicker({ subjectId: "probability" });
    render(<FlashcardCiteWindow />);

    fireEvent.click(screen.getByRole("button", { name: "引用到对话" }));
    expect(useChatUI.getState().quotedText).toMatch(/【复习闪卡 · 概率论 \/ 详解 \/ 2.3】/);
    expect(useChatUI.getState().quotedText).toMatch(/正面：泊松分布的期望？/);
    expect(useChatUI.getState().quotedText).toMatch(/解析：母函数/);

    fireEvent.click(screen.getByRole("button", { name: /下载这张/ }));
    fireEvent.click(screen.getByRole("button", { name: /下载 CSV/ }));
  });
});
