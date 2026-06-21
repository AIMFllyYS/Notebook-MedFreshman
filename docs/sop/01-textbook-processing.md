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

| 阶段 | 角色 | 类型 | 职责 |
|------|------|------|------|
| 解析 | Parser | Shell subagent | 运行 `scripts/parse-docs.ts` 解析 PDF/PPT |
| 结构提取 | Extractor-1~N | GeneralPurpose subagent (每个处理 3-4 章) | 从 raw markdown 提取结构化内容 |
| 格式化 | Formatter | GeneralPurpose subagent | 统一指令块格式、例题归类 |
| 集成 | Integrator | GeneralPurpose subagent | manifest 注册 + AI 可达性验证 |

**上下文控制**：Extractor 按章节拆分，每个 subagent 仅接收 3-4 章的 raw markdown，避免上下文过长。

## 步骤流程

### Step 1：文档解析

参照 [00-infrastructure.md](./00-infrastructure.md) 执行：

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

| 教材中的元素 | 转换为 | 说明 |
|-------------|--------|------|
| 定义/概念 | `:::definition{label=...}` | 保留原文，公式用 KaTeX |
| 定理/性质 | `:::theorem{label=...}` | 含证明时加 `:::derivation` 折叠 |
| 例题（讲解用） | `:::example{label=...}` | 含完整解答 |
| 注意事项 | `:::pitfall{label=...}` | 教材中的"注意""易错" |
| 一般说明 | `:::note` | 补充性文字 |
| 独立公式 | `$$...$$` | 必须独占行 |
| 行内公式 | `$...$` | |

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

### Step 5：manifest 注册

参照 [05-content-integration.md](./05-content-integration.md)：

1. 在 `content/manifest.ts` 的对应科目 `textbook` category 中注册 items
2. 每章一个 item，格式：
   ```typescript
   { id: '{chapterId}', title: '第X章 {章标题}', type: 'document', status: 'done' }
   ```

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

## AI 工具可达性验证

完成后执行以下验证（参照 [05-content-integration.md](./05-content-integration.md)）：

1. `readContentMarkdown(subjectId, "textbook", chapterId)` 返回非空
2. 浏览器访问 `/{subject}/textbook/{chapterId}`，确认渲染正常
3. AI Tab 中发送"教材第X章讲了什么"，确认 AI 能通过 `getCurrentPage` 读取

## 参考文件

- [00-infrastructure.md](./00-infrastructure.md) — 文档解析脚本
- [05-content-integration.md](./05-content-integration.md) — 集成验证
- [docs/refer/考试题型分布.md](../refer/考试题型分布.md) — 确认科目题型，辅助例题归类
- [docs/refer/rendering-architecture.md](../refer/rendering-architecture.md) — Markdown 指令块渲染规范
