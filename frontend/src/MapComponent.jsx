import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
};

const MapComponent = ({ className = '' }) => {
  const ref = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let map, heatmap;

    const init = async () => {
      try {
        // Use absolute backend URL so Vite dev server proxy is not required.
        const resp = await axios.get('http://localhost:4000/api/mapdata');
        const { api_key, locations } = resp.data;

        if (!locations || !locations.length) {
          console.warn('No heatmap locations received from backend');
          setLoading(false);
          return;
        }

        if (!api_key) {
          console.warn('No API key found for map; cannot load Google Maps.');
          setLoading(false);
          return;
        }

        const key = api_key;
        const gmapsSrc = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=visualization`;
        await loadScript(gmapsSrc);

        // create map
        map = new window.google.maps.Map(ref.current, {
          center: locations && locations.length ? { lat: locations[0].lat, lng: locations[0].lng } : { lat: 53.0, lng: 1.0 },
          zoom: 6,
        });

        // convert to google LatLng objects
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

    init();

    return () => {
      if (heatmap) heatmap.setMap(null);
      // note: leaving removed script for simplicity
    };
  }, []);

  return (
    <div className={className} style={{ height: '100%', minHeight: 300 }}>
      {loading && <div className="flex items-center justify-center h-full">Loading map…</div>}
      <div ref={ref} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapComponent;
