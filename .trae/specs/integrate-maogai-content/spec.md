# 毛概学科内容整合 Spec

## Why

项目中 `maogai` 学科（毛泽东思想和中国特色社会主义理论体系概论）在 `manifest.ts` 中已声明但所有分类（detail/recording/summary）均为空数组，`content/maogai/` 目录下无任何物理文件。用户提供了 `D:\飞书文档保存\毛概` 下 12 个 .txt 录音文本（共约 29.5 万字）和 8 个 .docx 智能纪要，需要系统性整合到项目中，参照已完成的 `modern-history` 学科模式。

## What Changes

- **新建** `content/maogai-detail.ts` — 定义毛概学科的详解内容树（ch01~ch16，含子节点）
- **修改** `content/manifest.ts` — 导入 maogaiDetailItems，填充 maogai 学科的 detail/recording/summary 分类
- **新建** `content/maogai/recording/rec-01.md` ~ `rec-13.md`（13 个录音整理文件）
- **新建** `content/maogai/summary/sum-01.md` ~ `sum-13.md`（13 个纪要文件）
- **新建** `content/maogai/detail/1.1.md` ~ `16.2.md`（详解文件，按主题组织子节）
- **新建** `content/maogai/detail/ch01-examples.md` ~ `ch16-examples.md`（16 个例题文件）
- **无需修改**：`lib/types/content.ts`（maogai 已在 SubjectId 中）、`lib/constants/subjects.ts`（已配置）、API 路由（已支持通用路径）

## 影响

- Affected code:
  - `content/maogai/` — 新建全部目录和文件
  - `content/maogai-detail.ts` — 新建
  - `content/manifest.ts` — 修改 maogai 条目

## 源材料清单

### .txt 录音文本（12 个文件，约 29.5 万字）

| 文件名 | 节次 | 日期 | 主题 |
|--------|------|------|------|
| `毛概-第一二节-学习计划与安排.txt` | 第1-2节 | 3月2日 | 课程介绍、教师背景、教学安排、马克思主义中国化概述 |
| `毛概-第二节-含重要通知.txt` | 第2节 | 3月9日 | 马克思主义中国化命题、长征与遵义会议、第五次反围剿失败 |
| `第三节毛泽东思想及毛泽东个人介绍课程.txt` | 第3节 | 3月16日 | 马克思主义中国化命题提出、毛泽东思想内涵、六届六中全会 |
| `毛概-第四节.txt` | 第4节 | 3月23日 | 毛泽东思想历史条件、半殖民地半封建社会、民族独立 |
| `毛概-第五节.txt` | 第5节 | 3月30日 | 政治革命理论、法国大革命、十月革命、辛亥革命、新民主主义革命 |
| `毛概第七节（有划重点）.txt` | 第7节 | 4月13日 | 新民主主义革命理论、农村包围城市、武装夺取政权 |
| `毛概第八节-社会主义改造理论与过渡路线分析.txt` | 第8节 | 4月20日 | 社会主义改造理论、过渡时期总路线 |
| `毛概第9节.txt` | 第9节 | 4月27日 | 农业/手工业/资本主义工商业社会主义改造 |
| `第12节毛泽东思想与邓小平理论讲解.txt` | 第12节 | 5月18日 | 毛泽东思想活的灵魂、改革开放前后两个30年 |
| `毛概第14节.txt` | 第14节 | 6月1日 | 邓小平理论、社会主义市场经济体制、南方讲话 |
| `第15节毛概.txt` | 第15节 | 6月8日 | 一国两制、祖国统一、对外关系 |
| `毛概补充课（有划重点）.txt` | 补充课 | 6月11日 | 期末复习划重点 |

### .docx 智能纪要（8 个文件）

| .docx 文件名 | 对应节次 |
|-------------|---------|
| `智能纪要：毛概-第二节-含重要通知 2026年3月9日.docx` | 第2节 |
| `智能纪要：第三节-毛泽东思想及毛泽东个人介绍课程 2026年3月16日.docx` | 第3节 |
| `智能纪要：毛概-第四节 2026年3月23日.docx` | 第4节 |
| `智能纪要：毛概-第五节 2026年3月30日.docx` | 第5节 |
| `智能纪要：毛概第七节（有划重点） 2026年4月13日.docx` | 第7节 |
| `智能纪要：毛概第9节 2026年4月27日.docx` | 第9节 |
| `智能纪要：第12节毛泽东思想与邓小平理论讲解 2026年5月18日.docx` | 第12节 |
| `智能纪要：毛概第14节 2026年6月1日.docx` | 第14节 |

### 缺失记录的课堂

| 节次 | 缺失类型 |
|------|---------|
| 第6节 | 无 .txt、无 .docx |
| 第10节 | 无 .txt、无 .docx |
| 第11节 | 无 .txt、无 .docx |
| 第13节 | 无 .txt、无 .docx |

## 章节映射（16 章）

| 章 | 主题 | 录音 .txt 来源 | 纪要来源 |
|----|------|---------------|---------|
| ch01 | 马克思主义中国化导论 | 毛概-第一二节-学习计划与安排.txt | 综合生成 |
| ch02 | 马克思主义中国化的历史进程 | 毛概-第二节-含重要通知.txt | .docx 提取 |
| ch03 | 毛泽东思想及其历史地位 | 第三节毛泽东思想及毛泽东个人介绍课程.txt | .docx 提取 |
| ch04 | 新民主主义革命理论——历史条件 | 毛概-第四节.txt | .docx 提取 |
| ch05 | 新民主主义革命理论——革命理论 | 毛概-第五节.txt | .docx 提取 |
| ch06 | 新民主主义革命理论——革命道路 | —— | —— |
| ch07 | 新民主主义革命理论——三大法宝 | 毛概第七节（有划重点）.txt | .docx 提取 |
| ch08 | 社会主义改造理论（上） | 毛概第八节-社会主义改造理论与过渡路线分析.txt | 综合生成 |
| ch09 | 社会主义改造理论（下） | 毛概第9节.txt | .docx 提取 |
| ch10 | 社会主义建设道路的初步探索 | —— | —— |
| ch11 | 社会主义建设的曲折发展 | —— | —— |
| ch12 | 毛泽东思想活的灵魂 | 第12节毛泽东思想与邓小平理论讲解.txt | .docx 提取 |
| ch13 | 邓小平理论（上） | —— | —— |
| ch14 | 邓小平理论（下） | 毛概第14节.txt | .docx 提取 |
| ch15 | "一国两制"与祖国统一 | 第15节毛概.txt | 综合生成 |
| ch16 | 期末复习与重点梳理 | 毛概补充课（有划重点）.txt | 综合生成 |

## 子智能体策略

### Phase 1: 录音整理 + 纪要提取（并行，约 25 个子智能体）

**录音整理（13 个子智能体）**：
- 每个子智能体接收一个 .txt 文件路径
- 读取文件内容，提取说话人标注和时间戳
- 输出为规范化 .md 文件（参照 rec-01.md 格式）

**纪要提取**：
- 8 个从 .docx 提取（使用 python-docx 库）
- 4 个从已整理的录音 .md + .txt 综合生成
- 1 个（ch01）从已有 .txt 综合生成

### Phase 2: 详解 + 例题生成（并行，约 16 个子智能体）

**详解文件**：
- 每个子智能体接收对应章的录音 .md + 纪要 .md
- 按主题组织子节内容
- 输出 detail/X.Y.md 文件

**例题文件**：
- 每个子智能体接收对应章的全部内容
- 分析出题方向，生成 3-5 道典型例题
- 输出 detail/chXX-examples.md 文件

### Phase 3: 集成验证

- 更新 manifest.ts 和 maogai-detail.ts
- TypeScript 编译检查
- 运行时验证

## 输出格式规范

### 录音整理（rec-XX.md）
```markdown
# 第X节 · [课堂标题]
> 录音整理，含说话人标注与时间戳

说话人 X HH:MM
[文本内容]

说话人 X HH:MM
[文本内容]
...
```

### 纪要（sum-XX.md）
```markdown
# 第X节 · [主题] · 课堂纪要

## 关键词
[3-5个核心关键词]

## 核心议题
[本次课堂讨论的主要议题列表]

## 教学要点
### [要点类别1]
- 具体要点...

### [要点类别2]
- 具体要点...

## 课堂讨论/互动（如有）
[课堂中师生互动的要点]

## 参考文献/延伸阅读（如有）
[教师提到的参考书目、文献]
```

### 详解（X.Y.md）
```markdown
# X.Y [小节标题]

## 引言
[导入段落]

:::definition{label=核心概念}
...
:::

## 一、[主题1]
[详细内容]

:::insight{label=要点}
...
:::

## 二、[主题2]
[详细内容]

:::note{label=本节小结}
...
:::
```

### 例题（chXX-examples.md）
```markdown
# 第X章 · 例题精选

## 例题1：[题目标题]
:::example{label=题目}
[题目内容]
:::

**解析**：
[详细解析]

## 例题2：[题目标题]
...
```

## ADDED Requirements

### Requirement: 毛概学科内容文件创建
系统 SHALL 为 `content/maogai/` 目录提供完整的录音、纪要、详解和例题文件。

#### Scenario: 用户访问毛概录音内容
- **WHEN** 用户访问 `/maogai/recording/rec-01`
- **THEN** API 从 `content/maogai/recording/rec-01.md` 读取内容并返回

#### Scenario: 用户访问毛概纪要内容
- **WHEN** 用户访问 `/maogai/summary/sum-01`
- **THEN** API 从 `content/maogai/summary/sum-01.md` 读取内容并返回

#### Scenario: 用户访问毛概详解内容
- **WHEN** 用户访问 `/maogai/detail/1.1`
- **THEN** API 从 `content/maogai/detail/1.1.md` 读取内容并返回

### Requirement: manifest.ts 填充
manifest.ts 中 maogai 学科的 detail/recording/summary 分类 SHALL 包含完整的 ContentItem 条目。

#### Scenario: 左侧导航显示
- **WHEN** 用户选择毛概学科
- **THEN** 左侧导航显示详解（ch01~ch16 含子节点）、课上录音（rec-01~rec-13）、课堂纪要（sum-01~sum-13）分类

### Requirement: maogai-detail.ts 数据模块
新建 `content/maogai-detail.ts`，导出 `maogaiDetailItems: ContentItem[]` 和 `maogaiRecordings: Record<string, string[]>`。

## MODIFIED Requirements

### Requirement: manifest.ts 导入更新
manifest.ts 需新增 `import { maogaiDetailItems, maogaiRecordings } from './maogai-detail'`，并在 maogai 学科的 categories 中引用。

## 边界与限制

- 文科课程特性：**严格基于来源，禁止幻觉**
- .docx 文件需要通过子智能体使用 python-docx 库读取
- .txt 文件为飞书录音转写格式（含时间戳和说话人标注）
- 第6、10、11、13节无任何源材料，在 manifest 中标记为 stub
- 毛概为文科课程，不使用 Manim 动画和交互组件
- 录音文件单个 11KB~85KB（约 1.1 万~2.8 万字），需通过子智能体处理防止上下文污染
