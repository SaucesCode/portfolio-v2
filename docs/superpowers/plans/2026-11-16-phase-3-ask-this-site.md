# Phase 3: "Ask this site" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Visitors ask the site a question in plain language and get a short answer drawn only from the site's own content. The answer can act on the page: show a section, put a demo in focus, open a project, or draft an email to James. It runs on Gemini's free tier and is protected against abuse.

**Architecture:** One Node route handler (`POST /api/ask`) validates input, checks durable rate limits and a kill switch, then calls Gemini's REST API with `fetch`. It sends a system prompt built from the same data as `llms.txt` and four function declarations. It returns `{ answer, actions[] }`. The client panel shows the answer and turns the actions into chips, accepting only allowlisted section ids and project slugs. No answer streaming: Flash-Lite answers in about 2 s, so the panel shows a skeleton line instead (an owner-visible deviation from the spec, which asked for streamed answers).

**Tech Stack:** Next.js 16 route handler (Node runtime), Gemini REST `v1beta generateContent`, Upstash Redis REST (through the Vercel Marketplace), React 19 client component, native `<dialog>`, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-16-portfolio-showcase-design.md` (Phase 3, plus the change log: prices are never published)

## Global Constraints

- **Provider:** model `gemini-3.5-flash-lite`, verified on this key on 2026-11-16: it answered with a function call in 1.7 s. `thinkingConfig.thinkingBudget = 0`, `maxOutputTokens = 300`, `temperature = 0.2`. The model id, base URL and key come from env (`GEMINI_MODEL`, `GEMINI_BASE_URL` defaulting to `https://generativelanguage.googleapis.com`, `GEMINI_API_KEY`). The key goes in an `x-goog-api-key` header and never in a URL or log.
- **Never** publish or estimate a price. Pricing questions get "pricing depends on the project" plus the `draft_inquiry` action.
- **Abuse limits** (all server-side, durable): 10 questions per 10 minutes and 30 per day per IP. A global cap of 400 questions per day stays below the free tier's daily limit. Questions are at most 300 characters, and at most the last 4 turns are sent. Requests must have an `Origin` header equal to the site origin (`getBaseUrl()`, or `http://localhost:3001` in tests). Gemini HTTP 429 maps to the "busy today" state.
- **Kill switch:** the Redis key `assistant:enabled` set to `"0"` turns the assistant off instantly (owner flips it in the Upstash console); `ASSISTANT_ENABLED=false` in env does the same after a redeploy. When off, the route returns 503 `{ state: 'off' }`.
- **Store:** in production the route needs `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, and fails closed (503 `off`) if they are missing. `ASSISTANT_STORE=memory` explicitly selects an in-process store, for local runs and tests only.
- **Privacy:** question text is never stored or logged. Logs are one JSON line per request: `{ requestId, outcome, ms, tokens }`. The panel footer reads: "Answers come from this site’s content only. Questions are sent to Google’s Gemini to answer, and this site doesn’t keep them." The input placeholder says not to include personal details.
- **Honesty:** answers only from the provided content; "I don’t know" plus `draft_inquiry` otherwise. No client work is ever claimed. Replies are in the visitor's language, with terms quoted as written.
- **UI:** an "Ask about my work" trigger in the header (icon-only below 768px), opened with `/` or Ctrl/⌘+K. The header must stay on one row at every width, and the existing header test keeps passing. Modal `<dialog>`: focus is trapped and restored, Escape closes it, targets are at least 44px, and motion uses transform and opacity with a reduced-motion fallback.
- **Test server:** `.superpowers/tmp/serve-test.sh` (port 3001). The Gemini mock server runs on port 3091. Never use ports 5173 or 8000.
- **Branch:** `feat/ask-this-site`, one commit per task.

## Review Focus

1. A question of exactly 300 characters, one of 301, and one made only of whitespace: 300 is accepted, 301 is refused with a field message, and empty is refused with no model call. Test in Task 3.
2. The model calls a tool with an id or slug outside the allowlist (prompt injection, or a hallucination): the server drops it and the client never renders it. Tests in Tasks 3 and 4.
3. The eleventh question inside 10 minutes from one IP gets the "too many" state with a retry time, and the store counts it even if Gemini fails. Test in Task 2.
4. Gemini returns 429, 500 or a malformed body, or takes longer than 8 s: the visitor sees "busy" or "try again" with the email link, never a raw error. Test in Task 3.
5. The dialog opened from a case study runs `show_section('process')` by going to `/#process`. Test in Task 4.

---

### Task 1: Site knowledge shared by llms.txt and the assistant

**Files:**
- Create: `src/lib/site-knowledge.ts`
- Modify: `src/app/llms.txt/route.ts` (uses it)
- Test: `tests/ask.spec.ts` (data-only)

**Interfaces:**
- Produces: `siteKnowledge(baseUrl: string): string`, the exact body `llms.txt` serves today (moved, not rewritten).
- Produces: `sectionIds = ['featured', 'work', 'services', 'process', 'about', 'contact'] as const`, `type SectionId`.
- Produces: `projectSlugs: string[]`, all project slugs from `projects.ts`.

- [ ] **Step 1:** failing test: `siteKnowledge('https://www.saucescode.xyz')` contains every case-study URL, every `terms` body and `site.email`, and does not match `/₱|US\$|USD/`. Also check `sectionIds` against the ids on the homepage (data-only check of the list).
- [ ] **Step 2:** typecheck fails (module missing).
- [ ] **Step 3:** move the builder; `llms.txt` returns `siteKnowledge(getBaseUrl())`.
- [ ] **Step 4:** the new test and the existing llms.txt test pass.
- [ ] **Step 5:** commit `refactor: site knowledge shared by llms.txt and the assistant`

### Task 2: Limits and kill switch

**Files:**
- Create: `src/lib/ask/store.ts`, `src/lib/ask/limits.ts`
- Test: `tests/ask.spec.ts` (data-only, with the memory store)

**Interfaces:**
- Produces: `interface CounterStore { incr(key: string, ttlSeconds: number): Promise<number>; get(key: string): Promise<string | null> }`, plus `memoryStore()` and `upstashStore(url, token)`. The Upstash store uses the REST pipeline: `INCR` and `EXPIRE NX` in one request.
- Produces: `storeFromEnv(): CounterStore | null` (null in production without Upstash, unless `ASSISTANT_STORE=memory`).
- Produces: `checkLimits(store, ip, now): Promise<{ ok: true } | { ok: false; state: 'busy' | 'limited'; retryAfterSeconds: number }>`, with fixed windows: per IP 10 per 600 s, per IP 30 per day (UTC), global 400 per day.
- Produces: `assistantEnabled(store): Promise<boolean>` (env flag and Redis `assistant:enabled`).

- [ ] **Step 1:** failing tests: 10 allowed, the 11th `limited` with `retryAfterSeconds` between 1 and 600; a different IP is unaffected; the 401st global question of the day is `busy`; `assistant:enabled = "0"` turns it off.
- [ ] **Steps 2–5:** confirm they fail, implement, pass, commit `feat: durable per-visitor and daily limits for the assistant`.

### Task 3: `POST /api/ask`

**Files:**
- Create: `src/app/api/ask/route.ts` (`export const runtime = 'nodejs'`), `src/lib/ask/gemini.ts`, `src/lib/ask/prompt.ts`
- Create: `tests/fixtures/gemini-mock.mjs` (a tiny HTTP server on 3091 that returns canned bodies chosen by keywords in the question: answer plus `show_section`, a bad tool, 429, 500, malformed, slow)
- Modify: `.superpowers/tmp/serve-test.sh` (start and stop the mock; env `GEMINI_BASE_URL=http://127.0.0.1:3091`, `GEMINI_API_KEY=test`, `ASSISTANT_STORE=memory`)
- Modify: `.env.example` (document every assistant variable)
- Test: `tests/ask.spec.ts` (request tests against the route)

**Interfaces:**
- Consumes: Tasks 1 and 2.
- Request: `{ question: string; history?: { role: 'user' | 'model'; text: string }[] }`.
- Response 200: `{ answer: string; actions: Action[] }`, where `Action = { type: 'show_section'; id: SectionId } | { type: 'focus_demo'; id: 'software' | 'web' } | { type: 'open_project'; slug: string } | { type: 'draft_inquiry'; summary: string }` (summary at most 500 characters).
- Errors: 400 `{ state: 'invalid', field, message }`, 403 (bad origin), 429 `{ state: 'limited', retryAfterSeconds }`, 503 `{ state: 'busy' | 'off' | 'error' }`.
- The system prompt: the rules from the Global Constraints, then `siteKnowledge(baseUrl)`, then the tool usage guidance. Tools are declared with enums from `sectionIds` and `projectSlugs`.

- [ ] **Step 1:** failing tests:
  - a valid question returns an answer and a `show_section` action
  - the Review Focus 1 lengths
  - a bad tool id is dropped
  - 429, 500, malformed and an 8 s timeout map to the documented states
  - a wrong Origin gets 403
  - the request log line contains no question text (spy on stdout through the mock's echo)
- [ ] **Steps 2–5:** confirm they fail, implement, pass, commit `feat: ask endpoint grounded in the site's content`.

### Task 4: "Ask about my work" panel

**Files:**
- Create: `src/components/ask/AskPanel.tsx` + `AskPanel.module.css`, `src/components/ask/actions.ts`
- Modify: `src/components/SiteHeader.tsx` (the trigger), `src/components/HeroShowcase.tsx` (listens for a `hero:focus` event so `focus_demo` can hand off a window)
- Test: `tests/ask.spec.ts` (UI, with `/api/ask` mocked through `page.route`)

**Interfaces:**
- Consumes: the Task 3 response shape.
- Produces: `runAction(action, router)`. `show_section` scrolls on the homepage and navigates to `/#id` elsewhere. `focus_demo` dispatches `hero:focus` with the id (navigating home first if needed). `open_project` goes to the case study if one exists, otherwise to `/#work-<slug>`. `draft_inquiry` opens `mailto:` with subject "Project inquiry" and the summary as the body.

Layout direction: a command-palette sheet that is a centred 40rem panel on desktop and a full-width bottom sheet on phones. It contains three suggested questions as chips, the input with a 300 counter, the answer, its action chips, and the privacy footer. It uses the site's tokens: chalk surface, rule borders, signal for primary actions. It enters with a 240 ms rise and fade (a fade only under reduced motion).

- [ ] **Step 1:** failing tests:
  - the trigger opens it, `/` opens it, Escape closes it and focus returns to the trigger
  - a suggestion asks and shows the answer and chips
  - "Show me" runs `show_section` and scrolls `#process` into view
  - on a case study, the same action navigates to `/#process`
  - each state (`limited`, `busy`, `off`, `invalid`) shows its message and the email link
  - the header stays on one row (the existing test)
- [ ] **Steps 2–5:** confirm they fail, implement, pass, commit `feat: ask about my work panel with page actions`.

### Task 5: Verify, review, release

- [ ] Full suite and screenshots at 375, 768, 1280 and 1440 (closed, open, answered, error).
- [ ] **One real call** against Gemini with the local key, through the built site, asking "How long does a WordPress site take?". The answer must mention 3–5 weeks and offer the Working together section.
- [ ] Fresh whole-branch reviewer with the Review Focus above.
- [ ] **Owner setup before release:** add Upstash Redis (free) from the Vercel Marketplace, which sets the two env vars, and check that `GEMINI_API_KEY` is set for Production and Preview. Push the branch, try the preview, then ship on the owner's word.
