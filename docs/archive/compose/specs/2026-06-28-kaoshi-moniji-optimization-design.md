# 有机化学考试模拟卷 Markdown 深度优化设计

## [S1] 背景与目标

已在 `content/other/kaoshi-moniji/` 下导入 6 套有机化学考试模拟卷（sim-01/02/03 + real-01/02/03），当前为纯文本 Markdown，题目在前、解析在后。用户要求：

1. 结合项目现有富文本组件（:::callout / :::derivation / :::figure 等）深度优化。
2. 排版改为「一道题目 + 对应解析」配对形式。
3. 解析更详细，并为部分题目加入知识卡片回顾。
4. 需要引入图片的正常引入（真题卷中的化学结构式）。
5. 保证质量，不水。

## [S2] 设计约束

- **局部优化**：不新建独立页面，不新增自定义 React 组件，只使用项目已有的 Markdown 指令。
- **可用指令**：
  - `:::callout{kind=definition|theorem|example|insight|pitfall|note|tip label=...}`
  - `:::derivation{label=...}`（可折叠，默认折叠）
  - `:::figure{src=... alt=... caption=...}`
- **解析默认展开**：用户明确选择解析默认可见，因此不使用 `:::derivation` 包裹解析，改用 `:::callout{kind=insight}` 作为解析卡。
- **卡片/垂直流**：用户选择「垂直卡片流：题目卡 + 解析卡」。每道题一张题目卡，紧跟一张解析卡。

## [S3] 内容结构

每套卷子 Markdown 结构如下：

```markdown
# 有机化学期末模拟试卷一

## 考试说明

（保留原卷前言、考试时间、满分、答题说明等）

## 一、选择题（每小题2分，共20分）

### 第 1 题

:::callout{kind=note label="题目"}
下列化合物中，碳原子采取 sp² 杂化的是（    ）

- **A.** CH₄
- **B.** CH₂=CH₂
- **C.** CH≡CH
- **D.** CH₃OH

:::figure{src="/other/kaoshi-moniji/images/sim-01-q1-fig.png" alt="选项分子结构" caption="各选项分子的键线式"}
:::
:::

:::callout{kind=insight label="解析"}
**答案：B**

CH₂=CH₂（乙烯）中碳原子形成一个 σ 键和一个 π 键，采用 sp² 杂化。CH₄ 为 sp³ 杂化，CH≡CH 为 sp 杂化，CH₃OH 中碳为 sp³ 杂化。

**推理过程**：
1. 判断中心碳的 σ 键数 + 孤对电子数。
2. σ 键数为 3 且无孤对 → sp²；σ 键数为 4 → sp³；σ 键数为 2 → sp。
3. 乙烯中每个碳形成 3 个 σ 键（2 个 C-H，1 个 C-C），剩余 p 轨道形成 π 键。

:::callout{kind=note label="知识卡片：碳的杂化类型"}
| 杂化类型 | 空间构型 | σ 键数 | 实例 |
| --- | --- | --- | --- |
| sp³ | 四面体 | 4 | CH₄、CH₃OH |
| sp² | 平面三角形 | 3 | CH₂=CH₂、苯 |
| sp | 直线形 | 2 | CH≡CH |
:::
:::

### 第 2 题
...
```

## [S4] 图片资产策略

### 真题卷（real-01/02/03）

- 从源 DOCX 的 `word/media/` 中提取原始结构图 PNG。
- 存放路径：`public/other/kaoshi-moniji/images/{real-01|real-02|real-03}-reference.png`
- 在 Markdown 中每卷开头用 `:::figure` 展示「结构式参考图」，并在对应题目附近再次引用。

### 模拟卷（sim-01/02/03）

- 使用 RDKit 为每道涉及具体化学结构的题目生成键线式 PNG。
- 存放路径：`public/other/kaoshi-moniji/images/{sim-01|sim-02|sim-03}-q{N}-{desc}.png`
- 命名示例：`sim-01-q1-options.png`、`sim-01-q4-propene-hbr.png`
- 不为纯文字概念题（如"下列关于吡咯和吡啶的叙述，错误的是"）强制配图。

### 生成脚本

- 使用 Python + RDKit 批量生成。
- 维护一个从题目到 SMILES 的映射表，确保结构正确。
- 图片尺寸：300×200 px（选择题选项组合）或 400×200 px（反应路线）。

## [S5] 知识卡片策略

知识卡片嵌入解析卡中，使用以下类型：

- `:::callout{kind=insight}`：核心知识点、反应机理、判断依据。
- `:::callout{kind=note}`：补充说明、记忆技巧、公式/表格。
- `:::callout{kind=pitfall}`：常见错误、易混淆点、例外情况。
- `:::callout{kind=definition}`：关键术语定义。

卡片内容必须具体、有深度，不能是泛泛而谈。

## [S6] 解析详细化要求

每道题解析至少包含：

1. **直接答案**：明确给出正确选项或答案。
2. **判断依据**：解释为什么正确，为什么不正确。
3. **推理/机理步骤**：对于反应题、合成题、推断题，分步写出反应机理或推理过程。
4. **知识卡片**：关联相关知识点，形成回顾。

## [S7] 执行计划

1. **样例先行**：重构 `sim-01.md` 的前 3 道选择题 + 第 1 道反应题 + 第 1 道合成题作为样例，生成对应图片，本地预览效果。
2. **用户确认**：展示样例截图或 Markdown 片段，确认风格后处理全部 6 套卷子。
3. **批量重构**：使用子智能体并行处理剩余 5 套卷子（每个子智能体处理一套）。
4. **图片生成**：统一生成并放入 `public/other/kaoshi-moniji/images/`。
5. **验证**：运行 `npm run test:unit`、`npx tsc --noEmit`、`npm run check:encoding`、本地构建预览。
6. **Commit**：按 PADC 流程，仅对本次更新部分提交。

## [S8] 验收标准

- 6 套卷子均改为「题目卡 + 解析卡」垂直流排版。
- 解析默认展开，包含详细推理和知识卡片。
- 真题卷引入原始结构图，模拟卷关键结构有 RDKit 生成的键线式图。
- 所有图片路径正确，渲染正常。
- `npm run test:unit`、`npx tsc --noEmit`、`npm run check:encoding` 通过。
- 不引入新的 lint 错误。
