# 06 — 大学物理图片更新与 SVG 补充

> **执行方式**：独立 Chat · 可与 07/08 并行
> **前置依赖**：Image & SVG Infrastructure（已完成）

---

## 任务概述

1. 用 MinerU 重新解析剩余 6 本物理学习指导 PDF（ch5, ch10-14），恢复图片
2. 用 MinerU 重新解析 12 个课件 PPT（当前为 fallback 纯文本），恢复图表
3. 运行 `propagate-images.py` 将图片以 `::figure` 指令注入 481 个例题文件和 38 个详解文件
4. 对高优先级章节（电磁学、光学）手动审查并补充 `::plot` 函数图像

## 提示词

```
你是内容增强主控智能体。

## Skills 加载（必须首先读取）
请依次读取以下 skill 文件并遵循其中规范：
1. C:\Users\AIMFl\.claude\skills\superpowers\executing-plans\SKILL.md
2. C:\Users\AIMFl\.claude\skills\superpowers\subagent-driven-development\SKILL.md
3. C:\Users\AIMFl\.claude\skills\superpowers\verification-before-completion\SKILL.md
4. C:\Users\AIMFl\.claude\skills\superpowers\dispatching-parallel-agents\SKILL.md

## 任务
为大学物理所有板块补充图片引用和函数图像，使教学内容更加直观。

## 必读 SOP
1. docs/sop/00-infrastructure.md — 文档解析与图片本地化流程
2. docs/sop/01-textbook-processing.md — 教材处理（含图片自动处理说明）
3. docs/sop/02-detail-generation.md — 详解板块格式（含视觉内容分级指南）
4. docs/refer/rendering-architecture.md — 渲染架构（§5.5 SVG Canvas 系统 + §5.6 图片基础设施）

## PADC 流程

### Phase P（Plan）
1. 读取上述 SOP 和架构文档
2. 确认以下源文件清单
3. 设计 subagent 分组

### Phase A（Act）

#### 阶段 1：学习指导 PDF 重新解析
派发 Shell subagent 运行：
```bash
npx tsx scripts/parse-docs.ts --subject physics --files "C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理学习指导\第5章-分子动理论.pdf,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理学习指导\第10章-几何光学.pdf,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理学习指导\第11章-波动光学.pdf,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理学习指导\第12章-量子力学初步.pdf,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理学习指导\第13章-原子核与放射性.pdf,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理学习指导\第14章-X射线和激光.pdf"
```

确认 `public/images/physics/` 下生成了新图片文件。

#### 阶段 2：课件 PPT 重新解析
派发 Shell subagent 运行（优先使用 MinerU，以恢复 PPT 中的图表）：
```bash
npx tsx scripts/parse-docs.ts --subject physics --files "C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第2章-流体运动.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第3章-振动.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第4章-机械波.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第5章-分子动理论.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第7章-静电场.pptx,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第8章-稳恒磁场.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第9章-电磁感应与电磁波.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第10章-几何光学.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第11章-波动光学.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第12章-量子力学初步.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第13章-原子核和放射性.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第14章-X射线，激光.ppt" --output "content/_raw/physics/courseware"
```

#### 阶段 3：图片传播
运行图片传播脚本，将 MinerU 恢复的图片插入对应内容文件：
```bash
python scripts/propagate-images.py
```

先用 `--dry-run` 模式确认变更范围，再正式运行。

#### 阶段 4：函数图像补充（并行 subagent）
按以下分组派发 GeneralPurpose subagent，为关键章节添加 `::plot` 指令：

**Subagent 1：振动与波动（ch3-ch4）**
- ch3.1: 添加 `::plot{fn="cos(2*x)" xmin=0 xmax=12.56 label="x=Acos(ωt)"}` — 简谐运动
- ch3.3: 添加 `::plot{fn="exp(-0.2*x)*cos(3*x)" xmin=0 xmax=15 label="阻尼振动"}` — 阻尼振动
- ch4: 行波方程 y = A·cos(ωt - kx) 的快照

**Subagent 2：分子动理论与热学（ch5）**
- ch5.2: Maxwell 速率分布 `::plot{fn="4*pi*(1/(2*pi))^1.5*x^2*exp(-x^2/2)" ...}`
- ch5: 等温/等压/等容过程 P-V 图（用 `:::canvas` 多曲线对比）

**Subagent 3：光学（ch10-ch11）**
- ch11.2: 单缝衍射强度 `I = I0·(sin(α)/α)²`
- ch11: 双缝干涉条纹分布
- ch10: 反射/折射定律图示（需 `::figure` 引用已有图片或 AI drawDiagram）

**Subagent 4：量子与近代（ch12-ch14）**
- ch12.1: 黑体辐射谱 Planck 公式
- ch12: 光电效应截止频率图
- ch13: 衰变曲线 N = N0·exp(-λt)

每个 subagent：
1. 读取对应章节的 detail 文件
2. 在适当位置插入 `::plot` / `:::canvas` 指令
3. 确保不破坏已有内容结构

### Phase D（Debug）
1. 运行 `pnpm run dev`，逐章检查图片是否正确显示
2. 确认 `::plot` 指令渲染出函数曲线
3. 检查 `::figure` 指令的图片加载（无 404）
4. AI 对话中测试 `imageSearch` 工具是否可用

### Phase C（Commit）
分阶段 commit：
1. `feat(physics): recover images from study guides ch5,ch10-14 via MinerU`
2. `feat(physics): re-parse courseware PPTs with MinerU for diagrams`
3. `feat(physics): propagate ::figure directives into example/detail files`
4. `feat(physics): add ::plot function graphs for vibration, optics, quantum chapters`
```

## 预期产出

| 产出 | 数量 | 路径 |
|------|------|------|
| 新恢复图片 | ~200-400 张 | `public/images/physics/` |
| 更新的例题文件 | ~50-100 个 | `content/examples/physics/` |
| 更新的详解文件 | ~10-15 个 | `content/physics/detail/` |
| 新增 `::plot` 指令 | ~15-25 处 | 散布于 detail 文件中 |

## 高优先级章节（人工审查清单）

| 章节 | 图片需求 | SVG/Plot 需求 | 优先级 |
|------|---------|--------------|--------|
| ch7 静电场 | 场线图、高斯面 | 电势函数图 | 高 |
| ch8 稳恒磁场 | 安培环路、螺线管 | B(r) 分布图 | 高 |
| ch10 几何光学 | 折射/反射光路 | 薄透镜成像公式 | 高 |
| ch11 波动光学 | 干涉/衍射装置 | 衍射强度分布 | 高 |
| ch3 振动 | 弹簧-质量系统 | SHM/阻尼/受迫曲线 | 中 |
| ch12 量子力学 | 实验装置 | 黑体辐射/光电效应 | 中 |
