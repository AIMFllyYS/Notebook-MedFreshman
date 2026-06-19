# 验收清单 · 毛概学科内容整合

## 基础设施

- [x] `content/maogai-detail.ts` 存在且导出 `maogaiDetailItems` 和 `maogaiRecordings`
- [x] `content/manifest.ts` 已导入 maogai-detail 并填充 maogai 学科的 detail/recording/summary 分类
- [x] `content/maogai/recording/`、`content/maogai/summary/`、`content/maogai/detail/` 目录已创建

## 录音文件（rec-01 ~ rec-13）

- [x] `rec-01.md` 存在，内容对应 ch01（第一二节·课程介绍与马克思主义中国化导论）
- [x] `rec-02.md` 存在，内容对应 ch02（第二节·马克思主义中国化历史进程）
- [x] `rec-03.md` 存在，内容对应 ch03（第三节·毛泽东思想及其历史地位）
- [x] `rec-04.md` 存在，内容对应 ch04（第四节·新民主主义革命历史条件）
- [x] `rec-05.md` 存在，内容对应 ch05（第五节·新民主主义革命理论）
- [x] `rec-06.md` 存在，内容对应 ch07（第七节·新民主主义革命三大法宝）
- [x] `rec-07.md` 存在，内容对应 ch08（第八节·社会主义改造理论上）
- [x] `rec-08.md` 存在，内容对应 ch09（第九节·社会主义改造理论下）
- [x] `rec-09.md` 存在，内容对应 ch12（第十二节·毛泽东思想活的灵魂）
- [x] `rec-10.md` 存在，内容对应 ch14（第十四节·邓小平理论）
- [x] `rec-11.md` 存在，内容对应 ch15（第十五节·一国两制）
- [x] `rec-12.md` 存在，内容对应 ch16（补充课·期末复习）
- [x] `rec-13.md` — 已确认跳过（12 个 .txt 源文件对应 12 个录音文件，无第 13 个）
- [x] 所有录音文件包含说话人标注和时间戳
- [x] 所有录音文件标题格式为 `# 第X节 · [标题]`

## 纪要文件（sum-01 ~ sum-13）

- [x] `sum-01.md` 存在，内容对应 ch01（综合生成）
- [x] `sum-02.md` 存在，内容对应 ch02（.docx 提取）
- [x] `sum-03.md` 存在，内容对应 ch03（.docx 提取）
- [x] `sum-04.md` 存在，内容对应 ch04（.docx 提取）
- [x] `sum-05.md` 存在，内容对应 ch05（.docx 提取）
- [x] `sum-06.md` 存在，内容对应 ch07（.docx 提取）
- [x] `sum-07.md` 存在，内容对应 ch08（综合生成）
- [x] `sum-08.md` 存在，内容对应 ch09（.docx 提取）
- [x] `sum-09.md` 存在，内容对应 ch12（.docx 提取）
- [x] `sum-10.md` 存在，内容对应 ch14（.docx 提取）
- [x] `sum-11.md` 存在，内容对应 ch15（综合生成）
- [x] `sum-12.md` 存在，内容对应 ch16（综合生成）
- [x] `sum-13.md` — 已确认跳过（12 个源文件对应 12 个纪要文件，无第 13 个）
- [x] 所有纪要文件包含关键词、核心议题、教学要点
- [x] 纪要内容严格基于源材料，无幻觉

## 详解文件

- [x] `detail/1.1.md`、`1.2.md` 存在（ch01）
- [x] `detail/2.1.md`、`2.2.md` 存在（ch02）
- [x] `detail/3.1.md`、`3.2.md`、`3.3.md` 存在（ch03）
- [x] `detail/4.1.md`、`4.2.md` 存在（ch04）
- [x] `detail/5.1.md`、`5.2.md` 存在（ch05）
- [x] `detail/7.1.md`、`7.2.md`、`7.3.md` 存在（ch07）
- [x] `detail/8.1.md`、`8.2.md` 存在（ch08）
- [x] `detail/9.1.md`、`9.2.md`、`9.3.md` 存在（ch09）
- [x] `detail/12.1.md`、`12.2.md`、`12.3.md` 存在（ch12）
- [x] `detail/14.1.md`、`14.2.md` 存在（ch14）
- [x] `detail/15.1.md`、`15.2.md` 存在（ch15）
- [x] `detail/16.1.md`、`16.2.md` 存在（ch16）
- [x] 所有详解文件使用 `:::definition`、`:::insight`、`:::note` 等指令块
- [x] 详解内容严格基于录音和纪要源材料

## 例题文件

- [x] `detail/ch01-examples.md` ~ `ch16-examples.md`（12 个文件）存在
- [x] 每个例题文件包含 3-5 道典型例题
- [x] 例题使用 `:::example` 指令块
- [x] 例题有详细解析

## TypeScript 编译

- [x] `pnpm exec tsc --noEmit` 零错误

## 运行时验证

- [ ] `/maogai/recording/rec-01` 页面正常渲染
- [ ] `/maogai/summary/sum-01` 页面正常渲染
- [ ] `/maogai/detail/1.1` 页面正常渲染
- [ ] 左侧导航「毛概」→「详解」展开显示 16 章含子节点
- [ ] 左侧导航「毛概」→「课上录音」展开显示 12 个条目
- [ ] 左侧导航「毛概」→「课堂纪要」展开显示 12 个条目
- [ ] 「例题」Tab 展示正确
