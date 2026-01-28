
import React, { useState } from 'react';
import { CoordinateSystem, BulkResult, Coordinates } from '../types';
import { SYSTEM_LABELS } from '../constants';
import { processBulk, convertCoords } from '../services/conversion';
import { FileText, Upload, Download, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';

const BulkConverter: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [sourceSystem, setSourceSystem] = useState<CoordinateSystem>(CoordinateSystem.LAMBERT_93);
  const [targetSystem, setTargetSystem] = useState<CoordinateSystem>(CoordinateSystem.WGS84);
  const [results, setResults] = useState<BulkResult[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleProcess = () => {
    setProcessing(true);
    const data = processBulk(text, sourceSystem);
    setResults(data);
    setProcessing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      setText(ev.target?.result as string);
    };
    reader.readAsText(file);
  };

  const downloadResults = () => {
    const targetLabel = SYSTEM_LABELS[targetSystem].replace(/[^a-z0-9]/gi, '_');
    const header = `Input;SourceSystem;TargetSystem;Result_X;Result_Y;Result_Alt_Ellips;Result_Alt_NGF_IGN69\n`;
    
    const content = results.map(r => {
      if (r.error) return `${r.original};${sourceSystem};${targetSystem};ERROR;ERROR;ERROR;ERROR`;
      
      const target = r.converted.find(c => c.system === targetSystem) || 
                     convertCoords({ x: r.converted[0].x, y: r.converted[0].y, z: r.converted[0].z }, r.converted[0].system, targetSystem);

      return `${r.original};${sourceSystem};${targetSystem};${target.x};${target.y};${target.z || ''};${target.h || ''}`;
    }).join('\n');
    
    const blob = new Blob([header + content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geoconvert_bulk_${targetLabel}.csv`;
    a.click();
  };

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-200">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white border border-slate-200 text-[#4a0404] rounded-2xl shadow-sm">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-black tracking-tight uppercase leading-none">Traitement Batch</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Traitement Massif de Données</p>
          </div>
        </div>
        <label className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-black rounded-xl hover:bg-slate-50 transition-all text-[10px] font-black uppercase tracking-widest shadow-sm">
          <Upload size={16} className="text-[#4a0404]" />
          Import .txt / .csv
          <input type="file" className="hidden" accept=".txt,.csv" onChange={handleFileUpload} />
        </label>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-8 space-y-3">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Matrice de données (X Y [Z])</label>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="700000 6600000&#10;700100 6600200..."
              className="w-full h-72 p-6 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-slate-100 focus:border-black outline-none transition-all font-mono text-sm font-bold shadow-inner custom-scrollbar"
            />
          </div>
          <div className="md:col-span-4 space-y-6">
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 space-y-8 shadow-inner">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Système Source</label>
                <select 
                  value={sourceSystem}
                  onChange={(e) => setSourceSystem(e.target.value as CoordinateSystem)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl text-xs font-black text-black shadow-sm outline-none focus:ring-4 focus:ring-slate-100"
                >
                  {Object.entries(SYSTEM_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center">
                <div className="p-2.5 bg-white rounded-full border border-slate-200 shadow-sm">
                  <ArrowRight className="rotate-90 md:rotate-0 text-[#4a0404]" size={22} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Système de Sortie</label>
                <select 
                  value={targetSystem}
                  onChange={(e) => setTargetSystem(e.target.value as CoordinateSystem)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl text-xs font-black text-black shadow-sm outline-none focus:ring-4 focus:ring-slate-100"
                >
                  {Object.entries(SYSTEM_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleProcess}
                disabled={!text.trim() || processing}
                className="w-full bg-black hover:bg-zinc-800 disabled:opacity-40 text-white font-black py-5 px-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 transform active:scale-[0.98] uppercase tracking-widest text-xs"
              >
                Traiter le Lot
              </button>
            </div>

            {results.length > 0 && (
              <button 
                onClick={() => {setResults([]); setText('')}}
                className="w-full border border-slate-200 text-slate-400 hover:text-black py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-slate-50"
              >
                <Trash2 size={14} /> Réinitialiser
              </button>
            )}
          </div>
        </div>

        {results.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-black text-sm uppercase tracking-widest flex items-center gap-3">
                <CheckCircle2 size={20} className="text-[#4a0404]" />
                {results.length} Itérations Complétées
              </h3>
              <button 
                onClick={downloadResults}
                className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-2xl hover:bg-zinc-800 transition-all text-xs font-black uppercase tracking-widest shadow-xl"
              >
                <Download size={18} /> Export CSV
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto custom-scrollbar border border-slate-200 rounded-[2rem] bg-slate-50 shadow-inner">
              <table className="w-full text-left text-sm border-separate border-spacing-0">
                <thead className="sticky top-0 bg-white text-black font-black uppercase text-[9px] tracking-widest border-b border-slate-200">
                  <tr>
                    <th className="p-5">Entrée</th>
                    <th className="p-5">Sortie (X)</th>
                    <th className="p-5">Sortie (Y)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.slice(0, 500).map((r, i) => {
                    const target = r.converted.find(c => c.system === targetSystem);
                    return (
                      <tr key={i} className="hover:bg-white transition-colors">
                        <td className="p-5 font-mono text-[11px] text-slate-400 font-bold">{r.original}</td>
                        <td className="p-5 font-mono text-[11px] font-black text-[#4a0404]">
                          {r.error ? r.error : target?.x.toFixed(target.system === CoordinateSystem.WGS84 ? 8 : 3)}
                        </td>
                        <td className="p-5 font-mono text-[11px] font-black text-black">
                          {r.error ? '' : target?.y.toFixed(target.system === CoordinateSystem.WGS84 ? 8 : 3)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkConverter;
