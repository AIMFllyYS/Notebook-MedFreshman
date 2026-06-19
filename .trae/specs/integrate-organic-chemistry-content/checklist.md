# 验收检查清单 · 有机化学内容整合

## 基础设施
- [ ] manifest.ts 中 chemistry.name = 「有机化学」
- [ ] content/organic-chemistry-detail.ts 存在并导出 organicChemistryDetailItems（14 章）
- [ ] NoteRenderer 引入 katex/contrib/mhchem，`$\ce{...}$` 可渲染
- [ ] examples API 支持 subjectId；chemistry 读 content/examples/chemistry/...；probability 回退旧路径不受影响
- [ ] scripts/extract-docx-images.mjs 可对 docx 提图到 public/images/chemistry/lesson-NN/
- [ ] chanim 最小渲染验证通过（或已确认降级方案并标注）

## 录音（20 个文件）
- [ ] rec-01.md ~ rec-20.md 全部存在且为精简逐字稿
- [ ] manifest.recording 各条目 status = done

## 纪要（19 个文件，无 sum-15）
- [ ] sum-01~14、sum-16~20 全部存在
- [ ] 含图章节的图片正常引用与显示
- [ ] manifest.summary 各条目 status = done

## 详解（42 个小节文件）
- [ ] ch01~ch14 各小节 detail/{sectionId}.md 存在
- [ ] 每小节使用 :::definition/:::example/:::note 等指令块
- [ ] 每小节 ≥1500 字
- [ ] 化学式用 `$\ce{...}$`，反应式带条件箭头
- [ ] 严格基于源材料，无虚构反应/方程式/机理
- [ ] organic-chemistry-detail.ts 各小节 status = done

## 例题
- [ ] 每小节 ≥3 道例题，存于 content/examples/chemistry/{ch}/{sec}/
- [ ] 每题标注 [出处: 第X讲/X.X节]
- [ ] 无编造化学事实

## 交互组件（每章 1-2 个，约 20 个）
- [ ] components/interactives/chemistry/ 下组件存在，memo 包裹、无 props
- [ ] registry.ts 注册（subjectId:'chemistry'）
- [ ] 对应小节 interactiveIds 已回填
- [ ] 组件可交互、无运行时报错

## 视频（每章 1-2 个，约 20 个）
- [ ] manim/chemistry/ 下脚本含 REGISTER 元数据
- [ ] 渲染产物在 public/media/videos/chemistry/{ch}/
- [ ] media.generated.ts 含 chemistry 条目（subjectId/src 正确）
- [ ] 对应小节 videoIds 已回填
- [ ] 至少 1 个视频可 PiP 播放；失败场景已降级标注

## 编译与运行
- [ ] pnpm exec tsc --noEmit 通过
- [ ] pnpm build 通过
- [ ] pnpm dev：左侧「有机化学」展开，14 章可见
- [ ] /chemistry/recording/rec-01 正常
- [ ] /chemistry/summary/sum-01 正常（图片显示）
- [ ] /chemistry/detail/1.1 正常（ce 渲染、指令块、视频/交互锚点）
- [ ] 详解「例题」Tab 读到化学例题，概率论例题回归正常

## 防幻觉抽查
- [ ] 随机核对 2-3 道例题/机理与源逐字稿一致
- [ ] 缺讲相关处已标注「源材料缺失」，无编造
