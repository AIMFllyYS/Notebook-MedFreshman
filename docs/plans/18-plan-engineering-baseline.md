# 18 · 工程基线体系修复计划

> 背景与证据见 `17-code-quality-audit-2026-09.md` §1、§2、§3。
> 本计划由**一次 AI 会话**独立完成。无前置依赖；`19`–`22` 都依赖本计划建立的防回退网。
> 只读 `17` 的 §1–§3 即可开始，不需要读其他计划。

---

## 目标

1. 仓库不再跟踪工具元数据与大二进制归档；一次性脚本归档。
2. 已确证的死代码全部删除，`tsc` / `eslint` / 两套测试全绿。
3. 建立三道防回退网：`knip` 抓未引用导出；ESLint import 边界规则阻止跨层错误引用；测试文件纳入 `tsc` 与 `eslint`。
4. 内容校验测试与代码单元测试分离，内容缺图不再阻塞 `pnpm build`。

## 非目标

- 不改任何业务逻辑、组件行为、样式。
- 不修 `cell-biology/textbook/ch08-4` 的缺图内容本身（那是内容 SOP 任务），只把它从构建阻塞链摘出来。
- 不动 `public/images/**` 大图（压缩/LFS 需要用户决定存储方案，本计划只产出清单）。

## 前置条件

- 工作区干净（`git status` 只允许 `pnpm-lock.yaml` 一类无关改动，先 stash 或提交）。
- Node ≥ 20、pnpm 可用。
- 执行前跑一次基线并记录：`pnpm exec tsc --noEmit && pnpm lint && pnpm test:react && pnpm test:unit`。预期：前三项通过，`test:unit` 1 例失败（`sophomore-textbooks` ch08-4）。

---

## 阶段 A · Git 卫生（每步单独 commit）

### A1 移除已跟踪的工具元数据

```powershell
git rm -r --cached .claude .trae
```

`.gitignore` 已含 `.claude/`、`.trae/`（第 80–83 行附近），无需再加。
**归档有价值内容**：把 `.trae/specs/*/spec.md` 复制到 `docs/archive/trae-specs/<spec-name>.md`（六个 spec 目录各一份，`tasks.md`/`checklist.md` 不要），加一个 `docs/archive/README.md` 说明来源。`.claude/workflows/*.js` 是被 `scripts/` 取代的旧生成脚本，不归档。

验证：`git ls-files .claude .trae` 输出为空。
Commit：`chore(repo): untrack .claude/.trae tool metadata, archive trae specs`

### A2 移除大二进制归档

```powershell
git rm --cached docs/refer/prototype-v0.0.tar.gz
```

在 `.gitignore` 增加 `*.tar.gz`。**不要**重写历史（`filter-repo`）——那是破坏性操作，留给用户决定；在本计划输出里提醒即可。

同时修复 `docs/refer/` 下两个文件名乱码的 `.md`：用 `git ls-files docs/refer` 找出，读内容判断主题后重命名为 ASCII/正确中文名。

验证：`git ls-files | Where-Object { $_ -like '*.tar.gz' }` 为空。
Commit：`chore(repo): untrack 27MB prototype archive, fix mojibake doc names`

### A3 一次性脚本归档

`.gitignore` 已含 `/scripts/archive/`，说明作者原本就打算把一次性脚本放那里——但 ignore 意味着归档后就不进 git 了。这里选择**保留在 git**，改用 `scripts/one-off/` 目录（不在 ignore 列表）：

```powershell
New-Item -ItemType Directory scripts/one-off
git mv scripts/fix-ch03.js scripts/one-off/
# ... 以下全部 git mv 到 scripts/one-off/
```

移动清单（35 个）：
`fix-ch03.js` `fix-ch08.js` `gen-rec-10.mjs` `gen-rec-c.mjs` `gen-rec-c8.mjs` `write-rec-11.mjs` `write-rec-12.mjs` `gen-maogai-quiz-ch01-03.py` `gen-maogai-quiz-ch08-12.py` `gen_maogai_quiz_ch01_03_part2.py` `gen_maogai_quiz_data_ch09.py` `gen_maogai_quiz_data_ch10_11.py` `gen_maogai_quiz_data_ch12.py` `gen-physics-exercises-ch05-07.py` `gen-physics-exercises-ch11-14.py` `generate-physics-ch01-04-examples.py` `gen_rec_quiz_01_04.py` `gen_unit5_main.py` `fix-quiz-json.js` `fix-quiz-json-v2.js` `fix-maogai-quotes.js` `fill-maogai-example-answers.ts` `check-maogai-textbook-syntax.ts` `convert-maogai-textbook.ts` `fix-headings-maogai-textbook.ts` `postprocess-maogai-textbook.ts` `process-maogai-textbook.ts` `rewrite-maogai-textbook-notes.ts` `split-maogai-textbook.ts` `generate-maogai-examples.ts` `postprocess-modern-history-textbook.ts` `process-modern-history-textbook.ts` `split-modern-history-textbook.ts` `transform-modern-history-textbook.py` `ai-image-generation-prompt.txt` `project-introduction.txt`

**移动前必须** `rg "scripts/<name>" --glob '!node_modules'` 确认没有被 `package.json`、其他脚本、`docs/sop/**` 引用；若 SOP 文档引用了，同步更新路径。

新建 `scripts/README.md`，三个小节：构建链脚本（列 `prebuild` 里的 9 个 + `build-index` / `build-desktop` / `gen-icon`）、内容 SOP 工具（可复用）、`one-off/`（历史任务，不保证可运行）。

验证：`pnpm build` 的 `prebuild` 阶段各脚本仍能找到（先不管末尾 test 失败）。
Commit：`chore(scripts): move 35 one-off scripts to scripts/one-off, add README`

### A4 本地残留目录

```powershell
git ls-files content/probability/shizyan-yanlian   # 预期为空
Remove-Item -Recurse content/probability/shizyan-yanlian
```

不产生 commit（未跟踪）。

### A5 大图清单（只产出，不改动）

生成 `docs/archive/large-assets-2026-09.md`：列出 `public/images/**` 下 >1 MB 的文件、尺寸、被哪个 `content/**/*.md` 引用（`rg -l "<basename>" content`）。附建议：转 WebP（质量 82）通常可压到 1/5；或 git LFS。**不执行压缩。**

---

## 阶段 B · 死代码删除（一个 commit）

按顺序删除，每删一项跑 `pnpm exec tsc --noEmit`：

1. `lib/ai/tools.ts` + `lib/ai/tools.test.ts` + `lib/types/tools.ts`。删前 `rg "from ['\"]@/lib/ai/tools['\"]|from ['\"]@/lib/types/tools['\"]"` 确认只有测试文件命中。
2. `lib/ai/artifactRegistry.ts`。`rg artifactRegistry` 确认无引用。
3. `components/canvas/HtmlCanvasLayer.tsx`；同时从 `components/canvas/index.ts` 删除 `export { HtmlCanvasLayer }`；修正 `components/canvas/DiagramCanvas.tsx:34-37` 的注释，把四行路由目标改成真实路径：`raw → renderers/RawSvgRenderer`、`math → renderers/PlotRenderer | MultiPlotRenderer`、`molecule → renderers/MoleculeRenderer`、`html → renderers/HtmlRenderer`，并注明"全部经由 CanvasBlockRenderer 分发"。修正 `lib/hooks/useCanvasFullscreen.ts:8` 注释里的 `HtmlCanvasLayer` 为 `renderers/HtmlRenderer`。
4. `components/canvas/MoleculeRenderer.tsx`（顶层）；从 `index.ts` 删除对应导出。`rg "canvas/MoleculeRenderer|from './MoleculeRenderer'|from \"./MoleculeRenderer\""` 确认只剩 `renderers/` 内部引用。
5. `lib/chat/toolPresentation.ts`：`rg "summarize" lib components app` 找出无调用方的 `summarize*` 导出，删除。
6. token 上限单源：读 `lib/ai/models.ts` 的 `contextK` 与 `lib/context/types.ts` 的 `MODEL_TOKEN_LIMITS`，比对数值；以 `models.ts` 为唯一来源（它已按模型 id 建索引），`MODEL_TOKEN_LIMITS` 改为从 `models.ts` 派生的 getter，或直接删除并把调用方改为 `getModelCapabilities(id).contextK`。若两处数值不一致，**以 models.ts 为准并在 commit message 里列出差异**。

验证：`pnpm exec tsc --noEmit && pnpm lint && pnpm test:react`。
Commit：`refactor: remove dead tool/canvas/registry modules, unify model context limits`

---

## 阶段 C · 防回退网

### C1 knip

```powershell
pnpm add -D knip
```

新建 `knip.json`：

```json
{
  "$schema": "https://unpkg.com/knip@5/schema.json",
  "entry": [
    "app/**/{page,layout,route,manifest,not-found,error,loading}.{ts,tsx}",
    "electron/**/*.{js,mjs,ts}",
    "scripts/*.{ts,mjs,js}",
    "**/*.test.{ts,tsx}",
    "tests/helpers/vitest-setup.ts"
  ],
  "project": ["app/**", "components/**", "lib/**", "electron/**", "scripts/*.{ts,mjs,js}"],
  "ignore": ["scripts/one-off/**", "docs/**", "manim/**", "showroom/**", "exhibition-hall/**", "dist-desktop/**"],
  "ignoreDependencies": ["@tailwindcss/postcss", "postcss", "tailwindcss", "electron-builder", "cos-nodejs-sdk-v5"],
  "next": true,
  "vitest": true
}
```

跑 `pnpm exec knip`。第一次会报一批"未使用导出"——**逐条判断**：`components/canvas/index.ts` 这类桶文件里为外部复用保留的导出可以加 `/** @public */`；真正无人用的删除；Next 约定文件（`generateStaticParams`、`metadata`）knip 已内置识别。目标是 knip 输出为零后加入 `package.json`：

```json
"lint": "eslint . && knip",
"lint:eslint": "eslint .",
"lint:knip": "knip"
```

Commit：`chore(lint): add knip unused-export detection to lint chain`

### C2 import 边界规则

在 `eslint.config.mjs` 追加一段（不引入新插件，用内置 `no-restricted-imports`）：

```js
{
  files: ["components/notes/**", "components/layout/RightPanel.tsx", "components/interactives/**"],
  rules: {
    "no-restricted-imports": ["error", {
      patterns: [{
        group: ["@/components/chat/*", "@/lib/hooks/useArtifacts", "@/lib/hooks/useDocuments", "@/lib/hooks/useImageGen"],
        message: "AI 对话产物（artifact/document/imageGen）只能由 components/chat 与 AppShell 的全局窗口层渲染，不得在笔记区/右侧 tab 直接引用。见 docs/plans/17 §5。"
      }]
    }]
  }
},
{
  files: ["components/canvas/**"],
  rules: {
    "no-restricted-imports": ["error", {
      patterns: [{ group: ["@/components/chat/*"], message: "canvas 是纯渲染层，不得反向依赖 chat。" }]
    }]
  }
},
{
  files: ["lib/**"],
  rules: {
    "no-restricted-imports": ["error", {
      patterns: [{ group: ["@/components/*"], message: "lib 不得依赖 components。" }]
    }]
  }
}
```

跑 `pnpm lint`；若第三条（lib → components）在存量代码里有命中，**记录到本计划输出但把该条降为 `warn`**，不要为了规则去动业务代码——那是 `22` 的范围。

Commit：`chore(lint): add layer-boundary import restrictions`

### C3 测试文件纳入 tsc 与 eslint

- `tsconfig.json`：从 `exclude` 删除 `**/*.test.ts`、`**/*.test.tsx`。`include` 已是 `**/*.ts(x)`，测试自然被包含。若 Vitest 全局（`describe/it/expect`，`globals: true`）导致类型报错，在 `tsconfig.json` 的 `compilerOptions.types` 加 `["vitest/globals", "@testing-library/jest-dom"]`；若 node:test 文件用了 `node:test`/`node:assert`，`@types/node` 已在。
- `eslint.config.mjs`：从 `globalIgnores` 删除 `**/*.test.ts`、`**/*.test.tsx`。首次会暴露存量告警；**只修 error 级**（一般是 `@typescript-eslint/no-explicit-any`、`no-unused-vars`），warn 级留着。若 error 超过 50 条，为测试文件加一段 override 把这两条降为 `warn`，并在输出里记录数量。

验证：`pnpm exec tsc --noEmit && pnpm lint`。
Commit：`chore(lint): include test files in tsc and eslint`

---

## 阶段 D · 测试链修复

### D1 拆分内容校验与代码单测

`scripts/run-unit-tests.mjs` 目前跑所有 `*.test.ts`。给它加 `--filter` 参数：

- `--filter=code`：排除 `tests/content/**`。
- `--filter=content`：只跑 `tests/content/**`。
- 无参数：全部（保持现有行为）。

`package.json`：

```json
"test": "node scripts/run-unit-tests.mjs --filter=code; vitest run --passWithNoTests",
"test:unit": "node scripts/run-unit-tests.mjs --filter=code",
"test:content": "node scripts/run-unit-tests.mjs --filter=content",
"test:react": "vitest run --passWithNoTests",
"test:all": "node scripts/run-unit-tests.mjs && vitest run --passWithNoTests",
```

注意 `test` 用 `;` 而不是 `&&`：两套都要跑完，退出码取"任一失败即失败"。跨平台写法：新建 `scripts/run-all-tests.mjs`，依次 `spawnSync` 两个命令，`process.exit(Math.max(code1, code2))`，`test` 指向它。

`prebuild` 末尾的 `node scripts/run-unit-tests.mjs` 改为 `node scripts/run-unit-tests.mjs --filter=code`。内容校验由 `pnpm test:content` 单独跑，在 `docs/sop/05-content-integration.md` 里加一句"合入内容后必须 `pnpm test:content`"。

`tests/runUnitTestsScript.test.ts` 已存在，为新参数补 2 例（filter=code 不含 content 路径；filter=content 只含 content 路径）。

验证：`pnpm test` 退出码 0（content 那例不再参与）；`pnpm test:content` 退出码 1 且只报 ch08-4。
Commit：`chore(test): split content validation from code unit tests, unblock prebuild`

---

## 验收标准（全部满足才算完成）

- `git ls-files .claude .trae` 为空；`git ls-files | Select-String 'tar.gz'` 为空。
- `scripts/` 顶层只剩构建链 + SOP 工具，`scripts/README.md` 存在。
- §3 列出的 6 项死代码全部不存在于工作区；`rg HtmlCanvasLayer` 零命中。
- `pnpm exec tsc --noEmit`、`pnpm lint`（含 knip）、`pnpm test` 三者退出码 0。
- `pnpm test:content` 只报 `ch08-4` 一例。
- `pnpm build` 能走过 `prebuild`（`next build` 本身若因环境变量失败不算本计划问题）。
- `tsconfig.json` 与 `eslint.config.mjs` 不再排除测试文件。

## 风险与回滚

- 每阶段独立 commit，任一阶段出问题 `git revert` 该 commit 即可。
- 阶段 B 第 6 项（token 单源）是唯一触碰运行时逻辑的改动；若 `MODEL_TOKEN_LIMITS` 被 `lib/context/**` 多处消费且数值与 `contextK` 有差异，先保留双源但加注释指向差异，留给 `22` 处理，不要在本计划里猜数值。
- knip 首跑可能报出 `lib/ai/agent/tools.ts` 之外的"看似未用"导出（如被 Electron 主进程动态 require 的模块）。凡不确定的一律 `@public` 标注保留，宁可漏删不可误删。

## 输出

完成后在本文件末尾追加"执行记录"小节：每阶段 commit hash、knip 首跑数量与处理方式、C2 第三条规则命中数、C3 暴露的告警数量。
