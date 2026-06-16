# SOP · 章节内容系统性生成

> 本文件是「指定章节即可量产」的操作手册。任何 AI（含 Workflow 子智能体）按此 SOP，
> 即可把某一章的每个小节产出**详尽原创笔记 + Manim 动画 + 可交互组件**，并集成进应用。
>
> 核心铁律：**这是辅助学习工具，深度与通俗易懂高于一切**。每个小节的笔记都要重新原创、
> 极其详细、循序渐进，宁长勿略；**每个小节都必须至少有 1 个动画视频 + 1 个交互组件**。

---

## 0. 总原则

1. **原创讲解，而非转写**：逐字稿（`docs/*.txt`）只用于"还原老师讲了哪些重点、用了哪些例子、强调了哪些易错点"，笔记必须用自己的话、结合标准教材知识，写成通俗易懂、严谨完整的讲义。
2. **建立直觉优先**：先给生活化直觉/动机，再给严格定义与推导，再给多个例题，最后小结与易错点。
3. **面向初学者**：默认读者刚学完微积分与线代，怕公式。每一步推导都要解释"为什么"。
4. **全量富文本 + 完美公式**：所有公式用 KaTeX 语法（见 §2）。
5. **每小节三件套**：笔记（.md）+ 动画（Manim 场景）+ 交互（TSX 组件）。

---

## 1. 目录与产物约定

| 产物 | 路径 | 命名 |
|---|---|---|
| 小节笔记 | `content/chapters/<chapterId>/<sectionId>.md` | 如 `content/chapters/ch01/1.4.md` |
| 交互组件 | `components/interactives/<chapterId>/<Name>.tsx` | 如 `components/interactives/ch01/ClassicalProbLab.tsx` |
| Manim 场景 | `manim/chapters/<chapterId>/<file>.py` | 如 `manim/chapters/ch01/scene_1_4_classical.py` |
| 视频 id（全局唯一） | —— | `<chapterId>-<sectionId>-<slug>`，如 `ch01-1.4-classical` |
| 交互 id（全局唯一） | —— | `<chapterId>-<sectionId>-<slug>`，如 `ch01-1.4-coins` |

`chapterId` 见 `content/manifest.ts`（ch01…ch08）。`sectionId` 形如 `1.4`。

---

## 2. 笔记写作合同（content/chapters/.../<id>.md）

**参考黄金范例**：`content/chapters/ch01/1.1.md`，新笔记的结构与深度向它看齐或更深。

### 2.1 公式（KaTeX）
- 行内：`$...$`；独立公式：`$$...$$`。
- **禁止** `\( \)` 与 `\[ \]`。中文与公式之间留意排版。
- 多行对齐用 `aligned`：`$$\begin{aligned} ... \\ ... \end{aligned}$$`。

### 2.2 富文本指令块（自定义语法，务必使用）
```
:::definition{label=条件概率}
正文（可含 $公式$）
:::

:::theorem{label=全概率公式}
...
:::

:::example{label=摸球问题}
...
:::

:::insight{label=为什么这样定义}
...
:::

:::pitfall{label=常见错误}
...
:::

:::note{label=本节小结}
...
:::

:::derivation{label=方差公式推导}
可折叠的详细推导步骤
:::
```
可用的 `kind`：`definition / theorem / example / insight / pitfall / note / derivation`。

### 2.3 内嵌动画与交互（用本小节对应的 id）
```
::video{id=ch01-1.4-classical}
::interactive{id=ch01-1.4-coins}
```
把它们放在与正文叙述最贴合的位置（如讲完古典概型公式后嵌入交互，让读者动手）。

### 2.4 推荐结构模板
1. `## 直觉/动机`：从一个真实问题或疑问切入。
2. `## 定义`（`:::definition`）：严格表述 + 逐符号解释。
3. `## 为什么这样`（`:::insight`）：动机与几何/频率直觉。
4. `## 性质 / 定理`（`:::theorem` + `:::derivation` 折叠推导）。
5. `## 例题`（2–4 个 `:::example`，由浅入深，含完整解答）。
6. 内嵌 `::interactive` 与 `::video`。
7. `## 易错点`（`:::pitfall`）。
8. `## 小结`（`:::note`）+ 与下一节的衔接。

### 2.5 篇幅
单节正文不少于 ~1500 字，复杂节（如 1.5 贝叶斯）可达数千字。**宁可详尽，不可潦草。**

---

## 3. 交互组件合同（components/interactives/<ch>/<Name>.tsx）

- 文件首行 `"use client";`，默认导出一个无 props 的 React 组件。
- **自包含**：不发网络请求、不读外部数据；状态用 `useState`。
- 仅依赖已安装库：`react`、`framer-motion`、`d3`（可选）、`clsx`。
- 用 SVG / 图表做**可点击、可拖动、可调参**的可视化，揭示知识点本质。
- 视觉用设计令牌：主色 `var(--accent)`、文字 `var(--ink)`/`var(--ink-soft)`、描边 `var(--line)`、底 `var(--bg-muted)`；外层套 `rounded-xl border border-[var(--line)] bg-white p-4`。
- 随机性只在事件处理函数内用 `Math.random()`，不要在模块顶层用。
- **参考**：`components/interactives/ch01/VennPlayground.tsx`、`FrequencyConvergence.tsx`。
- 组件**不要**自行修改 `registry.ts`，由集成步骤统一登记。

每个组件对应一条注册信息（集成时写入 `registry.ts`）：
`{ id, chapterId, sectionId, title, description, Component: dynamic(() => import("./<ch>/<Name>"), { ssr:false }) }`

---

## 4. Manim 动画合同（manim/chapters/<ch>/<file>.py）

- 一个文件含一个或多个 `Scene` 子类，并在**模块顶层**导出 `REGISTER`：
```python
REGISTER = [
  {
    "scene": "ClassicalProbScene",
    "id": "ch01-1.4-classical",
    "chapterId": "ch01",
    "sectionId": "1.4",
    "title": "古典概型：等可能与计数",
    "description": "一句话说明动画讲了什么。",
  },
]
```
- 中文文字用 `Text("……", font="Microsoft YaHei")`；数学公式用 `MathTex(r"...")`（依赖 LaTeX/MiKTeX）。
- **不要**在 `MathTex` 里写中文（中文走 `Text`）。
- 时长 20–60s，循序渐进、有重点高亮；避免一次堆满屏幕。
- **参考**：`manim/chapters/ch01/scene_1_1_sample_space.py`。
- 渲染：`pnpm render:chapter <chapterId>`（或 `python manim/render.py --chapter <chapterId>`）。脚本会把 mp4 输出到 `public/media/videos/<ch>/<id>.mp4` 并写入 `content/media.generated.ts`。

---

## 5. 集成步骤（生成后由主控统一执行，避免并发改共享文件）

1. **笔记**：子智能体已直接写入 `.md`。在 `content/manifest.ts` 把对应小节 `status` 改为 `"done"`。
2. **交互**：把每个新组件登记进 `components/interactives/registry.ts`；在 `manifest.ts` 对应小节 `interactiveIds` 追加其 id。
3. **动画**：场景 `.py` 已就位；运行 `pnpm render:chapter <ch>` 渲染；在 `manifest.ts` 对应小节 `videoIds` 追加其 id。
4. **校验**：`pnpm exec tsc --noEmit` 与 `pnpm build` 必须通过；本地 `pnpm dev` 抽查若干小节渲染正常。

> 并发原则：子智能体只**新建各自的文件**（.md / .tsx / .py），互不冲突；所有**共享文件**（manifest.ts、registry.ts、media.generated.ts）由主控在汇总后顺序更新。

---

## 6. 如何"指定章节即生成"

- **首选（ultracode）**：运行生成 Workflow（脚本：`workflows/generate-chapter.workflow.js`，见该文件头注释），传 `args = { chapterId: "ch03", ... }`。它会扇出 Sonnet 子智能体并行产出三件套，返回元数据由主控集成。
- **手动**：对该章每个小节，分别按 §2/§3/§4 三份合同创建文件，再执行 §5 集成。

---

## 7. 第一章产物对照（样板）

第一章已全部完成（每个小节均齐备三件套），作为后续各章的样板：

| 小节 | 笔记 | 交互 | 动画 |
|---|---|---|---|
| 1.1 随机试验与样本空间 | ✅ | ✅ `ch01-1.1-events` | ✅ `ch01-1.1-sample-space` |
| 1.2 事件关系与运算 | ✅ | ✅ `ch01-1.2-venn` | ✅ `ch01-1.2-ops` |
| 1.3 频率与概率 | ✅ | ✅ `ch01-1.3-frequency` | ✅ `ch01-1.3-freq` |
| 1.4 古典概型与几何概型 | ✅ | ✅ `ch01-1.4-coins` | ✅ `ch01-1.4-classical` |
| 1.5 条件概率·全概率·贝叶斯 | ✅ | ✅ `ch01-1.5-bayes-lab` | ✅ `ch01-1.5-bayes` |
| 1.6 事件的独立性 | ✅ | ✅ `ch01-1.6-reliability` | ✅ `ch01-1.6-indep` |

后续章节（ch02–ch08）：在 `workflows/generate-chapter.workflow.js` 的 CONFIG 增加该章作业配置，运行 Workflow 即按本 SOP 量产，再按 §5 集成。
