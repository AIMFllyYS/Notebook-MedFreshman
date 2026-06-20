# 共享渲染架构规范

> 本文档描述笔记与 AI 对话共用的 Markdown 渲染核心，以及两侧独立扩展的边界。
> 任何修改渲染层、新增指令类型、调整 CSS 容器的操作，都应先阅读本文档。

---

## 1. 架构总览

```
┌───────────────────────────────────────────────────────────────┐
│                    共享层 (lib/markdown/)                       │
│                                                                 │
│  plugins.ts                                                     │
│  ├─ sharedRemarkPlugins  (GFM + Math + Directive + 自定义)      │
│  └─ sharedRehypePlugins  (KaTeX + highlight.js)                 │
│                                                                 │
│  directiveComponents.ts                                         │
│  ├─ Callout       (components/shared/directives/Callout.tsx)    │
│  ├─ Derivation    (components/shared/directives/Derivation.tsx) │
│  └─ MediaEmbed    (components/shared/directives/MediaEmbed.tsx) │
│                                                                 │
│  calloutTypes.ts   ── CALLOUT_META 单一数据源                    │
│  remarkDirectives.ts ── 解析 :::callout 等指令                   │
│                                                                 │
│  components/shared/CodeBlock.tsx ── 代码块（复制 + 语言标签）     │
└───────────────────────────────────────────────────────────────┘
         │                                          │
    ┌────┴──────────────┐                ┌───────────┴──────────┐
    │  笔记侧            │                │  聊天侧               │
    │  NoteRenderer      │                │  MessageContent       │
    │                    │                │                       │
    │  外层 CSS:          │                │  外层 CSS:            │
    │  .prose-notes      │                │  .chat-prose          │
    └────────────────────┘                └───────────────────────┘
```

### 核心原则

- **中间复用**：两侧使用完全相同的 remark/rehype 插件链、指令组件、CodeBlock 组件。
- **独立树**：`NoteRenderer` 和 `MessageContent` 是完全独立的 React 组件入口，各自维护 `components` 映射。
- **CSS 分离**：`.prose-notes` 和 `.chat-prose` 是两套独立的排版令牌容器，公式块/表格/代码块的共享样式同时作用于两者。

---

## 2. 共享层 API

### 2.1 插件链 (`lib/markdown/plugins.ts`)

| 导出 | 内容 | 说明 |
|---|---|---|
| `sharedRemarkPlugins` | `[remarkGfm, remarkMath, remarkDirective, remarkDirectives]` | Markdown → MDAST 解析插件 |
| `sharedRehypePlugins` | `[[rehypeKatex, { throwOnError: false, strict: false }], [rehypeHighlight, { detect: true, ignoreMissing: true }]]` | MDAST → HAST 转换插件 |

**禁止**在 `NoteRenderer` 或 `MessageContent` 中直接内联插件配置。必须从此文件导入。

### 2.2 指令组件 (`lib/markdown/directiveComponents.ts`)

| 键名 | 组件 | 来源 |
|---|---|---|
| `callout` | `Callout` | `components/shared/directives/Callout.tsx` |
| `derivation` | `Derivation` | `components/shared/directives/Derivation.tsx` |
| `mediaembed` | `MediaEmbed` | `components/shared/directives/MediaEmbed.tsx` |

两侧通过 `...directiveComponents` 展开到各自的 `components` 对象中。

### 2.3 Callout 类型 (`lib/markdown/calloutTypes.ts`)

`CALLOUT_TYPES` 数组 + `CALLOUT_META` 对象是所有 callout 类型的**单一数据源**。

当前已注册的 7 种类型：

| type | 中文标签 | CSS 类名 | 语义图标 |
|---|---|---|---|
| `definition` | 定义 | `.callout-definition` | 书本 |
| `theorem` | 定理 | `.callout-theorem` | 闪电 |
| `example` | 例题 | `.callout-example` | 灯泡 |
| `insight` | 洞见 | `.callout-insight` | 脑 |
| `pitfall` | 易错 | `.callout-pitfall` | 三角警告 |
| `note` | 备注 | `.callout-note` | 信息 |
| `tip` | 技巧 | `.callout-tip` | 星星 |

### 2.4 CodeBlock (`components/shared/CodeBlock.tsx`)

提供复制按钮和语言标签。两侧的 `pre` 组件均映射到此组件。

### 2.5 指令标签规范化 (`lib/markdown/normalizeDirectiveLabels.ts`)

remark-directive 的属性语法 `:::type{label=值}` 中，**未加引号的属性值不能包含空格或 ASCII 直引号 `"`**。
中文标题里一旦出现空格（`:::definition{label=σ-p 超共轭}`）或直引号（`:::insight{label=从"衣食住行"讲起}`），
micromark 属性解析失败 → 整个指令被丢弃，渲染成裸 `:::type{...}` 字面文本（callout 框消失、围栏裸露、块结构坍塌）。

`normalizeDirectiveLabels(src)` 在交给 react-markdown 解析**之前**，仅对指令起始行的 `{label=…}`/`{title=…}`：
①把成对 ASCII 引号转中文弯引号；②用 ASCII 双引号给整个值「定界」（`{label="σ-p 超共轭"}`），
使空格/标点都能被接受。代码块内一律跳过，正文引号不受影响，幂等可重入。
**两侧入口（NoteRenderer / MessageContent）都必须先经它**，既修复既有内容也兜底 AI 生成与作者笔误。

---

## 3. 笔记侧 — NoteRenderer

**文件**：`components/notes/NoteRenderer.tsx`

**外层 CSS 容器**：`.prose-notes`（定义于 `app/styles/prose.css`）

### 独有扩展

| 组件覆盖 | 用途 |
|---|---|
| `img` | 添加 `loading="lazy"` 和 `decoding="async"` |
| `pre` | 映射到 `CodeBlock` |

### 性能优化

- 使用 `memo()` 包裹，因为笔记内容是静态的，不需要重渲染。

### 调用点

| 文件 | 场景 |
|---|---|
| `app/[subject]/[category]/[id]/ContentPageClient.tsx` | 主笔记页面 |
| `components/video/VideoTab.tsx` | 视频脚本展开 |
| `components/examples/ExampleTab.tsx` | 例题页面 |
| `components/chat/Message.tsx` | QuickExplain 窗口（聊天侧复用笔记渲染） |

---

## 4. 聊天侧 — MessageContent

**文件**：`components/chat/MessageContent.tsx`

**外层 CSS 容器**：`.chat-prose`（定义于 `app/styles/prose.css`）

### 独有扩展

| 组件覆盖 | 用途 |
|---|---|
| `a` | `target="_blank" rel="noopener noreferrer"` 新窗口打开 |
| `table` | 外包 `.chat-table-scroll` 实现横向滚动 |
| `pre` | 映射到 `CodeBlock` |

### 独有功能（非 Markdown 标准）

| 功能 | 实现 | 说明 |
|---|---|---|
| XML 标签解析 | `parseXmlTags()` | 解析 `<FollowUp>`、`<InteractiveVenn>` 等标签 |
| 可视化组件 | `ChatMessageVisualizations` | 渲染 Venn 图、分布图、公式步骤、Manim 播放器 |
| 工具调用面板 | `ToolCallDashboard` | 内联 `<ToolCall>` 标签渲染 |
| FollowUp 追问 | `FollowUpQuestions` | 从 `<FollowUp>q1|q2|q3</FollowUp>` 提取并渲染按钮 |

### 可视化标签白名单

```
vizTags = ['InteractiveVenn', 'InlineDistribution', 'FormulaSteps', 'ManimPlayer']
```

新增可视化标签时，需同步修改此数组和 `ChatMessageVisualizations` 组件。

### 调用点

| 文件 | 场景 |
|---|---|
| `components/chat/ChatMessage.tsx` | AI 回复气泡 |
| `components/chat/QuickExplainWindow.tsx` | 划词快速解释窗口 |

---

## 5. Markdown 指令语法参考

### 5.1 Callout 指令（容器指令 `:::type`）

```markdown
:::definition{label=正态分布}
**正态分布** 是一种连续型概率分布，其 PDF 为 ...

$$
f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}
$$
:::
```

**语法**：`:::type{label=可选标题}` ... `:::`

**可用类型**：`definition` / `theorem` / `example` / `insight` / `pitfall` / `note` / `tip`

### 5.2 Derivation 指令（可折叠推导）

```markdown
:::derivation{label=方差的推导}
$$
\mathrm{Var}(X) = E[X^2] - (E[X])^2
$$
:::
```

**语法**：`:::derivation{label=可选标题}` ... `:::`

渲染为 `<details>` 可折叠元素。

### 5.3 媒体嵌入指令（叶子指令 `::type`）

```markdown
::video{id=ch01-1.4-classical}
::interactive{id=ch01-1.4-coins}
```

| 指令 | 参数 | 说明 |
|---|---|---|
| `::video` | `id` | 嵌入 Manim 动画视频，id 对应 `content/media.generated.ts` |
| `::interactive` | `id` | 嵌入交互组件，id 对应 `components/interactives/registry.ts` |

### 5.4 KaTeX 公式

| 语法 | 渲染方式 | 示例 |
|---|---|---|
| `$...$` | 行内公式 | `$E = mc^2$` |
| `$$...$$` | 展示公式 | `$$\int_0^1 x^2 dx = \frac{1}{3}$$` |
| `\ce{...}` | 化学方程式（mhchem） | `\ce{H2O -> H+ + OH-}` |

**化学公式注意事项**（KaTeX mhchem 限制）：

| 错误写法 | 正确写法 | 原因 |
|---|---|---|
| `\ce{CH#CH}` | `\ce{CH{\equiv}CH}` | `#` 在 mhchem 中不是三键 |
| `\ce{CaCO3 ^}` | `\ce{CaCO3 \uparrow}` | `^` 不是气体箭头 |
| `\ce{sp^3}` | `\mathrm{sp}^3` | `sp` 不是化学元素，需用 `\mathrm` |
| `\ce{Cl^.}` | `\ce{Cl\cdot}` | `^.` 不是自由基符号 |

---

## 6. CSS 容器规范

### 6.1 文件职责

| 文件 | 职责 |
|---|---|
| `app/globals.css` | MD3 令牌、base 样式、动画库、工具类 |
| `app/styles/prose.css` | `.prose-notes` + `.chat-prose` 排版 + chat 组件 CSS 类 |
| `app/styles/callouts.css` | 7 种 callout 样式 + 语义图标 + derivation |
| `app/styles/code.css` | highlight.js + CodeBlock + 公式块 + 表格增强 |

`globals.css` 顶部通过 `@import` 引入三个子文件，`@import "tailwindcss"` 必须保持第一行。

### 6.2 排版令牌差异

| 令牌 | `.prose-notes` | `.chat-prose` |
|---|---|---|
| 字号 | 15px | `var(--chat-fs, 13px)`（可缩放） |
| 行高 | 1.8 | 1.65 |
| 段距 | 1.2em | 0.8em |
| 最大宽度 | 68ch | 100% |

### 6.3 共享样式（同时作用于两侧）

- **公式块**：`.prose-notes .katex-display, .chat-prose .katex-display` — 背景 + 圆角 + 边框
- **表格**：`.prose-notes table thead th, .chat-prose table thead th` — sticky header + zebra stripes + hover
- **代码块**：`.code-block-wrapper` — 独立于 prose 容器，自带完整样式

---

## 7. 扩展指南

### 7.1 新增 Callout 类型

1. 在 `lib/markdown/calloutTypes.ts` 的 `CALLOUT_TYPES` 数组中追加 `{ type, label, cls }`
2. 在 `app/styles/callouts.css` 中添加 `.callout-<type>` 样式 + `::before` 语义图标
3. 在 `lib/ai/prompts/global.md` 中补充该类型的使用说明

无需修改任何组件代码 — `Callout.tsx` 会自动从 `CALLOUT_META` 读取。

### 7.2 新增指令组件

1. 在 `components/shared/directives/` 下创建新组件文件
2. 在 `components/shared/directives/index.ts` 中 re-export
3. 在 `lib/markdown/directiveComponents.ts` 中注册键名
4. 在 `lib/markdown/remarkDirectives.ts` 中添加解析逻辑（如果需要自定义 node 属性）

### 7.3 新增可视化标签（聊天侧）

1. 在 `components/chat/ChatMessageVisualizations.tsx` 中添加渲染分支
2. 在 `components/chat/MessageContent.tsx` 的 `vizTags` 数组中追加标签名
3. 在 `lib/ai/prompts/global.md` 中补充标签文档

### 7.4 新增 CSS 子模块

1. 在 `app/styles/` 下创建新 CSS 文件
2. 在 `app/globals.css` 顶部追加 `@import url("./styles/<file>.css");`
3. 确保 `@import "tailwindcss"` 始终是第一行

---

## 8. 禁止事项

- **不要**在 `NoteRenderer` 或 `MessageContent` 中直接内联 remark/rehype 插件配置 — 必须从 `plugins.ts` 导入
- **不要**在组件中硬编码 callout 类型列表 — 必须从 `calloutTypes.ts` 导入
- **不要**在聊天侧使用 `.prose-notes` 容器，反之亦然 — 两套排版令牌不同
- **不要**在 `globals.css` 中添加 prose/callout/code 相关样式 — 各有专属文件
- **不要**在化学公式中使用 `#`（三键）、`^`（气体箭头）、`sp^n`、`^.`（自由基）— KaTeX mhchem 不支持，用本文档 §5.4 中的替代写法
- **不要**删除 `globals.css` 顶部的 `@import "tailwindcss"` — 它必须是第一行
- **不要**绕过 `normalizeDirectiveLabels`（见 §2.5）直接把原始内容喂给 react-markdown — 否则带空格/引号的中文 callout 标签会解析失败、围栏裸露
- **不要**在 Windows 上经 PowerShell/控制台重定向（GBK/cp936）写内容文件 — 三字节汉字尾字节会被替换为 `?` 产生非法 UTF-8（乱码 + 块坍塌）。务必用 Write/Edit（UTF-8）写盘；`pnpm run check:encoding`（已挂 `prebuild`）会拦截此类损坏

> **历史事故备忘**：曾有一次「化学 KaTeX 批量修复」提交把 `4.1/4.2/4.3/5.3.md` 经 GBK 管道写坏（非法 UTF-8），
> 导致有机化学正文「乱码 + 组件层层堆叠」。修复方式：`git checkout <好提交> -- <文件>` 字节级恢复；
> 并新增 `scripts/check-content-encoding.mjs` 作为 `prebuild` 守卫，永久拦截。
