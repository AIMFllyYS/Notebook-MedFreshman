# 有机化学 · 内容整合与系统化 Spec

## Why

项目中 `chemistry`（有机化学）学科目前在 `content/manifest.ts` 中仅有空占位（detail/recording/summary 三类 `items: []`），且 `name` 与 `lib/constants/subjects.ts` 存在「大学化学/有机化学」命名矛盾。`D:\飞书文档保存\有机化学课程及录音` 中已积累 **20 个课堂逐字稿（.txt）** 与 **19 个智能纪要（.docx，内嵌分子结构图/反应机理图）**，覆盖约 25 讲（缺第 18、20、22、23、24 讲）。需将这些原始材料系统整合，使该学科具备完整的「录音 → 纪要 → 详解 → 例题 → 交互 → 视频」链路，与概率论学科形成对等乃至更丰富的学习体验。

## What Changes

- **修复** `content/manifest.ts`：`chemistry.name` 由「大学化学」改为「有机化学」，填充 detail/recording/summary 三类条目
- **新建** `content/organic-chemistry-detail.ts`：14 章详解 `ContentItem[]` + 录音/纪要源文件映射 + 章节源讲次映射
- **新建** `content/chemistry/{recording,summary,detail}/` 目录树与内容 `.md`
- **新建** `content/examples/chemistry/{chapterId}/{sectionId}/` 例题（学科命名空间，防与概率论 ch01 冲突）
- **新建** `components/interactives/chemistry/` 化学交互组件，注册进 `registry.ts`
- **新建** `manim/chemistry/` chanim 脚本 + `public/media/videos/chemistry/` 渲染产物 + `media.generated.ts` 条目
- **新建** `public/images/chemistry/` 由 docx 提取的图片
- **改造管线（化学特有）**：
  - `components/notes/NoteRenderer.tsx` 引入 `katex/contrib/mhchem`（支持 `\ce{}` 化学式）
  - `app/api/examples/route.ts` + `components/examples/ExampleTab.tsx`：例题路径学科命名空间化
  - `scripts/extract-docx-images.mjs`：docx 内嵌图片提取工具

## Impact

- Affected specs：无前置依赖；与 `unify-viz-and-multi-subject-sop` 的多科架构兼容
- Affected code：
  - `content/manifest.ts`、`content/organic-chemistry-detail.ts`（新建）
  - `components/notes/NoteRenderer.tsx`（加 mhchem）
  - `app/api/examples/route.ts`、`components/examples/ExampleTab.tsx`（例题命名空间）
  - `components/interactives/registry.ts`（追加 chemistry 注册）
  - `content/media.generated.ts`（追加 chemistry 视频）
- 向后兼容：概率论详解/例题/视频路径不受影响（例题 API 对 probability 回退旧路径）

## 章节结构规划（14 章 ~42 小节）

| 章 ID | 章标题 | 源讲次 |
|-------|--------|--------|
| ch01 | 绪论与有机化学基础 | 1, 2 |
| ch02 | 有机化合物的命名 | 3 |
| ch03 | 分子结构与分子间作用力 | 4 |
| ch04 | 烷烃与环烷烃 | 5, 6, 8 |
| ch05 | 电子效应 | 6, 7, 8 |
| ch06 | 烯烃 | 9, 13 |
| ch07 | 炔烃与共轭二烯烃 | 10, 13 |
| ch08 | 芳香化合物 | 10, 11, 21 |
| ch09 | 立体化学与手性 | 12 |
| ch10 | 卤代烃 | 14, 15 |
| ch11 | 醇、酚、醚 | 16 |
| ch12 | 醛和酮 | 17 |
| ch13 | 羧酸及其衍生物 | 19 |
| ch14 | 含氮化合物与杂环 | 21, 25 |

小节明细见 `content/organic-chemistry-detail.ts`。源文件↔条目映射见同文件 `organicChemistryRecordings`、`organicChemistrySummaries`、`organicChemistryChapterSources`。

**缺讲处理**：第 18/20/22-24 讲缺失，相关内容已被相邻讲次大量覆盖；个别天然产物深度（脂类/甾族/核酸）无源材料处**标注「源材料缺失」，不编造**。

## 内容分类与映射

### 录音（recording）
20 个逐字稿 → `content/chemistry/recording/rec-NN.md`。保留说话人/时间戳结构，清理课前杂谈与无关闲聊，保留教学主体。

### 纪要（summary）
19 份 docx（第15讲无）→ 先用 `scripts/extract-docx-images.mjs` 抽内嵌图片到 `public/images/chemistry/lesson-NN/`，再生成 `content/chemistry/summary/sum-NN.md`：结构化要点（关键词/议题/要点）+ 在合适处 `![](...)` 引用图片。

### 详解（detail）
核心产出。每章子智能体输入「该章精简录音 + 纪要」，按 SOP 笔记合同产出各小节 `content/chemistry/detail/{sectionId}.md`：
- 结构：直觉/动机 → 定义(`:::definition`) → 为什么(`:::insight`) → 性质/机理(`:::theorem`/`:::derivation`) → 例题(`:::example`) → 易错点(`:::pitfall`) → 小结(`:::note`)
- 化学式用 KaTeX-mhchem：`$\ce{CH3COOH}$`、`$\ce{A ->[条件] B}$`
- 每小节 ≥1500 字；预留 `::video{id=...}`、`::interactive{id=...}` 锚点
- 强调：反应机理、电子转移、立体化学、构效关系

### 例题（examples）
每小节 3-5 题（结构推导/命名/机理解释/选择/简答），存 `content/examples/chemistry/{chapterId}/{sectionId}/EX{n}_*.md`。

### 交互（interactive）
每章 1-2 个自包含 React 组件（`memo` + framer-motion + SVG，无 props），存 `components/interactives/chemistry/{chapterId}/`，注册进 `registry.ts`（`subjectId:'chemistry'`）。

### 视频（video）
每章 1-2 个 Manim+chanim 动画，脚本 `manim/chemistry/{chapterId}/scene_*.py`，产物 `public/media/videos/chemistry/{chapterId}/{id}.mp4`，登记 `media.generated.ts`。

## 子智能体使用策略

### 防上下文污染原则
单逐字稿 6-7 万字，必须子智能体单文件隔离处理，主控不读全文。**按顺序分批派遣，每批 ≤3-4 个**。共享文件（manifest.ts / organic-chemistry-detail.ts / registry.ts / media.generated.ts）**只由主控串行更新**。

### 子智能体 Task 模板
```
你是有机化学课程内容整合助手。任务：将以下材料整合为[录音稿/纪要/详解/例题/交互/Manim脚本]。

关键约束（防幻觉）：
1. 所有化学事实（反应、机理、产物、条件、命名）必须严格基于提供的源材料，禁止编造。
2. 源材料是语音转文字，有识别错误（化学名词/数字），按上下文合理修正；不确定标 [存疑]。
3. 化学式/反应式用 KaTeX-mhchem：$\ce{...}$、$\ce{A ->[条件] B}$。
4. 复杂骨架式若材料含图，引用 public/images/chemistry/ 下对应图片，不可凭空画错结构。
5. 例题每题须标 [出处: 第X讲/X.X节]。

源材料：[仅粘贴单文件/单章内容]
输出格式：[具体格式与文件路径]
```

## 边界与限制

### 不在本次范围内
- 教材分类内容（无电子版教材，保留 stub）
- 缺讲（18/20/22-24）对应的深度专题（脂类/甾族/核酸），无源材料不编造
- AI 对话 XML 化学可视化标签扩展（后续可迭代）

### 化学学科特有约束
- **mhchem 渲染**：化学式统一用 `\ce{}`，复杂骨架式用图片
- **chanim 风险**：chemfig 宏包 + CJK 在 MiKTeX 下需先做最小渲染验证；通不过则该视频降级静态图，不阻塞文字三件套
- **防化学幻觉**：禁止虚构反应、错误方程式、错误机理或不存在的产物

## ADDED Requirements

### Requirement: 有机化学学科命名与结构
系统 SHALL 在内容树中以「有机化学」呈现 chemistry 学科，含详解（14 章）、录音（20 讲）、纪要（19 讲）三类内容。

#### Scenario: 用户展开有机化学导航
- **WHEN** 用户在左侧导航选择「有机化学」
- **THEN** 展示教材/详解/课上录音/课堂纪要四个分类，详解下有 14 章可展开

### Requirement: 有机化学录音分类内容
系统 SHALL 提供 20 讲课堂录音的精简逐字稿，路由 `/chemistry/recording/{recId}` 可访问。

#### Scenario: 用户访问录音
- **WHEN** 用户选择「课上录音」→ 某讲
- **THEN** 展示该讲精简逐字稿，保留教师讲解核心段落

### Requirement: 有机化学纪要分类内容（含图片）
系统 SHALL 提供 19 讲结构化纪要，含从 docx 提取的分子结构图/反应图。

#### Scenario: 用户访问含图纪要
- **WHEN** 用户选择「课堂纪要」→ 某讲
- **THEN** 展示结构化要点，分子结构图/反应机理图正常显示

### Requirement: 有机化学详解分类内容
系统 SHALL 提供 42 小节深度原创讲义，含 mhchem 化学式、指令块、嵌入的视频/交互锚点。

#### Scenario: 用户访问详解
- **WHEN** 用户选择「详解」→ 某章某节
- **THEN** 展示深度讲义，`\ce{}` 化学式正确渲染，`:::` 指令块样式正确

### Requirement: 有机化学例题（学科命名空间）
系统 SHALL 为详解小节提供基于源材料的例题，存于学科命名空间，不与概率论例题冲突。

#### Scenario: 用户访问例题 Tab
- **WHEN** 用户在化学详解页切换到「例题」Tab
- **THEN** 展示该节例题（每题标出处），且概率论例题不受影响

### Requirement: mhchem 化学式渲染
系统 SHALL 在 markdown 渲染中支持 `\ce{}` / `\pu{}` 化学式与反应式语法。

#### Scenario: 渲染化学反应式
- **WHEN** 详解 .md 含 `$\ce{2H2 + O2 -> 2H2O}$`
- **THEN** 页面渲染出带正确配平与箭头的反应式

### Requirement: 化学交互组件与 Manim 视频
系统 SHALL 为每章提供 1-2 个交互组件与 1-2 个动画视频，按 subjectId 隔离。

#### Scenario: 用户使用化学交互/视频
- **WHEN** 用户在某章详解页查看交互/视频
- **THEN** 交互组件可操作、视频可在 PiP 播放，且与概率论资源互不干扰

### Requirement: 子智能体防幻觉机制
系统 SHALL 确保所有详解与例题严格基于源材料，通过子智能体隔离防上下文污染。

#### Scenario: 子智能体生成内容
- **WHEN** 主控派遣子智能体
- **THEN** 子智能体仅接收单文件/单章源材料，输出严格基于源材料，例题标 `[出处]`
