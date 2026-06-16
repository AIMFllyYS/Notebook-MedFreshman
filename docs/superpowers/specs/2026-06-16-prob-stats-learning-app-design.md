# 设计文档 · 概率论与数理统计 · 辅助学习应用

日期：2026-06-16 · 状态：已确认，进入实现

## 1. 目标

把 `docs/` 下 18 节课堂录音的逐字稿与智能纪要，转化为一套深度辅助学习应用：
**左侧可伸缩导航**（章 / 小节树）、**中间详尽原创笔记**（全量富文本 + 完美公式）、
**右侧三 Tab**（AI 对话 / Manim 动画讲解 / 可交互内容），并支持**划词问 AI**。

最高优先级：每个小节都有**重新原创、极其详细、通俗易懂**的讲解（全量可达百万字级），
通过**大量子智能体 + 完善 SOP** 持续量产。

## 2. 技术选型

- Next.js 15 (App Router) + TypeScript + Tailwind v4。
- 布局 `react-resizable-panels`；状态 Zustand。
- 富文本 `react-markdown` + `remark-gfm/math` + `rehype-katex`(KaTeX) + `rehype-highlight`；
  自定义 `remark` 指令插件渲染 callout / derivation / 内嵌视频与交互。
- AI：Next Route Handler 服务端代理 **自定义 OpenAI 兼容端点**（密钥仅服务端），SSE 流式 +
  服务端工具调用循环；思考流默认字段 `reasoning_content`（env 可覆盖）。
- 视频：Python **Manim** 渲染 MP4 → `public/media`，自定义可拖拽/缩放小窗播放器 + 浏览器原生 PiP。
- 交互：每小节自包含 React 组件（SVG/d3 + framer-motion），注册表按 id 索引。

## 3. 内容模型

- `content/manifest.ts`：章 / 小节树（id、标题、摘要、状态、挂载的 videoIds/interactiveIds），驱动导航。
- `content/chapters/<ch>/<id>.md`：小节详细笔记，按需加载（`/api/section` 服务端读盘）。
- 富文本块用 **remark 指令**（数据而非 JSX），便于 AI 海量安全生成。
- 媒体清单 `content/media.generated.ts` 由 `manim/render.py` 自动写入。

## 4. AI 对话

- 工具（模型自行判断调用）：`get_current_page` / `get_outline` / `get_section` / `search_notes`。
  前端随请求带当前 `chapterId/sectionId`，故"这一节/这页"可被解析。
- 多级渲染：🧠 思考块（reasoning_content，可折叠）→ 📖 工具调用胶囊 → 富文本输出（KaTeX）。
- 举一反三：回答完成后用 Flash 档**二次调用**生成 3 个可点击追问。
- 顶部 V4 Pro / V4 Flash 切换；rAF 节流保证流式渲染流畅。

## 5. 划词问 AI

笔记区监听选区 → WPS 式浮层（解释 / 举例 / 自定义追问）→ 注入右侧对话并切到 AI Tab，
携带选中原文，AI 借工具理解上下文。

## 6. 子智能体生成管线 + SOP

详见 `docs/SOP-章节生成.md`。每章流水线：拆解逐字稿 → 并行写笔记 → 并行写交互/动画 →
主控集成共享文件（manifest/registry/media）→ 渲染 → 校验。
并发安全：子智能体只新建各自文件，共享文件由主控顺序更新。
可复用 Workflow：`workflows/generate-chapter.workflow.js`，传 `args.chapterId` 即量产。

## 7. 本轮交付范围

1. 完整框架跑通（已 `next build` + 运行时冒烟通过）。
2. 第一章样板：1.1 黄金范例笔记 + 1.1 动画 + 1.2/1.3 交互；其余小节经 Workflow 量产三件套。
3. SOP 文档 + 可复用生成 Workflow。

## 8. 环境

Node 24 / pnpm 10 / Python 3.14 / Manim 0.20 / ffmpeg 8 均就绪。
LaTeX（MiKTeX）用于 Manim `MathTex`，安装中；视频渲染待其就绪。

## 9. 待办 / 风险

- 用户需在 `.env.local` 填真实 `AI_BASE_URL/AI_API_KEY/AI_MODEL_PRO/AI_MODEL_FLASH`
  并确认思考流字段（默认 `reasoning_content`）。
- LaTeX 未就绪前，Manim 含公式场景无法渲染；笔记与交互不受影响。
