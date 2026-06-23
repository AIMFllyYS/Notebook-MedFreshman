# 10 — 概率论录音随堂测试出题

> **执行方式**：独立 Chat · 依赖 09 完成后执行
> **前置依赖**：[09-probability-recording.md](./09-probability-recording.md) 已完成（录音和纪要文件已就绪）

---

## 任务概述

基于 15 讲已清洗的概率论课堂录音和纪要，生成配套随堂测试题目（JSON）。题型为**理工科适配格式**（单选 + 填空 + 计算/证明），贴近概率论真实考试题型分布。题目严格基于录音逐字稿内容，不得引入录音未提及的知识点。

## 理工科适配说明

概率论考试题型分布（`docs/refer/考试题型分布.md`）：
- 单选 10 题 × 2 分 = 20 分 (20%)
- 填空 10 题 × 2 分 = 20 分 (20%)
- 计算/解答 6 题 × 10 分 = 60 分 (60%)

SOP 04 录音出题默认格式为人文科（简答/论述/材料分析），本计划适配为理工科格式：

### 概率论录音测验题型分布（100 分制，50 分钟）

| type | label | 数量 | 分值 | 合计 | 考查侧重 |
|------|-------|------|------|------|----------|
| single_choice | — | 10 | 2 | 20 | 课堂知识点（概念判断） |
| fill_blank | — | 5 | 2 | 10 | 课堂公式/定义/数值填写 |
| single_choice / fill_blank | **考试重点** | 5 | 4 | 20 | 老师划重点、考试提示 |
| essay | 计算题 | 3 | 10 | 30 | 课堂例题同类型计算 |
| essay | 综合计算/证明 | 1 | 20 | 20 | 多步骤推导/证明 |
| **合计** | | **24** | | **100** | |

### 与 SOP 04 默认格式的差异

| SOP 04 默认（人文科） | 本计划适配（理工科） | 变更原因 |
|---------------------|-------------------|---------|
| multiple_choice × 5 | fill_blank × 5 | 概率论考试无多选题，填空是核心题型 |
| essay · 简答题 × 2 | essay · 计算题 × 2 | 理工科以计算为主 |
| essay · 论述题 × 1 | essay · 计算题 × 1 | 合并为第 3 道计算 |
| essay · 材料分析题 × 1 | essay · 综合计算/证明 × 1 | 对应概率论大题（多步骤） |

## 提示词

```
你是题目生成主控智能体。

## Skills 加载（必须首先读取）
请依次读取以下 skill 文件并遵循其中规范：
1. C:\Users\AIMFl\.claude\skills\superpowers\executing-plans\SKILL.md
2. C:\Users\AIMFl\.claude\skills\superpowers\subagent-driven-development\SKILL.md
3. C:\Users\AIMFl\.claude\skills\superpowers\verification-before-completion\SKILL.md
4. C:\Users\AIMFl\.claude\skills\superpowers\dispatching-parallel-agents\SKILL.md

## 任务
为概率论 15 讲录音生成配套随堂测试 JSON，使用理工科适配题型。

## 核心约束
1. 题目**严格基于录音逐字稿**，不得引用详解或教材中录音未提及的内容
2. 使用理工科适配题型（见上方题型分布表），**不使用** SOP 04 默认的人文科格式
3. 100% 当前录音（source 全部为 "current_chapter"），无滚动复习
4. 数学公式必须用 LaTeX 标记（$...$ 行内，$$...$$ 独占行）
5. 填空题的 answer 字段为精确答案字符串
6. 计算题/证明题必须包含完整 scoring_criteria（评分要点 + 分值）
7. 每道题必须包含 sourceRef（指向录音文件 + 时间戳定位）
8. 排除 rec-05, rec-06（不存在），排除 rec-18+（不处理）

## 必读文档（在开始前完整阅读）
1. docs/sop/04-quiz-generation.md — 完整出题规范（重点读「课上录音出题专节」和 JSON Schema）
2. docs/refer/考试题型分布.md — 概率论考试题型参考
3. lib/quiz/types.ts — QuizData / QuizQuestion TypeScript 类型定义

## 输入物料

| 物料 | 路径 | 说明 |
|------|------|------|
| 课上录音 | content/probability/recording/rec-{NN}.md | **主要来源** |
| 课堂纪要 | content/probability/summary/sum-{NN}.md | **辅助理解**，提取知识结构和公式汇总 |
| 考试题型分布 | docs/refer/考试题型分布.md | 参考真实考试题型比例 |
| 详解内容 | content/chapters/ch{XX}/{section}.md | **仅用于核验答案**，不作为出题来源 |

## 产出路径
content/quiz/probability/rec-{NN}.json — 共 15 个文件

## PADC 流程

### Phase P（Plan）
1. 读取 SOP 04 和 types.ts 确认 JSON schema
2. 读取概率论考试题型分布
3. 确认 15 个录音文件均存在且可读
4. 规划 subagent 分组

### Phase A（Act）

#### 阶段 1：题目生成（并行 subagent）

按以下分组派发 GeneralPurpose subagent：

| 组 | rec-ID 范围 | 对应章节 | 文件数 |
|----|-----------|---------|-------|
| 1 | rec-01 ~ rec-04 | ch01 (事件与概率) | 4 |
| 2 | rec-07 ~ rec-10 | ch02-ch03 | 4 |
| 3 | rec-11 ~ rec-14 | ch03-ch05 | 4 |
| 4 | rec-15 ~ rec-17 | ch05-ch06 | 3 |

每个出题 subagent 的 prompt 模板：
```
你是概率论出题子智能体，处理范围：{rec-ID 范围}。

必读：
1. docs/sop/04-quiz-generation.md（课上录音出题专节 + JSON Schema）
2. lib/quiz/types.ts（TypeScript 类型定义）

输入（使用 Read 工具读取）：
- 录音：content/probability/recording/rec-{NN}.md
- 纪要：content/probability/summary/sum-{NN}.md（辅助）

## 题型分布（100 分制，每个 rec 一套题）

| type | label | 数量 | 分值 | 合计 | 考查侧重 |
|------|-------|------|------|------|----------|
| single_choice | — | 10 | 2 | 20 | 概念判断（概率定义/性质/条件） |
| fill_blank | — | 5 | 2 | 10 | 公式/定义/数值填写 |
| single_choice / fill_blank | 考试重点 | 5 | 4 | 20 | 教师标记的重点内容 |
| essay | 计算题 | 3 | 10 | 30 | 课堂例题同类计算 |
| essay | 综合计算/证明 | 1 | 20 | 20 | 多步骤推导/定理证明 |

## 难度分布
- 70% basic：直接考查老师明确讲过的公式/定义/例题
- 20% medium：需综合多个知识点或变换题型
- 10% hard：需深入理解推导过程或创造性应用

## 题型详细规范

### single_choice（单选题）
- 4 个选项 A/B/C/D
- 考查：定义辨析、性质判断、简单计算结果判断
- 示例考点：P(A∪B) 的计算、分布函数性质、期望线性性

### fill_blank（填空题）
- answer 字段为精确答案（数值、公式或关键术语）
- 支持 LaTeX：答案可以是 "$\frac{1}{3}$" 或 "$E[X]=np$"
- 示例考点：给条件求概率值、写出分布的期望/方差公式

### 考试重点题（label="考试重点"）
- type 可以是 single_choice 或 fill_blank
- 专门考查教师在录音中明确说过的考试提示
- sourceRef.label 必须包含时间戳（如 "rec-03 · 说话人1 45:20 · 全概率公式必考"）

### essay · 计算题
- stem 中给出完整题干（含已知条件和求解目标）
- answer 中给出完整解题过程（分步骤，每步写明依据）
- scoring_criteria 必填：按步骤给分（如"写出分布律 3分 + 求期望 4分 + 求方差 3分"）
- 公式推导必须用 LaTeX

### essay · 综合计算/证明
- 20 分大题，需 3-4 个得分点
- 可以是：证明定理（如证明切比雪夫不等式）、多步骤计算（如求二维联合分布→边缘→条件→期望）
- scoring_criteria 详细到每个步骤的分值

## sourceRef 规范
```json
"sourceRef": {
  "path": "content/probability/recording/rec-{NN}.md",
  "label": "rec-{NN} · 说话人1 {MM:SS} · {内容定位}"
}
```

## JSON 结构示例

```json
{
  "subjectId": "probability",
  "chapterId": "rec-{NN}",
  "generatedAt": "{ISO 8601}",
  "examConfig": {
    "totalPoints": 100,
    "duration": 50,
    "questionCount": 24
  },
  "questions": [
    {
      "id": "rec-{NN}-q01",
      "type": "single_choice",
      "difficulty": "basic",
      "points": 2,
      "source": "current_chapter",
      "stem": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "answer": "A",
      "explanation": "...",
      "hint": "...",
      "sourceRef": { "path": "...", "label": "..." }
    },
    {
      "id": "rec-{NN}-q11",
      "type": "fill_blank",
      "difficulty": "basic",
      "points": 2,
      "source": "current_chapter",
      "stem": "若 $X \\sim B(n, p)$，则 $E[X] = $ ______",
      "answer": "$np$",
      "explanation": "...",
      "sourceRef": { "path": "...", "label": "..." }
    },
    {
      "id": "rec-{NN}-q16",
      "type": "single_choice",
      "difficulty": "medium",
      "points": 4,
      "label": "考试重点",
      "source": "current_chapter",
      "stem": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "answer": "C",
      "explanation": "老师在课上明确说过...",
      "sourceRef": { "path": "...", "label": "rec-{NN} · 说话人1 32:15 · 划重点" }
    },
    {
      "id": "rec-{NN}-q21",
      "type": "essay",
      "difficulty": "medium",
      "points": 10,
      "label": "计算题",
      "source": "current_chapter",
      "stem": "设随机变量 $X$ 的概率密度为...",
      "answer": "**解**：\n\n(1) ...\n\n(2) ...",
      "scoring_criteria": "写出概率密度表达式 2分 + 求归一化常数 3分 + 计算期望 3分 + 计算方差 2分",
      "sourceRef": { "path": "...", "label": "..." }
    },
    {
      "id": "rec-{NN}-q24",
      "type": "essay",
      "difficulty": "hard",
      "points": 20,
      "label": "综合计算/证明",
      "source": "current_chapter",
      "stem": "...",
      "answer": "**证明**：\n\n...",
      "scoring_criteria": "...",
      "sourceRef": { "path": "...", "label": "..." }
    }
  ]
}
```

## 答案核验
对每道计算/证明题，完成出题后必须：
1. Read 对应的详解文件 content/chapters/ch{XX}/{section}.md
2. 核验答案的数学正确性
3. 确认评分标准的分值合计与 points 字段一致

产出路径：content/quiz/probability/rec-{NN}.json

完成后列出所有产出文件路径和题目数量统计。

禁止：
- 不修改已有的 ch{01-08}.json 章节测验
- 不修改 manifest.ts
- 不修改录音/纪要文件
- 不引入录音中未提及的知识点
```

### Phase D（Debug）
1. 验证 JSON 格式正确（每个文件可被 `JSON.parse` 解析）
2. 验证 TypeScript 类型兼容：
   ```bash
   npx tsc --noEmit
   ```
3. 验证每个 JSON 的 examConfig.totalPoints === questions 各题 points 之和 === 100
4. 验证每个 JSON 恰好 24 道题
5. 验证 sourceRef.path 指向的录音文件确实存在
6. 抽查 LaTeX 公式格式（$...$ 转义正确）
7. 验证 QuizTab 加载：在 dev server 中访问 /probability/recording/rec-01，确认题目测试 Tab 显示正确

### Phase C（Commit）
```bash
git add content/quiz/probability/rec-*.json
git commit -m "feat(quiz): 概率论录音随堂测试 (15讲, 理工科适配题型)"
```

## 产出规范

| 产出 | 路径 | 数量 |
|------|------|------|
| 录音测验 JSON | content/quiz/probability/rec-{NN}.json | 15 |

NN 取值：01, 02, 03, 04, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17

## 禁止事项
- ✗ 不修改已有的 content/quiz/probability/ch{01-08}.json
- ✗ 不修改录音/纪要文件
- ✗ 不使用人文科出题格式（简答/论述/材料分析）
- ✗ 不引入录音未提及的知识点作为题目来源
- ✗ 不修改 manifest.ts（测验 JSON 无需 manifest 注册）
- ✗ 不生成 rec-05.json 或 rec-06.json（对应录音不存在）

## 各讲出题重点参考

| rec-ID | 对应章节 | 重点考点（基于录音内容分析） |
|--------|---------|-------------------------|
| rec-01 | ch01 | 概率史、随机试验特征、样本空间概念 |
| rec-02 | ch01 | 事件运算、德摩根律、概率公理、古典概型计算 |
| rec-03 | ch01 | 条件概率计算、全概率公式应用、贝叶斯公式 |
| rec-04 | ch01→ch02 | 离散分布律、二项分布 B(n,p)、泊松定理 |
| rec-07 | ch02 | 正态分布 N(μ,σ²)、3σ规则、标准化、指数分布无记忆性 |
| rec-08 | ch03 | 联合分布函数、二维离散/连续分布、边缘 CDF |
| rec-09 | ch03 | 边缘密度求法、条件分布密度、二维均匀/正态 |
| rec-10 | ch03 | 独立性判定（f=fx·fy）、Z=X+Y 卷积公式、泊松可加性 |
| rec-11 | ch03→ch04 | ch03 综合题、期望定义（离散/连续）、函数期望公式 |
| rec-12 | ch04 | 期望线性性、E[XY]=E[X]E[Y]（独立时）、柯西-施瓦茨不等式 |
| rec-13 | ch04 | D(X)=E[X²]-(E[X])²、方差性质、标准化 Z=(X-μ)/σ |
| rec-14 | ch04→ch05 | Cov(X,Y)、相关系数 ρ、不相关≠独立（反例）、切比雪夫不等式 |
| rec-15 | ch05 | 伯努利大数定律、辛钦大数定律、中心极限定理、棣莫弗-拉普拉斯 |
| rec-16 | ch06 | 简单随机样本、统计量定义、X̄ 和 S² 的计算、n-1 无偏性 |
| rec-17 | ch06 | χ²(n) 定义和性质、t(n) 对称性、F(m,n) 分布、分位点表使用 |
```

---

## 依赖说明
- **前置**：[09-probability-recording.md](./09-probability-recording.md) 必须完成（需要清洗后的录音和纪要文件）
- **后续**：完成后可选执行搜索索引重建（`pnpm run build-index`），使新测验数据对 AI 可见
