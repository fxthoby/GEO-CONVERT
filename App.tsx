
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
    <div className="min-h-screen flex flex-col bg-white text-black">
      <header className="sticky top-0 z-50 glass-header py-4 px-8 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="bg-white border border-slate-200 text-[#4a0404] p-3 rounded-2xl shadow-sm">
              <Globe2 size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-black leading-none tracking-tighter uppercase">
                GEOCONVERT <span className="text-[#4a0404]">PRO</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1.5">Outil de recherche et conversion de coordonnées</p>
            </div>
          </div>
          
          <nav className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button 
              onClick={() => setActiveTab('single')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'single' ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-black'}`}
            >
              <Layers size={14} /> Unitaire
            </button>
            <button 
              onClick={() => setActiveTab('bulk')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'bulk' ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-black'}`}
            >
              <LayoutGrid size={14} /> Batch
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto w-full px-8 py-10 flex-grow space-y-12">
        {activeTab === 'single' ? (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-stretch">
              <div className="flex flex-col">
                <CoordinateForm 
                  selectedSystem={currentSystem}
                  onConvert={handleConvert} 
                  onShowHypotheses={handleShowHypotheses} 
                  onSystemChange={(sys) => setCurrentSystem(sys)}
                />
              </div>

              <div className="flex flex-col gap-6">
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 flex items-start gap-4 shadow-sm">
                  <div className="p-2 bg-white border border-slate-200 text-[#4a0404] rounded-xl shadow-sm">
                    <MapIcon size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-black uppercase tracking-widest">Contrôle de Proximité</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-medium">
                      Visualisation cartographique de la saisie. Cliquez sur 'Recherche de correspondances' pour voir les hypothèses.
                    </p>
                  </div>
                </div>
                <div className="flex-grow min-h-[500px] rounded-[2rem] overflow-hidden shadow-xl border border-slate-200 bg-slate-50">
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
              <div className="animate-in slide-in-from-bottom-8 duration-700">
                <ResultsTable results={results} />
              </div>
            )}
          </div>
        ) : (
          <BulkConverter />
        )}

        <section className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
            <ShieldCheck size={300} className="text-slate-300" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-5 mb-12">
              <div className="p-3 bg-white border border-slate-200 text-[#4a0404] rounded-2xl shadow-sm">
                <Info size={28} />
              </div>
              <h2 className="text-2xl font-black text-black tracking-tight uppercase">Normes Géodésiques & IGN</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-[#4a0404] uppercase tracking-[0.4em]">Planimétrie</h4>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  Intégration des grilles de transformation <b>NTF (IGN)</b>. Support rigoureux du Lambert 93 et des projections Coniques Conformes CC42-50.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-[#4a0404] uppercase tracking-[0.4em]">Altimétrie</h4>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  Référencement <b>NGF-IGN69</b> via interpolation sur le modèle <b>RAF20</b>. Précision optimale pour les levés topographiques.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-[#4a0404] uppercase tracking-[0.4em]">Intégrité</h4>
                <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                  Les calculs respectent les spécifications de l'EPSG et sont validés par des tests de régression croisés garantissant l'intégrité des levés.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-8 text-center border-t border-slate-100 bg-white">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.6em]">
          GEOCONVERT ENGINE • SPATIAL INTEGRITY • 2024
        </p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  const env = (import.meta as any).env;
  const basename = env && env.PROD ? '/GEO-CONVERT/' : '/';
  
  return (
    <BrowserRouter basename={basename}>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
