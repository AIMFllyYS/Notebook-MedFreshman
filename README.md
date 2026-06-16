# 概率论与数理统计 · 辅助学习应用

由课堂录音逐字稿驱动的深度学习助手：**可伸缩导航 + 详尽原创笔记（完美公式）+ 右侧三板块（AI 对话 / Manim 动画 / 可交互内容）+ 划词问 AI**。

## 快速开始

```bash
pnpm install
cp .env.example .env.local   # 填入你的 AI 端点
pnpm dev                     # http://localhost:3000
```

### 配置 AI（自定义 OpenAI 兼容端点）

编辑 `.env.local`：

```
AI_BASE_URL=https://你的端点/v1
AI_API_KEY=sk-xxx
AI_MODEL_PRO=你的-v4-pro-模型id
AI_MODEL_FLASH=你的-v4-flash-模型id
AI_REASONING_FIELD=reasoning_content   # 思考流字段，按端点而定
```

未配置时，框架其余部分（笔记、动画小窗、交互、划词）照常可用，AI 对话会给出"未配置"提示。

## 渲染动画（Manim）

需要 Python + Manim + ffmpeg；公式渲染需 LaTeX（MiKTeX）。

```bash
pnpm render                  # 渲染全部尚未生成的视频
pnpm render:chapter ch01     # 仅渲染第一章
python manim/render.py --force --quality h   # 强制高画质重渲
```

产物输出到 `public/media/videos/<ch>/<id>.mp4`，并自动写入 `content/media.generated.ts`。

## 量产章节内容

参见 **`docs/SOP-章节生成.md`**。指定章节即可经 Workflow 扇出子智能体，
为每个小节产出「详尽笔记 + 动画 + 交互」三件套。

## 目录结构

```
app/                 # Next App Router（页面 + /api 路由）
components/           # 布局 / 笔记渲染 / 对话 / 视频 / 交互
lib/                 # store、内容加载器、AI 工具
content/             # manifest + 各小节 .md 笔记 + 媒体清单
manim/               # Manim 场景与渲染脚本
docs/                # 逐字稿、纪要、SOP、设计文档
```

## 技术栈

Next.js 15 · TypeScript · Tailwind v4 · Zustand · react-markdown + KaTeX ·
react-resizable-panels · framer-motion · Manim。
