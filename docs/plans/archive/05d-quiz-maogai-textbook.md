# 05d — 题目测试：毛概 · 教材板块

> **适用范围**：毛概「教材」Tab 的「题目测试」，与详解 Tab（`ch01~ch16.json`）完全独立。
> **内容来源**：唯一依据 `content/maogai/textbook/` 下 2023 版教材 Markdown。

---

## 1. 章号体系与 JSON 路径

| JSON chapterId | 教材章名 | 小节文件 | 详解章号（严禁混用） |
|----------------|----------|----------|----------------------|
| `tb-ch00` | 导论 | ch00-1 ~ ch00-5 | detail ch01/ch02 |
| `tb-ch01` | 毛泽东思想及其历史地位 | ch01-1 ~ ch01-3 | detail **ch03** |
| `tb-ch02` | 新民主主义革命理论 | ch02-1 ~ ch02-3 | detail ch04/ch05 |
| `tb-ch03` | 社会主义改造理论 | ch03-1 ~ ch03-3 | detail ch08/ch09 |
| `tb-ch04` | 社会主义建设道路初步探索 | ch04-1 ~ ch04-2 | detail ch10/ch11 |
| `tb-ch05` | 中特理论体系的形成发展 | ch05-1 ~ ch05-2 | （无直接对应） |
| `tb-ch06` | 邓小平理论 | ch06-1 ~ ch06-3 | detail ch13/ch14 |
| `tb-ch07` | 「三个代表」重要思想 | ch07-1 ~ ch07-3 | （无独立章） |
| `tb-ch08` | 科学发展观 | ch08-1 ~ ch08-3 | （无独立章） |

**产出路径**：`content/quiz/maogai/tb-ch{XX}.json`

**路由映射**：[`lib/store.ts`](../../lib/store.ts) 中 `deriveChapterId("textbook", itemId)` → `tb-chXX`（从 `ch01`、`ch01-2` 等提取章号）。

---

## 2. 题型与题量

- **仅** `single_choice` + `multiple_choice`（不含简答/论述/材料/辨析）
- 每题 2 分；`source` 固定为 `current_chapter`（不做复习题混入）
- `sourceRef.path` 必须以 `content/maogai/textbook/` 开头

| 章节 | 单选 | 多选 | 满分 |
|------|------|------|------|
| tb-ch00 | 11 | 5 | 32 |
| tb-ch01 | 10 | 7 | 34 |
| tb-ch02 | 11 | 6 | 34 |
| tb-ch03 | 11 | 6 | 34 |
| tb-ch04 | 10 | 6 | 32 |
| tb-ch05 | 8 | 5 | 26 |
| tb-ch06 | 11 | 6 | 34 |
| tb-ch07 | 10 | 6 | 32 |
| tb-ch08 | 10 | 6 | 32 |

---

## 3. 教研员命题视角

所有命制/核验子智能体统一人设：

> 某重点高校马克思主义学院毛概教研员，从事期末命题 20~30 年，熟悉 2023 版统编教材与 2024 年后思政客观题趋势。

**命题信条**：

- 好题考「理解」不考「偏怪」；干扰项来自学生真实易错点
- 单选重精准辨析；多选重并列要点完整识别
- 题干贴近教材原话，设问有「审题巧劲」
- 2024+ 趋势：概念层级辨析、阶段任务配对、文献-论断-会议三联

**出题角度代码**：

| 代码 | 说明 | 题型 |
|------|------|------|
| DEF | 定义/内涵精准匹配 | 单选 |
| SEQ | 时间线/阶段顺序 | 单选 |
| DOC | 文献-论断-会议配对 | 单选 |
| CONF | 易混概念辨析 | 单选 |
| LIST | 并列要点完整性 | 多选 |
| SCOPE | 适用范围/边界 | 单选 |
| ROLE | 历史地位/作用 | 单选/多选 |

---

## 4. 子智能体编排（PADC）

```text
主控 Master
  → Subagent-Anchor（锚点表，只读教材）
  → Subagent-Author（逐题命制，每批 ≤3 题）
  → Subagent-Verifier（独立核验，PASS/FAIL）
  → Subagent-Assembler（JSON 组装，不改题面）
```

### 禁止事项

- 禁止批量脚本灌题（`scripts/gen-maogai-quiz-*.py` 模式）
- 禁止引用 `content/maogai/detail/`、`recording/`、`shizhan-yanlian/`、`tmp/` 作答案依据
- 禁止修改详解 Tab 已有 `ch01~ch16.json`

### 子智能体传参模板

主控派发时必须填全：章号防混提醒、小节文件绝对路径、题量目标、已占用题干摘要、锚点表逐条、JSON Schema、格式参考文件（`content/quiz/modern-history/ch03.json` q001~q003）。

完整模板见计划文档 §3.5（锚点分析师 / 逐题命制员 / 答案核验员 / JSON 组装员四套 prompt）。

---

## 5. explanation 规范

```markdown
**正确项 X**：……（教材原文要点）

**干扰项辨析**：
- A：……（错因 + 学生为何可能误选）
- B：……
- C：……
```

每题必填 `hint`（不泄露答案字母）。

---

## 6. 验证命令

```bash
# JSON 格式
node -e "JSON.parse(require('fs').readFileSync('content/quiz/maogai/tb-ch00.json','utf8'))"

# 批量检查 sourceRef
node -e "
const fs=require('fs');
for(let i=0;i<=8;i++){
  const id='tb-ch'+String(i).padStart(2,'0');
  const d=JSON.parse(fs.readFileSync('content/quiz/maogai/'+id+'.json','utf8'));
  const bad=d.questions.filter(q=>!q.sourceRef.path.includes('textbook'));
  if(bad.length) console.log(id,'BAD',bad.map(q=>q.id));
  else console.log(id,'OK',d.questions.length);
}"
```

---

## 7. 与详解板块的关系

| 维度 | 教材 Tab | 详解 Tab |
|------|----------|----------|
| chapterId | `tb-ch00` ~ `tb-ch08` | `ch01` ~ `ch16` |
| 内容来源 | 2023 版统编教材 | 课堂详解录音整理 |
| 题型 | 仅单选+多选 | 单选+多选+简答+论述+材料 |
| 复习题 | 无 | ~50% review |

两套体系 **并行独立**，互不影响。
