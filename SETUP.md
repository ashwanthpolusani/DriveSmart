# DriveSmart: Complete Setup Guide

This guide will help you set up and run the DriveSmart Road Accident Prediction & Classification project on your system without any errors.

## Prerequisites

Before you begin, make sure you have the following software installed:

1. **Git** - To clone the repository
2. **Python 3.8+** - For the backend Flask server
3. **Node.js (v16 or higher)** - For the React frontend
4. **npm** - Usually comes with Node.js

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/ROAD-ACCIDENTS-PREDICTION-AND-CLASSIFICATION-master.git
cd ROAD-ACCIDENTS-PREDICTION-AND-CLASSIFICATION-master
```

## Step 2: Backend Setup

### 2.1 Create a Virtual Environment (Recommended)

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2.2 Install Dependencies

```bash
pip install -r requirements.txt
```

### 2.3 Verify Model and Data Files

Make sure the following files exist in the `backend/data/` directory:
- `litemodel.sav` (the ML model)
- `mapdata.json` (Google Maps API key and heatmap locations)

If these files are missing, the application will show errors.

### 2.4 Run the Backend Server

```bash
python main.py
```

The backend server should now be running on `http://localhost:4000`

## Step 3: Frontend Setup

### 3.1 Install Dependencies

```bash
# Navigate to the frontend directory
cd ../frontend

# Install all npm dependencies
npm install
```

### 3.2 Run the Frontend Development Server

```bash
npm run dev
```

The frontend should now be running on `http://localhost:5173`

## Step 4: Verify Everything is Working

1. Open your browser and go to `http://localhost:5173`
2. You should see the DriveSmart application interface
3. Try the following features to verify everything works:
   - Navigate to the Dashboard to see the accident statistics and map
   - Try the Prediction form to test the ML model
   - Check the Analytics section for risk factors and severity distribution

## Troubleshooting Common Issues

### Backend Issues

**Issue: "Model not found at backend/data/litemodel.sav"**
- Solution: Ensure the model file exists in the correct location. If not, you may need to obtain it from the project owner.

**Issue: "map data not found at backend/data/mapdata.json"**
- Solution: Ensure the mapdata.json file exists in the correct location. This file contains the Google Maps API key and heatmap locations.

**Issue: "ModuleNotFoundError: No module named 'flask'"**
- Solution: Make sure you've installed all requirements with `pip install -r requirements.txt`
- If using a virtual environment, ensure it's activated before installing packages

### Frontend Issues

**Issue: "npm ERR! code ERESOLVE"**
- Solution: Try using `npm install --force` or updating Node.js to a more recent version

**Issue: "Failed to load resource: the server responded with a status of 404 (Not Found)"**
- Solution: Make sure the backend server is running on port 4000 before starting the frontend

**Issue: Map not displaying**
- Solution: Check if the Google Maps API key in mapdata.json is valid and has the necessary permissions

### General Issues

**Issue: CORS errors in browser console**
- Solution: Ensure the backend server is running with Flask-CORS enabled (which should be configured in main.py)

**Issue: Application not loading properly**
- Solution: Try clearing your browser cache or using an incognito/private window

## Additional Tips

1. Keep both backend and frontend terminals open while working on the project
2. If you make changes to the backend, you may need to restart the Flask server
3. For production deployment, consider:
   - Building the React app with `npm run build`
   - Using a production server like Gunicorn for the Flask backend
   - Setting up proper environment variables for API keys

## Quick Start

For a quick setup, follow the manual steps outlined in this guide. The setup process involves:

1. Setting up the backend Flask server
2. Installing frontend dependencies
3. Running both servers simultaneously

Follow the detailed steps in this guide for a smooth setup experience.

## Project Structure

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
│   └── requirements.txt
├── scripts/                    (utility scripts)
├── unwanted/                   (archived files)
├── README.md
└── SETUP.md                    (this file)
```

## Getting Help

If you encounter any issues not covered in this guide:

1. Check the original README.md file for additional information
2. Look at the error messages in the terminal and browser console
3. Check if all required files are present in the correct locations
4. Verify that all dependencies are properly installed

Happy coding!
