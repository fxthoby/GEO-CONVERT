
import React, { useEffect, useRef } from 'react';
import { Hypothesis, CoordinateSystem } from '../types';

declare var L: any;

interface Props {
  lat: number;
  lng: number;
  hypotheses?: Hypothesis[];
  onSelectSystem?: (system: CoordinateSystem) => void;
  isDefault?: boolean;
}

const MapDisplay: React.FC<Props> = ({ lat, lng, hypotheses = [], onSelectSystem, isDefault }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  // France Center: ~46.5, 2.5
  const initialLat = isDefault ? 46.5 : lat;
  const initialLng = isDefault ? 2.5 : lng;
  const initialZoom = isDefault ? 6 : 13;

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([initialLat, initialLng], initialZoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
      
      markerRef.current = L.marker([initialLat, initialLng], { opacity: isDefault ? 0 : 1 }).addTo(mapRef.current);
      layerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    } else if (mapRef.current) {
      if (!isDefault) {
        mapRef.current.setView([lat, lng], mapRef.current.getZoom() < 10 ? 13 : mapRef.current.getZoom());
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]).setOpacity(1);
        }
      } else {
         markerRef.current.setOpacity(0);
      }
    }
  }, [lat, lng, isDefault]);

  useEffect(() => {
    if (mapRef.current && layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
      
      if (hypotheses.length > 0) {
        const bounds = L.latLngBounds();
        hypotheses.forEach(h => {
          const m = L.circleMarker([h.lat, h.lng], {
            radius: 10,
            fillColor: "#3b82f6",
            color: "#fff",
            weight: 3,
            opacity: 1,
            fillOpacity: 0.9
          })
          .bindPopup(`
            <div class="text-center">
              <div class="font-bold text-slate-800 text-sm mb-1">${h.label}</div>
              <div class="text-[10px] text-slate-500 mb-2">${h.system}</div>
              <button id="select-sys-${h.system.replace(':', '-')}" class="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-blue-700 transition-colors">
                Choisir ce système
              </button>
            </div>
          `)
          .addTo(layerGroupRef.current);
          
          m.on('popupopen', () => {
            const btn = document.getElementById(`select-sys-${h.system.replace(':', '-')}`);
            if (btn && onSelectSystem) {
              btn.onclick = () => {
                onSelectSystem(h.system);
                mapRef.current.closePopup();
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
        <div className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg animate-bounce">
          {hypotheses.length} hypothèses trouvées
        </div>
      )}
    </div>
  );
};

export default MapDisplay;
