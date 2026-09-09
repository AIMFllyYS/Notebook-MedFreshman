# public/images 大图清单（2026-09）

阈值：文件体积 **> 1 MB**。本清单只记录，**不执行压缩**。

建议：转 WebP（质量 82）通常可压到约 1/5；或改走 git LFS。存储方案需用户决定。

引用检索：用路径片段（如 `histology/textbook/p0222_01.png`）在 `content/**/*.md` 中查找，避免同名 `p0001_01.png` 跨学科误报。`content/_raw/**` 为导入底稿，下列「正文引用」只列正式 `content/{subject}/**`。

| 文件 | 体积 | 像素 | 正文引用 |
|------|------|------|----------|
| `public/images/histology/textbook/p0222_01.png` | 9.8 MB | 4883×6758 | `content/anatomy/textbook/ch07-1.md`、`content/biochemistry/textbook/ch09-4.md`（basename 命中；组织学正文未直接引用该扫描页） |
| `public/images/chemistry/sum-01/sum-01-img2.jpeg` | 1.9 MB | （jpeg） | `content/chemistry/summary/sum-01.md` |
| `public/images/biochemistry/textbook/p0001_01.png` | 1.9 MB | 2610×1724 | 无正式正文；仅 `_raw` 教材底稿 |
| `public/images/biochemistry/textbook/p0577_01.png` | 1.9 MB | 2593×1718 | 无正式正文；仅 `_raw/biochemistry` |
| `public/images/anatomy/detail/cranial-nerves.jpg` | 1.7 MB | （jpeg） | `content/anatomy/detail/1.2.md` |
| `public/images/histology/textbook/p0001_01.png` | 1.6 MB | 2634×1707 | 无正式正文；仅 `_raw` 教材底稿 |
| `public/images/histology/textbook/p0221_01.png` | 1.5 MB | 2589×1701 | `content/cell-biology/textbook/ch09-2.md` |
| `public/images/physics/第7章-静电场/a911f4019c85703232c2a09472af5c40b1a6f44b9c636607ea052a75544c9e47.gif` | 1.5 MB | （gif） | 无正式正文；仅 `_raw/physics/courseware` |
| `public/images/histology/textbook/p0059_01.png` | 1.5 MB | 880×1023 | `content/anatomy/textbook/ch01-1.md`、`content/cell-biology/textbook/ch03-2.md`、`content/histology/textbook/ch04-3.md` |
| `public/images/anatomy/detail/pathway.jpg` | 1.4 MB | （jpeg） | `content/anatomy/detail/1.2.md` |
| `public/images/anatomy/textbook/p0450_01.png` | 1.3 MB | 1199×1654 | 无正式正文；仅 `_raw/anatomy` |
| `public/images/physics/智能纪要：大学物理-第十二节 2026年4月10日/5dd7cad70d638f739188c92b83272436d5d5d68ed65a8196606a6dd795fff46f.jpg` | 1.1 MB | （jpeg） | 无正式正文；仅 `_raw/physics` |
| `public/images/anatomy/textbook/p0001_01.png` | 1.1 MB | 1199×1654 | 无正式正文；仅 `_raw` 教材底稿 |
| `public/images/medical-english/kaoqian-moni/paper.jpg` | 1.0 MB | （jpeg） | `content/medical-english/kaoqian-moni/sim-05.md` |
| `public/images/cell-biology/textbook/p0001_01.png` | 1.0 MB | 2575×1689 | 无正式正文；仅 `_raw` 教材底稿 |
| `public/images/cell-biology/textbook/p0417_01.png` | 1.0 MB | 2575×1689 | `content/biochemistry/textbook/ch20-2.md` |
| `public/images/cell-biology/textbook/p0111_01.png` | 1.0 MB | 809×921 | `content/anatomy/textbook/ch01-3.md`、`content/cell-biology/textbook/ch05-1.md`、`content/histology/textbook/ch09-3.md` |
| `public/images/histology/textbook/p0114_02.png` | 1.0 MB | 898×644 | `content/biochemistry/textbook/ch05-1.md`、`content/histology/textbook/ch09-7.md` |

共 **18** 个文件（审查当日写 14 个；现网多出化学纪要图、物理课件 gif/jpg、医学英语试卷扫描等）。`public/rdkit/RDKit_minimal.wasm`（6.6 MB）是运行时必需，不在本表。
