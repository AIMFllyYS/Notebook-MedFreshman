import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { useComposerCitations } from "@/lib/stores/composerCitations";
import { useUserNotes } from "@/lib/stores/userNotes";
import { useReviewCards } from "@/lib/stores/reviewCards";
import { useWindowManager } from "@/lib/stores/windowManager";
import {
  citeReviewCards,
  citeUserNotes,
  createAndOpenUserNote,
  formatReviewCardCitation,
  formatUserNoteCitation,
  openUserNotesLibrary,
  userNotesWindowId,
} from "./workspace.ts";
import { DEFAULT_USER_NOTE_MARKDOWN, DEFAULT_USER_NOTE_TITLE } from "./types.ts";
import type { ReviewCard } from "@/lib/review/types";

function resetStores() {
  useUserNotes.setState({ byId: {}, order: [] });
  useComposerCitations.setState({ citations: [] });
  useReviewCards.setState({ byId: {}, order: [] });
  useWindowManager.setState({ windows: [], topZ: 5000, activeWindowId: null });
}

beforeEach(resetStores);
afterEach(resetStores);

test("formatUserNoteCitation 保留公式原文", () => {
  const markdown = formatUserNoteCitation({
    id: "n1",
    title: "动能",
    markdown: "动能 $E_k = \\frac{1}{2}mv^2$",
    subjectId: "physics",
    createdAt: 1,
    updatedAt: 1,
  });
  assert.match(markdown, /^# 动能\n\n/);
  assert.match(markdown, /\$E_k = \\frac\{1\}\{2\}mv\^2\$/);
});

test("formatReviewCardCitation 含出处、正反面与原文", () => {
  const card = {
    id: "c1",
    subjectId: "physics",
    sourceLabel: "大学物理 / 详解 / 1.1",
    originalText: "质点动能定理",
    cardType: "quiz",
    front: "动能定理写什么？",
    back: "$W = \\Delta E_k$",
    status: "ready",
    createdAt: 1,
  } as ReviewCard;
  const markdown = formatReviewCardCitation(card);
  assert.match(markdown, /出处：大学物理 \/ 详解 \/ 1.1/);
  assert.match(markdown, /## 正面/);
  assert.match(markdown, /\$W = \\Delta E_k\$/);
  assert.match(markdown, /质点动能定理/);
});

test("createAndOpenUserNote 落库并打开科目工作区窗口", () => {
  const id = createAndOpenUserNote("physics");
  const note = useUserNotes.getState().byId[id];
  assert.equal(note?.title, DEFAULT_USER_NOTE_TITLE);
  assert.equal(note?.markdown, DEFAULT_USER_NOTE_MARKDOWN);
  assert.match(DEFAULT_USER_NOTE_MARKDOWN, /\$\$/);
  assert.match(DEFAULT_USER_NOTE_MARKDOWN, /\\ce\{/);
  const win = useWindowManager.getState().windows.find((w) => w.id === userNotesWindowId("physics"));
  assert.equal(win?.type, "user-notes");
  assert.equal((win?.data as { noteId: string }).noteId, id);
});

test("openUserNotesLibrary 空库不自动建笔记", () => {
  openUserNotesLibrary("chemistry");
  assert.equal(Object.keys(useUserNotes.getState().byId).length, 0);
  const win = useWindowManager.getState().windows[0];
  assert.equal(win?.type, "user-notes");
  assert.equal((win?.data as { noteId: string | null }).noteId, null);
});

test("citeUserNotes / citeReviewCards 去重后进入对话引用区", () => {
  const noteId = useUserNotes.getState().create({ subjectId: "physics", title: "动量" });
  citeUserNotes([noteId, noteId]);
  assert.equal(useComposerCitations.getState().citations.length, 1);
  assert.equal(useComposerCitations.getState().citations[0]?.kind, "user-note");

  useReviewCards.setState({
    byId: {
      c1: {
        id: "c1",
        subjectId: "physics",
        sourceLabel: "复习板",
        originalText: "原文",
        cardType: "excerpt",
        front: "正面",
        back: "背面",
        status: "ready",
        createdAt: 1,
      } as ReviewCard,
    },
    order: ["c1"],
  });
  citeReviewCards(["c1", "c1"]);
  assert.equal(useComposerCitations.getState().citations.length, 2);
  assert.equal(useComposerCitations.getState().citations[1]?.kind, "review-card");
});

test("删除笔记会拆掉对应的对话引用芯片", () => {
  const id = useUserNotes.getState().create({ subjectId: "physics", title: "要删" });
  citeUserNotes([id]);
  useUserNotes.getState().remove(id);
  assert.equal(useComposerCitations.getState().citations.length, 0);
  assert.equal(useUserNotes.getState().byId[id], undefined);
});
