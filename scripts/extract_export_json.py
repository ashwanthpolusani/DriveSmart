"""
Script: extract_export_json.py
- Reads `frontend/export1.html` and extracts the JSON payload from the
  <script type="application/vnd.jupyter.widget-state+json"> block.
- Writes the JSON (pretty-printed) to `frontend/export1.json`.
- Exits with code 0 on success.
"""
import re, json, os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
html_path = os.path.join(ROOT, 'frontend', 'export1.html')
json_path = os.path.join(ROOT, 'frontend', 'export1.json')
print('Reading', html_path)
if not os.path.exists(html_path):
    print('ERROR: file not found:', html_path)
    sys.exit(2)
text = open(html_path, 'r', encoding='utf-8').read()
m = re.search(r'<script[^>]*type=["\']application/vnd.jupyter.widget-state\+json["\'][^>]*>(.*?)</script>', text, re.S)
if not m:
    print('ERROR: widget-state script tag not found in', html_path)
    sys.exit(3)
js = m.group(1).strip()
try:
    data = json.loads(js)
except Exception as e:
    print('ERROR: failed to parse JSON from script block:', e)
    sys.exit(4)
# Write pretty JSON
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print('Wrote JSON to', json_path)
print('Top-level keys:', list(data.keys()))
sys.exit(0)
