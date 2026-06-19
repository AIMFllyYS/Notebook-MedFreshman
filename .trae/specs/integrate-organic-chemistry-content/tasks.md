# Tasks · 有机化学内容整合

> 执行纪律：子智能体**按顺序分批，每批 ≤3-4 个**；共享文件（manifest.ts / organic-chemistry-detail.ts / registry.ts / media.generated.ts）**只由主控串行更新**。

## Phase 0：脚手架 + triage 定稿大纲
- [x] Task 0.1：建目录树（content/chemistry/{recording,summary,detail}、examples/chemistry、interactives/chemistry、manim/chemistry、public/images/chemistry、public/media/videos/chemistry、.trae/specs/...）
- [x] Task 0.2：triage 子智能体读 20 个逐字稿 → 定稿讲次→章→节映射（4 批，每批 5 个）
- [x] Task 0.3：写 organic-chemistry-detail.ts（14 章骨架 + 源文件映射）
- [x] Task 0.4：修 manifest.ts（命名 + 三类条目）
- [x] Task 0.5：写 spec/tasks/checklist 三件套
- [x] 检查点①：用户确认 14 章大纲

## Phase 1：基础设施（顺序）
- [ ] Task 1.1（INFRA-1）：manifest 命名修复 + NoteRenderer 引入 mhchem
- [ ] Task 1.2（INFRA-2）：examples API + ExampleTab 学科命名空间化
- [ ] Task 1.3（INFRA-3）：scripts/extract-docx-images.mjs 提图脚本
- [ ] Task 1.4（INFRA-4）：chanim 环境 + 最小渲染验证（1 个分子骨架式 + 1 条能量曲线）
- [ ] 检查点②：tsc + build 通过；chanim 验证或已确认降级

## Phase 2：录音整理（子智能体，按讲次分批 ≤4）
- [ ] Task 2.x：rec-01 ~ rec-20，每讲一个子智能体读单个 .txt → content/chemistry/recording/rec-NN.md
- [ ] 主控：manifest.recording 各条目 status → done

## Phase 3：纪要提取（子智能体，按讲次分批 ≤4）
- [ ] Task 3.0：跑提图脚本抽 19 份 docx 图片
- [ ] Task 3.x：sum-01 ~ sum-20（无 sum-15），每讲一个子智能体 → content/chemistry/summary/sum-NN.md（引用图片）
- [ ] 主控：manifest.summary 各条目 status → done

## Phase 4：详解撰写（子智能体，按章分批 ≤3 章）
- [ ] Task 4.x：ch01 ~ ch14，每章一个子智能体输入精简录音+纪要 → 各小节 detail/{sectionId}.md
- [ ] 主控：organic-chemistry-detail.ts 各小节 status → done

## Phase 5：例题出题（子智能体，按章分批 ≤3 章）
- [ ] Task 5.x：ch01 ~ ch14，每章一个子智能体 → content/examples/chemistry/{ch}/{sec}/EX*.md（标出处）

## Phase 6：交互组件（子智能体，每批 ≤3）
- [ ] Task 6.x：每章 1-2 个交互（纽曼旋转器/命名练习器/SN1-SN2 对比/马氏规则/手性识别/能量剖面 等）
- [ ] 主控：registry.ts 注册 + detail.ts 回填 interactiveIds

## Phase 7：Manim+chanim 视频（子智能体出脚本，主控串行渲染）
- [ ] Task 7.x：每章 1-2 个 chanim 脚本（含 REGISTER）→ 主控渲染 → media.generated.ts → 回填 videoIds
- [ ] 渲染失败的场景降级静态图并标注

## Phase 8：集成与验证
- [ ] Task 8.1：核对各章 children 数与文件一致、status/summary 正确
- [ ] Task 8.2：tsc + build；pnpm dev 端到端验证（四分类、ce 渲染、例题、交互、视频、图片）
- [ ] Task 8.3：抽查防幻觉（2-3 道例题/机理对照源材料）
- [ ] 检查点③：用户验收

## 任务依赖
- Phase 0 → 全部后续
- Phase 1 → Phase 3（提图脚本）、详解渲染（mhchem）、例题（命名空间）
- Phase 2 + Phase 3 → Phase 4（详解输入）
- Phase 4 → Phase 5（例题输入）、Phase 6/7（锚点与可视化选题）
- Phase 6 + Phase 7 → 回填 detail.ts 的 interactiveIds/videoIds
- 全部 → Phase 8
