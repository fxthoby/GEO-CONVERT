
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
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <FileText size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Traitement par Lot (Batch)</h2>
        </div>
        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all text-sm font-semibold text-slate-600">
          <Upload size={16} />
          Importer .txt / .csv
          <input type="file" className="hidden" accept=".txt,.csv" onChange={handleFileUpload} />
        </label>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-8 space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Format attendu : X Y [Z] (un par ligne)</label>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Exemple :&#10;700000 6600000&#10;700100 6600200"
              className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all font-mono text-sm custom-scrollbar"
            />
          </div>
          <div className="md:col-span-4 space-y-4">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Système Source</label>
                <select 
                  value={sourceSystem}
                  onChange={(e) => setSourceSystem(e.target.value as CoordinateSystem)}
                  className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-purple-200"
                >
                  {Object.entries(SYSTEM_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center">
                <div className="p-2 bg-white rounded-full border border-slate-100 shadow-sm">
                  <ArrowRight className="rotate-90 md:rotate-0 text-purple-400" size={20} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Système d'Arrivée</label>
                <select 
                  value={targetSystem}
                  onChange={(e) => setTargetSystem(e.target.value as CoordinateSystem)}
                  className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-purple-200"
                >
                  {Object.entries(SYSTEM_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleProcess}
                disabled={!text.trim() || processing}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
              >
                Lancer la conversion par lot
              </button>
            </div>

            {results.length > 0 && (
              <button 
                onClick={() => {setResults([]); setText('')}}
                className="w-full border border-slate-200 text-slate-400 hover:text-red-500 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 hover:bg-red-50"
              >
                <Trash2 size={14} /> Réinitialiser tout
              </button>
            )}
          </div>
        </div>

        {results.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-500" />
                {results.length} points convertis vers {SYSTEM_LABELS[targetSystem]}
              </h3>
              <button 
                onClick={downloadResults}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-sm font-bold shadow-md transform active:scale-[0.98]"
              >
                <Download size={16} /> Télécharger CSV
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto custom-scrollbar border border-slate-100 rounded-2xl bg-slate-50 shadow-inner">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-100 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-4">Entrée originale</th>
                    <th className="p-4">{SYSTEM_LABELS[targetSystem]} (X)</th>
                    <th className="p-4">{SYSTEM_LABELS[targetSystem]} (Y)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.slice(0, 500).map((r, i) => {
                    const target = r.converted.find(c => c.system === targetSystem);
                    return (
                      <tr key={i} className="hover:bg-white transition-colors">
                        <td className="p-4 font-mono text-[11px] text-slate-500">{r.original}</td>
                        <td className="p-4 font-mono text-[11px] font-bold text-blue-600">
                          {r.error ? r.error : target?.x.toFixed(target.system === CoordinateSystem.WGS84 ? 7 : 3)}
                        </td>
                        <td className="p-4 font-mono text-[11px] font-bold text-purple-600">
                          {r.error ? '' : target?.y.toFixed(target.system === CoordinateSystem.WGS84 ? 7 : 3)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {results.length > 500 && (
                <div className="p-4 text-center text-slate-400 text-xs font-medium bg-slate-50/80 italic">
                  Affichage limité aux 500 premières lignes. L'export CSV contiendra l'intégralité des données.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkConverter;
