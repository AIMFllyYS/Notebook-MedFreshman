# -*- coding: utf-8 -*-
import os
# 仓库根由脚本位置推导（原脚本写死了单机绝对路径）。
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path = os.path.join(BASE, "content", "other", "english", "unit-5.md")
content = open(os.path.join(BASE, "scripts", "unit5_content.txt"), "r", encoding="utf-8").read()
with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print(f"Written {len(content)} chars to {path}")
