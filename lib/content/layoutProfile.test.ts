import assert from "node:assert/strict";
import { test } from "node:test";
import {
  STANDARD_CATEGORIES,
  category,
} from "@/lib/content-data/category-templates";
import { layoutFlags, resolveLayoutProfile } from "@/lib/content/layoutProfile";
import { resolveRouteLayout } from "@/lib/content/routeLayout";
import type { LayoutProfile } from "@/lib/types/content";

const EXPECTED_TEMPLATE_PROFILE: Record<keyof typeof STANDARD_CATEGORIES, LayoutProfile> = {
  textbook: "full",
  detail: "full",
  recording: "full",
  summary: "article",
  "kaoqian-moni": "reference",
  "shizhan-yanlian": "reference",
};

test("六个标准板块模板：推导结果与显式标注一致", () => {
  for (const id of Object.keys(STANDARD_CATEGORIES) as (keyof typeof STANDARD_CATEGORIES)[]) {
    const cat = category(id, []);
    assert.equal(resolveLayoutProfile(cat), EXPECTED_TEMPLATE_PROFILE[id], id);
  }
  assert.equal(category("summary", []).layoutProfile, "article");
  assert.equal(category("kaoqian-moni", []).layoutProfile, "reference");
  assert.equal(category("shizhan-yanlian", []).layoutProfile, "reference");
  assert.equal(category("detail", []).layoutProfile, undefined);
  assert.equal(category("textbook", []).layoutProfile, undefined);
  assert.equal(category("recording", []).layoutProfile, undefined);
});

test("item.layoutProfile 覆盖 category", () => {
  const cat = category("detail", []);
  assert.equal(resolveLayoutProfile(cat, { type: "section", layoutProfile: "article" }), "article");
  assert.equal(
    resolveLayoutProfile(
      { capabilities: [], layoutProfile: "reference" },
      { type: "document", layoutProfile: "full" },
    ),
    "full",
  );
});

test("document 类型在无 examples/quiz/media 时默认 article", () => {
  assert.equal(resolveLayoutProfile({ capabilities: ["search"] }, { type: "document" }), "article");
  assert.equal(resolveLayoutProfile({ capabilities: [] }, { type: "document" }), "article");
  assert.equal(resolveLayoutProfile({ capabilities: [] }), "reference");
  assert.equal(
    resolveLayoutProfile({ capabilities: ["examples", "quiz"] }, { type: "document" }),
    "full",
  );
});

test("layoutFlags：full / article / reference 的区块开关", () => {
  const detail = category("detail", []);
  const summary = category("summary", []);
  const exam = category("kaoqian-moni", []);

  const full = layoutFlags("full", detail, { type: "section", renderType: "markdown" });
  assert.equal(full.showExamplesTab, true);
  assert.equal(full.showQuizTab, true);
  assert.equal(full.showToc, true);
  assert.deepEqual(full.rightTabs, ["ai", "video", "interactive", "browser"]);
  assert.equal(full.defaultRightCollapsed, false);
  assert.equal(full.articleMaxWidth, "prose");

  const textbook = layoutFlags("full", category("textbook", []), { type: "document" });
  assert.deepEqual(textbook.rightTabs, ["ai", "browser"], "无 media 时不出现动画/可交互");

  const article = layoutFlags("article", summary, { type: "document", renderType: "markdown" });
  assert.equal(article.showExamplesTab, false);
  assert.equal(article.showQuizTab, false);
  assert.deepEqual(article.rightTabs, ["ai"]);
  assert.equal(article.defaultRightCollapsed, true);
  assert.equal(article.articleMaxWidth, "wide");

  const reference = layoutFlags("reference", exam, { type: "document" });
  assert.deepEqual(reference.rightTabs, ["ai"]);
  assert.equal(reference.defaultRightCollapsed, false);
  assert.equal(reference.showToc, true);

  const html = layoutFlags("article", summary, { type: "document", renderType: "html" });
  assert.equal(html.showToc, false);
});

test("resolveRouteLayout：试卷页只有 AI 对话", () => {
  const exam = resolveRouteLayout("/histology/shizhan-yanlian/real-04");
  assert.equal(exam.profile, "reference");
  assert.equal(exam.showRightPanel, true);
  assert.deepEqual(exam.rightTabs, ["ai"]);
  assert.equal(resolveRouteLayout("/").profile, "full");
});
