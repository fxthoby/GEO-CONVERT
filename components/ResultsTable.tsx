
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
    <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-6 mb-12">
        <div className="p-4 bg-white border border-slate-200 text-[#4a0404] rounded-2xl shadow-sm">
          <Database size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-black tracking-tighter uppercase">Rapport de Transformation</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5">Matrice de conversion multi-systèmes</p>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar -mx-4 px-4">
        <table className="w-full text-left border-separate border-spacing-y-4">
          <thead>
            <tr>
              <th className="pb-4 px-8 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Référentiel Spatial</th>
              <th className="pb-4 px-8 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">X / Longitude</th>
              <th className="pb-4 px-8 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Y / Latitude</th>
              <th className="pb-4 px-8 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Verticalité (m)</th>
              <th className="pb-4 px-8 text-center text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.map((res, i) => (
              <tr key={res.system} className="group">
                <td className="py-7 px-8 bg-slate-50 rounded-l-[2rem] border-y border-l border-slate-100 group-hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black text-black tracking-widest uppercase">{SYSTEM_LABELS[res.system]}</span>
                    <span className="text-[9px] text-slate-400 font-mono mt-1 opacity-60 tracking-wider">{res.system}</span>
                  </div>
                </td>
                <td className="py-7 px-8 bg-slate-50 border-y border-slate-100 group-hover:bg-slate-100 transition-colors">
                  <span className="font-mono text-[15px] font-black text-[#4a0404] tracking-tight">
                    {res.system === CoordinateSystem.WGS84 ? res.x.toFixed(8) : res.x.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                  </span>
                </td>
                <td className="py-7 px-8 bg-slate-50 border-y border-slate-100 group-hover:bg-slate-100 transition-colors">
                  <span className="font-mono text-[15px] font-black text-black tracking-tight">
                    {res.system === CoordinateSystem.WGS84 ? res.y.toFixed(8) : res.y.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                  </span>
                </td>
                <td className="py-7 px-8 bg-slate-50 border-y border-slate-100 group-hover:bg-slate-100 transition-colors">
                   <div className="flex flex-col gap-2">
                      <span className="font-mono text-[10px] text-slate-500 font-bold tracking-widest uppercase">Ell: {res.z?.toFixed(2) || '—'}</span>
                      {res.h !== undefined && (
                        <span className="font-black text-[9px] text-white bg-black px-3 py-1 rounded-lg w-fit uppercase tracking-widest shadow-sm">
                          NGF: {res.h.toFixed(3)}m
                        </span>
                      )}
                   </div>
                </td>
                <td className="py-7 px-8 bg-slate-50 rounded-r-[2rem] border-y border-r border-slate-100 group-hover:bg-slate-100 transition-colors text-center">
                  <button 
                    onClick={() => copyToClipboard(`${res.x}, ${res.y}${res.z ? `, ${res.z}` : ''}`, i)}
                    className="p-4 text-slate-300 hover:text-black hover:bg-white rounded-2xl transition-all inline-flex items-center justify-center border border-transparent hover:border-slate-200 shadow-sm hover:shadow-md"
                  >
                    {copiedIndex === i ? <Check size={20} className="text-green-600" /> : <Clipboard size={20} />}
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
