# Checklist

## Phase 1: 链接修复

- [x] `lib/store.ts` 新增 `activeSubjectId: SubjectId` 状态字段（默认 `"probability"`）
- [x] `lib/store.ts` 新增 `setActiveSubject` 方法
- [x] `lib/store.ts` 的 `setActiveSection` 签名改为 `(subjectId, chapterId, sectionId)`
- [x] `app/[subject]/[category]/[id]/ContentPageClient.tsx` 在 useEffect 中调用 `setActiveSection`
- [x] ContentPageClient 的 chapterId 转换逻辑正确（itemId "1.1" → chapterId "ch01"）
- [x] ContentPageClient 仅当 categoryId 为 "detail" 时同步 store
- [x] `components/layout/RightPanel.tsx` 的 chatContext 从 store 读取 subjectId（去除第43行硬编码）
- [x] `components/video/VideoTab.tsx` 从 store 读取 activeSubjectId
- [x] `components/interactives/InteractiveTab.tsx` 从 store 读取 activeSubjectId
- [x] 访问 `/probability/detail/1.2` 时，store 的 activeSectionId 变为 "1.2"
- [x] 切换路由时，右侧面板 Tab 内容随路由联动

## Phase 2: 类型与数据结构扩展

- [x] `lib/content/types.ts` 的 `VideoEntry` 增加 `subjectId: SubjectId` 字段
- [x] `content/media.generated.ts` 所有视频条目补充 `subjectId: "probability"`
- [x] `content/media.ts` 的 `getVideosForSection` 签名改为 `(subjectId, chapterId, sectionId)`
- [x] `components/interactives/registry.ts` 的 `InteractiveMeta` 增加 `subjectId: SubjectId` 字段
- [x] `registry.ts` 现有34个条目补充 `subjectId: "probability"`
- [x] `registry.ts` 的 `getInteractivesForSection` 签名改为 `(subjectId, chapterId, sectionId)`
- [x] `getVideo` 和 `getInteractive`（按 id 查询）保持不变
- [x] TypeScript 编译通过

## Phase 3: 概率论组件路径平移

- [x] 创建 `components/interactives/probability/` 目录
- [x] `ch01/` ~ `ch08/` 共8个目录平移到 `interactives/probability/` 下
- [x] 组件代码内容零改动（仅目录路径变化）
- [x] `registry.ts` 所有 `import("./ch01/...")` 更新为 `import("./probability/ch01/...")`
- [x] 正文 `::interactive{id=ch01-1.1-events}` 指令渲染正常
- [x] 右侧面板「可交互」Tab 显示正常
- [ ] `components/notes/NotesPane.tsx` 已删除（用户选择保留，未删除）
- [x] 全局搜索确认无 NotesPane 残留引用
- [x] TypeScript 编译通过

## Phase 4: 公共可视化原语层

- [x] 创建 `components/visualizations/primitives/` 目录
- [x] `VennDiagram.tsx` 创建完成
- [x] VennDiagram 静态模式（interactive=false）正常渲染固定参数维恩图
- [x] VennDiagram 交互模式（interactive=true）滑块调 P(A)/P(B)/P(A∩B) 正常
- [x] VennDiagram 概率约束逻辑正确（P(AB) ≤ min(P(A),P(B))，P(A)+P(B)-P(AB) ≤ 1）
- [x] VennDiagram 使用 MD3 token 颜色变量（不硬编码颜色）
- [x] VennDiagram 不依赖 Mafs（纯 SVG 实现）
- [x] `DistributionChart.tsx` 创建完成
- [x] DistributionChart 支持 normal/binomial/poisson 三种类型
- [x] DistributionChart 静态模式渲染固定参数分布图
- [x] DistributionChart 交互模式滑块调参正常
- [x] DistributionChart 不依赖 Recharts/Mafs（纯 SVG）
- [x] `FormulaSteps.tsx` 创建完成
- [x] FormulaSteps 静态模式渲染编号步骤列表
- [x] FormulaSteps 每步的 LaTeX 公式用 KaTeX 正确渲染
- [x] FormulaSteps 交互模式提供上一步/下一步导航
- [x] `VideoPlayer.tsx` 创建完成
- [x] VideoPlayer 渲染 HTML5 `<video>` 播放器
- [x] VideoPlayer 支持播放/暂停/进度条
- [x] VideoPlayer 小窗播放按钮调用 `useStore.openPip`
- [x] `components/visualizations/primitives/index.ts` 统一导出4个原语
- [x] `components/visualizations/index.ts` 重导出
- [x] `import { VennDiagram } from "@/components/visualizations"` 可正常导入
- [x] TypeScript 编译通过

## Phase 5: 正文侧组件复用原语

- [x] `components/interactives/probability/ch01/VennPlayground.tsx` 改用 VennDiagram 原语
- [x] VennPlayground 功能不退化（运算切换：并/交/差/补/对称差/德摩根律）
- [x] VennPlayground 维恩图绘制部分与原语共享代码
- [x] 评估 BinomialExplorer/PDFExplorer/CDFVisualizer 等是否可改用 DistributionChart 原语
- [x] 改造的组件功能不退化
- [x] 未改造的组件保持原样（不强求全部改用原语）
- [x] TypeScript 编译通过

## Phase 6: AI对话侧组件统一

- [x] `components/chat/ChatMessageVisualizations.tsx` 删除内部 InlineVenn/InlineDistribution/FormulaSteps/ManimPlayer 实现
- [x] TAG_MAP 映射改为原语组件
- [x] `InteractiveVenn` → VennDiagram 原语（默认静态，interactive prop 控制模式）
- [x] `InlineDistribution` → DistributionChart 原语
- [x] `FormulaSteps` → FormulaSteps 原语
- [x] `ManimPlayer` → VideoPlayer 原语
- [x] AI 输出的 XML 属性正确透传给原语
- [x] `<InteractiveVenn a="0.6" b="0.5" ab="0.2" interactive="true" />` 渲染交互版
- [x] `<InlineDistribution type="normal" />` 渲染正态分布
- [x] `<FormulaSteps>步骤1: $E(X)=\sum x_i p_i$</FormulaSteps>` 的 KaTeX 渲染正常
- [x] `<ManimPlayer src="/media/videos/ch01/ch01-1.1-sample-space.mp4" />` 视频播放正常
- [x] TypeScript 编译通过

## Phase 7: SOP文档与多科接入验证

- [x] `docs/sop/subject-onboarding.md` 创建完成
- [x] SOP 文档包含目录结构规范
- [x] SOP 文档包含 registry 注册步骤
- [x] SOP 文档包含 media 清单格式
- [x] SOP 文档包含 Markdown 指令用法
- [x] SOP 文档包含原语组件复用指南
- [x] SOP 文档包含 AI 对话 XML 标签扩展方法
- [x] SOP 文档包含完整接入示例（以 physics 为例）
- [x] 访问 `/probability/detail/1.1` 正文 Markdown 渲染正常
- [x] 访问 `/probability/detail/1.1` 右侧面板「动画讲解」显示 1.1 节视频
- [x] 访问 `/probability/detail/1.1` 右侧面板「可交互」显示 1.1 节交互组件
- [x] 访问 `/probability/detail/1.1` AI 对话上下文为 1.1 节
- [x] 切换到 `/probability/detail/2.2` 右侧面板联动
- [x] AI 对话中触发可视化标签，原语渲染正常
- [x] 访问其他学科路由（如 `/physics/detail/1.1`）不崩溃

## Phase 8: 最终审查与测试

- [x] `npx tsc --noEmit` 零错误
- [x] 概率论详解板块全功能验证（正文/视频/交互/AI对话）
- [x] 右侧面板路由联动验证
- [x] AI 对话可视化标签验证
- [x] 多科路由切换验证（访问其他学科路由不崩溃）
- [x] registry 多科分组结构合理
- [x] 原语层抽象恰当（不过度抽象）
- [x] SOP 文档可操作
- [x] 无遗留的硬编码 probability（除 probability-detail.ts 数据文件外）
- [x] 无残留的 NotesPane 引用
- [ ] 所有文件行数不超过300行（VennDiagram.tsx=437行、DistributionChart.tsx=428行 超出）

## 架构完整性检查

- [x] 路由 → store → 右侧面板 完整链路畅通
- [x] 正文 Markdown 指令 → registry → 交互组件 完整链路畅通
- [x] AI 对话 XML 标签 → 原语 → 渲染 完整链路畅通
- [x] 正文可视化组件与 AI 对话可视化组件共享原语层
- [x] 多科接入有标准化 SOP 文档
- [x] 概率论现有内容零损失（34组件 + 33视频 + 35 Markdown 完整保留）
