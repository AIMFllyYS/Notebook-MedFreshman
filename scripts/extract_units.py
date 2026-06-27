import fitz  # PyMuPDF
import json, os, sys

units = {
    5: r'C:\Users\AIMFl\OneDrive\文档\课程文件\1\unit5.pdf',
    6: r'C:\Users\AIMFl\OneDrive\文档\课程文件\1\unit6.pdf',
    7: r'C:\Users\AIMFl\OneDrive\文档\课程文件\1\unit7.pdf',
    8: r'C:\Users\AIMFl\OneDrive\文档\课程文件\1\unit8.pdf',
}

out_dir = r'd:\new_project\Gailvlun\scripts\pdf_extracts'
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
