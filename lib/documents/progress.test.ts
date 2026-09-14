import assert from "node:assert/strict";
import { test } from "node:test";
import {
  countDoneSections,
  currentWritingSection,
  documentCardHeading,
  documentProgressRatio,
  formatSectionProgress,
} from "./progress.ts";

test("counts only completed sections so the bar fills one chapter at a time", () => {
  const sections = [
    { status: "done" as const },
    { status: "streaming" as const, title: "主体" },
    { status: "pending" as const },
  ];
  assert.equal(countDoneSections(sections), 1);
  assert.equal(currentWritingSection(sections)?.title, "主体");
  assert.equal(documentProgressRatio(1, 3), 1 / 3);
  assert.equal(formatSectionProgress(1, 3), "1 / 3 节");
  assert.equal(formatSectionProgress(0, 0), "");
});

test("uses planning copy before outline lands", () => {
  assert.equal(
    documentCardHeading({
      title: "细胞综述",
      inFlight: true,
      done: false,
      errored: false,
      status: "outlining",
      sectionCount: 3,
    }),
    "正在规划章节：细胞综述…",
  );
  assert.equal(
    documentCardHeading({
      title: "细胞综述",
      inFlight: true,
      done: false,
      errored: false,
      status: "writing",
      sectionCount: 3,
    }),
    "正在撰写：细胞综述…",
  );
  assert.equal(
    documentCardHeading({
      title: "细胞综述",
      inFlight: false,
      done: true,
      errored: false,
      status: "done",
      sectionCount: 3,
    }),
    "文档已就绪：细胞综述",
  );
});
