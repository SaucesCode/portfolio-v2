# Case study of this site: design

Date: 2026-11-17. Status: approved by the owner, quote included as edited.

## Why

The owner's goal for the portfolio, in their words: "This is what I can build specially with AI … I want to show to people this is what I can build and what else I can do and I want to show that already with this portfolio." The site now does that: live demos in the hero, a guided tour, an assistant that answers from the site, and a project form. But nothing on the site explains it, so a visitor sees the features without knowing what went into them. A case study turns the site itself into the clearest piece of evidence for clients who want an AI feature or a business system.

## Goals

- A case study page at `/work/this-site`, built and laid out like the existing ones (Rowszein's Delight, QuickAid, Thread & Form).
- A gallery card for it, so it is found the same way as the other case studies.
- An interactive centrepiece, "Following one question through the assistant", in the pattern of the Rowszein sale trace.

## Non-goals

- No prices, and no exact abuse-limit numbers or internal switch names (they help only someone trying to get around them).
- No invented metrics: no visitor counts, conversion rates or client results. The site is new and there are none.
- No new live demo; the page links to the real assistant and demos already on the homepage.

## Anti-goals

- A page that reads as a feature list or a pitch rather than a case study.
- Any claim the code, the tests or a measurement in this project cannot back.
- A centrepiece that only works for sighted mouse users.

## Approaches considered

- **Full case study page (chosen by the owner).** Matches the existing case studies and gives room for the trace.
- **A short section on the homepage or in About.** Quicker, but it can't show the reasoning, so it convinces far less. Rejected by the owner.

## The page

Sections in order. The headings are working titles, and the copy is the builder's, held to the facts below.

1. **Header:** title "This site", with the medium "Portfolio website with an AI assistant" and the year 2026. Links: "Ask the assistant" (opens the existing Ask panel on the homepage) and "View the code" (GitHub `portfolio-v2`). Provenance: "Personal project".
2. **The problem:** a portfolio usually *tells* a client what someone can build. This one had to *show* it. That means things a visitor can use in the first minute, an assistant that never makes up prices or claims, and a way to get in touch that works without a mail app. The owner's quote above can appear, lightly edited for grammar only, with the owner's approval at review.
3. **What a visitor can do:** four short items, each with a screenshot captured from this site:
   - the live demos in the hero (record a sale, restyle the storefront)
   - the guided tour of Rowszein's Delight
   - the assistant
   - the project form
4. **Following one question through the assistant** (the centrepiece, on the dark band the Rowszein trace uses). The six steps scroll past as text. On wide screens a drawing beside them shows which part is working at each step: the browser, the site's server, the counter store, the model or the page. Every step also names its part in words, so the drawing is never the only place that information lives.
   1. *Asked in the browser.* The question (up to 300 characters) and the last few turns go to the site's own server, never straight to the AI.
   2. *Is it from this site?* Requests from other websites are refused.
   3. *Within the limits?* Per-visitor and site-wide counts are checked and updated in one round trip to the counter store. A visitor over their limit never uses up the site's allowance.
   4. *Answered from the site only.* The model receives the site's own content (the same text as `/llms.txt`) and strict rules: no prices, never claim client work, speak about James in the third person, in the visitor's language. A fast model answers, and a second model steps in only if the first is overloaded, all within one time limit.
   5. *Checked before it's shown.* The answer comes back as structured data. Suggested actions are checked against a list of real sections and projects, and anything else is dropped.
   6. *The page acts.* The visitor sees the answer and buttons that scroll to a section, open a project, focus a demo or start the project form.
5. **How it's built:**
   - Next.js 16 with static pages and two server routes (`/api/ask` and `/api/inquiry`)
   - Upstash Redis for the counters
   - Gemini for answers, Resend for email
   - hosted on Vercel
   - structured data for search engines and AI search
   
   Present it as a short labelled diagram plus a few sentences, like the Rowszein architecture section.
6. **Testing:**
   - an automated end-to-end suite of about 290 Playwright tests on desktop and phone
   - local stand-ins for Gemini and Resend, so every failure path is tested without calling them
   - a fresh code review of each feature branch
   - checks against the real Gemini before each assistant release
   
   Quote the suite size from the latest run when building.
7. **What it doesn't do (yet):**
   - answers arrive whole, not streamed word by word
   - the assistant runs on a free tier, so on a very busy day it says it's busy and offers email
   - it knows only what is on the site
   - the email form needs a working mail service, and offers email directly when it doesn't have one
8. **Contact:** the existing `Contact` block, with the opening line "A site like this one".

## Facts the copy may use (measured or in the repo)

- Real answers in about 2 seconds: 1.8–3.0 s across 9 live questions, with the main model's median at 1.6 s (2026-11-17).
- Assistant questions are limited to 300 characters. The form's message must be 20–2,000 characters.
- The model's suggestions are limited to four kinds: show a section, open a project, focus a demo, draft an inquiry.
- The bot traps on the form: a hidden field, and a minimum fill time measured on the visitor's device.
- Nothing visitors type is stored by the site, and logs carry no visitor text.

## Data and wiring

- A `projects` entry with:
  - slug `this-site`, category `web`, classification `personal`
  - `caseStudy: '/work/this-site'` and `caseStudyDates`
  - a poster captured from the live homepage at 1440×900
  
  It joins the existing case-study cards, the sitemap, `llms.txt`, the JSON-LD and the assistant's project list automatically, as the others do.
- The trace's steps live in a data file, like `src/data/rowszein-trace.ts`. The component follows `SaleTrace`'s pattern: an IntersectionObserver band, `data-active`, and the step's part named in a list.
- Social images (`opengraph-image`, `twitter-image`) follow the existing case studies.

## Testing and verification

- The page has the case-study structure the existing tests check: heading order, links, JSON-LD Article and Breadcrumb, sitemap entry.
- The trace marks the step in the middle of the screen as active as it scrolls. Every step names its part in text, and with reduced motion nothing animates.
- The page contains no price and no limit numbers.
- Screenshots at 375, 768, 1280 and 1440 px, in light and dark mode.
- The full suite passes.

## Left to the builder

- the final copy, within the facts above
- the exact drawing for the trace
- which screenshots illustrate section 3
- the visual details, within the existing case-study styles
