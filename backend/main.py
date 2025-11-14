from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np

app = Flask(__name__)
CORS(app)

# Load the ML model from backend/data/
# The model is essential for /api/predict predictions
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'data', 'litemodel.sav')
model = None
try:
    if os.path.exists(MODEL_PATH):
        import joblib
        model = joblib.load(MODEL_PATH)
        print('Loaded model from', MODEL_PATH)
    else:
        print('Model not found at', MODEL_PATH, '- prediction API will be disabled until model is provided')
except Exception as e:
    print('Failed to load model:', e)
    model = None


def map_frontend_to_model_features(payload: dict):
    """Map frontend payload to numeric feature vector expected by the model.

    This function keeps a small, robust mapping and provides defaults so the
    API remains usable during frontend/back-end iteration.
    """
    # Basic mappings / defaults
    vehicle_map = {'car': 3, 'bike': 2, 'truck': 4, 'bus': 5}
    weather_map = {'clear': 1, 'rain': 2, 'fog': 3, 'snow': 4}

    # Read values with sensible fallbacks
    Did_Police_Officer_Attend = float(payload.get('Did_Police_Officer_Attend', 0))
    age_of_driver = float(payload.get('age_of_driver', 30.0))
    try:
        vehicle_type = float(payload.get('vehicle_type'))
    except Exception:
        vehicle_type = vehicle_map.get(payload.get('vehicle', '').lower(), 3)

    age_of_vehicle = float(payload.get('age_of_vehicle', 5.0))
    engine_cc = float(payload.get('engine_cc', 1500.0))
    day = int(float(payload.get('day', 1)))
    weather_n = int(float(payload.get('weather', weather_map.get(payload.get('weather', '').lower(), 1))))
    roadsc = int(float(payload.get('roadsc', 1)))
    light = int(float(payload.get('light', 1)))
    gender = int(float(payload.get('gender', 1)))
    speedl = float(payload.get('speedl', 40.0))

    arr = np.array([Did_Police_Officer_Attend, age_of_driver, vehicle_type, age_of_vehicle,
                    engine_cc, day, weather_n, roadsc, light, gender, speedl])
    return arr.astype(float).reshape(1, -1)


@app.route('/api/predict', methods=['POST'])
def api_predict():
    """Predict endpoint used by the frontend.

    Returns JSON with `prediction` and optional `confidence` when a model
    is available. If no model is loaded, returns HTTP 503 with an explanatory
    message so frontend development can continue.
    """
    if model is None:
        return jsonify({'error': 'Model not available on server. Place model at ' + MODEL_PATH}), 503

    payload = request.get_json(force=True)
    if not payload:
        return jsonify({'error': 'No JSON payload received'}), 400

    try:
        features = map_frontend_to_model_features(payload)
        pred = model.predict(features)
        confidence = None
        try:
            probs = model.predict_proba(features)
            confidence = float(np.max(probs) * 100)
        except Exception:
            confidence = None
        return jsonify({'prediction': str(pred[0]), 'confidence': confidence})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def _load_mapdata_json(path=None):
    """Load map data from `backend/data/mapdata.json`.

    This helper reads the pre-extracted widget JSON (containing API key and heatmap locations).
    Returns the parsed JSON dict or None on failure.
    """
    import json
    try:
        if not path:
            # Default to backend/data/mapdata.json (relative to this file)
            path = os.path.join(os.path.dirname(__file__), 'data', 'mapdata.json')
        path = os.path.abspath(path)
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return None


@app.route('/api/mapdata', methods=['GET'])
def api_mapdata():
    """Return the API key and heatmap locations from `backend/data/mapdata.json`.

    Response example: { "api_key": "...", "locations": [ {"lat": .., "lng": ..}, ... ] }
    """
    data = _load_mapdata_json()
    if not data:
        return jsonify({'error': 'map data not found at backend/data/mapdata.json'}), 404

    state = data.get('state', {})
    api_key = None
    locations = []

    for k, v in state.items():
        if not isinstance(v, dict):
            continue
        model_name = v.get('model_name')
        s = v.get('state', {})
        if model_name == 'PlainmapModel':
            cfg = s.get('configuration', {})
            if cfg.get('api_key'):
                api_key = cfg.get('api_key')
        if model_name == 'SimpleHeatmapLayerModel':
            locs = s.get('locations', [])
            for pair in locs:
                if isinstance(pair, list) and len(pair) >= 2:
                    locations.append({'lat': float(pair[0]), 'lng': float(pair[1])})

    return jsonify({'api_key': api_key, 'locations': locations})


@app.route('/', methods=['GET'])
def index():
    # API-only backend. Frontend is served separately.
    return jsonify({'message': 'DriveSmart backend — API only'}), 200


if __name__ == '__main__':
    # Keep debug on for development, but consider disabling in production.
    app.run(host='0.0.0.0', debug=True, port=4000)
