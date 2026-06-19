# 中国近现代史纲要 · 内容整合与系统化 Spec（v2 更新）

## Why

项目中 `modern-history` 学科（中国近现代史纲要）的录音（recording）和详解（detail）、例题（examples）内容已全部完成，但**纪要（summary）分类的 10 个 .md 物理文件完全缺失**。`manifest.ts` 中已声明 `sum-01` ~ `sum-10` 且标记为 `status: 'done'`，但 `content/modern-history/summary/` 目录下实际没有任何 .md 文件，导致用户访问 `/modern-history/summary/sum-01` 等路由时无法加载内容。

需要从 `D:\飞书文档保存\中国近现代史纲要课程及录音` 中的智能纪要 .docx 文件提取内容，创建 10 个纪要 .md 文件，补全内容链路。

## What Changes

- **新建** `content/modern-history/summary/sum-01.md` ~ `sum-10.md`（共 10 个文件）
- **修正** checklist.md 中纪要相关的验收状态（之前错误标记为已完成）
- **无需修改**：`manifest.ts`（sum-01 ~ sum-10 条目已存在）、`modern-history-detail.ts`、`route.ts`

## 源材料映射

### 有 .docx 智能纪要的章节（ch02-ch09，共 8 个）

| sum ID | 章 | 智能纪要 .docx 文件名 |
|--------|-----|----------------------|
| sum-02 | ch02 农民阶级 | `智能纪要：纲要-第三节 2026年3月16日.docx` |
| sum-03 | ch03 洋务派 | `智能纪要：近现代史纲要-第四节 2026年3月23日.docx` |
| sum-04 | ch04 维新思想 | `智能纪要：纲要-第五节-戊戌变法思想背景及论战分析 2026年3月30日.docx` |
| sum-05 | ch05 戊戌变法 | `智能纪要：纲要第六节戊戌变法与辛亥革命教学分析 2026年4月13日.docx` |
| sum-06 | ch06 辛亥革命 | `智能纪要：纲要第七节辛亥革命相关知识教学分析 2026年4月20日.docx` |
| sum-07 | ch07 五四运动 | `智能纪要：中国近现代史纲要-第9节-五四运动 2026年4月27日.docx` |
| sum-08 | ch08 国共合作 | `智能纪要：第12节近现代史纲要 2026年5月18日.docx` |
| sum-09 | ch09 抗日战争 | `智能纪要：第14章抗日战争国共抗战策略分析 2026年6月1日.docx` |

### 无 .docx 智能纪要的章节（ch01、ch10，共 2 个）

| sum ID | 章 | 处理策略 |
|--------|-----|----------|
| sum-01 | ch01 课程导论 | 基于 `rec-01.md`（已整理录音）+ `detail/1.1.md`、`detail/1.2.md` 由子智能体综合生成纪要 |
| sum-10 | ch10 解放战争 | 基于 `rec-10.md`（已整理录音）+ `detail/10.1~10.3.md` 由子智能体综合生成纪要 |

## 子智能体策略

### .docx 提取（sum-02 ~ sum-09）
每个子智能体接收一个 .docx 文件路径，读取并提取结构化纪要内容，输出为规范化的 .md 文件。

### 综合生成（sum-01、sum-10）
每个子智能体接收该章的录音整理文件 + 详解文件，综合提取课堂要点，生成纪要格式的 .md 文件。

### 输出格式规范
```markdown
# [课堂标题] · 课堂纪要

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

## 影响

- Affected code:
  - `content/modern-history/summary/` — 新建 10 个 .md 文件
  - `.trae/specs/integrate-modern-history-content/checklist.md` — 修正纪要验收状态

## 边界与限制

- 本次不修改 manifest.ts（sum-01 ~ sum-10 条目已正确声明）
- 本次不修改详解和例题（已全部完成）
- .docx 文件需要通过子智能体读取（主控不直接处理二进制格式）
- 纪要内容必须严格基于 .docx 源材料或录音整理文件，禁止幻觉

## ADDED Requirements

### Requirement: 纪要分类物理文件补全
系统 SHALL 为 `content/modern-history/summary/` 目录提供 10 个 .md 物理文件，与 manifest.ts 中声明的 sum-01 ~ sum-10 条目对应。

#### Scenario: 用户访问纪要内容
- **WHEN** 用户访问 `/modern-history/summary/sum-01`
- **THEN** API 从 `content/modern-history/summary/sum-01.md` 读取内容并返回

#### Scenario: 纪要内容完整性
- **WHEN** 10 个纪要文件全部创建完成
- **THEN** 每个文件包含结构化内容（关键词、核心议题、教学要点），且内容与对应录音/详解主题一致

## MODIFIED Requirements

### Requirement: 子智能体纪要提取流程
之前 spec 中 Task 12 标记为"已完成（录音整理中已整合纪要内容）"，但实际上纪要的 .md 物理文件从未创建。需要重新派遣子智能体，从 .docx 文件提取纪要内容。

#### Scenario: .docx 智能纪要提取
- **WHEN** 子智能体读取 .docx 智能纪要文件
- **THEN** 提取结构化内容（关键词、议题、要点），输出到对应 .md 文件

#### Scenario: 无 .docx 章节的纪要生成
- **WHEN** ch01/ch10 无 .docx 智能纪要
- **THEN** 子智能体基于已整理的录音文件和详解文件综合生成纪要内容
