# 03 — 有机化学课件PPT → PPT详解 + 作业例题

> **执行方式**：Chat B · 独立并行（与 Chat A、Chat C 同时运行）
> **无前置依赖**

---

## 任务概述

将有机化学课件 PPT 处理为：
1. 详解板块中新增的「PPT详解 · xxx」系列（与现有录音详解并列）
2. 作业讲解 PPT → 例题 Tab 内容

## 提示词

```
你是内容处理主控智能体。

## Skills 加载（必须首先读取）
请依次读取以下 skill 文件并遵循其中规范：
1. C:\Users\AIMFl\.claude\skills\superpowers\executing-plans\SKILL.md
2. C:\Users\AIMFl\.claude\skills\superpowers\subagent-driven-development\SKILL.md
3. C:\Users\AIMFl\.claude\skills\superpowers\verification-before-completion\SKILL.md
4. C:\Users\AIMFl\.claude\skills\superpowers\dispatching-parallel-agents\SKILL.md

## 任务
将有机化学课件 PPT 处理为：
1. 详解板块中并列新增「PPT详解」系列（16 个讲授PPT → detail 正文）
2. 作业讲解 PPT → 例题 Tab 内容（4 个作业PPT → examples）

## 核心约束（最重要，反复确认）
1. 所有 PPT详解 文件必须使用 `ppt-` 前缀 ID（如 ppt-1.1, ppt-2.1）
2. 文件路径：content/chemistry/detail/ppt-{X.Y}.md（有 ppt- 前缀！）
3. 绝不覆盖 content/chemistry/detail/ 下任何不含 ppt- 前缀的现有文件
4. 作业例题使用 HW{NN} 前缀命名（不是 EX{NN}），避免与已有 198 个 EX 文件冲突
5. 绝不覆盖 content/examples/chemistry/ 下已有的 EX*.md 文件

## 必读 SOP
1. docs/sop/00-infrastructure.md — 文档解析与容灾降级
2. docs/sop/02-detail-generation.md — 详解格式规范

## 现有文件结构认知（保护现有内容）
- content/chemistry/detail/ 下已有 1.1.md ~ 14.3.md（录音详解，不可修改）
- content/examples/chemistry/ 下已有 ~198 个 EX*.md 文件（不可覆盖）
- content/organic-chemistry-detail.ts 定义了现有 manifest items（不可修改）

## PADC 流程

### Phase P（Plan）
1. 读取 SOP，确认格式规范
2. 列出已有 detail 文件，确认无 ppt- 前缀文件存在
3. 确定 subagent 分组

### Phase A（Act）

#### 阶段 1：文档解析

批次 1 — 课堂讲授 PPT（Shell subagent）：
```bash
npx tsx scripts/parse-docs.ts --subject chemistry --files "C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\01. 第1章-绪论-王锋.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\02. 第2章-有机化合物的命名-王锋.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\03. 第3章 有机分子的弱相互作用与物理性质-王锋.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\04. 第4章 烷烃与环烷烃-王锋.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\05. 第5章 有机化学中的取代基效应-王锋.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\06. 第6章 烯与炔-王锋.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\07. 第7章 芳香烃-王锋.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\08. 第8章 对映异构-王锋.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\09. 第9章 卤代烃-王锋.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\10. 第11章 醇酚醚-王锋.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\11. 第12章 醛酮-王锋.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\12. 第13章 羧酸及其衍生物-王锋.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\13. 第15章 含氮有机化合物-王锋.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\14. 第16章 芳香杂环化合物-王锋.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\15. 第17章 糖类与脂类化合物-王锋.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\16. 第18章 含氮天然化合物-王锋.ppt" --output "content/_raw/chemistry/lecture"
```

批次 2 — 作业讲解 PPT（Shell subagent）：
```bash
npx tsx scripts/parse-docs.ts --subject chemistry --files "C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\18. 作业讲解（第1-5章）-王锋.pptx,C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\19. 作业讲解（第6-8章）-王锋.pptx,C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\20.  作业讲解（第9-13章）-王锋.pptx,C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\21. 作业讲解（第15-18章）-王锋.pptx" --output "content/_raw/chemistry/homework"
```

若 MinerU 不可用：
```bash
python scripts/fallback-pptx.py "{file}" "content/_raw/chemistry/{类型}/{basename}.md"
```

忽略重复文件："19. 作业讲解（第6-8章）-王锋 (1).pptx"

#### 阶段 2A：PPT详解生成（并行 subagent）

分组：
| 组 | 章节 | PPT 文件 |
|----|------|---------|
| 1 | ch01-ch05 | 绪论～取代基效应（5个） |
| 2 | ch06-ch09 | 烯炔～卤代烃（4个） |
| 3 | ch11-ch18 | 醇酚醚～含氮天然（7个，含跳号） |

每个 subagent prompt：
```
你是 PPT详解 生产子智能体，处理有机化学第{X}章-第{Y}章。

必读：docs/sop/02-detail-generation.md

输入：content/_raw/chemistry/lecture/ 中对应章节文件

任务：
1. 分析每个 PPT 的幻灯片结构，按主题划分 2-5 个小节
2. 每小节产出：content/chemistry/detail/ppt-{X.Y}.md
3. ID 格式：ppt-{章号}.{节号}（如 ppt-1.1, ppt-2.1, ppt-11.2）
4. 格式化为详解正文（:::definition, :::theorem, :::example 内嵌等）
5. PPT 中的例题内嵌为 :::example{}，不分离到 examples

关键：文件名必须有 ppt- 前缀！content/chemistry/detail/ppt-{X.Y}.md

禁止：
- 不修改任何不含 ppt- 前缀的现有 .md 文件
- 不写 content/examples/
- 不修改 manifest.ts
```

#### 阶段 2B：作业讲解 → 例题（单独 subagent）

```
你是作业例题提取子智能体，处理有机化学作业讲解 PPT。

输入：content/_raw/chemistry/homework/ 中 4 个文件

参考：先读取 content/organic-chemistry-detail.ts 获取现有 detail 的小节 ID 列表

任务：
1. 提取所有习题及解答
2. 根据题目内容判断所属章节和小节（参考现有 detail ID）
3. 写入 content/examples/chemistry/ch{XX}/{sectionId}/HW{NN}_{slug}.md

文件命名：
- 前缀必须是 HW（不是 EX），如 HW01_甲基迁移.md
- 避免与已有 EX*.md 文件冲突

格式：
:::example{label={题目简述}}
**题目**：{题干}
**解**：{解答}
:::

章节映射指导：
- 作业讲解（第1-5章）→ ch01-ch05 的各 sectionId
- 作业讲解（第6-8章）→ ch06-ch08 的各 sectionId
- 作业讲解（第9-13章）→ ch09-ch13 的各 sectionId
- 作业讲解（第15-18章）→ ch15-ch18 的各 sectionId

禁止：
- 不修改任何 EX*.md 文件
- 不写 content/chemistry/detail/
- 不修改 manifest.ts
```

### Phase D（Debug）
- 确认所有 ppt-*.md 文件都在 content/chemistry/detail/ 下
- 确认无任何现有文件被修改（git status 检查）
- 确认 HW*.md 文件不与 EX*.md 重名
- readContentMarkdown("chemistry", "detail", "ppt-1.1") 可读取

### Phase C（Commit）
```bash
git add content/chemistry/detail/ppt-*.md content/examples/chemistry/ content/_raw/chemistry/
git commit -m "feat(content): 有机化学PPT → PPT详解系列 + 作业例题 (HW前缀)"
```

## 产出规范
| 产出 | 路径 | 命名 |
|------|------|------|
| PPT详解正文 | content/chemistry/detail/ppt-{X.Y}.md | ppt-前缀必须 |
| 作业例题 | content/examples/chemistry/ch{XX}/{sectionId}/HW{NN}_{slug}.md | HW前缀必须 |
| 中间产物 | content/_raw/chemistry/lecture/*.md, content/_raw/chemistry/homework/*.md | — |

## PPT 章号 → ID 映射（注意跳号）
| PPT 中章号 | detail 文件 ID 前缀 |
|-----------|-------------------|
| 第1章 | ppt-1.* |
| 第2章 | ppt-2.* |
| 第3章 | ppt-3.* |
| 第4章 | ppt-4.* |
| 第5章 | ppt-5.* |
| 第6章 | ppt-6.* |
| 第7章 | ppt-7.* |
| 第8章 | ppt-8.* |
| 第9章 | ppt-9.* |
| 第11章 | ppt-11.* |
| 第12章 | ppt-12.* |
| 第13章 | ppt-13.* |
| 第15章 | ppt-15.* |
| 第16章 | ppt-16.* |
| 第17章 | ppt-17.* |
| 第18章 | ppt-18.* |

注意：无 ch10、ch14 的 PPT。
```

---

## 依赖说明
- 本任务无前置依赖，可与 Chat A 和 Chat C 完全并行
- 完成后需等所有并行任务结束再统一执行 manifest 集成
