import assert from "node:assert/strict";
import { test } from "node:test";
import { STUDY_TOOL_NAMES } from "@/lib/ai/agent/tools/names";
import { TOOL_PRESENTATION, getToolPresentation } from "@/lib/ai/agent/tools/presentations";

test("TOOL_PRESENTATION keys match STUDY_TOOL_NAMES and every label is non-empty", () => {
  assert.deepEqual(Object.keys(TOOL_PRESENTATION).sort(), [...STUDY_TOOL_NAMES].sort());
  for (const name of STUDY_TOOL_NAMES) {
    const p = getToolPresentation(name);
    assert.ok(p, name);
    assert.ok(p.label.trim().length > 0, name);
    assert.ok(p.settingsLabel.trim().length > 0, name);
  }
});
