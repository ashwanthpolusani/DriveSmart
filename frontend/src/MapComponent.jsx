import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const MapComponent = ({ className = '', gmapsApiKey, gmapsScriptLoaded }) => {
  const ref = useRef(null);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState({ lat: 53.0, lng: 1.0 }); // Default to a general UK location

  const fetchMapDataAndInitMap = async () => {
    setLoading(true);
    let map, heatmap;

    if (!gmapsScriptLoaded || !gmapsApiKey) {
      console.warn('Google Maps script not loaded or API key missing.');
      setLoading(false);
      return;
    }

    try {
      const resp = await axios.get('http://localhost:4000/api/mapdata');
      const { locations } = resp.data;

      if (!locations || !locations.length) {
        console.warn('No heatmap locations received from backend');
        setLoading(false);
        return;
      }

      const newCenter = { lat: locations[0].lat, lng: locations[0].lng };
      setCurrentLocation(newCenter);

      map = new window.google.maps.Map(ref.current, {
        center: newCenter,
        zoom: 6,
      });

      const points = (locations || []).map((p) => new window.google.maps.LatLng(p.lat, p.lng));

      heatmap = new window.google.maps.visualization.HeatmapLayer({
        data: points,
        dissipating: true,
        map: map,
      });

      setLoading(false);
    } catch (e) {
      console.error('Failed to init map', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gmapsScriptLoaded && gmapsApiKey) {
      fetchMapDataAndInitMap();
    }

    return () => {
      // No need to remove script as it's managed globally
    };
  }, [gmapsScriptLoaded, gmapsApiKey]);

  return (
    <div className={className} style={{ height: '100%', minHeight: 300 }}>
      {loading && <div className="flex items-center justify-center h-full">Loading map…</div>}

      <div ref={ref} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapComponent;
