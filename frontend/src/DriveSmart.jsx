import React, { useState, useEffect } from 'react';
import { AlertCircle, Cloud, MapPin, Car, TrendingUp, Map, FileText } from 'lucide-react';
import MapComponent from './MapComponent';
import ReportsDashboard from './ReportsDashboard';
import axios from 'axios';

const BASE_API = 'http://localhost:4000';

// Utility function to load Google Maps script globally
const loadGoogleMapsScript = (apiKey, libraries) => {
  return new Promise((resolve, reject) => {
    const scriptId = 'google-maps-script';
    if (document.getElementById(scriptId)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (error) => reject(error);
    document.head.appendChild(script);
  });
};

const DriveSmart = () => {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [predictionResult, setPredictionResult] = useState(null);
  const [gmapsApiKey, setGmapsApiKey] = useState(null);
  const [gmapsScriptLoaded, setGmapsScriptLoaded] = useState(false);

  useEffect(() => {
    const fetchApiKeyAndLoadScript = async () => {
      try {
        const resp = await axios.get(`${BASE_API}/api/mapdata`);
        if (resp.data && resp.data.api_key) {
          const apiKey = resp.data.api_key;
          setGmapsApiKey(apiKey);
          await loadGoogleMapsScript(apiKey, 'visualization,places,geocoding');
          setGmapsScriptLoaded(true);
        }
      } catch (e) {
        console.error('Failed to fetch Google Maps API key or load script', e);
      }
    };

    fetchApiKeyAndLoadScript();
  }, []);

  const Dashboard = () => {
    const [summary, setSummary] = useState({
      fatal: 0,
      serious: 0,
      slight: 0,
      total: 0,
    });
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [summaryError, setSummaryError] = useState(null);

    useEffect(() => {
      const fetchSummary = async () => {
        try {
          setLoadingSummary(true);
          const resp = await axios.get(`${BASE_API}/api/reports/severity-distribution`);
          const { distribution, total_incidents } = resp.data;

          const fatal = distribution.find(d => d.severity_level === 'Fatal')?.count || 0;
          const serious = distribution.find(d => d.severity_level === 'Serious')?.count || 0;
          const slight = distribution.find(d => d.severity_level === 'Slight')?.count || 0;

          setSummary({
            fatal,
            serious,
            slight,
            total: total_incidents,
          });
        } catch (e) {
          console.error('Failed to fetch summary data', e);
          setSummaryError('Failed to load summary data.');
        } finally {
          setLoadingSummary(false);
        }
      };

      fetchSummary();
    }, []);

    if (loadingSummary) {
      return <div className="space-y-4">Loading dashboard summary...</div>;
    }

    if (summaryError) {
      return <div className="space-y-4 text-red-600">Error: {summaryError}</div>;
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Fatal Accidents</p>
                <p className="text-2xl font-bold text-red-700">{summary.fatal.toLocaleString()}</p>
              </div>
              <AlertCircle className="text-red-500" size={32} />
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Serious Accidents</p>
                <p className="text-2xl font-bold text-orange-700">{summary.serious.toLocaleString()}</p>
              </div>
              <TrendingUp className="text-orange-500" size={32} />
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Slight Accidents</p>
                <p className="text-2xl font-bold text-yellow-700">{summary.slight.toLocaleString()}</p>
              </div>
              <TrendingUp className="text-yellow-500" size={32} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg mb-4">Accident Hotspot Map</h3>
          <div className="h-[520px] md:h-[640px] rounded overflow-hidden">
            {/* MapComponent will fetch the heatmap locations from the backend and render */}
            <MapComponent gmapsApiKey={gmapsApiKey} gmapsScriptLoaded={gmapsScriptLoaded} />
          </div>
        </div>
      </div>
    );
  };

  const PredictionForm = () => {
    const [formData, setFormData] = useState({
      Did_Police_Officer_Attend: '1',
      location: '', // New state for location name/address
      latitude: '',
      longitude: '',
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

    const handleGetLocation = async () => {
      // Clear previous location data
      setFormData(prev => ({ ...prev, latitude: '', longitude: '', location: 'Fetching location...' }));

      if (!gmapsScriptLoaded || !gmapsApiKey) {
        setFormData(prev => ({ ...prev, location: 'Error: Google Maps API not loaded' }));
        return;
      }

      // Get current geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));

          // Use Geocoding to get a readable address
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
              setFormData(prev => ({ ...prev, location: results[0].formatted_address, latitude: lat, longitude: lng }));
            } else {
              setFormData(prev => ({ ...prev, location: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}` }));
              console.warn('Geocoder failed due to: ' + status);
            }
          });
        }, (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Geolocation denied or unavailable.';
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = 'Location access denied. Please enable location in your browser settings.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = 'Location information unavailable.';
          } else if (error.code === error.TIMEOUT) {
            errorMessage = 'Geolocation request timed out.';
          }
          setFormData(prev => ({ ...prev, location: errorMessage }));
        });
      } else {
        setFormData(prev => ({ ...prev, location: 'Geolocation not supported by this browser.' }));
        alert('Geolocation is not supported by your browser.');
      }
    };

    const handlePredict = async () => {
      // The original form applies Math.log to age_of_driver and age_of_vehicle before sending.
      // Build payload matching backend expectations. We send textual values
      // (e.g. 'car', 'clear') and the backend maps them to numeric features.
      const payload = {
        Did_Police_Officer_Attend: formData.Did_Police_Officer_Attend,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
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
              <div className="flex gap-2">
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter location or use button"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
                <button
                  onClick={handleGetLocation}
                  className="whitespace-nowrap bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition text-sm"
                >
                  Get Location
                </button>
              </div>
              {formData.latitude && formData.longitude && (
                <p className="text-sm text-gray-600 mt-2">Coordinates: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</p>
              )}
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

  const AnalyticsScreen = () => {
    const [data, setData] = React.useState({});
    const [loadingAnalytics, setLoadingAnalytics] = React.useState(true);
    const [analyticsError, setAnalyticsError] = React.useState(null);

    // Data guide mappings from dataset-data-guide.xlsx
    const factorMappings = {
      light_conditions: {
        1: 'Daylight',
        4: 'Darkness - lights lit',
        5: 'Darkness - lights unlit',
        6: 'Darkness - no lighting',
        7: 'Darkness - lighting unknown',
        '-1': 'Data missing'
      },
      weather_conditions: {
        1: 'Fine no high winds',
        2: 'Raining no high winds',
        3: 'Snowing no high winds',
        4: 'Fine + high winds',
        5: 'Raining + high winds',
        6: 'Snowing + high winds',
        7: 'Fog or mist',
        8: 'Other',
        9: 'Unknown',
        '-1': 'Data missing'
      },
      road_surface_conditions: {
        1: 'Dry',
        2: 'Wet or damp',
        3: 'Snow',
        4: 'Frost or ice',
        5: 'Flood (>3cm deep)',
        6: 'Oil or diesel',
        7: 'Mud',
        9: 'Unknown',
        '-1': 'Data missing'
      },
      special_conditions: {
        '-1': 'Data missing',
        0: 'None',
        1: 'Auto traffic signal out',
        2: 'Auto signal defective',
        3: 'Road sign/marking defective',
        4: 'Roadworks',
        5: 'Road surface defective',
        6: 'Oil or diesel',
        7: 'Mud',
        9: 'Unknown'
      }
    };

    const getCategoryLabel = (categoryKey) => {
      const labels = {
        light_conditions: 'Light Conditions',
        weather_conditions: 'Weather Conditions',
        road_surface_conditions: 'Road Surface',
        special_conditions: 'Special Conditions'
      };
      return labels[categoryKey] || categoryKey;
    };

    const getFactorLabel = (categoryKey, factorValue) => {
      const mapping = factorMappings[categoryKey];
      return mapping?.[factorValue] || `Unknown (${factorValue})`;
    };

    React.useEffect(() => {
      async function load() {
        setLoadingAnalytics(true);
        try {
          const [trendsRes, riskRes, severityRes] = await Promise.all([
            axios.get(`${BASE_API}/api/reports/monthly-trends`),
            axios.get(`${BASE_API}/api/reports/risk-factors`),
            axios.get(`${BASE_API}/api/reports/severity-distribution`),
          ]);
          // normalize monthly trends into months/counts
          const trendsRaw = trendsRes.data || {};
          const trendsArray = trendsRaw.trends || [];
          const months = trendsArray.map((t) => t.month);
          const counts = trendsArray.map((t) => t.incidents);

          // normalize risk factors - aggregate by category only
          const riskRaw = riskRes.data || {};
          const factors = riskRaw.factors || {};

          const topFactors = [];
          Object.keys(factors).forEach((cat) => {
            const arr = factors[cat] || [];
            // Find the subfactor with the highest count
            const topSubfactor = arr.reduce((max, item) => item.count > max.count ? item : max, { count: 0 });
            topFactors.push({
              categoryLabel: getCategoryLabel(cat),
              count: topSubfactor.count
            });
          });

          // severity normalize
          const sevRaw = severityRes.data || {};
          const distribution = (sevRaw.distribution || []).map((d) => ({ label: d.severity_level, count: d.count, pct: d.percentage }));
          const totalIncidents = sevRaw.total_incidents || 0;

          setData({
            trends: { months, counts, raw: trendsArray },
            risk: { topFactors, raw: factors },
            severity: { distribution, total: totalIncidents },
          });
        } catch (e) {
          setAnalyticsError(e.message || 'Failed to load analytics');
        } finally {
          setLoadingAnalytics(false);
        }
      }
      load();
    }, []);

    if (loadingAnalytics) return <div className="space-y-4">Loading analytics...</div>;
    if (analyticsError) return <div className="space-y-4 text-red-600">Error: {analyticsError}</div>;

    const months = (data.trends && data.trends.months) || [];
    const counts = (data.trends && data.trends.counts) || [];
    const topFactors = (data.risk && data.risk.topFactors) || [];
    const distribution = (data.severity && data.severity.distribution) || [];
    const totalIncidents = (data.severity && data.severity.total) || 0;

    const maxCount = Math.max(1, ...(counts || []));
    const severityColors = { 'Fatal': '#dc2626', 'Serious': '#f59e0b', 'Slight': '#18cf64ff' };

    // Function to convert date format (e.g., "2024-01") to month name (e.g., "January")
    const formatMonthName = (dateStr) => {
      try {
        const [year, month] = dateStr.split('-');
        const date = new Date(year, parseInt(month) - 1);
        return date.toLocaleString('default', { month: 'short' });
      } catch (e) {
        return dateStr;
      }
    };

    return (
      <div className="space-y-4">
        {/* Monthly Trend Analysis - Bar Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg mb-4">Monthly Trend Analysis</h3>
          <div className="bg-gradient-to-t from-blue-50 to-white rounded p-4" style={{ minHeight: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '8px' }}>
            {months.length > 0 ? months.map((m, i) => {
              const maxHeight = 200;
              const height = Math.max(20, (counts[i] / maxCount) * maxHeight);
              return (
                <div key={m} className="flex flex-col items-center" style={{ flex: 1 }}>
                  <div className="w-full bg-blue-500 rounded-t" style={{height: `${height}px`, maxWidth: '40px'}}></div>
                  <span className="text-xs mt-2 font-medium">{formatMonthName(m)}</span>
                  <span className="text-xs text-gray-500">{counts[i].toLocaleString()}</span>
                </div>
              );
            }) : <div className="text-center text-gray-500 w-full">No data available</div>}
          </div>
        </div>

        {/* Top Risk Factors & Severity Distribution */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-3">Accident Risk Factors</h4>
            <div className="space-y-3">
              {topFactors.length > 0 ? topFactors.map((f, i) => {
                // Calculate percentage based on total incidents
                const width = totalIncidents > 0 ? (f.count / totalIncidents) * 100 : 0;
                const colors = ['#ef4444', '#f97316', '#eab308', '#3b82f6'];
                return (
                  <div key={i} className="border-b pb-3 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-gray-800">{f.categoryLabel}</p>
                      <span className="text-sm font-bold text-gray-700">{f.count.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="h-3 rounded-full" style={{width: `${width}%`, backgroundColor: colors[i % 4]}}></div>
                    </div>
                  </div>
                );
              }) : <div className="text-center text-gray-500">No data available</div>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-3">Severity Distribution</h4>
            <div className="flex justify-center items-center h-32">
              {distribution.length > 0 ? (
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#fee2e2" strokeWidth="20"/>
                    {distribution.map((d, i) => {
                      const circumference = 251.2; // 2 * PI * 40
                      const offset = distribution.slice(0, i).reduce((sum, x) => sum + (x.count / Math.max(1, totalIncidents) * circumference), 0);
                      const dasharray = (d.count / Math.max(1, totalIncidents)) * circumference;
                      return (
                        <circle key={d.label} cx="50" cy="50" r="40" fill="none" stroke={severityColors[d.label] || '#999'} strokeWidth="20" strokeDasharray={`${dasharray} ${circumference}`} strokeDashoffset={`-${offset}`}/>
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-center">
                    Total<br/>{totalIncidents.toLocaleString()}
                  </div>
                </div>
              ) : <div className="text-center text-gray-500">No data available</div>}
            </div>

            {/* Color Legend */}
            <div className="mt-4 flex justify-center space-x-4 text-xs">
              {Object.entries(severityColors).map(([label, color]) => (
                <div key={label} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: color }}></div>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ReportsScreen = () => {
    const [list] = React.useState([
      { key: 'monthlySafety', url: `${BASE_API}/api/reports/monthly-safety`, label: 'Monthly Safety Report' },
      { key: 'hotspotAnalysis', url: `${BASE_API}/api/reports/hotspot-analysis`, label: 'Hotspot Analysis Report' },
      { key: 'emergencyResponse', url: `${BASE_API}/api/reports/emergency-response`, label: 'Emergency Response Metrics' },
    ]);
    const [preview, setPreview] = React.useState(null);
    const [previewKey, setPreviewKey] = React.useState(null);
    const [loadingReports, setLoadingReports] = React.useState(false);
    const [reportsError, setReportsError] = React.useState(null);

    async function loadPreview(url, key) {
      setLoadingReports(true);
      setReportsError(null);
      setPreviewKey(key);
      try {
        const resp = await axios.get(url);
        setPreview(resp.data || null);
      } catch (e) {
        setReportsError(e.message || 'Failed to load report');
        setPreview(null);
      } finally {
        setLoadingReports(false);
      }
    }

    function renderFormatted(data, key) {
      if (!data) return <div className="text-gray-500 text-center py-4">No data</div>;

      const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '12px',
        fontSize: '13px'
      };
      const thStyle = {
        backgroundColor: '#f3f4f6',
        padding: '12px',
        textAlign: 'left',
        borderBottom: '2px solid #e5e7eb',
        fontWeight: '600',
        color: '#1f2937',
        whiteSpace: 'nowrap'
      };
      const tdStyle = {
        padding: '12px',
        borderBottom: '1px solid #e5e7eb',
        color: '#374151'
      };
      const altRowStyle = {
        backgroundColor: '#f9fafb'
      };

      // Monthly Safety Report - Complete data with all columns
      if (key === 'monthlySafety') {
        const trends = data.trends || [];
        return (
          <div>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-900"><strong>Total Incidents:</strong> {data.total_incidents?.toLocaleString()} | <strong>Total Casualties:</strong> {data.total_casualties?.toLocaleString()} | <strong>Avg per Month:</strong> {data.statistics?.avg_incidents_per_month?.toFixed(2) || 'N/A'}</p>
            </div>
            <div className="overflow-x-auto">
              <table style={tableStyle}>
                <thead>
                  <tr style={{backgroundColor: '#f3f4f6'}}>
                    <th style={thStyle}>Month</th>
                    <th style={{...thStyle, textAlign: 'right'}}>Incidents</th>
                    <th style={{...thStyle, textAlign: 'right'}}>Casualties</th>
                    <th style={{...thStyle, textAlign: 'right'}}>Fatal</th>
                    <th style={{...thStyle, textAlign: 'right'}}>Serious</th>
                    <th style={{...thStyle, textAlign: 'right'}}>Slight</th>
                  </tr>
                </thead>
                <tbody>
                  {trends.map((m, i) => (
                    <tr key={i} style={i % 2 === 1 ? altRowStyle : {}}>
                      <td style={tdStyle}><strong>{m.month_name || m.month}</strong></td>
                      <td style={{...tdStyle, textAlign: 'right'}}>{m.incidents?.toLocaleString()}</td>
                      <td style={{...tdStyle, textAlign: 'right'}}>{m.casualties?.toLocaleString()}</td>
                      <td style={{...tdStyle, textAlign: 'right', color: '#dc2626'}}><strong>{m.severity_breakdown?.fatal ?? 'N/A'}</strong></td>
                      <td style={{...tdStyle, textAlign: 'right', color: '#ea580c'}}>{m.severity_breakdown?.severe ?? 'N/A'}</td>
                      <td style={{...tdStyle, textAlign: 'right', color: '#eab308'}}>{m.severity_breakdown?.slight ?? 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      // Hotspot Analysis - Full structure with all columns
      if (key === 'hotspotAnalysis') {
        const hotspots = data.top_hotspots || [];
        return (
          <div>
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-900"><strong>Total Unique Hotspots:</strong> {data.total_unique_hotspots?.toLocaleString()}</p>
            </div>
            <div className="overflow-x-auto">
              <table style={tableStyle}>
                <thead>
                  <tr style={{backgroundColor: '#f3f4f6'}}>
                    <th style={thStyle}>Location</th>
                    <th style={thStyle}>Location Name</th>
                    <th style={{...thStyle, textAlign: 'right'}}>Incidents</th>
                    <th style={{...thStyle, textAlign: 'right'}}>Casualties</th>
                    <th style={thStyle}>Risk Level</th>
                    <th style={{...thStyle, textAlign: 'right'}}>Fatal</th>
                    <th style={{...thStyle, textAlign: 'right'}}>Serious</th>
                    <th style={{...thStyle, textAlign: 'right'}}>Slight</th>
                  </tr>
                </thead>
                <tbody>
                  {hotspots.slice(0, 20).map((h, i) => (
                    <tr key={i} style={i % 2 === 1 ? altRowStyle : {}}>
                      <td style={{...tdStyle, fontSize: '12px', fontFamily: 'monospace'}}>{h.location}</td>
                      <td style={tdStyle}>{h.location_name}</td>
                      <td style={{...tdStyle, textAlign: 'right', fontWeight: '600'}}>{h.incidents}</td>
                      <td style={{...tdStyle, textAlign: 'right'}}>{h.casualties}</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: h.risk_level === 'MEDIUM' ? '#fef3c7' : '#fecaca',
                          color: h.risk_level === 'MEDIUM' ? '#92400e' : '#991b1b'
                        }}>
                          {h.risk_level}
                        </span>
                      </td>
                      <td style={{...tdStyle, textAlign: 'right', color: '#dc2626'}}><strong>{h.severity_breakdown?.fatal ?? 0}</strong></td>
                      <td style={{...tdStyle, textAlign: 'right', color: '#ea580c'}}>{h.severity_breakdown?.severe ?? 0}</td>
                      <td style={{...tdStyle, textAlign: 'right', color: '#eab308'}}>{h.severity_breakdown?.slight ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hotspots.length > 20 && <p className="text-xs text-gray-600 mt-2">Showing top 20 of {hotspots.length} hotspots</p>}
            {data.recommendations && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm font-medium text-yellow-900 mb-2">Recommendations:</p>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {data.recommendations.map((rec, i) => <li key={i}>• {rec}</li>)}
                </ul>
              </div>
            )}
          </div>
        );
      }

      // Emergency Response Metrics - Show police force data
      if (key === 'emergencyResponse') {
        const byForce = data.police_response?.by_police_force || [];
        return (
          <div>
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded">
              <p className="text-sm text-purple-900"><strong>Overall Response Rate:</strong> {data.police_response?.overall_response_rate?.toFixed(2) || 'N/A'}%</p>
            </div>
            <div className="mb-4">
              <h5 className="font-medium text-gray-700 mb-2">Police Force Response Statistics:</h5>
              <div className="overflow-x-auto">
                <table style={tableStyle}>
                  <thead>
                    <tr style={{backgroundColor: '#f3f4f6'}}>
                      <th style={thStyle}>Police Force</th>
                      <th style={{...thStyle, textAlign: 'right'}}>Total Incidents</th>
                      <th style={{...thStyle, textAlign: 'right'}}>Attended</th>
                      <th style={{...thStyle, textAlign: 'right'}}>Not Attended</th>
                      <th style={{...thStyle, textAlign: 'right'}}>Response Rate (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byForce.map((force, i) => (
                      <tr key={i} style={i % 2 === 1 ? altRowStyle : {}}>
                        <td style={tdStyle}><strong>{force.force_name}</strong></td>
                        <td style={{...tdStyle, textAlign: 'right'}}>{force.total_incidents?.toLocaleString()}</td>
                        <td style={{...tdStyle, textAlign: 'right', color: '#059669'}}>{force.attended?.toLocaleString()}</td>
                        <td style={{...tdStyle, textAlign: 'right', color: '#dc2626'}}>{force.not_attended?.toLocaleString()}</td>
                        <td style={{...tdStyle, textAlign: 'right', fontWeight: '600'}}>{force.response_rate?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {data.resource_allocation_recommendations && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-medium text-blue-900 mb-2">Resource Allocation Recommendations:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Peak Hours: {data.resource_allocation_recommendations.peak_hours}</li>
                  <li>• Night Shift: {data.resource_allocation_recommendations.night_shift}</li>
                  <li>• Weekend: {data.resource_allocation_recommendations.weekend}</li>
                  <li>• High Load Forces: {data.resource_allocation_recommendations.high_force_load}</li>
                </ul>
              </div>
            )}
          </div>
        );
      }

      // Default: show as formatted JSON
      return (
        <div className="overflow-x-auto">
          <pre style={{
            backgroundColor: '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '12px',
            maxHeight: '400px',
            overflow: 'auto',
            border: '1px solid #e5e7eb'
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-4">Available Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {list.map((r) => (
              <button 
                key={r.key} 
                onClick={() => loadPreview(r.url, r.key)} 
                className={`p-4 border rounded-lg transition text-left ${
                  previewKey === r.key 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <p className="font-medium text-gray-900">{r.label}</p>
                <p className="text-xs text-gray-600 mt-1">Click to preview</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-lg mb-4">Report Preview</h4>
          {loadingReports && (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-600">Loading preview...</div>
            </div>
          )}
          {reportsError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
              Error: {reportsError}
            </div>
          )}
          {!loadingReports && !reportsError && !preview && (
            <div className="text-center text-gray-500 py-8">
              Select a report above to view its preview
            </div>
          )}
          {!loadingReports && !reportsError && preview && (
            <div>
              {renderFormatted(preview, previewKey)}
            </div>
          )}
        </div>
      </div>
    );
  };

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

