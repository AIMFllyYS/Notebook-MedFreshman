import assert from "node:assert/strict";
import { test } from "node:test";
import { createDrawDiagramTool } from "./tool.ts";
import type { DrawDiagramOutput } from "./types.ts";

const execOpts = {
  toolCallId: "d1",
  messages: [] as never[],
  abortSignal: new AbortController().signal,
  context: {},
};

test("drawDiagram：按类型返回专属指南，缺省 custom", async () => {
  const tool = createDrawDiagramTool();
  const molecule = (await tool.execute!(
    { title: "乙酸乙酯", description: "键线式", type: "molecule" },
    execOpts,
  )) as DrawDiagramOutput;
  assert.match(molecule.text, /SMILES/);
  assert.match(molecule.text, /SvgDiagram/);

  const circuit = (await tool.execute!(
    { title: "简单电路", description: "电阻电容", type: "circuit" },
    execOpts,
  )) as DrawDiagramOutput;
  assert.match(circuit.text, /电阻/);

  const fallback = (await tool.execute!(
    { title: "示意图", description: "随便画" },
    execOpts,
  )) as DrawDiagramOutput;
  assert.match(fallback.text, /类型：custom/);
  assert.match(fallback.text, /currentColor/);
});
