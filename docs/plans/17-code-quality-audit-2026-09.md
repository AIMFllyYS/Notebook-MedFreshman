# 17 · 全量代码质量审查报告（2026-09）

> 性质：**交接文档**。本文只记录事实、证据与判断，不含执行步骤。执行步骤拆在 `18`–`22` 五份计划里，每份对应一个独立体系，各由一次 AI 会话完成。
>
> 审查方式：三路并行子代理（Agent 架构 / 页面展示 / 工程规范）+ 主线直读关键文件 + 工具链实测（`tsc`、`eslint`、`node:test`、`vitest`、`git ls-files`）。所有行号以审查当日 `HEAD` 为准，执行时请重新核对。

---

## 0. 结论摘要

项目功能面很宽（内容平台 + AI Agent + 消息内画布 + 浮窗系统 + Electron + Manim），但代码是多轮不同模型迭代堆叠的结果。核心症状五条：

1. **同一能力多套并存实现，旧实现未删**：AI HTML 沙箱 iframe 有 4 套（1 套死代码）；窗口拖拽/缩放/全屏逻辑复制 8 份；工具定义文件新旧两份。
2. **注释与实际代码路径脱节**：`DiagramCanvas.tsx` 注释声称 html 模式走 `HtmlCanvasLayer`，实际走 `renderers/HtmlRenderer`。这是"改半天没反应"的直接原因。
3. **对话面板四套滚动/布局机制互相不知情**，流式生成时每帧博弈 → 页面上下抖动。
4. **内容展示层"一套重布局硬套所有内容类型"**：manifest 里声明的 `capabilities` 在渲染层未被消费，纯文档型课件被迫渲染三栏 + 四 tab。
5. **工程基线有洞**：测试文件被排除在 `tsc`/`eslint` 之外；`.claude/`、`.trae/`、27MB 的 `docs/refer/prototype-v0.0.tar.gz` 被 git 跟踪；内容校验测试串在 `prebuild` 里，1 例内容失败即阻塞构建。

2026-07 的 `docs/research/overview.md` 那轮审计列出的问题中，"状态分散"、"大文件组件"、"工具/UI 硬编码耦合"三项仍未解决。

---

## 1. 质量基线（实测）

- `pnpm exec tsc --noEmit`：通过。
- `pnpm lint`（`eslint .`）：通过。
- `node scripts/run-unit-tests.mjs`（node:test）：2302 例，**2301 过 / 1 失败**。失败项：`tests/content/sophomore-textbooks.test.ts` → `cell-biology/textbook/ch08-4 有图题但没有任何 ![] / ::figure 图片引用`。这是内容缺图，不是代码缺陷，但 `package.json` 的 `prebuild` 末尾串接了 `node scripts/run-unit-tests.mjs`，所以 **当前 `pnpm build` 会失败**。
- `pnpm exec vitest run`：51 文件 / 221 例全过。
- `pnpm test` 用 `&&` 串接两套测试，第一套失败时第二套根本不跑。

配置层面的洞：

- `tsconfig.json` `exclude` 含 `**/*.test.ts`、`**/*.test.tsx`；`eslint.config.mjs` `globalIgnores` 同样排除。**2500+ 条测试的类型正确性与 lint 无人保证。**
- `lib/stores/` 目录只有 `lightbox.ts` 一个文件，其余 27 个 Zustand store 散落在 `lib/hooks/`、`lib/keyboard/`、`lib/` 根（`lib/store.ts`、`lib/quiz-store.ts`）。

---

## 2. Git 卫生

### 2.1 被跟踪的编辑器/代理元数据

```
.claude/workflows/generate-all-chapters.js
.claude/workflows/generate-physics-videos.js
.claude/workflows/verify-quiz.js
.trae/documents/*.md（3 个）
.trae/specs/**/{spec,tasks,checklist}.md（6 个 spec 目录，共 16 个文件）
```

这些是历史 AI 工具的工作产物，不是项目源码。`.gitignore` 里**已经**写了 `.claude/`、`.trae/`，但这些文件是在加 ignore 规则之前就被跟踪的，ignore 对已跟踪文件无效，需要 `git rm -r --cached`。`.trae/specs/` 的内容有归档价值，应搬到 `docs/archive/` 而不是留在工具私有目录。

### 2.2 大文件

- `docs/refer/prototype-v0.0.tar.gz` **27.2 MB**，二进制归档进了 git 历史。
- `public/images/**` 下 14 个 >1 MB 的教材扫描图（最大 `histology/textbook/p0222_01.png` 9.8 MB）。这些是运行时资源，需要保留，但应压缩（WebP/AVIF）或走 LFS。
- `public/rdkit/RDKit_minimal.wasm` 6.6 MB：运行时必需，保留。

### 2.3 `scripts/` 目录（77 个文件）

大致分三类：

- **构建链必需**（`prebuild` 引用）：`check-content-encoding.mjs`、`gen-nav-manifest.ts`、`check-registry-consistency.ts`、`gen-script-ids.mjs`、`check-katex-chars.mjs`、`check-recording-example-latex-escapes.mjs`、`check-media-sync.mjs`、`check-prose-svg-rules.mjs`、`run-unit-tests.mjs`、`build-index.ts`、`build-desktop.mjs`、`gen-icon.mjs`。
- **内容 SOP 工具**（可复用）：`extract-textbook-pdf.py`、`ingest-sophomore-textbooks.py`、`fallback-{docx,pdf,pptx}.py`、`propagate-images*.py`、`embed-missing-figures.py`、`enhance-medical-markdown.py`、`parse-docs.ts`、`verify-models.ts`、`test-render-all.mjs`。
- **一次性脚本**（章节号硬编码，任务已完成）：`fix-ch03.js`、`fix-ch08.js`、`gen-rec-10.mjs`、`gen-rec-c.mjs`、`gen-rec-c8.mjs`、`write-rec-11.mjs`、`write-rec-12.mjs`、`gen-maogai-quiz-ch01-03.py`、`gen-maogai-quiz-ch08-12.py`、`gen_maogai_quiz_*.py`（4 个）、`gen-physics-exercises-ch*.py`（2 个）、`generate-physics-ch01-04-examples.py`、`gen_rec_quiz_01_04.py`、`gen_unit5_main.py`、`fix-quiz-json.js`、`fix-quiz-json-v2.js`、`fix-maogai-quotes.js`、`fill-maogai-example-answers.ts`、`*-maogai-textbook.ts`（7 个）、`*-modern-history-textbook.{ts,py}`（4 个）、`ai-image-generation-prompt.txt`、`project-introduction.txt`。

一次性脚本约 35 个，占目录一半，且无 README 说明哪些还能跑。

### 2.4 其他

- `content/probability/shizyan-yanlian/` 目录名拼写错误（`category-templates.ts` 里的标准 id 是 `shizhan-yanlian`）。`.gitignore` 已将其列为 "typo directory" 忽略，说明是本地残留；执行时用 `git ls-files` 确认未跟踪后直接删本地目录。
- `docs/refer/` 下有两个文件名乱码的 `.md`（编码损坏）。

---

## 3. 死代码清单（已逐一确认无生产引用）

| 文件 | 行数 | 证据 |
|---|---|---|
| `lib/ai/tools.ts` | 536 | 仅被 `lib/ai/tools.test.ts` 引用；生产路径全部走 `lib/ai/agent/tools.ts`（573 行）。两者工具描述文案大量重复 |
| `lib/types/tools.ts` | — | 仅被 `lib/ai/tools.ts` 引用 |
| `lib/ai/artifactRegistry.ts` | 4 | 内容为 `export {};` |
| `components/canvas/HtmlCanvasLayer.tsx` | 52 | 仅被 `components/canvas/index.ts` 导出；`DiagramCanvas.tsx:37` 注释声称路由到它，实际 `DiagramCanvas → CanvasBlockRenderer → renderers/HtmlRenderer`。`171e1330 refactor(canvas): split renderers` 拆分后遗留 |
| `components/canvas/MoleculeRenderer.tsx`（顶层） | 79 | 同上，已被 `renderers/MoleculeRenderer.tsx` 取代，仅剩 `index.ts` 导出 |
| `lib/chat/toolPresentation.ts` 的 `summarize*` 函数 | — | 无调用方 |
| `lib/ai/models.ts` `contextK` 与 `lib/context/types.ts` `MODEL_TOKEN_LIMITS` | — | 同一份模型上下文上限的两个来源 |

> 注：本表用了表格是因为它是纯清单；正文其他部分不用表格。

---

## 4. 专题 A：对话面板流式抖动

### 4.1 涉及文件

- `components/chat/ChatThread.tsx`（221 行）—— 虚拟列表 + 滚动容器
- `lib/hooks/useStickToBottom.ts`（50 行）—— rAF 贴底循环
- `components/chat/ChatInput.tsx:115` —— ResizeObserver 上报 `composerInset`
- `components/chat/ChatPanel.tsx:44,150`、`components/chat/FloatingChatBody.tsx:35,88` —— `composerInset` 初值 150，传给 `bottomInset`
- `app/globals.css:545-555` —— `#notes-panel{contain:layout}`、`.chat-messages{contain:layout}`、`.chat-message{content-visibility:auto; contain-intrinsic-size:0 72px}`
- `components/chat/ChatMessage.tsx:69` —— 根节点 `className="chat-message ..."`
- `components/chat/AgentTrace.tsx` + `lib/hooks/useProcessingDisclosure.ts` —— processing→done 时折叠
- `lib/chat/streamUiThrottle.ts` —— 流式 UI 节流

### 4.2 根因一：浏览器级虚拟化与 JS 虚拟化打架（主因）

`ChatThread` 用 `@tanstack/react-virtual`，`estimateSize: 72`、`overscan: 10`，靠 `virtualizer.measureElement`（内部 ResizeObserver）记录每条真实高度。同时 `.chat-message` 又设置了 `content-visibility: auto; contain-intrinsic-size: 0 72px`。

后果：离屏（含 overscan 区）消息的内容被浏览器跳过渲染，元素尺寸退化为 72px 占位；ResizeObserver 据此把它记成 72px。滚动/流式推进使其进入视口，浏览器渲染真实内容，高度变为真实值，ResizeObserver 再记一次。`totalSize` 在两组值之间反复翻动，tanstack 每次修正 offset（`shouldAdjustScrollPositionOnItemSizeChange` 默认开）都让整列跳动。overscan 10 意味着最多 10 条消息处于"JS 认为在渲染、浏览器认为可跳过"的矛盾态。

作者其实已意识到这个 CSS 的副作用：`app/styles/canvas.css:216` 注释写到全屏被 `.chat-messages{contain:layout}` / `.chat-message{content-visibility:auto}` 裁在气泡里，所以 `CanvasFullscreenPortal` 不得不 portal 到 body。

### 4.3 根因二：三个滚动驱动同时写 `scrollTop`

- `useStickToBottom(scrollRef, isLoading)`：`isLoading` 期间每帧 `requestAnimationFrame` 检查并把 `scrollTop = scrollHeight`。
- `ChatThread.tsx:110-113`：effect 依赖 `[messages, ...]`（整个数组引用），每个节流片段触发 `virtualizer.scrollToIndex(last, { align: 'end' })`。它按**上一次测量的高度**计算目标偏移，而最后一条正在增高，于是目标偏移偏小 → rAF 循环再推到底 → measureElement 更新 → 下一片段又算一次。
- tanstack 自身的尺寸变化偏移修正。

三者写同一个 `scrollTop`，方向和时机不一致。

### 4.4 根因三：底部内边距双重叠加

`ChatThread.tsx:133-134` 给容器 `paddingBottom: safeBottomInset` + `scrollPaddingBottom: safeBottomInset`，`:82` 又给 virtualizer `scrollPaddingEnd: safeBottomInset`。`scrollToIndex(align:'end')` 会把 `scrollPaddingEnd` 再算一次。`composerInset` 又由 `ChatInput` 的 ResizeObserver 实时上报，输入框高度一变（多行输入、附件、引用）整列重排。

### 4.5 根因四：最后一条消息上的高度突变源

流式期间所有高度突变都发生在最后一条——恰好是三套滚动机制争抢的锚点：`AgentTrace` 完成时折叠、`ArtifactCard`/`DocumentCard` 从骨架变完整卡、`.chat-loading`"AI 正在思考中"行的出现/消失、`FollowUpQuestions` 在 `!isStreaming` 时插入。容器没有 `overflow-anchor: none`，Chrome 滚动锚定还会再插一手。

### 4.6 修复方向

见 `19-plan-chat-thread-scroll.md`。核心是：CSS 虚拟化与 JS 虚拟化二选一（保留 tanstack）；流式期间只留一个滚动驱动；`scrollPaddingEnd` 与 `paddingBottom` 二选一；`overflow-anchor: none`；`overscan` 降到 3–4。

---

## 5. 专题 B："撰写可视化 HTML"（renderInteractive）组件归属混乱

### 5.1 现象 A 的解释："改完在页面中间笔记区出了组件"

`components/chat/ArtifactViewer.tsx:74-79`：

```ts
const rect = document.getElementById("notes-panel")?.getBoundingClientRect();
if (rect && rect.width > 0 && rect.height > 0) {
  commitGeometry(winId, { pos: { x: rect.left, y: rect.top }, size: { width: rect.width, height: rect.height } });
}
setFullscreen(winId, true);
```

`ArtifactViewer` 的"全屏"被**设计成把浮窗坐标对齐到 `#notes-panel`（中间笔记区）**。它是 `createPortal(…, document.body)` 的 fixed 浮窗，DOM 上不属于右侧面板也不属于笔记区，而是 `AppShell` 挂的全局窗口层。任何按"它显示在笔记区中间"去找代码的人/模型，会在 `components/notes/` 找不到，然后就地新建一份。

### 5.2 现象 B 的解释："让它改右侧面板组件，改半天没反应"

项目里同时存在 4 套"沙箱 iframe 渲染 AI HTML"：

1. `components/chat/ArtifactViewer.tsx` —— `renderInteractive` 工具产物的浮窗查看器（**活**，由 `ArtifactCard` 的"打开演示"触发，数据在 `lib/hooks/useArtifacts.ts`）
2. `components/canvas/renderers/HtmlRenderer.tsx` —— `drawDiagram` html 模式 / `::canvas` 指令的**消息内联**画布（**活**）
3. `components/canvas/HtmlCanvasLayer.tsx` —— **死代码**。文档注释写"AI 写入的 HTML…沙箱 iframe"，`DiagramCanvas.tsx:37` 注释声称 html 模式路由到它，`components/canvas/index.ts:10` 仍导出。按关键词搜索"AI HTML iframe"最先命中的就是它。改它当然没有任何反应。
4. `app/[subject]/[category]/[id]/ContentPageClient.tsx` —— `renderType === 'html'` 的内容页 iframe（含全屏、新开标签），与 1 功能重叠

### 5.3 命名冲突让搜索失效

- "interactive"：既是 `components/interactives/registry.ts` + `InteractiveTab`（手写 React 交互组件，右侧面板"可交互"tab），又是 `renderInteractive` 工具（AI 生成 HTML artifact，走浮窗）。用户说"右侧 Agent 面板的可视化 HTML"，模型会在 `InteractiveTab` 和 `ArtifactViewer` 之间迷路。
- "canvas"：`components/canvas/` 是消息内 SVG/HTML/分子/函数图画布，与 Cursor Canvas、HTML `<canvas>` 无关。
- "artifact" 只出现在 `ArtifactCard/ArtifactViewer/useArtifacts/lib/ai/artifact.ts/api/artifact`，工具名却叫 `renderInteractive`，`toolPresentation.ts` 里的标签又叫"撰写可视化 HTML"。三个名字指同一件事。

### 5.4 窗口逻辑八份复制

`ArtifactViewer`、`ImageGenViewer`、`DocumentViewer`、`NoteCitationViewer`、`SourcePreviewViewer`、`SourceTraceViewer`、`FloatingChatWindow`、`components/review/RecordPreviewWindow` 各自拼装：`useDraggable` + `useResizable` + `WindowChrome` + `createPortal(body)` + `preExpandRef` 全屏切换 + `openExternal` Blob URL + 右下角缩放柄 SVG + `useOverlayRegistration` + `useFullscreenTrack`。`ArtifactViewer.tsx:94-165` 这 70 行在其他七个文件里几乎逐字重复。`lib/hooks/useWindowManager.ts` 已经是好的中心（`ManagedWindowType`、z 序、几何提交），缺的是一个消费它的通用 `ManagedWindow` 组件。

### 5.5 修复方向

见 `20-plan-window-artifact-system.md`。

---

## 6. Agent 架构

### 6.1 合理的部分

- AI SDK 7 `ToolLoopAgent`（`lib/ai/agent/studyAgent.ts`，156 行）+ `buildStudyTools`（`lib/ai/agent/tools.ts`）是干净的单入口。
- artifact / document 走独立 SSE 端点（`app/api/artifact/route.ts`、`app/api/document/route.ts`），主对话流不被大 HTML 阻塞，设计正确。
- 上下文层 `FullContextManager` / `SemanticSearchManager` + `lib/context/factory.ts` 的双模式抽象正确。
- `lib/chat/consumeStudyStream.ts`、`lib/chat/messageParts.ts`、`lib/chat/buildTrace.ts` 把流解析、part 归一化、trace 构建拆开了，方向对。

### 6.2 问题

**工具结果 → UI 卡片分发硬编码在 `ChatMessage.tsx:121-183`。** 每个工具一段 `getToolPartsByName(message, 'xxx').map(...)`，`renderInteractive` / `generateImage` 走 `resultCards` 去重逻辑，其他五个各自一段。新增工具要改四处：`lib/ai/agent/tools.ts`（定义）、`lib/ai/agent/toolTypes.ts`（类型）、`lib/chat/toolPresentation.ts`（标签/图标/设置文案）、`components/chat/ChatMessage.tsx`（卡片）。

**Store 分散。** 28 个 `create(` 调用分布在 `lib/hooks/`（21 个）、`lib/keyboard/`（5 个）、`lib/store.ts`、`lib/quiz-store.ts`，`lib/stores/` 只有 `lightbox.ts`。持久化策略各自选择（`idbStorage` vs `localStorage` vs 不持久化），没有统一封装。

**`ChatSettings.tsx` 1621 行。** 模型配置、自定义 API 分组、工具开关、思考强度、全局上下文、技能管理全部在一个组件里。

**`useChat.ts`（251 行）的 `sendMessage` 是一个 160 行闭包。** 流解析已正确下沉到 `consumeStudyStream.ts`（无重复），但闭包内仍串着九件事：水合门控、设置快照、首轮标题请求、token 预算估算与双 tracker 分发、请求 body 组装（20 个字段）、60 秒停滞检测、流消费回调、追问兜底、错误分类。每件事都不可单测。

**`lib/ai/agent/toolTypes.ts:3` 注释指向不存在的目录。** 注释写"服务端 `lib/ai/agent/tools/*.ts` 用 zod 定义 inputSchema"，实际是单文件 `lib/ai/agent/tools.ts`（573 行）。说明作者曾计划按工具拆目录但未执行。

**token 上限双源。** `lib/ai/models.ts` 的 `contextK` 与 `lib/context/types.ts` 的 `MODEL_TOKEN_LIMITS` 各维护一份。

**`RightPanel.tsx` 无视 `capabilities`。** `RIGHT_TABS` 固定四项（ai / video / interactive / browser），不管当前内容是否声明了 `media` 能力。

### 6.3 修复方向

见 `22-plan-agent-architecture.md`。

---

## 7. 内容展示层

### 7.1 `capabilities` 只是数据，不驱动 UI

`lib/content-data/category-templates.ts:13-18` 为每个板块声明了 `capabilities: ['examples','quiz','search','media']` 子集，`lib/content/categoryKeys.ts` 与 `app/[subject]/[category]/[id]/page.tsx:69` 用它决定**是否去读**例题/测验文件。但渲染层：

- `ContentPageClient.tsx`（315 行）对所有 `renderType`（markdown / html / component）走同一个三栏重布局，内容/例题/测验 tab 结构固定。
- `RightPanel.tsx` 四个 tab 固定。
- `AppShell.tsx`（364 行）不区分内容类型。

结果：`summary`（课堂纪要，`capabilities: ['search']`）、`kaoqian-moni`（`capabilities: []`）以及**新导入的纯文档课件**都被套进为"详解"设计的重布局。

### 7.2 `loader.ts` 的硬编码特判

`lib/content/loader.ts:15,43`：`CONTENT_ROOT = content/chapters`，`getSubjectMeta(subjectId)?.contentRoot?.detail === "chapters" && categoryId === "detail"` 走另一套目录结构。这是历史遗留的学科级例外，应转为 manifest 声明式配置。

### 7.3 修复方向

见 `21-plan-content-layout-profiles.md`。核心是引入 `layoutProfile: 'full' | 'article' | 'reference'`，由 `capabilities` 推导默认值，`ContentPageClient` / `RightPanel` / `AppShell` 消费它。

---

## 8. 其他板块（本轮未发现结构性问题，仅记录）

- **Electron**：`electron/` 与 `scripts/build-desktop.mjs`，未发现与 web 层的不当耦合。
- **PWA**：`app/manifest.ts`，正常。
- **Manim**：`manim/render.py` 产物直接进 `public/`，是 §2.2 大文件的来源之一；建议产物走独立目录并 gitignore，由构建脚本拷贝。
- **测试双框架**：`node:test`（内容/纯逻辑）+ Vitest（React），并存可接受；问题只在串接方式（§1）。
- **错误边界**：`RightPanel.tsx:49` 已有 `RightPanelTabBoundary`，2026-07 审计的"缺错误边界"已部分解决；`ContentPageClient` 侧是否覆盖需执行时核实。

---

## 9. 计划文档索引与执行顺序

五份计划按体系切分，每份由一次 AI 会话独立完成，前后依赖如下：

- `18-plan-engineering-baseline.md` —— 工程基线体系：Git 卫生、死代码删除、分析工具链（knip / boundaries / 测试纳入 tsc+eslint）、测试脚本链修复。**无依赖，先做**。它建立的 `knip` 与 import 边界规则是后面四份的防回退网。
- `19-plan-chat-thread-scroll.md` —— 对话流式渲染体系：抖动修复。依赖 18（需要 lint 基线）。用户可感知收益最大。
- `20-plan-window-artifact-system.md` —— 窗口 / Artifact 体系：`ManagedWindow` 抽取、八个 viewer 迁移、artifact 全屏语义显式化、`renderInteractive → htmlArtifact` 改名。依赖 18。
- `21-plan-content-layout-profiles.md` —— 内容展示体系：`layoutProfile`、`capabilities` 消费、`loader.ts` 特判声明化。依赖 18；与 20 可并行。
- `22-plan-agent-architecture.md` —— Agent 架构体系：工具注册表、store 收敛到 `lib/stores/`、`useChat` 下沉、token 单源、`ChatSettings` 拆分。依赖 18、20（改名先落地）。

拓扑：`18 → { 19, 20, 21 } → 22`。
