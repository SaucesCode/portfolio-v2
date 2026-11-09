import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { featured } from '@/data/projects';
import { site } from '@/data/site';

export const socialImageSize = { width: 1200, height: 630 };
export const socialImageAlt = `${site.name}: WordPress themes, websites and web applications`;

/** Shared by the Open Graph and Twitter images: the featured site hung on the gallery wall. */
export async function renderSocialImage() {
  const poster = await readFile(join(process.cwd(), 'public', featured.poster.src));
  const posterSrc = `data:image/jpeg;base64,${poster.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: '#e3e4df',
          color: '#141619',
          padding: 64,
          gap: 56,
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', width: 380, gap: 24 }}>
          <div style={{ fontSize: 30, fontWeight: 700 }}>{site.name}</div>
          <div style={{ fontSize: 58, lineHeight: 1.02, letterSpacing: -2, fontWeight: 600 }}>
            Websites, built to be looked at closely.
          </div>
          <div style={{ fontSize: 24, color: '#4f5358', lineHeight: 1.35 }}>
            WordPress themes, online stores, landing pages and web apps.
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            boxShadow: '0 30px 60px -28px rgba(20,22,25,0.5)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img elements */}
          <img src={posterSrc} width={640} height={400} alt="" style={{ width: 640, height: 400 }} />
        </div>
      </div>
    ),
    socialImageSize,
  );
}
