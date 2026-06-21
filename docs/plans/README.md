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

## 全局规范

所有任务必须遵守：
- **PADC 流程**：Plan → Act → Debug → Commit
- **Subagent 调度**：充分使用 `dispatching-parallel-agents` skill
- **验证**：每步完成后执行 `verification-before-completion` skill
- **Commit**：每完成一个板块立即 commit（遵循项目 commit 风格）
- **SOP 遵守**：所有内容产出必须遵循 `docs/sop/` 下对应 SOP
- **容灾降级**：MinerU 不可用时按 `docs/sop/00-infrastructure.md#容灾降级机制` 处理
