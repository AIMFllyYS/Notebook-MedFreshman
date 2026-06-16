import subprocess, os
env = os.environ.copy()
r = subprocess.run(
    [r"C:\Users\AIMFl\AppData\Local\Programs\MiKTeX\miktex\bin\x64\dvisvgm.exe",
     "--no-fonts",
     r"D:\new_project\Gailvlun\manim\media\Tex\test_simple.dvi",
     "-o", r"D:\new_project\Gailvlun\manim\media\Tex\test_simple.svg"],
    capture_output=True, env=env, timeout=30
)
print("ret:", r.returncode)
print("stdout:", r.stdout.decode("latin-1", errors="replace")[:500])
print("stderr:", r.stderr.decode("latin-1", errors="replace")[:500])
print("SVG exists:", os.path.exists(r"D:\new_project\Gailvlun\manim\media\Tex\test_simple.svg"))
