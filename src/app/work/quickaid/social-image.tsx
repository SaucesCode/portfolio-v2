import { ImageResponse } from 'next/og';
import { site } from '@/data/site';
import { MAP_HEIGHT, MAP_WIDTH, mappedBarangays } from '@/lib/quickaid-geo';
import { socialImageSize } from '@/lib/social-image';

export const alt = 'QuickAid case study: the barangay reference points behind an applicant map, across six municipalities in Quezon province';

const colours = { high: '#0d2340', medium: '#3a6fb5', low: '#c03a26' } as const;

/** The case study's share image: its title beside the real reference-point map, drawn as dots. */
export const renderImage = () => {
  const mapW = 560;
  const mapH = Math.round((mapW * MAP_HEIGHT) / MAP_WIDTH);
  const s = mapW / MAP_WIDTH;
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#e5ebf0', color: '#0d2340', padding: 64 }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: 440, justifyContent: 'space-between' }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#45576c' }}>Case study</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ fontSize: 76, lineHeight: 1, letterSpacing: -3, fontWeight: 700 }}>QuickAid</div>
            <div style={{ fontSize: 26, lineHeight: 1.3, color: '#45576c' }}>
              Crisis-assistance applications, mapped by barangay, never by house.
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{site.name}</div>
        </div>
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', position: 'relative', width: mapW, height: mapH, background: '#f5f8fa', borderRadius: 4 }}>
            {mappedBarangays.map((b) => (
              <div
                key={b.id}
                style={{
                  position: 'absolute',
                  left: b.x * s - 5,
                  top: b.y * s - 5,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  background: colours[b.confidence],
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    socialImageSize,
  );
};
