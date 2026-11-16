export interface Service {
  id: string;
  name: string;
  description: string;
  /** Slugs of projects on the homepage that show this kind of work. */
  examples: [string, string];
  /** The stretch of the stack this service covers, as indexes into `stackStops`. */
  span: [number, number];
  /** Starting price in US dollars for a typical small project; unset when it is quoted per scope. */
  fromUsd?: number;
}

/** The layers of a product, from what is stored to what is seen. */
export const stackStops = ['Data', 'Logic', 'Interface', 'Design'] as const;

export const services: Service[] = [
  {
    id: 'applications',
    name: 'Web applications and business systems',
    description:
      'Tools built around how your team actually works: records, approvals, inventory, dashboards and reports, with roles and logins where they matter.',
    examples: ['rowszeins-delight', 'quickaid'],
    span: [0, 2],
    fromUsd: 3500,
  },
  {
    id: 'backend',
    name: 'APIs, databases and integrations',
    description:
      'REST APIs, PostgreSQL data models, authentication and exports, so the numbers on screen come from one reliable source.',
    examples: ['rowszeins-delight', 'portfolio-cms'],
    span: [0, 1],
  },
  {
    id: 'wordpress',
    name: 'WordPress sites and custom themes',
    description:
      'Block themes your team edits in the WordPress Site Editor, with no page builder and no pile of plugins to keep updated.',
    examples: ['thread-and-form', 'kinetix-athletics'],
    span: [1, 3],
    fromUsd: 1200,
  },
  {
    id: 'websites',
    name: 'Websites, stores and landing pages',
    description:
      'Marketing sites, product pages and campaign pages designed and built by the same person, so what launches is what you approved.',
    examples: ['valence-capital', 'nexus-ai'],
    span: [2, 3],
    fromUsd: 500,
  },
];
