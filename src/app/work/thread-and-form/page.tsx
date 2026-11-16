import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import { Playfair_Display } from 'next/font/google';
import type { CSSProperties } from 'react';
import { NextCase } from '@/components/case/NextCase';
import { ButtonLink } from '@/components/ButtonLink';
import { Contact } from '@/components/Contact';
import { ExternalLink } from '@/components/ExternalLink';
import { Morph, morphName } from '@/components/Morph';
import { getCaseStudy, type Shot } from '@/data/projects';
import {
  fontSizes,
  frontPage,
  palette,
  patterns,
  phoneFirstScreen,
  spacing,
  templateParts,
  templates,
} from '@/data/thread-and-form';
import { caseStudyJsonLd, caseStudyMetadata, jsonLdScript } from '@/lib/case-study';
import styles from './thread-and-form.module.css';

// The theme's own display face, used here for headings and the type specimen.
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-playfair',
  display: 'swap',
});

const project = getCaseStudy('thread-and-form');
const captures = project.captures!;
const full = captures.desktop.full;

const copy = {
  title: 'Thread & Form: an editorial WordPress block theme',
  description:
    'Case study: a WordPress block theme for a fictional fashion label, with Site Editor templates, 17 block patterns, shared theme.json design tokens and optional WooCommerce support.',
};

export const metadata = caseStudyMetadata(project, copy);

const jsonLd = caseStudyJsonLd(project, copy, {
  '@type': 'CreativeWork',
  genre: 'WordPress block theme',
  keywords: 'WordPress, block theme, Full Site Editing, theme.json, WooCommerce',
});

const facts = [
  { term: 'What it is', detail: 'A concept build for a fictional fashion label. No client commissioned it.' },
  { term: 'My part', detail: 'Design, theme development and the static demo build' },
  { term: 'Built with', detail: 'WordPress block theme with theme.json v3, PHP, Tailwind CSS v4 and plain JavaScript' },
  { term: 'Requires', detail: 'WordPress 6.6 or later, PHP 7.4 or later' },
];

const goals = [
  {
    title: 'Read like a magazine, sell like a shop',
    body: 'A serif display face, wide margins and large photography carry the editorial tone, while the collection grid, product cards and bag keep shopping one step away.',
  },
  {
    title: 'Editable without a page builder',
    body: 'Every layout is made of core blocks, saved as templates, template parts and patterns. A shop owner changes words and images in the Site Editor, not in code.',
  },
  {
    title: 'One set of tokens',
    body: 'Colours, fonts, type sizes, spacing and layout widths are defined once in theme.json, so the editor, the blocks and the front end all draw from the same values.',
  },
];

const underTheHood = [
  {
    title: 'Theme setup',
    body: 'functions.php declares support for WooCommerce, the title tag, featured images and editor styles, adds resource hints for the font host, and loads the fonts, the theme stylesheet, an optional Tailwind build and one script.',
  },
  {
    title: 'Search engines and sharing',
    body: 'A small SEO module writes the page title, canonical URL, description, Open Graph tags and a JSON-LD graph for the store, the site, breadcrumbs and journal posts, and preloads the hero image at high priority. If Yoast, Rank Math, All in One SEO, SEOPress or The SEO Framework is active, it stays out of the way.',
  },
  {
    title: 'Setting up a new site',
    body: 'An admin screen creates the pages the templates expect, such as the collection, story, journal and contact pages, so a fresh install matches the demo in one step. It checks the user’s permission and a security nonce first.',
  },
  {
    title: 'Accessibility',
    body: 'Icon-only buttons and the navigation have accessible names, the mobile menu button reports whether the menu is open, and keyboard focus is shown with a visible outline in the accent colour.',
  },
];

const limits = [
  'Thread & Form is a fictional label. Its products, prices, materials and story are sample content written for the theme.',
  'The theme’s press pattern contains placeholder quotes, so it is left out of the previews on this site.',
  'The live demo is a static snapshot of a local WordPress install, generated with Puppeteer and published to GitHub Pages. Anything that needs a running server, such as WooCommerce checkout or form submission, does not work there.',
  'The theme’s transitions and scroll reveals do not yet check for a reduced-motion preference.',
];

const sectionTitle = `${styles.display} text-[clamp(2rem,1.5rem+1.8vw,3.25rem)] leading-[1.05]`;

/** Phone captures of a front-page part are shown at most this tall, relative to their width. */
const PHONE_CAP = 1.3;

interface ArtDirectedProps {
  desktop: Shot;
  phone: Shot;
  desktopSizes: string;
  phoneSizes: string;
  alt: string;
  eager?: boolean;
}

/**
 * Real captures at both sizes: below 768 px the phone capture of the same page is used, so phone
 * visitors read the theme at the size it was designed for instead of a shrunken desktop layout.
 */
function ArtDirected({ desktop, phone, desktopSizes, phoneSizes, alt, eager = false }: ArtDirectedProps) {
  const loading = eager ? 'eager' : 'lazy';
  const { props: wide } = getImageProps({ ...desktop, alt, sizes: desktopSizes, loading, fetchPriority: eager ? 'high' : undefined });
  const { props: narrow } = getImageProps({ ...phone, alt, sizes: phoneSizes, loading });
  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={narrow.srcSet} sizes={narrow.sizes} width={phone.width} height={phone.height} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt is passed through getImageProps */}
      <img {...wide} />
    </picture>
  );
}

export default function ThreadAndFormCaseStudy() {
  return (
    <div className={`${styles.page} ${playfair.variable}`}>
      <main id="main-content">
        {/* Introduction ---------------------------------------------------- */}
        <header>
          <div className="mx-auto max-w-[90rem] px-4 pt-8 sm:px-6 sm:pt-14 lg:px-10">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-x-2 text-[0.9375rem] text-graphite">
                <li>
                  <Link href="/#featured" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-ink hover:underline">
                    Work
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li aria-current="page" className="font-medium text-ink">
                  {project.title}
                </li>
              </ol>
            </nav>
            <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-6">
              <div className="lg:col-span-7">
                <p className="text-[0.9375rem] font-medium text-signal">Case study, website</p>
                <h1 className={`${styles.display} mt-3 text-[min(clamp(3.25rem,1.6rem+6.6vw,8rem),15vw)] leading-[0.95]`}>
                  {project.title}
                </h1>
                <p className="mt-6 max-w-[36ch] text-[clamp(1.25rem,1.05rem+0.7vw,1.625rem)] leading-[1.35]">
                  A WordPress block theme for a fashion label, built so every page reads like an editorial spread and
                  can still be edited in the Site Editor without a page builder.
                </p>
              </div>
              <dl className="grid content-end gap-x-6 gap-y-5 text-[0.9375rem] sm:grid-cols-2 lg:col-span-4 lg:col-start-9 lg:grid-cols-1">
                {facts.map((fact) => (
                  <div key={fact.term} className="border-t border-rule pt-3">
                    <dt className="text-graphite">{fact.term}</dt>
                    <dd className="mt-1 font-medium">{fact.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <figure>
            <Morph name={morphName(project.slug)}>
              <div className={styles.bleed}>
                <ArtDirected
                  desktop={captures.desktop.poster}
                  phone={phoneFirstScreen}
                  desktopSizes="100vw"
                  phoneSizes="min(72vw, 300px)"
                  alt="The Thread & Form homepage as it first appears, with the headline “A study in deliberate form.” and buttons to explore the collection and read the studio manifesto."
                  eager
                />
              </div>
            </Morph>
            <figcaption className="mx-auto max-w-[90rem] px-4 pt-3 text-[0.9375rem] text-graphite sm:px-6 lg:px-10">
              <span className="md:hidden">The live demo’s first screen on a phone.</span>
              <span className="hidden md:inline">The live demo’s homepage at desktop width.</span>
            </figcaption>
          </figure>
        </header>

        {/* Design goals ----------------------------------------------------- */}
        <section aria-labelledby="goals-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <h2 id="goals-title" className={sectionTitle}>
            What the theme had to do
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {goals.map((goal) => (
              <div key={goal.title} className="border-t border-ink pt-4">
                <h3 className="text-xl leading-tight font-semibold tracking-[-0.01em]">{goal.title}</h3>
                <p className="mt-3 max-w-[44ch] leading-relaxed">{goal.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* The exploded front page ----------------------------------------- */}
        <section aria-labelledby="anatomy-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <div className="max-w-[60ch]">
            <h2 id="anatomy-title" className={sectionTitle}>
              The front page, pulled apart
            </h2>
            <p className="mt-4 text-lg leading-relaxed">
              The front-page template is nothing but a header, a footer and a stack of block patterns. Here is the live
              demo’s front page cut along those seams, top to bottom. Each piece can be moved, removed or reused on another
              page from the Site Editor. On a phone, each piece is shown as the demo itself looks on a phone.
            </p>
          </div>
          <ol className={styles.slices}>
            {frontPage.map((slice, i) => {
              const height = slice.bottom - slice.top;
              const capped = slice.phone.height > slice.phone.width * PHONE_CAP;
              const crop = {
                '--w': full.width,
                '--h': height,
                '--offset': `${(-slice.top / height) * 100}%`,
                '--phone-ratio': Math.min(slice.phone.height / slice.phone.width, PHONE_CAP),
              } as CSSProperties;
              return (
                <li key={slice.slug} className={styles.slice}>
                  <div className={styles.sliceLabel}>
                    <span className={styles.sliceNumber} aria-hidden>
                      {i + 1}
                    </span>
                    <h3 className={styles.sliceName}>{slice.name}</h3>
                    <p className={styles.sliceSlug}>
                      {slice.kind === 'part' ? 'Template part' : 'Pattern'} <code>{slice.slug}</code>
                    </p>
                    <p className={styles.sliceText}>{slice.description}</p>
                  </div>
                  <div className={styles.window} style={crop} data-capped={capped}>
                    <ArtDirected
                      desktop={full}
                      phone={slice.phone}
                      desktopSizes="(min-width: 1440px) 900px, (min-width: 1024px) 62vw, 92vw"
                      phoneSizes="92vw"
                      alt={`The ${slice.name.toLowerCase()} section of the Thread & Form front page.`}
                    />
                  </div>
                  {slice.slug === 'thread-and-form/hero' && (
                    <p className={`${styles.excluded} lg:col-start-2`}>
                      The press pattern sits here in the template. It holds placeholder quotes, so it is left out.
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        {/* Visual system ---------------------------------------------------- */}
        <section aria-labelledby="system-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <div className="max-w-[60ch]">
            <h2 id="system-title" className={sectionTitle}>
              The visual system, straight from theme.json
            </h2>
            <p className="mt-4 text-lg leading-relaxed">
              These are the theme’s actual tokens. The Site Editor offers them as presets, and the theme’s CSS reads the
              same values, so a change made once shows up everywhere.
            </p>
          </div>

          <div className="mt-12 grid gap-16 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-5">
              <h3 className="text-xl font-semibold">Colour</h3>
              <ul className={`${styles.swatches} mt-5`}>
                {palette.map((colour) => (
                  <li key={colour.slug}>
                    <span className={styles.chip} style={{ background: colour.hex, display: 'block' }} aria-hidden />
                    <span className="mt-2 block text-[0.9375rem] font-medium">{colour.name}</span>
                    <span className="block text-[0.875rem] text-graphite">{colour.hex}</span>
                  </li>
                ))}
              </ul>

              <h3 className="mt-14 text-xl font-semibold">Spacing</h3>
              <ul className={`${styles.scale} mt-5`}>
                {spacing.map((step) => (
                  <li key={step.slug}>
                    <span className="text-[0.875rem] text-graphite">
                      {step.slug}, {step.size}
                    </span>
                    <span className={styles.bar} style={{ width: step.size }} aria-hidden />
                  </li>
                ))}
              </ul>
              <p className="mt-6 max-w-[44ch] text-[0.9375rem] leading-relaxed text-graphite">
                Content is set at 820 px wide and wide blocks at 1440 px.
              </p>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <h3 className="text-xl font-semibold">Type</h3>
              <p className="mt-2 max-w-[52ch] text-[0.9375rem] leading-relaxed text-graphite">
                Playfair Display for display text, Plus Jakarta Sans for everything else. Sizes are fluid, so each one
                scales down smoothly on small screens.
              </p>
              <ul className={`${styles.scale} mt-6`}>
                {fontSizes.map((size) => (
                  <li key={size.slug}>
                    <span className="text-[0.875rem] text-graphite">
                      {size.slug}, {size.size}
                    </span>
                    <span className={styles.sample} style={{ fontSize: `min(${size.size}, 11vw)` }}>
                      Deliberate form
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Responsive ------------------------------------------------------- */}
        <section aria-labelledby="responsive-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-4">
              <h2 id="responsive-title" className={sectionTitle}>
                Same page, phone width
              </h2>
              <div className="mt-5 max-w-[46ch] space-y-4 leading-relaxed">
                <p>
                  On a phone the two-column hero stacks, the product grid narrows to one column, the standards band
                  becomes a list and the navigation folds into a menu. The front page that is 7,458 pixels tall at desktop width runs to 15,318 at phone width:
                  the same content, set for reading one thing at a time.
                </p>
                <p>
                  The layout changes at 1024 and 768 pixels, and the type sizes are fluid in between, so headings shrink
                  smoothly rather than jumping at an odd width.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2.6fr)] items-end gap-4 sm:gap-6 lg:col-span-8">
              <figure>
                <div className="overflow-hidden rounded-[14px] border-[5px] border-ink shadow-hang">
                  <Image
                    src={captures.phone.poster.src}
                    width={captures.phone.poster.width}
                    height={captures.phone.poster.height}
                    sizes="(min-width: 1024px) 16vw, 26vw"
                    alt="The Thread & Form homepage at phone width, with the headline stacked above the photograph."
                    loading="lazy"
                    className="block h-auto w-full"
                  />
                </div>
                <figcaption className="mt-2 text-[0.875rem] text-graphite">Phone</figcaption>
              </figure>
              <figure>
                <div className="overflow-hidden rounded-[4px] shadow-hang">
                  <Image
                    src={captures.desktop.poster.src}
                    width={captures.desktop.poster.width}
                    height={captures.desktop.poster.height}
                    sizes="(min-width: 1024px) 42vw, 66vw"
                    alt=""
                    loading="lazy"
                    className="block h-auto w-full"
                  />
                </div>
                <figcaption className="mt-2 text-[0.875rem] text-graphite">Desktop</figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Structure -------------------------------------------------------- */}
        <section aria-labelledby="structure-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <h2 id="structure-title" className={sectionTitle}>
            How the theme is built
          </h2>
          <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-6">
            <div className="grid gap-8 sm:grid-cols-3 lg:col-span-6">
              <FileList title={`${templates.length} templates`} folder="templates" files={templates} extension=".html" />
              <FileList title={`${templateParts.length} template parts`} folder="parts" files={templateParts} extension=".html" />
              <FileList title={`${patterns.length} patterns`} folder="patterns" files={patterns} extension=".php" />
            </div>
            <div className="grid gap-8 lg:col-span-5 lg:col-start-8">
              {underTheHood.map((item) => (
                <div key={item.title} className="border-t border-rule pt-4">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 max-w-[56ch] leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Limits and links --------------------------------------------------- */}
        <section aria-labelledby="limits-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
            <h2 id="limits-title" className={`${sectionTitle} lg:col-span-4`}>
              What to keep in mind
            </h2>
            <ul className="max-w-[62ch] space-y-4 leading-relaxed lg:col-span-7 lg:col-start-6">
              {limits.map((limit) => (
                <li key={limit} className="border-t border-rule pt-4">
                  {limit}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4 lg:pl-[calc((100%+1.5rem)*5/12)]">
            <ButtonLink href={project.links[0].href} icon="right">
              {project.links[0].label}
            </ButtonLink>
            {project.links.slice(1).map((link) => (
              <ExternalLink key={link.href} href={link.href}>
                {link.label} on GitHub
              </ExternalLink>
            ))}
          </div>
        </section>

        <NextCase current={project.slug} />
      </main>

      <Contact
        headline={['Have a website', 'idea worth', 'building?']}
        lede="A shop, a portfolio, a WordPress theme or a landing page: tell me what it is for and who it should reach. A few sentences is enough to start."
        action="Email me about a website"
        subject="A website idea"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
    </div>
  );
}

function FileList({ title, folder, files, extension }: { title: string; folder: string; files: string[]; extension: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-[0.875rem] text-graphite">
        in <code>{folder}/</code>
      </p>
      <ul className="mt-3 space-y-1 font-mono text-[0.8125rem] leading-snug">
        {files.map((file) => (
          <li key={file} className={file === 'press' ? 'text-graphite line-through' : undefined}>
            {file}
            {extension}
            {file === 'press' && <span className="sr-only"> (not shown on this site)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
