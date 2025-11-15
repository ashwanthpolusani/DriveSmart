import requests
import json
import time

API_KEY = "AIzaSyD3t4mfJNy9NxxVKT4J_T47soKBgCRUTO4"
INPUT_PATH = r"d:/4-1/ROAD-ACCIDENTS-PREDICTION-AND-CLASSIFICATION-master/backend/data/reports/hotspot_analysis_report.json"
OUTPUT_PATH = r"d:/4-1/ROAD-ACCIDENTS-PREDICTION-AND-CLASSIFICATION-master/backend/data/reports/hotspot_analysis_report.json"

with open(INPUT_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

for i, h in enumerate(data["top_hotspots"]):
    lat, lng = h["lat"], h["lng"]
    url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={API_KEY}"
    try:
        resp = requests.get(url)
        res = resp.json()
        if res["results"]:
            h["location_name"] = res["results"][0]["formatted_address"]
        else:
            h["location_name"] = ""
    except Exception as e:
        h["location_name"] = ""
    print(f"{i+1}/{len(data['top_hotspots'])}: {lat},{lng} -> {h['location_name']}")
    time.sleep(0.2)  # avoid hitting rate limits

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Done updating location names for all hotspots.")
