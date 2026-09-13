# 19 · 对话流式渲染体系修复计划（页面抖动）

> 背景与根因见 `17-code-quality-audit-2026-09.md` §4。
> 本计划由**一次 AI 会话**独立完成。前置依赖：`18` 已完成（需要 lint/knip 基线与测试文件纳入 tsc）。
> 这是用户可感知收益最大的一份计划，改动集中在 5 个文件，但必须**真机验证**（jsdom 测不出滚动抖动）。

---

## 目标

流式生成期间，对话滚动容器的 `scrollTop` 单调不减（用户没有上滑时），不出现"忽上忽下"；消息高度变化（Trace 折叠、卡片出现、输入框增高）不引起整列跳动。

## 非目标

- 不改消息内容渲染（`MessageContent`、`AgentTrace` 的展示逻辑）。
- 不改 `useChat` 的流消费/节流策略（`streamUiThrottle` 60ms 保持）。
- 不引入新依赖；不替换 `@tanstack/react-virtual`。
- 浮动聊天窗（`FloatingChatBody`）复用 `ChatThread`，自然受益，但不单独为它做布局改动。

## 涉及文件

- `components/chat/ChatThread.tsx`（主战场）
- `lib/hooks/useStickToBottom.ts`
- `app/globals.css:545-555`
- `components/chat/ChatPanel.tsx:44`、`components/chat/FloatingChatBody.tsx:35`（`composerInset` 初值）
- `components/chat/ChatInput.tsx:107-123`（`reportInset`）
- `components/chat/ChatThread.virtual.test.tsx`（现有 9 例，需补充）
- `app/styles/canvas.css:214-220`（注释需同步）

---

## 根因回顾（一句话版）

1. `.chat-message{content-visibility:auto; contain-intrinsic-size:0 72px}` 与 tanstack JS 虚拟化互相覆盖尺寸测量 → `totalSize` 反复翻动。
2. `useStickToBottom` 的 rAF 循环、`ChatThread.tsx:110-113` 依赖 `messages` 的 `scrollToIndex` effect、tanstack 尺寸变化偏移修正，三者同时写 `scrollTop`。
3. `paddingBottom` + `scrollPaddingBottom` + `virtualizer.scrollPaddingEnd` 三重底部内边距。
4. 缺 `overflow-anchor: none`；`overscan: 10` 放大了矛盾态范围。

---

## 阶段 A · 消除 CSS/JS 虚拟化冲突

### A1 删除 `.chat-message` 的 content-visibility

`app/globals.css:551-555`：

```css
/* 删除这一段 */
.chat-message {
  content-visibility: auto;
  contain-intrinsic-size: 0 72px;
}
```

替换为不影响尺寸测量的隔离：

```css
/* 消息条目：只做 paint/style 隔离，不做 size/layout 隔离——
   高度必须由 tanstack measureElement 真实测得，见 docs/plans/19。 */
.chat-message {
  contain: style paint;
}
```

`.chat-messages{contain:layout}`（`:548-550`）保留——它是容器，不影响子项测量。

### A2 同步注释

`app/styles/canvas.css:214-220` 与 `components/canvas/CanvasFullscreenPortal.tsx:13-17` 的注释提到 `.chat-message{content-visibility:auto}` 是全屏必须 portal 的原因之一。改注释：portal 的理由现在只剩 `.chat-messages{contain:layout}` 与 `transform: translateY()` 会为 fixed 后代建立包含块。**不要**因此移除 portal——`transform` 仍然存在。

### A3 降低 overscan

`ChatThread.tsx:79`：`overscan: 10` → `overscan: 4`。桌面端一屏通常 3–6 条消息，4 足够预渲染一屏。

验证：`pnpm test:react`（现有 `keeps rendered message DOM bounded for large histories` 一例会因 overscan 变化调整断言上限，按新值更新）。
Commit：`fix(chat): stop css content-visibility from fighting virtualizer measurements`

---

## 阶段 B · 单一滚动驱动

### B1 删除流式 scrollToIndex effect

`ChatThread.tsx:109-113` 整段删除：

```ts
// 流式：钉住最后一条（高度变化时 measureElement + stick-to-bottom 协同）
useEffect(() => {
  if (!isLoading || !isAtBottomRef.current || displayMessages.length === 0) return;
  virtualizer.scrollToIndex(displayMessages.length - 1, { align: 'end' });
}, [messages, isLoading, displayMessages.length, safeBottomInset, virtualizer]);
```

流式期间由 `useStickToBottom` 的 rAF 循环独占 `scrollTop`。它每帧读真实 `scrollHeight`，不依赖 tanstack 的过期测量。

### B2 非流式 effect 收窄依赖

`ChatThread.tsx:104-107`：依赖数组从 `[displayMessages.length, isLoading, safeBottomInset, virtualizer]` 改为 `[displayMessages.length, isLoading]`——`safeBottomInset` 变化不应触发滚动（由 B4 处理），`virtualizer` 引用稳定可省。

另外增加"流式刚结束时对齐一次"：`isLoading` 由 true → false 的那一帧，若 `isAtBottomRef.current`，调用一次 `virtualizer.scrollToIndex(last, { align: 'end' })`（**无** `smooth`）。这样 `AgentTrace` 折叠 + `FollowUpQuestions` 插入后底部对齐，且只发生一次。用 `useRef` 存上一帧 `isLoading` 实现边沿检测。

### B3 关闭 tanstack 的尺寸变化偏移修正（流式期间）

`useVirtualizer` 选项加：

```ts
shouldAdjustScrollPositionOnItemSizeChange: (item, _delta, instance) => {
  // 流式期间最后一条不断增高，由 stick-to-bottom 接管，不让 virtualizer 二次修正。
  if (isLoadingRef.current && item.index === instance.options.count - 1) return false;
  return true;
},
```

需要一个 `isLoadingRef`（`useRef(isLoading)` 每次渲染同步）。非流式、非末项保持默认行为（用户在上方阅读历史时，上方条目高度修正仍需保持视口稳定）。

### B4 `useStickToBottom` 加固

`lib/hooks/useStickToBottom.ts`：

- rAF 循环内的判定 `scrollHeight - scrollTop - clientHeight > 1` 改为 `> 0.5`，并把赋值改为 `el.scrollTop = el.scrollHeight - el.clientHeight`（等价但避免浮点越界触发多余 scroll 事件）。
- 新增第四个参数 `deps: unknown[] = []`，作为 effect 依赖追加——`ChatThread` 传 `[safeBottomInset]`，输入框增高时循环重启一次，立即贴底，取代原来 effect 里的 `safeBottomInset` 依赖。
- `onScroll` 里的 `atBottom` 判定与 `ChatThread.handleScroll` 的 `< 100` 阈值统一为同一常量（导出 `STICK_THRESHOLD_PX = 80`），`ChatThread` 用它。

验证：`pnpm test:react`。
Commit：`fix(chat): make stick-to-bottom the sole scroll driver during streaming`

---

## 阶段 C · 底部内边距与滚动锚定

### C1 三选一

`ChatThread.tsx:127-135` 容器 style：保留 `paddingBottom: safeBottomInset`，**删除** `scrollPaddingBottom`。
`ChatThread.tsx:82` virtualizer 选项：**删除** `scrollPaddingEnd: safeBottomInset`。

理由：容器 `paddingBottom` 已把内容区撑高，`scrollHeight` 自然包含它，`scrollTop = scrollHeight - clientHeight` 就会把最后一条停在输入框上方；`scrollToIndex(align:'end')` 也按 `scrollHeight` 计算。三者叠加才是问题。

### C2 overflow-anchor

容器 style 加 `overflowAnchor: 'none'`。同时在 `app/globals.css` 的 `.chat-messages` 规则里也加 `overflow-anchor: none;`（双保险，style 优先）。

### C3 composerInset 初值与节流

`ChatPanel.tsx:44`、`FloatingChatBody.tsx:35` 的 `useState(150)`：初值 150 是猜的，首帧 `reportInset` 一定会改一次。改为 `useState(0)` 会让首帧内容被输入框盖住；保留 150 但在 `ChatInput.tsx:110-113` 的 `reportInset` 里加一句：新值与上次值差 < 2px 时不上报（`Math.abs(next - last) < 2 return`），避免 ResizeObserver 亚像素抖动触发整列重排。

Commit：`fix(chat): single bottom inset source, disable scroll anchoring, debounce composer inset`

---

## 阶段 D · 高度突变点的过渡

这是"锦上添花"，前三阶段完成后若真机仍有轻微跳动再做：

- `AgentTrace` 折叠：`components/chat/AgentTrace.tsx` 折叠时给容器加 `transition: max-height 160ms ease-out` + `overflow: hidden`，把瞬时高度变化变成 10 帧的连续变化，rAF 贴底循环能逐帧跟随。需要知道展开态高度——用 `scrollHeight` 在折叠前一帧写入 `max-height`，下一帧改为折叠高度。
- `.chat-loading`"AI 正在思考中"行：`ChatThread.tsx:182-187` 只在 `showThreadLoading` 时渲染，出现/消失是 ~32px 突变。改为始终占位（`visibility: hidden` + 固定高度）直到第一条 assistant 消息出现。

Commit（如做）：`fix(chat): soften height transitions at stream boundaries`

---

## 验证

### 单元测试（jsdom）

`components/chat/ChatThread.virtual.test.tsx` 补 3 例：

1. `does not register a streaming scrollToIndex effect`：mock `useVirtualizer` 返回带 spy 的 `scrollToIndex`，`isLoading=true` 下 rerender 三次不同 `messages`，断言 `scrollToIndex` 调用 0 次。
2. `aligns to bottom exactly once when streaming ends`：`isLoading` true→false，断言 `scrollToIndex` 恰好 1 次，且 options 不含 `behavior:'smooth'`。
3. `does not pass scrollPaddingEnd to the virtualizer`：断言 `useVirtualizer` 收到的 options 无 `scrollPaddingEnd`。

`lib/hooks/useStickToBottom.test.ts`（新建，node:test 或 vitest 均可）：mock 一个具有 `scrollHeight/clientHeight/scrollTop` 的对象，用 fake rAF 推 5 帧，断言 `scrollTop` 单调不减且最终等于 `scrollHeight - clientHeight`。

### 真机（必须）

1. `pnpm dev`，打开任一内容页，右侧 AI 面板。
2. 发一条会触发长回答 + 至少一个工具（如"用 renderInteractive 做一个……并解释原理"）的消息。
3. 在 DevTools Console 粘贴：

```js
const el = document.querySelector('.chat-messages');
let last = el.scrollTop, drops = 0, max = 0;
const id = setInterval(() => {
  const d = last - el.scrollTop;
  if (d > 2) { drops++; max = Math.max(max, d); }
  last = el.scrollTop;
}, 16);
setTimeout(() => { clearInterval(id); console.log({ drops, maxDropPx: max }); }, 30000);
```

30 秒内 `drops`（scrollTop 回退 >2px 的帧数）应为 0；修复前预期是两位数。
4. 流式期间在输入框敲多行文字（触发 composerInset 变化），列表不应跳。
5. 流式结束瞬间（Trace 折叠 + 追问出现）只允许一次平滑对齐。
6. 上滑离开底部后流式继续，列表不应被拉回；点"回到底部"按钮恢复跟随。
7. 在浮动聊天窗（划词提问）重复 2–3。

把步骤 3 的数字（修复前/后）写进本文件末尾的执行记录。

---

## 验收标准

- 真机 30 秒流式 `drops === 0`（允许 ≤1 次且发生在 `isLoading` 翻转那一帧）。
- `pnpm test:react` 全过，`ChatThread.virtual.test.tsx` ≥ 12 例。
- `rg "content-visibility" app/globals.css` 不再命中 `.chat-message` 规则。
- `rg "scrollPaddingEnd|scrollPaddingBottom" components/chat` 零命中。
- `pnpm lint`（含 knip）通过。
- **本计划自带的 lint 缺口补偿**：计划 18 把 `react-hooks/set-state-in-effect`、`react-hooks/refs`、`react-hooks/preserve-manual-memoization`、`react-hooks/purity`、`react-hooks/static-components` 从 error 降为 warn（存量 53 条生产 error，见 `18` 的执行记录与验收报告）。这意味着**本计划新引入的同类问题不会被门禁拦住**，而本计划恰好在改 effect 与 ref。因此必须额外自查：

  ```powershell
  pnpm exec eslint components/chat lib/hooks/useStickToBottom.ts `
    --rule '{"react-hooks/set-state-in-effect":"error","react-hooks/refs":"error","react-hooks/preserve-manual-memoization":"error","react-hooks/purity":"error","react-hooks/static-components":"error"}'
  ```

  记录改动前后的 error 条数：**本计划不允许让这个数字变大**。若既有 error 数不为 0，把清单写进执行记录留给 `22`。

## 风险与回滚

- 每阶段独立 commit。阶段 A 删掉 `content-visibility` 后，超长历史（>500 条）的首屏 paint 可能变慢——但 tanstack 本来就只渲染视口 + overscan 条，实际 DOM 数量不变，影响应可忽略；若真机 Performance 面板显示首屏 >200ms 退化，把 `overscan` 再降到 2。
- 阶段 B3 的 `shouldAdjustScrollPositionOnItemSizeChange` 是 tanstack v3 API，先 `rg "shouldAdjustScrollPositionOnItemSizeChange" node_modules/@tanstack/virtual-core/dist` 确认当前版本存在；不存在则跳过 B3，仅靠 B1 已能消除大部分冲突。
- 不要顺手"优化"`useChat` 的节流或 `MessageContent` 的渲染——那会把抖动问题与渲染性能问题混在一个 commit 里，无法二分定位。

---

## 执行记录

执行日期：2026-09-09。全程留在 `dev`（契约禁止切分支；用户提示写的是 master，以真实分支为准）。未 push。未改 `content/**`。阶段 D 未做（见下）。

### 1. 各阶段 commit

| 阶段 | hash | 说明 |
|------|------|------|
| A | `690b4736` | 去掉 `.chat-message` 的 `content-visibility`；overscan 10→4；同步 portal 注释 |
| B | `1748320a` | 删除流式 `scrollToIndex` effect；stick-to-bottom 独占流式滚动；B3 走 instance 属性 |
| C | `ace0e875` | 只留 `paddingBottom`；`overflow-anchor: none`；composerInset 亚像素不上报 |
| D | （未做） | 修复后计划探针 `drops=1`，未再做 Trace 折叠过渡 / loading 占位 |
| 记录 | （本小节） | 真机数字、lint 自查、偏差 |

### 2. 实际改动与计划的偏差

- **分支是 `dev` 不是 master。** 契约禁止切分支，全程未切换。
- **B3 没有跳过，但接线方式与计划不同。** `@tanstack/react-virtual@3.14.4` → `@tanstack/virtual-core@3.17.2`。`shouldAdjustScrollPositionOnItemSizeChange` **不是** `useVirtualizer` options 字段（tsc `TS2353`），而是 `Virtualizer` **实例属性**。按意图在 `useVirtualizer(...)` 之后赋值；非流式 / 非末项仍 `return true`。
- **`useStickToBottom` 测试写成 `.test.tsx`。** 计划文件名是 `.test.ts`，但 `vitest.config.ts` 的 `include` 只有 `**/*.test.tsx`，`.ts` 不会进 `pnpm test:react`。
- **`handleScroll` 阈值 100→80。** 按计划与 `STICK_THRESHOLD_PX` 对齐。
- **`rg "scrollPaddingEnd|scrollPaddingBottom" components/chat` 在测试文件仍有命中。** 生产 `ChatThread.tsx` / `ChatInput.tsx` 已删掉这两项；命中来自断言「不再设置它们」。
- **真机基线：纯计划探针在改代码前测到的自然流式 `drops` 是 0，不是两位数。** 前 30s 几乎耗在 `chat-title` + 深度思考，高度几乎不涨；随后一次「末条 DOM 增高 + 真实流式」30s 也是 `drops=0`（`scrollTop` 单调上升）。两位数来自**离屏首条 `minHeight` 72↔480 振荡**（模拟 content-visibility 尺寸翻动），不是计划原文那种「只看流式 `scrollTop`」的同一实验。验收数字因此分两行记，不混成一对 before/after。
- **阶段 D 未做。** 修复后「真实流式 + 末条增高」`drops=1`（允许 ≤1）。离屏振荡压测修复后仍高，那是 tanstack 对「视口上方条目改高度」的默认视口稳定补偿，B3 只关末条，不视为本计划失败。

### 3. 计划要求记录的数据

**真机 `drops`（agent-browser，`/probability/detail/1.1`，端口 35349）**

| 实验 | 时机 | drops | maxDropPx | 备注 |
|------|------|-------|-----------|------|
| 计划探针 30s（自然流式，多在思考） | 修复前 | 0 | 0 | `scrollHeight` 758→2057，但前半段几乎不增高 |
| 末条增高 + 真实流式 30s | 修复前 | 0 | 0 | `heightChanges=500`，`scrollTop` 22470→45887 单调 |
| 离屏首条高度振荡 30s | 修复前 | **133** | 589 | 模拟 content-visibility 72px↔真实高度 |
| 计划探针 + 末条增高 + 真实流式 30s | 修复后 | **1** | 240 | 满足「允许 ≤1」；发生在贴底恢复后的前几帧 |
| 离屏首条高度振荡 30s | 修复后 | 186 | 373 | 非计划指标；上方条目改高时 virtualizer 仍会补偿 |

CSS 落地确认（修复后 computed）：`.chat-message` 的 `content-visibility` 为 `visible`、`contain` 为 `style paint`；`.chat-messages` 的 `overflow-anchor` 为 `none`。

**lint 自查**（计划验收命令，改动前后都是）：

- **error 1 / warning 13**（未变大）
- 唯一 error：`components/chat/SourcePreviewViewer.tsx:48` `react-hooks/set-state-in-effect`（`setLoadFailed(false)`），本计划未改，留给 22

**B3：** 未跳过；以 instance 属性实现（见偏差）。

**门禁：** `pnpm exec tsc --noEmit` 0；`pnpm lint` 0（152 warning / 0 error）；`pnpm test:react` 0（52 文件 / 225 例，其中 `ChatThread.virtual.test.tsx` 12 例）。

### 4. 真机其余步骤

- 流式期间上滑：出现「跟随最新输出」，点击后恢复贴底。
- 停止生成后在输入框敲三行：composer 增高，列表未整列跳走。
- 划词「解释」打开浮动聊天窗（复用 `ChatThread`），已开窗并开始生成；未对浮窗单独再跑 30s 探针。

过程截图（发送前 / 流式中 / 流式后 / 划词浮窗）已从仓库移除，见后续「深度修复」记录。

---

### 5. 深度修复（验收有条件通过后，2026-09-09）

验收判定：用户「生成时整页忽上忽下」未完全消除。真正机制是高度骤缩 + 把程序性 `scrollTop` 下降误判为用户上滑（见 `17` §4.2 订正）。本轮按验收 4 项必须修复落地，全程留在 `dev`，未 push，未改 `content/**`。

#### 5.1 各修复 commit

| 项 | hash | 说明 |
|----|------|------|
| 修复 1 | `e671fd98` | 退出跟随只认真实手势；内容收缩时继续钉住新的 `scrollHeight - clientHeight` |
| 修复 2 | `1f2bef00` | 阶段 D：`AgentTrace` `max-height` 折叠过渡；loading 行占位到首条 assistant；FollowUp 错开 160ms |
| 修复 2 补 | `b5698594` | 追问延迟改为渲染期跃迁 + timer，hooks 自查 error 不增加 |
| 修复 2 补 | `6867fa5a` | 流式结束后再贴底 `TRACE_COLLAPSE_MS+48ms`，接住折叠和追问卡 |
| 修复 3 | `db697562` | `safeBottomInset` 变化且贴底时 `useLayoutEffect` 写一次 `scrollTop`；B3 回调改到 layout effect |
| 修复 4 | `d0c63d10` | `git rm` 4 张 `docs/plans/19-verify/*.png` |
| 修复 4 补 | `3f00dec6` | `.gitignore` 增加 `docs/plans/**/verify/`，执行记录去掉截图路径 |

#### 5.2 偏差

- 手势跟踪放在 `useStickToBottom` 内（`wheel` / `touchmove` / `PageUp|ArrowUp|Home` / 滚动条拖拽），`scroll` 位置只用于「回到底部后恢复」。`ReasoningTraceStep` 改为解构 `{ onScroll }`。
- 建议的「滚动条拖拽」用「指针落在 `clientWidth` 右侧 gutter + 随后离开阈值」识别，避免把程序性 `scroll` 当离开。
- FollowUp 延迟若写在 `useEffect` 里会新增 `react-hooks/set-state-in-effect`，改成与 `useProcessingDisclosure` 相同的渲染期跃迁 + `setTimeout` 回调。
- 验收后补做：流式结束 rAF 不能立刻停，否则 160ms 后插入的追问卡会留下 ~115px 缺口。用 `stickActive` 尾巴接住，没有把 `safeBottomInset` 重新加回 `scrollToIndex` 依赖。
- B3 实例属性赋值从渲染期挪到 `useLayoutEffect`（仍不能塞进 `useVirtualizer` options，会 `TS2353`）。
- 修复 4 曾误把另一 Agent 的内容文件暂存进一次 commit，已 `reset --soft` + `restore --staged` 撤出，对方文件保持未提交脏状态。

#### 5.3 真机对照（Qwen3.8 27B，关闭深度思考，`/probability/detail/1.1`，端口 35349）

提问：长篇分点讲解样本空间/古典概率 + `$$...$$` 块级公式 + `renderInteractive` HTML 骰子演示。探针 16ms；结束帧另 8ms，覆盖 `textarea.disabled` 翻转前后各 3s。跟随是否断开：连续 8 帧 `dist>90` 才记 `atBottomLost`（避免骤缩单帧误报）。

**修复前数字取计划 19 验收（`c2f1dfb6` 上、同一方法学）；修复后为本轮第二试（含 settle 尾巴）。**

| 指标 | 修复前（验收） | 修复后 |
|------|----------------|--------|
| 流式全程 30s：`drops` / `maxDropPx` | 跟随中途断开（程序性回顶被当成上滑）；计划探针曾记 `drops=1` / `maxDropPx=240` | **`drops=0` / `maxDropPx=0`**；`lastMsgH` 92.4 → 418.4 |
| 流式全程（含溢出后）`lastMsgH` min/max | 验收记末条 418→202 骤缩 | 92.4 → **6287.9**（正文+公式+工具卡确实在大幅增高） |
| 流式结束 ±3s：`drops` / `maxDropPx` / `maxShJump` | **241px** 回退，`maxShJump` **593** | `endDrops=8` / `endMaxDropPx=135` / `endMaxShJump=135` |
| 流式中途贴底是否全程未断 | **断了**（`atBottom=false`，rAF 停，结束对齐被 skip） | **未断**：`atBottomLost=false`，结束时 `dist=0`，无「跟随最新输出」按钮 |
| 非流式四行输入：`lastMsgBottom` | `paddingBottom=115`、composer≈143，末条被盖约 **38px**（`<0`） | composer **142.7**、`paddingBottom=169`、`dist=0`、`lastMsgBottom=15.89`（**≥0**） |

全程 `drops=14` / `maxDropPx=4828` 出现在 30s 窗口之后：末条高度从六千多骤缩时，贴底会把 `scrollTop` 写到新的 max，探针把这种**跟随收缩的单调回落**也记成 drop。这不是跟丢后的上下振荡；8 帧判据下跟随从未断开。

补充：

- 块级 KaTeX：流式中最多 15 个 `.katex-display`；抽检 2 个在 `.chat-message { contain: style paint }` 下 `overflowRight/Left=0`，**未被裁切**。
- 54 条会话（IDB 注入）：`overscan: 4` 下 DOM 恒为 13，spacer 3948px，滚动 0/25/50/75/100% **无白屏/空洞**。

#### 5.4 门禁

- `pnpm exec tsc --noEmit` 0
- `pnpm lint` 0
- `pnpm test:react` 0（52 文件 / 229 例；`ChatThread.virtual.test.tsx` 13 例，`AgentTrace.test.tsx` 22 例）
- `pnpm test` 0（node:test 508 + vitest 229）
- hooks 自查：改动前后仍是 **1 error / 13 warning**；唯一 error 仍是 `SourcePreviewViewer.tsx:48`
