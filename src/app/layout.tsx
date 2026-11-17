import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import { Archivo, Newsreader, Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import { InstantHistoryScroll } from '@/components/InstantHistoryScroll';
import { services } from '@/data/services';
import { site } from '@/data/site';
import { getBaseUrl } from '@/lib/seo';
import './globals.css';
// Every page's header uses the capsule button, and the 404 route only receives the root layout's
// stylesheet, so the button styles ship with the layout.
import '@/components/ButtonLink.module.css';
import '@/components/ask/AskPanel.module.css';
import { InquiryPanel } from '@/components/inquiry/InquiryPanel';

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

// Display faces borrowed from individual projects for their previews. Not preloaded:
// browsers only fetch them when a project preview actually renders text in them.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-jakarta',
  display: 'swap',
  preload: false,
});

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-newsreader',
  display: 'swap',
  preload: false,
});

// Thread & Form's display face for the live hero demo, which mounts after first paint. The case study
// keeps its own preloaded instance; the files are the same, so the browser fetches them once.
const playfairLive = Playfair_Display({
  subsets: ['latin'],
  weight: ['500'],
  style: ['normal', 'italic'],
  variable: '--font-playfair-live',
  display: 'swap',
  preload: false,
});

const baseUrl = getBaseUrl();
const title = `${site.name}, full-stack software engineer`;
const description =
  'James Patrick De Mesa is a full-stack software engineer building custom web applications, business systems, WordPress sites and themes, and websites. Take a guided tour of a real app and preview live sites in full.';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e3e4df' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1e21' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: title,
    template: `%s | ${site.name}`,
  },
  description,
  authors: [{ name: site.name, url: site.github }],
  creator: site.name,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: site.name,
    title,
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${baseUrl}/#person`,
      name: site.name,
      alternateName: site.githubHandle,
      jobTitle: site.role,
      description,
      url: baseUrl,
      mainEntityOfPage: { '@id': `${baseUrl}/#profile` },
      email: `mailto:${site.email}`,
      address: { '@type': 'PostalAddress', addressCountry: 'PH' },
      sameAs: [site.github, site.linkedin],
      knowsAbout: [
        'Full-stack software engineering',
        'Web application development',
        'Business management systems',
        'REST APIs',
        'PostgreSQL',
        'Django',
        'Node.js',
        'React',
        'Next.js',
        'WordPress block themes',
        'Web design',
      ],
      makesOffer: services.map((service) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: service.name, description: service.description },
      })),
    },
    {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: site.name,
      description,
      inLanguage: 'en',
      publisher: { '@id': `${baseUrl}/#person` },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-scroll-behavior lets Next.js switch smooth scrolling off while it changes pages, so a
    // new page opens at its top instead of scrolling there; in-page links still scroll smoothly.
    // The hero's inline script marks <html> (data-js, and an early tap) before React loads, so its
    // attributes legitimately differ from the server HTML; this applies to <html> alone, not its children.
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning className={`${archivo.variable} ${jakarta.variable} ${newsreader.variable} ${playfairLive.variable}`}>
      <body>
        {children}
        <InstantHistoryScroll />
        <InquiryPanel />
        {/* Vercel Web Analytics: page views without cookies or personal data. */}
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, '\\u003c') }}
        />
      </body>
    </html>
  );
}
