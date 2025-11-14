"""
Script: move_mapdata_to_backend.py
- Moves `frontend/export1.json` to `backend/data/mapdata.json` (renamed).
- Moves `frontend/export1.html` to `backend/unwanted/archive/export1.html`.
- Cleans up empty frontend directory if needed.
"""
import os, shutil, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
json_src = os.path.join(ROOT, 'frontend', 'export1.json')
json_dst = os.path.join(ROOT, 'backend', 'data', 'mapdata.json')
html_src = os.path.join(ROOT, 'frontend', 'export1.html')
html_archive = os.path.join(ROOT, 'backend', 'unwanted', 'archive', 'export1.html')

print('Step 1: Create backend/data/ if needed')
os.makedirs(os.path.dirname(json_dst), exist_ok=True)

print('Step 2: Move export1.json to backend/data/mapdata.json')
if os.path.exists(json_src):
    shutil.move(json_src, json_dst)
    print(f'  Moved {json_src} -> {json_dst}')
else:
    print(f'  WARNING: {json_src} not found')

print('Step 3: Move export1.html to backend/unwanted/archive/')
os.makedirs(os.path.dirname(html_archive), exist_ok=True)
if os.path.exists(html_src):
    shutil.move(html_src, html_archive)
    print(f'  Moved {html_src} -> {html_archive}')
else:
    print(f'  WARNING: {html_src} not found')

print('Done.')
