import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SelectionPopover from "./SelectionPopover";
import { useUserNotes } from "@/lib/stores/userNotes";
import { useWindowManager } from "@/lib/stores/windowManager";
import { useStore } from "@/lib/stores/ui";
import { SELECTION_POPOVER_SCROLL_GRACE_MS } from "@/lib/notes/selectionPopover";

vi.mock("@/lib/keyboard/useOverlayRegistration", () => ({
  useOverlayRegistration: () => {},
}));

function selectAcross(root: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(root);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

describe("SelectionPopover", () => {
  beforeEach(() => {
    useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
    useUserNotes.setState({
      byId: {},
      order: [],
      openEditorIds: [],
      agentEditingNoteId: null,
      noteAgentOpenIds: [],
      noteAgentSessionById: {},
      libraryOpen: false,
      libraryIntent: "browse",
      librarySubjectId: null,
    });
    useStore.setState({ activeSubjectId: "probability", activeCategoryId: "detail", activeItemId: "1.1" });
  });

  afterEach(() => {
    cleanup();
    window.getSelection()?.removeAllRanges();
  });

  it("keeps the helper open when the virtual list scrolls right after a cross-line select", async () => {
    const containerRef = { current: null as HTMLDivElement | null };
    render(
      <div>
        <div
          ref={(node) => {
            containerRef.current = node;
          }}
        >
          <p>第一行泊松分布的均值等于方差。</p>
          <p>第二行课上强调记忆这个对称性。</p>
        </div>
        <SelectionPopover containerRef={containerRef} noteSource="agent" />
      </div>,
    );

    const root = containerRef.current!;
    selectAcross(root);
    fireEvent.mouseUp(root);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByRole("button", { name: "笔记" })).toBeInTheDocument();
    fireEvent.scroll(root);
    expect(screen.getByRole("button", { name: "笔记" })).toBeInTheDocument();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, SELECTION_POPOVER_SCROLL_GRACE_MS + 20));
    });
    fireEvent.scroll(root);
    expect(screen.queryByRole("button", { name: "笔记" })).not.toBeInTheDocument();
  });

  it("opens a classroom sticky note from the 笔记 action", async () => {
    const containerRef = { current: null as HTMLDivElement | null };
    render(
      <div>
        <div
          ref={(node) => {
            containerRef.current = node;
          }}
        >
          <p>第一行泊松分布的均值等于方差。</p>
          <p>第二行课上强调记忆这个对称性。</p>
        </div>
        <SelectionPopover containerRef={containerRef} noteSource="agent" />
      </div>,
    );

    selectAcross(containerRef.current!);
    fireEvent.mouseUp(containerRef.current!);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    fireEvent.click(screen.getByRole("button", { name: "笔记" }));
    const note = Object.values(useUserNotes.getState().byId)[0];
    expect(note?.kind).toBe("classroom");
    expect(note?.quote).toMatch(/泊松分布/);
    expect(note?.source?.kind).toBe("agent");
    expect(useUserNotes.getState().openEditorIds).toEqual([note?.id]);
  });
});
