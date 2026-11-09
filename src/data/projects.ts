export type Classification = 'client' | 'personal' | 'concept' | 'prototype';

export interface Shot {
  src: string;
  width: number;
  height: number;
}

/**
 * A full-length capture plus a poster cropped from its top edge at the same width.
 * The poster height equals one browser viewport, so poster.height / full.height is
 * the share of the page visible at once.
 */
export interface FullLengthCapture {
  full: Shot;
  poster: Shot;
}

export interface BrandTheme {
  ground: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  /** CSS variable name of a next/font family loaded on demand, e.g. '--font-newsreader'. */
  displayFont?: string;
}

export interface Project {
  slug: string;
  title: string;
  /** Plain-language description of what it is, shown like the "medium" line of a gallery label. */
  medium: string;
  year: number;
  classification: Classification;
  /** One honest line explaining the classification to a visitor. */
  provenance: string;
  summary: string;
  liveUrl: string;
  repoUrl: string;
  poster: Shot;
  captures?: {
    desktop: FullLengthCapture;
    phone: FullLengthCapture;
  };
  brand?: BrandTheme;
}

const desktopPoster = (slug: string): Shot => ({ src: `/work/${slug}/desktop-poster.jpg`, width: 1440, height: 900 });

const captures = (slug: string, desktopHeight: number, phoneHeight: number) => ({
  desktop: {
    full: { src: `/work/${slug}/desktop-full.jpg`, width: 1440, height: desktopHeight },
    poster: desktopPoster(slug),
  },
  phone: {
    full: { src: `/work/${slug}/phone-full.jpg`, width: 460, height: phoneHeight },
    poster: { src: `/work/${slug}/phone-poster.jpg`, width: 460, height: 995 },
  },
});

export const projects: Project[] = [
  {
    slug: 'thread-and-form',
    title: 'Thread & Form',
    medium: 'WordPress block theme',
    year: 2026,
    classification: 'concept',
    provenance: 'Concept build for a fictional fashion label',
    summary:
      'A storefront theme for a fashion atelier: collection grid, lookbook, journal and newsletter sign-up, all editable in the WordPress Site Editor without a page builder.',
    liveUrl: 'https://saucescode.github.io/thread-and-form/',
    repoUrl: 'https://github.com/SaucesCode/thread-and-form',
    poster: desktopPoster('thread-and-form'),
    captures: captures('thread-and-form', 7774, 16025),
  },
  {
    slug: 'kinetix-athletics',
    title: 'Kinetix Athletics',
    medium: 'WordPress theme for an online store',
    year: 2026,
    classification: 'concept',
    provenance: 'Concept build for a fictional activewear brand',
    summary:
      'An activewear store theme with a filterable product catalogue, size selection on product cards, collection pages and a lookbook.',
    liveUrl: 'https://saucescode.github.io/kinetix-athletics-theme/',
    repoUrl: 'https://github.com/SaucesCode/kinetix-athletics-theme',
    poster: desktopPoster('kinetix-athletics'),
    captures: captures('kinetix-athletics', 4873, 13545),
    brand: {
      ground: '#0a1424',
      surface: '#0e1c31',
      ink: '#f8fafc',
      muted: '#94a3b8',
      accent: '#38bdf8',
      displayFont: '--font-jakarta',
    },
  },
  {
    slug: 'valence-capital',
    title: 'Valence Capital',
    medium: 'Landing page',
    year: 2026,
    classification: 'concept',
    provenance: 'Concept build for a fictional finance company',
    summary:
      'A landing page for a corporate treasury product, with an interactive company card, a yield calculator and a side-by-side plan comparison.',
    liveUrl: 'https://saucescode.github.io/valence-capital-landing-page/',
    repoUrl: 'https://github.com/SaucesCode/valence-capital-landing-page',
    poster: desktopPoster('valence-capital'),
    captures: captures('valence-capital', 7220, 12428),
    brand: {
      ground: '#090a0d',
      surface: '#0e1015',
      ink: '#f8fafc',
      muted: '#b8aba0',
      accent: '#d4b996',
      displayFont: '--font-newsreader',
    },
  },
  {
    slug: 'nexus-ai',
    title: 'Nexus AI',
    medium: 'Landing page',
    year: 2026,
    classification: 'concept',
    provenance: 'Concept build for a fictional software company',
    summary:
      'A product landing page for a developer platform, with a simulated prompt playground and a pricing calculator.',
    liveUrl: 'https://saucescode.github.io/nexus-ai-landing-page/',
    repoUrl: 'https://github.com/SaucesCode/nexus-ai-landing-page',
    poster: desktopPoster('nexus-ai'),
  },
  {
    slug: 'quickaid',
    title: 'QuickAid',
    medium: 'Web application',
    year: 2025,
    classification: 'personal',
    provenance: 'Personal project',
    summary:
      'An applicant management system for a social assistance programme: public application form, staff dashboard, applicant map and printable reports.',
    liveUrl: 'https://quick-aid-geomappingv1.vercel.app/',
    repoUrl: 'https://github.com/SaucesCode/QuickAid-Geomapping',
    poster: desktopPoster('quickaid'),
  },
  {
    slug: 'rowszeins-delight',
    title: 'Rowszein’s Delight',
    medium: 'Website and business system',
    year: 2026,
    classification: 'personal',
    provenance: 'Personal project, still in development',
    summary:
      'A menu and ordering site for a dessert shop. The management side for products, recipes, sales and expenses is being built next.',
    liveUrl: 'https://rowszeins-s-delight.vercel.app/',
    repoUrl: 'https://github.com/SaucesCode/Rowszein-s-Delight',
    poster: desktopPoster('rowszeins-delight'),
  },
  {
    slug: 'portfolio-cms',
    title: 'Portfolio and CMS',
    medium: 'Website with a private admin panel',
    year: 2026,
    classification: 'personal',
    provenance: 'Personal project',
    summary:
      'My previous portfolio, with an admin panel for editing projects, blog posts and work history, backed by its own database.',
    liveUrl: 'https://jamespatrickdemesa.vercel.app/',
    repoUrl: 'https://github.com/SaucesCode/portfolio-cms',
    poster: desktopPoster('portfolio-cms'),
  },
];

export const getProject = (slug: string): Project => {
  const project = projects.find((p) => p.slug === slug);
  if (!project) throw new Error(`Unknown project: ${slug}`);
  return project;
};

/** Homepage placement: one featured piece, two supporting pieces, the rest in the collection. */
export const featured = getProject('thread-and-form');
export const supporting = [getProject('kinetix-athletics'), getProject('valence-capital')] as const;
export const collection = projects.filter((p) => p !== featured && !supporting.includes(p));
