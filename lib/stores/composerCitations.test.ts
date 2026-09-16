import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  reviewCardCitationId,
  useComposerCitations,
  userNoteCitationId,
} from "./composerCitations.ts";

beforeEach(() => useComposerCitations.getState().clearCitations());
afterEach(() => useComposerCitations.getState().clearCitations());

test("addCitations 按 id 去重并保持插入顺序", () => {
  useComposerCitations.getState().addCitations([
    { id: userNoteCitationId("a"), kind: "user-note", sourceId: "a", title: "A", markdown: "a" },
    { id: reviewCardCitationId("b"), kind: "review-card", sourceId: "b", title: "B", markdown: "b" },
    { id: userNoteCitationId("a"), kind: "user-note", sourceId: "a", title: "A2", markdown: "a2" },
  ]);
  const ids = useComposerCitations.getState().citations.map((c) => c.id);
  assert.deepEqual(ids, ["note:a", "card:b"]);
});

test("removeCitation / clearCitations", () => {
  useComposerCitations.getState().addCitations([
    { id: "note:a", kind: "user-note", sourceId: "a", title: "A", markdown: "a" },
    { id: "card:b", kind: "review-card", sourceId: "b", title: "B", markdown: "b" },
  ]);
  useComposerCitations.getState().removeCitation("note:a");
  assert.deepEqual(useComposerCitations.getState().citations.map((c) => c.id), ["card:b"]);
  useComposerCitations.getState().clearCitations();
  assert.equal(useComposerCitations.getState().citations.length, 0);
});
