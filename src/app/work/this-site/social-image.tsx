import { ImageResponse } from 'next/og';
import { site } from '@/data/site';
import { socialImageSize } from '@/lib/social-image';

export const alt = 'Case study of this site: a portfolio with live demos and an AI assistant that answers only from the site';

const parts = ['Browser', 'Server', 'Counters', 'Model', 'Page'];

/** The case study's share image: its title beside the five parts a question passes through. */
export const renderImage = () =>
  new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#e3e4df', color: '#141619', padding: 64 }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: 600, justifyContent: 'space-between' }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#4f5358' }}>Case study</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ fontSize: 88, lineHeight: 1, letterSpacing: -3, fontWeight: 700 }}>This site</div>
            <div style={{ fontSize: 28, lineHeight: 1.3, color: '#4f5358' }}>
              A portfolio that shows its work, with an AI assistant that answers only from what is here.
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{site.name}</div>
        </div>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', gap: 18 }}>
          {parts.map((part, i) => (
            <div key={part} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 26, fontWeight: 600 }}>{part}</div>
              <div
                style={{
                  display: 'flex',
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  background: i === parts.length - 1 ? '#2633e8' : '#141619',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    ),
    socialImageSize,
  );
