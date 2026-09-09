# 23 · UI 层归位（让分层规则可强制）

> 前置：`22` 已完成并通过端测。本计划由**一次 AI 会话**独立完成。
> 起因：`22` 的验收中，主智能体发现 `lib → components` 的反向依赖从 16 处涨到 27 处，且 `eslint.config.mjs` 里那条 `no-restricted-imports` 仍是 `warn`，注释还写着"计划 22 再拆"。

---

## 为什么必须做（不是架构洁癖）

**这个分层倒置已经造成过一次真实崩溃。** `components/quiz/QuizMarkdown.tsx:34-36` 的注释原文：

> 不能在模块顶层展开 `directiveComponents`。因为 `MemoryCard` 属于 `directiveComponents`……入口顺序下触发 TDZ（`Cannot access 'directiveComponents' before initialization`）。

当时的处理是把展开推迟到函数内部**绕过**环，而不是消除环。只要 `lib/markdown/*` 继续 import `components/*`，同类 TDZ 随时可能在别的入口顺序下复现，而且每次都表现为难以定位的"某个组件 undefined"。

**第二个理由：`warn` 等于没有护栏。** 仓库当前有 108 条 warning，一条埋在里面的 `warn` 不会被任何人看见。规则要么是 `error`，要么删掉——留成 `warn` 只是自欺。

**第三个理由：桶里有个还没引爆的地雷。** `lib/ai/agent/tools/index.ts` 自述是"类型、展示元数据与结果卡片"的客户端入口，却**值导出**了 `TOOL_REGISTRY` / `TOOL_RESULT_CARDS`（转发自 `catalog.ts`，而 `catalog.ts` 饥饿导入 7 个 React 卡片）。服务端路由里一句 `import { STUDY_TOOL_NAMES } from "@/lib/ai/agent/tools"` 就会把整条聊天 UI 依赖图拖进服务端 bundle。实测当前**零处**引用这个桶——这正是危险所在：它是留给下一个加工具的人的陷阱，今天没人踩不等于明天没人踩。

## 判断依据（实测，2026-09-10 派发前复测）

- `git grep "@/components" -- lib` = **27 处 / 9 个文件**：`lib/ai/agent/tools/**/ResultCard.tsx` 7 处 + 其中 4 个 `ResultCard.test.tsx` 的 `vi.mock` 4 处 + `lib/markdown/directiveComponents.ts` 14 处 + `lib/markdown/noteComponents.tsx` 2 处。
- **ESLint 只报 23 条**，因为测试文件不在 `lib/**` 那条规则的作用域内。两个数字都对，不要以为有一处漏搬：`27 = 23 + 4 个测试 mock`。搬完后**两个数字都必须归零**。
- **卡片测试是 7 个而不是 4 个**（计划 `22` 给 7 个卡片都补了测试）。阶段 A 要搬 **7 个** `ResultCard.test.tsx`，其中只有 4 个（`searchNoteImages` / `createQuiz` / `generateImage` / `renderInteractive`）含需要改路径的 `vi.mock`。
- `lib/ai/agent/tools/` 的设计其实九成是对的：`server.ts` 已独立装配服务端；`presentations.ts` 是纯数据（`icon` 是字符串联合 `ToolIconKind`，不是 JSX）；`registry.ts` 是纯类型。**缺陷只集中在客户端渲染三件**：`catalog.ts`（**87** 行）、`resultCards.tsx`（**51** 行）、7 个 `ResultCard.tsx`。桶 `index.ts` **34** 行。
- 7 个 `ResultCard.tsx` 都是**十行左右的适配器**，把 typed tool part 映射到已存在的 `components/chat/*Card` 上，真 UI 不在 `lib` 里。
- `RESULT_CARD_ORDER` 的注释自陈是"现网 ChatMessage 卡片顺序（不是 STUDY_TOOL_NAMES）"——这是渲染决策，不是工具属性。
- `TOOL_RESULT_CARDS` 的消费方只有 `lib/ai/agent/tools/resultCards.tsx` 与 `registry.test.tsx`；Agent 运行时（`studyAgent.ts` / `server.ts`）一个都不消费。
- `lib/markdown` 两个映射表很小：`directiveComponents.ts` **32** 行、`noteComponents.tsx` **12** 行。消费方四处：`components/chat/MessageContent.tsx`、`components/notes/NoteRenderer.tsx`、`components/notes/NoteRendererServer.tsx`、`components/quiz/QuizMarkdown.tsx`。

## 为什么不选"放宽规则"

放宽 `lib/ai/agent/tools/**` 可以导入 `components/chat/**` 是最小改动，但它让例外变成常态：下一个加工具的人看到这条豁免，自然的下一步就是把真 UI 写进 `lib`，规则从此不再保护它存在的理由。而且它不解决 TDZ 环，也不拆掉桶里的地雷。

---

## 目标

1. `lib/**` 不再 import `components/**`，`no-restricted-imports` 那条规则设为 **`error` 且零例外**。
2. 消除 `QuizMarkdown` 的 TDZ 绕行，模块顶层可以正常展开。
3. `lib/ai/agent/tools/index.ts` 变成真正安全的同构桶：只导出类型与 presentation，任何服务端文件都能放心 import。
4. 新增一个工具的成本仍然是"一个目录 + 一行"，并且**不引入计划 20 那类"找不到文件"**。

## 非目标

- 不改任何工具的行为、schema、id（`renderInteractive` 等工具 id 已持久化进 IndexedDB，**绝对不改名**）。
- 不改 `ChatMessage` 的卡片渲染顺序与去重语义（`RESULT_CARD_ORDER` 逐字保持，`resultKey` / `shouldRender` 逐个保持）。
- 不动 `server.ts`、`presentations.ts`、`registry.ts`、`names.ts`、各工具的 `types.ts` / `presentation.ts` / `tool.ts`。
- 不动 markdown 渲染管线本身（`remark`/`rehype` 插件链、`prose.css`），只搬"名字 → 组件"的映射表。
- 不顺手拆 `lib/markdown` 的其他文件。

---

## 目标结构

```
lib/ai/agent/tools/                    ← 服务端 + 同构契约，永不 import components
  names.ts  registry.ts  presentations.ts  _types.ts  _shared.ts
  server.ts                            ← 服务端装配（不动）
  index.ts                             ← 只导出类型 + presentation（收回 catalog 的值导出）
  <name>/{types.ts, presentation.ts, tool.ts}

components/chat/toolCards/             ← 客户端渲染层，方向正确地依赖 lib
  <name>Card.tsx                       ← 原 lib/.../<name>/ResultCard.tsx（7 个）
  <name>Card.test.tsx                  ← 原 ResultCard.test.tsx（4 个）
  registry.tsx                         ← 原 catalog.ts 的客户端部分 + RESULT_CARD_ORDER
  ToolResultCards.tsx                  ← 原 lib/.../resultCards.tsx
  README.md                            ← 加一个工具卡片的步骤

components/shared/directives/
  registry.ts                          ← 原 lib/markdown/directiveComponents.ts
components/notes/
  noteComponents.tsx                   ← 原 lib/markdown/noteComponents.tsx
```

---

## 阶段 A · 工具卡片归位

1. 建 `components/chat/toolCards/`。把 7 个 `lib/ai/agent/tools/<name>/ResultCard.tsx` 搬为 `components/chat/toolCards/<name>Card.tsx`，内容除 import 路径外**逐字不动**（都带 `"use client"`，保留）。**7 个** `ResultCard.test.tsx` 一并搬为 `<name>Card.test.tsx`，其中 4 个的 `vi.mock` 路径同步。用 `git mv` 搬，保住文件历史。
2. `catalog.ts` 拆成两半：
   - 纯数据部分（`TOOL_REGISTRY` 里 `name` + `presentation` + `resultKey` + `shouldRender`）如果 Agent 运行时确实需要，留在 `lib`；**实测 `studyAgent.ts` / `server.ts` 不消费 `TOOL_REGISTRY`**，所以整体搬到 `components/chat/toolCards/registry.tsx`。搬之前**再确认一次**没有 `lib` 侧消费方，若有则只搬带 `ResultCard` 的那部分。
   - `RESULT_CARD_ORDER`、`ToolResultCardEntry`、`TOOL_RESULT_CARDS` 一并进 `registry.tsx`。
3. `lib/ai/agent/tools/resultCards.tsx` 搬为 `components/chat/toolCards/ToolResultCards.tsx`，更新 `ChatMessage.tsx` 的 import。
4. `lib/ai/agent/tools/registry.test.tsx` 里断言卡片顺序的用例随 `registry.tsx` 搬到 `components/chat/toolCards/registry.test.tsx`；**断言的顺序数组逐字不变**（它是防止渲染顺序回退的唯一护栏）。
5. 删除 `lib/ai/agent/tools/catalog.ts` 与 `resultCards.tsx`。

Commit：`refactor(agent): relocate tool result cards to components/chat/toolCards`

## 阶段 B · 收紧工具桶

1. `lib/ai/agent/tools/index.ts` 删掉 `export { TOOL_REGISTRY, TOOL_RESULT_CARDS, RESULT_CARD_ORDER }` 那一行，并把文件头注释改成"只导出类型与展示元数据；客户端渲染层在 `components/chat/toolCards/`"。
2. 确认桶导入后不再拉任何 React 组件：`pnpm exec tsc --noEmit` 后，在某个 `app/api/**` 里临时 `import { STUDY_TOOL_NAMES } from "@/lib/ai/agent/tools"`，跑 `pnpm build`，确认服务端 chunk 里不出现 `components/chat` 的痕迹；**测完撤销这个临时 import，不要留在工作区**。

Commit：`refactor(agent): keep tool barrel free of client components`

## 阶段 C · markdown 映射表归位与消除 TDZ

1. `lib/markdown/directiveComponents.ts` → `components/shared/directives/registry.ts`（导出名 `directiveComponents` 保持不变，减少调用方改动面）。
2. `lib/markdown/noteComponents.tsx` → `components/notes/noteComponents.tsx`（导出名 `noteComponents` 不变）。
3. 更新四处调用方 import：`components/chat/MessageContent.tsx`、`components/notes/NoteRenderer.tsx`、`components/notes/NoteRendererServer.tsx`、`components/quiz/QuizMarkdown.tsx`。
4. **消除 TDZ 绕行**：`QuizMarkdown.tsx:34-43` 那段"不能在模块顶层展开"的注释与延迟展开，在环消除后应当不再必要。改回模块顶层展开，**并真机验证 quiz 页面（含 `MemoryCard` 指令的题目）不报 `Cannot access ... before initialization`**。若改回后仍报错，说明还有别的环，**保留绕行并在执行记录里写清真实环路**，不要硬改。
5. `NoteRendererServer.tsx` 是服务端组件，搬完后确认它仍能 SSR（`pnpm build` 通过即可）。

Commit：`refactor(markdown): move component maps to UI layer and drop TDZ workaround`

## 阶段 D · 规则归位与路径地图

1. `eslint.config.mjs`：`files: ["lib/**"]` 那条 `no-restricted-imports` 从 `warn` 改 **`error`**，删掉"存量：lib/markdown……计划 22 再拆"的注释。**注意扁平配置的后写覆盖**：`lib/hooks/**` 那块必须仍排在 `lib/**` 之后，否则 hooks 会丢掉 `tool.ts` 边界（这个坑 `22` 已经踩过并在注释里标注了，不要打乱顺序）。
2. `pnpm lint` 必须 0 error。若仍有 `lib → components` 命中，说明漏搬，补完再改规则——**不允许加豁免把它压下去**。
3. 路径地图（防止再出现计划 20 那类"改错文件"）：
   - 每个 `lib/ai/agent/tools/<name>/presentation.ts` 顶部加一行注释：该工具的结果卡片在 `components/chat/toolCards/<name>Card.tsx`。
   - `components/chat/toolCards/README.md`：加一个工具卡片的完整步骤（建 `<name>Card.tsx` + 在 `registry.tsx` 加一行 + 若需去重加 `resultKey`），并写明 `lib` 侧只放 types / presentation / tool。
   - `docs/refer/rendering-architecture.md` 的"四条渲染路径"一节同步新路径。
   - 更新 `22` 文末执行记录提到的 `lib/stores/README.md` 同级说明（若有引用旧路径）。

Commit：`chore(lint): enforce lib-must-not-import-components` + `docs(agent): document tool card layer`

---

## 验证

- `pnpm exec tsc --noEmit`、`pnpm lint`（**0 error**）、`pnpm test:react`、完整 `pnpm test`、完整 `pnpm build`。
- 基线（计划 `22` 第三批实测，退出码全 0）：`pnpm test` = node **535** + vitest **245**；`pnpm build` = **1210** 页；`pnpm lint` = 0 error / **108** warning。搬迁后 test 数不应减少（搬测试文件不改用例数），warning 应从 108 降约 23。
- `git grep "@/components" -- lib` **零命中**（含测试；见上文 27 vs 23 的口径说明）。
- `pnpm test:content` 的失败**只记录不修**，那是内容 Agent 的作业域。
- `git grep -n "TOOL_REGISTRY\|TOOL_RESULT_CARDS" -- lib` 零命中。
- `components/chat/toolCards/registry.test.tsx` 的顺序断言与搬迁前逐字一致。
- 真机：
  1. 触发 7 个有卡片的工具（`searchNotes` / `webSearch` / `renderInteractive` / `generateImage` / `createQuiz` / `searchNoteImages` / `writeDocument`），确认卡片都出现、**顺序与搬迁前一致**、`renderInteractive` 与 `generateImage` 的去重仍生效（同一 artifactId 不重复出卡）。
  2. 打开带 `:::memory` / `::video` 等指令的正文与 quiz 题目，确认指令组件正常渲染、控制台无 TDZ 报错。
  3. 笔记区正文渲染正常（`NoteRenderer` 与 `NoteRendererServer` 两条路径都看）。

## 验收标准

- `lib/**` 零 `components` 依赖，规则为 `error` 且**无任何新增豁免**。
- 13 个工具的 `types.ts` / `presentation.ts` / `tool.ts` 未被改动（`git diff --stat` 可证）。
- 工具 id 与 `RESULT_CARD_ORDER` 逐字未变。
- `QuizMarkdown` 的 TDZ 绕行已删除且真机无报错（或保留并写清真实环路）。
- 加工具的步骤文档存在且与真实目录一致。

## 风险与回滚

- **最大风险是卡片顺序与去重语义被无意改动**。`registry.test.tsx` 的顺序断言是唯一自动护栏，搬迁时不要"顺手整理"数组。四个阶段各自可独立 revert。
- 阶段 C 改回模块顶层展开是唯一有运行时行为变化的改动，必须真机验证；不确定就保留绕行并记录。
- `NoteRendererServer` 是服务端组件，搬到 `components/notes/` 后若误加 `"use client"` 会破坏 SSR——搬迁时**不要**给它加。
- 本计划不碰 store、不碰滚动、不碰窗口层，与 `19`/`20` 的既成不变量无交集；但仍须遵守 `00-execution-contract.md` 第六节（尤其不要退回 `getElementById("notes-panel")` 字面量、不要手写浮窗 portal）。

## 断环验证（2026-09-10，计划 23 之后的补救）

**结论：环已实证有害，且表现为「静默空映射」而不是崩溃。已断环，并留下测试钉死。**

### 起因

计划 23 阶段 C 删掉了 `QuizMarkdown` 里用 `useMemo` **在组件函数内**延迟展开 `directiveComponents` 的绕行，改为在**模块顶层**构造 `blockComponents` / `inlineComponents`。执行方按计划要求「改回后若不报错就删绕行」执行，当时 build 1210 页与真机都没报错，所以判定可删。

但**环并没有断**，三条边全是静态 import：

```
components/quiz/QuizMarkdown.tsx         → @/components/shared/directives/registry
components/shared/directives/registry.ts → @/components/shared/directives/MemoryCard
components/shared/directives/MemoryCard.tsx → @/components/quiz/QuizMarkdown
```

「没报错」只说明当时的模块图恰好总是先求值 `QuizMarkdown`。而 `MessageContent.tsx`、`NoteRenderer.tsx`、`NoteRendererServer.tsx` **都直接 import 这个 registry**，先求值 registry 的顺序是可达的。

### 测试（`af2c7e68`）

`components/shared/directives/registry.evaluation-order.test.tsx`：4 个用例，分别按「registry 先」「QuizMarkdown 先」「MemoryCard 先」等顺序在**各自独立的模块图**里（`vi.resetModules()` + 动态 `import()`）加载，断言 14 个指令键全部存在**且每个值都是函数**。

这个断言形状是刻意的，它同时抓两种失败形态：抛 TDZ（崩溃），以及 `{...undefined}` 合法导致的**静默空映射**。

### 实测结果（修复前）

**先求值 registry 时，`blockComponents` 只剩 `table` 和 `img`——14 个指令组件被静默丢弃，控制台干净、页面不报错。**

即：顶层展开访问到尚未初始化的 `directiveComponents`，而 `{...undefined}` 在 JS 里完全合法，于是指令映射静默变空。这比 TDZ 崩溃更难发现：题目与记忆卡里的 `:::callout`、`:::memory`、`::functionplot` 等会**全部不渲染**，没有任何报错。

历史注释里记录的 `Cannot access 'directiveComponents' before initialization` 是同一个环在另一种打包/求值组合下的崩溃形态。

### 修法（`fdce7907`）：断环，不是恢复绕行

- 新增 `components/quiz/QuizMarkdownBase.tsx`（叶子）：KaTeX + `table` / `img` / `p` 覆盖 + `cleanControlTags` / `normalizeDirectiveLabels`，**不 import 指令 registry**，额外组件走 props。
- `QuizMarkdown.tsx` = `QuizMarkdownBase` + `directiveComponents`，对外签名与行为不变（默认导出、`children` / `inline` / `className`）。组件覆盖顺序保持「先 directives，后 leaf 覆盖」，与原来逐字一致。
- `MemoryCard.tsx` 改为 import 叶子 → 环断掉（registry → MemoryCard → Base，Base 不再回指）。
- 残余环路核查：`QuizMarkdownBase` 只依赖 react-markdown / 共享插件 / `ContentImage`，而 `ContentImage` 只导入 React 与 lucide，**没有任何一条边回指 registry**。

### 行为变化及其量化（这是选这条路的前提）

断环后，MemoryCard **内部正文**不再支持嵌套指令（`:::memory` 里再写 `:::callout` 之类）。动手前把这件事量清楚了：

用 Node 扫全量正文（`git ls-files -z -- content`，避开 PowerShell 对非 ASCII 路径的八进制转义问题），按 `:::` 深度配对找出每个 memory 块的块体，再在块体内匹配容器指令 `:::name` 与叶子指令 `::name{` / `:name[`：

- 扫描文件 **3201** 个，`:::memory` 块 **711** 个，未闭合 **0** 个；
- **块内嵌套指令命中 0 处。**

故此行为变化对现有正文零影响。其余消费方（`FollowUpQuestions` / `FlipCard` / `app/[subject]/review/page.tsx` / `RecordPreviewWindow`）用的仍是完整 `QuizMarkdown`，指令能力未变。

**残留风险（低）：** AI 生成的正文若在 `:::memory` 里嵌套指令，同样不会渲染。真要支持，应让 `MemoryCard` 通过 props 接收指令映射（由调用方注入），而不是重新 import registry 把环接回去。

### 门禁

| | 基线（计划 22 第三批） | 本次 |
|--|--|--|
| `pnpm exec tsc --noEmit` | 0 | 0 |
| `pnpm lint` | 0 error / 85 warning | 0 error / **85** warning |
| `pnpm test:react` | 245 | **249**（+4 求值顺序用例），63 文件全绿 |
| `pnpm test`（node + vitest） | 535 + 245 | 退出码 0，vitest 249 |
| `pnpm build` | 1210 页 | 退出码 0 |

### 指令未静默丢失的直接证据（SSR HTML 审计，2026-09-10 主智能体实测）

**方法学要点：这个失效模式是按模块图整体发生的**——`blockComponents` 要么带全部指令、要么只剩 `table` / `img`，不存在「丢一半」。所以不必逐个枚举 14 个指令，**每条渲染路径各证一次「映射非空」即可**。又因为 Next 对客户端组件同样做 SSR，直接抓 HTML 就能覆盖三条路径，不需要浏览器，比 CDP 会话可靠得多。

对运行中的 dev server（`localhost:35349`，起于本次修复提交之后，Turbopack 按请求现编译，故服务的是当前代码）抓页：

| 页面 | 路径 | 命中的指令组件 |
|---|---|---|
| `/anatomy/textbook/ch00-2` | `NoteRendererServer` | 7 个：callout / memorycard / timeline / conceptcard / comparetable / causeeffect / keypoint |
| `/modern-history/textbook/tb-ch01-1` | `NoteRendererServer` | 8 个：上面 7 个 + eventcard |
| `/anatomy/detail/1.1` | `NoteRenderer`（客户端） | 4 个：callout / memorycard / comparetable / keypoint |
| `/biochemistry/detail/1.2` | `NoteRenderer` | 4 个（同上） |
| `/anatomy/kaoqian-moni/sim-01` | `QuizMarkdown` | callout / memorycard |
| `/anatomy/shizhan-yanlian/real-01` | `QuizMarkdown` | callout / memorycard |

**数量精确匹配（排除部分丢失）：**

| 页面 | 源码 `:::memory` | DOM `memory-card-header` |
|---|---|---|
| `/anatomy/textbook/ch00-2` | 1 | **1** |
| `/biochemistry/detail/1.2` | 38 | **38** |
| `/anatomy/kaoqian-moni/sim-01` | 2 | **2** |

**一处探针假阳性，已否证：** 首轮扫描在每页都报「裸露的未解析指令」（`:::definition` / `:::insight` / `:::timeline` / `:::callout`）。剥掉 `<script>` / `<template>` 后复核：**可见区 0 处**，整页那 52 / 89 / 207 处全部位于 Next 的 RSC 载荷（序列化的 markdown 原文）。不是缺陷。记在这里是因为后续任何人用同样手法抓页都会踩这个坑——**判「指令泄漏成裸文本」必须先剥 script**。

未在这些页面出现的 6 个（`derivation` / `historymap` / `functionplot` / `svgcanvas` / `mediaembed` / `figuremedia`）都是懒加载或 canvas / 媒体类组件，SSR 不吐特征 class，**不构成失败证据**；按上面的整体性判据，同一模块图里 callout 等能渲染就说明映射非空。

真机补充证据（断环修复落盘于 01:59:15，截图 02:22:17，晚 23 分钟）：`NoteRendererServer` 正文页上 `:::pitfall` 告警框带样式渲染、comparetable 是真表格、**记忆卡「融合与 S 期」可展开并显示「点击收起」**。

剩余需浏览器的项（cloze 挖空点击、checklist 点击、聊天侧 `MessageContent` 路径、工具卡片顺序、滚动与窗口契约抽查）由独立验收智能体执行。

---

## 并发避让

内容 Agent 的作业域是 `content/**`、`public/images|media/**`、`lib/content-data/**` 的数据条目。本计划只碰 `lib/ai/agent/tools/**`、`lib/markdown/**`、`components/**`、`eslint.config.mjs`、`docs/**`，与之零重叠。Git 纪律照 `00-execution-contract.md` 第二节：只用显式路径提交，留在 `dev`，不推送，对方的在途脏文件原样留着。

## 执行记录

> 执行日期：2026-09-10。分支 `dev`，未 push。对方在途文件 `docs/refer/exam-type-distribution.md`、`docs/refer/mineru-parsing-guide.md` 与根目录 `A-existing-data.png` 原样未动。截图只写在 `%TEMP%\srp-plan23\`，未进仓库。

### 1. 各阶段 commit

| 阶段 | Hash | Message |
|------|------|---------|
| A | `8fbeb7a2` (`8fbeb7a2f8b9553de12bedfb4fb130dcba4759c5`) | `refactor(agent): relocate tool result cards to components/chat/toolCards` |
| B | `defd5987` (`defd59871f02d0d51c46a170415db46c9b062514`) | `refactor(agent): keep tool barrel free of client components` |
| C | `a4259804` (`a4259804f2d398ea55fb668800d9d8efc6abc094`) | `refactor(markdown): move component maps to UI layer and drop TDZ workaround` |
| D | `3bb75c4c` (`3bb75c4cf0368da8aea0d2d5a61f734fe0809456`) | `chore(lint): enforce lib-must-not-import-components` |

阶段 D 的 commit body 本应再写 `docs(agent): document tool card layer`（路径地图与 README）。PowerShell 换行没有进 body，subject 已是计划要求的第一句；路径地图改动（`presentation.ts` 顶部注释、`components/chat/toolCards/README.md`、`docs/refer/adding-an-agent-tool.md`、`docs/refer/rendering-architecture.md`、`lib/ai/agent/toolTypes.ts`、`00` 第六节卡片路径）都在这个 commit 里。

### 2. 各阶段做了什么

**A · 工具卡片归位**

- `git mv` 7 个 `lib/ai/agent/tools/<name>/ResultCard.tsx` → `components/chat/toolCards/<name>Card.tsx`（内容除 import 外逐字未改，含 `"use client"`）。
- 7 个测试一并搬为 `<name>Card.test.tsx`。4 个含 `vi.mock` 的测试（`searchNoteImages` / `createQuiz` / `generateImage` / `renderInteractive`）mock 路径本来就是 `@/` 别名，**不用改**。
- `catalog.ts` → `components/chat/toolCards/registry.tsx`；`resultCards.tsx` → `ToolResultCards.tsx`；`registry.test.tsx` 随 registry 搬走。
- `RESULT_CARD_ORDER` / `resultKey` / `shouldRender` **逐字保留**。顺序断言数组仍是 `searchNotes → webSearch → renderInteractive → generateImage → createQuiz → searchNoteImages → writeDocument`。
- 工具 id 未改。`studyAgent.ts` / `server.ts` 不消费 `TOOL_REGISTRY`。

**B · 收紧工具桶**

- `lib/ai/agent/tools/index.ts` 只导出类型与 presentation；文件头改为「客户端渲染层在 `components/chat/toolCards/`」。
- 在 `app/api/health/search/route.ts` **临时** `import { STUDY_TOOL_NAMES } from "@/lib/ai/agent/tools"`，跑过 `pnpm build`（**1210** 页）。服务端 chunk `[root-of-the-server]__0bnnk8t._.js` 含 13 个工具 id，**零** `toolCards` / `components/chat` / `ArtifactCard`。`.nft.json` 会列整仓，不能当证据。
- **临时 import 已撤销**。交付时 `git diff -- app/api/health/search/route.ts` 为空。

**C · markdown 映射表与 TDZ**

- `lib/markdown/directiveComponents.ts` → `components/shared/directives/registry.ts`（导出名 `directiveComponents` 不变）。
- `lib/markdown/noteComponents.tsx` → `components/notes/noteComponents.tsx`（导出名不变，**未加** `"use client"`）。
- 四处调用方已改：`MessageContent.tsx`、`NoteRenderer.tsx`、`NoteRendererServer.tsx`（**未加** `"use client"`）、`QuizMarkdown.tsx`。
- **TDZ 绕行已删**：`QuizMarkdown` 改为模块顶层展开 `directiveComponents`，去掉 `useMemo`。
- 真实环路仍在（搬文件没拆环）：`QuizMarkdown.tsx` → `components/shared/directives/registry.ts` → `MemoryCard.tsx` → `QuizMarkdown.tsx`。计划允许「改回后仍报错则保留绕行」。vitest 与真机均未出现 `Cannot access ... before initialization`，所以绕行保持删除。若后续 Turbopack 某入口顺序再炸，应恢复绕行并写清这条环，不要硬拆 `MemoryCard`。

**D · 规则归位与路径地图**

- `eslint.config.mjs`：`files: ["lib/**"]` 的 `no-restricted-imports` 从 `warn` 改 **`error`**。`lib/hooks/**` **仍排在 `lib/**` 之后**（扁平配置后写覆盖）。
- 六处 `tool.ts` / `server.ts` 禁止导入仍全部为 `error`：`components/**`、`lib/hooks/**`、`components/notes/**`、`RightPanel.tsx`、`components/interactives/**`、`components/canvas/**`。
- 13 个 `presentation.ts` **只加了一行注释**（`types.ts` / `tool.ts` 零改动）。有卡的 7 个指向 `components/chat/toolCards/<name>Card.tsx`；无卡的 6 个写「无结果卡片」。
- 新建 `components/chat/toolCards/README.md`。同步了加工具文档与「四条渲染路径」。

### 3. 实际改动与计划的偏差

1. **阶段 A 必须先从 `index.ts` 去掉 `TOOL_REGISTRY` / `TOOL_RESULT_CARDS` / `RESULT_CARD_ORDER` 的值导出。** 删 `catalog.ts` 后若仍从桶再导出，tsc 会挂。没有从 `components` 再导出回 `lib`（那会制造新的 `lib → components`）。计划把「收紧桶」写在 B，但 A 不先收这一行就编不过。
2. **卡片测试是 7 个，不是计划初稿的 4 个**（派发前已校准）。4 个 `vi.mock` 已是 `@/` 别名，路径不用改。
3. **验收口径「13 个 presentation.ts 未被改动」与阶段 D「顶部加注释」冲突。** 按阶段 D 加了注释，行为 / schema / id 未改。
4. **阶段 D commit body 缺第二句**（见上）。内容都在，只是 git 消息少一行。
5. **`00` 第六节「唯一入口」那段仍写着旧路径** `lib/ai/agent/tools.ts` 的 `renderInteractive`。阶段 D 已把 Agent 契约段和 `rendering-architecture.md` 改到 `toolCards/renderInteractiveCard.tsx`，这段历史说明漏改。未在本计划再开第五个 commit 去改，避免扩大范围。

### 4. 计划要求记录的数据

**零命中（两个数字都归零）**

- `git grep "@/components" -- lib`：**27 → 0**（含 4 个测试 `vi.mock`；ESLint 原先只报 23，差的 4 条不在规则作用域）。
- `pnpm lint` 的 `lib → components`：**23 → 0**（升 `error` 后这 23 条消失，warning 108 → 85）。
- `git grep -n "TOOL_REGISTRY\|TOOL_RESULT_CARDS" -- lib`：**0**。

**门禁（对比计划 22 第三批基线）**

| | 基线（计划 22 第三批） | 本计划 |
|--|--|--|
| `pnpm exec tsc --noEmit` | 0 | 0 |
| `pnpm lint` | 0 error / **108** warning | 0 error / **85** warning（108 − 23） |
| `pnpm test:react` | vitest **245** | 62 files / **245** |
| `pnpm test` | node **535** + vitest **245** | node **535** + vitest **245** |
| `pnpm build` | **1210** 页 | **1210** 页（阶段 B 含临时桶 import 时测过） |
| `pnpm test:content` | 契约里 ch08-4 基线失败 | 本次 fail **0**（只记录不修；该基线失败未再现） |

**卡片顺序（代码 + 真机）**

- `registry.test.tsx` 断言数组逐字未变。
- 真机同一条回复：`searchNotes → webSearch → renderInteractive`（截图 `T1-three-cards.png`）。

**去重**

- `resultKey` 仍是 `artifactId` / `imageGenId` / `quizId` / `documentId`，`ToolResultCards` 的 `dedupBy` 未改。
- 真机发「同一条回复调用两次 renderInteractive」：模型造出两段同标题文案，但按卡片根节点去重后 **`uniqueDemoCards: 1`**（两颗「打开演示」按钮同属一张卡）。无法在流式里稳定造出「同一 `artifactId` 的两个 part」；与计划 22 结论相同，代码级确认 `resultKey` 即可。

**TDZ**

- 绕行：**已删除**。
- 真实环路：`QuizMarkdown.tsx` → `registry.ts` → `MemoryCard.tsx` → `QuizMarkdown.tsx`。
- 真机 `__srpErrors` 的 `tdz` 始终为 `[]`。正文展开 `:::memory{label="融合与 S 期"}` 后 body 正常（`T10-memory-expanded.png`）。题目测试 tab 用 `QuizMarkdown` 渲染题干/选项（`T11-quiz-tab.png`），无 TDZ。

### 5. 真机方法学与结果

- **没有**在用户正在用的 Edge 里测，**没有**清存储，**没有**用隐私窗口。
- 把 Edge Default 的 `localhost:35349` Local Storage + IndexedDB 拷到 `%TEMP%\srp-plan23-ud\Default\`，Chrome + CDP **9245** 打开副本。
- 模型 **Qwen3.8 27B**，深度思考关闭。
- 7 张有卡片的工具均出现：

| 工具 | 真机证据 |
|------|----------|
| searchNotes | `引用笔记 · 5 条` |
| webSearch | `联网来源 · 5 条` |
| renderInteractive | `打开演示` / 「PEG 融合示意」 |
| searchNoteImages | `笔记图片 · 6 张` |
| createQuiz | `PEG 细胞融合 · 即时检验 · 2 题`（不要只找「开始答题」） |
| generateImage | 「批准生成」卡（未点批准，卡片本身已出） |
| writeDocument | `查看文档` |

- 笔记两条路径：正文 tab = `NoteRendererServer`（SSR，未加 `"use client"`）；例题 EX01 详情 = 客户端 `NoteRenderer`（`T8-example-detail.png`）。指令组件（定义卡 / MemoryCard）都在。
- 截图目录：`%TEMP%\srp-plan23\`（`T1` 三卡顺序、`T6`/`T7` 去重、`T8` 例题、`T9`/`T10` MemoryCard、`T11` 题目测试）。

### 6. 未完成项 / 发现但未处理

1. **Next.js overlay「2 Issues」**：`Expected onClick listener to be a function, instead got a string`，栈在 `ArtifactCard.tsx:301`（`MessageContent` 渲染 `reasoningText`），经 `ToolResultCards` → `renderInteractiveCard`。本计划未改 `ArtifactCard`，不是搬迁引入。另有 script tag / onClick string 控制台噪声。
2. **正文 MemoryCard 解析毛刺**：可见 `EdU 顺序" mode="cloze点击展开`（内容/指令解析，非搬迁引入）。
3. **`00` 第六节「唯一入口」仍写 `lib/ai/agent/tools.ts`**（见偏差 5）。`rendering-architecture.md` 已是新路径。
4. **`00` 进度表仍写计划 23「执行中」**。本记录不改契约正文，留给主智能体改状态。
5. **`noteComponents.tsx` 的 `_node` unused** 是原文件就有的 warning。
6. **`click-text.js` 用 `innerText.includes` 会点到整页容器**，真机要点精确 `trim()===` 或 class（`.memory-card-header`）。

### 7. 给验收方的重点

- 卡片顺序与去重只认 `components/chat/toolCards/registry.tsx` + `registry.test.tsx`，不要再搜 `lib/**/catalog.ts`。
- 加工具：`lib` 侧只放 `types.ts` / `presentation.ts` / `tool.ts`；有卡再加 `components/chat/toolCards/<name>Card.tsx` 并在 `registry.tsx` 加一行。id 冻结。
- `lib/hooks/**` 的 lint 块必须继续排在 `lib/**` 之后。
- TDZ 环还在，只是当前入口顺序没炸。再动 `MemoryCard` / `QuizMarkdown` / `directiveComponents` 时先看这条环。
