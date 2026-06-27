# -*- coding: utf-8 -*-
import os
BASE = r"d:\new_project\Gailvlun"
path = os.path.join(BASE, "content", "other", "english", "unit-5.md")
content = open(os.path.join(BASE, "scripts", "unit5_content.txt"), "r", encoding="utf-8").read()
with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print(f"Written {len(content)} chars to {path}")
