# 05a — 题目测试：有机化学（14章）

> **执行方式**：Chat D · 第1个（04 完成后启动）
> **前置依赖**：04-quiz-system.md 全部完成（组件+SOP+近现代史题目）

---

## 任务概述

为有机化学 14 章生成题目测试数据。完成后立即 commit。

## 提示词

```
你是有机化学题目测试生成主控智能体。

## Skills 加载（必须首先读取）
请依次读取以下 skill 文件并遵循其中规范：
1. C:\Users\AIMFl\.claude\skills\superpowers\executing-plans\SKILL.md
2. C:\Users\AIMFl\.claude\skills\superpowers\subagent-driven-development\SKILL.md
3. C:\Users\AIMFl\.claude\skills\superpowers\verification-before-completion\SKILL.md
4. C:\Users\AIMFl\.claude\skills\superpowers\dispatching-parallel-agents\SKILL.md

## 前置确认
确认以下已完成（由 04-quiz-system.md 产出）：
1. components/quiz/ 组件已存在且功能完整
2. docs/sop/04-quiz-generation.md 已更新
3. content/quiz/modern-history/ 已有 JSON 作为格式参考

## 必读 SOP
1. docs/sop/04-quiz-generation.md — 题目测试生成与组卷规范
2. docs/refer/考试题型分布.md — 各科目题型配比

## 【v2 强制升级要求】（适用每道题，详见 docs/sop/04-quiz-generation.md）
1. **答案经子智能体核验绝对正确**：实际 Read `content/chemistry/detail/` 对应章节确认，机理/合成路线须与教材一致，不得臆测。
2. **explanation 深度解析**：合成/机理题逐步解析（每步推电子/中间体），选择题说明干扰项为何错。
3. **sourceRef 来源目录**：每题填 `{path, label}`，path 指向答案所在的真实详解文件。
4. **hint 必填**：交卷前提示，启发思路不泄露答案。
5. **复杂题 Manim 视频（推荐）**：机理/合成等复杂大题可关联 `manimVideoId`（占位 `quiz-chem-ch{XX}-q{NN}`），由 `manim/render_chemistry.py` 后续渲染；前端未就绪时显示占位。

## 任务
为有机化学 14 章生成题目测试 JSON 数据。严格按 SOP-04 的 5 步流程执行。

## PADC 流程

### Phase P（Plan）
1. 检查 docs/refer/考试题型分布.md 是否包含有机化学
2. 若没有，补充：
```
5. 有机化学课程期末考试题型分布
    ○ 单选题：20道，每题2分，共40分
    ○ 填空/命名题：10道，每题2分，共20分
    ○ 合成/推断/机理大题：4题，共40分
    ○ 考试形式：闭卷
```
3. 读取 content/organic-chemistry-detail.ts 获取 14 章 ID 结构
4. 参考 content/quiz/modern-history/ch01.json 的 JSON 格式

### Phase A（Act）

Subagent 分组（并行）：
| 组 | 章节 | 说明 |
|----|------|------|
| 1 | ch01-ch05 | 绪论～取代基效应 |
| 2 | ch06-ch09 | 烯炔～卤代烃 |
| 3 | ch10-ch14 | 醇酚醚～综合 |

每个 subagent prompt：
```
你是有机化学出题子智能体，处理第{X}-{Y}章。

必读：docs/sop/04-quiz-generation.md
题型：从 docs/refer/考试题型分布.md 读取有机化学部分
格式参考：content/quiz/modern-history/ch01.json

输入：content/chemistry/detail/ 下对应章节 .md 文件
（读取 content/organic-chemistry-detail.ts 获取具体 children ID）

规则：
1. 50% 本章 + 50% 复习（第1章 100% 本章）
2. 难度 70/20/10
3. 有机化学特殊：
   - 命名题：给结构求名/给名画结构
   - 合成题：给原料和目标产物，设计合成路线
   - 机理题：写出反应机理（箭头推电子）
   - 推断题：根据反应现象推结构
4. 使用 webSearch 搜索有机化学考研真题参考
5. 评分标准要精确到每步（如"正确画出碳正离子得2分"）

产出：content/quiz/chemistry/ch{XX}.json
格式严格遵循 SOP-04 的 JSON Schema。
```

### Phase D（Debug）
- 对每个 JSON 执行格式校验
- 确认题型比例和 50/50 本章/复习比例
- 确认百分制换算正确

### Phase C（Commit）
```bash
git add content/quiz/chemistry/ docs/refer/考试题型分布.md
git commit -m "feat(quiz): 有机化学题目测试 (ch01-ch14, 完整14章)"
```

## 产出
| 产出 | 路径 |
|------|------|
| 题目JSON | content/quiz/chemistry/ch{01-14}.json |
| 题型分布更新 | docs/refer/考试题型分布.md（如需补充） |
```

---

## 依赖说明
- **前置**：04-quiz-system.md 完全完成
- **后续**：完成后可启动 05b-quiz-maogai.md
