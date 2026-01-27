
import { Coordinates, CoordinateSystem } from '../types';
import { PROJ_DEFS } from '../constants';

// Declare proj4 as a global variable since it's loaded via CDN
declare var proj4: any;

export const convertCoords = (
  coords: { x: number; y: number },
  from: CoordinateSystem,
  to: CoordinateSystem
): { x: number; y: number } => {
  const fromDef = PROJ_DEFS[from];
  const toDef = PROJ_DEFS[to];
  
  const result = proj4(fromDef, toDef, [coords.x, coords.y]);
  return { x: result[0], y: result[1] };
};

export const getAllProjections = (input: Coordinates): Coordinates[] => {
  return Object.values(CoordinateSystem).map(system => {
    const converted = convertCoords({ x: input.x, y: input.y }, input.system, system);
    return {
      x: converted.x,
      y: converted.y,
      system
    };
  });
};
