# SOP 03 — 课堂录音清洗与纪要生成

## 适用场景

将飞书导出的课堂录音逐字稿（.txt）和智能纪要（.docx）处理为平台标准格式的「课上录音」和「课堂纪要」内容。

## 输入物料

| 物料 | 格式 | 来源 | 说明 |
|------|------|------|------|
| 逐字稿 | .txt | `D:\飞书文档保存\{科目}\` | 飞书 ASR 自动转录，含说话人标注和时间戳 |
| 智能纪要 | .docx | 同上或飞书云端 | 飞书 AI 生成的结构化摘要（部分课次有） |
| 配套 PPT | .pptx | `C:\Users\AIMFl\OneDrive\文档\课程文件\` | 可选，辅助理解课堂内容 |

### 逐字稿原始格式

飞书导出 `.txt` 固定结构：
```
{日期} {时间}|{时长}

关键词:
{逗号分隔的关键词}

文字记录:
说话人 1 MM:SS
{文字内容}

说话人 1 MM:SS
{文字内容}
...
```

## 执行角色分配

| 阶段 | 角色 | 类型 | 职责 |
|------|------|------|------|
| PPT 解析 | Parser | Shell subagent | 若有配套 PPT，运行 `scripts/parse-docs.ts` |
| DOCX 解析 | DocParser | Shell subagent | 若有 .docx 智能纪要，通过 MinerU 解析为 markdown |
| 录音清洗 | Cleaner-1~N | GeneralPurpose subagent (每个处理 3-4 讲) | 逐字稿去噪、格式化 |
| 纪要生成 | Summarizer-1~N | GeneralPurpose subagent (每个处理 3-4 讲) | 生成结构化课堂纪要 |
| 集成 | Integrator | GeneralPurpose subagent | manifest 注册 + 验证 |

**上下文控制**：单个逐字稿通常 5000-15000 字，3-4 讲合计约 20000-60000 字。每个 Cleaner/Summarizer subagent 限制处理 3-4 讲以保证质量。

## 步骤流程

### Step 1：文件准备

1. 列出目标科目下所有 `.txt` 逐字稿文件
2. 按讲次排序（注意命名不统一，需人工确认映射）
3. 确认哪些讲次有配套 `.docx` 智能纪要
4. 建立映射表：

```
| 讲次 | rec-ID | 源文件 (.txt) | 有纪要 (.docx) |
|------|--------|--------------|----------------|
| 第1讲 | rec-01 | {文件名}.txt | 是/否 |
| 第2讲 | rec-02 | {文件名}.txt | 是/否 |
...
```

### Step 2：DOCX 解析（若有）

对 `.docx` 智能纪要文件，通过 MinerU 解析：

```bash
npx tsx scripts/parse-docs.ts --subject {subjectId} --files "{纪要1.docx},{纪要2.docx}"
```

产出的 raw markdown 作为纪要生成的辅助参考输入。

**若 MinerU 不可用**：按 [00-infrastructure.md 容灾降级机制](./00-infrastructure.md#容灾降级机制) 使用替代方案：
- 首选：`pandoc "{file}.docx" -o "{output}.md" --wrap=none`
- 备选：`mammoth`（npm）转 HTML 后再转 Markdown
- DOCX 降级精度损失较小（无公式识别需求时几乎无损）

### Step 3：逐字稿清洗

Cleaner subagent 对每个 `.txt` 执行以下操作：

#### 3.1 去噪

移除以下内容：
- 开头的签到/点名（"同学们都到了吗"、"谁还没来"）
- 课前闲聊（与课程无关的对话）
- 重复的口头禅（"那个"、"就是说"、"对吧"过度重复时精简）
- 明显的 ASR 错误标记

**保留**：
- 所有与课程内容相关的对话
- 教师的即兴举例（即使看似离题）
- 学生提问及教师回答
- 教师对考试重点的暗示（"这个考试要考"、"这里一定要记住"）

#### 3.2 说话人合并

原始文件中同一说话人连续多段（因 ASR 断句）需合并：

合并前：
```
说话人 1 05:15
再就是外戚干政，清代也没有这个问题，

说话人 1 05:20
再就是宦官专政，清代也没有这个问题，
```

合并后：
```
说话人 1 05:15
再就是外戚干政，清代也没有这个问题，再就是宦官专政，清代也没有这个问题，
```

**合并规则**：同一说话人、时间间隔 < 30 秒、语义连贯 → 合并为一段。

#### 3.3 说话人标注

- 说话人 1（主讲人 / 教师）→ 保留标注
- 说话人 2+（学生 / 视频音源）→ 标注为"学生"或"视频"
- 若课堂播放视频/音频，对应段落标注为"[视频/音频材料]"

#### 3.4 输出格式

```markdown
# 第{N}讲 · {主题} · 课堂录音整理
> 录音整理，含说话人标注与时间戳

说话人 1 {MM:SS}
{清洗后的文字内容}

说话人 1 {MM:SS}
{清洗后的文字内容}

[学生提问]
{学生的问题}

说话人 1 {MM:SS}
{教师的回答}
```

### Step 4：纪要生成

Summarizer subagent 从清洗后的录音 + DOCX 纪要（若有）生成结构化纪要。

#### 纪要固定模板

```markdown
# 第{N}讲 · {主题} · 课堂纪要

## 关键词
{5-8 个核心关键词，逗号分隔}

## 核心议题
- {议题1}
- {议题2}
- {议题3}

## 教学要点

### {子主题1}
- {要点}
- {要点}

### {子主题2}
- {要点}
- {要点}

## 考试重点标注
- ⚠️ {教师明确提到"要考"/"重点"的内容}
- ⚠️ {教师反复强调的内容}

## 课堂讨论/互动
- Q: {学生问题}
  A: {教师回答要点}

## 延伸阅读（如有）
- {教师推荐的参考资料}
```

#### 生成规则

1. **关键词**：从录音内容中提取，不超过 8 个
2. **核心议题**：本讲覆盖的 3-5 个主要话题
3. **教学要点**：按主题分组，保留关键论述和结论
4. **考试重点**：教师明确暗示的考试内容（"这个一定会考"、"往年都考过"）必须保留
5. **互动**：保留有教学价值的 Q&A

### Step 5：manifest 注册

参照 [05-content-integration.md](./05-content-integration.md)：

在 `content/manifest.ts` 对应科目的 `recording` 和 `summary` categories 中注册：

```typescript
// recording
{ id: 'rec-01', title: '第一讲·{主题}', type: 'document', status: 'done' }

// summary
{ id: 'sum-01', title: '第一讲·{主题}', type: 'document', status: 'done' }
```

## 文档解析规范

参见 [00-infrastructure.md](./00-infrastructure.md)。

仅 `.docx` 智能纪要需要通过 MinerU 解析。`.txt` 逐字稿直接读取即可。

## 产出规范

| 产出 | 路径 | 命名规则 |
|------|------|---------|
| 清洗后录音 | `content/{subject}/recording/rec-{NN}.md` | NN 为两位数讲次编号 |
| 结构化纪要 | `content/{subject}/summary/sum-{NN}.md` | 与 rec 一一对应 |

**命名映射**：`rec-01` 对应 `sum-01`，始终一一配对。

## AI 工具可达性验证

完成后验证：

1. `readContentMarkdown(subjectId, "recording", "rec-01")` 返回非空
2. `readContentMarkdown(subjectId, "summary", "sum-01")` 返回非空
3. 浏览器访问 `/{subject}/recording/rec-01`，确认渲染正常
4. AI Tab 中发送"这节课讲了什么重点"，确认 AI 能读取当前录音/纪要内容

## 参考文件

- [00-infrastructure.md](./00-infrastructure.md) — 文档解析脚本（DOCX 解析）
- [05-content-integration.md](./05-content-integration.md) — 集成验证
- 参考样例：`content/modern-history/recording/rec-02.md`（近现代史第三讲录音）
- 参考样例：`content/modern-history/summary/sum-02.md`（近现代史第三讲纪要）
