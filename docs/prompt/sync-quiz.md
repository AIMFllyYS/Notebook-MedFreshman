# Goal Model：批量增加题目

对应 SOP：[`docs/sop/04-quiz-generation.md`](../sop/04-quiz-generation.md)。用于给已完成详解/教材/录音的章节批量生成题目测试。

```markdown
# 批量出题：{科目} {章号/讲次范围}

## 目标
为 {科目} {章号/讲次范围}（{详解 | 教材 | 录音} 板块）批量生成题目测试，写入
content/quiz/{subjectId}/{chapterId}.json，每章/每讲一份，不合并、不跳章。

## 先自行分析以下规范（自己读，我不会复述内容）
- docs/sop/04-quiz-generation.md
- docs/sop/00-infrastructure.md#内容生产闭环与反降质契约
- docs/refer/exam-type-distribution.md（{科目} 对应题型配比，动态读取，不可硬编码）

## 涉及位置
- 源材料：content/{subjectId}/{detail|textbook|recording}/{itemId}.md（{章号/讲次范围} 对应的全部原文）
- 目标位置：content/quiz/{subjectId}/{chapterId}.json（每章/每讲一份，命名规则见 04 号 SOP）

## 禁令
- 不许写脚本/正则/关键词匹配批量生成题目或答案（已知真实反例：`scripts/one-off/fill-maogai-example-answers.ts`，按关键词给段落打分拼答案，不要重复这个模式）
- 不许凭记忆判定答案，必须 `Read` 对应原文核验
- 出题后必须派独立 Verifier 子智能体逐题复核，有疑义改题，不能自己强行圆
- `explanation`/`sourceRef` 不能是空话，必须落到具体知识点和文件位置；`hint` 只启发思路，绝不泄露答案
- 每章/每讲一个闭环子智能体负责到底（出题 + 核验 + 组卷），不要拆成互不担责的流水线角色

## 需要更新的内容
- content/quiz/{subjectId}/{chapterId}.json × {数量}
- 若板块 `capabilities` 尚未声明 `quiz`，检查并更新 lib/content-data/manifest.ts（或 category-templates.ts）对应 category
```
