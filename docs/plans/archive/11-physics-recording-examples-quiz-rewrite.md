# 大学物理课上录音例题与题库系统重写执行规格

## 范围

本轮只覆盖已经存在的 25 讲：

`rec-01`、`rec-02`、`rec-03`、`rec-04`、`rec-06`、`rec-07`、`rec-08`、`rec-09`、`rec-10`、`rec-11`、`rec-12`、`rec-13`、`rec-14`、`rec-15`、`rec-16`、`rec-17`、`rec-19`、`rec-20`、`rec-21`、`rec-22`、`rec-23`、`rec-24`、`rec-25`、`rec-26`、`rec-27`。

`rec-05` 和 `rec-18` 不创建占位文件，不纳入本轮题库、例题、校验和提交范围。

## 内容标准

### 例题

- 每讲新建录音例题目录，例题按录音讲解顺序排列。
- 例题来源以对应 `content/physics/recording/rec-NN.md` 为主，`content/physics/summary/sum-NN.md` 只作结构辅助。
- 若课堂信息不完整，可以做小幅改编，但不得引入课堂未覆盖的超纲模型。
- 例题正文必须包含：题目、已知量、所用公式、代入计算、单位检查、最终答案、易错点。
- 需要图示时使用静态 SVG 文件，并通过 `::figure{src="..."}` 引用。

### 题目测试

- 每讲保持 24 题、100 分、50 分钟。
- 题干必须是独立题目，不得写“根据录音”“参考录音内容”“本段录音”等依赖语境。
- 解析必须采用规范答题卡口吻，避免用“老师说”“课堂上说”替代公式、定义或推导依据。
- 选择题每个干扰项必须有可解释的错误点；解析中至少说明主要干扰项错因。
- 计算题解析必须包含“已知—公式—代入—计算—单位—结论”链条。
- 主观题必须有可自评的 `scoring_criteria`，分值闭合。
- `sourceRef.path` 必须指向当前录音文件，`sourceRef.label` 必须包含当前 `rec-NN` 和可回查定位。

## SVG 安全边界

- 录音题库和例题只允许引用静态 SVG 资产，不写裸 `<svg>...</svg>`。
- SVG 文件放入 `public/images/physics/svg/recording/rec-NN/`。
- SVG 需包含可读标题或说明，颜色优先使用 `currentColor` 或 CSS 变量。
- 本轮不改通用 Markdown 的裸 SVG 渲染策略，不扩大 `rehype-raw` 风险面。

## Python 核验

- 每讲非平凡计算必须在 `tmp/physics-recording-verification/rec-NN/` 下保留 Python 核验脚本。
- 脚本文件名与题号或例题号对应，例如 `q004_continuity.py`、`ex02_lens.py`。
- 运行输出用于 closeout 摘要；`tmp/` 不作为最终内容来源，也不提交为课程正文。

## 批次与提交

1. 规划与质量基线：`docs(physics): plan recording quiz and example rewrite`
2. 录音例题架构打通：`feat(examples): support physics recording examples`
3. SVG 与渲染安全补强：`test(quiz): cover figure rendering in quiz markdown`
4. Batch A：`rec-01~04, rec-06`
5. Batch B：`rec-07~11`
6. Batch C：`rec-12~16`
7. Batch D：`rec-17, rec-19~22`
8. Batch E：`rec-23~27`
9. 总体验收：`test(physics): verify recording quiz and example content`

每个阶段完成后本地 commit。提交前至少运行与本阶段相关的最小验证命令。

## 校验命令

阶段性命令：

```bash
node --import tsx --test tests/content/physicsRecordingQuizQuality.test.ts
node --import tsx scripts/check-physics-recording-quiz-quality.mjs --only=rec-01
```

内容批次命令：

```bash
node --import tsx scripts/check-physics-recording-quiz-quality.mjs --only=rec-01,rec-02,rec-03,rec-04,rec-06 --strict-style
```

最终命令：

```bash
npm run check:encoding
node scripts/check-prose-svg-rules.mjs
npm run test:react -- components/quiz/QuizMarkdown.test.tsx
node --import tsx --test tests/content/quiz.test.ts tests/api/loader.test.ts tests/content/physicsRecordingQuizQuality.test.ts
node --import tsx scripts/check-physics-recording-quiz-quality.mjs --strict-style
```
