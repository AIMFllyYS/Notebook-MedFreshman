import assert from "node:assert/strict";
import { test } from "node:test";
import { createGenerateImageTool } from "./tool.ts";
import type { GenerateImageOutput } from "./types.ts";
import type { StudyToolContext } from "@/lib/ai/agent/tools/_shared";

const ctx: StudyToolContext = {
  subjectId: "chemistry",
  categoryId: "detail",
  itemId: "1.1",
  skills: [],
  academicYear: "freshman-2",
  modelId: "Tongyi-MAI/Z-Image-Turbo",
};

const execOpts = {
  toolCallId: "img1",
  messages: [] as never[],
  abortSignal: new AbortController().signal,
  context: {},
};

test("generateImage：默认尺寸与 count 夹紧到 1–4", async () => {
  const tool = createGenerateImageTool(ctx);
  const def = (await tool.execute!({ prompt: "a cell", title: "细胞" }, execOpts)) as GenerateImageOutput;
  assert.equal(def.imageGenId, "img_img1");
  assert.equal(def.size, "1024x1024");
  assert.equal(def.count, 1);
  assert.equal(def.modelId, "Tongyi-MAI/Z-Image-Turbo");

  const high = (await tool.execute!(
    { prompt: "a cell", title: "细胞", count: 99 },
    execOpts,
  )) as GenerateImageOutput;
  assert.equal(high.count, 4);

  const low = (await tool.execute!(
    { prompt: "a cell", title: "细胞", count: 0 },
    execOpts,
  )) as GenerateImageOutput;
  assert.equal(low.count, 1);
});
