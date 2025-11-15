# DriveSmart: Road Accident Prediction & Classification

A full-stack web application that predicts road accident severity using machine learning, geolocation, and real-time weather data.

## 📋 Project Overview

**DriveSmart** combines a React frontend with a Flask backend to provide:
- **Accident Severity Prediction** — Classifies accidents as Fatal, Severe, or Slight
- **Interactive Heatmap** — Visualizes accident hotspots across the UK
- **Real-time Data Collection** — Captures user location, weather, vehicle info, and driver details
- **ML Model** — Stacked Ensembled Model (96.76% accuracy)

## 🏗️ Architecture

```
frontend/           ← React + Vite (user interface)
backend/            ← Flask API (predictions & data serving)
  ├── data/
  │   ├── mapdata.json        (heatmap locations & Google API key)
  │   └── litemodel.sav       (trained Random Forest model)
  ├── main.py                 (Flask app with /api/predict & /api/mapdata)
  └── requirements.txt
unwanted/           ← Archived files (old notebooks, venv, etc.)
scripts/            ← Utility scripts for data/file management
```

## 🚀 Quick Start

### Option 1: Automatic Setup Scripts (Recommended)

**For Windows Users:**
```bash
# Simply run the batch file
start.bat
```

**For Mac/Linux Users:**
```bash
# Make the script executable and run it
chmod +x start.sh
./start.sh
```

### Option 2: Manual Setup

#### Backend Setup
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Run the Flask server (port 4000)
python backend/main.py
```

#### Frontend Setup
```bash
# Install dependencies
cd frontend
npm install

# Run Vite dev server (port 5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

### Need Help?
For detailed setup instructions and troubleshooting, see [SETUP.md](SETUP.md).

## 📡 API Endpoints

### `/api/predict` (POST)
Predicts accident severity from user input.

**Request:**
```json
{
  "age_of_driver": 35,
  "age_of_vehicle": 5,
  "vehicle": "car",
  "engine_cc": 1500,
  "speedl": 60,
  "Did_Police_Officer_Attend": 1,
  "gender": 1,
  "day": 3,
  "weather": "rain",
  "roadsc": 1,
  "light": 1
}
```

**Response:**
```json
{
  "prediction": "2",
  "confidence": 87.5
}
```

### `/api/mapdata` (GET)
Returns Google Maps API key and heatmap locations.

**Response:**
```json
{
  "api_key": "AIzaSyD3t4mfJNy9NxxVKT4J_T47soKBgCRUTO4",
  "locations": [
    {"lat": 51.5155, "lng": -0.0806},
    ...
  ]
}
```

## 🎯 Features

- ✅ **Severity Prediction** — Uses ML to classify accident risk
- ✅ **Interactive Map** — Google Maps heatmap showing accident hotspots
- ✅ **Accident Analytics** — Comprehensive reports on safety trends, hotspots, and emergency response
- ✅ **Form Validation** — Client-side and server-side input validation
- ✅ **CORS Enabled** — Frontend and backend run on different ports
- ✅ **Clean Architecture** — Separated frontend/backend with clear data flow

## 📊 Model Details

- **Algorithm:** Stacked Ensembled Model
- **Accuracy:** 96.76%
- **Input Features:** Driver age, vehicle info, speed, weather, road conditions, light conditions
- **Output Classes:** 1 (Fatal), 2 (Severe), 3 (Slight)

## 🛠️ Technologies

**Frontend:**
- React 18 + Vite
- Google Maps JavaScript API (gmaps library)
- Heatmap visualization

**Backend:**
- Python 3.12
- Flask + Flask-CORS
- Joblib (model loading)
- NumPy (numerical operations)

## 📝 Project Structure

```
project/
├── frontend/
│   ├── src/
│   │   ├── DriveSmart.jsx      (prediction form & UI)
│   │   ├── MapComponent.jsx    (heatmap visualization)
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── data/
│   │   ├── mapdata.json
│   │   └── litemodel.sav
│   ├── main.py
│   ├── requirements.txt
│   └── README-DRIVESMART-INTEGRATION.md
├── scripts/                    (utility scripts)
├── unwanted/                   (archived files)
├── .gitignore
└── README.md
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend (optional):
```
FLASK_ENV=development
FLASK_DEBUG=1
```

### Model Path
The model (`litemodel.sav`) is loaded from `backend/data/litemodel.sav` at startup.

## 📚 Data Files

- **mapdata.json** — Extracted widget state from Jupyter widget export (API key + heatmap locations)
- **litemodel.sav** — Pre-trained Random Forest model serialized with Joblib

## ⚠️ Notes

- The Google Maps API key in `mapdata.json` must have the **Heatmap Layer library** enabled.
- Ensure the key is not restricted to a specific domain (or allow `localhost:5173`).
- The backend runs on port 4000; the frontend on port 5173.

## 🚢 Deployment

For production, consider:
1. Building the React app: `cd frontend && npm run build`
2. Serving static files from the Flask backend or a CDN
3. Using WSGI servers like Gunicorn instead of Flask's dev server
4. Securing the Google Maps API key with domain restrictions

## 📖 Dataset

Original dataset: [Road Safety Data](https://www.gov.uk/government/statistics/road-safety-data)

## 📚 Additional Documentation

For detailed technical implementation, data analysis, and API specifications, see [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md).

## 👨‍💻 Contributing

To add features or improvements:
1. Create a new branch for your changes
2. Test the backend API with `curl` or Postman
3. Test the frontend in dev mode
4. Commit with clear messages

## 📄 License

This project is for educational purposes.

---

**Last Updated:** November 2025
