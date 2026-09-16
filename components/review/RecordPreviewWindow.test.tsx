import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RecordPreviewLayer from "./RecordPreviewLayer";
import { useRecordPreviews } from "@/lib/stores/recordPreviews";
import { useReviewCards } from "@/lib/stores/reviewCards";
import { useWindowManager } from "@/lib/stores/windowManager";

describe("RecordPreviewWindow subject chip", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      disconnect() {}
    });
    useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
    useRecordPreviews.setState({ previews: [] });
    useReviewCards.setState({ byId: {}, order: [] });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("writes the card subjectId from the title-bar chip", () => {
    const id = useReviewCards.getState().addSaved("泊松分布原文", {
      subjectId: "probability",
      sourceLabel: "概率论 / 详解 / 2.3",
    });
    useRecordPreviews.getState().open(id, { x: 80, y: 80 });
    render(<RecordPreviewLayer />);

    expect(screen.getByTestId("subject-picker")).toHaveTextContent("概率论");
    fireEvent.click(screen.getByTestId("subject-picker"));
    fireEvent.click(screen.getByTestId("subject-picker-option-physics"));

    expect(useReviewCards.getState().byId[id]?.subjectId).toBe("physics");
    expect(useReviewCards.getState().byId[id]?.sourceLabel).toBe("大学物理 / 详解 / 2.3");
    expect(screen.getByTestId("subject-picker")).toHaveTextContent("大学物理");
  });
});
