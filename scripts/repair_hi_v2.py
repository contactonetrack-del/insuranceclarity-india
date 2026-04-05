import json

def manual_repair(filepath, output_path):
    with open(filepath, 'rb') as f:
        raw = f.read()
    
    if raw.startswith(b'\xef\xbb\xbf'):
        raw = raw[3:]
    
    mojibake_str = raw.decode('utf-8')
    
    # Map high unicode characters found in CP1252 mojibake back to their bytes
    cp1252_map = {
        0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85,
        0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88, 0x2030: 0x89, 0x0160: 0x8A,
        0x2039: 0x8B, 0x0152: 0x8C, 0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92,
        0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
        0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B, 0x0153: 0x9C,
        0x017E: 0x9E, 0x0178: 0x9F
    }
    
    # Also handle some common C1 control character maps if they leaked in as U+00XX
    # (Actually ord() will just handle U+0000 to U+00FF directly)
    
    byte_list = []
    for char in mojibake_str:
        code = ord(char)
        if code in cp1252_map:
            byte_list.append(cp1252_map[code])
        elif code <= 255:
            byte_list.append(code)
        else:
            # If we find something else, it might be a correctly encoded character or something even weirder.
            # But in this specific mojibake, anything else is likely a mistake.
            # Let's see if there are any others.
            print(f"Warning: Found unmapped character U+{code:04X} ('{char}')")
            # For now, let's try to just use the low byte or a placeholder
            byte_list.append(63) # '?'
            
    original_bytes = bytes(byte_list)
    
    try:
        real_hindi_str = original_bytes.decode('utf-8')
        data = json.loads(real_hindi_str)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Repaired successfully -> {output_path}")
        return True
    except Exception as e:
        print(f"Failed to decode repaired bytes as UTF-8: {e}")
        # Try to see where it failed
        return False

manual_repair('temp_hi.json', 'clean_hi.json')
