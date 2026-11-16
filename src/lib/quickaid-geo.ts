import barangays from '@/data/quickaid-barangays.json';

/**
 * QuickAid's barangay reference points (backend/utils/barangays_geocoded.json in its repository),
 * each with eight positions produced by the project's own json_geocode(): the reference point
 * plus its random offset. Public place names and coordinates only; no applicant data.
 */
export type Confidence = 'high' | 'medium' | 'low';

export interface Barangay {
  id: string;
  city: string;
  name: string;
  lat: number;
  lng: number;
  confidence: Confidence;
  samples: [number, number][];
  /** Position on the overview map, in viewBox units. */
  x: number;
  y: number;
  /** Kilometres from the middle of its municipality's points. */
  kmFromCity: number;
}

const KM_PER_DEG_LAT = 110.57;
const OUTLIER_KM = 40;
export const MAP_WIDTH = 1000;
const PAD = 40;

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

const kmPerDegLng = (lat: number) => 111.32 * Math.cos((lat * Math.PI) / 180);

const raw = barangays as Omit<Barangay, 'id' | 'x' | 'y' | 'kmFromCity'>[];

const cityMiddles = new Map(
  [...new Set(raw.map((b) => b.city))].map((city) => {
    const own = raw.filter((b) => b.city === city);
    return [city, { lat: median(own.map((b) => b.lat)), lng: median(own.map((b) => b.lng)) }];
  }),
);

const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) =>
  Math.hypot((a.lat - b.lat) * KM_PER_DEG_LAT, (a.lng - b.lng) * kmPerDegLng((a.lat + b.lat) / 2));

const withDistance = raw.map((b) => ({ ...b, kmFromCity: distanceKm(b, cityMiddles.get(b.city)!) }));
const inArea = withDistance.filter((b) => b.kmFromCity <= OUTLIER_KM);

const bounds = {
  minLat: Math.min(...inArea.map((b) => b.lat)),
  maxLat: Math.max(...inArea.map((b) => b.lat)),
  minLng: Math.min(...inArea.map((b) => b.lng)),
  maxLng: Math.max(...inArea.map((b) => b.lng)),
};
const midLat = (bounds.minLat + bounds.maxLat) / 2;
// Equirectangular projection around the area's middle latitude: fine at this scale (about 45 km).
const xScale = kmPerDegLng(midLat);
const spanX = (bounds.maxLng - bounds.minLng) * xScale;
const spanY = (bounds.maxLat - bounds.minLat) * KM_PER_DEG_LAT;
const unitsPerKm = (MAP_WIDTH - PAD * 2) / spanX;
export const MAP_HEIGHT = Math.round(spanY * unitsPerKm + PAD * 2);

const project = (lat: number, lng: number) => ({
  x: PAD + (lng - bounds.minLng) * xScale * unitsPerKm,
  y: PAD + (bounds.maxLat - lat) * KM_PER_DEG_LAT * unitsPerKm,
});

export const allBarangays: Barangay[] = withDistance.map((b) => ({
  ...b,
  id: `${b.city}/${b.name}`,
  ...project(b.lat, b.lng),
}));

/** Reference points that sit inside the area the six municipalities cover. */
export const mappedBarangays = allBarangays.filter((b) => b.kmFromCity <= OUTLIER_KM);

/** Reference points the geocoder placed far from their municipality. */
export const outliers = allBarangays.filter((b) => b.kmFromCity > OUTLIER_KM);

export const municipalities = [...cityMiddles.keys()].map((city) => {
  const own = mappedBarangays.filter((b) => b.city === city);
  return {
    name: city,
    count: allBarangays.filter((b) => b.city === city).length,
    x: own.reduce((sum, b) => sum + b.x, 0) / own.length,
    y: Math.min(...own.map((b) => b.y)),
  };
});

export const confidenceCounts = (['high', 'medium', 'low'] as const).map((level) => ({
  level,
  count: allBarangays.filter((b) => b.confidence === level).length,
}));

/** One kilometre on the overview map, for its scale bar. */
export const MAP_UNITS_PER_KM = unitsPerKm;

export { distanceKm, kmPerDegLng, KM_PER_DEG_LAT };
