import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createGetSectionTool } from "@/lib/ai/agent/tools/getSection/tool";
import { createToolRuntime, type StudyToolContext } from "@/lib/ai/agent/tools/_shared";
import { contentIo } from "@/lib/content/contentPathGuard";
import type { GetSectionOutput } from "@/lib/ai/agent/tools/getSection/types";

const ctx: StudyToolContext = {
  subjectId: "probability",
  categoryId: "detail",
  itemId: "1.1",
  skills: [],
  academicYear: "freshman-2",
};

function exec(
  input: { path?: string; sectionId?: string },
  runtime = createToolRuntime(),
): Promise<GetSectionOutput> {
  const tool = createGetSectionTool(ctx, runtime);
  return tool.execute!(input, {
    toolCallId: "t1",
    messages: [],
    abortSignal: new AbortController().signal,
    context: {},
  }) as Promise<GetSectionOutput>;
}

describe("getSection execute", { concurrency: false }, () => {
  test("内容树之外拒绝且不读盘", async (t) => {
    const spy = t.mock.method(contentIo, "readFileSync", () => {
      throw new Error("should not read disk");
    });
    const result = await exec({ path: "not-a-subject/detail/1.1" });
    assert.equal(result.found, false);
    assert.match(result.text, /路径无效/);
    assert.equal(spy.mock.callCount(), 0);
  });

  test("包含 .. 的路径拒绝且不读盘", async (t) => {
    const spy = t.mock.method(contentIo, "readFileSync", () => {
      throw new Error("should not read disk");
    });
    const viaPath = await exec({ path: "probability/detail/../1.1" });
    const viaDots = await exec({ path: "../../../etc/passwd" });
    const viaSection = await exec({ sectionId: ".." });
    assert.equal(viaPath.found, false);
    assert.equal(viaDots.found, false);
    assert.equal(viaSection.found, false);
    assert.equal(spy.mock.callCount(), 0);
  });

  test("合法 path / sectionId 仍可读（mock 正文，不碰 content/**）", async (t) => {
    const spy = t.mock.method(contentIo, "readFileSync", () => "# fixture section");
    const viaPath = await exec({ path: "probability/detail/1.1" });
    assert.equal(viaPath.found, true);
    assert.match(viaPath.text, /# fixture section/);
    assert.match(viaPath.text, /随机试验与样本空间/);

    const viaSection = await exec({ sectionId: "1.1" }, createToolRuntime());
    assert.equal(viaSection.found, true);
    assert.match(viaSection.text, /# fixture section/);
    assert.ok(spy.mock.callCount() >= 2);
  });
});
