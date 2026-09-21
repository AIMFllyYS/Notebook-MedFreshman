import fitz  # PyMuPDF
import json, os, sys

# 用法: python scripts/extract_units.py <unit PDF 目录> [输出目录]
# 在 <目录> 中寻找 unit<N>.pdf；输出默认写到 tmp/pdf_extracts/（已被 gitignore）。
src_dir = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('UNIT_PDF_DIR', '')
if not src_dir or not os.path.isdir(src_dir):
    print('Usage: python scripts/extract_units.py <dir with unitN.pdf> [out_dir]')
    sys.exit(1)

units = {}
for name in sorted(os.listdir(src_dir)):
    stem = name.lower().removesuffix('.pdf')
    if stem.startswith('unit') and stem[4:].isdigit():
        units[int(stem[4:])] = os.path.join(src_dir, name)
if not units:
    print(f'No unitN.pdf found under {src_dir}')
    sys.exit(1)

out_dir = sys.argv[2] if len(sys.argv) > 2 else os.path.join('tmp', 'pdf_extracts')
os.makedirs(out_dir, exist_ok=True)

for unit_num, pdf_path in units.items():
    print(f'\n{"="*60}')
    print(f'Unit {unit_num}: {pdf_path}')
    print(f'{"="*60}')
    doc = fitz.open(pdf_path)
    print(f'Total pages: {len(doc)}')
    
    all_text = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text("text")
        all_text.append(f'--- Page {page_num+1} ---\n{text}')
        # Print first 3 pages fully to understand structure
        if page_num < 3:
            print(f'\n[Page {page_num+1}]')
            print(text[:2000])
    
    # Save full text
    out_file = os.path.join(out_dir, f'unit{unit_num}_text.txt')
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(all_text))
    print(f'\n[Saved full text to {out_file}]')
    doc.close()

print('\nDone!')
