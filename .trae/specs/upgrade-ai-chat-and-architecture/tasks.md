# Tasks - 期末复习栈升级

> **执行原则**: 主线负责调度+审查，子智能体负责实施。每个板块遵守完整 PADC 流程：
> - **P**lan: 主线明确板块目标、边界、输入输出
> - **A**ssign: 主线向子智能体下达精确任务指令（含参考代码、类型约束、文件路径）
> - **D**elegate: 子智能体独立实施，主线不干预细节
> - **C**heck: 板块完成后主线审查，有问题交给子智能体修复

---

## Phase 1: 基础设施与类型系统

- [x] Task 1: 创建统一类型定义与常量
  - [x] SubTask 1.1: 创建 `lib/types/content.ts` - 多科内容树类型（Subject、Category、Document、ContentTree）
  - [x] SubTask 1.2: 创建 `lib/types/chat.ts` - AI对话完整类型（ChatMessage、ToolCallBlock、ChatContext、ChatOptions、ParsedBlock）
  - [x] SubTask 1.3: 创建 `lib/types/tools.ts` - 工具类型（ToolDefinition、ToolResult、PAGE_CONTENT_TOOLS、WEB_SEARCH_TOOL）
  - [x] SubTask 1.4: 创建 `lib/constants/subjects.ts` - 科目列表与分类常量
  - [x] SubTask 1.5: 创建 `lib/constants/prompts.ts` - 快速提示模板与系统提示词模板
  - [x] SubTask 1.6: 升级 `app/globals.css` - Material Design 3 token 体系（参考 `docs/refer/dist/src/styles/theme.css`）

- [x] Task 2: 重构多科内容树
  - [x] SubTask 2.1: 重构 `content/manifest.ts` 为多科结构，概率论归入"详解"分类
  - [x] SubTask 2.2: 创建各科目占位内容结构
  - [x] SubTask 2.3: 创建 `content/index.ts` 统一内容导出

- [x] Task 3: 创建共享UI组件
  - [x] SubTask 3.1: 创建 `components/ui/IconButton.tsx`（参考 `docs/refer/dist/src/components/common/IconButton.tsx`）
  - [x] SubTask 3.2: 创建 `components/ui/Badge.tsx`（参考 `docs/refer/dist/src/components/common/Badge.tsx`）
  - [x] SubTask 3.3: 创建 `components/ui/DropdownMenu.tsx`（参考 `docs/refer/dist/src/components/common/DropdownMenu.tsx`）
  - [x] SubTask 3.4: 创建 `components/ui/Tooltip.tsx`（参考 `docs/refer/dist/src/components/common/Tooltip.tsx`）

**Phase 1 审查点**: 类型系统完整、内容树可遍历、UI组件可渲染、主题token生效

---

## Phase 2: VS Code风格文件夹树 + 路由重构

- [x] Task 4: 实现VS Code风格文件夹树
  - [x] SubTask 4.1: 创建 `components/layout/FileTree.tsx` - 核心树组件（递归渲染、展开/折叠、选中高亮、VS Code样式）
  - [x] SubTask 4.2: 创建 `components/layout/FileTreeItem.tsx` - 树节点组件（文件夹/文件图标、箭头、缩进、hover效果）
  - [x] SubTask 4.3: 创建 `components/layout/SubjectSidebar.tsx` - 科目侧边栏（标题"期末复习栈"、科目树、底部设置区）
  - [x] SubTask 4.4: 更新 Zustand store 添加文件夹树状态管理

- [x] Task 5: 重构路由系统
  - [x] SubTask 5.1: 创建 `app/[subject]/[category]/[id]/page.tsx` 动态路由页面
  - [x] SubTask 5.2: 更新 `app/page.tsx` 首页重定向
  - [x] SubTask 5.3: 更新 `components/layout/AppShell.tsx` 集成新Sidebar和路由

**Phase 2 审查点**: 文件夹树可交互、路由可导航、选中状态正确、VS Code视觉风格

---

## Phase 3: AI对话核心Hooks与解析器

- [x] Task 6: 实现XML解析器
  - [x] SubTask 6.1: 创建 `lib/utils/xmlParser.tsx`（1:1移植 `docs/refer/dist/src/utils/xmlParser.tsx`，适配Next.js）

- [x] Task 7: 实现AI对话Hooks
  - [x] SubTask 7.1: 创建 `lib/hooks/useToolExecutor.ts`（1:1参考 `docs/refer/dist/src/hooks/useToolExecutor.ts`，扩展多科工具）
  - [x] SubTask 7.2: 创建 `lib/hooks/useChatHistory.ts`（1:1参考 `docs/refer/dist/src/store/useChatHistoryStore.ts`）
  - [x] SubTask 7.3: 创建 `lib/hooks/useChat.ts`（1:1参考 `docs/refer/dist/src/hooks/useChat.ts`，适配Next.js API路由）
  - [x] SubTask 7.4: 创建 `lib/hooks/useChatUI.ts`（引用文本、快捷解释文本等临时UI状态）

**Phase 3 审查点**: XML解析器可正确解析所有标签类型、hooks可独立调用、工具执行有缓存

---

## Phase 4: AI对话UI组件

- [x] Task 8: 实现AI对话子组件
  - [x] SubTask 8.1: 创建 `components/chat/ReasoningBlock.tsx`（1:1参考 `docs/refer/dist/src/components/AI/ReasoningBlock.tsx`）
  - [x] SubTask 8.2: 创建 `components/chat/ToolCallDashboard.tsx`（1:1参考 `docs/refer/dist/src/components/AI/ToolCallDashboard.tsx`）
  - [x] SubTask 8.3: 创建 `components/chat/FollowUpQuestions.tsx`（1:1参考 `docs/refer/dist/src/components/AI/FollowUpQuestions.tsx`）
  - [x] SubTask 8.4: 创建 `components/chat/ChatMessageVisualizations.tsx`（1:1参考 `docs/refer/dist/src/components/AI/ChatMessageVisualizations.tsx`，适配当前项目依赖）

- [x] Task 9: 实现AI对话主组件
  - [x] SubTask 9.1: 重写 `components/chat/ChatMessage.tsx`（1:1参考 `docs/refer/dist/src/components/AI/ChatMessage.tsx`，含ProcessingSteps、XML渲染、FollowUp提取）
  - [x] SubTask 9.2: 重写 `components/chat/ChatInput.tsx`（1:1参考 `docs/refer/dist/src/components/AI/ChatInput.tsx`，含快速提示、引用文本、深度思考/搜索开关）
  - [x] SubTask 9.3: 重写 `components/chat/ChatPanel.tsx`（1:1参考 `docs/refer/dist/src/components/AI/ChatPanel.tsx`，含历史管理、上下文指示、滚动跟随）
  - [x] SubTask 9.4: ModelSwitch.tsx 保留（用户选择不删除）

**Phase 4 审查点**: 对话面板完整可交互、深度思考可开关、工具调用可展示、追问推荐可点击、XML标签可渲染

---

## Phase 5: 划词助手与快捷解释

- [x] Task 10: 升级划词助手
  - [x] SubTask 10.1: 重写 `components/notes/SelectionPopover.tsx`（去除emoji，使用lucide图标：Lightbulb、Pen、MessageSquare）
  - [x] SubTask 10.2: 创建 `components/chat/QuickExplainWindow.tsx`（1:1参考 `docs/refer/dist/src/components/AI/QuickExplainWindow.tsx`）
  - [x] SubTask 10.3: 添加"引用到AI对话"功能（选中文本 -> ChatInput引用块）

**Phase 5 审查点**: 划词弹出无emoji、快捷解释浮窗可拖拽可流式、引用文本可发送到对话

---

## Phase 6: 上下文管理模式

- [x] Task 11: 实现上下文管理
  - [x] SubTask 11.1: 创建 `lib/context/fullContext.ts` - 全量上下文管理器（内容拼接、缓存命中、token估算、溢出报错）
  - [x] SubTask 11.2: 创建 `lib/context/semanticSearch.ts` - 语义检索接口定义（预留）
  - [x] SubTask 11.3: 创建 `lib/context/types.ts` - 上下文管理器统一类型
  - [x] SubTask 11.4: 在ChatInput/ChatSettings中添加上下文模式切换UI

**Phase 6 审查点**: 全量模式可用、溢出有报错、缓存有标识、语义检索接口已定义

---

## Phase 7: 右侧面板Tag栏 + 设置面板

- [x] Task 12: 升级右侧面板
  - [x] SubTask 12.1: 重写 `components/layout/RightPanel.tsx`（AI对话区域增加Tag栏：对话/设置）
  - [x] SubTask 12.2: 创建 `components/chat/ChatSettings.tsx`（API配置、模型选择、上下文模式）
  - [x] SubTask 12.3: 主内容区增加Tag栏（正文/题目测试）
  - [x] SubTask 12.4: 创建 `components/quiz/QuizTab.tsx`（占位面板）

**Phase 7 审查点**: Tag栏可切换、设置面板可配置、正文/测试Tab可切换

---

## Phase 8: API路由升级与提示词优化

- [x] Task 13: 升级API与提示词
  - [x] SubTask 13.1: 重写系统提示词模板（多科上下文、XML标签引导、工具调用引导）
  - [x] SubTask 13.2: 升级 `app/api/chat/route.ts`（深度思考参数、多科上下文、上下文模式切换）
  - [x] SubTask 13.3: 升级 `app/api/follow-ups/route.ts`（多科上下文）
  - [x] SubTask 13.4: `app/api/section/route.ts` 已在Phase 2中升级，无需调整

**Phase 8 审查点**: API支持深度思考、多科上下文正确注入、工具调用循环正常

---

## Phase 9: 最终集成与审美审查

- [x] Task 14: 最终审查与修复
  - [x] SubTask 14.1: 全局emoji审查，确保所有图标使用lucide-react
  - [x] SubTask 14.2: MD3主题token统一应用审查
  - [x] SubTask 14.3: 文件行数审查（单文件不超过300行）- 新增文件均符合，现有interactives组件超长属历史遗留
  - [x] SubTask 14.4: 深色/浅色模式切换验证
  - [x] SubTask 14.5: 端到端流程验证（文件夹树导航 -> 内容渲染 -> AI对话 -> 划词 -> 快捷解释）
  - [x] SubTask 14.6: 修复useChat参数名不匹配问题
  - [x] SubTask 14.7: 修复深度思考/联网搜索功能断裂
  - [x] SubTask 14.8: 修复停止生成按钮不可用
  - [x] SubTask 14.9: 修复SSE解析不兼容content格式
  - [x] SubTask 14.10: 修复tsconfig未排除showroom目录

---

# Task Dependencies

- [Task 2] depends on [Task 1] (内容树依赖类型)
- [Task 4] depends on [Task 1, Task 2] (文件夹树依赖类型和内容数据)
- [Task 5] depends on [Task 2] (路由依赖内容结构)
- [Task 6] depends on [Task 1] (解析器依赖类型)
- [Task 7] depends on [Task 1, Task 6] (hooks依赖类型和解析器)
- [Task 8] depends on [Task 1, Task 6] (子组件依赖类型和解析器)
- [Task 9] depends on [Task 7, Task 8] (主组件依赖hooks和子组件)
- [Task 10] depends on [Task 9] (划词助手依赖对话组件)
- [Task 11] depends on [Task 7] (上下文管理依赖hooks)
- [Task 12] depends on [Task 9] (面板Tag依赖对话组件)
- [Task 13] depends on [Task 2, Task 11] (API依赖内容结构和上下文管理)
- [Task 14] depends on [Task 9, Task 10, Task 12, Task 13] (最终审查依赖所有模块)

# Parallelizable Work

- Task 1 和 Task 2 可部分并行
- Task 4 和 Task 6 可并行（文件夹树 vs XML解析器）
- Task 8 和 Task 10 可部分并行（子组件 vs 划词助手，但QuickExplainWindow依赖ChatMessage）
- Task 11 和 Task 12 可并行（上下文管理 vs 面板Tag栏）

---

# 子智能体交接规范

## 交接模板

每个Task派遣子智能体时，必须包含以下信息：

```
## 任务目标
[明确的1-2句话描述]

## 输入
- 需要读取的参考文件路径（含行号范围）
- 依赖的类型/组件/hook（含import路径）
- 项目技术栈约束（Next.js 15 + React 19 + Zustand 5 + Tailwind 4）

## 输出
- 需要创建/修改的文件路径
- 文件行数限制（不超过300行）
- 导出的接口/类型/组件名称

## 参考实现
[从 refer/dist 中对应的完整代码，或当前项目中需要修改的代码]

## 约束
- 不使用emoji，图标统一用 lucide-react
- 样式使用 CSS 变量（--md-sys-color-* token）
- 组件必须是 "use client" 标记的客户端组件
- 单文件不超过300行

## 验证
- TypeScript 编译无错误
- 组件可正常渲染（无运行时错误）
- 导出接口与类型定义一致
```

## 审查流程

1. 子智能体完成后，主线读取产出文件
2. 对照 checklist 逐项验证
3. 发现问题：精确描述问题，再次派遣子智能体修复
4. 修复后重新验证，直到通过
5. 标记 Task 完成，更新 tasks.md
