"""
Process accidents.csv and produce summary JSON and GeoJSON hotspots.
Outputs:
 - backend/data/accidents_summary.json
 - backend/data/accidents_hotspots.geojson

Requirements: pandas
"""
import os, json
from collections import Counter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CSV_PATH = os.path.join(ROOT, 'backend', 'data', 'accidents.csv')
OUT_SUMMARY = os.path.join(ROOT, 'backend', 'data', 'accidents_summary.json')
OUT_HOTSPOTS = os.path.join(ROOT, 'backend', 'data', 'accidents_hotspots.geojson')

print('Reading', CSV_PATH)
try:
    import pandas as pd
except Exception as e:
    print('Pandas is required. Install with: pip install pandas')
    raise

# Read CSV in chunks to avoid memory issues if necessary
chunks = pd.read_csv(CSV_PATH, parse_dates=['date'], dayfirst=True, dtype=str, chunksize=20000)

# We'll accumulate counts
total_rows = 0
severity_counter = Counter()
day_of_week_counter = Counter()
hour_counter = Counter()
force_counter = Counter()
latlng_counter = Counter()

for chunk in chunks:
    # Normalize column names
    # Ensure numeric columns are parsed where needed
    # Parse time to extract hour
    chunk = chunk.copy()
    total_rows += len(chunk)

    # collision_severity
    if 'collision_severity' in chunk.columns:
        severity_counter.update(chunk['collision_severity'].fillna('-1').tolist())

    # day_of_week
    if 'day_of_week' in chunk.columns:
        day_of_week_counter.update(chunk['day_of_week'].fillna('-1').tolist())

    # hour: from 'time' column, format HH:MM
    if 'time' in chunk.columns:
        times = chunk['time'].fillna('')
        hours = times.str.split(':').str[0].replace('', '-1')
        hour_counter.update(hours.tolist())

    # police_force
    if 'police_force' in chunk.columns:
        force_counter.update(chunk['police_force'].fillna('-1').tolist())

    # hotspots: use latitude & longitude
    if 'latitude' in chunk.columns and 'longitude' in chunk.columns:
        lat = pd.to_numeric(chunk['latitude'], errors='coerce')
        lng = pd.to_numeric(chunk['longitude'], errors='coerce')
        # round to 3 decimals (~100m) to aggregate nearby points
        rounded = list(zip(lat.round(3).astype(str), lng.round(3).astype(str)))
        latlng_counter.update(rounded)

# Prepare top lists
def top_n(counter, n=10):
    return [{'key': k, 'count': int(v)} for k, v in counter.most_common(n)]

summary = {
    'total_rows': int(total_rows),
    'by_severity': top_n(severity_counter, 10),
    'by_day_of_week': top_n(day_of_week_counter, 10),
    'by_hour': top_n(hour_counter, 24),
    'by_police_force': top_n(force_counter, 10),
}

with open(OUT_SUMMARY, 'w', encoding='utf-8') as f:
    json.dump(summary, f, indent=2)
print('Wrote summary to', OUT_SUMMARY)

# Create GeoJSON for hotspots (top 200)
hotspots = []
for (lats, lngs), cnt in latlng_counter.most_common(200):
    try:
        latf = float(lats)
        lngf = float(lngs)
    except Exception:
        continue
    hotspots.append({'type': 'Feature', 'properties': {'count': int(cnt)}, 'geometry': {'type': 'Point', 'coordinates': [lngf, latf]}})

geo = {'type': 'FeatureCollection', 'features': hotspots}
with open(OUT_HOTSPOTS, 'w', encoding='utf-8') as f:
    json.dump(geo, f)
print('Wrote hotspots geojson to', OUT_HOTSPOTS)
print('Done')
