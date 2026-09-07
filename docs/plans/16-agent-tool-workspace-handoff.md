# 交接：Agent 页面结构化工具工作区

> 目标：把 Agent 从“输出 Markdown 的聊天助手”升级为可生成结构化、可复用学习产物的工具工作区。
> 已完成基础实现、类型检查、针对性 lint、回归测试；剩余工作主要是运行时硬联调、docx/ LaTeX / PDF 导出，以及更完整的集成测试。

---

## 0. 当前状态

### 已完成的端到端能力

| 能力 | 关键文件 | 状态 |
|---|---|---|
| 结构化出题 | `lib/ai/agent/quizTool.ts` / `components/chat/ChatQuizCard.tsx` | ✅ 已实现，支持单选/多选/判断/填空/分析/论述题，复用 `QuizQuestion` |
| 笔记图片检索 | `lib/content/noteImages.ts` / `components/chat/NoteImageGallery.tsx` | ✅ 已实现，解析 `![]()` 与 `::figure/:::figure`，按 BM25 风格打分 |
| 长文档撰写 | `lib/documents/types.ts` / `lib/ai/document.ts` / `app/api/document/route.ts` / `components/chat/DocumentCard.tsx` / `DocumentViewer.tsx` | ✅ 已实现，SSE 分节生成，支持大纲 + 多节正文 |
| 工具接入 | `lib/ai/agent/tools.ts` / `lib/ai/agent/studyAgent.ts` | ✅ 三个工具注册到 AI SDK，被 `buildStudyTools` 返回 |
| 结果卡片 | `components/chat/ChatMessage.tsx` | ✅ quiz / note-image / document 已接入 |
| 窗口管理 | `lib/hooks/useWindowManager.ts` / `components/chat/DocumentViewer.tsx` / `components/layout/AppShell.tsx` | ✅ 新增 `document-viewer` 窗口类型 |
| 持久化 | `lib/hooks/useDocuments.ts` / `lib/storage/idbStorage.ts` | ✅ Zustand + IndexedDB |
| Trace / 设置 | `lib/chat/buildTrace.ts` / `lib/chat/toolPresentation.ts` / `components/chat/ToolTraceStep.tsx` | ✅ 保留硬编码标签，新增 summary |
| 提示词 | `lib/ai/prompts/global.md` | ✅ 新增 createQuiz / searchNoteImages / writeDocument 策略 |

### 验证基线

```bash
pnpm exec tsc --noEmit          # 0 error
pnpm exec eslint ...            # 针对本次修改文件 0 error
pnpm test                       # 2290 tests, 2289 pass, 1 fail（内容无关，见 §4）
```

### 新增/修改的主要文件

```text
lib/ai/agent/tools.ts
lib/ai/agent/quizTool.ts
lib/ai/agent/documentTool.ts
lib/ai/agent/toolTypes.ts
lib/ai/document.ts
lib/content/noteImages.ts
lib/documents/types.ts
lib/documents/prompts.ts
lib/documents/export.ts
lib/hooks/useDocuments.ts
lib/hooks/useWindowManager.ts
lib/storage/idbStorage.ts
lib/chat/buildTrace.ts
lib/chat/toolPresentation.ts
app/api/document/route.ts
components/chat/ChatMessage.tsx
components/chat/ChatQuizCard.tsx
components/chat/NoteImageGallery.tsx
components/chat/DocumentCard.tsx
components/chat/DocumentViewer.tsx
components/window/WindowTaskbar.tsx
components/window/OverflowMenu.tsx
components/layout/AppShell.tsx
components/icons/AgentIcons.tsx
components/quiz/QuizQuestion.tsx
lib/ai/prompts/global.md
tests/customProviderCompatibility.test.ts
```

---

## 1. 已知缺陷与待完善项

### 1.1 长文档导出（高优先级）

- `lib/documents/export.ts` 目前只实现了 `downloadAsMarkdown`。
- `DocumentViewer.tsx` 的 Word / PDF 按钮仍是占位（`TODO`）。
- 依赖 `docx@9.7.1` 已安装，但需要把 Markdown 解析为 docx 段落/表格/公式。
- LaTeX / PDF 未实现；需要决定是用 `pandoc` 服务端转换，还是前端生成 `.tex` 后交给用户编译。

### 1.2 `DocumentCard` 交互细节

- 目前没有真正的“节粒度”流式预览，只有整节完成后的进度数字。
- 在生成过程中刷新页面/组件卸载后，`DocumentCard` 不会自动恢复生成；因为 `startedRef` 是内存中的，持久化的 `doc.status` 为 `outlining` / `writing` 但页面不会自动重新触发。
- 可给 `useDocuments` 增加 `resume` 逻辑或在 `DocumentCard` 中检测 `status === 'outlining'/'writing'` 时自动恢复。

### 1.3 `writeDocument` 提示与模型行为

- `/api/document` 的提示词在 `lib/documents/prompts.ts` 中，目前主要用 JSON 数组输出大纲，Markdown 输出正文。
- 需要实际跑模型，验证模型是否稳定按 JSON 格式返回大纲、是否会溢出 token、是否会在多节之间重复前言。
- `parseOutline` 在无法解析时使用 `spec.outline` 回退；如果 `spec.outline` 为空则报错。建议后续加更健壮的解析（如先按行拆分再正则）。

### 1.4 Quiz 体验

- `ChatQuizCard` 在提交后展示得分与解析，但没有把结果写入 `useQuizStore`，因此不会出现在全局 quiz 进度中。
- 需要决定 Agent 生成的 quiz 是否应保存到复习板 / 学习记录。
- `QuizQuestion` 的 `hint` 状态改为外部受控，但仍需确认所有现用 `QuizQuestion` 的调用方没被破坏。

### 1.5 NoteImage 搜索结果

- 当前索引在 Node 启动时构建，取决于 `contentTree` 静态数据。
- 后续如果要支持拖拽插入到编辑器、或点击放大，需要给 `NoteImageGallery` 增加按钮。

### 1.6 ChatMessage 重复/去重

- 当前直接按 `toolCallId` / 输出 ID 作为 key，未做额外 dedup。如果模型在流中重复输出同一 `createQuiz` 结果，可能渲染两次。
- 建议后续在 `ChatMessage` 增加更细的去重：以 `quizId` / `documentId` 为 `Set` 过滤同一轮中重复的 `output-available`。

---

## 2. 推荐下一步

1. **跑真机模型验证**：在本地或测试环境触发 `createQuiz`、`searchNoteImages`、`writeDocument`，确认 SSE 流、trace 显示、卡片渲染无异常。
2. **实现 docx 导出**：在 `lib/documents/export.ts` 中使用 `docx` 把 `StoredDocument` 转换为 Word 文档；可先只支持纯段落和粗斜体，公式/表格后续补齐。
3. **补充 `/api/document` 重试/断点续传**：当前每个 section 是独立请求，若某节失败则整个文档卡死。应支持单节重试、从 `status === 'writing'` 恢复未完成的 section。
4. **写单元测试**：
   - `lib/ai/agent/quizTool.ts` 的 normalize / option 修复。
   - `lib/content/noteImages.ts` 的解析与打分。
   - `lib/documents/types.ts` 的 `assembleDocumentMarkdown` / `wordCountOf`。
   - `lib/chat/buildTrace.ts` 对 quiz / image / document 的 summary。
5. **跑集成测试**：在真实浏览器里确认 `DocumentCard` 能打开 `DocumentViewer` 窗口、`ChatQuizCard` 能作答提交、`NoteImageGallery` 图片可拖拽/点击。

---

## 3. 回归测试

```bash
# 类型
pnpm exec tsc --noEmit

# 目标文件 lint（推荐每次改完都跑）
pnpm exec eslint \
  lib/ai/agent/quizTool.ts lib/ai/agent/documentTool.ts lib/ai/agent/tools.ts \
  lib/content/noteImages.ts lib/documents/prompts.ts lib/documents/types.ts \
  lib/ai/document.ts app/api/document/route.ts lib/hooks/useDocuments.ts \
  lib/storage/idbStorage.ts components/chat/ChatQuizCard.tsx \
  components/chat/NoteImageGallery.tsx components/chat/DocumentCard.tsx \
  components/chat/DocumentViewer.tsx lib/chat/buildTrace.ts \
  lib/chat/toolPresentation.ts lib/documents/export.ts

# 测试
pnpm test
```

---

## 4. 唯一未通过的测试

```
tests/content/sophomore-textbooks.test.ts
  有图题的教材叶子必须嵌入真实图片
  cell-biology/textbook/ch08-4 有图题但没有任何 ![] / ::figure 图片引用
```

- 失败在 `master` 也曾出现（内容启发式误判，正文提到“图 8-x”但没有配图）。
- 与本次 Agent 工具改造无关，建议交给内容负责人处理（补图或调整正文）。
- 不要为了让它过而改测试逻辑。

---

## 5. 提交建议

当前尚未提交，所有改动在工作区。建议先做一次 commit：

```bash
git add -A
git commit -m "agent: 结构化出题、笔记图片检索、长文档撰写工具与 UI 卡片

- 在 lib/ai/agent/tools.ts 注册 createQuiz / searchNoteImages / writeDocument
- 新增 quizTool 与 documentTool 做 schema/归一化
- 新增 /api/document SSE 分节生成（outline + section 流）
- 新增 ChatQuizCard / NoteImageGallery / DocumentCard / DocumentViewer
- 接入 ChatMessage，支持在消息气泡中展示结构化产物
- useWindowManager 新增 document-viewer 窗口类型
- useDocuments 提供 Zustand + IndexedDB 持久化
- 更新 global.md 提示词，引导模型优先使用新工具
- 修复 tsc/eslint 错误，更新 customProviderCompatibility 断言"
```

然后再做 docx 导出与集成测试的分支。
