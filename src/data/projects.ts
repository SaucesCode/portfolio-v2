export interface Project {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  serviceCategory: 'wordpress' | 'fullstack' | 'ecommerce';
  verifiedRepoUrl: string;
  summary: string;
  clientBenefit: string;
  stack: string[];
  finishedDetails: {
    heroTitle: string;
    heroSubtitle: string;
    priceSample: string;
    lookbookCaption: string;
    features: string[];
  };
  behindTheBuild: {
    headline: string;
    architectureSummary: string;
    codeFilename: string;
    codeLanguage: string;
    codeSnippet: string;
    verifiedCapabilities: {
      label: string;
      value: string;
    }[];
  };
}

export const featuredProject: Project = {
  slug: 'thread-and-form',
  title: 'Thread & Form',
  subtitle: 'Luxury Fashion & Apparel Block Theme',
  category: 'WordPress 6.7+ Full Site Editing (FSE)',
  serviceCategory: 'wordpress',
  verifiedRepoUrl: 'https://github.com/SaucesCode/thread-and-form',
  summary:
    'A bespoke WordPress Full Site Editing block theme designed for luxury boutique apparel brands and editorial fashion publications. Built natively on Gutenberg block architecture with clean theme.json design tokens, eliminating third-party page builders and plugin bloat.',
  clientBenefit:
    'Gives non-technical store owners and editorial teams 100% visual control in the WordPress Site Editor without touching code, while keeping page weight exceptionally lightweight.',
  stack: ['WordPress 6.7+', 'PHP 8.3', 'Full Site Editing (FSE)', 'Gutenberg Block API', 'CSS Custom Properties'],
  finishedDetails: {
    heroTitle: 'THREAD & FORM — AUTUMN / WINTER EDITORIAL',
    heroSubtitle: 'Minimalist silhouettes and bespoke tailoring for modern wardrobes.',
    priceSample: '$480 USD • In Stock',
    lookbookCaption: 'Bespoke Editorial Lookbook Grid',
    features: [
      '100% Native Gutenberg Block Patterns',
      'Editorial Full-Width & Asymmetric Grids',
      'Fluid Typography Scaling (Mobile to 4K)',
      'Zero Third-Party Plugin Lock-In',
    ],
  },
  behindTheBuild: {
    headline: 'Native Full Site Editing Architecture',
    architectureSummary:
      'Engineered with WordPress Core theme.json v3 specification, replacing fragile shortcodes with structured design tokens and semantic HTML block templates.',
    codeFilename: 'theme.json (Design System Tokens)',
    codeLanguage: 'json',
    codeSnippet: `{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 3,
  "settings": {
    "appearanceTools": true,
    "color": {
      "palette": [
        { "slug": "linen-base", "color": "#fbf9f5", "name": "Linen Base" },
        { "slug": "charcoal-text", "color": "#161614", "name": "Deep Charcoal" },
        { "slug": "terracotta-accent", "color": "#b84218", "name": "Terracotta Craft" }
      ]
    },
    "typography": {
      "fluid": true,
      "fontFamilies": [
        { "fontFamily": "Newsreader, Georgia, serif", "slug": "editorial-serif" },
        { "fontFamily": "Geist Sans, -apple-system, sans-serif", "slug": "primary-sans" }
      ]
    },
    "layout": {
      "contentSize": "1280px",
      "wideSize": "1440px"
    }
  }
}`,
    verifiedCapabilities: [
      { label: 'Theme Architecture', value: 'WordPress 6.7+ Full Site Editing (FSE)' },
      { label: 'Server Runtime', value: 'PHP 8.3 Compatibility' },
      { label: 'External Plugin Dependencies', value: '0 Required Plugins' },
      { label: 'Editorial Control', value: '100% Gutenberg Block Patterns' },
    ],
  },
};
