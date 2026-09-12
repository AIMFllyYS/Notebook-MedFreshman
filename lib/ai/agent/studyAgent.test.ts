import assert from "node:assert/strict";
import { test } from "node:test";
import type { LanguageModelV4StreamPart, LanguageModelV4StreamResult } from "@ai-sdk/provider";
import { MockLanguageModelV4, convertArrayToReadableStream, convertReadableStreamToArray } from "ai/test";
import { createStudyAgent, type StudyAgentInput } from "./studyAgent.ts";
import { MAX_TOOL_STEPS } from "./tools/_shared.ts";

const usage = {
  inputTokens: { total: 10, noCache: 7, cacheRead: 3, cacheWrite: 0 },
  outputTokens: { total: 5, text: 5, reasoning: 0 },
};

function toolCallStep(
  toolName: string,
  input: Record<string, unknown>,
  callId = `call_${toolName}`,
): LanguageModelV4StreamResult {
  return {
    stream: convertArrayToReadableStream<LanguageModelV4StreamPart>([
      { type: "stream-start", warnings: [] },
      { type: "reasoning-start", id: "r1" },
      { type: "reasoning-delta", id: "r1", delta: "先看看当前页面" },
      { type: "reasoning-end", id: "r1" },
      { type: "tool-call", toolCallId: callId, toolName, input: JSON.stringify(input) },
      { type: "finish", finishReason: { unified: "tool-calls", raw: "tool_calls" }, usage },
    ]),
  };
}

function textStep(text: string): LanguageModelV4StreamResult {
  return {
    stream: convertArrayToReadableStream<LanguageModelV4StreamPart>([
      { type: "stream-start", warnings: [] },
      { type: "text-start", id: "t1" },
      { type: "text-delta", id: "t1", delta: text },
      { type: "text-end", id: "t1" },
      { type: "finish", finishReason: { unified: "stop", raw: "stop" }, usage },
    ]),
  };
}

function baseInput(model: MockLanguageModelV4, over: Partial<StudyAgentInput> = {}): StudyAgentInput {
  return {
    model,
    chatCtx: { subjectId: "probability", categoryId: "detail", itemId: "1.4", currentTopic: "", academicYear: "freshman-2" },
    options: { enableSearch: false, enableThinking: false, contextMode: "full" },
    disabledTools: [],
    skills: [],
    globalContext: "",
    referenceContext: "",
    contextTruncated: false,
    isImageMode: false,
    selectedModelId: "mimo-v2.5",
    modelSupportsTools: true,
    thinking: {},
    ...over,
  };
}

test("createStudyAgent：工具循环 → UI 流包含 reasoning / tool-input / tool-output / text，且 usage 跨步累加", async () => {
  const model = new MockLanguageModelV4({
    doStream: [toolCallStep("getCurrentPage", {}), textStep("最终回答")],
  });
  const { agent } = createStudyAgent(baseInput(model));
  const result = await agent.stream({ messages: [{ role: "user", content: "这一节讲了什么" }] });
  const chunks = await convertReadableStreamToArray(result.toUIMessageStream({ sendReasoning: true }));
  const types = chunks.map((c) => c.type);

  assert.ok(types.includes("reasoning-delta"));
  const inputChunk = chunks.find((c) => c.type === "tool-input-available") as { toolName: string } | undefined;
  assert.equal(inputChunk?.toolName, "getCurrentPage");
  const outputChunk = chunks.find((c) => c.type === "tool-output-available") as { output: { text: string; contextKey: string } } | undefined;
  assert.ok(outputChunk, "应有工具输出");
  assert.match(outputChunk!.output.text, /^【/);
  assert.equal(outputChunk!.output.contextKey, "page:probability/detail/1.4");
  assert.ok(chunks.some((c) => c.type === "text-delta" && (c as { delta: string }).delta === "最终回答"));

  const steps = await result.steps;
  assert.equal(steps.length, 2);
  const total = await result.totalUsage;
  assert.equal(total.inputTokens, 20);
  assert.equal(total.outputTokens, 10);
  assert.equal(total.inputTokenDetails.cacheReadTokens, 6);

  // 第二步发给模型的 tool result 只含 text（toModelOutput），不含 contextKey 等展示字段
  const secondPrompt = model.doStreamCalls[1].prompt;
  const toolMsg = secondPrompt.find((m) => m.role === "tool");
  assert.ok(toolMsg);
  const toolPart = (toolMsg!.content as Array<{ type: string; output?: { type: string; value: unknown } }>)[0];
  assert.equal(toolPart.output?.type, "text");
  assert.match(String(toolPart.output?.value), /^【/);
});

test("createStudyAgent：同一 contextKey 二次加载只回「已加载」提示", async () => {
  const model = new MockLanguageModelV4({
    doStream: [toolCallStep("getCurrentPage", {}), toolCallStep("getCurrentPage", {}), textStep("ok")],
  });
  const { agent } = createStudyAgent(baseInput(model));
  const result = await agent.stream({ messages: [{ role: "user", content: "q" }] });
  const chunks = await convertReadableStreamToArray(result.toUIMessageStream());
  const outputs = chunks.filter((c) => c.type === "tool-output-available") as Array<{ output: { text: string; deduped?: boolean } }>;
  assert.equal(outputs.length, 2);
  assert.equal(outputs[0].output.deduped, undefined);
  assert.equal(outputs[1].output.deduped, true);
  assert.match(outputs[1].output.text, /上下文已加载/);
});

test("createStudyAgent：生图模式首步强制 generateImage，之后关闭工具", async () => {
  const model = new MockLanguageModelV4({
    doStream: [toolCallStep("generateImage", { prompt: "a cat", title: "猫" }), textStep("说明")],
  });
  const { agent, promptParts } = createStudyAgent(baseInput(model, { isImageMode: true, selectedModelId: "Tongyi-MAI/Z-Image-Turbo" }));
  assert.match(promptParts.instructions, /生图模式硬性规则/);

  const result = await agent.stream({ messages: [{ role: "user", content: "画一只猫" }] });
  const chunks = await convertReadableStreamToArray(result.toUIMessageStream());

  const first = model.doStreamCalls[0];
  assert.deepEqual(first.toolChoice, { type: "tool", toolName: "generateImage" });
  assert.deepEqual(first.tools?.map((t) => t.name), ["generateImage"]);
  const second = model.doStreamCalls[1];
  assert.equal(second.tools?.length ?? 0, 0);

  const out = chunks.find((c) => c.type === "tool-output-available") as { toolCallId: string; output: { imageGenId: string; modelId?: string; count: number } };
  assert.equal(out.output.imageGenId, `img_${out.toolCallId}`);
  assert.equal(out.output.modelId, "Tongyi-MAI/Z-Image-Turbo");
  assert.equal(out.output.count, 1);
});

test("createStudyAgent：技能菜单进入 instructions 且 useSkill 以 enum 暴露；enableSearch 控制联网工具", () => {
  const model = new MockLanguageModelV4();
  const skills = [
    { id: "s1", name: "错题分析", description: "分析错因", content: "...", pinned: false, createdAt: 1 },
    { id: "s2", name: "固定技能", description: "", content: "始终遵循", pinned: true, createdAt: 2 },
  ];
  const off = createStudyAgent(baseInput(model, { skills }));
  assert.match(off.promptParts.instructions, /可调用的技能库[\s\S]*错题分析/);
  assert.match(off.promptParts.instructions, /已固定启用的技能[\s\S]*始终遵循/);
  assert.ok("useSkill" in off.tools);
  assert.ok(!("webSearch" in off.tools));

  const on = createStudyAgent(baseInput(model, { options: { enableSearch: true }, disabledTools: ["drawDiagram"] }));
  assert.ok("webSearch" in on.tools && "imageSearch" in on.tools);
  assert.ok(!("drawDiagram" in on.tools));
  assert.ok(!("useSkill" in on.tools));
});

test("createStudyAgent：模型不支持工具时 tools 为空；软上限时仍保留分级参考材料", () => {
  const model = new MockLanguageModelV4();
  const noTools = createStudyAgent(baseInput(model, { modelSupportsTools: false, referenceContext: "参考材料正文" }));
  assert.equal(Object.keys(noTools.tools).length, 0);
  assert.match(noTools.promptParts.instructions, /【参考材料】\n参考材料正文/);
  assert.doesNotMatch(noTools.promptParts.instructions, /用户提问：/);

  const truncated = createStudyAgent(baseInput(model, { referenceContext: "参考材料正文", contextTruncated: true }));
  assert.match(truncated.promptParts.instructions, /参考材料正文/);
  assert.match(truncated.promptParts.instructions, /80% 软上限/);
  assert.match(truncated.promptParts.instructions, /分级裁剪/);
  assert.ok("getArtifact" in createStudyAgent(baseInput(model)).tools);
});

test("createStudyAgent：定位行在 instructions 末尾，换页不改稳定前缀", () => {
  const model = new MockLanguageModelV4();
  const a = createStudyAgent(baseInput(model, {
    chatCtx: { subjectId: "probability", categoryId: "detail", itemId: "1.4", currentTopic: "古典概型", academicYear: "freshman-2" },
  }));
  const b = createStudyAgent(baseInput(model, {
    chatCtx: { subjectId: "probability", categoryId: "detail", itemId: "1.5", currentTopic: "几何概型", academicYear: "freshman-2" },
  }));
  const ia = a.promptParts.instructions;
  const ib = b.promptParts.instructions;
  const locA = ia.indexOf("【当前位置】");
  const locB = ib.indexOf("【当前位置】");
  assert.ok(locA > 80 && locB > 80);
  assert.equal(ia.slice(0, locA), ib.slice(0, locB));
  assert.match(ia, /学年：大一下学期/);
  assert.match(ia, /1\.4/);
  assert.match(ib, /1\.5/);
});

test("createStudyAgent：第 6 步仍 tool-calls 时不再发起第 7 次 LLM", async () => {
  const model = new MockLanguageModelV4({
    doStream: Array.from({ length: MAX_TOOL_STEPS }, (_, i) =>
      toolCallStep("getCurrentPage", {}, `call_page_${i}`),
    ),
  });
  const { agent } = createStudyAgent(baseInput(model));
  const result = await agent.stream({ messages: [{ role: "user", content: "q" }] });
  await convertReadableStreamToArray(result.toUIMessageStream());
  assert.equal(model.doStreamCalls.length, MAX_TOOL_STEPS);
  assert.equal(await result.finishReason, "tool-calls");
  assert.equal((await result.steps).length, MAX_TOOL_STEPS);
});
