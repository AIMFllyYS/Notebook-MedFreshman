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
│  └─ sharedRehypePlugins  (rehype-raw + KaTeX + highlight.js)   │
│                                                                 │
│  directiveComponents.ts                                         │
│  ├─ Callout       (components/shared/directives/Callout.tsx)    │
│  ├─ Derivation    (components/shared/directives/Derivation.tsx) │
│  ├─ MediaEmbed    (components/shared/directives/MediaEmbed.tsx) │
│  ├─ Figure        (components/shared/directives/Figure.tsx)     │
│  ├─ PlotDirective (components/canvas/PlotDirective.tsx)         │
│  └─ CanvasDirective (components/canvas/CanvasDirective.tsx)     │
│                                                                 │
│  calloutTypes.ts   ── CALLOUT_META 单一数据源                    │
│  remarkDirectives.ts ── 解析 :::callout / ::figure 等指令       │
│                                                                 │
│  components/shared/CodeBlock.tsx    ── 代码块（复制 + 语言标签） │
│  components/shared/ContentImage.tsx ── 统一图片组件（错误兜底） │
│  components/canvas/                ── SVG 画布 + 函数绘图       │
└───────────────────────────────────────────────────────────────┘
         │                                          │
    ┌────┴──────────────┐                ┌───────────┴──────────┐
    │  笔记侧            │                │  聊天侧               │
    │  NoteRenderer      │                │  MessageContent       │
    │  img: ContentImage │                │  img: ContentImage    │
    │                    │                │  + SvgDiagram 标签    │
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
| `sharedRehypePlugins` | `[rehypeRaw, [rehypeKatex, { throwOnError: false, strict: false }], [rehypeHighlight, { detect: true, ignoreMissing: true }]]` | MDAST → HAST 转换插件（rehype-raw 在 KaTeX 前，以支持内联 HTML/SVG） |

**禁止**在 `NoteRenderer` 或 `MessageContent` 中直接内联插件配置。必须从此文件导入。

### 2.2 指令组件 (`lib/markdown/directiveComponents.ts`)

| 键名 | 组件 | 来源 |
|---|---|---|
| `callout` | `Callout` | `components/shared/directives/Callout.tsx` |
| `derivation` | `Derivation` | `components/shared/directives/Derivation.tsx` |
| `mediaembed` | `MediaEmbed` | `components/shared/directives/MediaEmbed.tsx` |
| `figuremedia` | `Figure` | `components/shared/directives/Figure.tsx` |
| `functionplot` | `PlotDirective` | `components/canvas/PlotDirective.tsx` |
| `svgcanvas` | `CanvasDirective` | `components/canvas/CanvasDirective.tsx` |

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
| `img` | `ContentImage` — 统一图片组件，提供加载错误兜底 + figure/figcaption 包裹 |
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
| `img` | `ContentImage` — 支持 AI 返回的网络图片和 `imageSearch` 结果 |
| `table` | 外包 `.chat-table-scroll` 实现横向滚动 |
| `pre` | 映射到 `CodeBlock` |

### 独有功能（非 Markdown 标准）

| 功能 | 实现 | 说明 |
|---|---|---|
| 聊天内容协议解析 | `parseChatContent()` | 将原始模型输出拆成 markdown、component、metadata |
| 项目标签扫描 | `parseXmlTags()` | 只解析白名单 PascalCase 项目标签 |
| 可视化组件 | `ChatMessageVisualizations` | 渲染 Venn 图、分布图、公式步骤、Manim 播放器、SVG 图形 |
| 工具调用面板 | `ToolCallDashboard` | 内联 `<ToolCall>` 标签渲染 |
| FollowUp 追问 | `FollowUpQuestions` | 优先消费 SSE `followup` metadata；兼容正文 `<FollowUp>` |

### 聊天内容三类语法

AI 对话正文必须先经过 `lib/chat/rendering/parseChatContent.ts`，再由 `MessageContent` 渲染。解析结果分三类：

| 类别 | 示例 | 去向 |
|---|---|---|
| Markdown / 原生 HTML | Markdown、KaTeX、`<details>`、`<summary>`、`<br>`、`<sub>` | 保留在 markdown 块，交给 `ReactMarkdown` + `rehype-raw` |
| 项目组件标签 | `<FormulaSteps>`、`<SvgDiagram>`、`<ToolCall>` | `parseXmlTags()` 转成 component 块，再由组件分发器渲染 |
| 控制 metadata | SSE `{ type: "followup" }`、旧 `<FollowUp>` | 写入 `message.followUpQuestions`，不进入正文 |

`MessageContent` 只消费解析结果，不再继续堆叠零散 regex 来“修标签”。新增标签错乱问题时，先修 `parseChatContent` / `parseXmlTags` / SSE 协议和测试，不要在 `MessageContent` 层追加局部替换。

`FormulaSteps` 的每一步也是 Markdown 子内容，必须复用共享 `sharedRemarkPlugins` / `sharedRehypePlugins`，不能再维护第二套 `katex.renderToString` 正则渲染器。Prompt 示例必须要求步骤内公式带 `$...$` 或 `$$...$$`；组件内部只允许对旧消息中“整步明显是公式”的裸 LaTeX 做局部兼容。

### 可视化标签白名单

```
CHAT_VIZ_TAGS = ['InteractiveVenn', 'InlineDistribution', 'FormulaSteps', 'ManimPlayer', 'SvgDiagram']
```

`parseXmlTags()` 只消费项目白名单标签：`InteractiveVenn`、`InlineDistribution`、`FormulaSteps`、`ManimPlayer`、`SvgDiagram`、`ToolCall`、`Answer`、`Thinking`、`FollowUp`。普通小写 HTML 不能被它拆分，必须保留给 `rehype-raw`。未知 PascalCase 标签必须作为安全文本或 fallback 处理，不能交给 React 生成未知 DOM 标签。

新增可视化标签时，需同步修改 `lib/utils/xmlParser.tsx` 白名单、`ChatMessageVisualizations` 分发器、测试和 `lib/ai/prompts/global.md`。

### 历史坑位

- `<details><summary>点击查看答案</summary>...</details>` 曾被旧版 `parseXmlTags()` 拆成裸文本 `<`、`details>`、`summary>`，原因是扫描器看到任意 `<` 都推进一位，没有把普通 HTML 作为 markdown 保留。
- `<SvgDiagram mode="raw"><svg><line ... /></svg></SvgDiagram>` 曾被内部 `<line />` 抢占为外层自闭合结束，原因是自闭合正则跨 children 匹配到了第一个 `/>`。现在必须先解析当前开标签边界，再匹配同名闭合标签。
- `<FollowUp>` 是控制信息，不属于正文。服务端 fallback 必须发独立 SSE `followup` 事件；正文内旧标签只作兼容解析。
- 流式输出中的半截 `<FormulaSteps>`、`<SvgDiagram>`、`<FollowUp>` 暂不渲染，等闭合标签到齐后再进入组件或 metadata。
- `<FormulaSteps>` 曾经绕过共享 Markdown 链，导致步骤里的 `**加粗**` 不生效、裸 `\frac` 直接显示。修复原则是让步骤内容复用共享 Markdown/KaTeX 插件链，而不是继续扩写手写 KaTeX 正则。

### 调用点

| 文件 | 场景 |
|---|---|
| `components/chat/ChatMessage.tsx` | AI 回复气泡 |
| `components/chat/QuickExplainWindow.tsx` | 划词快速解释窗口 |

---

## 5. Markdown 指令语法参考

### 5.1 Callout 指令（容器指令 `:::type`）

```markdown
:::definition{label="正态分布"}
**正态分布** 是一种连续型概率分布，其 PDF 为 ...

$$
f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}
$$
:::
```

**语法**：`:::type{label="可选标题"}` ... `:::`

**可用类型**：`definition` / `theorem` / `example` / `insight` / `pitfall` / `note` / `tip`

### 5.2 Derivation 指令（可折叠推导）

```markdown
:::derivation{label="方差的推导"}
$$
\mathrm{Var}(X) = E[X^2] - (E[X])^2
$$
:::
```

**语法**：`:::derivation{label="可选标题"}` ... `:::`

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

### 5.5 SVG Canvas 系统

SVG Canvas 提供主题适配的矢量画布，支持函数图像绘制和自由 SVG 内容。

#### 组件架构（`components/canvas/`）

| 组件 | 用途 |
|------|------|
| `SvgCanvas` | 核心画布：主题适配（亮色白底/暗色黑底）、拖拽平移、滚轮缩放、可配置网格和坐标轴 |
| `CanvasControls` | 缩放控件覆盖层（放大/缩小/重置） |
| `FunctionPlot` | 在 `SvgCanvas` 内绘制数学函数曲线，支持多函数叠加 |
| `PlotDirective` | `::plot` 指令渲染组件 — 单函数快速绘图 |
| `CanvasDirective` | `:::canvas` 容器指令渲染组件 — 多函数共享坐标系 + 图例 |
| `canvasUtils` | 数学表达式解析器 + 坐标轴刻度计算 + 函数采样 |

#### `::plot` 指令语法

```markdown
::plot{fn="sin(x)" xmin=-6.28 xmax=6.28 ymin=-1.5 ymax=1.5 label="y=sin(x)"}
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `fn` | string | 必填 | 数学表达式，变量为 `x`，支持 `sin/cos/tan/exp/log/sqrt/abs/pi/e` |
| `xmin` | number | -10 | x 轴最小值 |
| `xmax` | number | 10 | x 轴最大值 |
| `ymin` | number | auto | y 轴最小值（省略时自动计算） |
| `ymax` | number | auto | y 轴最大值 |
| `label` | string | — | 曲线标签 |

#### `:::canvas` 容器指令语法

```markdown
:::canvas{width=500 height=300 xmin=-3 xmax=3 ymin=-1 ymax=5}
::plot{fn="x^2" label="y=x²"}
::plot{fn="x^3" label="y=x³"}
:::
```

共享坐标系，多曲线叠加，自动生成颜色区分的图例。

#### 表达式解析器（`compileMathExpr`）

将字符串表达式编译为 `(x: number) => number` 函数。安全沙箱执行，不使用 `eval`。

支持的运算和函数：`+`, `-`, `*`, `/`, `^`（幂）, `sin`, `cos`, `tan`, `exp`, `log`, `sqrt`, `abs`, `pi`, `e`。

### 5.6 图片基础设施

#### ContentImage 组件（`components/shared/ContentImage.tsx`）

统一的图片渲染组件，两侧（笔记 + 聊天）均使用：

- 图片加载失败时显示 `ImageOff` 图标 + 文件名提示（优雅降级）
- 若提供 `title` 属性，自动包裹 `<figure>` + `<figcaption>`
- 支持所有标准 `<img>` 属性

#### `::figure` 指令语法

```markdown
::figure{src="/images/physics/ch08/图8-4.jpg" caption="安培环路定律示意" alt="安培环路"}
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `src` | string | 图片路径（`/images/` 开头的本地路径或 HTTP URL） |
| `caption` | string | 图注文字 |
| `alt` | string | 无障碍替代文本 |

#### 图片路径约定

| 来源 | 路径格式 | 示例 |
|------|---------|------|
| MinerU 解析提取 | `/images/{subject}/{baseName}/{filename}` | `/images/physics/ch08/图8-4.jpg` |
| 手动添加 | `/images/{subject}/{自定义}/` | `/images/chemistry/molecules/ethanol.svg` |

`scripts/parse-docs.ts` 在 MinerU 解析后自动将 `images/` 目录复制到 `public/images/{subject}/{baseName}/`，并将 Markdown 中的相对路径重写为绝对公共路径。

---

## 6. CSS 容器规范

### 6.1 文件职责

| 文件 | 职责 |
|---|---|
| `app/globals.css` | MD3 令牌、base 样式、动画库、工具类 |
| `app/styles/prose.css` | `.prose-notes` + `.chat-prose` 排版 + chat 组件 CSS 类 |
| `app/styles/callouts.css` | 7 种 callout 样式 + 语义图标 + derivation |
| `app/styles/code.css` | highlight.js + CodeBlock + 公式块 + 表格增强 |
| `app/styles/canvas.css` | SVG Canvas 画布样式（网格/轴/曲线/控件/figure 指令） |

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
2. 在 `lib/utils/xmlParser.tsx` 的白名单中追加标签名，并确认普通 HTML 不受影响
3. 在 `lib/ai/prompts/global.md` 中补充标签文档，示例属性使用稳定格式
4. 增加 `lib/utils/xmlParser.test.tsx` 与 `components/chat/MessageContent.test.tsx` 回归用例

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
- **不要**在 `.prose-notes` / `.chat-prose` 内用**裸元素后代选择器**（`svg`/`path`/`table`/`a` 等）设几何或外观 — 这两个容器同时托管第三方渲染的 DOM（KaTeX 拉伸箭头/根号 svg、highlight.js、vidstack）。库内部 DOM 视为**黑箱**，只能用我们自己拥有的 class/wrapper 命中内容元素。典型雷区：KaTeX 的 `\sqrt`、mhchem `->`/`<=>`、`\xrightarrow`、`\overbrace`、`\widehat`、`\vec` 都是 viewBox≈数百:1 的内联拉伸 svg，可见高度**只**靠 KaTeX 自带 `.katex svg{height:inherit}`；任何 `.prose-notes svg{height:auto}` 会把它压成 ~0.04px → 箭头消失/根号错位。作者内嵌图走 `<img>`（`::figure`），画布 svg 由 `canvas.css` 作用域负责。`scripts/check-prose-svg-rules.mjs`（已挂 `prebuild`）会拦截此类规则

> **历史事故备忘**：曾有一次「化学 KaTeX 批量修复」提交把 `4.1/4.2/4.3/5.3.md` 经 GBK 管道写坏（非法 UTF-8），
> 导致有机化学正文「乱码 + 组件层层堆叠」。修复方式：`git checkout <好提交> -- <文件>` 字节级恢复；
> 并新增 `scripts/check-content-encoding.mjs` 作为 `prebuild` 守卫，永久拦截。
