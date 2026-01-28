
import React, { useState, useEffect } from 'react';
import { CoordinateSystem, Coordinates, Hypothesis } from '../types';
import { SYSTEM_LABELS, estimateGeoidHeight } from '../constants';
import { suggestSystem, getHypotheses, convertCoords } from '../services/conversion';
import { MapPin, Info, ArrowRight, Zap, SearchCode, Hash } from 'lucide-react';
import proj4 from 'proj4';
import { PROJ_DEFS } from '../constants';

interface Props {
  selectedSystem: CoordinateSystem;
  onConvert: (coords: Coordinates) => void;
  onShowHypotheses: (hypotheses: Hypothesis[]) => void;
  onSystemChange: (system: CoordinateSystem) => void;
}

const CoordinateForm: React.FC<Props> = ({ selectedSystem, onConvert, onShowHypotheses, onSystemChange }) => {
  const [x, setX] = useState<string>('');
  const [y, setY] = useState<string>('');
  const [z, setZ] = useState<string>(''); // Ellipsoidal
  const [ngf, setNgf] = useState<string>(''); // Orthometric
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

  // Logic to handle cross-conversion of heights
  const handleHeightSync = (value: string, type: 'z' | 'ngf') => {
    const cleanX = x.replace(',', '.').trim();
    const cleanY = y.replace(',', '.').trim();
    const numX = parseFloat(cleanX);
    const numY = parseFloat(cleanY);
    const numVal = parseFloat(value.replace(',', '.'));

    if (type === 'z') setZ(value);
    else setNgf(value);

    if (!isNaN(numX) && !isNaN(numY) && !isNaN(numVal)) {
      // Get WGS84 for Geoid estimation
      try {
        const wgs = proj4(PROJ_DEFS[selectedSystem], PROJ_DEFS[CoordinateSystem.WGS84], [numX, numY]);
        const N = estimateGeoidHeight(wgs[1], wgs[0]);
        
        if (type === 'z') {
          setNgf((numVal - N).toFixed(3));
        } else {
          setZ((numVal + N).toFixed(3));
        }
      } catch (e) {
        console.error("Erreur de conversion pour synchro hauteur");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numX = parseFloat(x.replace(',', '.'));
    const numY = parseFloat(y.replace(',', '.'));
    const numZ = parseFloat(z.replace(',', '.'));
    const numNgf = parseFloat(ngf.replace(',', '.'));
    
    if (!isNaN(numX) && !isNaN(numY)) {
      onConvert({ 
        x: numX, 
        y: numY, 
        z: isNaN(numZ) ? undefined : numZ, 
        h: isNaN(numNgf) ? undefined : numNgf,
        system: selectedSystem 
      });
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
    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-200 relative overflow-hidden h-full flex flex-col">
      <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none">
        <MapPin size={220} className="text-slate-300" />
      </div>

      <div className="relative z-10 flex flex-col flex-grow">
        <div className="flex items-center gap-5 mb-10">
          <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-center">
            <Zap size={28} className="text-[#4a0404]" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-black tracking-tighter uppercase leading-none">Saisie Directe</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Vecteurs Numériques & Altimétrie</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-grow space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                <Hash size={12} className="text-[#4a0404]" />
                X / E / Longitude
              </label>
              <input 
                type="text" 
                value={x}
                placeholder="Ex: 652383.5"
                onChange={(e) => setX(e.target.value)}
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 focus:border-black outline-none transition-all font-mono text-black text-base font-bold shadow-sm"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                <Hash size={12} className="text-slate-400" />
                Y / N / Latitude
              </label>
              <input 
                type="text" 
                value={y}
                placeholder="Ex: 675396.1"
                onChange={(e) => setY(e.target.value)}
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 focus:border-black outline-none transition-all font-mono text-black text-base font-bold shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                <Hash size={12} className="text-slate-300" />
                Hauteur Ellipsoïdale (m)
              </label>
              <input 
                type="text" 
                value={z}
                placeholder="Z"
                onChange={(e) => handleHeightSync(e.target.value, 'z')}
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-50 focus:border-black outline-none transition-all font-mono text-black text-sm font-bold shadow-sm"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                <Hash size={12} className="text-slate-300" />
                Altitude NGF (m)
              </label>
              <input 
                type="text" 
                value={ngf}
                placeholder="H"
                onChange={(e) => handleHeightSync(e.target.value, 'ngf')}
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-50 focus:border-black outline-none transition-all font-mono text-black text-sm font-bold shadow-sm"
              />
            </div>
          </div>

          <div className="flex-grow flex flex-col justify-end space-y-8">
            <div className="h-px bg-slate-100"></div>

            <button 
              type="button"
              disabled={!x.trim() || !y.trim()}
              onClick={handleShowHypotheses}
              className="group flex items-center justify-center gap-3 w-full py-5 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-black rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all border border-slate-200 shadow-sm"
            >
              <SearchCode size={20} className="text-[#4a0404]" />
              Recherche de correspondances
            </button>

            <div className="p-7 bg-slate-50 rounded-[2rem] border border-slate-200 shadow-inner space-y-5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3 ml-1">
                Système source confirmé
                <Info size={14} className="text-slate-400" />
              </label>
              <div className="relative">
                <select 
                  value={selectedSystem}
                  onChange={(e) => onSystemChange(e.target.value as CoordinateSystem)}
                  className="w-full p-4.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-100 focus:border-black outline-none appearance-none cursor-pointer font-bold text-black text-sm tracking-wider shadow-sm pr-14"
                >
                  {Object.entries(SYSTEM_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#4a0404]">
                  <ArrowRight className="rotate-90" size={22} />
                </div>
              </div>

              {suggestions.length > 0 && !suggestions.includes(selectedSystem) && (
                <div className="p-4 bg-white border border-slate-200 rounded-2xl animate-in zoom-in-95 mt-4 shadow-sm">
                  <p className="text-[9px] text-[#4a0404] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                     <Zap size={10} /> Détection automatique :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map(s => (
                      <button 
                        key={s} 
                        type="button"
                        onClick={() => onSystemChange(s)}
                        className="px-4 py-2 bg-black text-white rounded-lg text-[9px] hover:bg-[#4a0404] transition-all uppercase font-black tracking-widest shadow-sm"
                      >
                        {SYSTEM_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit"
              disabled={!x.trim() || !y.trim()}
              className="group flex items-center justify-center gap-3 w-full py-5 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-black rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all border border-black shadow-sm"
            >
              <ArrowRight size={20} className="text-[#4a0404]" />
              Calculer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoordinateForm;
