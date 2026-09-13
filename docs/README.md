# docs/ 总索引

> 本文件是 `docs/` 全站文档的唯一入口。任何人或 AI 智能体想知道"这份东西该写在哪、该去哪找"，先看这一页。
> 编写于计划 `25`（全量文档清洗）。判断某份文档是否已过时，以 [`plans/archive/00-execution-contract.md`](./plans/archive/00-execution-contract.md) 第六节「既成不变量」为准。本轮 Agent 整改入口是 [`plans/Agent-refactor/00-loop-map.md`](./plans/Agent-refactor/00-loop-map.md)。

---

## 一句话导航

| 我想... | 去哪 |
|---|---|
| 了解现在的架构/约定是什么、有哪些不能踩的红线 | [`plans/archive/00-execution-contract.md`](./plans/archive/00-execution-contract.md) 第六节 |
| 看这一轮 Agent 平台整改做了什么、按哪个 loop 跑 | [`plans/Agent-refactor/00-loop-map.md`](./plans/Agent-refactor/00-loop-map.md) |
| 按 SOP 生产内容（教材/详解/录音/题目/新学科接入…） | [`sop/`](./sop/README.md) |
| 派发一次具体的内容同步/生成任务，怎么写 prompt | [`prompt/goal-model.md`](./prompt/goal-model.md) |
| 查某个子系统当前实现的权威说明（渲染架构、存储架构等） | [`refer/`](#refer--权威参考手册活文档) |
| 回顾"为什么现在长这样"、看某次重构的完整过程 | [`plans/`](./plans/README.md)（`01`–`24`）、[`research/`](#research--深度调研报告2026-07-05-快照) |
| 找已经完成/废弃/不再维护的旧材料 | [`archive/`](./archive/README.md)、[`superpowers/`](#superpowers--历史设计草案)、[`compose/`](#compose--历史设计草案) |
| 看某个版本发布了什么 | [`releases/`](./releases/) |

---

## 目录一览

```
docs/
├── README.md          ← 你在这里
├── plans/              Agent-refactor/（本轮 loop 制）+ archive/（历史计划与执行契约）
├── refer/               权威参考手册（活文档）
├── sop/                 标准操作流程（活文档）
├── prompt/              派发内容任务的提示词模板（Goal Model 等）
├── research/            2026-07-05 深度调研报告快照
├── releases/            版本发布记录
├── archive/             历史归档（含 trae-specs/、简化版本/、旧交接文档）
├── superpowers/         历史设计草案（plans/ + specs/）
└── compose/             历史设计草案（plans/ + specs/）
```

---

## `plans/` —— 执行计划

存放"做一件事的完整任务书"。绝大部分是**历史记录**（描述当时做了什么、为什么），只有两个例外是活文档：

- [`archive/00-execution-contract.md`](./plans/archive/00-execution-contract.md) —— **代码清洗不变量权威源**。第六节汇总 `18`–`24` 留下的、不得回退的约定，以及本轮 Agent 整改新增的几条（proxy matcher 字面量、服务端台账、ALS、登录闸门）。任何文档与它冲突，以它为准。
- [`Agent-refactor/00-loop-map.md`](./plans/Agent-refactor/00-loop-map.md) —— **本轮 Agent 平台整改入口**（2026-09-12 起的 loop 制）。取代 `docs/analysis/Agent/01-goal-mode-runbook.md` 第 1–3 节的一号一循环调度。
- [`archive/README.md`](./plans/archive/README.md) —— 计划 `01`–`25` 的历史索引。

其余 `01`–`24` 记录的是各自完成时间点的真实状态，**不要因为里面出现"过时路径"就去改写正文**——那正是历史该有的样子。`17`（代码质量审查）是 `18`–`22` 的事实依据；`18`–`24` 是 2026-09 的一轮系统性代码清洗（工程基线 → 滚动抖动 → 窗口/Artifact → Agent 架构 → UI 层归位 → 记忆卡/指令解析 → 内容展示体系）；`25` 就是你现在在读的这一轮文档清洗。

## `refer/` —— 权威参考手册（活文档）

描述"某个子系统现在具体怎么实现"，必须与代码保持一致：

| 文件 | 覆盖 |
|---|---|
| `rendering-architecture.md` | Markdown 渲染架构、指令组件、"可视化 HTML"唯一入口链路 |
| `storage-architecture.md` | Zustand + IndexedDB / localStorage 存储分层 |
| `performance-audit-report.md` | 性能审计与优化记录 |
| `framework-extension.md` | 框架扩展点（新增学科/板块/工具的接入面） |
| `adding-an-agent-tool.md` | 新增一个 Agent 工具的操作指南 |
| `modern-history-textbook-format.md` | 中国近现代史纲要教材格式规范 |
| `exam-type-distribution.md` | 各科目考试题型配比（内容 Agent 维护，本轮未触碰） |
| `mineru-parsing-guide.md` | MinerU API 文档解析指南（内容 Agent 维护，本轮未触碰） |

## `sop/` —— 标准操作流程（活文档）

内容生产的操作规范，索引见 [`sop/README.md`](./sop/README.md)（含 SOP 编号、覆盖板块、全局规范、内容路径约定表）。执行任何内容生产任务前必须先查这里定位适用的 SOP。

## `prompt/` —— 提示词模板（活文档）

派发具体内容任务时用的提示词模板，见 [`prompt/README.md`](./prompt/README.md)。与 `sop/` 的关系：`sop/` 是"应该怎么做"的规范，`prompt/` 是"怎么正确地把规范喂给一次具体任务派发"的模板——目前只有 [`goal-model.md`](./prompt/goal-model.md)。

## `research/` —— 深度调研报告（2026-07-05 快照）

18 篇 + 1 篇总览，是 2026-07-05 对彼时代码库的一次全维度深度调研（[`overview.md`](./research/overview.md) 有完整方法论与团队分工）。**性质介于活文档与历史记录之间**：它按维度系统性描述架构，本轮清洗已核对并修正其中因计划 `18`–`24` 产生的过时路径引用（store 布局、指令组件位置等），但报告本身的调研方法、问题分级、日期仍保留原样，不是"当前状态的实时镜像"。看具体子系统的现在实现，优先看 `refer/`；看"当时调研出的问题清单和分析深度"，看这里。

## `releases/` —— 版本发布记录

按版本号存档的发布说明，纯历史记录，不需要更新。

## `archive/` —— 历史归档

明确标注"已从主线移出，只为查阅保留"。见 [`archive/README.md`](./archive/README.md)，含：

- `trae-specs/`：历史内容整合/架构升级规格（来自已移除的 `.trae/specs/`）。
- `简化版本/`：概率论与数理统计独立自学笔记草稿（与 `content/` 的正式课件是两套体系，本轮从 `docs/` 根目录移入于此，正文未改）。
- `HANDOFF-agent-sdk-trace-ui.md`：Agent SDK / Trace UI 迁移交接文档，已被计划 `22`/`23`/`24` 完成并取代。
- `large-assets-2026-09.md`：大体积资源归档记录。
- `REWRITE-LOOP.md`：大二上医学教材富文本改写循环的任务专属操作卡（原在仓库根目录）。任务已完成，可复用的反降质机制已沉淀进 [`sop/00-infrastructure.md`「内容生产闭环与反降质契约」](./sop/00-infrastructure.md#内容生产闭环与反降质契约)及 `01`/`02`/`02b`/`03`/`04` 各自的验收细节，现移入本目录仅作历史操作记录保留。

## `superpowers/` —— 历史设计草案

`plans/` + `specs/` 共 8 个文件，均为带日期（2026-06-16 ～ 2026-06-30）的历史设计文档，记录的是那个时间点的方案权衡，正文不因本轮清洗改写。

## `compose/` —— 历史设计草案

`plans/` + `specs/` 共 3 个文件，性质与 `superpowers/` 相同（历史设计草案），未合并是因为交叉引用尚未理清——见 [`plans/25-report.md`](./plans/25-report.md) 中的建议，供维护者决策是否与 `superpowers/`、`archive/` 整合。

---

## 根目录文档

- `README.md`（仓库根）—— 项目总览、快速开始、功能特性、技术栈。
- `CHANGELOG.md`（仓库根）—— 版本变更日志。

> `REWRITE-LOOP.md` 原在仓库根目录，已随其所记录任务的完成移入 [`docs/archive/`](#archive--历史归档)，不再是根目录文档。

---

## 维护规则

1. 新增文档前先看这份索引，确认放对目录：**当前实现说明**进 `refer/`，**操作步骤**进 `sop/`，**一次性任务记录**进 `plans/`，**过时/完成使命的材料**进 `archive/`。
2. 改动了 `18`–`24` 建立的任一约定时，同步更新 `plans/00-execution-contract.md` 第六节——它是唯一权威源，不能只改局部文档。
3. 新计划完成后，在 `plans/README.md` 的文件索引表补一行、更新拓扑图状态。
