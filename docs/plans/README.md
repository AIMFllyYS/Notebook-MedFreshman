# 执行计划总览

> 本目录包含所有待执行任务的完整提示词。每个文件是一个独立的 Cursor Agent 对话任务。

## 并行执行拓扑

```
┌────────────────────────────────────┐
│           并行组 1                  │
│                                    │
│  Chat A (Queue):                   │
│    01 → 02 (物理PPT→物理学习指导)    │
│                                    │
│  Chat B (Parallel):                │
│    03 (有机化学PPT详解+作业例题)      │
│                                    │
│  Chat C (Sequential):              │
│    04 → 05 (题目测试组件→近现代史)    │
│                                    │
└────────────────────────────────────┘
                │
                ▼ Chat C 完成后
┌────────────────────────────────────┐
│           并行组 2                  │
│                                    │
│  Chat D (Sequential):              │
│    05a → 05b → 05c                │
│    (有机化学→毛概→概率论出题)        │
│                                    │
└────────────────────────────────────┘
                │
                ▼ Image 基建完成后
┌────────────────────────────────────┐
│           并行组 3                  │
│                                    │
│  Chat E: 06 (物理图片+::plot)       │
│  Chat F: 07 (化学图片+SVG标注)      │
│                                    │
└────────────────────────────────────┘
                │
                ▼ 06+07 完成后
┌────────────────────────────────────┐
│           后续任务                  │
│  Chat G: 08 (跨学科SVG内容创作)     │
└────────────────────────────────────┘
```

### 概率论录音+出题（可与并行组 1-3 同时执行）

```
┌────────────────────────────────────┐
│           并行组 4                  │
│                                    │
│  Chat H (Sequential):              │
│    09 → 10                         │
│    (概率论录音纪要→录音出题)          │
│                                    │
└────────────────────────────────────┘
```

## 文件索引

| 文件 | 执行方式 | 内容 | 依赖 |
|------|---------|------|------|
| [01-physics-ppt-detail.md](./01-physics-ppt-detail.md) | Chat A · Queue 第1个 | 物理课件PPT → 详解正文 | 无 |
| [02-physics-exercises.md](./02-physics-exercises.md) | Chat A · Queue 第2个 | 物理学习指导 → 例题Tab | 01 完成后 |
| [03-chemistry-ppt.md](./03-chemistry-ppt.md) | Chat B · 独立并行 | 有机化学PPT → PPT详解 + 作业例题 | 无 |
| [04-quiz-system.md](./04-quiz-system.md) | Chat C · 第1步 | 题目测试组件开发 + SOP更新 + 近现代史出题 | 无 |
| [05a-quiz-chemistry.md](./05a-quiz-chemistry.md) | Chat D · 第1个 | 有机化学题目测试（14章） | 04 完成后 |
| [05b-quiz-maogai.md](./05b-quiz-maogai.md) | Chat D · 第2个 | 毛概题目测试 | 05a 完成后 |
| [05c-quiz-probability.md](./05c-quiz-probability.md) | Chat D · 第3个 | 概率论题目测试（8章） | 05b 完成后 |
| [06-physics-image-update.md](./06-physics-image-update.md) | 独立 Chat · 可并行 | 物理图片恢复 + `::plot` 函数图 | Image 基建完成后 |
| [07-chemistry-image-update.md](./07-chemistry-image-update.md) | 独立 Chat · 可并行 | 化学图片恢复 + 分子SVG标注 | Image 基建完成后 |
| [08-svg-content-authoring.md](./08-svg-content-authoring.md) | 独立 Chat · 依赖 06+07 | 跨学科 SVG 内容创作 | 06+07 完成后 |
| [09-probability-recording.md](./09-probability-recording.md) | Chat H · 第1步 | 概率论录音清洗+纪要生成（15讲） | 无 |
| [10-probability-recording-quiz.md](./10-probability-recording-quiz.md) | Chat H · 第2步 | 概率论录音随堂测试（理工科适配） | 09 完成后 |
| [11-physics-recording-examples-quiz-rewrite.md](./11-physics-recording-examples-quiz-rewrite.md) | 独立 Chat | 物理录音例题与题库重写 | 无 |
| [12-content-registry-consolidation.md](./12-content-registry-consolidation.md) | 独立 Chat · 阶段 A 先行，B/C/D 可并行 | 学科/板块/录音注册表收敛，实现"只写 MD + 改注册表"的零代码接入；SOP 对齐 | 无（建议在新增内容任务前完成） |
| [13-agent-sdk-trace-ui.md](./13-agent-sdk-trace-ui.md) | SDK / 消息模型基线之上，客户端、Trace 与其他路由按独立模块并行 | Agent SDK 7 接入、时间轴 UI、持久化/计费回归、清理与验收记录 | 保留已完成 SDK/provider 基础设施与未提交 Step 3；稳定层待修项另见记录 |
| [14-chat-runtime-and-icons.md](./14-chat-runtime-and-icons.md) | 真实请求诊断 + 共享界面返修 | EACCES 运行环境、脱敏错误处理、自绘图标、透明悬浮输入区、消息左右对齐与 Trace 层级缩进 | 13 的后续修复与用户反馈 |
| [15-search-index-distribution-and-rag-quality.md](./15-search-index-distribution-and-rag-quality.md) | 分析报告 + 6 阶段修复计划（阶段 0 止血可独立先行） | `searchNotes` 失效根因（索引分发断裂 / 标题不入索引 / 零可观测性）、EdgeOne→自托管平台归位、COS 残留清洗清单 | 无；阶段 3 需在阶段 1 之后 |
| [16-agent-tool-workspace-handoff.md](./16-agent-tool-workspace-handoff.md) | 独立 Chat | Agent 结构化工具（createQuiz / searchNoteImages / writeDocument）与 UI 卡片基础实现；含 docx/PDF/测试待办 | 在 SDK/Trace 基建完成后 |
| [17-code-quality-audit-2026-09.md](./17-code-quality-audit-2026-09.md) | 交接文档 | 2026-09 全量代码质量审查：多套并存实现、注释脱节、滚动抖动、内容布局、工程基线 | 执行步骤拆到 18–22 |
| [18-plan-engineering-baseline.md](./18-plan-engineering-baseline.md) | 独立 Chat | 工程基线：tsc/eslint 覆盖测试、仓库卫生、prebuild 与内容校验解耦 | 建议先于 19–22 |
| [19-plan-chat-thread-scroll.md](./19-plan-chat-thread-scroll.md) | 独立 Chat | 对话面板滚动/布局四套机制收敛，消除流式抖动 | 可与 20 并行 |
| [20-plan-window-artifact-system.md](./20-plan-window-artifact-system.md) | 独立 Chat | 窗口拖拽缩放全屏与 HTML 沙箱去重 | 可与 19 并行 |
| [21-plan-content-layout-profiles.md](./21-plan-content-layout-profiles.md) | 独立 Chat | 内容展示按 manifest `capabilities` 分型，避免纯文档硬套三栏四 tab | 依赖 registry 已收敛 |
| [22-plan-agent-architecture.md](./22-plan-agent-architecture.md) | 独立 Chat | Agent 工具定义新旧两份收敛、架构对齐 | 与 16 交接相关 |

## 全局规范

所有任务必须遵守：
- **PADC 流程**：Plan → Act → Debug → Commit
- **Subagent 调度**：充分使用 `dispatching-parallel-agents` skill
- **验证**：每步完成后执行 `verification-before-completion` skill
- **Commit**：每完成一个板块立即 commit（遵循项目 commit 风格）
- **SOP 遵守**：所有内容产出必须遵循 `docs/sop/` 下对应 SOP
- **容灾降级**：MinerU 不可用时按 `docs/sop/00-infrastructure.md#容灾降级机制` 处理
