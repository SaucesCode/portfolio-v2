import Image from 'next/image';
import Link from 'next/link';
import { NextCase } from '@/components/case/NextCase';
import { GeoTrace } from '@/components/case/GeoTrace';
import { ButtonLink } from '@/components/ButtonLink';
import { Contact } from '@/components/Contact';
import { ExternalLink } from '@/components/ExternalLink';
import { getCaseStudy } from '@/data/projects';
import { caseStudyJsonLd, caseStudyMetadata, jsonLdScript } from '@/lib/case-study';
import { allBarangays, municipalities, outliers } from '@/lib/quickaid-geo';
import styles from './quickaid.module.css';

const project = getCaseStudy('quickaid');

const copy = {
  title: 'QuickAid: mapping assistance applications by barangay',
  description:
    'Case study: a React and Django system for crisis-assistance applications, approvals and payouts, with a map that places each application in its barangay, never at a home address.',
};

export const metadata = caseStudyMetadata(project, copy);

const jsonLd = caseStudyJsonLd(project, copy, {
  '@type': 'SoftwareApplication',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web browser',
});

const facts = [
  { term: 'What it is', detail: project.provenance },
  { term: 'My part', detail: 'Data model, API, geocoding, the map and much of the interface' },
  { term: 'Built with', detail: project.builtWith },
  { term: 'Where it stands', detail: 'Last updated May 2026, with no automated tests yet' },
];

const stops = [
  {
    title: 'Apply',
    body: 'A four-step public form in English and Filipino, or staff registering an applicant in person. Staff can share a QR code, and applications sent through it are credited to them.',
  },
  {
    title: 'Check',
    body: 'Every application belongs to one person record, keyed on name and birthday, so repeat requests line up in one history. A new application is marked suspicious if its phone number was used with a different birthday or name, or by three or more people.',
  },
  {
    title: 'Approve',
    body: 'Staff upload the approved list as a CSV or Excel file. Each upload records how many rows were approved, were already approved or matched no one, and keeps an audit log.',
  },
  {
    title: 'Pay out',
    body: 'Payouts run in batches by type of assistance and payout date, each with a budget and one claim per applicant.',
  },
  {
    title: 'Report',
    body: 'Analytics on geography, demographics and income, trends, staff performance and budget, exported as PDF or Excel. Intake sheets and certificates print from the record.',
  },
];

const mapSteps = [
  {
    title: 'The applicant picks a barangay from a list',
    body: 'The form offers only the barangays of six municipalities in Quezon province. The record keeps that barangay’s official code; the street address is stored as text and never looked up.',
  },
  {
    title: 'QuickAid looks up the barangay’s reference point',
    body: 'Each of the barangays was geocoded once, ahead of time, with a small tool that queried the Photon geocoder one request per second, tried three spellings of each place and graded every answer high, medium or low. The results ship with the backend and are cached in memory for a week.',
  },
  {
    title: 'It moves the point a short random distance',
    body: 'Up to 0.001° in each direction, about 110 metres. Applications from the same barangay spread out instead of stacking on one dot, and no marker sits at anyone’s home.',
  },
  {
    title: 'If a barangay is missing, it asks Photon',
    body: 'The live lookup is cached for 30 days and offset up to 0.002°. If that fails too, the application is saved without a location rather than with a wrong one.',
  },
  {
    title: 'Signed-in staff see the map',
    body: 'Up to the 2,000 most recent applications, as clustered markers or a heatmap, over street or satellite tiles, filtered by municipality, barangay and type of assistance.',
  },
];

const layers = [
  { name: 'Browser', detail: 'React 19 single-page app. Leaflet draws the map with marker clusters and a heat layer; Recharts draws the analytics.' },
  { name: 'Vercel', detail: 'Hosts the public site and the staff app.' },
  { name: 'Django REST API', detail: 'Applicants, approvals, payouts, analytics, exports and staff accounts, with geocoding in the applicant model.' },
  { name: 'PostgreSQL', detail: 'Regions, provinces, municipalities and barangays by official code, and every applicant’s history.' },
];

const limits = [
  'There are no automated tests. The test file in the backend is the empty one Django creates, and the frontend has testing libraries installed but no tests.',
  'Sign-in tokens are kept in the browser’s local storage, where any script on the page could read them, and the access token lasts ten hours.',
  'A rate limit for public applications, ten an hour per address, is written but not attached to the form’s endpoint. Exports are limited to five an hour per user.',
  `Automated geocoding needs a human check: ${outliers.length} reference points landed about ${Math.round(outliers[0]?.kmFromCity ?? 0)} km away and were not flagged. The map above shows them.`,
  'The map endpoint caches its results under one key whatever the filters, so filtering also has to happen in the browser, which it does.',
  'The staff screens need a login and are not shown. The screenshots are of the public form, with fictional details typed in and nothing submitted.',
  'QuickAid’s public pages describe the AICS assistance programme and carry the DSWD name and logo. This case study does not claim any affiliation, commission or endorsement, and leaves those pages out.',
];

const sectionTitle = `${styles.narrow} text-[clamp(1.875rem,1.4rem+1.6vw,3rem)] leading-[1.02]`;

export default function QuickAidCaseStudy() {
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
              <p className="text-[0.9375rem] font-medium text-signal">Case study, geospatial software</p>
              <h1 className={`${styles.narrow} mt-3 text-[min(clamp(3.5rem,1.8rem+7vw,8.5rem),18vw)] leading-[0.88]`}>
                {project.title}
              </h1>
              <p className="mt-6 max-w-[36ch] text-[clamp(1.25rem,1.05rem+0.7vw,1.625rem)] leading-[1.3] font-medium tracking-[-0.01em]">
                An applicant management system for crisis assistance, with a map that shows which barangays requests come
                from, never which houses.
              </p>
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
            <div className={styles.formPair}>
              <div className={styles.formWide}>
                <Image
                  src="/work/quickaid/apply-address.jpg"
                  width={2304}
                  height={1381}
                  sizes="(min-width: 1440px) 1200px, (min-width: 768px) 80vw, 92vw"
                  alt="QuickAid’s public application form, step 2 of 4, in English and Filipino: province Quezon, municipality Sariaya, barangay Bignay 2 and a street address, followed by personal details."
                  preload
                />
              </div>
              <div className={styles.formPhone}>
                <Image
                  src="/work/quickaid/apply-address-phone.jpg"
                  width={1026}
                  height={2172}
                  sizes="(min-width: 1024px) 232px, 184px"
                  alt=""
                  loading="lazy"
                />
              </div>
            </div>
            <figcaption className="mt-14 max-w-[70ch] text-[0.9375rem] text-graphite md:mt-16">
              The public application form on the live site, at desktop and phone width, with fictional details typed in.
              Nothing was submitted.
            </figcaption>
          </figure>
        </header>

        {/* The problem ------------------------------------------------------ */}
        <section aria-labelledby="problem-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-12">
            <h2 id="problem-title" className={`${sectionTitle} lg:col-span-4`}>
              Help is paperwork before it is help
            </h2>
            <div className="max-w-[62ch] space-y-5 text-lg leading-relaxed lg:col-span-7 lg:col-start-6">
              <p>
                Medical, burial and educational assistance all start with an intake form, then a check for repeat
                requests, an approved list, a payout and a report. On paper, each of those steps is another copy of the
                same information, and nobody can see at a glance where the requests are coming from.
              </p>
              <p>
                QuickAid puts the whole path in one system for the staff who run it, and gives applicants a form they can
                fill in on their own phone. Because every application carries a place, the same records can be drawn on a
                map, and that is where most of the engineering went.
              </p>
            </div>
          </div>
        </section>

        {/* Workflow --------------------------------------------------------- */}
        <section aria-labelledby="route-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <h2 id="route-title" className={sectionTitle}>
            From application to payout
          </h2>
          <ol className={styles.route}>
            {stops.map((stop, i) => (
              <li key={stop.title} className={styles.stop}>
                <span className={styles.stopIndex}>Step {i + 1}</span>
                <h3 className={`${styles.narrow} ${styles.stopTitle}`}>{stop.title}</h3>
                <p className={styles.stopBody}>{stop.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* The map ---------------------------------------------------------- */}
        <section aria-labelledby="map-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-5">
              <h2 id="map-title" className={sectionTitle}>
                Where a point on the map comes from
              </h2>
              <p className="mt-4 max-w-[52ch] text-lg leading-relaxed">
                An application’s place on the map is worked out on the server, from its barangay, every time it is saved.
                The map on the right shows the {allBarangays.length} reference points behind it, across{' '}
                {municipalities.length} municipalities. Pick one to see how far the random offset can move a point.
              </p>
            </div>
            <ol className="grid gap-6 lg:col-span-6 lg:col-start-7">
              {mapSteps.map((step, i) => (
                <li key={step.title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3">
                  <span className={`${styles.narrow} text-2xl leading-none text-graphite`} aria-hidden>
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg leading-snug font-semibold">{step.title}</h3>
                    <p className="mt-1.5 max-w-[60ch] leading-relaxed">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-14">
            <GeoTrace />
          </div>
          <p className="mt-6 max-w-[70ch] text-[0.9375rem] text-graphite">
            Reference points and barangay names come from the project’s own data file; the eight positions shown for
            each barangay were produced by running QuickAid’s geocoding function. No applicant data is used.
          </p>
        </section>

        {/* Architecture ----------------------------------------------------- */}
        <section aria-labelledby="architecture-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <h2 id="architecture-title" className={sectionTitle}>
            How it is put together
          </h2>
          <ol className="mt-10 grid gap-3 md:grid-cols-4 md:gap-0">
            {layers.map((layer, i) => (
              <li key={layer.name} className="border-t-2 border-ink pt-4 md:pr-6 [&:not(:last-child)]:pb-6 md:[&:not(:last-child)]:pb-0">
                <p className={`${styles.narrow} text-xl`}>
                  <span className="sr-only">{i + 1}. </span>
                  {layer.name}
                </p>
                <p className="mt-2 max-w-[38ch] text-[0.9375rem] leading-relaxed text-graphite">{layer.detail}</p>
              </li>
            ))}
          </ol>
          <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-5">
              <h3 className={`${styles.narrow} text-2xl`}>Who can reach what</h3>
              <p className="mt-4 max-w-[56ch] leading-relaxed">
                Three endpoints are public: the application form, a contact form and the list of staff behind the QR
                links. Fifty-six need a signed-in staff account, and seven are for administrators only, such as creating
                staff accounts. Sign-in uses JSON Web Tokens.
              </p>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <h3 className={`${styles.narrow} text-2xl`}>Places as data</h3>
              <p className="mt-4 max-w-[56ch] leading-relaxed">
                Regions, provinces, municipalities and barangays are tables keyed by their official Philippine Standard
                Geographic Code, imported from a public code list, so the form’s cascading lists and the map’s filters read
                from the same source.
              </p>
            </div>
          </div>
        </section>

        {/* Testing and limits ------------------------------------------------ */}
        <section aria-labelledby="limits-title" className="mx-auto mt-24 max-w-[90rem] px-4 sm:mt-36 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
            <h2 id="limits-title" className={`${sectionTitle} lg:col-span-4`}>
              What is not done yet
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
        headline={['Have data that', 'belongs on', 'a map?']}
        lede="Service areas, field visits, deliveries or requests: if your records have a place in them, tell me what you need to see. A few sentences is enough to start."
        action="Email me about a map"
        subject="A map or location-based system"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
    </div>
  );
}
