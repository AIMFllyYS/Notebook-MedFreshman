# 其他模块·考试模拟 6 套卷子迁移计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `compose:subagent` to implement per-paper tasks in parallel, then update manifest and verify.

**Goal:** 将 `C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\考试模拟` 与 `考试模拟02` 两个文件夹中的 6 套有机化学期末模拟卷及对应答案解析迁移到项目 `content/other/kaoshi-moniji/` 下，并在 `lib/content-data/manifest.ts` 注册；卷子正文与解析全部放在“正文”Tab，例题与测试板块不设内容。

**Architecture:** 每套卷对应一个 Markdown 文件，正文内分「试卷正文」与「参考答案与解析」两大章节；通过 `lib/content-data/manifest.ts` 在 `other` 科目下新增 `kaoshi-moniji` 分类统一管理 6 个条目；渲染沿用现有 Markdown 路径，无需新增组件。

**Tech Stack:** TypeScript / Next.js 内容路由；Python + python-docx 读取 `.docx` 源文件；Markdown 正文。

## Global Constraints

- 只使用 `.docx` 源文件，同名 `.pdf` 仅作备用校验。
- 每套卷最终只生成 1 个 `.md` 文件，正文包含题目+解析。
- 不创建 `content/examples/other/...` 或 `content/quiz/other/...` 文件，确保例题/测试板块为空。
- 文件编码：UTF-8 无 BOM；Markdown 使用标准语法，避免自定义 directive。
- 分类 id 固定为 `kaoshi-moniji`，名称固定为 `考试模拟`。
- 条目 id 固定为：`sim-01`、`sim-02`、`sim-03`、`real-01`、`real-02`、`real-03`。

---

### Task 1: 准备 docx→Markdown 提取脚本

**Covers:** 全局约束（源文件读取）

**Files:**
- Create: `tmp/extract_docx_to_md.py`

**Interfaces:**
- Consumes: 源 `.docx` 路径
- Produces: 标准输出或写入 `.md` 文件的 Markdown 文本

- [ ] **Step 1: 编写提取脚本**

```python
from docx import Document
import sys

def docx_to_markdown(docx_path: str) -> str:
    doc = Document(docx_path)
    lines = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if text:
            lines.append(text)
    for table in doc.tables:
        lines.append('')
        for row in table.rows:
            cells = [cell.text.strip() for cell in row.cells]
            lines.append('| ' + ' | '.join(cells) + ' |')
        lines.append('')
    return '\n\n'.join(lines)

if __name__ == '__main__':
    print(docx_to_markdown(sys.argv[1]))
```

- [ ] **Step 2: 在一份样卷上验证脚本输出可读**

Run:
```powershell
python tmp/extract_docx_to_md.py "C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\考试模拟\有机化学期末模拟试卷一.docx" > tmp/sample.md
```
Expected: `tmp/sample.md` 生成且无 GBK/编码报错，内容可阅读。

---

### Task 2: 迁移模拟卷一（sim-01）

**Covers:** 卷子正文+解析迁移

**Files:**
- Create: `content/other/kaoshi-moniji/sim-01.md`

**Interfaces:**
- Consumes: `考试模拟/有机化学期末模拟试卷一.docx`、`考试模拟/有机化学期末模拟试卷一_参考答案与解析.docx`
- Produces: Markdown 文件，id 为 `sim-01`

- [ ] **Step 1: 提取试卷正文**

Run:
```powershell
python tmp/extract_docx_to_md.py "C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\考试模拟\有机化学期末模拟试卷一.docx" > tmp/sim-01-exam.md
```

- [ ] **Step 2: 提取答案解析**

Run:
```powershell
python tmp/extract_docx_to_md.py "C:\Users\AIMFl\OneDrive\文档\课程文件\有机化学课件PPT\考试模拟\有机化学期末模拟试卷一_参考答案与解析.docx" > tmp/sim-01-answer.md
```

- [ ] **Step 3: 组合并写入目标文件**

目标文件结构：
```markdown
# 有机化学期末模拟试卷一

---

## 试卷正文

[粘贴 tmp/sim-01-exam.md 内容]

---

## 参考答案与解析

[粘贴 tmp/sim-01-answer.md 内容]
```

Write to: `content/other/kaoshi-moniji/sim-01.md`

---

### Task 3: 迁移模拟卷二（sim-02）

**Covers:** 卷子正文+解析迁移

**Files:**
- Create: `content/other/kaoshi-moniji/sim-02.md`

**Interfaces:**
- Consumes: `考试模拟/有机化学期末模拟试卷二.docx`、对应答案 `.docx`
- Produces: Markdown 文件，id 为 `sim-02`

- [ ] **Step 1-3:** 同 Task 2，使用 sim-02 对应源文件。

---

### Task 4: 迁移模拟卷三（sim-03）

**Covers:** 卷子正文+解析迁移

**Files:**
- Create: `content/other/kaoshi-moniji/sim-03.md`

**Interfaces:**
- Consumes: `考试模拟/有机化学期末模拟试卷三.docx`、对应答案 `.docx`
- Produces: Markdown 文件，id 为 `sim-03`

- [ ] **Step 1-3:** 同 Task 2，使用 sim-03 对应源文件。

---

### Task 5: 迁移真题模拟卷一（real-01）

**Covers:** 卷子正文+解析迁移

**Files:**
- Create: `content/other/kaoshi-moniji/real-01.md`

**Interfaces:**
- Consumes: `考试模拟02/有机化学期末真题模拟卷（一）.docx`、对应答案 `.docx`
- Produces: Markdown 文件，id 为 `real-01`

- [ ] **Step 1-3:** 同 Task 2，使用 real-01 对应源文件。

---

### Task 6: 迁移真题模拟卷二（real-02）

**Covers:** 卷子正文+解析迁移

**Files:**
- Create: `content/other/kaoshi-moniji/real-02.md`

**Interfaces:**
- Consumes: `考试模拟02/有机化学期末真题模拟卷（二）.docx`、对应答案 `.docx`
- Produces: Markdown 文件，id 为 `real-02`

- [ ] **Step 1-3:** 同 Task 2，使用 real-02 对应源文件。

---

### Task 7: 迁移真题模拟卷三（real-03）

**Covers:** 卷子正文+解析迁移

**Files:**
- Create: `content/other/kaoshi-moniji/real-03.md`

**Interfaces:**
- Consumes: `考试模拟02/有机化学期末真题模拟卷（三）.docx`、对应答案 `.docx`
- Produces: Markdown 文件，id 为 `real-03`

- [ ] **Step 1-3:** 同 Task 2，使用 real-03 对应源文件。

---

### Task 8: 在 manifest.ts 注册考试模拟分类

**Covers:** 导航与路由注册

**Files:**
- Modify: `lib/content-data/manifest.ts`

**Interfaces:**
- Consumes: 6 个 `.md` 文件已存在
- Produces: 更新后的 `contentTree.subjects[other].categories` 数组

- [ ] **Step 1: 在 `other` 科目 categories 数组中新增分类**

在 `lib/content-data/manifest.ts` 第 340 行附近（`guihua` 分类之后）插入：

```typescript
        {
          id: 'kaoshi-moniji',
          name: '考试模拟',
          items: [
            { id: 'sim-01', title: '有机化学期末模拟试卷一', type: 'document', status: 'done' },
            { id: 'sim-02', title: '有机化学期末模拟试卷二', type: 'document', status: 'done' },
            { id: 'sim-03', title: '有机化学期末模拟试卷三', type: 'document', status: 'done' },
            { id: 'real-01', title: '有机化学期末真题模拟卷（一）', type: 'document', status: 'done' },
            { id: 'real-02', title: '有机化学期末真题模拟卷（二）', type: 'document', status: 'done' },
            { id: 'real-03', title: '有机化学期末真题模拟卷（三）', type: 'document', status: 'done' },
          ],
        },
```

---

### Task 9: 验证

**Covers:** 全局约束（可构建、可访问）

**Files:**
- Test: `tests/content/manifest.test.ts`

**Interfaces:**
- Consumes: 已注册的 manifest 与 6 个 `.md` 文件
- Produces: 测试结果

- [ ] **Step 1: 运行 manifest 结构测试**

Run:
```powershell
npx vitest run tests/content/manifest.test.ts
```
Expected: 全部通过。

- [ ] **Step 2: TypeScript 类型检查**

Run:
```powershell
npx tsc --noEmit
```
Expected: 无类型错误。

- [ ] **Step 3: 确认文件清单**

Run:
```powershell
Get-ChildItem -Path content/other/kaoshi-moniji
```
Expected: 6 个 `.md` 文件存在。

---

## Source File Mapping

| 条目 id | 源试卷 `.docx` | 源答案 `.docx` | 目标文件 |
|---------|----------------|----------------|----------|
| sim-01 | `考试模拟\有机化学期末模拟试卷一.docx` | `考试模拟\有机化学期末模拟试卷一_参考答案与解析.docx` | `content/other/kaoshi-moniji/sim-01.md` |
| sim-02 | `考试模拟\有机化学期末模拟试卷二.docx` | `考试模拟\有机化学期末模拟试卷二_参考答案与解析.docx` | `content/other/kaoshi-moniji/sim-02.md` |
| sim-03 | `考试模拟\有机化学期末模拟试卷三.docx` | `考试模拟\有机化学期末模拟试卷三_参考答案与解析.docx` | `content/other/kaoshi-moniji/sim-03.md` |
| real-01 | `考试模拟02\有机化学期末真题模拟卷（一）.docx` | `考试模拟02\有机化学期末真题模拟卷（一）答案解析.docx` | `content/other/kaoshi-moniji/real-01.md` |
| real-02 | `考试模拟02\有机化学期末真题模拟卷（二）.docx` | `考试模拟02\有机化学期末真题模拟卷（二）答案解析.docx` | `content/other/kaoshi-moniji/real-02.md` |
| real-03 | `考试模拟02\有机化学期末真题模拟卷（三）.docx` | `考试模拟02\有机化学期末真题模拟卷（三）答案解析.docx` | `content/other/kaoshi-moniji/real-03.md` |
