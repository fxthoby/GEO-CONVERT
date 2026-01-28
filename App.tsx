
import React, { useState, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import CoordinateForm from './components/CoordinateForm';
import BulkConverter from './components/BulkConverter';
import MapDisplay from './components/MapDisplay';
import ResultsTable from './components/ResultsTable';
import { Coordinates, CoordinateSystem, Hypothesis } from './types';
import { getAllProjections, convertCoords } from './services/conversion';
import { LayoutGrid, Layers, Globe2, Info, Map as MapIcon, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [inputCoords, setInputCoords] = useState<Coordinates | null>(null);
  const [currentSystem, setCurrentSystem] = useState<CoordinateSystem>(CoordinateSystem.LAMBERT_93);

  const handleConvert = (coords: Coordinates) => {
    setInputCoords(coords);
    setCurrentSystem(coords.system);
    setHypotheses([]); 
  };

  const handleShowHypotheses = (h: Hypothesis[]) => {
    setHypotheses(h);
  };

  const handleSelectSystem = (sys: CoordinateSystem) => {
    setCurrentSystem(sys);
    if (inputCoords) {
      setInputCoords(prev => prev ? { ...prev, system: sys } : null);
    }
    setHypotheses([]);
  };

  const results = useMemo(() => {
    return inputCoords ? getAllProjections(inputCoords) : [];
  }, [inputCoords]);

  const wgs84Coords = useMemo(() => {
    if (!inputCoords) return { lat: 46.5, lng: 2.5, isDefault: true };
    if (inputCoords.system === CoordinateSystem.WGS84) {
      return { lat: inputCoords.y, lng: inputCoords.x, isDefault: false };
    }
    const converted = convertCoords({ x: inputCoords.x, y: inputCoords.y }, inputCoords.system, CoordinateSystem.WGS84);
    return { lat: converted.y, lng: converted.x, isDefault: false };
  }, [inputCoords]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="sticky top-0 z-50 glass border-b border-slate-200 py-4 px-6 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg rotate-3">
              <Globe2 size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-none">GeoConvert <span className="text-blue-600">FR</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Projection & Altimétrie NGF</p>
            </div>
          </div>
          
          <nav className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button 
              onClick={() => setActiveTab('single')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'single' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Layers size={16} /> Unitaire
            </button>
            <button 
              onClick={() => setActiveTab('bulk')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'bulk' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <LayoutGrid size={16} /> Batch
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 space-y-8">
        {activeTab === 'single' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Colonne Formulaire */}
              <div className="flex flex-col">
                <CoordinateForm 
                  selectedSystem={currentSystem}
                  onConvert={handleConvert} 
                  onShowHypotheses={handleShowHypotheses} 
                  onSystemChange={(sys) => setCurrentSystem(sys)}
                />
              </div>

              {/* Colonne Carte */}
              <div className="flex flex-col space-y-4 h-full">
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3 flex-shrink-0">
                  <MapIcon className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-tight">Outil de levée d'ambiguïté</p>
                    <p className="text-xs text-blue-600 leading-relaxed mt-1">
                      {hypotheses.length > 0 
                        ? `Visualisation de ${hypotheses.length} systèmes candidats. Cliquez sur un point pour l'adopter.` 
                        : "Saisissez des coordonnées et utilisez 'Trouver les correspondances' pour visualiser les interprétations possibles sur la carte."}
                    </p>
                  </div>
                </div>
                <div className="flex-grow min-h-[400px]">
                  <MapDisplay 
                    lat={wgs84Coords.lat} 
                    lng={wgs84Coords.lng} 
                    isDefault={wgs84Coords.isDefault}
                    hypotheses={hypotheses}
                    onSelectSystem={handleSelectSystem}
                  />
                </div>
              </div>
            </div>

            {results.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ResultsTable results={results} />
              </div>
            )}
          </div>
        ) : (
          <BulkConverter />
        )}

        {/* Section Expertise Géodésique déplacée en bas de page */}
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mt-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <ShieldCheck size={160} />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Info size={20} />
              </div>
              Expertise Géodésique & Références Françaises
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Systèmes Planimétriques</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Support complet du <b>RGF93 (Lambert 93)</b>, des zones Coniques Conformes (CC42-50) et des systèmes historiques <b>NTF (Lambert I, II, III, IV)</b> via la grille de paramètres standards IGN.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Altimétrie & Géoïde</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Calcul des altitudes orthométriques dans le système <b>NGF-IGN69 (EPSG:5720)</b>. L'application utilise une interpolation locale basée sur le modèle de géoïde <b>RAF20</b>.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Précision Géométrique</h4>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Les transformations respectent les standards Proj4js. La précision pour les conversions Lambert historique est de l'ordre du centimètre grâce à l'intégration des paramètres de basculement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto py-12 px-6 text-center">
        <div className="h-px bg-slate-200 mb-8"></div>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          © 2024 SpatialReference.org Integration - Engine by Proj4js & Google Gemini
        </p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  const env = (import.meta as any).env;
  const basename = env && env.PROD ? '/GEO-CONVERT' : '';
  
  return (
    <BrowserRouter basename={basename}>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
