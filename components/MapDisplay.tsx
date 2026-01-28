
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Hypothesis, CoordinateSystem, Coordinates } from '../types';
import { getAllProjections } from '../services/conversion';
import { SYSTEM_LABELS } from '../constants';

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

  const initialLat = 46.5;
  const initialLng = 2.5;
  const initialZoom = 6;

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        fadeAnimation: true
      }).setView([initialLat, initialLng], initialZoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);

      L.control.zoom({ position: 'topleft' }).addTo(mapRef.current);
      
      markerRef.current = L.marker([initialLat, initialLng], { 
        icon: L.divIcon({
          className: 'custom-pin',
          html: `<div style='background-color:#4a0404; width:18px; height:18px; border-radius:50%; border:3px solid white; box-shadow:0 0 15px rgba(74,4,4,0.4);'></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        }),
        opacity: 0 
      }).addTo(mapRef.current);
      
      layerGroupRef.current = L.layerGroup().addTo(mapRef.current);

      // Fonctionnalité de clic pour conversion instantanée
      mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        
        const input: Coordinates = {
          x: lng,
          y: lat,
          system: CoordinateSystem.WGS84
        };
        const projections = getAllProjections(input);

        let popupHtml = `
          <div class="p-2 custom-scrollbar" style="max-height: 400px; overflow-y: auto; width: 300px; font-family: Calibri, sans-serif;">
            <div class="flex items-center gap-2 mb-4 sticky top-0 bg-white pb-3 border-b border-slate-100 z-10">
              <div style="width: 10px; height: 10px; background: #4a0404; border-radius: 50%;"></div>
              <span class="text-[11px] font-black uppercase tracking-widest text-black">Point sélectionné</span>
            </div>
            <div class="space-y-3">
        `;

        projections.forEach(p => {
          const isWGS = p.system === CoordinateSystem.WGS84;
          const label = SYSTEM_LABELS[p.system];
          const xVal = isWGS ? p.x.toFixed(7) : Math.round(p.x * 1000) / 1000;
          const yVal = isWGS ? p.y.toFixed(7) : Math.round(p.y * 1000) / 1000;
          
          popupHtml += `
            <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-slate-100">
              <div class="text-[9px] font-black text-[#4a0404] uppercase tracking-wider mb-2">${label}</div>
              <div class="flex flex-col gap-1 font-mono text-[10px] text-black font-bold">
                <div class="flex justify-between items-center">
                  <span class="text-slate-400 font-medium">X/Long:</span>
                  <span>${xVal}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-400 font-medium">Y/Lat:</span>
                  <span>${yVal}</span>
                </div>
                ${p.h !== undefined ? `
                <div class="flex justify-between items-center mt-1 pt-1 border-t border-slate-200/50 text-[#4a0404]">
                  <span class="opacity-50">NGF:</span>
                  <span>${p.h.toFixed(3)}m</span>
                </div>` : ''}
              </div>
            </div>
          `;
        });

        popupHtml += `</div></div>`;

        L.popup({
          maxWidth: 340,
          className: 'custom-map-popup'
        })
        .setLatLng(e.latlng)
        .setContent(popupHtml)
        .openOn(mapRef.current!);
      });

      setTimeout(() => {
        if (mapRef.current) mapRef.current.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!isDefault) {
      mapRef.current.setView([lat, lng], Math.max(mapRef.current.getZoom(), 12));
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]).setOpacity(1);
      }
    } else {
      if (markerRef.current) markerRef.current.setOpacity(0);
    }
    
    mapRef.current.invalidateSize();
  }, [lat, lng, isDefault]);

  useEffect(() => {
    if (mapRef.current && layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
      
      if (hypotheses.length > 0) {
        const bounds = L.latLngBounds([]);
        hypotheses.forEach(h => {
          const m = L.circleMarker([h.lat, h.lng], {
            radius: 10,
            fillColor: "#4a0404",
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 1
          })
          .bindPopup(`
            <div class="text-center p-2" style="font-family: Calibri, sans-serif;">
              <div class="font-bold text-black text-[11px] mb-1 uppercase tracking-widest">${h.label}</div>
              <div class="text-[9px] text-slate-400 mb-3 font-mono">${h.system}</div>
              <button id="select-sys-${h.system.replace(/:/g, '-')}" class="w-full bg-black text-white text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-[#4a0404] transition-all shadow-md">
                Confirmer
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
        mapRef.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
      }
    }
  }, [hypotheses, lat, lng, onSelectSystem, isDefault]);

  return (
    <div className="relative h-full w-full bg-slate-100">
      <div ref={mapContainerRef} className="h-full w-full" style={{ background: '#f8fafc' }} />
      {!isDefault && (
        <div className="absolute bottom-6 left-6 z-[1000] bg-white text-black px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] border border-slate-200 shadow-xl flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4a0404] animate-pulse"></span>
          POS: {lat.toFixed(6)}, {lng.toFixed(6)}
        </div>
      )}
      {hypotheses.length > 0 && (
        <div className="absolute top-6 right-6 z-[1000] bg-black text-white px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl border border-white/10">
          Matchs: {hypotheses.length}
        </div>
      )}
    </div>
  );
};

export default MapDisplay;
