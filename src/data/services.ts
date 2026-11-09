export interface Service {
  id: string;
  name: string;
  description: string;
  /** Slugs of projects on the homepage that show this kind of work. */
  examples: [string, string];
}

export const services: Service[] = [
  {
    id: 'applications',
    name: 'Web applications and business systems',
    description:
      'Tools built around how your team actually works: records, approvals, inventory, dashboards and reports, with roles and logins where they matter.',
    examples: ['rowszeins-delight', 'quickaid'],
  },
  {
    id: 'backend',
    name: 'APIs, databases and integrations',
    description:
      'REST APIs, PostgreSQL data models, authentication and exports, so the numbers on screen come from one reliable source.',
    examples: ['rowszeins-delight', 'portfolio-cms'],
  },
  {
    id: 'wordpress',
    name: 'WordPress sites and custom themes',
    description:
      'Block themes your team edits in the WordPress Site Editor, with no page builder and no pile of plugins to keep updated.',
    examples: ['thread-and-form', 'kinetix-athletics'],
  },
  {
    id: 'websites',
    name: 'Websites, stores and landing pages',
    description:
      'Marketing sites, product pages and campaign pages designed and built by the same person, so what launches is what you approved.',
    examples: ['valence-capital', 'nexus-ai'],
  },
];
