# 04 — 题目测试系统：组件开发 + SOP更新 + 近现代史出题

> **执行方式**：Chat C · 第1步（与 Chat A、Chat B 并行）
> **后续任务**：完成后启动 05-quiz-remaining.md

---

## 任务概述

1. 开发完整的题目测试前端组件（替换当前 placeholder）
2. 更新 SOP-04 补充近现代史纲要的题型分布
3. 按 SOP-04 为中国近现代史纲要 10 章生成题目测试数据

## 提示词

```
你是全栈开发主控智能体，负责实现题目测试系统。

## Skills 加载（必须首先读取）
请依次读取以下 skill 文件并遵循其中规范：
1. C:\Users\AIMFl\.claude\skills\superpowers\executing-plans\SKILL.md
2. C:\Users\AIMFl\.claude\skills\superpowers\subagent-driven-development\SKILL.md
3. C:\Users\AIMFl\.claude\skills\superpowers\verification-before-completion\SKILL.md
4. C:\Users\AIMFl\.claude\skills\superpowers\dispatching-parallel-agents\SKILL.md
5. C:\Users\AIMFl\.claude\skills\superpowers\test-driven-development\SKILL.md

## 任务分三步
1. 开发题目测试组件（技术实现）
2. 更新 SOP 和题型分布文件
3. 为近现代史纲要生成第一套完整题目测试

## 必读文件
1. docs/sop/04-quiz-generation.md — 当前 SOP
2. docs/refer/考试题型分布.md — 当前题型分布（缺近现代史）
3. components/quiz/QuizTab.tsx — 当前 placeholder
4. content/modern-history-detail.ts — 近现代史 detail 章节结构

## 项目上下文（最近 commits）
- 项目使用 Next.js 16 + React 19 + TypeScript + Tailwind CSS v4
- UI 风格参考 Material Design 设计令牌（var(--md-sys-color-*)）
- 组件使用 "use client" 指令
- 状态管理用 Zustand（lib/store.ts）
- 近现代史纲要详解有 10 章 40 个小节（content/modern-history/detail/）

## PADC 流程

### ═══ 第一步：组件开发 ═══

#### Phase P（Plan）
读取当前 QuizTab.tsx（placeholder），设计完整的题目测试组件架构：
- QuizTab.tsx — 主容器（加载题目JSON、管理做题状态）
- QuizQuestion.tsx — 单题渲染（支持 5 种题型）
- QuizScoring.tsx — 评分/自评面板
- QuizSummary.tsx — 完成后的总结面板
- useQuizStore.ts — Zustand store（答题状态、得分）

#### Phase A（Act）
开发以下组件（使用 subagent 并行开发独立组件）：

**SubAgent 1: QuizTab + Store**
- 替换 components/quiz/QuizTab.tsx
- 创建 lib/quiz-store.ts（Zustand）
- 功能：加载 content/quiz/{subject}/{chapterId}.json
- 显示做题进度、切换题目、提交评分

**SubAgent 2: QuizQuestion 组件**
- 创建 components/quiz/QuizQuestion.tsx
- 支持 5 种题型渲染：
  - single_choice: 单选（Radio 按钮组）
  - multiple_choice: 多选（Checkbox 组）
  - true_false: 判断题（是/否按钮）
  - fill_blank: 填空题（Input 输入框）
  - essay: 解答大题（Textarea + 参考答案折叠）
- 题干支持 KaTeX 渲染（$...$ 和 $$...$$）
- 选项支持 KaTeX 渲染

**SubAgent 3: QuizScoring + QuizSummary**
- 创建 components/quiz/QuizScoring.tsx
  - 客观题：系统自动判分
  - 主观题：显示参考答案+评分标准，用户自评打分滑块
- 创建 components/quiz/QuizSummary.tsx
  - 百分制总分
  - 按题型统计正确率
  - 按来源统计（本章 vs 复习）
  - 按难度统计

**设计规范：**
- 使用 var(--md-sys-color-*) 设计令牌
- 响应式布局
- 暗色模式兼容
- 动画过渡（正确→绿色, 错误→红色）

#### Phase D（Debug）
- npx tsc --noEmit
- 手动创建一个测试用 JSON 文件验证渲染
- 确认所有题型正常显示

#### Phase C（Commit）
```bash
git add components/quiz/ lib/quiz-store.ts
git commit -m "feat(quiz): 完整题目测试组件系统 (5种题型+评分+总结)"
```

### ═══ 第二步：SOP 更新 ═══

#### Phase A（Act）
1. 更新 docs/refer/考试题型分布.md，补充：
```
4. 中国近现代史纲要课程期末考试题型分布
    ○ 单选题：20道，每题1分，共20分
    ○ 多选题：5道，每题2分，共10分
    ○ 判断题：10道，每题1分，共10分
    ○ 材料分析/简答题：4题，共60分
    ○ 考试形式：闭卷
```
（若用户有更准确的数据，后续可修改——SOP要求动态读取此文件）

2. 更新 docs/sop/04-quiz-generation.md：
- 补充人文科出题特殊指导（材料分析题的出题规范）
- 补充 essay 类型题目在人文科的评分标准模板
- 确保 JSON Schema 能覆盖材料分析题

#### Phase C（Commit）
```bash
git add docs/refer/考试题型分布.md docs/sop/04-quiz-generation.md
git commit -m "docs(quiz): 补充近现代史题型分布 + SOP人文科出题规范"
```

### ═══ 第三步：近现代史出题 ═══

#### Phase P（Plan）
1. 读取 docs/refer/考试题型分布.md 获取近现代史题型
2. 读取 content/modern-history-detail.ts 获取 10 章结构
3. 规划 10 章的出题策略（每章缩放到合理题量）

#### Phase A（Act）
按 SOP-04 流程，用 subagent 并行出题：

| 组 | 章节 | subagent |
|----|------|---------|
| 1 | ch01-ch03 | QuizGen 1 |
| 2 | ch04-ch06 | QuizGen 2 |
| 3 | ch07-ch10 | QuizGen 3 |

每个出题 subagent prompt（基于 SOP-04）：
```
你是题目测试生成子智能体，为中国近现代史纲要第{X}-{Y}章出题。

必读：docs/sop/04-quiz-generation.md

题型分布（从 docs/refer/考试题型分布.md 读取近现代史部分）：
按比例缩放为每章测试量。

输入：content/modern-history/detail/ 下对应章节的 .md 文件

规则（严格遵循 SOP-04）：
1. 50% 本章题目 + 50% 前序章节复习题
2. 难度：70% basic + 20% medium + 10% hard
3. 第1章无复习题（100%本章）
4. 使用 webSearch 工具搜索考研真题作参考
5. 禁止偏题怪题
6. 材料分析题必须给出完整评分标准

产出：content/quiz/modern-history/ch{XX}.json
格式严格遵循 SOP-04 的 JSON Schema。

人文科特殊要求：
- 单选/多选：考查史实、时间、人物、意义等客观知识
- 判断：考查常见误解（如"太平天国是纯农民运动"→错）
- 材料分析：给出一段史料或教师观点，要求分析论证
- 评分标准：要点式（"提到X得2分，论证Y得3分"）
```

#### Phase D（Debug）
- 对每个 JSON 文件执行格式校验：
  ```bash
  node -e "JSON.parse(require('fs').readFileSync('content/quiz/modern-history/ch01.json','utf8'))"
  ```
- 确认题型比例正确
- 确认 50/50 本章/复习比例

#### Phase C（Commit）
```bash
git add content/quiz/modern-history/
git commit -m "feat(quiz): 中国近现代史纲要题目测试 (ch01-ch10, 完整10章)"
```

## 产出总览
| 步骤 | 产出 | 路径 |
|------|------|------|
| 1 | 组件 | components/quiz/*.tsx, lib/quiz-store.ts |
| 2 | SOP | docs/refer/考试题型分布.md, docs/sop/04-quiz-generation.md |
| 3 | 题目 | content/quiz/modern-history/ch{01-10}.json |

## 注意事项
- 近现代史纲要的考试题型分布目前不在 docs/refer/考试题型分布.md 中
  → 第二步中需要补充（可参考毛概格式，同为人文科闭卷考试）
- 组件开发参考项目已有 UI 风格（Material Design tokens）
- 近现代史有 10 章 detail 内容（全部 status: done），可直接用于出题
```

---

## 依赖说明
- 本任务无前置依赖
- 完成后通知 Chat D 启动 [05-quiz-remaining.md](./05-quiz-remaining.md)
- 05 需要本任务产出的组件和更新后的 SOP
