# 期末复习工作站 · 多学科辅助学习应用

<div align="center">

**由课堂录音逐字稿驱动的深度学习助手**

可伸缩导航 + 详尽原创笔记（完美公式）+ 右侧三板块（AI 对话 / Manim 动画 / 可交互内容）+ 划词问 AI

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[快速开始](#快速开始) • [功能特性](#功能特性) • [项目架构](#项目架构) • [开发指南](#开发指南) • [贡献指南](#贡献指南)

</div>

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

## 功能特性

### 🎯 多学科支持
- **概率论与数理统计** - 完整的章节详解、动画演示和交互组件
- **有机化学** - 分子结构、反应机理的深度解析
- **中国近现代史纲要** - 历史事件的时间线与知识点梳理
- **毛泽东思想和中国特色社会主义理论体系概论** - 理论要点与思想脉络
- **可扩展架构** - 轻松接入新学科（详见 `docs/sop/subject-onboarding.md`）

### 📚 智能学习体验
- **详尽原创笔记** - 基于课堂录音的深度解析，完美数学公式渲染（KaTeX）
- **AI 对话助手** - 上下文感知的智能问答，支持划词提问
- **Manim 动画讲解** - Python 驱动的数学动画，直观展示抽象概念
- **可交互组件** - 动态可视化工具，支持参数调节和实时反馈
- **三板块布局** - AI 对话 / 动画讲解 / 可交互内容无缝切换

### 🛠 技术亮点
- **多学科内容树** - 统一的内容管理系统，支持教材、详解、录音、纪要分类
- **自定义 Markdown 指令** - `::video`、`::interactive`、`:::definition` 等富文本扩展
- **可视化原语库** - 维恩图、分布图、公式步骤等可复用组件
- **小窗播放模式** - 视频画中画功能，支持跨页面续播
- **响应式设计** - 基于 Tailwind v4 的现代化 UI

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
scripts/             # 内容提取、海报生成、工作流脚本
public/              # 静态资源（视频、图片、海报）
```

## 项目架构

### 核心设计理念
- **多学科统一架构** - 通过 `SubjectId` 和 `CategoryId` 实现学科无关的内容管理
- **组件注册系统** - 交互组件通过 `registry.ts` 统一管理，支持懒加载
- **媒体清单驱动** - 视频资源通过 `media.generated.ts` 集中管理
- **富文本扩展** - 自定义 Markdown 指令实现多媒体内容嵌入
- **共享渲染架构** - 笔记与 AI 对话复用同一 Markdown 渲染核心，详见 `docs/refer/rendering-architecture.md`
- **状态管理** - Zustand 全局状态管理导航、播放、对话等跨组件状态

### 关键技术组件
- **内容树** - `content/manifest.ts` 定义多学科内容结构
- **路由系统** - 动态路由 `/[subject]/[category]/[id]` 支持多学科访问
- **AI 集成** - 可配置的 OpenAI 兼容端点，支持上下文感知对话
- **可视化引擎** - 基于 Manim 的数学动画 + React 可交互组件
- **公式渲染** - KaTeX 实现完美的数学公式显示

## 开发指南

### 环境要求
- Node.js 18+
- pnpm 8+
- Python 3.8+（用于 Manim 动画渲染）
- LaTeX/MiKTeX（用于数学公式渲染）

### 本地开发

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入你的 AI 端点配置

# 启动开发服务器
pnpm dev
# 访问 http://localhost:3000
```

### 渲染动画

```bash
# 渲染所有未生成的视频
pnpm render

# 渲染指定章节
pnpm render:chapter ch01

# 强制高画质重渲染
python manim/render.py --force --quality h
```

### 代码规范

```bash
# 运行 ESLint 检查
pnpm lint

# 自动修复问题
pnpm lint:fix

# 类型检查
pnpm exec tsc --noEmit
```

### 接入新学科

详细步骤请参考 `docs/sop/subject-onboarding.md`：

1. 在 `lib/types/content.ts` 添加新的 `SubjectId`
2. 创建目录结构（`content/{subject}/`, `components/interactives/{subject}/`）
3. 在 `content/manifest.ts` 添加学科配置
4. 在 `components/interactives/registry.ts` 注册交互组件
5. 在 `content/media.generated.ts` 添加视频条目

## 技术栈

### 前端
- **Next.js 16** - React 框架，App Router
- **React 19** - UI 库
- **TypeScript 5.7** - 类型安全
- **Tailwind CSS 4.0** - 样式框架
- **Zustand** - 状态管理

### 内容与数学
- **react-markdown** - Markdown 渲染
- **KaTeX** - 数学公式渲染
- **remark-math** - Markdown 数学语法支持
- **rehype-katex** - KaTeX 集成

### UI 组件
- **lucide-react** - 图标库
- **framer-motion** - 动画库
- **react-resizable-panels** - 可调整大小面板
- **@vidstack/react** - 视频播放器

### 动画与后端
- **Manim** - Python 数学动画引擎
- **ffmpeg** - 视频处理

## 贡献指南

我们欢迎各种形式的贡献！

### 如何贡献

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

### 贡献类型
- 🐛 修复 Bug
- ✨ 新增功能
- 📝 改进文档
- 🎨 优化 UI/UX
- ⚡ 性能优化
- 🧪 添加测试

### 代码审查
所有 Pull Request 需要通过代码审查，确保：
- 代码符合项目规范
- 通过 ESLint 检查
- TypeScript 类型检查通过
- 必要时添加测试用例

## 常见问题

### AI 对话显示"未配置"
确保 `.env.local` 文件中正确配置了 AI 端点：
```
AI_BASE_URL=https://你的端点/v1
AI_API_KEY=sk-xxx
AI_MODEL_PRO=你的模型id
```

### 数学公式渲染异常
检查是否正确安装了 KaTeX 依赖，确保公式语法符合 KaTeX 规范。
注意：`$$` 必须独占一行，否则会导致渲染崩溃。

### 视频无法播放
确认视频文件存在于 `public/media/videos/` 对应目录，且 `content/media.generated.ts` 中有条目记录。

### Manim 渲染失败
确保 Python 环境配置正确，已安装 Manim 和 ffmpeg。LaTeX/MiKTeX 用于公式渲染。

## 路线图

- [ ] 支持更多学科（大学物理、线性代数等）
- [ ] 增强AI对话能力（多轮对话、知识图谱）
- [ ] 优化移动端体验
- [ ] 添加学习进度跟踪
- [ ] 支持用户自定义笔记
- [ ] 集成更多可视化组件
- [ ] 添加单元测试和集成测试

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 致谢

- 感谢所有贡献者的支持
- 感谢开源社区提供的优秀工具和库
- 特别感谢课堂录音内容提供者

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐️ Star 支持一下！**

Made with ❤️ for learners everywhere

</div>
