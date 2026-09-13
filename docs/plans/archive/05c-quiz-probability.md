# 05c — 题目测试：概率论与数理统计（8章）

> **执行方式**：Chat D · 第3个（05b 完成后）
> **前置依赖**：05b-quiz-maogai.md 已 commit

---

## 任务概述

为概率论与数理统计 8 章生成题目测试数据。完成后立即 commit。

## 提示词

```
你是概率论题目测试生成主控智能体。

## Skills 加载（必须首先读取）
请依次读取以下 skill 文件并遵循其中规范：
1. C:\Users\AIMFl\.claude\skills\superpowers\executing-plans\SKILL.md
2. C:\Users\AIMFl\.claude\skills\superpowers\subagent-driven-development\SKILL.md
3. C:\Users\AIMFl\.claude\skills\superpowers\verification-before-completion\SKILL.md
4. C:\Users\AIMFl\.claude\skills\superpowers\dispatching-parallel-agents\SKILL.md

## 前置确认
1. components/quiz/ 组件已存在
2. docs/sop/04-quiz-generation.md 已更新
3. content/quiz/ 下已有其他科目 JSON 作为格式参考

## 必读 SOP
1. docs/sop/04-quiz-generation.md — 题目测试生成与组卷规范
2. docs/refer/考试题型分布.md — 各科目题型配比

## 任务
为概率论与数理统计 8 章生成题目测试 JSON 数据。严格按 SOP-04 的 5 步流程执行。

## 题型分布（实时读取 docs/refer/考试题型分布.md，以下为现值）
- 单项选择题：10题×2分=20分
- 填空题：10题×2分=20分
- 计算/解答题：6题×10分=60分
> 题型已更新（新增填空题）；执行时**务必以 `docs/refer/考试题型分布.md` 实时内容为准**，按比例缩放为每章测试量。

## 重要：概率论路径特殊
概率论使用旧路径结构（不是通用路径）：
- 详解文件：content/chapters/ch{XX}/{sectionId}.md
- manifest：content/probability-detail.ts
- 不是 content/probability/detail/（与其他科目不同！）

## PADC 流程

### Phase P（Plan）
1. 读取 content/probability-detail.ts 获取 8 章结构
2. 确认 content/chapters/ch01/ ~ ch08/ 下有哪些 .md 文件
3. 参考已有 content/quiz/ 下其他科目 JSON 格式

### Phase A（Act）

Subagent 分组（并行）：
| 组 | 章节 | 内容 |
|----|------|------|
| 1 | ch01-ch03 | 事件概率、随机变量、多维随机变量 |
| 2 | ch04-ch06 | 数字特征、大数定律、统计量 |
| 3 | ch07-ch08 | 参数估计、假设检验 |

每个 subagent prompt：
```
你是概率论出题子智能体，处理第{X}-{Y}章。

必读：docs/sop/04-quiz-generation.md
题型：从 docs/refer/考试题型分布.md 读取概率论部分
格式参考：content/quiz/modern-history/ch01.json

输入：content/chapters/ch{XX}/ 下的 .md 文件（概率论特殊路径！）
（读取 content/probability-detail.ts 获取具体 children ID）

规则：
1. 50% 本章 + 50% 复习（第1章 100% 本章）
2. 难度 70/20/10
3. 题型：single_choice（单选）、fill_blank（填空）、essay（计算/解答，label="计算题"）
4. 概率论特殊要求：
   - 选择题：公式辨析、性质判断、分布识别
   - 填空题：关键公式/分布/数值结果，answer 为标准答案字符串（KaTeX）
   - 解答题：必须包含完整计算过程
     常见题型：求分布函数/密度函数、求期望方差、极大似然估计、假设检验、贝叶斯公式、中心极限定理
   - 所有公式用 KaTeX：$$...$$ 独占行（JSON 字符串中为 \\n$$\\n）
   - 评分标准精确到每步（"列出正确联合密度得2分"）
5. **【v2 强制】每题须满足 SOP-04「答案核验、深度解析与来源目录」**：
   - 答案经核验绝对正确（实际 Read content/chapters/ch{XX}/ 详解确认）
   - explanation 为逐步深度解析；hint 必填（提示思路不泄露答案）
   - sourceRef.path 指向 content/chapters/ch{XX}/{sectionId}.md（来源目录）
6. **【v2 强制 · Manim 视频】每个较复杂的解答题（medium/hard 计算/推导题）必须给出 Manim 视频讲解**：
   - 在该题 `manimVideoId` 填占位 id（命名约定 `quiz-prob-ch{XX}-q{NN}`，全局唯一）
   - 同时产出一份待渲染清单 `content/quiz/probability/_manim-todo.md`，列出每个 manimVideoId 对应的讲解脚本要点（供 manim/render.py 后续渲染写入 content/media.generated.ts）
   - 前端在视频未就绪时显示「生成中」占位，渲染后自动可播
7. 使用 webSearch 搜索考研概率论真题作参考（不照抄）

产出：
- content/quiz/probability/ch{XX}.json（格式严格遵循 SOP-04 JSON Schema）
- content/quiz/probability/_manim-todo.md（复杂题 Manim 讲解脚本清单）
```

### Phase D（Debug）
- JSON 格式校验
- 确认公式 $$...$$ 独占行（在 JSON 字符串中为 \\n$$\\n）
- 确认解答题评分标准精确到步骤

### Phase C（Commit）
```bash
git add content/quiz/probability/
git commit -m "feat(quiz): 概率论与数理统计题目测试 (ch01-ch08, 完整8章)"
```

## 产出
| 产出 | 路径 |
|------|------|
| 题目JSON | content/quiz/probability/ch{01-08}.json |

## 全局验证（本科目完成后 = 全部出题任务完成）
1. 验证所有 4 科目的 quiz JSON 均存在
2. 运行 npx tsc --noEmit
3. 在浏览器中访问各科目页面，确认 QuizTab 能正确加载并渲染

如有修复：
```bash
git commit -m "fix(quiz): 题目测试数据格式修正"
```
```

---

## 依赖说明
- **前置**：05b-quiz-maogai.md 已完成并 commit
- **后续**：全部出题任务完成，可进行最终集成验证
