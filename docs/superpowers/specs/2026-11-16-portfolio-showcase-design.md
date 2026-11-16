# Portfolio as proof: live hero, "Ask this site", client-facing content

Date: 2026-11-16 · Status: awaiting owner approval · Owner: James Patrick De Mesa · Site: https://www.saucescode.xyz (Next.js 16, Vercel, repo `SaucesCode/portfolio-v2`)

## Intent

The portfolio itself is the proof. A visitor, whether a local business owner or an international client, should leave thinking "if he built this, he can build mine." The site already shows the work well once someone digs in. What it lacks:

- a first impression that demonstrates working software instead of describing it;
- evidence of AI capability, which clients increasingly ask for and which nothing in the portfolio shows yet;
- a human voice, and the practical answers clients need before they write (price, time, time zones, after launch).

AI is one strand of the message, not the whole of it: "I build complete, working products, and AI is part of what I can put in them."

## Goals

1. Within the first screen, a visitor can *use* both kinds of work: record a sale in a business system, and restyle a website.
2. A visitor can ask the site a question in plain language and the site answers from its own content *and acts on the page*.
3. A client can find prices, timelines, working terms and a personal voice without emailing first.
4. The gallery shows fewer projects at higher weight.
5. The portfolio becomes a case study of its own.

## Non-goals

- No floating chat bubble, no general-purpose chatbot, no conversation that wanders off the site's subject.
- No AI feature inside the Rowszein's Delight demo (explicitly dropped by the owner).
- No embedding of the real Rowszein's Delight backend or the real Thread & Form site.
- No photo of the owner, and no AI-generated likeness.
- No visual rebrand: palette, type (Archivo), button system and the existing motion language stay.

## Anti-goals (failure even if it technically works)

- The assistant invents a price, a timeline, a client, a capability or a promise that is not on the site.
- Strangers burn through the free quota so real visitors get nothing, or use the endpoint as a free general chatbot.
- The live hero makes the first paint slower or makes first load stutter. The hero must paint finished.
- Anything reads as AI slop: generic chat UI, "Unlock the power of…" copy, sparkle icons.
- A demo looks like the real product without saying it runs on sample data in the browser.

## Constraints

- Honesty rules (existing): every capture and demo is labelled; no project is presented as client work; concept builds are named as such; QuickAid's relationship to the DSWD/AICS programme is unconfirmed.
- Performance: LCP < 2.5s, INP < 200ms, CLS < 0.1 on a mid-range phone. All routes are prerendered today; the assistant adds the site's first server function.
- Accessibility: WCAG 2.2 AA, full keyboard use, prefers-reduced-motion honoured, touch targets ≥ 44px.
- The existing Playwright suite (129 tests) keeps passing; new behaviour gets tests.
- Machine: development RAM is often low. Run one production server on port 3001 and one browser at a time. Ports 5173 and 8000 belong to another private app and must never be touched.

## Approaches considered

**"Ask this site"**
- **Chosen: Google Gemini API on its free tier, via a Vercel server function, with function calls that drive the page.** The site's content is sent as grounding. The model answers briefly and may call page actions. The owner chose Gemini so the assistant costs nothing: with no billing on the Google project, the worst case is hitting the free quota, not a bill. Server-side limits keep one visitor from using up the day's quota.
- Considered first: Claude (Anthropic API). Better-known quality for tool use, but paid. Dropped by the owner for cost.
- Rejected: a non-AI fuzzy search. It is free and instant, but it is not AI, which defeats the purpose.
- Rejected: an in-browser model (e.g. WebLLM). It downloads 1 GB or more, is slow on phones, and would wreck the performance budget.

**Live hero demos**
- **Chosen: rebuild only the interactive slices inside the site.** Rowszein's Delight gets a sale, stock, profit and low-stock logic ported from the real app's rules. Thread & Form gets its front-page hero, restyled from its real `theme.json` tokens.
- Rejected: embedding the real apps. Rowszein's Delight needs a hosted Django and PostgreSQL backend, logins and resets. Thread & Form is cross-origin, so it can't be restyled from here.

**Hero layout** (chosen with mockups)
- **Chosen: A, "the handoff, now live".** The existing primary/support swap stays. Only the project in the primary frame is live.
- Rejected: B, side by side. Each window is half the size, and on phones the website demo falls below the fold.
- Rejected: C, a control panel beside the headline. Attention splits between the panel and the windows, and they separate on phones.

## Delivery order

Four independently shippable phases, each its own branch, PR-sized commit set, test pass and deploy:

1. **Content**: headline, Working with me, About paragraph, gallery trim.
2. **Live hero**: both demos.
3. **Ask this site**: the AI assistant.
4. **This site's case study**, written last so it describes what was actually built.

---

## Phase 1: Content

### Headline (owner-approved)
The two hero lines become:
- Software line: **"Systems your business runs on."**
- Website line: **"Websites it's found by."**

The supporting sentence stays essentially as it is: "I'm James Patrick De Mesa, a full-stack software engineer… from the database to the last pixel." The `headline` record in `HeroShowcase.tsx` and the dimension-line link to the lit line keep working. Update the root `title`/`description` in `layout.tsx` only if they contradict the new line; the name-led title stays for search.

### "Working with me" (new section, `id="working"`)
Placed between Services and About. The header nav gains **Pricing**, linking to `#working`. Copy (owner-approved):

- **How pricing works.** Every project gets a fixed price, agreed before work starts, after a short call about what you need. As a guide, landing pages start at US$500, WordPress sites at US$1,200, and custom web apps and business systems at US$3,500. Based in the Philippines? Ask for a local quote.
- **How long it takes.** A landing page usually takes 1–2 weeks, a WordPress site 3–5 weeks, and a business system 6–12 weeks, depending on scope.
- **Working across time zones.** I'm in the Philippines (UTC+8) and work with clients anywhere. You get at least 3–4 hours of overlap every working day for calls, written progress updates twice a week, and a reply within one business day.
- **After launch.** Anything that breaks in the first 30 days is fixed free. After that, you can keep me on a monthly care plan for updates and small changes, or ask for work only when you need it. Either way, the code lives on your own GitHub, with a short guide to running it.
- **Payment.** 50% to start and 50% at launch. Business systems are split into three milestones.

These terms move into a data module (e.g. `src/data/terms.ts`) because three consumers read them: the section, `llms.txt`, and the assistant's grounding. Prices also go into the `Offer` entries of the Person JSON-LD (`priceSpecification` with `minPrice`, currency USD), matched to services. "APIs, databases and integrations" has no "from" price and is quoted per scope.

### About paragraph (owner-approved)
At the top of the About section, above "How I work":

> I like building software that's actually useful to someone. What I enjoy most is the building itself: watching a project go from a plan to something real, piece by piece, until the moment it works. That moment, when a sale goes through, a page loads properly on a phone, or the numbers add up, is the part I never get tired of.
>
> *Currently taking on new projects, local and international.*

The "currently" line lives in `site.ts` (e.g. `availability`) so it can change without touching components.

### Gallery trim
- Full cards: QuickAid, Kinetix Athletics, MeetingMode, Portfolio and CMS, plus **this site** once Phase 4 exists. Until then it has no card.
- Valence Capital, Nexus AI and Page Fishing move to a compact **"More experiments"** list after the cards: title, one line, links. No poster.
- The filter counts, the JSON-LD `ItemList`, `llms.txt` and the tests keep listing all projects. Only the presentation changes. Add a field such as `tier: 'card' | 'list'` in `projects.ts` rather than hard-coding slugs in the component.

---

## Phase 2: Live hero

### Behaviour
- The existing handoff (FLIP swap, dimension line, isometric unfold entrance, scroll-driven on phones) is unchanged. The primary frame becomes interactive. The support frame stays a static image. Switching hands the live state over: the outgoing demo freezes into its image, and the incoming one becomes live.
- **First paint is the current static screenshot.** The live component mounts after hydration, when the browser is idle, and replaces the image only when ready, at identical size (no layout shift). If JavaScript fails, the screenshot remains, which is today's behaviour.
- Each live frame carries a visible label: **"Live demo · sample data, running in your browser"**. This replaces the current "Demonstration data" tag in that position.

### Software demo: Rowszein's Delight
- A compact owner dashboard: three KPI tiles (net sales, net profit, low-stock count), two or three ingredient stock meters, and the low-stock alert.
- **Record a sale** row: product chips (e.g. Classic Glazed, Ube Cream, Chocolate Dip). Each press records one unit.
- Each press updates sales, cost of goods and profit using each product's recipe, deducts ingredients per the recipe's batch yield, and raises the low-stock alert when an ingredient crosses its threshold. Numbers animate, using transform and opacity only, with a reduced-motion fallback that just swaps the values.
- **Rules come from the real app.** Port the consumption and costing rules from the public Rowszein's Delight repository (github.com/SaucesCode/Rowszein-s-Delight: `backend/sales/services.py`, the recipe and ingredient models), with sample data consistent with the existing walkthrough screenshots (₱ amounts, the same product names). Write the logic as a pure TypeScript module with unit-level tests.
- **Reset**: a small "Reset demo" control. State lives only in memory and is not persisted.
- Out of stock: the chip disables with a reason ("Not enough ube for one more").

### Website demo: Thread & Form
- A faithful React rebuild of the theme's **front-page hero region only**: header bar, the "A study in deliberate form." editorial headline and hero image, using the theme's real fonts and tokens (`src/data/thread-and-form.ts` already exports `palette`, `fontSizes` and `spacing` from `theme.json`).
- Controls under the frame: three to four **colour presets** built from real palette entries, and a **type toggle** (the theme's serif display vs. a sans alternative). Changing a control swaps CSS custom properties, so the whole region restyles at once. That is the point: "one set of tokens, the whole site follows."
- The caption under the frame explains it in one line and links to the case study's "visual system" section.

### Phones
The live primary frame must stay usable at 360px wide: the chips wrap, and the controls sit under the frame. The support frame may hide while the primary frame is interacted with.

---

## Phase 3: "Ask this site"

### What the visitor sees
- A search-style trigger in the header: a field labelled **"Ask about my work"**, also opened with `/` or ⌘K/Ctrl+K, plus a short line in the hero's supporting area pointing to it. No floating bubble.
- It opens as a panel: a modal on phones, a command-palette-style overlay on desktop. It has three suggested questions, an input (max 300 characters), and answers that stream in.
- Answers are short (≤ 3 sentences) and may be followed by **action chips** the model chose, e.g. "Show me Rowszein's Delight", "See pricing", "Email James with this". Actions run when the visitor clicks a chip, not automatically. Exception: an explicit visitor request such as "show me…" may scroll straight away.
- A footer line: "Answers come from this site's content only. Questions are sent to Google's Gemini to answer, and this site doesn't keep them." On the free tier, Google may use submitted content to improve its products, so the panel must not claim otherwise. The input placeholder discourages personal details ("Don't include personal details").
- Available on every page. On a case study, `show_section` and `focus_demo` go to the homepage and then act. (My call.)
- It replies in the visitor's language: a question in Tagalog or Taglish gets a Tagalog or Taglish answer, with prices and terms quoted exactly as written. (My call, for the local audience.)

### Page actions (tools the model may call)
| Tool | Effect on the page |
|---|---|
| `show_section(id)` | Scroll to a homepage section (`featured`, `work`, `services`, `working`, `about`, `contact`) and briefly highlight it |
| `focus_demo('software' \| 'web')` | Scroll to the hero and hand the primary frame to that demo |
| `open_project(slug)` | Go to the case study if one exists, otherwise to its gallery card or dialog |
| `draft_inquiry(summary)` | Open a `mailto:` to the site email, with a subject and a body summarising the visitor's need |

Tools only *propose* client-side actions. Nothing server-side changes state, so prompt injection can at worst produce a wrong answer, never a harmful action. The client validates every tool call against a fixed allowlist of section ids and project slugs.

### Grounding and honesty
- The system prompt contains: who James is, services, projects (with provenance), terms (from `terms.ts`) and contact. All of it is built from the same data modules as `llms.txt`, at build time. No retrieval service is needed; the content is small.
- Rules: answer only from the provided content. If something isn't covered, say so and offer `draft_inquiry`. Never quote a price, timeline or capability that isn't in the content. Never claim client work. Decline off-topic requests in one sentence. Write plainly with no marketing language.
- **Model:** a current Gemini Flash-class model available on the free tier with function calling and streaming. Confirm the model id and the current free-tier limits in Google's documentation at build time, because Google changes them. Keep the provider call behind one small module, so switching provider later (e.g. to Claude) touches one file.

### Abuse protection (owner requirement: no one can abuse it)
Layered, so no single failure runs up the bill:
1. **Per-visitor rate limit**, durable rather than in-memory, because serverless instances don't share memory: e.g. 10 questions per 10 minutes and 30 per day per IP. Use a hosted store (e.g. Upstash Redis through the Vercel Marketplace, free tier) or Vercel Firewall rate-limit rules if the plan supports them.
2. **Global daily cap** on total questions, set safely below the free tier's daily request limit, so the site reaches its own polite "busy today, here's the email" state before Google starts refusing. Also handle Google's quota errors (HTTP 429) as the same state.
3. **No billing, so no bill.** The Gemini key comes from a Google AI Studio project with **billing never enabled**. The free tier's own quota is the backstop: when it is exhausted, Google refuses requests and the site shows the "busy today" state. The builder must verify the key's project is on the free tier.
4. **Input limits**: 300 characters per question and at most the last 4 turns sent. **Output limit**: a low `max_tokens` (≈ 300).
5. **Bot friction**: requests must come from the site (Origin check). Use Vercel BotID or Cloudflare Turnstile (invisible) if bots show up. Decide at build time, with BotID preferred because it stays on Vercel.
6. **Off-topic refusal** in the system prompt, so the endpoint is useless as a free general chatbot.
7. **Kill switch**: the endpoint checks a flag at request time and returns 503 when it is off, and the panel then shows its "disabled" state with the email route. The flag lives in Vercel Edge Config, so switching it takes effect instantly with no redeploy. An env var would only apply after a redeploy. Pages are prerendered, so the entry point stays visible while the flag is off; hiding it as well needs a redeploy.
8. **Observability**: structured logs with a request id, counts, latency, token usage, limit hits and quota errors. **No question text is stored.**

### Failure states
Loading (streaming skeleton line), rate-limited ("You've asked a lot, try again in a few minutes"), daily cap, model error (generic message plus the email link), disabled (the panel explains it is off for now). Every state keeps the email route visible.

### Secrets and config
`GEMINI_API_KEY` (plus rate-limit store credentials) go in Vercel environment variables only, and are documented in `.env.example`. Nothing goes in client code. The owner creates the key in Google AI Studio without enabling billing.

---

## Phase 4: This site's case study (`/work/saucescode`)
Written after Phases 1–3 ship. Covers the live hero (how the demos stay honest and fast), "Ask this site" (grounding, actions, abuse layers), the testing approach, and the search/AI-engine work (structured data, `llms.txt`). It gets a gallery card (Phase 1's `tier: 'card'`), sitemap and JSON-LD entries through the existing case-study plumbing (`caseStudyDates` is required).

## Testing (all phases)
- Unit-level: the Rowszein's Delight sale logic (stock, cost, profit, thresholds, out-of-stock) and the assistant's tool-call validation.
- Playwright: new sections and nav link; gallery tiers; live hero interaction by mouse, keyboard and touch viewport; reduced motion; no layout shift when the live demo replaces the image; the assistant UI with the model **mocked** at the network layer (no real API calls in tests), including every failure state.
- Rate-limit logic tested against the store's local or in-memory adapter.
- After each phase: screenshots at 375, 768, 1280 and 1440+, and the existing responsive sweep.

## Owner actions before Phase 3
- Create a Gemini API key in Google AI Studio (free, no payment method, billing left off).
- Add the rate-limit store (e.g. Upstash Redis through the Vercel Marketplace) and Edge Config to the Vercel project. The builder gives step-by-step instructions at that point.

Phases 1 and 2 need nothing from the owner.

## Decided by the owner
Audience (mixed, local and international) · approach A for the hero, with both demos live · "Ask this site" with page actions, no floating chatbot · no AI inside Rowszein's Delight · headline · Working with me terms and prices · About paragraph · Gemini free tier as the provider, so it costs nothing · abuse protection is mandatory.

## My calls (owner can override)
Gallery tiers and which projects go in "More experiments" · section placement and the "Pricing" nav label · Gemini Flash-class model · specific rate-limit numbers · assistant available site-wide and replying in the visitor's language · Edge Config for the kill switch · Thread & Form colour presets and type toggle as the website demo's controls · `/work/saucescode` as the case-study path · phase order.

## Left to the builder
Component structure; exact animation curves within the existing motion tokens; sample data values (consistent with the screenshots); choice between Upstash and Vercel Firewall rate limiting, and between BotID and Turnstile, based on the plan's features at build time.
