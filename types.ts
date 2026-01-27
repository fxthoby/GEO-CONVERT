
export enum CoordinateSystem {
  WGS84 = 'EPSG:4326',
  LAMBERT_93 = 'EPSG:2154',
  CC42 = 'EPSG:3942',
  CC43 = 'EPSG:3943',
  CC44 = 'EPSG:3944',
  CC45 = 'EPSG:3945',
  CC46 = 'EPSG:3946',
  CC47 = 'EPSG:3947',
  CC48 = 'EPSG:3948',
  CC49 = 'EPSG:3949',
  CC50 = 'EPSG:3950'
}

export interface Coordinates {
  x: number;
  y: number;
  system: CoordinateSystem;
}

export interface VerificationResult {
  text: string;
  sources: Array<{ title: string; uri: string }>;
}
