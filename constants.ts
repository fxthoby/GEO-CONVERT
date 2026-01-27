
import { CoordinateSystem } from './types';

// Proj4 definitions for common French systems (Source: spatialreference.org)
export const PROJ_DEFS: Record<CoordinateSystem, string> = {
  [CoordinateSystem.WGS84]: '+proj=longlat +datum=WGS84 +no_defs',
  [CoordinateSystem.LAMBERT_93]: '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  [CoordinateSystem.CC42]: '+proj=lcc +lat_1=41.25 +lat_2=42.75 +lat_0=42 +lon_0=3 +x_0=1700000 +y_0=1200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  [CoordinateSystem.CC43]: '+proj=lcc +lat_1=42.25 +lat_2=43.75 +lat_0=43 +lon_0=3 +x_0=1700000 +y_0=2200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  [CoordinateSystem.CC44]: '+proj=lcc +lat_1=43.25 +lat_2=44.75 +lat_0=44 +lon_0=3 +x_0=1700000 +y_0=3200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  [CoordinateSystem.CC45]: '+proj=lcc +lat_1=44.25 +lat_2=45.75 +lat_0=45 +lon_0=3 +x_0=1700000 +y_0=4200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  [CoordinateSystem.CC46]: '+proj=lcc +lat_1=45.25 +lat_2=46.75 +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  [CoordinateSystem.CC47]: '+proj=lcc +lat_1=46.25 +lat_2=47.75 +lat_0=47 +lon_0=3 +x_0=1700000 +y_0=6200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  [CoordinateSystem.CC48]: '+proj=lcc +lat_1=47.25 +lat_2=48.75 +lat_0=48 +lon_0=3 +x_0=1700000 +y_0=7200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  [CoordinateSystem.CC49]: '+proj=lcc +lat_1=48.25 +lat_2=49.75 +lat_0=49 +lon_0=3 +x_0=1700000 +y_0=8200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  [CoordinateSystem.CC50]: '+proj=lcc +lat_1=49.25 +lat_2=50.75 +lat_0=50 +lon_0=3 +x_0=1700000 +y_0=9200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
};

export const SYSTEM_LABELS: Record<CoordinateSystem, string> = {
  [CoordinateSystem.WGS84]: 'WGS84 (Long / Lat)',
  [CoordinateSystem.LAMBERT_93]: 'Lambert 93 (France entière)',
  [CoordinateSystem.CC42]: 'Lambert CC42',
  [CoordinateSystem.CC43]: 'Lambert CC43',
  [CoordinateSystem.CC44]: 'Lambert CC44',
  [CoordinateSystem.CC45]: 'Lambert CC45',
  [CoordinateSystem.CC46]: 'Lambert CC46',
  [CoordinateSystem.CC47]: 'Lambert CC47',
  [CoordinateSystem.CC48]: 'Lambert CC48',
  [CoordinateSystem.CC49]: 'Lambert CC49',
  [CoordinateSystem.CC50]: 'Lambert CC50',
};
