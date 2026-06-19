# Tasks · 毛概学科内容整合

## Phase 0: 基础设施（1 个任务）

- [x] Task 1: 创建 maogai-detail.ts + 更新 manifest.ts
  - [ ] SubTask 1.1: 新建 `content/maogai-detail.ts`，导出 `maogaiDetailItems: ContentItem[]`（ch01~ch16，含子节点）和 `maogaiRecordings: Record<string, string[]>`
  - [ ] SubTask 1.2: 修改 `content/manifest.ts`，新增 import 并填充 maogai 学科的 detail/recording/summary 分类
  - [ ] SubTask 1.3: 创建目录结构 `content/maogai/recording/`、`content/maogai/summary/`、`content/maogai/detail/`

## Phase 1: 录音整理（13 个任务，全部并行）

每个子智能体读取一个 .txt 文件，提取说话人标注和时间戳，输出为规范化 .md 文件。

- [x] Task 2: 录音整理 rec-01（ch01 马克思主义中国化导论）
  - 源文件：`D:\飞书文档保存\毛概\毛概-第一二节-学习计划与安排.txt`
  - 输出：`content/maogai/recording/rec-01.md`

- [x] Task 3: 录音整理 rec-02（ch02 马克思主义中国化的历史进程）
  - 源文件：`D:\飞书文档保存\毛概\毛概-第二节-含重要通知.txt`
  - 输出：`content/maogai/recording/rec-02.md`

- [x] Task 4: 录音整理 rec-03（ch03 毛泽东思想及其历史地位）
  - 源文件：`D:\飞书文档保存\毛概\第三节毛泽东思想及毛泽东个人介绍课程.txt`
  - 输出：`content/maogai/recording/rec-03.md`

- [x] Task 5: 录音整理 rec-04（ch04 新民主主义革命理论——历史条件）
  - 源文件：`D:\飞书文档保存\毛概\毛概-第四节.txt`
  - 输出：`content/maogai/recording/rec-04.md`

- [x] Task 6: 录音整理 rec-05（ch05 新民主主义革命理论——革命理论）
  - 源文件：`D:\飞书文档保存\毛概\毛概-第五节.txt`
  - 输出：`content/maogai/recording/rec-05.md`

- [x] Task 7: 录音整理 rec-06（ch07 新民主主义革命理论——三大法宝）
  - 源文件：`D:\飞书文档保存\毛概\毛概第七节（有划重点）.txt`
  - 输出：`content/maogai/recording/rec-06.md`

- [x] Task 8: 录音整理 rec-07（ch08 社会主义改造理论上）
  - 源文件：`D:\飞书文档保存\毛概\毛概第八节-社会主义改造理论与过渡路线分析.txt`
  - 输出：`content/maogai/recording/rec-07.md`

- [x] Task 9: 录音整理 rec-08（ch09 社会主义改造理论下）
  - 源文件：`D:\飞书文档保存\毛概\毛概第9节.txt`
  - 输出：`content/maogai/recording/rec-08.md`

- [ ] Task 10: 录音整理 rec-09（ch12 毛泽东思想活的灵魂）
  - 源文件：`D:\飞书文档保存\毛概\第12节毛泽东思想与邓小平理论讲解.txt`
  - 输出：`content/maogai/recording/rec-09.md`

- [x] Task 11: 录音整理 rec-10（ch14 邓小平理论下）
  - 源文件：`D:\飞书文档保存\毛概\毛概第14节.txt`
  - 输出：`content/maogai/recording/rec-10.md`

- [x] Task 12: 录音整理 rec-11（ch15 一国两制与祖国统一）
  - 源文件：`D:\飞书文档保存\毛概\第15节毛概.txt`
  - 输出：`content/maogai/recording/rec-11.md`

- [x] Task 13: 录音整理 rec-12（ch16 期末复习）
  - 源文件：`D:\飞书文档保存\毛概\毛概补充课（有划重点）.txt`
  - 输出：`content/maogai/recording/rec-12.md`

- ~~Task 14: 录音整理 rec-13~~ **已取消**：12 个 .txt 源文件对应 12 个章（ch01-ch05, ch07-ch09, ch12, ch14-ch16），实际创建 rec-01 ~ rec-12 共 12 个文件。

## Phase 2: 纪要提取（13 个任务，全部并行）

### 2A: 从 .docx 提取（8 个）

每个子智能体使用 python-docx 读取 .docx 文件，提取结构化纪要内容。

- [x] Task 15: 纪要提取 sum-02（ch02）
  - 源文件：`D:\飞书文档保存\毛概\智能纪要：毛概-第二节-含重要通知 2026年3月9日.docx`
  - 输出：`content/maogai/summary/sum-02.md`

- [x] Task 16: 纪要提取 sum-03（ch03）
  - 源文件：`D:\飞书文档保存\毛概\智能纪要：第三节-毛泽东思想及毛泽东个人介绍课程 2026年3月16日.docx`
  - 输出：`content/maogai/summary/sum-03.md`

- [x] Task 17: 纪要提取 sum-04（ch04）
  - 源文件：`D:\飞书文档保存\毛概\智能纪要：毛概-第四节 2026年3月23日.docx`
  - 输出：`content/maogai/summary/sum-04.md`

- [x] Task 18: 纪要提取 sum-05（ch05）
  - 源文件：`D:\飞书文档保存\毛概\智能纪要：毛概-第五节 2026年3月30日.docx`
  - 输出：`content/maogai/summary/sum-05.md`

- [x] Task 19: 纪要提取 sum-06（ch07）
  - 源文件：`D:\飞书文档保存\毛概\智能纪要：毛概第七节（有划重点） 2026年4月13日.docx`
  - 输出：`content/maogai/summary/sum-06.md`

- [x] Task 20: 纪要提取 sum-08（ch09）
  - 源文件：`D:\飞书文档保存\毛概\智能纪要：毛概第9节 2026年4月27日.docx`
  - 输出：`content/maogai/summary/sum-08.md`

- [x] Task 21: 纪要提取 sum-09（ch12）
  - 源文件：`D:\飞书文档保存\毛概\智能纪要：第12节毛泽东思想与邓小平理论讲解 2026年5月18日.docx`
  - 输出：`content/maogai/summary/sum-09.md`

- [x] Task 22: 纪要提取 sum-10（ch14）
  - 源文件：`D:\飞书文档保存\毛概\智能纪要：毛概第14节 2026年6月1日.docx`
  - 输出：`content/maogai/summary/sum-10.md`

### 2B: 综合生成（5 个）

每个子智能体读取已整理的录音 .md 和/或 .txt 文件，综合提取课堂要点生成纪要。

- [x] Task 23: 纪要生成 sum-01（ch01 马克思主义中国化导论）
  - 源材料：`content/maogai/recording/rec-01.md`（Task 2 产出）
  - 输出：`content/maogai/summary/sum-01.md`
  - 依赖：Task 2

- [x] Task 24: 纪要生成 sum-07（ch08 社会主义改造理论上）
  - 源材料：`content/maogai/recording/rec-07.md`（Task 8 产出）+ 原始 .txt
  - 输出：`content/maogai/summary/sum-07.md`
  - 依赖：Task 8

- [x] Task 25: 纪要生成 sum-11（ch15 一国两制）
  - 源材料：`content/maogai/recording/rec-11.md`（Task 12 产出）+ 原始 .txt
  - 输出：`content/maogai/summary/sum-11.md`
  - 依赖：Task 12

- [x] Task 26: 纪要生成 sum-12（ch16 期末复习）
  - 源材料：`content/maogai/recording/rec-12.md`（Task 13 产出）+ 原始 .txt
  - 输出：`content/maogai/summary/sum-12.md`
  - 依赖：Task 13

- ~~Task 27: 纪要生成 sum-13~~ **已取消**：同 rec-13，实际创建 sum-01 ~ sum-12 共 12 个文件。

## Phase 3: 详解文件生成（约 12 个任务，分批并行）

每个子智能体读取对应章的录音 .md + 纪要 .md，按主题组织子节内容。

### 3A: ch01~ch05 详解（5 个任务）

- [ ] Task 28: 详解 ch01（马克思主义中国化导论）
  - 源材料：rec-01.md + sum-01.md
  - 输出：`content/maogai/detail/1.1.md`、`1.2.md`
  - 子节规划：1.1 课程介绍与教学安排 / 1.2 马克思主义中国化命题
  - 依赖：Task 2、Task 23

- [ ] Task 29: 详解 ch02（马克思主义中国化的历史进程）
  - 源材料：rec-02.md + sum-02.md
  - 输出：`content/maogai/detail/2.1.md`、`2.2.md`
  - 子节规划：2.1 马克思主义中国化的提出 / 2.2 长征与遵义会议
  - 依赖：Task 3、Task 15

- [ ] Task 30: 详解 ch03（毛泽东思想及其历史地位）
  - 源材料：rec-03.md + sum-03.md
  - 输出：`content/maogai/detail/3.1.md`、`3.2.md`、`3.3.md`
  - 子节规划：3.1 毛泽东思想的形成和发展 / 3.2 毛泽东思想的主要内容 / 3.3 毛泽东思想的历史地位
  - 依赖：Task 4、Task 16

- [ ] Task 31: 详解 ch04（新民主主义革命理论——历史条件）
  - 源材料：rec-04.md + sum-04.md
  - 输出：`content/maogai/detail/4.1.md`、`4.2.md`
  - 子节规划：4.1 近代中国国情 / 4.2 新民主主义革命的总路线
  - 依赖：Task 5、Task 17

- [ ] Task 32: 详解 ch05（新民主主义革命理论——革命理论）
  - 源材料：rec-05.md + sum-05.md
  - 输出：`content/maogai/detail/5.1.md`、`5.2.md`
  - 子节规划：5.1 政治革命理论框架 / 5.2 新旧民主主义革命比较
  - 依赖：Task 6、Task 18

### 3B: ch07~ch09 详解（3 个任务）

- [ ] Task 33: 详解 ch07（新民主主义革命理论——三大法宝）
  - 源材料：rec-06.md + sum-06.md
  - 输出：`content/maogai/detail/7.1.md`、`7.2.md`、`7.3.md`
  - 子节规划：7.1 统一战线 / 7.2 武装斗争 / 7.3 党的建设
  - 依赖：Task 7、Task 19

- [ ] Task 34: 详解 ch08（社会主义改造理论上）
  - 源材料：rec-07.md + sum-07.md
  - 输出：`content/maogai/detail/8.1.md`、`8.2.md`
  - 子节规划：8.1 新民主主义社会 / 8.2 过渡时期总路线
  - 依赖：Task 8、Task 24

- [ ] Task 35: 详解 ch09（社会主义改造理论下）
  - 源材料：rec-08.md + sum-08.md
  - 输出：`content/maogai/detail/9.1.md`、`9.2.md`、`9.3.md`
  - 子节规划：9.1 农业社会主义改造 / 9.2 手工业改造 / 9.3 资本主义工商业改造
  - 依赖：Task 9、Task 20

### 3C: ch12~ch16 详解（4 个任务）

- [ ] Task 36: 详解 ch12（毛泽东思想活的灵魂）
  - 源材料：rec-09.md + sum-09.md
  - 输出：`content/maogai/detail/12.1.md`、`12.2.md`、`12.3.md`
  - 子节规划：12.1 实事求是 / 12.2 群众路线 / 12.3 独立自主
  - 依赖：Task 10、Task 21

- [ ] Task 37: 详解 ch14（邓小平理论下）
  - 源材料：rec-10.md + sum-10.md
  - 输出：`content/maogai/detail/14.1.md`、`14.2.md`
  - 子节规划：14.1 社会主义初级阶段理论 / 14.2 改革开放理论
  - 依赖：Task 11、Task 22

- [ ] Task 38: 详解 ch15（一国两制与祖国统一）
  - 源材料：rec-11.md + sum-11.md
  - 输出：`content/maogai/detail/15.1.md`、`15.2.md`
  - 子节规划：15.1 "一国两制"构想 / 15.2 祖国统一与对外关系
  - 依赖：Task 12、Task 25

- [ ] Task 39: 详解 ch16（期末复习与重点梳理）
  - 源材料：rec-12.md + sum-12.md
  - 输出：`content/maogai/detail/16.1.md`、`16.2.md`
  - 子节规划：16.1 重点知识梳理 / 16.2 论十大关系与矛盾分析
  - 依赖：Task 13、Task 26

### 3D: stub 章节（ch06、ch10、ch11、ch13）

这 4 章无任何源材料，在 manifest.ts 中标记为 stub，不创建物理文件。

## Phase 4: 例题文件生成（12 个任务，全部并行）

每个子智能体读取对应章的录音 .md + 纪要 .md + 详解 .md，深度分析出题方向，生成 3-5 道典型例题。

- [ ] Task 40: 例题 ch01
  - 输出：`content/maogai/detail/ch01-examples.md`
  - 依赖：Task 28

- [ ] Task 41: 例题 ch02
  - 输出：`content/maogai/detail/ch02-examples.md`
  - 依赖：Task 29

- [ ] Task 42: 例题 ch03
  - 输出：`content/maogai/detail/ch03-examples.md`
  - 依赖：Task 30

- [ ] Task 43: 例题 ch04
  - 输出：`content/maogai/detail/ch04-examples.md`
  - 依赖：Task 31

- [ ] Task 44: 例题 ch05
  - 输出：`content/maogai/detail/ch05-examples.md`
  - 依赖：Task 32

- [ ] Task 45: 例题 ch07
  - 输出：`content/maogai/detail/ch07-examples.md`
  - 依赖：Task 33

- [ ] Task 46: 例题 ch08
  - 输出：`content/maogai/detail/ch08-examples.md`
  - 依赖：Task 34

- [ ] Task 47: 例题 ch09
  - 输出：`content/maogai/detail/ch09-examples.md`
  - 依赖：Task 35

- [ ] Task 48: 例题 ch12
  - 输出：`content/maogai/detail/ch12-examples.md`
  - 依赖：Task 36

- [ ] Task 49: 例题 ch14
  - 输出：`content/maogai/detail/ch14-examples.md`
  - 依赖：Task 37

- [ ] Task 50: 例题 ch15
  - 输出：`content/maogai/detail/ch15-examples.md`
  - 依赖：Task 38

- [ ] Task 51: 例题 ch16
  - 输出：`content/maogai/detail/ch16-examples.md`
  - 依赖：Task 39

## Phase 5: 集成验证（2 个任务）

- [ ] Task 52: TypeScript 编译检查
  - 运行 `pnpm exec tsc --noEmit`
  - 确认零错误
  - 依赖：Task 1

- [ ] Task 53: 运行时验证
  - 运行 `pnpm dev`
  - 验证 `/maogai/recording/rec-01` 页面渲染
  - 验证 `/maogai/summary/sum-01` 页面渲染
  - 验证 `/maogai/detail/1.1` 页面渲染
  - 验证左侧导航「毛概」→「课上录音」展开显示 13 个条目
  - 验证左侧导航「毛概」→「课堂纪要」展开显示 13 个条目
  - 验证左侧导航「毛概」→「详解」展开显示 16 章含子节点
  - 验证「例题」Tab 展示正确

## 任务依赖关系

```
Phase 0 (Task 1) ──> Phase 5 (Task 52, 53)

Phase 1 (Task 2~14) ──> Phase 2B (Task 23~27)
Phase 2A (Task 15~22) ──> Phase 3A~C (Task 28~39)
Phase 2B (Task 23~27) ──> Phase 3A~C (Task 28~39)
Phase 3A~C (Task 28~39) ──> Phase 4 (Task 40~51)
```

## 并行执行策略

- **Phase 0**: 先执行（1 个任务）
- **Phase 1 + Phase 2A**: 并行执行（21 个子智能体）
- **Phase 2B**: Phase 1 完成后执行（5 个子智能体）
- **Phase 3**: Phase 2 完成后分批执行（每批最多 10 个子智能体）
- **Phase 4**: Phase 3 完成后分批执行（每批最多 10 个子智能体）
- **Phase 5**: 最后执行
