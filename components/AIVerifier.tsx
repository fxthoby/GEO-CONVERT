
import React, { useState } from 'react';
import { verifyLocationWithAI } from '../services/gemini';
import { VerificationResult } from '../types';

interface Props {
  lat: number;
  lng: number;
}

const AIVerifier: React.FC<Props> = ({ lat, lng }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    setLoading(true);
    const data = await verifyLocationWithAI(lat, lng);
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl shadow-xl border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          Vérification Intelligence Artificielle
        </h2>
        <button 
          onClick={handleVerify}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {result ? "Relancer l'analyse" : "Analyser le lieu"}
        </button>
      </div>

      {!result && !loading && (
        <p className="text-slate-400 text-sm">
          Utilisez Gemini avec Google Maps Grounding pour savoir ce qui se trouve réellement à ces coordonnées.
        </p>
      )}

      {loading && (
        <div className="space-y-3">
          <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-slate-800 rounded animate-pulse w-1/2"></div>
        </div>
      )}

      {result && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="prose prose-invert prose-sm max-w-none text-slate-200">
            {result.text}
          </div>
          {result.sources.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-500 w-full mb-1 uppercase font-bold tracking-wider">Sources Google Maps :</span>
              {result.sources.map((source, idx) => (
                <a 
                  key={idx}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                  {source.title}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIVerifier;
