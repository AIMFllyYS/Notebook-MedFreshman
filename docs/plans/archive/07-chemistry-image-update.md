# 07 — 有机化学图片更新与分子结构 SVG

> **执行方式**：独立 Chat · 可与 06/08 并行
> **前置依赖**：Image & SVG Infrastructure（已完成）

---

## 任务概述

1. 用 MinerU 重新解析 20 个化学 PPT-PDF（`tmp/chemistry-ppt-pdf/`），提取图片
2. 将图片本地化到 `public/images/chemistry/`
3. 修复 19 个已知的 summary 图片断链（`/images/chemistry/sum-XX/...`）
4. 运行 `propagate-images.py` 将图片以 `::figure` 注入 95 个详解文件和 215 个例题文件
5. 对高优先级章节（分子命名、立体化学、反应机理）规划 SVG 分子结构绘制

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
为有机化学所有板块补充图片引用，修复已知断链，并规划分子结构 SVG 绘制。

## 必读 SOP
1. docs/sop/00-infrastructure.md — 文档解析与图片本地化
2. docs/sop/01-textbook-processing.md — 教材处理（含图片自动处理）
3. docs/sop/02-detail-generation.md — 详解格式（含视觉内容分级指南）
4. docs/refer/rendering-architecture.md — §5.5 SVG Canvas + §5.6 图片基础设施

## PADC 流程

### Phase P（Plan）
1. 读取上述 SOP
2. 扫描 `tmp/chemistry-ppt-pdf/` 列出所有 PDF 文件
3. 扫描 `public/images/chemistry/` 确认当前图片状态
4. 扫描 `content/chemistry/summary/` 定位 19 个断链文件
5. 设计 subagent 分组

### Phase A（Act）

#### 阶段 1：化学 PPT-PDF 解析
列出 `tmp/chemistry-ppt-pdf/` 下所有 20 个 PDF 文件，派发 Shell subagent：
```bash
npx tsx scripts/parse-docs.ts --subject chemistry --files "{逗号分隔的20个PDF路径}"
```

确认 `public/images/chemistry/` 下生成了新图片。

#### 阶段 2：修复 summary 图片断链
扫描 `content/chemistry/summary/` 下所有 .md 文件，找到引用 `/images/chemistry/sum-XX/...` 但 404 的图片。
对每个断链：
1. 检查 MinerU 新解析是否恢复了该图片
2. 若已恢复 → 更新路径
3. 若未恢复 → 在文件中插入注释 `<!-- TODO: 图片缺失 -->`

#### 阶段 3：图片传播
```bash
# 先预览
python scripts/propagate-images.py --dry-run

# 确认后正式运行
python scripts/propagate-images.py
```

目标：将 MinerU 恢复的图片以 `::figure` 指令插入：
- 95 个详解文件（`content/chemistry/detail/`）
- 215 个例题文件（`content/examples/chemistry/`）

#### 阶段 4：分子结构 SVG 审查（并行 subagent）

**Subagent 1：基础有机（ch1-ch5）**
- ch2（命名）：核心有机物的结构简式，如 IUPAC 命名的典型分子
- ch3（立体化学）：R/S 构型、Fischer 投影式
- ch4（烷烃）：构象（Newman 投影式）
- ch5（环烷烃）：椅式/船式构象

**Subagent 2：不饱和烃（ch6-ch8）**
- ch6（烯烃）：E/Z 异构体对比
- ch7（炔烃/二烯烃）：共轭体系示意
- ch8（立体化学深入）：手性中心标记

**Subagent 3：芳烃与卤代烃（ch9-ch11）**
- ch9（芳烃）：苯环共振结构
- ch10（卤代烃）：SN1/SN2 反应机理箭头
- ch11（醇/醚/酚）：氢键示意

**Subagent 4：含氧含氮化合物（ch12-ch18）**
- ch12（醛/酮）：亲核加成机理
- ch13（羧酸/酯）：酯化/水解机理
- ch14（含氮化合物）：重氮化反应
- ch15-18：按需补充（这些章节例题较少，2-5 题/章）

每个 subagent：
1. 扫描对应章节的 detail 和 example 文件
2. 识别需要分子结构图的位置（如提到"结构式""构象""机理"的段落）
3. 在 Markdown 中标注 `<!-- SVG-TODO: {描述} -->`（本阶段仅标注，不绘制）
4. 统计标注数量供后续 08-svg-content-authoring 计划使用

### Phase D（Debug）
1. `pnpm run dev` 逐章检查图片显示
2. 确认 summary 断链已修复（无 404）
3. 确认 `::figure` 指令正确渲染
4. 检查 SVG-TODO 标注的合理性

### Phase C（Commit）
1. `feat(chemistry): re-parse 20 PPT-PDFs with MinerU for image recovery`
2. `fix(chemistry): repair 19 broken summary image references`
3. `feat(chemistry): propagate ::figure directives into detail/example files`
4. `chore(chemistry): mark SVG-TODO locations for molecular structure diagrams`
```

## 预期产出

| 产出 | 数量 | 路径 |
|------|------|------|
| 新恢复图片 | ~300-600 张 | `public/images/chemistry/` |
| 修复的断链 | 19 处 | `content/chemistry/summary/` |
| 更新的详解文件 | ~30-50 个 | `content/chemistry/detail/` |
| 更新的例题文件 | ~80-120 个 | `content/examples/chemistry/` |
| SVG-TODO 标注 | ~50-80 处 | 散布于 detail/example 文件中 |

## 化学 SVG 优先级清单

| 章节 | SVG 需求类型 | 优先级 | 复杂度 |
|------|------------|--------|--------|
| ch2 命名 | IUPAC 命名结构简式 | 高 | 低 |
| ch3 立体化学 | R/S, Fischer 投影 | 高 | 中 |
| ch6 烯烃 | E/Z 异构体 | 高 | 低 |
| ch8 立体化学深入 | Newman 投影、构象 | 高 | 中 |
| ch10 卤代烃 | SN1/SN2/E1/E2 机理 | 高 | 高 |
| ch12 醛酮 | 亲核加成弯箭头 | 中 | 高 |
| ch13 羧酸酯 | 酯化/水解机理 | 中 | 高 |
| ch9 芳烃 | 共振结构、定位效应 | 中 | 中 |

## 注意事项

- ch15-18 例题较少（2-5 题/章），审查时确认是否需要补充更多例题
- 化学分子结构 SVG 的正式绘制在 08-svg-content-authoring 计划中执行
- 本计划仅做标注（SVG-TODO），不实际绘制
