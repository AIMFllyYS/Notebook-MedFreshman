import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import type { LanguageModelV4StreamPart, LanguageModelV4StreamResult } from "@ai-sdk/provider";
import { MockLanguageModelV4, convertArrayToReadableStream, convertReadableStreamToArray } from "ai/test";
import { createStudyAgent, type StudyAgentInput } from "@/lib/ai/agent/studyAgent.ts";
import {
  AGENT_LOG_FILENAME,
  SLOW_TOOL_MS,
  appendAgentLog,
  collectEnvSecrets,
  createAgentLifecycleHooks,
  redactSecrets,
  resolveAgentLogPath,
  toJsonSafe,
} from "./agentLog.ts";

const usage = {
  inputTokens: { total: 10, noCache: 7, cacheRead: 3, cacheWrite: 0 },
  outputTokens: { total: 5, text: 5, reasoning: 0 },
};

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

function toolCallStep(toolName: string, input: Record<string, unknown>): LanguageModelV4StreamResult {
  return {
    stream: convertArrayToReadableStream<LanguageModelV4StreamPart>([
      { type: "stream-start", warnings: [] },
      { type: "reasoning-start", id: "r1" },
      { type: "reasoning-delta", id: "r1", delta: "先看当前页" },
      { type: "reasoning-end", id: "r1" },
      { type: "tool-call", toolCallId: `call_${toolName}`, toolName, input: JSON.stringify(input) },
      { type: "finish", finishReason: { unified: "tool-calls", raw: "tool_calls" }, usage },
    ]),
  };
}

type TimedRecord = { hook: string; data: Record<string, unknown> };

function collectHooks(now?: () => number) {
  const records: TimedRecord[] = [];
  const hooks = createAgentLifecycleHooks({
    now,
    write: (hook, data) => {
      records.push({ hook, data: (data ?? {}) as Record<string, unknown> });
    },
  });
  return { hooks, records };
}

function baseInput(model: MockLanguageModelV4): StudyAgentInput {
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
  };
}

test("resolveAgentLogPath：服务端走仓库 log/，Electron 走 userData/logs", () => {
  assert.equal(
    resolveAgentLogPath({} as NodeJS.ProcessEnv, path.join("D:", "repo")),
    path.join("D:", "repo", "log", AGENT_LOG_FILENAME),
  );
  assert.equal(
    resolveAgentLogPath({ ELECTRON_USER_DATA: "D:\\AppData\\Gailvlun" } as NodeJS.ProcessEnv, path.join("D:", "repo")),
    path.join("D:\\AppData\\Gailvlun", "logs", AGENT_LOG_FILENAME),
  );
  assert.equal(
    resolveAgentLogPath({ AGENT_LOG_PATH: "E:\\tmp\\custom.jsonl", ELECTRON_USER_DATA: "D:\\ud" } as NodeJS.ProcessEnv),
    "E:\\tmp\\custom.jsonl",
  );
});

test("redactSecrets：字段名、Bearer、sk- 与环境变量密钥都不会留下原文", () => {
  const prev = process.env.AI_API_KEY;
  process.env.AI_API_KEY = "env-secret-key-value-xyz";
  try {
    assert.ok(collectEnvSecrets().includes("env-secret-key-value-xyz"));
    const redacted = redactSecrets({
      apiKey: "sk-plain-secret-key",
      Authorization: "Bearer header-secret-token",
      headers: { authorization: "Bearer another-secret", "x-api-key": "header-key-value" },
      text: "call env-secret-key-value-xyz and sk-abcdefghi123 and Bearer leaked-token",
      url: "https://api.example/v1?api_key=query-secret",
      usage: { inputTokens: 12 },
    });
    const raw = JSON.stringify(redacted);
    assert.doesNotMatch(raw, /sk-plain-secret-key|header-secret-token|another-secret|header-key-value|env-secret-key-value-xyz|sk-abcdefghi123|leaked-token|query-secret/);
    assert.match(raw, /\[REDACTED\]/);
    assert.match(raw, /"inputTokens":12/);
  } finally {
    if (prev === undefined) delete process.env.AI_API_KEY;
    else process.env.AI_API_KEY = prev;
  }
});

test("appendAgentLog：写出可 JSON.parse 的 JSONL，且不含 API key", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "agent-log-"));
  const file = path.join(dir, "out.jsonl");
  try {
    appendAgentLog("onStepStart", { stepNumber: 0, apiKey: "sk-must-not-land", headers: { Authorization: "Bearer must-not-land" } }, file);
    appendAgentLog("onToolExecutionEnd", { toolCall: { toolName: "getCurrentPage" } }, file);
    const lines = readFileSync(file, "utf8").trim().split("\n");
    assert.equal(lines.length, 2);
    const parsed = lines.map((line) => JSON.parse(line) as { hook: string; data: { stepNumber?: number } });
    assert.equal(parsed[0].hook, "onStepStart");
    assert.equal(parsed[0].data.stepNumber, 0);
    assert.equal(parsed[1].hook, "onToolExecutionEnd");
    const joined = lines.join("\n");
    assert.doesNotMatch(joined, /sk-must-not-land|must-not-land|Bearer (?!\[REDACTED\])/);
    assert.ok(!joined.includes("sk-must-not-land"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("toJsonSafe：丢掉函数、打断循环引用，Error 保留 name/message", () => {
  const cycle: { self?: unknown; fn: () => void } = { fn: () => undefined };
  cycle.self = cycle;
  const safe = toJsonSafe({ cycle, err: new Error("boom"), fn: () => 1 }) as {
    cycle: { self: string };
    err: { name: string; message: string };
  };
  assert.equal(safe.cycle.self, "[Circular]");
  assert.equal(safe.err.name, "Error");
  assert.equal(safe.err.message, "boom");
  assert.equal("fn" in safe, false);
});

test("createAgentLifecycleHooks：挂上 step / tool / telemetry LM 钩子", () => {
  const hooksSeen: string[] = [];
  const hooks = createAgentLifecycleHooks({ write: (hook) => hooksSeen.push(hook) });
  hooks.onStepStart({ stepNumber: 0 });
  hooks.onStepEnd({ stepNumber: 0 });
  hooks.onToolExecutionStart({ toolCall: { toolName: "webSearch" } });
  hooks.onToolExecutionEnd({ toolCall: { toolName: "webSearch" } });
  const integration = hooks.telemetry.integrations;
  const first = Array.isArray(integration) ? integration[0] : integration;
  first?.onLanguageModelCallStart?.({ callId: "c1" } as never);
  first?.onLanguageModelCallEnd?.({ callId: "c1" } as never);
  assert.deepEqual(hooksSeen, [
    "onStepStart",
    "onStepEnd",
    "onToolExecutionStart",
    "onToolExecutionEnd",
    "onLanguageModelCallStart",
    "onLanguageModelCallEnd",
  ]);
  assert.equal(hooks.telemetry.isEnabled, true);
  assert.equal(hooks.telemetry.functionId, "study-tutor");
});

test("createStudyAgent：一次工具循环在 JSONL 里能还原 LLM 步与工具执行", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "agent-log-"));
  const file = path.join(dir, AGENT_LOG_FILENAME);
  const prev = process.env.AGENT_LOG_PATH;
  process.env.AGENT_LOG_PATH = file;
  try {
    const model = new MockLanguageModelV4({
      doStream: [toolCallStep("getCurrentPage", {}), textStep("最终回答")],
    });
    const { agent } = createStudyAgent(baseInput(model));
    const result = await agent.stream({ messages: [{ role: "user", content: "这一节讲了什么" }] });
    await convertReadableStreamToArray(result.toUIMessageStream());
    await result.steps;

    const lines = readFileSync(file, "utf8").trim().split("\n");
    assert.ok(lines.length >= 4, `expected several JSONL lines, got ${lines.length}`);
    const records = lines.map((line) => JSON.parse(line) as { hook: string; data: unknown });
    const hookSet = new Set(records.map((r) => r.hook));
    assert.ok(hookSet.has("onStepStart"), "missing onStepStart");
    assert.ok(hookSet.has("onStepEnd"), "missing onStepEnd");
    assert.ok(hookSet.has("onToolExecutionStart"), "missing onToolExecutionStart");
    assert.ok(hookSet.has("onToolExecutionEnd"), "missing onToolExecutionEnd");
    assert.ok(
      hookSet.has("onLanguageModelCallStart") && hookSet.has("onLanguageModelCallEnd"),
      `missing LM hooks: ${[...hookSet].join(",")}`,
    );
    const raw = lines.join("\n");
    assert.doesNotMatch(raw, /sk-[a-zA-Z0-9_-]{8,}/);
    for (const secret of collectEnvSecrets()) {
      assert.ok(!raw.includes(secret), "env api key leaked");
    }
    const llm = records.filter((r) => r.hook === "onLanguageModelCallEnd");
    assert.ok(llm.length >= 1);
    for (const row of llm) {
      const data = row.data as { event?: string; durationMs?: number };
      assert.equal(data.event, "llm");
      assert.equal(typeof data.durationMs, "number");
    }
    const tools = records.filter((r) => r.hook === "onToolExecutionEnd");
    assert.ok(tools.length >= 1);
    for (const row of tools) {
      const data = row.data as { event?: string; durationMs?: number; toolName?: string; slow?: boolean };
      assert.equal(data.event, "tool");
      assert.equal(typeof data.durationMs, "number");
      assert.equal(typeof data.toolName, "string");
      assert.equal(typeof data.slow, "boolean");
    }
    const thinking = records.filter((r) => r.hook === "thinking");
    assert.ok(thinking.length >= 1, "missing thinking segment");
    for (const row of thinking) {
      const data = row.data as { event?: string; durationMs?: number };
      assert.equal(data.event, "thinking");
      assert.equal(typeof data.durationMs, "number");
    }
  } finally {
    if (prev === undefined) delete process.env.AGENT_LOG_PATH;
    else process.env.AGENT_LOG_PATH = prev;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("分段计时：LLM / 工具 / thinking 各自写入独立 durationMs", async () => {
  let t = 1_000;
  const { hooks, records } = collectHooks(() => t);
  const integration = hooks.telemetry.integrations;
  const lm = Array.isArray(integration) ? integration[0] : integration;

  lm?.onLanguageModelCallStart?.({ callId: "c1" } as never);
  t = 1_180;
  lm?.onLanguageModelCallEnd?.({
    callId: "c1",
    performance: { responseTimeMs: 175 },
    usage: { outputTokens: { total: 10, text: 4, reasoning: 6 } },
    content: [{ type: "reasoning", text: "先想一步" }],
  } as never);

  hooks.onToolExecutionStart({ toolCall: { toolName: "webSearch", toolCallId: "call_fast" } });
  t = 1_190;
  hooks.onToolExecutionEnd({
    toolCall: { toolName: "webSearch", toolCallId: "call_fast" },
    toolExecutionMs: 12,
  });

  const llm = records.find((r) => r.hook === "onLanguageModelCallEnd");
  assert.equal(llm?.data.event, "llm");
  assert.equal(llm?.data.durationMs, 175);
  assert.equal(llm?.data.responseTimeMs, 175);

  const tool = records.find((r) => r.hook === "onToolExecutionEnd");
  assert.equal(tool?.data.event, "tool");
  assert.equal(tool?.data.toolName, "webSearch");
  assert.equal(tool?.data.durationMs, 12);
  assert.equal(tool?.data.slow, false);

  const thinking = records.find((r) => r.hook === "thinking");
  assert.equal(thinking?.data.event, "thinking");
  assert.equal(thinking?.data.durationMs, 105);
  assert.equal(thinking?.data.source, "usage");
  assert.equal(thinking?.data.callId, "c1");

  let clock = 0;
  const streamedHooks = collectHooks(() => {
    clock += 1;
    return clock;
  });
  const wrapped = await streamedHooks.hooks.modelMiddleware.wrapStream?.({
    doStream: async () => ({
      stream: convertArrayToReadableStream<LanguageModelV4StreamPart>([
        { type: "reasoning-start", id: "r-stream" },
        { type: "reasoning-delta", id: "r-stream", delta: "hmm" },
        { type: "reasoning-end", id: "r-stream" },
      ]),
    }),
    doGenerate: async () => {
      throw new Error("unused");
    },
    params: {} as never,
    model: {} as never,
  });
  assert.ok(wrapped?.stream);
  await convertReadableStreamToArray(wrapped.stream);
  const streamed = streamedHooks.records.filter((r) => r.hook === "thinking" && r.data.source === "reasoning-stream");
  assert.equal(streamed.length, 1);
  assert.equal(streamed[0].data.event, "thinking");
  assert.equal(typeof streamed[0].data.durationMs, "number");
  assert.ok(Number(streamed[0].data.durationMs) >= 1);
  assert.equal(streamed[0].data.reasoningId, "r-stream");
});

test("慢工具：event=tool + toolName + durationMs + slow 可直接筛出", () => {
  const { hooks, records } = collectHooks();
  hooks.onToolExecutionEnd({
    toolCall: { toolName: "webSearch", toolCallId: "call_slow" },
    toolExecutionMs: SLOW_TOOL_MS + 3_200,
  });
  hooks.onToolExecutionEnd({
    toolCall: { toolName: "getCurrentPage", toolCallId: "call_fast" },
    toolExecutionMs: 8,
  });

  const slow = records.filter((r) => r.hook === "onToolExecutionEnd" && r.data.slow === true);
  assert.equal(slow.length, 1);
  assert.equal(slow[0].data.event, "tool");
  assert.equal(slow[0].data.toolName, "webSearch");
  assert.equal(slow[0].data.durationMs, SLOW_TOOL_MS + 3_200);

  const fast = records.find((r) => r.data.toolName === "getCurrentPage");
  assert.equal(fast?.data.slow, false);
  assert.ok(
    records.some((r) => r.data.event === "tool" && r.data.toolName === "webSearch" && Number(r.data.durationMs) >= SLOW_TOOL_MS),
  );
});
