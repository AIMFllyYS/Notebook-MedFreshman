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

## 内容生产闭环与反降质契约

> 本节汇总自 `REWRITE-LOOP.md`（2026-09 完成的大二教材改写循环，现已归档于 [`docs/archive/REWRITE-LOOP.md`](../archive/REWRITE-LOOP.md)）里被真实翻车教训验证过的机制，适用于**全部内容生产类 SOP**（`01`/`02`/`02b`/`03`/`04`）。执行任何内容生产任务前必须先读这一节；下游 SOP 只写各自领域的具体校准数字，不重复本节的通用规则。

### 1. 反模式黑名单（禁止事项）

以下每一条都对应过一次真实的降质事故，不是预防性的洁癖：

| 禁止 | 会导致什么 |
|---|---|
| 用脚本/正则批量生成或 patch 正文指令块（"Python 批注入 callout"） | 体积几乎不变，卡片套在原始 dump 上，渲染出来仍是一堵墙，肉眼一看就知道没有真正重写 |
| 编排/主控智能体自己代写章节正文 | 上下文被多章内容和金标撑爆，质量必然滑坡；且编排端没有机会针对单章素材做深入理解 |
| 把"文件已生成"当作"内容已达标" | 有的子智能体在写完文件后死于代理流/网络错误，回报丢失但文件是半成品；不能因为路径存在就判定合格 |
| 跳过验收直接派发下一步（如正文没验收就派发对应测验） | chapterId 之类的标识会串位——上一章还没定稿，测验已经按下一章的编号生成 |
| 相信"已完成"这句话本身，不看磁盘产物 | 子智能体可能撞了网络/代理错误后谎报或漏报；**磁盘上的文件 + 验收证据才是真相，口头汇报不是** |

> **已知的真实反例**：`scripts/one-off/transform-modern-history-textbook.py`（`docs/refer/modern-history-textbook-format.md` §5 曾把它列为"批量改写"推荐工具）就是"Python 批注入指令块"这条禁令描述的具体样子——按固定规则给每节自动套 `:::timeline`/`:::memory`/`:::keypoint`，不理解正文语义，属于本节要禁止的模式，不要再以它为参考写新的批量脚本。是否要下线这个脚本本身、改写 `docs/refer/modern-history-textbook-format.md` §5/§6，超出本轮改动范围，留给维护者单独决策。

### 2. 闭环单元模型

**核心原则：一个执行子智能体对"一个完整内容单元"（通常是一章/一讲/一个专题）从头到尾全权负责**——读原料 → 产出内容 → 按第 3 节走完整验收 → 若验收不通过自己修正 → 只有验收通过才能标记完成并回报。

不要把这个闭环拆成"提取 subagent / 格式化 subagent / 集成 subagent"这种互不担责的流水线角色——真实教训里，"没有人认为最终渲染结果由自己负责"是效率和质量同时崩溃的直接原因。

哪些角色仍然可以独立存在（不违反闭环原则）：
- **上下文收集（Explorer）**：只做机械的信息汇总，不产出最终交付物本身。
- **最终集成（Integrator）**：manifest 注册这类跨单元的、必须顺序执行的收尾步骤，不涉及对内容质量的判断。

拆分粒度信号（何时应该把一个大单元拆成更小的子智能体任务）：
- 原始素材体量明显偏大（如某一节的原始切片 > 40 KB）
- 单个单元的小节数偏多（≥ 4 个节文件）
- 概念密度明显偏高（同等篇幅要交代的定义/知识点数量远超同类单元）

拆开之后，依赖它们的下游产物（例如测验）仍按"整章/整讲"合并产出一份，不要跟着拆碎。

### 3. 强制验收协议：机械层 + 视觉层

验收分两层，**缺一不可**，且必须在"闭环单元"内部完成，不能推给下一个环节：

**机械层**（不需要打开浏览器，编排端或执行子智能体自己就能跑）：

| 检查项 | 方法 |
|---|---|
| 体积/密度基准 | 对照本科目/本板块当前的黄金范例，判断"是不是随手套壳的原始 dump"。具体数值区间由各内容 SOP（`01`/`02`/`02b`/`03`/`04`）自行校准，不能跨内容类型套用别的领域的数字 |
| 指令块密度 | 正文中结构化指令块（`:::definition`/`:::example`/…）数量应明显高于未加工的原始素材 |
| 垫圾标记黑名单 | 扫描是否残留解析产物特有的噪音（页眉页码、"本章数字资源"之类占位文字、乱码控制字符） |
| 结构化字段完整性 | 题目 JSON 的 `chapterId`/`summary.totalQuestions`/分值合计等字段必须与预期一致，不能有遗漏或串位 |
| 数量核对 | 例题篇数、指令数、图片数等是否与该单元预期的产出规格一致 |

**视觉层**（必须实际打开浏览器验证渲染结果，用 `agent-browser` 技能）：

| 检查项 | 方法 |
|---|---|
| 页面可达 | 对目标 URL 做一次 GET，确认返回 200，不是死链或 500 |
| 截图证据 | 用唯一 session 名打开页面，等待目标内容（如自定义指令卡片）真正渲染出来后才截图；**截图文件大小要有明确的失败阈值**——一张接近"空白标签页"体积的截图就是失败，必须重拍，具体字节数各 SOP 自行按本机实测校准 |
| 人工确认内容 | 截图必须真的用肉眼看一遍：能看到自定义指令渲染出来的卡片（而不是纯文本墙）、标题/章号没有串位、插图不是破图图标 |
| 合格证据不可覆盖 | 一旦某个单元的截图被判定合格，后续重跑不能覆盖同一文件名——用新文件名重拍，避免"修好又被之后的失败尝试盖成黑图"这种回归 |

### 4. 并发调度铁律

- **活槏上限 2–3 个**：同时进行中的执行子智能体不要超过 3 个。原因不是模型算力不够，是共享资源会被打爆——本机浏览器 session、开发服务器热更新在并发过高时都会变得不稳定，反而拖慢整体进度。
- **按槏位轮转，不要等全部完成再验收**（不要 `wait-all`）：谁先落盘谁先验收，验收通过立刻补下一个单元，始终保持 2–3 个活槏，而不是等所有人一起交卷。
- **同一验收链条上的串行 gate**：依赖前一步产出的下一步（如"正文通过验收后才能派发对应例题/测验"）必须等前一步验收通过才能派发，不能并行抢跑。
- **不回头改已验收单元**，除非有新证据（如后续内容发现前面的引用有误）证明确实需要回归修正。
- 这条纪律的代价是单个单元的墙钟时间会被人为拉长（要等截图、要等验收），但换来的是作废率显著下降——**宁可拉长单个闭环的时间，也不能压缩闭环里的任何一步**。

### 5. 编排子智能体 Prompt 骨架

派发内容生产子智能体时，prompt 至少包含以下几个槏位（各 SOP 按自己的场景填空）：

```markdown
你是 {项目} 的 {内容单元} 生产/改写智能体。你必须独立完成
「读原料 → 产出 → 按 00 号契约第 3 节验收 → 必要时自行修正」这一整圈，
不许把验收环节丢给下一个人。

## 身份与禁令
- 不要用脚本/正则批量生成或 patch 正文指令块
- 不要编造原料中不存在的内容
- {本任务专属的禁令，如术语口径、专有名词写法}

## 待处理单元
- {本单元的具体范围，如章号/讲次/专题}

## 原料
- {原始素材路径}

## 参考
- {金标/黄金范例路径——只点名路径，不要把全文塞进 prompt}

## 验收产物
- {正文/例题/测验各自的落盘路径}

## 回报要求
量化汇报（字节数、组件计数、跳过项、单元 ID），不要只说"已完成"。
```

### 6. 提速不降质的操作纪律

保质底线不能退让，但下面这些做法能省掉真正无意义的等待和重做：

- **瘦包**：给子智能体的 prompt 只点名金标/原料的路径，让它自己去读，不要把整篇内容贴进 prompt——上下文被撑爆是"写到后面开始摘要式偷懒"的直接原因。
- **提前按信号拆单元**：素材明显偏大的单元一开始就拆小，不要等写到一半才发现太大而作废重来。
- **验收收口**：每个单元通常只需要一张能证明"渲染正确"的主截图，不需要对每个细节都单独截一张。
- **缺什么补什么**：一个单元只是缺某一项验收证据（比如只缺一张截图），不需要把整个单元推倒重做。
- **不要无期限等待**：给子智能体设一个"多久没有任何新文件落盘就视为卡死"的心理阈值，卡死了就看磁盘决定续跑还是重派，而不是无限等待。

## 联网搜索

项目使用**智谱 Web Search API**（替代原 Bocha API）为 AI 对话提供联网搜索和图片搜索能力。

配置：在 `.env.local` 中设置 `ZHIPU_API_KEY`（在 https://open.bigmodel.cn 申请）。

实现文件：`lib/ai/webSearch.ts`（含 LRU 缓存 + `runWebSearchDetailed` + `runImageSearch`）。

## 参考文件

- [MinerU 文档解析教程](../refer/mineru-parsing-guide.md) — API 完整文档
- `.env.local`（项目根目录） — `MinerU_API_Token` + `ZHIPU_API_KEY` 所在位置
- [README.md](./README.md) — SOP 全局规范
