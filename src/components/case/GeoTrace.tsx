'use client';

import { useId, useState, useSyncExternalStore } from 'react';
import {
  KM_PER_DEG_LAT,
  MAP_HEIGHT,
  MAP_UNITS_PER_KM,
  MAP_WIDTH,
  allBarangays,
  confidenceCounts,
  kmPerDegLng,
  mappedBarangays,
  municipalities,
  outliers,
  type Barangay,
  type Confidence,
} from '@/lib/quickaid-geo';
import styles from './GeoTrace.module.css';

/** The barangay picked in the application form screenshot above, so the two tell one story. */
const DEFAULT_ID = 'Sariaya/Bignay 2';

const confidenceText: Record<Confidence, string> = {
  high: 'High: the geocoder’s answer named both the barangay and the town.',
  medium: 'Medium: only the town matched, so the point may be off within it.',
  low: 'Low: neither matched well, so the point was flagged for a person to check.',
};

/** Half the width of the close-up, in metres. */
const CLOSE_HALF_M = 170;
const CLOSE_SIZE = 320;
const metre = CLOSE_SIZE / (CLOSE_HALF_M * 2);
/** json_geocode's offset: up to 0.001 degrees either way. */
const OFFSET_DEG = 0.001;

const byName = (a: Barangay, b: Barangay) => a.name.localeCompare(b.name, 'en', { numeric: true });

const noSubscription = () => () => undefined;
/** True once running in the browser: the pickers only work with JavaScript, so only then are they shown. */
const useInBrowser = () => useSyncExternalStore(noSubscription, () => true, () => false);

/**
 * How an application becomes a point on QuickAid's map. The overview shows every barangay
 * reference point the system uses; the close-up shows one of them with the area its random
 * offset can reach, drawn to scale, and positions that QuickAid's own geocoding code produced.
 */
export function GeoTrace() {
  const [selectedId, setSelectedId] = useState(DEFAULT_ID);
  const interactive = useInBrowser();
  const titleId = useId();
  const closeTitleId = useId();

  const selected = allBarangays.find((b) => b.id === selectedId) ?? allBarangays[0];
  const inCity = allBarangays.filter((b) => b.city === selected.city).sort(byName);
  const isOutlier = outliers.some((b) => b.id === selected.id);

  const chooseCity = (city: string) => {
    const first = allBarangays.filter((b) => b.city === city).sort(byName)[0];
    if (first) setSelectedId(first.id);
  };

  // Close-up geometry, in metres east and north of the reference point.
  const toClose = (lat: number, lng: number) => ({
    x: CLOSE_SIZE / 2 + (lng - selected.lng) * kmPerDegLng(selected.lat) * 1000 * metre,
    y: CLOSE_SIZE / 2 - (lat - selected.lat) * KM_PER_DEG_LAT * 1000 * metre,
  });
  const boxHalfX = OFFSET_DEG * kmPerDegLng(selected.lat) * 1000 * metre;
  const boxHalfY = OFFSET_DEG * KM_PER_DEG_LAT * 1000 * metre;
  const grid = Array.from({ length: 7 }, (_, i) => (i - 3) * 50 * metre + CLOSE_SIZE / 2);

  return (
    <div className={styles.geo}>
      <figure className={styles.overview}>
        <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-labelledby={titleId} className={styles.map}>
          <title id={titleId}>
            {`Map of the ${allBarangays.length} barangay reference points QuickAid uses across six municipalities in Quezon province. ${confidenceCounts
              .map((c) => `${c.count} ${c.level} confidence`)
              .join(', ')}. ${outliers.length} points lie outside the area shown.`}
          </title>
          <Graticule />
          {municipalities.map((m) => (
            <text key={m.name} x={m.x} y={m.y - 18} className={styles.townLabel} textAnchor="middle">
              {m.name}
            </text>
          ))}
          <g onClick={(event) => {
            const id = (event.target as Element).getAttribute('data-id');
            if (id) setSelectedId(id);
          }}>
            {mappedBarangays.map((b) => (
              <circle
                key={b.id}
                data-id={b.id}
                cx={b.x}
                cy={b.y}
                r={b.id === selected.id ? 9 : 6}
                className={styles.point}
                data-confidence={b.confidence}
                data-selected={b.id === selected.id}
              />
            ))}
          </g>
          {!isOutlier && (
            <circle key={selected.id} cx={selected.x} cy={selected.y} r={20} className={styles.ring} />
          )}
          {outliers.length > 0 && (
            <g className={styles.offMap} data-selected={isOutlier}>
              <path d="M 70 70 L 36 36 M 36 36 L 52 36 M 36 36 L 36 52" />
              <text x={80} y={66}>
                {outliers.length} points about {Math.round(outliers[0].kmFromCity)} km away
              </text>
            </g>
          )}
          <g className={styles.scale} transform={`translate(${MAP_WIDTH - 40 - 5 * MAP_UNITS_PER_KM} ${MAP_HEIGHT - 28})`}>
            <path d={`M 0 -6 V 0 H ${5 * MAP_UNITS_PER_KM} V -6`} />
            <text x={(5 * MAP_UNITS_PER_KM) / 2} y={-12} textAnchor="middle">
              5 km
            </text>
          </g>
        </svg>
        <figcaption className={styles.legend}>
          <span className={styles.legendTitle}>Geocoding confidence</span>
          {confidenceCounts.map((c) => (
            <span key={c.level} className={styles.legendItem} data-confidence={c.level}>
              {c.level[0].toUpperCase() + c.level.slice(1)} <span className={styles.count}>{c.count}</span>
            </span>
          ))}
        </figcaption>
      </figure>

      <div className={styles.panel}>
        {interactive && (
          <div className={styles.controls}>
            <label className={styles.field}>
              <span>Municipality</span>
              <select value={selected.city} onChange={(event) => chooseCity(event.target.value)}>
                {municipalities.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.count})
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Barangay</span>
              <select value={selected.id} onChange={(event) => setSelectedId(event.target.value)}>
                {inCity.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className={styles.readout} aria-live="polite">
          <h3 className={styles.place}>
            {selected.name}, {selected.city}
          </h3>
          <dl className={styles.facts}>
            <div>
              <dt>Reference point</dt>
              <dd className={styles.coords}>
                {selected.lat.toFixed(5)}° N, {selected.lng.toFixed(5)}° E
              </dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd data-confidence={selected.confidence} className={styles.confidence}>
                {confidenceText[selected.confidence]}
              </dd>
            </div>
          </dl>
          {isOutlier && (
            <p className={styles.warning}>
              This point is about {Math.round(selected.kmFromCity)} km from {selected.city}. The geocoder matched a
              barangay with the same name elsewhere, and because it was graded {selected.confidence}, the review flag
              did not catch it.
            </p>
          )}
        </div>

        <figure className={styles.closeFigure}>
          <svg viewBox={`0 0 ${CLOSE_SIZE} ${CLOSE_SIZE}`} role="img" aria-labelledby={closeTitleId} className={styles.close}>
            <title id={closeTitleId}>
              {`Close-up of ${selected.name}: its reference point, the area of about 220 by 220 metres that the random offset can reach, and eight positions QuickAid's geocoding code produced for it.`}
            </title>
            {grid.map((v) => (
              <g key={v} className={styles.closeGrid}>
                <line x1={v} x2={v} y1={0} y2={CLOSE_SIZE} />
                <line y1={v} y2={v} x1={0} x2={CLOSE_SIZE} />
              </g>
            ))}
            <rect
              key={`box-${selected.id}`}
              className={styles.offsetBox}
              x={CLOSE_SIZE / 2 - boxHalfX}
              y={CLOSE_SIZE / 2 - boxHalfY}
              width={boxHalfX * 2}
              height={boxHalfY * 2}
            />
            <g key={`samples-${selected.id}`} className={styles.samples}>
              {selected.samples.map(([lat, lng], i) => {
                const p = toClose(lat, lng);
                return <circle key={i} cx={p.x} cy={p.y} r={5} style={{ animationDelay: `${i * 40}ms` }} />;
              })}
            </g>
            <g className={styles.reference}>
              <line x1={CLOSE_SIZE / 2 - 12} x2={CLOSE_SIZE / 2 + 12} y1={CLOSE_SIZE / 2} y2={CLOSE_SIZE / 2} />
              <line y1={CLOSE_SIZE / 2 - 12} y2={CLOSE_SIZE / 2 + 12} x1={CLOSE_SIZE / 2} x2={CLOSE_SIZE / 2} />
            </g>
            <g className={styles.scale} transform={`translate(16 ${CLOSE_SIZE - 16})`}>
              <path d={`M 0 -5 V 0 H ${100 * metre} V -5`} />
              <text x={(100 * metre) / 2} y={-10} textAnchor="middle">
                100 m
              </text>
            </g>
          </svg>
          <figcaption className={styles.closeCaption}>
            <span className={styles.keyReference}>Reference point</span>
            <span className={styles.keyBox}>Offset area, ±0.001° (about 110 m)</span>
            <span className={styles.keySample}>Positions from json_geocode</span>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

/** Real latitude and longitude lines every 0.05°, so the overview reads as a chart, not a picture. */
function Graticule() {
  const lats = mappedBarangays.map((b) => b.lat);
  const lngs = mappedBarangays.map((b) => b.lng);
  const step = 0.05;
  const lines: { key: string; d: string; label: string; lx: number; ly: number }[] = [];
  const sample = mappedBarangays[0];
  const xOf = (lng: number) => sample.x + (lng - sample.lng) * kmPerDegLng(meanLat(lats)) * MAP_UNITS_PER_KM;
  const yOf = (lat: number) => sample.y - (lat - sample.lat) * KM_PER_DEG_LAT * MAP_UNITS_PER_KM;
  for (let lat = Math.ceil(Math.min(...lats) / step) * step; lat <= Math.max(...lats); lat += step) {
    const y = yOf(lat);
    lines.push({ key: `lat${lat.toFixed(2)}`, d: `M 0 ${y} H ${MAP_WIDTH}`, label: `${lat.toFixed(2)}° N`, lx: MAP_WIDTH - 8, ly: y - 6 });
  }
  for (let lng = Math.ceil(Math.min(...lngs) / step) * step; lng <= Math.max(...lngs); lng += step) {
    const x = xOf(lng);
    lines.push({ key: `lng${lng.toFixed(2)}`, d: `M ${x} 0 V ${MAP_HEIGHT}`, label: `${lng.toFixed(2)}° E`, lx: x + 6, ly: MAP_HEIGHT - 8 });
  }
  return (
    <g className={styles.graticule} aria-hidden>
      {lines.map((l) => (
        <g key={l.key}>
          <path d={l.d} />
          <text x={l.lx} y={l.ly} textAnchor={l.key.startsWith('lat') ? 'end' : 'start'}>
            {l.label}
          </text>
        </g>
      ))}
    </g>
  );
}

const meanLat = (lats: number[]) => (Math.min(...lats) + Math.max(...lats)) / 2;
