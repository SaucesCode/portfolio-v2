import { site } from '@/data/site';
import styles from './About.module.css';

const principles = [
  {
    title: 'Start from the work, not the screens',
    body: 'Before designing anything I learn how orders, approvals or stock actually move through your day, so the software follows the job instead of the other way round.',
  },
  {
    title: 'Build the unglamorous parts properly',
    body: 'Logins and roles, input validation, stock that stays consistent, exports that open cleanly in a spreadsheet. The parts nobody notices until they break.',
  },
  {
    title: 'Design is part of the build',
    body: 'Type, spacing and motion are decided in code, not handed over as a picture. What you approve is what goes live, on phones as well as desktops.',
  },
];

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="mx-auto mt-24 grid max-w-[90rem] scroll-mt-20 gap-10 px-4 sm:mt-32 sm:px-6 lg:grid-cols-12 lg:gap-6 lg:px-10"
    >
      <div className="lg:col-span-5">
        <h2
          id="about-title"
          className="font-wide text-[clamp(1.75rem,1.2rem+2vw,3rem)] leading-none font-medium tracking-[-0.03em]"
        >
          About me
        </h2>
        <p className="mt-6 max-w-[38ch] text-[clamp(1.1875rem,1.1rem+0.4vw,1.375rem)] leading-snug text-pretty">
          I like building software that’s actually useful to someone. What I enjoy most is the building itself:
          watching a project go from a plan to something real, piece by piece, until the moment it works. That
          moment, when a sale goes through, a page loads properly on a phone, or the numbers add up, is the part I
          never get tired of.
        </p>
        <p className="mt-5 flex items-center gap-2.5 text-[0.9375rem] text-graphite">
          <span aria-hidden className="size-2 shrink-0 rounded-full bg-signal" />
          {site.availability}
        </p>
        <p className="mt-10 max-w-[50ch]">
          I’m {site.name}, a full-stack software engineer based in the {site.country}. I work across the whole
          stack: data models and APIs in Django and Node, interfaces in React and Next.js, and WordPress themes in PHP.
        </p>
        <p className="mt-4 max-w-[50ch] text-graphite">
          Most of my projects are complete products: a shop’s back office, an applicant system, an admin panel, a
          storefront theme. The code for each one is public on GitHub as {site.githubHandle}.
        </p>
      </div>

      <div className="lg:col-span-6 lg:col-start-7 lg:pt-2">
        <h3 className="font-semiwide text-[0.9375rem] font-semibold tracking-[0.01em] text-graphite">How I work</h3>
        <ol className={`${styles.rail} mt-8 grid gap-12`}>
          {principles.map((principle) => (
            <li key={principle.title} className={styles.principle}>
              <h4 className="font-semiwide text-xl leading-tight font-semibold tracking-[-0.01em]">{principle.title}</h4>
              <p className="mt-2 max-w-[56ch] text-graphite">{principle.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
