"""Manually compile the missing 0.25 SVG for scene_3_1_joint_dist."""
import subprocess
import os
import pathlib
import time

env = dict(os.environ)
env['PATH'] = r'C:\Users\AIMFl\AppData\Local\Programs\MiKTeX\miktex\bin\x64;' + env.get('PATH', '')

tex_dir = pathlib.Path(r'D:\new_project\Gailvlun\manim\media\Tex')
hash_name = 'c31854b9ad1b33d4'
tex_file = tex_dir / (hash_name + '.tex')
dvi_file = tex_dir / (hash_name + '.dvi')
svg_file = tex_dir / (hash_name + '.svg')

print(f'dvi exists: {dvi_file.exists()}')
print(f'svg exists: {svg_file.exists()}')
print(f'tex exists: {tex_file.exists()}')

# Write the tex file if it doesn't exist
tex_content = r"""\documentclass[preview]{standalone}
\usepackage[english]{babel}
\usepackage{amsmath}
\usepackage{amssymb}
\begin{document}
\begin{align*}
\special{dvisvgm:raw <g id='unique000'>}0.25\special{dvisvgm:raw </g>}
\end{align*}
\end{document}
"""

if not tex_file.exists():
    tex_file.write_text(tex_content)
    print('Written tex file')

# Run latex
latex = r'C:\Users\AIMFl\AppData\Local\Programs\MiKTeX\miktex\bin\x64\latex.exe'
print('Running latex...')
r = subprocess.run(
    [latex, '-interaction=nonstopmode', '-halt-on-error', tex_file.name],
    cwd=str(tex_dir), env=env, capture_output=True
)
print(f'latex exit: {r.returncode}')
print(f'dvi exists after latex: {dvi_file.exists()}')

if dvi_file.exists():
    print(f'dvi size: {dvi_file.stat().st_size}')
    # Wait a bit for file handles to release
    time.sleep(1.0)

    # Run dvisvgm
    dvisvgm = r'C:\Users\AIMFl\AppData\Local\Programs\MiKTeX\miktex\bin\x64\dvisvgm.exe'
    print('Running dvisvgm...')
    r2 = subprocess.run(
        [dvisvgm, '--page=1', '--no-fonts', '--verbosity=3',
         f'--output={svg_file.as_posix()}', f'{dvi_file.as_posix()}'],
        cwd=str(tex_dir), env=env, capture_output=True
    )
    print(f'dvisvgm exit: {r2.returncode}')
    print(f'svg exists: {svg_file.exists()}')
    if r2.stderr:
        print(f'dvisvgm stderr: {r2.stderr.decode("utf-8", errors="replace")[:1000]}')
    if r2.stdout:
        print(f'dvisvgm stdout: {r2.stdout.decode("utf-8", errors="replace")[:500]}')
else:
    print('latex failed to create dvi')
    if r.stderr:
        print(f'stderr: {r.stderr.decode("utf-8", errors="replace")[:500]}')
    log = tex_dir / (hash_name + '.log')
    if log.exists():
        print(f'log tail: {log.read_text(errors="replace")[-800:]}')
