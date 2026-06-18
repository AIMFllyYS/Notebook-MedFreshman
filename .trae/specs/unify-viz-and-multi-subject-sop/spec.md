# 统一可视化与多学科SOP架构 Spec

## Why

项目已从「概率论单科」升级为「全科期末复习栈」（6科目4分类），但存在三个核心断裂：
1. **链接断裂**：`lib/store.ts` 的 `activeChapterId/activeSectionId` 永远是默认值 `"ch01"/"1.1"`，`setActiveSection` 从未被调用，导致右侧面板（动画讲解/可交互/AI对话上下文）始终显示 ch01/1.1，不随路由联动。
2. **学科硬编码**：`RightPanel.tsx` 第43行硬编码 `subjectId: "probability"`；`registry.ts` 的34个交互组件按 `ch01-ch08` 组织，无 subject 隔离层；`media.generated.ts` 的 `VideoEntry` 无 `subjectId` 字段。其他学科无法接入。
3. **两套可视化割裂**：正文侧（34个重型交互组件 + Markdown 指令渲染）与 AI 对话侧（4个简化占位组件 + XML 标签渲染）零代码共享，且 AI 对话侧的 `InlineVenn/InlineDistribution/FormulaSteps/ManimPlayer` 是降级版（丢失了旧项目 `docs/refer/dist` 中的 Mafs 滑块、Recharts 图表、KaTeX 步骤导航、真实视频播放）。

本 spec 通过**方案C（全面统一）**解决以上三个问题：修复链接、建立多科SOP架构、抽取公共可视化原语层统一两套组件。

## What Changes

### 链接修复
- `ContentPageClient.tsx` 在路由变化时同步 `setActiveSection(chapterId, sectionId)` 到 store
- `RightPanel.tsx` 的 `chatContext` 从 URL 路由读取 `subjectId/categoryId/itemId`，去除硬编码
- `VideoTab.tsx` / `InteractiveTab.tsx` 支持多科（通过 store 或路由读取 subjectId）

### 多科SOP架构
- **BREAKING** `InteractiveMeta` 增加 `subjectId: SubjectId` 字段
- **BREAKING** `VideoEntry` 增加 `subjectId: SubjectId` 字段
- **BREAKING** `registry.ts` 重构为按 subject 分组：`interactives/{subject}/{chapter}/` 目录结构
- 概率论现有34个组件零代码改动平移到 `interactives/probability/ch01-ch08/`
- `getInteractivesForSection` / `getVideosForSection` 增加 `subjectId` 参数
- `media.generated.ts` 为现有视频条目补充 `subjectId: "probability"`
- 建立 SOP 文档：其他学科接入的标准化步骤

### 公共可视化原语层
- 新建 `components/visualizations/primitives/` 目录
- 抽取4个原语组件，每个支持「静态模式」和「交互模式」：
  - `VennDiagram` — 维恩图（静态SVG / 交互滑块调参）
  - `DistributionChart` — 分布图（静态SVG / 交互调参，支持 normal/binomial/poisson）
  - `FormulaSteps` — 公式推导步骤（静态列表 / KaTeX渲染+步骤导航）
  - `VideoPlayer` — 视频播放（复用 PipPlayer）
- 正文侧的 `VennPlayground` 等组件改为使用原语的交互模式
- AI 对话侧的 `ChatMessageVisualizations` 改为使用原语（默认静态模式，可选交互）
- 迁移旧项目 `docs/refer/dist` 中的富交互功能（Mafs/Recharts/KaTeX）

### 清理
- 删除 `components/notes/NotesPane.tsx`（旧版 store 驱动笔记面板，已被 ContentPageClient 取代，无其他文件引用）

## Impact

- **Affected specs**: `upgrade-ai-chat-and-architecture`（AI对话可视化组件将被统一）
- **Affected code**:
  - `lib/store.ts` — 增加 subjectId 状态
  - `lib/types/content.ts` — ContentItem 无需改动（已有 subjectId 通过树结构隐含）
  - `lib/content/types.ts` — VideoEntry 增加 subjectId
  - `components/interactives/registry.ts` — 重构为多科分组
  - `components/interactives/ch01-ch08/` → `components/interactives/probability/ch01-ch08/`（路径平移）
  - `components/chat/ChatMessageVisualizations.tsx` — 改用原语
  - `components/notes/directives.tsx` — InteractiveEmbed 适配多科
  - `components/video/VideoTab.tsx` — 多科化
  - `components/interactives/InteractiveTab.tsx` — 多科化
  - `components/layout/RightPanel.tsx` — 去硬编码
  - `app/[subject]/[category]/[id]/ContentPageClient.tsx` — 同步路由到store
  - `content/media.generated.ts` — 补充 subjectId
  - `content/media.ts` — getVideosForSection 增加 subjectId 参数
  - 新建 `components/visualizations/primitives/` — 4个原语组件
  - 新建 `docs/sop/subject-onboarding.md` — 多科接入SOP

## ADDED Requirements

### Requirement: 路由与Store双向同步
系统 SHALL 在用户访问 `/[subject]/[category]/[id]` 路由时，自动将 `subjectId`、`chapterId`（从 itemId 转换）、`sectionId`（itemId）同步到全局 store，使右侧面板（动画讲解/可交互/AI对话上下文）随路由联动。

#### Scenario: 用户切换小节
- **WHEN** 用户从 `/probability/detail/1.1` 导航到 `/probability/detail/1.2`
- **THEN** store 的 `activeSubjectId` 更新为 `"probability"`，`activeChapterId` 更新为 `"ch01"`，`activeSectionId` 更新为 `"1.2"`
- **AND** 右侧面板的「动画讲解」Tab 显示 1.2 节的视频
- **AND** 右侧面板的「可交互」Tab 显示 1.2 节的交互组件
- **AND** AI对话的 `chatContext` 使用 1.2 节作为当前主题

#### Scenario: 用户切换学科
- **WHEN** 用户从 `/probability/detail/1.1` 导航到 `/physics/detail/2.1`
- **THEN** store 的 `activeSubjectId` 更新为 `"physics"`
- **AND** 右侧面板显示 physics 学科 2.1 节的内容（若有数据），否则显示空状态

### Requirement: 多科 registry 架构
系统 SHALL 采用按学科分组的 registry 架构，交互组件按 `interactives/{subject}/{chapter}/` 目录组织，每个 `InteractiveMeta` 条目携带 `subjectId` 字段。

#### Scenario: 概率论组件平移
- **WHEN** 重构完成后
- **THEN** 概率论的34个交互组件位于 `components/interactives/probability/ch01-ch08/`
- **AND** 每个组件的代码内容零改动（仅路径迁移）
- **AND** `registry.ts` 的 import 路径更新为新位置
- **AND** 正文中的 `::interactive{id=ch01-1.1-events}` 指令仍能正常渲染

#### Scenario: 其他学科接入
- **WHEN** 新学科（如 physics）需要接入交互组件
- **THEN** 开发者按 SOP 在 `components/interactives/physics/` 下创建组件
- **AND** 在 `registry.ts` 中追加条目（含 `subjectId: "physics"`）
- **AND** 正文 Markdown 中通过 `::interactive{id=physics-xxx}` 引用
- **AND** 右侧面板「可交互」Tab 自动显示该学科组件

### Requirement: 多科视频清单
系统 SHALL 在 `VideoEntry` 类型中增加 `subjectId` 字段，`getVideosForSection` 函数支持按 `subjectId + chapterId + sectionId` 三元组查询。

#### Scenario: 查询概率论视频
- **WHEN** 调用 `getVideosForSection("probability", "ch01", "1.1")`
- **THEN** 返回概率论 ch01/1.1 节的所有视频
- **AND** 不返回其他学科的视频

### Requirement: 公共可视化原语层
系统 SHALL 提供 `components/visualizations/primitives/` 目录，包含4个可复用原语组件，每个支持「静态模式」和「交互模式」两种渲染形态。

#### Scenario: 正文使用交互模式
- **WHEN** 正文 Markdown 中通过 `::interactive{id=ch01-1.2-venn}` 渲染维恩图
- **THEN** `VennPlayground` 组件内部使用 `VennDiagram` 原语的交互模式
- **AND** 用户可拖动滑块调节 P(A)/P(B)/P(A∩B)
- **AND** 维恩图实时联动更新

#### Scenario: AI对话使用静态模式
- **WHEN** AI 输出 `<InteractiveVenn a="0.6" b="0.5" ab="0.2" />` 标签
- **THEN** `ChatMessageVisualizations` 使用 `VennDiagram` 原语的静态模式渲染
- **AND** 显示固定参数的维恩图（无滑块）
- **AND** 与正文版共享同一套 SVG 渲染核心代码

#### Scenario: AI对话可选交互模式
- **WHEN** AI 输出 `<InteractiveVenn a="0.6" interactive="true" />`
- **THEN** 渲染交互模式（含滑块），用户可调参

### Requirement: 富交互功能迁移
系统 SHALL 迁移旧项目 `docs/refer/dist/src/components/AI/ChatMessageVisualizations.tsx` 中的富交互功能到新原语层，包括：
- `InlineVenn`：Mafs 渲染 + 滑块调 P(A)/P(B)/P(A∩B) + 概率联动计算
- `InlineDistribution`：Recharts 柱状图 + Mafs PDF 曲线 + 滑块调参（normal/binomial/poisson）
- `FormulaSteps`：KaTeX 渲染公式 + 上一步/下一步导航
- `ManimPlayer`：HTML5 `<video>` 实际播放 + PiP 小窗

#### Scenario: FormulaSteps 支持KaTeX
- **WHEN** AI 输出 `<FormulaSteps>步骤1: $E(X) = \sum x_i p_i$\\n步骤2: ...</FormulaSteps>`
- **THEN** 每个步骤中的 LaTeX 公式用 KaTeX 渲染
- **AND** 提供「上一步/下一步」按钮导航

#### Scenario: ManimPlayer 实际播放
- **WHEN** AI 输出 `<ManimPlayer src="/media/videos/ch01/ch01-1.1-sample-space.mp4" />`
- **THEN** 渲染 HTML5 `<video>` 播放器
- **AND** 支持播放/暂停/进度条
- **AND** 支持点击进入 PiP 小窗

### Requirement: 多科接入SOP文档
系统 SHALL 提供 `docs/sop/subject-onboarding.md` 文档，详细说明新学科接入的标准化步骤。

#### Scenario: 开发者按SOP接入新学科
- **WHEN** 开发者阅读 SOP 文档
- **THEN** 文档包含：目录结构规范、registry注册步骤、media清单格式、Markdown指令用法、原语组件复用指南、AI对话XML标签扩展方法
- **AND** 开发者能按文档独立完成新学科接入

## MODIFIED Requirements

### Requirement: 右侧面板多科化
`RightPanel.tsx` 的 `chatContext` SHALL 从 URL 路由（`usePathname` 解析或 props 传递）读取 `subjectId/categoryId/itemId`，不再硬编码 `"probability"`。`VideoTab` 和 `InteractiveTab` SHALL 通过 store 的 `activeSubjectId` 或 props 获取当前学科。

### Requirement: Store 多科状态
`lib/store.ts` SHALL 增加 `activeSubjectId: SubjectId` 状态字段和 `setActiveSubject` 方法，与 `activeChapterId/activeSectionId` 一起由路由同步。

### Requirement: ChatMessageVisualizations 统一
`components/chat/ChatMessageVisualizations.tsx` SHALL 改为使用 `components/visualizations/primitives/` 中的原语组件，不再维护独立的 `InlineVenn/InlineDistribution/FormulaSteps/ManimPlayer` 实现。原语默认静态模式，通过 `interactive` prop 切换交互模式。

## REMOVED Requirements

### Requirement: NotesPane 旧版笔记面板
**Reason**: `components/notes/NotesPane.tsx` 是旧版 store 驱动的笔记面板，使用旧版 API（`?chapterId=...&sectionId=...`），已被 `ContentPageClient.tsx` 完全取代，无其他文件引用。
**Migration**: 直接删除，无功能损失。所有笔记渲染由 `ContentPageClient` + `NoteRenderer` 承担。
