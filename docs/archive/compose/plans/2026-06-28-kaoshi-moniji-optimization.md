# 有机化学考试模拟卷 Markdown 深度优化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `content/other/kaoshi-moniji/` 下 6 套有机化学考试模拟卷的 Markdown 重构为「题目卡 + 解析卡」垂直流排版，引入真题结构图与 RDKit 生成的模拟卷结构图，并加入详细解析与知识卡片。

**Architecture:** 完全基于项目已有 Markdown 指令（:::callout / :::figure）进行内容重构，不新增自定义组件。图片资产通过 Python + RDKit 批量生成并放入 `public/other/kaoshi-moniji/images/`。6 套卷子彼此独立，采用子智能体并行处理。

**Tech Stack:** Markdown、Python + RDKit、Next.js 静态资源目录、`npm run test:unit`、`npx tsc --noEmit`、`npm run check:encoding`。

## Global Constraints

- 局部优化：不新建页面，不新增 React 组件，只使用项目已有 Markdown 指令。
- 解析默认展开：使用 `:::callout{kind=insight}` 作为解析卡，不使用 `:::derivation`。
- 每道题排版：题目卡（:::callout{kind=note}）→ 解析卡（:::callout{kind=insight}），垂直堆叠。
- 图片路径统一为 `/other/kaoshi-moniji/images/{paper-id}-{question}-{desc}.png`。
- 真题卷结构图从源 DOCX 的 `word/media/` 提取。
- 遵守 PADC 流程，更新后仅对更新部分提交。

---

### Task 1: 创建图片资产目录并迁移真题卷原始结构图

**Covers:** [S4]

**Files:**
- Create: `public/other/kaoshi-moniji/images/real-01-reference.png`
- Create: `public/other/kaoshi-moniji/images/real-02-reference.png`
- Create: `public/other/kaoshi-moniji/images/real-03-reference.png`
- Modify: `tmp/extract_media.py`（如需要调整输出路径）

**Interfaces:**
- Consumes: `tmp/kaoshi-media/real-1-word-media-image1.png` 等已提取的原始图。
- Produces: `public/other/kaoshi-moniji/images/` 下的 PNG 文件。

- [ ] **Step 1: 创建图片目录**

```bash
New-Item -ItemType Directory -Force -Path 'D:\new_project\Gailvlun\public\other\kaoshi-moniji\images' | Out-Null
```

- [ ] **Step 2: 复制真题卷原始结构图**

```bash
Copy-Item 'D:\new_project\Gailvlun\tmp\kaoshi-media\real-1-word-media-image1.png' 'D:\new_project\Gailvlun\public\other\kaoshi-moniji\images\real-01-reference.png'
Copy-Item 'D:\new_project\Gailvlun\tmp\kaoshi-media\real-2-word-media-image1.png' 'D:\new_project\Gailvlun\public\other\kaoshi-moniji\images\real-02-reference.png'
Copy-Item 'D:\new_project\Gailvlun\tmp\kaoshi-media\real-3-word-media-image1.png' 'D:\new_project\Gailvlun\public\other\kaoshi-moniji\images\real-03-reference.png'
```

- [ ] **Step 3: 验证图片存在**

```bash
Get-ChildItem -Path 'D:\new_project\Gailvlun\public\other\kaoshi-moniji\images' | Select-Object Name, Length
```

Expected: 3 个 PNG 文件，大小与源文件一致。

- [ ] **Step 4: Commit**

```bash
git add public/other/kaoshi-moniji/images/
git commit -m "feat: add kaoshi-moniji reference structure images"
```

---

### Task 2: 创建 RDKit 图片生成脚本

**Covers:** [S4]

**Files:**
- Create: `tmp/generate_kaoshi_images.py`

**Interfaces:**
- Consumes: 每道题目的 SMILES 映射。
- Produces: `public/other/kaoshi-moniji/images/` 下的 PNG 文件。

- [ ] **Step 1: 编写 RDKit 图片生成脚本**

```python
"""Generate RDKit structure images for kaoshi-moniji papers."""
from pathlib import Path
from rdkit import Chem
from rdkit.Chem import Draw

ROOT = Path(r"D:\new_project\Gailvlun")
OUT_DIR = ROOT / "public" / "other" / "kaoshi-moniji" / "images"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Mapping: (paper_id, question_id, description) -> list of (label, smiles)
STRUCTURES = {
    # sim-01
    ("sim-01", "q1", "options"): [
        ("A", "C"),          # methane
        ("B", "C=C"),        # ethene
        ("C", "C#C"),        # ethyne
        ("D", "CO"),         # methanol
    ],
    ("sim-01", "q4", "propene-hbr"): [
        ("reactant", "C=CC"),
        ("product", "CCCBr"),
    ],
    ("sim-01", "q6", "sn2-order"): [
        ("CH3Br", "CBr"),
        ("iPrBr", "CC(C)Br"),
        ("tBuBr", "CC(C)(C)Br"),
    ],
    # Add more entries for each paper/question as needed.
}

def generate_image(key, items):
    """Draw labeled molecules side by side."""
    paper_id, q_id, desc = key
    filename = f"{paper_id}-{q_id}-{desc}.png"
    out_path = OUT_DIR / filename

    mols = []
    legends = []
    for label, smiles in items:
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            print(f"WARN: invalid SMILES {smiles} for {filename}")
            continue
        mols.append(mol)
        legends.append(label)

    if not mols:
        return

    width = max(300, len(mols) * 120)
    img = Draw.MolsToGridImage(mols, molsPerRow=len(mols), subImgSize=(120, 120), legends=legends)
    img.save(out_path)
    print(f"Generated {out_path}")

if __name__ == "__main__":
    for key, items in STRUCTURES.items():
        generate_image(key, items)
```

- [ ] **Step 2: 运行脚本并验证**

```bash
python 'D:\new_project\Gailvlun\tmp\generate_kaoshi_images.py'
Get-ChildItem -Path 'D:\new_project\Gailvlun\public\other\kaoshi-moniji\images' | Select-Object Name, Length
```

Expected: 生成 sim-01-q1-options.png 等文件。

- [ ] **Step 3: Commit 脚本**

```bash
git add tmp/generate_kaoshi_images.py
git commit -m "feat: add RDKit image generation script for kaoshi-moniji"
```

---

### Task 3: 制作 sim-01.md 样例并验证渲染

**Covers:** [S3, S5, S6, S7]

**Files:**
- Modify: `content/other/kaoshi-moniji/sim-01.md`

**Interfaces:**
- Consumes: 现有 `sim-01.md` 文本内容、Task 1/2 生成的图片。
- Produces: 重构后的 `sim-01.md` 样例。

- [ ] **Step 1: 重构 sim-01 前 3 道选择题 + 第 1 道反应题 + 第 1 道合成题**

每道题按以下模板重写：

```markdown
### 第 1 题

:::callout{kind=note label="题目"}
下列化合物中，碳原子采取 sp² 杂化的是（    ）

- **A.** CH₄
- **B.** CH₂=CH₂
- **C.** CH≡CH
- **D.** CH₃OH

:::figure{src="/other/kaoshi-moniji/images/sim-01-q1-options.png" alt="选项分子结构" caption="各选项分子的键线式"}
:::
:::

:::callout{kind=insight label="解析"}
**答案：B**

CH₂=CH₂（乙烯）中碳原子形成一个 σ 键和一个 π 键，采用 sp² 杂化。CH₄ 为 sp³ 杂化，CH≡CH 为 sp 杂化，CH₃OH 中碳为 sp³ 杂化。

**推理过程**：
1. 计算每个分子中碳的 σ 键数与孤对电子数。
2. σ 键数 3 且无孤对 → sp²；σ 键数 4 → sp³；σ 键数 2 → sp。
3. 乙烯每个碳形成 3 个 σ 键，剩余 p 轨道侧面重叠形成 π 键。

:::callout{kind=note label="知识卡片：碳的杂化类型"}
| 杂化类型 | 空间构型 | σ 键数 | 实例 |
| --- | --- | --- | --- |
| sp³ | 四面体 | 4 | CH₄、CH₃OH |
| sp² | 平面三角形 | 3 | CH₂=CH₂、苯 |
| sp | 直线形 | 2 | CH≡CH |
:::
:::
```

- [ ] **Step 2: 本地启动 dev server 预览样例**

```bash
npm run dev
```

浏览器访问 `http://localhost:3000/other/kaoshi-moniji/sim-01`，确认：
- 题目卡与解析卡正确渲染。
- 图片正常显示。
- 解析默认展开。

- [ ] **Step 3: 运行验证命令**

```bash
npm run test:unit
npx tsc --noEmit
npm run check:encoding
```

Expected: 全部通过。

- [ ] **Step 4: Commit 样例**

```bash
git add content/other/kaoshi-moniji/sim-01.md public/other/kaoshi-moniji/images/
git commit -m "feat: refactor sim-01 kaoshi-moniji sample with cards and images"
```

---

### Task 4: 批量重构 sim-01.md 全部题目

**Covers:** [S3, S5, S6, S7]

**Files:**
- Modify: `content/other/kaoshi-moniji/sim-01.md`

**Interfaces:**
- Consumes: Task 3 确立的样例风格。
- Produces: 完整重构的 `sim-01.md`。

- [ ] **Step 1: 按样例风格重构 sim-01 全部选择题、填空题、判断题、反应题、合成题、推断题**

- 每道题独立成 `### 第 N 题` 小节。
- 题干放入 `:::callout{kind=note label="题目"}`。
- 解析放入 `:::callout{kind=insight label="解析"}`。
- 填空题/判断题同样处理，填空题答案直接给出并在解析中解释。
- 反应题、合成题、推断题配图并给出详细机理/推理步骤。

- [ ] **Step 2: 更新 RDKit 图片生成脚本以覆盖 sim-01 全部所需结构**

在 `tmp/generate_kaoshi_images.py` 的 `STRUCTURES` 字典中补充 sim-01 全部条目，运行脚本生成所有图片。

- [ ] **Step 3: 运行验证命令**

```bash
npm run test:unit
npx tsc --noEmit
npm run check:encoding
```

Expected: 全部通过。

- [ ] **Step 4: Commit**

```bash
git add content/other/kaoshi-moniji/sim-01.md public/other/kaoshi-moniji/images/ tmp/generate_kaoshi_images.py
git commit -m "feat: fully refactor sim-01 with paired question-answer cards and structure images"
```

---

### Task 5: 批量重构 sim-02.md 与 sim-03.md

**Covers:** [S3, S4, S5, S6, S7]

**Files:**
- Modify: `content/other/kaoshi-moniji/sim-02.md`
- Modify: `content/other/kaoshi-moniji/sim-03.md`

**Interfaces:**
- Consumes: sim-01 确立的风格与图片生成脚本。
- Produces: 完整重构的 sim-02.md、sim-03.md 及其图片。

- [ ] **Step 1: 并行启动两个子智能体分别处理 sim-02 和 sim-03**

每个子智能体：
1. 读取对应 md 文件。
2. 按样例风格重构全部题目。
3. 更新 `tmp/generate_kaoshi_images.py` 中的 `STRUCTURES` 字典（注意合并，避免覆盖 sim-01 条目）。
4. 运行脚本生成图片。
5. 运行验证命令。

- [ ] **Step 2: 合并两个子智能体的修改**

确保 `STRUCTURES` 字典中 sim-01/02/03 的条目全部存在。

- [ ] **Step 3: 运行验证命令**

```bash
npm run test:unit
npx tsc --noEmit
npm run check:encoding
```

Expected: 全部通过。

- [ ] **Step 4: Commit**

```bash
git add content/other/kaoshi-moniji/sim-02.md content/other/kaoshi-moniji/sim-03.md public/other/kaoshi-moniji/images/ tmp/generate_kaoshi_images.py
git commit -m "feat: refactor sim-02 and sim-03 with paired cards and structure images"
```

---

### Task 6: 批量重构 real-01.md、real-02.md、real-03.md

**Covers:** [S3, S4, S5, S6, S7]

**Files:**
- Modify: `content/other/kaoshi-moniji/real-01.md`
- Modify: `content/other/kaoshi-moniji/real-02.md`
- Modify: `content/other/kaoshi-moniji/real-03.md`

**Interfaces:**
- Consumes: Task 1 迁移的真题结构图、sim-01 确立的风格。
- Produces: 完整重构的三套真题 Markdown。

- [ ] **Step 1: 在每套真题 Markdown 开头插入结构式参考图**

```markdown
## 结构式参考图

:::figure{src="/other/kaoshi-moniji/images/real-01-reference.png" alt="本卷结构式参考" caption="本卷涉及的化学结构式参考"}
:::
```

- [ ] **Step 2: 并行启动三个子智能体分别处理 real-01/02/03**

每道题按样例风格重构，解析中引用真题结构图。

- [ ] **Step 3: 运行验证命令**

```bash
npm run test:unit
npx tsc --noEmit
npm run check:encoding
```

Expected: 全部通过。

- [ ] **Step 4: Commit**

```bash
git add content/other/kaoshi-moniji/real-01.md content/other/kaoshi-moniji/real-02.md content/other/kaoshi-moniji/real-03.md
git commit -m "feat: refactor real-01/02/03 with paired cards and reference structure images"
```

---

### Task 7: 最终验证与构建预览

**Covers:** [S8]

**Files:**
- 全部 6 个 md 文件与图片资产。

**Interfaces:**
- Consumes: 前述所有任务产出。
- Produces: 最终可构建、可渲染的内容。

- [ ] **Step 1: 全量运行测试与类型检查**

```bash
npm run test:unit
npx tsc --noEmit
npm run check:encoding
```

Expected: 全部通过，无新增错误。

- [ ] **Step 2: 本地构建并预览**

```bash
npm run build
```

Expected: 构建成功。

- [ ] **Step 3: 检查 lint 是否有新增错误**

```bash
npm run lint 2>&1 | Select-String -Pattern 'kaoshi-moniji|sim-0|real-0' | Select-Object -First 20
```

Expected: 无与本次修改相关的新增 lint 错误。

- [ ] **Step 4: Commit 任何最终修正**

```bash
git add -A
git commit -m "fix: final polish for kaoshi-moniji optimization"
```

---

## Self-Review

- **[S1] 背景与目标**：Task 3-6 覆盖。
- **[S2] 设计约束**：Task 3-6 在 Markdown 模板中体现。
- **[S3] 内容结构**：Task 3-6 覆盖。
- **[S4] 图片资产策略**：Task 1、2、5、6 覆盖。
- **[S5] 知识卡片策略**：Task 3-6 覆盖。
- **[S6] 解析详细化要求**：Task 3-6 覆盖。
- **[S7] 执行计划**：Task 3-7 覆盖。
- **[S8] 验收标准**：Task 7 覆盖。

无占位符，所有文件路径与命令具体。
