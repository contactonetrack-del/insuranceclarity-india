import json
import os

def load_json(filepath):
    # Try different encodings
    encodings = ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']
    for enc in encodings:
        try:
            with open(filepath, 'r', encoding=enc) as f:
                content = f.read().strip()
                if not content:
                    print(f"File {filepath} is empty.")
                    return None
                return json.loads(content)
        except (UnicodeDecodeError, json.JSONDecodeError) as e:
            print(f"Failed with {enc}: {e}")
            continue
    print(f"Could not load {filepath} with any common encoding.")
    return None

en_data = load_json('messages/en.json')
temp_hi_data = load_json('temp_hi.json')

if not en_data or not temp_hi_data:
    exit(1)

def get_keys(data, prefix=''):
    keys = set()
    if not isinstance(data, dict):
        return keys
    for k, v in data.items():
        full_key = f"{prefix}.{k}" if prefix else k
        keys.add(full_key)
        if isinstance(v, dict):
            keys.update(get_keys(v, full_key))
    return keys

en_keys = get_keys(en_data)
hi_keys = get_keys(temp_hi_data)

missing_in_hi = en_keys - hi_keys
missing_in_en = hi_keys - en_keys

print(f"Total keys in EN: {len(en_keys)}")
print(f"Total keys in HI: {len(hi_keys)}")

if missing_in_hi:
    print(f"Missing in HI ({len(missing_in_hi)}):")
    for key in sorted(list(missing_in_hi))[:50]: # Show first 50
        print(f"  - {key}")
    if len(missing_in_hi) > 50:
        print(f"  ... and {len(missing_in_hi) - 50} more.")
else:
    print("No missing keys in HI.")

if missing_in_en:
    print(f"Extra in HI ({len(missing_in_en)}):")
    for key in sorted(list(missing_in_en))[:50]:
        print(f"  - {key}")
    if len(missing_in_en) > 50:
        print(f"  ... and {len(missing_in_en) - 50} more.")
else:
    print("No extra keys in HI.")
