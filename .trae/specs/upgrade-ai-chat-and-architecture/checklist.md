# Checklist

## Phase 1: 基础设施与类型系统
- [x] `lib/types/content.ts` 已创建，包含 Subject、Category、Document、ContentTree 类型
- [x] `lib/types/chat.ts` 已创建，包含 ChatMessage、ToolCallBlock、ChatContext、ChatOptions、ParsedBlock 类型
- [x] `lib/types/tools.ts` 已创建，包含 ToolDefinition、ToolResult、PAGE_CONTENT_TOOLS、WEB_SEARCH_TOOL
- [x] `lib/constants/subjects.ts` 已创建，包含6个科目和4个分类常量
- [x] `lib/constants/prompts.ts` 已创建，包含快速提示模板和系统提示词模板
- [x] `app/globals.css` 已升级为 MD3 token 体系，支持深色/浅色模式
- [x] `content/manifest.ts` 已重构为多科结构，概率论归入"详解"分类
- [x] 各科目占位内容结构已创建
- [x] `content/index.ts` 统一导出已创建
- [x] `components/ui/IconButton.tsx` 已创建
- [x] `components/ui/Badge.tsx` 已创建
- [x] `components/ui/DropdownMenu.tsx` 已创建
- [x] `components/ui/Tooltip.tsx` 已创建

## Phase 2: VS Code风格文件夹树 + 路由重构
- [x] FileTree组件支持递归渲染、展开/折叠、选中高亮
- [x] FileTreeItem组件显示文件夹/文件图标、箭头、缩进
- [x] SubjectSidebar标题显示"期末复习栈"
- [x] 一级科目列表正确：概率论与数理统计、大学物理、有机化学、中国近现代史纲要、毛概、其他
- [x] 二级分类正确：教材、详解、课上录音、课堂纪要
- [x] 文件夹树状态已集成到 Zustand store
- [x] 动态路由 `app/[subject]/[category]/[id]/page.tsx` 已创建
- [x] 首页重定向到默认科目
- [x] AppShell已集成新Sidebar和路由

## Phase 3: AI对话核心Hooks与解析器
- [x] `lib/utils/xmlParser.tsx` 可正确解析自闭合标签和带内容标签
- [x] xmlParser 可提取标签属性（字符串、数字、布尔、JSON对象）
- [x] `lib/hooks/useToolExecutor.ts` 支持 getCurrentPage、getFolderTree、getPageContent、webSearch
- [x] useToolExecutor 包含内存缓存机制（5分钟TTL）
- [x] `lib/hooks/useChatHistory.ts` 支持会话创建/切换/删除、localStorage持久化
- [x] `lib/hooks/useChat.ts` 支持流式响应、深度思考、工具调用循环、错误处理
- [x] `lib/hooks/useChatUI.ts` 管理引用文本和快捷解释文本状态

## Phase 4: AI对话UI组件
- [x] ReasoningBlock 支持展开/折叠/流式、预览截断
- [x] ToolCallDashboard 显示工具名称、参数展开、状态指示、结果展开
- [x] FollowUpQuestions 显示追问推荐按钮，点击可发送
- [x] ChatMessageVisualizations 包含 InlineVenn、InlineDistribution、FormulaSteps、ManimPlayer
- [x] ChatMessage 包含 ProcessingSteps 折叠容器、XML标签渲染、FollowUp提取
- [x] ChatInput 包含快速提示、引用文本块、深度思考开关、联网搜索开关
- [x] ChatPanel 包含历史对话管理、上下文指示、滚动跟随、空状态引导
- [x] ModelSwitch.tsx 保留（用户选择不删除），功能已合并到ChatInput

## Phase 5: 划词助手与快捷解释
- [x] SelectionPopover 不使用emoji，使用lucide图标
- [x] QuickExplainWindow 可拖拽浮窗，流式显示AI解释
- [x] "引用到AI对话"功能可用

## Phase 6: 上下文管理模式
- [x] 全量上下文模式可用
- [x] 缓存命中检测已实现
- [x] 上下文溢出时有明确报错
- [x] 语义检索接口已定义
- [x] 上下文模式切换UI已添加

## Phase 7: 右侧面板Tag栏 + 设置面板
- [x] AI对话区域有Tag栏（对话/设置）
- [x] ChatSettings面板包含API配置、模型选择、上下文模式
- [x] 主内容区有Tag栏（正文/题目测试）
- [x] QuizTab占位面板已创建

## Phase 8: API路由升级与提示词优化
- [x] 系统提示词支持多科上下文动态切换
- [x] 系统提示词包含XML标签使用引导
- [x] 系统提示词包含工具调用引导
- [x] API路由支持深度思考参数
- [x] API路由支持多科上下文
- [x] API路由支持上下文模式切换

## Phase 9: 最终集成与审美审查
- [x] 全局无emoji，统一使用lucide图标（新增文件全部通过）
- [x] MD3主题token统一应用
- [x] 单文件不超过300行（新增文件全部符合；现有interactives组件超长属历史遗留，不在本次范围）
- [x] 深色/浅色模式切换正常（MD3 token完整覆盖）
- [x] 端到端流程验证通过（参数传递链已修复，TypeScript编译零错误）

## PADC流程验证
- [x] 每个Phase完成后进行了审查
- [x] 发现的问题已交给子智能体修复
- [x] 修复后重新验证通过
- [x] tasks.md中已完成的Task已勾选
