
import React, { useState, useMemo } from 'react';
import CoordinateForm from './components/CoordinateForm';
import BulkConverter from './components/BulkConverter';
import MapDisplay from './components/MapDisplay';
import ResultsTable from './components/ResultsTable';
import { Coordinates, CoordinateSystem, Hypothesis } from './types';
import { getAllProjections, convertCoords } from './services/conversion';
import { LayoutGrid, Layers, Globe2, Info, Map as MapIcon } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  // Valeurs initiales vides ou nulles pour forcer la carte sur la France
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
    <div className="min-h-screen pb-12">
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

      <main className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            {activeTab === 'single' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <CoordinateForm 
                     selectedSystem={currentSystem}
                     onConvert={handleConvert} 
                     onShowHypotheses={handleShowHypotheses} 
                     onSystemChange={(sys) => setCurrentSystem(sys)}
                   />
                   <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                        <MapIcon className="text-blue-600 mt-1" size={20} />
                        <div>
                          <p className="text-xs font-bold text-blue-800 uppercase tracking-tight">Outil de levée d'ambiguïté</p>
                          <p className="text-xs text-blue-600 leading-relaxed mt-1">
                            {hypotheses.length > 0 
                              ? `Visualisation de ${hypotheses.length} systèmes candidats. Cliquez sur un point pour l'adopter.` 
                              : "Saisissez des coordonnées et utilisez 'Trouver les correspondances' pour visualiser les interprétations possibles."}
                          </p>
                        </div>
                      </div>
                      <MapDisplay 
                        lat={wgs84Coords.lat} 
                        lng={wgs84Coords.lng} 
                        isDefault={wgs84Coords.isDefault}
                        hypotheses={hypotheses}
                        onSelectSystem={handleSelectSystem}
                      />
                   </div>
                </div>
                {results.length > 0 && <ResultsTable results={results} />}
              </>
            ) : (
              <BulkConverter />
            )}
          </div>

          <div className="lg:col-span-4 space-y-8 sticky top-28">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Info size={18} className="text-blue-500" />
                Expertise Géodésique
              </h3>
              <div className="space-y-4 text-xs text-slate-500 leading-relaxed">
                <p>
                  <b>Systèmes supportés :</b> Lambert 93, CC42 à CC50, et les zones historiques Lambert I, II, III, IV du réseau NTF.
                </p>
                <p>
                  <b>Altimétrie :</b> Support du datum vertical <b>NGF-IGN69 (EPSG:5720)</b>. La conversion s'appuie sur une estimation locale du géoïde RAF20.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium italic">
                  Note : Les transformations NTF vers RGF93 intègrent les paramètres de basculement standard IGN.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-16 pt-8 px-6 border-t border-slate-200 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        <p>© 2024 SpatialReference.org Integration - Engine by Proj4js</p>
      </footer>
    </div>
  );
};

export default App;
