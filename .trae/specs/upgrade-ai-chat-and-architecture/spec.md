# 期末复习栈 - AI对话系统升级与架构规范化 Spec

## Why

当前项目仅支持概率论与数理统计单科，AI对话功能简陋（无深度思考开关、无XML渲染、工具调用仅显示芯片、无举一反三追问UI、划词助手使用emoji），且项目架构缺乏规范约束（文件过长、职责不清、无统一路由）。需要系统性升级为全科期末复习栈，1:1参考 `docs/refer/dist` 中成熟的AI对话设计，同时建立Next.js架构规范，为长期扩展奠定基础。

## What Changes

### 架构规范化
- **BREAKING**: 重构 `content/manifest.ts` 为多科内容树结构，从单科概率论扩展为全科
- **BREAKING**: 重构 Sidebar 为VS Code风格文件夹树，支持科目/分类/文档三级结构
- **BREAKING**: 重构路由系统，采用 Next.js App Router 规范，支持 `/[subject]/[category]/[id]` 路由
- 建立文件行数上限规范（单文件不超过300行，超出按职责拆分）
- 建立代码复用规范（共享UI组件、hooks、types统一管理）
- 统一主题系统，采用 Material Design 3 token 体系（参考 refer/dist 的 theme.css）

### AI对话系统升级（1:1参考 refer/dist）
- 升级 ChatPanel：历史对话管理、新对话/清空按钮、上下文指示
- 升级 ChatInput：快速提示、引用文本块、深度思考开关、联网搜索开关、模型指示
- 升级 ChatMessage：ProcessingSteps折叠容器（深度思考+工具调用）、XML标签解析渲染、FollowUp追问推荐
- 新增 ReasoningBlock：深度思考过程展示，支持展开/折叠/流式
- 新增 ToolCallDashboard：工具调用仪表盘，显示参数和结果
- 新增 FollowUpQuestions：举一反三追问推荐UI
- 新增 QuickExplainWindow：划词快捷解释浮窗
- 升级划词助手 SelectionPopover：去除emoji，采用lucide图标
- 升级 useChat hook：支持深度思考、工具调用循环、流式解析
- 升级 useToolExecutor hook：支持多科内容读取、文件夹树结构获取
- 新增 XML解析器：解析AI响应中的自定义XML标签并渲染对应组件
- 优化系统提示词：支持多科上下文、工具调用引导

### 上下文管理模式
- 全量上下文模式：直接将全部内容加入上下文，接入DeepSeek 1M上下文，缓存命中检测，溢出报错
- 语义检索模式：接入向量模型，按最顶配方式实现语义检索（预留接口，本期实现基础架构）

### 右侧面板升级
- AI对话侧边栏支持tag栏切换（对话/设置）
- 中间正文区域增加tag栏（正文/题目测试）

## Impact

- Affected specs: 全部现有功能模块
- Affected code:
  - `app/` - 路由重构
  - `components/chat/` - AI对话组件全面重写
  - `components/layout/` - Sidebar/RightPanel/AppShell重构
  - `components/notes/` - SelectionPopover升级
  - `components/ui/` - 新增共享组件
  - `content/manifest.ts` - 多科内容树
  - `lib/` - store/hooks/types重构
  - `app/api/` - API路由升级

---

## ADDED Requirements

### Requirement: 多科内容树结构

系统 SHALL 支持多科目内容树，一级分类为：概率论与数理统计、大学物理、有机化学、中国近现代史纲要、毛概、其他。

每个科目（除"其他"外）的二级分类固定为：教材、详解、课上录音、课堂纪要。

其中"详解"板块以概率论为例，即为当前项目的完整文件夹树结构（章节-小节）。

#### Scenario: 用户浏览科目目录
- **WHEN** 用户展开"概率论与数理统计"
- **THEN** 显示四个二级文件夹：教材、详解、课上录音、课堂纪要
- **WHEN** 用户展开"详解"
- **THEN** 显示当前概率论项目的章节-小节树结构

#### Scenario: 用户浏览其他科目
- **WHEN** 用户展开"大学物理"
- **THEN** 显示四个二级文件夹：教材、详解、课上录音、课堂纪要
- **WHEN** 用户点击"教材"
- **THEN** 渲染对应md文件内容

### Requirement: VS Code风格文件夹树

系统 SHALL 采用VS Code风格的文件夹树组件替代当前简单列表式Sidebar。

#### Scenario: 文件夹树交互
- **WHEN** 用户点击一级科目
- **THEN** 展开/折叠二级分类，显示文件夹图标和展开箭头
- **WHEN** 用户点击二级分类
- **THEN** 展开/折叠三级内容项
- **WHEN** 用户点击具体文档项
- **THEN** 在主内容区渲染对应内容，当前项高亮

### Requirement: AI对话面板升级

系统 SHALL 提供完整的AI对话面板，1:1参考 `docs/refer/dist/src/components/AI/` 的设计。

#### Scenario: 用户发送消息
- **WHEN** 用户在ChatInput输入问题并发送
- **THEN** 消息显示在对话区，AI开始流式响应
- **WHEN** AI启用了深度思考
- **THEN** 显示ReasoningBlock，展示思考过程，支持展开/折叠
- **WHEN** AI调用了工具
- **THEN** 显示ToolCallDashboard，展示工具名称、参数、状态和结果
- **WHEN** AI响应完成
- **THEN** 显示FollowUpQuestions推荐追问

#### Scenario: XML标签渲染
- **WHEN** AI响应中包含 `<InteractiveVenn a={0.6} />` 等XML标签
- **THEN** 解析标签并渲染对应的交互式可视化组件
- **WHEN** AI响应中包含 `<FollowUp>问题1|问题2|问题3</FollowUp>`
- **THEN** 提取并渲染为追问推荐按钮

#### Scenario: 快速提示
- **WHEN** 对话为空时
- **THEN** 显示快速提示按钮（解释概念、给我出题、推导公式等）
- **WHEN** 用户点击快速提示
- **THEN** 直接发送对应提示文本

#### Scenario: 引用文本
- **WHEN** 用户从正文中划词并发送到AI
- **THEN** ChatInput显示引用文本块，消息中包含引用上下文

### Requirement: 深度思考模式

系统 SHALL 支持AI深度思考模式，用户可手动开关。

#### Scenario: 开启深度思考
- **WHEN** 用户点击"深度思考"开关
- **THEN** 发送消息时附加 `thinking: { type: 'enabled' }` 参数
- **WHEN** AI返回 `reasoning_content`
- **THEN** 在ProcessingSteps容器中显示ReasoningBlock

#### Scenario: 关闭深度思考
- **WHEN** 用户未开启深度思考
- **THEN** 消息正常发送，不附加思考参数

### Requirement: 工具调用仪表盘

系统 SHALL 提供工具调用可视化仪表盘，展示AI调用的每个工具的详细信息。

#### Scenario: 工具调用中
- **WHEN** AI正在调用工具
- **THEN** ToolCallDashboard显示工具名称、loading状态、参数（可展开）
- **WHEN** 工具调用完成
- **THEN** 显示成功/失败状态、返回结果（可展开）

### Requirement: 划词快捷解释

系统 SHALL 提供划词快捷解释浮窗，用户选中文本后可直接获取AI解释。

#### Scenario: 选中文本获取解释
- **WHEN** 用户在正文中选中文本
- **THEN** 显示SelectionPopover，提供"解释"、"举例"、"追问"选项
- **WHEN** 用户点击"解释"
- **THEN** 弹出QuickExplainWindow浮窗，流式显示AI解释
- **WHEN** 用户拖动浮窗
- **THEN** 浮窗跟随移动

### Requirement: 上下文管理模式

系统 SHALL 支持两种AI上下文管理模式。

#### Scenario: 全量上下文模式
- **WHEN** 用户选择全量上下文模式
- **THEN** 系统将当前页面全部内容直接加入AI请求上下文
- **WHEN** 上下文超过模型限制（1M tokens）
- **THEN** 系统给出明确报错提示，建议切换语义检索模式
- **WHEN** 内容命中缓存
- **THEN** 显示缓存命中标识，避免重复传输

#### Scenario: 语义检索模式
- **WHEN** 用户选择语义检索模式
- **THEN** 系统通过向量模型对内容进行语义检索，仅将相关片段加入上下文
- **WHEN** 检索完成
- **THEN** 显示检索到的相关片段数量和来源

### Requirement: AI工具调用扩展

系统 SHALL 扩展AI可调用的工具集，支持多科内容读取。

#### Scenario: 获取文件夹树结构
- **WHEN** AI调用 `get_folder_tree` 工具
- **THEN** 返回当前项目的完整文件夹树结构（科目-分类-文档）

#### Scenario: 读取指定页面内容
- **WHEN** AI调用 `get_page_content` 工具并传入路径
- **THEN** 返回对应页面的完整内容

#### Scenario: 获取当前页面
- **WHEN** AI调用 `get_current_page` 工具
- **THEN** 返回用户当前正在浏览的页面内容

### Requirement: 右侧面板Tag栏

系统 SHALL 在右侧面板增加Tag栏切换功能。

#### Scenario: AI对话侧边栏Tag切换
- **WHEN** 用户在AI对话面板点击"设置"标签
- **THEN** 切换到设置视图（API配置、模型选择、上下文模式等）

#### Scenario: 正文区域Tag切换
- **WHEN** 用户在主内容区点击"题目测试"标签
- **THEN** 切换到题目测试视图

### Requirement: 审美设计规范

系统 SHALL 遵循无emoji的审美设计规范，所有图标使用lucide-react。

#### Scenario: 划词助手无emoji
- **WHEN** 用户选中文本触发SelectionPopover
- **THEN** 按钮图标使用lucide图标（Lightbulb、Pen、MessageSquare），不使用emoji

#### Scenario: AI对话无emoji
- **WHEN** AI对话面板渲染任何UI元素
- **THEN** 所有图标使用lucide-react组件，不使用emoji字符

### Requirement: Next.js架构规范

系统 SHALL 遵循Next.js App Router架构规范。

#### Scenario: 文件行数限制
- **WHEN** 创建或修改文件
- **THEN** 单文件不超过300行，超出时按职责拆分为多个文件

#### Scenario: 代码复用
- **WHEN** 多个组件需要相同逻辑
- **THEN** 提取为共享hook或组件，放在 `lib/` 或 `components/ui/` 下

#### Scenario: 统一路由
- **WHEN** 用户访问不同科目内容
- **THEN** 通过统一路由模式 `/[subject]/[category]/[id]` 访问

---

## MODIFIED Requirements

### Requirement: 系统提示词优化

原提示词仅针对概率论单科，现需支持多科上下文。

优化后的系统提示词 SHALL：
- 根据当前科目动态切换领域知识
- 引导AI在涉及"这一节/当前/这里"等指代时调用工具
- 要求AI使用XML标签组织特定内容（`<FollowUp>`、`<InteractiveVenn>`等）
- 数学公式规范保持KaTeX语法
- 苏格拉底式提问引导风格

### Requirement: 内容渲染

原NoteRenderer仅支持概率论内容，现需支持多科内容渲染。

NoteRenderer SHALL：
- 支持md文件直接渲染（教材、课上录音、课堂纪要）
- 支持详解板块的章节-小节结构渲染
- 保持现有remark/rehype插件链（数学公式、GFM、自定义指令）

---

## REMOVED Requirements

### Requirement: 单科概率论限定
**Reason**: 项目扩展为全科期末复习栈
**Migration**: manifest.ts从单科结构迁移为多科结构，现有概率论内容归入"概率论与数理统计 > 详解"路径下

### Requirement: 简单列表式Sidebar
**Reason**: 升级为VS Code风格文件夹树
**Migration**: 现有Sidebar组件替换为新的FileTree组件，保持展开/折叠/选中高亮等交互
