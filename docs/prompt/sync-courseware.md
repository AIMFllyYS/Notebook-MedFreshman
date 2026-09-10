# Goal Model：批量整理课件（详解）

对应 SOP：理工科 [`docs/sop/02-detail-generation.md`](../sop/02-detail-generation.md)、人文科 [`docs/sop/02b-detail-generation-humanities.md`](../sop/02b-detail-generation-humanities.md)。用于融合课件/教材/录音，产出原创详解讲义——"把课件整理进去"实际落地成的是详解板块，而不是照搬课件原文。

```markdown
# 批量生成详解：{科目} {章号/专题范围}

## 目标
融合教材 + 课堂录音 + 课件，为 {科目} {章号/专题范围} 撰写原创详解讲义，写入
content/{subjectId}/detail/{itemId}.md（概率论例外：content/chapters/{chapterId}/{sectionId}.md）。

## 先自行分析以下规范
- {理工科：docs/sop/02-detail-generation.md｜人文科：docs/sop/02b-detail-generation-humanities.md}
- docs/sop/00-infrastructure.md#内容生产闭环与反降质契约
- docs/refer/rendering-architecture.md（完整指令组件清单）
- {人文科额外读：docs/refer/modern-history-textbook-format.md}

## 涉及位置
- 源材料：content/{subjectId}/textbook/{chapterId}.md + content/{subjectId}/recording/rec-{NN}.md + content/_raw/{subjectId}/（课件原始解析）
- 目标位置：content/{subjectId}/detail/{itemId}.md（或概率论 content/chapters/{chapterId}/{sectionId}.md）

## 禁令
- 不许转写/照抄课件原文，必须用自己的话重新组织（原创讲解，不是转写）
- 人文科：不许把"对比"写成手写表格+`:::insight`凑合、把"因果"写成`:::theorem`——用 `:::comparetable`/`:::causeeffect`
- Writer 写完必须自己开浏览器截图验收，不能交给下一个人审核
- 正文没通过验收前，不派发对应的交互组件/Manim 动画/测验（串行 gate，避免连锁返工）

## 需要更新的内容
- content/{subjectId}/detail/{itemId}.md × {小节数}
- 理工科另加：交互组件 components/interactives/{subjectId}/{chapterId}/{Name}.tsx、Manim 场景 manim/chapters/{chapterId}/scene_{sectionId}_{slug}.py（视复杂度，非必须）
- lib/content-data/manifest.ts 对应 category 的 status 改为 `done`
```
