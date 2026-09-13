# 05b — 题目测试：毛概

> **执行方式**：Chat D · 第2个（05a 完成后）
> **前置依赖**：05a-quiz-chemistry.md 已 commit

---

## 任务概述

为毛概全部章节生成题目测试数据。完成后立即 commit。

## 提示词

```
你是毛概题目测试生成主控智能体。

## Skills 加载（必须首先读取）
请依次读取以下 skill 文件并遵循其中规范：
1. C:\Users\AIMFl\.claude\skills\superpowers\executing-plans\SKILL.md
2. C:\Users\AIMFl\.claude\skills\superpowers\subagent-driven-development\SKILL.md
3. C:\Users\AIMFl\.claude\skills\superpowers\verification-before-completion\SKILL.md
4. C:\Users\AIMFl\.claude\skills\superpowers\dispatching-parallel-agents\SKILL.md

## 前置确认
1. components/quiz/ 组件已存在
2. docs/sop/04-quiz-generation.md 已更新
3. content/quiz/modern-history/ 和 content/quiz/chemistry/ 已有 JSON 作为格式参考

## 必读 SOP
1. docs/sop/04-quiz-generation.md — 题目测试生成与组卷规范
2. docs/refer/考试题型分布.md — 各科目题型配比

## 任务
为毛概全部章节生成题目测试 JSON 数据。严格按 SOP-04 的 5 步流程执行。

## 题型分布（实时读取 docs/refer/考试题型分布.md，以下为现值）
- 单项选择题：~20-30题，每题1-2分（约30%）
- 多项选择题：~10题，每题2分（约20%）
- 简答题：~3-4题，每题5-10分（约20%）
- 论述/材料分析题：~2-3题，每题10-15分（约30%）
- A/B卷制度，闭卷考试
> 题型映射：单选 `single_choice`、多选 `multiple_choice`、简答 `essay`(label="简答题")、论述/材料分析 `essay`(label="论述题"/"材料分析题")。**务必以 `docs/refer/考试题型分布.md` 实时内容为准**按比例缩放。

## 【v2 强制升级要求】（适用每道题，详见 docs/sop/04-quiz-generation.md）
1. **答案经子智能体核验绝对正确**：实际 Read `content/maogai/detail/` 对应章节确认，不得臆测。
2. **explanation 深度解析**：逐点说明答案为何正确、干扰项为何错、辨析理由链。
3. **sourceRef 来源目录**：每题填 `{path, label}`，path 指向答案所在的真实详解文件。
4. **hint 必填**：交卷前提示，启发思路不泄露答案。

## PADC 流程

### Phase P（Plan）
1. 读取 content/maogai-detail.ts 获取完整章节列表
2. 确认 content/maogai/detail/ 下有哪些 .md 文件
3. 确定 subagent 分组（根据实际章节数分 2-3 组）
4. 参考已有 content/quiz/ 下其他科目 JSON 格式

### Phase A（Act）

根据实际章节数分组派发 subagent（并行）。

每个 subagent prompt 关键点：
```
你是毛概出题子智能体，处理第{X}-{Y}章。

必读：docs/sop/04-quiz-generation.md
题型：从 docs/refer/考试题型分布.md 读取毛概部分
格式参考：content/quiz/modern-history/ch01.json

输入：content/maogai/detail/ 下对应章节 .md 文件
（读取 content/maogai-detail.ts 获取具体 children ID）

规则：
1. 50% 本章 + 50% 复习（第1章 100% 本章）
2. 难度 70/20/10
3. 毛概特殊要求：
   - 单选/多选：考查核心概念、重要论断、会议/文献名称
   - 材料分析题：给出时政材料或经典论述，要求：
     1. 分析材料体现了什么原理
     2. 结合实际论述意义
     3. 评分标准按要点（"正确指出XX原理得3分"）
   - 禁止出过于时事化的题（可能过时），聚焦经典理论
4. 使用 webSearch 搜索毛概/马原考研真题参考
5. 材料分析题评分标准必须按得分点列出

产出：content/quiz/maogai/ch{XX}.json
格式严格遵循 SOP-04 的 JSON Schema。
```

### Phase D（Debug）
- JSON 格式校验
- 题型比例验证
- 确认材料分析题的 scoring_criteria 完整

### Phase C（Commit）
```bash
git add content/quiz/maogai/
git commit -m "feat(quiz): 毛概题目测试 (全部章节)"
```

## 产出
| 产出 | 路径 |
|------|------|
| 题目JSON | content/quiz/maogai/ch{XX}.json |
```

---

## 依赖说明
- **前置**：05a-quiz-chemistry.md 已完成并 commit
- **后续**：完成后启动 05c-quiz-probability.md
