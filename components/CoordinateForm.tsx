
import React, { useState, useEffect } from 'react';
import { CoordinateSystem, Coordinates, Hypothesis } from '../types';
import { SYSTEM_LABELS } from '../constants';
import { suggestSystem, getHypotheses } from '../services/conversion';
import { MapPin, Info, ArrowRight, Zap, SearchCode, Hash } from 'lucide-react';

interface Props {
  selectedSystem: CoordinateSystem;
  onConvert: (coords: Coordinates) => void;
  onShowHypotheses: (hypotheses: Hypothesis[]) => void;
  onSystemChange: (system: CoordinateSystem) => void;
}

const CoordinateForm: React.FC<Props> = ({ selectedSystem, onConvert, onShowHypotheses, onSystemChange }) => {
  const [x, setX] = useState<string>('');
  const [y, setY] = useState<string>('');
  const [z, setZ] = useState<string>('');
  const [suggestions, setSuggestions] = useState<CoordinateSystem[]>([]);

  useEffect(() => {
    const cleanX = x.replace(',', '.').trim();
    const cleanY = y.replace(',', '.').trim();
    const numX = parseFloat(cleanX);
    const numY = parseFloat(cleanY);
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
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden flex-grow">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <MapPin size={140} />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
            <Zap size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Saisie Directe</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Valeurs métriques ou géographiques</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 flex flex-col h-full">
          {/* Grille de saisie alignée */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-1.5 ml-1">
                <Hash size={10} className="text-blue-500" />
                X / Longitude
              </label>
              <input 
                type="text" 
                value={x}
                placeholder="652383.5"
                onChange={(e) => setX(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-mono text-base placeholder:text-slate-300 shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-1.5 ml-1">
                <Hash size={10} className="text-purple-500" />
                Y / Latitude
              </label>
              <input 
                type="text" 
                value={y}
                placeholder="675396.1"
                onChange={(e) => setY(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-mono text-base placeholder:text-slate-300 shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-1.5 ml-1">
                <Hash size={10} className="text-slate-400" />
                Alt. Ellips. (m)
              </label>
              <input 
                type="text" 
                value={z}
                onChange={(e) => setZ(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-mono text-base placeholder:text-slate-300 shadow-sm"
                placeholder="Optionnel"
              />
            </div>
          </div>

          <div className="flex-grow space-y-6 flex flex-col justify-end">
            <div className="h-px bg-slate-100 w-full"></div>

            {/* Bouton de recherche de correspondances */}
            <button 
              type="button"
              disabled={!x.trim() || !y.trim()}
              onClick={handleShowHypotheses}
              className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-2xl text-sm font-bold transition-all active:scale-[0.98] shadow-lg shadow-blue-200/50 disabled:shadow-none border border-blue-700 disabled:border-slate-200"
              title="Affiche sur la carte toutes les interprétations possibles de ces chiffres"
            >
              <SearchCode size={18} />
              Trouver les correspondances systèmes
            </button>

            {/* Sélecteur de système source */}
            <div className="space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                Confirmer le système source
                <Info size={12} className="text-slate-300" />
              </label>
              <div className="relative">
                <select 
                  value={selectedSystem}
                  onChange={(e) => onSystemChange(e.target.value as CoordinateSystem)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all appearance-none cursor-pointer font-bold text-slate-700 shadow-sm pr-12"
                >
                  {Object.entries(SYSTEM_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ArrowRight className="rotate-90" size={18} />
                </div>
              </div>

              {suggestions.length > 0 && !suggestions.includes(selectedSystem) && (
                <div className="p-3 bg-white/50 border border-amber-100 rounded-xl animate-in slide-in-from-top-2 mt-3">
                  <p className="text-[10px] text-amber-700 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                     <Zap size={10} /> Probabilité détectée :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map(s => (
                      <button 
                        key={s} 
                        type="button"
                        onClick={() => onSystemChange(s)}
                        className="px-3 py-1.5 bg-white border border-amber-200 text-amber-700 rounded-lg text-[10px] hover:bg-amber-100 transition-colors uppercase font-black shadow-sm"
                      >
                        {SYSTEM_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bouton final de conversion */}
            <button 
              type="submit"
              disabled={!x.trim() || !y.trim()}
              className="group w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white font-black py-5 px-6 rounded-3xl shadow-xl hover:shadow-2xl transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
            >
              Lancer la Conversion
              <ArrowRight size={24} className="group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoordinateForm;
