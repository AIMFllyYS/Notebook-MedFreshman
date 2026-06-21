# SOP 00 — 基础设施：文档解析与 Subagent 调度

## 适用场景

所有需要将 PDF、PPT、DOC 等原始课程资料转为 Markdown 的流程。本 SOP 是其他所有板块 SOP 的前置依赖。

## 输入物料

- 原始课件/教材文件：PDF、PPT/PPTX、DOC/DOCX 格式
- 文件来源路径：`C:\Users\AIMFl\OneDrive\文档\课程文件\` 或 `D:\飞书文档保存\{科目}\`
- 环境变量：`.env.local` 中的 `MinerU_API_Token`

## 执行角色分配

| 角色 | 类型 | 职责 |
|------|------|------|
| 主控 | 当前智能体 | 确定待解析文件列表，调度 subagent |
| 解析执行者 | Shell subagent | 运行 `scripts/parse-docs.ts` 完成 API 调用 |
| 后处理 | GeneralPurpose subagent | 公式校正、章节拆分、路径规范化 |

## 步骤流程

### Step 1：确定文件清单

主控智能体扫描源目录，列出所有待解析文件：

```
主控任务：
1. 列出目标目录下所有 .pdf / .pptx / .ppt / .docx 文件
2. 按科目分组
3. 确认每个文件的用途（教材/课件/练习册）
4. 生成文件清单传递给 Shell subagent
```

### Step 2：运行解析脚本

派发 Shell subagent 执行：

```bash
npx tsx scripts/parse-docs.ts --subject {subjectId} --files "path1.pdf,path2.pptx"
```

脚本会：
1. 从 `.env.local` 读取 `MinerU_API_Token`
2. 上传文件到 MinerU 精准解析 API
3. 轮询直到所有任务完成
4. 下载解析结果 zip → 提取 `full.md`
5. 写入 `content/_raw/{subject}/{filename}.md`

### Step 3：后处理

派发 GeneralPurpose subagent 对 `content/_raw/{subject}/` 下的文件进行：

1. **公式格式校正**：
   - 确保 `$$` 独占一行（MinerU 输出可能有 `$$..$$` 单行写法）
   - 行内公式统一用 `$...$`
   - 修正 `\( \)` 为 `$...$`

2. **图片路径处理**（`parse-docs.ts` 已自动化）：
   - MinerU ZIP 中的 `images/` 目录自动复制到 `public/images/{subject}/{baseName}/`
   - Markdown 中的相对路径 `![](images/...)` 自动重写为 `/images/{subject}/{baseName}/...`
   - 若解析产出后需要将图片插入已有内容文件，运行 `python scripts/propagate-images.py`

3. **章节拆分**：
   - 按标题层级（# / ##）拆分为独立文件
   - 命名为 `content/_raw/{subject}/{chapterId}-{sectionId}.md`

## 文档解析脚本说明

### 主脚本

脚本路径：`scripts/parse-docs.ts`

### 使用方法

```bash
# 解析单个文件
npx tsx scripts/parse-docs.ts --subject probability --files "D:\教材\概率论.pdf"

# 解析多个文件（逗号分隔）
npx tsx scripts/parse-docs.ts --subject chemistry --files "课件1.pptx,课件2.pptx,教材.pdf"

# 指定模型版本（默认 vlm）
npx tsx scripts/parse-docs.ts --subject physics --files "物理教材.pdf" --model pipeline
```

### 参数说明

| 参数 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `--subject` | 是 | — | 科目 ID，决定输出子目录 |
| `--files` | 是 | — | 文件路径（逗号分隔），支持绝对路径和相对路径 |
| `--model` | 否 | `vlm` | MinerU 模型版本：`pipeline` / `vlm` |
| `--output` | 否 | `content/_raw/{subject}/` | 自定义输出目录 |

### 环境变量

脚本从 `.env.local` 读取（通过 `dotenv`）：

```
MinerU_API_Token=eyJ0eXBlIjoiSldU...（你的 Token）
```

### API 调用链路

```
┌─────────────────────────────────────────────────────────┐
│  POST /api/v4/file-urls/batch                           │
│  → 获取 batch_id + N 个 upload URLs                     │
├─────────────────────────────────────────────────────────┤
│  PUT {upload_url} × N files                             │
│  → 上传本地文件到 OSS                                    │
├─────────────────────────────────────────────────────────┤
│  GET /api/v4/extract-results/batch/{batch_id}           │
│  → 轮询（间隔 5s）直到所有文件 state=done               │
├─────────────────────────────────────────────────────────┤
│  GET {full_zip_url} → 下载 zip → 解压 → 提取 full.md   │
│  → 写入 content/_raw/{subject}/{filename}.md            │
└─────────────────────────────────────────────────────────┘
```

### 错误处理

- Token 无效 → 脚本报错并打印 MinerU 错误码 → 触发降级流程
- 文件过大（>200MB）→ 提示拆分后重试
- 轮询超时（5分钟）→ 打印 batch_id 供手动查询
- API 返回 429/503/网络超时 → 自动触发降级流程

---

## 容灾降级机制

当 MinerU API 不可用时（Token 过期、额度用尽、服务宕机、网络超时），按以下优先级使用本地开源方案完成无损解析。

### 降级触发条件

| 条件 | 说明 |
|------|------|
| MinerU_API_Token 未配置 | `.env.local` 中变量为空 |
| API 返回错误码 A0202/A0211 | Token 错误或过期 |
| API 返回 HTTP 429 | 请求频率限制 |
| API 返回 HTTP 503 或网络超时 | 服务不可用 |
| 连续 3 次轮询无响应 | 疑似服务故障 |

### 降级方案优先级

```
优先级 1（推荐）: MinerU API（精度最高）
    ↓ 不可用时
优先级 2: marker（开源 Python，精度接近 MinerU）
    ↓ 未安装时
优先级 3: 按文件类型使用对应开源库
    ↓ 全部失败时
优先级 4: 智能体直接读取文件（最后手段）
```

### 优先级 2：marker（Python 开源文档解析）

[marker](https://github.com/VikParuchuri/marker) 是开源的高精度 PDF/DOCX/PPTX 转 Markdown 工具，支持公式、表格、多栏识别。

```bash
# 安装（首次）
pip install marker-pdf

# 使用
marker_single "D:\教材\概率论.pdf" --output_dir "content/_raw/{subject}/"

# 批量
marker "D:\教材\" --output_dir "content/_raw/{subject}/" --languages "Chinese,English"
```

产出格式与 MinerU 兼容（Markdown + 图片目录），后处理流程相同。

### 优先级 3：按文件类型的开源库方案

#### PDF 解析

| 方案 | 安装 | 适用场景 | 精度 |
|------|------|---------|------|
| `pymupdf`(fitz) | `pip install pymupdf` | 文本型 PDF（非扫描件） | 高 |
| `pdfplumber` | `pip install pdfplumber` | 含表格的 PDF | 中高 |
| `pdf-parse` | `npm install pdf-parse` | 纯文本提取（无公式需求） | 中 |
| `tesseract.js` | `npm install tesseract.js` | 扫描件 OCR | 中 |

推荐脚本（pymupdf，精度最高的本地方案）：

```python
import fitz  # pymupdf
import sys, os

def pdf_to_markdown(pdf_path, output_path):
    doc = fitz.open(pdf_path)
    md_lines = []
    for page_num, page in enumerate(doc, 1):
        text = page.get_text("text")
        if text.strip():
            md_lines.append(f"\n<!-- Page {page_num} -->\n")
            md_lines.append(text)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines))
    print(f"✓ {os.path.basename(pdf_path)} → {output_path}")

if __name__ == "__main__":
    pdf_to_markdown(sys.argv[1], sys.argv[2])
```

#### PPTX 解析

| 方案 | 安装 | 说明 |
|------|------|------|
| `python-pptx` | `pip install python-pptx` | 提取幻灯片文本+备注，保留结构 |
| `libreoffice --convert-to pdf` | 系统安装 LibreOffice | 转 PDF 后再用 PDF 方案 |

推荐脚本（python-pptx）：

```python
from pptx import Presentation
import sys, os

def pptx_to_markdown(pptx_path, output_path):
    prs = Presentation(pptx_path)
    md_lines = []
    for i, slide in enumerate(prs.slides, 1):
        md_lines.append(f"\n## Slide {i}\n")
        for shape in slide.shapes:
            if shape.has_text_frame:
                for para in shape.text_frame.paragraphs:
                    text = para.text.strip()
                    if text:
                        # 一级标题通常是 slide 标题
                        if shape == slide.shapes.title:
                            md_lines.append(f"### {text}\n")
                        else:
                            md_lines.append(f"{text}\n")
        # 提取备注
        if slide.has_notes_slide and slide.notes_slide.notes_text_frame:
            notes = slide.notes_slide.notes_text_frame.text.strip()
            if notes:
                md_lines.append(f"\n> 备注：{notes}\n")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines))
    print(f"✓ {os.path.basename(pptx_path)} → {output_path}")

if __name__ == "__main__":
    pptx_to_markdown(sys.argv[1], sys.argv[2])
```

#### DOCX 解析

| 方案 | 安装 | 说明 |
|------|------|------|
| `mammoth` | `npm install mammoth` | DOCX → HTML → Markdown，保留格式 |
| `pandoc` | 系统安装 pandoc | 万能格式转换器 |

推荐命令（mammoth + turndown）：

```bash
# Node.js 一行式
node -e "
const mammoth = require('mammoth');
const { JSDOM } = require('jsdom');
const TurndownService = require('turndown');
mammoth.convertToHtml({path: process.argv[1]}).then(r => {
  const td = new TurndownService({headingStyle:'atx'});
  const md = td.turndown(r.value);
  require('fs').writeFileSync(process.argv[2], md);
  console.log('✓ Done');
}).catch(console.error);
" "input.docx" "output.md"
```

或直接使用 pandoc：

```bash
pandoc "input.docx" -o "output.md" --wrap=none
```

### 优先级 4：智能体直接读取（最后手段）

当所有自动化方案不可用时，智能体可以：

1. 对于 PPTX/DOCX：使用 Read 工具直接读取（Cursor 支持）
2. 对于 PDF：通过 Shell 执行 `pdftotext`（poppler-utils）
3. 产出质量可能较低（无公式识别、无表格还原），但内容不丢失

### 降级后的后处理差异

| 原方案（MinerU） | 降级后注意事项 |
|-----------------|---------------|
| 公式自动识别为 LaTeX | 降级方案可能输出纯文本公式，需人工或 AI 补充 `$...$` 标记 |
| 表格自动识别为 Markdown table | `pymupdf`/`python-pptx` 可能丢失表格结构，需人工校验 |
| 图片提取为 CDN 链接 | 降级方案输出本地路径或无图片，需手动处理 |
| 多栏布局自动合并 | 降级方案可能乱序，需人工校正 |

### 脚本中的降级逻辑

`scripts/parse-docs.ts` 应在 API 失败时自动提示降级命令：

```
ERROR: MinerU API 不可用 (HTTP 503)
降级方案：
  PDF:  python -c "import fitz; ..." 或 marker_single "{file}"
  PPTX: python scripts/fallback-pptx.py "{file}" "{output}"
  DOCX: pandoc "{file}" -o "{output}" --wrap=none
```

## 产出规范

| 产出 | 路径 | 说明 |
|------|------|------|
| 原始解析 Markdown | `content/_raw/{subject}/{filename}.md` | MinerU 直出，含 CDN 图片链接 |
| 后处理 Markdown | `content/_raw/{subject}/{filename}.processed.md` | 公式校正后 |
| 章节拆分产物 | `content/_raw/{subject}/{chapterId}-{sectionId}.md` | 按章节独立文件 |

> `content/_raw/` 是暂存目录，后续 SOP（01/02/03）从此处读取并转化为最终产出。
> 最终产出不应引用 `_raw/` 路径。

## Subagent 调度最佳实践

### 并行解析多科目

当需要同时处理多个科目时，可并行派发多个 Shell subagent：

```
主控同时派发：
- Shell subagent A：parse-docs.ts --subject probability --files "..."
- Shell subagent B：parse-docs.ts --subject chemistry --files "..."
- Shell subagent C：parse-docs.ts --subject modern-history --files "..."
```

### 大文件分批

单次 API 调用限制 50 个文件。超过时需分批：

```
Shell subagent 1：文件 1-50
Shell subagent 2：文件 51-100
```

### 上下文隔离原则

- 解析 subagent 不需要了解项目架构，只需运行脚本
- 后处理 subagent 只需了解公式/路径规范，不需要了解下游如何使用
- 这样每个 subagent 的 prompt 精简，输出质量高

### 降级脚本索引

项目内已提供可直接运行的降级脚本：

| 脚本 | 用途 | 依赖 |
|------|------|------|
| `scripts/fallback-pdf.py` | PDF → Markdown | `pip install pymupdf` |
| `scripts/fallback-pptx.py` | PPTX → Markdown（仅文本，无图片） | `pip install python-pptx` |
| `scripts/fallback-docx.py` | DOCX → Markdown | `pandoc` 或 `pip install python-docx` |

### 内容增强脚本

| 脚本 | 用途 | 依赖 |
|------|------|------|
| `scripts/propagate-images.py` | 将 MinerU 恢复的图片以 `::figure` 指令注入已有内容文件 | Python 3 (无额外依赖) |
| `scripts/parse-docs.ts` | MinerU API 解析 + 图片自动本地化到 `public/images/` | Node.js, `dotenv` |

用法示例：
```bash
python scripts/fallback-pdf.py "D:\教材\概率论.pdf" "content/_raw/probability/概率论.md"
python scripts/fallback-pptx.py "D:\课件\第一章.pptx" "content/_raw/probability/第一章.md"
python scripts/fallback-docx.py "D:\纪要\纪要1.docx" "content/_raw/modern-history/纪要1.md"
```

## 联网搜索

项目使用**智谱 Web Search API**（替代原 Bocha API）为 AI 对话提供联网搜索和图片搜索能力。

配置：在 `.env.local` 中设置 `ZHIPU_API_KEY`（在 https://open.bigmodel.cn 申请）。

实现文件：`lib/ai/webSearch.ts`（含 LRU 缓存 + `runWebSearchDetailed` + `runImageSearch`）。

## 参考文件

- [MinerU 文档解析教程](../refer/MinerU文档解析教程.md) — API 完整文档
- `.env.local`（项目根目录） — `MinerU_API_Token` + `ZHIPU_API_KEY` 所在位置
- [README.md](./README.md) — SOP 全局规范
