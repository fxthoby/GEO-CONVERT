
import React, { useState, useEffect } from 'react';
import { CoordinateSystem, Coordinates, Hypothesis } from '../types';
import { SYSTEM_LABELS } from '../constants';
import { suggestSystem, getHypotheses } from '../services/conversion';
import { MapPin, Info, ArrowRight, Zap, SearchCode } from 'lucide-react';

interface Props {
  selectedSystem: CoordinateSystem;
  onConvert: (coords: Coordinates) => void;
  onShowHypotheses: (hypotheses: Hypothesis[]) => void;
  onSystemChange: (system: CoordinateSystem) => void;
}

const CoordinateForm: React.FC<Props> = ({ selectedSystem, onConvert, onShowHypotheses, onSystemChange }) => {
  // Champs vides par défaut comme demandé
  const [x, setX] = useState<string>('');
  const [y, setY] = useState<string>('');
  const [z, setZ] = useState<string>('');
  const [suggestions, setSuggestions] = useState<CoordinateSystem[]>([]);

  useEffect(() => {
    const numX = parseFloat(x.replace(',', '.'));
    const numY = parseFloat(y.replace(',', '.'));
    if (!isNaN(numX) && !isNaN(numY)) {
      setSuggestions(suggestSystem(numX, numY));
    } else {
      setSuggestions([]);
    }
  }, [x, y]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numX = parseFloat(x.replace(',', '.'));
    const numY = parseFloat(y.replace(',', '.'));
    const numZ = parseFloat(z.replace(',', '.'));
    if (!isNaN(numX) && !isNaN(numY)) {
      onConvert({ x: numX, y: numY, z: isNaN(numZ) ? undefined : numZ, system: selectedSystem });
    }
  };

  const handleShowHypotheses = (e: React.MouseEvent) => {
    e.preventDefault();
    const cleanX = x.replace(',', '.').trim();
    const cleanY = y.replace(',', '.').trim();
    const numX = parseFloat(cleanX);
    const numY = parseFloat(cleanY);
    
    if (!isNaN(numX) && !isNaN(numY)) {
      const h = getHypotheses(numX, numY);
      onShowHypotheses(h);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <MapPin size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Zap size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Saisie Directe</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              Système Source
              <Info size={14} className="text-slate-400" />
            </label>
            <select 
              value={selectedSystem}
              onChange={(e) => onSystemChange(e.target.value as CoordinateSystem)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer font-medium text-slate-700 shadow-sm"
            >
              {Object.entries(SYSTEM_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {suggestions.length > 0 && !suggestions.includes(selectedSystem) && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg animate-in slide-in-from-top-2">
                <p className="text-xs text-amber-700 font-medium mb-2 flex items-center gap-1">
                   Ambiguité détectée :
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map(s => (
                    <button 
                      key={s} 
                      type="button"
                      onClick={() => onSystemChange(s)}
                      className="px-2 py-1 bg-white border border-amber-200 text-amber-700 rounded text-[10px] hover:bg-amber-100 transition-colors uppercase font-bold"
                    >
                      {SYSTEM_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">X / Longitude</label>
              <input 
                type="text" 
                value={x}
                placeholder="Ex: 652436.5"
                onChange={(e) => setX(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Y / Latitude</label>
              <input 
                type="text" 
                value={y}
                placeholder="Ex: 6861545.2"
                onChange={(e) => setY(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alt. Ellips. (m)</label>
              <input 
                type="text" 
                value={z}
                onChange={(e) => setZ(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-mono"
                placeholder="Optionnel"
              />
            </div>
          </div>

          {/* Bouton déplacé sous les champs et renommé comme demandé */}
          <div className="space-y-3 pt-2">
            <button 
              type="button"
              disabled={!x.trim() || !y.trim()}
              onClick={handleShowHypotheses}
              className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-xl text-sm font-bold transition-all active:scale-[0.98] shadow-md disabled:shadow-none border border-blue-700 disabled:border-slate-200"
              title="Affiche sur la carte toutes les interprétations possibles de ces chiffres"
            >
              <SearchCode size={18} />
              Trouver les correspondances systèmes
            </button>

            <button 
              type="submit"
              disabled={!x.trim() || !y.trim()}
              className="group w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-2xl transform active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              Lancer la Conversion
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoordinateForm;
