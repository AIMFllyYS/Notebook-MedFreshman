# StudySolo Glass Design System — 概述

StudySolo 是一个 macOS 风格的多学科学习工作台，桌面壳为 Electron，前端基于 Next.js 16 与 Tailwind v4，产品内核是一个内嵌的 AI Agent（对话、深度思考、智能讲解贯穿学习流）。本设计系统不是对旧版界面的换肤，而是一次 0→1 的视觉重构：起点是此前 1:1 还原版的 Material 3 令牌体系（遗产色 primary `#a8c7fa`），目标是"深度玻璃拟态 + macOS 桌面语言"。设计师对此有明确判断：

> "深度玻璃拟态是最关键的一点——所有需要不同颜色的板块，都要做成这种深度玻璃。"

因此本库的所有板块都被定义为**悬浮在环境壁纸之上的半透明玻璃窗格**，而非不透明卡片。另一句内部共识同样重要——"不只是把页面换成这个风格，更重要的是 UX 与布局结构的设计"：28px 菜单条、44px 标题栏、交通灯与层级窗口，这些结构语义与玻璃外观同等重要。本库覆盖三层资产：Foundations（三套主题、`--glass-*` 玻璃令牌、色彩、字体、间距、圆角、阴影、动效）、6 个核心组件契约（button / input-field / glass-panel / mac-window / menu-bar / tab-bar），以及一个完整可点击的 dashboard UI Kit。

## 内容与语气

产品以中文为第一语言，界面文案是**专业、克制、直陈**的工作台语气：二字动词导航、四字功能名、不带语气助词，全产品无 emoji，AI 能力也不做拟人化卖萌。双语规则是"中文优先、英文专名保留"——`Agent`、`Work`、`Chat` 这类产品专名直接以英文出现，不强行翻译。以下文案规则均提炼自真实界面文案，生成新文案时照此口径：

- 全局搜索的占位符是 **"搜索课程、笔记、对话"**：一个输入框并列承诺三类搜索对象，用顿号分隔、句末无标点；新场景沿用"搜索 A、B、C"的枚举格式。
- 动作按钮极简化：**"新对话"**（不是"新建对话"）、**"发送"**、**"复习"**——能两字绝不用四字，不带"请"与主语。
- AI 功能以功能名直陈，不给 Agent 起人格名：**"深度思考"**、**"智能讲解"** 即开关本身的全部文案。
- 配额相关入口直呼 **"额度"**，不用"您的剩余配额"这类客服句式。
- 学科与场景入口用最短名词组：**"全部学科"、"今日课堂"、"书架"、"设置"**；`Agent / Work / Chat` 保留英文原样。

## 视觉基础

### 三套主题：同一套玻璃语法，三种色温

令牌以 CSS 自定义属性分层：`:root` 是**雾蓝浅玻璃**，`.dark` 是默认的**深色暖炭玻璃**，`[data-tint="cream"]` 是**奶油暖黄浅玻璃**。三套主题共享同一组 `--glass-*` 令牌名，只替换填充色温和投影色相。

**深色暖炭（`.dark`，默认主题，对标参考图 Glass Music Player 5）**：页面底色是暖炭 `--surface-page: #2b2926`，沉底层 `#1e1c1a`，注意它不是纯黑冷灰，而是带暖度的炭。玻璃层级完全靠白色 alpha 阶梯拉开：window `rgba(255,255,255,0.06)` → sidebar `0.08` → panel `0.10`（基准填充）→ control `0.14` → popover `0.18`，越浮起的表面白值越高。发丝边框与顶部高光是同一支白的不同浓度：`--glass-border: rgba(255,255,255,0.08)`、`--glass-highlight: rgba(255,255,255,0.14)`；投影改用纯黑 `0 24px 60px -16px rgba(0,0,0,0.55)`。文字为暖白三阶 `#f2ede6 / #b3a99b / #8a8175`，玻璃上的文字用 `--text-on-glass: #f5f0e8`。

**雾蓝浅色（`:root`）**：页面 `#e7eef6`、面板 `#f4f8fc`、侧栏 `#eef4fa`、弹层 `#fbfdff`，整体是冷调雾蓝。玻璃填充为高透白：sidebar `0.55` → window `0.60` → panel `0.62` → control `0.66` → popover `0.70`；亮面收口靠 `--glass-border: rgba(255,255,255,0.65)` 与 `--glass-highlight: rgba(255,255,255,0.75)`，常规分隔线则用 `--border: rgba(58,88,130,0.12)`。投影统一染蓝：`0 20px 50px -14px rgba(37,99,235,0.18)`。文字是墨蓝灰三阶 `#1f2733 / #4d5b6e / #73819a`。

**奶油暖黄（`[data-tint="cream"]`）**：为品牌遗产的奶油地（`#f4efe6` 谱系）保留的浅色方案。页面 `#f7f1e3`、面板 `#fbf6e9`、侧栏 `#f1e8d3`，玻璃填充换成暖白 `rgba(255,252,243,…)`（window `0.60`、panel `0.64`、popover `0.72`），描边与投影染焦糖色：`rgba(120,90,40,0.12)` 发丝线、`rgba(140,95,30,0.18)` 投影；文字是焙茶色三阶 `#47361f / #7d6748 / #a08a68`。此主题下烧橙 accent 加深到 `#c0431f` 以保证暖底上的对比。

### 玻璃六件套与 `--glass-*` 令牌

一块合格的 StudySolo 玻璃，六件东西缺一不可，且全部有令牌支撑：**半透明填充**（`--glass-window/sidebar/panel/popover/control-fill`，按层级五选一）、**1px 发丝边框**（`--glass-border`）、**顶部 1px 内高光**（`inset 0 1px 0 var(--glass-highlight)`，窗格再用 `::after` 在顶部 55% 高度压一层高光到透明的渐隐）、**背景模糊加饱和**（`backdrop-filter: blur(...) saturate(var(--glass-saturate))`）、**环境投影**（`--glass-shadow` / `--shadow-5`）、**连续大圆角**（窗口 28px、面板 18px）。模糊分三档：`--glass-blur-thin: 20px`（控件，如 glass 按钮、搜索框、分段控件）、`--glass-blur-base: 32px`（composer、菜单条、标签页等中层）、`--glass-blur-deep: 48px`（窗口、下拉菜单、popover 等最浮起层）；饱和度统一 `--glass-saturate: 180%`，浅色窗口另加 `--glass-brightness: 106%`。壁纸一侧允许 aqua / violet / amber 的柔焦色团（menu-bar 预览中的 `.blob-aqua` 即此手法），玻璃的颜色感主要来自它背后透出的环境色，而非填充本身。

### 性能：玻璃效果的工程预算（最重要的取舍之一）

重度 backdrop-filter 是这门语言最昂贵的部分，以下规则是设计契约的一部分，而非可选优化。**单层模糊原则**：一条嵌套链路上只有最外层玻璃带 blur——`.glass-window` 把模糊挂在 `::before` 伪元素上（`isolation:isolate` + `z-index:-1` + `blur(48px) saturate(180%)`，独占合成层），其内部的 `.glass-card`、`.pane-side` 只引用 fill 令牌做半透明底色，绝不再叠加 blur。**饱和度上限**锁死 180%，不允许单组件自行加高。弹窗（`nsmenu`、`sheet`、`popover`）关闭即从 DOM 卸载，模糊层不做常驻 display 切换。动效上遵守 `prefers-reduced-motion`：开启时停用位移与闪烁（如输入光标 caret-blink），仅保留透明度过渡。视口外的大窗格使用 `content-visibility` 跳过渲染；窗口拖拽期间对非拖拽内容施加 `contain` 隔离，避免模糊随帧重算。遮罩层刻意只用 `blur(4px)`（见 `.scrim`），不给重模糊。

### 色彩

品牌主色是**水蓝 aqua-blue**：浅色下 `--primary: #2563eb`（500 档 `#3f83f0`），深色模式提亮为 `#6aa6ff`（链接再浅一档到 `#8fbaff`，聚焦环 `rgba(106,166,255,0.45)`）；完整 ramp 从 `#eef5ff`（50）到 `#152f66`（900）。它负责 AI 主操作、发送钮、选中态与聚焦环，不承担"板块底色"——板块靠玻璃而非颜色区分。**烧橙 heritage accent** 是旧品牌的遗产色：`--accent: #d9542c`（ramp `#fdf3ee` → `#d9542c` → `#5c2313`），深色下提亮为 `#e27d52`、cream 主题下压深为 `#c0431f`；它对应笔记本图标的烧橙描边，只用于危险/破坏性动作（`.btn-danger`）与品牌点睛，不与水蓝争夺主导。中性色是一组**暖灰** ramp（`#f7f5f2` → `#7d7262` → `#26221d`），这是深色主题"暖炭"气质的来源。语义色浅色下为 success `#2f9954`、warning `#d18a12`、info `#1792bd`，深色整体提亮到 `#4fb471 / #efbb4d / #5fc8e6`。文字对比始终走三阶（主/次/三级），玻璃上的正文另用 `--text-on-glass`，不要在玻璃表面直接套普通正文色。

### 字体与字号

拉丁字符与数字、展示标题用 **Inter**（Web Font，权重 400/500/600/700），中文走系统栈 **PingFang SC**（macOS）并回退 Microsoft YaHei（`--font-sans: "Inter", -apple-system, "SF Pro Text", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif`），代码与快捷键提示用 **JetBrains Mono**（400/500，如搜索框右侧的 `⌘K`）。中文不加载任何 Web Font，以保证桌面端零闪烁。字号角色体系：display `40/700/1.1`、h1 `30/700/1.2`、h2 `24/600/1.25`、h3 `19/600/1.3`、h4 `16/600/1.4`；正文 body `15/400/1.6`，引导段 lead `17/1.6`，caption `12/500/1.5`，mono `13/1.6`。另有一个不在令牌标尺上、但 macOS  chrome 统一使用的 **13px**：菜单条、窗口标题、菜单项全部是 13px——这是原生节奏，不要"修正"成 12 或 14。

### 间距、macOS 节奏与圆角

间距以 **4px 为基数**：`--space-1…8 = 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`（注意第五档跳到 24，不是 20）。控件高度三档：button sm `30px`、md `36px`、lg `44px`，输入框基准 `36px`（搜索胶囊在组件层为 40px）；图标 `16 / 20 / 24`。桌面 chrome 的数字必须按 macOS 原生节奏走：菜单条高 **28px**、窗口标题栏 **44px**、菜单项行高 **28px**、交通灯直径 **12px**（灯间距 8px）。圆角是连续的五档语义：控件 `--radius-control: 10px`、小面板 `12px`、面板 `18px`（composer 等大型输入容器用到 20px）、窗口 `28px`、胶囊 `9999px`——胶囊只用于按钮、搜索、标签/badge 与圆形控件，窗口与面板永远用连续圆角，不允许出现"方卡片 + 圆按钮"的混搭。

### 阴影与动效

阴影哲学是**柔、低透明度、染环境色、分层**，共五级：`--shadow-1` 控件 `0 1px 2px rgba(30,60,110,0.08)`；`--shadow-2` 卡片 `0 4px 12px -4px rgba(37,99,235,0.12)`；`--shadow-3` 浮层 `0 12px 32px -10px rgba(37,99,235,0.18)`；`--shadow-4` 窗口 `0 24px 60px -16px rgba(30,70,140,0.28)`；`--shadow-5` 玻璃窗格 = `inset 0 1px 0 rgba(255,255,255,0.75)` 顶部高光叠加 `0 18px 50px -12px rgba(37,99,235,0.22)` 环境投影。深色模式整组投影改由 `--glass-shadow` 的黑色方案接管。静止状态不投硬边阴影，层级首先靠白 alpha 与模糊表达。动效只有三档时长 `140 / 220 / 360ms`，配两条原生感曲线：标准 `cubic-bezier(0.32,0.72,0,1)`、强调 `cubic-bezier(0.2,0.9,0.3,1)`；按压反馈统一 `scale(.97)`，悬停提亮统一 `brightness(1.08)`，不要发明新的反馈方式。

## 组件模式

| 组件 | 设计师视角洞察 |
|---|---|
| button | 默认形态是胶囊（9999px）而非矩形；主按钮做**反色处理**（浅色下墨色、深色下纯白，即"白色主操作"），glass 变体自带 20px 模糊、是极少数允许挂 blur 的控件；30/36/44 三档，按压 `scale(.97)`。 |
| input-field | 搜索是 40px 高胶囊 + 右侧 `⌘K`（JetBrains Mono 13px）；聚焦不加重边框，而用 45% primary 描边 + 3px 的 22% primary 光晕；composer 20px 圆角、32px 模糊、min-height 120px，发送钮是 36px 圆形 primary。 |
| glass-panel | 单层模糊原则的范本：48px blur 只挂在 `.glass-window::before`（`isolation:isolate`、`z-index:-1`），内层 `.glass-card` / `.pane-side` 仅有填充；顶部 55% 高度的 `::after` 高光是"玻璃有厚度"的关键错觉。 |
| mac-window | 28px 圆角 + 44px 标题栏 + 12px 原生三色交通灯（`#ff5f57 / #febc2e / #28c840`）；失焦窗口整体 `saturate(.55) brightness(.9)`、灯点转灰 `#7d7d7d`；遮罩只给 4px blur。 |
| menu-bar | 28px 条高 / 13px chrome 字号 / 28px 菜单行，严格复刻 macOS；下拉 nsmenu 宽 220px、48px 深模糊配 shadow-4，分组标题为 11px 大写、letter-spacing `.05em`，禁用项 opacity `.35`。 |
| tab-bar | 浏览器标签活动页 36px 高并以 -1px 与内容区咬合；侧边标签用 2px primary 竖条 + 胶囊数字 badge 表达选中；分段控件是 200px 胶囊内滑动 thumb，而非下划线式 segmented。 |

## 文件索引

- `README.md` — 本文件，面向设计师的品牌叙事与设计判断。
- `colors_and_type.css` — 唯一的运行时令牌源（三套主题 + glass/字体/间距/圆角/阴影/动效），使用时 link 引入，不必通读。
- `css.json` — 令牌的结构化投影，供程序消费；注意它是颜色导向投影，模糊/时长/曲线等非颜色令牌不在其中。
- `components/index.json` 与 6 份组件契约（button / input-field / glass-panel / mac-window / menu-bar / tab-bar）— 组件意图、变体与解剖结构的权威来源。
- `preview/component-*.html` — 6 张组件预览卡，DOM/CSS 保真度的第一参考。
- `components.css` — 从预览页确定性抽取的聚合组件 CSS（勿手改，由抽取脚本再生）。
- `ui_kits/dashboard/index.html` — 完整可点击的 dashboard UI Kit，展示真实布局密度与玻璃层级嵌套。
- `SKILL.md` — Agent 调用本设计库时的入口与快速地图。

## Caveats / 已知取舍

1. 六个组件的变体、状态与尺寸是基于参考图（**Glass Music Player 5** 与 Codex 桌面端截图）的设计推断，并非 Figma 节点实测数据；接入真实工程后需以实现回归校准。
2. 当前不存在对应 Figma 库；若后续补建，节点需经配套插件同步，本库中的推断值才能被实测值替换。
3. `css.json` 仅为颜色结构投影：`--glass-blur-thin/base/deep`、`--glass-saturate`、`--duration-*`、`--ease-*` 等非颜色令牌只存在于 `colors_and_type.css`，读 JSON 会误以为它们缺失。
4. 中文不加载 Web Font，依赖系统的 PingFang SC（macOS）与 Microsoft YaHei（Windows）；仅 Inter 与 JetBrains Mono 走 Google Fonts，离线或国内网络环境需自备自托管副本，否则拉丁字体回退 SF Pro / system-ui。
5. 学科交互资产（概率、化学等约 30 个图表/交互 SVG）未纳入本批；UI Kit 中的图表区目前只是结构与密度占位，不可当作数据可视化规范使用。
6. 旧 Material 3 体系（primary `#a8c7fa`、笔记本图标 + `#f4efe6` 奶油地 + `#d9542c` 烧橙描边）是**迁移源与品牌遗产**，不是目标令牌；烧橙在新体系中仅以 accent 身份保留，禁止继续使用 MD3 的蓝。
7. 交通灯在资产中存在两套配色：mac-window 用 macOS 原生三色 `#ff5f57 / #febc2e / #28c840`，glass-panel 预览则用语义 accent/warning/success 着色——实现时按"是否仿真原生窗口"二选一，不要在同一产品里混用。
8. 性能小节中的弹窗关闭即卸载、`prefers-reduced-motion`、`content-visibility`、窗口拖拽期 `contain` 等属于工程落地约定，当前令牌与组件 CSS 未内置对应规则，需要在 Electron / Next.js 层显式实现。
