# 划词快捷解释浮窗升级 Spec

## 1. Why

当前 QuickExplainWindow 仅支持单轮解释，功能简陋：
- 纯文本渲染，不支持数学公式、表格等富文本格式
- 固定宽度 400px，无法调节大小
- 无内联追问功能，只能跳转到主面板
- 引用功能缺乏明确的引用指示

升级目标：将 QuickExplainWindow 改造为支持多轮对话的富文本浮窗，提升用户体验。

## 2. What Changes

### 2.1 核心假设

| 决策点 | 选择 | 理由 |
|---|---|---|
| 富文本范围 | Markdown + KaTeX 数学公式 + GFM 表格 + `<FollowUp>` 标签 | 覆盖解释场景的绝大多数内容，避免在浮窗内嵌重型可视化组件的复杂度 |
| 追问模型 | 浮窗内多轮对话（保留历史）+ "转到主面板"升级入口 | 体验最佳；升级入口把浮窗历史带入主对话，无缝衔接 |
| 引用 UX | 引用块 + 提示词增强（发送时自动加前缀） | 与现有 `sendToChat` 模式一致，AI 能明确识别引用上下文 |
| 窗口记忆 | localStorage 持久化尺寸和位置 | 体验更好，避免每次打开都要重新调整 |

### 2.2 架构设计

#### 组件层级

```
SelectionPopover（划词入口，微调）
  ├─ "解释" → setQuickExplain(text, pos, mode='explain')
  ├─ "举例" → setQuickExplain(text, pos, mode='example')
  ├─ "追问" → 内联输入（保留现有行为）
  └─ "引用" → setQuotedText(text) → ChatInput 引用块 + 提示词增强

QuickExplainWindow（升级为多轮对话浮窗）
  ├─ Header（拖拽手柄 + 标题 + 模式标识 + 关闭）
  ├─ MessageList（复用共享 MessageContent 渲染）
  │   └─ 每条消息：ReactMarkdown + KaTeX + GFM + FollowUp 标签
  ├─ InputBar（新增：继续输入追问，Enter 发送）
  ├─ Footer（"转到主面板"升级按钮）
  └─ ResizeHandle（新增：右下角调节尺寸）

ChatInput（引用块增强）
  └─ 引用块显示 + 发送时自动拼接提示词前缀
```

#### 共享组件提取

从 ChatMessage.tsx 抽取 `MessageContent` 组件，封装渲染管线：

```
MessageContent（新组件）
  ├─ parseXmlTags 解析
  ├─ ReactMarkdown + remarkMath + remarkGfm + rehypeKatex
  ├─ <FollowUp> 标签 → 追问按钮（可配置 onClick）
  └─ 可选：可视化标签渲染（ChatMessage 启用，QuickExplainWindow 禁用）
```

### 2.3 状态管理扩展

useChatUI.ts 增加多轮对话状态：

```ts
interface QuickExplainMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoningContent?: string;
  timestamp: number;
}

interface ChatUIState {
  // 现有: quotedText, quickExplainText, quickExplainPosition...
  
  // 新增：多轮对话
  quickExplainMessages: QuickExplainMessage[];
  quickExplainMode: 'explain' | 'example';
  addQuickExplainMessage: (msg: QuickExplainMessage) => void;
  clearQuickExplainMessages: () => void;
  
  // 新增：窗口尺寸持久化
  quickExplainSize: { width: number; height: number };
  setQuickExplainSize: (size: { width: number; height: number }) => void;
}
```

### 2.4 数据流

#### 解释流程（多轮）

1. 用户划词 → SelectionPopover 显示
2. 点击"解释" → setQuickExplain(text, pos, mode='explain')
3. QuickExplainWindow 打开，初始化 messages = [{role:'user', content: text}]
4. 调用 /api/chat 流式响应（model: flash），追加 assistant 消息
5. 用户在 InputBar 输入追问 → 追加 user 消息 → 再次调用 API（带完整历史）
6. AI 响应中的 <FollowUp> 标签渲染为按钮，点击直接作为追问输入
7. 用户点击"转到主面板" → 把 quickExplainMessages 转移到主对话历史，关闭浮窗

#### 引用流程（提示词增强）

1. 用户划词 → 点击"引用" → setQuotedText(text)
2. ChatInput 显示引用块（带来源标注和删除按钮）
3. 用户输入问题并发送
4. sendToChat 自动拼接提示词：

```
针对当前页面这段原文：

> {quotedText}

{userQuestion}
```

### 2.5 关键实现细节

#### a) 尺寸调节
- 右下角 ResizeHandle（12x12 px，视觉斜纹）
- Pointer events 实现拖拽（与现有拖拽逻辑一致）
- 最小尺寸 360x320，最大 800x600
- 拖拽结束时 setQuickExplainSize + 写入 localStorage

#### b) 多轮对话 API 调用
- 复用 /api/chat，传入完整 messages 数组
- 简化版 system prompt（聚焦解释，不引导工具调用，避免浮窗内触发工具循环）
- model: flash（快速响应）
- 流式解析复用现有 SSE 解析逻辑

#### c) FollowUp 标签在浮窗内的行为
- 渲染为可点击按钮
- 点击 → 直接填入 InputBar 并发送（不跳转到主面板）

#### d) "转到主面板"升级
- 调用主对话 store 的 importMessages(quickExplainMessages)
- 关闭浮窗
- 主面板自动滚动到底部

## 3. 文件改动清单

### 修改
- QuickExplainWindow.tsx — 重写为多轮对话浮窗（最大改动）
- SelectionPopover.tsx — 微调（传递 mode 参数）
- useChatUI.ts — 扩展状态
- ChatInput.tsx — 引用块提示词增强

### 新增
- components/chat/MessageContent.tsx — 共享渲染组件（从 ChatMessage 抽取）
- components/chat/QuickExplainInput.tsx — 浮窗输入框组件

### 重构
- ChatMessage.tsx — 改用 MessageContent，去除重复渲染逻辑

## 4. 风险与权衡

| 风险 | 应对 |
|---|---|
| 浮窗内多轮对话历史过长导致 token 膨胀 | 限制保留最近 6 轮，超出时截断最早消息 |
| MessageContent 抽取可能影响现有 ChatMessage 行为 | 抽取后跑现有 chat 流程回归验证 |
| localStorage 在 SSR 环境的兼容性 | 仅在客户端（mounted 后）读写，与现有 mounted 守卫一致 |
| 浮窗内 FollowUp 点击与主面板行为冲突 | 通过 props 注入不同的 onFollowUpSelect 回调

## 5. 实现步骤

1. 写设计文档（当前）
2. 创建共享组件 MessageContent.tsx
3. 重构 ChatMessage.tsx 使用 MessageContent 组件
4. 扩展 useChatUI.ts 状态管理
5. 重写 QuickExplainWindow.tsx 为多轮对话浮窗
6. 升级 SelectionPopover.tsx 传递 mode 参数
7. 升级 ChatInput.tsx 引用块提示词增强
8. 运行 lint 和 typecheck 验证