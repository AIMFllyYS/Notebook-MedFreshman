# 22 · Agent 架构体系收敛计划

> 背景与根因见 `17-code-quality-audit-2026-09.md` §6。
> 本计划由**一次 AI 会话**独立完成。前置依赖：`18`（死代码已删、knip 与边界规则生效）、`20`（artifact 术语与路径地图已落地，`ManagedWindow` 已存在）。`19`、`21` 不是硬依赖，但建议在它们之后执行，避免同时改 `components/chat/**`。
>
> 这是五份计划里改动面最大的一份，但每个阶段都是纯重构（行为不变），有 2500+ 条测试兜底。

---

## 目标

1. **工具注册表**：每个 Agent 工具一个目录，定义 / 类型 / 展示元数据 / 结果卡片同目录；新增工具只改一处，`ChatMessage.tsx` 不再硬编码分发。
2. **Store 收敛**：28 个 Zustand store 全部落到 `lib/stores/`，统一 `persist` 封装，`lib/hooks/` 只剩真正的 React hook。
3. **`useChat.sendMessage` 拆分**：九件事拆成可单测的纯函数，hook 只剩编排。
4. **`ChatSettings.tsx`（1621 行）拆分**为按职责的子面板。
5. `RightPanel` 的 tab 列表由内容能力驱动（若 `21` 已完成此项则跳过）。

## 非目标

- 不改任何工具的 prompt 描述、inputSchema、执行逻辑、`toModelOutput`。
- 不改 `studyAgent.ts` 的 `ToolLoopAgent` 配置、stopWhen、步数限制。
- 不改上下文管理（`lib/context/**`）的策略；token 单源若 `18` 已完成则不再动。
- 不改持久化数据格式（IndexedDB / localStorage 的 key 与 schema）——store 搬家必须保持 `persist` 的 `name` 不变。
- 不改 SSE 端点（`/api/chat`、`/api/artifact`、`/api/document`、`/api/image-gen`）。

---

## 现状（执行前核对）

**工具链四处分散**（以 `renderInteractive` 为例）：
- 定义：`lib/ai/agent/tools.ts`（573 行，13 个工具的 `tool()` 全在一个文件，`buildStudyTools` 导出）
- 类型：`lib/ai/agent/toolTypes.ts`（`StudyTools` 联合、`STUDY_TOOL_NAMES`）
- 展示：`lib/chat/toolPresentation.ts`（`TOOL_PRESENTATION: Record<StudyToolName, …>`，含 label / icon / 设置文案 / `TOGGLEABLE_TOOLS`）
- 卡片：`components/chat/ChatMessage.tsx:121-183`，七段 `getToolPartsByName(message, 'xxx').map(...)`，`renderInteractive` 与 `generateImage` 另走 `resultCards` 去重（`:55-66`）
- 追踪：`lib/chat/buildTrace.ts` 按工具名判断状态与摘要

**Store 分布**：`lib/hooks/` 21 个（`useArtifacts`、`useDocuments`、`useImageGen`、`useWindowManager`、`useFloatingChats`、`useChatHistory`、`useSettings`、`useSkills`、`useTokenTracker`、`useFloatingTokenTracker`、`useBillingStore`、`useTheme`、`useAcademicYear`、`useBrowser`、`useReviewCards`、`useRecordPreviews`、`useNoteCitations`、`useNoteLocator`、`useContextMenu`、`useChatUI`、`useChat*` 之外的若干）、`lib/keyboard/` 5 个、`lib/store.ts`（全局 UI：rightTab / topBarCollapsed / 路由同步）、`lib/quiz-store.ts`、`lib/stores/lightbox.ts`。

**`useChat.ts:89-249`**：`sendMessage` 单个 `useCallback` 160 行。

**`ChatSettings.tsx`**：内部已有 `Toggle`、`ModelRow`（:212）、`ModelForm`（:327，约 450 行）、`ApiGroupCard`（:783）等子组件，但都在同一文件。

---

## 阶段 A · 工具注册表

### A1 目标结构

```
lib/ai/agent/tools/
  index.ts                 # 汇总：TOOL_REGISTRY、buildStudyTools、STUDY_TOOL_NAMES、StudyTools 类型
  registry.ts              # ToolModule 接口定义
  getCurrentPage/
    tool.ts                # tool() 定义（服务端）
    types.ts               # Input / Output 接口（客户端安全）
    presentation.ts        # label / icon / 设置文案 / toggleable
  searchNotes/
    tool.ts  types.ts  presentation.ts
    ResultCard.tsx         # 现 NoteCitationCard
  renderInteractive/
    tool.ts  types.ts  presentation.ts
    ResultCard.tsx         # 现 ArtifactCard 的挂载壳（ArtifactCard 本体留在 components/chat，壳只做 props 映射）
  ...（13 个工具）
```

`registry.ts`：

```ts
export interface ToolModule<N extends StudyToolName> {
  name: N;
  presentation: ToolPresentation;
  /** 客户端：把该工具 output-available 的 parts 渲染为结果卡片。返回 null 表示该工具无卡片。 */
  ResultCard?: React.ComponentType<{ part: ToolPart<N>; message: ChatMessage; isStreaming: boolean; ctx: ResultCardContext }>;
  /** 结果卡片去重键（renderInteractive / generateImage 按 artifactId / imageGenId 去重）。 */
  resultKey?: (part: ToolPart<N>) => string | null;
  /** 卡片渲染条件（如 hits.length > 0）。缺省 = output-available && !preliminary */
  shouldRender?: (part: ToolPart<N>) => boolean;
}
```

**服务端/客户端边界**：`tool.ts` 会 import 服务端模块（fs、索引、fetch 密钥），**绝不能**被 `index.ts` 的客户端导出链带进浏览器。做法：`index.ts` 只导出类型 + `presentation` + `ResultCard`；`buildStudyTools` 放在 `lib/ai/agent/tools/server.ts`，只被 `studyAgent.ts` 与 API route 引用。加一条 ESLint `no-restricted-imports`：`components/**` 与 `lib/hooks/**` 禁止 import `lib/ai/agent/tools/**/tool.ts` 与 `server.ts`。

### A2 迁移步骤

1. 先建 `registry.ts` 与空 `index.ts`，把 `toolTypes.ts` 的 13 组 Input/Output 拆到各 `types.ts`，`toolTypes.ts` 变为 re-export（保持旧 import 路径可用，knip 会提示它成为纯桶文件，加 `@public`）。
2. 把 `toolPresentation.ts` 的 `TOOL_PRESENTATION` 拆到各 `presentation.ts`；`toolPresentation.ts` 改为从 registry 汇总生成同名导出（旧调用方不变）。
3. 把 `tools.ts` 的 13 个 `tool()` 拆到各 `tool.ts`；`server.ts` 的 `buildStudyTools` 按 `STUDY_TOOL_NAMES` 顺序汇总。**`tools.ts` 里工具之间共享的辅助函数**（dedup contextKey、`toModelOutput` 封装等）放 `lib/ai/agent/tools/_shared.ts`。
4. 结果卡片：为七个有卡片的工具（`searchNotes` / `webSearch` / `renderInteractive` / `generateImage` / `createQuiz` / `searchNoteImages` / `writeDocument`）写 `ResultCard.tsx`，内容就是 `ChatMessage.tsx:121-183` 对应那一段。`ChatMessage.tsx` 改为：

```tsx
{TOOL_RESULT_CARDS.map(({ name, ResultCard, resultKey, shouldRender }) =>
  getToolPartsByName(message, name)
    .filter((p) => p.state === 'output-available' && !p.preliminary && (shouldRender?.(p) ?? true))
    .filter(dedupBy(resultKey))
    .map((p) => <ResultCard key={resultKey?.(p) ?? p.toolCallId} part={p} message={message} isStreaming={isStreaming} ctx={ctx} />))}
```

`imageSearch` 的图片条（`:184-216`）与 `source-document` part（`:128-132`）不是工具卡片，保留在 `ChatMessage` 内或抽成 `MessageSourcesStrip`。

5. `buildTrace.ts` 若有按工具名的 switch，改读 registry 的 `presentation`。

### A3 测试

- 每个 `ResultCard.tsx` 一个 vitest（渲染一个 fixture part，断言关键文本）。
- `lib/ai/agent/tools/registry.test.ts`（node:test）：`STUDY_TOOL_NAMES` 与 registry key 一一对应；每个模块 `presentation.label` 非空；有 `resultKey` 的模块必有 `ResultCard`。
- 现有 `lib/ai/agent/*.test.ts`、`components/chat/AgentTrace.test.tsx`、`components/chat/ChatMessage*.test.tsx`、`lib/chat/*.test.ts` 全部保持通过——它们是行为不变的证据。

Commit（分 4 个）：`refactor(agent): tool registry skeleton and per-tool types` / `… per-tool presentation` / `… per-tool server definitions` / `refactor(chat): dispatch tool result cards via registry`

---

## 阶段 B · Store 收敛

### B1 统一封装

新建 `lib/stores/_persist.ts`：

```ts
export function createPersistedStore<T>(name: string, initializer: StateCreator<T>, opts: { storage: 'idb' | 'local'; version?: number; migrate?: …; partialize?: … })
```

内部选 `idbStorage`（现 `lib/storage/idbStorage.ts`）或 `createJSONStorage(() => localStorage)`。**`name` 必须与现有 store 的 `persist` name 逐字相同**，否则用户数据丢失。执行前先 `rg "name: '" lib/hooks lib/keyboard lib/store.ts lib/quiz-store.ts` 列出全部 persist name 并写进本文件执行记录。

### B2 搬家规则

- 文件名去掉 `use` 前缀：`lib/hooks/useArtifacts.ts` → `lib/stores/artifacts.ts`，导出保持 `useArtifacts`（hook 名不变，调用方只改 import 路径）。
- 原路径保留一个 re-export 文件一个发布周期（`export * from '@/lib/stores/artifacts'`），knip 会报它们为桶文件，加 `@public` + `@deprecated` 注释；`23` 或更后再删。
- 纯 React hook（内部无 `create(`，如 `useIsMobile`、`useHydrated`、`useToc`、`useStickToBottom`、`useDraggable`）**不动**。
- `lib/keyboard/` 5 个 store 搬到 `lib/stores/keyboard/`。
- `lib/store.ts` → `lib/stores/ui.ts`；`lib/quiz-store.ts` → `lib/stores/quiz.ts`。
- 搬完后 `lib/stores/index.ts` 不做桶导出（避免把所有 store 打进每个页面 bundle），只放一份 README 列表。

### B3 测试

现有 `lib/hooks/*.test.ts(x)` 随文件搬到 `lib/stores/`；`tests/windowManager.test.ts` 等按新路径改 import。`pnpm test` 全绿是唯一标准。

真机：清 IndexedDB 前先导出一份聊天历史；搬家后刷新，历史、设置、主题、快捷键、计费记录、复习卡全部还在。

Commit（每 5–6 个 store 一个）：`refactor(stores): move <list> to lib/stores with shared persist helper`

---

## 阶段 C · `useChat.sendMessage` 拆分

从 `useChat.ts:89-249` 抽出纯函数到 `lib/chat/`：

- `canSendNow(history, ovSessionId): boolean` —— `:90-96` 的水合/会话门控。
- `resolveRequestSettings(settings, options, sendOptions, ovModelId): ResolvedRequestSettings` —— `:99-108` 模型/思考/搜索/上下文模式。
- `estimateContextBudget(tracker, model, messages, userContent): { limit, estimated, softLimitReached }` —— `:137-147`。
- `buildChatRequestBody(ctx, settings, resolved, budget, skills, academicYear): ChatRequestBody` —— `:186-200` 的 20 个字段，并给 `ChatRequestBody` 一个显式类型（当前是匿名对象，服务端 `app/api/chat/route.ts` 另有一份解析，两边应共用类型）。
- `createStallWatchdog(onStall, timeoutMs = 60_000)` —— `:176-181`。
- `kickoffSessionTitle(sessionId, userContent, ctx)` —— `:117-130`。
- `resolveFollowUps(latest, userContent)` —— `:222-227` + `fallbackQuestions`。
- `classifySendError(err, { stalled, aborted }): string | null` —— `:230-238`。

`useChat` 内 `sendMessage` 变成约 50 行编排。每个纯函数一个 node:test 文件。`lib/hooks/useChat.test.tsx` 现有用例全部保持通过。

Commit：`refactor(chat): split useChat.sendMessage into testable helpers`

---

## 阶段 D · `ChatSettings.tsx` 拆分

拆成目录 `components/chat/settings/`：

- `ChatSettings.tsx` —— 壳：分区导航 + 挂载各子面板（≤ 150 行）
- `ModelSection.tsx` —— 模型选择、`ModelRow`、默认思考强度
- `ModelForm.tsx` —— 自定义模型表单（现 `:327` 起约 450 行，独立文件）
- `ApiGroupsSection.tsx` —— `ApiGroupCard` 与分组增删
- `ToolsSection.tsx` —— `TOGGLEABLE_TOOLS` 开关 + `20` 加的 `artifactFullscreenTarget`
- `ImageSection.tsx` —— `SIZE_OPTIONS` / 生图模型
- `ContextSection.tsx` —— 全局上下文
- `SkillsSection.tsx` —— 技能管理
- `_shared.tsx` —— `Toggle`、字段行等原子

规则：只搬不改；每个子面板的 props 就是它原来从 `useSettings` 读写的那几个字段（可以直接在子面板内 `useSettings(selector)`，不必 prop drilling）。现有 `ChatSettings` 相关测试（`rg "ChatSettings" --glob '*.test.tsx'`）保持通过。

Commit：`refactor(chat): split ChatSettings into section panels`

---

## 阶段 E · 偿还 `18` 遗留的门禁降级债

计划 18 为了"建立门禁但不改业务组件"，把 7 条规则从 error 降为 warn。验收实测（见 `18` 文末执行记录）：去掉降级后 **53 条 error，全部在生产代码，测试文件 0 条**。分布：

- `react/no-unescaped-entities` 24 条 —— 集中在 `components/interactives/**`，改法是把裸 `'` `"` 换成实体或用 `{'…'}`，纯文本改动
- `react-hooks/set-state-in-effect` 17 条 —— 含 `RightPanel.tsx`、`BrowserTab.tsx`、`useAutoHideChatHeader.ts`、`VideoTab.tsx`
- `react-hooks/refs` 4 条、`@typescript-eslint/no-explicit-any` 3 条、`react-hooks/preserve-manual-memoization` 3 条、`react-hooks/purity` 1 条、`react-hooks/static-components` 1 条

做法：先 `pnpm exec eslint . -f json` 导出完整清单（按规则分组），**按规则逐条修、逐条把该规则从全局 warn 块里删掉**，每修完一条规则跑一次 `pnpm lint` + `pnpm test:react`，单独提交。`no-unescaped-entities` 与 `no-explicit-any` 最安全、先做；`react-hooks/*` 涉及行为，需谨慎，改完必须真机验证对应组件（右侧面板 tab 切换、浏览器 tab、视频 tab、聊天头部自动隐藏）。

注意：`react-hooks/set-state-in-effect` 里若有 `ChatThread.tsx` / `useStickToBottom.ts` 的条目，先查 `19` 的执行记录——那里可能已列为"已知既有 error"，不要与 `19` 的改动冲突。

同时收紧 `18` 留下的两处配置妥协：

- `knip.json` 的 `$schema` 从 knip@5 改为 knip@6（安装的是 `knip ^6.34.0`）
- `knip.json` 的 `ignoreIssues: { "**": ["types", "duplicates"] }`：先去掉看数量（`18` 首跑是 types 89 / duplicates 28），能清则清，清不完的收窄到具体目录而不是 `**`
- `knip.json` 的 `entry` 补 `tests/helpers/vitest-setup.ts`

Commit：每条规则一个 `fix(lint): restore <rule> to error` + 一个 `chore(lint): tighten knip config`

## 阶段 F · 收尾

- `lib/ai/agent/toolTypes.ts:3` 注释更新为真实目录结构。
- `docs/refer/framework-extension.md`（或新建 `docs/refer/adding-an-agent-tool.md`）：新增一个工具的完整步骤 = 新建 `lib/ai/agent/tools/<name>/` 四个文件 + 在 `STUDY_TOOL_NAMES` 加一项，附一个最小示例。
- `docs/research/04-ai-chat-system.md` 与 `06-state-management.md` 的目录结构段落更新。
- 跑 `pnpm exec knip`，清理阶段 B 产生的 re-export 桶文件之外的所有告警。

Commit：`docs(agent): document tool registry and store layout`

---

## 验证

- `pnpm exec tsc --noEmit && pnpm lint && pnpm test`（期望 node:test ≥ 2300、vitest ≥ 240，因新增测试而增加）。
- `rg "getToolPartsByName\(message, '" components/chat/ChatMessage.tsx` 零命中。
- `rg "create\(" lib/hooks lib/keyboard lib/store.ts lib/quiz-store.ts` 零命中（除 re-export 文件）。
- `Get-Content components/chat/settings/ChatSettings.tsx | Measure-Object -Line` ≤ 150。
- `wc -l lib/hooks/useChat.ts` ≤ 120。
- 真机回归清单：发消息（含思考、联网、附件）、每个工具至少触发一次并看到卡片、切模型、改设置每个分区各改一项并刷新验证持久化、划词浮窗聊天、任务栏窗口切换、计费面板数字连续。

## 验收标准

- `lib/ai/agent/tools/` 下 13 个工具目录，每个 ≥ `types.ts` + `presentation.ts` + `tool.ts`；七个有 `ResultCard.tsx`。
- `ChatMessage.tsx` 通过 registry 渲染结果卡片，无工具名字面量。
- `lib/stores/` 含全部 28 个 store，`lib/hooks/` 无 `create(` 调用。
- 所有 persist `name` 与执行前清单逐字一致（写进执行记录）。
- `useChat.ts` ≤ 120 行且 `lib/chat/` 新增 ≥ 7 个纯函数各带测试。
- `ChatSettings.tsx` ≤ 150 行。
- 新增工具的文档存在。
- `eslint.config.mjs` 里 `18` 加的全局 warn 规则块**已清空**（7 条全部修回 error 级默认），`pnpm lint` 仍为 0 error；若有个别规则确实无法在本计划内清完，必须收窄到具体文件/目录 override 并在执行记录里列出剩余条数与原因，不允许继续以全局 `rules` 块的形式存在。

## 风险与回滚

- **阶段 A 的服务端/客户端边界是最大风险**：一旦 `index.ts` 间接导出了 `tool.ts`，Next 会在客户端 bundle 里报 `fs` 找不到或直接把密钥读取逻辑打进浏览器。A1 的 ESLint 规则必须在 A2 第 3 步之前落地；每步之后跑一次 `pnpm build`（不只是 `tsc`）。
- **阶段 B 的 persist name**：任何一个写错都会让用户看到"空白历史/设置重置"。执行记录里的 name 清单是唯一防线；搬家 commit 里 diff 必须能看到 `name:` 行未变。
- **阶段 C 改变了闭包捕获**：`sendMessage` 目前依赖 `[chatContext, options, ovSessionId, ovModelId]`，拆出的纯函数以参数接收所有输入，不能偷懒用 `getState()` 之外的模块级状态。`lib/hooks/useChat.test.tsx` 与 `useChatHistory.lifecycle.test.ts` 是回归护栏。
- **阶段 E 的 `react-hooks/*` 修复涉及运行时行为**（`set-state-in-effect` 的修法通常是把 effect 里的 setState 改成派生 state 或事件驱动），17 条里每一条都要单独判断，不能机械套模板。改到 `RightPanel.tsx` / `VideoTab.tsx` / `BrowserTab.tsx` 时注意 `21` 可能已经改过同一批文件（tab 列表由能力驱动），先读最新代码。
- 六个阶段严格顺序执行，各自可独立 revert；不要跨阶段合并 commit。阶段 E 与 A–D 无耦合，若时间紧可作为独立后续任务，但不得从验收标准里删掉。
- 若阶段 B 中途发现某个 store 被 Electron 主进程或 `scripts/` 直接 import（非 React 上下文），保留原路径 re-export 永久存在并注明原因，不要强搬。
