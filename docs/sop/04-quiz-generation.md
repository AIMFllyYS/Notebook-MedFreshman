# SOP 04 — 题目测试生成与组卷

## 适用场景

为已完成详解板块的章节生成系统性测验题目。覆盖单选、多选、判断、填空和大题，按真实考试题型分布配比，提供百分制评卷。

## 输入物料

| 物料 | 路径 | 说明 |
|------|------|------|
| 章节详解 | `content/{subject}/detail/{itemId}.md` | 本章知识点来源 |
| 考试题型分布 | `docs/refer/考试题型分布.md` | **动态引用**，不可硬编码 |
| 前序章节详解 | 同上路径，前面章节的文件 | 滚动复习题来源 |
| 教材板块（可选） | `content/{subject}/textbook/{chapterId}.md` | 补充知识点 |

## 执行角色分配

| 阶段 | 角色 | 类型 | 职责 |
|------|------|------|------|
| 信息收集 | Explorer | Explore subagent | 读取详解 + 题型分布 + 大纲 |
| 本章出题 | QuizGen-Current | GeneralPurpose subagent | 生成本章 50% 的题目 |
| 滚动复习出题 | QuizGen-Review | GeneralPurpose subagent | 生成前序章节 50% 的题目 |
| 组卷+评分标准 | Assembler | GeneralPurpose subagent | 合并、校验、生成评分标准 |
| 写入 | Writer | Shell/GeneralPurpose subagent | 格式化为 JSON 写入文件 |

**上下文控制**：
- Explorer 只负责收集信息并总结为精简的知识点清单传递给出题 subagent
- 出题 subagent 不需要完整的详解原文，只需知识点清单 + 题型要求

## 步骤流程

### Step 1：读取题型分布配置

从 `docs/refer/考试题型分布.md` 读取对应科目的考试题型。

**重要**：该文件由用户动态维护，SOP 执行时必须实时读取，绝不硬编码任何题型配比。

示例（概率论）：
- 单项选择题：10 题，每题 3 分，共 30 分
- 解答题：10 题，每题 7 分，共 70 分

每章测试需按此比例缩放（若原卷 10 题选择，每章测试可出 5 题选择 + 对应比例的大题）。

### Step 2：知识点提取

Explorer subagent 读取：
1. 目标章节详解的所有 `:::definition`、`:::theorem`、`:::example`、`:::pitfall` 指令块
2. 提取核心知识点清单（每个知识点一句话描述 + 关联公式）
3. 对前序章节同样提取（但仅保留核心定义/定理/公式）

产出一份精简的「知识点清单」传递给出题 subagent。

### Step 3：出题

#### 3.1 本章题目（占 50%）

QuizGen-Current subagent 根据知识点清单生成题目：

**题目类型**（根据 `docs/refer/考试题型分布.md` 确定）：
- `single_choice` — 单项选择
- `multiple_choice` — 多项选择
- `true_false` — 判断题
- `fill_blank` — 填空题
- `essay` — 解答/计算/材料分析大题

**难度分布**：
- 70% `basic` — 直接考查定义、公式、基本概念
- 20% `medium` — 需要 1-2 步推理或公式变形
- 10% `hard` — 需要综合运用多个知识点（但不偏不怪）

**出题要求**：
- 优先利用 webSearch 工具搜索考研真题或公开题库中的相关题目作为参考
- 选择题的干扰项必须有迷惑性（基于常见错误设计）
- 大题的评分标准必须细化到每个得分点
- 禁止出偏题、怪题、超纲题

#### 3.2 滚动复习题（占 50%）

QuizGen-Review subagent 从前序章节中出题：

- 覆盖前面所有已完成章节
- 越近的章节占比越高（如前一章 30%，前两章 20%，更早的均分）
- 同样遵循难度分布和题型比例

### Step 4：组卷与评分标准

Assembler subagent 合并两部分题目：

1. **排序**：按题型分组（选择 → 判断 → 填空 → 大题），组内按难度升序
2. **编号**：统一重新编号 q001, q002, ...
3. **总分计算**：按 `docs/refer/考试题型分布.md` 中的分值比例分配
4. **评分标准**：
   - 客观题：系统自动评分（answer 字段为正确选项索引或正确答案）
   - 主观题：给出参考答案 + scoring_criteria（每个得分点及分值）
5. **百分制换算**：根据题型分布中的总分进行百分制映射

### Step 5：写入 JSON

Writer subagent 将组卷结果写入 `content/quiz/{subject}/{chapterId}.json`。

## 产出规范

### 文件路径

`content/quiz/{subject}/{chapterId}.json`

### JSON Schema

```json
{
  "subjectId": "string — 科目 ID",
  "chapterId": "string — 章节 ID，如 ch01",
  "generatedAt": "string — 生成日期 YYYY-MM-DD",
  "examConfig": {
    "source": "docs/refer/考试题型分布.md",
    "totalPoints": "number — 百分制总分",
    "timeLimit": "number — 建议答题时间（分钟）"
  },
  "questions": [
    {
      "id": "string — 唯一 ID，如 q001",
      "type": "single_choice | multiple_choice | true_false | fill_blank | essay",
      "difficulty": "basic | medium | hard",
      "source": "current_chapter | review",
      "sourceChapter": "string — 来源章节 ID（review 题标注）",
      "points": "number — 本题分值",
      "stem": "string — 题干（支持 KaTeX $...$）",
      "options": ["string[] — 选项（仅 choice 类型）"],
      "answer": "number | number[] | string — 正确答案",
      "explanation": "string — 解析",
      "scoring_criteria": ["string[] — 得分点（仅 essay/fill_blank）"],
      "total_points": "number — 本题满分（仅 essay）"
    }
  ],
  "summary": {
    "totalQuestions": "number",
    "byType": { "single_choice": "number", "essay": "number" },
    "bySource": { "current_chapter": "number", "review": "number" },
    "byDifficulty": { "basic": "number", "medium": "number", "hard": "number" }
  }
}
```

### 各题型 answer 字段约定

| 题型 | answer 类型 | 示例 |
|------|-------------|------|
| `single_choice` | `number` (0-indexed) | `2` 表示选 C |
| `multiple_choice` | `number[]` | `[0, 2]` 表示选 A 和 C |
| `true_false` | `number` | `1` 表示正确，`0` 表示错误 |
| `fill_blank` | `string` | `"P(A|B) = P(AB)/P(B)"` |
| `essay` | `string` | 完整参考答案 |

## 评分逻辑说明（供前端组件参考）

- **单选/多选/判断**：系统自动判分，答对得满分，答错得 0 分
- **多选部分正确**：可选策略 — 全对满分，漏选半分，错选 0 分
- **填空**：展示参考答案，用户自评（0 ~ 满分之间打分）
- **大题**：展示参考答案 + 评分标准（得分点），用户自评
- **百分制**：所有题目得分求和 / 总分 × 100

## AI 工具可达性验证

题目测试数据不通过 `readContentMarkdown` 读取（非 .md 文件），但：

1. 前端 QuizTab 组件通过 API 读取 JSON 文件
2. AI 工具后续可扩展 `getQuizData` 函数读取题目数据
3. 目前验证方式：确认 JSON 文件存在且格式合法

```bash
# 验证 JSON 格式合法
node -e "JSON.parse(require('fs').readFileSync('content/quiz/{subject}/{chapterId}.json','utf8'))"
```

## 人文科出题特殊指导（近现代史 / 毛概等）

人文社科类科目（如中国近现代史纲要、毛概）的考试以**闭卷**为主，题型以**单选、多选、判断、材料分析/简答**为核心，**没有计算题**。出题时除遵循上文通用流程外，还须满足以下专项规范。

### 1. 各题型考查重点

| 题型 | type | 考查重点 | 设计要点 |
|------|------|----------|----------|
| 单选题 | `single_choice` | 史实、时间、人物、事件、性质、意义等**客观知识** | 干扰项基于常见混淆点（如时间错位、人物张冠李戴、概念混淆）设计 |
| 多选题 | `multiple_choice` | 多要素并列的知识（如「三大政策」「四个选择」的构成） | 漏选给半分、错选 0 分；干扰项须为**似是而非**的同类项 |
| 判断题 | `true_false` | **常见误解 / 历史虚无主义观点的辨析** | 典型如「太平天国是一场纯粹的农民运动」→ 错；命题应直击教学中强调的易错点 |
| 材料分析/简答题 | `essay` | 史料解读、观点论证、历史评价、因果分析 | 见下节专门规范 |

### 2. 材料分析题（essay）出题规范

材料分析题是人文科的**核心大题**，统一用 `type: "essay"` 表示，其结构特征：

1. **题干（stem）= 材料 + 设问**：
   - 先给出**一段史料**（原始文献节选、数据、历史场景）或**一种观点**（教师论断、学界争议、错误论调）
   - 再提出 1~3 个递进式设问（如「指出…」→「分析…」→「评价…」）
   - 材料应**源于或贴合本章详解内容**，避免脱离教材的偏题怪题
2. **参考答案（answer）= 要点式范答**：分点列出应答内容，便于学生对照自评
3. **评分标准（scoring_criteria）必须细化到每个得分点及其分值**，且各得分点分值之和 = 本题满分（`total_points` / `points`）

> 材料分析题不偏不怪：材料须可被本章知识点直接解读，设问指向明确，避免开放到无法评分的程度。

### 3. essay 评分标准模板（人文科）

`scoring_criteria` 采用**「要点 + 分值」**的要点式表达，示例（满分 15 分的材料分析题）：

```json
"scoring_criteria": [
  "准确指出材料反映的历史现象/观点（如：洋务派「中体西用」思想）（3分）",
  "结合史实分析其历史背景与动因（4分）",
  "辩证评价其进步性与局限性（5分）",
  "语言条理清晰、史论结合（3分）"
]
```

要点设计原则：
- **可判分**：每个要点是一个可被学生自评「答到 / 未答到」的具体内容
- **分值闭合**：所有要点分值相加 = 本题满分
- **梯度合理**：识记类要点分值低，分析/评价类要点分值高（体现高阶能力）

### 4. JSON Schema 对材料分析题的覆盖

材料分析题**复用既有 `essay` 题型**，无需新增 type。字段约定：

| 字段 | 材料分析题中的用法 |
|------|--------------------|
| `type` | 固定为 `"essay"` |
| `stem` | **材料原文 + 设问**（材料较长时可用 Markdown 引用块 `>` 排版） |
| `answer` | 完整要点式参考答案 |
| `scoring_criteria` | **必填**，要点式得分点（要点+分值） |
| `total_points` / `points` | 本题满分（与 `scoring_criteria` 分值之和一致） |
| `options` | 不使用（留空或省略） |

前端 `QuizScoring` 组件对 `essay`/`fill_blank` 主观题展示参考答案 + 评分要点，并提供自评滑块，与本规范的要点式评分标准直接对应。

## 参考文件

- [docs/refer/考试题型分布.md](../refer/考试题型分布.md) — **核心引用**，题型配比来源
- [00-infrastructure.md](./00-infrastructure.md) — 文档解析（若需解析题库 PDF）
- [05-content-integration.md](./05-content-integration.md) — 集成验证
- [02-detail-generation.md](./02-detail-generation.md) — 详解格式（出题时需读取）
