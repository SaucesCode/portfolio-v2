# saucescode.xyz

The portfolio of **James Patrick De Mesa**, a full-stack software engineer in the Philippines who builds web applications, business systems, WordPress themes and websites.

**Live site: [saucescode.xyz](https://saucescode.xyz)**

The site's job is to show working software instead of describing it. Visitors can step through a guided tour of a real business app, scroll live websites at full length inside the page, and read case studies that follow the data from the database to the screen.

## What's on it

- **Homepage.** One featured app (Rowszein's Delight, a dessert shop's back office) shown as a step-by-step walkthrough, one featured website (Thread & Form, a WordPress block theme) in a full-length scrolling preview, a filterable gallery of the remaining work, services, and contact.
- **Case studies** at `/work/*`:
  - [Rowszein's Delight](https://saucescode.xyz/work/rowszeins-delight): a Django REST and React system that ties recipes to stock. Includes an interactive trace of one sale moving through a single database transaction.
  - [Thread & Form](https://saucescode.xyz/work/thread-and-form): an editorial WordPress block theme, with its front page taken apart section by section and its design tokens read straight from `theme.json`.
  - [QuickAid](https://saucescode.xyz/work/quickaid): an applicant system for a social assistance programme. Includes an interactive map showing how each application is placed in its barangay rather than at a home address.

### How the proof is kept honest

Every screenshot comes from the real project. Where a screen needs a login, the app was run locally with clearly labelled demonstration data. Each project says where it comes from, either a personal project or a concept build for a fictional brand, and the site says so whenever a preview leaves something out, such as placeholder figures.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, every route prerendered as static HTML) with React 19 and TypeScript
- Tailwind CSS 4 plus CSS Modules for component-specific styles and motion
- `next/font` for Archivo, with Plus Jakarta Sans and Newsreader loaded only when a project preview uses them
- Playwright for end-to-end tests on desktop and mobile viewports
- Deployed on Vercel

## Getting started

Requires Node.js 20.9 or later.

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (webpack) |
| `npm start` | Serve the production build |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright suite (starts the dev server if none is running) |

No environment variables are needed. `NEXT_PUBLIC_SITE_URL` is optional and only overrides the site's address for a copy served somewhere else (see `.env.example`).

## Project structure

```
src/
  app/                  Routes, metadata, sitemap, robots, llms.txt, social images
    work/<slug>/        One folder per case study
  components/           Homepage sections and shared UI
    case/               Case-study-only pieces (sale trace, geo trace, next case)
  data/
    projects.ts         Every project: copy, links, screenshots, provenance
    services.ts         Services and the projects that show each one
    site.ts             Name, domain, email and profiles
  lib/                  SEO helpers, case-study metadata, social image rendering
public/work/<slug>/     Screenshots and full-length captures
tests/                  Playwright specs
docs/                   Design research, specifications and review screenshots
```

`src/data/projects.ts` is the single source for project content. The homepage, the case studies, the sitemap, the structured data and `llms.txt` all read from it.

### Adding a case study

1. Add `caseStudy: '/work/<slug>'` and `caseStudyDates: { published, updated }` to the project in `projects.ts`. The build fails if the dates are missing.
2. Create `src/app/work/<slug>/page.tsx`, using `caseStudyMetadata` and `caseStudyJsonLd` from `src/lib/case-study.ts`.
3. Add the project to the `cases` list in `tests/case-studies.spec.ts`.

When you change a case study, update its `updated` date.

## Search and AI engines

Generated at build time from the data above:

- Canonical URLs, Open Graph and Twitter tags, and a social image for every page
- `sitemap.xml` with last-updated dates for case studies, and `robots.txt`
- JSON-LD structured data: `Person` with services offered, `ProfilePage`, `WebSite`, an `ItemList` of all work, and for each case study an `Article`, the software or creative work it describes, its source code, and a breadcrumb
- [`/llms.txt`](https://saucescode.xyz/llms.txt): a plain-text summary of the site for language models

## Testing

```bash
npm run build
npx next start -p 3001
PLAYWRIGHT_BASE_URL=http://localhost:3001 npx playwright test --workers=1
```

The suite checks metadata and structured data, heading order and alt text, keyboard use of the hero, the app walkthrough and the QuickAid map, reduced-motion behaviour, responsive layout from 320px upwards, and that no placeholder quotes or client claims appear in the case studies.

## Deployment

Pushes to `main` deploy to production on Vercel at `saucescode.xyz`. Other branches get preview URLs. Previews still use the production domain in their canonical tags, so search engines only ever index one address.

## Contact

- Site: [saucescode.xyz](https://saucescode.xyz)
- Email: [jamesspatrickdm@gmail.com](mailto:jamesspatrickdm@gmail.com)
- LinkedIn: [James Patrick De Mesa](https://www.linkedin.com/in/james-patrick-de-mesa-93582424b/)
- GitHub: [@SaucesCode](https://github.com/SaucesCode)
