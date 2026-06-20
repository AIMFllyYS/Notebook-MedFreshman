# SOP 04 — 题目测试生成与组卷

## 适用场景

为已完成详解板块的章节生成系统性测验题目。覆盖单选、多选、判断、辨析、填空、简答/材料分析/论述等大题，按真实考试题型分布配比，提供百分制评卷、本地成绩存档、交卷前提示与交卷后深度解析（含来源目录）。

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
      "type": "single_choice | multiple_choice | true_false | analysis | fill_blank | essay",
      "difficulty": "basic | medium | hard",
      "source": "current_chapter | review",
      "sourceChapter": "string — 来源章节 ID（review 题标注）",
      "label": "string — 可选，显示用题型名（细分 essay：材料分析题/论述题/简答题）",
      "points": "number — 本题分值",
      "stem": "string — 题干（支持 KaTeX $...$ 与 Markdown）",
      "options": ["string[] — 选项（仅 choice 类型）"],
      "answer": "number | number[] | string — 正确答案",
      "hint": "string — 【必填】交卷前可点击的提示（启发思路，不泄露答案）",
      "explanation": "string — 【必填】深度解析：逐点说明本答案为何正确、干扰项为何错，落到具体知识点",
      "sourceRef": {
        "path": "string — 【必填】答案来源文件（来源目录），如 content/modern-history/detail/2.1.md",
        "label": "string — 来源定位，如 2.1 银荒与末世 · 二、银铜双本位制"
      },
      "reasoning": "string — analysis 辨析题的参考理由/论证（与 answer 判断配套）",
      "scoring_criteria": ["string[] — 得分点（仅主观题 analysis/fill_blank/essay）"],
      "total_points": "number — 本题满分（仅主观题）",
      "manimVideoId": "string — 可选，复杂题关联的 Manim 视频 id（概率论等，见下文）"
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

| 题型 | type | answer 类型 | 示例 / 说明 |
|------|------|-------------|------|
| 单选题 | `single_choice` | `number` (0-indexed) | `2` 表示选 C |
| 多选题 | `multiple_choice` | `number[]` | `[0, 2]` 表示选 A 和 C |
| 判断题 | `true_false` | `number` | `1` 正确，`0` 错误 |
| 辨析题 | `analysis` | `number` | `1`=命题正确 / `0`=命题错误；参考理由放 `reasoning`，得分点放 `scoring_criteria`（主观自评） |
| 填空题 | `fill_blank` | `string` | `"P(A\|B) = P(AB)/P(B)"` |
| 简答/材料分析/论述/计算 | `essay` | `string` | 完整参考答案；用 `label` 标注细分题型 |

## 评分逻辑说明（供前端组件参考）

- **单选/多选/判断**：系统自动判分，答对得满分，答错得 0 分
- **多选部分正确**：全对满分，漏选半分，错选 0 分
- **辨析（analysis）**：展示命题判断（对/错）+ 参考理由 + 评分要点，用户自评
- **填空**：展示参考答案，用户自评（0 ~ 满分之间打分）
- **简答/材料分析/论述（essay）**：展示参考答案 + 评分标准（得分点），用户自评
- **百分制**：所有题目得分求和 / 总分 × 100

### 前端交互行为（已实现，出题时须配合）

1. **本地成绩持久化**：交卷评分后，分数**首先写入 localStorage**（`gailvlun-quiz-progress-v1`，按 `subject/chapter` 存历史最佳/上次/作答次数），随后才展示详细解析；刷新/重进不丢成绩。
2. **交卷前提示（hint）**：答题阶段每题提供「查看提示」按钮，点击展开 `hint` 字段（**启发思路、绝不泄露答案**）。故每题 `hint` 必填。
3. **交卷后深度解析**：仅在交卷后展示 `explanation`（深度解析）+ 参考答案 + `scoring_criteria` + **来源目录（`sourceRef`）** + 关联 Manim 视频（若有）。答题阶段不得提前展示答案。

## 答案核验、深度解析与来源目录（强制规范）

> 本节为所有出题任务的**硬性要求**，任何科目、任何题型都必须满足。

### 1. 答案必须经子智能体核验为「绝对正确」

- 出题不得凭记忆臆测答案。每道题的正确答案**必须基于项目内容核验**：出题子智能体须实际 `Read` 对应章节的详解 `.md`（及例题、教材），确认答案与教材表述一致。
- 推荐「出题 → 核验」两遍：由独立子智能体逐题复核（答案是否唯一正确、干扰项是否确有迷惑且确为错、辨析判断是否成立），有疑义则改题或换题。
- 客观题（单选/多选/判断/辨析）的 `answer` 必须与教材**无歧义**对应；多选不得漏项错项。

### 2. `explanation` 必须是真实的深度解析

每题 `explanation` 不是一句话敷衍，而须**逐点真实解析**：

- **为什么此答案正确**：落到具体知识点/定义/史实/公式，给出推理或依据。
- **干扰项为什么错**（选择题）：逐个或择要说明每个错误选项错在哪里（常见误区）。
- **辨析题**：明确"命题对/错"，并给出**理由链**（错在哪个概念、正确表述是什么）。
- **大题**：解析须呼应 `scoring_criteria` 的每个得分点。
- 可用 Markdown / KaTeX 排版，鼓励分点。

### 3. `sourceRef` 必须指明「来源目录」

每题必须填写 `sourceRef`，指明该答案**出自哪个详解文件（来源目录）及具体位置**：

```json
"sourceRef": {
  "path": "content/modern-history/detail/2.1.md",
  "label": "2.1 太平天国的背景 · 二、银铜双本位制"
}
```

- `path`：答案依据所在的真实文件路径（**来源目录**），便于学生回查原文。
- `label`：人类可读定位（小节号 + 标题 + 段落/指令块标题）。
- review 题的 `sourceRef.path` 指向其来源章节（`sourceChapter`）的详解文件。

### 4. 复杂题的 Manim 视频讲解（理科，尤其概率论）

对**计算/推导类复杂大题**（概率论的解答题、有机化学的机理/合成题等），应在 `manimVideoId` 关联一个 Manim 动画讲解，前端解析区会内嵌播放：

- 视频由 `manim/render.py`（概率论）/ `manim/render_chemistry.py`（化学）渲染，写入 `content/media*.generated.ts`，`id` 全局唯一。
- 出题时先占位 `manimVideoId`（命名约定如 `quiz-prob-ch05-q07`），视频可后续补渲染；前端在视频未就绪时显示「生成中」占位。
- 详见各科出题计划（概率论见 `docs/plans/05c-quiz-probability.md`）。

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

人文社科类科目（如中国近现代史纲要、毛概）的考试以**闭卷**为主，**没有计算题**。题型须**实时读取 `docs/refer/考试题型分布.md`**（如近现代史现为 单选/多选/辨析/简答/材料分析/论述六类，已不含纯判断题）。出题时除遵循上文通用流程外，还须满足以下专项规范。

### 1. 各题型考查重点

| 题型 | type（+label） | 考查重点 | 设计要点 |
|------|------|----------|----------|
| 单选题 | `single_choice` | 史实、时间、人物、事件、性质、意义等**客观知识** | 干扰项基于常见混淆点（时间错位、人物张冠李戴、概念混淆） |
| 多选题 | `multiple_choice` | 多要素并列的知识（如「三大政策」「四个选择」的构成） | 漏选半分、错选 0 分；干扰项须为**似是而非**的同类项 |
| 辨析题 | `analysis` | **常见误解 / 历史虚无主义观点的辨析**（判断对错并说明理由） | `answer`=1/0 给判断，`reasoning` 给理由链，`scoring_criteria` 给得分点（判断+理由分别给分）；典型如「太平天国是一场纯粹的农民运动」→ 错 |
| 简答题 | `essay`（label="简答题"） | 概念、原因、意义、过程的要点式作答 | 参考答案要点化；`scoring_criteria` 逐点给分 |
| 材料分析题 | `essay`（label="材料分析题"） | 史料解读、观点论证、历史评价、因果分析 | 见下节专门规范（材料+设问） |
| 论述题 | `essay`（label="论述题"） | 围绕重大主题展开系统论证（史论结合） | 要求论点+论据+论证；分值高，`scoring_criteria` 含「史论结合/条理」分 |

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
