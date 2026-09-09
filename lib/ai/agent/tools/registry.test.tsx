import { describe, expect, it } from "vitest";
import { STUDY_TOOL_NAMES } from "@/lib/ai/agent/tools/names";
import { TOOL_REGISTRY, TOOL_RESULT_CARDS } from "@/lib/ai/agent/tools/catalog";

describe("tool registry", () => {
  it("matches STUDY_TOOL_NAMES and requires ResultCard when resultKey exists", () => {
    expect(Object.keys(TOOL_REGISTRY).sort()).toEqual([...STUDY_TOOL_NAMES].sort());
    for (const name of STUDY_TOOL_NAMES) {
      expect(TOOL_REGISTRY[name].presentation.label.trim().length).toBeGreaterThan(0);
      if (TOOL_REGISTRY[name].resultKey) {
        expect(TOOL_REGISTRY[name].ResultCard).toBeTruthy();
      }
    }
  });

  it("lists the seven result cards in current chat order", () => {
    expect(TOOL_RESULT_CARDS.map((c) => c.name)).toEqual([
      "searchNotes",
      "webSearch",
      "renderInteractive",
      "generateImage",
      "createQuiz",
      "searchNoteImages",
      "writeDocument",
    ]);
  });
});
