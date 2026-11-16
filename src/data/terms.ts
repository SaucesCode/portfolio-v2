import { services } from './services';

export interface Term {
  id: 'pricing' | 'timeline' | 'timezones' | 'after-launch' | 'payment';
  title: string;
  body: string;
}

export const formatUsd = (amount: number) => `US$${amount.toLocaleString('en-US')}`;

/** The starting price of a service, so the copy below can never disagree with the price list. */
const from = (serviceId: string) => {
  const price = services.find((service) => service.id === serviceId)?.fromUsd;
  if (!price) throw new Error(`Service ${serviceId} has no starting price`);
  return formatUsd(price);
};

/** How working together goes, in the owner's approved words. Read by the homepage, llms.txt and the assistant. */
export const terms: Term[] = [
  {
    id: 'pricing',
    title: 'How pricing works',
    body: `Every project gets a fixed price, agreed before work starts, after a short call about what you need. As a guide, landing pages start at ${from('websites')}, WordPress sites at ${from('wordpress')}, and custom web apps and business systems at ${from('applications')}. Based in the Philippines? Ask for a local quote.`,
  },
  {
    id: 'timeline',
    title: 'How long it takes',
    body: 'A landing page usually takes 1–2 weeks, a WordPress site 3–5 weeks, and a business system 6–12 weeks, depending on scope.',
  },
  {
    id: 'timezones',
    title: 'Working across time zones',
    body: 'I’m in the Philippines (UTC+8) and work with clients anywhere. You get at least 3–4 hours of overlap every working day for calls, written progress updates twice a week, and a reply within one business day.',
  },
  {
    id: 'after-launch',
    title: 'After launch',
    body: 'Anything that breaks in the first 30 days is fixed free. After that, you can keep me on a monthly care plan for updates and small changes, or ask for work only when you need it. Either way, the code lives on your own GitHub, with a short guide to running it.',
  },
  {
    id: 'payment',
    title: 'Payment',
    body: '50% to start and 50% at launch. Business systems are split into three milestones.',
  },
];
