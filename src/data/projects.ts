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
  /** How much room the gallery gives it: a full card (the default) or a line in "More experiments". */
  tier?: 'card' | 'list';
  /** What it is built with, as its case study states it; every case study needs one. */
  builtWith?: string;
  /** Path of the project's case study page, for the projects that have one. */
  caseStudy?: string;
  /** When the case study was first published and last meaningfully changed (YYYY-MM-DD). */
  caseStudyDates?: { published: string; updated: string };
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

/** A Rowszein's Delight owner screen, captured at 2x from a 1440 x 900 window. */
export const rowszeinScreen = (name: string): Shot => ({ src: `/work/rowszeins-delight/app-${name}.jpg`, width: 2880, height: 1800 });

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
      'An online shop and owner panel for a dessert shop: customers order boxes for delivery or a meet-up, and the owner runs orders, sales, stock, recipes, partners and profit in one place.',
    note: 'The owner panel needs a login, so it is shown as a guided tour. The screens come from the version published on 16 Nov 2026, running locally with fictional demonstration data.',
    links: [
      { href: 'https://rowszein-s-delight.vercel.app/', label: 'Visit the public shop' },
      github('Rowszein-s-Delight'),
    ],
    poster: rowszeinScreen('recipes'),
    builtWith: 'React, TypeScript and Vite; Django REST Framework; PostgreSQL',
    caseStudy: '/work/rowszeins-delight',
    caseStudyDates: { published: '2026-11-11', updated: '2026-11-16' },
    walkthrough: [
      {
        shot: rowszeinScreen('dashboard'),
        title: 'See the day at a glance',
        body: 'Today’s sales, new orders waiting for a reply, the latest sales and anything running low, on one screen.',
        detail:
          'A Django REST endpoint totals net sales, partner payouts and expenses for the chosen period; the React front end draws the trends with Recharts.',
        focus: { x: 45, y: 42, zoom: 1.08 },
      },
      {
        shot: rowszeinScreen('order-detail'),
        title: 'Take orders online',
        body: 'Customers fill a box or pick donuts in the shop, choose delivery or a meet-up, and the order waits here for a yes or no.',
        detail:
          'Confirming runs the same sale service as the till, with an idempotency key fixed per order, so a repeated confirm can never record a second sale. Declining sends the customer a short reason on their order page.',
        focus: { x: 74, y: 77, zoom: 1.14 },
      },
      {
        shot: rowszeinScreen('record-sale'),
        title: 'Record a sale in seconds',
        body: 'Tap donuts or add a box; prices come from the collection and the total updates as you go.',
        detail:
          'Saving a sale takes every ingredient out of stock using each product’s recipe, in one database transaction. Editing or cancelling a sale reverses what it used and posts an adjustment, so stock and reports agree.',
        focus: { x: 62, y: 52, zoom: 1.2 },
      },
      {
        shot: rowszeinScreen('inventory'),
        title: 'Know what is running low',
        body: 'Every ingredient shows its stock against a restock level, so reordering is never a guess.',
        detail:
          'An ingredient is flagged when its quantity reaches its minimum. Deliveries and spoilage are recorded as stock adjustments with a reason, never by overwriting the number.',
        focus: { x: 66, y: 55, zoom: 1.2 },
      },
      {
        shot: rowszeinScreen('recipes'),
        title: 'Cost every recipe',
        body: 'Each donut’s recipe turns ingredient prices into a cost per piece and what the shop keeps.',
        detail:
          'Batch cost is the sum of each ingredient’s quantity times its cost per unit; cost per piece divides that by the recipe’s yield.',
        focus: { x: 62, y: 62, zoom: 1.18 },
      },
      {
        shot: rowszeinScreen('analytics'),
        title: 'See what the shop keeps',
        body: 'Sales, what is owed to partners and what was spent, for any period, with best sellers and what each donut earns.',
        detail:
          'Profit is net sales minus partner payouts and expenses. Sold counts include cancellations and changes on the day they were made, so an edit never rewrites an earlier day.',
        focus: { x: 40, y: 36, zoom: 1.12 },
      },
      {
        shot: rowszeinScreen('boxes'),
        title: 'Sell boxes and partner items',
        body: 'Set box sizes and ready-made boxes, and sell a partner bakery’s items at their price plus the shop’s margin.',
        detail:
          'A box fills evenly between the flavours a customer picks, up to its flavour limit. Partner items carry their own payout, and what is owed is totalled per period.',
        focus: { x: 56, y: 44, zoom: 1.12 },
      },
      {
        shot: rowszeinScreen('settings'),
        title: 'Run the shop from one page',
        body: 'Delivery hours, towns and fees, meet-up places, notices and a pause switch, changed without touching code.',
        detail: 'Shop settings are one revisioned record; customers see a change the next time they open the shop.',
        focus: { x: 60, y: 45, zoom: 1.12 },
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
    builtWith: 'WordPress block theme with theme.json v3, PHP, Tailwind CSS v4 and plain JavaScript',
    caseStudy: '/work/thread-and-form',
    caseStudyDates: { published: '2026-11-11', updated: '2026-11-16' },
  },
  {
    slug: 'quickaid',
    title: 'QuickAid',
    category: 'software',
    medium: 'Applicant management system',
    year: 2025,
    classification: 'personal',
    provenance: 'Personal project, built with one other contributor',
    summary:
      'A system for a social assistance programme: online applications, approvals, payout batches, an applicant map and analytics for staff.',
    note: 'Staff tools sit behind a login; the public site is shown.',
    links: [{ href: 'https://quick-aid-geomappingv1.vercel.app/', label: 'Visit the public site' }, github('QuickAid-Geomapping')],
    builtWith: 'React 19, Leaflet, TanStack Query and Recharts; Django REST Framework; PostgreSQL',
    caseStudy: '/work/quickaid',
    caseStudyDates: { published: '2026-11-16', updated: '2026-11-16' },
    poster: desktopPoster('quickaid'),
  },
  {
    slug: 'this-site',
    title: 'This site',
    category: 'web',
    medium: 'Portfolio website with an AI assistant',
    year: 2026,
    classification: 'personal',
    provenance: 'Personal project',
    summary:
      'This portfolio: live demos in the first screen, a guided tour, an assistant that answers only from the site, and a project form that works without a mail app.',
    links: [{ href: 'https://www.saucescode.xyz/', label: 'Visit the live site' }, github('portfolio-v2')],
    poster: desktopPoster('this-site'),
    builtWith: 'Next.js 16, React 19 and TypeScript; Upstash Redis, Gemini and Resend; hosted on Vercel',
    caseStudy: '/work/this-site',
    caseStudyDates: { published: '2026-11-17', updated: '2026-11-17' },
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
    tier: 'list',
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
    tier: 'list',
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
    tier: 'list',
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

export const galleryCards = galleryProjects.filter((project) => project.tier !== 'list');
export const moreExperiments = galleryProjects.filter((project) => project.tier === 'list');

export type CaseStudyProject = Project & Required<Pick<Project, 'caseStudy' | 'caseStudyDates' | 'builtWith'>>;

/** Projects with a case study page, in the order the pages link to each other. */
export const caseStudies = projects.filter((project): project is CaseStudyProject => {
  if (!project.caseStudy) return false;
  if (!project.caseStudyDates) throw new Error(`Case study for ${project.slug} needs caseStudyDates`);
  if (!project.builtWith) throw new Error(`Case study for ${project.slug} needs builtWith`);
  return true;
});

export const getCaseStudy = (slug: string): CaseStudyProject => {
  const project = caseStudies.find((p) => p.slug === slug);
  if (!project) throw new Error(`No case study for: ${slug}`);
  return project;
};
