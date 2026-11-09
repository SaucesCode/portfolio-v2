import type { Metadata, Viewport } from 'next';
import { Archivo, Newsreader, Plus_Jakarta_Sans } from 'next/font/google';
import { site } from '@/data/site';
import { getBaseUrl } from '@/lib/seo';
import './globals.css';

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
  weight: ['800'],
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

const baseUrl = getBaseUrl();
const title = 'James De Mesa, WordPress and web developer';
const description =
  'James De Mesa designs and builds WordPress themes, websites, online stores and custom web applications. See full-length previews of real, live projects.';

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
  authors: [{ name: site.legalName, url: site.github }],
  creator: site.legalName,
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
      name: site.legalName,
      alternateName: 'SaucesCode',
      jobTitle: site.role,
      url: baseUrl,
      email: `mailto:${site.email}`,
      address: { '@type': 'PostalAddress', addressCountry: 'PH' },
      sameAs: [site.github, site.linkedin],
      knowsAbout: ['WordPress', 'WordPress block themes', 'Web design', 'React', 'Next.js', 'Django', 'PostgreSQL'],
    },
    {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: site.name,
      publisher: { '@id': `${baseUrl}/#person` },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${jakarta.variable} ${newsreader.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, '\\u003c') }}
        />
      </body>
    </html>
  );
}
