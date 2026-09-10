# Goal Model：批量整理教材

对应 SOP：[`docs/sop/01-textbook-processing.md`](../sop/01-textbook-processing.md)。用于把教材 PDF（或以教材形式提供的 PPT）批量转成结构化教材正文。

```markdown
# 批量接入教材：{科目} {章号范围}

## 目标
把 {教材 PDF/PPT 路径} 转成结构化教材正文，写入
content/{subjectId}/textbook/{chapterId}.md，覆盖 {章号范围}。

## 先自行分析以下规范
- docs/sop/01-textbook-processing.md
- docs/sop/00-infrastructure.md#内容生产闭环与反降质契约
- docs/refer/rendering-architecture.md（指令组件完整清单——不要只用 definition/example/pitfall 几个基础指令）

## 涉及位置
- 源材料：{教材 PDF/PPT 绝对路径}（先跑 `scripts/parse-docs.ts` 解析到 content/_raw/{subjectId}/）
- 目标位置：content/{subjectId}/textbook/{chapterId}.md

## 禁令
- 不许写脚本/正则批量生成或 patch 正文指令块（已知真实反例：`scripts/add-memory-cards.py`、`scripts/enhance-medical-markdown.py`——两者都是规则套壳，不要参考着写新脚本）
- 不许照抄 PDF 解析残留（页眉页码、"本章数字资源"之类占位文字、乱码控制字符必须清掉）
- 一个执行子智能体对自己负责的 3-4 章从提取到自查全程闭环负责，不要拆成"提取/格式化"两个互不担责的角色
- 写完必须按 01 号 SOP 的「验收（强制）」自查（体积/密度对照本科目黄金范例 + 浏览器截图），不能只保证文件生成了

## 需要更新的内容
- content/{subjectId}/textbook/{chapterId}.md × {章数}
- 例题 Tab 题目（若教材含独立习题）：content/examples/{subjectId}/{chapterId}/{sectionId}/EX{NN}_{slug}.md
- lib/content-data/manifest.ts 挂载对应 category（大二上教材可用 `python scripts/ingest-sophomore-textbooks.py --subject {subjectId}` 自动生成，其他情况手动挂载后跑 `pnpm check:registry`）
```
