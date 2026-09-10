# 25 · 全量文档清洗与体系整理

> 本文既是**交接文档**也是**执行计划**：接手的模型读完这一份就应当能独立开工，不需要回溯此前的对话。
> 前置：计划 `18`–`24` 已完成（`21` 执行中，见「并发状态」）。
> 作业域：**只碰 `.md` 文档**，不改任何代码、不改 `content/**`。

---

## 一、为什么要做这件事

过去一轮（计划 `18`–`24`）对项目做了一次代码清洗级别的重构，**大量文件被搬家、大量约定被重立**。代码侧已经收敛并有 ESLint / 测试护栏守住，但文档侧没有跟着更新：

现在有 **112 个 `.md` 文档、约 2.4 万行**，其中相当一部分还在描述**已经不存在的路径和已经作废的做法**。实测的过时引用（下文「四、已知的具体问题」有逐条清单）：

- 15 份文档还在讲 `lib/store.ts`，但它现在只剩 2 行转发壳。
- 14 份文档还在讲单文件 `lib/ai/agent/tools.ts`，但它已经拆成 13 个目录。
- 6 份文档还在讲 `lib/markdown/directiveComponents`，但它已经迁进 `components/`。

危害不是「文档不好看」，而是**文档会主动误导后续的人和 AI**。这一轮返工里最贵的两笔教训都源于此：用户曾因为找错文件反复修改「可视化 HTML」而毫无反应；`docs/refer/adding-an-agent-tool.md` 这类「怎么加一个工具」的指南如果还教旧结构，下一个照着做的人必然写出违反分层规则的代码，而 ESLint 会直接报 error 把他挡住——他会先怀疑规则，而不是怀疑文档。

---

## 二、任务目标

系统性整理**全部**项目文档——规范文档、SOP 文档、参考文档、研究文档、计划文档、根目录文档，一个都不漏。产出一套「读了就能信」的文档体系。

具体要达成四件事：

1. **准确**：文档里提到的每一条路径、每一个文件名、每一个函数名，在当前代码里都真实存在。
2. **不矛盾**：同一件事在不同文档里的说法一致；与 `docs/plans/00-execution-contract.md` 第六节的既成不变量一致（**冲突时以该节为准**）。
3. **有导航**：能从一个入口找到所有文档，知道每份文档是干什么的、还有没有效。
4. **无死档**：过时、重复、已完成、放错位置的文档被归档或删除，而不是继续躺在原地冒充有效文档。

---

## 三、核心改动上下文（这一轮到底动了什么）

**这一节是本交接文档的核心。** 清洗时判断「一份文档是否过时」，主要就是拿它对照下面这些变动。

### 3.1 计划 18 · 工程基线

Git 卫生（`.next`、截图、临时归档移出版本库）、死代码清理、`knip` 接入、测试脚本拆分为 `test:unit`（代码）/ `test:content`（内容校验）/ `test:react`（vitest）。

### 3.2 计划 19 · 聊天流滚动与抖动

用户反馈「AI 生成时整页忽上忽下」。根因不是动画，而是**内容骤缩时浏览器把 `scrollTop` 夹到 0，被误判成「用户想上滑」从而中断贴底跟随**。

立下的契约：退出贴底**只认真实用户手势**（wheel 上滚、下拉 touchmove、PageUp/ArrowUp/Home、滚动条拖拽），**绝不用 `scrollTop` 位置反推用户意图**。涉及 `components/chat/ChatThread.tsx`、`lib/hooks/useStickToBottom.ts`。

### 3.3 计划 20 · 窗口 / Artifact 体系收敛

**搬家**：八个浮窗此前各自手写 `useDraggable + useResizable + createPortal + WindowChrome` 的同一套样板 → 统一收敛为 `components/window/ManagedWindow.tsx`（配套 `lib/hooks/useManagedWindowChrome.ts`）。

**因此**：任何文档里教人「手写 useDraggable/useResizable 做浮窗」的段落都已作废。例外只有一个：`components/chat/BillingDashboard.tsx` 有意未迁移（它是 absolute + 自定义拖拽，不是 portal 浮窗）。

浮窗一律 `createPortal` 到 `document.body`，属于 `AppShell` 的全局窗口层，**既不属于右侧面板也不属于中间笔记区**。

### 3.4 计划 22 · Agent 架构与状态

**两次大搬家，是过时引用的最大来源：**

| 旧 | 新 |
|---|---|
| 单文件 `lib/ai/agent/tools.ts` | 13 个目录 `lib/ai/agent/tools/<name>/`，每个含 `types.ts` / `presentation.ts` / `tool.ts` |
| 散落各处的 Zustand store | 统一收进 `lib/stores/`（**28 个**） |
| `lib/store.ts`（真身） | 只剩 2 行 `@deprecated` 转发壳，真身是 `lib/stores/ui.ts` |

另外：工具结果卡片改由 `components/chat/toolCards/registry.tsx` 的 `RESULT_CARD_ORDER` 派发，`ChatMessage.tsx` 里的工具名字面量已清零；7 条被降级的 lint 规则恢复为 error。

**冻结项**：所有 `persist` 的 key 不得改名（已落在用户 localStorage / IndexedDB 里）；工具 id `renderInteractive` 不得改名（已随聊天历史持久化）。

### 3.5 计划 23 · UI 层归位

**规则**：`lib/**` 不得 import `components/**`。ESLint 已是 **error 且零例外**（27 处存量全部清零）。

**搬家**：工具结果卡片 `lib/ai/agent/tools/<name>/ResultCard.tsx` → `components/chat/toolCards/<name>Card.tsx`（7 个）；`lib/markdown/directiveComponents.ts`、`lib/markdown/noteComponents.tsx` → `components/`。

**顺带断开一个真实存在的循环依赖**：`QuizMarkdown → directives/registry → MemoryCard → QuizMarkdown`。这个环危险在于**静默失败**——实测先求值 `registry.ts` 时 `blockComponents` 只剩 `table` / `img`，14 个指令组件被丢弃，而控制台干净、页面不报错。现在 `components/quiz/QuizMarkdownBase.tsx` 作为叶子渲染器断开了环。

### 3.6 计划 24 · 记忆卡与指令属性解析

两个**既存 P0**（不是本轮回归），导致全站 78 张 `mode=cloze` 记忆卡的挖空功能从未工作过：

1. `normalizeDirectiveLabels` 的贪婪正则把 label 之后的属性吃进标题 → `mode` 恒为 undefined。
2. `MemoryCard` 从已解析的 React 树回抽文本，按构造有损（`<strong>` 丢 `**`、checkbox 丢 `- [ ]`、KaTeX 回抽为空）。

修法：属性边界改按 `remarkDirectives` 真实读取的 **29 个属性名白名单**判定（**不能用形状匹配**，因为 `mode=cloze` 与正文里的 `k=0` 结构同形）；记忆卡正文改用 remark 从源文件切出的原文（`hProperties.raw`）。

### 3.7 附带的提示词修复

「生成 HTML」工具（`lib/ai/artifact.ts` 的 `ARTIFACT_SYSTEM`）：配色默认改浅色系；骨架模板补 CDN 示例；字符上限 16000 → 32000；新增「运行环境限制」一节（sandbox 未授予顶层导航、指针锁定、Presentation API）。

### 3.8 唯一权威源

`docs/plans/00-execution-contract.md` **第六节「既成不变量」**是上述所有约定的权威汇总，且已随每个计划持续更新。**清洗时如果别的文档与它冲突，以它为准**；如果发现它本身有错，在报告里单独提出，不要自行改写。

---

## 四、已知的具体问题（实测，可直接开工）

### 4.1 过时路径引用

命中数为「文档:出现次数」。**注意 `docs/plans/**` 的处理方式不同**，见下文「五、关键区分」。

**`lib/store.ts`（现为 2 行转发壳，真身 `lib/stores/ui.ts`）—— 15 份文档**

重灾区：`docs/research/06-state-management.md`（9 处，整篇在讲已作废的 store 布局）、`docs/plans/12-content-registry-consolidation.md`（5）、`docs/refer/framework-extension.md`、`docs/refer/performance-audit-report.md`、`docs/research/04-ai-chat-system.md`、`docs/research/12-testing-system.md`、`docs/sop/04-quiz-generation.md`、`docs/archive/trae-specs/unify-viz-and-multi-subject-sop.md`（3）。

**单文件 `lib/ai/agent/tools.ts`（已拆 13 目录）—— 14 份文档**

重灾区（**这几份是「教人怎么做」的活文档，优先级最高**）：`docs/refer/adding-an-agent-tool.md`、`docs/sop/README.md`、`docs/sop/05-content-integration.md`、`docs/sop/subject-onboarding.md`、`docs/HANDOFF-agent-sdk-trace-ui.md`（2）、`docs/research/04-ai-chat-system.md`。

**`lib/markdown/directiveComponents` / `noteComponents`（已迁 components）—— 6 份文档**

重灾区：`docs/research/03-rendering-architecture.md`（9 处，整篇渲染架构描述已过时）、`docs/research/08-interactive-components.md`（2）、`docs/research/15-nextjs-compliance.md`、`docs/refer/modern-history-textbook-format.md`。

**手写 `useDraggable` / `useResizable`（已收敛 ManagedWindow）—— 6 份文档**

`docs/research/06-state-management.md`、`docs/superpowers/specs/2026-06-25-floating-chat-unification-design.md`，以及若干计划文档。

### 4.2 位置可疑 / 疑似死档

- **`docs/简化版本/`（19 个文件、2067 行）**：`Lesson_01` … `Lesson_18` 加一个 README，是概率论的课程讲义。**这是学习内容，不是项目文档**，却躺在 `docs/` 下。需判断：迁去 `content/`、归档、还是删除。
- **`docs/HANDOFF-agent-sdk-trace-ui.md`**：`docs/` 根目录下唯一的散文件，是一份旧交接文档，且引用了已废弃的 `tools.ts`。判断是否已完成使命。
- **`docs/archive/`（8 个）**、**`docs/superpowers/`（8 个）**、**`docs/compose/`（3 个）**、**`docs/research/`（18 个、8381 行，占全部文档三分之一）**：需要逐一判断是否仍然有效。`research/` 体量最大且过时命中最密集，是清洗的主战场。
- 根目录 `REWRITE-LOOP.md`（206 行）：判断是否仍在使用。

### 4.3 缺少总索引

`docs/plans/` 有 `README.md`（57 行）做索引，但 **`docs/` 整体没有总入口**。9 个子目录（`archive` / `compose` / `plans` / `refer` / `releases` / `research` / `sop` / `superpowers` / `简化版本`）之间的分工没有任何地方写明——新人和 AI 都无法判断该去哪找、该往哪写。

### 4.4 文档规模基线

| 目录 | 文件数 | 行数 |
|---|---|---|
| `docs/research` | 18 | 8381 |
| `docs/plans` | 32 | 4921 |
| `docs/refer` | 8 | 2875 |
| `docs/sop` | 14 | 2696 |
| `docs/简化版本` | 19 | 2067 |
| `docs/superpowers` | 8 | 1667 |
| `docs/archive` | 8 | 863 |
| `docs/compose` | 3 | 673 |
| `docs/releases` | 1 | 80 |
| `docs/`（根） | 1 | — |
| 合计 | **112** | **≈24200** |

另有仓库根的 `README.md`(218) / `CHANGELOG.md`(219) / `REWRITE-LOOP.md`(206)，以及 `components/chat/toolCards/README.md`、`components/interactives/README.md`。

---

## 五、关键区分：活文档 vs 历史记录

**这一条最容易做错，做错了就是破坏史料。**

- **活文档**（`docs/sop/**`、`docs/refer/**`、`docs/research/**`、`docs/plans/00-execution-contract.md`、`docs/plans/README.md`、根目录 `README.md`）：描述「现在是怎样的、应该怎么做」。**必须更新到与当前代码一致。**

- **历史记录**（`docs/plans/01-24`、`docs/archive/**`）：描述「当时做了什么、为什么这么决定」。里面出现旧路径是**正确的**，因为它记录的就是那个时间点的状态。

  **不要为了消灭「过时引用」去改写这些计划文档的正文。** 需要做的是：确认它们的**状态标注**正确（已完成 / 已废弃 / 执行中），必要时在文首加一行「本文为历史记录，当前结构见 X」的指引。

判断依据很简单：**这份文档是给人「照着做」的，还是给人「回头查」的？**

---

## 六、约束

1. **只改 `.md` 文档。** 不改任何代码文件。若发现代码有问题，写进报告，不要顺手改。
2. **不碰 `content/**`。** 那是内容 Agent 的作业域。
3. **不自行改写 `00-execution-contract.md` 第六节的不变量。** 那是前序计划付出代价换来的结论。发现它有错就在报告里提出。
4. **不要凭记忆断言路径。** 每写一条路径都要实际验证存在（见「七、验证方法」）。
5. **Git 纪律**：留在 `dev` 分支，不推送，不建 PR；`git add` 只写显式文件路径，绝不 `git add -A`；按主题分多次提交，不要一个巨型 commit。
6. **并发**：内容 Agent 有两个在途脏文件 `docs/refer/exam-type-distribution.md`、`docs/refer/mineru-parsing-guide.md`。**原样留着**，不要提交、不要还原；如果非要改这两份，先跟维护者确认。

---

## 七、验证方法

文档没有测试能跑，所以验证必须靠机械检查。**交付前至少做这三项：**

**1. 路径存在性**——文档里提到的每条仓库路径都必须真实存在。可用类似脚本批量抽取 `` `路径` `` 形式的引用逐一 `Test-Path`：

```powershell
# 抽出 docs 下所有反引号包裹、形如仓库路径的引用，检查是否存在
git ls-files '*.md' | Where-Object { $_ -like 'docs/*' } | ForEach-Object {
  $f = $_
  [regex]::Matches((Get-Content -LiteralPath $f -Raw), '`([a-z][\w./-]+\.(ts|tsx|mjs|json|css|md))`') |
    ForEach-Object { $p = $_.Groups[1].Value
      if (-not (Test-Path -LiteralPath $p)) { "$f -> 不存在: $p" } }
}
```

**2. 已知过时词零残留**（活文档范围内）：`lib/store.ts`、`lib/ai/agent/tools.ts`、`lib/markdown/directiveComponents`、`lib/markdown/noteComponents`、手写 `useDraggable`/`useResizable` 教程。

**3. 与不变量一致**：逐条对照 `00-execution-contract.md` 第六节，确认没有文档与之矛盾。

---

## 八、交付物

1. **`docs/README.md`**：全站文档总索引。写明 9 个子目录各自的定位、什么内容该往哪写、哪些是历史归档。
2. **更新后的活文档**：`sop/**`、`refer/**`、`research/**` 与当前代码一致。
3. **归档决策**：`docs/简化版本/`、`docs/HANDOFF-agent-sdk-trace-ui.md`、`docs/archive/`、`docs/superpowers/`、`docs/compose/` 的去留结论**及理由**。删除或移动要单独成 commit，便于回滚。
4. **清洗报告**（建议写成 `docs/plans/25-report.md`）：改了什么、删/移了什么及理由、发现但未处理的问题、需要维护者决策的点。

---

## 九、并发状态（交接时）

- 计划 `21`（内容页布局档位）**正在由另一个子智能体执行**，它会改动 `lib/content/`、`components/layout/AppShell.tsx`、`components/layout/RightPanel.tsx`、`app/[subject]/[category]/[id]/**`，并会写入 `docs/plans/21-plan-content-layout-profiles.md` 的执行记录。**清洗时避开这份计划文档**，等它完成后再处理。
- PR [#23](https://github.com/AIMFllyYS/Notebook-MedFreshman/pull/23)（计划 20/22/23/24）已开、状态 `MERGEABLE`，等待合并。
- 当前分支 `dev`，本地与 `origin/dev` 同步。

---

## 执行记录（2026-09-10）

> 本节按 `00-execution-contract.md` 第五节要求追加。完整报告见 [`25-report.md`](./25-report.md)。

**并发状态更新（本轮开工时已过期，特此更正）**：上面「九、并发状态」写作时计划 `21` 仍在执行、PR #23 状态 `MERGEABLE`。实际到本轮清洗开工时，`21` 已于 2026-09-10 完成验收（`tsc`/`lint`/`test`/`build` 门禁全绿，`content/**` 零改动），PR #23 已合并（`MERGED`）。本轮据此确认可以正常处理 `docs/plans/README.md` 里指向 `21` 的索引行（更新状态描述），但**未改动 `21-plan-content-layout-profiles.md` 正文本身**——它是历史记录，验收状态已写在自己文件末尾，无需本轮插手。

**分工与执行**：主智能体先核实基线事实（`lib/stores/` 28 个 store、`lib/ai/agent/tools/` 13 个目录、`components/chat/toolCards/` 7 张卡片、`lib/store.ts`/`lib/quiz-store.ts` 转发壳、`lib/markdown/directiveComponents.ts`/`noteComponents.tsx` 已不存在等），再派发 4 个并行子智能体分别处理 `docs/research/**`、`docs/refer/**`、`docs/sop/**`、归档类文档去留，完成后主智能体交叉抽查关键事实性声明、跑过时词零残留复扫、编写总索引与本报告。

**改动统计**：`docs/refer/**` 5 篇实改（1 篇零改动但逐条核实）、`docs/sop/**` 5 篇实改（9 篇确认无需改）、`docs/research/**` 12 篇实改（6 篇确认无需改）；归档移动 `docs/简化版本/`（19 文件）与 `docs/HANDOFF-agent-sdk-trace-ui.md` 共 20 个文件到 `docs/archive/`，`docs/archive/trae-specs/` 6 篇补状态提示；新建 `docs/README.md`；`docs/plans/README.md` 补齐 `23`/`24`/`25` 索引。

**实际改动与计划的偏差**：
1. 计划本身「九、并发状态」在开工时已过期（见上）。
2. `lib/stores/` 计数需递归 `keyboard/` 子目录才能对上契约"28 个"，顶层平铺只能数到 23 个——不是契约数字错，是清点方法容易漏子目录，已在报告中记录避免复发。
3. 顺手修了一处与本轮代码重构无关的既有小瑕疵（`docs/sop/05-content-integration.md` "验证五个工具"与正文只列 4 个的数字不一致）——超出了"只处理跟本轮改动直接相关的引用"的原定范围，但改动极小且明显正确，判断利大于弊。

**未完成项**：`performance-audit-report.md` 里例题 SSR meta-only 是否全路径生效的矛盾未代码侧确认（不在本轮"只碰 `.md`"作业域内，需要另开任务）；`docs/research/**` 里精确到行号的引用未逐条重新核对；`archive/`/`superpowers/`/`compose/` 三个历史目录是否合并，仅给出建议未执行。

**遗留风险 / 给复核方**：负责 `docs/sop/**` 的子智能体自述用过两条只读 `git status`/`git diff --stat` 核对改动范围，超出"不跑任何 git 命令"的指令边界（未做任何写操作，未影响暂存区）；后续同类任务派发时应更明确地把只读探测也一并禁止或单独放行。
