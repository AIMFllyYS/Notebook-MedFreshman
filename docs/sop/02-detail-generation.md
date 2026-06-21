# SOP 02 — 详解板块生成（理工科）

> 本 SOP 合并并替代原 `docs/SOP-章节生成.md`。适用于概率论、大学物理、有机化学等理工类课程。

## 适用场景

融合教材、课堂录音、课件等所有资料，自主重构为通俗易懂、循序渐进的原创详解讲义。每个小节配备笔记 + 动画 + 交互组件三件套。

## 输入物料

| 物料 | 路径 | 说明 |
|------|------|------|
| 教材板块（已处理） | `content/{subject}/textbook/{chapterId}.md` | 由 SOP-01 产出 |
| 课堂录音 | `content/{subject}/recording/rec-XX.md` | 由 SOP-03 产出 |
| 课堂纪要 | `content/{subject}/summary/sum-XX.md` | 由 SOP-03 产出 |
| PPT/课件原始解析 | `content/_raw/{subject}/` | 由 SOP-00 解析产出 |
| 渲染架构参考 | `docs/refer/rendering-architecture.md` | 指令块语法细节 |

## 执行角色分配

| 阶段 | 角色 | 类型 | 职责 |
|------|------|------|------|
| 上下文收集 | Explorer | Explore subagent | 读取教材+录音+纪要，整理为精简输入 |
| 内容生产 | Writer-1~N | GeneralPurpose subagent (每个 2-3 小节) | 撰写详解笔记 |
| 交互组件 | Interactive-1~N | GeneralPurpose subagent | 开发配套交互 TSX |
| Manim 动画 | Animator-1~N | GeneralPurpose subagent | 编写 Manim 场景 |
| 集成 | Integrator | GeneralPurpose subagent | registry + manifest + media 注册 |

**上下文控制**：
- Explorer 输出精简的「章节输入包」（每小节 ~500 字的知识点摘要 + 录音重点 + 考试暗示）
- Writer 只接收自己负责的 2-3 小节的输入包，不需要完整教材
- Interactive/Animator 只接收对应小节的概念描述，不需要完整笔记

## 总原则

1. **原创讲解，而非转写**：逐字稿只用于提取重点/例子/易错点，笔记必须用自己的话重新组织
2. **建立直觉优先**：先给生活化直觉/动机，再给严格定义与推导，再给例题，最后小结
3. **面向初学者**：默认读者刚学完微积分与线代，每一步推导都解释"为什么"
4. **四件套必备**：每小节 = 笔记(.md) + 函数图/SVG画布 + 交互(TSX) + 动画(Manim .py)

## 视觉内容分级指南

当讲解需要图形辅助时，按成本从低到高选择合适的层级：

| 层级 | 指令/工具 | 适用场景 | 工作量 |
|------|----------|---------|--------|
| Tier 1 | `::plot{fn="..." ...}` | 数学函数图像（f(x) 曲线） | 最低，一行指令 |
| Tier 2 | `::figure{src="..." caption="..."}` | 已有的教材/解析图片 | 低，引用现有图片 |
| Tier 3 | `:::canvas` + 多个 `::plot` | 多函数对比（共享坐标系 + 图例） | 低，几行指令 |
| Tier 4 | `::interactive{id=...}` | 可拖动/可调参的交互演示 | 中，需开发 TSX |
| Tier 5 | `::video{id=...}` | Manim 动画讲解 | 高，需编写+渲染 |

### 选择决策树

```
需要图形辅助？
├─ 是单个函数 f(x) → Tier 1: ::plot
├─ 教材/解析已有图片 → Tier 2: ::figure
├─ 多函数对比/叠加 → Tier 3: :::canvas
├─ 需要用户调参交互 → Tier 4: ::interactive
└─ 需要动态演示过程 → Tier 5: ::video
```

### 典型用例

- **物理 SHM 曲线**：`::plot{fn="cos(2*x)" label="x=Acos(ωt)"}`
- **物理场线/电路图**：AI `drawDiagram` 工具生成 SVG
- **化学分子结构**：手绘 SVG 或 `drawDiagram`
- **概率分布对比**：`:::canvas` 包裹多个 `::plot`
- **牛顿环干涉条纹**：`::interactive`（交互调参更直观）

## 步骤流程

### Step 1：章节规划

主控确定目标章节的小节列表（从 manifest 或教材目录）：

```
第X章：
  - X.1 {小节标题}
  - X.2 {小节标题}
  - X.3 {小节标题}
```

### Step 2：上下文收集

Explorer subagent 为每个小节整理「输入包」：

```markdown
## 小节 X.Y: {标题}

### 教材核心内容
- 定义：{从教材板块摘录}
- 定理/性质：{列表}
- 公式：{关键公式}

### 课堂重点（从录音/纪要提取）
- 老师强调的重点：{...}
- 老师的即兴举例：{...}
- 考试暗示：{...}
- 常见学生错误：{...}

### PPT 课件补充
- 课件中的经典例题：{题目概述}
- 图示/表格要点：{...}
```

### Step 3：笔记撰写

Writer subagent 按以下模板撰写每个小节：

#### 笔记结构模板

```markdown
## {从一个真实问题或疑问切入的标题}

{1-2 段生活化引入，建立学习动机}

:::insight{label=为什么要学这个}
{直觉解释，让读者感受到这个概念的意义}
:::

## 定义

:::definition{label={概念名}}
{严格数学定义}

$$
{公式，独占行}
$$

逐符号解释：
- $X$ — {含义}
- $P(\cdot)$ — {含义}
:::

## 性质与定理

:::theorem{label={定理名}}
{定理表述}

$$
{公式}
$$
:::

:::derivation{label={定理名}推导}
{逐步推导，每步解释"为什么"}
:::

## 例题

:::example{label={例题简述}}
**题目**：{完整题干}

**分析**：{解题思路}

**解**：
{完整解答，每步有说明}
:::

{2-4 个例题，由浅入深}

::video{id={chapterId}-{sectionId}-{slug}}
::interactive{id={chapterId}-{sectionId}-{slug}}

## 易错点

:::pitfall{label={错误描述}}
{常见错误 + 正确做法 + 为什么容易错}
:::

## 小结

:::note{label=本节小结}
- {核心结论 1}
- {核心结论 2}
- 下一节我们将学习 {衔接}
:::
```

#### 写作规范

| 规则 | 说明 |
|------|------|
| 公式 | `$$` 必须独占一行，行内用 `$...$`，禁止 `\( \)` |
| 篇幅 | 单节不少于 1500 字，复杂节可达数千字 |
| 例题 | 2-4 个，由浅入深，含完整解答 |
| 语气 | 通俗但严谨，像优秀的一对一家教 |
| 来源标注 | 不在正文中标注来源（内化后原创输出） |

### Step 4：交互组件开发

Interactive subagent 为每个小节开发可交互 TSX 组件：

- 路径：`components/interactives/{subject}/{chapterId}/{Name}.tsx`
- 首行 `"use client";`，默认导出无 props 组件
- 自包含（无网络请求），状态用 `useState`
- 用 SVG / Canvas 做可拖动、可调参的可视化
- 样式用设计令牌：`var(--accent)`, `var(--ink)`, `var(--line)`, `var(--bg-muted)`

### Step 5：Manim 动画

Animator subagent 编写 Manim 场景：

- 路径：`manim/chapters/{chapterId}/{file}.py`
- 含 `REGISTER` 导出字典
- 时长 20-60s，循序渐进
- 中文用 `Text("...", font="Microsoft YaHei")`
- 渲染：`python manim/render.py --chapter {chapterId}`

### Step 6：集成

参照 [05-content-integration.md](./05-content-integration.md)，统一更新：

1. `content/manifest.ts` — 小节 status 改为 `"done"`，添加 `videoIds` / `interactiveIds`
2. `components/interactives/registry.ts` — 注册新交互组件
3. `content/media.generated.ts` — 添加视频条目（或运行 render 脚本自动生成）

## 文档解析规范

本 SOP 不直接执行文档解析。输入物料由 SOP-00（基础设施）和 SOP-01（教材）提供。

若需要额外解析参考资料（如从网上下载的 PDF 讲义），参照 [00-infrastructure.md](./00-infrastructure.md) 执行。

## 产出规范

| 产出 | 路径 | 命名 |
|------|------|------|
| 小节笔记 | `content/chapters/{chapterId}/{sectionId}.md`（概率论）或 `content/{subject}/detail/{itemId}.md`（其他） | `1.4.md` |
| 交互组件 | `components/interactives/{subject}/{chapterId}/{Name}.tsx` | PascalCase |
| Manim 场景 | `manim/chapters/{chapterId}/scene_{sectionId}_{slug}.py` | snake_case |
| 视频 | `public/media/videos/{subject}/{chapterId}/{id}.mp4` | 由渲染脚本生成 |

### ID 命名规范

- 视频 ID：`{chapterId}-{sectionId}-{slug}`，如 `ch01-1.4-classical`
- 交互 ID：`{subject}-{chapterId}-{sectionId}-{slug}`，如 `probability-ch01-1.4-coins`

## AI 工具可达性验证

完成后验证（参照 [05-content-integration.md](./05-content-integration.md)）：

1. `readContentMarkdown(subjectId, "detail", itemId)` 返回完整笔记
2. 右侧「可交互」Tab 显示新注册的组件
3. 右侧「动画讲解」Tab 显示新视频
4. AI Tab 中发送"这个定义是什么意思"，确认 AI 能读取并回答

## 黄金范例

以下已完成的内容可作为新章节的参考标准：

| 文件 | 说明 |
|------|------|
| `content/chapters/ch01/1.1.md` | 概率论第一章第一节完整笔记 |
| `components/interactives/probability/ch01/VennPlayground.tsx` | 维恩图交互组件 |
| `manim/chapters/ch01/scene_1_1_sample_space.py` | 样本空间动画场景 |

## 参考文件

- [00-infrastructure.md](./00-infrastructure.md) — 文档解析（如需额外解析）
- [05-content-integration.md](./05-content-integration.md) — 集成验证
- [docs/refer/rendering-architecture.md](../refer/rendering-architecture.md) — Markdown 指令块完整语法
- [subject-onboarding.md](./subject-onboarding.md) — 新学科接入全流程（含 registry 注册详解）
