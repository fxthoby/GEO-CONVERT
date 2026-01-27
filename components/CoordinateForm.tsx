
import React, { useState } from 'react';
import { CoordinateSystem, Coordinates } from '../types';
import { SYSTEM_LABELS } from '../constants';

interface Props {
  onConvert: (coords: Coordinates) => void;
}

const CoordinateForm: React.FC<Props> = ({ onConvert }) => {
  const [x, setX] = useState<string>('700000');
  const [y, setY] = useState<string>('6600000');
  const [system, setSystem] = useState<CoordinateSystem>(CoordinateSystem.LAMBERT_93);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numX = parseFloat(x);
    const numY = parseFloat(y);
    if (!isNaN(numX) && !isNaN(numY)) {
      onConvert({ x: numX, y: numY, system });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Saisie des données
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Système Source</label>
          <select 
            value={system}
            onChange={(e) => setSystem(e.target.value as CoordinateSystem)}
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          >
            {Object.entries(SYSTEM_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {system === CoordinateSystem.WGS84 ? 'Longitude (X)' : 'Abscisse X (m)'}
            </label>
            <input 
              type="text" 
              value={x}
              onChange={(e) => setX(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="ex: 700000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {system === CoordinateSystem.WGS84 ? 'Latitude (Y)' : 'Ordonnée Y (m)'}
            </label>
            <input 
              type="text" 
              value={y}
              onChange={(e) => setY(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="ex: 6600000"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Convertir et Localiser
        </button>
      </form>
    </div>
  );
};

export default CoordinateForm;
