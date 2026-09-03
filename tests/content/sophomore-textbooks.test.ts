import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { contentTree, getCategory } from "@/lib/content-data";
import { readContentMarkdown } from "@/lib/content/loader";
import type { ContentItem } from "@/lib/types/content";
import { STANDARD_CATEGORY_ORDER } from "@/lib/content-data/category-templates";

const SOPHOMORE = ["cell-biology", "biochemistry", "anatomy", "histology", "instrumental-analysis"] as const;
const BLOCKS = [...STANDARD_CATEGORY_ORDER];
const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");

const MIN_PROSE = 240;

function walkLeaves(items: ContentItem[]): ContentItem[] {
  const out: ContentItem[] = [];
  for (const item of items) {
    if (item.children?.length) out.push(...walkLeaves(item.children));
    else out.push(item);
  }
  return out;
}

function imageRefs(md: string): string[] {
  const refs: string[] = [];
  const mdImgs = md.matchAll(/!\[[^\]]*]\(([^)]+)\)/g);
  for (const m of mdImgs) refs.push(m[1]);
  const figures = md.matchAll(/::figure\{[^}]*src="([^"]+)"/g);
  for (const m of figures) refs.push(m[1]);
  return refs;
}

function onDiskImage(src: string): { exists: boolean; size: number } {
  if (!src.startsWith("/")) return { exists: false, size: 0 };
  const file = path.join(PUBLIC, src.replace(/^\//, "").replaceAll("/", path.sep));
  try {
    const st = fs.statSync(file);
    return { exists: st.isFile(), size: st.size };
  } catch {
    return { exists: false, size: 0 };
  }
}

test("大二上四科都暴露完整板块列表（含 stub）", () => {
  for (const id of SOPHOMORE) {
    const subject = contentTree.subjects.find((s) => s.id === id);
    assert.ok(subject, `missing subject ${id}`);
    const catIds = subject!.categories.map((c) => c.id);
    assert.deepEqual(catIds, BLOCKS, `${id} 板块顺序`);
    for (const cat of subject!.categories) {
      assert.ok(cat.items.length > 0, `${id}/${cat.id} 至少一个 item`);
    }
  }
});

test("教材树：每个教材叶子能被 shipped loader 读到，且不是短摘要", () => {
  for (const id of SOPHOMORE) {
    const cat = getCategory(id, "textbook");
    assert.ok(cat, `${id} textbook category`);
    const leaves = walkLeaves(cat!.items).filter((item) => item.status !== "stub");
    assert.ok(leaves.length > 1, `${id} 应有多个教材叶子，实际 ${leaves.length}`);
    let withFigure = 0;
    for (const item of leaves) {
      const md = readContentMarkdown(id, "textbook", item.id);
      assert.ok(md && md.trim(), `${id}/textbook/${item.id} loader 应返回非空`);
      assert.ok(item.title && item.title.length >= 2, `${id}/${item.id} 标题是书中章/节名`);
      const chinese = (md!.match(/[\u4e00-\u9fff]/g) || []).length;
      if (item.id !== "toc") {
        assert.ok(
          chinese >= MIN_PROSE || md!.length >= MIN_PROSE,
          `${id}/textbook/${item.id} 过短，疑似摘要而非全文 chinese=${chinese} len=${md!.length}`,
        );
        assert.ok(/^#\s+/m.test(md!), `${id}/textbook/${item.id} 应有标题`);
      }
      const refs = imageRefs(md!);
      for (const src of refs) {
        if (!src.startsWith("/images/")) continue;
        const disk = onDiskImage(src);
        assert.ok(disk.exists && disk.size > 0, `缺图 ${id}/${item.id} ${src}`);
      }
      if (refs.some((src) => src.startsWith("/images/"))) withFigure += 1;
    }
    assert.ok(withFigure > 0, `${id} 至少若干章应含真实图片引用`);
  }
});

const FIGURE_CAPTION = /图\s*\d+\s*[-－—]\s*\d+/;

test("教材标题不含 NUL", () => {
  for (const id of SOPHOMORE) {
    const cat = getCategory(id, "textbook");
    function walk(items: ContentItem[]) {
      for (const item of items) {
        assert.equal(item.title.includes("\0"), false, `${id} title NUL: ${JSON.stringify(item.title)}`);
        if (item.summary) {
          assert.equal(item.summary.includes("\0"), false, `${id} summary NUL: ${JSON.stringify(item.summary)}`);
        }
        if (item.children) walk(item.children);
      }
    }
    walk(cat!.items);
  }
});

test("有图题的教材叶子必须嵌入真实图片", () => {
  for (const id of SOPHOMORE) {
    const cat = getCategory(id, "textbook");
    const leaves = walkLeaves(cat!.items).filter((item) => item.status === "done" && item.id !== "toc");
    for (const item of leaves) {
      const md = readContentMarkdown(id, "textbook", item.id) ?? "";
      if (!FIGURE_CAPTION.test(md)) continue;
      const refs = imageRefs(md).filter((src) => src.startsWith("/images/"));
      assert.ok(
        refs.length > 0,
        `${id}/textbook/${item.id} 有图题但没有任何 ![] / ::figure 图片引用`,
      );
      for (const src of refs) {
        const disk = onDiskImage(src);
        assert.ok(disk.exists && disk.size > 0, `缺图 ${id}/${item.id} ${src}`);
      }
    }
  }
});

test("解剖/组胚/细胞/生化：带插图的章不能把图丢掉", () => {
  const mustHaveFigures = ["anatomy", "histology", "cell-biology", "biochemistry", "instrumental-analysis"] as const;
  for (const id of mustHaveFigures) {
    const cat = getCategory(id, "textbook");
    const leaves = walkLeaves(cat!.items).filter((item) => item.status === "done" && item.id !== "toc");
    const figured = leaves.filter((item) => {
      const md = readContentMarkdown(id, "textbook", item.id) ?? "";
      return imageRefs(md).some((src) => src.startsWith("/images/"));
    });
    assert.ok(
      figured.length >= Math.max(3, Math.floor(leaves.length * 0.3)),
      `${id} 插图章节过少 figured=${figured.length} leaves=${leaves.length}`,
    );
  }
});
