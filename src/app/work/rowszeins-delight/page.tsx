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
// the way the owner uses it: orders and selling, stock and costing, money, then the shop itself.
const [hero, orders, recordSale, inventory, recipes, analytics, boxes, settings] = project.walkthrough ?? [];

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

const partners: Screen = {
  shot: rowszeinScreen('partners'),
  title: 'Pay partners what they are owed',
  body: 'Each partner’s items, how many sold, and what the shop still owes them for any period, ready to download.',
  detail: 'Payouts are recorded against the partner and can be voided with a reason, so the amount still owed is always computed, never typed in.',
};

const screens = [orders, recordSale, salesList, inventory, recipes, analytics, boxes, partners, expenses, settings].filter(
  (screen): screen is Screen => Boolean(screen),
);

/** The customer's side: the public shop and the page an order sends them to. */
const customerScreens = [
  { shot: rowszeinScreen('shop'), alt: 'The Rowszein’s Delight shop: build a box of 6 or 12 from today’s donuts', caption: 'The shop. Customers fill a box from today’s donuts or pick a ready-made one; no account is needed.' },
  { shot: rowszeinScreen('order-status'), alt: 'An order status page waiting for the shop to confirm', caption: 'After ordering, customers get their own status page that shows whether the shop has confirmed.' },
];
const phoneShop = { src: '/work/rowszeins-delight/app-shop-phone.jpg', width: 780, height: 1688 };

const copy = {
  title: 'Rowszein’s Delight: a business system for a dessert shop',
  description:
    'Case study: a Django REST and React system for a dessert shop, with online orders, recipes linked to stock so every sale takes the right ingredients out of the pantry, and profit after partners and expenses.',
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
  { term: 'Built with', detail: project.builtWith },
  { term: 'Where it stands', detail: 'In development: pre-launch hardening done, not yet declared production-ready' },
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
  'The project’s README still lists it as in development: production, infrastructure and deployment validation are open gates, so it is not presented as production-ready.',
  'Pre-launch hardening is merged (HTTPS with HSTS, a Content-Security-Policy, and four automatic checks on every push), but the box screens have not yet been tested end to end with a signed-in owner.',
  'This case study shows the owner panel at desktop width only.',
  'The screenshots come from the version published on 16 Nov 2026, running locally with fictional demonstration data.',
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
            Beyond the dashboard, ten screens cover the routine: orders and selling, stock and costing, money, and the
            shop itself. The note under each one says what the code does behind it.
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

        {/* What customers see --------------------------------------------- */}
        <section aria-labelledby="customers-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <h2 id="customers-title" className={sectionTitle}>
            What customers see
          </h2>
          <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-graphite">
            The same system runs the public shop, so an order placed on a phone lands in the owner’s Orders screen.
          </p>
          <div className="mt-12 grid items-start gap-x-6 gap-y-14 lg:grid-cols-12">
            <div className="grid gap-14 lg:col-span-8">
              {customerScreens.map((screen) => (
                <figure key={screen.shot.src}>
                  <div className="overflow-hidden rounded-[var(--radius-frame)] shadow-hang">
                    <Image
                      src={screen.shot.src}
                      width={screen.shot.width}
                      height={screen.shot.height}
                      sizes="(min-width: 1024px) 60vw, 94vw"
                      alt={screen.alt}
                      loading="lazy"
                      className="block h-auto w-full"
                    />
                  </div>
                  <figcaption className="mt-4 max-w-[56ch] leading-relaxed">{screen.caption}</figcaption>
                </figure>
              ))}
            </div>
            <figure className="mx-auto w-full max-w-[20rem] lg:sticky lg:top-28 lg:col-span-4 lg:max-w-none">
              <div className="overflow-hidden rounded-[1.75rem] shadow-hang">
                <Image
                  src={phoneShop.src}
                  width={phoneShop.width}
                  height={phoneShop.height}
                  sizes="(min-width: 1024px) 26vw, 20rem"
                  alt="The shop on a phone, with the demonstration-data notice"
                  loading="lazy"
                  className="block h-auto w-full"
                />
              </div>
              <figcaption className="mt-4 leading-relaxed text-graphite">On a phone, at 390 pixels wide.</figcaption>
            </figure>
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
                  The backend has 351 automated tests across every part of the app: sales and stock, online orders, shop
                  settings, accounts, products, recipes, expenses and the dashboard. The sales tests cover the failures that
                  matter most for a shop: a sale that would overdraw stock, a retry after a dropped connection, an edit made
                  from a stale screen, two tills selling the last item at once, and a sale cancelled twice.
                </p>
                <p>
                  I re-ran the suite for this page on 16 November 2026: every test passed, with 17 PostgreSQL-only tests
                  skipped on SQLite. Every push also runs four automatic checks: the backend on SQLite and on a throwaway
                  PostgreSQL, the frontend’s type check, lint and build, and a dependency audit.
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
