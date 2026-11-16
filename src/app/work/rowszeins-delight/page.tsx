import Image from 'next/image';
import Link from 'next/link';
import { NextCase } from '@/components/case/NextCase';
import { SaleTrace } from '@/components/case/SaleTrace';
import { ButtonLink } from '@/components/ButtonLink';
import { Contact } from '@/components/Contact';
import { ExternalLink } from '@/components/ExternalLink';
import { Morph, morphName } from '@/components/Morph';
import { getCaseStudy, rowszeinScreen, type WalkthroughStep } from '@/data/projects';
import { caseStudyJsonLd, caseStudyMetadata, jsonLdScript } from '@/lib/case-study';

const project = getCaseStudy('rowszeins-delight');
// The dashboard opens the page; the rest of the routine follows in the workflow section, grouped
// the way the owner uses it: selling, stock, costing and money.
const [hero, recordSale, inventory, recipes, margins] = project.walkthrough ?? [];

type Screen = Pick<WalkthroughStep, 'shot' | 'title' | 'body' | 'detail'>;

const salesList: Screen = {
  shot: rowszeinScreen('sales'),
  title: 'Review every sale',
  body: 'Sales are grouped by day with their items and totals, and can be searched and filtered by date.',
  detail:
    'The totals under the list come from the posted ledger entries. Gross sales, adjustments and cancellations are reported separately, so an edited sale never silently rewrites an earlier day.',
};

const expenses: Screen = {
  shot: rowszeinScreen('expenses'),
  title: 'Track where the money goes',
  body: 'Expenses by category and day, with search, date filters and export.',
  detail: 'Expenses export as CSV or PDF, and together with sales they feed the profit figures on the dashboard.',
};

const screens = [recordSale, salesList, inventory, recipes, margins, expenses].filter((screen): screen is Screen => Boolean(screen));

const copy = {
  title: 'Rowszein’s Delight: a business system for a dessert shop',
  description:
    'Case study: a Django REST and React system that links recipes to stock, so every recorded sale takes the right ingredients out of the pantry and every product knows its cost and margin.',
};

export const metadata = caseStudyMetadata(project, copy);

const jsonLd = caseStudyJsonLd(project, copy, {
  '@type': 'SoftwareApplication',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web browser',
});

const facts = [
  { term: 'What it is', detail: project.provenance },
  { term: 'My part', detail: 'Product design, front end, API and database' },
  { term: 'Built with', detail: 'React, TypeScript and Vite; Django REST Framework; PostgreSQL' },
  { term: 'Where it stands', detail: 'In active development, not yet production-ready' },
];

const layers = [
  {
    name: 'Browser',
    detail: 'React 19 single-page app built with Vite. TanStack Query caches server data; forms are validated with Zod.',
  },
  {
    name: 'Vercel',
    detail: 'Serves the app and the public shop, and forwards every /api request to the backend, so the browser only ever talks to one origin.',
  },
  {
    name: 'Render',
    detail: 'Django REST Framework, split into apps for accounts, ingredients, products, recipes, sales, expenses and the dashboard.',
  },
  { name: 'PostgreSQL', detail: 'The source of truth. Row locks and constraints do the work that must never be left to the browser.' },
];

const capabilities: { label: string; staff: boolean }[] = [
  { label: 'See products and stock levels', staff: true },
  { label: 'Record a sale', staff: true },
  { label: 'See past sales', staff: true },
  { label: 'Edit or cancel a sale', staff: false },
  { label: 'Export sales', staff: false },
  { label: 'See and change recipes and their costs', staff: false },
  { label: 'Change products and ingredients', staff: false },
  { label: 'Adjust stock by hand', staff: false },
  { label: 'Record expenses', staff: false },
  { label: 'See profit and finance reports', staff: false },
];

const limits = [
  'The project’s own documentation says it is not represented as secure or production-ready. Production deployment checks and several session and security findings are still open.',
  'The owner panel is built for desktop. Its mobile layout is planned but not done.',
  'Automated backend tests cover the sales and stock engine only. Accounts, products, recipes, expenses and the dashboard have none yet, and a full lint run still reports errors.',
  'The screenshots show the latest published version, running locally with fictional demonstration data. Newer interface work that has not been published is not shown.',
];

const sectionTitle = 'font-semiwide text-[clamp(1.75rem,1.4rem+1.2vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.025em]';

export default function RowszeinCaseStudy() {
  if (!hero) throw new Error('Rowszein’s Delight needs walkthrough screens.');

  return (
    <>
      <main id="main-content" className="pb-4">
        {/* Introduction ---------------------------------------------------- */}
        <header className="mx-auto max-w-[90rem] px-4 pt-8 sm:px-6 sm:pt-14 lg:px-10">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-2 text-[0.9375rem] text-graphite">
              <li>
                <Link href="/#featured" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-ink hover:underline">
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
            <div className="lg:col-span-8">
              <p className="text-[0.9375rem] font-medium text-signal">Case study, software</p>
              <h1 className="font-wide mt-3 text-[min(clamp(2.75rem,1.4rem+5.4vw,6.5rem),13vw)] leading-[0.92] font-medium tracking-[-0.045em]">
                {project.title}
              </h1>
              <p className="mt-6 max-w-[34ch] text-[clamp(1.25rem,1.05rem+0.7vw,1.625rem)] leading-[1.3] font-medium tracking-[-0.01em]">
                A business system for a dessert shop, where every sale takes the right amount of each ingredient out of
                stock and every product knows what it costs to make.
              </p>
            </div>
            <dl className="grid content-end gap-x-6 gap-y-5 text-[0.9375rem] sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
              {facts.map((fact) => (
                <div key={fact.term} className="border-t border-rule pt-3">
                  <dt className="text-graphite">{fact.term}</dt>
                  <dd className="mt-1 font-medium">{fact.detail}</dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="mt-12 sm:mt-16">
            <Morph name={morphName(project.slug)}>
              <div className="relative overflow-hidden rounded-[var(--radius-frame)] bg-chalk shadow-hang">
                <Image
                  src={hero.shot.src}
                  width={hero.shot.width}
                  height={hero.shot.height}
                  sizes="(min-width: 1440px) 1360px, 94vw"
                  alt="The Rowszein’s Delight business overview for the year: net sales, total expenses, net profit and low-stock count, a monthly trend chart, the top five products, and a warning that one ingredient is running low."
                  preload
                  className="block h-auto w-full"
                />
                <span className="absolute top-3 right-3 rounded-full bg-ink px-3 py-1 text-[0.8125rem] font-semibold text-wall">
                  Demonstration data
                </span>
              </div>
            </Morph>
            <figcaption className="mt-3 max-w-[70ch] text-[0.9375rem] text-graphite">
              The owner’s dashboard: {hero.body.charAt(0).toLowerCase() + hero.body.slice(1)} From the latest published
              version, running locally with fictional demonstration data.
            </figcaption>
          </figure>
        </header>

        {/* The problem ------------------------------------------------------ */}
        <section aria-labelledby="problem-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-12">
            <h2 id="problem-title" className={`${sectionTitle} lg:col-span-4`}>
              Flour by the kilo, cake by the slice
            </h2>
            <div className="max-w-[62ch] space-y-5 text-lg leading-relaxed lg:col-span-7 lg:col-start-6">
              <p>
                A dessert shop buys its ingredients by weight and sells its products by the piece. Between the two sits a
                recipe, and that is where the numbers usually get lost: how much stock is left after today’s orders, what
                one slice really costs to make, and which products earn their place on the menu.
              </p>
              <p>
                Rowszein’s Delight connects the three. A product has a recipe; a recipe lists its ingredients for one
                batch and how many pieces the batch yields; and a recorded sale works backwards through the recipe to take
                exactly what was used out of stock. Costs and margins come from the same numbers, so they cannot drift
                apart.
              </p>
            </div>
          </div>
        </section>

        {/* Workflows ------------------------------------------------------- */}
        <section aria-labelledby="workflows-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <h2 id="workflows-title" className={sectionTitle}>
            What the owner works with
          </h2>
          <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-graphite">
            Beyond the dashboard, six screens cover the daily routine: selling, stock, costing and money. The note
            under each one says what the code does behind it.
          </p>
          <div className="mt-12 grid gap-x-6 gap-y-16 lg:grid-cols-2 lg:gap-y-24">
            {screens.map((screen) => (
              <figure key={screen.shot.src}>
                <div className="overflow-hidden rounded-[var(--radius-frame)] shadow-hang">
                  <Image
                    src={screen.shot.src}
                    width={screen.shot.width}
                    height={screen.shot.height}
                    sizes="(min-width: 1024px) 46vw, 94vw"
                    alt={`${project.title}: ${screen.title.toLowerCase()}. ${screen.body}`}
                    loading="lazy"
                    className="block h-auto w-full"
                  />
                </div>
                <figcaption className="mt-5 max-w-[56ch]">
                  <h3 className="font-semiwide text-xl leading-tight font-semibold tracking-[-0.015em]">{screen.title}</h3>
                  <p className="mt-2 leading-relaxed">{screen.body}</p>
                  <p className="mt-3 border-l-2 border-signal pl-4 text-[0.9375rem] leading-relaxed text-graphite">
                    {screen.detail}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* One sale, traced ------------------------------------------------- */}
        <section
          aria-labelledby="trace-title"
          className="mt-24 bg-ink py-20 text-wall sm:mt-36 sm:py-28 [&_:focus-visible]:outline-wall"
        >
          <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
            <div className="max-w-[60ch]">
              <h2 id="trace-title" className={sectionTitle}>
                Following one sale through the system
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-[color-mix(in_srgb,var(--wall)_78%,transparent)]">
                Recording a sale is the one action that touches stock, money and history at the same time. A dropped
                connection, a double tap or two tills selling the last slice must not leave those three disagreeing. This
                is how the server makes sure they never do.
              </p>
            </div>
            <div className="mt-14 lg:mt-6">
              <SaleTrace />
            </div>
          </div>
        </section>

        {/* Architecture ----------------------------------------------------- */}
        <section aria-labelledby="architecture-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <h2 id="architecture-title" className={sectionTitle}>
            How it is put together
          </h2>
          <ol className="mt-10 grid gap-3 md:grid-cols-4 md:gap-0">
            {layers.map((layer, i) => (
              <li
                key={layer.name}
                className="relative border-t-2 border-ink pt-4 md:pr-6 [&:not(:last-child)]:pb-6 md:[&:not(:last-child)]:pb-0"
              >
                <p className="font-semiwide text-xl font-semibold tracking-[-0.015em]">
                  <span className="sr-only">{i + 1}. </span>
                  {layer.name}
                </p>
                <p className="mt-2 max-w-[38ch] text-[0.9375rem] leading-relaxed text-graphite">{layer.detail}</p>
              </li>
            ))}
          </ol>

          <div className="mt-20 grid gap-12 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-5">
              <h3 className="font-semiwide text-2xl leading-tight font-semibold tracking-[-0.02em]">Signing in</h3>
              <div className="mt-4 max-w-[56ch] space-y-4 leading-relaxed">
                <p>
                  Sessions are JSON Web Tokens kept in httpOnly cookies, so scripts on the page cannot read them, and
                  every cookie-authenticated request that changes data must carry a CSRF token.
                </p>
                <p>
                  Each signed-in device has its own server-side session record, and sign-in attempts are rate-limited.
                  The public shop reads the product catalogue without signing in.
                </p>
              </div>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <h3 className="font-semiwide text-2xl leading-tight font-semibold tracking-[-0.02em]">Who can do what</h3>
              <p className="mt-4 max-w-[56ch] leading-relaxed">
                Two roles, checked on the server for every request. Each API view declares the permission each action
                needs, and a view that declares nothing refuses everyone.
              </p>
              <table className="mt-6 w-full border-collapse text-left text-[0.9375rem]">
                <caption className="sr-only">Permissions by role</caption>
                <thead>
                  <tr className="border-b-2 border-ink">
                    <th scope="col" className="py-2 pr-4 font-semibold">
                      Action
                    </th>
                    <th scope="col" className="w-20 py-2 text-center font-semibold">
                      Staff
                    </th>
                    <th scope="col" className="w-20 py-2 text-center font-semibold">
                      Owner
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {capabilities.map((row) => (
                    <tr key={row.label} className="border-b border-rule">
                      <th scope="row" className="py-2.5 pr-4 font-normal">
                        {row.label}
                      </th>
                      <td className="py-2.5 text-center">{row.staff ? <Allowed /> : <Refused />}</td>
                      <td className="py-2.5 text-center">
                        <Allowed />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Testing and limits ------------------------------------------------ */}
        <section aria-labelledby="testing-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-6">
              <h2 id="testing-title" className={sectionTitle}>
                How it is tested
              </h2>
              <div className="mt-6 max-w-[58ch] space-y-4 text-lg leading-relaxed">
                <p>
                  The sales and stock engine has 120 automated backend tests. They cover the failures that matter most
                  for a shop: a sale that would overdraw stock, a retry after a dropped connection, an edit made from a
                  stale screen, two tills selling the last item at once, fractional quantities, and a sale cancelled twice.
                </p>
                <p>
                  The project’s verification log records all 120 passing against PostgreSQL, with the concurrency cases
                  repeated five times in a row. I report those results from the log; they were not re-run for this page.
                </p>
              </div>
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <h2 id="limits-title" className={sectionTitle}>
                What is not done yet
              </h2>
              <ul className="mt-6 max-w-[58ch] space-y-4 leading-relaxed">
                {limits.map((limit) => (
                  <li key={limit} className="border-t border-rule pt-4">
                    {limit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-4">
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
        headline={['Need a system', 'tailored to', 'your business?']}
        lede="Stock, orders, staff, reports: if your business runs on spreadsheets and memory, tell me how it works today. A few sentences is enough to start."
        action="Email me about a system"
        subject="A system for my business"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
    </>
  );
}

function Allowed() {
  return (
    <>
      <span aria-hidden className="font-semibold text-signal">
        Yes
      </span>
      <span className="sr-only">Allowed</span>
    </>
  );
}

function Refused() {
  return (
    <>
      <span aria-hidden className="text-graphite">
        No
      </span>
      <span className="sr-only">Not allowed</span>
    </>
  );
}
