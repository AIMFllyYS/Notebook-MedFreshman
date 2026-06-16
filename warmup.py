import subprocess, os, time

env = os.environ.copy()
texdir = r"D:\new_project\Gailvlun\manim\media\Tex"

template = r"""\documentclass[preview]{{standalone}}
\usepackage[english]{{babel}}
\usepackage{{amsmath}}
\usepackage{{amssymb}}
\begin{{document}}
{}
\end{{document}}
"""

# Test the specific ones that failed
exprs = [
    r"\bar{X} = \frac{1}{n}\sum_{i=1}^{n} X_i",
    r"\chi^2(1)",
]

for i, expr in enumerate(exprs):
    texfile = os.path.join(texdir, f"test_{i:02d}.tex")
    dvifile = os.path.join(texdir, f"test_{i:02d}.dvi")
    logfile = os.path.join(texdir, f"test_{i:02d}.log")
    with open(texfile, "w", encoding="utf-8") as f:
        f.write(template.format(expr))
    
    r = subprocess.run(
        ["latex", "--interaction=nonstopmode", f"--output-directory={texdir}", texfile],
        capture_output=True, env=env, timeout=90
    )
    time.sleep(1.0)
    exists = os.path.exists(dvifile)
    print(f"test_{i:02d}: ret={r.returncode}, dvi={exists}")
    
    if os.path.exists(logfile):
        with open(logfile, encoding="latin-1", errors="replace") as lf:
            log = lf.read()
        # Find error lines
        for line in log.split("\n"):
            if "error" in line.lower() or "fatal" in line.lower() or "!" in line:
                print("  LOG:", line[:120])
