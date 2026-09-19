import assert from "node:assert/strict";
import { test } from "node:test";
import { buildProjectCatalog, buildProjectSliceBodies, planCarry } from "./catalog.ts";
import { PROJECT_LIMITS } from "./limits.ts";
import type { ProjectFileEntry, ProjectSlice } from "./types.ts";

function slice(id: string, chars: number, pinned = false): ProjectSlice {
  return { id, title: id, chars, summary: `${id} 摘要`, text: "x".repeat(chars), ...(pinned ? { pinned } : {}) };
}

function file(id: string, overrides: Partial<ProjectFileEntry> = {}): ProjectFileEntry {
  return {
    id,
    projectId: "p1",
    kind: "imported",
    name: `${id}.md`,
    status: "indexed",
    indexMarkdown: `# ${id}`,
    charCount: 10,
    slices: [slice("slice-1", 100)],
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

test("目录只带索引字段，不含正文", () => {
  const catalog = buildProjectCatalog([file("f1")], "p1");
  assert.equal(catalog.files.length, 1);
  const item = catalog.files[0]!;
  assert.equal(item.fileId, "f1");
  assert.deepEqual(item.slices, [{ sliceId: "slice-1", title: "slice-1", chars: 100, summary: "slice-1 摘要" }]);
  assert.equal(JSON.stringify(catalog.files).includes("xxxx"), false, "目录里不能有切片正文");
});

test("目录只收本项目的文件，按文件名排序", () => {
  const catalog = buildProjectCatalog(
    [file("f2", { name: "b.md" }), file("f1", { name: "a.md" }), file("other", { projectId: "p2" })],
    "p1",
  );
  assert.deepEqual(catalog.files.map((item) => item.name), ["a.md", "b.md"]);
});

test("目录超过上限时从尾部裁切片并标记 truncated", () => {
  const big = file("big", {
    slices: Array.from({ length: 40 }, (_, index) => slice(`slice-${index + 1}`, 100)),
  });
  // 每条摘要 3 KB × 40 片 ≈ 120 KB，超过 MAX_CATALOG_BYTES(64 KB) → 必被裁。
  const bigSummary = "S".repeat(3000);
  big.slices = big.slices.map((item) => ({ ...item, summary: bigSummary }));
  const catalog = buildProjectCatalog([big], "p1");
  assert.equal(catalog.truncated, true);
  assert.ok(catalog.bytes <= PROJECT_LIMITS.MAX_CATALOG_BYTES);
});

test("携带计划：项目不大默认全带；超预算才只带勾选的；没有切片就 none", () => {
  const small = [file("f1", { slices: [slice("slice-1", 100), slice("slice-2", 100)] })];
  const smallPlan = planCarry(small, "p1");
  assert.equal(smallPlan.mode, "all");
  assert.equal(smallPlan.totalSlices, 2);
  assert.equal(smallPlan.chars, 200);

  const big = [file("f2", { slices: [slice("slice-1", 30_000, true), slice("slice-2", 30_000)] })];
  const pinnedPlan = planCarry(big, "p1");
  assert.equal(pinnedPlan.mode, "pinned");
  assert.deepEqual(pinnedPlan.sliceIds, ["slice-1"]);
  assert.equal(pinnedPlan.truncated, true);

  const bigUnpinned = [file("f3", { slices: [slice("slice-1", 30_000), slice("slice-2", 30_000)] })];
  assert.equal(planCarry(bigUnpinned, "p1").mode, "none");
  assert.equal(planCarry([], "p1").mode, "none");
});

test("切片正文按计划取，总额以预算封顶", () => {
  const files = [file("f1", { slices: [slice("slice-1", 100), slice("slice-2", 100)] })];
  const all = buildProjectSliceBodies(files, planCarry(files, "p1"), "p1");
  assert.equal(all.payloads.length, 2);
  assert.equal(all.chars, 200);
  assert.equal(all.payloads[0]!.fileId, "f1");

  const huge = [
    file("f2", {
      slices: [slice("slice-1", 30_000), slice("slice-2", 30_000)],
    }),
  ];
  const over = buildProjectSliceBodies(huge, { mode: "all", sliceIds: [], chars: 0, totalChars: 60_000, totalSlices: 2, truncated: false }, "p1");
  assert.equal(over.payloads.length, 1, "第一次就超预算的那片不带");
  assert.equal(over.truncated, true);
});

test("studio-ref 不进切片携带（正文走 getSection）", () => {
  const ref = file("ref", {
    kind: "studio-ref",
    name: "组胚教材",
    slices: [],
    studioRef: { path: "histology/detail/1.1", title: "上皮", address: "组织学 › 上皮", subjectId: "histology", categoryId: "detail", itemId: "1.1" },
  });
  const plan = planCarry([ref], "p1");
  assert.equal(plan.mode, "none");
  const catalog = buildProjectCatalog([ref], "p1");
  assert.equal(catalog.files[0]!.studioRef?.path, "histology/detail/1.1");
  assert.deepEqual(catalog.files[0]!.slices, []);
});