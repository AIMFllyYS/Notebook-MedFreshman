import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RecordAssistantSection } from "./ModelSection";
import { useSettings } from "@/lib/stores/settings";
import { DEFAULT_SELECTION_ASSISTANT_ACTIONS } from "@/lib/notes/selectionAssistant";
import { DEFAULT_MODEL_ID } from "@/lib/ai/models";

afterEach(() => {
  cleanup();
  useSettings.setState({
    selectionAssistantEnabled: true,
    selectionAssistantActions: { ...DEFAULT_SELECTION_ASSISTANT_ACTIONS },
    blockForeignSelectionAssistants: false,
    quizModelId: DEFAULT_MODEL_ID,
  });
});

describe("RecordAssistantSection", () => {
  it("可开关本站划词助手并隐藏引用动作", () => {
    render(<RecordAssistantSection />);
    expect(screen.getByText("开启本站划词助手")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("selection-action-quote"));
    expect(useSettings.getState().selectionAssistantActions.quote).toBe(false);
    expect(useSettings.getState().quizModelId).toBe(DEFAULT_MODEL_ID);
  });
});
