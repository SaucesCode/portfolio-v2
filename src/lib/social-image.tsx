import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { featuredSoftware, featuredWebsite } from '@/data/projects';
import { site } from '@/data/site';

export const socialImageSize = { width: 1200, height: 630 };
export const socialImageAlt = `${site.name}: full-stack software engineer building web applications, business systems and websites`;

const dataUri = async (src: string) =>
  `data:image/jpeg;base64,${(await readFile(join(process.cwd(), 'public', src))).toString('base64')}`;

/** Shared by the Open Graph and Twitter images: one app screen and one website, hung side by side. */
export async function renderSocialImage() {
  const appScreen = featuredSoftware.walkthrough?.[0].shot.src ?? featuredSoftware.poster.src;
  const [app, web] = await Promise.all([dataUri(appScreen), dataUri(featuredWebsite.poster.src)]);
  const frame = { display: 'flex', position: 'absolute' as const, borderRadius: 3, overflow: 'hidden' as const };

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#e3e4df', color: '#141619', padding: 64 }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: 430, gap: 22, justifyContent: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{site.name}</div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 54, lineHeight: 1.02, letterSpacing: -2, fontWeight: 600 }}>
            <span>Software that works.</span>
            <span>Experiences that stand out.</span>
          </div>
          <div style={{ fontSize: 23, color: '#4f5358', lineHeight: 1.35 }}>
            Full-stack software engineer: web applications, business systems, WordPress and websites.
          </div>
        </div>
        <div style={{ display: 'flex', position: 'relative', flex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img elements */}
          <img src={web} width={448} height={280} alt="" style={{ ...frame, right: 0, top: 30, boxShadow: '0 24px 50px -24px rgba(20,22,25,0.5)' }} />
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img elements */}
          <img src={app} width={448} height={280} alt="" style={{ ...frame, left: 0, bottom: 30, boxShadow: '0 30px 60px -24px rgba(20,22,25,0.55)' }} />
        </div>
      </div>
    ),
    socialImageSize,
  );
}
