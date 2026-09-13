# 02 — 大学物理学习指导 → 例题 Tab

> **执行方式**：Chat A · Queue 第2个任务（紧接 01 完成后）
> **前置依赖**：01-physics-ppt-detail.md 已完成（detail 小节 ID 已确定）

---

## 任务概述

将 14 本大学物理学习指导 PDF（练习册性质）中的所有题目提取到平台「例题 Tab」。学习指导的本质是练习册，**全部内容严格归入 examples 目录**。

## 提示词

```
你是内容处理主控智能体。

## Skills 加载（必须首先读取）
请依次读取以下 skill 文件并遵循其中规范：
1. C:\Users\AIMFl\.claude\skills\superpowers\executing-plans\SKILL.md
2. C:\Users\AIMFl\.claude\skills\superpowers\subagent-driven-development\SKILL.md
3. C:\Users\AIMFl\.claude\skills\superpowers\verification-before-completion\SKILL.md
4. C:\Users\AIMFl\.claude\skills\superpowers\dispatching-parallel-agents\SKILL.md

## 上下文
前一个任务（01-physics-ppt-detail）已完成，content/physics/detail/ 目录下已有各章小节文件（如 2.1.md, 2.2.md, 7.1.md 等）。
本任务需要将学习指导中的例题对应到这些已存在的小节 ID。

## 任务
将大学物理学习指导 PDF（练习册）中所有题目提取到例题 Tab。

## 核心约束
1. 学习指导 = 练习册，其中所有内容一律视为「例题」
2. 即使 PDF 中有知识点归纳/公式/定义，也仅作为例题解答的辅助上下文
3. 所有输出严格写入 content/examples/physics/ 目录
4. 绝不写入 content/physics/detail/（那是前一任务的产出）
5. 小节 ID 必须与 content/physics/detail/ 下已有文件名对应

## 必读 SOP
1. docs/sop/00-infrastructure.md — 文档解析与容灾降级
2. docs/sop/01-textbook-processing.md — 参考 Step 4（例题提取格式规范）

## 前置检查
在开始前，先列出 content/physics/detail/ 下所有 .md 文件名，获取已确定的小节 ID 列表。
这些 ID 就是你为例题分配 sectionId 时必须使用的值。

## PADC 流程

### Phase P（Plan）
1. 读取 content/physics/detail/ 目录，获取所有 itemId（如 2.1, 2.2, 7.1...）
2. 建立章节-小节映射表
3. 规划 subagent 分组

### Phase A（Act）

#### 阶段 1：文档解析
派发 Shell subagent：
```bash
npx tsx scripts/parse-docs.ts --subject physics --files "C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理学习指导\1-大学物理学习指导-第一章力学基本定律.pdf,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理学习指导\2-大学物理学习指导-第二章-流体力学.pdf,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理学习指导\3-大学物理学习指导-第三章-振动.pdf,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理学习指导\4-大学物理学习指导-第四章-机械波声波超声波.pdf,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理学习指导\5-大学物理学习指导-第五章-分子动理论.pdf,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理学习指导\6-大学物理学习指导-第六章-热力学基础.pdf,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理学习指导\7-大学物理学习指导-第七章-静电场.pdf,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理学习指导\8-大学物理学习指导-第八章-恒定电流的磁场.pdf,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理学习指导\9-大学物理学习指导-第九章-电磁感应.pdf,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理学习指导\10-大学物理学习指导-第十章-几何光学.pdf,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理学习指导\11-大学物理学习指导-第十一章-波动光学.pdf,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理学习指导\12-大学物理学习指导-第十二章-量子物理基础.pdf,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理学习指导\13-大学物理学习指导-第十三章-原子核和放射性.pdf,C:\Users\AIMFl\OneDrive\文档\课程文件\大学物理学习指导\14-大学物理学习指导-第十四章-X射线激光及医学应用.pdf" --output "content/_raw/physics/study-guide"
```

若 MinerU 不可用：
```bash
python scripts/fallback-pdf.py "{file}" "content/_raw/physics/study-guide/{basename}.md"
```

#### 阶段 2：题目提取（并行 subagent）

分组：
| 组 | 章节 | 说明 |
|----|------|------|
| 1 | ch01-ch04 | 力学（注：ch01 有PDF但detail中无ch01内容，需特殊处理）|
| 2 | ch05-ch07 | 热学+静电 |
| 3 | ch08-ch10 | 电磁+光学 |
| 4 | ch11-ch14 | 光学+近代物理 |

每个 subagent 的 prompt：
```
你是例题提取子智能体，处理大学物理第{X}-{Y}章学习指导。

输入：content/_raw/physics/study-guide/ 中对应章节文件
参考：content/physics/detail/ 中已有的小节 ID 列表（已提供）

已有小节 ID：{传入从 Phase P 获取的 ID 列表}

任务：
1. 分析 PDF 内容，识别所有题目（含题干+解答）
2. 将每道题归入最匹配的小节 sectionId（根据题目涉及的知识点）
3. 若某章没有对应的 detail 小节（如 ch01/ch06），使用 "{章号}.1" 作为 sectionId
4. 每道题产出一个独立文件

产出路径：content/examples/physics/ch{XX}/{sectionId}/EX{NN}_{slug}.md
格式：
:::example{label={题目简述≤15字}}
**题目**：{完整题干}
**解**：{完整解答过程}
**答案**：{最终结果}
:::

命名规则：
- NN 为两位数编号（01, 02, ...）
- slug 为题目关键词（如"流体静压"、"伯努利"）

禁止：
- 不写 content/physics/detail/
- 不修改 manifest.ts
```

#### 阶段 3：验证
- 确认目录结构符合 content/examples/physics/ch{XX}/{sectionId}/ 规范
- 抽查例题格式（:::example 包裹完整）
- 确认 readExamples("physics", "ch02", "2.1") 能返回非空结果

### Phase D（Debug）
- 检查是否有 sectionId 与 detail 不匹配的情况
- 确认文件数量合理（每章 5-20 道题）

### Phase C（Commit）
```bash
git add content/examples/physics/ content/_raw/physics/study-guide/
git commit -m "feat(content): 大学物理学习指导 → 例题Tab (ch01-ch14, 全部14章)"
```

## 产出规范
| 产出 | 路径 |
|------|------|
| 例题文件 | content/examples/physics/ch{XX}/{X.Y}/EX{NN}_{slug}.md |
| 中间产物 | content/_raw/physics/study-guide/*.md |

## 特殊情况处理
- ch01 和 ch06 有学习指导 PDF 但没有对应的课件 PPT（detail 中可能无内容）
- 对这些章节：仍然提取例题，sectionId 使用 "1.1"/"6.1" 等自行推断的值
- 后续 manifest 注册时会处理这些孤立例题

## 禁止事项
- ✗ 不写入 content/physics/detail/
- ✗ 不写入 content/chemistry/
- ✗ 不修改 content/manifest.ts
- ✗ 不覆盖任何已有文件
```

---

## 依赖说明
- **前置**：01-physics-ppt-detail.md 完成（需要其产出的 detail 小节 ID）
- **后续**：物理板块内容处理全部完成后，需单独执行 manifest 集成
