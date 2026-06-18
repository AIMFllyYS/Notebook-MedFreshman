# 全局 CSS 规范与动画规范优化计划

## 一、现状分析

### 1.1 当前 CSS 架构
- **设计令牌**：`globals.css` 定义了完整的 CSS 自定义属性体系（颜色、阴影、圆角、字体），但**缺少动画相关令牌**（时长、缓动函数、缩放等）
- **动画现状**：仅有 2 个 `@keyframes`（`fadeUp`、`pulse-dot`）+ 1 个工具类 `animate-fade-up`，覆盖面极窄
- **framer-motion**：已安装但仅在 `PipPlayer.tsx` 中使用，其余组件全部依赖零散的 `transition-colors` / `transition-all`
- **Tailwind v4**：项目使用 Tailwind CSS v4，无 `tailwind.config.ts`，配置通过 CSS `@theme` 指令完成

### 1.2 缺失的动画场景（按优先级）

| 优先级 | 场景 | 当前状态 | 影响 |
|--------|------|----------|------|
| P0 | 右侧面板 Tab 切换 | 无动画，瞬间替换 | 用户感知突兀 |
| P0 | 左侧 Tree 展开/折叠 | 仅 Chevron 旋转，子列表瞬间出现 | 缺乏空间感 |
| P0 | 笔记内容切换 | 无动画，直接替换 | 切节时视觉断裂 |
| P1 | PiP 小窗 | 有入场动画，但缺少关闭/最小化/最大化动画 | 交互不完整 |
| P1 | 侧边栏折叠/展开 | 无动画，Panel 直接 collapse | 视觉跳跃 |
| P1 | 划词弹出框 | 有 `animate-fade-up`，但无退场动画 | 消失突兀 |
| P2 | 交互组件卡片 | 无入场动画 | 滚动到视口时缺乏生命力 |
| P2 | 按钮点击反馈 | 部分有 `active:scale-95`，大部分无 | 触感不一致 |
| P2 | 聊天消息出现 | 有 `animate-fade-up`，但无打字机效果优化 | 可改进 |

### 1.3 Vercel React Best Practices 关联规则

| 规则 | 适用场景 | 当前违反情况 |
|------|----------|-------------|
| `rendering-animate-svg-wrapper` | 交互组件中 SVG 动画 | 部分交互组件直接在 SVG 上做动画 |
| `rendering-activity` | Tab 切换保留状态 | 已用条件渲染（更优），无需改 |
| `rendering-content-visibility` | 长列表渲染 | 未使用，Sidebar/Chat 消息列表可受益 |
| `rerender-transitions` | 非紧急状态更新 | AppShell 已使用，Tab 切换可加强 |
| `rerender-use-deferred-value` | 昂贵派生渲染 | NotesPane 已使用 |
| `bundle-preload` | 预加载意图 | Tab 切换时可预加载目标组件 |

## 二、设计原则

1. **性能优先**：所有动画仅使用 GPU 加速属性（`transform`、`opacity`），避免触发布局重排
2. **CSS-first**：优先使用 CSS `@keyframes` + `transition`，仅在需要卸载/挂载动画时使用 `framer-motion` 的 `AnimatePresence`
3. **令牌驱动**：所有时长、缓动函数、缩放值均通过 CSS 自定义属性定义，全局一致可调
4. **尊重用户偏好**：通过 `prefers-reduced-motion` 媒体查询为运动敏感用户禁用动画
5. **渐进增强**：动画是增强而非功能依赖，禁用动画后功能完全正常

## 三、具体实施计划

### 阶段 1：全局动画令牌与基础设施

**文件**: `app/globals.css`

在 `:root` 中添加动画令牌：

```css
:root {
  /* ── 动画令牌 ────────────────────────────── */
  --duration-instant: 75ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-in-out: cubic-bezier(0.42, 0, 0.58, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-decelerate: cubic-bezier(0, 0, 0.2, 1);
  --scale-press: 0.97;
  --scale-hover: 1.02;
}
```

添加 `@keyframes` 动画库：

```css
/* ── 动画库 ────────────────────────────────── */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
@keyframes slideInRight { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideInLeft { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideInDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes expandHeight { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 500px; } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
```

添加工具类：

```css
/* ── 动画工具类 ────────────────────────────── */
.animate-fade-in { animation: fadeIn var(--duration-normal) var(--ease-out) both; }
.animate-slide-in-right { animation: slideInRight var(--duration-normal) var(--ease-out) both; }
.animate-slide-in-left { animation: slideInLeft var(--duration-normal) var(--ease-out) both; }
.animate-slide-in-up { animation: slideInUp var(--duration-normal) var(--ease-out) both; }
.animate-scale-in { animation: scaleIn var(--duration-fast) var(--ease-spring) both; }
.animate-expand { animation: expandHeight var(--duration-normal) var(--ease-decelerate) both; overflow: hidden; }
.animate-shimmer { background: linear-gradient(90deg, var(--bg-muted) 25%, var(--bg-elevated) 50%, var(--bg-muted) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
```

添加 `prefers-reduced-motion` 支持：

```css
/* ── 尊重用户动画偏好 ──────────────────────── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

添加交互基础类：

```css
/* ── 交互反馈 ──────────────────────────────── */
.press { transition: transform var(--duration-instant) var(--ease-out); }
.press:active { transform: scale(var(--scale-press)); }
.hover-lift { transition: transform var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out); }
.hover-lift:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
```

---

### 阶段 2：左侧 Tree 展开/折叠动画

**文件**: `components/layout/Sidebar.tsx`

**改动**：
1. 章节展开时，子列表使用 `animate-expand` 类实现高度动画
2. Section 按钮点击时添加 `press` 类的按压反馈
3. 活跃 Section 切换时使用 `transition-colors` + `transition-transform` 组合

```tsx
{/* 章节子列表 - 展开/折叠动画 */}
{open && hasSections && (
  <div className="animate-expand ml-[14px] mt-0.5 border-l border-[var(--line-soft)] pl-2">
    {ch.sections.map((sec) => {
      const active = sec.id === activeSectionId;
      return (
        <button
          key={sec.id}
          onClick={() => setActiveSection(ch.id, sec.id)}
          className={clsx(
            "press flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors",
            active
              ? "bg-[var(--accent-weak)] font-medium text-[var(--accent-ink)]"
              : "text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]",
          )}
        >
          ...
        </button>
      );
    })}
  </div>
)}
```

---

### 阶段 3：右侧面板 Tab 切换动画

**文件**: `components/layout/RightPanel.tsx`

**改动**：使用 `framer-motion` 的 `AnimatePresence` + `motion.div` 实现 Tab 内容的淡入/滑入动画。由于 Tab 切换时组件会卸载/挂载（条件渲染），必须使用 `AnimatePresence` 才能实现退场动画。

```tsx
"use client";

import dynamic from "next/dynamic";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useStore, type RightTab } from "@/lib/store";

// ... TABS 定义不变 ...

// Tab 内容切换动画配置
const tabVariants = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, x: -8, transition: { duration: 0.15, ease: [0.42, 0, 0.58, 1] } },
};

export default function RightPanel() {
  const tab = useStore((s) => s.rightTab);
  const setTab = useStore((s) => s.setRightTab);

  return (
    <div className="flex h-full flex-col border-l border-[var(--line)] bg-[var(--bg-panel)]">
      {/* Tab 按钮栏 - 添加 active indicator 滑动动画 */}
      <div className="flex shrink-0 items-center gap-1 border-b border-[var(--line)] px-2 py-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              "press relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
              tab === t.id
                ? "bg-[var(--accent-weak)] text-[var(--accent-ink)]"
                : "text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]",
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 内容 - AnimatePresence 包裹 */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {tab === "ai" && (
            <motion.div key="ai" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="h-full">
              <ChatPanel />
            </motion.div>
          )}
          {tab === "video" && (
            <motion.div key="video" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="h-full">
              <VideoTab />
            </motion.div>
          )}
          {tab === "interactive" && (
            <motion.div key="interactive" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="h-full">
              <InteractiveTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

**性能保障**：
- `AnimatePresence mode="wait"` 确保退场动画完成后才挂载新组件，避免同时渲染两个重型 Tab
- 动画仅使用 `opacity` + `transform`，GPU 加速，不触发布局重排
- Tab 切换的 `setTab` 可包裹 `startTransition`，进一步降低优先级

---

### 阶段 4：PiP 小窗动画增强

**文件**: `components/video/PipPlayer.tsx`

**改动**：
1. 添加关闭时的退场动画（`AnimatePresence` 包裹）
2. 添加最小化/还原动画
3. 添加拖拽时的视觉反馈（阴影增强 + 轻微缩放）
4. 添加 resize 时的平滑过渡

```tsx
// 关闭动画 + 拖拽视觉反馈
<motion.div
  drag
  dragControls={controls}
  dragListener={false}
  dragMomentum={false}
  initial={{ opacity: 0, scale: 0.85, y: 20 }}
  animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } }}
  exit={{ opacity: 0, scale: 0.85, y: 20, transition: { duration: 0.2 } }}
  whileDrag={{ scale: 1.02, boxShadow: "0 24px 60px rgba(20,24,40,0.25)" }}
  // ...
>
```

**AppShell.tsx 中包裹 AnimatePresence**：

```tsx
import { AnimatePresence } from "framer-motion";

// ...

<AnimatePresence>
  <PipPlayer />
</AnimatePresence>
```

---

### 阶段 5：笔记内容切换动画

**文件**: `components/notes/NotesPane.tsx`

**改动**：
1. 内容加载完成时使用 `animate-fade-in` 渐入
2. Skeleton 加载状态使用 `animate-shimmer` 替代 `animate-pulse`
3. 章节标题区域切换时微妙的过渡效果

```tsx
{loading ? (
  <div className="animate-shimmer space-y-3">
    {/* skeleton items */}
  </div>
) : content ? (
  <div key={sectionId} className="prose-notes animate-fade-in">
    <NoteRenderer content={content} />
  </div>
) : (
  <div key={sectionId} className="animate-fade-in">
    <EmptyNote ... />
  </div>
)}
```

---

### 阶段 6：交互组件卡片入场动画

**文件**: `components/interactives/InteractiveTab.tsx`

**改动**：LazyVisible 占位符使用 shimmer 动画，组件挂载后使用 `animate-scale-in` 入场

```tsx
<LazyVisible
  key={item.id}
  placeholder={<div className="h-48 rounded-xl border border-[var(--line)] bg-[var(--bg-muted)] animate-shimmer" />}
>
  <div className="animate-scale-in">
    <h3 ...>{item.title}</h3>
    <C />
  </div>
</LazyVisible>
```

---

### 阶段 7：全局交互反馈统一

**涉及文件**：多个组件中的按钮

**改动**：为关键交互按钮统一添加按压反馈

| 组件 | 元素 | 添加类 |
|------|------|--------|
| `Sidebar.tsx` | 章节按钮、Section 按钮 | `press` |
| `RightPanel.tsx` | Tab 按钮 | `press` |
| `NotesPane.tsx` | "问 AI"按钮、"看看交互内容"按钮 | `press` |
| `ChatPanel.tsx` | 发送按钮、建议按钮 | `press` |
| `VideoTab.tsx` | 视频卡片 | `hover-lift` |
| `ModelSwitch.tsx` | 模型切换按钮 | `press` |
| `SelectionPopover.tsx` | 弹出框按钮 | `press` |
| `directives.tsx` | InteractiveEmbed 卡片 | `hover-lift` |

---

### 阶段 8：content-visibility 长列表优化

**文件**: `app/globals.css`

添加 CSS 类：

```css
/* 长列表虚拟渲染 */
.content-auto {
  content-visibility: auto;
  contain-intrinsic-size: 0 48px;
}
```

**适用场景**：
- Sidebar 中的 Section 列表项
- ChatPanel 中的消息列表项

---

## 四、性能保障措施

1. **GPU-only 动画**：所有动画仅使用 `transform` 和 `opacity`，避免 `width`/`height`/`top`/`left` 等触发 layout 的属性
2. **will-change 提示**：对频繁动画的元素（如 PiP 拖拽）添加 `will-change: transform`
3. **prefers-reduced-motion**：为运动敏感用户完全禁用动画
4. **AnimatePresence mode="wait"**：Tab 切换时避免同时渲染两个重型组件
5. **CSS-first 策略**：简单过渡用 CSS，挂载/卸载动画才用 framer-motion
6. **framer-motion tree-shaking**：仅 import 需要的 API（`motion`、`AnimatePresence`），`optimizePackageImports` 已配置

## 五、文件修改清单

| 文件 | 改动类型 | 阶段 |
|------|----------|------|
| `app/globals.css` | 添加动画令牌、@keyframes、工具类、reduced-motion | 1 |
| `components/layout/Sidebar.tsx` | Tree 展开动画、按压反馈 | 2 |
| `components/layout/RightPanel.tsx` | AnimatePresence Tab 切换动画、按压反馈 | 3 |
| `components/video/PipPlayer.tsx` | 退场/拖拽/resize 动画增强 | 4 |
| `components/layout/AppShell.tsx` | AnimatePresence 包裹 PipPlayer | 4 |
| `components/notes/NotesPane.tsx` | 内容切换动画、shimmer skeleton | 5 |
| `components/interactives/InteractiveTab.tsx` | 卡片入场动画、shimmer 占位 | 6 |
| `components/chat/ChatPanel.tsx` | 按钮按压反馈 | 7 |
| `components/chat/ModelSwitch.tsx` | 按压反馈 | 7 |
| `components/video/VideoTab.tsx` | 视频卡片 hover-lift | 7 |
| `components/notes/SelectionPopover.tsx` | 按压反馈 | 7 |
| `components/notes/directives.tsx` | InteractiveEmbed hover-lift | 7 |

## 六、验证步骤

1. `npx tsc --noEmit` — TypeScript 编译零错误
2. `pnpm dev` — 开发服务器正常启动
3. 手动验证：
   - 左侧 Tree 展开/折叠有高度动画
   - 右侧 Tab 切换有淡入/滑入效果
   - PiP 小窗打开/关闭/拖拽有动画
   - 笔记切换有渐入效果
   - 交互组件卡片有缩放入场
   - 所有按钮有按压反馈
   - 视频卡片有 hover 浮起效果
   - `prefers-reduced-motion: reduce` 下动画被禁用
4. 性能验证：拖动面板调节间距时仍保持流畅（不因动画引入新卡顿）
