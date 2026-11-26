/**
 * One question followed through the site's assistant, for the case study of this site. Every
 * sentence describes what src/app/api/ask and src/lib/ask actually do; limit numbers and internal
 * names are left out on purpose.
 */
export type Part = 'browser' | 'server' | 'counters' | 'model' | 'page';

export interface QuestionStep {
  title: string;
  body: string;
  parts: Part[];
}

export const partLabels: Record<Part, string> = {
  browser: 'The visitor’s browser',
  server: 'This site’s server',
  counters: 'The counter store',
  model: 'The AI model',
  page: 'The page',
};

/** The drawing's order: where a question starts, the server in the middle, and where the answer lands. */
export const partOrder: Part[] = ['browser', 'server', 'counters', 'model', 'page'];

export const questionSteps: QuestionStep[] = [
  {
    title: 'Asked in the browser',
    body: 'The question, up to 300 characters, and the last few turns of the conversation go to this site’s own server. The browser never talks to the AI directly, and the AI key never reaches it.',
    parts: ['browser'],
  },
  {
    title: 'Is it from this site?',
    body: 'The server checks that the request came from this site’s own pages. Requests from anywhere else are refused before anything else runs, so another website’s pages cannot call it.',
    parts: ['server'],
  },
  {
    title: 'Within the limits?',
    body: 'Each visitor has a short-term and a daily allowance, and the site has one for the day. One round trip to the counter store checks and counts them all. A visitor over their own limit stops there, and never uses up anyone else’s share.',
    parts: ['server', 'counters'],
  },
  {
    title: 'Answered from the site only',
    body: 'The model receives the site’s own content and strict rules: never state a price, never claim client work, speak about James in the third person, answer in the visitor’s language. A fast model answers; a second steps in if the first is overloaded, returns no answer or is still silent after 3.5 seconds, and both share one time limit.',
    parts: ['server', 'model'],
  },
  {
    title: 'Checked before it is shown',
    body: 'The answer has to come back as structured data: the text, and at most two suggested actions. Each action is checked against the site’s real sections, demos and projects, and anything else is dropped, so a visitor is never sent somewhere that does not exist.',
    parts: ['server'],
  },
  {
    title: 'The page acts',
    body: 'The visitor sees the answer, with buttons that scroll to a section, open a project, bring up a live demo or start the project form with a first line already written.',
    parts: ['page'],
  },
];
