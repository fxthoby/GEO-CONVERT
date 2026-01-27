
import React from 'react';
import { Coordinates, CoordinateSystem } from '../types';
import { SYSTEM_LABELS } from '../constants';
import { Clipboard, Check, Database, Map as MapIcon } from 'lucide-react';

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
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
          <Database size={24} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Coordonnées Transformées</h2>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Système de Référence</th>
              <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">X / Longitude</th>
              <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Y / Latitude</th>
              <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alt. (m)</th>
              <th className="py-4 px-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {results.map((res, i) => (
              <tr key={res.system} className="group hover:bg-slate-50/50 transition-all">
                <td className="py-4 px-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">{SYSTEM_LABELS[res.system]}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{res.system}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="font-mono text-sm text-slate-600">
                    {res.system === CoordinateSystem.WGS84 ? res.x.toFixed(8) : res.x.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="font-mono text-sm text-slate-600">
                    {res.system === CoordinateSystem.WGS84 ? res.y.toFixed(8) : res.y.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                  </span>
                </td>
                <td className="py-4 px-4">
                   <div className="flex flex-col">
                      <span className="font-mono text-xs text-slate-500">Ellip: {res.z?.toFixed(2) || '-'}</span>
                      {res.h !== undefined && (
                        <span className="font-bold text-[10px] text-blue-600 uppercase">RAF20: {res.h.toFixed(3)}m</span>
                      )}
                   </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <button 
                    onClick={() => copyToClipboard(`${res.x}, ${res.y}${res.z ? `, ${res.z}` : ''}`, i)}
                    className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all inline-flex items-center justify-center"
                    title="Copier"
                  >
                    {copiedIndex === i ? <Check size={18} className="text-green-500" /> : <Clipboard size={18} />}
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
