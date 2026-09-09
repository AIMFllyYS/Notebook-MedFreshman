# scripts/

仓库脚本分三类。构建链脚本挂在 `package.json` 的 `prebuild` / 独立 npm script 上；其余默认不进入生产构建。

## 构建链脚本

`prebuild` 按顺序调用：

1. `check-content-encoding.mjs`
2. `gen-nav-manifest.ts`
3. `check-registry-consistency.ts`
4. `gen-script-ids.mjs`
5. `check-katex-chars.mjs`
6. `check-recording-example-latex-escapes.mjs`
7. `check-media-sync.mjs`
8. `check-prose-svg-rules.mjs`
9. `run-unit-tests.mjs`（阶段 D 起带 `--filter=code`，不含内容校验）

独立构建入口：

- `build-index.ts` — 语义检索索引（`pnpm build-index`）
- `build-desktop.mjs` — Electron 桌面包（`pnpm desktop:build`）
- `gen-icon.mjs` — 桌面图标生成
- `run-all-tests.mjs` — `pnpm test`：代码单测 + vitest，取最差退出码（`--include-content` 时含内容校验）

## 内容 SOP 工具（可复用）

顶层、可按 SOP 重复跑的导入/清洗/校验工具，例如：

- 教材导入：`extract-textbook-pdf.py`、`extract-scanned-textbook.py`、`ingest-sophomore-textbooks.py`、`fallback-{docx,pdf,pptx}.py`
- 图片与卡片：`propagate-images.py`、`propagate-images-chemistry.py`、`embed-missing-figures.py`、`add-knowledge-cards.py`、`add-memory-cards.py`、`enhance-medical-markdown.py`、`enrich-anatomy-textbook.py`
- 校验与渲染：`parse-docs.ts`、`verify-models.ts`、`test-render-all.mjs`、`check-physics-recording-quiz-quality.mjs`
- Markdown 修补：`fix-katex-circled-numbers.ts`、`fix-section-headings.ts`、`cleanup-noise-lines.ts`、`fix-math-entities.mjs`、`fix-math-fences.mjs`、`fix-bare-directive-labels.mjs`
- 目录/摘录：`dump-textbook-toc.py`、`build-instrumental-analysis-toc.py`、`extract_units.py`、`render_pdfs.py`、`strip-nul-titles.py`

子目录：

- `content/` — 内容抽取辅助（docx 图文、纪要）
- `media/` — 视频海报与 COS 上传
- `workflows/` — 章节生成工作流
- `legacy/` — 已弃用的构建辅助，见该目录 README

## `one-off/`（历史任务，不保证可运行）

章节号硬编码、任务已完成的一次性脚本。计划 18 从顶层移入，共 36 个（计划原文写 35，清单实际 36：34 个脚本 + 2 个 txt）。

不保证路径、依赖或输出仍有效。若需重跑，先核对自己注释里的相对路径。
