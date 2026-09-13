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

---

## 端测遗留问题（2026-09-09/10，三批验收发现，均非本计划回归）

前两批端测已通过（数据完整性、工具卡片与 `writeDocument` 按钮）。下面这些是**顺带暴露**的问题，不属于计划 22 的回归，但都是真实缺陷，记录在此以免丢失。

### 1. `writeDocument` 生成的正文逐节漂移（用户可见，优先级最高）

计划 22 修好了「进度卡在 `0/N`、按钮不露出」之后，**这个功能的输出第一次被人看到**——此前 IndexedDB 的 `documents` 表一直是 **0 条**，说明历史上从来没有一篇文档成功落库。

实测（第二批）：一篇 6 节的「细胞膜的化学组成与流动性」，第 **3、4、6** 节是正经讲义（定义框、运动方式表、必背数字），第 **1、2、5** 节却是「他沉默片刻……」这类散文灌水，且只有 **70 / 125 / 178 字**，远低于 `buildSectionInstructions` 里 `perSection = max(250, targetWords/total)` 的要求。

已排除的原因：

- **不是提示词缺约束**。`lib/documents/prompts.ts:67` 明确写了「本节约 N 字；写完自然收束，不要为凑字数注水」。
- **不是体裁选错**。`DocumentSpec.genre` 是模型填的必填字段，一篇文档内恒定；若整篇走了 `essay`（体裁指引是「篇幅精炼」、`DEFAULT_TARGET_WORDS.essay = 1200`）就该整篇偏散文，而实测是**同一篇里三节讲义、三节散文**。

剩下的可疑源头（留给修复方核实，不要凭猜就改）：

1. **outline 阶段给 1/2/5 节写的 `brief` 本身偏叙事**。`buildOutlinePrompt` 只给标题与写作要求，没有约束 `brief` 的文体；`brief` 会原样进 `buildSectionPrompt` 的「要点」。
2. **`previousTail` 把散文腔带下去**。`buildSectionPrompt` 会把前文结尾 1200 字作为衔接上下文，一旦第 1 节跑偏，后面容易被带着走。
3. 单节字数下限没有服务端校验：节明显短于 `perSection` 时既不重试也不告警。

复现与诊断建议：触发一次 `writeDocument`，从 IndexedDB 取出该 `StoredDocument`，先看 `spec.genre` 与 `spec.brief`，再逐节看 `sections[i].brief` 与 `markdown`，判断是 outline 的 `brief` 就跑偏了、还是 section 阶段没守住。修复方向大概率在 `lib/documents/prompts.ts`（给 `brief` 与单节正文加文体约束、按体裁给出正/负样例），必要时在 `app/api/document/route.ts` 加「节过短则重写一次」的兜底。

### 2. IndexedDB 里约 50 份孤立会话（存储卫生，非回归）

第一批实测：`chat-session:*` 有 **53 个键**，但 `chat-manifest`（v2）只列 **3** 条会话；`chat-blob:*` 14 个。也就是约 50 份会话正文留在库里但界面上已无入口，`chat-history` 键不存在（v2 预期，不是丢失）。搬家前后一致，**不是计划 22 造成的**。需要一个「按 manifest 回收孤立 session/blob」的清理流程，或在设置的数据分区里给用户一个入口。

### 3. 其余观察（低优先级）

- `imageSearch` 返回的 4 张是无关库存图（图库/检索质量，卡片本身正常）。
- 控制台警告 `Encountered a script tag while rendering React component`（HTML 演示进 React 树），无红屏。
- 关闭深度思考后，Qwen3.8 27B 的思考链里仍会出现英文思考步，单次 7–20s，未堵住工具调用。
- 结果卡去重（`resultKey` 按 `artifactId` / `imageGenId`）**未能在流式中构造出重复 part**，只做了代码级确认（`resultCards.tsx` 的 `dedupBy`）。如需真机证据，得注入伪造的 tool part。

---

## 派发前校准（2026-09-09，主智能体实测）

本计划正文写于计划 `18` 之前，其间 `18`/`19`/`20` 已落地，下面这些数字以本节为准。

**基线（`20` 验收当日实测）**

| 项 | 计划正文 | 实测 |
|----|----------|------|
| `pnpm lint` | — | 0 error / **150 warning** |
| hooks 自查 error 数 | 53（`18` 验收时） | **25**（`components lib` 范围，`20` 后） |
| `components/chat/ChatSettings.tsx` | — | **1604 行** |
| `lib/hooks/useChat.ts` | `89-249` 行的 `sendMessage` | 全文 **232 行**，`sendMessage` 约 160 行，与正文描述一致 |
| store 数量 | 28 | 严格按 `from "zustand"` + `create` 只数出 **22**，放宽到别名/包装导入 26+ |

- 那两个 error 数不是同一口径：`18` 验收的 53 是把七条降级规则全部抬回 error 后的全量数；25 是本节命令那五条规则在 `components lib` 下的数。**阶段 E 开工第一件事是用统一命令重新测一次并把口径写进执行记录**，不要拿 53 和 25 直接相减。
- store 数量以你自己的清点为准，不要照抄 28。清点时注意 store 的导入写法不统一（有的 `from "zustand"`，有的走别名或包装），漏一个就会漏一份 persist 数据。**阶段 B 的 persist name 清单必须基于你实际找到的全集。**

**计划 `20` 已确立、本计划不得回退的**

见 `00-execution-contract.md` 第六节「窗口层契约」。与本计划直接相关的三条：

1. 工具 id `renderInteractive` **不得改名**（已持久化进 IndexedDB 聊天历史）。阶段 A 把工具搬进 `lib/ai/agent/tools/<name>/` 时，目录名可以用别的，但 `STUDY_TOOL_NAMES` 里的 id 字面量不能动。
2. 浮窗外壳唯一实现是 `components/window/ManagedWindow.tsx`。阶段 D 拆 `ChatSettings` 时若涉及浮层，复用它，不要手写 portal。
3. `components/chat/BillingDashboard.tsx` 是 `components` 下**唯一**还留着 `useResizable(` 的窗口类组件，有意未迁移。阶段 F 跑 knip / 扫死代码时不要把它或 `lib/window/openBillingDashboard.ts` 判成废弃。
   （注意：契约第六节早期版本把它的路径写成 `components/review/`，已修正为 `components/chat/`。）

**计划 `20` 验收遗留、并入本计划的检查点**

1. **`writeDocument` 的进度卡死在 `0/3`，导致 `DocumentCard` 上的「查看文档」按钮始终不露出。** 验收时是绕过按钮、用卡片上已挂载的 `openViewer` 才打开文档窗的。窗口层没问题，问题在文档工具的进度/完成态回传。阶段 A 重整 `writeDocument` 时一并查清：定位 `components/chat/DocumentCard.tsx` 的进度来源，确认是流式事件没发终态、还是卡片没消费终态，修好后真机验证按钮会出现。这是用户可见缺陷，**不算超范围**。
2. Artifact 的「在新标签页打开」：`lib/utils/openHtmlInNewTab.ts` 用的是 `window.open(url, "_blank", "noopener")`，代码是对的；验收在自动化浏览器里观察到"导航当前 tab"大概是 harness 把弹窗折叠成同标签导航。**请在真人浏览器里手点一次确认，不要因为自动化的观察去改这段代码。**
3. 浮窗交通灯的全屏按钮与页面顶栏的全屏按钮 `title` 都是「全屏」，容易点错。若阶段 D 顺路经过，可把浮窗侧改成更具体的文案（如「窗口全屏」）；不顺路就不做，别为它单开改动。
4. 路径地图的已知漏洞：只搜「可视化」两个字仍会落到 `components/interactives/registry.ts` 与 `ChatMessageVisualizations.tsx`。阶段 F 写文档时可在灯塔注释里补一句"不要只搜『可视化』"。

---

## 执行记录

> 执行日期：2026-09-09。分支 `dev`，未 push。对方在途文件 `docs/refer/exam-type-distribution.md`、`docs/refer/mineru-parsing-guide.md` 原样未动。

### 1. 各阶段 commit

**阶段 A · 工具注册表**

| Hash | 说明 |
|------|------|
| `c9da02ae` | `refactor(agent): tool registry skeleton and per-tool types` |
| `a147e6ee` | `refactor(agent): per-tool presentation` |
| `115266a4` | `refactor(agent): per-tool server definitions` |
| `f1573b7b` | `refactor(chat): dispatch tool result cards via registry`（含 writeDocument 0/3 修复） |

**阶段 B · Store 收敛**

| Hash | 说明 |
|------|------|
| `1a34b126` | artifacts / documents / imageGen / skills / reviewCards / billing + `_persist.ts` |
| `154ad25c` | settings / theme / academicYear / browser / chatHistory |
| `36047765` | windowManager / floatingChats / chatUI / contextMenu / noteCitations / noteLocator |
| `d0459173` | keyboard 五个 store |
| `9cd97071` | recordPreviews / tokenTracker / floatingTokenTracker / ui / quiz |
| `7a4788d7` | `fix(stores): point keyboardSettings at lib/keyboard/shortcuts after move` |

**阶段 C · sendMessage 拆分**

| Hash | 说明 |
|------|------|
| `0c3bac9c` | `refactor(chat): split useChat.sendMessage into testable helpers` |

**阶段 D · ChatSettings 拆分**

| Hash | 说明 |
|------|------|
| `5019b59c` | `refactor(chat): split ChatSettings into section panels` |

**阶段 E · lint 欠账**

| Hash | 说明 |
|------|------|
| `3602ac1c` | `fix(lint): restore react/no-unescaped-entities to error` |
| `d483c57e` | `fix(lint): restore @typescript-eslint/no-explicit-any to error` |
| `a9bd3feb` | `fix(lint): restore react-hooks/purity to error` |
| `576504f6` | `fix(lint): restore react-hooks/static-components to error` |
| `dd23b00b` | `fix(lint): restore react-hooks/preserve-manual-memoization to error` |
| `f7206a64` | `fix(lint): restore react-hooks/refs to error` |
| `27aa9b9e` | `fix(lint): restore react-hooks/set-state-in-effect to error` |
| `c3828533` | `chore(lint): tighten knip config` |

**阶段 F · 收尾**

| Hash | 说明 |
|------|------|
| `cc626cec` | `docs(agent): document tool registry and store layout` |

### 2. 实际改动与计划的偏差

1. **先留 `tools.ts` 再删**，避免与新建的 `tools/` 目录抢 `@/lib/ai/agent/tools` 解析。
2. **卡片顺序按现网**（`RESULT_CARD_ORDER`），不是 `STUDY_TOOL_NAMES`。
3. registry 完整性测试改用 vitest；源码护栏改为读拆分后的 `tool.ts` / `types.ts`。阶段 C/D 之后 `tests/customProviderCompatibility.test.ts` 与 `tests/sessionTitle.test.ts` 仍读旧壳文件，F 收尾时改指向 `_shared.tsx` / `ModelForm.tsx` / `kickoffSessionTitle.ts`。
4. ResultCard 放在 `lib/ai/agent/tools/<name>/` 再映射 `components/chat/*`，`lib → components` 是计划内 warning。
5. **writeDocument 0/3 修在 `DocumentCard` 本体**，不是工具定义：`create()` 写入 store → `doc` 进 effect deps → cleanup `abort()` → `startedRef` 已置位不再重发。修法：首帧锁定 `shouldAutoGen`；cleanup 不 abort；按钮条件 `done || (doc && !inFlight)`。
6. **store 数以自己清点的 28 为准**（校准节严格写法只数出 22，是漏数）。清点：搜 `from "zustand"` / `from 'zustand'` 且文件内有 `create(`。
7. **自定义 persist 不要套 `createPersistedStore`**（会换序列化格式）。helper 不能把 `partialize: undefined` 传进 zustand persist（会盖掉默认 identity）。
8. keyboardSettings 搬家后 `./shortcuts` 要改成 `@/lib/keyboard/shortcuts`（`7a4788d7`）。
9. `useChat` 为压到 120 行额外拆了 `executeChatRequest` / `hydrateForRequest` / `sendMessage` 桶（`@public`）。
10. ChatSettings 多拆了 `AppearanceSection` / `DataSection`（Billing + Export）/ `_ApiGroupCard`；`ModelSection` 拆成 Builtin / RecordAssistant / Defaults 三个导出以保持原 UI 分区顺序。
11. `ParsedBlock.props` 从 `any` 改为 `Record<string, unknown>` 后，`MessageContent.tsx` 的 `compProps?.name` 要 `typeof === "string"` 收窄。
12. 阶段 E 开工口径是 **52**（`eslint components lib app --format json`，七条规则，排除 `*.test.*`），不是正文 53、也不是校准 25。`ChatThread.tsx` / `useStickToBottom.ts` **不在**这 16 条 `set-state-in-effect` 里，未改滚动契约。
13. `useAutoHideChatHeader` 不能把「关自动隐藏」与 `pinned` 两条 render-time setState 并列，否则会互斥死循环；改成 if/else if。
14. knip `$schema` 改 knip@6；`tests/helpers/vitest-setup.ts` 按计划写入 entry，knip 6 + vitest 插件已覆盖故提示 redundant（`treatConfigHintsAsErrors: false`）。去掉 `**` ignore 后首跑 types **59** / duplicates **1**；清完后 `ignoreIssues` 只留 3 个公共类型桶。
15. 计划 20 遗留 3（浮窗 title「窗口全屏」）不在 ChatSettings 路径上，**未做**。
16. `lib/content-data/index.ts` 只删了未使用的 `ContentRoute` 类型 re-export，未改任何数据条目。

### 3. 计划要求记录的数据

**persist name 全集（阶段 B 唯一防线；搬家 diff 中 `name:` / LS key 未改字面量）**

zustand persist + idb：`artifacts`、`documents`、`image-gen`、`skills`、`review-cards`、`billing-history`。

自定义 localStorage：`gailvlun-settings-v1`、`gailvlun-theme`、`gailvlun-appearance-v1`、`gailvlun-academic-year`、`gailvlun-browser-v1`、`gailvlun-disabled-shortcuts`、`gailvlun-sidebar-collapsed`、`gailvlun-topbar-collapsed`、`quickExplainWindowSize`、`gailvlun-quiz-progress-v1`（在 `lib/quiz-progress.ts`）。

chatHistory 自定义 idb：`chat-history` / `chat-manifest` / `chat-session:*` / `chat-blob:*`。

不持久化：windowManager、noteLocator、noteCitations、recordPreviews、tokenTracker、floatingTokenTracker、contextMenu、chatUI、reviewKeyboard、shortcutHelp、globalSearch、overlayStack、lightbox。

**store 实际总数：28。** 清点方法见上。清单见 `lib/stores/README.md`。

**阶段 E lint error（统一口径：`pnpm exec eslint components lib app --format json`，七条规则，排除测试）**

| | 开工前 | 完成后 |
|--|--------|--------|
| 合计 | **52**（全部生产代码，测试 0） | **0** |
| `react/no-unescaped-entities` | 24 | 0 |
| `react-hooks/set-state-in-effect` | 16 | 0 |
| `react-hooks/refs` | 4 | 0 |
| `@typescript-eslint/no-explicit-any` | 3 | 0 |
| `react-hooks/preserve-manual-memoization` | 3 | 0 |
| `react-hooks/purity` | 1 | 0 |
| `react-hooks/static-components` | 1 | 0 |

`eslint.config.mjs` 计划 18 的全局 warn 块已整段删除，七条回到 error 级默认。个别文件保留行内 disable（DocumentCard / ArtifactCard / RecordPreviewWindow / QuizTab 的既有注释）。

**knip**

- 计划 18 首跑（历史）：types 89 / duplicates 28。
- 本计划去掉 `ignoreIssues: { "**": ["types","duplicates"] }` 后首跑：unused types **59**、duplicates **1**（`normalizeDirectiveLabels` 双导出）。
- 收尾：duplicates 0；types 仅忽略 3 个公共桶（`lib/ai/agent/tools/index.ts`、`lib/context/index.ts`、`components/visualizations/primitives/index.ts`）。`pnpm exec knip` 退出码 0。

**13 个工具目录**（均含 `types.ts` + `presentation.ts` + `tool.ts`）

`getCurrentPage`、`getOutline`、`getSection`、`searchNotes`、`searchNoteImages`、`webSearch`、`imageSearch`、`renderInteractive`、`drawDiagram`、`generateImage`、`createQuiz`、`writeDocument`、`useSkill`。

七个有 `ResultCard.tsx`：searchNotes、webSearch、renderInteractive、generateImage、createQuiz、searchNoteImages、writeDocument。

**门禁**

- `useChat.ts` 120 行；`components/chat/settings/ChatSettings.tsx` 47 行。
- `ChatMessage.tsx` 无 `getToolPartsByName(message, '…')`。
- `lib/hooks` / `lib/keyboard` / `lib/store.ts` / `lib/quiz-store.ts` 无 `create(`。
- `pnpm exec tsc --noEmit`、`pnpm lint`、`pnpm test`：node:test **535**、vitest **245**，均绿。`pnpm test:content` 本跑 1915 全过（契约里那条 ch08-4 基线失败本次未再现，未改内容）。
- 阶段 A 每步曾跑 `pnpm build`（此前会话）。
- 本机 `http://localhost:35349` 首页 200。无浏览器 MCP，真机点击清单未做完（见 §4）。

### 4. 未完成项与原因

1. **真机回归清单未完整点过**：本执行环境没有可用的浏览器 outpost。dev server 已起过并确认首页 200，结束前已杀掉 35349。发消息 / 13 工具卡片 / 切模型 / 设置分区持久化 / 划词浮窗 / 任务栏 / 计费连续 / writeDocument「查看文档」真机按钮 / Artifact「新标签页打开」手点，均需验收方补做。
2. **计划 20 遗留 3**：浮窗交通灯 title 改为「窗口全屏」——阶段 D 未经过 `ManagedWindow` / `WindowChrome`，按计划不单开。
3. **writeDocument 真机按钮**：代码与 `DocumentCard.test.tsx` 已绿（完成态出现「查看文档」；卡住 outlining 且不在生成也会露出按钮）。**真机未点过**，不能声称按钮已在真人浏览器出现。

### writeDocument 0/3（校准节第 1 条）

- **根因**：卡片 effect 依赖 `doc`；`create()` 写入 store 后 cleanup `abort()` 掐断请求，且 `startedRef` 已置位不再重发。进度停在 `0/3`，`status` 停在 `outlining`，按钮条件看不到完成态。
- **代码已修**（`f1573b7b`）。不是流式终态没发，是卡片自己把请求掐死。
- **真机按钮是否出现：未验证。** 单测会露出按钮。验收必须真人触发一次 `writeDocument`。

