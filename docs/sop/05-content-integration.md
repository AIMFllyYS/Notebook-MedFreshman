# SOP 05 — 内容注册与 AI 工具可达性验证

## 适用场景

所有内容板块 SOP（01-04）执行完毕后的最终集成步骤。确保产出的内容在 manifest 中注册、文件路径正确、且右侧 AI 面板能通过工具链访问到内容。

## 输入物料

| 物料 | 说明 |
|------|------|
| 新产出的 .md / .json 文件 | 由 01-04 SOP 生成 |
| 文件路径与 ID 列表 | 由内容生产 subagent 汇报 |

## 执行角色分配

| 角色 | 类型 | 职责 |
|------|------|------|
| Integrator | GeneralPurpose subagent | 执行所有注册和验证步骤 |

本 SOP 通常由单个 subagent 完成（manifest 操作需顺序执行，不宜并行）。

## 步骤流程

### Step 1：收集产出清单

从前序 SOP 的产出 subagent 收集以下信息：

```
| 文件路径 | subjectId | categoryId | itemId | title | status |
|----------|-----------|------------|--------|-------|--------|
| content/chemistry/textbook/ch01.md | chemistry | textbook | ch01 | 第一章 绪论 | done |
| content/chemistry/recording/rec-05.md | chemistry | recording | rec-05 | 第五讲·烷烃 | done |
...
```

### Step 2：manifest 注册

编辑 `content/manifest.ts` 中 `contentTree` 对应科目的对应 category：

#### 注册规则

1. **不要重复注册**：先检查 items 数组中是否已有相同 id 的条目
2. **保持排序**：按 id 数字顺序排列（ch01 < ch02 < ...，rec-01 < rec-02 < ...）
3. **status 字段**：内容完成设为 `'done'`，占位设为 `'stub'`
4. **title 字段**：简洁明确，如 `'第一章·事件与概率'`

#### 示例

```typescript
// content/manifest.ts 中对应位置
{
  id: 'textbook',
  name: '教材',
  items: [
    { id: 'ch01', title: '第一章·绪论', type: 'document', status: 'done' },
    { id: 'ch02', title: '第二章·烷烃', type: 'document', status: 'done' },
  ],
},
```

### Step 3：路径可达性验证

对每个新注册的 item，验证 `lib/content/loader.ts` 中的 `readContentMarkdown()` 能正确读取：

1. **通用路径分支**（非概率论科目）：
   - 函数会寻找 `content/{subjectId}/{categoryId}/{itemId}.md`
   - 确认文件确实存在于该路径

2. **概率论特例分支**：
   - `probability` + `detail` → `content/chapters/{chapterId}/{sectionId}.md`
   - 其他 category 走通用路径

3. **验证命令**：
   ```bash
   # 在项目根目录运行
   node -e "
     const { readContentMarkdown } = require('./lib/content/loader');
     const result = readContentMarkdown('{subjectId}', '{categoryId}', '{itemId}');
     console.log(result ? '✓ 可读取 (' + result.length + ' chars)' : '✗ 返回 null');
   "
   ```

   注意：由于 TypeScript，实际验证可通过 `npx tsx` 运行或在 dev server 启动后通过 API 验证。

### Step 4：AI 工具链验证

验证 AI 面板的五个工具能正确工作：

#### 4.1 getCurrentPage

- 用户浏览到 `/{subject}/{category}/{itemId}` 时，AI 调用 `getCurrentPage` 应返回该页内容
- **验证**：访问页面 → AI Tab 发送"这一节讲了什么" → 确认 AI 引用了正确内容

#### 4.2 getOutline

- AI 调用 `getOutline` 应包含新注册的章节
- **当前已知限制**：`getOutlineText()` 只遍历概率论的旧 `manifest.chapters`，不覆盖 `contentTree` 中其他科目
- **临时解决**：对非概率论科目，AI 通过 `getCurrentPage` + 用户路由上下文（`subjectId/categoryId/itemId`）定位内容
- **长期 TODO**：扩展 `getOutlineText()` 支持多科目

#### 4.3 getSection

- AI 调用 `getSection(sectionId)` 能跨小节读取
- **当前已知限制**：`getSection` 写死 `categoryId = "detail"`，只能读详解板块
- **影响**：AI 暂无法从详解页面跨板块引用教材/录音内容
- **长期 TODO**：扩展 `getSection` 支持 categoryId 参数

#### 4.4 searchNotes

- AI 调用 `searchNotes(query)` 能检索到新内容中的关键词
- **当前已知限制**：只检索概率论 `content/chapters/` 下的文件
- **长期 TODO**：扩展为遍历所有科目的所有 category

### Step 5：TypeScript 编译验证

```bash
npx tsc --noEmit
```

确保 manifest 修改不引入类型错误。

### Step 6：记录已知缺口

在完成验证后，记录以下信息供后续修复：

- [ ] `getOutline` 需扩展支持多科目
- [ ] `searchNotes` 需扩展支持多科目多板块
- [ ] `getSection` 需支持 categoryId 参数
- [ ] 题目测试需新增 `getQuizData` AI 工具

## 产出规范

本 SOP 的产出是对 `content/manifest.ts` 的修改（新增 items），无独立文件产出。

## AI 工具可达性验证

本 SOP 本身就是验证流程，无需额外验证步骤。

## 参考文件

- [content/manifest.ts](../../content/manifest.ts) — 操作目标
- [lib/content/loader.ts](../../lib/content/loader.ts) — 路径解析逻辑
- [lib/ai/tools.ts](../../lib/ai/tools.ts) — AI 工具定义
- [README.md](./README.md) — SOP 全局规范
