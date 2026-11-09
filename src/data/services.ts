export interface Service {
  id: string;
  name: string;
  description: string;
  /** Slugs of projects on the homepage that show this kind of work. */
  examples: [string, string];
}

export const services: Service[] = [
  {
    id: 'wordpress',
    name: 'WordPress websites and themes',
    description:
      'Custom block themes your team edits in the WordPress Site Editor, with no page builder and no pile of plugins to keep updated.',
    examples: ['thread-and-form', 'kinetix-athletics'],
  },
  {
    id: 'design',
    name: 'Website design and redesigns',
    description:
      'Marketing sites and landing pages designed and built by the same person, so the site that launches is the one you approved.',
    examples: ['valence-capital', 'nexus-ai'],
  },
  {
    id: 'commerce',
    name: 'Online stores and product pages',
    description:
      'Catalogues, product pages and campaign pages that load quickly and make the next step obvious on a phone.',
    examples: ['kinetix-athletics', 'rowszeins-delight'],
  },
  {
    id: 'systems',
    name: 'Web apps and business systems',
    description:
      'Custom tools for running a business: records, dashboards, forms and reports, with a proper database behind them.',
    examples: ['quickaid', 'portfolio-cms'],
  },
];
