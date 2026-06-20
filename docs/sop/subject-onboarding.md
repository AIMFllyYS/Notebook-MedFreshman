# 多学科接入 SOP

本手册描述如何向「概率论与数理统计」学习平台接入一个新学科（如大学物理、大学化学、中国近现代史纲要、毛概等）。所有示例以 `physics`（大学物理）为样板，其他学科将 `physics` 替换为目标 `SubjectId` 即可。

> 类型约束：`SubjectId` 定义于 `lib/types/content.ts`，可选值为
> `'probability' | 'physics' | 'chemistry' | 'modern-history' | 'maogai' | 'other'`。
> 新增学科需先在此类型中追加字面量，并在 `app/[subject]/[category]/[id]/page.tsx` 的 `VALID_SUBJECTS` 集合中同步追加。

---

## 1. 目录结构规范

新学科需要创建以下目录（以 `physics` 为例）：

```
components/
└── interactives/
    └── physics/                  # 交互组件根目录
        ├── ch01/                 # 按章组织
        │   └── MotionExplorer.tsx
        └── ch02/

content/
├── chapters/                     # 概率论沿用此目录（特例）
└── physics/                      # 其他学科推荐结构（被 API 路由自动识别）
    └── detail/                   # 分类子目录（与 CategoryId 对应）
        └── 1.1.md

public/
└── media/
    └── videos/
        └── physics/              # 视频文件目录
            └── ch01/
                └── physics-ch01-1.1-motion.mp4
```

### 路径约定

| 资源类型 | 概率论路径（特例） | 其他学科路径（通用） |
|---------|------------------|------------------|
| Markdown 详解 | `content/chapters/chXX/X.Y.md` | `content/{subject}/{category}/{itemId}.md` |
| 交互组件 | `components/interactives/probability/chXX/` | `components/interactives/{subject}/chXX/` |
| 视频文件 | `public/media/videos/chXX/` | `public/media/videos/{subject}/chXX/` |

> **注意**：Markdown 路径解析逻辑位于 `app/api/section/route.ts` 的 `readContentFile` 函数。概率论走特例分支（`content/chapters/`），其他学科走通用分支（`content/{subjectId}/{categoryId}/{itemId}.md`）。新学科推荐使用通用结构。

---

## 2. registry 注册步骤

交互组件通过 `components/interactives/registry.ts` 的 `interactives` 数组注册。每个条目是一个 `InteractiveMeta` 对象。

### InteractiveMeta 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 全局唯一标识，建议格式 `{subject}-ch{XX}-{sectionId}-{slug}`，被 Markdown `::interactive{id=...}` 引用 |
| `subjectId` | `SubjectId` | 是 | 学科 id，必须与 `SubjectId` 类型字面量一致 |
| `chapterId` | `string` | 是 | 章 id，如 `ch01`，与 store 中 `activeChapterId` 对应 |
| `sectionId` | `string` | 是 | 小节 id，如 `1.1`，与路由 `[id]` 段对应 |
| `title` | `string` | 是 | 显示标题，出现在右侧「可交互」Tab 和正文嵌入处 |
| `description` | `string` | 否 | 一句话描述 |
| `Component` | `ComponentType<Record<string, never>>` | 是 | 通过 `dynamic(() => import('...'), { ssr: false })` 懒加载的组件 |

### 示例代码（physics 学科）

在 `registry.ts` 的 `interactives` 数组中追加：

```typescript
{
  subjectId: "physics",
  id: "physics-ch01-1.1-motion",
  chapterId: "ch01",
  sectionId: "1.1",
  title: "匀变速直线运动探索器",
  description: "调初速度 v₀、加速度 a、时间 t，实时绘制 x-t / v-t 图像，直观体会运动学方程。",
  Component: dynamic(() => import("./physics/ch01/MotionExplorer"), { ssr: false }),
},
```

### dynamic import 路径规范

- 路径相对于 `registry.ts` 文件，前缀为 `./{subject}/ch{XX}/{ComponentName}`
- 必须使用 `dynamic(() => import(...), { ssr: false })` 以避免 SSR 时引用浏览器 API
- 组件文件需有默认导出（`export default ...`）
- 组件 Props 类型应为 `Record<string, never>`（无 props），如需配置应通过内部 state 实现

### 查询函数（已内置，无需修改）

注册后，以下两个函数自动生效：

- `getInteractive(id)` — 通过 id 查找单个条目（被 `directives.tsx` 的 `InteractiveEmbed` 使用）
- `getInteractivesForSection(subjectId, chapterId, sectionId)` — 按学科+章+节过滤（被 `InteractiveTab.tsx` 使用）

---

## 3. media 清单格式

视频清单位于 `content/media.generated.ts`，导出 `generatedVideos: VideoEntry[]` 数组。该文件标注为「由 `manim/render.py` 自动生成」，但接入新学科时需手动追加条目（或扩展渲染脚本）。

### VideoEntry 字段说明

字段定义于 `lib/content/types.ts`：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 全局唯一标识，被 Markdown `::video{id=...}` 引用 |
| `subjectId` | `SubjectId` | 是 | 学科 id |
| `chapterId` | `string` | 是 | 章 id，如 `ch01` |
| `sectionId` | `string` | 是 | 小节 id，如 `1.1` |
| `title` | `string` | 是 | 视频标题 |
| `src` | `string` | 是 | 相对 `public` 的路径，如 `/media/videos/physics/ch01/xxx.mp4` |
| `poster` | `string` | 否 | 封面图路径（相对 `public`） |
| `duration` | `number` | 否 | 时长（秒） |
| `description` | `string` | 否 | 一句话描述 |

### 示例条目

在 `media.generated.ts` 的 `generatedVideos` 数组中追加：

```typescript
{
  "subjectId": "physics",
  "id": "physics-ch01-1.1-motion",
  "chapterId": "ch01",
  "sectionId": "1.1",
  "title": "匀变速直线运动",
  "src": "/media/videos/physics/ch01/physics-ch01-1.1-motion.mp4",
  "poster": "/media/videos/physics/ch01/physics-ch01-1.1-motion.jpg",
  "duration": 95,
  "description": "用动画展示 v-t 图下的面积即为位移，直观推导 x = v₀t + ½at²。"
},
```

### 注意事项

1. **id 唯一性**：`id` 在全局 `generatedVideos` 数组中必须唯一，建议加学科前缀避免与概率论条目冲突。
2. **src 路径**：以 `/` 开头，相对 `public` 目录。文件需实际存在于 `public/media/videos/{subject}/chXX/` 下，否则点击播放会 404。
3. **自动生成标记**：文件头部注释为「自动生成，请勿手动编辑」。若手动追加，建议在条目上方加注释 `// [MANUAL] physics 学科手动追加` 以便后续脚本识别。
4. **查询函数**：`getVideo(id)` 和 `getVideosForSection(subjectId, chapterId, sectionId)` 已在 `content/media.ts` 中实现，新条目自动生效。

---

## 4. Markdown 指令用法

正文 Markdown 通过 `lib/markdown/remarkDirectives.ts` 插件扩展了三类指令，由 `components/notes/directives.tsx` 渲染。

### 4.1 媒体嵌入指令（叶子指令 `::`）

#### 视频嵌入

```markdown
::video{id=physics-ch01-1.1-motion}
```

渲染为可点击的视频卡片，点击后在小窗（PiP）中播放。`id` 必须与 `media.generated.ts` 中的 `VideoEntry.id` 一致；若未找到，显示「动画视频「{id}」即将生成」占位。

#### 交互嵌入

```markdown
::interactive{id=physics-ch01-1.1-motion}
```

渲染为交互组件卡片，懒加载并执行注册的 React 组件。`id` 必须与 `registry.ts` 中的 `InteractiveMeta.id` 一致；若未找到，显示「交互组件「{id}」即将生成」占位。

### 4.2 Callout 指令（容器指令 `:::`）

六种 callout 类型，对应不同样式：

```markdown
:::definition{label=事件的包含}
设 $A, B$ 是同一样本空间 $\Omega$ 上的两个事件……
:::

:::theorem{label=全概率公式}
$$
P(A) = \sum_{i=1}^{n} P(B_i) P(A|B_i)
$$
:::

:::example{label=掷骰子}
掷一颗骰子，求出现偶数点的概率。
:::

:::insight{label=频率含义}
大量重复试验中，频率会稳定在概率附近。
:::

:::pitfall{label=常见错误}
$P(A|B) \neq P(B|A)$，除非 $P(A) = P(B)$。
:::

:::note
补充说明文字。
:::
```

| 指令名 | 标签 | 用途 |
|--------|------|------|
| `definition` | 定义 | 概念定义 |
| `theorem` | 定理 | 定理陈述 |
| `example` | 例 | 例题 |
| `insight` | 直觉 | 直观解释 |
| `pitfall` | 易错点 | 常见错误提醒 |
| `note` | 注 | 一般备注 |

`label` 属性可选，会追加在标签后（如「定理 · 全概率公式」）。

### 4.3 推导过程指令（容器指令 `:::derivation`）

```markdown
:::derivation{label=方差展开推导}
由定义 $D(X) = E[(X-EX)^2]$，展开平方：

$$
D(X) = E[X^2 - 2X \cdot EX + (EX)^2]
$$

由期望线性性：

$$
D(X) = E[X^2] - 2(EX)^2 + (EX)^2 = E[X^2] - (EX)^2
$$
:::
```

渲染为可折叠的 `<details>` 元素，默认折叠，点击展开。`label` 默认为「推导过程」。

### 4.4 数学公式

正文支持 LaTeX 数学公式（通过 `remark-math` + `rehype-katex`）：

- 行内公式：`$E(X)$`
- 行间公式：`$$` **必须独占一行**：

```markdown
$$
D(X) = E[X^2] - (EX)^2
$$
```

> **铁律：`$$` 必须独占一行**，前后不能有任何其他字符。`$$content$$` 单行写法或 `\end{aligned}$$` 行尾写法会导致 `mathFlow` tokenizer 无法识别闭合 fence，后续所有内容被吞噬为 raw math text，渲染崩溃。

---

## 5. 原语组件复用指南

Phase 4 创建了 4 个可视化原语，位于 `components/visualizations/primitives/`，统一从 `@/components/visualizations` 导入。每个原语支持「静态模式」和「交互模式」。

### 5.1 VennDiagram

```typescript
import { VennDiagram } from '@/components/visualizations';

<VennDiagram
  a={0.6}           // P(A)，默认 0.6
  b={0.5}           // P(B)，默认 0.5
  ab={0.2}          // P(A∩B)，默认 0.2
  interactive={true} // 是否启用滑块调参，默认 false
  onChange={(a, b, ab) => console.log(a, b, ab)}  // 数值变化回调
  highlightMode="union"  // 高亮模式预设，与 highlightRegions 二选一
  highlightRegions={['a', 'b', 'ab']}  // 显式高亮区域，优先于 highlightMode
/>
```

**类型定义**：

```typescript
type VennRegion = 'a' | 'b' | 'ab' | 'out';
type VennHighlightMode = 'union' | 'intersection' | 'difference' | 'complement' | 'symmetric-difference';
```

**高亮模式预设映射**：

| 模式 | 区域 | 含义 |
|------|------|------|
| `union` | a, b, ab | A ∪ B |
| `intersection` | ab | A ∩ B |
| `difference` | a | A − B |
| `complement` | out | (A ∪ B)ᶜ |
| `symmetric-difference` | a, b | A △ B |

**使用场景**：
- 静态模式（`interactive=false`）：在正文或 AI 对话中展示固定概率值的维恩图
- 交互模式（`interactive=true`）：在右侧「可交互」Tab 中让用户拖动滑块体会概率约束
- 复用示例：`components/interactives/probability/ch01/VennPlayground.tsx` 通过 `highlightRegions` 切换不同运算的高亮区域

### 5.2 DistributionChart

```typescript
import { DistributionChart } from '@/components/visualizations';

<DistributionChart
  type="normal"       // 'normal' | 'binomial' | 'poisson'
  params={{ mu: 0, sigma: 1 }}  // 参数对象，按 type 不同取不同字段
  interactive={true}  // 是否启用参数滑块，默认 false
/>
```

**参数说明**：

| type | 参数字段 | 默认值 |
|------|---------|--------|
| `normal` | `mu`（均值）, `sigma`（标准差） | 0, 1 |
| `binomial` | `n`（试验次数）, `p`（成功概率） | 10, 0.5 |
| `poisson` | `lambda`（参数） | 3 |

**使用场景**：
- 静态模式：在正文中展示特定参数下的分布曲线/柱状图
- 交互模式：让用户调节参数观察分布形状变化

### 5.3 FormulaSteps

```typescript
import { FormulaSteps } from '@/components/visualizations';

<FormulaSteps
  steps={[
    '由定义 $D(X) = E[(X-EX)^2]$',
    '展开平方 $D(X) = E[X^2 - 2X \\cdot EX + (EX)^2]$',
    '由期望线性性 $D(X) = E[X^2] - (EX)^2$',
  ]}
  interactive={true}  // 是否启用上一步/下一步导航，默认 false
/>
```

**使用场景**：
- 静态模式（`interactive=false`）：展示完整编号步骤列表，适合正文阅读
- 交互模式（`interactive=true`）：单步显示 + 上一步/下一步按钮，适合 AI 对话中逐步引导

每个 step 字符串支持行内 LaTeX（`$...$`）和行间 LaTeX（`$$...$$`），由 KaTeX 渲染。

### 5.4 VideoPlayer

```typescript
import { VideoPlayer } from '@/components/visualizations';

<VideoPlayer
  src="/media/videos/physics/ch01/xxx.mp4"  // 视频 src（相对 public）
  title="匀变速直线运动"                      // 标题，可选
  poster="/media/videos/physics/ch01/xxx.jpg" // 封面，可选
/>
```

**特性**：
- HTML5 `<video>` + 自定义控件（播放/暂停、静音、进度条、时间显示）
- 「小窗播放」按钮：构造 `VideoEntry` 并调用 `useStore.openPip`，由全局 `PipPlayer` 接管
- 默认 `subjectId='probability'`，可通过 `subjectId` prop 指定（影响 PiP 入口的学科标记）

### 5.5 静态模式 vs 交互模式选择指南

| 场景 | 推荐模式 | 理由 |
|------|---------|------|
| 正文 Markdown 嵌入 | 静态 | 正文以阅读为主，避免分散注意力 |
| 右侧「可交互」Tab | 交互 | 鼓励用户动手探索 |
| AI 对话回复 | 视情况 | 解释概念用静态，引导推导用交互 |
| 概率论详解（detail） | 交互 | 详解目标是深度理解 |

---

## 6. AI 对话 XML 标签扩展方法

AI 对话中的可视化通过 XML 标签触发，由 `components/chat/ChatMessageVisualizations.tsx` 的 `switch` 语句分发到原语。

### 当前支持的标签

| XML 标签 | 分发原语 | Props 映射 |
|---------|---------|-----------|
| `<InteractiveVenn>` | `VennDiagram` | `a`, `b`, `ab`, `interactive` |
| `<InlineDistribution>` | `DistributionChart` | `type`, `mu`, `sigma`, `n`, `p`, `lambda`, `interactive` |
| `<FormulaSteps>` | `FormulaSteps` | `steps`（来自 childrenText 按行分割）, `interactive` |
| `<ManimPlayer>` | `VideoPlayer` | `src`, `title`, `poster` |

### switch 分发逻辑

`ChatMessageVisualizations` 接收 `{ tagName, props, childrenText }`：

- `tagName`：XML 标签名（字符串）
- `props`：XML 属性对象（所有值均为字符串，需通过 `toNum` / `toBool` 转换）
- `childrenText`：标签内文本内容

```typescript
switch (tagName) {
  case 'InteractiveVenn':
    return <VennDiagram a={toNum(props.a)} b={toNum(props.b)} ab={toNum(props.ab)} interactive={toBool(props.interactive)} />;
  case 'InlineDistribution':
    return <DistributionChart type={props.type || 'normal'} params={...} interactive={toBool(props.interactive)} />;
  case 'FormulaSteps':
    return <FormulaStepsPrimitive steps={childrenText.split('\n').map(s => s.trim()).filter(Boolean)} interactive={toBool(props.interactive)} />;
  case 'ManimPlayer':
    return <VideoPlayer src={props.src} title={props.title} poster={props.poster} />;
  default:
    return null;
}
```

### 如何添加新标签

为新学科扩展可视化标签的步骤：

1. **确认原语已存在**：若复用现有 4 个原语，跳到步骤 2；若需要新原语，先在 `components/visualizations/primitives/` 创建并导出。

2. **在 `ChatMessageVisualizations.tsx` 的 `switch` 中增加 `case`**：

```typescript
case 'PhysicsFreeBodyDiagram':
  return <PhysicsFreeBodyDiagram
    mass={toNum(props.mass)}
    angle={toNum(props.angle)}
    friction={toNum(props.friction)}
    interactive={toBool(props.interactive)}
  />;
```

3. **在 AI 系统提示词中声明该标签**：让 AI 知道何时输出该标签及可用属性（系统提示词维护在 `app/api/chat/route.ts` 或对应的 prompt 配置文件中）。

4. **类型转换约定**：
   - 数值属性用 `toNum(props.xxx)`（自动处理 undefined / 空字符串）
   - 布尔属性用 `toBool(props.xxx)`（仅 `'true'` 或 `true` 返回 true）
   - 字符串属性直接使用 `props.xxx`

5. **导入新原语**：在文件顶部从 `@/components/visualizations` 导入（若已通过 `primitives/index.ts` 导出）。

---

## 7. 完整接入示例（以 physics 学科为例）

以下是从零接入 physics 学科第 1 章第 1 节「匀变速直线运动」的端到端流程。

### 步骤 1：创建交互组件目录与文件

```
components/interactives/physics/ch01/MotionExplorer.tsx
```

```typescript
"use client";
import { useState } from "react";

export default function MotionExplorer() {
  const [v0, setV0] = useState(0);
  const [a, setA] = useState(2);
  const [t, setT] = useState(3);
  const x = v0 * t + 0.5 * a * t * t;
  const v = v0 + a * t;
  // ... 渲染滑块 + x-t / v-t 图像
  return (/* ... */);
}
```

### 步骤 2：在 registry.ts 注册条目

在 `components/interactives/registry.ts` 的 `interactives` 数组末尾追加：

```typescript
{
  subjectId: "physics",
  id: "physics-ch01-1.1-motion",
  chapterId: "ch01",
  sectionId: "1.1",
  title: "匀变速直线运动探索器",
  description: "调 v₀、a、t，实时绘制 x-t / v-t 图像。",
  Component: dynamic(() => import("./physics/ch01/MotionExplorer"), { ssr: false }),
},
```

### 步骤 3：创建视频文件

将渲染好的 mp4 放到：

```
public/media/videos/physics/ch01/physics-ch01-1.1-motion.mp4
```

### 步骤 4：在 media.generated.ts 添加视频条目

在 `content/media.generated.ts` 的 `generatedVideos` 数组中追加：

```typescript
{
  "subjectId": "physics",
  "id": "physics-ch01-1.1-motion",
  "chapterId": "ch01",
  "sectionId": "1.1",
  "title": "匀变速直线运动",
  "src": "/media/videos/physics/ch01/physics-ch01-1.1-motion.mp4",
  "description": "用动画展示 v-t 图下面积即位移，推导 x = v₀t + ½at²。"
},
```

### 步骤 5：创建 Markdown 内容

创建文件 `content/physics/detail/1.1.md`（通用路径，被 `app/api/section/route.ts` 的 `readContentFile` 自动识别）：

```markdown
## 匀变速直线运动

### 1. 位移公式

:::definition{label=匀变速直线运动}
加速度 $a$ 恒定的直线运动称为**匀变速直线运动**。其位移随时间的变化规律为：

$$
x = v_0 t + \frac{1}{2} a t^2
$$
:::

:::video{id=physics-ch01-1.1-motion}

:::interactive{id=physics-ch01-1.1-motion}

:::derivation{label=位移公式推导}
由 $v = v_0 + at$ 和 $x = \int_0^t v \, dt$：

$$
x = \int_0^t (v_0 + at) \, dt = v_0 t + \frac{1}{2} a t^2
$$
:::
```

> **路径选择**：若希望复用概率论的 `content/chapters/` 结构，需修改 `app/api/section/route.ts` 的 `readContentFile` 函数，为新学科增加特例分支。推荐使用通用 `content/{subject}/{category}/{itemId}.md` 结构，无需改代码。

### 步骤 6：在 manifest.ts 添加 ContentItem

在 `content/manifest.ts` 的 `physics` 学科 `detail` 分类下添加内容项：

```typescript
{
  id: 'physics',
  name: '大学物理',
  icon: 'Atom',
  categories: [
    { id: 'textbook', name: '教材', items: [{ id: 'main', title: '大学物理（教材）', type: 'document', status: 'stub' }] },
    {
      id: 'detail',
      name: '详解',
      items: [
        {
          id: '1.1',
          title: '匀变速直线运动',
          type: 'section',
          status: 'done',
          summary: '位移、速度、加速度的定量关系。',
          videoIds: ['physics-ch01-1.1-motion'],
          interactiveIds: ['physics-ch01-1.1-motion'],
        },
      ],
    },
    // ...
  ],
},
```

### 步骤 7：验证端到端链路

接入完成后，访问 `/physics/detail/1.1`，应看到：

1. **左侧导航**：physics 学科 → 详解 → 「1.1 匀变速直线运动」
2. **正文区**：渲染 Markdown，含 definition callout、视频卡片、交互组件卡片、可折叠推导
3. **右侧「动画讲解」Tab**：列出 `physics-ch01-1.1-motion` 视频（因 `getVideosForSection('physics', 'ch01', '1.1')` 命中）
4. **右侧「可交互」Tab**：列出「匀变速直线运动探索器」（因 `getInteractivesForSection('physics', 'ch01', '1.1')` 命中）
5. **右侧「AI 对话」Tab**：chatContext 中 `subjectId='physics'`、`categoryId='ch01'`、`itemId='1.1'`（由 store 自动同步）

### 步骤 8（可选）：扩展 AI 对话标签

若 physics 需要专属可视化（如受力分析图），按第 6 节步骤在 `ChatMessageVisualizations.tsx` 增加 `case 'PhysicsFreeBodyDiagram'`，并在 AI 系统提示词中声明。

---

## 附录：关键文件索引

| 文件 | 职责 |
|------|------|
| `lib/types/content.ts` | `SubjectId` / `CategoryId` / `ContentItem` 类型定义 |
| `lib/content/types.ts` | `VideoEntry` / `InteractiveMeta`（部分）类型定义 |
| `lib/store.ts` | `activeSubjectId` 状态 + `setActiveSection(subjectId, chapterId, sectionId)` |
| `content/manifest.ts` | 多科内容树（驱动左侧导航） |
| `content/media.ts` | `getVideo(id)` / `getVideosForSection(subjectId, chapterId, sectionId)` |
| `content/media.generated.ts` | 视频清单（`VideoEntry[]`） |
| `components/interactives/registry.ts` | 交互组件注册表 + `getInteractive` / `getInteractivesForSection` |
| `components/notes/directives.tsx` | Markdown 指令渲染（`::video` / `::interactive` / callout / derivation） |
| `lib/markdown/remarkDirectives.ts` | remark 指令解析插件 |
| `components/visualizations/primitives/` | 4 个可视化原语 |
| `components/chat/ChatMessageVisualizations.tsx` | AI 对话 XML 标签 → 原语分发器 |
| `app/[subject]/[category]/[id]/page.tsx` | 多科路由校验（`VALID_SUBJECTS` / `VALID_CATEGORIES`） |
| `app/[subject]/[category]/[id]/ContentPageClient.tsx` | 路由 → store 同步（仅 detail 分类） |
| `app/api/section/route.ts` | Markdown 文件读取 API（概率论特例 + 通用路径） |
