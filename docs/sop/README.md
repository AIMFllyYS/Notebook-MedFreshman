# SOP 体系索引

> 本目录包含「期末复习工作站」所有内容板块的标准化操作流程。
> 任何 AI 智能体（含 Cursor Agent、Workflow subagent）执行内容生产时，必须先阅读本文件确定适用的 SOP，再按对应文档逐步操作。

---

## 目录

| 编号 | 文件 | 覆盖板块 | 简述 |
|------|------|---------|------|
| 00 | [00-infrastructure.md](./00-infrastructure.md) | 基础设施 | MinerU 文档解析脚本、环境变量、subagent 调度规范 |
| 01 | [01-textbook-processing.md](./01-textbook-processing.md) | 教材 | PDF/PPT → 结构化教材 Markdown |
| 02 | [02-detail-generation.md](./02-detail-generation.md) | 详解（理工科） | 融合教材+录音+自查 → 原创讲义 |
| 02b | [02b-detail-generation-humanities.md](./02b-detail-generation-humanities.md) | 详解（人文科） | 人文类课程专用详解模板 |
| 03 | [03-recording-processing.md](./03-recording-processing.md) | 课堂录音+纪要 | 逐字稿清洗 + 结构化纪要生成 |
| 04 | [04-quiz-generation.md](./04-quiz-generation.md) | 题目测试 | AI 出题 + 组卷 + 评分规范 |
| 05 | [05-content-integration.md](./05-content-integration.md) | 集成验证 | manifest 注册 + AI 工具可达性校验 |
| — | [subject-onboarding.md](./subject-onboarding.md) | 新学科接入 | 从零接入一个新科目的端到端流程 |

---

## 全局规范

### 1. SOP 文件固定章节结构

每个 SOP 文件必须包含以下章节（可根据需要增加，但不可缺少）：

```
# SOP 标题
## 适用场景
## 输入物料
## 执行角色分配（主控 + subagent 拆分）
## 步骤流程
## 文档解析规范（引用 00-infrastructure.md）
## 产出规范（文件路径 + 命名）
## AI 工具可达性验证（引用 05-content-integration.md）
## 参考文件（相对路径链接）
```

### 2. Subagent 分工铁律

**核心目的**：防止单个智能体上下文过长导致质量下降。

规则：
1. **单个 subagent 处理不超过 3-4 章/讲**
2. **文档解析** 由独立 Shell subagent 完成（运行 `scripts/parse-docs.ts`），不混入内容生产
3. **manifest 注册** 由专门的集成 subagent 在所有内容生产完成后统一执行
4. **并行化**：无依赖的章节可通过 `dispatching-parallel-agents` skill 分派多个 subagent 同时处理

#### Subagent 调度模板

主控智能体在执行任何 SOP 时，按以下模板拆分任务：

```
阶段 1 — 文档解析（Shell subagent）
  └── 运行 scripts/parse-docs.ts --subject {X} --files "..."
  └── 产出：content/_raw/{subject}/*.md

阶段 2 — 内容生产（N 个 GeneralPurpose subagent，并行）
  └── 每个 subagent 接收：
      - 当前 SOP 文档路径
      - 分配的章节范围
      - 阶段 1 产出的原始 markdown 路径
  └── 每个 subagent 产出：对应章节的最终 .md / .json 文件

阶段 3 — 集成验证（GeneralPurpose subagent）
  └── 按 05-content-integration.md 执行 manifest 注册 + 验证
```

#### Subagent Prompt 模板

给每个内容生产 subagent 的 prompt 中必须包含：

```
你是内容生产子智能体，负责 {科目} 的 {板块}，处理范围：{章节范围}。

必读文档：
1. docs/sop/{对应SOP文件} — 完整操作规范
2. {输入文件路径列表}

产出要求：
- 文件路径：{具体路径}
- 格式规范：{摘要}

注意：
- 仅处理分配给你的章节，不要越界
- 完成后列出所有产出文件的路径和对应 manifest ID
```

### 3. 环境变量引用规范

所有需要 API Token 的脚本通过 `.env.local` 环境变量获取，绝不硬编码：

| 变量名 | 用途 | 引用方式 |
|--------|------|---------|
| `MinerU_API_Token` | MinerU 文档解析 API | `process.env.MinerU_API_Token` |
| `AI_API_KEY` | AI 模型调用 | `process.env.AI_API_KEY` |
| `AI_BASE_URL` | AI 模型端点 | `process.env.AI_BASE_URL` |

### 4. 内容路径约定

| 板块 | 最终产出路径 | manifest 注册位置 |
|------|-------------|-------------------|
| 教材 | `content/{subject}/textbook/{chapterId}.md` | `contentTree.subjects[x].categories[textbook].items[]` |
| 详解 | `content/{subject}/detail/{itemId}.md`（概率论例外：`content/chapters/`） | `contentTree.subjects[x].categories[detail].items[]` |
| 录音 | `content/{subject}/recording/rec-XX.md` | `contentTree.subjects[x].categories[recording].items[]` |
| 纪要 | `content/{subject}/summary/sum-XX.md` | `contentTree.subjects[x].categories[summary].items[]` |
| 题目 | `content/quiz/{subject}/{chapterId}.json` | 前端 QuizTab 直接读取（无需 manifest） |
| 例题 | `content/examples/{subject}/{chapterId}/{sectionId}/` | 通过 `readExamples()` 自动发现 |

### 5. AI 工具可达性要求

每个 SOP 执行完毕后，必须确保产出内容对右侧 AI 面板可见：

- AI 通过 `getCurrentPage` 工具调用 `readContentMarkdown(subjectId, categoryId, itemId)` 读取当前页
- AI 通过 `getOutline` 获取课程大纲树（遍历 `contentTree`）
- AI 通过 `getSection` 按 ID 跨小节读取内容
- AI 通过 `searchNotes` 全文检索笔记

**验证方法**：在浏览器中访问 `/{subject}/{category}/{itemId}`，切到 AI Tab，发送"这一节讲了什么"，确认 AI 能调用 `getCurrentPage` 并返回正确内容。

### 6. 参考文件索引

| 文件 | 用途 |
|------|------|
| `docs/refer/考试题型分布.md` | 各科目考试题型配比（04-quiz 引用） |
| `docs/refer/MinerU文档解析教程.md` | MinerU API 完整文档（00-infrastructure 引用） |
| `docs/refer/rendering-architecture.md` | Markdown 渲染架构（02-detail 引用） |
| `.env.local` | 环境变量（Token 等，脚本运行时引用） |
| `content/manifest.ts` | 内容目录树（05-integration 操作目标） |
| `lib/ai/tools.ts` | AI 工具定义（05-integration 验证目标） |
| `lib/content/loader.ts` | 内容加载器（路径解析逻辑） |

### 7. 容灾降级策略

当 MinerU API 不可用时，所有依赖文档解析的 SOP（00/01/03）自动降级到本地开源方案。完整降级链路和各文件类型的替代工具详见 [00-infrastructure.md 容灾降级机制](./00-infrastructure.md#容灾降级机制)。

降级优先级摘要：
```
MinerU API → marker（Python 开源） → 按类型选库 → 智能体直读
```
