# Figma 同步指南 · StudySolo Glass

本目录的 `tokens-studio.json` 是设计系统的 Figma 同步源，由 `colors_and_type.css` 确定性生成，包含：

- `core` 集：139 个令牌（色板、字体、字号/字重/行高、9 组复合文字样式、间距、尺寸、圆角、5 档阴影、动效、玻璃模糊三档）
- `aqua` / `dark` / `cream` 三个主题集：各 51 个语义令牌（品牌色、文字、表面、玻璃填充/描边/高光、玻璃阴影、别名引用）
- 三个主题声明（`$themes`），引用关系零断裂，可直接生成 Figma Variables 的多模式集合

## 路径 A · Tokens Studio 一键导入（推荐，最完整）

Tokens Studio 是 Figma 官方生态最主流的 Design Tokens 插件，能同时同步 **Variables（变量）+ Text Styles（文字样式）+ Effect Styles（阴影样式）**，一次导入覆盖全部 292 个令牌。

1. 在 Figma 文件中打开插件：菜单 `Resources` → `Plugins` → 搜索 **Tokens Studio for Figma**（免费），运行。
2. 首次启动选择本地工作流（`Local document` / `Start from file` 均可），点击面板右上角菜单 → `Import` → 选择本目录的 `tokens-studio.json`。
3. 导入后左侧 Token sets 出现 4 个集：`core`、`aqua`、`dark`、`cream`，Themes 面板出现「雾蓝浅色 / 深色暖炭 / 奶油暖黄」三个主题。
4. 点击底部 `Sync`（同步图标），首次同步选择 **Create variables and styles**。Mode 映射建议：
   - Collection `StudySolo Core`：单模式 `Default`，来源 `core`
   - Collection `StudySolo Color & Glass`：三模式 `Aqua` / `Dark` / `Cream`，分别来源三个主题集
5. 同步完成后：
   - 任意图层的填充/描边/圆角/间距均可绑定变量，切换 Collection 模式即可整帧换肤
   - Typography 面板出现 display/h1/h2/h3/h4/body/lead/caption/mono 九组文字样式
   - Effects 面板出现 shadow-1…5 与各主题 glass 阴影样式（含顶部内高光图层）

## 路径 B · Variables REST API 直推（无需插件）

提供一个**已存在的空白 Figma 文件链接**（Figma REST API 不支持凭空创建文件，需先在 Figma 中 `New design file`），即可通过官方 Variables API 直接写入变量集合。

- 直推覆盖：COLOR 与 FLOAT/STRING 类型（颜色、圆角、间距、尺寸、模糊档位）
- 直推不覆盖：复合文字样式与多层阴影样式（Figma Variables 本身不支持这两类，需路径 A 的插件生成 Styles）
- 建议：路径 A 已包含路径 B 的全部能力；仅当不想安装插件时使用 B

## 组件帧与 Agent 工作台高保真稿

令牌之外，6 个组件预览页与 dashboard UI Kit 是组件视觉的事实标准，可直接转成 Figma 帧：

1. 在设计系统目录启动本地服务，例如 `npx serve .` 或 `python -m http.server 8080`。
2. Chrome 安装 **html.to.design** 浏览器扩展。
3. 打开以下页面并点击扩展 `Capture this page`（localhost 页面可直接抓取）：
   - `ui_kits/dashboard/index.html` — Agent 工作台全链路，切换「深色/雾蓝/奶油」分别抓取可得三张主题帧
   - `preview/component-glass-panel.html`、`preview/component-mac-window.html`、`preview/component-menu-bar.html`、`preview/component-button.html`、`preview/component-input-field.html`、`preview/component-tab-bar.html`
4. 在 Figma 中解组帧、按 6 个组件契约封装为 Main Components，属性对应 `components/*.json` 的 variants。

## Figma 文件结构建议

- `Cover` — 三套主题玻璃氛围封面
- `Foundations` — Color & Glass（三模式）/ Typography / Radius / Elevation / Motion 标注页
- `Components` — 6 个核心组件的全部变体与状态
- `Agent Workspace` — 三栏工作台、Composer、检查器、NSMenu 弹层、Sheet、空状态

## 字体注意

- 拉丁字体 Inter、代码字体 JetBrains Mono 需在运行 Figma 的本机安装（Google Fonts 免费）
- 中文走系统栈 PingFang SC（macOS）/ Microsoft YaHei（Windows），无需 webfont
