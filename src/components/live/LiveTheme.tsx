import type { CSSProperties } from 'react';
import Image from 'next/image';
import { liveHero, type StylePreset, type TypePair } from '@/data/thread-and-form';
import styles from './LiveTheme.module.css';

/**
 * The Thread & Form front-page hero (patterns/hero.php), rebuilt so its theme.json tokens can be
 * swapped live. One set of custom properties drives every colour and the display face.
 */
export function LiveTheme({ preset, type, onImageLoad }: { preset: StylePreset; type: TypePair; onImageLoad?: () => void }) {
  const tokens = {
    '--tf-ground': preset.ground,
    '--tf-ink': preset.ink,
    '--tf-muted': preset.muted,
    '--tf-accent': preset.accent,
    '--tf-display': type.display,
  } as CSSProperties;

  return (
    <div className={styles.page} style={tokens} data-theme-ground aria-hidden>
      <header className={styles.header}>
        <span className={styles.wordmark}>Thread &amp; Form</span>
        <span className={styles.nav}>Collection · Our Story · Journal · Size Guide · Contact</span>
      </header>
      <div className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.tag}>{liveHero.tag}</p>
          <p className={styles.headline} data-theme-headline>
            <span>{liveHero.lineOne}</span>
            <em>{liveHero.lineTwo}</em>
          </p>
          <p className={styles.lead}>{liveHero.lead}</p>
          <p className={styles.actions}>
            <span className={styles.primary}>{liveHero.primary} ↗</span>
            <span className={styles.secondary}>{liveHero.secondary}</span>
          </p>
        </div>
        <div className={styles.photo}>
          <Image
            src={liveHero.image.src}
            width={liveHero.image.width}
            height={liveHero.image.height}
            alt=""
            sizes="(min-width: 1024px) 20vw, 30vw"
            onLoad={onImageLoad}
          />
        </div>
      </div>
    </div>
  );
}
