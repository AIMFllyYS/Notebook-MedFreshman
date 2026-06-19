# 有机化学 Manim 脚本（chemistry）

## 已验证的化学分子渲染方式（重要）

**不要用 `chanim` 的 `ChemObject` / `ChemTemplate`**：chanim 1.3 的模板与本机 MiKTeX 的
chemfig 1.71 不兼容（`\setchemfig{… node style=, bond style=}` 触发
`Argument of \skv_gob has an extra }`，渲染失败）。

**改用原生 Manim `Tex` + 自定义 `TexTemplate` 直接加载 chemfig 宏包**（已验证可渲染分子骨架式 + CJK + 能量曲线）：

```python
import numpy as np
from manim import *

# 复用型化学 TexTemplate（每个化学场景文件顶部定义即可）
CHEM_TEMPLATE = TexTemplate()
CHEM_TEMPLATE.add_to_preamble(r"\usepackage{chemfig}")

class SomeChemScene(Scene):
    def construct(self):
        # 中文：必须 Text + 字体（MiKTeX 无 CJK）
        title = Text("标题", font="Microsoft YaHei").to_edge(UP)
        # 分子骨架式：Tex + chemfig 模板
        mol = Tex(r"\chemfig{CH_3-CH_2-OH}", tex_template=CHEM_TEMPLATE)
        # 机理箭头/能量曲线：标准 manim 对象（Arrow / Axes.plot 等），不依赖 LaTeX
```

## 约定

- 每个场景模块顶层导出 `REGISTER` 列表（见 `manim/render.py` 注释），含
  `scene / id / chapterId / sectionId / title / description`。
- 化学视频 id 格式：`{chapterId}-{sectionId}-{slug}`（如 `ch04-4.2-newman`）。
- chemfig 适合：分子骨架式、反应式。机理电子转移箭头、纽曼投影旋转、势能曲线
  用标准 manim 几何对象，效果更可控。
- 渲染时把 MiKTeX bin 置于 PATH 最前，并剔除 `Python\Python3*` 目录（避免 latex.exe DLL 冲突）。

## 环境依赖（已安装并验证）

- manim 0.20.1、Python 3.14
- MiKTeX 26.5 + chemfig 1.71 + simplekv（`kpsewhich chemfig.sty` 可定位）
- 中文字体 Microsoft YaHei
