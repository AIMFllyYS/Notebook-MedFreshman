# SOP 01 — 教材板块处理

## 适用场景

将课程教材（PDF 电子版）或课堂 PPT/课件解析为结构化 Markdown，作为学习平台「教材」分类的内容源。适用于所有已注册科目。

## 输入物料

| 物料 | 格式 | 来源 |
|------|------|------|
| 教材电子版 | PDF | 教务处指定教材的扫描版或电子版 |
| 课堂 PPT | PPTX/PPT | `C:\Users\AIMFl\OneDrive\文档\课程文件\` |
| 练习册/习题集 | PDF/DOCX | 同上 |

## 执行角色分配

> 本 SOP 的内容生产阶段（结构提取+格式转换）必须遵守 [00-infrastructure.md「内容生产闭环与反降质契约」](./00-infrastructure.md#内容生产闭环与反降质契约)：一个执行子智能体对自己负责的章节，从"提取结构"到"转换为指令块"到"自查验收"全程闭环负责，不要把提取和格式化拆成两个互不担责的角色。

| 阶段 | 角色 | 类型 | 职责 |
|------|------|------|------|
| 解析 | Parser | Shell subagent | 运行 `scripts/parse-docs.ts` 解析 PDF/PPT（脚本只做格式转换，不做内容判断，符合反降质契约） |
| 闭环生产 | Rewriter-1~N | GeneralPurpose subagent (每个负责 3-4 章，含提取+格式转换+自查) | 从 raw markdown 提取结构化内容并转换为指令块正文；写完立刻按 [「验收（强制）」](#验收强制) 自查，通过才算完成 |
| 集成 | Integrator | GeneralPurpose subagent | manifest 注册 + AI 可达性验证（跨章节的机械收尾步骤，不涉及内容质量判断，允许独立于 Rewriter 存在） |

**上下文控制**：Rewriter 按章节拆分，每个 subagent 仅接收 3-4 章的 raw markdown；素材明显偏大（原始切片 > 40 KB）、章节小节数偏多（≥4 个节文件）时应进一步拆小，避免上下文过长导致"写到后面开始摘要式偷懒"。

## 步骤流程

### Step 1：原始文件解析

参照 [00-infrastructure.md](./00-infrastructure.md) 执行：

教材 PDF 先用专用脚本产出教材原文和 TOC：

```bash
python scripts/extract-textbook-pdf.py --pdf <pdf路径> --subject {subjectId} --basename textbook
```

该步骤产出 `content/_raw/{subject}/textbook.md`、`content/_raw/{subject}/textbook.toc.json` 和教材图片。若还有 PPT 或其他辅助文件，再运行通用解析脚本：

```bash
npx tsx scripts/parse-docs.ts --subject {subjectId} --files "{教材路径},{PPT路径}"
```

产出位于 `content/_raw/{subject}/` 下。

**图片自动处理**：`parse-docs.ts` 在解析完成后自动执行以下步骤：
1. 从 MinerU ZIP 中提取 `images/` 目录
2. 复制到 `public/images/{subject}/{baseName}/`
3. 将 Markdown 中的相对路径 `![](images/...)` 重写为绝对路径 `![](/images/{subject}/{baseName}/...)`

> **注意**：PPT 降级方案（`fallback-pptx.py`）仅提取文本，不产出图片。如需图片，应优先使用 MinerU API 解析。

**若 MinerU 不可用**：按 [00-infrastructure.md 容灾降级机制](./00-infrastructure.md#容灾降级机制) 选择替代方案：
- 教材 PDF → `marker_single` 或 `pymupdf`
- 课件 PPT → `python-pptx` 提取脚本
- 降级后需额外关注公式和表格的手动校正

### Step 2：内容分析与分类

Extractor subagent 对每个 raw markdown 文件进行分析：

1. **识别内容类型**：
   - 教材正文（定义、定理、公式、说明性文字）→ 教材板块
   - 课件中"讲概念配的经典例题" → 正文 Tab（`:::example{label=...}` 指令块）
   - 书后习题 / 练习册独立题目 → 例题 Tab（`content/examples/`）
   - 目录/索引页 → 丢弃

2. **按章节拆分**：
   - 根据一级标题（# 第X章）或 PPT 明显的章节分隔拆分
   - 每章生成一个独立文件

3. **判断依据**（区分正文例题 vs 例题Tab）：
   - PPT 中紧跟概念讲解后的 1-3 道题 → 正文例题（帮助理解概念）
   - 标注"课后习题""练习""作业"的题目 → 例题 Tab
   - 练习册/习题集中所有题目 → 例题 Tab

### Step 3：结构化格式转换

Formatter subagent 将提取的内容转换为项目 Markdown 格式：

#### 教材正文模板

```markdown
## {章标题}

### {节标题}

:::definition{label={概念名}}
{定义内容，保留原文措辞}
:::

:::theorem{label={定理名}}
{定理表述}

$$
{公式，独占行}
$$
:::

:::example{label={例题标题}}
**题目**：{题目内容}

**解**：{解答过程}
:::

:::note{label=小结}
本节核心：{要点列表}
:::
```

#### 格式转换规则

下表是**常用的一部分**，不是全部——完整的 14 个指令组件清单见 [rendering-architecture.md §2.2](../refer/rendering-architecture.md)，转换时应按内容的真实结构选用最贴切的指令，不要因为 SOP 里只写了几个例子就只会用这几个（这正是内容降质的一个常见来源）：

| 教材中的元素 | 转换为 | 说明 |
|-------------|--------|------|
| 定义/概念 | `:::definition{label=...}` | 保留原文，公式用 KaTeX |
| 定理/性质 | `:::theorem{label=...}` | 含证明时加 `:::derivation` 折叠 |
| 例题（讲解用） | `:::example{label=...}` | 含完整解答 |
| 注意事项 | `:::pitfall{label=...}` | 教材中的"注意""易错" |
| 一般说明 | `:::note` | 补充性文字 |
| 记忆要点/易挖空考点 | `:::memory{label=...}` | 需要挖空自测的核心结论，配合 `mode=cloze` |
| 时间/发展脉络 | `:::timeline` | 有明确先后顺序的历史/流程性内容 |
| 关键事件 | `:::event` | 单个具体历史事件的要素化呈现 |
| 核心概念卡 | `:::concept` | 需要单独强调、反复出现的核心概念 |
| 多对象对比 | `:::compare` | 两个及以上概念/方案/学派的对照 |
| 因果链 | `:::cause-effect` | 需要显式呈现"因为…所以…"的推理链 |
| 考点/重点标注 | `:::keypoint` | 教材或考纲明确划出的重点 |
| 独立公式 | `$$...$$` | 必须独占行 |
| 行内公式 | `$...$` | |

> 近现代史/毛概等人文科目还有 7 个专属指令（`:::timeline`/`:::event`/`:::concept`/`:::compare`/`:::cause-effect`/`:::keypoint`/`historymap`），详见 [modern-history-textbook-format.md](../refer/modern-history-textbook-format.md)。

### Step 4：例题提取（指向例题 Tab）

对于判定为"例题 Tab"的题目，按以下规范提取：

- 路径：`content/examples/{subject}/{chapterId}/{sectionId}/EX{NN}_{slug}.md`
- 格式：

```markdown
:::example{label={题目简述}}
**题目**：{完整题干}

**解**：
{完整解答过程}
:::
```

### Step 5：生成教材条目、manifest 挂载与验证

参照 [05-content-integration.md](./05-content-integration.md)：

1. 在 Step 1 完成后运行：
   ```bash
   python scripts/ingest-sophomore-textbooks.py --subject {subjectId}
   ```
2. 脚本生成 `lib/content-data/{subject}-textbook.ts`，导出 `{subjectCamelCase}TextbookItems`，并按教材 TOC 生成“章 → 节”两级条目树及 `content/{subject}/textbook/` 正文。
3. 在 `lib/content-data/manifest.ts` import 该导出，并将对应学科挂载为 `sophomoreCategorySkeleton({subjectCamelCase}TextbookItems)`；只有特殊布局才手写 category。
4. 完成挂载后运行 `pnpm check:registry`，必须为 0 error。

## 文档解析规范

参见 [00-infrastructure.md](./00-infrastructure.md)。

解析参数建议：
- 教材 PDF：`--model vlm`（VLM 模型对公式和表格识别更准）
- PPT 课件：`--model vlm`
- 如遇扫描件：添加 `is_ocr: true`

## 产出规范

| 产出 | 路径 | 命名规则 |
|------|------|---------|
| 教材正文 | `content/{subject}/textbook/{chapterId}.md` | `chapterId` 如 `ch01` |
| 正文例题 | 内嵌于教材正文 `:::example` 指令块中 | — |
| 例题Tab题目 | `content/examples/{subject}/{chapterId}/{sectionId}/EX{NN}_{slug}.md` | 编号+简述 |

## 验收（强制）

每章闭环完成前，必须按 [00-infrastructure.md「内容生产闭环与反降质契约」第 3 节](./00-infrastructure.md#内容生产闭环与反降质契约) 走完机械层 + 视觉层验收，缺一不可，不能只做下面 AI 可达性验证这三条：

### 机械层

- **体积/密度基准**：对照当前已完成的教材黄金范例实测校准（如医学教材 `content/biochemistry/textbook/ch05-1.md` 约 35 KB、24 个 `:::definition`；概率论/物理等理工科教材篇幅可能不同，以本科目已完成的其他章节为准）。明显小于同科目其他已完成章节、且 `:::definition` 数量个位数的，判定为可疑的未加工 dump，不能算完成。
- **垫圾标记黑名单**：不应残留"本章数字资源""第一篇/第N篇"之类的解析残留文字，标题不应含 `\x00` 等控制字符。
- **指令块引号规范**：`label="..."` 必须带英文双引号，不能写 `label=概念名` 这种无引号形式（会导致指令解析失败）。

### 视觉层

1. `readContentMarkdown(subjectId, "textbook", chapterId)` 返回非空
2. 用 `agent-browser` 实际打开 `/{subject}/textbook/{chapterId}`，等目标指令块（如"定义"卡片）真正渲染出来后截图；截图字节数明显偏小（接近空白页体量）判定为失败，换 session 重拍，不覆盖已合格的截图
3. 肉眼确认截图内容：能看到自定义指令卡片渲染效果，不是纯 dump 文本墙；插图不是破图图标
4. AI Tab 中发送"教材第 X 章讲了什么"，确认 AI 能通过 `getCurrentPage` 读取

完整验证参照 [05-content-integration.md](./05-content-integration.md)。

## 参考文件

- [00-infrastructure.md](./00-infrastructure.md) — 文档解析脚本
- [05-content-integration.md](./05-content-integration.md) — 集成验证
- [docs/refer/exam-type-distribution.md](../refer/exam-type-distribution.md) — 确认科目题型，辅助例题归类
- [docs/refer/rendering-architecture.md](../refer/rendering-architecture.md) — Markdown 指令块渲染规范
