
export enum CoordinateSystem {
  WGS84 = 'EPSG:4326',
  LAMBERT_93 = 'EPSG:2154',
  LAMBERT_1 = 'EPSG:27561',
  LAMBERT_2 = 'EPSG:27562',
  LAMBERT_3 = 'EPSG:27563',
  LAMBERT_4 = 'EPSG:27564',
  LAMBERT_2_ETENDU = 'EPSG:27572',
  CC42 = 'EPSG:3942',
  CC43 = 'EPSG:3943',
  CC44 = 'EPSG:3944',
  CC45 = 'EPSG:3945',
  CC46 = 'EPSG:3946',
  CC47 = 'EPSG:3947',
  CC48 = 'EPSG:3948',
  CC49 = 'EPSG:3949',
  CC50 = 'EPSG:3950',
  NGF_IGN69 = 'EPSG:5720'
}

export interface Coordinates {
  x: number;
  y: number;
  z?: number; // Ellipsoidal height
  h?: number; // Orthometric height (RAF20 / NGF)
  system: CoordinateSystem;
}

export interface Hypothesis {
  system: CoordinateSystem;
  lat: number;
  lng: number;
  label: string;
}

export interface BulkResult {
  original: string;
  converted: Coordinates[];
  error?: string;
}
