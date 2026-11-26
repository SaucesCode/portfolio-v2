import Image from 'next/image';
import Link from 'next/link';
import { AskButton } from '@/components/case/AskButton';
import { NextCase } from '@/components/case/NextCase';
import { QuestionTrace } from '@/components/case/QuestionTrace';
import { ButtonLink } from '@/components/ButtonLink';
import { Contact } from '@/components/Contact';
import { ExternalLink } from '@/components/ExternalLink';
import { getCaseStudy } from '@/data/projects';
import { caseStudyJsonLd, caseStudyMetadata, jsonLdScript } from '@/lib/case-study';
import styles from './this-site.module.css';

const project = getCaseStudy('this-site');

const copy = {
  title: 'This site: a portfolio that shows its work, with an AI assistant',
  description:
    'Case study: a Next.js portfolio with live software demos in the first screen, an AI assistant that answers only from the site, and a project form that works without a mail app.',
};

export const metadata = caseStudyMetadata(project, copy);

const jsonLd = caseStudyJsonLd(project, copy, { '@type': 'WebSite', url: project.links[0].href });

const facts = [
  { term: 'What it is', detail: project.provenance },
  { term: 'My part', detail: 'Design, copy, code and tests' },
  { term: 'Built with', detail: project.builtWith },
  { term: 'Where it stands', detail: 'Live on saucescode.xyz, updated November 2026' },
];

const features = [
  {
    title: 'Try the software in the first screen',
    body: 'Record a sale in a miniature of the Rowszein’s Delight owner panel, or restyle the Thread & Form storefront. Both run in the browser with sample data. On a phone, the dashboard opens full screen in the app’s own phone layout.',
    image: {
      src: '/work/this-site/phone-demo.jpg',
      width: 786,
      height: 1454,
      alt: 'The live demo full screen on a phone: the Rowszein’s Delight dashboard in one column after an Ube Cream sale, with the sale buttons docked at the bottom.',
    },
  },
  {
    title: 'Take the guided tour',
    body: 'Eight screens of the real owner panel, one at a time, captured from the app running with demonstration data.',
    image: { src: '/work/this-site/tour.jpg', width: 2880, height: 1800, alt: 'The guided tour on the homepage: the Rowszein’s Delight dashboard, step 1 of 8, “See the day at a glance”, with Previous and Next buttons.' },
  },
  {
    title: 'Ask about the work',
    body: 'Ask in plain words, in English or Tagalog. The answer comes only from what is on the site, with buttons that take you to the right section or project.',
    image: { src: '/work/this-site/assistant.jpg', width: 2880, height: 1800, alt: 'The “Ask about my work” panel: asked how long a WordPress site takes, it answers “usually 3 to 5 weeks, depending on the scope” and offers a button to show how working together goes.' },
  },
  {
    title: 'Start a project without a mail app',
    body: 'A short form that emails James with the visitor as the reply address. A half-written message survives closing the form or reloading the page, and if sending fails, the text stays and the address is one tap from being copied.',
    image: { src: '/work/this-site/form.jpg', width: 2880, height: 1800, alt: 'The “Start a project” form filled in with a fictional bakery owner’s request: a business system, needed in 1–3 months.' },
  },
];

const layers = [
  { name: 'Browser', detail: 'Static pages. The live demos run here, on sample data, and send nothing anywhere.' },
  { name: 'Vercel', detail: 'Serves the pages from its edge network and runs the two server routes.' },
  { name: 'Server routes', detail: 'One for questions and one for project messages. Each checks where a request came from, what it contains and whether it is within its limits.' },
  { name: 'Upstash Redis', detail: 'Keeps the counters behind those limits. Checking and counting take one round trip per request.' },
  { name: 'Gemini', detail: 'Writes the assistant’s answers from the site’s content. A second model steps in when the first is overloaded, returns no answer or is still silent after 3.5 seconds; the first answer wins.' },
  { name: 'Resend', detail: 'Delivers project messages to James’s inbox, with the visitor as the reply address.' },
];

const testing = [
  'More than 300 automated end-to-end tests run against the built site, in a desktop browser and a phone browser, before every release.',
  'During tests, small local stand-ins replace Gemini and Resend, so every failure (an overloaded model, an answer that is not valid, an email that is refused) is tested without calling either service.',
  'Every feature is read by a fresh reviewer before it ships, and the assistant is checked with real questions against the real model before each release. Real answers arrive in about two seconds.',
];

const limits = [
  'Answers arrive whole, not word by word.',
  'The assistant runs on a free tier with a daily allowance. On a very busy day it says so and offers James’s email instead.',
  'It knows only what is on this site, and declines questions about anything else.',
  'The project form needs its email service to be set up. When it is not, the form says so as soon as it opens and offers the address instead.',
  'Questions asked to the assistant are not kept, so there is no history of past questions to learn from.',
];

const sectionTitle = `${styles.narrow} text-[clamp(1.875rem,1.4rem+1.6vw,3rem)] leading-[1.02]`;

export default function ThisSiteCaseStudy() {
  return (
    <div className={styles.page}>
      <main id="main-content" className="pb-4">
        {/* Introduction ---------------------------------------------------- */}
        <header className="mx-auto max-w-[90rem] px-4 pt-8 sm:px-6 sm:pt-14 lg:px-10">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-2 text-[0.9375rem] text-graphite">
              <li>
                <Link href="/#work" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-ink hover:underline">
                  Work
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="font-medium text-ink">
                {project.title}
              </li>
            </ol>
          </nav>

          <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-7">
              <p className="text-[0.9375rem] font-medium text-signal">Case study, web and AI</p>
              <h1 className={`${styles.narrow} mt-3 text-[min(clamp(3.5rem,1.8rem+7vw,8.5rem),18vw)] leading-[0.88]`}>
                {project.title}
              </h1>
              <p className="mt-6 max-w-[36ch] text-[clamp(1.25rem,1.05rem+0.7vw,1.625rem)] leading-[1.3] font-medium tracking-[-0.01em]">
                A portfolio that shows its work: software you can use in the first screen, and an assistant that answers
                only from what is here.
              </p>
              <div className="mt-8">
                <AskButton />
              </div>
            </div>
            <dl className="grid content-end gap-x-6 gap-y-5 text-[0.9375rem] sm:grid-cols-2 lg:col-span-4 lg:col-start-9 lg:grid-cols-1">
              {facts.map((fact) => (
                <div key={fact.term} className="border-t border-rule pt-3">
                  <dt className="text-graphite">{fact.term}</dt>
                  <dd className="mt-1 font-medium">{fact.detail}</dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="mt-12 sm:mt-16">
            <div className={styles.frame}>
              <Image
                src="/work/this-site/demo.jpg"
                width={2880}
                height={1800}
                sizes="(min-width: 1440px) 1360px, 94vw"
                alt="The homepage’s first screen: the headline “Systems your business runs on. Websites it’s found by.”, and beside it a live Rowszein’s Delight dashboard after one Ube Cream sale, with the sale buttons underneath."
                preload
              />
            </div>
            <figcaption className="mt-4 max-w-[70ch] text-[0.9375rem] text-graphite">
              The first screen on a laptop, after recording one sale in the live demo.
            </figcaption>
          </figure>
        </header>

        {/* The problem ------------------------------------------------------ */}
        <section aria-labelledby="problem-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-12">
            <h2 id="problem-title" className={`${sectionTitle} lg:col-span-4`}>
              Show it, don’t list it
            </h2>
            <div className="max-w-[62ch] space-y-5 text-lg leading-relaxed lg:col-span-7 lg:col-start-6">
              <p>
                A portfolio usually tells a client what someone can build. James wanted this one to show it. In his words:
              </p>
              <blockquote className={styles.quote}>
                <p>
                  This is what I can build, especially with AI. I want to show people what I can build and what else I can
                  do, and show it already with this portfolio.
                </p>
              </blockquote>
              <p>
                So the first screen holds working software instead of a screenshot, the assistant answers questions about
                the work without inventing prices or clients, and getting in touch works on a laptop with no mail app set
                up. Each is a small system of its own, and each is something a client might want on their own site.
              </p>
            </div>
          </div>
        </section>

        {/* What a visitor can do -------------------------------------------- */}
        <section aria-labelledby="features-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <h2 id="features-title" className={sectionTitle}>
            What a visitor can do
          </h2>
          <ol className={styles.features}>
            {features.map((feature, i) => (
              <li key={feature.title} className={styles.feature}>
                <div className={styles.featureText}>
                  <span className={styles.featureIndex} aria-hidden>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className={`${styles.narrow} text-2xl leading-tight`}>{feature.title}</h3>
                  <p className="mt-3 max-w-[52ch] leading-relaxed">{feature.body}</p>
                </div>
                {/* A phone capture stays phone-sized beside its text instead of filling the column. */}
                <div className={styles.frame} data-shape={feature.image.height > feature.image.width ? 'phone' : 'wide'}>
                  <Image
                    src={feature.image.src}
                    width={feature.image.width}
                    height={feature.image.height}
                    sizes={feature.image.height > feature.image.width ? '18rem' : '(min-width: 1024px) 58vw, 94vw'}
                    alt={feature.image.alt}
                    loading="lazy"
                  />
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* One question, followed ------------------------------------------- */}
        <section
          aria-labelledby="trace-title"
          className="mt-24 bg-ink py-20 text-wall sm:mt-36 sm:py-28 [&_:focus-visible]:outline-wall"
        >
          <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
            <div className="max-w-[60ch]">
              <h2 id="trace-title" className={sectionTitle}>
                Following one question through the assistant
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-[color-mix(in_srgb,var(--wall)_78%,transparent)]">
                An assistant on a public site has two jobs: be useful, and be impossible to turn into something else. A
                question passes through five parts before its answer appears. Each has one job, and the server can say no at three of them.
              </p>
            </div>
            <QuestionTrace />
          </div>
        </section>

        {/* Architecture ----------------------------------------------------- */}
        <section aria-labelledby="architecture-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <h2 id="architecture-title" className={sectionTitle}>
            How it is put together
          </h2>
          <ol className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {layers.map((layer, i) => (
              <li key={layer.name} className="border-t-2 border-ink pt-4">
                <p className={`${styles.narrow} text-xl`}>
                  <span className="sr-only">{i + 1}. </span>
                  {layer.name}
                </p>
                <p className="mt-2 max-w-[40ch] text-[0.9375rem] leading-relaxed text-graphite">{layer.detail}</p>
              </li>
            ))}
          </ol>
          <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-5">
              <h3 className={`${styles.narrow} text-2xl`}>Pages that are already built</h3>
              <p className="mt-4 max-w-[56ch] leading-relaxed">
                Every page is built ahead of time and served as a file, so it loads fast. Apart from resizing images, only
                the two server routes run code, and only when someone uses them.
              </p>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <h3 className={`${styles.narrow} text-2xl`}>Readable by people, search engines and AI</h3>
              <p className="mt-4 max-w-[56ch] leading-relaxed">
                Each page describes itself in structured data, and a plain-text map of the site at{' '}
                <a href="/llms.txt" className="underline underline-offset-4">
                  /llms.txt
                </a>{' '}
                is written for language models. The assistant reads that same summary, so it knows only what the site says.
              </p>
            </div>
          </div>
        </section>

        {/* Testing and limits ------------------------------------------------ */}
        <section aria-labelledby="testing-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
            <h2 id="testing-title" className={`${sectionTitle} lg:col-span-4`}>
              How it is tested
            </h2>
            <ul className="max-w-[64ch] space-y-4 leading-relaxed lg:col-span-7 lg:col-start-6">
              {testing.map((line) => (
                <li key={line} className="border-t border-rule pt-4">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="limits-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
            <h2 id="limits-title" className={`${sectionTitle} lg:col-span-4`}>
              What it does not do yet
            </h2>
            <ul className="max-w-[64ch] space-y-4 leading-relaxed lg:col-span-7 lg:col-start-6">
              {limits.map((limit) => (
                <li key={limit} className="border-t border-rule pt-4">
                  {limit}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4 lg:pl-[calc((100%+1.5rem)*5/12)]">
            <ButtonLink href={project.links[0].href} icon="right">
              {project.links[0].label}
            </ButtonLink>
            {project.links.slice(1).map((link) => (
              <ExternalLink key={link.href} href={link.href}>
                {link.label} on GitHub
              </ExternalLink>
            ))}
          </div>
        </section>

        <NextCase current={project.slug} />
      </main>
      <Contact
        headline={['Want an assistant', 'like this on', 'your site?']}
        lede="An assistant that answers from your own content, a form that keeps a half-written message, or a demo people can use before they call. A few sentences is enough to start."
        action="Email me about a site like this"
        subject="A site like this one"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
    </div>
  );
}
