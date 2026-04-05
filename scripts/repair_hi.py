import json

def repair_double_utf8(filepath, output_path):
    with open(filepath, 'rb') as f:
        raw = f.read()
    
    # Remove BOM if present
    if raw.startswith(b'\xef\xbb\xbf'):
        raw = raw[3:]
    
    # Step 1: Decode as UTF-8 to get the string with Mojibake (e.g., "à¤µ")
    mojibake_str = raw.decode('utf-8')
    
    try:
        # Step 2: Encode to bytes as CP1252. This captures the original UTF-8 bytes.
        # CP1252 is used because it handles characters in the 0x80-0x9F range (like Euro, Rupee symbol Mojibake, etc.)
        original_utf8_bytes = mojibake_str.encode('cp1252')
        
        # Step 3: Decode those bytes as UTF-8 to get the real Hindi text.
        real_hindi_str = original_utf8_bytes.decode('utf-8')
        
        # Parse and re-dump to ensure it's valid JSON and pretty-printed
        data = json.loads(real_hindi_str)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"Successfully repaired {filepath} -> {output_path}")
        return True
    except Exception as e:
        print(f"Failed to repair: {e}")
        return False

repair_double_utf8('temp_hi.json', 'clean_hi.json')
