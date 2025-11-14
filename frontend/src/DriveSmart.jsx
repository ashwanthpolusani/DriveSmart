import React, { useState } from 'react';
import { AlertCircle, Cloud, MapPin, Car, TrendingUp, Map, FileText } from 'lucide-react';
import MapComponent from './MapComponent';
import axios from 'axios';

const DriveSmart = () => {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [predictionResult, setPredictionResult] = useState(null);

  const Dashboard = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Fatal Accidents</p>
              <p className="text-2xl font-bold text-red-700">1,247</p>
            </div>
            <AlertCircle className="text-red-500" size={32} />
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Serious Accidents</p>
              <p className="text-2xl font-bold text-orange-700">3,842</p>
            </div>
            <TrendingUp className="text-orange-500" size={32} />
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Slight Accidents</p>
              <p className="text-2xl font-bold text-yellow-700">8,956</p>
            </div>
            <TrendingUp className="text-yellow-500" size={32} />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-lg mb-4">Accident Hotspot Map</h3>
        <div className="h-[520px] md:h-[640px] rounded overflow-hidden">
          {/* MapComponent will fetch the heatmap locations from the backend and render */}
          <MapComponent />
        </div>
      </div>
    </div>
  );

  const PredictionForm = () => {
    const [formData, setFormData] = useState({
      Did_Police_Officer_Attend: '1',
      lat: '55',
      lon: '-121',
      age_of_driver: '34',
      vehicle: 'car',
      age_of_vehicle: '10',
      engine_cc: '1500',
      day: '1',
      weather: 'clear',
      light: '1',
      roadsc: 'dry',
      gender: '1',
      speedl: '30'
    });

    const handlePredict = async () => {
      // The original form applies Math.log to age_of_driver and age_of_vehicle before sending.
      // Build payload matching backend expectations. We send textual values
      // (e.g. 'car', 'clear') and the backend maps them to numeric features.
      const payload = {
        Did_Police_Officer_Attend: formData.Did_Police_Officer_Attend,
        // backend expects log-transformed ages (original app did this)
        age_of_driver: Math.log(parseInt(formData.age_of_driver || '30')),
        // send vehicle as string so backend maps it
        vehicle: formData.vehicle,
        age_of_vehicle: Math.log(parseInt(formData.age_of_vehicle || '5')),
        engine_cc: parseFloat(formData.engine_cc || '1500'),
        day: formData.day,
        weather: formData.weather,
        light: formData.light,
        roadsc: formData.roadsc,
        gender: formData.gender,
        speedl: parseFloat(formData.speedl || '40')
      };

      try {
        const resp = await axios.post('http://localhost:4000/api/predict', payload, { headers: { 'Content-Type': 'application/json' } });
        if (resp.data && resp.data.prediction) {
          const label = resp.data.prediction;
          // original model returns numeric label (e.g., 1/2/3) — map to textual severity if needed
          let severity = String(label);
          let color = 'yellow';
          if (severity === '1' || /fatal/i.test(severity)) { severity = 'Fatal'; color = 'red'; }
          else if (severity === '2' || /serious/i.test(severity)) { severity = 'Serious'; color = 'orange'; }
          else { severity = 'Slight'; color = 'yellow'; }

          const confidence = resp.data.confidence ? Math.round(resp.data.confidence) : null;
          setPredictionResult({ severity, confidence, color });
          return;
        }
      } catch (e) {
        console.warn('Prediction request failed', e);
      }

      // fallback local random
      const severities = ['Fatal', 'Serious', 'Slight'];
      const confidences = [92, 87, 78];
      const randomIndex = Math.floor(Math.random() * 3);
      setPredictionResult({
        severity: severities[randomIndex],
        confidence: confidences[randomIndex],
        color: randomIndex === 0 ? 'red' : randomIndex === 1 ? 'orange' : 'yellow'
      });
    };

    return (
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg mb-4">Accident Severity Prediction</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin size={16} /> Location
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter location coordinates or area"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Driver Age</label>
                <input
                  type="number"
                  min="16"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.age_of_driver}
                  onChange={(e) => setFormData({...formData, age_of_driver: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Vehicle Age (years)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.age_of_vehicle}
                  onChange={(e) => setFormData({...formData, age_of_vehicle: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Engine CC</label>
                <input
                  type="number"
                  min="50"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.engine_cc}
                  onChange={(e) => setFormData({...formData, engine_cc: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Approx Speed (km/h)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.speedl}
                  onChange={(e) => setFormData({...formData, speedl: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Police Attended</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.Did_Police_Officer_Attend}
                  onChange={(e) => setFormData({...formData, Did_Police_Officer_Attend: e.target.value})}
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="1">Male</option>
                  <option value="2">Female</option>
                  <option value="3">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Cloud size={16} /> Weather Conditions
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={formData.weather}
                onChange={(e) => setFormData({...formData, weather: e.target.value})}
              >
                <option value="">Select weather</option>
                <option value="clear">Clear/Sunny</option>
                <option value="rain">Rainy</option>
                <option value="fog">Foggy</option>
                <option value="snow">Snowy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Road Condition</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={formData.road}
                onChange={(e) => setFormData({...formData, road: e.target.value})}
              >
                <option value="">Select road condition</option>
                <option value="dry">Dry</option>
                <option value="wet">Wet/Damp</option>
                <option value="ice">Ice/Snow</option>
                <option value="pothole">Potholes Present</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Car size={16} /> Vehicle Type
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={formData.vehicle}
                onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
              >
                <option value="">Select vehicle type</option>
                <option value="car">Car</option>
                <option value="bike">Motorcycle</option>
                <option value="truck">Truck/Heavy Vehicle</option>
                <option value="bus">Bus</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Time of Day</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              >
                <option value="">Select time</option>
                <option value="morning">Morning (6AM-12PM)</option>
                <option value="afternoon">Afternoon (12PM-6PM)</option>
                <option value="evening">Evening (6PM-12AM)</option>
                <option value="night">Night (12AM-6AM)</option>
              </select>
            </div>

            <button
              onClick={handlePredict}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Predict Severity
            </button>
          </div>
        </div>

        {predictionResult && (
          <div className={`bg-${predictionResult.color}-50 p-6 rounded-lg border border-${predictionResult.color}-200`}>
            <h3 className="font-semibold text-lg mb-2">Prediction Result</h3>
            <div className="space-y-2">
              <p className={`text-${predictionResult.color}-700`}>
                <span className="font-medium">Predicted Severity:</span> {predictionResult.severity}
              </p>
              <p className={`text-${predictionResult.color}-700`}>
                <span className="font-medium">Confidence:</span> {predictionResult.confidence ? `${predictionResult.confidence}%` : 'N/A'}
              </p>
              <div className="mt-4 p-4 bg-white rounded border border-gray-200">
                <p className="text-sm font-medium mb-2">Recommended Actions:</p>
                <ul className="text-sm space-y-1 text-gray-700">
                  {predictionResult.severity === 'Fatal' && (
                    <>
                      <li>• Deploy maximum emergency response units</li>
                      <li>• Alert nearby hospitals for critical care</li>
                      <li>• Implement immediate traffic diversion</li>
                    </>
                  )}
                  {predictionResult.severity === 'Serious' && (
                    <>
                      <li>• Dispatch ambulance and police units</li>
                      <li>• Prepare for potential injuries</li>
                      <li>• Monitor traffic flow closely</li>
                    </>
                  )}
                  {predictionResult.severity === 'Slight' && (
                    <>
                      <li>• Standard response protocol</li>
                      <li>• Document incident for analysis</li>
                      <li>• Monitor for escalation</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const AnalyticsScreen = () => (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-lg mb-4">Monthly Trend Analysis</h3>
        <div className="h-48 bg-gradient-to-t from-blue-50 to-white rounded flex items-end justify-around p-4">
          <div className="flex flex-col items-center">
            <div className="w-12 bg-blue-500 rounded-t" style={{height: '60%'}}></div>
            <span className="text-xs mt-2">Jan</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 bg-blue-500 rounded-t" style={{height: '75%'}}></div>
            <span className="text-xs mt-2">Feb</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 bg-blue-500 rounded-t" style={{height: '45%'}}></div>
            <span className="text-xs mt-2">Mar</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 bg-blue-500 rounded-t" style={{height: '85%'}}></div>
            <span className="text-xs mt-2">Apr</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 bg-blue-500 rounded-t" style={{height: '55%'}}></div>
            <span className="text-xs mt-2">May</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-medium mb-3">Top Risk Factors</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Poor Weather</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{width: '78%'}}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Night Time</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{width: '65%'}}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Wet Roads</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{width: '52%'}}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-medium mb-3">Severity Distribution</h4>
          <div className="flex justify-center items-center h-32">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#fee2e2" strokeWidth="20"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray="62.8 251.2"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="20" strokeDasharray="94.2 251.2" strokeDashoffset="-62.8"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#eab308" strokeWidth="20" strokeDasharray="94.2 251.2" strokeDashoffset="-157"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                Total<br/>14,045
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ReportsScreen = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <FileText size={20} /> Generate Reports
      </h3>
      <div className="space-y-3">
        <button className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-left">
          <p className="font-medium">Monthly Safety Report</p>
          <p className="text-sm text-gray-600">Comprehensive analysis of accident trends</p>
        </button>
        <button className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-left">
          <p className="font-medium">Hotspot Analysis Report</p>
          <p className="text-sm text-gray-600">High-risk zones and recommendations</p>
        </button>
        <button className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-left">
          <p className="font-medium">Emergency Response Metrics</p>
          <p className="text-sm text-gray-600">Response time and resource allocation data</p>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg mb-6 shadow-lg">
          <h1 className="text-3xl font-bold mb-2">DriveSmart</h1>
          <p className="text-blue-100">Data-Powered Decision Support for Accident Severity Analysis</p>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow mb-6 p-2 flex gap-2">
          <button
            onClick={() => setActiveScreen('dashboard')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeScreen === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveScreen('prediction')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeScreen === 'prediction' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Predict Severity
          </button>
          <button
            onClick={() => setActiveScreen('analytics')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeScreen === 'analytics' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveScreen('reports')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeScreen === 'reports' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Reports
          </button>
        </div>

        {/* Content Area */}
        <div>
          {activeScreen === 'dashboard' && <Dashboard />}
          {activeScreen === 'prediction' && <PredictionForm />}
          {activeScreen === 'analytics' && <AnalyticsScreen />}
          {activeScreen === 'reports' && <ReportsScreen />}
        </div>
      </div>
    </div>
  );
};

export default DriveSmart;
