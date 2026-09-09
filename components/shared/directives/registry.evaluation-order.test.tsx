import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * 钉死 QuizMarkdown ↔ registry ↔ MemoryCard 环的两种失败形态：
 * 1. TDZ：先求值 registry 时 QuizMarkdown 顶层展开抛
 *    `Cannot access 'directiveComponents' before initialization`
 * 2. 静默空映射：打包器把 ESM 降成 CJS getter 时 `{...undefined}` 合法，
 *    block/inline 丢掉全部指令键，控制台干净。
 *
 * 每个用例必须 `vi.resetModules()` + 动态 `import()`。同一模块图里换顺序测不出东西。
 */

const DIRECTIVE_KEYS = [
  "callout",
  "derivation",
  "mediaembed",
  "figuremedia",
  "functionplot",
  "svgcanvas",
  "memorycard",
  "timeline",
  "eventcard",
  "conceptcard",
  "comparetable",
  "causeeffect",
  "keypoint",
  "historymap",
] as const;

function assertDirectiveMap(
  map: Record<string, unknown> | undefined,
  label: string,
): void {
  expect(map, `${label} must be defined (undefined spread would silently drop directives)`).toBeTypeOf(
    "object",
  );
  expect(map, `${label} must not be null`).not.toBeNull();
  for (const key of DIRECTIVE_KEYS) {
    expect(map, `${label} is missing directive key "${key}"`).toHaveProperty(key);
    expect(
      map![key],
      `${label}.${key} must be a component function, not undefined/placeholder`,
    ).toBeTypeOf("function");
  }
}

describe("directive registry evaluation order", () => {
  afterEach(() => {
    vi.resetModules();
  });

  // 动态 import 会拉起整条指令图（MemoryCard / canvas / KaTeX CSS）。
  // 单文件约 2s；全量并行时 transform 争用会超过默认 5s，不是断言本身慢。
  it("exposes all directive keys when registry is evaluated first", { timeout: 20_000 }, async () => {
    vi.resetModules();
    const { directiveComponents } = await import("./registry");
    assertDirectiveMap(directiveComponents as Record<string, unknown>, "directiveComponents");
  });

  it("keeps QuizMarkdown maps complete when QuizMarkdown is imported first", { timeout: 20_000 }, async () => {
    vi.resetModules();
    const quiz = await import("@/components/quiz/QuizMarkdown");
    const registry = await import("./registry");

    assertDirectiveMap(
      registry.directiveComponents as Record<string, unknown>,
      "directiveComponents (order: QuizMarkdown → registry)",
    );
    assertDirectiveMap(
      quiz.blockComponents as Record<string, unknown>,
      "blockComponents (order: QuizMarkdown → registry)",
    );
    assertDirectiveMap(
      quiz.inlineComponents as Record<string, unknown>,
      "inlineComponents (order: QuizMarkdown → registry)",
    );
  });

  it("keeps QuizMarkdown maps complete when registry is imported first", { timeout: 20_000 }, async () => {
    vi.resetModules();
    const registry = await import("./registry");
    const quiz = await import("@/components/quiz/QuizMarkdown");

    assertDirectiveMap(
      registry.directiveComponents as Record<string, unknown>,
      "directiveComponents (order: registry → QuizMarkdown)",
    );
    assertDirectiveMap(
      quiz.blockComponents as Record<string, unknown>,
      "blockComponents (order: registry → QuizMarkdown)",
    );
    assertDirectiveMap(
      quiz.inlineComponents as Record<string, unknown>,
      "inlineComponents (order: registry → QuizMarkdown)",
    );
  });

  it("keeps QuizMarkdown maps complete when MemoryCard is imported first", { timeout: 20_000 }, async () => {
    vi.resetModules();
    await import("./MemoryCard");
    const quiz = await import("@/components/quiz/QuizMarkdown");
    const registry = await import("./registry");

    assertDirectiveMap(
      registry.directiveComponents as Record<string, unknown>,
      "directiveComponents (order: MemoryCard → QuizMarkdown)",
    );
    assertDirectiveMap(
      quiz.blockComponents as Record<string, unknown>,
      "blockComponents (order: MemoryCard → QuizMarkdown)",
    );
    assertDirectiveMap(
      quiz.inlineComponents as Record<string, unknown>,
      "inlineComponents (order: MemoryCard → QuizMarkdown)",
    );
  });
});
