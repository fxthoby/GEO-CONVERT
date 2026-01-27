
import React, { useEffect, useRef } from 'react';

// Leaflet is global from CDN
declare var L: any;

interface Props {
  lat: number;
  lng: number;
}

const MapDisplay: React.FC<Props> = ({ lat, lng }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([lat, lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
      
      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
    } else if (mapRef.current) {
      mapRef.current.setView([lat, lng], 13);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
    }
  }, [lat, lng]);

  return (
    <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-inner border border-slate-200">
      <div ref={mapContainerRef} className="h-full w-full" />
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-mono border border-slate-200 shadow-sm">
        {lat.toFixed(6)}, {lng.toFixed(6)}
      </div>
    </div>
  );
};

export default MapDisplay;
