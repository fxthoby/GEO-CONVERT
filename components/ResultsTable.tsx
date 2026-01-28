
import React from 'react';
import { Coordinates, CoordinateSystem } from '../types';
import { SYSTEM_LABELS } from '../constants';
import { Clipboard, Check, Database } from 'lucide-react';

interface Props {
  results: Coordinates[];
}

const ResultsTable: React.FC<Props> = ({ results }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-green-50 text-green-600 rounded-2xl shadow-sm">
          <Database size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Coordonnées Transformées</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Calcul multi-systèmes complet</p>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar -mx-2">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="py-2 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Système de Référence</th>
              <th className="py-2 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">X / Longitude</th>
              <th className="py-2 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Y / Latitude</th>
              <th className="py-2 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Alt. (m)</th>
              <th className="py-2 px-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map((res, i) => (
              <tr key={res.system} className="group transition-all">
                <td className="py-4 px-6 bg-slate-50/50 rounded-l-2xl border-y border-l border-slate-100 group-hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-700">{SYSTEM_LABELS[res.system]}</span>
                    <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{res.system}</span>
                  </div>
                </td>
                <td className="py-4 px-6 bg-slate-50/50 border-y border-slate-100 group-hover:bg-slate-50 transition-colors">
                  <span className="font-mono text-sm font-bold text-blue-600">
                    {res.system === CoordinateSystem.WGS84 ? res.x.toFixed(8) : res.x.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                  </span>
                </td>
                <td className="py-4 px-6 bg-slate-50/50 border-y border-slate-100 group-hover:bg-slate-50 transition-colors">
                  <span className="font-mono text-sm font-bold text-purple-600">
                    {res.system === CoordinateSystem.WGS84 ? res.y.toFixed(8) : res.y.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                  </span>
                </td>
                <td className="py-4 px-6 bg-slate-50/50 border-y border-slate-100 group-hover:bg-slate-50 transition-colors">
                   <div className="flex flex-col">
                      <span className="font-mono text-[11px] text-slate-500">Ellip: <span className="font-bold">{res.z?.toFixed(2) || '-'}</span></span>
                      {res.h !== undefined && (
                        <span className="font-black text-[9px] text-indigo-600 uppercase mt-0.5 px-1.5 py-0.5 bg-indigo-50 rounded w-fit">NGF: {res.h.toFixed(3)}m</span>
                      )}
                   </div>
                </td>
                <td className="py-4 px-6 bg-slate-50/50 rounded-r-2xl border-y border-r border-slate-100 group-hover:bg-slate-50 transition-colors text-center">
                  <button 
                    onClick={() => copyToClipboard(`${res.x}, ${res.y}${res.z ? `, ${res.z}` : ''}`, i)}
                    className="p-3 text-slate-300 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-xl transition-all inline-flex items-center justify-center border border-transparent hover:border-slate-200"
                    title="Copier les coordonnées"
                  >
                    {copiedIndex === i ? <Check size={20} className="text-green-500" /> : <Clipboard size={20} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
