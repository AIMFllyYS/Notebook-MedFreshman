# Tasks

## Phase 1: 基础设施搭建

- [x] Task 1: 创建 modern-history 目录结构与数据文件
  - [x] SubTask 1.1: 创建 `content/modern-history/recording/`、`content/modern-history/summary/`、`content/modern-history/detail/` 目录
  - [x] SubTask 1.2: 创建 `content/modern-history-detail.ts`，定义 10 章的 `ContentItem[]` 结构（含 children 小节），参考 `probability-detail.ts` 格式
  - [x] SubTask 1.3: 修改 `content/manifest.ts`，将 `modern-history` 学科的 `detail`、`recording`、`summary` 分类指向实际数据

## Phase 2: 录音整理（10 个子智能体任务，已完成）

- [x] Task 2: 录音整理 — ch01 课程导论
- [x] Task 3: 录音整理 — ch02 农民阶级
- [x] Task 4: 录音整理 — ch03 地主阶级洋务派
- [x] Task 5: 录音整理 — ch04 早期资产阶级与维新思想
- [x] Task 6: 录音整理 — ch05 戊戌变法政治实践
- [x] Task 7: 录音整理 — ch06 辛亥革命
- [x] Task 8: 录音整理 — ch07 五四运动
- [x] Task 9: 录音整理 — ch08 国共合作与大革命
- [x] Task 10: 录音整理 — ch09 抗日战争
- [x] Task 11: 录音整理 — ch10 解放战争

## Phase 3: 纪要创建（10 个子智能体任务）— v2 新增

> **注意**：原 Task 12 标记为"已完成"但纪要 .md 物理文件从未创建。本次重新派遣子智能体创建。

### 3A: 从 .docx 智能纪要提取（8 个任务，可并行）

- [x] Task 26: 纪要创建 — sum-02（ch02 农民阶级）
  - 源文件：`D:\飞书文档保存\中国近现代史纲要课程及录音\智能纪要：纲要-第三节 2026年3月16日.docx`
  - 输出：`content/modern-history/summary/sum-02.md`
- [x] Task 27: 纪要创建 — sum-03（ch03 洋务派）
  - 源文件：`D:\飞书文档保存\中国近现代史纲要课程及录音\智能纪要：近现代史纲要-第四节 2026年3月23日.docx`
  - 输出：`content/modern-history/summary/sum-03.md`
- [x] Task 28: 纪要创建 — sum-04（ch04 维新思想）
  - 源文件：`D:\飞书文档保存\中国近现代史纲要课程及录音\智能纪要：纲要-第五节-戊戌变法思想背景及论战分析 2026年3月30日.docx`
  - 输出：`content/modern-history/summary/sum-04.md`
- [x] Task 29: 纪要创建 — sum-05（ch05 戊戌变法）
  - 源文件：`D:\飞书文档保存\中国近现代史纲要课程及录音\智能纪要：纲要第六节戊戌变法与辛亥革命教学分析 2026年4月13日.docx`
  - 输出：`content/modern-history/summary/sum-05.md`
- [x] Task 30: 纪要创建 — sum-06（ch06 辛亥革命）
  - 源文件：`D:\飞书文档保存\中国近现代史纲要课程及录音\智能纪要：纲要第七节辛亥革命相关知识教学分析 2026年4月20日.docx`
  - 输出：`content/modern-history/summary/sum-06.md`
- [x] Task 31: 纪要创建 — sum-07（ch07 五四运动）
  - 源文件：`D:\飞书文档保存\中国近现代史纲要课程及录音\智能纪要：中国近现代史纲要-第9节-五四运动 2026年4月27日.docx`
  - 输出：`content/modern-history/summary/sum-07.md`
- [x] Task 32: 纪要创建 — sum-08（ch08 国共合作）
  - 源文件：`D:\飞书文档保存\中国近现代史纲要课程及录音\智能纪要：第12节近现代史纲要 2026年5月18日.docx`
  - 输出：`content/modern-history/summary/sum-08.md`
- [x] Task 33: 纪要创建 — sum-09（ch09 抗日战争）
  - 源文件：`D:\飞书文档保存\中国近现代史纲要课程及录音\智能纪要：第14章抗日战争国共抗战策略分析 2026年6月1日.docx`
  - 输出：`content/modern-history/summary/sum-09.md`

### 3B: 综合生成纪要（2 个任务，可并行）

- [x] Task 34: 纪要创建 — sum-01（ch01 课程导论）
  - 源文件：`content/modern-history/recording/rec-01.md` + `content/modern-history/detail/1.1.md` + `content/modern-history/detail/1.2.md`
  - 输出：`content/modern-history/summary/sum-01.md`
  - 策略：基于已整理的录音和详解，综合提取课堂要点生成纪要
- [x] Task 35: 纪要创建 — sum-10（ch10 解放战争）
  - 源文件：`content/modern-history/recording/rec-10.md` + `content/modern-history/detail/10.1.md` + `content/modern-history/detail/10.2.md` + `content/modern-history/detail/10.3.md`
  - 输出：`content/modern-history/summary/sum-10.md`
  - 策略：基于已整理的录音和详解，综合提取课堂要点生成纪要

## Phase 4: 集成验证

- [x] Task 36: 验证所有 10 个纪要文件存在且内容完整
- [x] Task 25: 端到端验证（TypeScript 编译检查通过，运行时验证待手动确认）

## 已完成的 Phase（保留记录）

### Phase 4（详解撰写）— 已完成
- [x] Task 13-22: 详解撰写 ch01-ch10（31 个小节文件）

### Phase 5（例题出题）— 已完成
- [x] Task 23: 例题出题 ch01-ch10（10 个 chXX-examples.md 文件）

### Phase 6（集成）— 已完成
- [x] Task 24: 更新 manifest.ts 与数据文件

# Task Dependencies

- Task 26-33（.docx 纪要提取）和 Task 34-35（综合生成纪要）可并行执行
- Task 36（验证）依赖 Task 26-35 全部完成
- Task 25（端到端验证）依赖 Task 36 完成
