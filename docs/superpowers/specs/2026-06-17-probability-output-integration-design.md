# 概率论详解板块整合 output 视频资源 · 设计文档

**日期**：2026-06-17
**状态**：已批准，进入实施
**范围**：第一批 ch01-ch03（对应项目第1章 6 个小节）

## 一、目标

把 `D:\new_project\subject\概率论与数理统计A视频\output` 中的 Manim 动画视频、知识点讲稿（KP md）、例题（EX md）整合到概率论详解板块：
- **KP md** → 视频栏每个视频下方的折叠"配套讲稿"
- **EX md** → 转换为项目指令格式，存入 `content/examples/`，在详解页"例题"tab 展示
- **MP4** → 复制到 `public/media/videos/`，注册到 `media.generated.ts`

## 二、决策汇总

| 决策点 | 选择 |
|---|---|
| KP md 处理 | 视频配套讲稿，放视频栏折叠菜单 |
| EX md 格式 | 转换为项目指令格式（:::example / :::pitfall 等）|
| KP md 挂载 | 内联到 VideoEntry.scriptMd 字段 |
| 视频复制 | 分批复制，第一批 ch01-ch03 |
| 例题展示 | 详解页 Tab 栏新增"例题" |

## 三、架构改动

### 3.1 数据流

**正文 Tab（不变）**：路由 → /api/section → content/chapters/ → NoteRenderer

**例题 Tab（新增）**：路由 → /api/examples?chapterId&sectionId → content/examples/ch{XX}/{sectionId}/ → 例题列表 → 点击单题 → NoteRenderer

**视频栏（改造）**：getVideosForSection → VideoTab 渲染卡片 → 卡片下方 `<details>` 折叠区 → NoteRenderer 渲染 v.scriptMd

### 3.2 文件改动

**新增**：
- `content/examples/ch{XX}/{sectionId}/EX{NN}_{名}.md`（转换后例题）
- `app/api/examples/route.ts`（例题列表 API）
- `components/examples/ExampleTab.tsx`（例题 tab 组件）
- `public/media/videos/ch{XX}/{KP|EX}_{名}.mp4`（视频文件）

**修改**：
- `lib/content/types.ts`：VideoEntry 增加 `scriptMd?: string`
- `content/media.generated.ts`：注册新视频条目（含 scriptMd）
- `components/video/VideoTab.tsx`：卡片 button→div，加折叠讲稿区
- `app/[subject]/[category]/[id]/ContentPageClient.tsx`：ContentTab 加 "examples"

## 四、EX md 转换规则

| EX md 原结构 | 转换目标 |
|---|---|
| `## 题目` | `:::example{label=题目标题}` |
| `## 解题思路` | `:::insight{label=解题思路}` |
| `## 详细解答` / `## 解答` | `:::derivation{label=详细解答}` |
| `## 关键公式` | `:::theorem{label=关键公式}` |
| `## 动画演示说明` | `::video{id=对应视频id}` |
| `## 易错点` 每条 | `:::pitfall{label=易错点N}` |
| `## 答案汇总` / `## 结果汇总` | 保持普通 markdown 表格 |

## 五、第一批 ch01-ch03 映射表

### 5.1 KP → sectionId 映射

| output KP | 标题 | sectionId | 有 mp4 |
|---|---|---|---|
| ch01-KP01 | 随机实验 | 1.1 | 否 |
| ch01-KP02 | 样本空间 | 1.1 | 否 |
| ch01-KP03 | 随机事件 | 1.1 | 否 |
| ch01-KP04 | 包含关系 | 1.2 | 否 |
| ch01-KP05 | 和事件 | 1.2 | 是 |
| ch01-KP06 | 积事件 | 1.2 | 是 |
| ch01-KP07 | 差事件 | 1.2 | 是 |
| ch01-KP10 | 对称差 | 1.2 | 是 |
| ch01-KP11 | 运算律 | 1.2 | 是 |
| ch02-KP01 | σ域 | 1.6 | 是 |
| ch02-KP03 | 概率性质 | 1.6 | 否 |
| ch02-KP04 | 频率定义 | 1.3 | 否 |
| ch02-KP05 | 古典概型 | 1.4 | 否 |
| ch02-KP06 | 几何概型 | 1.4 | 否 |
| ch02-KP07 | 条件概率 | 1.5 | 否 |
| ch03-KP03 | 划分 | 1.5 | 是 |

### 5.2 EX → sectionId 映射

| output EX | 标题 | sectionId | 有 mp4 |
|---|---|---|---|
| ch01-EX02 | 事件关系 | 1.2 | 否 |
| ch01-EX05 | 双骰子 | 1.2 | 是 |
| ch02-EX01 | 扑克牌 | 1.4 | 是 |
| ch02-EX02 | 生日问题 | 1.4 | 是 |
| ch02-EX03 | 投点入圆 | 1.4 | 是 |
| ch02-EX04 | 投点入圆(π) | 1.4 | 否 |
| ch03-EX01 | 补球摸球 | 1.5 | 否 |

## 六、React Best Practices 注意

- `bundle-dynamic-imports`：NoteRenderer 在折叠区懒加载
- `rerender-no-inline-components`：例题卡片提取到模块顶层
- `server-serialization`：例题 API 最小化返回数据
- `async-parallel`：例题列表加载用 Promise.all
