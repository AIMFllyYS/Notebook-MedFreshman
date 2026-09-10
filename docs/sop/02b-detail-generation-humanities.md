# SOP 02b — 详解板块生成（人文科）

> 适用于中国近现代史纲要、毛概等人文类课程。与 02（理工科）平行，模板和侧重点不同。

## 适用场景

将人文科课程的教材、课堂录音、教师讲解融合为结构化的原创详解讲义。人文科强调脉络梳理、因果链分析和考试要点标注，不要求动画和交互组件。

## 输入物料

| 物料 | 路径 | 说明 |
|------|------|------|
| 教材板块（已处理） | `content/{subject}/textbook/{chapterId}.md` | 由 SOP-01 产出 |
| 课堂录音 | `content/{subject}/recording/rec-XX.md` | 由 SOP-03 产出 |
| 课堂纪要 | `content/{subject}/summary/sum-XX.md` | 由 SOP-03 产出 |
| PPT/课件原始解析 | `content/_raw/{subject}/` | 由 SOP-00 解析产出 |

## 执行角色分配

| 阶段 | 角色 | 类型 | 职责 |
|------|------|------|------|
| 上下文收集 | Explorer | Explore subagent | 整理教材+录音+纪要为精简输入 |
| 内容生产 | Writer-1~N | GeneralPurpose subagent (每个 2-3 章/专题) | 撰写详解 |
| 集成 | Integrator | GeneralPurpose subagent | manifest 注册 + 验证 |

**上下文控制**：人文科单章内容通常是一个完整专题（如"太平天国""辛亥革命"），单个 Writer subagent 处理 2-3 个专题。

**与理工科的关键区别**：
- 无动画/交互组件要求
- 强调从录音中提取教师独有观点和考试暗示
- 模板以时间线/逻辑链为骨架而非定义-定理结构

## 总原则

1. **脉络清晰**：每个专题必须有清晰的时间线或逻辑链，读完能画出完整因果图
2. **重视教师观点**：人文科考试往往考教师上课讲的观点/分析，录音中的独特视角必须保留
3. **考点突出**：教师提到的考试重点必须用 `:::pitfall` 或 `:::note` 显著标注
4. **不是教材搬运**：不能照抄教材，需要用自己的逻辑重新串联

## 步骤流程

### Step 1：章节规划

确定目标科目的章节/专题结构：

```
中国近现代史纲要：
  ch01 - 课程导论与历史观
  ch02 - 对国家出路的早期探索（农民阶级）
  ch03 - 对国家出路的早期探索（地主阶级）
  ch04 - 维新思想与维新运动
  ch05 - 戊戌变法的政治实践
  ch06 - 辛亥革命
  ch07 - 五四运动与新民主主义
  ch08 - 国共合作与大革命
  ch09 - 抗日战争
  ch10 - 解放战争与新中国
```

### Step 2：上下文收集

Explorer subagent 为每个章节/专题整理「输入包」：

```markdown
## 第X章: {专题名}

### 教材核心框架
- 时间范围：{起止年份}
- 核心事件：{列表}
- 关键人物：{列表}
- 核心论点/结论：{教材的官方定论}

### 教师课堂观点（从录音/纪要提取）
- 教师的独特分析角度：{...}
- 教师补充的史料/细节：{...}
- 教师对比分析的切入点：{...}
- 考试重点暗示：{...}
- 教师推荐的参考资料：{...}

### PPT 要点
- PPT 中的关键对比表格：{...}
- PPT 中的年表/时间线：{...}
```

### Step 3：详解撰写

Writer subagent 按以下模板撰写每个章节：

> **本 SOP 的内容生产阶段必须遵守** [00-infrastructure.md「内容生产闭环与反降质契约」](./00-infrastructure.md#内容生产闭环与反降质契约)：Writer 对自己负责的专题从"读输入包"到"写完详解"到"自查验收"全程闭环负责。
>
> 下面模板里用到的指令**不是全部**——本科目还有 7 个专属指令（`:::timeline`/`:::eventcard`/`:::conceptcard`/`:::comparetable`/`:::causeeffect`/`:::keypoint`/`:::historymap`，完整语法见 [modern-history-textbook-format.md](../refer/modern-history-textbook-format.md)），本轮已把模板里原来用 `:::insight` + 手写表格凑合表达"对比""因果"的地方换成对应的专属指令；`memory` 挖空指令详见该文档 §2.8。

#### 人文科详解结构模板

```markdown
## {章标题}

### 时代背景

{宏观历史背景描述，为后续内容提供坐标系}

:::note{label=时代坐标}
- 时间：{年份范围}
- 国际背景：{...}
- 国内状况：{...}
:::

### 核心问题

:::definition{label=本章核心问题}
{本章要回答的 1-2 个根本性问题}
:::

### {主线叙事/事件发展}

#### {阶段一/事件一}

{叙事 + 分析，融合教材表述和教师观点}

:::insight{label={分析性标签}}
{教师课堂上的独特分析角度或深入解读}
:::

#### {阶段二/事件二}

{继续叙事与分析...}

### 关键人物/文献

| 人物/文献 | 主张/内容 | 历史意义 |
|-----------|----------|---------|
| {名称} | {核心主张} | {评价} |

### 因果链分析

:::causeeffect{title={因果链标题，如"XX爆发的原因与结果"}}
- 原因：{直接原因 + 深层原因}
- 结果：{直接后果 + 长远影响}
:::

复杂的多级因果（超过"原因→结果"两段）用列表展开为链条，仍放进同一个 `:::causeeffect` 容器里，不要退回用 `:::theorem` 这种数理指令表达历史因果（`:::theorem` 是给定理/性质用的，语义不对）。

### 对比评价

:::comparetable{title={对比标题} headers={对象A}|{对象B}}
- 领导阶级 | {..} | {..}
- 纲领/主张 | {..} | {..}
- 结果 | {..} | {..}
- 失败原因/局限 | {..} | {..}
:::

教师课堂上给出的独特分析角度（不是单纯罗列对比项，而是评价性的解读）仍用 `:::insight` 标注，与 `:::comparetable` 的结构化对比并存、互为补充。

### 考试要点

:::keypoint{label=核心结论}
{本章/本专题最核心的一句话结论}
:::

:::pitfall{label=必记要点}
1. **{要点1}**：{简述}
2. **{要点2}**：{简述}
3. **{要点3}**：{简述}
:::

:::note{label=教师特别强调}
- ⚠️ {教师明确说过"这个要考"的内容}
- ⚠️ {教师反复强调的论点}
:::

:::memory{label=本节必背要点}
- {可挖空自测的核心结论 1}
- {可挖空自测的核心结论 2}
- {可挖空自测的核心结论 3}
:::

### 小结与衔接

{本章核心结论的一句话总结}

> 下一章我们将看到 {衔接到下一专题的逻辑}
```

> 若本章/专题本身有清晰的时间线（如某场运动的发展阶段），在"时代背景"之后插入 `:::timeline{period=...}` 给出概览；单个足够重要、值得单独强调的历史事件用 `:::eventcard{title=... date=... place=... significance=...}`；反复出现的核心概念首次出现处用 `:::conceptcard{term=...}`。语法与更多示例见 [modern-history-textbook-format.md](../refer/modern-history-textbook-format.md)。

#### 写作规范

| 规则 | 说明 |
|------|------|
| 篇幅 | 每章 2000-5000 字，视专题复杂度而定 |
| 教师观点 | 用 `:::insight` 标注，与教材表述区分 |
| 对比 | 用 `:::comparetable{title=... headers=...}`，不用手写表格+`:::insight`凑合 |
| 因果 | 用 `:::causeeffect{title=...}`，不用 `:::theorem`（语义不对，那是数理指令） |
| 时间线 | 有明确阶段/大事记的专题用 `:::timeline{period=...}` |
| 核心概念/单一事件 | 首次出现处用 `:::conceptcard{term=...}` / `:::eventcard{title=... date=...}` |
| 核心结论 | 用 `:::keypoint{label=核心结论}` |
| 考试重点 | 用 `:::pitfall` 突出显示 |
| 必背清单 | 每节末尾用 `:::memory{label=本节必背要点}` |
| 年份 | 重要年份必须准确，不确定时查证 |
| 引用 | 重要史料/原文用引用块 `>` 标注 |

### Step 4：集成

参照 [05-content-integration.md](./05-content-integration.md)，更新 manifest：

```typescript
// 在 contentTree 对应科目的 detail category 中
{ id: '{itemId}', title: '{章标题}', type: 'section', status: 'done' }
```

## 文档解析规范

本 SOP 不直接执行文档解析。若需解析额外参考资料，参照 [00-infrastructure.md](./00-infrastructure.md)。

## 产出规范

| 产出 | 路径 | 命名 |
|------|------|------|
| 章节详解 | `content/{subject}/detail/{itemId}.md` | itemId 与 manifest 一致 |

**注意**：人文科暂无动画和交互组件产出。未来如需添加（如历史时间线交互），参照 SOP-02 的交互组件部分。

## 验收（强制）

每章/专题闭环完成前，必须按 [00-infrastructure.md「内容生产闭环与反降质契约」第 3 节](./00-infrastructure.md#内容生产闭环与反降质契约) 走完机械层 + 视觉层验收，不能只做 AI 可达性这一层。

### 机械层

- **体积基准**：对照本科目已完成的其他专题实测校准（如近现代史 `content/modern-history/detail/` 下已有小节约 9–14 KB；明显小于此、且几乎没有指令块的判定为提纲而非完整详解）。
- **指令使用核对**：本轮模板已把"对比"改为 `:::comparetable`、"因果"改为 `:::causeeffect`，新写的小节不应再退回用 `:::insight`/`:::theorem` 凑合表达这两类内容；每节末尾应有 `:::memory` 必背清单。
- **教师观点保留**：抽查是否真的融入了录音/纪要里教师的独特分析角度（`:::insight`），不是只搬了教材官方结论。

### 视觉层

1. `readContentMarkdown(subjectId, "detail", itemId)` 返回完整笔记
2. 用 `agent-browser` 实际打开 `/{subject}/detail/{itemId}`，等指令块渲染出来后截图，截图字节数明显偏小判定失败
3. 肉眼确认：时间轴/对比表/因果链/必背清单等卡片正常渲染，不是纯文本墙
4. AI Tab 中发送"这一章的核心论点是什么"，确认 AI 能读取并回答
5. AI Tab 中发送"考试重点有哪些"，确认 AI 能从 `:::pitfall`/`:::keypoint` 中提取重点

完整验证参照 [05-content-integration.md](./05-content-integration.md)。

## 黄金范例

| 文件 | 说明 |
|------|------|
| `content/modern-history/detail/` | 近现代史已有详解（叙事结构可参考；**但这批文件是本轮模板升级前写的，只用了 `:::definition`/`:::pitfall`/`:::note`，没有用到 `:::comparetable`/`:::causeeffect`/`:::timeline` 等新指令**，写新章节时按本文档最新模板执行，不要以旧文件的指令使用情况为准） |
| `content/modern-history/textbook/` | 教材板块已用 `:::timeline`/`:::comparetable`/`:::causeeffect` 等完整指令集，可参考具体语法（详解与教材是两个不同板块，不能直接照抄内容，但指令写法可以参考） |
| `content/modern-history/summary/sum-02.md` | 纪要格式参考（输入源） |

## 参考文件

- [00-infrastructure.md](./00-infrastructure.md) — 文档解析（如需额外解析）
- [03-recording-processing.md](./03-recording-processing.md) — 录音/纪要生成（输入源）
- [05-content-integration.md](./05-content-integration.md) — 集成验证
- [docs/refer/rendering-architecture.md](../refer/rendering-architecture.md) — Markdown 指令块语法
