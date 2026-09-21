import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildProjectCatalog,
  buildProjectSliceBodies,
  carryNotice,
  planCarry,
  summarizeCarry,
  withRememberedSlices,
} from "./catalog.ts";
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

test("目录超限时轮转裁：每个文件至少留一片，不会整个文件消失", () => {
  const bigSummary = "S".repeat(3000);
  const files = ["a", "b", "c", "d"].map((id) =>
    file(id, {
      name: `${id}.md`,
      slices: Array.from({ length: 12 }, (_, index) => ({ ...slice(`${id}-slice-${index + 1}`, 100), summary: bigSummary })),
    }));
  const catalog = buildProjectCatalog(files, "p1");

  assert.equal(catalog.truncated, true);
  assert.ok(catalog.bytes <= PROJECT_LIMITS.MAX_CATALOG_BYTES);
  assert.equal(catalog.files.length, 4, "文件本身不能消失");
  for (const item of catalog.files) {
    assert.ok(item.slices.length >= 1, `${item.name} 至少保留一片`);
  }
  // 轮转裁是均摊的，不是把最后一个文件砍光。
  const counts = catalog.files.map((item) => item.slices.length).sort((a, b) => a - b);
  assert.ok(counts[counts.length - 1]! - counts[0]! <= 1, `裁得应该比较均匀，实际 ${counts.join("/")}`);
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

test("携带摘要：全带时不上报降级，超预算时才报", () => {
  const index = (count: number) => ({
    fileId: "f1",
    name: "f1.md",
    kind: "imported" as const,
    status: "indexed" as const,
    slices: Array.from({ length: count }, (_, i) => ({
      sliceId: `slice-${i + 1}`,
      title: `slice-${i + 1}`,
      chars: 100,
      summary: "s",
    })),
  });

  const full = summarizeCarry([index(3)], [{ sliceId: "slice-1" }, { sliceId: "slice-2" }, { sliceId: "slice-3" }]);
  assert.deepEqual(full, { carried: 3, total: 3, degraded: false });
  assert.equal(carryNotice(full), null, "全带不该提示");

  const partial = summarizeCarry([index(3)], [{ sliceId: "slice-1" }]);
  assert.deepEqual(partial, { carried: 1, total: 3, degraded: true });
  const notice = carryNotice(partial);
  assert.match(notice ?? "", /只带入了 1\/3 片/);
  assert.match(notice ?? "", /带入对话/);

  // 目录本身被裁过时不能报出 carried > total 这种自相矛盾的比例。
  const clipped = summarizeCarry([index(1)], [{ sliceId: "slice-1" }, { sliceId: "slice-2" }]);
  assert.deepEqual(clipped, { carried: 2, total: 2, degraded: false });

  assert.equal(carryNotice(summarizeCarry([], [])), null, "没有项目文件不提示");
  const empty = summarizeCarry([index(2)], []);
  assert.match(carryNotice(empty) ?? "", /一片正文都没进上下文/);
});

test("已读切片只在降级态回补，all 不动", () => {
  const all: ReturnType<typeof planCarry> = {
    mode: "all",
    sliceIds: [],
    chars: 300,
    totalChars: 300,
    totalSlices: 3,
    truncated: false,
  };
  assert.equal(withRememberedSlices(all, ["slice-9"]), all, "全带时补了也没用，返回原计划");

  const pinned = withRememberedSlices(
    { mode: "pinned", sliceIds: ["slice-1"], chars: 0, totalChars: 60_000, totalSlices: 2, truncated: true },
    ["slice-2", "slice-1", ""],
  );
  assert.deepEqual(pinned.sliceIds, ["slice-1", "slice-2"], "已读的补齐、去重、忽略空值");

  const none = withRememberedSlices(
    { mode: "none", sliceIds: [], chars: 0, totalChars: 60_000, totalSlices: 2, truncated: true },
    ["slice-2"],
  );
  assert.deepEqual(none.sliceIds, ["slice-2"]);
  assert.equal(none.mode, "none");
});

test("回补的已读切片仍受总预算封顶", () => {
  const files = [
    file("f1", { slices: [slice("slice-1", 30_000), slice("slice-2", 30_000), slice("slice-3", 100)] }),
  ];
  const plan = withRememberedSlices(planCarry(files, "p1"), ["slice-3"]);
  const carried = buildProjectSliceBodies(files, plan, "p1");
  assert.deepEqual(carried.payloads.map((item) => item.sliceId), ["slice-3"]);
  assert.ok(carried.chars <= PROJECT_LIMITS.MAX_CARRY_CHARS);
});