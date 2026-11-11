export type Classification = 'client' | 'personal' | 'concept' | 'prototype';

export type Category = 'software' | 'web' | 'experiments';

export const categoryLabels: Record<Category, string> = {
  software: 'Software & Systems',
  web: 'Web & Commerce',
  experiments: 'Experiments & Other',
};

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

export interface WalkthroughStep {
  shot: Shot;
  title: string;
  /** One plain sentence for a non-technical reader. */
  body: string;
  /** Optional technical note, verified against the source code. */
  detail: string;
  /** Where the camera settles, as percentages of the screenshot, and how far it zooms in. */
  focus: { x: number; y: number; zoom: number };
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

export interface ProjectLink {
  href: string;
  label: string;
}

export interface Project {
  slug: string;
  title: string;
  category: Category;
  /** Plain-language description of what it is, shown like the "medium" line of a gallery label. */
  medium: string;
  year: number;
  classification: Classification;
  /** One honest line explaining where the project comes from. */
  provenance: string;
  summary: string;
  /** Anything a visitor should know about what the screenshots do or do not show. */
  note?: string;
  links: ProjectLink[];
  poster: Shot;
  /** Posters that are not 16:10 are matted instead of cropped. */
  posterFit?: 'cover' | 'contain';
  captures?: { desktop: FullLengthCapture; phone: FullLengthCapture };
  walkthrough?: WalkthroughStep[];
  brand?: BrandTheme;
  /** Path of the project's case study page, for the projects that have one. */
  caseStudy?: string;
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

const appShot = (name: string): Shot => ({ src: `/work/rowszeins-delight/app-${name}.jpg`, width: 1440, height: 900 });

const github = (repo: string): ProjectLink => ({ href: `https://github.com/SaucesCode/${repo}`, label: 'View the code' });

export const projects: Project[] = [
  {
    slug: 'rowszeins-delight',
    title: 'Rowszein’s Delight',
    category: 'software',
    medium: 'Business management system',
    year: 2026,
    classification: 'personal',
    provenance: 'Personal project, built for a dessert shop’s daily operations',
    summary:
      'An owner panel that tracks ingredients, recipes, sales and expenses, then turns them into stock alerts, production costs and profit per product.',
    note: 'The owner panel needs a login, so it is shown as a guided tour. The screens come from the real app running locally with demonstration data.',
    links: [
      { href: 'https://rowszeins-s-delight.vercel.app/', label: 'Visit the public shop' },
      github('Rowszein-s-Delight'),
    ],
    poster: appShot('recipes'),
    caseStudy: '/work/rowszeins-delight',
    walkthrough: [
      {
        shot: appShot('dashboard'),
        title: 'See the business at a glance',
        body: 'Sales, expenses, profit and low-stock warnings for any period, with the best sellers beside the trend.',
        detail:
          'A Django REST endpoint aggregates sales and expenses for the chosen period; the React front end draws the trends with Recharts.',
        focus: { x: 50, y: 30, zoom: 1.04 },
      },
      {
        shot: appShot('record-sale'),
        title: 'Record a sale in seconds',
        body: 'Add the products sold and the order total updates as you go.',
        detail:
          'Saving a sale deducts every ingredient from stock using each product’s recipe; editing or deleting a sale puts that stock back first. It all runs on the server, so stock and reports agree.',
        focus: { x: 66, y: 46, zoom: 1.32 },
      },
      {
        shot: appShot('inventory'),
        title: 'Know what is running low',
        body: 'Every ingredient shows its stock against a minimum, so reordering is never a guess.',
        detail:
          'An ingredient is flagged when its quantity reaches its minimum stock. Inventory value is quantity times cost per unit across the pantry.',
        focus: { x: 56, y: 58, zoom: 1.24 },
      },
      {
        shot: appShot('recipes'),
        title: 'Cost every recipe',
        body: 'Each product’s recipe turns ingredient prices into a batch cost and a cost per piece.',
        detail:
          'Batch cost is the sum of each ingredient’s quantity times its cost per unit; cost per piece divides that by the recipe’s yield.',
        focus: { x: 74, y: 58, zoom: 1.3 },
      },
      {
        shot: appShot('profit-margins'),
        title: 'See what each product earns',
        body: 'Selling price against production cost, with every margin rated good, fair or low.',
        detail: 'Margin is selling price minus cost per piece, divided by selling price, recalculated whenever a recipe or price changes.',
        focus: { x: 56, y: 60, zoom: 1.2 },
      },
    ],
  },
  {
    slug: 'thread-and-form',
    title: 'Thread & Form',
    category: 'web',
    medium: 'WordPress block theme',
    year: 2026,
    classification: 'concept',
    provenance: 'Concept build for a fictional fashion label',
    summary:
      'A storefront theme for a fashion atelier: collection grid, lookbook, journal and newsletter sign-up, all editable in the WordPress Site Editor without a page builder.',
    note: 'A section of placeholder press quotes is left out of this preview.',
    links: [{ href: 'https://saucescode.github.io/thread-and-form/', label: 'Visit the live site' }, github('thread-and-form')],
    poster: desktopPoster('thread-and-form'),
    captures: captures('thread-and-form', 7458, 15318),
    caseStudy: '/work/thread-and-form',
  },
  {
    slug: 'quickaid',
    title: 'QuickAid',
    category: 'software',
    medium: 'Applicant management system',
    year: 2025,
    classification: 'personal',
    provenance: 'Personal project',
    summary:
      'A system for a social assistance programme: online applications, approvals, payout batches, an applicant map and analytics for staff.',
    note: 'Staff tools sit behind a login; the public site is shown.',
    links: [{ href: 'https://quick-aid-geomappingv1.vercel.app/', label: 'Visit the public site' }, github('QuickAid-Geomapping')],
    poster: desktopPoster('quickaid'),
  },
  {
    slug: 'kinetix-athletics',
    title: 'Kinetix Athletics',
    category: 'web',
    medium: 'WordPress theme for an online store',
    year: 2026,
    classification: 'concept',
    provenance: 'Concept build for a fictional activewear brand',
    summary: 'An activewear store theme with a filterable product catalogue, size selection on product cards, collection pages and a lookbook.',
    note: 'Checkout and payment badges are part of the concept design, not a live store.',
    links: [{ href: 'https://saucescode.github.io/kinetix-athletics-theme/', label: 'Visit the live site' }, github('kinetix-athletics-theme')],
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
    slug: 'meetingmode',
    title: 'MeetingMode',
    category: 'experiments',
    medium: 'Browser extension',
    year: 2026,
    classification: 'personal',
    provenance: 'Personal project, published on Microsoft Edge Add-ons',
    summary: 'Masks financial figures, emails, API keys and chat messages on screen while you present or record, without clicking each one.',
    links: [
      {
        href: 'https://microsoftedge.microsoft.com/addons/detail/meetingmode-screen-shar/pnfahfnonohbgnbgdalegoicoldkbkno',
        label: 'Get it for Edge',
      },
      github('meeting-mode'),
    ],
    poster: { src: '/work/meetingmode/popup.jpg', width: 364, height: 520 },
    posterFit: 'contain',
  },
  {
    slug: 'valence-capital',
    title: 'Valence Capital',
    category: 'web',
    medium: 'Landing page',
    year: 2026,
    classification: 'concept',
    provenance: 'Concept build for a fictional finance company',
    summary: 'A landing page for a corporate treasury product, with an interactive company card, a yield calculator and a plan comparison.',
    note: 'Figures on the page are placeholders. Comparisons naming real banks are left out of this preview.',
    links: [
      { href: 'https://saucescode.github.io/valence-capital-landing-page/', label: 'Visit the live site' },
      github('valence-capital-landing-page'),
    ],
    poster: desktopPoster('valence-capital'),
    captures: captures('valence-capital', 6135, 10618),
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
    slug: 'portfolio-cms',
    title: 'Portfolio and CMS',
    category: 'software',
    medium: 'Website with a private admin panel',
    year: 2026,
    classification: 'personal',
    provenance: 'Personal project',
    summary: 'My previous portfolio, with its own admin panel for editing projects, posts and work history, backed by an Express API and PostgreSQL.',
    note: 'The admin panel sits behind a login; the public site is shown.',
    links: [{ href: 'https://jamespatrickdemesa.vercel.app/', label: 'Visit the live site' }, github('portfolio-cms')],
    poster: desktopPoster('portfolio-cms'),
  },
  {
    slug: 'nexus-ai',
    title: 'Nexus AI',
    category: 'web',
    medium: 'Landing page',
    year: 2026,
    classification: 'concept',
    provenance: 'Concept build for a fictional software company',
    summary: 'A product landing page for a developer platform, with a simulated prompt playground and a pricing calculator.',
    note: 'Figures, benchmarks and testimonials on the page are placeholders.',
    links: [{ href: 'https://saucescode.github.io/nexus-ai-landing-page/', label: 'Visit the live site' }, github('nexus-ai-landing-page')],
    poster: desktopPoster('nexus-ai'),
  },
  {
    slug: 'page-fishing',
    title: 'Page Fishing',
    category: 'experiments',
    medium: 'Browser extension',
    year: 2026,
    classification: 'personal',
    provenance: 'Personal project, published on Microsoft Edge Add-ons',
    summary: 'A small game that lets fish swim across any website you browse. Click one to cast, reel it in and keep it in your bucket.',
    links: [
      { href: 'https://microsoftedge.microsoft.com/addons/detail/page-fishing/ngmcajmjgbnbgdpgfjokjghhfjdhbjia', label: 'Get it for Edge' },
      github('page-fishing'),
    ],
    poster: desktopPoster('page-fishing'),
  },
];

export const getProject = (slug: string): Project => {
  const project = projects.find((p) => p.slug === slug);
  if (!project) throw new Error(`Unknown project: ${slug}`);
  return project;
};

/**
 * The one place that decides which projects lead the homepage: one piece of software and one
 * website. They own the hero and the featured showcases, so the Selected Work gallery leaves
 * them out and shows different work.
 */
export const heroProjects = {
  software: getProject('rowszeins-delight'),
  web: getProject('thread-and-form'),
} as const;

export const featuredSoftware = heroProjects.software;
export const featuredWebsite = heroProjects.web;

const heroSlugs = new Set(Object.values(heroProjects).map((project) => project.slug));

export const isHeroProject = (slug: string) => heroSlugs.has(slug);

/** Projects for the homepage's Selected Work gallery: everything except the hero pair. */
export const galleryProjects = projects.filter((project) => !isHeroProject(project.slug));

export type CaseStudyProject = Project & { caseStudy: string };

/** Projects with a case study page, in the order the pages link to each other. */
export const caseStudies = projects.filter((project): project is CaseStudyProject => Boolean(project.caseStudy));

export const getCaseStudy = (slug: string): CaseStudyProject => {
  const project = caseStudies.find((p) => p.slug === slug);
  if (!project) throw new Error(`No case study for: ${slug}`);
  return project;
};
