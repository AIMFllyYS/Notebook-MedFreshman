# 01 — 大学物理课件PPT → 详解正文

> **执行方式**：Chat A · Queue 第1个任务
> **后续任务**：完成后在同一 Chat 中继续执行 02-physics-exercises.md

---

## 任务概述

将 12 个大学物理课件 PPT 处理为平台「详解」板块的正文内容。所有 PPT 内容一律视为正文，不做例题分流。

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
将大学物理课件 PPT 处理为平台「详解」板块正文内容。

## 核心约束
1. 所有 PPT 内容一律视为「正文」（不分流到 examples）
2. PPT 中的概念 → :::definition / :::theorem
3. PPT 中的例题 → :::example{} 内嵌于正文（不拆到 examples 目录）
4. PPT 中的推导 → :::derivation 折叠块
5. PPT 中的注意事项 → :::pitfall
6. 不需要"原创重写"，忠实格式化 PPT 原有内容即可

## 必读 SOP（在开始前完整阅读）
1. docs/sop/00-infrastructure.md — 文档解析与容灾降级
2. docs/sop/02-detail-generation.md — 详解板块格式规范（参考其笔记结构模板和写作规范部分）

## PADC 流程

### Phase P（Plan）
1. 读取上述 SOP 确认流程
2. 列出所有源文件和预期产出
3. 确定 subagent 分组方案

### Phase A（Act）

#### 阶段 1：文档解析
派发 Shell subagent 运行：
```bash
npx tsx scripts/parse-docs.ts --subject physics --files "C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第2章-流体运动.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第3章-振动.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第4章-机械波.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第5章-分子动理论.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第7章-静电场.pptx,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第8章-稳恒磁场.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第9章-电磁感应与电磁波.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第10章-几何光学.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第11章-波动光学.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第12章-量子力学初步.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第13章-原子核和放射性.ppt,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理课件PPT\第14章-X射线，激光.ppt" --output "content/_raw/physics/courseware"
```

若 MinerU 不可用，按 00-infrastructure.md 容灾降级：
```bash
python scripts/fallback-pptx.py "{file}" "content/_raw/physics/courseware/{basename}.md"
```

#### 阶段 2：内容生产（并行 subagent）
按以下分组派发 GeneralPurpose subagent（使用 dispatching-parallel-agents skill）：

| 组 | 章节 | subagent 输入 |
|----|------|--------------|
| 1 | ch02-ch05 | content/_raw/physics/courseware/ 中对应文件 |
| 2 | ch07-ch09 | 同上 |
| 3 | ch10-ch14 | 同上 |

每个 subagent 的 prompt 模板：
```
你是内容生产子智能体，负责大学物理详解正文，处理范围：第{X}-{Y}章。

必读：docs/sop/02-detail-generation.md（笔记结构模板部分）

输入文件：content/_raw/physics/courseware/第{N}章-*.md

任务：
1. 分析 PPT 内部结构，按主题划分为 2-5 个小节
2. 每小节产出：content/physics/detail/{X.Y}.md
3. 格式要求：
   - 概念 → :::definition{label=...}
   - 定理/定律 → :::theorem{label=...}
   - 例题 → :::example{label=...}（内嵌正文，不分离）
   - 推导 → :::derivation{label=...}
   - 注意 → :::pitfall{label=...}
   - 公式：$$ 必须独占行
4. 不需要原创重写，忠实格式化即可
5. 完成后列出所有产出文件路径和对应 itemId

禁止：
- 不写 content/examples/
- 不修改 manifest.ts
```

#### 阶段 3：后处理验证
- 确认所有产出文件存在且非空
- 抽查公式格式（$$ 独占行）
- 确认文件路径符合 content/physics/detail/{X.Y}.md 规范

### Phase D（Debug）
- 运行 `npx tsc --noEmit` 确认无类型错误
- 确认 readContentMarkdown("physics", "detail", "2.1") 可读取

### Phase C（Commit）
```bash
git add content/physics/detail/ content/_raw/physics/courseware/
git commit -m "feat(content): 大学物理课件PPT → 详解正文 (ch02-ch14)"
```

## 产出规范
| 产出 | 路径 |
|------|------|
| 详解正文 | content/physics/detail/{X.Y}.md（如 2.1.md, 7.3.md） |
| 中间产物 | content/_raw/physics/courseware/*.md |

## 禁止事项
- ✗ 不写入 content/examples/（属于下一个 Queue 任务）
- ✗ 不写入 content/chemistry/
- ✗ 不修改 content/manifest.ts（后续统一集成）
- ✗ 不将任何内容分流到 examples 目录

## 章节映射
| 源文件 | chapterId | 预计小节 |
|--------|-----------|---------|
| 第2章-流体运动.ppt | ch02 | 2.1~2.3 |
| 第3章-振动.ppt | ch03 | 3.1~3.3 |
| 第4章-机械波.ppt | ch04 | 4.1~4.3 |
| 第5章-分子动理论.ppt | ch05 | 5.1~5.2 |
| 第7章-静电场.pptx | ch07 | 7.1~7.4 |
| 第8章-稳恒磁场.ppt | ch08 | 8.1~8.3 |
| 第9章-电磁感应与电磁波.ppt | ch09 | 9.1~9.3 |
| 第10章-几何光学.ppt | ch10 | 10.1~10.2 |
| 第11章-波动光学.ppt | ch11 | 11.1~11.3 |
| 第12章-量子力学初步.ppt | ch12 | 12.1~12.2 |
| 第13章-原子核和放射性.ppt | ch13 | 13.1~13.2 |
| 第14章-X射线，激光.ppt | ch14 | 14.1~14.2 |

注意：无第1章和第6章PPT（课程缺失），小节数由 PPT 实际内容决定。
```

---

## 依赖说明
- 本任务无前置依赖
- 本任务完成后，同一 Chat 继续执行 [02-physics-exercises.md](./02-physics-exercises.md)
