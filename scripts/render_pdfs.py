import fitz
import os
import sys

# 用法: python scripts/render_pdfs.py <unit PDF 目录> [输出目录]
# 在 <目录> 中寻找 unit<N>.pdf；输出默认写到 tmp/pdf_extracts/（已被 gitignore）。
src_dir = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('UNIT_PDF_DIR', '')
if not src_dir or not os.path.isdir(src_dir):
    print('Usage: python scripts/render_pdfs.py <dir with unitN.pdf> [out_dir]')
    sys.exit(1)

units = {}
for name in sorted(os.listdir(src_dir)):
    stem = name.lower().removesuffix('.pdf')
    if stem.startswith('unit') and stem[4:].isdigit():
        units[int(stem[4:])] = os.path.join(src_dir, name)
if not units:
    print(f'No unitN.pdf found under {src_dir}')
    sys.exit(1)

out_base = sys.argv[2] if len(sys.argv) > 2 else os.path.join('tmp', 'pdf_extracts')
os.makedirs(out_base, exist_ok=True)

for unit_num, pdf_path in units.items():
    out_dir = os.path.join(out_base, f'unit{unit_num}')
    os.makedirs(out_dir, exist_ok=True)
    doc = fitz.open(pdf_path)
    print(f'Unit {unit_num}: {len(doc)} pages -> {out_dir}')
    for i in range(len(doc)):
        page = doc[i]
        mat = fitz.Matrix(2.0, 2.0)  # 2x scale for readability
        pix = page.get_pixmap(matrix=mat)
        out_path = os.path.join(out_dir, f'page_{i+1:02d}.png')
        pix.save(out_path)
    n = len(doc)
    doc.close()
    print(f'  Saved {n} images')

print('Done!')
