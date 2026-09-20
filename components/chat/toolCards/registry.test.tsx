import { describe, expect, it } from "vitest";
import { STUDY_TOOL_NAMES } from "@/lib/ai/agent/tools/names";
import { THREAD_SILENT_TOOLS, TOOL_REGISTRY, TOOL_RESULT_CARDS } from "@/components/chat/toolCards/registry";

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

  it("keeps only the memory-loop proposal tools off the result-card list", () => {
    expect([...THREAD_SILENT_TOOLS]).toEqual(["proposeMemory", "commitNotes", "commitFlashcards"]);
    expect(TOOL_RESULT_CARDS.map((c) => c.name)).not.toEqual(
      expect.arrayContaining(["proposeMemory", "commitNotes", "commitFlashcards"]),
    );
    expect(TOOL_REGISTRY.proposeMemory.ResultCard).toBeUndefined();
    expect(TOOL_REGISTRY.commitNotes.ResultCard).toBeUndefined();
    expect(TOOL_REGISTRY.commitFlashcards.ResultCard).toBeUndefined();
  });

  it("gives updateUserNote a consent card so the user can see and approve it", () => {
    expect(TOOL_REGISTRY.updateUserNote.ResultCard).toBeTruthy();
    expect(TOOL_RESULT_CARDS.map((c) => c.name)).toContain("updateUserNote");
  });

  it("lists the result cards in current chat order", () => {
    expect(TOOL_RESULT_CARDS.map((c) => c.name)).toEqual([
      "searchNotes",
      "webSearch",
      "renderInteractive",
      "generateImage",
      "createQuiz",
      "searchNoteImages",
      "writeDocument",
      "imageSearch",
      "updateUserNote",
    ]);
  });

  it("aggregates retrieval tools by path or url", () => {
    expect(TOOL_REGISTRY.searchNotes.aggregate).toBe(true);
    expect(TOOL_REGISTRY.webSearch.aggregate).toBe(true);
    expect(TOOL_REGISTRY.searchNoteImages.aggregate).toBe(true);
    expect(TOOL_REGISTRY.imageSearch.aggregate).toBe(true);
    expect(TOOL_REGISTRY.renderInteractive.aggregate).toBeFalsy();
  });
});
