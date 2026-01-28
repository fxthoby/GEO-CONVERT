
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Hypothesis, CoordinateSystem } from '../types';

interface Props {
  lat: number;
  lng: number;
  hypotheses?: Hypothesis[];
  onSelectSystem?: (system: CoordinateSystem) => void;
  isDefault?: boolean;
}

const MapDisplay: React.FC<Props> = ({ lat, lng, hypotheses = [], onSelectSystem, isDefault }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Zoom France par défaut : ~46.5, 2.5
  const initialLat = 46.5;
  const initialLng = 2.5;
  const initialZoom = 6;

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([initialLat, initialLng], initialZoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
      
      markerRef.current = L.marker([initialLat, initialLng], { opacity: 0 }).addTo(mapRef.current);
      layerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!isDefault) {
      mapRef.current.setView([lat, lng], mapRef.current.getZoom() < 8 ? 13 : mapRef.current.getZoom());
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]).setOpacity(1);
      }
    } else {
      if (markerRef.current) markerRef.current.setOpacity(0);
      if (mapRef.current.getZoom() === initialZoom) {
         mapRef.current.setView([initialLat, initialLng], initialZoom);
      }
    }
  }, [lat, lng, isDefault]);

  useEffect(() => {
    if (mapRef.current && layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
      
      if (hypotheses.length > 0) {
        const bounds = L.latLngBounds([]);
        hypotheses.forEach(h => {
          const m = L.circleMarker([h.lat, h.lng], {
            radius: 12,
            fillColor: "#3b82f6",
            color: "#fff",
            weight: 3,
            opacity: 1,
            fillOpacity: 0.9
          })
          .bindPopup(`
            <div class="text-center p-1">
              <div class="font-bold text-slate-800 text-sm mb-1">${h.label}</div>
              <div class="text-[10px] text-slate-500 mb-2 font-mono">${h.system}</div>
              <button id="select-sys-${h.system.replace(/:/g, '-')}" class="w-full bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Choisir ce système
              </button>
            </div>
          `, { minWidth: 150 })
          .addTo(layerGroupRef.current!);
          
          m.on('popupopen', () => {
            const btnId = `select-sys-${h.system.replace(/:/g, '-')}`;
            const btn = document.getElementById(btnId);
            if (btn && onSelectSystem) {
              btn.onclick = (e) => {
                e.preventDefault();
                onSelectSystem(h.system);
                mapRef.current?.closePopup();
              };
            }
          });

          bounds.extend([h.lat, h.lng]);
        });
        
        if (!isDefault) bounds.extend([lat, lng]);
        
        mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [hypotheses, lat, lng, onSelectSystem, isDefault]);

  return (
    <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-inner border border-slate-200">
      <div ref={mapContainerRef} className="h-full w-full" />
      {!isDefault && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-mono border border-slate-200 shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          WGS84: {lat.toFixed(6)}, {lng.toFixed(6)}
        </div>
      )}
      {hypotheses.length > 0 && (
        <div className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg animate-bounce border border-white/20">
          {hypotheses.length} correspondances trouvées
        </div>
      )}
    </div>
  );
};

export default MapDisplay;
