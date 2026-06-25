# 划词助手深度重构：复用完整对话组件 + 持久化 + 历史分栏 + 导出

日期：2026-06-25 ·分支：`feat/memory-cards`（沿用）

## 背景与目标

当前「划词助手」（选中文字 → 解释/举例/追问 浮窗，及右键菜单「追问」）是一套**独立实现**：
`useFloatingChats`（内存态、不持久化）+ `FloatingChatWindow`（自带 `streamReply` 流式逻辑、
自定义气泡渲染、自管 pos/size 每帧 setState）。它与右侧主对话面板（`ChatPanel` + `useChat` +
`ChatInput` + `ChatMessage` + 持久化 `useChatHistory`）**大量重复**，且：

- 功能弱：不支持附件/工具/交互演示/检索引用/FollowUp 等主面板已有能力；
- **对话不持久化**：关窗即丢；
- 拖拽/缩放每帧 `setState` → 整窗（含消息列表）重渲 → 卡顿。

**目标**（用户口述，逐条满足）：
1. 划词浮窗**复用完整右侧对话组件**，真实支持全部 AI 功能；模型/深度思考/联网搜统一在窗口下方。
2. 发送后发送按钮变停止按钮（`ChatInput` 已具备，复用即得）。
3. 调整窗口大小**优化性能防卡顿**。
4. 划词对话**持久化本地存储**。
5. 划词浮窗**不放**设置/历史/新对话按钮（仍在右侧主面板）。
6. 右侧「历史记录」面板**升级为分栏**：「对话」栏（与现状一致）+「划词」栏（点「还原」重开旧划词浮窗）。
7. AI 设置新增「**导出所有聊天数据**」（以存储文件方式导出）。

第一性原理：一套对话引擎 + 一套持久化，划词只是「另一种入口的会话」。消除并行实现即同时获得
功能完整、持久化、可维护性。

## 核心设计决策

### D1 · 划词会话并入 `useChatHistory`（单一持久化真相源）
`ChatSession` 增可选判别字段 `kind?: 'main' | 'floating'`（旧数据无字段 → 视为 main，零迁移）。
划词浮窗的消息**就是**一个 `kind:'floating'` 的持久会话。关窗不删会话（除非为空），可从「划词」栏还原。

### D2 · `useChat` 参数化 sessionId/model（共用同一流式引擎）
`useChat(chatContext, options, overrides?: { sessionId?; modelId? })`：
- 传 `sessionId` → 读写该会话（而非全局 `activeSessionId`）；不传 → 完全同现状。
- 传 `modelId` → 该次请求用此模型（划词每窗独立模型）；不传 → 用全局 `selectedModelId`。
- **token 看板写入仅在主面板**（`!overrides.sessionId` 时）执行，划词窗不污染全局上下文看板。
- `createSession` 对 `kind:'floating'` **不抢占** `activeSessionId`（否则会劫持主面板当前会话）。

### D3 · `useFloatingChats` 退化为「窗口几何 + 引用 sessionId」
`FloatingWin = { id, sessionId, pos, size, fullscreen, z, modelId, seedText, seedMode, seedNonce }`。
消息/isLoading/error 从窗口态移除（消息来自 `useChatHistory`，加载/错误来自窗内 `useChat`）。
- `openWindow({anchor,seedMode,seedText})`（**签名不变**，`SelectionPopover`/`MessageContextMenu` 零改动）：
  新建一个 `kind:'floating'` 会话 + 一个引用它的窗口（seedNonce=1）。
- `restoreWindow(sessionId)`：已开则置顶；否则按现 active 上下文重开一个绑定该会话的窗（seedNonce=0，不自动发问）。
- `closeWindow(id)`：移除窗口；**若该会话为空则一并删除**（避免「划词」栏堆空会话）。
- `commitGeometry(id,{pos?,size?})`：拖拽/缩放**松手时**一次性落库。

### D4 · 抽取共享转录视图 `ChatThread`（非机械拆分，两处真实复用）
新建 `components/chat/ChatThread.tsx`：滚动容器 + 水合 loader + 空态 + `ChatMessage` 列表 +
加载指示 + 错误条 + 回到底部按钮 + `isAtBottom` 滚动管理。`ChatPanel` 与 `FloatingChatWindow` 共用。
主面板的上下文告警条/`SelectionPopover`/Header/输入区仍留在 `ChatPanel`（通过可选 `scrollContainerRef`
prop 让 `ChatPanel` 仍能把滚动容器交给 `SelectionPopover`）。

### D5 · `ChatInput` 增 4 个可选 prop（复用接缝，无机械拆分）
`modelId?`/`onModelChange?`（受控模型，传则每窗独立）、`showTokenDashboard?`（默认 true，划词传 false）、
`disableQuote?`（默认 false，划词传 true，避免全局 `useChatUI.quotedText` 串入浮窗）。发送→停止按钮已内建。

### D6 · 性能：拖拽/缩放走既有 rAF hook
`FloatingChatWindow` 几何改用 `useDraggable`（标题栏）+ `useResizable`（右下角，复用 RecordPreview 同款），
移动期间直接写 `el.style`（零重渲），松手 `commitGeometry`。去掉左下角缩放与每帧 setState（化繁为简）。
保留全屏切换（铺满 `#notes-panel`，一次性 set，非每帧）。

### D7 · 历史面板分栏
`ChatHistoryOverlay` 内部按 `kind` 分「对话/划词」两栏（segmented tab）。对话行点击 = `switchSession`；
划词行点击 = `restoreWindow`（即「还原」）。删除按钮两栏通用（删划词会话时若其窗开着先关窗）。

### D8 · 导出所有聊天数据
新建 `lib/chat/exportChats.ts`：`exportAllChats()` 读 `useChatHistory.sessions`（含两类会话），
序列化为 `{app,type:'chat-export',version,exportedAt,sessions}` JSON，Blob 下载
`gailvlun-chat-export-YYYYMMDD.json`。纯本地、无外发（守安全红线）。设置面板加一节按钮触发。

## 落地顺序（低耦合·逐模块 计划→实现→自验）
M1 `useChatHistory`(kind+非劫持) → M2 `useChat`(overrides+看板门控) → M3 `ChatInput`(4 prop) →
M4 `ChatThread` 抽取并令主面板采用（先确保主面板零回归）→ M5 `useFloatingChats` 重写 →
M6 `FloatingChatWindow` 重写薄壳 → M7 `ChatHistoryOverlay` 分栏 + `ChatPanel` 接线 →
M8 导出（helper+设置节）→ M9 tsc/eslint/dev 全链路系统测试 → M10 push/打包/更新 release。

## 安全约束（延续红线）
- 划词与主面板同走服务端 `/api/chat`，`AI_API_KEY` 仅后端，绝不进前端包。
- 导出为本地 Blob 下载，无任何外发；不导出密钥（密钥不在 chat-history 内）。

## 验收
1. 选中文字 → 解释/举例自动作答；追问首条带引用；浮窗气泡=主面板同款渲染（公式/工具/交互演示）。
2. 浮窗模型/思考/联网在底部，发送↔停止切换正常；关窗重开（还原）历史仍在。
3. 拖拽/缩放流畅，不卡顿。
4. 历史面板「对话/划词」两栏；划词「还原」重开窗口；删除生效。
5. 设置「导出所有聊天数据」下载 JSON，含主+划词全部会话。
6. 主面板（桌面/移动）零回归；`tsc` 通过、新代码 eslint 干净。
