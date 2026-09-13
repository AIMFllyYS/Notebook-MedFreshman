# Canvas Block Runtime Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the AI chat canvas stack so SVG, function plots, molecule diagrams, HTML-in-canvas, and future component canvases share one reliable render, diagnose, AI revise, and persist protocol.

**Architecture:** Move canvas behavior out of overloaded render components into a typed `lib/canvas` runtime. Components become thin renderers behind a shared `CanvasFrame`, while AI revision is a first-class user action that can update or convert the canvas block type after validation. The design follows common notebook / artifact / sandbox practices: structured block records, type-specific validators, isolated HTML execution, renderer error boundaries, and no silent failures.

**Tech Stack:** Next.js 16, React 19, Zustand chat persistence, DOMPurify for SVG, iframe `srcDoc` for HTML canvas, RDKit for molecule rendering, Vitest, TypeScript.

---

## Context And Root Cause

The current canvas subsystem is split across unrelated contracts:

- `SvgDiagram mode="raw"` renders through `DiagramCanvas -> RawSvgViewer`, has a left AI button, and persists by replacing the Nth `<SvgDiagram>` body.
- `SvgDiagram mode="molecule"` renders through `MoleculeRenderer -> RDKit -> RawSvgViewer`, but disables AI actions because replacing SMILES with SVG would break the next render.
- `SvgDiagram mode="math"` and `::plot` render through `PlotDirective -> SvgCanvas -> FunctionPlot`, but have no AI action and silently draw empty paths when expression compilation fails.
- `SvgDiagram mode="html"` renders through `HtmlCanvasLayer` iframe, but has no AI revision protocol and uses a separate control surface.
- `RawSvgViewer.tsx` owns pan/zoom, health checks, repair API calls, repair UI, source viewing, local repair state, and callback persistence. This is too much state in one component.
- `MessageContent.tsx` still contains raw SVG extraction and SVG repair context indexing. It should not own canvas internals.

The correct fix is not more regex or more prompt pressure. The correct fix is a single canvas block runtime with type-specific validation and a unified user-facing "AI revise canvas" action.

## Target Model

Create a canonical canvas block shape:

```ts
export type CanvasBlockKind = 'raw-svg' | 'plot' | 'multi-plot' | 'molecule' | 'html';

export interface CanvasBlockBase {
  kind: CanvasBlockKind;
  title?: string;
  width?: number;
  height?: number;
}

export interface RawSvgCanvasBlock extends CanvasBlockBase {
  kind: 'raw-svg';
  source: string;
}

export interface PlotCanvasBlock extends CanvasBlockBase {
  kind: 'plot';
  fn: string;
  attrs: PlotAttrs;
}

export interface MultiPlotCanvasBlock extends CanvasBlockBase {
  kind: 'multi-plot';
  attrs: CanvasAttrs;
  plots: PlotSpec[];
}

export interface MoleculeCanvasBlock extends CanvasBlockBase {
  kind: 'molecule';
  source: string;
}

export interface HtmlCanvasBlock extends CanvasBlockBase {
  kind: 'html';
  source: string;
}

export type CanvasBlock =
  | RawSvgCanvasBlock
  | PlotCanvasBlock
  | MultiPlotCanvasBlock
  | MoleculeCanvasBlock
  | HtmlCanvasBlock;
```

Every canvas follows:

`parse legacy tag/directive -> normalize block -> validate -> render -> diagnose -> AI revise -> validate revised block -> persist full block`

AI revision returns structured JSON, not free text:

```json
{
  "kind": "raw-svg",
  "title": "正态分布对比",
  "width": 600,
  "height": 360,
  "source": "<svg viewBox=\"0 0 600 360\" xmlns=\"http://www.w3.org/2000/svg\">...</svg>"
}
```

If the user asks to convert types, the kind may change, for example from `plot` to `html`. The old block is not overwritten until the revised block validates.

## Files To Create

- `lib/canvas/types.ts` — canonical canvas block types, validation result types, revision request/response types.
- `lib/canvas/normalize.ts` — convert legacy `SvgDiagram` props and markdown plot directives into `CanvasBlock`.
- `lib/canvas/serialize.ts` — convert `CanvasBlock` back into stable chat markup.
- `lib/canvas/diagnostics.ts` — shared `CanvasDiagnostic` model and helpers.
- `lib/canvas/svg.ts` — SVG normalize, sanitize, health check integration, source extraction.
- `lib/canvas/plot.ts` — math expression normalization, compile diagnostics, sampling diagnostics.
- `lib/canvas/html.ts` — HTML normalization and local-use sandbox policy.
- `lib/canvas/revisionPrompt.ts` — type-specific AI revision prompts and output extraction.
- `app/api/canvas-revise/route.ts` — unified AI revision endpoint.
- `components/canvas/CanvasFrame.tsx` — shared shell: left AI revise button, right controls slot, source/diagnostic panel.
- `components/canvas/CanvasRevisionPanel.tsx` — reusable revision form and result/error UI.
- `components/canvas/renderers/RawSvgRenderer.tsx` — pure SVG renderer.
- `components/canvas/renderers/PlotRenderer.tsx` — pure single plot renderer.
- `components/canvas/renderers/MultiPlotRenderer.tsx` — pure multi-plot renderer.
- `components/canvas/renderers/MoleculeRenderer.tsx` — RDKit renderer behind shared frame.
- `components/canvas/renderers/HtmlRenderer.tsx` — iframe renderer behind shared frame.
- `components/canvas/CanvasBlockRenderer.tsx` — switch on `CanvasBlock.kind`.
- `lib/canvas/*.test.ts` and `components/canvas/*.test.tsx` — unit and React regression tests.

## Files To Modify

- `components/canvas/DiagramCanvas.tsx` — replace mode switch with `normalizeSvgDiagramBlock` + `CanvasBlockRenderer`.
- `components/canvas/RawSvgViewer.tsx` — shrink or delete after extracting reusable viewer behavior.
- `components/canvas/MoleculeRenderer.tsx` — remove local `enableAiRepair={false}` policy and render through shared `CanvasFrame`.
- `components/canvas/PlotDirective.tsx` — create `CanvasBlock` and render through `CanvasBlockRenderer`.
- `components/canvas/CanvasDirective.tsx` — create `multi-plot` block and render through `CanvasBlockRenderer`.
- `components/canvas/HtmlCanvasLayer.tsx` — move iframe render into `HtmlRenderer`.
- `components/canvas/CanvasControls.tsx` — keep only right-side zoom/download/fullscreen controls; left AI control belongs to `CanvasFrame`.
- `components/chat/ChatMessageVisualizations.tsx` — persist full serialized canvas block instead of replacing only SVG body.
- `components/chat/MessageContent.tsx` — remove raw SVG repair coupling after `CanvasBlockRenderer` owns canvas behavior.
- `lib/chat/rendering/svgBlockPatch.ts` — replace with generic `canvasBlockPatch.ts`, then delete SVG-only patch if no callers remain.
- `lib/ai/prompts/global.md` — rename "repair" language to "revise canvas"; document stable plot functions and HTML canvas.
- `docs/refer/rendering-architecture.md` — document unified canvas runtime and deletion of legacy patch points.
- `docs/sop/subject-onboarding.md` — add rules for new canvas kinds, validators, revision prompt, and tests.

## Industry Practice References To Apply

- Notebook/artifact model: store output cells as structured blocks, not free-form DOM strings.
- Sandboxed interactive artifacts: run arbitrary HTML/JS in iframe, not in the host React tree.
- Schema-first AI output: require JSON envelope with `kind`, dimensions, and source fields, then validate before rendering.
- Renderer isolation: use error boundaries and diagnostics per block so one canvas cannot break the chat message.
- Deterministic primitives first: use `plot` and `molecule` structured renderers when possible; use raw SVG/HTML only when needed.

## Assumptions

- This is a local-first app. Security may be looser than a public SaaS app.
- Keep iframe HTML powerful and useful: allow scripts, forms, modals, downloads, popups, and CDN use.
- Still keep host React safe: AI-generated JSX should not execute directly in the app React tree in phase 1.
- JSX-like generation can be supported later as sandboxed HTML with React CDN or as registered component + JSON props.
- AI revision is user-triggered only. No automatic background regeneration.
- A failed revision never overwrites the current block.

---

### Task 1: Canvas Runtime Types And Legacy Normalization

**Files:**
- Create: `lib/canvas/types.ts`
- Create: `lib/canvas/normalize.ts`
- Create: `lib/canvas/serialize.ts`
- Test: `lib/canvas/normalize.test.ts`

- [ ] **Step 1: Write failing tests for legacy conversion**

Add tests covering:

```ts
import { describe, expect, it } from 'vitest';
import { normalizeSvgDiagramBlock } from './normalize';
import { serializeCanvasBlockToSvgDiagram } from './serialize';

describe('canvas block normalization', () => {
  it('normalizes raw SvgDiagram content to raw-svg block', () => {
    const block = normalizeSvgDiagramBlock(
      { mode: 'raw', title: '光电效应', width: 600, height: 360 },
      '<svg viewBox="0 0 600 360"><line x1="0" y1="0" x2="10" y2="10" /></svg>',
    );
    expect(block).toMatchObject({ kind: 'raw-svg', title: '光电效应', width: 600, height: 360 });
    expect(block.kind === 'raw-svg' ? block.source : '').toContain('<svg');
  });

  it('normalizes molecule SvgDiagram content to molecule block', () => {
    const block = normalizeSvgDiagramBlock({ mode: 'molecule', title: '硝基苯' }, 'O=[N+]([O-])c1ccccc1');
    expect(block).toEqual({ kind: 'molecule', title: '硝基苯', source: 'O=[N+]([O-])c1ccccc1' });
  });

  it('normalizes math SvgDiagram attrs to plot block', () => {
    const block = normalizeSvgDiagramBlock(
      { mode: 'math', fn: 'sin(x)', xmin: '-3.14', xmax: '3.14', label: '正弦' },
      '',
    );
    expect(block.kind).toBe('plot');
    if (block.kind === 'plot') {
      expect(block.fn).toBe('sin(x)');
      expect(block.attrs.xmin).toBe(-3.14);
      expect(block.attrs.label).toBe('正弦');
    }
  });

  it('serializes a kind-changing revision as a full SvgDiagram mode change', () => {
    const markup = serializeCanvasBlockToSvgDiagram({
      kind: 'html',
      title: '交互正态分布',
      source: '<!doctype html><html><body>demo</body></html>',
      height: 420,
    });
    expect(markup).toContain('<SvgDiagram');
    expect(markup).toContain('mode="html"');
    expect(markup).toContain('交互正态分布');
    expect(markup).toContain('<!doctype html>');
  });
});
```

- [ ] **Step 2: Run failing test**

Run: `npx vitest run lib/canvas/normalize.test.ts --passWithNoTests`

Expected: fails because `lib/canvas/normalize.ts` does not exist.

- [ ] **Step 3: Implement types, normalization, and serialization**

Implement:

- `CanvasBlockKind`
- `CanvasBlock`
- `PlotAttrs`
- `CanvasAttrs`
- `PlotSpec`
- `normalizeSvgDiagramBlock(props, childrenText)`
- `serializeCanvasBlockToSvgDiagram(block)`

Rules:

- `mode="raw"` -> `kind: 'raw-svg'`
- `mode="molecule"` -> `kind: 'molecule'`
- `mode="math"` -> `kind: 'plot'`
- `mode="html"` -> `kind: 'html'`
- Unknown mode -> `raw-svg`
- Numeric attrs parse with finite-number fallback.

- [ ] **Step 4: Run test and commit**

Run:

```powershell
npx vitest run lib/canvas/normalize.test.ts --passWithNoTests
git add lib/canvas/types.ts lib/canvas/normalize.ts lib/canvas/serialize.ts lib/canvas/normalize.test.ts
git commit -m "feat(canvas): add typed canvas block runtime"
```

---

### Task 2: Plot Diagnostics And No-Silent-Failure Rendering

**Files:**
- Create: `lib/canvas/plot.ts`
- Test: `lib/canvas/plot.test.ts`
- Modify: `components/canvas/canvasUtils.ts`
- Modify: `components/canvas/FunctionPlot.tsx`
- Modify: `components/canvas/PlotDirective.tsx`
- Modify: `components/canvas/CanvasDirective.tsx`

- [ ] **Step 1: Write failing plot tests**

Add tests:

```ts
import { describe, expect, it } from 'vitest';
import { normalizePlotExpression, diagnosePlotExpression } from './plot';

describe('plot diagnostics', () => {
  it('normalizes gaussian aliases into supported expression', () => {
    expect(normalizePlotExpression('normal_pdf(x,0,1)')).toContain('exp');
    expect(normalizePlotExpression('phi(x)')).toContain('exp');
  });

  it('normalizes sigma and mu symbols', () => {
    const expr = normalizePlotExpression('1/(σ*sqrt(2*pi))*exp(-((x-μ)^2)/(2*σ^2))', { mu: 0, sigma: 1 });
    expect(expr).toContain('sqrt');
    expect(expr).not.toContain('σ');
    expect(expr).not.toContain('μ');
  });

  it('reports invalid expression instead of returning an empty curve silently', () => {
    const result = diagnosePlotExpression('\\frac{1}{x}', { xmin: -1, xmax: 1 });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('unsupported-syntax');
  });
});
```

- [ ] **Step 2: Implement plot normalization and diagnostics**

`diagnosePlotExpression` must return:

```ts
type PlotDiagnostic =
  | { ok: true; normalizedFn: string; sampledPoints: number }
  | { ok: false; reason: 'empty-fn' | 'unsupported-syntax' | 'no-finite-samples' | 'empty-path'; normalizedFn: string; message: string };
```

Support:

- `normal_pdf(x,mu,sigma)`
- `gaussian(x,mu,sigma)`
- `phi(x)` as standard normal PDF
- `μ` -> configured `mu`
- `σ` -> configured `sigma`
- `Math.` prefix removal
- reject obvious LaTeX commands such as `\frac`, `\sqrt`

- [ ] **Step 3: Update rendering behavior**

`FunctionPlot` should not render `<path d="">`. If diagnostics fail, it returns a small diagnostic group or lets parent render the shared error panel.

`PlotDirective` and `CanvasDirective` should show a user-visible diagnostic card with the failed `fn`, reason, and AI revise button through `CanvasFrame`.

- [ ] **Step 4: Run tests and commit**

Run:

```powershell
npx vitest run lib/canvas/plot.test.ts components/canvas/FunctionPlot.test.tsx --passWithNoTests
npx eslint components/canvas/FunctionPlot.tsx components/canvas/PlotDirective.tsx components/canvas/CanvasDirective.tsx lib/canvas/plot.ts --no-warn-ignored
git add lib/canvas/plot.ts lib/canvas/plot.test.ts components/canvas/canvasUtils.ts components/canvas/FunctionPlot.tsx components/canvas/PlotDirective.tsx components/canvas/CanvasDirective.tsx
git commit -m "fix(canvas): diagnose plot expressions before rendering"
```

---

### Task 3: Shared Canvas Frame And AI Revision UI

**Files:**
- Create: `components/canvas/CanvasFrame.tsx`
- Create: `components/canvas/CanvasRevisionPanel.tsx`
- Create: `components/canvas/CanvasDiagnosticPanel.tsx`
- Modify: `components/canvas/CanvasControls.tsx`
- Modify: `app/styles/canvas.css`
- Test: `components/canvas/CanvasFrame.test.tsx`

- [ ] **Step 1: Write failing frame tests**

Test:

- AI revise button is visible even when canvas is healthy.
- Diagnostic content is visible when `diagnostic.ok === false`.
- Source panel can be toggled.
- Revision form does not overflow the canvas wrapper.

- [ ] **Step 2: Implement `CanvasFrame`**

Responsibilities:

- Left AI revise button.
- Right controls slot.
- Inline revision panel.
- Source panel.
- Diagnostic panel.
- Fullscreen-friendly layout.

No renderer logic goes in `CanvasFrame`.

- [ ] **Step 3: Move repair wording to revision wording**

Replace visible strings:

- `AI 修复 SVG` -> `AI 修订画布`
- `修复画布` -> `更新画布`
- `SVG diagram is not visible` -> type-aware text, for example `画布当前没有可见内容`

- [ ] **Step 4: Run tests and commit**

Run:

```powershell
npx vitest run components/canvas/CanvasFrame.test.tsx --passWithNoTests
npx eslint components/canvas/CanvasFrame.tsx components/canvas/CanvasRevisionPanel.tsx components/canvas/CanvasDiagnosticPanel.tsx components/canvas/CanvasControls.tsx --no-warn-ignored
git add components/canvas/CanvasFrame.tsx components/canvas/CanvasRevisionPanel.tsx components/canvas/CanvasDiagnosticPanel.tsx components/canvas/CanvasControls.tsx app/styles/canvas.css components/canvas/CanvasFrame.test.tsx
git commit -m "feat(canvas): add shared AI revision frame"
```

---

### Task 4: Renderer Split And Redundant Code Removal

**Files:**
- Create: `components/canvas/renderers/RawSvgRenderer.tsx`
- Create: `components/canvas/renderers/PlotRenderer.tsx`
- Create: `components/canvas/renderers/MultiPlotRenderer.tsx`
- Create: `components/canvas/renderers/MoleculeRenderer.tsx`
- Create: `components/canvas/renderers/HtmlRenderer.tsx`
- Create: `components/canvas/CanvasBlockRenderer.tsx`
- Modify: `components/canvas/RawSvgViewer.tsx`
- Modify: `components/canvas/MoleculeRenderer.tsx`
- Modify: `components/canvas/HtmlCanvasLayer.tsx`
- Modify: `components/canvas/DiagramCanvas.tsx`
- Modify: `components/canvas/index.ts`

- [ ] **Step 1: Write renderer tests**

Cover:

- raw SVG renderer shows valid SVG.
- raw SVG renderer shows diagnostic for empty SVG.
- molecule renderer displays RDKit output and still has AI revise button from frame.
- plot renderer does not silently render empty curves.
- HTML renderer renders iframe and right-side controls.

- [ ] **Step 2: Extract pure raw SVG renderer**

Move from `RawSvgViewer`:

- `ensureViewBox`
- sanitized SVG display
- health diagnostic

Keep out:

- AI API call
- persistence callback
- revision state

- [ ] **Step 3: Extract HTML renderer**

Move iframe logic from `HtmlCanvasLayer` into `HtmlRenderer`.

Local-first policy:

- keep scripts enabled
- keep downloads enabled
- keep popups enabled
- allow CDN use
- do not execute iframe content in host React

- [ ] **Step 4: Replace `DiagramCanvas` mode switch**

`DiagramCanvas` should:

1. call `normalizeSvgDiagramBlock(props, content)`
2. render `<CanvasBlockRenderer block={block} ... />`

- [ ] **Step 5: Delete or deprecate obsolete components**

After callers are migrated:

- delete old SVG repair UI from `RawSvgViewer`
- remove `enableAiRepair`
- remove local `localRepair`
- remove `/api/svg-repair` only after `/api/canvas-revise` is complete and tests pass

- [ ] **Step 6: Run tests and commit**

Run:

```powershell
npx vitest run components/canvas --passWithNoTests
npx eslint components/canvas --no-warn-ignored
git add components/canvas lib/canvas
git commit -m "refactor(canvas): split renderers from canvas frame"
```

---

### Task 5: Unified Canvas Revision API

**Files:**
- Create: `app/api/canvas-revise/route.ts`
- Create: `lib/canvas/revisionPrompt.ts`
- Create: `lib/canvas/revisionOutput.ts`
- Test: `lib/canvas/revisionOutput.test.ts`
- Modify: `components/canvas/CanvasRevisionPanel.tsx`
- Delete later: `app/api/svg-repair/route.ts`
- Delete later: `lib/ai/svgRepairPrompt.ts`

- [ ] **Step 1: Write output extraction tests**

Cover:

- JSON fenced block extraction.
- raw JSON extraction.
- legacy `<svg>...</svg>` fallback maps to `kind: raw-svg`.
- legacy `<SvgDiagram mode="html">...</SvgDiagram>` maps to `kind: html`.
- invalid output returns structured error and never overwrites current block.

- [ ] **Step 2: Implement prompt builder**

Prompt rules:

- System role: "You are a local canvas revision engine."
- User gives current block JSON, page topic, and revision instruction.
- Output must be one JSON object.
- Allowed kinds: `raw-svg`, `plot`, `multi-plot`, `molecule`, `html`.
- For HTML: output full HTML document or complete fragment with inline CSS/JS.
- For plot: output parseable expressions only, prefer `normal_pdf`, `gaussian`, `phi`, `sin`, `cos`, `exp`, `sqrt`.
- For molecule: output SMILES unless user explicitly asks for mechanism/projection/raw drawing.

- [ ] **Step 3: Implement route**

`POST /api/canvas-revise` accepts:

```ts
{
  block: CanvasBlock;
  instruction: string;
  topic?: string;
  modelId: string;
  customApiGroups?: CustomApiGroup[];
}
```

Returns:

```ts
{ block: CanvasBlock; diagnostics: CanvasDiagnostic[] }
```

On failure:

```ts
{ error: string; rawOutput?: string }
```

- [ ] **Step 4: Wire panel to API**

`CanvasRevisionPanel` sends the current block and receives a validated block. It calls `onRevisionAccepted(block)` only after validation succeeds.

- [ ] **Step 5: Run tests and commit**

Run:

```powershell
npx vitest run lib/canvas/revisionOutput.test.ts components/canvas/CanvasRevisionPanel.test.tsx --passWithNoTests
npx eslint app/api/canvas-revise/route.ts lib/canvas/revisionPrompt.ts lib/canvas/revisionOutput.ts components/canvas/CanvasRevisionPanel.tsx --no-warn-ignored
git add app/api/canvas-revise/route.ts lib/canvas/revisionPrompt.ts lib/canvas/revisionOutput.ts lib/canvas/revisionOutput.test.ts components/canvas/CanvasRevisionPanel.tsx
git commit -m "feat(canvas): add unified AI canvas revision API"
```

---

### Task 6: Full-Block Persistence In Chat Messages

**Files:**
- Create: `lib/chat/rendering/canvasBlockPatch.ts`
- Test: `lib/chat/rendering/canvasBlockPatch.test.ts`
- Modify: `components/chat/ChatMessageVisualizations.tsx`
- Modify: `components/chat/MessageContent.tsx`
- Delete later: `lib/chat/rendering/svgBlockPatch.ts`

- [ ] **Step 1: Write patch tests**

Cover:

- replacing raw SVG block preserves surrounding Markdown.
- replacing molecule block with raw SVG updates `mode`.
- replacing plot block with HTML updates `mode` and children.
- replacement only affects selected block index.

- [ ] **Step 2: Implement generic block replacement**

The patcher should target complete `<SvgDiagram ...>...</SvgDiagram>` blocks, not only inner SVG.

Input:

```ts
replaceCanvasBlock(content: string, blockIndex: number, nextBlock: CanvasBlock): string
```

Output is stable serialized markup from `serializeCanvasBlockToSvgDiagram(nextBlock)`.

- [ ] **Step 3: Wire persistence**

`ChatMessageVisualizations` receives `onRevisionAccepted(CanvasBlock)` and updates the message by replacing the full block.

- [ ] **Step 4: Remove SVG-only persistence**

Delete `replaceSvgDiagramBlock` usage after all callers move to `replaceCanvasBlock`.

- [ ] **Step 5: Run tests and commit**

Run:

```powershell
npx vitest run lib/chat/rendering/canvasBlockPatch.test.ts components/chat/MessageContent.test.tsx --passWithNoTests
npx eslint lib/chat/rendering/canvasBlockPatch.ts components/chat/ChatMessageVisualizations.tsx components/chat/MessageContent.tsx --no-warn-ignored
git add lib/chat/rendering/canvasBlockPatch.ts lib/chat/rendering/canvasBlockPatch.test.ts components/chat/ChatMessageVisualizations.tsx components/chat/MessageContent.tsx
git rm lib/chat/rendering/svgBlockPatch.ts lib/chat/rendering/svgBlockPatch.test.tsx
git commit -m "fix(chat): persist revised canvas blocks by full mode"
```

---

### Task 7: Prompt And Documentation Update

**Files:**
- Modify: `lib/ai/prompts/global.md`
- Modify: `docs/refer/rendering-architecture.md`
- Modify: `docs/sop/subject-onboarding.md`
- Test: encoding scan

- [ ] **Step 1: Update global prompt**

Rules to add:

- Use `plot` for deterministic function graphs.
- Use `molecule` for standard organic structures.
- Use `raw-svg` for static diagrams and mechanisms.
- Use `html` for lightweight interactive or animated canvas demos.
- AI canvas revision outputs structured canvas JSON through the revision endpoint; normal chat output still uses `SvgDiagram`.
- Function expressions must use supported functions or named aliases: `normal_pdf(x,mu,sigma)`, `gaussian(x,mu,sigma)`, `phi(x)`, `sin`, `cos`, `exp`, `sqrt`, `log`.

- [ ] **Step 2: Update architecture docs**

Document:

- Canvas block lifecycle.
- Renderer split.
- AI revision contract.
- Why not to add more repair regex in `MessageContent` or `RawSvgViewer`.
- Historical failures: empty SVG, molecule AI button disabled, plot empty path, SVG repair strict `<svg>` mismatch.

- [ ] **Step 3: Update onboarding SOP**

New canvas kind checklist:

- add type
- add normalizer
- add validator/diagnostic
- add renderer
- add revision prompt
- add serialization
- add tests

- [ ] **Step 4: Run encoding and commit**

Run:

```powershell
npm run check:encoding
git diff --check -- lib/ai/prompts/global.md docs/refer/rendering-architecture.md docs/sop/subject-onboarding.md
git add lib/ai/prompts/global.md docs/refer/rendering-architecture.md docs/sop/subject-onboarding.md
git commit -m "docs(canvas): document unified canvas revision runtime"
```

---

### Task 8: Delete Obsolete SVG Repair Path And Final Regression

**Files:**
- Delete: `app/api/svg-repair/route.ts`
- Delete: `lib/ai/svgRepairPrompt.ts`
- Delete: `lib/ai/svgRepairPrompt.test.tsx`
- Modify: any imports still pointing to SVG repair

- [ ] **Step 1: Confirm no callers remain**

Run:

```powershell
rg -n "svg-repair|svgRepairPrompt|repairSvg|enableAiRepair|replaceSvgDiagramBlock" app components lib
```

Expected: no production callers. Test names may remain only if intentionally migrated.

- [ ] **Step 2: Delete obsolete files**

Use `git rm` for obsolete files after replacing all callers.

- [ ] **Step 3: Run full targeted validation**

Run:

```powershell
npm run check:encoding
npx vitest run lib/canvas components/canvas components/chat/MessageContent.test.tsx components/chat/ChatMessageVisualizations.test.tsx lib/utils/xmlParser.test.tsx --passWithNoTests
npx tsc --noEmit
npx eslint components/canvas components/chat/MessageContent.tsx components/chat/ChatMessageVisualizations.tsx lib/canvas app/api/canvas-revise/route.ts --no-warn-ignored
git diff --check
```

- [ ] **Step 4: Commit cleanup**

```powershell
git add app components lib docs
git commit -m "refactor(canvas): remove obsolete SVG repair path"
```

---

## Manual Test Scenarios

1. Healthy raw SVG shows AI revise button, source toggle, zoom, reset, fullscreen.
2. Empty raw SVG shows a diagnostic card and AI revise button.
3. User revises raw SVG to "改成蓝色光路图并加箭头"; old block persists only after validation passes.
4. Molecule SMILES renders through RDKit and shows AI revise button.
5. User revises molecule with "改成硝基苯"; result stays `kind: molecule` and persists as SMILES.
6. User revises molecule with "改成反应机理箭头图"; result may become `kind: raw-svg` and serialized mode changes to `raw`.
7. `::plot{fn="normal_pdf(x,0,1)"}` renders visible curve.
8. Invalid plot expression displays a diagnostic instead of silent empty line.
9. User revises plot with "改成三条不同 sigma 正态分布对比"; result can become `multi-plot` or HTML.
10. HTML canvas renders interactive HTML in iframe.
11. User revises HTML canvas with "增加滑块控制 sigma"; result remains HTML and iframe updates after validation.
12. A failed AI revision shows strict error and raw output preview, and does not overwrite existing content.
13. Quick explain / thinking / artifact basis render paths do not get unknown React tag warnings.
14. No visible text says "repair" for normal user-facing canvas revisions.

## Open Questions Before Implementation

1. Should AI revision be allowed to convert any canvas kind to any other kind by default, or only when the user explicitly says "改成交互/改成 SVG/改成分子式"?
2. For local HTML canvas, should we keep `allow-same-origin` enabled for maximum compatibility, accepting the looser boundary?
3. Should "JSX component generation" be phase 2 as sandboxed React HTML, or do you want it in phase 1?

