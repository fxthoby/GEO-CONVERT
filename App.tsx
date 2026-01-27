
import React, { useState, useMemo } from 'react';
import CoordinateForm from './components/CoordinateForm';
import MapDisplay from './components/MapDisplay';
import ResultsTable from './components/ResultsTable';
import AIVerifier from './components/AIVerifier';
import { Coordinates, CoordinateSystem } from './types';
import { getAllProjections, convertCoords } from './services/conversion';

const App: React.FC = () => {
  const [inputCoords, setInputCoords] = useState<Coordinates>({
    x: 652436.5,
    y: 6861545.2,
    system: CoordinateSystem.LAMBERT_93
  });

  const handleConvert = (coords: Coordinates) => {
    setInputCoords(coords);
  };

  // Memoize conversions to prevent unnecessary recalculations
  const results = useMemo(() => {
    return getAllProjections(inputCoords);
  }, [inputCoords]);

  const wgs84Coords = useMemo(() => {
    if (inputCoords.system === CoordinateSystem.WGS84) {
      return { lat: inputCoords.y, lng: inputCoords.x };
    }
    const converted = convertCoords({ x: inputCoords.x, y: inputCoords.y }, inputCoords.system, CoordinateSystem.WGS84);
    return { lat: converted.y, lng: converted.x };
  }, [inputCoords]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          GeoConvert <span className="text-blue-600">FR</span>
        </h1>
        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
          Conversion précise de coordonnées géographiques françaises (Lambert 93, CC42-50, GNSS) avec aperçu cartographique et vérification IA.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Map */}
        <div className="lg:col-span-5 space-y-8">
          <CoordinateForm onConvert={handleConvert} />
          <MapDisplay lat={wgs84Coords.lat} lng={wgs84Coords.lng} />
        </div>

        {/* Right Column: Results & AI */}
        <div className="lg:col-span-7 space-y-8">
          <ResultsTable results={results} />
          <AIVerifier lat={wgs84Coords.lat} lng={wgs84Coords.lng} />
        </div>
      </div>

      <footer className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-500 text-sm">
        <p>© 2024 GeoConvert FR - Utilise les définitions standards de <a href="https://spatialreference.org" target="_blank" className="text-blue-600 hover:underline">SpatialReference.org</a></p>
        <p className="mt-1 italic">Toutes les conversions utilisent l'algorithme Proj4js avec les paramètres IGN officiels.</p>
      </footer>
    </div>
  );
};

export default App;
