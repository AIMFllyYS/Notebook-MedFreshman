# 25 · 全量文档清洗——执行报告

> 对应计划：[`25-plan-documentation-cleanup.md`](./25-plan-documentation-cleanup.md)。
> 执行方式：主智能体核对基线事实后，派发 4 个并行子智能体分工执行，主智能体统一验证、修正与提交。

---

## 一、执行方式与分工

| 作业域 | 执行者 | 文件数 |
|---|---|---|
| `docs/research/**`（主战场） | [清洗 docs/research 目录文档](f0a75870-df0b-4fae-903a-d5b7038c2b89) | 18（12 改，6 确认无需改） |
| `docs/refer/**`（跳过 2 份在途脏文件） | [清洗 docs/refer 目录文档](d9d0365e-fc27-422c-8bf0-293c627682f8) | 6（6 改，1 份零改动但逐条核实） |
| `docs/sop/**` | [清洗 docs/sop 目录文档](444270d8-7f50-43a8-86d0-81888327f7a9) | 14（5 改，9 确认无需改） |
| 归档类文档去留决策与执行 | [归档类文档去留决策与执行](e18a5d33-1921-4f3d-b22b-7b6b5fff2717) | 移动 21 个、加提示块 7 个 |
| `docs/plans/README.md`、`docs/plans/21` 状态核实、`docs/README.md`、本报告 | 主智能体自行处理 | 见下 |

派发前主智能体先做的基线核对（详见计划文档本身与本报告第三节）：核实 `lib/stores/` 真实 28 个 store（23 顶层 + `keyboard/` 5 个）、`lib/ai/agent/tools/` 13 个目录、`components/chat/toolCards/` 7 张卡片、`lib/store.ts`/`lib/quiz-store.ts` 均为 2 行转发壳、`lib/markdown/directiveComponents.ts`/`noteComponents.tsx` 已不存在（迁至 `components/`），并用 `git grep` 精确统计了每个过时模式在哪些文件命中，据此把改写目标精确到文件级再派发，避免子智能体盲目全目录重写。

## 二、改了什么（按目录）

### `docs/research/`（18 篇，2026-07-05 深度调研快照）

**整篇重写**（架构描述已大面积过时）：
- `06-state-management.md` —— store 布局从 17 个散落 hook + `lib/store.ts` 真身，改写为现网 `lib/stores/` 下 28 个（含 `createPersistedStore` 封装、`keyboard/` 子系统）。
- `03-rendering-architecture.md` —— 指令组件/笔记映射从 `lib/markdown/` 改写为现网 `components/shared/directives/registry.ts` / `components/notes/noteComponents.tsx`；补充 `QuizMarkdown`/`QuizMarkdownBase` 断环机制与记忆卡 `hProperties.raw` 修复。

**中等改动**：`04-ai-chat-system.md`（修正一处实质性错误：工具结果卡片路径被误写成不存在的 `lib/ai/agent/tools/catalog.ts`）、`05-storage-architecture.md`、`14-sop-content-pipeline.md`（并标注 3 项 P1 问题已在现网修复）。

**小修**（路径订正）：`01-architecture-overview.md`、`08-interactive-components.md`、`12-testing-system.md`、`15-nextjs-compliance.md`、`07-performance-optimization.md`、`overview.md`、`00-research-plan.md`。

**确认无需改**（6 篇，主题不在本轮代码重构范围内）：`02-content-management.md`、`09-manim-animation.md`、`10-routing-ssr-ssg.md`、`11-electron-desktop.md`、`13-build-scripts.md`、`16-automation-platform.md`。

**处理原则**：research/ 是带日期的调研快照，不是实时镜像。清洗只订正因计划 `18`–`24` 产生的过时路径引用，保留原有调研方法论、问题分级与日期视角；改动较大的文件文首都补了一段"本次重写说明"，把 2026-07 视角与 2026-09 现网结构的关系写清楚，不混淆二者。

### `docs/refer/`（6 篇活文档，跳过 2 份内容 Agent 在途文件）

- `adding-an-agent-tool.md`：逐条核对 13 个工具目录、7 张结果卡片，**零改动**（本来就准确）。
- `framework-extension.md`：**大幅更新**——`SubjectId` 真相源变为 `subjects.registry.ts` 的 `SUBJECT_REGISTRY`（14 个学科，非文档原写的 6 个）；`VALID_SUBJECTS` 已不存在，改用 `isSubjectId()`；`components/notes/directives.tsx` 根本不存在，真实实现在 `MediaEmbed.tsx`；`app/api/section/route.ts` 的 `readContentFile` 不存在，路径解析已声明化到 `lib/content/contentPaths.ts`。
- `rendering-architecture.md`：**大幅更新**——补上被完全漏掉的 `NoteRendererServer`（现为内容页正文主路径）与 `QuizMarkdown`/`QuizMarkdownBase` 第三条渲染树；指令组件表从 6 个补全到 14 个；订正聊天侧 `img` 组件实为 `ChatImage` 而非 `ContentImage`；订正两处已不存在的调用点文件。
- `performance-audit-report.md`：**大幅更新**——订正报告自身「顶部状态表已标 ✅」与「正文分析仍按修复前现状描述」的内部矛盾（虚拟化、Storage v2、store 拆分均已完成但正文未回填）。
- `storage-architecture.md`：**中改**——补全 `PERSIST_KEYS`（3→8 个）、`createPersistedStore` 包装 store（2→6 个），订正一处真实存在的 key 错误（`gailvlun-browser` 应为 `gailvlun-browser-v1`）。
- `modern-history-textbook-format.md`：小修（指令注册路径）。

### `docs/sop/`（5 篇，其余 9 篇确认无需改）

`README.md`、`04-quiz-generation.md`、`05-content-integration.md`、`subject-onboarding.md`：`lib/ai/agent/tools.ts`/`lib/store.ts` 路径订正。`07-testing.md`：文件布局示例树三处订正（真实测试文件路径）。顺带修了一处与本轮无关的既有小瑕疵：`05-content-integration.md` "验证 AI 面板的五个工具"与正文只列 4 个的数字不一致。

### 归档决策（详见 [`归档类文档去留决策与执行`](e18a5d33-1921-4f3d-b22b-7b6b5fff2717) 的完整推理）

| 决策 | 对象 | 处理 |
|---|---|---|
| 移动 | `docs/简化版本/`（19 文件） | → `docs/archive/简化版本/`。理由：概率论自学笔记草稿，与 `content/` 的正式课件是两套体系，不属于项目规范文档；正文未改。 |
| 移动 + 加状态提示 | `docs/HANDOFF-agent-sdk-trace-ui.md` | → `docs/archive/HANDOFF-agent-sdk-trace-ui.md`。核实其描述的 Step 3/4/5 已被计划 `22`/`23`/`24` 完成并取代。 |
| 保持原位 + 补状态提示 | `docs/archive/trae-specs/` 6 个文件 | 均无日期/状态自证，逐一核实对应代码现状后加一行提示（如"已被 ManagedWindow 取代""对应目录已存在"）。 |
| 保持原位，不加提示 | `docs/archive/large-assets-2026-09.md`、`docs/superpowers/**`（8）、`docs/compose/**`（3） | 文件名自带日期或文首已有明确状态声明，符合"跳过"标准；未改写正文（历史记录不应被"纠正"）。 |

**未执行、仅记录建议**：`archive/`、`superpowers/`、`compose/` 三个目录未来是否合并——三者归档动机不同（`archive/` 是外部工具私有目录迁移；`superpowers/`/`compose/` 是两套不同 AI 工作流各自产出、文件名带日期），建议维护者自行决定是否合并，本轮不做，避免打散"文件属于哪套工作流"的隐含信息且交叉引用重定位风险大于收益。

### 主智能体自行处理

- `docs/plans/README.md`：补齐 `23`/`24`/`25` 三份计划的索引行（此前缺失，只列到 `22`）；更新拓扑图与状态说明——**发现计划 25 自身的「并发状态」一节已过期**：计划 `21` 已于 2026-09-10 完成验收（`git log` 显示 `b5a2c40c docs(plans): record plan 21 acceptance and build result` 等 4 个提交），PR [#23](https://github.com/AIMFllyYS/Notebook-MedFreshman/pull/23) 状态已是 `MERGED`（非计划 25 文首写的 `MERGEABLE`）。已在下方「三、发现的偏差」记录，未回改计划 25 正文本身（历史记录处理原则），仅在本报告与其执行记录小节说明。
- `docs/README.md`：新建全站总索引，覆盖八个子目录（`archive`/`compose`/`plans`/`refer`/`releases`/`research`/`sop`/`superpowers`）的定位、去留状态与维护规则。
- `docs/sop/05-content-integration.md` 的工具数量小瑕疵（见上）。
- 对四个子智能体的关键事实性声明做了交叉抽查（`lib/stores/` 真实 28 个的口径复核、`isSubjectId`/`SUBJECT_REGISTRY`/`ChatImage.tsx` 存在性、`components/notes/directives.tsx` 不存在、测试文件真实路径），均核实无误。

## 三、发现的偏差 / 未处理问题（供维护者决策）

1. **计划 25 自身「九、并发状态」一节已过期**：写作时计划 `21` 仍在执行、PR #23 状态 `MERGEABLE`；实际到本轮清洗执行时点，`21` 已验收通过、PR #23 已合并。已在 `docs/plans/README.md` 更新为准确状态，计划 25 正文本身未改动（遵循"历史记录不改正文"原则），仅在此报告与 25 自身的执行记录小节说明。
2. **`lib/stores/` 计数口径易踩坑**：顶层 `Get-ChildItem` 只看到 23 个（不含 `_persist.ts`），漏了 `keyboard/` 子目录下 5 个（`globalSearch`/`keyboardSettings`/`overlayStack`/`reviewKeyboard`/`shortcutHelp`），23+5=28，与 `00-execution-contract.md` 一致。**契约数字本身没错**，只是清点必须递归子目录，已在报告中记录避免后续同样的误判。
3. **`docs/sop/05-content-integration.md` Step 4 数字瑕疵**：与本轮代码重构无关的既有小 bug（标题写"五个工具"正文只有 4 个），已顺手修正。
4. **`performance-audit-report.md` 遗留一处未解决的矛盾未强行下结论**：顶部状态表标"例题 SSR meta-only + 按需 fetch ✅"，但 `app/[subject]/[category]/[id]/page.tsx` 传给 `ExampleTab` 的 `initialExamples` 实测仍调全量 `readExamples()`，不是 `readExamplesMeta()`。已在文档内如实标注为待核实项，未代码侧确认前不下结论——这是代码问题，不在本轮"只碰 `.md`"的作业域内，需要另开任务核实。
5. **`docs/research/**` 里精确到行号的引用未逐条重新核对**：这批引用是 2026-07 快照，本轮只更新了文件路径层级的过时引用，行号级别的精确性建议留给专门的验收轮次。
6. **子智能体执行过程中出现的工具越界（低风险，已如实记录）**：负责 `docs/sop/**` 的子智能体报告了自己使用过 `git status --short`/`git diff --stat` 两条只读命令核对文件改动范围，超出了"不要跑任何 git 命令"的指令边界；均为只读命令，未做任何 `git add`/`commit`，未影响暂存区，此处如实记录不代表纵容，后续同类任务应更明确地把只读探测也一并禁止或单独放行。

## 四、验证结果

- **路径存在性**：本次改写涉及的关键路径逐一用 Read/Glob/Grep 核实存在，未发现新增的"文档提到但代码里不存在"的引用（详见各子智能体报告末尾"确认过真实存在的关键路径清单"）。抽查交叉验证（`isSubjectId`、`SUBJECT_REGISTRY`、`ChatImage.tsx`、`components/notes/directives.tsx` 不存在等）全部通过。
- **已知过时词残留检查**：对 `docs/refer/**`、`docs/sop/**`、`docs/research/**`、`docs/plans/00-execution-contract.md`、`docs/plans/README.md` 做了 `lib/store.ts`/`lib/ai/agent/tools.ts`/`directiveComponents`/`noteComponents`/`useDraggable+useResizable`/`ResultCard.tsx` 六类关键词的全量复扫，剩余命中全部是"注明原路径已废弃、现网路径是 X"的正确历史对比句式，不是过时的当前状态声明。
- **与不变量一致**：未发现活文档与 `00-execution-contract.md` 第六节矛盾之处；反而在核对中确认了第六节"28 个 store"的数字是准确的（见上文偏差 2）。
- **Git 纪律**：全程未 `git add -A`；两份内容 Agent 在途脏文件（`docs/refer/exam-type-distribution.md`、`docs/refer/mineru-parsing-guide.md`）全程未被本轮任何改动触碰（已用 `git diff --stat` 确认改动量与会话开始前一致）；`docs/plans/21-plan-content-layout-profiles.md` 未被本轮改动（该计划已在本轮清洗启动前完成验收，故不存在"避让在途"的必要，但仍未触碰其正文，只更新了 `plans/README.md` 里指向它的索引行）；`content/**` 零改动；分支仍在 `dev`，未推送。

## 五、交付物清单

1. `docs/README.md`（新建）—— 全站文档总索引。
2. 更新后的活文档 —— `docs/refer/**`（5 篇实改）、`docs/sop/**`（5 篇实改）、`docs/research/**`（12 篇实改）。
3. 归档决策 —— `docs/简化版本/` → `docs/archive/简化版本/`；`docs/HANDOFF-agent-sdk-trace-ui.md` → `docs/archive/`；`archive/trae-specs/` 6 篇补状态提示；`archive/`、`superpowers/`、`compose/` 保持原位（理由见上）。
4. 本报告（`docs/plans/25-report.md`）。
5. `docs/plans/25-plan-documentation-cleanup.md` 末尾追加的「执行记录」小节（按 `00-execution-contract.md` 第五节的交付要求）。
6. `docs/plans/README.md` 补齐 `23`/`24`/`25` 索引与最新拓扑状态。
