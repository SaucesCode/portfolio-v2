# Project form and phone demo view: design

Date: 2026-11-17. Status: awaiting the owner's approval.

## Why

The portfolio exists to make a business owner want to hire James. A walk through the live site at 375, 768 and 1440 px found the two moments where that is most likely to fail:

1. **Reaching him.** Every "Start a project" button is a `mailto:` link. On a computer with no mail app set up it does nothing visible, or opens a setup screen, and the visitor leaves.
2. **Trying the work.** On phones the Rowszein live demo is a desktop app squeezed to about 340 px, partly hidden behind the website demo. The strongest proof on the site is too small to use.

The owner picked these two, built as recommended (1A, 2A), in that order.

## Goals

- A visitor can send a project inquiry from any "Start a project" button without leaving the page or needing a mail app, and lands in James's Gmail with Reply going to the visitor.
- A phone visitor can open the Rowszein demo full screen, laid out the way the real app looks on a phone, and record sales in it.

## Non-goals

- No prices or budget field anywhere (the owner removed published prices as intimidating).
- No booking calendar, no CRM, no saved inquiries database: the email is the record.
- No full-screen view for the Thread & Form website demo in this round; the Rowszein demo is the strongest proof. It can follow with the same pattern.
- No change to the desktop or tablet hero.

## Anti-goals (it fails even if it works)

- A visitor loses what they typed (failed send, closed panel, network drop).
- The form becomes a way to spam James's inbox or burn the email quota.
- Visitor email addresses or messages end up in logs.
- The phone layout invents screens or features the real Rowszein app does not have.

## Approaches considered

**Form delivery.** (A, chosen) The site's own endpoint validates, rate-limits and sends through Resend's email API, Reply-To set to the visitor. (B) A hosted form service (Formspree, Web3Forms): no DNS work, but visitor data passes through a third party, spam handling is theirs, free tiers carry branding or monthly caps, and it shows nothing James built. Rejected also: Gmail SMTP with an app password (a long-lived credential for his whole mailbox), and saving inquiries without sending (no notification).

**Phone demo.** (A, chosen) A full-screen view with a phone layout of the dashboard. (B) A calmer phone hero, one demo at a time at full width: cheaper, but the desktop dashboard's text stays too small to read. A plain full-screen of the existing desktop window was dropped: at 375 px it is barely larger than today.

## Part 1: the project form

### What the visitor sees

Any "Start a project" or "Email me about a project" button (header, the phone header's mail icon, hero, Working together, Contact, case study pages) opens a panel built the same way as the Ask panel: a modal `<dialog>` that traps focus, closes on Esc or its Close button, and returns focus to the button that opened it. The buttons stay real `mailto:` links, so with JavaScript off or still loading they work as today.

Fields, in order:

| Field | Rules |
|---|---|
| What do you need? | Choice, required: A business system or web app / A WordPress site / A website or landing page / Not sure yet |
| Tell me about it | Required, 20–2,000 characters, with a live counter near the limit |
| When do you need it? | Optional: As soon as possible / Within a month / In 1–3 months / Flexible |
| Your name | Required, up to 100 characters |
| Your email | Required, a valid address |

Copy under the button: "James replies within one business day." (from the published terms). A short line names that the message is emailed to James and not stored on the site.

States:
- **Inline validation** on blur and on submit, the message next to its field, focus moves to the first invalid field.
- **Sending:** the button shows a loading state and is disabled; the fields stay editable-looking but locked.
- **Sent:** the form is replaced by a confirmation naming the address the reply will go to, and the draft is cleared.
- **Couldn't send** (network, server error, limit, switched off): the text stays exactly as typed, with "Email it instead", a `mailto:` link prefilled with the visitor's message, and a Copy address button.
- **Never lose input:** the draft is kept in `sessionStorage` (guarded, since storage can be blocked) so closing the panel or reloading keeps it until it is sent.

Context: a case study page passes its subject (e.g. "Project inquiry: something like Rowszein's Delight") as the opening line of the message. The assistant's "Email James about this" action opens the form with its summary as the message, instead of a mail draft.

### Server: `POST /api/inquiry`

Same structure as `/api/ask`: route → validation → limits → sender, Node runtime, not cached.

1. Origin must be allowed (`isAllowedOrigin`), else 403.
2. Body validated against the field rules above, trimmed; failures return 400 with `{ field, message }`.
3. A hidden honeypot field and a minimum fill time (3 s, from a timestamp the panel sends) catch simple bots: those get a normal-looking 200 and nothing is sent.
4. Limits through the existing one-round-trip `CounterStore.admit`: 3 per hour and 6 per day per visitor, 40 per day for the site (Resend's free tier allows 100 a day), and an `inquiry:enabled` kill switch in Redis. Over a limit: 429 with Retry-After.
5. Send with Resend's REST API (`POST https://api.resend.com/emails`, no SDK), 8 s timeout, an `Idempotency-Key` from the panel (one per submission) so a retried request never sends twice. From: `RESEND_FROM` (defaults to Resend's test sender until the domain is verified). To: James's address. Reply-To: the visitor. Subject: "Project inquiry: {need} from {name}". Plain-text body only, so nothing the visitor types becomes HTML.
6. Responses: 200 `{ ok: true }`; 503 `{ state: 'off' }` when no key or switched off; 502 `{ state: 'error' }` when Resend fails. The panel treats every non-200 as "Couldn't send" with the fallback.
7. One structured log line per request: request id, outcome, duration, Resend status. Never the visitor's name, email or message.

Configuration (`.env.example` documents them): `RESEND_API_KEY`, `RESEND_FROM`, `INQUIRY_TO` (defaults to the site email), `RESEND_BASE_URL` (tests point it at a local mock, like `GEMINI_BASE_URL`).

### Owner setup

1. Create a free Resend account with the Gmail address the inquiries should reach.
2. Create an API key and add `RESEND_API_KEY` in Vercel (Production and Preview) and `.env.local`.
3. Recommended: add the domain `saucescode.xyz` in Resend and the DNS records it lists on Porkbun, then set `RESEND_FROM=Portfolio <inquiries@saucescode.xyz>`. Until then Resend's test sender can only deliver to the account's own address, which is the intended inbox; the builder confirms this against Resend's current documentation.

## Part 2: the phone demo view

### What the visitor sees

Below 600 px wide, once the live demo has loaded, a "Try it full screen" button sits with the software demo's controls. It opens a full-screen `<dialog>`:

- **Top:** a bar like the real app's on phones: a menu icon, "Rowszein's Delight", and a Close button (the real one, 44×44 px, labelled "Close the demo").
- **Middle, scrolling:** the dashboard in one column: greeting and date, the net sales card with spent and profit, "Needs attention" stock, and latest sales. Same data, same live updates as the hero.
- **Bottom, fixed:** the "Record a sale" products and Reset, the same controls as the hero.

It shares the hero's demo state, so a sale made full screen is there when the visitor closes it. Esc and Close return focus to the button; the page behind does not scroll. It opens with a short rise and fade (component timing, 250 ms, ease-out), a plain fade under reduced motion.

### Faithfulness

The real owner panel (`frontend/src/layouts/OwnerLayout.tsx`) shows a top bar with a menu button that opens a drawer on smaller screens. The phone layout follows that; the menu icon is part of the picture and does not open anything, as the hero's sidebar items do not today. The dashboard stays `aria-hidden`; the sale buttons and the live announcement carry the information, as in the hero.

### Build notes

`LiveDashboard` gains a `layout: 'desktop' | 'phone'` prop; the phone layout is CSS in the same module (one column, top bar instead of sidebar). The dialog, its button and the docked controls live with the hero's live demo components.

## Testing and verification

- Form: validation messages per field, success against a local Resend mock, error and off states keep the text and offer the fallback, honeypot and fast-submit are silently dropped, limits return 429, foreign origins 403, the mock receives Reply-To and a plain-text body, logs carry no visitor data, the assistant's action opens the prefilled form, keyboard-only use and focus return.
- Phone view: at 375 px the button appears, opens full screen, a sale updates the figure in the view and in the hero after closing, focus returns, no horizontal scroll; the button is absent at 768 px and up.
- Full suite passes; screenshots at 375, 768, 1280 and 1440 px reviewed, in light and dark.
- After release: one real inquiry sent through production to the owner's inbox.

## Left to the builder

Exact copy beyond what is quoted here, the visual styling within the existing tokens, the mock server's shape, and how the trigger buttons are wired (a shared click handler on marked links is expected).
