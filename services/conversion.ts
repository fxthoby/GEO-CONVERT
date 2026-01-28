
import proj4 from 'proj4';
import { Coordinates, CoordinateSystem, BulkResult, Hypothesis } from '../types';
import { PROJ_DEFS, estimateGeoidHeight, SYSTEM_LABELS } from '../constants';

export const convertCoords = (
  coords: { x: number; y: number; z?: number },
  from: CoordinateSystem,
  to: CoordinateSystem
): Coordinates => {
  const fromDef = PROJ_DEFS[from];
  const toDef = PROJ_DEFS[to];
  
  const result = proj4(fromDef, toDef, [coords.x, coords.y]);
  
  const finalCoords: Coordinates = {
    x: result[0],
    y: result[1],
    z: coords.z,
    system: to
  };

  const wgs = (to === CoordinateSystem.WGS84 || to === CoordinateSystem.NGF_IGN69)
    ? [result[0], result[1]] 
    : proj4(fromDef, PROJ_DEFS[CoordinateSystem.WGS84], [coords.x, coords.y]);
    
  const N = estimateGeoidHeight(wgs[1], wgs[0]);
  if (coords.z !== undefined) {
    finalCoords.h = coords.z - N;
  }

  return finalCoords;
};

export const getAllProjections = (input: Coordinates): Coordinates[] => {
  return Object.values(CoordinateSystem)
    .filter(s => s !== CoordinateSystem.NGF_IGN69)
    .map(system => {
      return convertCoords({ x: input.x, y: input.y, z: input.z }, input.system, system);
    });
};

export const processBulk = (text: string, defaultSystem: CoordinateSystem): BulkResult[] => {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  return lines.map(line => {
    try {
      const parts = line.replace(/,/g, '.').split(/[ \t;]+/).map(p => parseFloat(p)).filter(p => !isNaN(p));
      if (parts.length < 2) return { original: line, converted: [], error: "Format invalide" };
      
      const input: Coordinates = {
        x: parts[0],
        y: parts[1],
        z: parts[2],
        system: defaultSystem
      };
      
      return {
        original: line,
        converted: getAllProjections(input)
      };
    } catch (e) {
      return { original: line, converted: [], error: "Erreur de conversion" };
    }
  });
};

export const suggestSystem = (x: number, y: number): CoordinateSystem[] => {
  const suggestions: CoordinateSystem[] = [];
  
  if (x > -10 && x < 15 && y > 35 && y < 55) suggestions.push(CoordinateSystem.WGS84);
  if (x > 100000 && x < 1300000 && y > 6000000 && y < 7200000) suggestions.push(CoordinateSystem.LAMBERT_93);
  if (x > 100000 && x < 1300000 && y > 1000000 && y < 3500000) suggestions.push(CoordinateSystem.LAMBERT_2_ETENDU);

  if (x > 1600000 && x < 1800000) {
    if (y > 1000000 && y < 2000000) suggestions.push(CoordinateSystem.CC42);
    if (y > 2000000 && y < 3000000) suggestions.push(CoordinateSystem.CC43);
    if (y > 3000000 && y < 4000000) suggestions.push(CoordinateSystem.CC44);
    if (y > 4000000 && y < 5000000) suggestions.push(CoordinateSystem.CC45);
    if (y > 5000000 && y < 6000000) suggestions.push(CoordinateSystem.CC46);
    if (y > 6000000 && y < 7000000) suggestions.push(CoordinateSystem.CC47);
    if (y > 7000000 && y < 8000000) suggestions.push(CoordinateSystem.CC48);
    if (y > 8000000 && y < 9000000) suggestions.push(CoordinateSystem.CC49);
    if (y > 9000000 && y < 10000000) suggestions.push(CoordinateSystem.CC50);
  }

  if (x > 100000 && x < 1300000 && y < 1000000) {
    suggestions.push(CoordinateSystem.LAMBERT_1);
    suggestions.push(CoordinateSystem.LAMBERT_2);
    suggestions.push(CoordinateSystem.LAMBERT_3);
    suggestions.push(CoordinateSystem.LAMBERT_4);
  }

  return suggestions;
};

export const getHypotheses = (x: number, y: number): Hypothesis[] => {
  const commonSystems = [
    CoordinateSystem.LAMBERT_93,
    CoordinateSystem.LAMBERT_2_ETENDU,
    CoordinateSystem.LAMBERT_1,
    CoordinateSystem.LAMBERT_2,
    CoordinateSystem.LAMBERT_3,
    CoordinateSystem.LAMBERT_4,
    CoordinateSystem.CC42,
    CoordinateSystem.CC43,
    CoordinateSystem.CC44,
    CoordinateSystem.CC45,
    CoordinateSystem.CC46,
    CoordinateSystem.CC47,
    CoordinateSystem.CC48,
    CoordinateSystem.CC49,
    CoordinateSystem.CC50,
    CoordinateSystem.WGS84
  ];

  return commonSystems.map(sys => {
    try {
      const res = proj4(PROJ_DEFS[sys], PROJ_DEFS[CoordinateSystem.WGS84], [x, y]);
      if (res[0] > -15 && res[0] < 20 && res[1] > 30 && res[1] < 60) {
        return {
          system: sys,
          lng: res[0],
          lat: res[1],
          label: SYSTEM_LABELS[sys]
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  }).filter((h): h is Hypothesis => h !== null);
};
