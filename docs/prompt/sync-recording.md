# Goal Model：批量整理录音

对应 SOP：[`docs/sop/03-recording-processing.md`](../sop/03-recording-processing.md)。用于把课堂逐字稿（+智能纪要）批量清洗为标准的「课上录音」+「课堂纪要」内容。

```markdown
# 批量整理课堂录音：{科目} {讲次范围}

## 目标
把逐字稿（+智能纪要）清洗为标准格式，写入
content/{subjectId}/recording/rec-{NN}.md 和 content/{subjectId}/summary/sum-{NN}.md，覆盖 {讲次范围}。

## 先自行分析以下规范
- docs/sop/03-recording-processing.md
- docs/sop/00-infrastructure.md#内容生产闭环与反降质契约

## 涉及位置
- 源材料：{逐字稿 .txt / 智能纪要 .docx 路径}
- 目标位置：content/{subjectId}/recording/rec-{NN}.md、content/{subjectId}/summary/sum-{NN}.md

## 禁令
- 不许用脚本批量去噪/摘要——判断"哪些是老师重点暗示、哪些是无关闲聊"需要理解语义
- 清洗和纪要生成必须由同一个闭环子智能体完成，纪要不能脱离清洗后的逐字稿自由发挥
- 不许把纪要写成通用套话总结；考试重点标注必须能在逐字稿里找到老师原话依据（交付前自己抽查 2-3 处回查时间戳）
- 每个子智能体限制处理 3-4 讲，不要为了图快堆一个人处理十几讲

## 需要更新的内容
- content/{subjectId}/recording/rec-{NN}.md、content/{subjectId}/summary/sum-{NN}.md × {讲数}
- lib/content-data/{subjectId}-lectures.ts 追加每一讲的声明
- 完成后运行 `pnpm build-index` 重建检索索引，再跑 `pnpm check:registry`
```
