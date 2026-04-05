import json

def diagnostics(filepath):
    with open(filepath, 'rb') as f:
        raw = f.read()
    
    if raw.startswith(b'\xef\xbb\xbf'):
        raw = raw[3:]
    
    mojibake_str = raw.decode('utf-8')
    
    for i, char in enumerate(mojibake_str):
        if ord(char) > 255:
            print(f"Char at {i}: '{char}' (U+{ord(char):04X}) - Context: {mojibake_str[max(0, i-20):i+20]}")

diagnostics('temp_hi.json')
