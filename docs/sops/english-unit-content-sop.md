# SOP：大学英语 Unit 内容新增规范

> **适用范围**：本项目「其他板块 → 英语练习」下大学英语 Unit 1 ~ Unit 8 的内容新增。
> **执行角色**：AI 出题助手。
> **目标**：在用户提供课文原文与词汇表的前提下，按统一规范生成正文、例题、Quiz 三份文件，并在 manifest 中注册，确保应用内三个 Tab 可正常显示。

---

## 1. 前置输入

用户需提供以下材料：

1. **课文原文**（Reading 1 / Reading 2，如有）：完整英文原文。
2. **词汇表**：至少包含单词、音标、词性、中文释义；如有教材例句、搭配、用法辨析更佳。
3. **单元主题**：单元标题（如 `The True Value of Education`）与核心教学目标。
4. **Quiz 偏好**（可选）：默认遵循本 SOP 的精简 Quiz 结构。

---

## 2. 输出文件清单与路径规范

为 Unit X 生成以下文件：

| 序号 | 文件 | 路径 | 用途 |
|---|---|---|---|
| 1 | 正文 Markdown | `content/other/english/unit-X.md` | 正文 Tab 显示 |
| 2 | 例题 Markdown × 4 | `content/examples/other/unit-X/unit-X/EX01_*.md` ~ `EX04_*.md` | 例题 Tab 显示 |
| 3 | Quiz JSON | `content/quiz/other/unit-X.json` | 题目测试 Tab 显示 |
| 4 | Manifest 注册 | `lib/content-data/manifest.ts` | 左侧导航与路由生成 |

命名规则：

- Unit ID：`unit-1`, `unit-2`, ..., `unit-8`
- 例题文件名：`EX<NN>_<主题缩写>_set<N>.md`，如 `EX01_commencement_set1.md`、`EX02_silicon_valley_set2.md`
- 例题主题分配：
  - EX01 / EX02：Reading 1（主题 A）的两套题
  - EX03 / EX04：Reading 2（主题 B）的两套题

---

## 3. 正文生成规范

### 3.1 文件结构

```markdown
# Unit X · {单元标题}

---

## 一、词汇讲解

### Reading 1 词汇

:::derivation{label=单词 /音标/ n.}
**书本义：** [C,U] ...

**词形：** ...

**常用搭配：**
- ...

**例句：**
1. ...

✍️ ...（作文例句）

:::callout{kind=note label=注意}
...
:::
:::

### Reading 2 词汇
（同上结构）

---

## 二、课文精讲

### Reading 1 · {标题}

#### 1. 段落梳理
...

#### 2. 长难句解析

:::parse{label=句子}
...
:::

#### 3. 主旨与写作手法
...

### Reading 2 · {标题}
（同上结构）

---

## 三、知识点总结

...
```

### 3.2 格式约束

- 统一使用 `:::derivation` 包裹词汇卡片，`label` 中必须包含「单词 /音标/ 词性」。
- 每个单词必须包含：书本义、词形、常用搭配、例句（至少 2 句）、作文例句（✍️）。
- 易混淆/文化差异点使用 `:::callout{kind=note|pitfall|insight label=...}`。
- 长难句使用 `:::parse`。
- 避免使用教材外的超纲词汇解释，所有中文释义必须贴合课文语境。
- **翻译质量**：正文中所有中文释义、例句翻译、长难句翻译必须真实、自然、地道，达到 CET-4 参考答案级别；禁止机翻式直译、中式英语表达或生硬拼接。翻译完成后需逐句回读，确保符合中文表达习惯与学术语境。

### 3.3 数量约束

- 每篇 Reading 词汇数量由材料本身决定，覆盖课标要求的核心词与课文高频词即可，不人为设上下限。
- 每单元课文精讲部分不少于 2 个长难句解析。

---

## 4. 例题生成规范

### 4.1 文件结构

```markdown
:::example{label=EX<NN> · {主题} — Set <N>}

## 阅读原文

> ...（Reading 原文或精选段落）

---

**1.** {题目}

A. ...
B. ...
C. ...
D. ...

**Answer: {A|B|C|D}**

**解析**：...（标注题型：主旨大意/细节理解/词义猜测/推理判断/观点态度）

---

（重复 5 题）
:::
```

### 4.2 题目类型分布

每套 5 题必须覆盖以下题型（顺序可微调）：

| 题号 | 推荐题型 | 说明 |
|---|---|---|
| 1 | 主旨大意题 | 考查全文/段落中心 |
| 2 | 细节理解题 | 原文中有明确对应句 |
| 3 | 词义猜测题 | 考查课标核心词汇或短语 |
| 4 | 推理判断题 | 需基于原文推断，答案不直接出现 |
| 5 | 观点态度题 / 写作目的题 | 考查作者或某人物态度 |

若单元只有一篇 Reading，4 套例题的分配方式由实际材料决定。常见做法包括：

- 按难度分层：两套基础题 + 两套进阶题；
- 按题型拆分：主旨/细节/词汇/推理各聚焦一套；
- 按原文不同段落或不同角度分别出题。

无论哪种方式，必须在每套例题标题中明确主题与定位。

### 4.3 质量要求

- **难度对标**：例题整体难度对标考研英语阅读（英语一/二），选项设计、干扰项设置、题干表述须符合考研命题风格，避免过于简单或直白的初中级题目。
- **ABCD 四选项**：每道选择题必须提供完整 A/B/C/D 四个选项，禁止三选项或两选项。
- **逐选项解析**：每个选项必须给出明确的正误解析，说明其为何正确或为何错误，不可只写「A 正确」。
- **干扰项设计**：干扰项必须与原文相关、具备迷惑性，可从「偷换概念」「张冠李戴」「过度推断」「无中生有」「以偏概全」等考研常见干扰角度设计；禁止凭空捏造与原文无关的选项。
- **答案依据**：正确答案必须在原文中有明确依据，并标注对应段落/句子。

---

## 5. Quiz 生成规范

### 5.1 精简结构

Quiz 不再追求 CET-4 全真套卷，而是**每类题型一道大题**，共 5 题：

| 序号 | 题型 | 分值建议 | 题目 ID | 说明 |
|---|---|---|---|---|
| 1 | 写作（Essay） | 15 | `q001` | 1 道作文题 |
| 2 | 词汇语法（Vocabulary & Grammar） | 15 | `q002` | 1 道词汇/语法题 |
| 3 | 阅读理解（Reading Comprehension） | 40 | `q003` | 给一段完整阅读材料，下设 4 小题 |
| 4 | 完形填空（Cloze） | 10 | `q004` | 一篇短文，10 个空 |
| 5 | 翻译（Translation） | 20 | `q005` | 4 句中译英 |
| **合计** | | **100** | | |

### 5.2 JSON 结构

复合题型（`reading` / `cloze` / `translation`）已在项目代码中支持。

结构示例：

```json
{
  "subjectId": "other",
  "chapterId": "unit-X",
  "generatedAt": "YYYY-MM-DD",
  "examConfig": {
    "source": "大学英语 Unit X · {标题}",
    "totalPoints": 100,
    "timeLimit": 90,
    "sections": [
      {"name": "Writing", "points": 15, "questions": 1},
      {"name": "Vocabulary & Grammar", "points": 15, "questions": 1},
      {"name": "Reading Comprehension", "points": 40, "questions": 4},
      {"name": "Cloze", "points": 10, "questions": 10},
      {"name": "Translation", "points": 20, "questions": 4}
    ]
  },
  "questions": [
    { "id": "q001", "type": "essay", "section": "Writing", "points": 15, ... },
    { "id": "q002", "type": "single_choice", "section": "Vocabulary & Grammar", "points": 15, ... },
    { "id": "q003", "type": "reading", "section": "Reading Comprehension", "points": 40, "passage": "...", "subQuestions": [...] },
    { "id": "q004", "type": "cloze", "section": "Cloze", "points": 10, "passage": "...", "blanks": [...] },
    { "id": "q005", "type": "translation", "section": "Translation", "points": 20, "items": [...] }
  ]
}
```

字段说明：

- `reading`：
  - `passage`：阅读材料原文。
  - `subQuestions`：子题数组，每个子题含 `id`、`type`（仅 `single_choice` / `multiple_choice` / `true_false`）、`stem`、`options`、`answer`、`explanation`、`points`。
  - `points` 为阅读理解大题总分，由各子题 `points` 累加。
- `cloze`：
  - `passage`：短文原文。
  - `blanks`：空数组，每个空含 `id`、`options`（4 个选项）、`answer`（正确选项索引）、`explanation`、`points`（可选，未提供时按大题总分均分）。
- `translation`：
  - `items`：翻译条目数组，每个条目含 `id`、`source`（原文）、`reference`（参考译文）、`explanation`（要点解析）、`points`。
  - `points` 为翻译大题总分，由各条目 `points` 累加。

### 5.3 内容要求

- 写作题必须给出范文、评分标准（内容/语言/结构各 5 分）。
- 词汇语法题必须给出考点说明与干扰项解析。
- 阅读理解必须提供完整原文，4 道小题覆盖主旨、细节、词义、推理。
- 完形填空提供完整原文，10 个空，每空 4 个选项，附全文翻译与重点解析。
- 翻译题 4 句，重点考查本单元核心词汇与句型。

---

## 6. Manifest 注册

在 `lib/content-data/manifest.ts` 中 `other.categories.english.items` 数组内新增一项：

```ts
{ id: 'unit-X', title: '大学英语 Unit X · {单元标题}', type: 'document', status: 'done' },
```

- `id` 必须与前述文件名一致（`unit-X`）。
- `status` 完成时设为 `done`，未完成时设为 `stub`。

---

## 7. 生成后校验清单

完成文件生成后，逐项检查：

- [ ] `content/other/english/unit-X.md` 存在且可被 `readContentMarkdown('other', 'english', 'unit-X')` 读取。
- [ ] `content/examples/other/unit-X/unit-X/` 下存在 4 个 `.md` 文件，命名符合规范。
- [ ] `content/quiz/other/unit-X.json` 存在且 JSON 格式合法。
- [ ] `lib/content-data/manifest.ts` 已注册该 Unit。
- [ ] `npm run build`（或等效构建命令）可成功通过。
- [ ] 本地访问 `http://localhost:3000/other/english/unit-X` 时：
  - [ ] 正文 Tab 正常显示。
  - [ ] 例题 Tab 显示 4 套例题。
  - [ ] 题目测试 Tab 加载 Quiz 且可正常作答/提交。

---

## 8. 执行流程摘要

1. 接收用户提供的课文原文与词汇表。
2. 生成 `content/other/english/unit-X.md`。
3. 生成 4 套例题到 `content/examples/other/unit-X/unit-X/`。
4. 生成 `content/quiz/other/unit-X.json`。
5. 在 `lib/content-data/manifest.ts` 注册 Unit。
6. 运行构建与本地验证。
7. 报告新增结果与下一步建议。

---

## 9. 当前已落地 Unit 示例

| Unit | 正文 | 例题 | Quiz | 状态 |
|---|---|---|---|---|
| Unit 1 | `content/other/english/unit-1.md` | 4 套 | `content/quiz/other/unit-1.json` | done |
| Unit 2 | `content/other/english/unit-2.md` | 4 套 | `content/quiz/other/unit-2.json` | done |
