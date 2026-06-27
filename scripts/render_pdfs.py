import fitz
import os

units = {
    5: r'C:\Users\AIMFl\OneDrive\文档\课程文件\1\unit5.pdf',
    6: r'C:\Users\AIMFl\OneDrive\文档\课程文件\1\unit6.pdf',
    7: r'C:\Users\AIMFl\OneDrive\文档\课程文件\1\unit7.pdf',
    8: r'C:\Users\AIMFl\OneDrive\文档\课程文件\1\unit8.pdf',
}

out_base = r'd:\new_project\Gailvlun\scripts\pdf_extracts'
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
