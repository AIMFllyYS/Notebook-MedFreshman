# 00 · 代码清洗执行契约（2026-09）

> 适用范围：`18`–`22` 五份计划的**所有**执行型与验收型子智能体。开工前必读，全程遵守。
> 本契约的存在理由：本仓库同时有另一个 Agent 在持续更新**正文讲解内容**，它走 `feat/*` 分支 + PR 合并回主线。两边必须互不干扰。

---

## 〇、当前进度与执行顺序

| 计划 | 主题 | 状态 |
|------|------|------|
| `18` | 工程基线（Git 卫生、死代码、护栏） | 已执行、已验收 |
| `19` | 聊天流滚动与抖动 | 已执行、已验收、已修复（三轮） |
| `20` | 窗口 / Artifact 体系收敛 | 已执行、已验收（判定通过，无必须修复项） |
| `22` | Agent 架构与 lint 欠账 | 已执行、**已验收（三批全通过）** |
| `23` | UI 层归位（`lib` 不再依赖 `components`） | 已执行，端测中（`lib → components` 已 27→0，规则已 `error`） |
| `21` | 内容页布局档位 | 待执行（**排最后**） |

**为什么 `22` 插到 `21` 前面：** 内容 Agent 的改动集中在 `lib/content-data/manifest.ts`、`nav.generated.json`、`subjects.registry.ts`，而这正是计划 `21` 的正面战场；它当前正在改 `docs/refer/mineru-parsing-guide.md`，说明下一批课件导入在路上，落地时必然再动这三个文件。计划 `22` 动的是 `lib/ai/**`、`lib/stores/**`、`components/chat/**`，与内容 Agent 零重叠，先做没有冲突成本。计划 `21` 尽量等这批导入落地后再动。

---

## 一、并发作业隔离

**另一个 Agent 的作业域（我方绝对不碰）：**

- `content/**` —— 全部教学正文、例题、测验 JSON
- `public/images/**`、`public/media/**` —— 内容配图与媒体
- `lib/content-data/**` 里的**数据条目**（学科/板块/内容项的具体 name、items 数组、录音清单等）
- `content/.index/`（生成物）

**我方作业域（另一个 Agent 不会碰）：**

- 构建与工具配置：`package.json` scripts、`tsconfig.json`、`eslint.config.mjs`、`knip.json`、`vitest.config.ts`、`.gitignore`
- `scripts/**`（构建链脚本与归档整理）
- `components/**`、`app/**`（除 `content` 数据外的所有 tsx/ts）
- `lib/**`（除上面点名的数据条目）
- `docs/plans/**`、`docs/refer/**`、`docs/archive/**`
- `tests/**`（测试代码；但见下条）

**灰色地带与处理方式：**

- `lib/content-data/category-templates.ts`、`lib/types/content.ts`：计划 `21` 会给**类型和模板**加字段（如 `layoutProfile`）。允许改，但**编辑前必须重新 Read 该文件**（不要依赖几十分钟前的读取结果），且只加字段、不动任何已有条目的数据值。
- `tests/content/**`：这些是**内容校验**测试，断言的是另一个 Agent 正在产出的内容。它们失败**不是**我方的问题：
  - 严禁通过修改 `content/**` 下的 markdown 来"修复"它们。
  - 严禁通过放宽断言来"修复"它们。
  - 正确做法：记录失败项，在报告里列出，继续自己的任务。
  - 已知基线失败：`tests/content/sophomore-textbooks.test.ts` 的 `cell-biology/textbook/ch08-4 有图题但没有任何图片引用`。执行期间可能出现**新的**内容测试失败（对方正在合内容），同样只记录不修。

---

## 二、Git 纪律（违反会破坏另一个 Agent 的工作）

**禁止：**

- `git add -A`、`git add .`、`git commit -a` —— 会把对方的在途文件一起提交
- `git stash`（任何形式）、`git reset --hard`、`git checkout -- .`、`git clean`、`git restore .`
- `git pull`、`git fetch` + `merge`、`git rebase`、`git push`、任何分支切换（`checkout`/`switch`）
- 任何会重写历史的操作（`filter-repo`、`commit --amend` 已推送的提交、`rebase -i`）
- 修改 `.git/` 下任何内容

**必须：**

- 只用显式路径提交：`git add path/a path/b && git commit -m "..."`
- 每个阶段（计划里标了 Commit 的地方）单独提交，提交粒度小、可 revert
- 提交前跑 `git status --short`，确认暂存区**只有**自己改的文件
- 若发现工作区有不属于自己的脏文件（对方的在途内容），**原样留着**，不要提交、不要还原、不要问
- Commit message 沿用仓库风格（`type(scope): 中文或英文描述`）
- 全程留在 **`dev`** 分支，不推送。推送与 PR 由用户决定。
  （注意：本契约早期版本误写为 `master`。真实工作分支是 `dev`，`master` 落后于它。如发现自己不在 `dev` 上，停下来报告，不要自行切换。）

---

## 三、模型与工具

- 所有子智能体统一使用 **Cursor Grok 4.6 Xhigh Fast**，由主智能体在派发时指定，子智能体自身不再派发其他模型的子任务。
- 环境：Windows 10 / PowerShell / pnpm。路径用反斜杠或引号包裹，注意 PowerShell 的引号与编码坑（仓库里有大量中文文件名，`Test-Path` 对某些字符会报错，改用 `git ls-files` 或 `Get-ChildItem -LiteralPath`）。
- 文件操作一律用 Read / StrReplace / Write / Glob / Grep 工具，不要用 `cat`/`sed`/`awk`/`echo >`。
  **这条不是风格偏好。** 本契约文件自身就是反面教材：它当初被 PowerShell 重定向写出，中文经 GBK 有损转换，落盘时留下 121 个非法 UTF-8 字节，导致整份文件在部分工具里解码回退成 Latin-1、通篇乱码，而它恰恰是每个子智能体开工必读的守则。用 Write / StrReplace 写文件不会有这个问题。
- 端口：`pnpm dev` 固定 `35349`（见 package.json）。起了 dev server 记得在任务结束前关掉。

---

## 四、验证纪律

每个阶段完成后至少跑：

```powershell
pnpm exec tsc --noEmit
pnpm lint
pnpm test:react
```

计划全部完成后再跑完整 `pnpm test`。区分两类失败：

- **代码失败** → 必须修到绿
- **内容失败**（`tests/content/**`）→ 记录，不修（见第一节）

不要为了让测试通过而删除/跳过测试用例。确需调整断言的，必须在报告里单列并说明理由。

---

## 五、交付物

每个执行型子智能体在完成后，向调用方返回一份结构化报告，包含：

1. 每个阶段的 commit hash 与一句话说明
2. 实际改动与计划的**偏差**（计划里写的做法在真实代码里不成立时你怎么处理的），这是最重要的一节
3. 计划里要求写入"执行记录"的数据（如 knip 首跑数量、persist name 清单、抖动帧数）
4. 未完成项与原因
5. 遗留风险 / 给验收方的重点检查提示

同时把 1～4 追加写进对应计划文档末尾的 `## 执行记录` 小节。

---

## 六、既成不变量（后续计划不得回退）

这些是前序计划付出代价换来的结论，改动相关代码时必须保持。

**滚动契约（计划 `19` 建立，经三轮真机验证）**

- **退出贴底跟随只认真实用户手势**：`wheel` 的 `deltaY < 0`、下拉 `touchmove`、`PageUp`/`ArrowUp`/`Home`、滚动条 gutter 拖拽。
- **`scrollTop` 位置只用于"用户滑回底部后自动恢复跟随"**，绝不用于反推"用户是否想离开底部"。
- 原因：内容骤缩（如 `AgentTrace` 思考块折叠）会让浏览器把 `scrollTop` 夹到 0，用位置反推会把这个程序性下降误判成用户上滑，跟随一断，整段流式都不再跟随——这就是用户反馈"生成时整页忽上忽下"的真正机制。
- 涉及 `components/chat/ChatThread.tsx`、`lib/hooks/useStickToBottom.ts`。**不要退回用 `scrollHeight - scrollTop - clientHeight` 判断用户意图。**
- 贴底状态下内容收缩时应继续钉住新的 `scrollHeight - clientHeight`，不要停在半截。
- `AgentTrace` 折叠的 `max-height` 过渡（约 160ms）是把结束帧的数百 px 单跳摊成 10～14px 台阶的关键，**不要无故拆掉**。
- `.chat-message` 不得再使用 `content-visibility` / `contain-intrinsic-size`（与 tanstack 的 `measureElement` 冲突）。当前是 `contain: style paint`；若往消息气泡里加**非 portal** 的浮层（下拉、气泡提示），需重新评估退到 `contain: style`。

**窗口层契约（计划 `19` 定位，计划 `20` 收敛）**

- AI 对话产物（artifact / document / imageGen）的浮窗属于 `AppShell` 的**全局窗口层**，`createPortal` 到 `document.body`；它们既不属于右侧面板，也不属于中间笔记区。任何新浮层都必须 portal 到 body，不要假定祖先没有 `contain` / `transform` 造成的包含块。
- **浮窗外壳唯一实现是 `components/window/ManagedWindow.tsx`**（配套 `lib/hooks/useManagedWindowChrome.ts`）。八个 viewer 已全部迁入。新增浮窗一律复用它，**不要再手写 `useDraggable` + `useResizable` + `createPortal` + `WindowChrome` 的那套组合**——正是这套重复了八遍的样板造成了用户抱怨的"改了半天没反应"（改到了错误的副本）。
  - 例外：`components/chat/BillingDashboard.tsx` 有意未迁移，它是 `absolute` + 自定义拖拽，不是 portal 浮窗（配套入口 `lib/window/openBillingDashboard.ts`）。它是 `components` 下唯一还留着 `useResizable(` 的窗口类组件，扫死代码时不要误判。
- 笔记栏容器 id 只能通过 `lib/constants/layout.ts` 的 `NOTES_PANEL_ID` 引用，不要再出现 `getElementById("notes-panel")` 字面量。
- `fullscreenTarget` 的默认值是 **`notes`**（对齐笔记栏），不是 viewport。这是迁移前八个 viewer 的既有行为，计划 `20` 按现网行为保留；用户可在设置里切成整窗（`artifactFullscreenTarget`）。
  不变量是「`notes` 全屏的矩形**精确等于验收当场** `#notes-panel` 的 rect 且 `borderRadius: 0`」，**不是某个固定数字**——侧栏宽度、学年布局一变它就会漂。验收时必须先当场读一次 `#notes-panel` 的 rect 再对比，不要拿别轮的数字判回退。
  两轮实测（均为 1440×900 视口）：计划 `20` 当时 notes 是 `{274, 48, 719×852}`，计划 `22` 第三批当时是 `{267, 48, 702×852}`，两轮各自都与当场 rect 精确相等 —— 数字不同，契约未破。
  另两条要一起保住：`viewport` 是 `{0, 0, 1440×900}`，走 `resolveFullscreenRect` 的整窗矩形，**不是空实现**；退出全屏会还原到全屏前几何。
  已知现码行为（不是漏配）：划词浮窗走自己的 notes 回调，**不受 `artifactFullscreenTarget` 设置影响**；切"整个窗口"只作用于 artifact / document。
- `FloatingChatWindow` 传 `registerOverlay={false}`——它不进 overlay 栈，Esc 不关它，这是忠实于迁移前的行为，**不是漏配**。实测 Esc 链不会因此卡住，后面的窗仍按 z 序逐个关闭。
- 两个窗口同时全屏时，后全屏的会把前一个自动最小化（护栏用例：`tests/windowManager.test.ts` 的 `fullscreen auto-minimizes other fullscreen windows`）。
- **工具 id `renderInteractive` 不得改名。** 它已随聊天历史持久化进 IndexedDB，改名需要配套存储迁移。UI 文案统一叫"HTML 演示"，但 id 冻结。

**Agent 与状态契约（计划 `22` 建立，经三批端测验证）**

- **工具目录是唯一真相源。** 每个工具一个 `lib/ai/agent/tools/<name>/` 目录（13 个：`types.ts` / `presentation.ts` / `tool.ts`），有 UI 的再配 `components/chat/toolCards/<name>Card.tsx`（7 个）。卡片顺序由 `components/chat/toolCards/registry.tsx` 的 `RESULT_CARD_ORDER` 决定；`components/chat/ChatMessage.tsx` 里**不得再出现工具名字面量**（已清零，别写回去）。
- **客户端不得导入任何 `tool.ts` / `server.ts`。** 六处 `no-restricted-imports` 规则（`components/**`、`lib/hooks/**`、`components/notes/**`、`RightPanel.tsx`、`components/interactives/**`、`components/canvas/**`）均为 `error`，已实测能拦住。破了这条会把密钥读取逻辑打进浏览器 bundle 或报 `fs` 找不到；`lib/ai/agent/tools/index.ts` 的公共再导出（标了 `@public`）**不要顺手把 `tool.ts` 挂上去**。
- **store 清点口径（28 个）：** `lib/stores/` 下排除测试与 `_persist.ts` 共 28 个文件 = `from "zustand"` 的 `create(` **22** 个 + `createPersistedStore` 包装 **6** 个（artifacts / documents / imageGen / skills / reviewCards / billing）。只用 `git grep 'from "zustand"'` 会漏掉 `chatHistory` / `chatUI` / `tokenTracker` / `floatingTokenTracker` 这 4 个（写法不统一）。以后清点必须按这个口径，否则会误判"store 变少了"。
- **persist 名不得改。** 所有 `persist` 的 key 都已落在用户的 localStorage / IndexedDB 里，改名等于让用户数据凭空消失；计划 `22` 搬家 28 个 store 时逐个核对过 key 未变（第一批端测实测无数据丢失）。
- `chat-history` 键不存在是 v2 的预期形态（manifest + 分片），**不是数据丢失**。

**分层契约（计划 `23` 建立）**

- **`lib/**` 不得 import `components/**`。** `eslint.config.mjs` 里那条 `no-restricted-imports` 已是 **`error` 且零例外**（原为 `warn`，27 处存量已清零）。要加豁免就是在破坏这条规则存在的理由——真 UI 一律放 `components`，`lib` 只放 types / presentation / tool。
- **扁平配置的块序不可打乱**：`files: ["lib/**"]`（第 97 行附近）必须排在 `files: ["lib/hooks/**"]`（第 106 行附近）**之前**，否则 hooks 会丢掉 `tool.ts` 边界。四个边界块（`components/** + lib/hooks/**`、`components/notes/** + RightPanel + interactives`、`components/canvas/**`、`lib/hooks/**`）目前全为 `error`。
- **指令注册表的环已断，不要把它接回去。** 曾经存在的环是：
  `components/quiz/QuizMarkdown.tsx` → `components/shared/directives/registry.ts` → `components/shared/directives/MemoryCard.tsx` → 回到 `QuizMarkdown.tsx`。
  计划 `23` 删掉了 `QuizMarkdown` 里 `useMemo` 延迟展开的绕行、改成模块顶层展开，当时没报错所以判定安全——**但那是运气**。事后用求值顺序测试实测：**先求值 `registry.ts` 时 `blockComponents` 只剩 `table` / `img`，14 个指令组件被静默丢弃**（顶层展开访问到未初始化的 `const`，而 `{...undefined}` 合法），控制台干净、页面不报错。历史上同一个环还以 `Cannot access 'directiveComponents' before initialization` 的崩溃形态出现过一次。
  现在的结构（`fdce7907`）：`components/quiz/QuizMarkdownBase.tsx` 是**叶子**渲染器，**永不 import 指令 registry**；`QuizMarkdown` = Base + `directiveComponents`；`MemoryCard` 只 import Base。
  **红线**：`QuizMarkdownBase` 不得 import `components/shared/directives/registry`（直接或间接均不可，注意 `ContentImage` 那条链也要保持干净）；`MemoryCard` 不得改回 import `QuizMarkdown`。MemoryCard 内部若要支持嵌套指令，用 props 注入指令映射，**不要**重新 import registry。
  **护栏**：`components/shared/directives/registry.evaluation-order.test.tsx` 按四种求值顺序断言 14 个指令键齐全且每个值都是函数——它同时抓崩溃与静默空映射两种形态。**不要削弱这个测试**（尤其不要只断言键存在而不断言是函数，占位符会漏过去）。
  已量化：全量 3201 个正文文件、711 个 `:::memory` 块内**零处**嵌套指令，故断环带来的「MemoryCard 内不支持嵌套指令」对现有正文零影响。

**"右侧 Agent 里那个可视化 HTML"的唯一入口**

用户曾因为找错文件反复改动无效。正确链路是单一的一条，改动前先认准：

`lib/ai/agent/tools/renderInteractive/tool.ts`（服务端定义）→ `lib/ai/artifact.ts` → `/api/artifact` → `components/chat/toolCards/renderInteractiveCard.tsx`（结果卡片）→ `components/chat/ArtifactCard.tsx` → `lib/hooks/useArtifacts.ts` → **`components/chat/ArtifactViewer.tsx`**（全局浮窗，最终呈现）

> 路径已两次变动：计划 `22` 把单文件 `lib/ai/agent/tools.ts` 拆成了 `lib/ai/agent/tools/<name>/` 目录，计划 `23` 又把结果卡片从 `lib/.../ResultCard.tsx` 移到了 `components/chat/toolCards/<name>Card.tsx`。**`lib` 侧现在只有 types / presentation / tool，任何 UI 都在 `components`。**

搜索时用「可视化 HTML」「HTML 演示」或 `renderInteractive` 这三个词之一。**只搜「可视化」两个字会误入** `components/interactives/registry.ts` 里一堆「××可视化」和 `ChatMessageVisualizations.tsx`；只搜 `interactive` 会进右侧「可交互」tab。

它**不是**下面这三个，不要改错：

- `components/interactives/**` —— 右侧"可交互"tab 里的手写 React 组件，与 AI 产物无关
- `components/canvas/renderers/HtmlRenderer.tsx` —— 消息内联 iframe
- `components/notes/**` —— 中间笔记区，历史上曾被误加组件的地方

详见 `docs/refer/rendering-architecture.md` 的"四条渲染路径"一节。

---

## 七、遇到阻塞时

- 计划与真实代码冲突（文件不存在、行号对不上、API 版本不同）：**以真实代码为准**，按计划的**意图**调整做法，并在报告的"偏差"一节写清。
- 不要为了照搬计划而制造不合理的代码。
- 不要扩大作业范围去"顺手优化"计划外的东西——那会让 commit 无法二分定位。
- 真正无法决断的（涉及产品取舍、数据安全、需要用户选择的），停下来在报告里说明，不要猜。
