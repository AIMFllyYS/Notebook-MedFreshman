# Tasks

## PADC 流程定义

本任务遵循 PADC（Plan → Assign → Delegate → Check）流程：
- **Plan**：主线规划任务边界、输入输出、验收标准
- **Assign**：主线派遣子智能体，提供完整上下文
- **Delegate**：子智能体独立实施，完成后返回总结
- **Check**：主线审查+测试，发现问题则派遣修复子智能体

## 子智能体交接规范

每个子智能体任务描述 MUST 包含：
1. **任务目标**：明确要做什么
2. **输入上下文**：相关文件路径、当前代码状态、依赖关系
3. **边界划定**：明确不做什么、哪些文件不能动
4. **验收标准**：可验证的完成条件
5. **验证方式**：TypeScript编译命令、功能检查点

---

## Phase 1: 链接修复（基础层）

### Task 1.1: Store 增加多科状态
- [x] 修改 `lib/store.ts`，增加 `activeSubjectId: SubjectId` 状态（默认 `"probability"`）和 `setActiveSubject` 方法
- [x] 修改 `setActiveSection` 签名为 `setActiveSection(subjectId: SubjectId, chapterId: string, sectionId: string)`
- [x] 保持向后兼容：现有读取 `activeChapterId/activeSectionId` 的代码无需改动

**验收**：TypeScript 编译通过，store 新增字段可读写。

### Task 1.2: ContentPageClient 同步路由到 Store
- [x] 修改 `app/[subject]/[category]/[id]/ContentPageClient.tsx`
- [x] 在 `useEffect` 中调用 `setActiveSection(subjectId, chapterId, itemId)`
- [x] chapterId 转换逻辑：itemId 如 "1.1" → chapterId "ch01"（保留现有 `app/api/section/route.ts` 中的转换逻辑参考）
- [x] 仅当 categoryId 为 "detail" 时同步（教材/录音/纪要不联动右侧面板）

**验收**：访问 `/probability/detail/1.2` 时，store 的 activeSectionId 变为 "1.2"。

### Task 1.3: RightPanel 去硬编码
- [x] 修改 `components/layout/RightPanel.tsx`
- [x] `chatContext` 从 store 读取 `activeSubjectId/activeChapterId/activeSectionId`，去除第43行硬编码 `subjectId: "probability"`
- [x] `currentTopic` 改为更有意义的格式（如 `${subjectName} ${chapterId} ${sectionId}`）

**验收**：切换学科路由时，chatContext 的 subjectId 随之变化。

### Task 1.4: VideoTab/InteractiveTab 多科化
- [x] 修改 `components/video/VideoTab.tsx`，从 store 读取 `activeSubjectId`，调用 `getVideosForSection(subjectId, chapterId, sectionId)`
- [x] 修改 `components/interactives/InteractiveTab.tsx`，从 store 读取 `activeSubjectId`，调用 `getInteractivesForSection(subjectId, chapterId, sectionId)`
- [x] 空状态文案保持通用（不硬编码"概率论"）

**验收**：切换路由时，右侧面板 Tab 内容随路由联动。

**Phase 1 依赖**：Task 1.2 依赖 1.1；Task 1.3/1.4 依赖 1.1。

---

## Phase 2: 类型与数据结构扩展

### Task 2.1: VideoEntry 增加 subjectId
- [x] 修改 `lib/content/types.ts`，`VideoEntry` 增加 `subjectId: SubjectId` 字段
- [x] 修改 `content/media.generated.ts`，为现有所有视频条目补充 `subjectId: "probability"`
- [x] 修改 `content/media.ts`，`getVideosForSection` 签名改为 `(subjectId, chapterId, sectionId)`
- [x] 修改 `getVideo` 保持不变（按 id 查询，id 已唯一）

**验收**：TypeScript 编译通过，`getVideosForSection("probability", "ch01", "1.1")` 返回正确视频。

### Task 2.2: InteractiveMeta 增加 subjectId
- [x] 修改 `components/interactives/registry.ts`
- [x] `InteractiveMeta` 增加 `subjectId: SubjectId` 字段
- [x] `getInteractivesForSection` 签名改为 `(subjectId, chapterId, sectionId)`
- [x] `getInteractive` 保持不变（按 id 查询）
- [x] 现有34个条目补充 `subjectId: "probability"`（此任务仅改类型和查询函数，不改路径，路径迁移在 Phase 3）

**验收**：TypeScript 编译通过，`getInteractivesForSection("probability", "ch01", "1.1")` 返回正确组件。

**Phase 2 依赖**：无（可与 Phase 1 并行，但 Phase 1.4 调用新签名需等 2.1/2.2 完成，或同步协调）。

---

## Phase 3: 概率论组件路径平移

### Task 3.1: 创建 probability 子目录并平移组件
- [x] 创建 `components/interactives/probability/` 目录
- [x] 将 `components/interactives/ch01/` ~ `ch08/` 共8个目录平移到 `components/interactives/probability/ch01/` ~ `ch08/`
- [x] 组件代码内容零改动（仅目录路径变化）
- [x] 更新 `registry.ts` 中所有 `dynamic(() => import("./ch01/..."))` 为 `import("./probability/ch01/...")`

**验收**：TypeScript 编译通过，正文 `::interactive` 指令渲染正常，右侧面板「可交互」Tab 显示正常。

### Task 3.2: 清理旧版 NotesPane
- [ ] 删除 `components/notes/NotesPane.tsx`（用户选择保留，跳过删除）
- [x] 全局搜索确认无其他文件引用 NotesPane（预期无引用）

**验收**：TypeScript 编译通过，无残留引用。

**Phase 3 依赖**：Task 3.1 依赖 Phase 2.2（类型已扩展）。

---

## Phase 4: 公共可视化原语层

### Task 4.1: 创建原语目录与 VennDiagram 原语
- [x] 创建 `components/visualizations/primitives/` 目录
- [x] 创建 `components/visualizations/primitives/VennDiagram.tsx`
- [x] Props: `{ a?: number; b?: number; ab?: number; interactive?: boolean; onChange?: (a,b,ab) => void }`
- [x] 静态模式（`interactive=false`）：纯 SVG 渲染固定参数维恩图 + 概率数值展示
- [x] 交互模式（`interactive=true`）：滑块调 P(A)/P(B)/P(A∩B) + 实时联动 + 概率约束（P(AB) ≤ min(P(A),P(B))，P(A)+P(B)-P(AB) ≤ 1）
- [x] 参考 `docs/refer/dist/src/components/AI/ChatMessageVisualizations.tsx` 第1-100行的 Mafs 实现逻辑（但原语用纯 SVG，不依赖 Mafs，降低 bundle 体积）
- [x] 使用 MD3 token 颜色变量，不硬编码颜色

**验收**：原语可独立渲染，静态/交互两种模式均正常工作。

### Task 4.2: 创建 DistributionChart 原语
- [x] 创建 `components/visualizations/primitives/DistributionChart.tsx`
- [x] Props: `{ type: 'normal'|'binomial'|'poisson'; params?: {mu?,sigma?,n?,p?,lambda?}; interactive?: boolean }`
- [x] 静态模式：纯 SVG 渲染固定参数分布图
- [x] 交互模式：滑块调参 + 实时更新曲线/柱状图
- [x] normal: PDF 曲线；binomial/poisson: 柱状图
- [x] 参考 `docs/refer/dist/src/components/AI/ChatMessageVisualizations.tsx` 的分布图逻辑
- [x] 不依赖 Recharts/Mafs（纯 SVG），降低 bundle

**验收**：三种分布类型均能渲染，交互模式滑块联动正常。

### Task 4.3: 创建 FormulaSteps 原语
- [x] 创建 `components/visualizations/primitives/FormulaSteps.tsx`
- [x] Props: `{ steps: string[]; interactive?: boolean }`
- [x] 静态模式：编号步骤列表（每步用 KaTeX 渲染 LaTeX）
- [x] 交互模式：上一步/下一步按钮导航 + 当前步骤高亮 + KaTeX 渲染
- [x] 使用 `react-katex` 或现有 remark-math 的 KaTeX 实例渲染公式
- [x] 步骤分隔：传入 `string[]`，每元素是一步（含 LaTeX）

**验收**：含 LaTeX 的步骤正确渲染，交互模式导航正常。

### Task 4.4: 创建 VideoPlayer 原语
- [x] 创建 `components/visualizations/primitives/VideoPlayer.tsx`
- [x] Props: `{ src: string; title?: string; poster?: string }`
- [x] 渲染 HTML5 `<video>` 播放器（播放/暂停/进度条/音量）
- [x] 支持点击「小窗播放」按钮调用 `useStore.openPip`（复用现有 PiP 机制）
- [x] 参考 `docs/refer/dist/src/components/AI/ChatMessageVisualizations.tsx` 的 ManimPlayer 实现

**验收**：视频可播放，小窗播放按钮正常调用 PiP。

### Task 4.5: 创建原语统一导出
- [x] 创建 `components/visualizations/primitives/index.ts`
- [x] 导出 VennDiagram, DistributionChart, FormulaSteps, VideoPlayer
- [x] 创建 `components/visualizations/index.ts` 重导出

**验收**：`import { VennDiagram } from "@/components/visualizations"` 可正常导入。

**Phase 4 依赖**：无（可与 Phase 3 并行）。

---

## Phase 5: 正文侧组件复用原语

### Task 5.1: VennPlayground 改用 VennDiagram 原语
- [x] 修改 `components/interactives/probability/ch01/VennPlayground.tsx`
- [x] 内部逻辑改为使用 `VennDiagram` 原语的交互模式
- [x] 保留 VennPlayground 特有的「运算切换」（并/交/差/补/对称差/德摩根律）逻辑，作为原语上层的封装
- [x] 扩展 VennDiagram 原语增加 highlightMode/highlightRegions props 支持运算高亮

**验收**：VennPlayground 功能不退化，维恩图绘制与原语共享代码。

### Task 5.2: 其他可复用组件评估与改造
- [x] 评估 `BinomialExplorer`、`PDFExplorer`、`CDFVisualizer` 等是否可改用 `DistributionChart` 原语
- [x] 评估结论：三组件均保留独立实现（原语功能不足，各有特色功能）
- [x] 此任务为「尽力而为」，不强求所有组件都改用原语，优先保证不退化

**验收**：改造的组件功能不退化，未改造的组件保持原样。

**Phase 5 依赖**：Task 5.1 依赖 Phase 4.1；Task 5.2 依赖 Phase 4.2。

---

## Phase 6: AI对话侧组件统一

### Task 6.1: ChatMessageVisualizations 改用原语
- [x] 修改 `components/chat/ChatMessageVisualizations.tsx`
- [x] 删除内部的 `InlineVenn/InlineDistribution/FormulaSteps/ManimPlayer` 实现
- [x] `TAG_MAP` 映射改为原语组件：
  - `InteractiveVenn` → `VennDiagram`（默认静态，`interactive` prop 控制模式）
  - `InlineDistribution` → `DistributionChart`
  - `FormulaSteps` → `FormulaSteps` 原语
  - `ManimPlayer` → `VideoPlayer` 原语
- [x] Props 透传：AI 输出的 XML 属性透传给原语（含类型转换）

**验收**：AI 对话中的可视化标签正常渲染，功能不退化（相比当前占位版是增强）。

### Task 6.2: 富交互功能验证
- [x] 验证 `<InteractiveVenn a="0.6" b="0.5" ab="0.2" interactive="true" />` 渲染交互版
- [x] 验证 `<InlineDistribution type="normal" />` 渲染正态分布
- [x] 验证 `<FormulaSteps>步骤1: $E(X)=\sum x_i p_i$</FormulaSteps>` 的 KaTeX 渲染
- [x] 验证 `<ManimPlayer src="/media/videos/ch01/ch01-1.1-sample-space.mp4" />` 视频播放

**验收**：4种标签均正常工作，富交互功能达到旧项目 `docs/refer/dist` 水平。

**Phase 6 依赖**：Task 6.1 依赖 Phase 4 全部完成。

---

## Phase 7: SOP文档与多科接入验证

### Task 7.1: 撰写多科接入SOP文档
- [x] 创建 `docs/sop/subject-onboarding.md`
- [x] 内容包含：
  1. 目录结构规范（`interactives/{subject}/{chapter}/`、`content/{subject}/`、`public/media/videos/{subject}/`）
  2. registry 注册步骤（InteractiveMeta 字段说明 + 示例）
  3. media 清单格式（VideoEntry 字段 + media.generated.ts 编辑说明）
  4. Markdown 指令用法（`::interactive{id=}` / `::video{id=}`）
  5. 原语组件复用指南（VennDiagram/DistributionChart/FormulaSteps/VideoPlayer 的 Props 与模式）
  6. AI 对话 XML 标签扩展方法（TAG_MAP 扩展）
  7. 完整接入示例（以 physics 学科为例的端到端流程）

**验收**：文档内容完整，开发者可按文档独立接入新学科。

### Task 7.2: 验证概率论端到端链接
- [x] 访问 `/probability/detail/1.1`，验证：
  - 正文 Markdown 渲染正常（含 callout/video/interactive 指令）
  - 右侧面板「动画讲解」Tab 显示 1.1 节视频
  - 右侧面板「可交互」Tab 显示 1.1 节交互组件
  - AI 对话上下文为 1.1 节
- [x] 切换到 `/probability/detail/2.2`，验证右侧面板联动
- [x] 在 AI 对话中触发可视化标签，验证原语渲染

**验收**：概率论详解板块完整链接，无断裂。

**Phase 7 依赖**：Task 7.1 依赖 Phase 1-6 全部完成；Task 7.2 依赖 7.1。

---

## Phase 8: 最终审查与测试

### Task 8.1: TypeScript 编译验证
- [x] 运行 `npx tsc --noEmit`
- [x] 修复所有编译错误
- [x] 确认零错误

**验收**：TypeScript 编译零错误。

### Task 8.2: 功能回归测试
- [x] 概率论详解板块全功能验证（正文/视频/交互/AI对话）
- [x] 右侧面板路由联动验证
- [x] AI 对话可视化标签验证
- [x] 多科路由切换验证（访问其他学科路由不崩溃）

**验收**：所有功能正常，无回归。

### Task 8.3: 架构审查
- [x] 审查 registry 多科分组是否合理
- [x] 审查原语层抽象是否恰当（不过度抽象）
- [x] 审查 SOP 文档是否可操作
- [x] 审查是否有遗留的硬编码 probability
- [ ] 所有文件行数不超过300行（VennDiagram 437行、DistributionChart 428行超标，低优先级）

**验收**：架构合理，无技术债（文件行数超标为低优先级，不阻塞交付）。

**Phase 8 依赖**：依赖 Phase 1-7 全部完成。

---

# Task Dependencies

- **Phase 1**（链接修复）：Task 1.1 → 1.2/1.3/1.4
- **Phase 2**（类型扩展）：Task 2.1/2.2 可并行（Phase 1.4 调用新签名需协调）
- **Phase 3**（路径平移）：Task 3.1 依赖 Phase 2.2；Task 3.2 独立
- **Phase 4**（原语层）：Task 4.1-4.5 可并行（独立于 Phase 1-3）
- **Phase 5**（正文复用）：Task 5.1 依赖 4.1；Task 5.2 依赖 4.2
- **Phase 6**（AI对话统一）：Task 6.1 依赖 Phase 4；Task 6.2 依赖 6.1
- **Phase 7**（SOP+验证）：Task 7.1 依赖 Phase 1-6；Task 7.2 依赖 7.1
- **Phase 8**（最终审查）：依赖 Phase 1-7

## 并行调度建议

主线可同时派遣的子智能体：
- **批次1**（Phase 1 + Phase 2 + Phase 4）：3个子智能体并行
  - 子智能体A：Phase 1 链接修复（Task 1.1-1.4）
  - 子智能体B：Phase 2 类型扩展（Task 2.1-2.2）
  - 子智能体C：Phase 4 原语层（Task 4.1-4.5）
- **批次2**（Phase 3 + Phase 5 + Phase 6）：3个子智能体并行
  - 子智能体D：Phase 3 路径平移（Task 3.1-3.2）
  - 子智能体E：Phase 5 正文复用（Task 5.1-5.2）
  - 子智能体F：Phase 6 AI对话统一（Task 6.1-6.2）
- **批次3**（Phase 7 + Phase 8）：顺序执行
  - 子智能体G：Phase 7 SOP+验证
  - 子智能体H：Phase 8 最终审查
