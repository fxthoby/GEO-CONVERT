
import React from 'react';
import { Coordinates, CoordinateSystem } from '../types';
import { SYSTEM_LABELS } from '../constants';

interface Props {
  results: Coordinates[];
}

const ResultsTable: React.FC<Props> = ({ results }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copié !');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Résultats de Conversion
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-3 px-4 text-sm font-semibold text-slate-500">Système</th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-500">X / Longitude</th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-500">Y / Latitude</th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {results.map((res) => (
              <tr key={res.system} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4">
                  <span className={`text-sm font-medium ${res.system === CoordinateSystem.LAMBERT_93 ? 'text-blue-700' : 'text-slate-700'}`}>
                    {SYSTEM_LABELS[res.system]}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-sm">
                  {res.system === CoordinateSystem.WGS84 ? res.x.toFixed(7) : res.x.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                </td>
                <td className="py-3 px-4 font-mono text-sm">
                  {res.system === CoordinateSystem.WGS84 ? res.y.toFixed(7) : res.y.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                </td>
                <td className="py-3 px-4">
                  <button 
                    onClick={() => copyToClipboard(`${res.x}, ${res.y}`)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                    title="Copier les coordonnées"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2v2M9 7v10.5a1.5 1.5 0 001.5 1.5h1.5" />
                    </svg>
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
