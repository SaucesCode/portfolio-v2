import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getBaseUrl } from '@/lib/seo';

const baseUrl = getBaseUrl();

export const viewport: Viewport = {
  themeColor: '#fbf9f5',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'James De Mesa | Digital Craft & Full-Stack Web Systems',
    template: '%s | James De Mesa — Digital Craft',
  },
  description:
    'Full-stack software developer engineering tailored web applications, custom WordPress Full Site Editing themes, and digital storefronts.',
  keywords: [
    'Full-Stack Developer',
    'Custom WordPress Themes',
    'WordPress FSE',
    'Next.js Engineer',
    'React Developer',
    'Prisma PostgreSQL',
    'Web Application Engineering',
  ],
  authors: [{ name: 'James Patrick De Mesa', url: 'https://github.com/SaucesCode' }],
  creator: 'James Patrick De Mesa',
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'James De Mesa — Digital Craft',
    title: 'James De Mesa | Digital Craft & Full-Stack Web Systems',
    description:
      'Engineering tailored web platforms, luxury WordPress themes, and high-impact digital systems.',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'James De Mesa — Digital Craft',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'James De Mesa | Digital Craft & Full-Stack Web Systems',
    description:
      'Engineering tailored web platforms, luxury WordPress themes, and high-impact digital systems.',
    images: [`${baseUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${baseUrl}/#person`,
        name: 'James Patrick De Mesa',
        givenName: 'James Patrick',
        familyName: 'De Mesa',
        alternateName: 'SaucesCode',
        jobTitle: 'Principal Creative Frontend Engineer & Full-Stack Architect',
        sameAs: ['https://github.com/SaucesCode'],
        knowsAbout: [
          'WordPress Full Site Editing',
          'Next.js',
          'TypeScript',
          'Node.js',
          'Prisma ORM',
          'PostgreSQL',
          'Tailwind CSS',
        ],
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${baseUrl}/#service`,
        name: 'James De Mesa — Digital Craft',
        url: baseUrl,
        founder: { '@id': `${baseUrl}/#person` },
        description:
          'Full-stack web application development, custom WordPress Full Site Editing themes, and digital storefront engineering.',
        serviceType: [
          'Full-Stack Web Application Development',
          'WordPress Theme Design & Full Site Editing',
          'E-Commerce Web Design',
        ],
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&family=Geist:wght@300;400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#fbf9f5] text-[#161614] antialiased selection:bg-[#b84218]/15 selection:text-[#161614]">
        {children}
      </body>
    </html>
  );
}
