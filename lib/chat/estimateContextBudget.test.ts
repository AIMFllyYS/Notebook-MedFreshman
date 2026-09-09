import assert from "node:assert/strict";
import { test } from "node:test";
import { estimateContextBudget } from "./estimateContextBudget.ts";
import type { ChatMessage } from "@/lib/types/chat";

const msg = (text: string): ChatMessage => ({
  id: "m",
  role: "user",
  timestamp: 1,
  parts: [{ type: "text", text }],
});

test("estimateContextBudget：优先用会话已锁定的预算与服务端 token", () => {
  const budget = estimateContextBudget(
    { sessionContextBudgetTokens: 10_000, serverContextTokens: 7_900 },
    { contextK: 128 },
    [msg("hello")],
    "追问",
  );
  assert.equal(budget.limit, 10_000);
  assert.ok(budget.estimated > 7_900);
  assert.equal(budget.softLimitReached, budget.estimated / 10_000 >= 0.8);
});

test("estimateContextBudget：无服务端累计时用消息估算 + 3000，软上限 80%", () => {
  const under = estimateContextBudget(
    { sessionContextBudgetTokens: 0, serverContextTokens: 0 },
    { contextK: 8 },
    [msg("短")],
    "短",
  );
  assert.equal(under.limit, 8000);
  assert.equal(under.softLimitReached, false);

  const over = estimateContextBudget(
    { sessionContextBudgetTokens: 0, serverContextTokens: 0 },
    { contextK: 1 },
    [msg("x".repeat(4000))],
    "x".repeat(4000),
  );
  assert.equal(over.limit, 1000);
  assert.equal(over.softLimitReached, true);
});

test("estimateContextBudget：缺模型时默认 128k", () => {
  const budget = estimateContextBudget(
    { sessionContextBudgetTokens: 0, serverContextTokens: 0 },
    undefined,
    [],
    "hi",
  );
  assert.equal(budget.limit, 128_000);
});
