# 08 — 跨学科 SVG 内容创作

> **执行方式**：独立 Chat · 在 06/07 图片更新完成后执行
> **前置依赖**：06-physics-image-update + 07-chemistry-image-update（提供 SVG-TODO 标注）

---

## 任务概述

利用已建成的 SVG Canvas 系统（`::plot`、`:::canvas`、`drawDiagram`），为物理和化学课程批量创作矢量图形内容：
1. 物理：函数图像（`::plot`）+ 示意图（手写 SVG 或 `drawDiagram`）
2. 化学：分子结构式、反应机理箭头图（手写 SVG）
3. 处理 06/07 中标注的 `<!-- SVG-TODO -->` 位置

## 提示词

```
你是 SVG 内容创作主控智能体。

## Skills 加载（必须首先读取）
请依次读取以下 skill 文件并遵循其中规范：
1. C:\Users\AIMFl\.claude\skills\superpowers\executing-plans\SKILL.md
2. C:\Users\AIMFl\.claude\skills\superpowers\subagent-driven-development\SKILL.md
3. C:\Users\AIMFl\.claude\skills\superpowers\verification-before-completion\SKILL.md
4. C:\Users\AIMFl\.claude\skills\superpowers\dispatching-parallel-agents\SKILL.md

## 任务
为物理和化学课程内容创作 SVG 矢量图形（函数图像 + 示意图 + 分子结构）。

## 必读文档
1. docs/refer/rendering-architecture.md — §5.5 SVG Canvas 系统（::plot / :::canvas 语法）
2. docs/sop/02-detail-generation.md — 视觉内容分级指南（选择合适的层级）
3. components/canvas/canvasUtils.ts — 表达式解析器支持的语法

## 核心约束
1. **函数图像**用 `::plot` 指令（一行 Markdown，无需写代码）
2. **多函数对比**用 `:::canvas` 容器
3. **分子结构/电路图/光路图**用 inline SVG 或 `::figure` 引用预制 SVG 文件
4. 所有 SVG 必须使用 CSS 变量实现主题适配（`var(--ink)` 文字色、`var(--accent)` 强调色）
5. SVG 文件存放于 `public/images/{subject}/svg/` 目录

## PADC 流程

### Phase P（Plan）
1. 扫描所有 `<!-- SVG-TODO: ... -->` 标注（来自 06/07 的产出）
2. 按复杂度和学科分组
3. 确定 subagent 分配

### Phase A（Act）

#### 物理函数图像（3 个并行 subagent）

**Subagent P1：振动与波（ch3-ch4）**

需要创作的 `::plot` 指令：

| 位置 | 表达式 | 标签 | 参数范围 |
|------|--------|------|---------|
| ch3 detail 3.1 | `cos(2*x)` | 简谐运动 x=Acos(ωt) | xmin=0 xmax=12.56 |
| ch3 detail 3.3 | `exp(-0.2*x)*cos(3*x)` | 阻尼振动 | xmin=0 xmax=20 |
| ch3 detail 3.3 | 受迫振动共振曲线（用 :::canvas 对比不同阻尼） | — | — |
| ch4 detail | `sin(x-2)` vs `sin(x)` | 行波快照 | xmin=0 xmax=12.56 |

**Subagent P2：热学与统计（ch5）**

| 位置 | 表达式 | 标签 | 参数范围 |
|------|--------|------|---------|
| ch5 detail 5.2 | Maxwell 速率分布（:::canvas 不同温度对比） | f(v) | xmin=0 xmax=5 |
| ch5 detail | 等温/等压/等容过程 P-V 图（:::canvas） | — | — |

**Subagent P3：光学与量子（ch11-ch12）**

| 位置 | 表达式 | 标签 | 参数范围 |
|------|--------|------|---------|
| ch11 detail 11.2 | `(sin(3*x)/(3*x))^2` | 单缝衍射 I(θ) | xmin=-10 xmax=10 |
| ch11 detail | 双缝干涉条纹 `cos(x)^2` | 干涉强度 | xmin=-15 xmax=15 |
| ch12 detail 12.1 | Planck 辐射公式（:::canvas 不同温度） | u(λ,T) | xmin=0 xmax=5 |
| ch12 detail | 光电效应 E_k vs ν 线性关系 | 截止频率 | xmin=0 xmax=10 |

每个 subagent：
1. 定位对应的 detail 文件
2. 在适当位置（如定义、定理后面）插入 `::plot` 或 `:::canvas` 指令
3. 确保表达式符合 `compileMathExpr` 解析器语法
4. 添加 `label` 属性用于图例显示

#### 物理示意图（2 个并行 subagent）

**Subagent P4：电磁学示意图（ch7-ch9）**
为以下概念创建 SVG 文件：
- 电场线分布（点电荷、平行板电容器）
- 高斯面选取示意图
- 安培环路定律配图
- 电磁感应——法拉第定律示意

保存到 `public/images/physics/svg/ch07/` 等，在 detail 文件中用 `::figure` 引用。
SVG 要求：
- 使用 `currentColor` 或 CSS 变量，确保亮暗主题可读
- 宽度 400-600px，viewBox 等比
- 箭头用 `<marker>` 定义，线条用 `<path>` 或 `<line>`

**Subagent P5：光学示意图（ch10-ch11）**
- 折射/反射光路图
- 薄透镜成像光路
- 干涉/衍射实验装置示意（杨氏双缝、单缝）
- 牛顿环示意

#### 化学分子结构（3 个并行 subagent）

**Subagent C1：基础结构式（ch2-ch5）**
- 处理 ch2 命名章节的 SVG-TODO 标注
- 绘制 IUPAC 命名典型分子（甲烷、乙烷、丙烷、丁烷异构体）
- ch3 立体化学：R/S 构型的楔形键式
- ch4-5 构象：Newman 投影式

SVG 格式规范（化学分子）：
- 键长 30px，键角 120°（sp2）或 109.5°（sp3）
- C 原子省略（骨架式），H 隐含
- 杂原子（O, N, S 等）显式标注
- 楔形键：实心三角 = 向前，虚线三角 = 向后

**Subagent C2：不饱和烃与芳烃（ch6-ch9）**
- ch6 E/Z 异构体对比图
- ch7 共轭二烯分子轨道示意
- ch9 苯环共振结构
- ch9 亲电取代定位效应示意

**Subagent C3：反应机理（ch10-ch14）**
- ch10 SN1/SN2 反应机理（弯箭头表示电子流动）
- ch10 E1/E2 消除反应机理
- ch12 醛酮亲核加成机理
- ch13 酯化反应机理

SVG 反应机理格式：
- 弯箭头用 `<path>` + `<marker>` 实现
- 正电荷/负电荷用 ⊕/⊖ 符号
- 过渡态用 `[‡]` 标记
- 分步展示：每步一个 SVG 或用 `<g>` 分组

### Phase D（Debug）
1. `pnpm run dev` 检查所有新增 `::plot` / `:::canvas` 渲染
2. 确认函数图像的 x/y 范围合理（曲线完整显示）
3. 确认 SVG 文件在亮/暗主题下均可读
4. 确认 `::figure{src=".../svg/..."}` 正确引用 SVG 文件
5. 移除所有 `<!-- SVG-TODO -->` 标注（已完成的）

### Phase C（Commit）
分学科分批 commit：
1. `feat(physics): add ::plot function graphs for vibration, thermal, optics, quantum`
2. `feat(physics): add SVG diagrams for electromagnetism and optics`
3. `feat(chemistry): add SVG molecular structures for basic organic compounds`
4. `feat(chemistry): add SVG reaction mechanism diagrams`
```

## 预期产出

| 产出 | 数量 | 路径 |
|------|------|------|
| 物理 `::plot` 指令 | ~15-25 处 | 内嵌于 detail 文件 |
| 物理 SVG 示意图 | ~15-20 个 | `public/images/physics/svg/` |
| 化学分子结构 SVG | ~30-40 个 | `public/images/chemistry/svg/` |
| 化学反应机理 SVG | ~10-15 个 | `public/images/chemistry/svg/` |
| 清除的 SVG-TODO | 全部 | — |

## 执行策略

```
┌─────────────────────────────────────┐
│         并行组 1（函数图像）          │
│  P1: 振动与波 (ch3-4)               │
│  P2: 热学 (ch5)                     │
│  P3: 光学+量子 (ch11-12)            │
└──────────────┬──────────────────────┘
               │ 完成后
┌──────────────┴──────────────────────┐
│         并行组 2（示意图+分子）       │
│  P4: 电磁学 SVG (ch7-9)            │
│  P5: 光学 SVG (ch10-11)            │
│  C1: 基础结构式 (ch2-5)             │
│  C2: 不饱和烃 SVG (ch6-9)          │
│  C3: 反应机理 SVG (ch10-14)        │
└─────────────────────────────────────┘
```

并行组 1 先行（`::plot` 不需要绘制 SVG 文件，只写指令），并行组 2 后续。

## 质量标准

| 维度 | 标准 |
|------|------|
| 函数图像 | 曲线完整显示，关键点（极值/零点/拐点）可见 |
| 标签/图例 | 使用准确的物理/化学符号，如 ω, λ, ν |
| 主题适配 | 亮色模式黑线白底，暗色模式白线黑底 |
| 文件大小 | 单个 SVG < 10KB（矢量图天然轻量） |
| 无障碍 | SVG 含 `<title>` 和 `aria-label` |
