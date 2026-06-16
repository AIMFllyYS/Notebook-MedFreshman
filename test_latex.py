import struct, os

def read_pe_imports(filename):
    try:
        with open(filename, 'rb') as f:
            data = f.read()
        
        # Find PE header
        if data[:2] != b'MZ':
            return []
        pe_offset = struct.unpack_from('<I', data, 0x3C)[0]
        if data[pe_offset:pe_offset+4] != b'PE\x00\x00':
            return []
        
        machine = struct.unpack_from('<H', data, pe_offset+4)[0]
        if machine == 0x8664:  # x64
            opt_header_size = struct.unpack_from('<H', data, pe_offset+20)[0]
            import_rva = struct.unpack_from('<I', data, pe_offset+24+104)[0]  
        else:
            return []
        
        # Find section with import RVA
        num_sections = struct.unpack_from('<H', data, pe_offset+6)[0]
        sections_offset = pe_offset + 24 + opt_header_size
        
        for i in range(num_sections):
            sec_off = sections_offset + i*40
            vaddr = struct.unpack_from('<I', data, sec_off+12)[0]
            vsize = struct.unpack_from('<I', data, sec_off+16)[0]
            raw_off = struct.unpack_from('<I', data, sec_off+20)[0]
            
            if vaddr <= import_rva < vaddr + vsize:
                raw_import = raw_off + (import_rva - vaddr)
                dlls = []
                off = raw_import
                while True:
                    name_rva = struct.unpack_from('<I', data, off+12)[0]
                    if name_rva == 0:
                        break
                    name_raw = raw_off + (name_rva - vaddr)
                    end = data.index(b'\x00', name_raw)
                    dlls.append(data[name_raw:end].decode('ascii', errors='replace'))
                    off += 20
                return dlls
        return []
    except Exception as e:
        return [f"error: {e}"]

latex_exe = r"C:\Users\AIMFl\AppData\Local\Programs\MiKTeX\miktex\bin\x64\latex.exe"
dlls = read_pe_imports(latex_exe)
for dll in dlls:
    print(dll)
